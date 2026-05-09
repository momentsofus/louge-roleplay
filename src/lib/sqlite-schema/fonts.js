/**
 * @file src/lib/sqlite-schema/fonts.js
 * @description SQLite 字体管理表结构。
 */

'use strict';

function ensureSqliteFontsSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS fonts (
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
    )
  `);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS uniq_fonts_code ON fonts (code)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_fonts_status_sort ON fonts (status, sort_order, name)');
}

module.exports = { ensureSqliteFontsSchema };
