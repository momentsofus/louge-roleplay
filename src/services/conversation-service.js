/**
 * @file src/services/conversation-service.js
 * @description
 * 会话与消息持久化服务。
 *
 * 目标：
 * 1. 使用 parent_message_id 保存消息之间的衔接关系。
 * 2. 支持重新生成、编辑后重发、从较早位置重写后续。
 * 3. 支持把某个位置之前的内容复制成独立对话。
 * 4. 聊天页优先读取当前显示链；完整消息列表只保留给独立对话复制/诊断脚本。
 */

const { query, withTransaction } = require('../lib/db');
const { getActiveSubscriptionForUser, getSubscriptionModelConfig } = require('./plan-service');
const {
  buildPathMessages,
  decoratePathMessages,
  shortText,
} = require('./conversation/message-view');
const { fetchPathMessages } = require('./conversation/path-repository');
const { normalizeMessagePromptKind } = require('./conversation/validators');
const {
  invalidateConversationCache,
  readMessageListCache,
  writeMessageListCache,
  readMessageCountCache,
  writeMessageCountCache,
} = require('./conversation/cache');

async function createConversation(userId, characterId, options = {}) {
  let selectedModelMode = String(options.selectedModelMode || '').trim();
  if (!selectedModelMode || selectedModelMode === 'standard') {
    try {
      const subscription = await getActiveSubscriptionForUser(userId);
      const defaultModel = getSubscriptionModelConfig(subscription, selectedModelMode);
      selectedModelMode = defaultModel?.modelKey || selectedModelMode || 'standard';
    } catch (_) {
      selectedModelMode = selectedModelMode || 'standard';
    }
  }

  const result = await query(
    `INSERT INTO conversations (
      user_id,
      character_id,
      parent_conversation_id,
      branched_from_message_id,
      current_message_id,
      selected_model_mode,
      title,
      status,
      last_message_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, NULL, ?, ?, 'active', NOW(), NOW(), NOW())`,
    [
      userId,
      characterId,
      options.parentConversationId || null,
      options.branchedFromMessageId || null,
      selectedModelMode,
      options.title || '新对话',
    ],
  );
  return result.insertId;
}

async function updateConversationTitle(conversationId, title) {
  await query(
    'UPDATE conversations SET title = ?, updated_at = NOW() WHERE id = ?',
    [title, conversationId],
  );
}

async function updateConversationModelMode(conversationId, selectedModelMode) {
  await query(
    'UPDATE conversations SET selected_model_mode = ?, updated_at = NOW() WHERE id = ?',
    [String(selectedModelMode || 'standard').trim(), conversationId],
  );
}

async function getConversationById(id, userId) {
  const rows = await query(
    `SELECT c.*, ch.name AS character_name, ch.summary AS character_summary, ch.personality, ch.first_message, ch.prompt_profile_json, ch.avatar_image_path, ch.background_image_path
     FROM conversations c
     JOIN characters ch ON ch.id = c.character_id
     WHERE c.id = ? AND c.user_id = ? AND c.status <> 'deleted' AND ch.status <> 'blocked'
     LIMIT 1`,
    [id, userId],
  );
  return rows[0] || null;
}

const {
  listUserConversations,
  listUserConversationsForManagement,
  listUserConversationFilterOptions,
  bulkSoftDeleteUserConversations,
  bulkArchiveUserConversations,
  bulkRestoreUserConversations,
} = require('./conversation/user-conversation-list');
async function fetchMessagesFromDatabase(conversationId, options = {}) {
  const includeDeleted = options.includeDeleted === true;
  const extraWhere = options.extraWhere || '';
  const extraParams = Array.isArray(options.extraParams) ? options.extraParams : [];
  const orderAndLimit = options.orderAndLimit || ' ORDER BY sequence_no ASC, id ASC';

  return query(
    `SELECT
       id,
       conversation_id,
       sender_type,
       content,
       sequence_no,
       status,
       created_at,
       parent_message_id,
       branch_from_message_id,
       edited_from_message_id,
       prompt_kind,
       metadata_json,
       deleted_at
     FROM messages
     WHERE conversation_id = ?${includeDeleted ? '' : ' AND deleted_at IS NULL'}${extraWhere}${orderAndLimit}`,
    [conversationId, ...extraParams],
  );
}

