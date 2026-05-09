/**
 * @file public/js/conversation-management.js
 * @description 用户会话管理页的批量选择、单条更多菜单与提交保护。
 */

(function () {
  'use strict';

  const form = document.querySelector('[data-conversation-bulk-form]');
  if (!form) return;

  const selectAll = form.querySelector('[data-conversation-select-all]');
  const checkboxes = Array.from(form.querySelectorAll('[data-conversation-checkbox]'));
  const actionButtons = Array.from(form.querySelectorAll('[data-bulk-action]'));
  let activeConversationId = '';
  let previousActiveElement = null;

  function selectedCount() {
    return checkboxes.filter((checkbox) => checkbox.checked).length;
  }

  function syncState() {
    const count = selectedCount();
    actionButtons.forEach((button) => {
      button.disabled = count === 0;
    });
    if (selectAll) {
      selectAll.checked = checkboxes.length > 0 && count === checkboxes.length;
      selectAll.indeterminate = count > 0 && count < checkboxes.length;
    }
  }

  function getConversationModal() {
    return document.querySelector('[data-conversation-actions-modal]');
  }

  function closeConversationActions() {
    const modal = getConversationModal();
    if (modal) modal.remove();
    activeConversationId = '';
    document.body.classList.remove('has-conversation-actions-modal');
    document.querySelectorAll('.conversation-manager-card.is-actions-active').forEach((card) => card.classList.remove('is-actions-active'));
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus({ preventScroll: true });
    }
    previousActiveElement = null;
  }

  function renderConversationActions(trigger) {
    const actionWrap = trigger.closest('.conversation-card-actions');
    const card = trigger.closest('.conversation-manager-card');
    const template = actionWrap?.querySelector('template[data-conversation-actions-template]');
    if (!template) return;

    const conversationId = template.dataset.conversationId || '';
    if (activeConversationId && activeConversationId === conversationId) {
      closeConversationActions();
      return;
    }

    closeConversationActions();
    previousActiveElement = document.activeElement;

    const modal = document.createElement('div');
    modal.className = 'conversation-actions-modal';
    modal.dataset.conversationActionsModal = 'true';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const fragment = template.content.cloneNode(true);
    const actionCard = fragment.querySelector('[data-conversation-actions-card]');
    if (!actionCard) return;
    actionCard.setAttribute('role', 'document');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'conversation-actions-close';
    closeButton.setAttribute('aria-label', window.AI_ROLEPLAY_I18N?.t ? window.AI_ROLEPLAY_I18N.t('关闭操作面板') : '关闭操作面板');
    const closeIcon = document.createElement('span');
    closeIcon.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', closeConversationActions);
    actionCard.querySelector('.conversation-actions-head')?.appendChild(closeButton);

    modal.appendChild(actionCard);
    document.body.appendChild(modal);
    document.body.classList.add('has-conversation-actions-modal');
    if (card) card.classList.add('is-actions-active');
    activeConversationId = conversationId;

    requestAnimationFrame(() => {
      const first = modal.querySelector('button, a[href]');
      if (first && typeof first.focus === 'function') first.focus({ preventScroll: true });
    });
  }

  function setOnlyConversationSelected(conversationId) {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = String(checkbox.value) === String(conversationId || '');
    });
    syncState();
  }

  if (selectAll) {
    selectAll.addEventListener('change', () => {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAll.checked;
      });
      syncState();
    });
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', syncState);
  });

  form.addEventListener('click', (event) => {
    const trigger = event.target?.closest?.('[data-conversation-actions-trigger]');
    if (trigger) {
      event.preventDefault();
      renderConversationActions(trigger);
      return;
    }

    const singleAction = event.target?.closest?.('[data-single-conversation-action]');
    if (singleAction) {
      setOnlyConversationSelected(singleAction.getAttribute('data-conversation-id'));
    }
  }, true);

  document.addEventListener('click', (event) => {
    const modal = getConversationModal();
    if (modal && event.target === modal) {
      closeConversationActions();
    }

    const singleAction = event.target?.closest?.('[data-single-conversation-action]');
    if (singleAction) {
      setOnlyConversationSelected(singleAction.getAttribute('data-conversation-id'));
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeConversationActions();
  });

  actionButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      if (selectedCount() === 0) {
        event.preventDefault();
        const t = window.AI_ROLEPLAY_I18N?.t || ((key) => key);
        window.alert(t('请先选择至少一条会话。'));
        return;
      }
      const message = button.getAttribute('data-confirm-message');
      if (message && !window.confirm(message)) {
        event.preventDefault();
      }
    });
  });

  form.addEventListener('submit', (event) => {
    const submitter = event.submitter;
    if (submitter?.matches?.('[data-single-conversation-action]')) {
      setOnlyConversationSelected(submitter.getAttribute('data-conversation-id'));
      const message = submitter.getAttribute('data-confirm-message');
      if (message && !window.confirm(message)) {
        event.preventDefault();
        return;
      }
      window.setTimeout(closeConversationActions, 80);
    }
  }, true);

  syncState();
}());
