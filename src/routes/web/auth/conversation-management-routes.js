/**
 * @file src/routes/web/auth/conversation-management-routes.js
 * @description 用户侧会话管理页：按关键词、角色、状态筛选全部会话，并支持批量归档、恢复、删除。
 */

function buildConversationPageUrl(filters = {}, targetPage = 1, pageSize = 12) {
  const params = new URLSearchParams();
  const page = Number(targetPage || 1);
  const size = Number(pageSize || 12);
  if (filters.q) params.set('q', String(filters.q));
  if (filters.status && filters.status !== 'active') params.set('status', String(filters.status));
  if (filters.characterId) params.set('characterId', String(filters.characterId));
  if (filters.sort && filters.sort !== 'updated_desc') params.set('sort', String(filters.sort));
  if (page > 1) params.set('page', String(page));
  if (size !== 12) params.set('pageSize', String(size));
  const query = params.toString();
  return query ? `/conversations?${query}` : '/conversations';
}

function normalizeConversationIds(value) {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values
    .flatMap((item) => String(item || '').split(','))
    .map((item) => Number(String(item || '').trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0))]
    .slice(0, 100);
}

function buildFilters(query = {}) {
  return {
    q: String(query.q || '').trim().slice(0, 80),
    status: String(query.status || 'active').trim(),
    characterId: Number(query.characterId || 0) > 0 ? Number(query.characterId) : 0,
    sort: String(query.sort || 'updated_desc').trim(),
  };
}

function registerAuthConversationManagementRoutes(app, ctx) {
  const {
    requireAuth,
    listUserConversationsForManagement,
    bulkSoftDeleteUserConversations,
    bulkArchiveUserConversations,
    bulkRestoreUserConversations,
    renderPage,
    parseIntegerField,
  } = ctx;

  app.get('/conversations', requireAuth, async (req, res, next) => {
    try {
      const filters = buildFilters(req.query);
      const page = parseIntegerField(req.query.page, { fieldLabel: '页码', defaultValue: 1, min: 1 });
      const pageSize = parseIntegerField(req.query.pageSize, { fieldLabel: '每页数量', defaultValue: 12, min: 1 });
      const result = await listUserConversationsForManagement(req.session.user.id, {
        search: filters.q,
        status: filters.status,
        characterId: filters.characterId,
        sort: filters.sort,
        page,
        pageSize,
      });
      const noticeMap = {
        archived: '已归档选中的会话。',
        restored: '已恢复选中的会话。',
        deleted: '已删除选中的会话。',
      };
      const notice = noticeMap[String(req.query.notice || '')] || '';
      renderPage(res, 'conversations', {
        title: '会话管理',
        originalUrl: req.originalUrl || req.url || '/conversations',
        conversationResult: result,
        filters: result.filters,
        notice,
        buildPageUrl: (targetPage, targetPageSize = result.pageSize) => buildConversationPageUrl(filters, targetPage, targetPageSize),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/conversations/bulk', requireAuth, async (req, res, next) => {
    try {
      const action = String(req.body.action || '').trim();
      const ids = normalizeConversationIds(req.body.conversationIds);
      if (!ids.length) {
        return renderPage(res, 'message', { title: '提示', message: '请先选择至少一条会话。' });
      }

      let notice = 'restored';
      if (action === 'archive') {
        await bulkArchiveUserConversations(req.session.user.id, ids);
        notice = 'archived';
      } else if (action === 'restore') {
        await bulkRestoreUserConversations(req.session.user.id, ids);
        notice = 'restored';
      } else if (action === 'delete') {
        await bulkSoftDeleteUserConversations(req.session.user.id, ids);
        notice = 'deleted';
      } else {
        return renderPage(res, 'message', { title: '提示', message: '不支持的批量操作。' });
      }

      const redirectTo = String(req.body.returnTo || '/conversations');
      const safeReturnTo = redirectTo.startsWith('/conversations') ? redirectTo : '/conversations';
      const separator = safeReturnTo.includes('?') ? '&' : '?';
      return res.redirect(`${safeReturnTo}${separator}notice=${notice}`);
    } catch (error) {
      next(error);
    }
  });
}

module.exports = { registerAuthConversationManagementRoutes };