async function listMessages(conversationId) {
  const cached = await readMessageListCache(conversationId);
  if (cached) return cached;

  const rows = await fetchMessagesFromDatabase(conversationId);
  await writeMessageListCache(conversationId, rows);
  return rows;
}

async function getMessageById(conversationId, messageId) {
  const rows = await fetchMessagesFromDatabase(conversationId, { extraWhere: ' AND id = ?', extraParams: [messageId] });
  return rows[0] || null;
}

async function getLatestMessage(conversationId) {
  const rows = await fetchMessagesFromDatabase(conversationId, { orderAndLimit: ' ORDER BY sequence_no DESC, id DESC LIMIT 1' });
  return rows[0] || null;
}

async function getConversationMessageCount(conversationId) {
  const cached = await readMessageCountCache(conversationId);
  if (cached !== null) return cached;

  const rows = await query(
    'SELECT COUNT(*) AS messageCount FROM messages WHERE conversation_id = ? AND deleted_at IS NULL',
    [conversationId],
  );
  const count = Number(rows[0]?.messageCount || 0);
  await writeMessageCountCache(conversationId, count);
  return count;
}

async function addMessage(options) {
  const seqRows = await query(
    'SELECT COALESCE(MAX(sequence_no), 0) AS maxSeq FROM messages WHERE conversation_id = ?',
    [options.conversationId],
  );
  const nextSequence = Number(seqRows[0].maxSeq || 0) + 1;

  const result = await query(
    `INSERT INTO messages (
      conversation_id,
      sender_type,
      content,
      sequence_no,
      status,
      created_at,
      parent_message_id,
      branch_from_message_id,
      edited_from_message_id,
      prompt_kind,
      metadata_json
    ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
    [
      options.conversationId,
      options.senderType,
      options.content,
      nextSequence,
      options.status || 'success',
      options.parentMessageId || null,
      options.branchFromMessageId || null,
      options.editedFromMessageId || null,
      normalizeMessagePromptKind(options.promptKind),
      options.metadataJson || null,
    ],
  );

  await setConversationCurrentMessage(options.conversationId, result.insertId);
  await invalidateConversationCache(options.conversationId);
  return result.insertId;
}


async function addMessagesAtomically(conversationId, messages) {
  const normalizedConversationId = Number(conversationId || 0);
  const items = Array.isArray(messages) ? messages : [];
  if (!normalizedConversationId || !items.length) {
    return [];
  }

  const insertedIds = await withTransaction(async (conn) => {
    const [seqRows] = await conn.execute(
      'SELECT COALESCE(MAX(sequence_no), 0) AS maxSeq FROM messages WHERE conversation_id = ?',
      [normalizedConversationId],
    );
    let nextSequence = Number(seqRows[0]?.maxSeq || 0);
    const ids = [];

    for (const item of items) {
      nextSequence += 1;
      const parentMessageId = item.parentMessageId === '__previous__'
        ? ids[ids.length - 1] || null
        : item.parentMessageId || null;
      const branchFromMessageId = item.branchFromMessageId === '__previous__'
        ? ids[ids.length - 1] || null
        : item.branchFromMessageId || null;
      const editedFromMessageId = item.editedFromMessageId === '__previous__'
        ? ids[ids.length - 1] || null
        : item.editedFromMessageId || null;

      const [result] = await conn.execute(
        `INSERT INTO messages (
          conversation_id,
          sender_type,
          content,
          sequence_no,
          status,
          created_at,
          parent_message_id,
          branch_from_message_id,
          edited_from_message_id,
          prompt_kind,
          metadata_json
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [
          normalizedConversationId,
          item.senderType,
          item.content,
          nextSequence,
          item.status || 'success',
          parentMessageId,
          branchFromMessageId,
          editedFromMessageId,
          normalizeMessagePromptKind(item.promptKind),
          item.metadataJson || null,
        ],
      );
      ids.push(Number(result.insertId));
    }

    const leafId = ids[ids.length - 1] || null;
    await conn.execute(
      `UPDATE conversations
       SET current_message_id = ?, updated_at = NOW(), last_message_at = NOW()
       WHERE id = ?`,
      [leafId, normalizedConversationId],
    );

    return ids;
  });

  await invalidateConversationCache(normalizedConversationId);
  return insertedIds;
}

