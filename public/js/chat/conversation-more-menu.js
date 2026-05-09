/**
 * @file public/js/chat/conversation-more-menu.js
 * @description 聊天页顶部“更多”会话操作：页面级居中蒙层。
 */

(function () {
  let previousActiveElement = null;

  function getModal() {
    return document.querySelector('[data-conversation-more-modal]');
  }

  function closeAll() {
    const modal = getModal();
    if (modal) modal.remove();
    document.body.classList.remove('has-conversation-actions-modal');
    document.querySelectorAll('[data-conversation-more-trigger].is-actions-active').forEach((trigger) => {
      trigger.classList.remove('is-actions-active');
      trigger.setAttribute('aria-expanded', 'false');
    });
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus({ preventScroll: true });
    }
    previousActiveElement = null;
  }

  function focusFirstAction(container) {
    const target = container.querySelector('button, a[href], input, textarea, summary');
    if (target && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  }

  function openFor(trigger) {
    const wrap = trigger.closest('.chat-head-actions');
    const template = wrap?.querySelector('template[data-conversation-more-template]');
    if (!template) return;

    if (getModal()) {
      closeAll();
      return;
    }

    if (window.LougeMessageMenus && typeof window.LougeMessageMenus.closeAll === 'function') {
      window.LougeMessageMenus.closeAll();
    }

    previousActiveElement = document.activeElement;
    const modal = document.createElement('div');
    modal.className = 'conversation-actions-modal conversation-more-modal';
    modal.dataset.conversationMoreModal = 'true';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector('[data-conversation-more-card]');
    if (!card) return;
    card.setAttribute('role', 'document');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'conversation-actions-close';
    closeButton.setAttribute('aria-label', window.AI_ROLEPLAY_I18N?.t ? window.AI_ROLEPLAY_I18N.t('关闭操作面板') : '关闭操作面板');
    const closeIcon = document.createElement('span');
    closeIcon.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', closeAll);
    card.querySelector('.conversation-actions-head')?.appendChild(closeButton);

    modal.appendChild(card);
    document.body.appendChild(modal);
    document.body.classList.add('has-conversation-actions-modal');
    trigger.classList.add('is-actions-active');
    trigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => focusFirstAction(modal));
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target?.closest?.('[data-conversation-more-trigger]');
    if (trigger) {
      event.preventDefault();
      openFor(trigger);
      return;
    }

    const modal = getModal();
    if (modal && event.target === modal) {
      closeAll();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });

  document.addEventListener('submit', (event) => {
    const modal = getModal();
    if (modal && event.target && modal.contains(event.target)) {
      window.setTimeout(closeAll, 80);
    }
  }, true);

  window.LougeConversationMoreMenu = {
    closeAll,
  };
}());
