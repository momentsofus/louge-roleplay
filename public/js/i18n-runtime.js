/**
 * @file public/js/i18n-runtime.js
 * @description
 * 浏览器端轻量国际化运行时。
 *
 * 调用说明：
 * - layout.ejs 会把服务端生成的 locale/messages 注入到 window.AI_ROLEPLAY_I18N。
 * - 页面脚本通过 `window.AI_ROLEPLAY_I18N.t(key, vars)` 获取翻译。
 * - 若某个 key 没有翻译，直接返回 key；若变量缺失，保留 `{name}` 占位，避免前端崩溃。
 */

(function () {
  const data = window.AI_ROLEPLAY_I18N || {};
  const locale = String(data.locale || 'zh-CN');
  const messages = (data && data.messages) || {};

  function interpolate(message, vars) {
    return String(message || '').replace(/\{(\w+)\}/g, function (_, key) {
      return Object.prototype.hasOwnProperty.call(vars || {}, key) ? String(vars[key]) : '{' + key + '}';
    });
  }

  function t(key, vars) {
    const template = Object.prototype.hasOwnProperty.call(messages, key)
      ? messages[key]
      : key;
    return interpolate(template, vars || {});
  }

  window.AI_ROLEPLAY_I18N = Object.assign({}, data, {
    locale,
    messages,
    t,
  });
})();
