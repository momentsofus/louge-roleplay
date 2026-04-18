/**
 * @file src/server.js
 * @description Web 应用主入口，负责中间件初始化、路由注册、会话管理与站点启动。
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
const { initRedis, redisClient } = require('./lib/redis');
const { requestContext } = require('./middleware/request-context');
const { errorHandler } = require('./middleware/error-handler');
const { requireAuth } = require('./middleware/auth');
const { hashPassword, verifyPassword } = require('./services/password-service');
const { createUser, findUserByUsername, findUserByEmail, findUserByPhone, findUserByLogin, findUserById } = require('./services/user-service');
const { createCharacter, listPublicCharacters, listUserCharacters, getCharacterById } = require('./services/character-service');
const { createConversation, getConversationById, listUserConversations, listMessages, addMessage } = require('./services/conversation-service');
const { generateReply } = require('./services/ai-service');
const { createCaptcha, getCaptchaImage, verifyCaptcha } = require('./services/captcha-service');
const { issueEmailCode, issuePhoneCode, verifyEmailCode, verifyPhoneCode } = require('./services/verification-service');
const { verifyDomesticPhoneIdentity } = require('./services/phone-auth-service');
const { hitLimit } = require('./services/rate-limit-service');

const app = express();

function renderPage(res, view, params = {}) {
  res.render(view, params, (error, html) => {
    if (error) {
      throw error;
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

function getClientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
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

async function bootstrap() {
  await initRedis();

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

  app.use(session({
    store: new RedisStore({ client: redisClient }),
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
      renderPage(res, 'register', {
        title: '注册',
        captcha,
        authConfig: {
          graphAuthAppId: config.aliyunPhoneAuthAppId,
          graphAuthAppKey: config.aliyunPhoneAuthAppKey,
          numberAuthSchemeCode: config.aliyunNumberAuthSchemeCode,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/captcha', async (req, res, next) => {
    try {
      const captcha = await createCaptcha();
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

  app.post('/api/send-email-code', async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const email = String(req.body.email || '').trim().toLowerCase();
      const countryType = String(req.body.countryType || 'international').trim();
      if (!isEmail(email)) {
        return res.status(400).json({ message: '邮箱格式不正确' });
      }
      if (countryType === 'international' && !isAllowedInternationalEmail(email)) {
        return res.status(400).json({ message: '海外用户仅支持 Gmail、Outlook、Hotmail、Live、iCloud、Yahoo、AOL、Proton 等主流邮箱' });
      }
      if (await findUserByEmail(email)) {
        return res.status(400).json({ message: '邮箱已被注册' });
      }
      await issueEmailCode(email, ip);
      return res.json({ message: '邮箱验证码已发送' });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/send-phone-code', async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const phone = String(req.body.phone || '').trim();
      const captchaId = String(req.body.captchaId || '').trim();
      const captchaText = String(req.body.captchaText || '').trim();

      if (!isDomesticPhone(phone)) {
        return res.status(400).json({ message: '请输入正确的国内手机号' });
      }
      if (await findUserByPhone(phone)) {
        return res.status(400).json({ message: '手机号已被注册' });
      }

      const captchaPassed = await verifyCaptcha(captchaId, captchaText, true);
      if (!captchaPassed) {
        return res.status(400).json({ message: '图形验证码错误或已失效' });
      }

      await verifyDomesticPhoneIdentity({ phone, captchaPassed });
      const code = await issuePhoneCode(phone, ip);
      logger.debug('Phone verification code issued', { phoneMasked: `${phone.slice(0, 3)}****${phone.slice(-4)}`, provider: 'aliyun-sms' });
      return res.json({ message: '短信验证码已发送' });
    } catch (error) {
      next(error);
    }
  });

  app.post('/register', async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const limited = await hitLimit(`rate:register:${ip}`, 60, 10);
      if (limited) {
        return renderPage(res, 'message', { title: '提示', message: '注册请求太频繁，请稍后再试。' });
      }

      const username = String(req.body.username || '').trim();
      const password = String(req.body.password || '').trim();
      const countryType = String(req.body.countryType || 'domestic').trim();
      const email = String(req.body.email || '').trim().toLowerCase() || null;
      const emailCode = String(req.body.emailCode || '').trim();
      const phone = String(req.body.phone || '').trim() || null;
      const phoneCode = String(req.body.phoneCode || '').trim();

      if (username.length < 3 || password.length < 6) {
        return renderPage(res, 'message', { title: '提示', message: '用户名至少 3 位，密码至少 6 位。' });
      }

      const existingUser = await findUserByUsername(username);
      if (existingUser) {
        return renderPage(res, 'message', { title: '提示', message: '用户名已存在。' });
      }

      let emailVerified = 0;
      let phoneVerified = 0;

      if (countryType === 'domestic') {
        if (!phone || !isDomesticPhone(phone)) {
          return renderPage(res, 'message', { title: '提示', message: '国内用户必须填写正确手机号。' });
        }
        if (await findUserByPhone(phone)) {
          return renderPage(res, 'message', { title: '提示', message: '手机号已被注册。' });
        }
        const phoneOk = await verifyPhoneCode(phone, phoneCode);
        if (!phoneOk) {
          return renderPage(res, 'message', { title: '提示', message: '短信验证码错误或已失效。' });
        }
        phoneVerified = 1;

        if (email) {
          if (!isEmail(email)) {
            return renderPage(res, 'message', { title: '提示', message: '邮箱格式不正确。' });
          }
          if (await findUserByEmail(email)) {
            return renderPage(res, 'message', { title: '提示', message: '邮箱已被注册。' });
          }
          const emailOk = await verifyEmailCode(email, emailCode);
          if (!emailOk) {
            return renderPage(res, 'message', { title: '提示', message: '邮箱验证码错误或已失效。' });
          }
          emailVerified = 1;
        }
      } else {
        if (!email || !isEmail(email)) {
          return renderPage(res, 'message', { title: '提示', message: '国外用户必须填写有效邮箱。' });
        }
        if (!isAllowedInternationalEmail(email)) {
          return renderPage(res, 'message', { title: '提示', message: '海外用户仅支持 Gmail、Outlook、Hotmail、Live、iCloud、Yahoo、AOL、Proton 等主流邮箱。' });
        }
        if (await findUserByEmail(email)) {
          return renderPage(res, 'message', { title: '提示', message: '邮箱已被注册。' });
        }
        const emailOk = await verifyEmailCode(email, emailCode);
        if (!emailOk) {
          return renderPage(res, 'message', { title: '提示', message: '邮箱验证码错误或已失效。' });
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
      req.session.user = { id: userId, username };
      return res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  });

  app.get('/login', (req, res) => renderPage(res, 'login', { title: '登录' }));
  app.post('/login', async (req, res, next) => {
    try {
      const login = String(req.body.login || '').trim();
      const password = String(req.body.password || '').trim();
      const user = await findUserByLogin(login);

      if (!user) {
        return renderPage(res, 'message', { title: '提示', message: '账号或密码错误。' });
      }

      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return renderPage(res, 'message', { title: '提示', message: '账号或密码错误。' });
      }

      req.session.user = { id: user.id, username: user.username };
      return res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  });

  app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
  });

  app.get('/dashboard', requireAuth, async (req, res, next) => {
    try {
      const user = await findUserById(req.session.user.id);
      const characters = await listUserCharacters(req.session.user.id);
      const conversations = await listUserConversations(req.session.user.id);
      renderPage(res, 'dashboard', { title: '控制台', user, characters, conversations });
    } catch (error) {
      next(error);
    }
  });

  app.get('/characters/new', requireAuth, (req, res) => {
    renderPage(res, 'character-new', { title: '创建角色' });
  });

  app.post('/characters/new', requireAuth, async (req, res, next) => {
    try {
      const payload = {
        name: String(req.body.name || '').trim(),
        summary: String(req.body.summary || '').trim(),
        personality: String(req.body.personality || '').trim(),
        firstMessage: String(req.body.firstMessage || '').trim(),
      };

      if (!payload.name || !payload.summary || !payload.personality || !payload.firstMessage) {
        return renderPage(res, 'message', { title: '提示', message: '角色信息不能为空。' });
      }

      await createCharacter(req.session.user.id, payload);
      return res.redirect('/dashboard');
    } catch (error) {
      next(error);
    }
  });

  app.post('/conversations/start/:characterId', requireAuth, async (req, res, next) => {
    try {
      const characterId = Number(req.params.characterId);
      const character = await getCharacterById(characterId);

      if (!character) {
        return renderPage(res, 'message', { title: '提示', message: '角色不存在。' });
      }

      const conversationId = await createConversation(req.session.user.id, characterId);
      if (character.first_message) {
        await addMessage(conversationId, 'character', character.first_message);
      }

      return res.redirect(`/chat/${conversationId}`);
    } catch (error) {
      next(error);
    }
  });

  app.get('/chat/:conversationId', requireAuth, async (req, res, next) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const conversation = await getConversationById(conversationId, req.session.user.id);

      if (!conversation) {
        return renderPage(res, 'message', { title: '提示', message: '会话不存在或无权访问。' });
      }

      const messages = await listMessages(conversationId);
      renderPage(res, 'chat', { title: '聊天', conversation, messages });
    } catch (error) {
      next(error);
    }
  });

  app.post('/chat/:conversationId/message', requireAuth, async (req, res, next) => {
    try {
      const conversationId = Number(req.params.conversationId);
      const content = String(req.body.content || '').trim();

      if (!content) {
        return renderPage(res, 'message', { title: '提示', message: '消息不能为空。' });
      }

      const conversation = await getConversationById(conversationId, req.session.user.id);
      if (!conversation) {
        return renderPage(res, 'message', { title: '提示', message: '会话不存在或无权访问。' });
      }

      await addMessage(conversationId, 'user', content);
      const history = await listMessages(conversationId);
      const reply = await generateReply({
        character: conversation,
        messages: history,
        userMessage: content,
      });
      await addMessage(conversationId, 'character', reply);
      return res.redirect(`/chat/${conversationId}`);
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);

  app.listen(config.port, '0.0.0.0', () => {
    logger.info('Application started successfully', { port: config.port, appName: config.appName });
  });
}

bootstrap().catch((error) => {
  logger.error('Application bootstrap failed', { error: error.message, stack: error.stack });
  process.exit(1);
});
