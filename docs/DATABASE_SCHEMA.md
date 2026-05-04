# 数据库结构说明

楼阁支持 MySQL 与 SQLite 双轨。生产建议 MySQL；SQLite 仅适合本地开发或临时排障。

## 初始化入口

```bash
npm run db:init
```

入口文件：`scripts/init-db.js`。

MySQL 模式：

- 使用 `DATABASE_ADMIN_URL` 创建数据库（如不存在）。
- 使用 `DATABASE_URL` 连接业务库。
- 创建表、补历史缺失列、补索引、写入默认套餐和 Provider 种子。
- 所有操作应幂等，可重复执行。

SQLite 模式：

- 未配置 `DATABASE_URL` 时使用 `data/local.db`。
- 表结构由 `src/lib/sqlite-schema/` 聚合初始化。
- 仅建议本地开发使用。

## 关键表关系

| 领域 | 主要表 | 说明 |
|---|---|---|
| 用户 | `users` | 登录账号、角色、状态、public_id、NSFW 偏好等。 |
| 角色 | `characters` | 角色基础信息、提示词、头像/背景、可见性、状态、统计缓存。 |
| 标签 | `character_tags` / 关联表 | 角色多标签、简繁规范化、公共筛选。 |
| 会话 | `conversations` | 用户与角色的一次对话，保存当前 leaf、父会话、模型模式。 |
| 消息 | `messages` | 线性/分支消息链，依赖 `parent_message_id` 和 `current_message_id`。 |
| Provider | `llm_providers` / preset model 表 | OpenAI-compatible Provider 与模型配置。 |
| 套餐 | `plans` / subscriptions / usage | 额度、周期、模型权益与用量统计。 |
| 通知 | `notifications` | 前台通知、客服入口、展示范围和 audience。 |
| 站内信 | site message 相关表 | 站内信发送、收件、已读、撤回。 |
| Tavern 导入 | import batch/item 相关表 | 导入批次、预览/结果、去重信息。 |
| 日志 | 文件为主 | 业务日志主要在 `logs/`，后台只解析文件，不写业务库。 |

## 会话消息链

聊天页不再读取完整消息列表，而是读取当前显示链：

```text
conversations.current_message_id
  -> messages.parent_message_id
  -> recursive CTE fetchPathMessages()
  -> chat view model
```

写入消息时：

1. 计算下一 `sequence_no`。
2. 插入 `messages`。
3. 更新 `conversations.current_message_id`。
4. 失效消息列表、消息数量和路径缓存。

## MySQL / SQLite 差异

`src/lib/db.js` 对上层屏蔽差异：

- SQL 占位符统一用 `?`。
- `query()` 对 SELECT/WITH 返回行数组。
- INSERT 返回 `{ insertId, affectedRows }`。
- 其他 DML 返回 `{ affectedRows }`。
- `withTransaction()` 提供兼容事务。

新增字段时必须同步：

1. MySQL 初始化/迁移脚本：`scripts/init-db/`。
2. SQLite schema：`src/lib/sqlite-schema/`。
3. 相关 service 的 ensure schema / 补列逻辑。
4. 测试脚本与文档。

## 备份与回滚

生产变更前建议：

```bash
mysqldump --single-transaction --routines --triggers <database> > backup-$(date +%F-%H%M%S).sql
```

涉及不可逆迁移时，不要只回退代码；必须确认 schema、数据和服务版本兼容。

## 验证

```bash
npm run db:init
npm run health:check
npm run conversation-service:test
npm run admin-conversations:test
npm run tavern-import:test
```
