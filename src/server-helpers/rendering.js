/**
 * @file src/server-helpers/rendering.js
 * @description EJS 页面渲染、默认 meta 与通用提示页封装。
 */

const config = require('../config');
const logger = require('../lib/logger');
const { translate, translateHtml } = require('../i18n');
const { getClientNotificationBootstrap, getNotificationBootstrapVersion } = require('../services/notification-service');
const { getUnreadSiteMessageCount } = require('../services/site-message-service');
const { redisClient } = require('../lib/redis');
const viewModel = require('./view-models');
const { getAdminNavItems, getAdminHubItems, getLayoutNavItems } = require('./navigation');
const { assetUrl, assetVersion } = require('./assets');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAbsoluteUrl(pathOrUrl) {
  const raw = String(pathOrUrl || '').trim();
  if (!raw) {
    return config.appUrl;
  }
  try {
    return new URL(raw, config.appUrl).toString();
  } catch (_) {
    return raw;
  }
}

function buildDefaultMeta(params = {}) {
  const defaultDescription = translate(params.locale || 'zh-CN', '楼阁默认分享描述');
  const description = String(params.description || defaultDescription).trim();
  const image = buildAbsoluteUrl(params.image || '/public/icons/og-louge.png');
  const url = buildAbsoluteUrl(params.url || '/');

  return {
    description,
    image,
    url,
    type: params.type || 'website',
    siteName: config.appName,
    twitterCard: params.twitterCard || 'summary_large_image',
  };
}

function inferNotificationPageScope(view) {
  const normalized = String(view || '').trim();
  if (normalized === 'home') return 'home';
  if (normalized === 'dashboard') return 'dashboard';
  if (normalized === 'chat') return 'chat';
  if (normalized === 'profile') return 'profile';
  if (normalized === 'public-characters' || normalized === 'public-character-detail' || normalized === 'character-new') return 'characters';
  if (normalized.startsWith('admin')) return 'admin';
  return 'global';
}

async function getCachedUnreadSiteMessageCount(userId, method = 'GET') {
  const normalizedUserId = Number(userId || 0);
  if (!normalizedUserId) return 0;
  if (String(method || 'GET').toUpperCase() !== 'GET') {
    return getUnreadSiteMessageCount(normalizedUserId).catch(() => 0);
  }
  const cacheKey = `site-message:unread-count:${normalizedUserId}:v1`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached !== null && cached !== undefined) return Number(cached || 0);
  } catch (_) {}

  const count = await getUnreadSiteMessageCount(normalizedUserId).catch(() => 0);
  try {
    await redisClient.setEx(cacheKey, 20, String(count));
  } catch (_) {}
  return count;
}

async function getCachedClientNotificationBootstrap(user, options = {}) {
  const userKey = user?.id ? `${user.id}:${user.role || 'user'}` : 'guest';
  if (String(options.method || 'GET').toUpperCase() !== 'GET') {
    return getClientNotificationBootstrap(user || null, options);
  }
  const pageScope = options.pageScope || 'global';
  const version = await getNotificationBootstrapVersion();
  const cacheKey = `notification-bootstrap:${userKey}:${pageScope}:v${version}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  const notifications = await getClientNotificationBootstrap(user || null, options);
  try {
    await redisClient.setEx(cacheKey, 30, JSON.stringify(notifications || []));
  } catch (_) {}
  return notifications;
}

async function renderPage(res, view, params = {}) {
  const locale = res.locals.locale || 'zh-CN';
  const t = res.locals.t || ((key, vars) => translate(locale, key, vars));
  const titleSource = params.title || config.appName;
  const title = translateHtml(locale, t(titleSource));
  const meta = buildDefaultMeta({
    ...params.meta,
    locale,
    title,
  });
  const liveReloadEnabled = Boolean(config.liveReloadEnabled);
  const liveReloadAssetVersion = liveReloadEnabled
    ? require('../services/live-reload-service').getClientAssetVersion()
    : '';
  const navigation = {
    adminNavItems: getAdminNavItems(t),
    adminHubItems: getAdminHubItems(t),
    layoutNavItems: getLayoutNavItems(res.locals.currentUser, t),
  };

  const [clientNotifications, unreadSiteMessageCount, fontStylesheetUrls] = await Promise.all([
    getCachedClientNotificationBootstrap(res.locals.currentUser || null, {
      method: res.req?.method || 'GET',
      pageScope: params.notificationPageScope || inferNotificationPageScope(view),
    }),
    res.locals.currentUser?.id ? getCachedUnreadSiteMessageCount(res.locals.currentUser.id, res.req?.method || 'GET') : 0,
    require('../services/font-service').getActiveFontStylesheetUrls().catch(() => []),
  ]);

  return new Promise((resolve) => {
    res.render(view, { ...params, viewModel, navigation, assetUrl, assetVersion }, (viewError, html) => {
      if (viewError) {
        logger.error('[renderPage] View 渲染失败', { view, error: viewError.message });
        res.status(500).type('text').send(t('页面渲染失败，请稍后重试。'));
        resolve();
        return;
      }
      const translatedHtml = translateHtml(locale, html);
      res.render('layout', {
        title,
        body: translatedHtml,
        currentUser: res.locals.currentUser,
        appName: config.appName,
        appUrl: config.appUrl,
        meta,
        escapeHtml,
        locale,
        t,
        csrfToken: res.locals.csrfToken || '',
        cspNonce: res.locals.cspNonce || '',
        clientI18nMessages: res.locals.clientI18nMessages || {},
        viewModel,
        navigation,
        clientNotifications,
        unreadSiteMessageCount,
        fontStylesheetUrls,
        assetUrl,
        assetVersion,
        localeSwitchLinks: res.locals.localeSwitchLinks || { 'zh-TW': '?lang=zh-TW', 'zh-CN': '?lang=zh-CN', en: '?lang=en' },
        liveReloadEnabled,
        liveReloadAssetVersion,
      });
      resolve();
    });
  });
}

function renderRegisterPage(res, options = {}) {
  const t = res.locals.t || ((key, vars) => translate(res.locals.locale || 'zh-CN', key, vars));
  renderPage(res, 'register', {
    title: t('注册'),
    captcha: options.captcha,
    form: options.form || {},
    formMessage: options.formMessage || '',
    authConfig: config.publicPhoneAuthConfig,
  });
}

function renderValidationMessage(res, message, title) {
  const t = res.locals.t || ((key, vars) => translate(res.locals.locale || 'zh-CN', key, vars));
  return renderPage(res, 'message', { title: title || t('提示'), message });
}

module.exports = {
  escapeHtml,
  buildAbsoluteUrl,
  buildDefaultMeta,
  renderPage,
  renderRegisterPage,
  renderValidationMessage,
  inferNotificationPageScope,
};
