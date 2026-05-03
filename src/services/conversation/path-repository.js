/**
 * @file src/services/conversation/path-repository.js
 * @description 使用递归查询读取当前会话从叶子消息到根消息的显示链。
 */

const { query } = require('../../lib/db');
const { redisClient } = require('../../lib/redis');
const logger = require('../../lib/logger');
const { normalizeMessageForView } = require('./message-view');

const PATH_MESSAGES_CACHE_TTL_SECONDS = 45;

function getPathMessagesCacheKey(conversationId, leafMessageId) {
  return `conversation:${conversationId}:path:${leafMessageId}:v2`;
}

async function invalidatePathMessagesCache(conversationId, leafMessageId = null) {
  const normalizedConversationId = Number(conversationId || 0);
  if (!normalizedConversationId) return;
  const keys = [];
  if (leafMessageId) {
    keys.push(getPathMessagesCacheKey(normalizedConversationId, Number(leafMessageId)));
  }
  keys.push(`conversation:${normalizedConversationId}:path-version:v2`);
  try {
    await redisClient.incr(`conversation:${normalizedConversationId}:path-version:v2`);
    await redisClient.expire(`conversation:${normalizedConversationId}:path-version:v2`, 24 * 60 * 60).catch(() => {});
    if (keys.length > 1) await redisClient.del(keys.slice(0, -1));
  } catch (error) {
    logger.warn('Failed to invalidate conversation path cache', {
      conversationId: normalizedConversationId,
      leafMessageId,
      error: error.message,
    });
  }
}

async function getPathCacheVersion(conversationId) {
  try {
    return await redisClient.get(`conversation:${conversationId}:path-version:v2`) || '1';
  } catch (_) {
    return '1';
  }
}

async function fetchPathMessages(conversationId, leafMessageId) {
  const normalizedLeafId = Number(leafMessageId || 0);
  if (!normalizedLeafId) return [];
  const version = await getPathCacheVersion(conversationId);
  const cacheKey = `${getPathMessagesCacheKey(conversationId, normalizedLeafId)}:pv${version}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    logger.warn('Failed to read conversation path cache', {
      conversationId,
      leafMessageId: normalizedLeafId,
      error: error.message,
    });
  }

  const rows = await query(
    `WITH RECURSIVE message_path AS (
       SELECT id,
              conversation_id,
              sender_type,
              content,
              sequence_no,
              status,
              created_at,
              parent_message_id,
              branch_from_message_id,
              edited_from_message_id,
              prompt_kind,
              metadata_json,
              deleted_at,
              0 AS reverse_depth
       FROM messages
       WHERE conversation_id = ? AND id = ? AND deleted_at IS NULL
       UNION ALL
       SELECT m.id,
              m.conversation_id,
              m.sender_type,
              m.content,
              m.sequence_no,
              m.status,
              m.created_at,
              m.parent_message_id,
              m.branch_from_message_id,
              m.edited_from_message_id,
              m.prompt_kind,
              m.metadata_json,
              m.deleted_at,
              mp.reverse_depth + 1 AS reverse_depth
       FROM messages m
       JOIN message_path mp ON m.id = mp.parent_message_id
       WHERE m.conversation_id = ? AND m.deleted_at IS NULL
     )
     SELECT id,
            conversation_id,
            sender_type,
            content,
            sequence_no,
            status,
            created_at,
            parent_message_id,
            branch_from_message_id,
            edited_from_message_id,
            prompt_kind,
            metadata_json,
            deleted_at
     FROM message_path
     ORDER BY reverse_depth DESC`,
    [conversationId, normalizedLeafId, conversationId],
  );

  const messages = rows.map(normalizeMessageForView);
  try {
    await redisClient.setEx(cacheKey, PATH_MESSAGES_CACHE_TTL_SECONDS, JSON.stringify(messages));
  } catch (error) {
    logger.warn('Failed to write conversation path cache', {
      conversationId,
      leafMessageId: normalizedLeafId,
      error: error.message,
    });
  }
  return messages;
}

module.exports = { fetchPathMessages, invalidatePathMessagesCache };
