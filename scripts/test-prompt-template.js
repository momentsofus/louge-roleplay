#!/usr/bin/env node
/**
 * @file scripts/test-prompt-template.js
 * @description 覆盖楼阁/Tavern 常见运行时占位符解析。
 */
'use strict';

const assert = require('node:assert/strict');
const { applyRuntimeTemplate, applyRuntimeTemplateToCharacter, buildCharacterPromptItems } = require('../src/services/prompt-engineering-service');

const runtimeContext = {
  username: '薛总',
  user: '薛总',
  characterName: '清辞',
  char: '清辞',
  time: '2026年05月02日 星期六 08:41:00 GMT+08:00',
};

assert.equal(
  applyRuntimeTemplate('你好，{{user}}。我是 {{char}}，现在是 {time}。', runtimeContext),
  '你好，薛总。我是 清辞，现在是 2026年05月02日 星期六 08:41:00 GMT+08:00。',
);
assert.equal(applyRuntimeTemplate('<USER> 与 <BOT> 开始对话。', runtimeContext), '薛总 与 清辞 开始对话。');

const character = applyRuntimeTemplateToCharacter({
  name: '清辞',
  first_message: '晚上好，{{user}}。',
  prompt_profile_json: JSON.stringify([{ key: '关系', value: '{{char}} 会陪着 {{user}}。', sortOrder: 0, isEnabled: true }]),
}, { username: '薛总', user: '薛总', time: '固定时间' });

assert.equal(character.first_message, '晚上好，薛总。');
const items = buildCharacterPromptItems(character);
assert.equal(items[0].value, '清辞 会陪着 薛总。');
console.log('Prompt template regression test passed.');
process.exit(0);
