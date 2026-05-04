# 安全说明

本文档记录楼阁当前主要安全边界与维护注意事项。新增功能时应优先复用现有中间件和服务层校验，不要在路由里绕过权限判断。

## 授权与源码使用

本项目是专有软件，不是开源项目。二次开发、商用、私自部署、私自使用、再分发、托管服务等均需获得权利人书面授权。详见根目录 `LICENSE`。

## 鉴权与权限

| 能力 | 保护方式 |
|---|---|
| 普通用户页面 | `requireAuth`，未登录跳转登录页。 |
| 管理后台 | `requireAdmin`，非管理员展示无权限并记录日志。 |
| 私有角色 | service 层按 `user_id` / `visibility` 限制访问。 |
| 聊天会话 | `getConversationById(conversationId, userId)` 限制归属用户。 |
| 删除消息/会话 | 删除前检查子消息、派生会话和当前 leaf fallback。 |

不要只依赖前端隐藏按钮；所有写操作都必须在后端确认当前用户权限。

## CSRF

`src/middleware/csrf.js` 为同源 POST 表单和 fetch 提供轻量 CSRF 防护：

- `public/js/csrf.js` 自动给表单/fetch 附加 token。
- 旧页面兼容期允许同源 Origin/Referer 兜底。
- 新增 POST 路由时应确保页面能拿到 CSRF token。

## 输入与输出安全

- EJS 页面默认使用转义输出；只有明确已清洗的 HTML 才能用 `<%- ... %>`。
- 聊天富文本必须经过 `public/js/chat/rich-renderer/sanitizer.js` 净化。
- 通知/站内信 Markdown 服务端渲染优先走 `src/services/markdown-service.js`，前端只做降级渲染。
- 外部链接建议加 `rel="noopener noreferrer nofollow"`。

## SSRF / 外部 URL

Provider Base URL 等外部服务 URL 必须经过 `src/lib/url-safety.js` 校验，避免访问内网、localhost、metadata endpoint 或非 HTTP(S) 协议。

## 日志脱敏

统一使用 `src/lib/logger.js`。日志禁止记录：

- 密码、Cookie、Session、完整 API Key。
- 完整验证码。
- 完整手机号/邮箱，必须脱敏。
- 大段 prompt / 私密聊天内容，除非明确用于本地临时排障并及时清理。

每个请求有 `requestId`，排障优先用 requestId 串联日志。

## 验证码与限流

- 图形验证码：`captcha-service`。
- 邮箱/手机验证码：`verification-service` 编排发送、存储和校验。
- 登录/注册/验证码接口使用 `rate-limit-service`。
- 生产建议 `RATE_LIMIT_FAIL_CLOSED=true`，限流存储异常时失败关闭。

## 生产降级策略

开发环境允许 SQLite/内存 Redis 降级；生产不建议：

```env
ALLOW_PRODUCTION_SQLITE_FALLBACK=false
ALLOW_PRODUCTION_MEMORY_REDIS=false
PRODUCTION_FAIL_FAST=true
```

否则会出现数据不一致、登录态丢失、限流失效或多进程状态不同步。

## 上传与 Tavern 卡导入

- 上传文件必须限制大小、类型和数量。
- Tavern PNG/JSON 解析结果进入预览，不应直接入库。
- 标签、NSFW、visibility 应在确认导入前可见且可修改。
- 导入世界书内容会压入角色提示词片段，可能包含敏感文本，后台展示要注意权限。

## 发布前检查

```bash
npm run security:audit
npm run health:check
npm run smoke:test
```

如果 `security:audit` 报告新增危险原语，需要确认是否必须、是否只在本地开发使用、是否有输入约束。生产必须关闭 `LIVE_RELOAD_ENABLED`。
