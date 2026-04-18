/**
 * @file src/lib/redis.js
 * @description Redis 客户端初始化，供 Session、缓存、限流等模块使用。
 */

const { createClient } = require('redis');
const config = require('../config');
const logger = require('./logger');

if (!config.redisUrl) {
  throw new Error('REDIS_URL is required');
}

const redisClient = createClient({ url: config.redisUrl });
redisClient.on('error', (error) => logger.error('Redis error', { error: error.message }));

async function initRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

module.exports = {
  redisClient,
  initRedis,
};
