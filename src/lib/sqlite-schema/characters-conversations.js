/**
 * @file src/lib/sqlite-schema/characters-conversations.js
 * @description 角色、互动事件、会话与消息表结构。
 */

'use strict';


function ensureSqliteCharactersVisibilityColumn(db) {
  const columns = db.prepare("PRAGMA table_info(characters)").all();
  const hasVisibility = columns.some((column) => String(column.name || '').trim() === 'visibility');
  if (!hasVisibility) {
    db.exec("ALTER TABLE characters ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'");
  }
}


function ensureSqliteColumn(db, tableName, columnName, definitionSql) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => String(column.name || '').trim() === columnName);
  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definitionSql}`);
  }
}

function ensureSqliteCharacterConversationSchema(db) {
// ─── 角色表 ──────────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER NOT NULL,
      name                TEXT NOT NULL,
      summary             TEXT NOT NULL,
      personality         TEXT NULL,
      first_message       TEXT NULL,
      prompt_profile_json TEXT NULL,
      visibility          TEXT NOT NULL DEFAULT 'public',
      status              TEXT NOT NULL DEFAULT 'published',
      created_at          TEXT NOT NULL,
      updated_at          TEXT NOT NULL,
      avatar_image_path   TEXT NULL,
      background_image_path TEXT NULL,
      is_nsfw             INTEGER NOT NULL DEFAULT 0,
      source_type         TEXT NULL,
      source_format       TEXT NULL,
      source_file_name    TEXT NULL,
      source_file_hash    TEXT NULL,
      source_card_json    TEXT NULL,
      imported_world_book_json TEXT NULL,
      flattened_world_book_text TEXT NULL,
      import_batch_id     INTEGER NULL,
      like_count          INTEGER NOT NULL DEFAULT 0,
      comment_count       INTEGER NOT NULL DEFAULT 0,
      usage_count         INTEGER NOT NULL DEFAULT 0
    )
  `);

  // ─── 会话表 ──────────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id                 INTEGER NOT NULL,
      character_id            INTEGER NOT NULL,
      parent_conversation_id  INTEGER NULL,
      branched_from_message_id INTEGER NULL,
      current_message_id      INTEGER NULL,
      selected_model_mode     TEXT NOT NULL DEFAULT 'standard',
      title                   TEXT NULL,
      status                  TEXT NOT NULL DEFAULT 'active',
      deleted_at              TEXT NULL,
      last_message_at         TEXT NULL,
      created_at              TEXT NOT NULL,
      updated_at              TEXT NOT NULL
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations (user_id, updated_at)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_conversations_user_status_updated ON conversations (user_id, status, updated_at, id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_conversations_character_status ON conversations (character_id, status, id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_conversations_parent ON conversations (parent_conversation_id)');

  ensureSqliteCharactersVisibilityColumn(db);
  ensureSqliteColumn(db, 'characters', 'status', "status TEXT NOT NULL DEFAULT 'published'");
  ensureSqliteColumn(db, 'characters', 'avatar_image_path', 'avatar_image_path TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'background_image_path', 'background_image_path TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'is_nsfw', 'is_nsfw INTEGER NOT NULL DEFAULT 0');
  ensureSqliteColumn(db, 'characters', 'source_type', 'source_type TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'source_format', 'source_format TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'source_file_name', 'source_file_name TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'source_file_hash', 'source_file_hash TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'source_card_json', 'source_card_json TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'imported_world_book_json', 'imported_world_book_json TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'flattened_world_book_text', 'flattened_world_book_text TEXT NULL');
  ensureSqliteColumn(db, 'characters', 'import_batch_id', 'import_batch_id INTEGER NULL');
  ensureSqliteColumn(db, 'characters', 'like_count', 'like_count INTEGER NOT NULL DEFAULT 0');
  ensureSqliteColumn(db, 'characters', 'comment_count', 'comment_count INTEGER NOT NULL DEFAULT 0');
  ensureSqliteColumn(db, 'characters', 'usage_count', 'usage_count INTEGER NOT NULL DEFAULT 0');
  db.exec('CREATE INDEX IF NOT EXISTS idx_characters_public_nsfw ON characters (visibility, status, is_nsfw, id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_characters_public_heat ON characters (visibility, status, is_nsfw, like_count, comment_count, usage_count, id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_characters_user_status ON characters (user_id, status, id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_characters_source_file_hash ON characters (source_file_hash)');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NULL,
      color TEXT NULL,
      icon TEXT NULL,
      is_nsfw INTEGER NOT NULL DEFAULT 0,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS uniq_tags_slug ON tags (slug)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_tags_enabled_sort ON tags (is_enabled, sort_order, name)');
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_tags (
      character_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (character_id, tag_id)
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_character_tags_tag ON character_tags (tag_id, character_id)');
  db.exec(`
    CREATE TABLE IF NOT EXISTS import_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user_id INTEGER NULL,
      total_count INTEGER NOT NULL DEFAULT 0,
      success_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      skipped_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      options_json TEXT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS import_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_hash TEXT NULL,
      status TEXT NOT NULL,
      error_message TEXT NULL,
      parsed_role_name TEXT NULL,
      created_role_id INTEGER NULL,
      raw_json TEXT NULL,
      created_at TEXT NOT NULL
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_import_items_batch ON import_items (batch_id, id)');
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS uniq_character_like_user ON character_likes (character_id, user_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_character_likes_character ON character_likes (character_id)');
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'visible',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_character_comments_character ON character_comments (character_id, status, id)');
  db.exec(`
    CREATE TABLE IF NOT EXISTS character_usage_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_character_usage_character ON character_usage_events (character_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_character_usage_user ON character_usage_events (user_id, created_at)');
  ensureSqliteColumn(db, 'conversations', 'parent_conversation_id', 'parent_conversation_id INTEGER NULL');
  ensureSqliteColumn(db, 'conversations', 'branched_from_message_id', 'branched_from_message_id INTEGER NULL');
  ensureSqliteColumn(db, 'conversations', 'current_message_id', 'current_message_id INTEGER NULL');
  ensureSqliteColumn(db, 'conversations', 'selected_model_mode', "selected_model_mode TEXT NOT NULL DEFAULT 'standard'");
  ensureSqliteColumn(db, 'conversations', 'deleted_at', 'deleted_at TEXT NULL');
  ensureSqliteColumn(db, 'conversations', 'last_message_at', 'last_message_at TEXT NULL');

  // ─── 消息表 ──────────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id       INTEGER NOT NULL,
      sender_type           TEXT NOT NULL,
      content               TEXT NOT NULL,
      sequence_no           INTEGER NOT NULL,
      parent_message_id     INTEGER NULL,
      branch_from_message_id INTEGER NULL,
      edited_from_message_id INTEGER NULL,
      prompt_kind           TEXT NOT NULL DEFAULT 'normal',
      metadata_json         TEXT NULL,
      status                TEXT NOT NULL DEFAULT 'success',
      deleted_at            TEXT NULL,
      created_at            TEXT NOT NULL
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, sequence_no)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_conversation_deleted_id ON messages (conversation_id, deleted_at, id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_conversation_deleted_sequence ON messages (conversation_id, deleted_at, sequence_no, id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages (parent_message_id)');
  ensureSqliteColumn(db, 'messages', 'deleted_at', 'deleted_at TEXT NULL');
}

module.exports = { ensureSqliteCharacterConversationSchema };
