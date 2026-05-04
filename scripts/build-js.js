#!/usr/bin/env node
/**
 * @file scripts/build-js.js
 * @description 生成前端 JS 合并包，减少关键页面请求瀑布；当前只合并聊天页脚本。
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const notificationBundleFiles = [
  'public/js/notification/markdown-renderer.js',
  'public/js/notification-client.js',
];

const chatBundleFiles = [
  'public/js/chat/rich-renderer/formatting.js',
  'public/js/chat/rich-renderer/sanitizer.js',
  'public/js/chat/rich-renderer/folds.js',
  'public/js/chat/rich-renderer.js',
  'public/js/chat/dom-utils.js',
  'public/js/chat/bubbles.js',
  'public/js/chat/stream-client.js',
  'public/js/chat/message-menu.js',
  'public/js/chat/conversation-state.js',
  'public/js/chat/streaming-ui.js',
  'public/js/chat/compose-submit.js',
  'public/js/chat/optimize-submit.js',
  'public/js/chat/action-stream-submit.js',
  'public/js/chat/history-loader.js',
  'public/js/chat/controller.js',
];

function readWorkspaceFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8').trimEnd();
}

function buildBundle(outputRelativePath, sourceFiles) {
  const outputPath = path.join(ROOT, outputRelativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const banner = `/**\n * @file ${outputRelativePath}\n * @description Generated bundle. Do not edit directly; source order is defined in scripts/build-js.js.\n */\n`;
  const body = sourceFiles.map((sourceFile) => `\n;\n/* ${sourceFile} */\n${readWorkspaceFile(sourceFile)}\n`).join('\n');
  const content = `${banner}${body}`;
  fs.writeFileSync(outputPath, content);
  console.log(`[build-js] wrote ${outputRelativePath} (${Buffer.byteLength(content)} bytes)`);
}

buildBundle('public/js/generated/notification.bundle.js', notificationBundleFiles);
buildBundle('public/js/generated/chat.bundle.js', chatBundleFiles);
