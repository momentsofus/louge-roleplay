/**
 * @file src/routes/web/admin/font-routes.js
 * @description 管理中心字体管理路由，维护聊天页可选对话显示字体。
 */

const { isValidationError } = require('./admin-route-utils');

function registerAdminFontRoutes(app, ctx) {
  const {
    requireAdmin,
    listFontsForAdmin,
    createFont,
    updateFont,
    deleteFont,
    renderPage,
    renderValidationMessage,
    parseIdParam,
  } = ctx;

  app.get('/admin/fonts', requireAdmin, async (req, res, next) => {
    try {
      const fonts = await listFontsForAdmin();
      renderPage(res, 'admin-fonts', {
        title: '字体管理',
        fonts,
        formMessage: req.query.saved
          ? { type: 'success', text: '字体配置已经保存。' }
          : (req.query.deleted
            ? { type: 'success', text: '字体已经删除，使用该字体的用户会回到默认字体。' }
            : (req.query.error ? { type: 'error', text: String(req.query.error).slice(0, 200) } : null)),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/admin/fonts/new', requireAdmin, async (req, res, next) => {
    try {
      await createFont(req.body);
      res.redirect('/admin/fonts?saved=1');
    } catch (error) {
      if (isValidationError(error) || error?.statusCode === 400 || /duplicate|uniq_fonts_code/i.test(String(error?.message || ''))) {
        const message = /duplicate|uniq_fonts_code/i.test(String(error?.message || '')) ? '字体标识已存在。' : error.message;
        res.redirect(`/admin/fonts?error=${encodeURIComponent(message || '字体保存失败。')}`);
        return;
      }
      next(error);
    }
  });

  app.post('/admin/fonts/:fontId', requireAdmin, async (req, res, next) => {
    try {
      const fontId = parseIdParam(req.params.fontId, '字体 ID');
      await updateFont(fontId, req.body);
      res.redirect('/admin/fonts?saved=1');
    } catch (error) {
      if (isValidationError(error) || error?.statusCode === 400 || /duplicate|uniq_fonts_code/i.test(String(error?.message || ''))) {
        const message = /duplicate|uniq_fonts_code/i.test(String(error?.message || '')) ? '字体标识已存在。' : error.message;
        res.redirect(`/admin/fonts?error=${encodeURIComponent(message || '字体保存失败。')}`);
        return;
      }
      next(error);
    }
  });

  app.post('/admin/fonts/:fontId/delete', requireAdmin, async (req, res, next) => {
    try {
      const fontId = parseIdParam(req.params.fontId, '字体 ID');
      await deleteFont(fontId);
      res.redirect('/admin/fonts?deleted=1');
    } catch (error) {
      if (isValidationError(error)) {
        return renderValidationMessage(res, error.message);
      }
      next(error);
    }
  });
}

module.exports = { registerAdminFontRoutes };
