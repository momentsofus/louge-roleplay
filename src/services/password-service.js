/**
 * @file src/services/password-service.js
 * @description 密码加密与校验服务，统一处理密码安全逻辑。
 */

const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
