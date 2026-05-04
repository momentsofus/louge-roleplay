# 函数与调用说明索引

> 本文档由 `scripts/update-docs-debug.js` 生成，用于满足“每个文件、每个函数都有介绍和调用说明”的维护需求。真正复杂的函数仍建议在源码附近补充 JSDoc。

## `public/js/admin-page.js`

后台交互：套餐字段切换、Prompt 片段排序/预览、后台列表过滤。

| 函数 | 介绍与调用说明 |
|---|---|
| `apply` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `applyFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `applyModelFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `applyPresetModelFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `applyPresetPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatPromptSection` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getItems` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `moveItem` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalize` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setupPlanModelRow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `syncDefaultValue` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `syncOrder` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/character-editor-page.js`

角色编辑器动态字段：提示词条目增删、排序、预览。

| 函数 | 介绍与调用说明 |
|---|---|
| `bindItem` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createItem` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `refreshOrders` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat-page.js`

聊天页兼容入口：保留历史文件名，实际聊天逻辑已拆到 public/js/chat/ 并由 build-js 生成 chat.bundle.js。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `public/js/chat/action-stream-submit.js`

重新生成、从这里重写等消息操作表单的流式提交绑定。

| 函数 | 介绍与调用说明 |
|---|---|
| `bind` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/bubbles.js`

聊天页气泡 DOM 创建、临时流式气泡追加与 HTML 替换工具。

| 函数 | 介绍与调用说明 |
|---|---|
| `appendSingleStreamingBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `appendStreamingPair` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createChatBubbles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `removeLivePair` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `replaceBubbleWithHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `replacePreviousLiveUserBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/compose-submit.js`

主聊天输入框流式提交与 Enter 快捷键绑定。

| 函数 | 介绍与调用说明 |
|---|---|
| `bind` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handleMainComposeSubmit` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handlePageAbort` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isMobileLikeInputDevice` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/controller.js`

聊天页前端装配入口：初始化 DOM 工具、状态管理、流式 UI、表单提交、历史加载和消息操作。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `public/js/chat/conversation-state.js`

聊天页 URL leaf、父消息隐藏字段、可见消息计数与旧尾巴清理。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyInitialUrlState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collapseOldRenderedMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `create` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureStartMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `reloadToMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `removeStaleLinearTail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateChatCounts` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateCurrentMessageState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateHiddenParentInputs` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/dom-utils.js`

聊天页 DOM 小工具：滚动判断、菜单收起、toast、富文本挂载等。

| 函数 | 介绍与调用说明 |
|---|---|
| `closeMessageMenus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeSiblingMessageMenus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createFragmentFromHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hydrateRichContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isNearPageBottom` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderStreamingPlainText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showToast` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/history-loader.js`

聊天页“查看更早消息”懒加载与滚动位置保持。

| 函数 | 介绍与调用说明 |
|---|---|
| `bind` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `loadOlderMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/message-menu.js`

聊天消息操作区：点击消息上的“⋯”，在对应消息上方插入轻量上下文操作卡。

| 函数 | 介绍与调用说明 |
|---|---|
| `closeActions` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getExistingDock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderActionsFor` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setActiveMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/optimize-submit.js`

润色输入表单的流式提交绑定。

| 函数 | 介绍与调用说明 |
|---|---|
| `bind` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/rich-renderer.js`

聊天消息富文本渲染入口。核心实现拆分在 public/js/chat/rich-renderer/。

| 函数 | 介绍与调用说明 |
|---|---|
| `renderRichContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/rich-renderer/folds.js`

聊天富文本折叠块工具：收集 think/thinking/reasoning 等可折叠内容并生成展示 DOM。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildFold` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectFoldBlocks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/rich-renderer/formatting.js`

聊天富文本格式化工具：Markdown 行规整、表格解析、引用高亮和 streaming 分段。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyInlineMarkdown` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildStreamingPreviewHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `flushParagraph` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBlank` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBullet` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isFencePlaceholder` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isHr` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isOrdered` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoteMarkerOnly` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoted` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markdownToHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markdownToPartialHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMarkdownLines` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTableCells` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseHeading` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseTableSeparator` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderTableCell` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `splitTableRow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `tryParseTable` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/rich-renderer/sanitizer.js`

聊天富文本安全净化工具：限制 HTML 标签、属性、URL 和 CSS，避免消息内容注入危险 DOM。

| 函数 | 介绍与调用说明 |
|---|---|
| `acceptNode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectQuoteMatches` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findClosingQuote` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findQuoteToken` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `highlightQuotesInNodeTree` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sanitizeCss` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sanitizeNodeTree` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/stream-client.js`

聊天页 NDJSON 流式请求消费器。

| 函数 | 介绍与调用说明 |
|---|---|
| `consumeNdjsonStream` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createStreamClient` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handlePacket` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `message` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/chat/streaming-ui.js`

聊天页流式渲染调度、自动跟随滚动和气泡最终态处理。

| 函数 | 介绍与调用说明 |
|---|---|
| `beginStreamingAutoFollow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `bindAutoFollowRelease` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `create` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `maybeFollowStreamingBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `releaseStreamingAutoFollow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `scheduleStreamingRender` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setBubbleFinalState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `splitStreamingSegments` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/csrf.js`

自动为同源 POST 表单与 fetch 请求附加 CSRF token。

| 函数 | 介绍与调用说明 |
|---|---|
| `attachCsrfToForms` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/error-page.js`

错误页脚本；当前客服入口由 notification-client 的 data-open-support 委托统一处理。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `public/js/form-guards.js`

CSP 兼容的全局表单保护：替代模板里的 inline onsubmit confirm。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `public/js/generated/chat.bundle.js`

Generated bundle. Do not edit directly; source order is defined in scripts/build-js.js.

| 函数 | 介绍与调用说明 |
|---|---|
| `acceptNode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `appendSingleStreamingBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `appendStreamingPair` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `applyInitialUrlState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `applyInlineMarkdown` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `beginStreamingAutoFollow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `bind` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `bindAutoFollowRelease` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildFold` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildStreamingPreviewHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeActions` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeMessageMenus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeSiblingMessageMenus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collapseOldRenderedMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectFoldBlocks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectQuoteMatches` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `consumeNdjsonStream` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `create` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createChatBubbles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createFragmentFromHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createStreamClient` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureStartMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findClosingQuote` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findQuoteToken` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `flushParagraph` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getExistingDock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handleMainComposeSubmit` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handlePacket` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handlePageAbort` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `highlightQuotesInNodeTree` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hydrateRichContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBlank` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBullet` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isFencePlaceholder` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isHr` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isMobileLikeInputDevice` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isNearPageBottom` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isOrdered` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoteMarkerOnly` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoted` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `loadOlderMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markdownToHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markdownToPartialHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `maybeFollowStreamingBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `message` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMarkdownLines` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTableCells` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseHeading` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseTableSeparator` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `releaseStreamingAutoFollow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `reloadToMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `removeLivePair` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `removeStaleLinearTail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderActionsFor` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderRichContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderStreamingPlainText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderTableCell` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `replaceBubbleWithHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `replacePreviousLiveUserBubble` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sanitizeCss` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sanitizeNodeTree` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `scheduleStreamingRender` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setActiveMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setBubbleFinalState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showToast` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `splitStreamingSegments` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `splitTableRow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `tryParseTable` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateChatCounts` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateCurrentMessageState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateHiddenParentInputs` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/generated/notification.bundle.js`

