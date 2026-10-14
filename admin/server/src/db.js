require('dotenv').config();
const mysql = require('mysql2/promise');
const config = require('./dbconfig');

const pool = mysql.createPool({
  ...config,
  database: process.env.DB_NAME || 'reverse',
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: false
});

module.exports = pool;
