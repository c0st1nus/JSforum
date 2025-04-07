# Kostya-Forum - Chat Application

## Description

A real-time chat application built with Node.js, Express, and MySQL. Created by Konstantin Koshevoy as a project work for Computer Science Advanced course (11th grade).

## Features

- User authentication (registration and login)
- Real-time messaging
- Multiple chat rooms (General Chat, Random Chat)
- Automatic message polling
- Responsive design

## Installation

### Prerequisites

- Node.js (v14+)
- MySQL Server

### Setup

1. Clone the repository
2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a MySQL database named `forum` with the following tables
-

users

(user_ID, username, password)

-

chats

(chat_ID, chat_name, owner_ID, creation_date)

- `conversations` (chat_ID, user_ID)
-

messages

(message_ID, message, sender_ID, chat_ID, send_date, send_time)

1. Update database configuration in

connect.js

if needed:

```js
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "forum",
};
```

## Usage

1. Start the server:
   ```sh
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`
3. Register a new account or login with existing credentials
4. Start chatting in General or Random chat rooms

## Project Structure

-

server.js

- Main server file
-

auth.js

- Authentication routes and logic
-

connect.js

- Database connection
-

messenger.js

- Chat functionality
-

public

- Frontend files
- index.html - Main chat interface
- log.html - Login page
- reg.html - Registration page
- js/ - JavaScript files
- style/ - CSS files

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/logout` - Logout
- `GET /api/auth/status` - Check authentication status

### Messenger

- `GET /api/messenger/chats` - Get user's chats
- `GET /api/messenger/chats/:chatId/messages` - Get messages from chat
- `POST /api/messenger/chats/:chatId/messages` - Send message to chat

## Dependencies

- express - Web framework
- mysql2 - MySQL client
- bcrypt - Password hashing
- express-session - Session management

## License

MIT

---

## Quick Start

1. Run `npm install`
2. Set up MySQL database
3. Run `npm start`
4. Access via `http://localhost:3000`

---

Developed by Koshevoy K, 2023