Generated bundle. Do not edit directly; source order is defined in scripts/build-js.js.

| 函数 | 介绍与调用说明 |
|---|---|
| `applyInlineMarkdown` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildSupportQr` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeActiveOverlay` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `flushParagraph` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hasSeen` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBlank` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBullet` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isFencePlaceholder` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isHr` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isOrdered` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoteMarkerOnly` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoted` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isSafeHttpUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markSeen` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markdownToHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMarkdownLines` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseHeading` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `qrImageUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderBanner` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderMarkdownInto` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderModal` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderToast` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showInitialNotifications` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showNotification` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showSupport` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `storageKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `text` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/i18n-runtime.js`

浏览器端轻量 t() 翻译函数，供页面脚本复用。

| 函数 | 介绍与调用说明 |
|---|---|
| `interpolate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `t` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/layout-bootstrap.js`

全站前端 bootstrap。由 layout 注入 JSON 数据，本文件负责挂到 window。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `public/js/live-reload-client.js`

Development live reload client. CSS changes swap stylesheets; JS/EJS changes reload the page.

| 函数 | 介绍与调用说明 |
|---|---|
| `connect` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handlePayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `reloadCss` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `withVersion` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/notification-client.js`

前台站内通知与客服入口控制器：展示 modal/toast/banner、showOnce 记录、客服拉取，并暴露 window.LougeNotifications。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildSupportQr` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeActiveOverlay` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hasSeen` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markSeen` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `qrImageUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderBanner` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderModal` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderToast` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showInitialNotifications` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showNotification` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showSupport` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `storageKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `text` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/notification/markdown-renderer.js`

前台通知 Markdown 降级渲染工具：服务端 bodyHtml 优先，本模块只在缺少 bodyHtml 时兜底渲染。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyInlineMarkdown` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `flushParagraph` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBlank` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBullet` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isFencePlaceholder` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isHr` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isOrdered` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoteMarkerOnly` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoted` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isSafeHttpUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markdownToHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMarkdownLines` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseHeading` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderMarkdownInto` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `text` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/profile-page.js`

个人资料页验证码刷新、邮箱验证码和短信验证码发送交互。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyCaptchaRefreshFromResponse` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCaptchaPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `refreshCaptcha` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sendEmailCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sendPhoneCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showCaptchaHint` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `unwrapApiPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/quota-bars.js`

将 data-width 百分比应用到额度条，避免 inline style 违反 CSP。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyQuotaBars` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/register-config.js`

注册页认证配置 bootstrap，避免 inline script 违反 CSP。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `public/js/register-page.js`

注册页交互：国家/地区切换、验证码刷新、邮箱/手机验证码发送。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyCaptchaRefreshFromResponse` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCountryType` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handleCountryChange` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `init` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `refreshCaptcha` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sendEmailCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sendPhoneCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showCaptchaHint` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `syncCountryCards` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `toggleEmailBlock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `unwrapApiPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/site-message-client.js`

站内信未读状态实时轮询与轻量提醒。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureBadge` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `refreshStatus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `showInboxToast` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateBadge` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `public/js/tag-input.js`

可复用标签输入增强：逗号/回车生成标签 chip，保留原始 input 提交兼容。

| 函数 | 介绍与调用说明 |
|---|---|
| `addFromEditor` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `addTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `boot` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `enhance` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTag` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `render` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `syncHiddenInput` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/backfill-character-stats.js`

从明细表回填 characters 上的公开统计缓存字段，供列表/首页快速排序。

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/build-css.js`

将 public/styles/site-pages.src.css 中的本地 @import 递归内联到 site-pages.css，减少首屏 CSS 串行请求。

| 函数 | 介绍与调用说明 |
|---|---|
| `expandCss` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/build-js.js`

生成前端 JS 合并包，减少关键页面请求瀑布；当前只合并聊天页脚本。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildBundle` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readWorkspaceFile` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/check-i18n-completeness.js`

检查楼阁项目 i18n 词典是否覆盖已登记 key，并扫描页面/前端脚本残留中文文案，帮助持续补全国际化。 调用说明：npm run i18n:check。脚本只读文件，发现缺失时以非 0 退出。

| 函数 | 介绍与调用说明 |
|---|---|
| `add` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectChineseLiterals` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectTKeys` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isInsideTCall` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeLiteral` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `printList` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `shouldIgnoreLiteral` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `walk` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/full-flow-e2e.js`

全流程 E2E 测试脚本：创建临时用户/角色/会话，验证当前显示链、LLM 流式、后台查询、日志和删除保护，结束后清理测试数据。

| 函数 | 介绍与调用说明 |
|---|---|
| `cleanupCreatedData` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `makeMockResponse` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `onDelta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `redirect` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `render` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `send` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `status` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `type` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/grant-admin.js`

手动授予管理员权限。只允许本机显式执行，不走隐式自动提权。 用法：node scripts/grant-admin.js <username>

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/health-check.js`

基础健康检查：配置、数据库、Redis、公开 HTTP 页面。

| 函数 | 介绍与调用说明 |
|---|---|
| `checkDatabase` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `checkRedis` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `fetchStatus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/import-curated-tavern-cards-2026-05-02.js`

Curated Louge-ready Tavern-style role cards from the 2026-05-02 request.

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureImageCopied` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getAdminUserId` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `upsertCard` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/init-db.js`

数据库初始化脚本。根据当前配置自动选择初始化策略： MySQL 模式（DATABASE_URL 已设置）： - 使用 DATABASE_ADMIN_URL 创建数据库（若不存在） - 创建全部业务表并补全历史缺失字段/索引（幂等，可反复执行） - 写入默认套餐与 LLM 提供商种子数据 SQLite 模式（DATABASE_URL 未设置）： - 表结构由 db.js 在首次连接时自动初始化，此脚本无需额外操作 - 数据库文件路径：<项目根>/data/local.db 使用方式： npm run db:init 或 node scripts/init-db.js

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/init-db/character-chat-schema.js`

MySQL 角色、标签、Tavern 导入、会话与消息相关表结构初始化。函数均为幂等补表/补列/补索引工具，由 scripts/init-db.js 调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureCharacterSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureChatSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/init-db/core-schema.js`

MySQL 用户、套餐、Provider、通知、站内信等核心表结构初始化。新增核心业务字段时优先同步本文件。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureMessagingAndProviderSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureUsersAndPlans` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/init-db/helpers.js`

MySQL schema 维护辅助函数，封装 ensureColumn/ensureIndex/ensureUniqueIndex 等幂等 ALTER 操作。

| 函数 | 介绍与调用说明 |
|---|---|
| `createSchemaHelpers` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureIndex` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureUniqueIndex` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/init-db/migrations.js`

数据库历史迁移补丁：用户 public_id 回填、套餐模型配置迁移到 preset_models 等。由 db:init 在建表后执行。

| 函数 | 介绍与调用说明 |
|---|---|
| `backfillUserPublicIds` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `exists` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `migratePresetModelsFromPlans` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/init-db/seeds.js`

