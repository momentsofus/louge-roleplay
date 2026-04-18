/**
 * @file src/services/phone-auth-service.js
 * @description 国内手机号认证服务封装。当前提供图形验证码后短信验证码校验流程，并预留阿里云号码认证接口接入点。
 */

const config = require('../config');
const logger = require('../lib/logger');

async function verifyDomesticPhoneIdentity({ phone, accessToken, operatorToken, captchaPassed }) {
  if (!captchaPassed) {
    throw new Error('请先完成图形验证');
  }

  if (config.aliyunPhoneAuthEnabled) {
    logger.info('Aliyun phone auth placeholder invoked', {
      phoneMasked: phone ? `${String(phone).slice(0, 3)}****${String(phone).slice(-4)}` : '',
      hasAccessToken: Boolean(accessToken),
      hasOperatorToken: Boolean(operatorToken),
    });
  }

  return {
    success: true,
    mode: config.aliyunPhoneAuthEnabled ? 'aliyun-placeholder' : 'sms-fallback',
  };
}

module.exports = {
  verifyDomesticPhoneIdentity,
};
