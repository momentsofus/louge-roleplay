/**
 * @file public/js/conversation-management.js
 * @description 用户会话管理页的批量选择与提交保护。
 */

(function () {
  'use strict';

  const form = document.querySelector('[data-conversation-bulk-form]');
  if (!form) return;

  const selectAll = form.querySelector('[data-conversation-select-all]');
  const checkboxes = Array.from(form.querySelectorAll('[data-conversation-checkbox]'));
  const actionButtons = Array.from(form.querySelectorAll('[data-bulk-action]'));

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

  syncState();
}());
