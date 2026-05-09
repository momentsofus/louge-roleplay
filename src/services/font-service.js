/**
 * @file src/services/font-service.js
 * @description 管理对话显示字体：后台 CRUD、用户偏好选择、布局加载字体样式表。
 */

'use strict';

const { query, getDbType, waitReady } = require('../lib/db');

const DEFAULT_FONT_PREVIEW = '楼阁里的一段对话，应该读起来安静、清楚，也有一点余温。';
const DEFAULT_CHAT_FONT_ID = null;
const FONT_STATUS_VALUES = new Set(['active', 'disabled']);

let fontSchemaPromise = null;

function normalizeSortOrder(value) {
  const parsed = Number.parseInt(String(value ?? '0'), 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(-9999, Math.min(9999, parsed));
}

function normalizeFontStatus(value) {
  const normalized = String(value || 'active').trim();
  return FONT_STATUS_VALUES.has(normalized) ? normalized : 'active';
}

function normalizeFontCode(value, fallback = '') {
  const source = String(value || fallback || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return source || 'font';
}

function validateFontStack(value) {
  const stack = String(value || '').trim().slice(0, 500);
  if (!stack) {
    const error = new Error('字体 CSS 栈不能为空。');
    error.statusCode = 400;
    throw error;
  }
  if (/[;{}<>]/.test(stack) || /\b(?:url|expression|import)\s*\(/i.test(stack) || /@import/i.test(stack)) {
    const error = new Error('字体 CSS 栈包含不安全内容。');
    error.statusCode = 400;
    throw error;
  }
  return stack;
}

function normalizeStylesheetUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.length > 1000) {
    const error = new Error('字体样式地址过长。');
    error.statusCode = 400;
    throw error;
  }
  let parsed;
  try {
    parsed = new URL(raw);
  } catch (_) {
    const error = new Error('字体样式地址必须是完整 URL。');
    error.statusCode = 400;
    throw error;
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'fonts.xuejourney.xin') {
    const error = new Error('字体样式地址只能使用 https://fonts.xuejourney.xin。');
    error.statusCode = 400;
    throw error;
  }
  if (!parsed.pathname.startsWith('/css')) {
    const error = new Error('字体样式地址必须指向字体代理的 CSS 接口。');
    error.statusCode = 400;
    throw error;
  }
  return parsed.toString();
}

function normalizeFontPayload(payload = {}) {
  const name = String(payload.name || '').trim().slice(0, 80);
  if (!name) {
    const error = new Error('字体名称不能为空。');
    error.statusCode = 400;
    throw error;
  }
  const code = normalizeFontCode(payload.code, name);
  const cssStack = validateFontStack(payload.cssStack || payload.css_stack || payload.fontStack || payload.font_stack);
  return {
    code,
    name,
    cssStack,
    stylesheetUrl: normalizeStylesheetUrl(payload.stylesheetUrl || payload.stylesheet_url || payload.importUrl || payload.import_url),
    previewText: String(payload.previewText || payload.preview_text || DEFAULT_FONT_PREVIEW).trim().slice(0, 200) || DEFAULT_FONT_PREVIEW,
    status: normalizeFontStatus(payload.status),
    sortOrder: normalizeSortOrder(payload.sortOrder || payload.sort_order),
  };
}

async function mysqlColumnExists(tableName, columnName) {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tableName, columnName],
  );
  return Number(rows[0]?.count || 0) > 0;
}

