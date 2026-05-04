# 部署指南

本文档记录楼阁的生产部署基线。当前项目不默认使用 Docker；除非有明确批准，优先使用 systemd + Nginx + MySQL + Redis。

## 生产组件

| 组件 | 建议 |
|---|---|
| Node.js | 24.x 或当前服务器运行版本。 |
| 进程管理 | systemd，服务名当前为 `ai-roleplay-site.service`。 |
| 数据库 | MySQL，独立数据库与独立项目用户。 |
| 缓存/Session | Redis，生产不要使用内存降级。 |
| 反向代理 | Nginx，HTTPS 终止并代理到 `127.0.0.1:3217`。 |
| 证书 | `acme.sh` 签发/续期 Let’s Encrypt。 |

## 目录

项目源代码位于：

```text
/opt/openclaw/workspace/project/app/louge-roleplay
```

服务根应尽量直接指向 workspace 项目路径，避免在 `/var/www` 留另一份容易过期的副本。

## 首次部署流程

```bash
cd /opt/openclaw/workspace/project/app/louge-roleplay
npm ci
cp .env.example .env
# 编辑 .env：DATABASE_URL / REDIS_URL / SESSION_SECRET / APP_URL / TRUST_PROXY / COOKIE_SECURE
npm run build
npm run db:init
npm run health:check
npm run smoke:test
```

生产 `.env` 最小基线见 `docs/ENVIRONMENT.md`。

## systemd

常用命令：

```bash
systemctl status ai-roleplay-site.service
systemctl restart ai-roleplay-site.service
journalctl -u ai-roleplay-site.service -f
```

服务重启后建议验证：

```bash
npm run health:check
npm run smoke:test
curl -fsS https://aicafe.momentsofus.cn/healthz
```

## Nginx / HTTPS

当前线上域名：

```text
https://aicafe.momentsofus.cn
```

建议 Nginx 行为：

- HTTP 自动跳转 HTTPS。
- HTTPS 代理到 `127.0.0.1:3217`。
- 保留 `Host`、`X-Forwarded-For`、`X-Forwarded-Proto`。
- 应用 `.env` 中设置 `TRUST_PROXY=true` 与 `COOKIE_SECURE=true`。

证书建议使用 `acme.sh` 管理。证书续期后 reload Nginx 即可，通常不需要重启 Node 服务。

## 发布流程

1. 在功能分支开发并验证。
2. 更新版本与 `CHANGELOG.md`。
3. PR 合并到 `master`。
4. 服务器同步 `master`。
5. 构建、数据库补结构、重启服务。
6. 健康检查和冒烟验证。

参考命令：

```bash
git fetch origin --prune
git switch master
git pull --ff-only origin master
npm ci
npm run build
npm run db:init
systemctl restart ai-roleplay-site.service
npm run health:check
npm run smoke:test
```

## 回滚

优先回滚到上一个确认稳定的 Git tag 或 merge commit：

```bash
git switch master
git checkout <stable-commit-or-tag>
npm ci
npm run build
systemctl restart ai-roleplay-site.service
npm run health:check
```

涉及数据库结构变更时，先备份数据库；不要只回退代码而忽略 schema 兼容性。

## 生产安全检查

```bash
npm run security:audit
npm run health:check
npm run version:check
```

注意：`security:audit` 会扫描危险原语。开发热刷新服务中使用 `child_process.execFile` 构建本地资源，生产必须保持 `LIVE_RELOAD_ENABLED=false`。
