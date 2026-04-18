/**
 * @file src/services/aliyun-sms-service.js
 * @description 阿里云号码认证短信验证码服务，基于 Dypnsapi 发送正式验证码短信。
 */

const Dypnsapi = require('@alicloud/dypnsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const config = require('../config');

function createClient() {
  const clientConfig = new OpenApi.Config({
    accessKeyId: config.aliyunAccessKeyId,
    accessKeySecret: config.aliyunAccessKeySecret,
    endpoint: 'dypnsapi.aliyuncs.com',
  });
  return new Dypnsapi.default(clientConfig);
}

async function sendLoginCodeSms(phone, code) {
  if (!config.aliyunAccessKeyId || !config.aliyunAccessKeySecret) {
    throw new Error('Aliyun SMS access key is required');
  }
  if (!config.aliyunSmsSignName || !config.aliyunSmsTemplateCode) {
    throw new Error('Aliyun SMS sign/template config is required');
  }

  const client = createClient();
  const request = new Dypnsapi.SendSmsVerifyCodeRequest({
    signName: config.aliyunSmsSignName,
    templateCode: config.aliyunSmsTemplateCode,
    phoneNumber: phone,
    templateParam: JSON.stringify({ code, min: 5 }),
    countryCode: '86',
    schemeName: 'AI角色站注册验证',
    codeLength: 6,
    validTime: 300,
    duplicatePolicy: 2,
    interval: 60,
    codeType: 1,
    returnVerifyCode: false,
    autoRetry: 1,
  });

  const runtime = new Util.RuntimeOptions({
    connectTimeout: 10000,
    readTimeout: 10000,
  });

  const response = await client.sendSmsVerifyCodeWithOptions(request, runtime);
  if (response.body.code !== 'OK') {
    throw new Error(`Aliyun SMS failed: ${response.body.code} ${response.body.message}`);
  }
  return response.body;
}

module.exports = {
  sendLoginCodeSms,
};
