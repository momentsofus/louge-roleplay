#!/usr/bin/env node
/**
 * @file scripts/backfill-character-stats.js
 * @description 从明细表回填 characters 上的公开统计缓存字段，供列表/首页快速排序。
 */

'use strict';

const { waitReady, query, getDbType } = require('../src/lib/db');

async function main() {
  try {
    await waitReady();
    const dbType = getDbType();

    if (dbType === 'mysql') {
      await query(`
        UPDATE characters c
        LEFT JOIN (
          SELECT character_id, COUNT(*) AS count FROM character_likes GROUP BY character_id
        ) likes ON likes.character_id = c.id
        LEFT JOIN (
          SELECT character_id, COUNT(*) AS count FROM character_comments WHERE status = 'visible' GROUP BY character_id
        ) comments ON comments.character_id = c.id
        LEFT JOIN (
          SELECT character_id, COUNT(*) AS count FROM character_usage_events GROUP BY character_id
        ) usage_events ON usage_events.character_id = c.id
        SET c.like_count = COALESCE(likes.count, 0),
            c.comment_count = COALESCE(comments.count, 0),
            c.usage_count = COALESCE(usage_events.count, 0)
      `);
    } else {
      await query(`
        UPDATE characters
        SET like_count = (SELECT COUNT(*) FROM character_likes WHERE character_likes.character_id = characters.id),
            comment_count = (SELECT COUNT(*) FROM character_comments WHERE character_comments.character_id = characters.id AND status = 'visible'),
            usage_count = (SELECT COUNT(*) FROM character_usage_events WHERE character_usage_events.character_id = characters.id)
      `);
    }

    console.log(`[backfill-character-stats] completed on ${dbType}`);
  } finally {
    // db.js 持有 MySQL 连接池，单次脚本完成后显式退出，避免 npm 串行任务被空闲连接挂住。
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('[backfill-character-stats] failed:', error);
  process.exitCode = 1;
  process.exit(1);
});
