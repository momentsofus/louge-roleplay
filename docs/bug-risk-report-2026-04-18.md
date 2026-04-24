# ai-roleplay-site 风险清单与处理措施（2026-04-18）

## 本轮已处理

### 1. 注册/登录排障能力不足
- **问题**：之前注册失败和登录失败几乎没有结构化日志，遇到“注册了但登录不上”只能靠猜。
- **处理**：
  - `src/server.js` 为 `/register` 和 `/login` 增加结构化日志。
  - 登录失败细分为 `USER_NOT_FOUND`、`PASSWORD_MISMATCH`、`LOGIN_OR_PASSWORD_EMPTY`、`Login rate limited`。
  - 注册失败细分为验证码错误、用户名重复、手机号重复、邮箱验证码失效等原因。
- **预防措施**：后续所有关键业务入口都保持“失败原因 code + requestId + 脱敏主体信息”。

### 2. 登录接口缺少限流
- **问题**：存在被撞库/暴力尝试风险。
- **处理**：`/login` 增加基于 IP 的限流。
- **预防措施**：后续可增加用户名维度/设备维度限流，并记录异常峰值。

### 3. Redis 限流失败会影响主流程
- **问题**：限流组件故障时，可能拖垮登录/注册。
- **处理**：`src/services/rate-limit-service.js` 失败时降级放行。
- **预防措施**：对 Redis 故障做单独监控，不把附属组件变成单点致命依赖。

### 4. 错误页缺少 requestId
- **问题**：用户截图后无法快速定位日志。
- **处理**：`src/middleware/error-handler.js` 与 `src/views/error.ejs` 显示 requestId。
- **预防措施**：403/429/500 等统一带 requestId。

### 5. Admin 403 页面无可追踪信息
- **问题**：管理员权限失败难定位。
- **处理**：`src/middleware/auth.js` 增加 forbidden 日志和 requestId。
- **预防措施**：所有鉴权失败统一做日志记录。

### 6. Provider 配置缺乏严格校验
- **问题**：后台可提交非法模型、无效上下文窗口、负值价格/超时等脏数据。
- **处理**：`src/services/llm-provider-service.js` 增加：
  - 模型必须存在于 provider 返回列表中
  - `trim_context_tokens < max_context_tokens`
  - 并发、超时、上下文长度必须为正整数
  - token 价格不能为负数
- **预防措施**：后续把计划/套餐等数值配置也统一走 helper 校验。

### 7. 验证码服务缺少异常日志
- **问题**：邮件/SMS/Redis 任一失败时，不易确认断点。
- **处理**：`src/services/verification-service.js` 增加签发和校验失败日志（脱敏）。
- **预防措施**：后续给邮件和短信 provider 单独打成功率统计。

### 8. 启动炸点曾出现 `deletePromptBlock is not defined`
- **问题**：曾导致服务反复重启。
- **处理**：已复核 `src/services/prompt-engineering-service.js` 中函数存在且正确导出。
- **预防措施**：每次改动后跑 require/load 检查和 smoke test。

### 9. 公网页面冒烟覆盖不足
- **问题**：以前只检查少数路径。
- **处理**：扩展 `scripts/smoke-test.js`，新增 404 检查。
- **预防措施**：后续增加登录态后台页 smoke、聊天页 smoke。

### 10. 缺少一键健康检查
- **问题**：数据库/Redis/站点状态要靠人工零散检查。
- **处理**：新增 `scripts/health-check.js` 与 `npm run health:check`。
- **预防措施**：后续可接入 cron 或 systemd timer 定时执行并告警。

### 11. 后台表单数字字段统一解析与报错
- **问题**：`src/server.js` 多处使用 `Number(req.body.xxx || 0)`，非法输入会被悄悄吞成 0，容易造成脏数据或错误配置落库。
- **处理**：
  - 在 `src/server.js` 增加统一解析 helper：`parseIntegerField / parseNumberField / parseIdParam`
  - 管理后台的套餐、用户套餐切换、Provider、Prompt Block 等入口改为显式校验
  - 参数不合法时直接返回用户可读错误，而不是静默转换
  - `src/services/plan-service.js` 也增加数值归一化与强校验，避免只有路由层拦、服务层仍可吞脏值
- **预防措施**：后续新增后台数值表单时，统一复用 helper，禁止直接 `Number(req.body.xxx || 0)`。

