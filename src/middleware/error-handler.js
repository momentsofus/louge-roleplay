/**
 * @file src/middleware/error-handler.js
 * @description 全局异常处理中间件，避免敏感堆栈直接暴露给用户。
 */

const logger = require('../lib/logger');

function errorHandler(error, req, res, next) {
  logger.error('Unhandled application error', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    error: error.message,
    stack: error.stack,
  });

  res.status(500).render('error', {
    title: '系统错误',
    message: '请求处理失败，请稍后再试。',
    errorCode: 'INTERNAL_SERVER_ERROR',
  });
}

module.exports = {
  errorHandler,
};
