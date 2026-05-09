# 楼阁 / ai-roleplay-site

楼阁是一个 Express + EJS 的多用户 AI 角色对话网站，默认监听 `0.0.0.0:3217`，当前线上域名为 `https://aicafe.momentsofus.cn`。当前版本：`1.4.1`。

它不是纯 demo：项目已经包含账号系统、公开/私有角色、流式聊天、富文本渲染、后台管理、LLM Provider、套餐额度、验证码、日志、站内通知、Tavern 角色卡导入和基础生产部署脚本。

## 授权声明

本项目为专有软件，不是开源项目。未经权利人书面授权，任何个人或组织不得复制、修改、二次开发、私自部署、私自使用、商用、转售、分发、提供 SaaS/托管服务或用于任何生产/商业场景。

完整条款见根目录 `LICENSE`。第三方依赖仍按其各自许可证授权；这不代表本项目源码开放授权。

## 当前能力

- 用户注册 / 登录 / 退出 / 个人资料修改。
- 图形验证码、邮箱验证码、阿里云手机号/短信验证码。
- 角色创建、编辑、公开/私有/未列出可见性、NSFW 标记、删除保护。
- 首页公开角色列表、公开角色详情、标签筛选、点赞与评论。
- 用户工作台、角色管理、会话列表。
- 会话创建与历史消息持久化。
- 线性聊天与分支显示链：继续对话、AI 重新生成、用户消息修改重发、AI 回复修改、加载历史。
- 输入优化、一键采用并发送。
- 流式 NDJSON 生成与前端富文本渲染。
- `<think>` / `<thinking>` 思考块折叠展示。
- Markdown、代码块、引用、表格、图片等富文本展示与安全净化。
- LLM Provider 后台配置、预设模型、模型模式、上下文窗口、超时、价格。
- 套餐、订阅、请求额度 / token 额度、用量记录与模型权益。
- 后台对话审计：按用户、角色、日期、删除状态筛选，并可查看完整消息链。
- 后台日志查询：按日期、等级、文件错误、错误类型、函数名筛选。
- 前台通知、客服入口、站内信与未读提醒。
- Tavern / SillyTavern PNG/JSON 角色卡批量导入。
- Redis Session、验证码/限流/会话缓存；开发未配置 Redis 时可内存降级。
- MySQL 优先；开发未配置数据库时可 SQLite 本地降级。
- Google Fonts 通过独立资源代理服务 `https://fonts.xuejourney.xin` 加载，站点内不再维护同源字体代理。
- 结构化日志、requestId、健康检查、冒烟测试和文档生成脚本。

## 快速启动

```bash
cd /opt/openclaw/workspace/project/app/louge-roleplay
npm install
cp .env.example .env
npm run db:init
npm run build
npm run dev
```

生产/普通启动：

```bash
npm run start
```

systemd 部署参考：

```bash
systemctl status ai-roleplay-site.service
systemctl restart ai-roleplay-site.service
journalctl -u ai-roleplay-site.service -f
```