默认种子数据写入：初始套餐、旧 OpenAI-compatible Provider 兜底配置与套餐模型 JSON 回填。

| 函数 | 介绍与调用说明 |
|---|---|
| `seedDefaults` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/init-db/utils.js`

db:init 专用工具函数：数据库名解析、标识符转义、API Key 脱敏、模型 key/label 规整与随机数字生成。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildLegacyPlanModelsJson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildPresetModelLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getDatabaseNameFromUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getRandomDigits` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `maskApiKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `mergePresetLabels` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeModelKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `quoteIdentifier` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/security-audit.js`

Lightweight production risk audit for configuration, dependency, and source-level guardrails.

| 函数 | 介绍与调用说明 |
|---|---|
| `listFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `runNpmAudit` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `scanSource` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `statusLine` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/smoke-test.js`

生产冒烟检查：只做只读探测，不写业务数据。

| 函数 | 介绍与调用说明 |
|---|---|
| `assert` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `fetchText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-admin-conversations.js`

后台全局对话记录查询冒烟测试。调用说明：`npm run admin-conversations:test`，验证服务查询、筛选和 EJS 模板渲染。

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `t` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-admin-logs-route.js`

管理后台日志页模板冒烟测试。调用说明：`npm run admin-logs:test`，验证日志查询结果能正常渲染为后台 UI。

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `t` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-admin-users-page.js`

Smoke test for admin user management cards, quota snapshots and page render.

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-character-delete-service.js`

回归验证用户侧角色删除：无对话角色可删除，有对话角色受保护，图片清理函数引用可用。

| 函数 | 介绍与调用说明 |
|---|---|
| `cleanupCreatedData` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createOwnedUploadFixture` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createTestUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-character-tags.js`

Regression tests for character tag normalization and Simplified/Traditional Chinese search compatibility.

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `scripts/test-chat-rich-markdown.js`

Smoke test for the browser chat Markdown renderer.

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `scripts/test-conversation-service.js`

Conversation service regression tests for linear chat refactor behavior.

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-error-handler.js`

验证全局错误映射与错误页客服提示渲染，覆盖大文本表单导致的 413 降级场景。

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-log-service.js`

日志解析服务冒烟测试。调用说明：`npm run logs:test`，用于确认后台日志分页/筛选基础逻辑可用。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `scripts/test-markdown-service.js`

Smoke test for safe Markdown rendering in notifications and site mail.

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `scripts/test-model-entitlements.js`

Focused tests for plan model entitlement normalization and admin form parsing.

| 函数 | 介绍与调用说明 |
|---|---|
| `testFormParsing` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `testNormalizationAndBilling` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `testSerializationAndFallback` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-prompt-route.js`

Prompt 路由/LLM 网关的轻量单元测试。 调用说明： - `npm run test:prompt-route` 执行。 - 通过 monkey patch Module._load 隔离外部依赖，只验证 prompt 构造与路由调用契约。

| 函数 | 介绍与调用说明 |
|---|---|
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-prompt-template.js`

覆盖楼阁/Tavern 常见运行时占位符解析。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `scripts/test-quote-highlighting.js`

Smoke test for chat quote highlighting match collection.

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `scripts/test-site-message-service.js`

Regression checks for global site messages, revoke behavior, and admin history counts.

| 函数 | 介绍与调用说明 |
|---|---|
| `assert` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `insertUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-tavern-import-tags-nsfw.js`

覆盖酒馆卡解析/导入、标签 AND/OR、NSFW 隐藏、世界书压平与 PNG 图片不导入头像的回归测试。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildPngCard` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `cleanup` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `crc32` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureTestAdmin` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `pngChunk` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `toImportPreviewTokenPath` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/test-think-parser.js`

最小回归测试：验证 think/reasoning 解析与展示规则的关键正则行为。

| 函数 | 介绍与调用说明 |
|---|---|
| `assert` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectFoldTitles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `combineReplyContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractReasoningText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeLooseText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `stripThinkTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/tmp-stream-e2e.js`

临时流式聊天 E2E 调试脚本。 调用说明： - 手动运行 `node scripts/tmp-stream-e2e.js`。 - 会使用 .env 中 APP_URL/DATABASE_URL，登录固定测试用户并请求流式接口。 - 这是排查聊天 NDJSON/最终落库问题的临时脚本，不应放进生产定时任务。

| 函数 | 介绍与调用说明 |
|---|---|
| `consumeNdjson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `cookieHeader` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `login` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `postForm` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `queryDb` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `request` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `startConversation` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `summarizePackets` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateCookies` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/update-docs-debug.js`

一次性维护脚本：为 ai-roleplay-site 生成/刷新项目梳理文档、注释索引与调试说明。 使用场景： - 大规模代码梳理时，避免手工复制每个函数/文件说明。 - 新增 JS/EJS/CSS 文件后，可重新运行本脚本同步 docs/PROJECT_MAP.md 与 docs/FUNCTION_REFERENCE.md。 调用方式： node scripts/update-docs-debug.js 注意： - 该脚本只写 Markdown 文档，不改业务代码。 - 不读取 .env，不输出任何密钥。

| 函数 | 介绍与调用说明 |
|---|---|
| `extractFileDescription` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractFunctions` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `functionNote` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `generateDebugGuide` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `generateFunctionReference` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `generateProjectMap` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `main` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `read` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `visit` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `walk` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `write` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `scripts/version-check.js`

Validate project version metadata before release/tagging.

| 函数 | 介绍与调用说明 |
|---|---|
| `fail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `maybeExec` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ok` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readJson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/config.js`

环境变量解析与隐私安全配置摘要。被 server、service、脚本读取。

| 函数 | 介绍与调用说明 |
|---|---|
| `getPrivacySafeSummary` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `maskSecret` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readBool` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readString` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/constants/character-limits.js`

角色卡字段长度上限与裁剪工具。

| 函数 | 介绍与调用说明 |
|---|---|
| `clampCharacterField` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/i18n.js`

服务端/客户端共用国际化词典与 HTML 文本翻译工具。被 i18n 中间件和渲染层调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildLocaleSwitchLinks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getClientMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getLocaleMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `interpolate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeLocale` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `pickFromAcceptLanguage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `resolveLocale` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `translate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `translateHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `translateTagAttributes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `translateTextSegment` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/i18n/messages.en.js`

English UI translations for server-rendered pages and browser scripts.

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `src/i18n/messages.zh-CN.js`

中文界面文案词典，供服务端页面和前端脚本共享。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `src/i18n/messages.zh-TW.js`

繁體中文界面文案詞典，供服務端頁面和前端腳本共享。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `src/lib/db-sqlite-schema.js`

SQLite 初始化 schema 与种子数据，供 db.js 首次创建本地库时调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `initSqliteSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/db.js`

数据库抽象层，MySQL 优先、SQLite 兜底，提供 query/withTransaction。所有 service 的 DB 入口。

| 函数 | 介绍与调用说明 |
|---|---|
| `getDbType` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `initMySQL` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `initSQLite` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `initialize` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `query` | 执行 SQL，自动等待数据库初始化并适配 MySQL/SQLite 返回格式。 |
| `sqliteExec` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `toSqliteDialect` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `waitReady` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `withTransaction` | 以 MySQL/SQLite 兼容形式执行事务回调。 |

## `src/lib/logger.js`

统一结构化日志输出，支持 LOG_LEVEL 过滤和 DEBUG 开关。所有后端模块应通过它写日志。

| 函数 | 介绍与调用说明 |
|---|---|
| `debug` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `error` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatMeta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `info` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `log` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `redactString` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sanitizeLogMeta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `shouldLog` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `warn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/redis.js`

Redis 客户端与内存降级实现，供 session、验证码、缓存、限流使用。

| 函数 | 介绍与调用说明 |
|---|---|
| `_isExpired` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `constructor` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `get` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `initRedis` | 初始化 Redis；失败或未配置时降级到内存客户端。 |
| `isRedisReal` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `on` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `set` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/characters-conversations.js`

