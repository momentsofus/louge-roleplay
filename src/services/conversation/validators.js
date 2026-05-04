/**
 * @file src/services/conversation/validators.js
 * @description 会话服务输入值规范化与消息提示类型约束。
 */

'use strict';

const MESSAGE_PROMPT_KIND_VALUES = new Set([
  'normal',
  'regenerate',
  'branch',
  'edit',
  'optimized',
  'replay',
  'conversation-start',
  'first-message',
]);

function normalizeMessagePromptKind(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === 'chat') {
    return 'normal';
  }
  return MESSAGE_PROMPT_KIND_VALUES.has(raw) ? raw : 'normal';
}

module.exports = {
  MESSAGE_PROMPT_KIND_VALUES,
  normalizeMessagePromptKind,
};
