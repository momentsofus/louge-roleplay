/**
 * @file src/services/conversation-service.js
 * @description 会话与消息持久化服务，负责创建会话、写入消息、读取历史。
 */

const { query } = require('../lib/db');

async function createConversation(userId, characterId) {
  const result = await query(
    'INSERT INTO conversations (user_id, character_id, title, status, last_message_at, created_at, updated_at) VALUES (?, ?, ?, \'active\', NOW(), NOW(), NOW())',
    [userId, characterId, '新对话'],
  );
  return result.insertId;
}

async function getConversationById(id, userId) {
  const rows = await query(
    `SELECT c.*, ch.name AS character_name, ch.summary AS character_summary, ch.personality, ch.first_message
     FROM conversations c
     JOIN characters ch ON ch.id = c.character_id
     WHERE c.id = ? AND c.user_id = ? LIMIT 1`,
    [id, userId],
  );
  return rows[0] || null;
}

async function listUserConversations(userId) {
  return query(
    `SELECT c.id, c.title, c.updated_at, ch.name AS character_name
     FROM conversations c
     JOIN characters ch ON ch.id = c.character_id
     WHERE c.user_id = ?
     ORDER BY c.updated_at DESC`,
    [userId],
  );
}

async function listMessages(conversationId) {
  return query(
    `SELECT id, sender_type, content, created_at
     FROM messages
     WHERE conversation_id = ?
     ORDER BY sequence_no ASC`,
    [conversationId],
  );
}

async function addMessage(conversationId, senderType, content) {
  const seqRows = await query('SELECT COALESCE(MAX(sequence_no), 0) AS maxSeq FROM messages WHERE conversation_id = ?', [conversationId]);
  const nextSequence = Number(seqRows[0].maxSeq || 0) + 1;

  const result = await query(
    `INSERT INTO messages (conversation_id, sender_type, content, sequence_no, status, created_at)
     VALUES (?, ?, ?, ?, 'success', NOW())`,
    [conversationId, senderType, content, nextSequence],
  );

  await query('UPDATE conversations SET updated_at = NOW(), last_message_at = NOW() WHERE id = ?', [conversationId]);
  return result.insertId;
}

module.exports = {
  createConversation,
  getConversationById,
  listUserConversations,
  listMessages,
  addMessage,
};