角色、互动事件、会话与消息表结构。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureSqliteCharacterConversationSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqliteCharactersVisibilityColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqliteColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/llm.js`

LLM 提供商、任务队列与用量日志 SQLite 结构。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureSqliteColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqliteLlmSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/plans.js`

套餐表结构与模型权益字段补列。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureSqliteColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqlitePlansSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/prompts-notifications.js`

系统提示词片段、站内通知与客服入口表结构。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureSqliteColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqlitePromptNotificationSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/seed.js`

默认套餐、默认 LLM provider 与旧套餐模型权益回填。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildLegacyPlanModelsJson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `fallbackKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `fallbackLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `maskApiKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `migratePresetModelsFromPlansSqlite` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `seedSqliteDefaults` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/site-messages.js`

站内信与收件人状态表结构。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureSqliteSiteMessageSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/subscriptions.js`

用户订阅表结构与用户状态索引。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureSqliteSubscriptionsSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/sqlite-schema/users.js`

用户表结构、public_id 补列与历史用户 public_id 回填。

| 函数 | 介绍与调用说明 |
|---|---|
| `backfillSqliteUserPublicIds` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqliteColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqliteUniqueIndex` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqliteUsersSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `exists` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getRandomDigitsForSqliteBackfill` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/url-safety.js`

外部服务 URL 安全校验，避免 Provider Base URL 被用于 SSRF/内网探测。

| 函数 | 介绍与调用说明 |
|---|---|
| `assertSafeExternalHttpUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `assertSafeHttpsUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isPrivateIp` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isPrivateIpv4` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isPrivateIpv6` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/lib/user-public-id.js`

用户公开唯一 ID 生成工具。公开 ID 从三位起步，无固定上限。

| 函数 | 介绍与调用说明 |
|---|---|
| `generateUniqueUserPublicId` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getRandomDigits` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/middleware/auth.js`

登录/管理员鉴权中间件，保护 dashboard/admin/chat 等页面。

| 函数 | 介绍与调用说明 |
|---|---|
| `requireAdmin` | 要求管理员；非管理员记录警告并展示无权限页。 |
| `requireAuth` | 要求登录；未登录跳转 /login。 |

## `src/middleware/csrf.js`

基于 session 的轻量 CSRF 防护。优先校验 token；为避免上线时旧页面脚本瞬断，允许同源 Origin/Referer 兜底。

| 函数 | 介绍与调用说明 |
|---|---|
| `createCsrfToken` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `csrfProtection` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getExpectedOrigin` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getSubmittedToken` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hasSameOriginSignal` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isSameOrigin` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `safeCompare` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/middleware/error-handler.js`

全局错误转译与错误页渲染，避免向页面泄露堆栈。

| 函数 | 介绍与调用说明 |
|---|---|
| `errorHandler` | 全局错误处理中间件；记录日志并按错误类型展示友好消息。 |
| `mapErrorToPresentation` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderErrorWithLayout` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/middleware/i18n.js`

根据 query/cookie/Accept-Language 解析语言，并向 req/res.locals 注入 t()。

| 函数 | 介绍与调用说明 |
|---|---|
| `attachI18n` | 解析 locale，挂载 req.t/res.locals.t 和客户端词典。 |

## `src/middleware/request-context.js`

为每个请求注入 requestId/currentUser，后续日志和错误页用它串联。

| 函数 | 介绍与调用说明 |
|---|---|
| `requestContext` | 为请求生成 requestId，写入 req 和 res.locals。 |

## `src/routes/web-routes.js`

主 Web 路由注册文件：公开页、认证、后台、角色、线性聊天、重写/编辑/流式接口。依赖 service 层完成业务。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerWebRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `resolveAllowedInitialModelMode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin-routes.js`

管理后台路由聚合器。具体页面/表单路由拆分在 `src/routes/web/admin/`，本文件只保持注册顺序。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/admin-route-utils.js`

管理后台路由共享小工具：表单校验错误识别和分页 URL 拼装。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildPageUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isValidationError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/character-routes.js`

管理后台全局角色卡列表、禁用、删除与角色卡关联对话入口路由。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildAdminCharactersRedirect` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `registerAdminCharacterRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/conversation-routes.js`

管理后台全局对话审计、软删除恢复与永久删除路由。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminConversationRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/dashboard-routes.js`

管理后台首页路由，展示概览、用户与套餐摘要。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminDashboardRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/log-routes.js`

管理后台日志查询页路由，支持日期、等级、文件、错误类型和函数名筛选。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminLogRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/notification-routes.js`

管理后台通知中心与前台客服通知查询接口。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminNotificationRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/plan-routes.js`

管理后台套餐列表、新增、更新与删除路由，包含模型权益配置校验。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminPlanRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/preset-model-routes.js`

Admin preset model catalog routes.

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminPresetModelRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/prompt-routes.js`

管理后台全局 Prompt 片段预览、创建、排序、更新与删除路由。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminPromptRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/provider-routes.js`

管理后台 LLM Provider 列表、新增与更新路由。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminProviderRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/site-message-routes.js`

管理后台站内信投递与历史查询路由。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminSiteMessageRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/admin/user-routes.js`

管理后台用户角色与套餐调整路由。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAdminUserRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/auth-routes.js`

认证与个人中心路由聚合器。具体实现拆分在 `src/routes/web/auth/`。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAuthRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/auth/dashboard-routes.js`

用户控制台路由，汇总角色、会话、套餐和额度快照。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAuthDashboardRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/auth/profile-routes.js`

个人资料维护路由，支持用户名、邮箱、手机和密码变更。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAuthProfileRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderProfileMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/auth/register-routes.js`

用户注册提交路由，包含地区、邮箱/手机验证码和默认登录态建立。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildFormState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `registerAuthRegisterRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `registerLogMeta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderRegisterError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/auth/session-routes.js`

登录、登出路由，包含 IP 限流和失败原因脱敏日志。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAuthSessionRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/auth/site-message-routes.js`

用户站内信收件箱与实时轮询接口。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerAuthSiteMessageRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/auth/verification-routes.js`

邮箱/手机验证码发送接口，统一在响应后刷新图形验证码以降低重放风险。

| 函数 | 介绍与调用说明 |
|---|---|
| `refreshAndRespond` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `registerAuthVerificationRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/character-routes.js`

从 web-routes.js 拆出的路由分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerCharacterRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat-routes.js`

