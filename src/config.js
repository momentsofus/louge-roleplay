/**
 * @file src/config.js
 * @description 统一读取并导出应用配置，负责环境变量解析与默认值处理。
 */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  port: Number(process.env.PORT || 3217),
  appName: process.env.APP_NAME || '楼阁',
  appUrl: process.env.APP_URL || 'https://aicafe.momentsofus.cn',
  sessionSecret: process.env.SESSION_SECRET || 'replace_me',
  databaseUrl: process.env.DATABASE_URL,
  databaseAdminUrl: process.env.DATABASE_ADMIN_URL,
  redisUrl: process.env.REDIS_URL,
  openaiBaseUrl: process.env.OPENAI_BASE_URL || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFrom: process.env.RESEND_FROM || '顾清辞 <guqingci@xuejourney.xin>',
  aliyunPhoneAuthEnabled: String(process.env.ALIYUN_PHONE_AUTH_ENABLED || 'false') === 'true',
  aliyunPhoneAuthAppId: process.env.ALIYUN_PHONE_AUTH_APP_ID || '',
  aliyunPhoneAuthAppKey: process.env.ALIYUN_PHONE_AUTH_APP_KEY || '',
  aliyunNumberAuthSchemeCode: process.env.ALIYUN_NUMBER_AUTH_SCHEME_CODE || '',
  aliyunAccessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  aliyunAccessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  aliyunSmsSignName: process.env.ALIYUN_SMS_SIGN_NAME || '',
  aliyunSmsTemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || '',
  trustProxy: String(process.env.TRUST_PROXY || 'false') === 'true',
  cookieSecure: String(process.env.COOKIE_SECURE || 'false') === 'true',
};

