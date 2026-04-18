/**
 * @file src/services/conversation-service.js
 * @description 会话与消息持久化服务，支持树状消息、分支浏览、重新生成与内容编辑。
 */

const { query } = require('../lib/db');

async function createConversation(userId, characterId, options = {}) {
  const result = await query(
    `INSERT INTO conversations (
      user_id, character_id, parent_conversation_id, branched_from_message_id,
      current_message_id, title, status, last_message_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, NULL, ?, 'active', NOW(), NOW(), NOW())`,
    [
      userId,
      characterId,
      options.parentConversationId || null,
      options.branchedFromMessageId || null,
      options.title || '新对话',
    ],
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
    `SELECT c.id, c.title, c.updated_at, c.current_message_id, ch.name AS character_name
     FROM conversations c
     JOIN characters ch ON ch.id = c.character_id
     WHERE c.user_id = ?
     ORDER BY c.updated_at DESC`,
    [userId],
  );
}

async function listMessages(conversationId) {
  return query(
    `SELECT id, conversation_id, sender_type, content, sequence_no, status, created_at,
            parent_message_id, branch_from_message_id, edited_from_message_id,
            prompt_kind, metadata_json
     FROM messages
     WHERE conversation_id = ?
     ORDER BY sequence_no ASC, id ASC`,
    [conversationId],
  );
}

async function getMessageById(conversationId, messageId) {
  const rows = await query(
    `SELECT id, conversation_id, sender_type, content, sequence_no, status, created_at,
            parent_message_id, branch_from_message_id, edited_from_message_id,
            prompt_kind, metadata_json
     FROM messages
     WHERE conversation_id = ? AND id = ?
     LIMIT 1`,
    [conversationId, messageId],
  );
  return rows[0] || null;
}

async function addMessage(options) {
  const seqRows = await query('SELECT COALESCE(MAX(sequence_no), 0) AS maxSeq FROM messages WHERE conversation_id = ?', [options.conversationId]);
  const nextSequence = Number(seqRows[0].maxSeq || 0) + 1;

  const result = await query(
    `INSERT INTO messages (
      conversation_id, sender_type, content, sequence_no, status, created_at,
      parent_message_id, branch_from_message_id, edited_from_message_id,
      prompt_kind, metadata_json
    ) VALUES (?, ?, ?, ?, 'success', NOW(), ?, ?, ?, ?, ?)`,
    [
      options.conversationId,
      options.senderType,
      options.content,
      nextSequence,
      options.parentMessageId || null,
      options.branchFromMessageId || null,
      options.editedFromMessageId || null,
      options.promptKind || 'normal',
      options.metadataJson || null,
    ],
  );

  await setConversationCurrentMessage(options.conversationId, result.insertId);
  return result.insertId;
}

async function setConversationCurrentMessage(conversationId, messageId) {
  await query(
    'UPDATE conversations SET current_message_id = ?, updated_at = NOW(), last_message_at = NOW() WHERE id = ?',
    [messageId || null, conversationId],
  );
}

async function updateMessageContent(conversationId, messageId, content) {
  await query(
    `UPDATE messages
     SET content = ?, status = 'success'
     WHERE conversation_id = ? AND id = ?`,
    [content, conversationId, messageId],
  );

  await setConversationCurrentMessage(conversationId, messageId);
}

function buildPathMessages(allMessages, leafMessageId) {
  if (!leafMessageId) {
    return [];
  }

  const byId = new Map(allMessages.map((message) => [Number(message.id), message]));
  const path = [];
  const visited = new Set();
  let currentId = Number(leafMessageId);

  while (currentId && byId.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const current = byId.get(currentId);
    path.push(current);
    currentId = current.parent_message_id ? Number(current.parent_message_id) : 0;
  }

  return path.reverse();
}

function decorateMessages(allMessages, activeLeafId) {
  const normalizedActiveLeafId = activeLeafId ? Number(activeLeafId) : null;
  const path = buildPathMessages(allMessages, normalizedActiveLeafId);
  const activeIds = new Set(path.map((message) => Number(message.id)));
  const childrenMap = new Map();

  for (const message of allMessages) {
    if (!message.parent_message_id) {
      continue;
    }
    const parentId = Number(message.parent_message_id);
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId).push(message);
  }

  return allMessages.map((message) => {
    const children = (childrenMap.get(Number(message.id)) || []).sort((a, b) => a.id - b.id);
    return {
      ...message,
      is_active: activeIds.has(Number(message.id)),
      child_count: children.length,
      child_leaf_ids: children.map((child) => child.id),
      metadata: safeParseJson(message.metadata_json),
    };
  });
}

function safeParseJson(value) {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

module.exports = {
  createConversation,
  getConversationById,
  listUserConversations,
  listMessages,
  getMessageById,
  addMessage,
  setConversationCurrentMessage,
  updateMessageContent,
  buildPathMessages,
  decorateMessages,
};