聊天路由聚合：页面、发送、重生、编辑、重写、工具。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerChatRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat-stream-utils.js`

聊天流式接口的 NDJSON 响应工具：错误文案映射、消息片段渲染、流式行切分与中断兜底。 设计约束： - 只被 web 路由层调用，避免 service 层依赖 Express response。 - `safeWrite` 必须在连接关闭后静默失败，防止客户端断开导致二次异常。 - 用户主动断开但已有部分模型输出时，优先保留已生成内容，避免“写了半天全没了”。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildChatMessagePacket` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildConversationCharacterPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `cleanup` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createNdjsonResponder` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createStreamingLineWriter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `flush` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `mapLlmErrorToUserMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `onDelta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderChatMessageHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `safeWrite` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `streamChatReplyToNdjson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `streamOptimizedInputToNdjson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat/edit-routes.js`

聊天路由子分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerChatEditRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat/message-routes.js`

聊天路由子分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerChatMessageRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat/page-routes.js`

聊天路由子分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerChatPageRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat/regenerate-routes.js`

聊天路由子分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerChatRegenerateRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat/replay-routes.js`

聊天路由子分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerChatReplayRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/chat/tool-routes.js`

聊天路由子分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `registerChatToolRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/routes/web/public-routes.js`

从 web-routes.js 拆出的路由分组。

| 函数 | 介绍与调用说明 |
|---|---|
| `canShowNsfw` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getSameOriginBackUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `registerPublicRoutes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/server-helpers.js`

路由公共辅助：页面渲染、参数解析、账号脱敏、聊天页 view model、NDJSON 输出。被 web-routes.js 调用。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `src/server-helpers/character-prompt-profile.js`

角色 Prompt Profile 表单与存储格式转换，供角色编辑页和路由层复用。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildCharacterPromptProfileFromForm` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `splitCharacterPromptProfile` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/server-helpers/chat-view.js`

聊天页 view model、对话标题和会话加载辅助。保持路由层薄一点，避免把页面状态散落到各聊天子路由。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildChatRequestContext` | 根据当前会话/父消息/输入，计算聊天 promptKind 和历史上下文。 |
| `buildConversationTitle` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildNextConversationTitle` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `loadConversationForUserOrFail` | 按当前用户加载会话；不存在时直接渲染提示页并返回 null。 |
| `renderChatPage` | 加载当前显示链、计算可见消息，渲染线性聊天页。 |

## `src/server-helpers/navigation.js`

Central navigation definitions for shared layout/admin pages.

| 函数 | 介绍与调用说明 |
|---|---|
| `getAdminHubItems` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getAdminNavItems` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getLayoutNavItems` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `translateItems` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/server-helpers/ndjson.js`

NDJSON 流响应基础工具。只负责 Express response 头和单包写入，不包含聊天业务语义。

| 函数 | 介绍与调用说明 |
|---|---|
| `initNdjsonStream` | 初始化流式响应头，关闭代理缓冲。 |
| `writeNdjson` | 向响应写入一行 NDJSON，并在支持时 flush。 |

## `src/server-helpers/parsing.js`

路由层参数解析与基础账号格式校验。外部输入必须显式校验，避免 `Number(...) || 0` 把非法值静默吞掉。

| 函数 | 介绍与调用说明 |
|---|---|
| `isAllowedInternationalEmail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isDomesticPhone` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isEmail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseIdParam` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseIntegerField` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseNumberField` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/server-helpers/rendering.js`

EJS 页面渲染、默认 meta 与通用提示页封装。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildAbsoluteUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildDefaultMeta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCachedClientNotificationBootstrap` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCachedUnreadSiteMessageCount` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `inferNotificationPageScope` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderPage` | 统一渲染业务视图并套 layout；调用方传 res/view/params，内部负责 i18n 翻译和渲染失败兜底。 |
| `renderRegisterPage` | 渲染注册页并注入验证码、表单状态和公开手机号认证配置。 |
| `renderValidationMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/server-helpers/request-meta.js`

请求来源与账号标识脱敏工具。日志只记录可排障信息，不写入完整邮箱/手机号/密码等敏感值。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildLoginLogMeta` | 生成登录流程结构化日志 meta。 |
| `buildRegisterLogMeta` | 生成注册流程结构化日志 meta。 |
| `getClientIp` | 从 x-forwarded-for/socket 提取客户端 IP；主要用于限流和日志。 |
| `maskEmail` | 脱敏邮箱，日志中只保留少量可定位信息。 |
| `maskPhone` | 脱敏手机号，日志中只保留前三后四。 |

## `src/server-helpers/view-models.js`

Shared view model helpers so pages render dates, numbers, roles, statuses and JSON responses consistently.

| 函数 | 介绍与调用说明 |
|---|---|
| `accountStatusLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `apiError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `apiOk` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `billingModeLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatDateTime` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatNumber` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `quotaPeriodLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `roleLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `safeNumber` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `statusLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/server.js`

Express 启动入口：等待 DB/Redis、装配全局中间件、注册路由、启动监听。调用链起点。

| 函数 | 介绍与调用说明 |
|---|---|
| `bootstrap` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildCspDirectives` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `nonceValue` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setHeaders` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `shutdown` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `write` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/admin-character-service.js`

管理后台全局角色卡查询、禁用、删除与关联对话入口服务。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildCharacterWhere` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deleteAdminCharacter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureCharactersStatusEnumSupportsBlocked` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatDateTime` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getAdminCharacterById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getAdminCharacterDetail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCharacterFilterStats` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listAdminCharacters` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listCharacterFilterUsers` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeKeyword` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePositiveInteger` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeStatusFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeVisibilityFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parsePromptProfileItems` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `trimPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateAdminCharacterStatus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/admin-conversation-service.js`

管理后台全局对话记录查询服务。 调用说明： - `src/routes/web-routes.js` 的 `/admin/conversations` 调用 `listAdminConversations()` 渲染全局会话列表。 - `src/routes/web-routes.js` 的 `/admin/conversations/:id` 调用 `getAdminConversationDetail()` 查看单条会话完整消息。 - 支持按用户、角色卡、日期和删除状态筛选；后台可以恢复或永久删除软删除数据。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildConversationWhere` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatDateTime` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getAdminConversationDetail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getConversationFilterStats` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listAdminConversations` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listConversationFilterOptions` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeDate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePositiveInteger` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeStatusFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `permanentlyDeleteConversation` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `permanentlyDeleteMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `restoreConversation` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `restoreMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `trimPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/admin-service.js`

后台首页聚合查询：用户套餐、Provider 列表、概览统计。

| 函数 | 介绍与调用说明 |
|---|---|
| `attachUserQuotaSnapshots` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildStaleJobCutoff` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `calculateQuotaPercent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatDateTimeForDb` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getAdminOverview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getQuotaState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getUserBusinessDataCounts` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hasUserBusinessData` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listProviders` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listUsersWithPlans` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `pad` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `safelyDeleteUserById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/ai-service.js`

旧版直连 OpenAI 兼容接口服务；新路径优先使用 llm-gateway-service。

| 函数 | 介绍与调用说明 |
|---|---|
| `appendContentDelta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `appendReasoningDelta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildOptimizePromptMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildPromptMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildRuntimeContext` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `callProvider` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeReasoningIfNeeded` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `combineReplyContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractMessageContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractReasoningText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `generateReply` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handleSseBlock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTextContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `optimizeUserInput` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseStreamDelta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `shouldAppendUserMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `stripThinkTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/aliyun-sms-service.js`

