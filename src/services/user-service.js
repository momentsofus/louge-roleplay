/**
 * @file src/services/user-service.js
 * @description 用户注册、登录查询与基础资料查询服务。
 */

const { query } = require('../lib/db');

async function createUser({ username, passwordHash, email = null, phone = null, countryType = 'domestic', emailVerified = 0, phoneVerified = 0 }) {
  const result = await query(
    `INSERT INTO users (
      username, password_hash, email, phone, country_type, email_verified, phone_verified, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [username, passwordHash, email, phone, countryType, emailVerified, phoneVerified],
  );
  return result.insertId;
}

async function findUserByUsername(username) {
  const rows = await query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
  return rows[0] || null;
}

async function findUserByEmail(email) {
  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findUserByPhone(phone) {
  const rows = await query('SELECT * FROM users WHERE phone = ? LIMIT 1', [phone]);
  return rows[0] || null;
}

async function findUserByLogin(login) {
  const rows = await query(
    'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ? LIMIT 1',
    [login, login, login],
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const rows = await query('SELECT id, username, nickname, email, phone, country_type, email_verified, phone_verified, created_at FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserByPhone,
  findUserByLogin,
  findUserById,
};

