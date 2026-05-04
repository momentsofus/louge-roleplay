# 前端架构说明

楼阁前端不是单页应用，页面由 Express + EJS 服务端渲染，浏览器端脚本只负责局部交互、流式聊天、通知、表单增强和富文本渲染。

## 加载入口

`src/views/layout.ejs` 是全站资源入口：

- 样式：`/public/styles/site-pages.css`
- 全局 bootstrap：`layout-bootstrap.js`
- i18n：`i18n-runtime.js`
- CSRF：`csrf.js`
- 通知：`generated/notification.bundle.js`
- 站内信未读：`site-message-client.js`
- 表单保护：`form-guards.js`

聊天页额外加载 `generated/chat.bundle.js`。历史兼容文件 `public/js/chat-page.js` 仍保留，但真实实现已经拆到 `public/js/chat/`。

## 构建链路

```text
public/js/notification/markdown-renderer.js
public/js/notification-client.js
  -> npm run build:js
  -> public/js/generated/notification.bundle.js

public/js/chat/rich-renderer/*.js
public/js/chat/*.js
  -> npm run build:js
  -> public/js/generated/chat.bundle.js
```

构建入口：`scripts/build-js.js`。新增前端模块后要确认：

1. 是否需要进入 bundle。
2. 在 `scripts/build-js.js` 中的顺序是否满足依赖。
3. 是否需要更新 `layout.ejs` 或页面模板引用。
4. 是否跑过 `npm run build`。

## 聊天前端模块

| 文件 | 职责 |
|---|---|
| `public/js/chat/controller.js` | 聊天页装配入口，连接 DOM、状态、流式 UI、表单和历史加载。 |
| `conversation-state.js` | 当前 leaf、父消息隐藏字段、URL 状态和线性尾巴清理。 |
| `stream-client.js` | 发起 NDJSON 请求并按包分发事件。 |
| `streaming-ui.js` | 流式气泡渲染、自动跟随滚动、最终态替换。 |
| `compose-submit.js` | 主输入框提交与 Enter 快捷键。 |
| `optimize-submit.js` | “润色输入”流式提交。 |
| `action-stream-submit.js` | 重新生成、从这里重写等消息操作。 |
| `history-loader.js` | 查看更早消息，并保持滚动位置。 |
| `message-menu.js` | 消息上的操作菜单。 |
| `bubbles.js` | 创建/替换聊天气泡 DOM。 |
| `dom-utils.js` | Toast、滚动、菜单收起、富文本挂载等小工具。 |

## 富文本与安全边界

聊天富文本渲染拆在 `public/js/chat/rich-renderer/`：

- `formatting.js`：Markdown、表格、代码块、引用与 streaming preview。
- `folds.js`：`<think>` / `<thinking>` / 其他非富文本标签折叠块。
- `sanitizer.js`：DOM 净化、允许标签、链接/图片 URL 约束、style 作用域化。
- `rich-renderer.js`：聚合入口，向外暴露 `window.renderRichContent` 等兼容 API。

维护原则：

1. 所有模型输出必须经过 escape / sanitize 后进入 DOM。
2. `href/src` 只允许 HTTP(S)，禁止 `javascript:`。
3. 图片强制 lazy/async/no-referrer。
4. 自定义 `<style>` 必须作用域化，禁止 `@import`、危险 `url()` 和旧 IE 表达式。
5. 修改 rich renderer 后必须跑 `npm run build`，并人工/脚本检查 `window.renderRichContent` 仍存在。

## 通知前端模块

- `public/js/notification/markdown-renderer.js`：通知内容 Markdown 降级渲染。正常情况下服务端会提供 `bodyHtml`，前端只兜底。
- `public/js/notification-client.js`：通知控制器，展示 modal/toast/banner，处理 `showOnce` 本地记录，拉取客服入口，并暴露：

```js
window.LougeNotifications.show(notification)
window.LougeNotifications.showSupport(options)
window.LougeNotifications.items
```

聊天错误、错误页和导航栏客服按钮都依赖 `showSupport()`，不要改对象名和方法名。

## 验证建议

```bash
node -c public/js/notification/markdown-renderer.js public/js/notification-client.js scripts/build-js.js
npm run build:js
npm run smoke:test
```

涉及聊天富文本时，至少验证：

- 普通段落、列表、代码块、表格。
- `<think>` 折叠。
- 中英文引号高亮。
- 链接和图片 URL 净化。
- 流式生成中和生成完成后的显示一致性。
