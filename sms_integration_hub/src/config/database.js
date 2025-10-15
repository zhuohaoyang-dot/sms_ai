// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection function
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connection Successful!');
    console.log(`Connected to: ${process.env.MYSQL_HOST}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    return false;
  }
}

// Query helper for bl_venture_ai database
async function queryAI(sql, params = []) {
  try {
    const [rows] = await pool.query(`USE ${process.env.DB_NAME_AI}; ${sql}`, params);
    return rows;
  } catch (error) {
    console.error('Error querying bl_venture_ai:', error);
    throw error;
  }
}

// Query helper for bl_venture_matter database
async function queryMatter(sql, params = []) {
  try {
    const [rows] = await pool.query(`USE ${process.env.DB_NAME_MATTER}; ${sql}`, params);
    return rows;
  } catch (error) {
    console.error('Error querying bl_venture_matter:', error);
    throw error;
  }
}

// Generic query function with database selection
async function query(database, sql, params = []) {
  const connection = await pool.getConnection();
  try {
    await connection.query(`USE ${database}`);
    const [rows] = await connection.query(sql, params);
    return rows;
  } catch (error) {
    console.error(`Error querying ${database}:`, error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
  query,
  queryAI,
  queryMatter
};