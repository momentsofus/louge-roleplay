/**
 * @file src/services/ai-service.js
 * @description AI 回复生成服务。优先调用兼容 OpenAI 的接口，未配置时返回本地 fallback 文本。
 */

const config = require('../config');
const logger = require('../lib/logger');

function buildPromptMessages({ character, messages, userMessage, systemHint = '' }) {
  return [
    {
      role: 'system',
      content: [
        `你现在正在进行角色扮演。角色名：${character.name}`,
        `角色简介：${character.summary || ''}`,
        `角色性格：${character.personality || ''}`,
        '请始终以该角色身份自然回复，避免脱离角色。',
        systemHint || '',
      ].filter(Boolean).join('\n'),
    },
    ...messages.slice(-24).map((message) => ({
      role: message.sender_type === 'user' ? 'user' : 'assistant',
      content: message.content,
    })),
    ...(userMessage
      ? [{ role: 'user', content: userMessage }]
      : []),
  ];
}

async function callProvider(promptMessages) {
  const response = await fetch(`${config.openaiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiModel,
      messages: promptMessages,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error('AI provider request failed', { status: response.status, text });
    throw new Error(`AI provider error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '……';
}

async function generateReply({ character, messages, userMessage, systemHint = '' }) {
  if (!config.openaiBaseUrl || !config.openaiApiKey || !config.openaiModel) {
    return `${character.name} 看着你，轻声说：我听见你说“${String(userMessage || '').slice(0, 120)}”。现在还没接上正式 AI 接口，所以我先陪你把网站流程跑通。`;
  }

  const promptMessages = buildPromptMessages({ character, messages, userMessage, systemHint });
  return callProvider(promptMessages);
}

async function optimizeUserInput({ character, messages, userInput }) {
  if (!config.openaiBaseUrl || !config.openaiApiKey || !config.openaiModel) {
    return `请帮我把下面这段输入润色得更清楚、更自然，同时保留原意和情绪：\n\n${String(userInput || '').trim()}`;
  }

  const promptMessages = buildPromptMessages({
    character,
    messages,
    systemHint: '你要帮用户优化输入内容。输出只给优化后的用户输入，不要解释，不要加引号。',
    userMessage: `原始输入：\n${String(userInput || '').trim()}`,
  });
  return callProvider(promptMessages);
}

module.exports = {
  generateReply,
  optimizeUserInput,
};