async function setConversationCurrentMessage(conversationId, messageId) {
  await query(
    `UPDATE conversations
     SET current_message_id = ?, updated_at = NOW(), last_message_at = NOW()
     WHERE id = ?`,
    [messageId || null, conversationId],
  );
}

async function createEditedMessageVariant(conversationId, sourceMessageId, content) {
  const sourceMessage = await getMessageById(conversationId, sourceMessageId);
  if (!sourceMessage) {
    return null;
  }

  return addMessage({
    conversationId,
    senderType: sourceMessage.sender_type,
    content,
    parentMessageId: sourceMessage.parent_message_id || null,
    branchFromMessageId: sourceMessage.id,
    editedFromMessageId: sourceMessage.id,
    promptKind: 'edit',
    metadataJson: JSON.stringify({
      sourceMessageId: Number(sourceMessageId),
      editMode: 'fork-variant',
    }),
  });
}

function toBranchChoice(message) {
  if (!message) return null;
  return {
    id: Number(message.id),
    sender_type: message.sender_type,
    contentPreview: shortText(message.content, 28),
    prompt_kind: message.prompt_kind || 'normal',
    isEdited: Boolean(message.edited_from_message_id),
    isRegenerated: message.prompt_kind === 'regenerate',
    created_at: message.created_at,
  };
}

async function resolveConversationLeafId(conversationId, messageId) {
  const target = await getMessageById(conversationId, messageId);
  if (!target) return null;
  let current = target;
  const visited = new Set();
  while (current && !visited.has(Number(current.id))) {
    visited.add(Number(current.id));
    const childRows = await query(
      `SELECT id, sender_type, content, sequence_no, parent_message_id, branch_from_message_id, edited_from_message_id, prompt_kind, created_at
       FROM messages
       WHERE conversation_id = ? AND parent_message_id = ? AND deleted_at IS NULL
       ORDER BY sequence_no DESC, id DESC
       LIMIT 1`,
      [conversationId, current.id],
    );
    if (!childRows.length) break;
    current = childRows[0];
  }
  return current?.id ? Number(current.id) : Number(target.id);
}

async function fetchBranchChoiceMaps(conversationId, pathMessages) {
  const messages = Array.isArray(pathMessages) ? pathMessages : [];
  if (!messages.length) {
    return { siblingGroups: new Map(), childGroups: new Map() };
  }

  const parentKeys = Array.from(new Set(messages.map((message) => (
    message.parent_message_id ? String(message.parent_message_id) : '__root__'
  ))));
  const childParentIds = messages.map((message) => Number(message.id)).filter(Boolean);
  const siblingGroups = new Map(parentKeys.map((key) => [key, []]));
  const childGroups = new Map(childParentIds.map((id) => [String(id), []]));

  if (parentKeys.length) {
    const rootRequested = parentKeys.includes('__root__');
    const parentIds = parentKeys.filter((key) => key !== '__root__').map(Number).filter(Boolean);
    const whereParts = [];
    const params = [conversationId];
    if (parentIds.length) {
      whereParts.push(`parent_message_id IN (${parentIds.map(() => '?').join(',')})`);
      params.push(...parentIds);
    }
    if (rootRequested) {
      whereParts.push('parent_message_id IS NULL');
    }
    if (whereParts.length) {
      const rows = await query(
        `SELECT id, sender_type, content, sequence_no, parent_message_id, branch_from_message_id, edited_from_message_id, prompt_kind, created_at
         FROM messages
         WHERE conversation_id = ? AND deleted_at IS NULL AND (${whereParts.join(' OR ')})
         ORDER BY sequence_no ASC, id ASC`,
        params,
      );
      rows.forEach((row) => {
        const key = row.parent_message_id ? String(row.parent_message_id) : '__root__';
        if (!siblingGroups.has(key)) siblingGroups.set(key, []);
        siblingGroups.get(key).push(toBranchChoice(row));
      });
    }
  }

  if (childParentIds.length) {
    const rows = await query(
      `SELECT id, sender_type, content, sequence_no, parent_message_id, branch_from_message_id, edited_from_message_id, prompt_kind, created_at
       FROM messages
       WHERE conversation_id = ? AND deleted_at IS NULL AND parent_message_id IN (${childParentIds.map(() => '?').join(',')})
       ORDER BY sequence_no ASC, id ASC`,
      [conversationId, ...childParentIds],
    );
    rows.forEach((row) => {
      const key = String(row.parent_message_id);
      if (!childGroups.has(key)) childGroups.set(key, []);
      childGroups.get(key).push(toBranchChoice(row));
    });
  }

  return { siblingGroups, childGroups };
}

