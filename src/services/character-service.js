/**
 * @file src/services/character-service.js
 * @description 角色创建、编辑、列表查询与详情读取服务。
 */

const { query } = require('../lib/db');

function stringifyPromptProfile(payload) {
  if (!payload || payload === '[]') {
    return null;
  }
  return typeof payload === 'string' ? payload : JSON.stringify(payload);
}

function normalizeVisibility(value) {
  return String(value || '').trim() === 'private' ? 'private' : 'public';
}

async function countCharacterConversations(characterId) {
  const rows = await query(
    "SELECT COUNT(*) AS conversationCount FROM conversations WHERE character_id = ? AND status <> 'deleted'",
    [characterId],
  );
  return Number(rows[0]?.conversationCount || 0);
}

async function createCharacter(userId, payload) {
  const visibility = normalizeVisibility(payload.visibility);
  const result = await query(
    `INSERT INTO characters (
      user_id, name, summary, personality, first_message, prompt_profile_json, visibility, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
    [
      userId,
      payload.name,
      payload.summary,
      payload.personality,
      payload.firstMessage,
      stringifyPromptProfile(payload.promptProfileJson || '[]'),
      visibility,
    ],
  );
  return result.insertId;
}

async function updateCharacter(characterId, userId, payload) {
  const visibility = normalizeVisibility(payload.visibility);
  await query(
    `UPDATE characters
     SET name = ?,
         summary = ?,
         personality = ?,
         first_message = ?,
         prompt_profile_json = ?,
         visibility = ?,
         updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [
      payload.name,
      payload.summary,
      payload.personality,
      payload.firstMessage,
      stringifyPromptProfile(payload.promptProfileJson || '[]'),
      visibility,
      characterId,
      userId,
    ],
  );
}

async function listPublicCharacters() {
  return query(
    `SELECT c.id, c.name, c.summary, c.personality, c.first_message, c.prompt_profile_json, c.visibility, c.created_at, u.username
     FROM characters c
     JOIN users u ON u.id = c.user_id
     WHERE c.visibility = 'public' AND c.status = 'published'
     ORDER BY c.id DESC`,
  );
}

async function listUserCharacters(userId) {
  return query(
    `SELECT id, name, summary, personality, first_message, prompt_profile_json, visibility, created_at
     FROM characters WHERE user_id = ? ORDER BY id DESC`,
    [userId],
  );
}

async function getCharacterById(id, userId = null) {
  const params = [id];
  let whereClause = 'WHERE c.id = ?';

  if (userId !== null && userId !== undefined) {
    whereClause += ' AND c.user_id = ?';
    params.push(userId);
  }

  const rows = await query(
    `SELECT c.*, u.username
     FROM characters c
     JOIN users u ON u.id = c.user_id
     ${whereClause}
     LIMIT 1`,
    params,
  );
  return rows[0] || null;
}

async function deleteCharacterSafely(characterId, userId) {
  const character = await getCharacterById(characterId, userId);
  if (!character) {
    const error = new Error('CHARACTER_NOT_FOUND');
    error.code = 'CHARACTER_NOT_FOUND';
    throw error;
  }

  const conversationCount = await countCharacterConversations(characterId);
  if (conversationCount > 0) {
    const error = new Error('CHARACTER_HAS_CONVERSATIONS');
    error.code = 'CHARACTER_HAS_CONVERSATIONS';
    error.conversationCount = conversationCount;
    throw error;
  }

  await query('DELETE FROM characters WHERE id = ? AND user_id = ?', [characterId, userId]);
}

module.exports = {
  createCharacter,
  updateCharacter,
  listPublicCharacters,
  listUserCharacters,
  getCharacterById,
  countCharacterConversations,
  deleteCharacterSafely,
};
