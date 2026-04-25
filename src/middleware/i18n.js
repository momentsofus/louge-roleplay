/**
 * @file src/middleware/i18n.js
 * @description
 * 国际化请求中间件。
 *
 * 调用说明：
 * - server.js 在 session/requestContext 之后安装本中间件。
 * - 下游路由可直接使用 `req.t(key, vars)` 翻译文本。
 * - EJS 模板可通过 `locale/defaultLocale/supportedLocales/localeSwitchLinks/clientI18nMessages` 渲染语言切换和前端词典。
 */

const { resolveLocale, translate, getClientMessages, buildLocaleSwitchLinks, SUPPORTED_LOCALES, DEFAULT_LOCALE } = require('../i18n');

/**
 * 解析当前请求语言并注入 req/res.locals。
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function attachI18n(req, res, next) {
  const locale = resolveLocale(req);
  req.locale = locale;
  req.t = (key, vars) => translate(locale, key, vars);
  res.locals.locale = locale;
  res.locals.defaultLocale = DEFAULT_LOCALE;
  res.locals.supportedLocales = SUPPORTED_LOCALES;
  res.locals.localeSwitchLinks = buildLocaleSwitchLinks(req);
  res.locals.t = req.t;
  res.locals.clientI18nMessages = getClientMessages(locale);
  next();
}

module.exports = {
  attachI18n,
};
