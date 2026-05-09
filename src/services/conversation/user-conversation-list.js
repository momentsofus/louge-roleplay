/**
 * @file src/services/conversation/user-conversation-list.js
 * @description User-facing conversation list, filters, pagination, previews and batch status actions.
 */

'use strict';

const { query } = require('../../lib/db');
const { invalidateConversationCache } = require('./cache');

function normalizePositiveInteger(value, fallback = 0) {
  const number = Number(value || 0);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

function normalizeConversationSearch(value) {
  return String(value || '').trim().slice(0, 80);
}

function normalizeConversationStatus(value) {
  const raw = String(value || 'active').trim();
  return ['active', 'archived', 'deleted', 'all', 'available'].includes(raw) ? raw : 'active';
}

function normalizeConversationSort(value) {
  const raw = String(value || 'updated_desc').trim();
  return ['updated_desc', 'created_desc', 'message_desc', 'title_asc'].includes(raw) ? raw : 'updated_desc';
}

function normalizeConversationIds(conversationIds = []) {
  return [...new Set((Array.isArray(conversationIds) ? conversationIds : [])
    .map((id) => normalizePositiveInteger(id))
    .filter(Boolean))]
    .slice(0, 100);
}

function buildUserConversationFilters(userId, filters = {}) {
  const clauses = ['c.user_id = ?', "ch.status <> 'blocked'"];
  const params = [userId];
  const search = normalizeConversationSearch(filters.search || filters.q);
  const characterId = normalizePositiveInteger(filters.characterId);
  const status = normalizeConversationStatus(filters.status);
  const sort = normalizeConversationSort(filters.sort);

  if (status === 'available') {
    clauses.push("c.status <> 'deleted'");
  } else if (status !== 'all') {
    clauses.push('c.status = ?');
    params.push(status);
  }
  if (characterId) {
    clauses.push('c.character_id = ?');
    params.push(characterId);
  }
  if (search) {
    clauses.push('(c.title LIKE ? OR ch.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  return {
    whereSql: `WHERE ${clauses.join(' AND ')}`,
    params,
    normalized: { search, characterId, status, sort },
  };
}

function getConversationOrderSql(sort) {
  switch (normalizeConversationSort(sort)) {
    case 'created_desc':
      return 'c.created_at DESC, c.id DESC';
    case 'message_desc':
      return 'message_count DESC, c.updated_at DESC, c.id DESC';
    case 'title_asc':
      return 'c.title ASC, c.updated_at DESC, c.id DESC';
    case 'updated_desc':
    default:
      return 'c.updated_at DESC, c.id DESC';
  }
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
}

function trimPreview(value = '', maxLength = 140) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function decorateUserConversation(row) {
  return {
    ...row,
    id: Number(row.id),
    character_id: Number(row.character_id || 0),
    message_count: Number(row.message_count || 0),
    latest_message_preview: trimPreview(row.latest_message_content || ''),
    display_created_at: formatDateTime(row.created_at),
    display_updated_at: formatDateTime(row.updated_at),
    display_last_message_at: formatDateTime(row.last_message_at),
  };
}

function userConversationSelectSql() {
  return `SELECT
       c.id,
       c.title,
       c.status,
       c.created_at,
       c.updated_at,
       c.last_message_at,
       c.current_message_id,
       c.parent_conversation_id,
       c.branched_from_message_id,
       c.selected_model_mode,
       ch.id AS character_id,
       ch.name AS character_name,
       ch.avatar_image_path,
       (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.deleted_at IS NULL) AS message_count,
       (SELECT m.sender_type FROM messages m WHERE m.conversation_id = c.id AND m.deleted_at IS NULL ORDER BY m.sequence_no DESC, m.id DESC LIMIT 1) AS latest_sender_type,
       (SELECT m.content FROM messages m WHERE m.conversation_id = c.id AND m.deleted_at IS NULL ORDER BY m.sequence_no DESC, m.id DESC LIMIT 1) AS latest_message_content
     FROM conversations c
     JOIN characters ch ON ch.id = c.character_id`;
}

async function listUserConversations(userId, options = {}) {
  const limit = normalizePositiveInteger(options.limit);
  const limitSql = limit ? ` LIMIT ${Math.min(limit, 100)}` : '';
  const { whereSql, params } = buildUserConversationFilters(userId, {
    ...options,
    status: options.status || 'available',
  });
  const orderSql = getConversationOrderSql(options.sort);

  const rows = await query(
    `${userConversationSelectSql()}
     ${whereSql}
     ORDER BY ${orderSql}${limitSql}`,
    params,
  );
  return rows.map(decorateUserConversation);
}

async function listUserConversationFilterOptions(userId) {
  const rows = await query(
    `SELECT ch.id, ch.name, COUNT(c.id) AS conversation_count
     FROM characters ch
     JOIN conversations c ON c.character_id = ch.id
     WHERE c.user_id = ? AND c.status <> 'deleted' AND ch.status <> 'blocked'
     GROUP BY ch.id, ch.name
     ORDER BY MAX(c.updated_at) DESC, ch.id DESC
     LIMIT 200`,
    [userId],
  );

  return {
    characters: rows.map((row) => ({
      id: Number(row.id),
      label: row.name,
      count: Number(row.conversation_count || 0),
    })),
  };
}

async function listUserConversationStats(userId) {
  const rows = await query(
    `SELECT
       COUNT(*) AS total_conversations,
       SUM(CASE WHEN c.status = 'active' THEN 1 ELSE 0 END) AS active_conversations,
       SUM(CASE WHEN c.status = 'archived' THEN 1 ELSE 0 END) AS archived_conversations,
       SUM(CASE WHEN c.status = 'deleted' THEN 1 ELSE 0 END) AS deleted_conversations
     FROM conversations c
     JOIN characters ch ON ch.id = c.character_id
     WHERE c.user_id = ? AND ch.status <> 'blocked'`,
    [userId],
  );
  const stats = rows[0] || {};
  return {
    totalConversations: Number(stats.total_conversations || 0),
    activeConversations: Number(stats.active_conversations || 0),
    archivedConversations: Number(stats.archived_conversations || 0),
    deletedConversations: Number(stats.deleted_conversations || 0),
  };
}

async function listUserConversationsForManagement(userId, options = {}) {
  const pageSize = Math.min(50, Math.max(1, normalizePositiveInteger(options.pageSize, 12)));
  const requestedPage = Math.max(1, normalizePositiveInteger(options.page, 1));
  const { whereSql, params, normalized } = buildUserConversationFilters(userId, options);

  const countRows = await query(
    `SELECT COUNT(*) AS total
     FROM conversations c
     JOIN characters ch ON ch.id = c.character_id
     ${whereSql}`,
    params,
  );
  const total = Number(countRows[0]?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * pageSize;
  const orderSql = getConversationOrderSql(normalized.sort);

  const rows = await query(
    `${userConversationSelectSql()}
     ${whereSql}
     ORDER BY ${orderSql}
     LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}`,
    params,
  );

  const [filterOptions, stats] = await Promise.all([
    listUserConversationFilterOptions(userId),
    listUserConversationStats(userId),
  ]);

  return {
    conversations: rows.map(decorateUserConversation),
    total,
    page,
    pageSize,
    totalPages,
    filters: normalized,
    filterOptions,
    stats,
  };
}

async function bulkUpdateUserConversationStatus(userId, conversationIds = [], config = {}) {
  const ids = normalizeConversationIds(conversationIds);
  if (!ids.length) {
    return { requested: 0, affected: 0 };
  }

  const placeholders = ids.map(() => '?').join(',');
  const result = await query(
    `UPDATE conversations
     SET ${config.setSql}
     WHERE user_id = ? AND id IN (${placeholders}) AND ${config.whereSql}`,
    [userId, ...ids],
  );

  await Promise.all(ids.map((id) => invalidateConversationCache(id).catch(() => {})));
  return {
    requested: ids.length,
    affected: Number(result.affectedRows || 0),
  };
}

function bulkSoftDeleteUserConversations(userId, conversationIds = []) {
  return bulkUpdateUserConversationStatus(userId, conversationIds, {
    setSql: "status = 'deleted', deleted_at = NOW(), updated_at = NOW()",
    whereSql: "status <> 'deleted'",
  });
}

function bulkArchiveUserConversations(userId, conversationIds = []) {
  return bulkUpdateUserConversationStatus(userId, conversationIds, {
    setSql: "status = 'archived', updated_at = NOW()",
    whereSql: "status = 'active'",
  });
}

function bulkRestoreUserConversations(userId, conversationIds = []) {
  return bulkUpdateUserConversationStatus(userId, conversationIds, {
    setSql: "status = 'active', deleted_at = NULL, updated_at = NOW()",
    whereSql: "status IN ('archived', 'deleted')",
  });
}

module.exports = {
  normalizePositiveInteger,
  listUserConversations,
  listUserConversationsForManagement,
  listUserConversationFilterOptions,
  bulkSoftDeleteUserConversations,
  bulkArchiveUserConversations,
  bulkRestoreUserConversations,
};