### 12. 聊天/角色链路 ID 与父消息参数统一校验
- **问题**：聊天与角色编辑链路里仍有多处直接 `Number(req.params.xxx)` / `Number(req.body.parentMessageId || 0)`，非法值可能变成 `0` 或 `null` 混入流程。
- **处理**：
  - 将角色编辑、创建会话、聊天页、发送消息、重新生成、编辑 AI、编辑用户消息、后续重算、切换模型、优化输入、克隆分支等入口统一改为 `parseIdParam / parseIntegerField`
  - `parentMessageId` 改为“允许空，但若传了就必须是合法正整数”
- **预防措施**：后续新增任何消息树/会话相关路由时，禁止再直接用 `Number(req.params.xxx)` 解析外部输入。

### 13. 新增 `/healthz` 健康探针
- **问题**：之前只有页面级 smoke，没有统一的机器可读健康探针给 Nginx / systemd / 监控直接使用。
- **处理**：
  - 在 `src/server.js` 新增 `/healthz` 路由
  - 返回数据库、Redis、自身状态的 JSON 健康信息
  - `scripts/health-check.js` 与 `scripts/smoke-test.js` 均补入 `/healthz` 检查
- **当前状态**：已上线生效；本机与公网 `/healthz` 均返回 `200`，`database` / `redis` 均为 `ok`。
- **预防措施**：后续新增运维探针或中间件时，改完代码后必须补一遍“进程是否已吃到新路由”的在线校验，不能只看本地文件。

### 14. 对话链路的思考内容解析与回传边界不统一
- **问题**：AI 返回可能同时出现两种思考模式：正文内 `<think>/<thinking>` 标签，或 API 单独返回 `reasoning` / `reasoning_content` 字段；若不统一处理，会导致前端展示混乱、上下文重复回传思考内容。
- **处理**：
  - `src/services/llm-gateway-service.js` 与 `src/services/ai-service.js` 已统一支持两类思考返回
  - API reasoning 字段会被标准化为 `<think>...</think>` 再参与存储与展示
  - 历史消息再次发给 LLM 时，自动剔除 `think/thinking` 内容，不回传思考内容
  - 其他成对标签块 `<tag>...</tag>` 保留在正文原文里继续参与上下文
- **预防措施**：后续若更换模型供应商或接入新兼容层，先补返回样例验证，避免 reasoning 字段名字变化后悄悄失效。

### 15. 聊天页展示态 / 预览态 / 编辑态不一致
- **问题**：如果主消息区折叠了思考内容，但优化结果、重算预览、AI 编辑框仍直接暴露原始 `<think>`，用户体验会割裂。
- **处理**：
  - `src/views/chat.ejs` 已把主消息区、优化结果、重算预览统一成同一套折叠渲染
  - `src/services/conversation-service.js` 为消息视图补充可见正文，AI 编辑框默认只放不含 `think` 的正文
  - 新增 `scripts/test-think-parser.js` 与 `npm run test:think`，覆盖思考解析、组合与折叠识别的最小回归测试
- **预防措施**：后续只要聊天页新增任何“消息预览 / 编辑 / 摘要”区域，都必须复用同一套富文本折叠规则，不能各写各的。

## 仍建议继续处理

### A. 套餐与后台数值字段统一校验
- `src/server.js` 里仍有不少 `Number(req.body.xxx || 0)`。
- **风险**：非法输入会默默变成 0。
- **建议**：抽出 `parsePositiveIntField / parseMoneyField / parseEnumField`。

### B. 外部依赖错误分层
- Resend、Aliyun SMS、LLM provider、Redis、MySQL 目前有些错误还会直接冒泡成泛化 500。
- **建议**：区分“用户可理解错误 / 管理配置错误 / 外部服务故障”。

### C. 登录/注册自动化集成测试
- 目前主要是 smoke，不覆盖真实表单提交流程。
- **建议**：加最小集成测试，至少覆盖：验证码错、用户名重复、密码错误、登录成功。

### D. 后台 destructive action 二次确认与审计
- 删除套餐、删除提示词片段、切换 provider 等操作仍偏轻。
- **建议**：增加操作日志、确认提示、必要时软删除。

### E. 运行态健康信号
- **建议**：增加 `/healthz` 只读健康端点（不暴露敏感信息），供 Nginx/systemd/监控使用。

## 已执行检查
- `node --check` 语法检查
- 多模块 `require` 加载检查
- `npm run smoke:test`

## 备注
- 当前 Telegram 会话下无法直接提权重启 `ai-roleplay-site.service`，代码已修改，但服务重启需在允许提权的上下文里执行。
