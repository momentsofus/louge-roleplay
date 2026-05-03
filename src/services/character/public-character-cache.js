/**
 * @file src/services/character/public-character-cache.js
 * @description 公开角色页/首页推荐的 Redis 版本化缓存。通过递增版本号批量失效，避免 Redis KEYS/SCAN 依赖。
 */

'use strict';

const crypto = require('node:crypto');
const { redisClient } = require('../../lib/redis');
const logger = require('../../lib/logger');

const PUBLIC_CHARACTER_CACHE_VERSION_KEY = 'public-characters:cache-version:v1';
const DEFAULT_PUBLIC_CHARACTER_CACHE_VERSION = '1';
const CACHE_REGISTRY_LIMIT = 1200;
const registeredPublicCharacterCacheKeys = new Set();

function hashCachePayload(payload) {
  return crypto
    .createHash('sha1')
    .update(JSON.stringify(payload || {}))
    .digest('hex')
    .slice(0, 24);
}

function rememberPublicCharacterCacheKey(key) {
  if (!key) return;
  registeredPublicCharacterCacheKeys.delete(key);
  registeredPublicCharacterCacheKeys.add(key);
  while (registeredPublicCharacterCacheKeys.size > CACHE_REGISTRY_LIMIT) {
    registeredPublicCharacterCacheKeys.delete(registeredPublicCharacterCacheKeys.values().next().value);
  }
}

async function invalidateRememberedPublicCharacterCacheKeys() {
  if (!registeredPublicCharacterCacheKeys.size) return;
  const keys = [...registeredPublicCharacterCacheKeys];
  registeredPublicCharacterCacheKeys.clear();
  try {
    await redisClient.del(keys);
  } catch (error) {
    logger.warn('[public-character-cache] 删除旧版本缓存失败', { count: keys.length, error: error.message });
  }
}

async function getPublicCharacterCacheVersion() {
  try {
    return (await redisClient.get(PUBLIC_CHARACTER_CACHE_VERSION_KEY)) || DEFAULT_PUBLIC_CHARACTER_CACHE_VERSION;
  } catch (error) {
    logger.warn('[public-character-cache] 读取缓存版本失败，降级为默认版本', { error: error.message });
    return DEFAULT_PUBLIC_CHARACTER_CACHE_VERSION;
  }
}

async function buildPublicCharacterCacheKey(scope, payload = {}) {
  const version = await getPublicCharacterCacheVersion();
  return `public-characters:${scope}:v${version}:${hashCachePayload(payload)}`;
}

async function readPublicCharacterCache(key) {
  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logger.warn('[public-character-cache] 读取缓存失败', { key, error: error.message });
    return null;
  }
}

async function writePublicCharacterCache(key, value, ttlSeconds) {
  try {
    await redisClient.setEx(key, Math.max(1, Number(ttlSeconds || 60)), JSON.stringify(value));
    rememberPublicCharacterCacheKey(key);
  } catch (error) {
    logger.warn('[public-character-cache] 写入缓存失败', { key, error: error.message });
  }
}

async function invalidatePublicCharacterCache(reason = 'unknown') {
  try {
    await redisClient.incr(PUBLIC_CHARACTER_CACHE_VERSION_KEY);
    await redisClient.expire(PUBLIC_CHARACTER_CACHE_VERSION_KEY, 30 * 24 * 60 * 60).catch(() => {});
    await invalidateRememberedPublicCharacterCacheKeys();
    logger.debug('[public-character-cache] 公开角色缓存已失效', { reason });
  } catch (error) {
    logger.warn('[public-character-cache] 失效缓存失败', { reason, error: error.message });
  }
}

module.exports = {
  buildPublicCharacterCacheKey,
  readPublicCharacterCache,
  writePublicCharacterCache,
  invalidatePublicCharacterCache,
};