async function mysqlIndexExists(tableName, indexName) {
  const rows = await query(
    `SELECT COUNT(*) AS count
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [tableName, indexName],
  );
  return Number(rows[0]?.count || 0) > 0;
}

async function ensureMysqlFontSchema() {
  await query(`CREATE TABLE IF NOT EXISTS fonts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(80) NOT NULL,
    css_stack VARCHAR(500) NOT NULL,
    stylesheet_url VARCHAR(1000) NULL,
    preview_text VARCHAR(200) NULL,
    status ENUM('active','disabled') NOT NULL DEFAULT 'active',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uniq_fonts_code (code),
    INDEX idx_fonts_status_sort (status, sort_order, name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  if (!(await mysqlColumnExists('users', 'chat_font_id'))) {
    await query('ALTER TABLE `users` ADD COLUMN `chat_font_id` BIGINT NULL');
  }
  if (!(await mysqlIndexExists('users', 'idx_users_chat_font'))) {
    await query('ALTER TABLE `users` ADD INDEX `idx_users_chat_font` (`chat_font_id`)');
  }
}

async function ensureSqliteFontSchema() {
  await query(`CREATE TABLE IF NOT EXISTS fonts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    css_stack TEXT NOT NULL,
    stylesheet_url TEXT NULL,
    preview_text TEXT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);
  await query('CREATE UNIQUE INDEX IF NOT EXISTS uniq_fonts_code ON fonts (code)');
  await query('CREATE INDEX IF NOT EXISTS idx_fonts_status_sort ON fonts (status, sort_order, name)');
  await query('ALTER TABLE users ADD COLUMN chat_font_id INTEGER NULL').catch((error) => {
    if (!/duplicate column|already exists/i.test(String(error?.message || ''))) throw error;
  });
  await query('CREATE INDEX IF NOT EXISTS idx_users_chat_font ON users (chat_font_id)');
}

async function seedDefaultFonts() {
  const defaults = [
    {
      code: 'inter-ui',
      name: 'Inter · 默认界面字体',
      cssStack: '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI", sans-serif',
      stylesheetUrl: 'https://fonts.xuejourney.xin/css2?family=Inter:wght@400;500;600;700;800&display=swap',
      previewText: 'Inter 适合清楚、现代的对话阅读。',
      sortOrder: 10,
    },
    {
      code: 'system-sans-cn',
      name: '系统黑体 · 中文优先',
      cssStack: '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI", sans-serif',
      stylesheetUrl: null,
      previewText: '系统中文黑体更稳，加载也更轻。',
      sortOrder: 20,
    },
    {
      code: 'system-serif-cn',
      name: '系统宋体 · 叙事阅读',
      cssStack: '"Songti SC", "SimSun", "Noto Serif CJK SC", serif',
      stylesheetUrl: null,
      previewText: '系统宋体更像小说正文，适合慢慢读。',
      sortOrder: 30,
    },
    {
      code: 'jetbrains-mono',
      name: 'JetBrains Mono · 等宽风格',
      cssStack: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
      stylesheetUrl: 'https://fonts.xuejourney.xin/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
      previewText: 'JetBrains Mono 会让对话带一点终端和手稿感。',
      sortOrder: 40,
    },
  ];

  for (const item of defaults) {
    const rows = await query('SELECT id FROM fonts WHERE code = ? LIMIT 1', [item.code]);
    if (rows.length) continue;
    await query(
      `INSERT INTO fonts (code, name, css_stack, stylesheet_url, preview_text, status, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())`,
      [item.code, item.name, item.cssStack, item.stylesheetUrl, item.previewText, item.sortOrder],
    );
  }
}

async function ensureFontSchema() {
  if (fontSchemaPromise) return fontSchemaPromise;
  fontSchemaPromise = (async () => {
    await waitReady();
    if (getDbType() === 'mysql') {
      await ensureMysqlFontSchema();
    } else {
      await ensureSqliteFontSchema();
    }
    await seedDefaultFonts();
  })().catch((error) => {
    fontSchemaPromise = null;
    throw error;
  });
  return fontSchemaPromise;
}

function normalizeFontRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    code: row.code,
    name: row.name,
    css_stack: row.css_stack,
    css_declaration: escapeCssDeclarationValue(row.css_stack),
    stylesheet_url: row.stylesheet_url || null,
    preview_text: row.preview_text || DEFAULT_FONT_PREVIEW,
    status: row.status || 'active',
    sort_order: Number(row.sort_order || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function escapeCssDeclarationValue(value) {
  return validateFontStack(value).replace(/\\/g, '\\\\').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function listFontsForAdmin() {
  await ensureFontSchema();
  const rows = await query('SELECT * FROM fonts ORDER BY sort_order ASC, name ASC, id ASC');
  return rows.map(normalizeFontRow);
}

async function listActiveFonts() {
  await ensureFontSchema();
  const rows = await query("SELECT * FROM fonts WHERE status = 'active' ORDER BY sort_order ASC, name ASC, id ASC");
  return rows.map(normalizeFontRow);
}

async function getFontById(fontId) {
  await ensureFontSchema();
  const rows = await query('SELECT * FROM fonts WHERE id = ? LIMIT 1', [Number(fontId || 0)]);
  return normalizeFontRow(rows[0] || null);
}

async function getActiveFontById(fontId) {
  const font = await getFontById(fontId);
  return font && font.status === 'active' ? font : null;
}

async function createFont(payload) {
  await ensureFontSchema();
  const font = normalizeFontPayload(payload);
  const result = await query(
    `INSERT INTO fonts (code, name, css_stack, stylesheet_url, preview_text, status, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [font.code, font.name, font.cssStack, font.stylesheetUrl, font.previewText, font.status, font.sortOrder],
  );
  return result.insertId;
}

async function updateFont(fontId, payload) {
  await ensureFontSchema();
  const id = Number(fontId || 0);
  if (!id) {
    const error = new Error('字体 ID 无效。');
    error.statusCode = 400;
    throw error;
  }
  const font = normalizeFontPayload(payload);
  const result = await query(
    `UPDATE fonts
     SET code = ?, name = ?, css_stack = ?, stylesheet_url = ?, preview_text = ?, status = ?, sort_order = ?, updated_at = NOW()
     WHERE id = ?`,
    [font.code, font.name, font.cssStack, font.stylesheetUrl, font.previewText, font.status, font.sortOrder, id],
  );
  if (Number(result.affectedRows || 0) === 0) {
    const error = new Error('字体不存在。');
    error.statusCode = 404;
    throw error;
  }
}

async function deleteFont(fontId) {
  await ensureFontSchema();
  const id = Number(fontId || 0);
  if (!id) {
    const error = new Error('字体 ID 无效。');
    error.statusCode = 400;
    throw error;
  }
  await query('UPDATE users SET chat_font_id = NULL, updated_at = NOW() WHERE chat_font_id = ?', [id]);
  await query('DELETE FROM fonts WHERE id = ?', [id]);
}

async function updateUserChatFontPreference(userId, fontId) {
  await ensureFontSchema();
  const normalizedUserId = Number(userId || 0);
  const normalizedFontId = Number(fontId || 0) || null;
  if (normalizedFontId) {
    const font = await getActiveFontById(normalizedFontId);
    if (!font) {
      const error = new Error('请选择有效的字体。');
      error.statusCode = 400;
      throw error;
    }
  }
  await query('UPDATE users SET chat_font_id = ?, updated_at = NOW() WHERE id = ?', [normalizedFontId, normalizedUserId]);
}

async function getActiveFontStylesheetUrls() {
  const fonts = await listActiveFonts();
  return [...new Set(fonts.map((font) => font.stylesheet_url).filter(Boolean))];
}

module.exports = {
  DEFAULT_CHAT_FONT_ID,
  DEFAULT_FONT_PREVIEW,
  ensureFontSchema,
  listFontsForAdmin,
  listActiveFonts,
  getFontById,
  getActiveFontById,
  createFont,
  updateFont,
  deleteFont,
  updateUserChatFontPreference,
  getActiveFontStylesheetUrls,
  escapeCssDeclarationValue,
};
