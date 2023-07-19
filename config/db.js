// Use dotenv to load environment variables from .env file into process.env for secure, flexible configuration
require("dotenv").config();

const mysql = require("mysql");

// a connection pool is a place where connections are stored.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10,
  port: process.env.DB_PORT,
  multipleStatements: true,
});

db.getConnection((err, db) => {
  if (err) {
    console.error(`Error connecting to the database: ${err.message}`);
  } else {
    console.log("Connected to the MySQL server using .env properties");
  }
});

module.exports = db;
