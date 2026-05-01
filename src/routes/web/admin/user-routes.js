/**
 * @file src/routes/web/admin/user-routes.js
 * @description 管理后台用户角色与套餐调整路由。
 */

const { isValidationError } = require('./admin-route-utils');

function registerAdminUserRoutes(app, ctx) {
  const {
    requireAdmin,
    updateUserRole,
    updateUserStatus,
    safelyDeleteUserById,
    findUserById,
    findPlanById,
    updateUserPlan,
    renderValidationMessage,
    parseIdParam,
  } = ctx;

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
      if (isValidationError(error)) {
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
      if (isValidationError(error)) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/users/:userId/status', requireAdmin, async (req, res, next) => {
    try {
      const userId = parseIdParam(req.params.userId, '用户 ID');
      const status = String(req.body.status || 'active').trim();
      if (!['active', 'blocked'].includes(status)) {
        return renderValidationMessage(res, '用户状态不支持。');
      }
      if (Number(req.session?.user?.id || 0) === Number(userId) && status === 'blocked') {
        return renderValidationMessage(res, '不能禁用当前登录的管理员账号。');
      }
      await updateUserStatus(userId, status);
      return res.redirect('/admin');
    } catch (error) {
      if (isValidationError(error)) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });

  app.post('/admin/users/:userId/delete', requireAdmin, async (req, res, next) => {
    try {
      const userId = parseIdParam(req.params.userId, '用户 ID');
      if (Number(req.session?.user?.id || 0) === Number(userId)) {
        return renderValidationMessage(res, '不能删除当前登录的管理员账号。');
      }
      const user = await findUserById(userId);
      if (!user) {
        return renderValidationMessage(res, '用户不存在。');
      }
      const result = await safelyDeleteUserById(userId);
      if (!result.deleted && result.blocked) {
        return renderValidationMessage(res, '该用户已有角色、会话、订阅或用量记录，已改为禁用，避免误删业务数据。');
      }
      return res.redirect('/admin');
    } catch (error) {
      if (isValidationError(error)) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });
}

module.exports = { registerAdminUserRoutes };
