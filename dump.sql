-- ========================================
-- MySQL Database Dump for JSforum
-- Database: forum
-- Generated: 2025-10-07
-- ========================================

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS `forum`;
CREATE DATABASE `forum` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `forum`;

-- ========================================
-- Table: users
-- Description: Stores user accounts
-- ========================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_ID` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_ID`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: chats
-- Description: Stores chat rooms/channels
-- ========================================
DROP TABLE IF EXISTS `chats`;
CREATE TABLE `chats` (
  `chat_ID` INT(11) NOT NULL AUTO_INCREMENT,
  `chat_name` VARCHAR(255) NOT NULL,
  `owner_ID` INT(11) NOT NULL,
  `creation_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_ID`),
  KEY `fk_chat_owner` (`owner_ID`),
  CONSTRAINT `fk_chat_owner` FOREIGN KEY (`owner_ID`) REFERENCES `users` (`user_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: conversations
-- Description: Junction table for user-chat relationships
-- ========================================
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `conversation_ID` INT(11) NOT NULL AUTO_INCREMENT,
  `chat_ID` INT(11) NOT NULL,
  `user_ID` INT(11) NOT NULL,
  `joined_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_ID`),
  UNIQUE KEY `idx_chat_user` (`chat_ID`, `user_ID`),
  KEY `fk_conv_chat` (`chat_ID`),
  KEY `fk_conv_user` (`user_ID`),
  CONSTRAINT `fk_conv_chat` FOREIGN KEY (`chat_ID`) REFERENCES `chats` (`chat_ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_user` FOREIGN KEY (`user_ID`) REFERENCES `users` (`user_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Table: messages
-- Description: Stores chat messages
-- ========================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `message_ID` INT(11) NOT NULL AUTO_INCREMENT,
  `message` TEXT NOT NULL,
  `sender_ID` INT(11) NOT NULL,
  `chat_ID` INT(11) NOT NULL,
  `send_date` DATE NOT NULL,
  `send_time` TIME NOT NULL,
  PRIMARY KEY (`message_ID`),
  KEY `fk_msg_sender` (`sender_ID`),
  KEY `fk_msg_chat` (`chat_ID`),
  KEY `idx_chat_date_time` (`chat_ID`, `send_date`, `send_time`),
  CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_ID`) REFERENCES `users` (`user_ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_chat` FOREIGN KEY (`chat_ID`) REFERENCES `chats` (`chat_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Insert sample data for global chats
-- ========================================

-- Insert admin user for global chats
INSERT INTO `users` (`user_ID`, `username`, `password`) VALUES
(1, 'admin', '$2b$10$XqZ3v9vJ5YkPk3YXq3v9vOQp3Y3v9vJ5YkPk3YXq3v9vOQp3Y3v9v');

-- Insert global chats
INSERT INTO `chats` (`chat_ID`, `chat_name`, `owner_ID`) VALUES
(1, 'General Chat', 1),
(2, 'Random Chat', 1);

-- ========================================
-- Views (Optional - for easier querying)
-- ========================================

-- View: user_chat_list
-- Shows all chats with member counts
DROP VIEW IF EXISTS `user_chat_list`;
CREATE VIEW `user_chat_list` AS
SELECT 
  c.chat_ID,
  c.chat_name,
  c.creation_date,
  u.username AS owner,
  COUNT(DISTINCT conv.user_ID) AS member_count
FROM chats c
JOIN users u ON c.owner_ID = u.user_ID
LEFT JOIN conversations conv ON c.chat_ID = conv.chat_ID
GROUP BY c.chat_ID, c.chat_name, c.creation_date, u.username;

-- View: recent_messages
-- Shows recent messages with sender info
DROP VIEW IF EXISTS `recent_messages`;
CREATE VIEW `recent_messages` AS
SELECT 
  m.message_ID,
  m.message,
  m.send_date,
  m.send_time,
  u.username AS sender,
  c.chat_name
FROM messages m
JOIN users u ON m.sender_ID = u.user_ID
JOIN chats c ON m.chat_ID = c.chat_ID
ORDER BY m.send_date DESC, m.send_time DESC
LIMIT 100;

-- ========================================
-- Indexes for performance optimization
-- ========================================

-- Already created inline with tables, but listed here for reference:
-- users: idx_username (UNIQUE)
-- conversations: idx_chat_user (UNIQUE)
-- messages: idx_chat_date_time

-- ========================================
-- Stored Procedures (Optional)
-- ========================================

-- Procedure: add_user_to_chat
DROP PROCEDURE IF EXISTS `add_user_to_chat`;
DELIMITER //
CREATE PROCEDURE `add_user_to_chat`(
  IN p_chat_id INT,
  IN p_user_id INT
)
BEGIN
  INSERT IGNORE INTO conversations (chat_ID, user_ID)
  VALUES (p_chat_id, p_user_id);
END //
DELIMITER ;

-- Procedure: get_chat_messages
DROP PROCEDURE IF EXISTS `get_chat_messages`;
DELIMITER //
CREATE PROCEDURE `get_chat_messages`(
  IN p_chat_id INT,
  IN p_limit INT
)
BEGIN
  SELECT 
    m.message_ID,
    m.message,
    m.send_date,
    m.send_time,
    u.username AS sender
  FROM messages m
  JOIN users u ON m.sender_ID = u.user_ID
  WHERE m.chat_ID = p_chat_id
  ORDER BY m.send_date DESC, m.send_time DESC
  LIMIT p_limit;
END //
DELIMITER ;

-- ========================================
-- Grants (adjust as needed for your environment)
-- ========================================

-- Example: Create user and grant privileges
-- CREATE USER IF NOT EXISTS 'forum_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON forum.* TO 'forum_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ========================================
-- End of dump
-- ========================================
