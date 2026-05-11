#!/usr/bin/env node
/**
 * @file scripts/test-conversation-service.js
 * @description Conversation service regression tests for linear chat refactor behavior.
 */
'use strict';

const assert = require('node:assert/strict');
const { query } = require('../src/lib/db');
const {
  createConversation,
  addMessage,
  addMessagesAtomically,
  cloneConversationBranch,
  getConversationById,
  getConversationMessageCount,
  fetchPathMessages,
  buildConversationPathView,
  resolveConversationLeafId,
  deleteMessageSafely,
} = require('../src/services/conversation-service');
const { buildChatRequestContext, renderChatPage } = require('../src/server-helpers/chat-view');

async function main() {
  const suffix = Date.now();
  const userRow = await query(
    `INSERT INTO users (public_id, username, password_hash, role, status, created_at, updated_at)
     VALUES (?, ?, 'test', 'user', 'active', NOW(), NOW())`,
    [`8${String(suffix).slice(-8)}`, `conversation_service_test_${suffix}`],
  );
  const userId = userRow.insertId;
  const characterRow = await query(
    `INSERT INTO characters (user_id, name, summary, visibility, status, created_at, updated_at)
     VALUES (?, ?, 'conversation service regression character', 'private', 'published', NOW(), NOW())`,
    [userId, `会话服务测试角色 ${suffix}`],
  );
  const characterId = characterRow.insertId;
  const conversationIds = [];
  let sourceConversationId = null;

  try {
    sourceConversationId = await createConversation(userId, characterId, {
      title: 'source conversation',
      selectedModelMode: 'force_jailbreak',
    });
    const firstUserMessageId = await addMessage({
      conversationId: sourceConversationId,
      senderType: 'user',
      content: 'hello',
      promptKind: 'normal',
    });
    const firstReplyMessageId = await addMessage({
      conversationId: sourceConversationId,
      senderType: 'character',
      content: 'hi',
      parentMessageId: firstUserMessageId,
      promptKind: 'normal',
    });
    const [editedUserMessageId, editedReplyMessageId] = await addMessagesAtomically(sourceConversationId, [
      {
        senderType: 'user',
        content: 'edited hello',
        parentMessageId: null,
        branchFromMessageId: firstUserMessageId,
        editedFromMessageId: firstUserMessageId,
        promptKind: 'edit',
      },
      {
        senderType: 'character',
        content: 'edited hi',
        parentMessageId: '__previous__',
        branchFromMessageId: '__previous__',
        promptKind: 'edit',
      },
    ]);
    assert.ok(editedUserMessageId > firstReplyMessageId, 'atomic edit should insert edited user message');
    assert.ok(editedReplyMessageId > editedUserMessageId, 'atomic edit should insert edited reply message');
    const atomicEditConversation = await getConversationById(sourceConversationId, userId);
    assert.equal(Number(atomicEditConversation.current_message_id), Number(editedReplyMessageId), 'atomic edit should move current leaf to generated reply');
    const atomicEditPath = await fetchPathMessages(sourceConversationId, editedReplyMessageId);
    assert.deepEqual(atomicEditPath.map((message) => message.content), ['edited hello', 'edited hi'], 'atomic edit path should chain edited input to generated reply');

    const branchView = await buildConversationPathView(sourceConversationId, editedReplyMessageId);
    const rootBranchMessage = branchView.pathMessages.find((message) => Number(message.id) === Number(editedUserMessageId));
    assert.equal(rootBranchMessage.siblingCount, 2, 'edited user variant should expose root sibling branches');
    assert.deepEqual(rootBranchMessage.siblingVariants.map((variant) => variant.id), [firstUserMessageId, editedUserMessageId], 'sibling branch choices should preserve creation order');
    assert.equal(await resolveConversationLeafId(sourceConversationId, firstUserMessageId), firstReplyMessageId, 'switching to an old branch should resolve to its latest descendant leaf');

    const deleteBranchConversationId = await createConversation(userId, characterId, {
      title: 'delete branch fallback conversation',
      selectedModelMode: 'standard',
    });
    conversationIds.push(deleteBranchConversationId);
    const deleteRootMessageId = await addMessage({
      conversationId: deleteBranchConversationId,
      senderType: 'user',
      content: 'delete branch root',
      promptKind: 'normal',
    });
    const deleteFirstReplyId = await addMessage({
      conversationId: deleteBranchConversationId,
      senderType: 'character',
      content: 'delete first reply',
      parentMessageId: deleteRootMessageId,
      promptKind: 'normal',
    });
    const deleteSecondReplyId = await addMessage({
      conversationId: deleteBranchConversationId,
      senderType: 'character',
      content: 'delete second reply',
      parentMessageId: deleteRootMessageId,
      branchFromMessageId: deleteFirstReplyId,
      editedFromMessageId: deleteFirstReplyId,
      promptKind: 'regenerate',
    });
    const deleteFirstReplyChildId = await addMessage({
      conversationId: deleteBranchConversationId,
      senderType: 'user',
      content: 'continue first branch',
      parentMessageId: deleteFirstReplyId,
      promptKind: 'normal',
    });
    const deleteFirstReplyLeafId = await addMessage({
      conversationId: deleteBranchConversationId,
      senderType: 'character',
      content: 'continued first branch reply',
      parentMessageId: deleteFirstReplyChildId,
      promptKind: 'normal',
    });
    const deleteResult = await deleteMessageSafely(deleteBranchConversationId, deleteSecondReplyId, userId);
    assert.equal(Number(deleteResult.fallbackMessageId), Number(deleteFirstReplyLeafId), 'deleting active branch leaf should fall back to sibling branch leaf before parent');
    const deleteFallbackConversation = await getConversationById(deleteBranchConversationId, userId);
    assert.equal(Number(deleteFallbackConversation.current_message_id), Number(deleteFirstReplyLeafId), 'conversation current leaf should switch to sibling branch leaf after deleting current branch');

    let oldLeafMessageId = firstReplyMessageId;

    const cloneResult = await cloneConversationBranch({
      userId,
      characterId,
      sourceConversationId,
      sourceLeafMessageId: firstReplyMessageId,
      selectedModelMode: 'force_jailbreak',
      title: 'cloned conversation',
    });
    const clonedConversationId = cloneResult.conversationId;
    conversationIds.push(clonedConversationId);

    const clonedConversation = await getConversationById(clonedConversationId, userId);
    assert.ok(clonedConversation, 'cloned conversation should be visible to owner');
    assert.equal(clonedConversation.selected_model_mode, 'force_jailbreak', 'clone should preserve selected model mode');
    assert.equal(Number(clonedConversation.current_message_id), Number(cloneResult.leafMessageId), 'clone current leaf should point to cloned leaf');

    const fallbackConversationId = await createConversation(userId, characterId, {
      title: 'fallback model conversation',
      selectedModelMode: 'standard',
    });
    conversationIds.push(fallbackConversationId);
    const fallbackConversation = await getConversationById(fallbackConversationId, userId);
    assert.ok(fallbackConversation, 'fallback conversation should be visible to owner');
    assert.notEqual(fallbackConversation.selected_model_mode, '', 'model fallback should keep a non-empty mode');

    for (let i = 1; i <= 30; i += 1) {
      const oldUserMessageId = await addMessage({
        conversationId: sourceConversationId,
        senderType: 'user',
        content: `OLD_CONVERSATION_SECRET_${i}`,
        parentMessageId: oldLeafMessageId,
        promptKind: 'normal',
      });
      oldLeafMessageId = await addMessage({
        conversationId: sourceConversationId,
        senderType: 'character',
        content: `OLD_CONVERSATION_REPLY_${i}`,
        parentMessageId: oldUserMessageId,
        promptKind: 'normal',
      });
    }

    const freshConversationId = await createConversation(userId, characterId, {
      title: 'fresh same-character conversation',
      selectedModelMode: 'standard',
    });
    conversationIds.push(freshConversationId);
    const freshConversation = await getConversationById(freshConversationId, userId);
    assert.ok(freshConversation, 'fresh conversation should be visible to owner');
    assert.equal(await getConversationMessageCount(freshConversationId), 0, 'new conversation should start with no copied messages');

    const firstFreshRequest = await buildChatRequestContext(
      { session: { user: { id: userId, username: 'conversation-service-test' } } },
      freshConversation,
      'hello fresh thread',
      null,
    );
    assert.equal(firstFreshRequest.isFirstTurn, true, 'fresh conversation should be treated as first turn');
    assert.deepEqual(firstFreshRequest.history, [], 'fresh conversation prompt history should be empty before seed messages');

    const seedUserMessageId = await addMessage({
      conversationId: freshConversationId,
      senderType: 'user',
      content: '[开始一次新的对话]',
      promptKind: 'conversation-start',
    });
    const seedReplyMessageId = await addMessage({
      conversationId: freshConversationId,
      senderType: 'character',
      content: 'fresh greeting only',
      parentMessageId: seedUserMessageId,
      promptKind: 'first-message',
    });
    const seededFreshConversation = await getConversationById(freshConversationId, userId);
    const seededFreshRequest = await buildChatRequestContext(
      { session: { user: { id: userId, username: 'conversation-service-test' } } },
      seededFreshConversation,
      'continue fresh thread',
      seedReplyMessageId,
    );
    const freshHistoryText = seededFreshRequest.history.map((message) => message.content).join('\n');
    assert.ok(freshHistoryText.includes('fresh greeting only'), 'seeded fresh history should include its own first message');
    assert.ok(!freshHistoryText.includes('OLD_CONVERSATION_SECRET_'), 'fresh prompt history must not include previous conversation user messages');
    assert.ok(!freshHistoryText.includes('OLD_CONVERSATION_REPLY_'), 'fresh prompt history must not include previous conversation assistant messages');

    const oldPath = await fetchPathMessages(sourceConversationId, oldLeafMessageId);
    const freshPath = await fetchPathMessages(freshConversationId, seedReplyMessageId);
    assert.equal(oldPath.length, 62, 'old long conversation should keep its own path');
    assert.equal(freshPath.length, 2, 'fresh conversation should only have its own seed path');

    const renderUserPreferenceConversationId = await createConversation(userId, characterId, {
      title: 'visible preference conversation',
      selectedModelMode: 'standard',
    });
    conversationIds.push(renderUserPreferenceConversationId);
    let renderLeafMessageId = null;
    for (let i = 1; i <= 12; i += 1) {
      renderLeafMessageId = await addMessage({
        conversationId: renderUserPreferenceConversationId,
        senderType: i % 2 ? 'user' : 'character',
        content: `visible message ${i}`,
        parentMessageId: renderLeafMessageId,
        promptKind: 'normal',
      });
    }
    const renderPreferenceConversation = await getConversationById(renderUserPreferenceConversationId, userId);
    const renderPayload = await new Promise((resolve, reject) => {
      const req = {
        query: {},
        session: { user: { id: userId, username: 'conversation-service-test', chat_visible_message_count: 8 } },
        t: (key) => key,
      };
      const res = {
        locals: {},
      };
      renderChatPage(req, res, renderPreferenceConversation, {
        getChatModelSelector: async () => ({ options: [] }),
        renderPage: (_res, view, params) => {
          try {
            resolve({ view, params });
          } catch (error) {
            reject(error);
          }
        },
      }).catch(reject);
    });
    assert.equal(renderPayload.view, 'chat', 'renderChatPage should render chat view');
    assert.equal(renderPayload.params.view.initialVisibleCount, 8, 'chat visible preference should default to 8');
    assert.equal(renderPayload.params.view.visiblePathMessages.length, 8, 'chat page should initially render latest 8 messages');
    assert.equal(renderPayload.params.view.visiblePathMessages[0].content, 'visible message 5', 'initial render should keep the latest messages only');

    console.log('Conversation service regression test passed.');
  } finally {
    for (const conversationId of conversationIds) {
      await query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
      await query('DELETE FROM conversations WHERE id = ?', [conversationId]);
    }
    if (sourceConversationId) {
      await query('DELETE FROM messages WHERE conversation_id = ?', [sourceConversationId]);
      await query('DELETE FROM conversations WHERE id = ?', [sourceConversationId]);
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
