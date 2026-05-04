/**
 * @file public/js/chat/rich-renderer/folds.js
 * @description 聊天富文本折叠块工具。提取 `<think>`/`<thinking>` 以及模型输出中的非富文本自定义标签，转成可折叠详情块。
 * @notes 流式生成阶段默认隐藏折叠内容，最终态再展示，避免未闭合标签导致页面跳动。
 */

(function () {
  window.ChatRichRenderer = window.ChatRichRenderer || {};
  const ns = window.ChatRichRenderer;
  const t = window.AI_ROLEPLAY_I18N?.t || ((key, vars) => {
    let text = String(key || '');
    if (vars && typeof vars === 'object') {
      Object.entries(vars).forEach(([name, value]) => {
        text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
      });
    }
    return text;
  });
  const THINK_BLOCK_RE = /<(think|thinking)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const GENERIC_FOLD_TAG_RE = /<([a-z][\w:-]*)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const RICH_TAGS = new Set(['p', 'br', 'pre', 'code', 'strong', 'em', 'b', 'i', 'u', 's', 'blockquote', 'ul', 'ol', 'li', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'details', 'summary', 'style', 'a', 'img', 'think', 'thinking']);

  /**
   * 创建一个聊天气泡内的折叠详情块。
   *
   * @param {string} title summary 标题。
   * @param {string} body 折叠正文，作为纯文本写入，避免标签注入。
   * @param {boolean} openByDefault 是否默认展开。
   * @returns {HTMLDetailsElement} 可直接插入消息 DOM 的 details 节点。
   */
  function buildFold(title, body, openByDefault) {
    const details = document.createElement('details');
    details.className = 'bubble-fold';
    if (openByDefault) details.open = true;

    const summary = document.createElement('summary');
    summary.textContent = title;

    const content = document.createElement('div');
    content.className = 'bubble-fold-body';
    content.textContent = body;

    details.appendChild(summary);
    details.appendChild(content);
    return details;
  }

  /**
   * 从模型原文中提取思考块和自定义标签块。
   *
   * @param {string} raw 模型原始输出。
   * @param {{hideFolds?: boolean}=} options hideFolds 为 true 时移除折叠块内容，常用于 streaming preview。
   * @returns {{text:string,folds:Array<{key:string,title:string,body:string,open:boolean,kind:string}>}} 替换占位后的正文与折叠块列表。
   */
  function collectFoldBlocks(raw, options) {
    const mode = Object.assign({ hideFolds: false }, options || {});
    const folds = [];
    let foldIndex = 0;
    let text = String(raw || '');

    text = text.replace(THINK_BLOCK_RE, (_, _tagName, inner) => {
      const body = String(inner || '').trim();
      if (mode.hideFolds || !body) return '';
      const key = `__FOLD_BLOCK_${foldIndex++}__`;
      folds.push({ key, title: t('思考内容'), body, open: false, kind: 'think' });
      return key;
    });

    text = text.replace(GENERIC_FOLD_TAG_RE, (full, tagName, inner) => {
      const normalizedTag = String(tagName || '').toLowerCase();
      if (RICH_TAGS.has(normalizedTag)) return full;
      const plainInner = String(inner || '').replace(/<[^>]+>/g, '').trim();
      if (!plainInner) return full;
      if (mode.hideFolds) return '';
      const key = `__FOLD_BLOCK_${foldIndex++}__`;
      folds.push({ key, title: t('标签内容：<{tag}>', { tag: normalizedTag }), body: plainInner, open: false, kind: normalizedTag });
      return key;
    });

    return { text: text.replace(/\n{3,}/g, '\n\n').trim(), folds };
  }

  ns.buildFold = buildFold;
  ns.collectFoldBlocks = collectFoldBlocks;
}());
