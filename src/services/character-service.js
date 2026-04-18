/**
 * @file src/services/character-service.js
 * @description 角色创建、列表查询与详情读取服务。
 */

const { query } = require('../lib/db');

async function createCharacter(userId, payload) {
  const result = await query(
    `INSERT INTO characters (
      user_id, name, summary, personality, first_message, visibility, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'public', 'published', NOW(), NOW())`,
    [userId, payload.name, payload.summary, payload.personality, payload.firstMessage],
  );
  return result.insertId;
}

async function listPublicCharacters() {
  return query(
    `SELECT c.id, c.name, c.summary, c.personality, c.first_message, c.created_at, u.username
     FROM characters c
     JOIN users u ON u.id = c.user_id
     WHERE c.visibility = 'public' AND c.status = 'published'
     ORDER BY c.id DESC`,
  );
}

async function listUserCharacters(userId) {
  return query(
    `SELECT id, name, summary, personality, first_message, created_at
     FROM characters WHERE user_id = ? ORDER BY id DESC`,
    [userId],
  );
}

async function getCharacterById(id) {
  const rows = await query(
    `SELECT c.*, u.username
     FROM characters c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ? LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

module.exports = {
  createCharacter,
  listPublicCharacters,
  listUserCharacters,
  getCharacterById,
};
