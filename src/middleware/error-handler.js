/**
 * @file src/middleware/error-handler.js
 * @description 全局异常处理中间件，避免敏感堆栈直接暴露给用户。
 */

const logger = require('../lib/logger');
const config = require('../config');

/**
 * 将错误视图渲染到 layout 中，保证错误页拥有完整的导航与样式。
 * 若 layout 渲染本身失败，退化为纯文本响应，避免死循环。
 */
function renderErrorWithLayout(res, statusCode, title, message, errorCode) {
  const errorParams = { title, message, errorCode, requestId: res.locals.requestId };
  res.render('error', errorParams, (viewErr, html) => {
    if (viewErr) {
      return res.status(statusCode).type('text').send(message);
    }
    res.status(statusCode).render('layout', {
      title,
      body: html,
      currentUser: res.locals.currentUser,
      appName: config.appName,
      appUrl: config.appUrl,
    });
  });
}

function errorHandler(error, req, res, next) {
  logger.error('Unhandled application error', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    error: error.message,
    stack: error.stack,
  });

  if (error.message === 'REQUEST_QUOTA_EXCEEDED') {
    return renderErrorWithLayout(res, 429, '额度已用完', '请求次数额度已经用完了，先升级套餐或者等额度恢复。', 'REQUEST_QUOTA_EXCEEDED');
  }

  if (error.message === 'TOKEN_QUOTA_EXCEEDED') {
    return renderErrorWithLayout(res, 429, '额度不够', '当前 Token 额度不足，这次请求先发不出去。', 'TOKEN_QUOTA_EXCEEDED');
  }

  renderErrorWithLayout(res, 500, '系统错误', '请求处理失败，请稍后再试。', 'INTERNAL_SERVER_ERROR');
}

module.exports = {
  errorHandler,
};
