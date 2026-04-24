/**
 * @file src/middleware/auth.js
 * @description 登录鉴权与管理员权限中间件。
 */

const logger = require('../lib/logger');
const config = require('../config');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.role !== 'admin') {
    logger.warn('Forbidden admin access attempt', {
      requestId: req.requestId,
      userId: req.session.user.id,
      role: req.session.user.role,
      path: req.path,
    });
    const errorParams = {
      title: '权限不足',
      message: '这里只有管理员能进。',
      errorCode: 'FORBIDDEN',
      requestId: req.requestId,
    };
    return res.render('error', errorParams, (viewErr, html) => {
      if (viewErr) {
        return res.status(403).type('text').send('权限不足');
      }
      res.status(403).render('layout', {
        title: '权限不足',
        body: html,
        currentUser: res.locals.currentUser,
        appName: config.appName,
        appUrl: config.appUrl,
      });
    });
  }
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
};

