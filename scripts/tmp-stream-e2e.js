#!/usr/bin/env node
/**
 * @file scripts/tmp-stream-e2e.js
 * @description
 * 临时流式聊天 E2E 调试脚本。
 *
 * 调用说明：
 * - 手动运行 `node scripts/tmp-stream-e2e.js`。
 * - 会使用 .env 中 APP_URL/DATABASE_URL，登录固定测试用户并请求流式接口。
 * - 这是排查聊天 NDJSON/最终落库问题的临时脚本，不应放进生产定时任务。
 */

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
const mysql = require('mysql2/promise');

const APP_URL = (process.env.APP_URL || 'http://127.0.0.1:3217').replace(/\/$/, '');
const USERNAME = 'stream_test_20260425';
const PASSWORD = 'StreamTest!20260425';
const CHARACTER_ID = 7;
const COOKIE_JAR = new Map();

function updateCookies(res) {
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const cookie of setCookies) {
    const first = String(cookie).split(';')[0];
    const idx = first.indexOf('=');
    if (idx > 0) COOKIE_JAR.set(first.slice(0, idx), first.slice(idx + 1));
  }
}
function cookieHeader() {
  return Array.from(COOKIE_JAR.entries()).map(([k,v]) => `${k}=${v}`).join('; ');
}
async function request(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const cookie = cookieHeader();
  if (cookie) headers.set('cookie', cookie);
  const res = await fetch(url, { ...options, headers, redirect: 'manual' });
  updateCookies(res);
  return res;
}
async function getText(url) {
  const res = await request(url);
  return { res, text: await res.text() };
}
async function postForm(url, form, extraHeaders = {}) {
  const body = new URLSearchParams(form);
  const headers = new Headers(extraHeaders);
  headers.set('content-type', 'application/x-www-form-urlencoded');
  return request(url, { method: 'POST', headers, body });
}
async function login() {
  const loginPage = await getText(`${APP_URL}/login`);
  if (loginPage.res.status !== 200) throw new Error(`login page status ${loginPage.res.status}`);
  const res = await postForm(`${APP_URL}/login`, { login: USERNAME, password: PASSWORD });
  if (![302,303].includes(res.status)) {
    const text = await res.text();
    throw new Error(`login failed status=${res.status} body=${text.slice(0,300)}`);
  }
}
async function startConversation() {
  const res = await postForm(`${APP_URL}/conversations/start/${CHARACTER_ID}`, { modelMode: 'standard' });
  if (![302,303].includes(res.status)) throw new Error(`start conversation status ${res.status}`);
  const location = res.headers.get('location') || '';
  const m = location.match(/\/chat\/(\d+)/);
  if (!m) throw new Error(`cannot parse conversation from ${location}`);
  return Number(m[1]);
}
async function consumeNdjson(url, form) {
  const res = await postForm(url, form, { accept: 'application/x-ndjson', 'x-requested-with': 'fetch' });
  const contentType = String(res.headers.get('content-type') || '').toLowerCase();
  if (res.status !== 200 || !contentType.includes('application/x-ndjson')) {
    const text = await res.text();
    throw new Error(`expected ndjson 200, got ${res.status} ${contentType} body=${text.slice(0,300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const packets = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      packets.push(JSON.parse(t));
    }
  }
  if (buffer.trim()) packets.push(JSON.parse(buffer.trim()));
  return packets;
}
function summarizePackets(name, packets) {
  const counts = packets.reduce((acc,p)=>{acc[p.type]=(acc[p.type]||0)+1; return acc;},{});
  const done = [...packets].reverse().find(p=>p.type==='done');
  const full = done?.full || '';
  return {
    name,
    counts,
    hasDone: Boolean(done),
    hasDelta: packets.some(p=>p.type==='delta'),
    hasLine: packets.some(p=>p.type==='line'),
    hasPing: packets.some(p=>p.type==='ping'),
    leafId: done?.leafId || done?.replyMessageId || null,
    fullPreview: String(full).replace(/\s+/g,' ').slice(0,120),
  };
}
async function queryDb(sql, params=[]) {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [rows] = await conn.query(sql, params);
  await conn.end();
  return rows;
}
(async()=>{
  const report = { appUrl: APP_URL };
  await login();
  report.login = 'ok';
  const conversationId = await startConversation();
  report.conversationId = conversationId;

  const msgText = `请你写三段内容，每段至少两句，并在末尾补一个列表项。测试ID:${crypto.randomUUID().slice(0,8)}`;
  const packets1 = await consumeNdjson(`${APP_URL}/chat/${conversationId}/message/stream`, { parentMessageId: '', content: msgText });
  report.messageStream = summarizePackets('message/stream', packets1);
  const leaf1 = report.messageStream.leafId;
  if (!leaf1) throw new Error('message stream missing leafId');

  const rows1 = await queryDb('SELECT id,sender_type,parent_message_id,prompt_kind FROM messages WHERE conversation_id=? ORDER BY id DESC LIMIT 8', [conversationId]);
  report.dbAfterMessage = rows1;

  const packets2 = await consumeNdjson(`${APP_URL}/chat/${conversationId}/regenerate/${leaf1}/stream`, {});
  report.regenerateStream = summarizePackets('regenerate/stream', packets2);
  const leaf2 = report.regenerateStream.leafId;
  if (!leaf2) throw new Error('regenerate stream missing leafId');

  const packets3 = await consumeNdjson(`${APP_URL}/chat/${conversationId}/messages/${leaf2}/replay/stream`, {});
  report.replayStream = summarizePackets('replay/stream', packets3);
  const leaf3 = report.replayStream.leafId;
  if (!leaf3) throw new Error('replay stream missing leafId');

  const packets4 = await consumeNdjson(`${APP_URL}/chat/${conversationId}/optimize-input/stream`, { parentMessageId: String(leaf3), content: '帮我把这句话改得更像自然对话，但不要太油腻。' });
  report.optimizeStream = summarizePackets('optimize-input/stream', packets4);

  const conv = await getText(`${APP_URL}/chat/${conversationId}?leaf=${leaf3}`);
  report.chatPageStatus = conv.res.status;
  report.chatPageContains = {
    conversation: conv.text.includes(`对话 #${conversationId}`),
    replayButton: conv.text.includes('从这里重算后续'),
    regenerateButton: conv.text.includes('重新生成候选'),
    optimizeBlock: conv.text.includes('优化输入'),
  };

  console.log(JSON.stringify(report, null, 2));
})().catch(err=>{
  console.error(err);
  process.exit(1);
});
