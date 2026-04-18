/**
 * @file src/lib/db.js
 * @description MySQL 连接池与基础查询封装，统一数据库访问入口。
 */

const mysql = require('mysql2/promise');
const config = require('../config');

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const pool = mysql.createPool({
  uri: config.databaseUrl,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  pool,
  query,
};
