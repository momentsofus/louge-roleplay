/**
 * @file src/services/verification-service.js
 * @description 统一处理邮箱/手机号验证码的签发、缓存与校验。
 */

const { redisClient } = require('../lib/redis');
const { sendVerificationEmail } = require('./email-service');
const { hitLimit } = require('./rate-limit-service');
const { sendLoginCodeSms } = require('./aliyun-sms-service');

const CODE_EXPIRE_SECONDS = 5 * 60;

function generateCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

async function issueEmailCode(email, ip) {
  const limited = await hitLimit(`rate:email-code:${ip}`, 60, 5);
  if (limited) {
    throw new Error('发送太频繁，请稍后再试');
  }

  const code = generateCode();
  await redisClient.setEx(`verify:email:${email}`, CODE_EXPIRE_SECONDS, code);
  await sendVerificationEmail(email, code);
}

async function issuePhoneCode(phone, ip) {
  const limited = await hitLimit(`rate:phone-code:${ip}`, 60, 5);
  if (limited) {
    throw new Error('发送太频繁，请稍后再试');
  }

  const code = generateCode();
  await redisClient.setEx(`verify:phone:${phone}`, CODE_EXPIRE_SECONDS, code);
  await sendLoginCodeSms(phone, code);
  return code;
}

async function verifyEmailCode(email, code) {
  const stored = await redisClient.get(`verify:email:${email}`);
  const ok = Boolean(stored && stored === String(code || '').trim());
  if (ok) {
    await redisClient.del(`verify:email:${email}`);
  }
  return ok;
}

async function verifyPhoneCode(phone, code) {
  const stored = await redisClient.get(`verify:phone:${phone}`);
  const ok = Boolean(stored && stored === String(code || '').trim());
  if (ok) {
    await redisClient.del(`verify:phone:${phone}`);
  }
  return ok;
}

module.exports = {
  issueEmailCode,
  issuePhoneCode,
  verifyEmailCode,
  verifyPhoneCode,
};
