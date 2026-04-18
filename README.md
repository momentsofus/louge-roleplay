# 楼阁

一个最简可用的在线 AI 角色对话扮演网站，站点名为“楼阁”，预定域名为 `https://aicafe.momentsofus.cn`，支持多用户注册登录、角色创建、会话聊天、MySQL 持久化、Redis 会话存储。

## 功能

- 用户注册 / 登录 / 退出
- 角色创建 / 编辑 / 浏览
- 角色对话会话创建与历史消息保存
- Redis Session
- 基础安全头、压缩、日志、输入长度限制
- 支持通过兼容 OpenAI Chat Completions 的接口接入 AI

## 启动

1. 配置 `.env`
2. 初始化数据库：`npm run db:init`
3. 启动开发：`npm run dev`
4. 启动生产：`npm run start`

## 说明

- 若未配置 AI 接口变量，聊天会返回一个可用的本地 fallback 回复，方便先把站点跑起来。
- 默认监听 `0.0.0.0:3217`
