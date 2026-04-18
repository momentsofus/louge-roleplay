# 楼阁

一个最简可用的在线 AI 角色对话扮演网站，站点名为“楼阁”，预定域名为 `https://aicafe.momentsofus.cn`，支持多用户注册登录、角色创建、会话聊天、MySQL 持久化、Redis 会话存储。

## 功能

- 用户注册 / 登录 / 退出
- 角色创建 / 编辑 / 浏览
- 角色对话会话创建与历史消息保存
- Redis Session
- 基础安全头、压缩、日志、输入长度限制
- 支持通过兼容 OpenAI Chat Completions 的接口接入 AI
- 支持对话树：分支对话、任意节点开新分支、重新生成回复、编辑 AI 内容、优化用户输入

## 启动

1. 配置 `.env`
2. 初始化数据库：`npm run db:init`
3. 启动开发：`npm run dev`
4. 启动生产：`npm run start`

## 版本控制

项目现在已经是独立 Git 仓库。

推荐流程：

```bash
git checkout -b feat/xxx
# 开发
git add .
git commit -m "feat: xxx"
```

已忽略：`node_modules/`、`.env`、`logs/`、`*.log`

## 说明

- 若未配置 AI 接口变量，聊天会返回一个可用的本地 fallback 回复，方便先把站点跑起来。
- 默认监听 `0.0.0.0:3217`
- 对话树能力依赖最新数据库结构，请执行一次 `npm run db:init` 进行迁移补列。
