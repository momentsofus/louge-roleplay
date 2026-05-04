/**
 * @file src/services/conversation/cache.js
 * @description 会话消息列表、消息数量与显示链缓存失效封装。
 */

'use strict';

const { redisClient } = require('../../lib/redis');
const logger = require('../../lib/logger');
const { invalidatePathMessagesCache } = require('./path-repository');

const MESSAGE_LIST_CACHE_TTL_SECONDS = 60;
const MESSAGE_COUNT_CACHE_TTL_SECONDS = 60;

function getConversationMessagesCacheKey(conversationId) {
  return `conversation:${conversationId}:messages:v2`;
}

function getConversationMessageCountCacheKey(conversationId) {
  return `conversation:${conversationId}:message-count:v2`;
}

async function invalidateConversationCache(conversationId) {
  const cacheKey = getConversationMessagesCacheKey(conversationId);
  const countCacheKey = getConversationMessageCountCacheKey(conversationId);
  try {
    await redisClient.del(cacheKey, countCacheKey);
    await invalidatePathMessagesCache(conversationId);
  } catch (error) {
    logger.warn('Failed to invalidate conversation cache', {
      conversationId,
      cacheKey,
      countCacheKey,
      error: error.message,
    });
  }
}

async function readMessageListCache(conversationId) {
  const cacheKey = getConversationMessagesCacheKey(conversationId);
  try {
    const cached = await redisClient.get(cacheKey);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    logger.debug('Conversation messages cache hit', {
      conversationId,
      cacheKey,
      count: Array.isArray(parsed) ? parsed.length : 0,
    });
    return parsed;
  } catch (error) {
    logger.warn('Failed to read conversation cache', {
      conversationId,
      cacheKey,
      error: error.message,
    });
    return null;
  }
}

async function writeMessageListCache(conversationId, rows) {
  const cacheKey = getConversationMessagesCacheKey(conversationId);
  try {
    await redisClient.setEx(cacheKey, MESSAGE_LIST_CACHE_TTL_SECONDS, JSON.stringify(rows));
  } catch (error) {
    logger.warn('Failed to write conversation cache', {
      conversationId,
      cacheKey,
      error: error.message,
    });
  }
}

async function readMessageCountCache(conversationId) {
  const cacheKey = getConversationMessageCountCacheKey(conversationId);
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached === null || cached === undefined) return null;
    return Number(cached || 0);
  } catch (error) {
    logger.warn('Failed to read conversation message count cache', {
      conversationId,
      cacheKey,
      error: error.message,
    });
    return null;
  }
}

async function writeMessageCountCache(conversationId, count) {
  const cacheKey = getConversationMessageCountCacheKey(conversationId);
  try {
    await redisClient.setEx(cacheKey, MESSAGE_COUNT_CACHE_TTL_SECONDS, String(count));
  } catch (error) {
    logger.warn('Failed to write conversation message count cache', {
      conversationId,
      cacheKey,
      error: error.message,
    });
  }
}

module.exports = {
  getConversationMessagesCacheKey,
  getConversationMessageCountCacheKey,
  invalidateConversationCache,
  readMessageListCache,
  writeMessageListCache,
  readMessageCountCache,
  writeMessageCountCache,
};
