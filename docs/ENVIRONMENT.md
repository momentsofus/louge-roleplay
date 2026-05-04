# 环境变量说明

楼阁通过根目录 `.env` 读取运行配置，解析入口是 `src/config.js`。不要提交真实 `.env`，也不要把密钥写入文档、日志或截图。

## 基础配置

| 变量 | 默认值 | 说明 |
|---|---:|---|
| `PORT` | `3217` | HTTP 监听端口。 |
| `APP_NAME` | `楼阁` | 页面标题、邮件签名和健康检查展示名。 |
| `APP_VERSION` | `package.json version` | 应用版本；通常无需手填，除非临时覆盖。 |
| `APP_URL` | `http://127.0.0.1:3217` | 对外访问地址，用于脚本、邮件/回调、排查输出。 |
| `SESSION_SECRET` | 随机临时值 | Session 签名密钥。生产必须固定配置强随机值，否则重启会导致登录态失效。 |
| `LOG_LEVEL` | `info` | 日志级别：`debug` / `info` / `warn` / `error`。 |

## 数据库与 Redis

| 变量 | 默认值 | 说明 |
|---|---:|---|
| `DATABASE_URL` | 空 | MySQL 连接串。为空时开发环境会使用 `data/local.db` SQLite。生产默认不允许 SQLite 降级。 |
| `DATABASE_ADMIN_URL` | 空 | `npm run db:init` 创建数据库/补结构时使用的管理连接串。 |
| `REDIS_URL` | 空 | Redis 连接串。为空时开发环境使用内存模式；生产默认不允许内存降级。 |
| `ALLOW_PRODUCTION_SQLITE_FALLBACK` | `false` | 生产环境是否允许 MySQL 失败后降级 SQLite。除临时救急外不要开启。 |
| `ALLOW_PRODUCTION_MEMORY_REDIS` | `false` | 生产环境是否允许 Redis 失败后使用内存模式。除临时救急外不要开启。 |

## 反向代理与生产安全

| 变量 | 默认值 | 说明 |
|---|---:|---|
| `TRUST_PROXY` | `false` | 反向代理部署时应设为 `true`，用于正确识别协议/IP。 |
| `COOKIE_SECURE` | `false` | HTTPS 生产环境应设为 `true`，确保 Cookie 只通过 HTTPS 发送。 |
| `PRODUCTION_FAIL_FAST` | `true` | 生产安全配置不完整时快速失败，避免带隐患启动。 |
| `RATE_LIMIT_FAIL_CLOSED` | `true` | 限流存储异常时是否失败关闭。生产建议保持 `true`。 |
| `LIVE_RELOAD_ENABLED` | 开发 true / 生产 false | 开发热刷新开关。生产应关闭。 |

## AI Provider

| 变量 | 默认值 | 说明 |
|---|---:|---|
| `OPENAI_BASE_URL` | 空 | 旧版 OpenAI-compatible 直连兜底配置。主要模型建议在后台 Provider 管理中维护。 |
| `OPENAI_API_KEY` | 空 | 旧版直连 API Key。不会在隐私摘要中明文输出。 |
| `OPENAI_MODEL` | 空 | 旧版直连默认模型。 |

## 邮箱验证码

| 变量 | 默认值 | 说明 |
|---|---:|---|
| `RESEND_API_KEY` | 空 | Resend 邮件发送密钥。 |
| `RESEND_FROM` | `楼阁 <aicafe@xuejourney.xin>` | 邮箱验证码发件人。 |

## 阿里云手机号认证 / 短信

| 变量 | 默认值 | 说明 |
|---|---:|---|
| `ALIYUN_PHONE_AUTH_ENABLED` | `false` | 是否启用手机号一键认证相关能力。 |
| `ALIYUN_PHONE_AUTH_APP_ID` | 空 | 阿里云号码认证 App ID。 |
| `ALIYUN_PHONE_AUTH_APP_KEY` | 空 | 阿里云号码认证 App Key。默认不会暴露到前端。 |
| `ALIYUN_PHONE_AUTH_EXPOSE_APP_KEY` | `false` | 是否把号码认证 App Key 暴露给前端。除明确需要外不要开启。 |
| `ALIYUN_NUMBER_AUTH_SCHEME_CODE` | 空 | 阿里云号码认证方案号。 |
| `ALIYUN_ACCESS_KEY_ID` | 空 | 阿里云访问密钥 ID，用于短信服务。 |
| `ALIYUN_ACCESS_KEY_SECRET` | 空 | 阿里云访问密钥 Secret，用于短信服务。 |
| `ALIYUN_SMS_SIGN_NAME` | 空 | 短信签名。 |
| `ALIYUN_SMS_TEMPLATE_CODE` | 空 | 短信模板 Code。 |

## 推荐配置组合

### 本地最小开发

```env
PORT=3217
APP_NAME=楼阁
SESSION_SECRET=dev_secret_change_in_prod
LIVE_RELOAD_ENABLED=true
```

### 生产基线

```env
PORT=3217
APP_NAME=楼阁
APP_URL=https://aicafe.momentsofus.cn
SESSION_SECRET=<64+ chars random secret>
DATABASE_URL=mysql://<user>:<password>@127.0.0.1:3306/<database>
REDIS_URL=redis://:<password>@127.0.0.1:6379
TRUST_PROXY=true
COOKIE_SECURE=true
LIVE_RELOAD_ENABLED=false
PRODUCTION_FAIL_FAST=true
ALLOW_PRODUCTION_SQLITE_FALLBACK=false
ALLOW_PRODUCTION_MEMORY_REDIS=false
RATE_LIMIT_FAIL_CLOSED=true
```

## 校验命令

```bash
npm run health:check
npm run security:audit
```

`src/config.js#getPrivacySafeSummary()` 只输出脱敏摘要，适合健康检查和日志排查，不会输出完整密钥。
