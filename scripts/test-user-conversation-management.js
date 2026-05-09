#!/usr/bin/env node
/**
 * @file scripts/test-user-conversation-management.js
 * @description Regression tests for user-side conversation management filters and batch actions.
 */
'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const ejs = require('ejs');
const { query } = require('../src/lib/db');
const {
  createConversation,
  addMessage,
  listUserConversations,
  listUserConversationsForManagement,
  bulkArchiveUserConversations,
  bulkRestoreUserConversations,
  bulkSoftDeleteUserConversations,
} = require('../src/services/conversation-service');

async function main() {
  const suffix = Date.now();
  const userRow = await query(
    `INSERT INTO users (public_id, username, password_hash, role, status, created_at, updated_at)
     VALUES (?, ?, 'test', 'user', 'active', NOW(), NOW())`,
    [`7${String(suffix).slice(-8)}`, `conversation_management_test_${suffix}`],
  );
  const userId = userRow.insertId;
  const characterRow = await query(
    `INSERT INTO characters (user_id, name, summary, visibility, status, created_at, updated_at)
     VALUES (?, ?, 'conversation management regression character', 'private', 'published', NOW(), NOW())`,
    [userId, `会话管理测试角色 ${suffix}`],
  );
  const characterId = characterRow.insertId;
  const conversationIds = [];

  try {
    for (let i = 1; i <= 4; i += 1) {
      const id = await createConversation(userId, characterId, {
        title: `管理测试会话 ${i}`,
        selectedModelMode: 'standard',
      });
      conversationIds.push(id);
      await addMessage({ conversationId: id, senderType: 'user', content: `hello ${i}`, promptKind: 'normal' });
    }

    const dashboardList = await listUserConversations(userId);
    assert.equal(dashboardList.length, 4, 'dashboard list should expose active conversations for stats');

    const page = await listUserConversationsForManagement(userId, { search: '管理测试', page: 1, pageSize: 2, status: 'active' });
    assert.equal(page.total, 4, 'management search should find all matching conversations');
    assert.equal(page.conversations.length, 2, 'management page should paginate');
    assert.equal(page.totalPages, 2, 'management page should report total pages');
    assert.ok(page.filterOptions.characters.some((item) => Number(item.id) === Number(characterId)), 'filter options should include active character');

    const t = (key) => key;
    const renderedListHtml = await ejs.renderFile(path.join(process.cwd(), 'src/views/conversations.ejs'), {
      conversationResult: page,
      filters: page.filters,
      notice: '',
      originalUrl: '/conversations?q=管理测试&pageSize=2',
      locale: 'zh-CN',
      locals: { viewModel: { formatNumber: (value) => Number(value || 0).toLocaleString('zh-CN') } },
      viewModel: { formatNumber: (value) => Number(value || 0).toLocaleString('zh-CN') },
      cspNonce: 'test-nonce',
      t,
      buildPageUrl: (targetPage) => `/conversations?q=管理测试&page=${targetPage}&pageSize=2`,
    });
    assert.ok(renderedListHtml.includes('会话管理'), 'conversation management page should render title');
    assert.ok(renderedListHtml.includes('全部对话'), 'conversation management page should render list panel');
    assert.ok(renderedListHtml.includes('管理测试会话'), 'conversation management page should render conversation cards');

    const archived = await bulkArchiveUserConversations(userId, conversationIds.slice(0, 2));
    assert.equal(archived.affected, 2, 'bulk archive should affect selected active conversations');
    const afterArchiveDashboardList = await listUserConversations(userId);
    assert.equal(afterArchiveDashboardList.length, 4, 'dashboard list should include archived but not deleted conversations');
    const archivedPage = await listUserConversationsForManagement(userId, { status: 'archived', page: 1, pageSize: 10 });
    assert.equal(archivedPage.total, 2, 'archived filter should show archived conversations');

    const restored = await bulkRestoreUserConversations(userId, conversationIds.slice(0, 1));
    assert.equal(restored.affected, 1, 'bulk restore should restore archived conversations');
    const deleted = await bulkSoftDeleteUserConversations(userId, conversationIds.slice(2, 4));
    assert.equal(deleted.affected, 2, 'bulk delete should soft-delete selected conversations');
    const deletedPage = await listUserConversationsForManagement(userId, { status: 'deleted', page: 1, pageSize: 10 });
    assert.equal(deletedPage.total, 2, 'deleted filter should show deleted conversations');

    console.log('User conversation management regression test passed.');
  } finally {
    for (const conversationId of conversationIds) {
      await query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
      await query('DELETE FROM conversations WHERE id = ?', [conversationId]);
    }
    await query('DELETE FROM characters WHERE id = ?', [characterId]);
    await query('DELETE FROM users WHERE id = ?', [userId]);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
