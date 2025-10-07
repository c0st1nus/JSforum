import { getConnection } from './connect.js';
import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';

const router = express.Router();

// Session setup
router.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, terms } = req.body;
    
    if (!terms) {
      return res.status(400).json({ error: "You must accept the terms and conditions" });
    }
    
    const conn = await getConnection();
    
    // Check if username exists
    const [users] = await conn.query("SELECT username FROM users WHERE username = ?", [username]);
    
    if (users.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await conn.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    
    if (result.affectedRows > 0) {
      // Get user id
      const [userRow] = await conn.query("SELECT user_ID FROM users WHERE username = ?", [username]);
      
      // Set session
      req.session.userId = userRow[0].user_ID;
      req.session.username = username;
      
      return res.status(200).json({ message: "Registration successful", redirect: "/index.html" });
    } else {
      return res.status(500).json({ error: "Registration failed" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const conn = await getConnection();
    
    // Find user
    const [users] = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
    
    if (users.length > 0) {
      const user = users[0];
      
      // Compare password (assuming we're updating to use hashed passwords)
      const match = await bcrypt.compare(password, user.password);
      
      if (match) {
        // Set session
        req.session.userId = user.user_ID;
        req.session.username = user.username;
        
        return res.status(200).json({ message: "Login successful", redirect: "/index.html" });
      }
    }
    
    return res.status(401).json({ error: "Invalid username or password" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Logout endpoint
router.get('/logout', (req, res) => {
  req.session.destroy();
  return res.status(200).json({ message: "Logged out", redirect: "/log.html" });
});

// In auth.js
router.get('/status', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ authenticated: true, username: req.session.username });
  } else {
    return res.json({ authenticated: false });
  }
});

export default router;