阿里云短信验证码发送封装。被 verification-service 调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `createClient` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sendLoginCodeSms` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/captcha-service.js`

图形验证码生成、刷新、读取与校验。依赖 Redis/内存缓存。

| 函数 | 介绍与调用说明 |
|---|---|
| `createCaptcha` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `generateSvg` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCaptchaImage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidateCaptcha` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `randomText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `refreshCaptcha` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `verifyCaptcha` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/character-service.js`

角色 CRUD 与可见性控制。被首页、dashboard、角色编辑和开聊流程调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `countCharacterConversations` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createCharacter` | 创建角色，写入用户、基础设定、首句、提示词结构和可见性。 |
| `deleteCharacterSafely` | 安全删除角色；已有会话时拒绝删除。 |
| `getCharacterById` | 读取角色详情；传 userId 时限制必须归属该用户。 |
| `listUserCharacters` | 读取某用户自己的角色供 dashboard 展示。 |
| `normalizeVisibility` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `stringifyPromptProfile` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateCharacter` | 更新当前用户拥有的角色。 |

## `src/services/character-social-service.js`

公开角色点赞、评论、使用量与热度统计服务。

| 函数 | 介绍与调用说明 |
|---|---|
| `addCharacterComment` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensurePublicCharacter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listCharacterComments` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markCharacterUsed` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeCommentBody` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `toggleCharacterLike` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/character-tag-service.js`

角色多标签服务：标签归一化、创建、关联、公开筛选辅助。

| 函数 | 介绍与调用说明 |
|---|---|
| `attachTagsToCharacters` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureTagByName` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCharacterTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getTagSearchNames` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getTagsForCharacterIds` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidatePublicTagCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listAllTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listPublicTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTagName` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTagSlug` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseTagInput` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `runSql` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setCharacterTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `uniqueTagNames` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/character/public-character-cache.js`

公开角色页/首页推荐的 Redis 版本化缓存。通过递增版本号批量失效，避免 Redis KEYS/SCAN 依赖。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildPublicCharacterCacheKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getPublicCharacterCacheVersion` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hashCachePayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidatePublicCharacterCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidateRememberedPublicCharacterCacheKeys` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readPublicCharacterCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `rememberPublicCharacterCacheKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `writePublicCharacterCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/character/public-character-service.js`

公共角色大厅、首页推荐与公开详情查询。

| 函数 | 介绍与调用说明 |
|---|---|
| `appendTagFilters` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getPublicCharacterDetail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getPublicCharacterSelectFields` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getPublicCharacterSortSql` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getStatsSelectFields` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listFeaturedPublicCharacters` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listPublicCharacters` | 读取公开且 published 的角色供首页展示。 |
| `normalizePublicCharacterSort` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/character/schema-service.js`

角色相关表结构的启动期自修复。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureCharacterImageColumns` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureMysqlCharacterSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureMysqlColumn` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureMysqlIndex` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSqliteCharacterSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `mysqlColumnExists` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `mysqlIndexExists` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/conversation-service.js`

会话/消息兼容门面：保留原导出 API，内部编排 conversation/cache、validators、message-view、path-repository 等子模块，避免旧调用方改 require 路径。

| 函数 | 介绍与调用说明 |
|---|---|
| `addMessage` | 按 sequence_no 追加消息、更新 current_message_id，并失效消息列表/数量/显示链缓存。 |
| `buildConversationPathView` | 按当前消息构造聊天页轻量显示链 view model，不加载完整消息列表。 |
| `cloneConversationBranch` | 把某条消息之前的内容复制成独立对话。 |
| `countChildConversations` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createConversation` | 创建会话，可带父会话、来源消息、模型模式和标题。 |
| `createEditedMessageVariant` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deleteConversationSafely` | 删除会话前检查后续关联，避免留下孤立内容。 |
| `deleteMessageSafely` | 删除消息前检查后续消息和派生对话，避免破坏已有内容。 |
| `fetchMessagesFromDatabase` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getConversationById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getConversationMessageCount` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getLatestMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getMessageById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listMessages` | 读取完整消息列表，保留给克隆独立对话和诊断脚本使用；聊天页不再调用。 |
| `listUserConversations` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setConversationCurrentMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateConversationModelMode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateConversationTitle` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/conversation/cache.js`

会话缓存封装：消息列表、消息数量缓存读写和会话显示链缓存失效；由 conversation-service 调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `getConversationMessageCountCacheKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getConversationMessagesCacheKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidateConversationCache` | 失效会话消息列表、消息数量和路径版本缓存；写入/删除消息后调用。 |
| `readMessageCountCache` | 读取会话消息数量短 TTL 缓存；用于聊天页轻量统计。 |
| `readMessageListCache` | 从 Redis/内存缓存读取完整消息列表；异常时返回 null 并允许回源 DB。 |
| `writeMessageCountCache` | 写入会话消息数量缓存；数据库统计后调用。 |
| `writeMessageListCache` | 写入完整消息列表短 TTL 缓存；缓存写失败只记 warning，不阻塞业务。 |

## `src/services/conversation/message-view.js`

会话消息视图层纯函数：metadata 解析、think 标签清理和链路构建。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildMessageMaps` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildPathMessages` | 从已加载消息列表中取当前显示链，主要给脚本/克隆逻辑复用。 |
| `decoratePathMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMessageForView` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `safeParseJson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `shortText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `stripThinkTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/conversation/path-repository.js`

使用递归查询读取当前会话从叶子消息到根消息的显示链。

| 函数 | 介绍与调用说明 |
|---|---|
| `fetchPathMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getPathCacheVersion` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getPathMessagesCacheKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidatePathMessagesCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/conversation/validators.js`

会话输入校验工具：规范化 messages.prompt_kind 写库值，兼容旧 chat 值并回落 normal。

| 函数 | 介绍与调用说明 |
|---|---|
| `normalizeMessagePromptKind` | 规范化 messages.prompt_kind 写库值；兼容旧调用传入 chat，并回落到 normal，避免 MySQL ENUM 写入截断。 |

## `src/services/email-service.js`

Resend 邮件验证码发送封装。被 verification-service 调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `sendVerificationEmail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/email-template-service.js`

Branded HTML email templates for verification messages.

| 函数 | 介绍与调用说明 |
|---|---|
| `buildVerificationEmailHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildVerificationEmailText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/font-proxy-service.js`

