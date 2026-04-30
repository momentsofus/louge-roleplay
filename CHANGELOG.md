# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：`MAJOR.MINOR.PATCH`。

## [1.0.0] - 2026-05-01

### Added

- 建立楼阁项目的第一个生产基线版本。
- 包含注册/登录、角色创建与编辑、树状会话、分支/重算/编辑、流式聊天、后台 Provider 管理、套餐额度、验证码、后台日志与后台会话查看。
- 生产部署基线：systemd 服务 `ai-roleplay-site`、Nginx 反代、MySQL、Redis、HTTPS 域名 `aicafe.momentsofus.cn`。
- 增加版本管理规范、版本检查脚本与版本暴露能力。

### Known Issues

- 完整 E2E 会真实调用外部 LLM Provider；如果模型网关或模型响应超过 Provider 超时，会导致 `npm run full-flow:test` 失败。核心健康检查与轻量回归测试不依赖该链路。
