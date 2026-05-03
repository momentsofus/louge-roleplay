#!/usr/bin/env node
/**
 * @file scripts/test-error-handler.js
 * @description 验证全局错误映射与错误页客服提示渲染，覆盖大文本表单导致的 413 降级场景。
 */

'use strict';

const assert = require('assert/strict');
const { mapErrorToPresentation } = require('../src/middleware/error-handler');

function main() {
  const payloadTooLarge = new Error('request entity too large');
  payloadTooLarge.type = 'entity.too.large';
  payloadTooLarge.statusCode = 413;

  const presentation = mapErrorToPresentation(payloadTooLarge);
  assert.equal(presentation.statusCode, 413, 'large body should map to HTTP 413');
  assert.equal(presentation.errorCode, 'REQUEST_ENTITY_TOO_LARGE', 'large body should use friendly error code');
  assert.match(presentation.message, /提交内容太长/, 'large body should show user-friendly message');

  const fallback = mapErrorToPresentation(new Error('unexpected boom'));
  assert.equal(fallback.statusCode, 500, 'unknown errors should remain 500');
  assert.equal(fallback.errorCode, 'INTERNAL_SERVER_ERROR', 'unknown errors should use internal error code');

  console.log('Error handler tests passed.');
  setImmediate(() => process.exit(0));
}

main();
