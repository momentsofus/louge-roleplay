/**
 * @file public/js/chat/message-menu.js
 * @description 聊天消息操作菜单：点击消息上的操作按钮后，在页面级居中蒙层中显示菜单。
 */

(function () {
  let activeMessageId = '';
  let previousActiveElement = null;

  function getExistingDock() {
    return document.querySelector('[data-message-actions-dock]');
  }

  function setActiveMessage(article) {
    document.querySelectorAll('.bubble.is-actions-active').forEach((node) => {
      if (node !== article) node.classList.remove('is-actions-active');
    });
    if (article) article.classList.add('is-actions-active');
  }

  function setBodyModalState(isOpen) {
    document.body.classList.toggle('has-message-actions-modal', Boolean(isOpen));
  }

  function closeActions() {
    const dock = getExistingDock();
    if (dock) dock.remove();
    activeMessageId = '';
    setActiveMessage(null);
    setBodyModalState(false);
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus({ preventScroll: true });
    }
    previousActiveElement = null;
  }

  function focusFirstAction(container) {
    const target = container.querySelector('button, summary, textarea, input, a[href]');
    if (target && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  }

  function renderActionsFor(article) {
    const template = article && article.querySelector(':scope > template[data-message-actions-template]');
    if (!article || !template) return;

    const messageId = String(article.dataset.messageId || '').trim();
    if (activeMessageId && activeMessageId === messageId) {
      closeActions();
      return;
    }

    closeActions();
    previousActiveElement = document.activeElement;

    const dock = document.createElement('div');
    dock.className = 'message-actions-modal';
    dock.dataset.messageActionsDock = 'true';
    dock.dataset.activeMessageId = messageId;
    dock.setAttribute('role', 'dialog');
    dock.setAttribute('aria-modal', 'true');

    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector('[data-message-actions-card]');
    if (!card) return;
    card.setAttribute('role', 'document');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'message-actions-close';
    closeButton.setAttribute('aria-label', (window.AI_ROLEPLAY_I18N && window.AI_ROLEPLAY_I18N.t ? window.AI_ROLEPLAY_I18N.t('关闭操作面板') : '关闭操作面板'));
    const closeIcon = document.createElement('span');
    closeIcon.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', closeActions);
    card.querySelector('.message-actions-head')?.appendChild(closeButton);

    dock.appendChild(card);
    document.body.appendChild(dock);
    activeMessageId = messageId;
    setActiveMessage(article);
    setBodyModalState(true);
    requestAnimationFrame(() => focusFirstAction(dock));
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target && event.target.closest ? event.target.closest('[data-message-actions-trigger]') : null;
    if (trigger) {
      event.preventDefault();
      const article = trigger.closest('.bubble[data-message-id]');
      renderActionsFor(article);
      return;
    }

    const dock = getExistingDock();
    if (dock && event.target === dock) {
      closeActions();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeActions();
  });

  document.addEventListener('submit', (event) => {
    const dock = getExistingDock();
    if (dock && event.target && dock.contains(event.target)) {
      window.setTimeout(closeActions, 80);
    }
  }, true);

  window.LougeMessageMenus = {
    closeAll: closeActions,
    closeActions,
  };
}());
