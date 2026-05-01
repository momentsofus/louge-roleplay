/**
 * @file src/routes/web/admin/character-routes.js
 * @description 管理后台全局角色卡列表、禁用、删除与角色卡关联对话入口路由。
 */

const { buildPageUrl } = require('./admin-route-utils');

function buildAdminCharactersRedirect(req) {
  const query = new URLSearchParams();
  ['keyword', 'userId', 'status', 'visibility', 'page', 'pageSize'].forEach((key) => {
    const value = req.body?.[key] || req.query?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value));
    }
  });
  const suffix = query.toString();
  return suffix ? `/admin/characters?${suffix}` : '/admin/characters';
}

function registerAdminCharacterRoutes(app, ctx) {
  const {
    requireAdmin,
    deleteAdminCharacter,
    ensureCharactersStatusEnumSupportsBlocked,
    getAdminCharacterDetail,
    getAdminCharacterById,
    listAdminCharacters,
    updateAdminCharacterStatus,
    renderPage,
    renderValidationMessage,
    parseIntegerField,
    parseIdParam,
  } = ctx;

  app.get('/admin/characters', requireAdmin, async (req, res, next) => {
    try {
      const characterResult = await listAdminCharacters({
        keyword: req.query.keyword,
        userId: req.query.userId,
        status: req.query.status,
        visibility: req.query.visibility,
        page: parseIntegerField(req.query.page, { fieldLabel: '页码', defaultValue: 1, min: 1 }),
        pageSize: parseIntegerField(req.query.pageSize, { fieldLabel: '分页大小', defaultValue: 25, min: 1 }),
      });

      renderPage(res, 'admin-characters', {
        title: '角色卡管理',
        characterResult,
        buildPageUrl: (targetPage) => buildPageUrl('/admin/characters', characterResult.filters, targetPage, characterResult.pageSize, { skipZero: true }),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/admin/characters/:characterId', requireAdmin, async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色卡 ID');
      const detail = await getAdminCharacterDetail(characterId);
      if (!detail) {
        return renderValidationMessage(res, '角色卡不存在。', '角色卡管理');
      }

      renderPage(res, 'admin-character-detail', {
        title: `角色卡 #${characterId}`,
        detail,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/admin/characters/:characterId/status', requireAdmin, async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色卡 ID');
      const status = String(req.body.status || '').trim();
      if (!['draft', 'published', 'blocked'].includes(status)) {
        return renderValidationMessage(res, '角色卡状态不支持。', '角色卡管理');
      }
      const character = await getAdminCharacterById(characterId);
      if (!character) {
        return renderValidationMessage(res, '角色卡不存在。', '角色卡管理');
      }
      await ensureCharactersStatusEnumSupportsBlocked();
      await updateAdminCharacterStatus(characterId, status);
      return res.redirect(buildAdminCharactersRedirect(req));
    } catch (error) {
      next(error);
    }
  });

  app.post('/admin/characters/:characterId/delete', requireAdmin, async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色卡 ID');
      const character = await getAdminCharacterById(characterId);
      if (!character) {
        return renderValidationMessage(res, '角色卡不存在。', '角色卡管理');
      }
      await deleteAdminCharacter(characterId);
      return res.redirect(buildAdminCharactersRedirect(req));
    } catch (error) {
      next(error);
    }
  });
}

module.exports = { registerAdminCharacterRoutes };
