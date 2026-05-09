/**
 * @file public/js/chat/rich-renderer/sanitizer.js
 * @description 聊天富文本 DOM 净化与引用高亮工具。限制模型输出可用标签、属性、URL 协议和自定义 CSS 作用域，避免把未受信内容注入页面。
 * @notes 允许标签白名单见 ALLOWED_TAGS；链接/图片只允许 http(s)，事件属性和行内 style 会被移除，style 标签内容会被作用域化。
 */

(function () {
  window.ChatRichRenderer = window.ChatRichRenderer || {};
  const ns = window.ChatRichRenderer;
  const QUOTE_TOKENS = [
    { value: '&quot;', family: 'double', role: 'both' },
    { value: '&#39;', family: 'single', role: 'both' },
    { value: '“', family: 'double', role: 'open' },
    { value: '”', family: 'double', role: 'close' },
    { value: '"', family: 'double', role: 'both' },
    { value: '‘', family: 'single', role: 'open' },
    { value: '’', family: 'single', role: 'close' },
    { value: "'", family: 'single', role: 'both' },
    { value: '「', family: 'corner', role: 'open' },
    { value: '」', family: 'corner', role: 'close' },
  ];
  const ALLOWED_TAGS = new Set(['p', 'br', 'pre', 'code', 'strong', 'em', 'b', 'i', 'u', 's', 'blockquote', 'ul', 'ol', 'li', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'details', 'summary', 'style', 'a', 'img']);

  /**
   * 净化模型输出中的 style 标签内容，并把普通选择器限定在当前消息 scope 内。
   *
   * @param {string} cssText style 标签原文。
   * @param {string} scopeSelector 当前消息容器的 data-render-scope 选择器。
   * @returns {string} 移除危险语法后的作用域化 CSS。
   */
  function sanitizeCss(cssText, scopeSelector) {
    const cleaned = String(cssText || '')
      .replace(/@import[\s\S]*?;/gi, '')
      .replace(/@charset[\s\S]*?;/gi, '')
      .replace(/@namespace[\s\S]*?;/gi, '')
      .replace(/expression\s*\([^)]*\)/gi, '')
      .replace(/behavior\s*:[^;}]+[;}]?/gi, '')
      .replace(/-moz-binding\s*:[^;}]+[;}]?/gi, '')
      .replace(/url\s*\(\s*(['"]?)\s*(javascript:|data:text\/html|data:application\/javascript)[^)]+\)/gi, 'url(#)');

    return cleaned.replace(/(^|})\s*([^@}{][^{]*){/g, (full, prefix, selectorGroup) => {
      const scopedSelectors = selectorGroup
        .split(',')
        .map((selector) => selector.trim())
        .filter(Boolean)
        .map((selector) => (/^(html|body|:root)$/i.test(selector) ? scopeSelector : `${scopeSelector} ${selector}`))
        .join(', ');
      return `${prefix} ${scopedSelectors} {`;
    });
  }

  function findQuoteToken(source, index) {
    return QUOTE_TOKENS.find((token) => source.startsWith(token.value, index)) || null;
  }

  function findClosingQuote(source, startIndex, openingToken) {
    for (let index = startIndex; index < source.length; index += 1) {
      const char = source[index];
      if (char === '<' || char === '>' || char === '\n') return null;
      const token = findQuoteToken(source, index);
      if (!token) continue;
      if (token.family !== openingToken.family) {
        index += token.value.length - 1;
        continue;
      }
      if (token.role === 'open' && token.role !== 'both') {
        index += token.value.length - 1;
        continue;
      }
      return { token, index };
    }
    return null;
  }

  /**
   * 收集文本中的成对引号片段，用于给对白/引用加视觉高亮。
   *
   * @param {string} text 待扫描文本节点内容。
   * @returns {{index:number,end:number,text:string}[]} 命中的引号范围。
   */
  function collectQuoteMatches(text) {
    const source = String(text || '');
    const matches = [];
    let index = 0;

    while (index < source.length) {
      const openingToken = findQuoteToken(source, index);
      if (!openingToken || openingToken.role === 'close') {
        index += 1;
        continue;
      }

      const closing = findClosingQuote(source, index + openingToken.value.length, openingToken);
      if (!closing || closing.index === index + openingToken.value.length) {
        index += openingToken.value.length;
        continue;
      }

      const end = closing.index + closing.token.value.length;
      matches.push({ index, end, text: source.slice(index, end) });
      index = end;
    }

    return matches;
  }

  /**
   * 给富文本内各种语义节点补上专用类，避免后续样式依赖大范围共用选择器。
   *
   * @param {Element|DocumentFragment} root 已净化或待净化的消息根节点。
   * @returns {void}
   */
  function applyChatRichSemanticClasses(root) {
    const classMap = {
      P: 'bubble-copy',
      EM: 'bubble-italic',
      I: 'bubble-italic',
      STRONG: 'bubble-strong',
      B: 'bubble-strong',
      BLOCKQUOTE: 'bubble-blockquote',
      CODE: 'bubble-code',
      PRE: 'bubble-code-block',
      A: 'bubble-link',
      UL: 'bubble-list bubble-list--unordered',
      OL: 'bubble-list bubble-list--ordered',
      LI: 'bubble-list-item',
      TABLE: 'bubble-table',
      TH: 'bubble-table-head-cell',
      TD: 'bubble-table-cell',
      HR: 'bubble-divider',
    };
    root.querySelectorAll(Object.keys(classMap).map((tag) => tag.toLowerCase()).join(',')).forEach((node) => {
      String(classMap[node.tagName] || '')
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => node.classList.add(className));
    });
  }

  /**
   * 删除正文里的折叠块内部占位符。真实折叠内容会在 bubble-folds 中单独渲染。
   *
   * @param {Element|DocumentFragment} root 已净化或待净化的消息根节点。
   * @returns {void}
   */
  function removeFoldPlaceholdersInNodeTree(root) {
    const placeholderRe = /__FOLD_BLOCK_\d+__/g;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('pre, code, style, a')) return NodeFilter.FILTER_REJECT;
        return placeholderRe.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const nextText = String(node.nodeValue || '').replace(placeholderRe, '').replace(/\n{3,}/g, '\n\n').trim();
      if (nextText) {
        node.nodeValue = nextText;
      } else {
        const parent = node.parentElement;
        node.remove();
        if (parent && parent.matches('p') && !parent.textContent.trim() && !parent.querySelector('img, br, code, a')) parent.remove();
      }
    });
  }

  /**
   * 遍历富文本 DOM，把普通文本节点里的引号内容包成 .bubble-quote。
   *
   * @param {Element|DocumentFragment} root 已净化或待净化的消息根节点。
   * @returns {void}
   */
  function highlightQuotesInNodeTree(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('pre, code, style, a, .bubble-quote')) return NodeFilter.FILTER_REJECT;
        return collectQuoteMatches(node.nodeValue || '').length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const text = node.nodeValue || '';
      const matches = collectQuoteMatches(text);
      if (!matches.length) return;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      matches.forEach((match) => {
        if (match.index > lastIndex) fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        const span = document.createElement('span');
        span.className = 'bubble-quote';
        span.textContent = match.text;
        fragment.appendChild(span);
        lastIndex = match.end;
      });
      if (lastIndex < text.length) fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      node.replaceWith(fragment);
    });
  }

  /**
   * 原地净化富文本 DOM 树。
   *
   * - 非白名单标签会被移除但保留子节点。
   * - 移除事件属性、行内 style、非 http(s) 链接/图片。
   * - 强制链接新窗口 noopener/nofollow，图片 lazy/async/no-referrer。
   *
   * @param {Element|DocumentFragment} root DOMParser 生成的根节点。
   * @param {string} scopeSelector 当前消息的 CSS 作用域选择器。
   * @returns {void}
   */
  function sanitizeNodeTree(root, scopeSelector) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    const toProcess = [];
    while (walker.nextNode()) toProcess.push(walker.currentNode);

    toProcess.forEach((node) => {
      const tag = node.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        const fragment = document.createDocumentFragment();
        while (node.firstChild) fragment.appendChild(node.firstChild);
        node.replaceWith(fragment);
        return;
      }

      Array.from(node.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = String(attr.value || '');
        if (name.startsWith('on') || ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) || name === 'style') {
          node.removeAttribute(attr.name);
          return;
        }
        if (tag !== 'a' && (name === 'target' || name === 'rel')) node.removeAttribute(attr.name);
      });

      if (tag === 'a') {
        const href = String(node.getAttribute('href') || '');
        if (!/^https?:\/\//i.test(href)) node.removeAttribute('href');
        node.setAttribute('rel', 'noopener noreferrer nofollow');
        node.setAttribute('target', '_blank');
      }

      if (tag === 'img') {
        const src = String(node.getAttribute('src') || '');
        if (!/^https?:\/\//i.test(src)) node.removeAttribute('src');
        node.removeAttribute('srcset');
        node.removeAttribute('sizes');
        node.setAttribute('loading', 'lazy');
        node.setAttribute('decoding', 'async');
        node.setAttribute('referrerpolicy', 'no-referrer');
      }

      if (tag === 'style') node.textContent = sanitizeCss(node.textContent || '', scopeSelector);
    });
  }

  ns.sanitizeNodeTree = sanitizeNodeTree;
  ns.collectQuoteMatches = collectQuoteMatches;
  ns.applyChatRichSemanticClasses = applyChatRichSemanticClasses;
  ns.removeFoldPlaceholdersInNodeTree = removeFoldPlaceholdersInNodeTree;
  ns.highlightQuotesInNodeTree = highlightQuotesInNodeTree;
}());
