/**
 * @file src/services/captcha-service.js
 * @description 图形验证码服务，负责生成 SVG 验证码、写入 Redis、校验验证码有效性。
 */

const { randomUUID } = require('crypto');
const { redisClient } = require('../lib/redis');

const CAPTCHA_EXPIRE_SECONDS = 5 * 60;
const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function randomText(length = 5) {
  let text = '';
  for (let i = 0; i < length; i += 1) {
    text += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return text;
}

function generateSvg(text) {
  const chars = text.split('').map((char, index) => {
    const rotate = (Math.random() * 30 - 15).toFixed(2);
    const y = 28 + Math.floor(Math.random() * 8);
    return `<text x="${18 + index * 22}" y="${y}" font-size="24" fill="#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}" transform="rotate(${rotate} ${18 + index * 22} ${y})">${char}</text>`;
  }).join('');

  const lines = Array.from({ length: 4 }).map(() => {
    const x1 = Math.floor(Math.random() * 120);
    const y1 = Math.floor(Math.random() * 50);
    const x2 = Math.floor(Math.random() * 120);
    const y2 = Math.floor(Math.random() * 50);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="1" />`;
  }).join('');

  const dots = Array.from({ length: 24 }).map(() => {
    const cx = Math.floor(Math.random() * 120);
    const cy = Math.floor(Math.random() * 50);
    const r = Math.random() * 1.8;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#94a3b8" />`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="50" viewBox="0 0 120 50">
  <rect width="120" height="50" fill="#0f172a" rx="8" ry="8" />
  ${lines}
  ${dots}
  ${chars}
</svg>`;
}

async function createCaptcha() {
  const id = randomUUID();
  const text = randomText();
  const svg = generateSvg(text);
  await redisClient.setEx(`captcha:${id}`, CAPTCHA_EXPIRE_SECONDS, JSON.stringify({ answer: text.toUpperCase(), svg }));
  return {
    captchaId: id,
    imageUrl: `/api/captcha/image/${id}`,
  };
}

async function invalidateCaptcha(captchaId) {
  if (!captchaId) {
    return;
  }
  await redisClient.del(`captcha:${captchaId}`);
}

async function refreshCaptcha(previousCaptchaId = '') {
  await invalidateCaptcha(String(previousCaptchaId || '').trim());
  return createCaptcha();
}

async function getCaptchaImage(captchaId) {
  if (!captchaId) {
    return null;
  }
  const stored = await redisClient.get(`captcha:${captchaId}`);
  if (!stored) {
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (_) {
    return null;
  }
  return parsed.svg || null;
}

async function verifyCaptcha(captchaId, captchaText, consume = true) {
  if (!captchaId || !captchaText) {
    return false;
  }

  const stored = await redisClient.get(`captcha:${captchaId}`);
  if (!stored) {
    return false;
  }

  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch (_) {
    return false;
  }
  const isValid = parsed.answer === String(captchaText).trim().toUpperCase();
  if (isValid && consume) {
    await redisClient.del(`captcha:${captchaId}`);
  }
  return isValid;
}

module.exports = {
  createCaptcha,
  refreshCaptcha,
  invalidateCaptcha,
  getCaptchaImage,
  verifyCaptcha,
};
