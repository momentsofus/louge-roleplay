# 后台操作指南

楼阁后台入口为 `/admin`，所有后台页面都需要管理员权限。后台能力用于运营、风控和模型配置，操作前请确认当前生产环境与目标用户/角色。

## 后台导航

后台二级菜单由 `src/views/partials/admin-subnav.ejs` 统一渲染。新增后台页面时应同步：

1. 路由注册。
2. subnav active key。
3. i18n 文案。
4. 权限校验与 CSRF。

## Provider 管理

入口：`/admin/providers`

用途：配置 OpenAI-compatible Provider、Base URL、API Key、模型列表、上下文窗口、超时与价格。

注意：

- Base URL 必须通过 URL 安全校验，禁止内网/localhost/metadata 地址。
- API Key 只允许写入，不应明文展示。
- 修改 Provider 后建议做一次聊天流式测试。

## 预设模型 / 套餐

入口：

- `/admin/preset-models`
- `/admin/plans`

用途：

- 预设模型维护模型 key、显示名、Provider 绑定等。
- 套餐维护请求额度、token 额度、周期、默认模型与模型权益。

验证建议：

```bash
npm run model-entitlements:test
npm run health:check
```

## Prompt 管理

入口：`/admin/prompts`

用途：维护全局 Prompt 片段、启用状态、排序与预览。

注意：

- Prompt 变更会影响所有后续对话。
- 不要在 Prompt 中写入密钥或不可公开的运营信息。
- 修改后建议用测试角色验证一次最终 system prompt 行为。

## 用户管理

入口：`/admin/users`

用途：调整用户角色、状态、套餐与基础账号信息。

注意：

- 管理员权限变更要谨慎。
- 禁用用户后，应确认登录拦截和已有会话访问限制正常。

## 角色卡管理与 Tavern 导入

入口：

- `/admin/characters`
- `/admin/characters/import`

能力：

- 查看公开/私有角色状态。
- 禁用/恢复/删除角色。
- 批量导入 SillyTavern/TavernAI PNG/JSON 角色卡。
- 导入前预览角色名、提示词、世界书、标签、NSFW、visibility。

导入原则：

1. 上传后先进预览，不直接入库。
2. 标签支持多选/多标签。
3. NSFW 默认不在公共大厅展示，除非用户开启 NSFW 显示。
4. 世界书内容当前压入角色卡提示词片段。

详见 `docs/TAVERN_IMPORT.md`。

## 对话审计

入口：`/admin/conversations`

能力：按用户、角色、日期、删除状态筛选会话，查看完整消息链，恢复软删除或永久删除。

注意：

- 永久删除是高风险操作，应先确认是否有派生关系和审计需求。
- 普通聊天页只展示当前显示链；后台详情用于完整审计。

## 通知与客服入口

入口：`/admin/notifications`

能力：

- 创建全站/指定页面通知。
- 支持 modal / toast / banner。
- 配置客服入口链接或二维码内容。
- 配置 showOnce、forceDisplay、audience、display scopes。

前端公开接口依赖 `window.LougeNotifications`，修改通知脚本后要跑 `npm run build:js`。

## 站内信

入口：`/admin/site-messages`

能力：发送站内信、查看发送记录、撤回消息、统计收件人数。全体站内信会对新用户补发未撤回历史消息。

## 日志查询

入口：`/admin/logs`

支持：日期、等级、文件报错、错误类型、函数名、分页。

排障优先用 requestId：

```bash
grep '<requestId>' logs/app-*.log logs/app-error-*.log
```

详见 `docs/DEBUGGING.md`。