async function buildConversationPathView(conversationId, activeLeafId, options = {}) {
  const normalizedLeafId = activeLeafId ? Number(activeLeafId) : null;
  const rawPathMessages = await fetchPathMessages(conversationId, normalizedLeafId);
  const branchChoices = await fetchBranchChoiceMaps(conversationId, rawPathMessages);
  const pathMessages = decoratePathMessages(rawPathMessages, branchChoices);
  const messageCount = options.messageCount === undefined
    ? await getConversationMessageCount(conversationId)
    : Number(options.messageCount || 0);

  return {
    pathMessages,
    activeLeafId: normalizedLeafId,
    messageCount,
  };
}

async function cloneConversationBranch(options) {
  const sourceMessages = await listMessages(options.sourceConversationId);
  const sourcePath = buildPathMessages(sourceMessages, options.sourceLeafMessageId);

  const newConversationId = await createConversation(options.userId, options.characterId, {
    parentConversationId: options.sourceConversationId,
    branchedFromMessageId: options.sourceLeafMessageId,
    selectedModelMode: options.selectedModelMode || 'standard',
    title: options.title,
  });

  const idMap = new Map();
  let newLeafMessageId = null;

  for (const sourceMessage of sourcePath) {
    const clonedMessageId = await addMessage({
      conversationId: newConversationId,
      senderType: sourceMessage.sender_type,
      content: sourceMessage.content,
      parentMessageId: sourceMessage.parent_message_id ? idMap.get(Number(sourceMessage.parent_message_id)) || null : null,
      branchFromMessageId: sourceMessage.id,
      editedFromMessageId: sourceMessage.edited_from_message_id || null,
      promptKind: sourceMessage.prompt_kind || 'normal',
      metadataJson: JSON.stringify({
        clonedFromConversationId: Number(options.sourceConversationId),
        clonedFromMessageId: Number(sourceMessage.id),
      }),
    });

    idMap.set(Number(sourceMessage.id), clonedMessageId);
    newLeafMessageId = clonedMessageId;
  }

  return {
    conversationId: newConversationId,
    leafMessageId: newLeafMessageId,
  };
}

async function countChildConversations(conversationId) {
  const rows = await query(
    "SELECT COUNT(*) AS childCount FROM conversations WHERE parent_conversation_id = ? AND deleted_at IS NULL",
    [conversationId],
  );
  return Number(rows[0]?.childCount || 0);
}

async function findSiblingFallbackMessageId(conversationId, targetMessage) {
  if (!targetMessage) return null;
  const parentClause = targetMessage.parent_message_id ? 'parent_message_id = ?' : 'parent_message_id IS NULL';
  const params = targetMessage.parent_message_id
    ? [conversationId, targetMessage.parent_message_id, targetMessage.id]
    : [conversationId, targetMessage.id];
  const rows = await query(
    `SELECT id
     FROM messages
     WHERE conversation_id = ?
       AND deleted_at IS NULL
       AND ${parentClause}
       AND id <> ?
     ORDER BY
       CASE WHEN sequence_no <= ? THEN 0 ELSE 1 END ASC,
       CASE WHEN sequence_no <= ? THEN sequence_no END DESC,
       CASE WHEN sequence_no > ? THEN sequence_no END ASC,
       id DESC
     LIMIT 1`,
    [...params, targetMessage.sequence_no, targetMessage.sequence_no, targetMessage.sequence_no],
  );
  return rows[0]?.id ? Number(rows[0].id) : null;
}

