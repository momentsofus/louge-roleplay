/**
 * @file src/services/prompt-engineering-service.js
 * @description 全局提示词片段、角色提示词片段与最终 system prompt 拼接。
 */

const { query } = require('../lib/db');

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return [value];
}

function safeParseJson(value, fallback = []) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizePromptItems(items = []) {
  return toArray(items)
    .map((item, index) => ({
      key: String(item?.key || item?.label || '').trim(),
      value: String(item?.value || '').trim(),
      sortOrder: Number(item?.sortOrder ?? item?.sort_order ?? index),
      isEnabled: item?.isEnabled === undefined ? true : Boolean(Number(item?.isEnabled ?? item?.is_enabled ?? 1)),
    }))
    .filter((item) => item.key || item.value)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
}

function parsePromptItemsFromForm(body, options = {}) {
  const keyField = options.keyField || 'promptItemKey';
  const valueField = options.valueField || 'promptItemValue';
  const enabledField = options.enabledField || 'promptItemEnabled';

  const keys = toArray(body[keyField]);
  const values = toArray(body[valueField]);
  const enabledValues = toArray(body[enabledField]);
  const maxLength = Math.max(keys.length, values.length, enabledValues.length);

  const items = [];
  for (let index = 0; index < maxLength; index += 1) {
    items.push({
      key: String(keys[index] || '').trim(),
      value: String(values[index] || '').trim(),
      isEnabled: String(enabledValues[index] || '1') !== '0',
      sortOrder: index,
    });
  }

  return normalizePromptItems(items);
}

function formatPromptSection(key, value) {
  const cleanKey = String(key || '').trim();
  const cleanValue = String(value || '').trim();
  if (!cleanValue) {
    return '';
  }
  if (!cleanKey) {
    return `【[未命名片段]】{\n${cleanValue}\n}`;
  }
  return `【[${cleanKey}]】{\n${cleanValue}\n}`;
}

function buildCharacterPromptItems(character = {}) {
  const dynamicItems = normalizePromptItems(safeParseJson(character.prompt_profile_json || character.promptProfileJson || '[]', []));
  if (dynamicItems.length > 0) {
    return dynamicItems;
  }

  return normalizePromptItems([
    { key: '角色名', value: character.name || '', sortOrder: 0 },
    { key: '角色简介', value: character.summary || '', sortOrder: 1 },
    { key: '角色', value: character.role || '', sortOrder: 2 },
    { key: '描述角色性格', value: character.personality || character.traitDescription || '', sortOrder: 3 },
    { key: '当前场景', value: character.currentScene || '', sortOrder: 4 },
    { key: '当前背景', value: character.currentBackground || '', sortOrder: 5 },
  ]);
}

function composeSystemPrompt({ promptBlocks = [], characterPromptItems = [], systemHint = '' }) {
  const sections = [
    ...normalizePromptItems(promptBlocks)
      .filter((item) => item.isEnabled && String(item.value || '').trim())
      .map((item) => formatPromptSection(item.key, item.value)),
    ...normalizePromptItems(characterPromptItems)
      .filter((item) => item.isEnabled && String(item.value || '').trim())
      .map((item) => formatPromptSection(item.key, item.value)),
    formatPromptSection('运行时要求', systemHint || ''),
  ].filter(Boolean);

  return sections.join('\n\n');
}

async function listPromptBlocks(options = {}) {
  const whereClause = options.enabledOnly ? 'WHERE is_enabled = 1' : '';
  return query(
    `SELECT id, block_key, block_value, sort_order, is_enabled, created_at, updated_at
     FROM system_prompt_blocks
     ${whereClause}
     ORDER BY sort_order ASC, id ASC`,
  );
}

async function createPromptBlock(payload) {
  const rows = await query('SELECT COALESCE(MAX(sort_order), -1) AS max_sort FROM system_prompt_blocks');
  const nextSortOrder = Number(rows[0]?.max_sort ?? -1) + 1;

  const result = await query(
    `INSERT INTO system_prompt_blocks (
      block_key, block_value, sort_order, is_enabled, created_at, updated_at
    ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [
      String(payload.key || '').trim(),
      String(payload.value || '').trim(),
      payload.sortOrder === undefined ? nextSortOrder : Number(payload.sortOrder || 0),
      payload.isEnabled ? 1 : 0,
    ],
  );

  return result.insertId;
}

async function updatePromptBlock(blockId, payload) {
  await query(
    `UPDATE system_prompt_blocks
     SET block_key = ?,
         block_value = ?,
         sort_order = ?,
         is_enabled = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [
      String(payload.key || '').trim(),
      String(payload.value || '').trim(),
      Number(payload.sortOrder || 0),
      payload.isEnabled ? 1 : 0,
      blockId,
    ],
  );
}

async function reorderPromptBlocks(blockIds = []) {
  const normalizedIds = Array.from(new Set((blockIds || []).map((id) => Number(id)).filter((id) => id > 0)));
  for (let index = 0; index < normalizedIds.length; index += 1) {
    await query(
      `UPDATE system_prompt_blocks
       SET sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [index, normalizedIds[index]],
    );
  }
}

async function deletePromptBlock(blockId) {
  await query('DELETE FROM system_prompt_blocks WHERE id = ?', [blockId]);
}

function buildPromptPreview({ promptBlocks = [], character = {}, systemHint = '' }) {
  return composeSystemPrompt({
    promptBlocks,
    characterPromptItems: buildCharacterPromptItems(character),
    systemHint,
  });
}

module.exports = {
  normalizePromptItems,
  parsePromptItemsFromForm,
  formatPromptSection,
  buildCharacterPromptItems,
  composeSystemPrompt,
  buildPromptPreview,
  listPromptBlocks,
  createPromptBlock,
  updatePromptBlock,
  reorderPromptBlocks,
  deletePromptBlock,
};
