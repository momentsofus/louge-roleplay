/**
 * @file src/services/character-service.js
 * @description 角色创建、编辑、列表查询与详情读取服务。
 */

const { query, getDbType } = require('../lib/db');
const { normalizeStoredImagePath } = require('./upload-service');

function getPublicCharacterSortSql(sort) {
  const dbType = getDbType();
  const heatExpr = '(COALESCE(like_stats.like_count, 0) * 3 + COALESCE(comment_stats.comment_count, 0) * 4 + COALESCE(usage_stats.usage_count, 0) * 2)';
  const randomSql = dbType === 'mysql' ? 'RAND()' : 'RANDOM()';
  const sortMap = {
    newest: 'c.id DESC',
    oldest: 'c.id ASC',
    likes: 'like_count DESC, c.id DESC',
    comments: 'comment_count DESC, c.id DESC',
    usage: 'usage_count DESC, c.id DESC',
    heat: `${heatExpr} DESC, c.id DESC`,
    random: randomSql,
  };
  return sortMap[sort] || sortMap.newest;
}

function normalizePublicCharacterSort(sort) {
  const value = String(sort || 'newest').trim();
  return ['newest', 'oldest', 'likes', 'comments', 'usage', 'heat', 'random'].includes(value) ? value : 'newest';
}

function getPublicCharacterStatsJoinSql() {
  return `
     LEFT JOIN (
       SELECT character_id, COUNT(*) AS like_count
       FROM character_likes
       GROUP BY character_id
     ) like_stats ON like_stats.character_id = c.id
     LEFT JOIN (
       SELECT character_id, COUNT(*) AS comment_count
       FROM character_comments
       WHERE status = 'visible'
       GROUP BY character_id
     ) comment_stats ON comment_stats.character_id = c.id
     LEFT JOIN (
       SELECT character_id, COUNT(*) AS usage_count
       FROM character_usage_events
       GROUP BY character_id
     ) usage_stats ON usage_stats.character_id = c.id`;
}