更多生产部署说明见 `docs/DEPLOYMENT.md`。

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run start` | 启动生产进程（`node src/server.js`）。 |
| `npm run dev` | nodemon 开发模式。 |
| `npm run build` | 同时生成 CSS/JS bundle。 |
| `npm run build:css` | 将 `public/styles/site-pages.src.css` 打平成运行时 CSS。 |
| `npm run build:js` | 生成 `generated/chat.bundle.js` 与 `generated/notification.bundle.js`。 |
| `npm run db:init` | 初始化/补齐数据库结构和种子数据。 |
| `npm run grant-admin -- <username>` | 给用户授予 admin 角色。 |
| `npm run smoke:test` | 只读冒烟测试：首页、登录、注册、鉴权跳转、healthz。 |
| `npm run health:check` | 配置、数据库、Redis、公开 HTTP 页面检查。 |
| `npm run security:audit` | 生产安全配置、依赖漏洞和危险原语扫描。 |
| `npm run i18n:check` | i18n 词典完整性与中文残留检查。 |
| `npm run version:check` | package/lock/changelog/tag/工作区版本检查。 |
| `npm run docs:debug` | 重新生成项目地图、函数索引和 DEBUG 文档。 |

完整测试策略见 `docs/TESTING.md`。

## 配置说明

配置从 `.env` 读取，入口在 `src/config.js`。不要提交真实 `.env`。

关键变量：

| 变量 | 说明 |
|---|---|
| `PORT` | 监听端口，默认 `3217`。 |
| `APP_NAME` | 站点名，默认“楼阁”。 |
| `APP_VERSION` | 应用版本，默认读取 `package.json`。 |
| `APP_URL` | 对外访问地址，脚本、邮件/回调和健康检查会用到。 |
| `SESSION_SECRET` | Session 密钥；生产必须固定配置强随机值。 |
| `DATABASE_URL` | MySQL 连接串；未配置时开发降级 SQLite。 |
| `DATABASE_ADMIN_URL` | 初始化 MySQL 数据库时使用的管理连接串。 |
| `REDIS_URL` | Redis 连接串；未配置时开发使用内存模式。 |
| `OPENAI_BASE_URL` / `OPENAI_API_KEY` / `OPENAI_MODEL` | 旧版直连 AI 兜底配置；当前主要走后台 Provider。 |
| `RESEND_API_KEY` / `RESEND_FROM` | 邮箱验证码发送。 |
| `ALIYUN_PHONE_AUTH_*` | 阿里云手机号一键认证相关配置。 |
| `ALIYUN_ACCESS_KEY_ID` / `ALIYUN_ACCESS_KEY_SECRET` / `ALIYUN_SMS_*` | 阿里云短信验证码配置。 |
| `TRUST_PROXY` | 反代部署时设为 `true`。 |
| `COOKIE_SECURE` | HTTPS 生产环境设为 `true`。 |
| `LIVE_RELOAD_ENABLED` | 开发热刷新开关；生产应关闭。 |
| `PRODUCTION_FAIL_FAST` | 生产配置不完整时快速失败。 |
| `ALLOW_PRODUCTION_SQLITE_FALLBACK` | 生产是否允许 SQLite 降级，默认禁止。 |
| `ALLOW_PRODUCTION_MEMORY_REDIS` | 生产是否允许 Redis 内存降级，默认禁止。 |
| `RATE_LIMIT_FAIL_CLOSED` | 限流异常时是否失败关闭，生产建议开启。 |
| `LOG_LEVEL` | `debug/info/warn/error`，默认 `info`。 |

完整环境变量表见 `docs/ENVIRONMENT.md`。隐私安全摘要可看 `config.getPrivacySafeSummary()`，不会输出完整密钥。

## 项目结构

| 路径 | 职责 |
|---|---|
| `src/server.js` | Express 启动壳：DB/Redis 初始化、中间件、路由、404、错误处理。 |
| `src/routes/web-routes.js` | Web 路由聚合入口，按公开页、认证、后台、角色、聊天等子路由注册。 |
| `src/routes/web/` | 按域拆分的 Web 路由：`admin/`、`auth/`、`chat/`、public、character 等。 |
| `src/server-helpers.js` | 页面渲染、参数解析、日志脱敏、聊天页 view model、NDJSON 辅助。 |
| `src/services/` | 业务服务层：用户、角色、会话、LLM、套餐、验证码、通知、导入等。 |
| `src/services/conversation-service.js` | 会话兼容门面；具体缓存、校验、路径查询已拆到 `src/services/conversation/`。 |
| `src/lib/` | DB、Redis、logger、URL 安全、SQLite schema 等基础设施。 |
| `src/middleware/` | requestId、i18n、CSRF、鉴权、错误处理。 |
| `src/views/` | EJS 页面和局部模板。 |
| `public/js/` | 浏览器脚本源码；聊天和通知运行时 bundle 位于 `public/js/generated/`。 |
| `public/styles/` | 样式源码入口、构建产物和拆分模块。 |
| `scripts/` | 初始化、测试、健康检查、构建、文档生成脚本。 |
| `docs/` | 架构、部署、环境变量、安全、测试、后台、数据库、前端、CSS、DEBUG 等文档。 |

更完整的文件地图见：

- `docs/PROJECT_MAP.md`：目录、文件、路由、调用链。
- `docs/FUNCTION_REFERENCE.md`：每个 JS 文件和命名函数的介绍与调用说明。
- `docs/DEBUGGING.md`：日志、requestId、常见问题排查。
- `docs/server-architecture.md`：server 拆分说明。
- `docs/DEPLOYMENT.md`：生产部署与回滚。
- `docs/ENVIRONMENT.md`：环境变量完整说明。
- `docs/FRONTEND_ARCHITECTURE.md`：聊天/通知前端和 bundle 说明。
- `docs/CSS_ARCHITECTURE.md`：样式构建链与模块职责。
- `docs/SECURITY.md`：权限、CSRF、日志脱敏、URL 安全和发布检查。
- `docs/ADMIN_GUIDE.md`：后台操作说明。
- `docs/TAVERN_IMPORT.md`：Tavern/SillyTavern 角色卡导入。
- `docs/DATABASE_SCHEMA.md`：数据库结构与迁移约定。
- `docs/TESTING.md`：测试矩阵。
- `docs/VERSIONING.md`：版本管理规范。

## 核心调用链

### 普通页面

```text
browser
  -> src/server.js
  -> requestContext / session / i18n / csrf
  -> src/routes/web-routes.js
  -> src/routes/web/*
  -> src/services/*
  -> src/lib/db.js / src/lib/redis.js
  -> renderPage(view + layout)
```

### 聊天流式生成

```text
public/js/generated/chat.bundle.js
  -> public/js/chat/controller.js
  -> POST /chat/:conversationId/message/stream
  -> createNdjsonResponder()
  -> streamChatReplyToNdjson()
  -> llm-gateway-service.streamReplyViaGateway()
  -> Provider SSE
  -> NDJSON packet
  -> renderRichContent()
```

### 当前对话显示链

```text
conversation-service.addMessage()
  -> messages.parent_message_id / conversations.current_message_id
  -> invalidateConversationCache()
  -> buildConversationPathView() / fetchPathMessages()
  -> chat.ejs / chat-message.ejs
```

聊天页只加载当前显示链，不再读取完整消息列表做导航。

## 数据库与缓存

`src/lib/db.js` 对上层屏蔽 MySQL/SQLite 差异：

- `DATABASE_URL` 存在：优先 MySQL。
- 未配置 MySQL：开发环境自动使用 `data/local.db`。
- SQL 占位符统一使用 `?`。
- `query()` 对 SELECT/WITH 返回行数组；INSERT 返回 `{ insertId, affectedRows }`；其他 DML 返回 `{ affectedRows }`。
- `withTransaction()` 提供 MySQL/SQLite 兼容事务。

初始化/补结构：

```bash
npm run db:init
```

`src/lib/redis.js` 会在开发环境 Redis 未配置或连接失败时使用内存替代。生产建议配置真实 Redis，否则重启后登录态、验证码、限流和会话缓存都会丢失，且多进程状态无法同步。

详见 `docs/DATABASE_SCHEMA.md`。

## 前端说明

### CSS

`public/styles/site-pages.css` 是构建产物，运行时加载；源码入口是 `public/styles/site-pages.src.css`。修改样式模块后运行：

```bash
npm run build:css
```

通知样式已拆到 `public/styles/site-pages/notifications/`，后台样式已拆到 `public/styles/site-pages/admin/`，聊天 polish 也有独立子目录。详见 `public/styles/README.md` 与 `docs/CSS_ARCHITECTURE.md`。

### JS

`public/js/chat-page.js` 是历史兼容入口，真实聊天实现已拆到 `public/js/chat/`，构建后由聊天页加载：

```text
public/js/generated/chat.bundle.js
```

通知前端由以下文件构建：

```text
public/js/notification/markdown-renderer.js
public/js/notification-client.js
  -> public/js/generated/notification.bundle.js
```

`public/js/i18n-runtime.js` 提供浏览器端 `window.AI_ROLEPLAY_I18N.t()`。如果浏览器仍显示旧 JS/CSS，先强刷或清缓存。

详见 `docs/FRONTEND_ARCHITECTURE.md`。

## 日志与 DEBUG

统一使用 `src/lib/logger.js`：

```js
logger.info('Login succeeded', { requestId, userId });
logger.warn('Login failed', { requestId, reason: 'invalid_password' });
logger.error('LLM gateway request failed', { requestId, error: error.message });
logger.debug('Conversation messages cache hit', { conversationId, count });
```

开启 DEBUG：

```bash
LOG_LEVEL=debug npm run dev
```

每个请求由 `src/middleware/request-context.js` 注入 `requestId`，错误页也会展示。日志按日期拆分写入：

- `logs/app-YYYY-MM-DD.log`：结构化业务日志。
- `logs/app-error-YYYY-MM-DD.log`：error 级结构化日志。
- `logs/access-YYYY-MM-DD.log`：HTTP access 日志。
- `logs/app.log` / `logs/app-error.log`：systemd 旧追加文件，后台查询会兼容读取。

命令行排查：

```bash
grep '<requestId>' logs/app-*.log logs/app-error-*.log logs/app.log logs/app-error.log
journalctl -u ai-roleplay-site.service --since '30 min ago' | grep '<requestId>'
```

更多见 `docs/DEBUGGING.md`。

## 注释与文档约定

- JS/CSS/EJS 文件头说明职责和调用入口。
- 关键函数使用 JSDoc 说明输入、输出、调用方或安全边界。
- 自动生成文档前先更新 `scripts/update-docs-debug.js` 中的描述，避免旧描述覆盖手工文档。
- 新增文件后运行：

```bash
npm run docs:debug
```

这会刷新：

- `docs/PROJECT_MAP.md`
- `docs/FUNCTION_REFERENCE.md`
- `docs/DEBUGGING.md`

## 安全与权限

- 管理页全部通过 `requireAdmin` 保护。
- 普通用户页面通过 `requireAuth` 保护。
- POST 表单/fetch 走 CSRF token 或同源兜底校验。
- 私有角色只应由创建者访问。
- 角色/消息/会话删除都有安全检查，避免破坏已有内容关联。
- Provider Base URL 必须经过 URL 安全校验，避免 SSRF。
- 页面错误不展示内部堆栈，后端日志保留 requestId 和错误信息。
- 日志不记录密码、Cookie、完整 API Key、完整 prompt；email/phone 必须脱敏。

详见 `docs/SECURITY.md`。

## 版本控制

推荐流程：

```bash
git checkout -b feat/xxx
npm run build
npm run smoke:test
git add .
git commit -m "feat: xxx"
```

发布时同步更新：

1. `package.json` / `package-lock.json` 版本。
2. `CHANGELOG.md`。
3. Git tag：`vX.Y.Z`。

常用命令：

```bash
npm run version:check
npm run version:bump:patch
npm run version:bump:minor
npm run version:bump:major
```

完整规范见 `docs/VERSIONING.md`。

## 常见排查入口

| 问题 | 优先看 |
|---|---|
| 聊天流式无响应 | Network 的 NDJSON、`LLM provider request start/response received` 日志。 |
| 生成结束后页面异常 | 浏览器 Console、`window.renderRichContent`、`public/js/generated/chat.bundle.js` 是否最新。 |
| Markdown/think 不解析 | `rich-renderer/*`、`52-rich-content.css`、是否已运行 `npm run build`。 |
| 登录失败 | `Login failed` 日志和 requestId。 |
| 注册验证码失败 | `Register validation failed`、验证码 Redis/内存状态。 |
| 当前显示链错乱 | `messages.parent_message_id`、`current_message_id`、`fetchPathMessages()` / `buildConversationPathView()`。 |
| 数据库连不上 | `[db] MySQL 连接失败`、`DATABASE_URL`、SQLite 降级日志。 |
| Redis 连不上 | `[redis] Redis 连接失败`、`REDIS_URL`、内存模式 warning。 |
| 通知不显示 | `notification.bundle.js`、`window.LougeNotifications`、通知 audience/scope/showOnce 配置。 |

## 说明

- 若未配置 AI 接口/Provider，聊天会失败或返回兜底信息，具体取决于当前配置。
- 当前显示链、重写和编辑能力依赖最新数据库结构，部署前请执行 `npm run db:init`。
- 文档生成脚本不会读取 `.env`，不会输出密钥。
