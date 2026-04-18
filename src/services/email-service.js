/**
 * @file src/services/email-service.js
 * @description 邮箱验证码发送服务，基于 Resend API 发送注册/登录验证码邮件。
 */

const axios = require('axios');
const config = require('../config');

async function sendVerificationEmail(email, code) {
  if (!config.resendApiKey) {
    throw new Error('RESEND_API_KEY is required');
  }

  await axios.post('https://api.resend.com/emails', {
    from: config.resendFrom,
    to: [email],
    subject: '你的验证码',
    text: `你的验证码是 ${code}，5 分钟内有效。若不是你本人操作，请忽略此邮件。`,
    html: `<div style="font-family:Arial,sans-serif"><h2>验证码</h2><p>你的验证码是：<strong style="font-size:24px">${code}</strong></p><p>5 分钟内有效。若不是你本人操作，请忽略此邮件。</p></div>`,
  }, {
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
}

module.exports = {
  sendVerificationEmail,
};