function getPublicCharacterSelectFields() {
  return `c.id, c.name, c.summary, c.visibility, c.created_at, c.updated_at, c.avatar_image_path, u.username,
            COALESCE(like_stats.like_count, 0) AS like_count,
            COALESCE(comment_stats.comment_count, 0) AS comment_count,
            COALESCE(usage_stats.usage_count, 0) AS usage_count,
            (COALESCE(like_stats.like_count, 0) * 3 + COALESCE(comment_stats.comment_count, 0) * 4 + COALESCE(usage_stats.usage_count, 0) * 2) AS heat_score`;
}

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
      user_id, name, summary, personality, first_message, prompt_profile_json, visibility, avatar_image_path, background_image_path, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())`,
    [
      userId,
      payload.name,
      payload.summary,
      payload.personality,
      payload.firstMessage,
      stringifyPromptProfile(payload.promptProfileJson || '[]'),
      visibility,
      normalizeStoredImagePath(payload.avatarImagePath),
      normalizeStoredImagePath(payload.backgroundImagePath),
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
         avatar_image_path = ?,
         background_image_path = ?,
         updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [
      payload.name,
      payload.summary,
      payload.personality,
      payload.firstMessage,
      stringifyPromptProfile(payload.promptProfileJson || '[]'),
      visibility,
      normalizeStoredImagePath(payload.avatarImagePath),
      normalizeStoredImagePath(payload.backgroundImagePath),
      characterId,
      userId,
    ],
  );
}

async function listPublicCharacters(options = {}) {
  const page = Math.max(1, Number.parseInt(options.page || 1, 10));
  const pageSize = Math.min(48, Math.max(6, Number.parseInt(options.pageSize || 12, 10)));
  const offset = (page - 1) * pageSize;
  const keyword = String(options.keyword || '').trim();
  const sort = normalizePublicCharacterSort(options.sort);
  const sortSql = getPublicCharacterSortSql(sort);
  const where = ["c.visibility = 'public'", "c.status = 'published'"];
  const params = [];

  if (keyword) {
    where.push('(c.name LIKE ? OR c.summary LIKE ? OR u.username LIKE ?)');
    const likeKeyword = `%${keyword}%`;
    params.push(likeKeyword, likeKeyword, likeKeyword);
  }

  const whereSql = where.join(' AND ');
  const rows = await query(
    `SELECT ${getPublicCharacterSelectFields()}
     FROM characters c
     JOIN users u ON u.id = c.user_id
     ${getPublicCharacterStatsJoinSql()}
     WHERE ${whereSql}
     ORDER BY ${sortSql}
     LIMIT ${pageSize} OFFSET ${offset}`,
    params,
  );
  const countRows = await query(
    `SELECT COUNT(*) AS total
     FROM characters c
     JOIN users u ON u.id = c.user_id
     WHERE ${whereSql}`,
    params,
  );
  const total = Number(countRows[0]?.total || 0);

  return {
    characters: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      hasPrev: page > 1,
      hasNext: page * pageSize < total,
    },
    filters: {
      keyword,
      sort,
    },
  };
}

async function listFeaturedPublicCharacters(limit = 6) {
  const safeLimit = Math.min(12, Math.max(1, Number.parseInt(limit || 6, 10)));
  const limitSql = Number(safeLimit);
  return query(
    `SELECT ${getPublicCharacterSelectFields()}
     FROM characters c
     JOIN users u ON u.id = c.user_id
     ${getPublicCharacterStatsJoinSql()}
     WHERE c.visibility = 'public' AND c.status = 'published'
     ORDER BY heat_score DESC, c.id DESC
     LIMIT ${limitSql}`,
  );
}

async function getPublicCharacterDetail(characterId) {
  const rows = await query(
    `SELECT c.id, c.name, c.summary, c.avatar_image_path
     FROM characters c
     WHERE c.id = ? AND c.visibility = 'public' AND c.status = 'published'
     LIMIT 1`,
    [characterId],
  );
  return rows[0] || null;
}

async function listUserCharacters(userId) {
  return query(
    `SELECT id, name, summary, personality, first_message, prompt_profile_json, visibility, status, avatar_image_path, background_image_path, created_at
     FROM characters WHERE user_id = ? AND status <> 'blocked' ORDER BY id DESC`,
    [userId],
  );
}

async function getCharacterById(id, userId = null, options = {}) {
  const params = [id];
  let whereClause = 'WHERE c.id = ?';

  if (!options.includeBlocked) {
    whereClause += " AND c.status <> 'blocked'";
  }

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
  deleteStoredImageIfOwned(character.avatar_image_path);
  deleteStoredImageIfOwned(character.background_image_path);
}

async function ensureCharacterImageColumns() {
  if (getDbType() === 'mysql') {
    await query('ALTER TABLE `characters` ADD COLUMN IF NOT EXISTS `avatar_image_path` VARCHAR(500) NULL');
    await query('ALTER TABLE `characters` ADD COLUMN IF NOT EXISTS `background_image_path` VARCHAR(500) NULL');
    return;
  }

  await query('ALTER TABLE characters ADD COLUMN avatar_image_path TEXT NULL').catch((error) => {
    if (!/duplicate column|already exists/i.test(String(error?.message || ''))) throw error;
  });
  await query('ALTER TABLE characters ADD COLUMN background_image_path TEXT NULL').catch((error) => {
    if (!/duplicate column|already exists/i.test(String(error?.message || ''))) throw error;
  });
}

module.exports = {
  ensureCharacterImageColumns,
  createCharacter,
  updateCharacter,
  listPublicCharacters,
  listFeaturedPublicCharacters,
  getPublicCharacterDetail,
  listUserCharacters,
  getCharacterById,
  countCharacterConversations,
  deleteCharacterSafely,
};
