// messenger.js
import express from 'express';
import { getConnection } from './connect.js';

const router = express.Router();

// Middleware to ensure the user is authenticated
router.use((req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Helper function to ensure user is member of a chat
// For global chats (IDs 1 & 2), automatically adds user if not already a member
async function ensureUserInChat(chatId, userId) {
  const conn = await getConnection();
  
  // Check if user is already in this chat
  const [members] = await conn.query(
    "SELECT * FROM conversations WHERE chat_ID = ? AND user_ID = ?",
    [chatId, userId]
  );
  
  // If user is already a member, return true
  if (members.length > 0) {
    return true;
  }
  
  // If this is a global chat (ID 1 or 2), auto-add the user
  if (chatId === '1' || chatId === '2') {
    try {
      // First check if chat exists
      const [chatExists] = await conn.query(
        "SELECT * FROM chats WHERE chat_ID = ?", 
        [chatId]
      );
      
      if (chatExists.length === 0) {
        // Create global chat if it doesn't exist (first time setup)
        const chatName = chatId === '1' ? 'General Chat' : 'Random Chat';
        await conn.query(
          "INSERT INTO chats (chat_ID, chat_name, owner_ID) VALUES (?, ?, ?)",
          [chatId, chatName, userId]
        );
      }
      
      // Add user to conversation
      await conn.query(
        "INSERT INTO conversations (chat_ID, user_ID) VALUES (?, ?)",
        [chatId, userId]
      );
      return true;
    } catch (error) {
      console.error("Error adding user to global chat:", error);
      return false;
    }
  }
  
  // Not a global chat and user is not a member
  return false;
}

// Get all chats the user participates in
router.get('/chats', async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query(
      `SELECT c.chat_ID, c.chat_name, c.creation_date
       FROM chats c
       JOIN conversations conv ON c.chat_ID = conv.chat_ID
       WHERE conv.user_ID = ?`,
      [req.session.userId]
    );
    res.json({ chats: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Retrieve messages for a given chat
router.get('/chats/:chatId/messages', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    // Check/ensure user is in chat
    const isMember = await ensureUserInChat(chatId, req.session.userId);
    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    const conn = await getConnection();
    const [messages] = await conn.query(
      `SELECT m.message_ID, m.message, m.send_date, m.send_time, u.username AS sender
       FROM messages m
       JOIN users u ON m.sender_ID = u.user_ID
       WHERE m.chat_ID = ?
       ORDER BY m.send_date DESC, m.send_time DESC`,
      [chatId]
    );
    
    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Post a new message to a chat
router.post('/chats/:chatId/messages', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message text required" });
    }

    // Check/ensure user is in chat
    const isMember = await ensureUserInChat(chatId, req.session.userId);
    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    const conn = await getConnection();
    const now = new Date();
    const send_date = now.toISOString().split('T')[0];
    const send_time = now.toTimeString().split(' ')[0];
    
    const [result] = await conn.query(
      "INSERT INTO messages (message, sender_ID, chat_ID, send_date, send_time) VALUES (?, ?, ?, ?, ?)",
      [message, req.session.userId, chatId, send_date, send_time]
    );
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Message sent", message_ID: result.insertId });
    } else {
      res.status(500).json({ error: "Could not send message" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;