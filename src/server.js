/**
 * @file src/server.js
 * @description
 * Web 应用主入口，负责中间件初始化、路由注册、会话管理与站点启动。
 *
 * 设计原则：
 * - 路由层只保留“编排逻辑”和参数校验。
 * - 结构化的消息树、分支克隆、缓存等尽量下沉到 service。
 * - DEBUG 信息统一写日志，页面只给必要状态，不暴露堆栈。
 */

const path = require('path');
const express = require('express');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./lib/logger');
const { query, waitReady: waitDbReady, getDbType } = require('./lib/db');
const { initRedis, redisClient, isRedisReal } = require('./lib/redis');
const { requestContext } = require('./middleware/request-context');
const { errorHandler } = require('./middleware/error-handler');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const { hashPassword, verifyPassword } = require('./services/password-service');
const { createUser, findUserByUsername, findUserByEmail, findUserByPhone, findUserByLogin, findUserById, updateUserRole } = require('./services/user-service');
const { createCharacter, updateCharacter, listPublicCharacters, listUserCharacters, getCharacterById, deleteCharacterSafely } = require('./services/character-service');
const { listPlans, findPlanById, createPlan, updatePlan, deletePlan, getActiveSubscriptionForUser, getUserQuotaSnapshot, updateUserPlan } = require('./services/plan-service');
const { listUsersWithPlans, getAdminOverview } = require('./services/admin-service');
const { listProviders, createProvider, updateProvider } = require('./services/llm-provider-service');
const {
  listPromptBlocks,
  createPromptBlock,
  updatePromptBlock,
  reorderPromptBlocks,
  deletePromptBlock,
  parsePromptItemsFromForm,
  normalizePromptItems,
  buildPromptPreview,
} = require('./services/prompt-engineering-service');
const {
  createConversation,
  updateConversationTitle,
  updateConversationModelMode,
  getConversationById,
  listUserConversations,
  listMessages,
  getMessageById,
  addMessage,
  setConversationCurrentMessage,
  createEditedMessageVariant,
  buildPathMessages,
  buildConversationView,
  cloneConversationBranch,
  deleteMessageSafely,
  deleteConversationSafely,
  invalidateConversationCache,
} = require('./services/conversation-service');
const { generateReplyViaGateway, streamReplyViaGateway, optimizeUserInputViaGateway, getChatModelSelector } = require('./services/llm-gateway-service');
const { createCaptcha, refreshCaptcha, getCaptchaImage, verifyCaptcha } = require('./services/captcha-service');
const { issueEmailCode, issuePhoneCode, verifyEmailCode, verifyPhoneCode } = require('./services/verification-service');
const { verifyDomesticPhoneIdentity } = require('./services/phone-auth-service');
const { hitLimit } = require('./services/rate-limit-service');

const app = express();

function renderPage(res, view, params = {}) {
  res.render(view, params, (viewError, html) => {
    if (viewError) {
      logger.error('[renderPage] View 渲染失败', { view, error: viewError.message });
      return res.status(500).type('text').send('页面渲染失败，请稍后重试。');
    }
    res.render('layout', {
      title: params.title || config.appName,
      body: html,
      currentUser: res.locals.currentUser,
      appName: config.appName,
      appUrl: config.appUrl,
    });
  });
}

function renderRegisterPage(res, options = {}) {
  renderPage(res, 'register', {
    title: '注册',
    captcha: options.captcha,
    form: options.form || {},
    formMessage: options.formMessage || '',
    authConfig: config.publicPhoneAuthConfig,
  });
}

function getClientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

