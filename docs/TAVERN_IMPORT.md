# Tavern / SillyTavern 角色卡导入说明

楼阁支持后台批量导入 SillyTavern / TavernAI 角色卡，导入服务位于 `src/services/tavern-import/`，兼容门面为 `src/services/tavern-card-import-service.js`。

## 支持格式

| 格式 | 说明 |
|---|---|
| PNG | 读取 SillyTavern 角色卡图片中的嵌入 metadata。 |
| JSON | 读取 Tavern / SillyTavern 导出的角色 JSON。 |

导入入口：`/admin/characters/import`。

## 导入流程

```text
上传文件
  -> 解析 PNG metadata / JSON
  -> 规整 Tavern 字段和占位符
  -> 生成导入预览
  -> 管理员逐个确认标签 / NSFW / 可见性 / 重复处理
  -> 写入角色表与关联标签
```

上传后不会直接入库，必须经过预览确认。

## 字段映射

| Tavern 字段 | 楼阁字段 / 处理 |
|---|---|
| `name` | 角色名。会修复部分 Latin-1 / Windows-1252 错读乱码。 |
| `description` / `personality` / `scenario` | 规整后进入角色提示词相关字段。 |
| `first_mes` / `first_message` | 明确保存为楼阁角色开场白，并还原常见转义字符。 |
| `mes_example` | 作为示例对话/提示词片段保留。 |
| `creator_notes` 等扩展字段 | 视 payload 结构尽量保留到提示词/metadata。 |
| world book / lorebook | 当前没有独立世界书系统，会压平成角色提示词片段并保留原始 JSON。 |
| avatar image | 当前策略是不从 Tavern PNG 卡图自动覆盖楼阁角色头像，避免导入图误作头像。 |

## 标签与 NSFW

- 导入预览阶段可为每个角色单独设置多标签。
- 标签会做简繁规范化，公共角色大厅支持多标签筛选。
- NSFW 开启后默认不在公共角色大厅和首页展示。
- 用户在个人资料页开启 NSFW 显示后，才可看到相关公开角色。

## 重复角色处理

导入服务会基于文件 hash、角色名或现有记录识别重复项。确认页应明确展示重复状态，并允许按当前策略跳过或覆盖。

覆盖时注意：

- 不应误删原有互动统计。
- 不应默认覆盖现有头像。
- 标签/NSFW/visibility 以确认页最终提交为准。

## 相关文件

| 文件 | 职责 |
|---|---|
| `src/services/tavern-card-import-service.js` | 兼容门面，对路由保持稳定导出。 |
| `src/services/tavern-import/png-parser.js` | PNG metadata 解析。 |
| `src/services/tavern-import/card-payload.js` | Tavern payload 标准化与字段映射。 |
| `src/services/tavern-import/text-utils.js` | 文本清洗、编码修复、占位符规整。 |
| `src/services/tavern-import/preview-store.js` | 导入预览临时存储。 |
| `src/services/tavern-import/avatar-storage.js` | 头像/媒体保存辅助。 |
| `src/routes/web/admin/character-routes.js` | 后台导入路由。 |
| `src/views/admin-character-import*.ejs` | 导入页面与确认页模板。 |

## 验证

```bash
npm run tavern-import:test
npm run test:character-tags
npm run smoke:test
```

如果改动了导入 UI，还应人工验证：

1. PNG / JSON 混合上传。
2. 解析失败文件显示明确原因。
3. 每个角色可单独设置标签、NSFW、visibility。
4. 重复角色跳过/覆盖按预期执行。
5. 公共角色大厅标签与 NSFW 筛选正常。
