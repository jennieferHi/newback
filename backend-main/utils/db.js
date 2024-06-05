// utils/db.js

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from dev.env file

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const db = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default db;
