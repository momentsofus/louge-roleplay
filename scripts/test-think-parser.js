#!/usr/bin/env node
/**
 * @file scripts/test-think-parser.js
 * @description 最小回归测试：验证 think/reasoning 解析与展示规则的关键正则行为。
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const THINK_TAG_PATTERN = /<\s*(think|thinking)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const THINK_BLOCK_RE = /<(think|thinking)\b[^>]*>([\s\S]*?)<\/\1>/gi;
const GENERIC_TAG_BLOCK_RE = /<([a-zA-Z][\w:-]*)\b[^>]*>([\s\S]*?)<\/\1>/g;

function stripThinkTags(text) {
  return String(text || '')
    .replace(THINK_TAG_PATTERN, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeLooseText(text) {
  return String(text || '')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function extractReasoningText(data) {
  const message = data?.choices?.[0]?.message || {};
  const candidates = [
    message.reasoning_content,
    message.reasoning,
    message.reasoning_text,
    data?.choices?.[0]?.reasoning_content,
    data?.choices?.[0]?.reasoning,
    data?.reasoning_content,
    data?.reasoning,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

function combineReplyContent(content, reasoning) {
  const normalizedContent = String(content || '').trim();
  const normalizedReasoning = String(reasoning || '').trim();

  if (normalizedReasoning && normalizedContent) {
    return `<think>\n${normalizedReasoning}\n</think>\n\n${normalizedContent}`;
  }
  if (normalizedReasoning) {
    return `<think>\n${normalizedReasoning}\n</think>`;
  }
  return normalizedContent;
}

function collectFoldTitles(raw) {
  const folds = [];
  let normalized = String(raw || '').replace(THINK_BLOCK_RE, (_, tagName, inner) => {
    folds.push({ title: tagName.toLowerCase() === 'think' || tagName.toLowerCase() === 'thinking' ? '思考内容' : `<${tagName}>`, body: String(inner || '').trim() });
    return '';
  });

  normalized = normalized.replace(GENERIC_TAG_BLOCK_RE, (_, tagName, inner) => {
    if (/^(think|thinking)$/i.test(tagName)) {
      return '';
    }
    folds.push({ title: `<${tagName}> 内容`, body: String(inner || '').trim() });
    return '';
  });

  return {
    visibleText: normalized.replace(/\n{3,}/g, '\n\n').trim(),
    folds,
  };
}

(function main() {
  const withThink = '你好\n<think>先分析一下</think>\n正式回复';
  assert(normalizeLooseText(stripThinkTags(withThink)) === '你好\n正式回复', 'stripThinkTags should remove inline think blocks');

  const apiReasoning = extractReasoningText({
    choices: [{ message: { content: '外层正文', reasoning_content: '这是思考' } }],
  });
  assert(apiReasoning === '这是思考', 'extractReasoningText should read reasoning_content');

  const combined = combineReplyContent('正式回复', '这是思考');
  assert(combined.includes('<think>'), 'combineReplyContent should wrap reasoning into think tag');
  assert(combined.includes('正式回复'), 'combineReplyContent should keep normal content');

  const folded = collectFoldTitles('开头<foo>标签内容</foo><thinking>思考片段</thinking>结尾');
  assert(folded.visibleText === '开头结尾', 'collectFoldTitles should keep non-tag visible text');
  assert(folded.folds.length === 2, 'collectFoldTitles should collect both generic and think folds');
  assert(folded.folds[0].title === '思考内容' || folded.folds[1].title === '思考内容', 'think fold title should be 思考内容');

  console.log('Think parser test passed.');
})();
