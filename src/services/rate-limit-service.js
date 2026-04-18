/**
 * @file src/services/rate-limit-service.js
 * @description 基于 Redis 的简易限流服务，防止验证码与登录注册接口被批量刷请求。
 */

const { redisClient } = require('../lib/redis');

async function hitLimit(key, windowSeconds, limit) {
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.expire(key, windowSeconds);
  }
  return count > limit;
}

module.exports = {
  hitLimit,
};
