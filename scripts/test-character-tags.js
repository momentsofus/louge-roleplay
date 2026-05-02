#!/usr/bin/env node
/**
 * @file scripts/test-character-tags.js
 * @description Regression tests for character tag normalization and Simplified/Traditional Chinese search compatibility.
 */

'use strict';

const assert = require('node:assert/strict');
const {
  normalizeTagName,
  normalizeTagSlug,
  parseTagInput,
  getTagSearchNames,
} = require('../src/services/character-tag-service');

assert.equal(normalizeTagName('#治愈'), '治癒', '简体标签应规范化为繁体');
assert.equal(normalizeTagName(' 后宫 '), '後宮', '标签首尾空白清理后应转繁体');
assert.equal(normalizeTagName('日常'), '日常', '简繁相同的标签应保持稳定');

assert.deepEqual(
  parseTagInput('治愈, 治癒, 后宫, 後宮, 奇幻'),
  ['治癒', '後宮', '奇幻'],
  '简繁等价标签应去重并保留繁体标准名',
);

assert.equal(normalizeTagSlug('治愈'), normalizeTagSlug('治癒'), '简繁等价标签 slug 应一致');
assert.deepEqual(getTagSearchNames('治愈'), ['治癒', '治愈'], '搜索应同时兼容繁体标准名和原简体输入');

console.log('Character tag normalization regression test passed.');
process.exit(0);
