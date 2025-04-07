// Database config
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "forum"
};

import mysql from 'mysql2/promise';

let connection = null;

async function getConnection() {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Connection failed: " + error.message);
      throw error;
    }
  }
  return connection;
}

export { getConnection };