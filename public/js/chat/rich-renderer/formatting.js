/**
 * @file public/js/chat/rich-renderer/formatting.js
 * @description 聊天富文本 Markdown 格式化工具。负责在进入 DOM 净化前，把模型文本转换为受限 HTML：段落、标题、列表、引用、表格、代码块、链接和图片。
 * @notes 本文件只做字符串级 Markdown 转换，不直接写 DOM；输出必须继续交给 sanitizer.js 净化后才能展示。
 */

(function () {
  window.ChatRichRenderer = window.ChatRichRenderer || {};
  const ns = window.ChatRichRenderer;

  /**
   * 转义模型原始文本中的 HTML 特殊字符。
   *
   * @param {unknown} value 任意待展示内容。
   * @returns {string} 可安全参与后续 Markdown 字符串转换的文本。
   */
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 规整 Markdown 行格式，兼容 HTML 转义后的引用符和纯分隔线。
   *
   * @param {unknown} text 模型输出文本。
   * @returns {string} 使用 \n 换行的标准化 Markdown 文本。
   */
  function normalizeMarkdownLines(text) {
    return String(text || '')
      .replace(/\r\n?/g, '\n')
      .replace(/^(\s*)&gt;\s?/gm, '$1> ')
      .replace(/^(\s*)([-*_])\2\2\s*$/gm, '$1---');
  }

  function applyInlineMarkdown(text) {
    return String(text || '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*(?!\s)(.+?)(?!\s)\*/g, '$1<em>$2</em>')
      .replace(/(^|[^_])_(?!\s)(.+?)(?!\s)_/g, '$1<em>$2</em>')
      .replace(/~~(.+?)~~/g, '<s>$1</s>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img alt="$1" src="$2">')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }


  function splitTableRow(line) {
    let source = String(line || '').trim();
    if (!source.includes('|')) return [];
    if (source.startsWith('|')) source = source.slice(1);
    if (source.endsWith('|') && !source.endsWith('\\|')) source = source.slice(0, -1);

    const cells = [];
    let current = '';
    let inCode = false;
    for (let i = 0; i < source.length; i += 1) {
      const char = source[i];
      const next = source[i + 1];
      if (char === '`') {
        inCode = !inCode;
        current += char;
        continue;
      }
      if (char === '\\' && next === '|') {
        current += '|';
        i += 1;
        continue;
      }
      if (char === '|' && !inCode) {
        cells.push(current.trim());
        current = '';
        continue;
      }
      current += char;
    }
    cells.push(current.trim());
    return cells;
  }

  function parseTableSeparator(line) {
    const cells = splitTableRow(line);
    if (cells.length < 2) return null;
    const alignments = [];
    for (const cell of cells) {
      const value = String(cell || '').trim();
      if (!/^:?-{3,}:?$/.test(value)) return null;
      if (/^:-+:$/.test(value)) alignments.push('center');
      else if (/^-+:$/.test(value)) alignments.push('right');
      else if (/^:-+$/.test(value)) alignments.push('left');
      else alignments.push('');
    }
    return alignments;
  }

  function normalizeTableCells(cells, columnCount) {
    const normalized = cells.slice(0, columnCount);
    while (normalized.length < columnCount) normalized.push('');
    return normalized;
  }

  function renderTableCell(tag, content, alignment) {
    const alignClass = alignment ? ` class="align-${alignment}"` : '';
    return `<${tag}${alignClass}>${applyInlineMarkdown(String(content || '').trim())}</${tag}>`;
  }

  function tryParseTable(lines, startIndex) {
    const headerCells = splitTableRow(lines[startIndex]);
    const alignments = parseTableSeparator(lines[startIndex + 1]);
    if (headerCells.length < 2 || !alignments) return null;

    const columnCount = headerCells.length;
    const headerHtml = normalizeTableCells(headerCells, columnCount)
      .map((cell, index) => renderTableCell('th', cell, alignments[index]))
      .join('');
    const bodyRows = [];
    let endIndex = startIndex + 2;

    while (endIndex < lines.length) {
      const rowLine = lines[endIndex];
      if (!String(rowLine || '').trim()) break;
      const cells = splitTableRow(rowLine);
      if (cells.length < 2 || parseTableSeparator(rowLine)) break;
      bodyRows.push(`<tr>${normalizeTableCells(cells, columnCount)
        .map((cell, index) => renderTableCell('td', cell, alignments[index]))
        .join('')}</tr>`);
      endIndex += 1;
    }

    return {
      html: `<div class="bubble-table-wrap"><table><thead><tr>${headerHtml}</tr></thead>${bodyRows.length ? `<tbody>${bodyRows.join('')}</tbody>` : ''}</table></div>`,
      endIndex,
    };
  }

  /**
   * 将受限 Markdown 转为 HTML 字符串。
   *
   * 支持段落、标题、列表、引用、表格、代码块和少量 inline 格式。调用方必须继续调用
   * `sanitizeNodeTree()`，不要直接把返回值塞入页面。
   *
   * @param {unknown} text 模型输出或消息文本。
   * @returns {string} 未净化的 HTML 字符串。
   */
  function markdownToHtml(text) {
    const normalized = normalizeMarkdownLines(text);
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
      const content = paragraphLines.join('<br>');
      parts.push(`<p>${applyInlineMarkdown(content)}</p>`);
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

      const parsedTable = i + 1 < lines.length ? tryParseTable(lines, i) : null;
      if (parsedTable) {
        flushParagraph();
        parts.push(parsedTable.html);
        i = parsedTable.endIndex - 1;
        continue;
      }

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

  /**
   * 为流式生成中的未闭合代码围栏补齐结尾，生成可预览 HTML。
   *
   * @param {unknown} text 当前已收到的流式文本。
   * @returns {string} 未净化的 HTML 片段。
   */
  function markdownToPartialHtml(text) {
    const normalized = normalizeMarkdownLines(text);
    const lines = normalized.split('\n');
    let inFence = false;
    lines.forEach((line) => {
      if (/^```/.test(String(line || '').trim())) inFence = !inFence;
    });
    return markdownToHtml(inFence ? `${normalized}\n\`\`\`` : normalized);
  }

  function buildStreamingPreviewHtml(text) {
    const source = String(text || '').trim();
    return source ? markdownToPartialHtml(source) : '';
  }

  ns.escapeHtml = escapeHtml;
  ns.normalizeMarkdownLines = normalizeMarkdownLines;
  ns.markdownToHtml = markdownToHtml;
  ns.buildStreamingPreviewHtml = buildStreamingPreviewHtml;
}());