Google Fonts 代理与缓存，避免页面字体资源直接失败。被 /fonts/* 路由调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `fetchWithTimeout` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getFontFile` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getGoogleFontCss` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isAllowedFontFileUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `logFontProxyError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `rewriteGoogleFontCss` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `setCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/live-reload-service.js`

开发环境热刷新服务。轮询 CSS/JS/EJS 指纹，源码变化时触发构建脚本并通过 SSE 通知浏览器刷新资源。 注意：仅在 LIVE_RELOAD_ENABLED=true 时启动；生产应保持关闭。构建脚本通过 execFile 调用固定本地脚本路径，不接受用户输入。

| 函数 | 介绍与调用说明 |
|---|---|
| `emitChange` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getClientAssetVersion` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCssOutputFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCssSourceFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getJsOutputFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getJsSourceFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getViewFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `liveReloadSseHandler` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `onChange` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `runScript` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `scanOnce` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `scheduleCssBuild` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `scheduleJsBuild` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `shouldSkipDir` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `snapshotFingerprints` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `startLiveReloadWatcher` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `statFingerprint` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `walkFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `writeSse` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/llm-gateway-service.js`

LLM 网关核心：Provider 选择、额度校验、上下文裁剪、队列、流式解析、用量记录。

| 函数 | 介绍与调用说明 |
|---|---|
| `attachSelectedModel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildOptimizeSystemPrompt` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildPromptMessages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildRuntimeContext` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `executeLlmQueued` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `executeLlmRequest` | LLM 网关总编排：额度、Provider、prompt、调用、记录用量。 |
| `finalizeLlmJobFailure` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `finalizeLlmJobSuccess` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `generateReplyViaGateway` | 非流式生成 AI 回复，走统一 LLM 网关。 |
| `getChatModelSelector` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getLlmRuntimeQueueState` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `optimizeUserInputViaGateway` | 非流式优化用户输入。 |
| `resolveCallModelMode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `resolveProviderForPlanModel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `streamOptimizeUserInputViaGateway` | 流式优化用户输入。 |
| `streamReplyViaGateway` | 流式生成 AI 回复，onDelta 接收增量。 |
| `summarizeDiscardedMessages` | 将被裁剪的旧消息摘要后回填上下文。 |

## `src/services/llm-gateway/content-utils.js`

LLM 响应内容、token 粗估和上下文裁剪工具。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildSummaryTranscript` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `combineReplyContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `estimatePromptTokens` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `estimateTokens` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractMessageContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractReasoningText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMessageRole` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTextContent` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `shouldAppendUserMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `stripThinkTags` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `trimMessagesForContext` | 按 Provider 上下文窗口裁剪历史消息。 |

## `src/services/llm-gateway/priority-queue.js`

LLM 全局并发与优先级队列。

| 函数 | 介绍与调用说明 |
|---|---|
| `createPriorityQueue` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `drainQueue` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `enqueueWithPriority` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/llm-gateway/provider-client.js`

OpenAI-compatible provider 调用与 SSE 流解析。

| 函数 | 介绍与调用说明 |
|---|---|
| `appendContentDelta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `appendReasoningDelta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `armIdleTimeout` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `callProvider` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `callProviderStream` | 调用 OpenAI-compatible chat completions stream 并解析 SSE。 |
| `cleanup` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `closeReasoningIfNeeded` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractStreamDeltaParts` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getProviderModelId` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `handleSseBlock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeProviderError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readProviderErrorBody` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/llm-provider-service.js`

后台 Provider 管理、模型列表拉取、模型模式配置校验。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildModelOptions` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createProvider` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureNonNegativeNumber` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensurePositiveInteger` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `fetchProviderModels` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getActiveProvider` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getProviderById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listProviders` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `maskApiKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeBaseUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `pickDefaultModel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `resolveProviderModels` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateProvider` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `validateContextWindow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/llm-usage-service.js`

LLM job 与 usage log 写入。被网关成功/失败收尾逻辑调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `createLlmJob` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createUsageLog` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `recoverInterruptedLlmJobs` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateLlmJob` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/log-service.js`

后台日志查询与按日写入服务。 调用说明： - `src/lib/logger.js` 调用 `appendDailyLog()`，把运行日志拆成 `logs/app-YYYY-MM-DD.log`、`logs/app-error-YYYY-MM-DD.log`、`logs/access-YYYY-MM-DD.log`。 - `src/routes/web-routes.js` 的 `/admin/logs` 调用 `listLogEntries()`，解析旧日志和新日志，提供日期、等级、文件、错误类型、函数名筛选与分页。 - 本服务只读写 `logs/` 目录，不碰业务数据库，也不记录敏感请求正文。

| 函数 | 介绍与调用说明 |
|---|---|
| `appendDailyLog` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildEntryFields` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `collectFacet` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `compactProjectPath` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureLogDir` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getDailyLogPath` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getLocalDateKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `inferErrorType` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `inferFunctionName` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `inferLogFileType` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listAvailableDates` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listLogEntries` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listReadableLogFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `matchesText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeLevel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeLogDate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseApacheDate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseDateFromFileName` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseJsonMeta` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseLogFile` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseLogLine` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseStackFrame` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readFileTail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `toDisplayTime` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/markdown-service.js`

Small safe Markdown renderer for notifications and site messages. It escapes raw HTML and only emits a constrained tag set.

| 函数 | 介绍与调用说明 |
|---|---|
| `applyInlineMarkdown` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeAttribute` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `escapeHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `flushParagraph` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBlank` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isBullet` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isFencePlaceholder` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isHr` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isOrdered` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoteMarkerOnly` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isQuoted` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isSafeHttpUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markdownToHtml` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMarkdownLines` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTableCells` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseHeading` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseTableSeparator` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `renderTableCell` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `splitTableRow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `tryParseTable` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/model-entitlement-service.js`

Plan-specific model entitlement normalization, persistence helpers, and quota multiplier math.

| 函数 | 介绍与调用说明 |
|---|---|
| `buildDefaultPlanModelsFromProvider` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildPlanModelLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findPlanModel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getBillableRequestUnits` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getBillableTokenUnits` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeModelKey` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeMultiplier` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePlanModelItem` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePlanModels` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeProviderId` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parsePlanModelsJson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `serializePlanModels` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/model-form-service.js`

Parse admin form fields for plan model entitlements.

| 函数 | 介绍与调用说明 |
|---|---|
| `asArray` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parsePlanModelsFromBody` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/notification-service.js`

站内通知与客服入口配置服务。调用说明：管理后台维护通知规则与客服入口外部资源，布局与聊天页通过公开接口读取当前用户可见通知。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildNotificationPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createNotification` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `decodeDisplayScopes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `decodeNotification` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deleteNotification` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `encodeDisplayScopes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureNotificationSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatDateForInput` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getClientNotificationBootstrap` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getNotificationBootstrapVersion` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidateNotificationBootstrapCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isDuplicateColumnError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isNotificationVisibleOnPage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isNotificationVisibleToUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listActiveNotificationsForUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listNotificationsForAdmin` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeBoolean` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeChoice` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeDisplayScopes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeOptionalDate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePageScope` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeString` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `seedSupportNotificationIfEmpty` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `toNumber` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateNotification` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/password-service.js`

bcrypt 密码 hash/verify。被注册、登录、改密码使用。

| 函数 | 介绍与调用说明 |
|---|---|
| `hashPassword` | 生成 bcrypt hash。 |
| `verifyPassword` | 校验明文密码与 hash。 |

## `src/services/phone-auth-service.js`

国内手机号一键认证占位/封装。被注册流程调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `verifyDomesticPhoneIdentity` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/plan-model-validation-service.js`

Server-side validation for plan model entitlements against configured providers.

| 函数 | 介绍与调用说明 |
|---|---|
| `buildProviderModelLookup` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `validatePlanModelsAgainstProviders` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/plan-service.js`

套餐、订阅、额度快照与额度断言。被后台和 LLM 网关调用。

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `src/services/plan/crud.js`

套餐 CRUD 与默认套餐切换逻辑，保留原 SQL 行为。

| 函数 | 介绍与调用说明 |
|---|---|
| `createPlan` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deletePlan` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findPlanById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listPlans` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updatePlan` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/plan/hydration.js`

套餐模型权益 JSON 的解析、默认模型兜底与列表展示字段补齐。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyPresetModelDetails` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hydratePlanModelsForPlan` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `hydratePlanModelsForPlans` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/plan/normalizer.js`

套餐载荷归一化与数值字段强校验，避免后台表单脏值进入服务层。

| 函数 | 介绍与调用说明 |
|---|---|
| `ensureNonNegativeInteger` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensurePositiveInteger` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePlanPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/plan/subscriptions.js`

用户套餐订阅、用量统计、配额断言和套餐模型选项。

| 函数 | 介绍与调用说明 |
|---|---|
| `assertUserQuotaAvailable` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `assignDefaultPlanToUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildPlanModelOptions` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getActiveSubscriptionForUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getCurrentUsageForUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getSubscriptionModelConfig` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getUserQuotaSnapshot` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserPlan` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/plan/usage-window.js`

根据数据库类型和套餐周期生成用量统计时间窗口 SQL。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildUsageSinceClause` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/preset-model-service.js`

Admin-managed preset model catalog used by plans.

| 函数 | 介绍与调用说明 |
|---|---|
| `buildPresetModelLabel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createPresetModel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deletePresetModel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findPresetModelById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listPresetModels` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePresetDescription` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePresetPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePresetRow` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parsePresetModelMetadata` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updatePresetModel` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/prompt-engineering-service.js`

全局提示词片段、角色提示词结构、运行时变量模板和最终 system prompt 拼装。

| 函数 | 介绍与调用说明 |
|---|---|
| `applyRuntimeTemplate` | 替换提示词中的运行时变量，例如时间、用户名。 |
| `applyRuntimeTemplateToCharacter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildCharacterPromptItems` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildPromptPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `buildReplyLengthInstruction` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `composeSystemPrompt` | 按全局片段、角色片段、系统提示和运行时变量拼装 system prompt。 |
| `createPromptBlock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deletePromptBlock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatPromptSection` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatRuntimeTime` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listPromptBlocks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizePromptItems` | 清洗提示词条目，去空值并规范 order/enabled。 |
| `parsePromptItemsFromForm` | 从表单数组字段中解析角色/全局提示词条目。 |
| `reorderPromptBlocks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `safeParseJson` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `toArray` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updatePromptBlock` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/rate-limit-service.js`

基于 Redis/内存 incr+expire 的轻量限流。被登录/注册/验证码调用。

| 函数 | 介绍与调用说明 |
|---|---|
| `hitLimit` | 限流计数：窗口内超过 limit 返回 true。 |

## `src/services/site-message-service.js`

站内信服务：管理员批量投递、用户收件箱、未读轮询与已读状态。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildMessagePayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `constructor` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createSiteMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureGlobalMessagesForUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureSiteMessageSchema` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getSiteMessageRealtimeSnapshot` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getUnreadSiteMessageCount` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidateAllUnreadSiteMessageCountCacheBestEffort` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `invalidateUnreadSiteMessageCountCache` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isDuplicateColumnError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `isDuplicateIndexError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listInboxMessagesForUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listSiteMessagesForAdmin` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markAllSiteMessagesRead` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `markSiteMessageRead` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeBoolean` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeChoice` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeString` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeUserIdList` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `resolveRecipients` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `revokeSiteMessage` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/tavern-card-import-service.js`

Public facade for SillyTavern/TavernAI character card import.

| 函数 | 介绍与调用说明 |
|---|---|
| `buildConfirmItemsFromPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `confirmTavernImport` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `fileFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findPossibleDuplicate` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `listImportBatches` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `mapImportUploadError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeImportItemForInsert` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseConfirmPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseTavernFile` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `previewTavernImport` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `uploadTavernCards` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/tavern-import/avatar-storage.js`

Avatar preview and storage helpers for Tavern card imports.

| 函数 | 介绍与调用说明 |
|---|---|
| `buildAvatarPreviewDataUrl` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `storeImportedAvatarFromPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/tavern-import/card-payload.js`

Normalize Tavern card JSON into Louge character fields and prompt items.

| 函数 | 介绍与调用说明 |
|---|---|
| `collectTagsFromCard` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `createPromptItem` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `estimatePromptItemsLength` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findWorldBooks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `flattenWorldBooks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `formatWorldBookEntries` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeAlternateGreetings` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeCardPayload` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeWorldBookEntries` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `truncateMiddle` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/tavern-import/constants.js`

Shared limits and constants for Tavern card import.

- 本文件没有可识别的命名函数，主要通过顶层脚本、配置或模板逻辑工作。

## `src/services/tavern-import/png-parser.js`

PNG metadata extraction for SillyTavern/TavernAI cards.

| 函数 | 介绍与调用说明 |
|---|---|
| `decodeMaybeBase64Json` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractCardJsonFromPng` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `extractPngTextEntries` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `parseEntry` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `readPngChunks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/tavern-import/preview-store.js`

Disk-backed temporary preview storage for Tavern imports.

| 函数 | 介绍与调用说明 |
|---|---|
| `cleanupExpiredPreviewFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deleteImportPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `importPreviewExists` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `loadImportPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `saveImportPreview` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/tavern-import/text-utils.js`

Text normalization helpers for Tavern card import.

| 函数 | 介绍与调用说明 |
|---|---|
| `decodeEscapedText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `encodePossiblyWindows1252AsBytes` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `joinSections` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `looksLikeMojibake` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeExtensions` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeLineBreaks` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeTavernTemplateText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `pickFirst` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `repairLatin1Utf8Text` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `safeJsonParse` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `sanitizeImportFileName` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `truncateText` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/upload-service.js`

角色卡头像与对话背景图上传处理。只接受小尺寸常见图片，保存到 public/uploads/characters。

| 函数 | 介绍与调用说明 |
|---|---|
| `buildStoredImagePath` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `cleanupUploadedCharacterFiles` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `deleteStoredImageIfOwned` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `destination` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `fileFilter` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `filename` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getUploadFilePath` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `getUploadedCharacterImagePaths` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `mapMulterError` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeStoredImagePath` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `uploadCharacterImages` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/user-service.js`

用户创建、登录查询、资料更新、角色更新。

| 函数 | 介绍与调用说明 |
|---|---|
| `createUser` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `ensureUserPreferenceColumns` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findUserAuthById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findUserByEmail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findUserById` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findUserByLogin` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findUserByPhone` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findUserByPublicId` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `findUserByUsername` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeChatVisibleMessageCount` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `normalizeReplyLengthPreference` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `unbindUserEmail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `unbindUserPhone` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updatePasswordHash` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserChatVisibleMessageCount` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserEmail` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserNsfwPreference` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserPhone` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserReplyLengthPreference` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserRole` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUserStatus` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `updateUsername` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

## `src/services/verification-service.js`

邮箱/手机验证码签发与验证编排。调用 email/sms/rate-limit/captcha。

| 函数 | 介绍与调用说明 |
|---|---|
| `generateCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `issueEmailCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `issuePhoneCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `verifyEmailCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |
| `verifyPhoneCode` | 内部辅助函数；调用方见所在文件导出或同文件路由/事件处理逻辑。 |

