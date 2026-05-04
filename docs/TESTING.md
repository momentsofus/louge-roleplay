# 测试与验证指南

楼阁的测试脚本分为“只读健康检查”“服务层回归”“前端构建检查”和“外部依赖全流程”。发布前按变更范围选择组合。

## 最小验证

适合文档、样式拆分、轻量重构后快速确认：

```bash
npm run build
npm run i18n:check
npm run version:check
npm run smoke:test
git diff --check
```

## 常规发布验证

适合合并到 `master` 前：

```bash
npm run build
npm run conversation-service:test
npm run admin-conversations:test
npm run smoke:test
npm run health:check
npm run i18n:check
npm run version:check
```

## 安全与生产基线

```bash
npm run security:audit
npm run health:check
```

`security:audit` 覆盖：

- 生产 `SESSION_SECRET` / Cookie / 反代配置。
- MySQL/Redis 生产降级开关。
- 依赖漏洞：`npm audit --omit=dev --audit-level=moderate`。
- 源码危险原语扫描。

## 脚本说明

| 命令 | 是否写数据 | 是否依赖外部服务 | 说明 |
|---|---:|---:|---|
| `npm run build` | 是，写构建产物 | 否 | 生成 CSS/JS bundle。 |
| `npm run build:css` | 是 | 否 | 将 `site-pages.src.css` 的本地 import 打平成 `site-pages.css`。 |
| `npm run build:js` | 是 | 否 | 生成 `chat.bundle.js` 与 `notification.bundle.js`。 |
| `npm run smoke:test` | 否 | 需要运行中站点 | 检查首页、登录、注册、鉴权跳转、healthz、404。 |
| `npm run health:check` | 否 | 需要运行中站点/DB/Redis | 检查配置、数据库、Redis、公开 HTTP 页面。 |
| `npm run conversation-service:test` | 是，创建后清理 | DB/Redis | 会话显示链、克隆、消息数量与聊天页渲染回归。 |
| `npm run admin-conversations:test` | 是，创建后清理 | DB | 后台对话查询、筛选与模板渲染。 |
| `npm run admin-logs:test` | 通常否 | 本地日志文件 | 后台日志页模板冒烟。 |
| `npm run logs:test` | 通常否 | 本地日志文件 | 日志解析服务分页/筛选。 |
| `npm run model-entitlements:test` | 否 | 否 | 套餐模型权益 normalizer/form parser。 |
| `npm run tavern-import:test` | 是，创建后清理 | DB/文件系统 | Tavern 卡解析、标签、NSFW、导入链路。 |
| `npm run full-flow:test` | 是，创建后清理 | DB/Redis/外部 LLM | 创建用户/角色/会话，真实走流式 LLM 和后台查询。 |
| `npm run security:audit` | 否 | npm registry | 生产安全配置、依赖漏洞和危险原语扫描。 |
| `npm run version:check` | 否 | Git | package/lock/changelog/tag/工作区检查。 |
| `npm run i18n:check` | 否 | 否 | 词典完整性和中文残留扫描。 |

## 外部依赖说明

- `full-flow:test` 会真实调用外部 LLM Provider，模型不可用、余额不足、网络慢都可能影响结果；适合人工发布前确认，不建议作为唯一阻断项。
- `smoke:test` 和 `health:check` 默认检查 `APP_URL` 或当前配置中的站点，需要服务正在运行。
- 服务层测试会创建临时数据并尽量清理；如果脚本被强杀，按输出 ID 手工清理。

## 前端专项 smoke

通知 bundle 可用性可用 Node VM 做轻量检查，重点确认公开 API 不丢：

```bash
node -c public/js/notification/markdown-renderer.js public/js/notification-client.js scripts/build-js.js
npm run build:js
```

聊天富文本改动后，建议人工验证：

- Markdown 段落、列表、表格、代码块。
- `<think>` / `<thinking>` 折叠。
- 中英文引号高亮。
- 链接、图片净化。
- 流式中与最终态显示一致。
