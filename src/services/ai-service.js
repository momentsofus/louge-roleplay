/**
 * @file src/services/ai-service.js
 * @description AI 回复生成服务。优先调用兼容 OpenAI 的接口，未配置时返回本地 fallback 文本。
 */

const config = require('../config');
const logger = require('../lib/logger');

async function generateReply({ character, messages, userMessage }) {
  if (!config.openaiBaseUrl || !config.openaiApiKey || !config.openaiModel) {
    return `${character.name} 看着你，轻声说：我听见你说“${userMessage.slice(0, 120)}”。现在还没接上正式 AI 接口，所以我先陪你把网站流程跑通。`;
  }

  const promptMessages = [
    {
      role: 'system',
      content: `你现在正在进行角色扮演。角色名：${character.name}\n角色简介：${character.summary || ''}\n角色性格：${character.personality || ''}\n请始终以该角色身份自然回复，避免脱离角色。`,
    },
    ...messages.slice(-12).map((message) => ({
      role: message.sender_type === 'user' ? 'user' : 'assistant',
      content: message.content,
    })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

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

module.exports = {
  generateReply,
};