async function deleteMessageSafely(conversationId, messageId, userId) {
  const conversation = await getConversationById(conversationId, userId);
  if (!conversation) {
    const error = new Error('CONVERSATION_NOT_FOUND');
    error.code = 'CONVERSATION_NOT_FOUND';
    throw error;
  }

  const targetMessage = await getMessageById(conversationId, messageId);
  if (!targetMessage) {
    const error = new Error('MESSAGE_NOT_FOUND');
    error.code = 'MESSAGE_NOT_FOUND';
    throw error;
  }

  const childMessageRows = await query(
    "SELECT COUNT(*) AS childCount FROM messages WHERE conversation_id = ? AND parent_message_id = ? AND deleted_at IS NULL",
    [conversationId, messageId],
  );
  const childMessageCount = Number(childMessageRows[0]?.childCount || 0);
  if (childMessageCount > 0) {
    const error = new Error('MESSAGE_HAS_CHILDREN');
    error.code = 'MESSAGE_HAS_CHILDREN';
    error.childMessageCount = childMessageCount;
    throw error;
  }

  const branchedConversationRows = await query(
    "SELECT COUNT(*) AS branchConversationCount FROM conversations WHERE parent_conversation_id = ? AND branched_from_message_id = ? AND deleted_at IS NULL",
    [conversationId, messageId],
  );
  const branchConversationCount = Number(branchedConversationRows[0]?.branchConversationCount || 0);
  if (branchConversationCount > 0) {
    const error = new Error('MESSAGE_HAS_BRANCH_CONVERSATIONS');
    error.code = 'MESSAGE_HAS_BRANCH_CONVERSATIONS';
    error.branchConversationCount = branchConversationCount;
    throw error;
  }

  const siblingFallbackMessageId = await findSiblingFallbackMessageId(conversationId, targetMessage);
  const fallbackMessageId = siblingFallbackMessageId
    ? await resolveConversationLeafId(conversationId, siblingFallbackMessageId)
    : (targetMessage.parent_message_id ? Number(targetMessage.parent_message_id) : null);

  await query("UPDATE messages SET deleted_at = NOW() WHERE id = ? AND conversation_id = ?", [messageId, conversationId]);

  if (Number(conversation.current_message_id || 0) === Number(messageId)) {
    await setConversationCurrentMessage(conversationId, fallbackMessageId);
  }

  await invalidateConversationCache(conversationId);

  return {
    deletedMessageId: Number(messageId),
    fallbackMessageId,
  };
}

async function deleteConversationSafely(conversationId, userId) {
  const conversation = await getConversationById(conversationId, userId);
  if (!conversation) {
    const error = new Error('CONVERSATION_NOT_FOUND');
    error.code = 'CONVERSATION_NOT_FOUND';
    throw error;
  }

  await query("UPDATE conversations SET status = 'deleted', deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND user_id = ?", [conversationId, userId]);
  await invalidateConversationCache(conversationId);
}

module.exports = {
  normalizeMessagePromptKind,
  createConversation,
  updateConversationTitle,
  updateConversationModelMode,
  getConversationById,
  listUserConversations,
  listUserConversationsForManagement,
  listUserConversationFilterOptions,
  listMessages,
  getMessageById,
  getLatestMessage,
  getConversationMessageCount,
  addMessage,
  addMessagesAtomically,
  setConversationCurrentMessage,
  createEditedMessageVariant,
  buildPathMessages,
  fetchPathMessages,
  buildConversationPathView,
  resolveConversationLeafId,
  cloneConversationBranch,
  countChildConversations,
  deleteMessageSafely,
  deleteConversationSafely,
  bulkSoftDeleteUserConversations,
  bulkArchiveUserConversations,
  bulkRestoreUserConversations,
  invalidateConversationCache,
};
