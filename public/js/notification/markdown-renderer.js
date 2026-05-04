/**
 * @file public/js/notification/markdown-renderer.js
 * @description 前台通知 Markdown 降级渲染工具；服务端 bodyHtml 优先，本文件只在缺少 bodyHtml 时使用。
 */

(function () {
  'use strict';

  function text(value) {
    return String(value || '').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeMarkdownLines(value) {
    return String(value || '')
      .replace(/\r\n?/g, '\n')
      .replace(/^(\s*)&gt;\s?/gm, '$1> ')
      .replace(/^(\s*)([-*_])\2\2\s*$/gm, '$1---');
  }

  function isSafeHttpUrl(value) {
    try {
      const parsed = new URL(String(value || '').trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function applyInlineMarkdown(value) {
    return String(value || '')
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (full, alt, url) => (
        isSafeHttpUrl(url) ? `<img alt="${escapeHtml(alt)}" src="${escapeHtml(url)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : full
      ))
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (full, label, url) => (
        isSafeHttpUrl(url) ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>` : full
      ))
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)(?!\s)\*/g, '$1<em>$2</em>')
      .replace(/(^|[^_])_(?!\s)(.+?)(?!\s)_/g, '$1<em>$2</em>')
      .replace(/~~(.+?)~~/g, '<s>$1</s>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function markdownToHtml(value) {
    const normalized = normalizeMarkdownLines(value);
    const escaped = escapeHtml(normalized);
    const fenced = [];
    let htmlSeed = escaped.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const key = `__CODE_BLOCK_${fenced.length}__`;
      fenced.push(`<pre><code class="lang-${escapeHtml(lang || 'plain')}">${code}</code></pre>`);
      return key;
    });
    const lines = htmlSeed.split('\n');
    const parts = [];
    let paragraphLines = [];
    const flushParagraph = () => {
      if (!paragraphLines.length) return;
      parts.push(`<p>${applyInlineMarkdown(paragraphLines.join('<br>'))}</p>`);
      paragraphLines = [];
    };
    const isBlank = (line) => !String(line || '').trim();
    const isFencePlaceholder = (line) => /^__CODE_BLOCK_\d+__$/.test(String(line || '').trim());
    const isHr = (line) => /^(?:---|\*\*\*|___)\s*$/.test(String(line || '').trim());
    const parseHeading = (line) => String(line || '').match(/^(#{1,6})\s+(.+)$/);
    const isBullet = (line) => /^[-*]\s+.+$/.test(String(line || '').trim());
    const isOrdered = (line) => /^\d+\.\s+.+$/.test(String(line || '').trim());
    const isQuoted = (line) => /^(?:>|&gt;)\s?.*$/.test(String(line || '').trim());
    const isQuoteMarkerOnly = (line) => /^(?:>|&gt;)\s*$/.test(String(line || '').trim());

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const trimmed = String(line || '').trim();
      if (isBlank(line)) { flushParagraph(); continue; }
      if (isFencePlaceholder(trimmed)) { flushParagraph(); parts.push(trimmed); continue; }
      if (isHr(line)) { flushParagraph(); parts.push('<hr>'); continue; }
      const headingMatch = parseHeading(line);
      if (headingMatch) {
        flushParagraph();
        const level = headingMatch[1].length;
        parts.push(`<h${level}>${applyInlineMarkdown(headingMatch[2].trim())}</h${level}>`);
        continue;
      }
      if (isQuoted(line)) {
        flushParagraph();
        const quoteLines = [];
        if (isQuoteMarkerOnly(line)) {
          i += 1;
          while (i < lines.length && !isBlank(lines[i])) { quoteLines.push(lines[i]); i += 1; }
          i -= 1;
        } else {
          while (i < lines.length && isQuoted(lines[i]) && !isQuoteMarkerOnly(lines[i])) {
            quoteLines.push(String(lines[i] || '').replace(/^(?:>|&gt;)\s?/, ''));
            i += 1;
          }
          i -= 1;
        }
        parts.push(`<blockquote>${applyInlineMarkdown(quoteLines.join('<br>').trim())}</blockquote>`);
        continue;
      }
      if (isBullet(line)) {
        flushParagraph();
        const items = [];
        while (i < lines.length && isBullet(lines[i])) {
          items.push(String(lines[i] || '').trim().replace(/^[-*]\s+/, ''));
          i += 1;
        }
        i -= 1;
        parts.push(`<ul>${items.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join('')}</ul>`);
        continue;
      }
      if (isOrdered(line)) {
        flushParagraph();
        const items = [];
        while (i < lines.length && isOrdered(lines[i])) {
          items.push(String(lines[i] || '').trim().replace(/^\d+\.\s+/, ''));
          i += 1;
        }
        i -= 1;
        parts.push(`<ol>${items.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join('')}</ol>`);
        continue;
      }
      paragraphLines.push(trimmed);
    }
    flushParagraph();
    let html = parts.join('');
    fenced.forEach((snippet, index) => {
      html = html.replace(`__CODE_BLOCK_${index}__`, snippet);
    });
    return html;
  }

  function renderMarkdownInto(element, notification) {
    if (!element) return;
    element.classList.add('markdown-body');
    element.innerHTML = text(notification.bodyHtml) || markdownToHtml(text(notification.body));
  }

  window.LougeNotificationMarkdown = {
    escapeHtml,
    markdownToHtml,
    renderMarkdownInto,
  };
})();
