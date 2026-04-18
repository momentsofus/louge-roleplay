/**
 * @file scripts/init-db.js
 * @description 初始化 MySQL 数据库与核心业务表结构，供项目首次部署使用。
 */

const mysql = require('mysql2/promise');
const config = require('../src/config');

async function main() {
  if (!config.databaseAdminUrl || !config.databaseUrl) {
    throw new Error('DATABASE_ADMIN_URL and DATABASE_URL are required');
  }

  const adminConnection = await mysql.createConnection(config.databaseAdminUrl);
  await adminConnection.query('CREATE DATABASE IF NOT EXISTS `SL` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await adminConnection.end();

  const connection = await mysql.createConnection(config.databaseUrl);

  async function ensureColumn(tableName, columnName, definitionSql) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, columnName],
    );

    if (Number(rows[0].count || 0) === 0) {
      await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${definitionSql}`);
    }
  }

  async function ensureIndex(tableName, indexName, indexSql) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [tableName, indexName],
    );

    if (Number(rows[0].count || 0) === 0) {
      await connection.query(`ALTER TABLE ${tableName} ADD INDEX ${indexName} ${indexSql}`);
    }
  }

  async function ensureUniqueIndex(tableName, indexName, columnName) {
    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [tableName, indexName],
    );

    if (Number(rows[0].count || 0) === 0) {
      await connection.query(`ALTER TABLE ${tableName} ADD UNIQUE INDEX ${indexName} (${columnName})`);
    }
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      nickname VARCHAR(80) NULL,
      email VARCHAR(120) NULL,
      phone VARCHAR(30) NULL,
      country_type ENUM('domestic','international') NOT NULL DEFAULT 'domestic',
      email_verified TINYINT(1) NOT NULL DEFAULT 0,
      phone_verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await ensureColumn('users', 'email', 'email VARCHAR(120) NULL');
  await ensureColumn('users', 'phone', 'phone VARCHAR(30) NULL');
  await ensureColumn('users', 'country_type', "country_type ENUM('domestic','international') NOT NULL DEFAULT 'domestic'");
  await ensureColumn('users', 'email_verified', 'email_verified TINYINT(1) NOT NULL DEFAULT 0');
  await ensureColumn('users', 'phone_verified', 'phone_verified TINYINT(1) NOT NULL DEFAULT 0');
  await ensureUniqueIndex('users', 'uniq_users_email', 'email');
  await ensureUniqueIndex('users', 'uniq_users_phone', 'phone');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS characters (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      name VARCHAR(100) NOT NULL,
      summary VARCHAR(500) NOT NULL,
      personality TEXT NULL,
      first_message TEXT NULL,
      visibility ENUM('public','private','unlisted') DEFAULT 'public',
      status ENUM('draft','published','blocked') DEFAULT 'published',
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      CONSTRAINT fk_characters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT NOT NULL,
      character_id BIGINT NOT NULL,
      parent_conversation_id BIGINT NULL,
      branched_from_message_id BIGINT NULL,
      current_message_id BIGINT NULL,
      title VARCHAR(200) NULL,
      status ENUM('active','archived','deleted') DEFAULT 'active',
      last_message_at DATETIME NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_conversations_character FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await ensureColumn('conversations', 'parent_conversation_id', 'parent_conversation_id BIGINT NULL');
  await ensureColumn('conversations', 'branched_from_message_id', 'branched_from_message_id BIGINT NULL');
  await ensureColumn('conversations', 'current_message_id', 'current_message_id BIGINT NULL');
  await ensureIndex('conversations', 'idx_conversations_parent', '(parent_conversation_id)');
  await ensureIndex('conversations', 'idx_conversations_branch_message', '(branched_from_message_id)');
  await ensureIndex('conversations', 'idx_conversations_current_message', '(current_message_id)');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      conversation_id BIGINT NOT NULL,
      sender_type ENUM('user','character','system') NOT NULL,
      content LONGTEXT NOT NULL,
      sequence_no INT NOT NULL,
      parent_message_id BIGINT NULL,
      branch_from_message_id BIGINT NULL,
      edited_from_message_id BIGINT NULL,
      prompt_kind ENUM('normal','regenerate','branch','edit','optimized') NOT NULL DEFAULT 'normal',
      metadata_json JSON NULL,
      status ENUM('success','failed','streaming') DEFAULT 'success',
      created_at DATETIME NOT NULL,
      CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      INDEX idx_messages_conversation_sequence (conversation_id, sequence_no)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await ensureColumn('messages', 'parent_message_id', 'parent_message_id BIGINT NULL');
  await ensureColumn('messages', 'branch_from_message_id', 'branch_from_message_id BIGINT NULL');
  await ensureColumn('messages', 'edited_from_message_id', 'edited_from_message_id BIGINT NULL');
  await ensureColumn('messages', 'prompt_kind', "prompt_kind ENUM('normal','regenerate','branch','edit','optimized') NOT NULL DEFAULT 'normal'");
  await ensureColumn('messages', 'metadata_json', 'metadata_json JSON NULL');
  await ensureIndex('messages', 'idx_messages_parent', '(parent_message_id)');
  await ensureIndex('messages', 'idx_messages_branch_from', '(branch_from_message_id)');
  await ensureIndex('messages', 'idx_messages_edited_from', '(edited_from_message_id)');

  await connection.end();
  console.log('Database initialization completed successfully.');
}

main().catch((error) => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});
