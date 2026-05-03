/**
 * @file public/js/chat/conversation-state.js
 * @description 聊天页 URL leaf、父消息隐藏字段、可见消息计数与旧尾巴清理。
 */

(function () {
  function create(options) {
    const settings = Object.assign({ t: (key) => key }, options || {});
    const { form, textarea, chatContainer, t } = settings;

    function reloadToMessage(messageId, notice) {
      const normalizedMessageId = String(messageId || '').trim();
      if (!normalizedMessageId) return;
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('leaf', normalizedMessageId);
      if (notice) {
        nextUrl.searchParams.set('notice', notice);
      }
      window.setTimeout(() => {
        window.location.assign(nextUrl.toString());
      }, 450);
    }

    function updateChatCounts() {
      if (!chatContainer) return;
      const currentCount = chatContainer.querySelectorAll('article.bubble[data-message-id]').length;
      chatContainer.dataset.visibleCount = String(currentCount);
      chatContainer.dataset.totalCount = String(Math.max(Number(chatContainer.dataset.totalCount || '0'), currentCount));
    }

    function updateHiddenParentInputs(messageId) {
      const normalizedMessageId = String(messageId || '').trim();
      if (!normalizedMessageId) return;
      document.querySelectorAll('input[name="parentMessageId"]').forEach((input) => {
        input.value = normalizedMessageId;
      });
    }

    function collapseOldRenderedMessages(options) {
      if (!chatContainer) return;
      const settings = Object.assign({ keepLatest: 24 }, options || {});
      const keepLatest = Math.max(6, Number(settings.keepLatest || 24));
      const articles = Array.from(chatContainer.querySelectorAll('article.bubble[data-message-id]'));
      if (articles.length <= keepLatest) {
        updateChatCounts();
        return;
      }

      const removable = articles.slice(0, Math.max(0, articles.length - keepLatest));
      if (!removable.length) {
        updateChatCounts();
        return;
      }

      const firstKept = articles[removable.length];
      const nextBeforeId = firstKept ? String(firstKept.dataset.messageId || '').trim() : '';
      const removedCount = removable.length;
      removable.forEach((article) => article.remove());
      updateChatCounts();
      if (nextBeforeId) {
        chatContainer.dataset.oldestVisibleId = nextBeforeId;
        const loader = document.querySelector('[data-history-loader]');
        const button = loader ? loader.querySelector('[data-load-older-messages]') : null;
        if (button) {
          button.dataset.beforeId = nextBeforeId;
        }
      }
      if (settings.showNotice && removedCount > 0 && typeof settings.showToast === 'function') {
        settings.showToast(t('已折叠较早消息，可点“查看更早的消息”重新加载。'));
      }
    }

    function updateCurrentMessageState(messageId) {
      const normalizedMessageId = String(messageId || '').trim();
      if (!normalizedMessageId) return;
      updateHiddenParentInputs(normalizedMessageId);
      form.dataset.messageCount = String(Math.max(Number(form.dataset.messageCount || '0'), 1));
      if (chatContainer) {
        chatContainer.querySelectorAll('.empty-chat-state').forEach((node) => node.remove());
        updateChatCounts();
        collapseOldRenderedMessages({ keepLatest: 24 });
      }
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('leaf', normalizedMessageId);
      window.history.replaceState({}, '', nextUrl.toString());
    }

    function ensureStartMessage() {
      const currentMessageCount = Number(form.dataset.messageCount || '0');
      if (currentMessageCount === 0 && !textarea.value.trim()) {
        textarea.value = t('[开始一次新的对话]');
      }
    }

    function removeStaleLinearTail(messageId) {
      const normalizedMessageId = String(messageId || '').trim();
      if (!normalizedMessageId || !chatContainer) return;
      const articles = Array.from(chatContainer.querySelectorAll('article.bubble[data-message-id]'));
      const index = articles.findIndex((article) => String(article.dataset.messageId || '') === normalizedMessageId);
      if (index < 0) return;
      articles.slice(index + 1).forEach((article) => article.remove());
      updateChatCounts();
      updateHiddenParentInputs(normalizedMessageId);
    }

    function applyInitialUrlState() {
      const params = new URLSearchParams(window.location.search);
      const notice = params.get('notice');
      if (notice === 'updated' && typeof settings.showToast === 'function') {
        settings.showToast(t('已显示新的结果，旧内容已保留。'));
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete('notice');
        window.history.replaceState({}, '', nextUrl.toString());
      }
      const draft = params.get('draft');
      if (draft && !textarea.value.trim()) {
        textarea.value = draft;
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }

    return {
      reloadToMessage,
      updateHiddenParentInputs,
      updateCurrentMessageState,
      collapseOldRenderedMessages,
      ensureStartMessage,
      removeStaleLinearTail,
      applyInitialUrlState,
    };
  }

  window.LougeChatConversationState = { create };
})();
