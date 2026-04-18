/**
 * @file src/middleware/auth.js
 * @description 登录鉴权中间件，确保仅认证用户可访问受保护接口。
 */

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  return next();
}

module.exports = {
  requireAuth,
};