function maskEmail(email = '') {
  const raw = String(email || '').trim().toLowerCase();
  if (!raw || !raw.includes('@')) {
    return '';
  }
  const [localPart, domain] = raw.split('@');
  if (!localPart || !domain) {
    return '';
  }
  if (localPart.length <= 2) {
    return `${localPart[0] || '*'}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone = '') {
  const raw = String(phone || '').replace(/\s+/g, '');
  if (!raw) {
    return '';
  }
  if (raw.length <= 4) {
    return `${raw.slice(0, 1)}***`;
  }
  return `${raw.slice(0, 3)}****${raw.slice(-4)}`;
}

function buildRegisterLogMeta(req, payload = {}) {
  return {
    requestId: req.requestId,
    ip: getClientIp(req),
    username: String(payload.username || '').trim() || '',
    countryType: String(payload.countryType || '').trim() || '',
    email: maskEmail(payload.email || ''),
    phone: maskPhone(payload.phone || ''),
  };
}

function buildLoginLogMeta(req, payload = {}) {
  return {
    requestId: req.requestId,
    ip: getClientIp(req),
    login: String(payload.login || '').trim(),
  };
}

function renderValidationMessage(res, message, title = '提示') {
  return renderPage(res, 'message', { title, message });
}

function writeNdjson(res, payload) {
  res.write(`${JSON.stringify(payload)}\n`);
}

function buildChatRequestContext(req, conversation, allMessages, rawContent, parentMessageId) {
  const isFirstTurn = allMessages.length === 0;
  const content = String(rawContent || '').trim() || (isFirstTurn ? '[开始一次新的对话]' : '');
  const fallbackLeafId = conversation.current_message_id || (allMessages.length ? allMessages[allMessages.length - 1].id : null);
  const history = buildPathMessages(allMessages, parentMessageId || fallbackLeafId || null);
  const isBranchReply = parentMessageId && Number(parentMessageId) !== Number(conversation.current_message_id || 0);

  return {
    isFirstTurn,
    content,
    history,
    isBranchReply,
    promptKind: isFirstTurn ? 'conversation-start' : (isBranchReply ? 'branch' : 'chat'),
  };
}

function initNdjsonStream(res) {
  res.status(200);
  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }
}

function parseIntegerField(value, options = {}) {
  const {
    fieldLabel = '数值字段',
    defaultValue,
    min,
    allowEmpty = false,
  } = options;

  const raw = String(value ?? '').trim();
  if (!raw) {
    if (allowEmpty) {
      return null;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`${fieldLabel}不能为空。`);
  }

  if (!/^-?\d+$/.test(raw)) {
    throw new Error(`${fieldLabel}必须是整数。`);
  }

  const normalized = Number(raw);
  if (!Number.isSafeInteger(normalized)) {
    throw new Error(`${fieldLabel}超出允许范围。`);
  }
  if (min !== undefined && normalized < min) {
    throw new Error(`${fieldLabel}不能小于 ${min}。`);
  }
  return normalized;
}

function parseNumberField(value, options = {}) {
  const {
    fieldLabel = '数值字段',
    defaultValue,
    min,
    allowEmpty = false,
  } = options;

  const raw = String(value ?? '').trim();
  if (!raw) {
    if (allowEmpty) {
      return null;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`${fieldLabel}不能为空。`);
  }

  const normalized = Number(raw);
  if (!Number.isFinite(normalized)) {
    throw new Error(`${fieldLabel}必须是数字。`);
  }
  if (min !== undefined && normalized < min) {
    throw new Error(`${fieldLabel}不能小于 ${min}。`);
  }
  return normalized;
}

function parseIdParam(value, fieldLabel = 'ID') {
  return parseIntegerField(value, { fieldLabel, min: 1 });
}

function splitCharacterPromptProfile(promptProfileJson) {
  let items = [];

  if (Array.isArray(promptProfileJson)) {
    items = promptProfileJson;
  } else if (promptProfileJson && typeof promptProfileJson === 'object') {
    items = [promptProfileJson];
  } else {
    try {
      items = JSON.parse(promptProfileJson || '[]');
    } catch (error) {
      items = [];
    }
  }

  const structured = {
    role: '',
    traitDescription: '',
    currentScene: '',
    currentBackground: '',
  };
  const extraItems = [];

  (Array.isArray(items) ? items : []).forEach((item) => {
    const key = String(item?.key || '').trim();
    const value = String(item?.value || '').trim();
    const isEnabled = item?.isEnabled === undefined ? true : Boolean(Number(item?.isEnabled ?? item?.is_enabled ?? 1));
    const normalized = { key, value, isEnabled, sortOrder: Number(item?.sortOrder ?? item?.sort_order ?? extraItems.length) };

    if (key === '角色') {
      structured.role = value;
      return;
    }
    if (key === '描述角色性格') {
      structured.traitDescription = value;
      return;
    }
    if (key === '当前场景') {
      structured.currentScene = value;
      return;
    }
    if (key === '当前背景') {
      structured.currentBackground = value;
      return;
    }

    if (key && key !== '角色名' && key !== '角色简介') {
      extraItems.push(normalized);
    }
  });

  return {
    structured,
    extraItems: normalizePromptItems(extraItems),
  };
}

function buildCharacterPromptProfileFromForm(body) {
  const extraItems = parsePromptItemsFromForm(body, {
    keyField: 'extraPromptItemKey',
    valueField: 'extraPromptItemValue',
    enabledField: 'extraPromptItemEnabled',
  });

  const structuredItems = [
    { key: '角色名', value: String(body.name || '').trim(), sortOrder: 0, isEnabled: true },
    { key: '角色简介', value: String(body.summary || '').trim(), sortOrder: 1, isEnabled: true },
    { key: '角色', value: String(body.role || '').trim(), sortOrder: 2, isEnabled: true },
    { key: '描述角色性格', value: String(body.traitDescription || '').trim(), sortOrder: 3, isEnabled: true },
    { key: '当前场景', value: String(body.currentScene || '').trim(), sortOrder: 4, isEnabled: true },
    { key: '当前背景', value: String(body.currentBackground || '').trim(), sortOrder: 5, isEnabled: true },
  ].filter((item) => item.value);

  return normalizePromptItems([
    ...structuredItems,
    ...extraItems.map((item, index) => ({ ...item, sortOrder: structuredItems.length + index })),
  ]);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isAllowedInternationalEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  const domain = email.split('@')[1] || '';
  const allowedDomains = new Set([
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'yahoo.com',
    'yahoo.co.jp',
    'yahoo.co.uk',
    'ymail.com',
    'aol.com',
    'proton.me',
    'protonmail.com',
  ]);
  return allowedDomains.has(domain);
}

function isDomesticPhone(value) {
  return /^1\d{10}$/.test(String(value || '').trim());
}

function buildConversationTitle(characterName, content = '') {
  const tail = String(content || '').trim().replace(/\s+/g, ' ').slice(0, 28);
  return tail ? `${characterName} · ${tail}` : `${characterName} · 新分支`;
}

function buildBranchConversationTitle(conversation, branchLabel, branchSummary) {
  const compact = [branchLabel, branchSummary]
    .filter(Boolean)
    .join(' · ')
    .replace(/\s+/g, ' ')
    .slice(0, 42);
  return compact ? `${conversation.character_name} · ${compact}` : `${conversation.character_name} · 分支对话`;
}

function buildNextConversationTitle(conversation, userContent) {
  return buildConversationTitle(conversation.character_name, userContent || conversation.character_summary || '');
}

async function renderChatPage(req, res, conversation, options = {}) {
  const allMessages = await listMessages(conversation.id);
  const fallbackLeafId = conversation.current_message_id || (allMessages.length ? allMessages[allMessages.length - 1].id : null);
  const requestedLeafId = Number(options.leafId || req.query.leaf || fallbackLeafId || 0) || null;
  const activeLeafId = requestedLeafId || fallbackLeafId || null;

  if (activeLeafId && Number(conversation.current_message_id || 0) !== Number(activeLeafId)) {
    await setConversationCurrentMessage(conversation.id, activeLeafId);
    conversation.current_message_id = activeLeafId;
  }

  const view = buildConversationView(allMessages, activeLeafId);
  const chatModelSelector = await getChatModelSelector();

  renderPage(res, 'chat', {
    title: '聊天',
    conversation,
    view,
    draftContent: options.draftContent || String(req.query.draft || ''),
    optimizedContent: options.optimizedContent || '',
    regeneratedPreview: options.regeneratedPreview || null,
    chatModelSelector,
    errorMessage: options.errorMessage || null,
  });
}

async function loadConversationForUserOrFail(req, res, conversationId) {
  const conversation = await getConversationById(conversationId, req.session.user.id);
  if (!conversation) {
    renderPage(res, 'message', { title: '提示', message: '会话不存在或无权访问。' });
    return null;
  }
  return conversation;
}

async function bootstrap() {
  // ── 数据库初始化 ─────────────────────────────────────────────────────────────
  // waitDbReady() 确保 MySQL/SQLite 已就绪，失败则直接退出
  await waitDbReady();
  logger.info('[bootstrap] 数据库已就绪', { dbType: getDbType() });

  // ── Redis 初始化（可选）─────────────────────────────────────────────────────
  // initRedis() 失败时不抛错，自动降级到内存模式
  await initRedis();
  logger.info('[bootstrap] Redis 初始化完成', { mode: isRedisReal() ? '真实 Redis' : '内存替代' });

  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use('/public', express.static(path.join(__dirname, '..', 'public')));

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(express.urlencoded({ extended: false, limit: '20kb' }));
  app.use(express.json({ limit: '20kb' }));
  app.use(morgan('combined'));

  // ── Session 存储 ─────────────────────────────────────────────────────────────
  // 真实 Redis 可用时使用 RedisStore（支持多进程共享 + 持久化）；
  // 否则使用 express-session 默认的内存存储（仅适合单进程本地开发）
  const sessionStore = isRedisReal()
    ? new RedisStore({ client: redisClient })
    : undefined; // undefined → express-session 使用内置 MemoryStore

  if (!isRedisReal()) {
    logger.warn('[bootstrap] Session 使用内存存储（重启后登录状态清空，不适合生产）');
  }

  app.use(session({
    store: sessionStore,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.cookieSecure,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  }));

  app.use(requestContext);

  app.get('/', async (req, res, next) => {
    try {
      const characters = await listPublicCharacters();
      renderPage(res, 'home', { title: '首页', characters });
    } catch (error) {
      next(error);
    }
  });

  app.get('/register', async (req, res, next) => {
    try {
      const captcha = await createCaptcha();
      renderRegisterPage(res, { captcha });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/captcha', async (req, res, next) => {
    try {
      const previousCaptchaId = String(req.query.previousCaptchaId || '').trim();
      const captcha = previousCaptchaId ? await refreshCaptcha(previousCaptchaId) : await createCaptcha();
      res.json(captcha);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/captcha/image/:captchaId', async (req, res, next) => {
    try {
      const svg = await getCaptchaImage(String(req.params.captchaId || '').trim());
      if (!svg) {
        return res.status(404).send('captcha expired');
      }
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.send(svg);
    } catch (error) {
      next(error);
    }
  });

  app.get('/healthz', async (req, res) => {
    const checks = {
      ok: true,
      app: config.appName,
      time: new Date().toISOString(),
      dbType: getDbType(),
      redisMode: isRedisReal() ? 'redis' : 'memory',
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    try {
      await query('SELECT 1');
      checks.services.database = 'ok';
    } catch (error) {
      checks.ok = false;
      checks.services.database = 'error';
      checks.databaseError = error.message;
    }

    try {
      await redisClient.ping();
      checks.services.redis = isRedisReal() ? 'ok' : 'memory';
    } catch (error) {
      checks.ok = false;
      checks.services.redis = 'error';
      checks.redisError = error.message;
    }

    return res.status(checks.ok ? 200 : 503).json(checks);
  });

  app.post('/api/send-email-code', async (req, res, next) => {
    const refreshAndRespond = async (status, payload) => {
      const nextCaptcha = await createCaptcha();
      return res.status(status).json({
        ...payload,
        nextCaptchaId: nextCaptcha.captchaId,
        nextCaptchaImageUrl: nextCaptcha.imageUrl,
        requireNewCaptcha: true,
      });
    };

    try {
      const ip = getClientIp(req);
      const email = String(req.body.email || '').trim().toLowerCase();
      const countryType = String(req.body.countryType || 'international').trim();
      const captchaId = String(req.body.captchaId || '').trim();
      const captchaText = String(req.body.captchaText || '').trim();

      const captchaPassed = await verifyCaptcha(captchaId, captchaText, true);
      if (!captchaPassed) {
        return refreshAndRespond(400, { message: '图形验证码错误或已失效，请输入新的图形验证码。' });
      }

      if (!isEmail(email)) {
        return refreshAndRespond(400, { message: '邮箱格式不正确，请输入新的图形验证码后重试。' });
      }
      if (countryType === 'international' && !isAllowedInternationalEmail(email)) {
        return refreshAndRespond(400, { message: '海外用户仅支持 Gmail、Outlook、Hotmail、Live、iCloud、Yahoo、AOL、Proton 等主流邮箱，请输入新的图形验证码后重试。' });
      }
      if (await findUserByEmail(email)) {
        return refreshAndRespond(400, { message: '邮箱已被注册，请输入新的图形验证码后重试。' });
      }

      await issueEmailCode(email, ip);
      return refreshAndRespond(200, { message: '邮箱验证码已发送，请输入新的图形验证码以继续后续操作。' });
    } catch (error) {
      try {
        return refreshAndRespond(400, { message: `${error.message || '发送失败'}，请输入新的图形验证码后重试。` });
      } catch (refreshError) {
        return next(error);
      }
    }
  });

  app.post('/api/send-phone-code', async (req, res, next) => {
    const refreshAndRespond = async (status, payload) => {
      const nextCaptcha = await createCaptcha();
      return res.status(status).json({
        ...payload,
        nextCaptchaId: nextCaptcha.captchaId,
        nextCaptchaImageUrl: nextCaptcha.imageUrl,
        requireNewCaptcha: true,
      });
    };

    try {
      const ip = getClientIp(req);
      const phone = String(req.body.phone || '').trim();
      const captchaId = String(req.body.captchaId || '').trim();
      const captchaText = String(req.body.captchaText || '').trim();

      if (!isDomesticPhone(phone)) {
        return refreshAndRespond(400, { message: '请输入正确的国内手机号，并输入新的图形验证码后重试。' });
      }
      if (await findUserByPhone(phone)) {
        return refreshAndRespond(400, { message: '手机号已被注册，请输入新的图形验证码后重试。' });
      }

      const captchaPassed = await verifyCaptcha(captchaId, captchaText, true);
      if (!captchaPassed) {
        return refreshAndRespond(400, { message: '图形验证码错误或已失效，请输入新的图形验证码。' });
      }

      await verifyDomesticPhoneIdentity({ phone, captchaPassed });
      await issuePhoneCode(phone, ip);
      logger.debug('Phone verification code issued', {
        requestId: req.requestId,
        phoneMasked: `${phone.slice(0, 3)}****${phone.slice(-4)}`,
        provider: 'aliyun-sms',
      });
      return refreshAndRespond(200, { message: '短信验证码已发送，请输入新的图形验证码以继续后续操作。' });
    } catch (error) {
      try {
        return refreshAndRespond(400, { message: `${error.message || '发送失败'}，请输入新的图形验证码后重试。` });
      } catch (refreshError) {
        return next(error);
      }
    }
  });

  app.post('/register', async (req, res, next) => {
    const buildFormState = () => ({
      username: String(req.body.username || '').trim(),
      countryType: String(req.body.countryType || 'domestic').trim(),
      email: String(req.body.email || '').trim().toLowerCase(),
      phone: String(req.body.phone || '').trim(),
      showEmailToggle: Boolean(String(req.body.email || '').trim()),
    });

    const registerLogMeta = () => buildRegisterLogMeta(req, {
      username: req.body.username,
      countryType: req.body.countryType,
      email: req.body.email,
      phone: req.body.phone,
    });

    const renderRegisterError = async (message, reason = '') => {
      logger.warn('Register validation failed', {
        ...registerLogMeta(),
        reason: reason || message,
      });
      const nextCaptcha = await refreshCaptcha(String(req.body.captchaId || '').trim());
      return renderRegisterPage(res, {
        captcha: nextCaptcha,
        form: buildFormState(),
        formMessage: `${message} 请重新输入新的图形验证码。`,
      });
    };

    try {
      const ip = getClientIp(req);
      const limited = await hitLimit(`rate:register:${ip}`, 60, 10);
      if (limited) {
        return renderRegisterError('注册请求太频繁，请稍后再试。', 'REGISTER_RATE_LIMITED');
      }

      const username = String(req.body.username || '').trim();
      const password = String(req.body.password || '').trim();
      const countryType = String(req.body.countryType || 'domestic').trim();
      const email = String(req.body.email || '').trim().toLowerCase() || null;
      const emailCode = String(req.body.emailCode || '').trim();
      const phone = String(req.body.phone || '').trim() || null;
      const phoneCode = String(req.body.phoneCode || '').trim();
      const captchaId = String(req.body.captchaId || '').trim();
      const captchaText = String(req.body.captchaText || '').trim();

      const captchaPassed = await verifyCaptcha(captchaId, captchaText, true);
      if (!captchaPassed) {
        return renderRegisterError('图形验证码错误或已失效。', 'CAPTCHA_INVALID');
      }

      if (username.length < 3 || password.length < 6) {
        return renderRegisterError('用户名至少 3 位，密码至少 6 位。', 'USERNAME_OR_PASSWORD_TOO_SHORT');
      }

      const existingUser = await findUserByUsername(username);
      if (existingUser) {
        return renderRegisterError('用户名已存在。', 'USERNAME_ALREADY_EXISTS');
      }

      let emailVerified = 0;
      let phoneVerified = 0;

      if (countryType === 'domestic') {
        if (!phone || !isDomesticPhone(phone)) {
          return renderRegisterError('国内用户必须填写正确手机号。', 'DOMESTIC_PHONE_INVALID');
        }
        if (await findUserByPhone(phone)) {
          return renderRegisterError('手机号已被注册。', 'PHONE_ALREADY_EXISTS');
        }
        const phoneOk = await verifyPhoneCode(phone, phoneCode);
        if (!phoneOk) {
          return renderRegisterError('短信验证码错误或已失效。', 'PHONE_CODE_INVALID');
        }
        phoneVerified = 1;

        if (email) {
          if (!isEmail(email)) {
            return renderRegisterError('邮箱格式不正确。', 'EMAIL_INVALID');
          }
          if (await findUserByEmail(email)) {
            return renderRegisterError('邮箱已被注册。', 'EMAIL_ALREADY_EXISTS');
          }
          const emailOk = await verifyEmailCode(email, emailCode);
          if (!emailOk) {
            return renderRegisterError('邮箱验证码错误或已失效。', 'EMAIL_CODE_INVALID');
          }
          emailVerified = 1;
        }
      } else {
        if (!email || !isEmail(email)) {
          return renderRegisterError('国外用户必须填写有效邮箱。', 'INTERNATIONAL_EMAIL_REQUIRED');
        }
        if (!isAllowedInternationalEmail(email)) {
          return renderRegisterError('海外用户仅支持 Gmail、Outlook、Hotmail、Live、iCloud、Yahoo、AOL、Proton 等主流邮箱。', 'INTERNATIONAL_EMAIL_PROVIDER_NOT_ALLOWED');
        }
        if (await findUserByEmail(email)) {
          return renderRegisterError('邮箱已被注册。', 'EMAIL_ALREADY_EXISTS');
        }
        const emailOk = await verifyEmailCode(email, emailCode);
        if (!emailOk) {
          return renderRegisterError('邮箱验证码错误或已失效。', 'EMAIL_CODE_INVALID');
        }
        emailVerified = 1;
      }

      const passwordHash = await hashPassword(password);
      const userId = await createUser({
        username,
        passwordHash,
        email,
        phone,
        countryType,
        emailVerified,
        phoneVerified,
      });
      logger.info('Register succeeded', {
        ...registerLogMeta(),
        userId,
      });
      req.session.user = { id: userId, username, role: 'user' };
      return res.redirect('/dashboard');
    } catch (error) {
      logger.error('Register request failed', {
        ...registerLogMeta(),
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  });

  app.get('/login', (req, res) => renderPage(res, 'login', { title: '登录' }));
  app.post('/login', async (req, res, next) => {
    try {
      const login = String(req.body.login || '').trim();
      const password = String(req.body.password || '').trim();
      const ip = getClientIp(req);
      const limited = await hitLimit(`rate:login:${ip}`, 60, 20);
      if (limited) {
        logger.warn('Login rate limited', buildLoginLogMeta(req, { login }));
        return renderPage(res, 'message', { title: '提示', message: '登录请求太频繁，请稍后再试。' });
      }
      if (!login || !password) {
        logger.warn('Login validation failed', {
          ...buildLoginLogMeta(req, { login }),
          reason: 'LOGIN_OR_PASSWORD_EMPTY',
        });
        return renderPage(res, 'message', { title: '提示', message: '账号和密码不能为空。' });
      }
      const user = await findUserByLogin(login);

      if (!user) {
        logger.warn('Login failed', {
          ...buildLoginLogMeta(req, { login }),
          reason: 'USER_NOT_FOUND',
        });
        return renderPage(res, 'message', { title: '提示', message: '账号或密码错误。' });
      }

      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        logger.warn('Login failed', {
          ...buildLoginLogMeta(req, { login }),
          userId: user.id,
          reason: 'PASSWORD_MISMATCH',
        });
        return renderPage(res, 'message', { title: '提示', message: '账号或密码错误。' });
      }

      logger.info('Login succeeded', {
        ...buildLoginLogMeta(req, { login }),
        userId: user.id,
      });
      req.session.user = { id: user.id, username: user.username, role: user.role || 'user' };
      return res.redirect('/dashboard');
    } catch (error) {
      logger.error('Login request failed', {
        ...buildLoginLogMeta(req, { login: req.body.login }),
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  });

  app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
  });

  app.get('/dashboard', requireAuth, async (req, res, next) => {
    try {
      const user = await findUserById(req.session.user.id);
      if (!user) {
        // 用户记录已不存在（被删除），清除会话并跳转登录页
        return req.session.destroy(() => res.redirect('/login'));
      }
      const characters = await listUserCharacters(req.session.user.id);
      const conversations = await listUserConversations(req.session.user.id);
      const subscription = await getActiveSubscriptionForUser(req.session.user.id);
      const quota = await getUserQuotaSnapshot(req.session.user.id);
      renderPage(res, 'dashboard', { title: '控制台', user, characters, conversations, subscription, quota });
    } catch (error) {
      next(error);
    }
  });

  app.get('/admin', requireAdmin, async (req, res, next) => {
    try {
      const [overview, users, plans, providers, promptBlocks] = await Promise.all([
        getAdminOverview(),
        listUsersWithPlans(),
        listPlans(),
        listProviders(),
        listPromptBlocks(),
      ]);

      const promptPreview = buildPromptPreview({
        promptBlocks: promptBlocks.map((item) => ({
          key: item.block_key,
          value: item.block_value,
          sortOrder: item.sort_order,
          isEnabled: item.is_enabled,
        })),
        character: {
          name: '示例角色',
          summary: '一个用于后台预览拼接效果的示例角色。',
          personality: '冷静、克制、说话短但有温度。',
          prompt_profile_json: '[]',
        },
      });

      const promptPreviewMeta = {
        characterName: '示例角色',
        dynamicItemsSource: '后台写死的示例角色 prompt_profile_json，用来演示最终拼接效果，不来自你刚创建的全局提示词片段。',
      };

      renderPage(res, 'admin', {
        title: '管理员后台',
        overview,
        users,
        plans,
        providers,
        promptBlocks,
        promptPreview,
        promptPreviewMeta,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/admin/plans/new', requireAdmin, async (req, res, next) => {
    try {
      const code = String(req.body.code || '').trim();
      const name = String(req.body.name || '').trim();
      if (!code || !name) {
        return renderValidationMessage(res, '新增套餐时，code 和 name 不能为空。');
      }

      await createPlan({
        code,
        name,
        description: String(req.body.description || '').trim(),
        billingMode: String(req.body.billingMode || 'per_request').trim(),
        quotaPeriod: String(req.body.quotaPeriod || 'monthly').trim(),
        requestQuota: parseIntegerField(req.body.requestQuota, { fieldLabel: '请求额度', defaultValue: 0, min: 0 }),
        tokenQuota: parseIntegerField(req.body.tokenQuota, { fieldLabel: 'Token 额度', defaultValue: 0, min: 0 }),
        priorityWeight: parseIntegerField(req.body.priorityWeight, { fieldLabel: '优先级权重', defaultValue: 0, min: 0 }),
        concurrencyLimit: parseIntegerField(req.body.concurrencyLimit, { fieldLabel: '并发上限', defaultValue: 1, min: 1 }),
        maxOutputTokens: parseIntegerField(req.body.maxOutputTokens, { fieldLabel: '最大输出 Token', defaultValue: 1024, min: 1 }),
        status: String(req.body.status || 'active').trim(),
        isDefault: String(req.body.isDefault || '') === '1',
        sortOrder: parseIntegerField(req.body.sortOrder, { fieldLabel: '排序值', defaultValue: 0, min: 0 }),
      });
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/plans/:planId', requireAdmin, async (req, res, next) => {
    try {
      const planId = parseIdParam(req.params.planId, '套餐 ID');
      const plan = await findPlanById(planId);
      if (!plan) {
        return renderValidationMessage(res, '套餐不存在。');
      }

      await updatePlan(planId, {
        name: String(req.body.name || '').trim(),
        description: String(req.body.description || '').trim(),
        billingMode: String(req.body.billingMode || 'per_request').trim(),
        quotaPeriod: String(req.body.quotaPeriod || 'monthly').trim(),
        requestQuota: parseIntegerField(req.body.requestQuota, { fieldLabel: '请求额度', defaultValue: 0, min: 0 }),
        tokenQuota: parseIntegerField(req.body.tokenQuota, { fieldLabel: 'Token 额度', defaultValue: 0, min: 0 }),
        priorityWeight: parseIntegerField(req.body.priorityWeight, { fieldLabel: '优先级权重', defaultValue: 0, min: 0 }),
        concurrencyLimit: parseIntegerField(req.body.concurrencyLimit, { fieldLabel: '并发上限', defaultValue: 1, min: 1 }),
        maxOutputTokens: parseIntegerField(req.body.maxOutputTokens, { fieldLabel: '最大输出 Token', defaultValue: 1024, min: 1 }),
        status: String(req.body.status || 'active').trim(),
        isDefault: String(req.body.isDefault || '') === '1',
        sortOrder: parseIntegerField(req.body.sortOrder, { fieldLabel: '排序值', defaultValue: 0, min: 0 }),
      });
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/plans/:planId/delete', requireAdmin, async (req, res, next) => {
    try {
      const planId = parseIdParam(req.params.planId, '套餐 ID');
      const plan = await findPlanById(planId);
      if (!plan) {
        return renderValidationMessage(res, '套餐不存在。');
      }

      try {
        await deletePlan(planId);
      } catch (error) {
        if (error.message === 'PLAN_IN_USE') {
          return renderValidationMessage(res, '这个套餐已经被订阅或历史记录引用，暂时不能删除。先解绑/更换用户套餐，再删。');
        }
        throw error;
      }

      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/users/:userId/role', requireAdmin, async (req, res, next) => {
    try {
      const userId = parseIdParam(req.params.userId, '用户 ID');
      const role = String(req.body.role || 'user').trim();
      if (!['user', 'admin'].includes(role)) {
        return renderValidationMessage(res, '角色类型不支持。');
      }
      await updateUserRole(userId, role);
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/users/:userId/plan', requireAdmin, async (req, res, next) => {
    try {
      const userId = parseIdParam(req.params.userId, '用户 ID');
      const planId = parseIdParam(req.body.planId, '套餐 ID');
      const plan = await findPlanById(planId);
      if (!plan) {
        return renderValidationMessage(res, '套餐不存在。');
      }
      await updateUserPlan(userId, planId);
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/providers/new', requireAdmin, async (req, res, next) => {
    try {
      const name = String(req.body.name || '').trim();
      const baseUrl = String(req.body.baseUrl || '').trim();
      const apiKey = String(req.body.apiKey || '').trim();
      if (!name || !baseUrl || !apiKey) {
        return renderValidationMessage(res, '新增 Provider 时，名称、Base URL、API Key 不能为空。模型可在保存后从 API 返回列表里搜索选择。');
      }

      await createProvider({
        name,
        baseUrl,
        apiKey,
        standardModel: String(req.body.standardModel || '').trim(),
        jailbreakModel: String(req.body.jailbreakModel || '').trim(),
        forceJailbreakModel: String(req.body.forceJailbreakModel || '').trim(),
        compressionModel: String(req.body.compressionModel || '').trim(),
        maxContextTokens: parseIntegerField(req.body.maxContextTokens, { fieldLabel: '最大上下文 Token', defaultValue: 81920, min: 1 }),
        trimContextTokens: parseIntegerField(req.body.trimContextTokens, { fieldLabel: '裁剪上下文 Token', defaultValue: 61440, min: 1 }),
        isActive: String(req.body.isActive || '') === '1',
        status: String(req.body.status || 'active').trim(),
        maxConcurrency: parseIntegerField(req.body.maxConcurrency, { fieldLabel: '最大并发数', defaultValue: 5, min: 1 }),
        timeoutMs: parseIntegerField(req.body.timeoutMs, { fieldLabel: '超时时间(ms)', defaultValue: 60000, min: 1 }),
        inputTokenPrice: parseNumberField(req.body.inputTokenPrice, { fieldLabel: '输入 Token 单价', defaultValue: 0, min: 0 }),
        outputTokenPrice: parseNumberField(req.body.outputTokenPrice, { fieldLabel: '输出 Token 单价', defaultValue: 0, min: 0 }),
      });
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/providers/:providerId', requireAdmin, async (req, res, next) => {
    try {
      const providerId = parseIdParam(req.params.providerId, 'Provider ID');
      await updateProvider(providerId, {
        name: req.body.name,
        baseUrl: req.body.baseUrl,
        apiKey: req.body.apiKey,
        standardModel: req.body.standardModel,
        jailbreakModel: req.body.jailbreakModel,
        forceJailbreakModel: req.body.forceJailbreakModel,
        compressionModel: req.body.compressionModel,
        maxContextTokens: parseIntegerField(req.body.maxContextTokens, { fieldLabel: '最大上下文 Token', defaultValue: 81920, min: 1 }),
        trimContextTokens: parseIntegerField(req.body.trimContextTokens, { fieldLabel: '裁剪上下文 Token', defaultValue: 61440, min: 1 }),
        refreshModels: String(req.body.refreshModels || '') === '1' ? '1' : '0',
        isActive: String(req.body.isActive || '') === '1',
        status: String(req.body.status || 'active').trim(),
        maxConcurrency: parseIntegerField(req.body.maxConcurrency, { fieldLabel: '最大并发数', defaultValue: 5, min: 1 }),
        timeoutMs: parseIntegerField(req.body.timeoutMs, { fieldLabel: '超时时间(ms)', defaultValue: 60000, min: 1 }),
        inputTokenPrice: parseNumberField(req.body.inputTokenPrice, { fieldLabel: '输入 Token 单价', defaultValue: 0, min: 0 }),
        outputTokenPrice: parseNumberField(req.body.outputTokenPrice, { fieldLabel: '输出 Token 单价', defaultValue: 0, min: 0 }),
      });
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/prompt-blocks/new', requireAdmin, async (req, res, next) => {
    try {
      const key = String(req.body.key || '').trim();
      const value = String(req.body.value || '').trim();
      if (!key || !value) {
        return renderValidationMessage(res, '提示词片段的 key 和 value 不能为空。');
      }

      await createPromptBlock({
        key,
        value,
        sortOrder: parseIntegerField(req.body.sortOrder, { fieldLabel: '排序值', defaultValue: 0, min: 0 }),
        isEnabled: String(req.body.isEnabled || '1') !== '0',
      });
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/prompt-blocks/:blockId', requireAdmin, async (req, res, next) => {
    try {
      const blockId = parseIdParam(req.params.blockId, '提示词片段 ID');
      await updatePromptBlock(blockId, {
        key: req.body.key,
        value: req.body.value,
        sortOrder: parseIntegerField(req.body.sortOrder, { fieldLabel: '排序值', defaultValue: 0, min: 0 }),
        isEnabled: String(req.body.isEnabled || '1') !== '0',
      });
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/prompt-blocks/reorder', requireAdmin, async (req, res, next) => {
    try {
      const blockIds = String(req.body.blockIds || '')
        .split(',')
        .map((item) => parseIntegerField(item, { fieldLabel: '提示词片段 ID', min: 1, allowEmpty: true }))
        .filter((item) => item > 0);
      await reorderPromptBlocks(blockIds);
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/prompt-blocks/:blockId/delete', requireAdmin, async (req, res, next) => {
    try {
      const blockId = parseIdParam(req.params.blockId, '提示词片段 ID');
      await deletePromptBlock(blockId);
      return res.redirect('/admin');
    } catch (error) {
      if (error.message.includes('必须') || error.message.includes('不能小于') || error.message.includes('不能为空') || error.message.includes('超出允许范围')) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.get('/characters/new', requireAuth, (req, res) => {
    renderPage(res, 'character-new', {
      title: '创建角色',
      mode: 'create',
      form: { visibility: 'public' },
      extraPromptItems: [],
    });
  });

  app.get('/characters/:characterId/edit', requireAuth, async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色 ID');
      const character = await getCharacterById(characterId, req.session.user.id);
      if (!character) {
        return renderPage(res, 'message', { title: '提示', message: '角色不存在或无权编辑。' });
      }

      const { structured, extraItems } = splitCharacterPromptProfile(character.prompt_profile_json);

      renderPage(res, 'character-new', {
        title: '编辑角色',
        mode: 'edit',
        character,
        form: {
          name: character.name,
          summary: character.summary,
          role: structured.role,
          traitDescription: structured.traitDescription || character.personality,
          currentScene: structured.currentScene,
          currentBackground: structured.currentBackground,
          firstMessage: character.first_message,
          visibility: character.visibility === 'private' ? 'private' : 'public',
        },
        extraPromptItems: extraItems,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/characters/new', requireAuth, async (req, res, next) => {
    try {
      const promptProfileItems = buildCharacterPromptProfileFromForm(req.body);
      const payload = {
        name: String(req.body.name || '').trim(),
        summary: String(req.body.summary || '').trim(),
        personality: String(req.body.traitDescription || '').trim(),
        firstMessage: String(req.body.firstMessage || '').trim(),
        promptProfileJson: JSON.stringify(promptProfileItems),
        visibility: String(req.body.visibility || 'public').trim() === 'private' ? 'private' : 'public',
      };

      await createCharacter(req.session.user.id, payload);
      return res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  });

  app.post('/characters/:characterId/edit', requireAuth, async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色 ID');
      const character = await getCharacterById(characterId, req.session.user.id);
      if (!character) {
        return renderPage(res, 'message', { title: '提示', message: '角色不存在或无权编辑。' });
      }

      const promptProfileItems = buildCharacterPromptProfileFromForm(req.body);
      const payload = {
        name: String(req.body.name || '').trim(),
        summary: String(req.body.summary || '').trim(),
        personality: String(req.body.traitDescription || '').trim(),
        firstMessage: String(req.body.firstMessage || '').trim(),
        promptProfileJson: JSON.stringify(promptProfileItems),
        visibility: String(req.body.visibility || 'public').trim() === 'private' ? 'private' : 'public',
      };

      await updateCharacter(characterId, req.session.user.id, payload);
      return res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  });

  app.post('/characters/:characterId/delete', requireAuth, async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色 ID');
      try {
        await deleteCharacterSafely(characterId, req.session.user.id);
      } catch (error) {
        if (error.code === 'CHARACTER_NOT_FOUND') {
          return renderPage(res, 'message', { title: '提示', message: '角色不存在或无权删除。' });
        }
        if (error.code === 'CHARACTER_HAS_CONVERSATIONS') {
          return renderPage(res, 'message', {
            title: '暂时不能删除角色',
            message: `这个角色下面还有 ${error.conversationCount} 条对话记录。为了避免把分支会话整串误删，现在只允许删除“从未开过对话”的角色。你可以先保留角色，或后面再做更细的归档/迁移方案。`,
          });
        }
        throw error;
      }

      return res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  });

  app.post('/conversations/start/:characterId', requireAuth, async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色 ID');
      let character = await getCharacterById(characterId, req.session.user.id);

      if (!character) {
        character = await getCharacterById(characterId);
      }

      if (!character || (character.visibility !== 'public' && Number(character.user_id) !== Number(req.session.user.id))) {
        return renderPage(res, 'message', { title: '提示', message: '角色不存在。' });
      }

      const conversationId = await createConversation(req.session.user.id, characterId, {
        title: `${character.name} · 新对话`,
        selectedModelMode: String(req.body.modelMode || 'standard').trim(),
      });

      if (String(character.first_message || '').trim()) {
        const userMessageId = await addMessage({
          conversationId,
          senderType: 'user',
          content: '[开始一次新的对话]',
          promptKind: 'conversation-start',
          metadataJson: JSON.stringify({
            requestId: req.requestId,
            operation: 'conversation-start-user-seed',
            autoGenerated: true,
          }),
        });

        const replyMessageId = await addMessage({
          conversationId,
          senderType: 'character',
          content: String(character.first_message || '').trim(),
          parentMessageId: userMessageId,
          branchFromMessageId: userMessageId,
          promptKind: 'first-message',
          metadataJson: JSON.stringify({
            requestId: req.requestId,
            operation: 'character-first-message',
          }),
        });

        return res.redirect(`/chat/${conversationId}?leaf=${replyMessageId}`);
      }

      return res.redirect(`/chat/${conversationId}`);
    } catch (error) {
      next(error);
    }
  });

  app.get('/chat/:conversationId', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      await renderChatPage(req, res, conversation);
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/delete', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      try {
        await deleteConversationSafely(conversationId, req.session.user.id);
      } catch (error) {
        if (error.code === 'CONVERSATION_NOT_FOUND') {
          return renderPage(res, 'message', { title: '提示', message: '会话不存在或无权删除。' });
        }
        if (error.code === 'CONVERSATION_HAS_CHILDREN') {
          return renderPage(res, 'message', {
            title: '暂时不能删除对话',
            message: `这条对话下面还有 ${error.childCount} 条独立分支会话挂着。为了避免把分支树砍断，现在只允许删除没有子分支对话的会话。你可以先删末端分支，再回来删上游对话。`,
          });
        }
        throw error;
      }

      return res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/message', requireAuth, async (req, res, next) => {
    let conversationId;
    try {
      conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const rawContent = String(req.body.content || '');
      const parentMessageId = parseIntegerField(req.body.parentMessageId, { fieldLabel: '父消息 ID', min: 1, allowEmpty: true });

      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      const allMessages = await listMessages(conversationId);
      const chatRequest = buildChatRequestContext(req, conversation, allMessages, rawContent, parentMessageId);
      const { isFirstTurn, content, history, isBranchReply, promptKind } = chatRequest;

      if (!content) {
        return renderPage(res, 'message', { title: '提示', message: '消息不能为空。' });
      }

      const userMessageId = await addMessage({
        conversationId,
        senderType: 'user',
        content,
        parentMessageId,
        branchFromMessageId: parentMessageId,
        promptKind: isFirstTurn ? 'conversation-start' : (isBranchReply ? 'branch' : 'normal'),
        metadataJson: JSON.stringify({
          requestId: req.requestId,
          operation: 'user-message',
          autoGenerated: isFirstTurn && !rawContent.trim(),
        }),
      });

      const reply = await generateReplyViaGateway({
        requestId: req.requestId,
        userId: req.session.user.id,
        conversationId,
        character: {
          name: conversation.character_name,
          summary: conversation.character_summary,
          personality: conversation.personality,
          prompt_profile_json: conversation.prompt_profile_json,
        },
        messages: [...history, { sender_type: 'user', content }],
        userMessage: content,
        promptKind,
        modelMode: conversation.selected_model_mode || 'standard',
      });

      const replyMessageId = await addMessage({
        conversationId,
        senderType: 'character',
        content: reply,
        parentMessageId: userMessageId,
        branchFromMessageId: userMessageId,
        promptKind: isFirstTurn ? 'conversation-start' : (isBranchReply ? 'branch' : 'normal'),
        metadataJson: JSON.stringify({
          requestId: req.requestId,
          operation: 'assistant-reply',
        }),
      });

      await updateConversationTitle(conversationId, buildNextConversationTitle(conversation, content));
      return res.redirect(`/chat/${conversationId}?leaf=${replyMessageId}`);
    } catch (error) {
      const isQuotaError = error.message === 'REQUEST_QUOTA_EXCEEDED' || error.message === 'TOKEN_QUOTA_EXCEEDED';
      if (!isQuotaError && conversationId) {
        try {
          const conv = await getConversationById(conversationId, req.session.user.id);
          if (conv) {
            return await renderChatPage(req, res, conv, {
              errorMessage: 'AI 回复失败，请稍后重试。如持续出现，请联系管理员。',
            });
          }
        } catch (_) { /* 渲染失败时降级到全局错误处理 */ }
      }
      return next(error);
    }
  });

  app.post('/chat/:conversationId/message/stream', requireAuth, async (req, res, next) => {
    let conversationId;
    let streamClosed = false;
    try {
      conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const rawContent = String(req.body.content || '');
      const parentMessageId = parseIntegerField(req.body.parentMessageId, { fieldLabel: '父消息 ID', min: 1, allowEmpty: true });

      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      const allMessages = await listMessages(conversationId);
      const chatRequest = buildChatRequestContext(req, conversation, allMessages, rawContent, parentMessageId);
      const { isFirstTurn, content, history, isBranchReply, promptKind } = chatRequest;

      if (!content) {
        return renderPage(res, 'message', { title: '提示', message: '消息不能为空。' });
      }

      initNdjsonStream(res);
      const safeWrite = (payload) => {
        if (!streamClosed && !res.writableEnded) {
          writeNdjson(res, payload);
        }
      };

      req.on('close', () => {
        streamClosed = true;
      });

      const userMessageId = await addMessage({
        conversationId,
        senderType: 'user',
        content,
        parentMessageId,
        branchFromMessageId: parentMessageId,
        promptKind: isFirstTurn ? 'conversation-start' : (isBranchReply ? 'branch' : 'normal'),
        metadataJson: JSON.stringify({
          requestId: req.requestId,
          operation: 'user-message',
          autoGenerated: isFirstTurn && !rawContent.trim(),
          delivery: 'stream',
        }),
      });

      safeWrite({ type: 'user-message', conversationId, userMessageId, content, leafId: userMessageId });
      safeWrite({ type: 'assistant-start', conversationId, parentMessageId: userMessageId });

      let lineBuffer = '';
      const streamed = await streamReplyViaGateway({
        requestId: req.requestId,
        userId: req.session.user.id,
        conversationId,
        character: {
          name: conversation.character_name,
          summary: conversation.character_summary,
          personality: conversation.personality,
          prompt_profile_json: conversation.prompt_profile_json,
        },
        messages: [...history, { sender_type: 'user', content }],
        userMessage: content,
        promptKind,
        modelMode: conversation.selected_model_mode || 'standard',
        onDelta: async (deltaText, fullContent) => {
          safeWrite({ type: 'delta', delta: deltaText, full: fullContent });
          lineBuffer += deltaText;
          const parts = lineBuffer.split(/\r?\n/);
          lineBuffer = parts.pop() || '';
          const committedText = fullContent.slice(0, Math.max(0, fullContent.length - lineBuffer.length));
          parts.forEach((line) => {
            safeWrite({
              type: 'line',
              line,
              full: fullContent,
              committed: committedText,
              tail: lineBuffer,
            });
          });
        },
      });

      if (lineBuffer.trim()) {
        safeWrite({
          type: 'line',
          line: lineBuffer,
          full: streamed.content,
          committed: streamed.content,
          tail: '',
        });
      }

      const replyMessageId = await addMessage({
        conversationId,
        senderType: 'character',
        content: streamed.content,
        parentMessageId: userMessageId,
        branchFromMessageId: userMessageId,
        promptKind: isFirstTurn ? 'conversation-start' : (isBranchReply ? 'branch' : 'normal'),
        metadataJson: JSON.stringify({
          requestId: req.requestId,
          operation: 'assistant-reply-stream',
        }),
      });

      await updateConversationTitle(conversationId, buildNextConversationTitle(conversation, content));
      await invalidateConversationCache(conversationId);
      safeWrite({ type: 'done', conversationId, replyMessageId, leafId: replyMessageId, full: streamed.content });
      if (!res.writableEnded) {
        res.end();
      }
      return;
    } catch (error) {
      if (!res.headersSent) {
        return next(error);
      }
      if (!res.writableEnded) {
        writeNdjson(res, {
          type: 'error',
          message: error?.message === 'REQUEST_QUOTA_EXCEEDED' || error?.message === 'TOKEN_QUOTA_EXCEEDED'
            ? '额度不足，暂时没法继续生成。'
            : 'AI 回复失败，请稍后重试。',
        });
        res.end();
      }
    }
  });

  app.post('/chat/:conversationId/regenerate/:messageId', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const messageId = parseIdParam(req.params.messageId, '消息 ID');
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      const targetMessage = await getMessageById(conversationId, messageId);
      if (!targetMessage || targetMessage.sender_type !== 'character') {
        return renderPage(res, 'message', { title: '提示', message: '只能重新生成 AI 回复。' });
      }

      const allMessages = await listMessages(conversationId);
      const parentUserMessage = targetMessage.parent_message_id
        ? await getMessageById(conversationId, targetMessage.parent_message_id)
        : null;

      if (!parentUserMessage || parentUserMessage.sender_type !== 'user') {
        return renderPage(res, 'message', { title: '提示', message: '找不到对应的用户输入。' });
      }

      const history = buildPathMessages(allMessages, parentUserMessage.id).slice(0, -1);
      const reply = await generateReplyViaGateway({
        requestId: req.requestId,
        userId: req.session.user.id,
        conversationId,
        character: {
          name: conversation.character_name,
          summary: conversation.character_summary,
          personality: conversation.personality,
          prompt_profile_json: conversation.prompt_profile_json,
        },
        messages: [...history, parentUserMessage],
        userMessage: parentUserMessage.content,
        systemHint: '这是一次重新生成。请在保持角色一致的前提下，给出与先前不同但同样合理的新回复。',
        promptKind: 'regenerate',
        modelMode: conversation.selected_model_mode || 'standard',
      });

      const newReplyId = await addMessage({
        conversationId,
        senderType: 'character',
        content: reply,
        parentMessageId: parentUserMessage.id,
        branchFromMessageId: messageId,
        editedFromMessageId: messageId,
        promptKind: 'regenerate',
        metadataJson: JSON.stringify({
          requestId: req.requestId,
          operation: 'assistant-regenerate',
          sourceMessageId: messageId,
        }),
      });

      return res.redirect(`/chat/${conversationId}?leaf=${newReplyId}`);
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/messages/:messageId/delete', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const messageId = parseIdParam(req.params.messageId, '消息 ID');
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      try {
        const result = await deleteMessageSafely(conversationId, messageId, req.session.user.id);
        const nextLeaf = result.fallbackMessageId || '';
        return res.redirect(nextLeaf ? `/chat/${conversationId}?leaf=${nextLeaf}` : `/chat/${conversationId}`);
      } catch (error) {
        if (error.code === 'MESSAGE_NOT_FOUND') {
          return renderPage(res, 'message', { title: '提示', message: '这条对话记录不存在。' });
        }
        if (error.code === 'MESSAGE_HAS_CHILDREN') {
          return renderChatPage(req, res, conversation, {
            leafId: conversation.current_message_id || null,
            errorMessage: `这条对话记录下面还有 ${error.childMessageCount} 条后续消息。为了避免把分支链路删断，现在只允许删除末端叶子消息。`,
          });
        }
        if (error.code === 'MESSAGE_HAS_BRANCH_CONVERSATIONS') {
          return renderChatPage(req, res, conversation, {
            leafId: conversation.current_message_id || null,
            errorMessage: `这条对话记录已经被拿去开了 ${error.branchConversationCount} 条独立分支会话。为了避免分支引用悬空，现在不能删它。`,
          });
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/messages/:messageId/edit', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const messageId = parseIdParam(req.params.messageId, '消息 ID');
      const content = String(req.body.content || '').trim();
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }
      if (!content) {
        return renderPage(res, 'message', { title: '提示', message: '内容不能为空。' });
      }

      const targetMessage = await getMessageById(conversationId, messageId);
      if (!targetMessage || targetMessage.sender_type !== 'character') {
        return renderPage(res, 'message', { title: '提示', message: '这里只支持修改 AI 生成内容。' });
      }

      const variantMessageId = await createEditedMessageVariant(conversationId, messageId, content);
      return res.redirect(`/chat/${conversationId}?leaf=${variantMessageId}`);
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/messages/:messageId/edit-user', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const messageId = parseIdParam(req.params.messageId, '消息 ID');
      const content = String(req.body.content || '').trim();
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }
      if (!content) {
        return renderPage(res, 'message', { title: '提示', message: '内容不能为空。' });
      }

      const targetMessage = await getMessageById(conversationId, messageId);
      if (!targetMessage || targetMessage.sender_type !== 'user') {
        return renderPage(res, 'message', { title: '提示', message: '这里只支持修改用户输入。' });
      }

      const allMessages = await listMessages(conversationId);
      const historyBeforeUser = targetMessage.parent_message_id
        ? buildPathMessages(allMessages, targetMessage.parent_message_id)
        : [];

      const newUserMessageId = await addMessage({
        conversationId,
        senderType: 'user',
        content,
        parentMessageId: targetMessage.parent_message_id || null,
        branchFromMessageId: targetMessage.id,
        editedFromMessageId: targetMessage.id,
        promptKind: 'edit',
        metadataJson: JSON.stringify({
          requestId: req.requestId,
          operation: 'user-edit-branch',
          sourceMessageId: messageId,
        }),
      });

      const reply = await generateReplyViaGateway({
        requestId: req.requestId,
        userId: req.session.user.id,
        conversationId,
        character: {
          name: conversation.character_name,
          summary: conversation.character_summary,
          personality: conversation.personality,
          prompt_profile_json: conversation.prompt_profile_json,
        },
        messages: [...historyBeforeUser, { sender_type: 'user', content }],
        userMessage: content,
        systemHint: '这是基于用户改写后的旧输入重新开出的分支，请自然延续，不要提到你被要求重生成。',
        promptKind: 'edit',
        modelMode: conversation.selected_model_mode || 'standard',
      });

      const replyMessageId = await addMessage({
        conversationId,
        senderType: 'character',
        content: reply,
        parentMessageId: newUserMessageId,
        branchFromMessageId: newUserMessageId,
        promptKind: 'branch',
        metadataJson: JSON.stringify({
          requestId: req.requestId,
          operation: 'assistant-reply-from-user-edit',
          sourceMessageId: messageId,
        }),
      });

      return res.redirect(`/chat/${conversationId}?leaf=${replyMessageId}`);
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/messages/:messageId/replay', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const messageId = parseIdParam(req.params.messageId, '消息 ID');
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      const targetMessage = await getMessageById(conversationId, messageId);
      if (!targetMessage) {
        return renderPage(res, 'message', { title: '提示', message: '重算起点不存在。' });
      }
      if (!targetMessage.parent_message_id) {
        return renderPage(res, 'message', { title: '提示', message: '根节点不适合做后续重算。' });
      }

      const allMessages = await listMessages(conversationId);
      const historyBeforeTarget = buildPathMessages(allMessages, targetMessage.parent_message_id);
      let newLeafId = null;
      let regeneratedPreview = [];

      if (targetMessage.sender_type === 'user') {
        const newUserMessageId = await addMessage({
          conversationId,
          senderType: 'user',
          content: targetMessage.content,
          parentMessageId: targetMessage.parent_message_id || null,
          branchFromMessageId: targetMessage.id,
          editedFromMessageId: targetMessage.id,
          promptKind: 'replay',
          metadataJson: JSON.stringify({
            requestId: req.requestId,
            operation: 'user-replay-branch',
            sourceMessageId: messageId,
          }),
        });

        const reply = await generateReplyViaGateway({
          requestId: req.requestId,
          userId: req.session.user.id,
          conversationId,
          character: {
            name: conversation.character_name,
            summary: conversation.character_summary,
            personality: conversation.personality,
            prompt_profile_json: conversation.prompt_profile_json,
          },
          messages: [...historyBeforeTarget, { sender_type: 'user', content: targetMessage.content }],
          userMessage: targetMessage.content,
          systemHint: '这是一次从旧节点开始的后续重算，请自然延续并给出新的合理走向。',
          promptKind: 'replay',
          modelMode: conversation.selected_model_mode || 'standard',
        });

        newLeafId = await addMessage({
          conversationId,
          senderType: 'character',
          content: reply,
          parentMessageId: newUserMessageId,
          branchFromMessageId: newUserMessageId,
          editedFromMessageId: targetMessage.id,
          promptKind: 'replay',
          metadataJson: JSON.stringify({
            requestId: req.requestId,
            operation: 'assistant-replay-after-user',
            sourceMessageId: messageId,
          }),
        });

        regeneratedPreview = [
          { role: '你', content: targetMessage.content },
          { role: conversation.character_name, content: reply },
        ];
      } else {
        const parentUserMessage = await getMessageById(conversationId, targetMessage.parent_message_id);
        if (!parentUserMessage || parentUserMessage.sender_type !== 'user') {
          return renderPage(res, 'message', { title: '提示', message: '找不到与这条 AI 回复对应的用户输入。' });
        }

        const historyBeforeParentUser = parentUserMessage.parent_message_id
          ? buildPathMessages(allMessages, parentUserMessage.parent_message_id)
          : [];

        const newUserMessageId = await addMessage({
          conversationId,
          senderType: 'user',
          content: parentUserMessage.content,
          parentMessageId: parentUserMessage.parent_message_id || null,
          branchFromMessageId: parentUserMessage.id,
          editedFromMessageId: parentUserMessage.id,
          promptKind: 'replay',
          metadataJson: JSON.stringify({
            requestId: req.requestId,
            operation: 'user-replay-copy-for-ai',
            sourceMessageId: parentUserMessage.id,
          }),
        });

        const reply = await generateReplyViaGateway({
          requestId: req.requestId,
          userId: req.session.user.id,
          conversationId,
          character: {
            name: conversation.character_name,
            summary: conversation.character_summary,
            personality: conversation.personality,
            prompt_profile_json: conversation.prompt_profile_json,
          },
          messages: [...historyBeforeParentUser, { sender_type: 'user', content: parentUserMessage.content }],
          userMessage: parentUserMessage.content,
          systemHint: '这是一次从旧 AI 节点开始的后续重算，请给出与旧回复不同但同样合理的新走向。',
          promptKind: 'replay',
          modelMode: conversation.selected_model_mode || 'standard',
        });

        newLeafId = await addMessage({
          conversationId,
          senderType: 'character',
          content: reply,
          parentMessageId: newUserMessageId,
          branchFromMessageId: newUserMessageId,
          editedFromMessageId: targetMessage.id,
          promptKind: 'replay',
          metadataJson: JSON.stringify({
            requestId: req.requestId,
            operation: 'assistant-replay-after-ai',
            sourceMessageId: messageId,
          }),
        });

        regeneratedPreview = [
          { role: '你', content: parentUserMessage.content },
          { role: conversation.character_name, content: reply },
        ];
      }

      await renderChatPage(req, res, conversation, {
        leafId: newLeafId,
        regeneratedPreview,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/model', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      const selectedModelMode = String(req.body.modelMode || 'standard').trim();
      if (!['standard', 'jailbreak', 'force_jailbreak'].includes(selectedModelMode)) {
        return renderPage(res, 'message', { title: '提示', message: '模型模式不支持。' });
      }

      await updateConversationModelMode(conversationId, selectedModelMode);
      return res.redirect(`/chat/${conversationId}?leaf=${conversation.current_message_id || ''}`);
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/optimize-input', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const content = String(req.body.content || '').trim();
      const parentMessageId = parseIntegerField(req.body.parentMessageId, { fieldLabel: '父消息 ID', min: 1, allowEmpty: true });
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }
      if (!content) {
        return renderPage(res, 'message', { title: '提示', message: '内容不能为空。' });
      }

      const allMessages = await listMessages(conversationId);
      const history = buildPathMessages(allMessages, parentMessageId || conversation.current_message_id || null);
      const optimizedContent = await optimizeUserInputViaGateway({
        requestId: req.requestId,
        userId: req.session.user.id,
        conversationId,
        character: {
          name: conversation.character_name,
          summary: conversation.character_summary,
          personality: conversation.personality,
          prompt_profile_json: conversation.prompt_profile_json,
        },
        messages: history,
        userInput: content,
        modelMode: conversation.selected_model_mode || 'standard',
      });

      await renderChatPage(req, res, conversation, {
        leafId: parentMessageId || conversation.current_message_id || null,
        draftContent: content,
        optimizedContent,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/branch/:messageId', requireAuth, async (req, res, next) => {
    try {
      const conversationId = parseIdParam(req.params.conversationId, '会话 ID');
      const messageId = parseIdParam(req.params.messageId, '消息 ID');
      const conversation = await loadConversationForUserOrFail(req, res, conversationId);
      if (!conversation) {
        return;
      }

      const allMessages = await listMessages(conversation.id);
      const targetMessage = await getMessageById(conversationId, messageId);
      if (!targetMessage) {
        return renderPage(res, 'message', { title: '提示', message: '分支起点不存在。' });
      }
      const view = buildConversationView(allMessages, messageId);

      const branchTitle = view.currentBranch
        ? buildBranchConversationTitle(conversation, view.currentBranch.label, view.currentBranch.summary)
        : buildConversationTitle(conversation.character_name, targetMessage.content);
      const branchResult = await cloneConversationBranch({
        userId: req.session.user.id,
        characterId: conversation.character_id,
        sourceConversationId: conversation.id,
        sourceLeafMessageId: messageId,
        selectedModelMode: conversation.selected_model_mode || 'standard',
        title: branchTitle,
      });

      return res.redirect(`/chat/${branchResult.conversationId}?leaf=${branchResult.leafMessageId}`);
    } catch (error) {
      next(error);
    }
  });

  // 404 处理：所有未匹配路由统一返回 404 页面
  app.use((req, res) => {
    res.status(404);
    renderPage(res, 'error', {
      title: '页面不存在',
      message: `找不到 ${req.path}，请确认地址是否正确。`,
      errorCode: 'NOT_FOUND',
      requestId: req.requestId,
    });
  });

  app.use(errorHandler);

  app.listen(config.port, '0.0.0.0', () => {
    logger.info('Application started successfully', {
      port: config.port,
      appName: config.appName,
      debugFeatures: [
        'requestId logging',
        'conversation tree cache',
        'branch cloning',
        'assistant variants',
      ],
    });
  });
}

bootstrap().catch((error) => {
  logger.error('Application bootstrap failed', { error: error.message, stack: error.stack });
  process.exit(1);
});
