/**
 * @file src/routes/web/public-routes.js
 * @description 从 web-routes.js 拆出的路由分组。
 */

function registerPublicRoutes(app, ctx) {
  const {
    createCaptcha,
    refreshCaptcha,
    getCaptchaImage,
    listPublicCharacters,
    listFeaturedPublicCharacters,
    getPublicCharacterDetail,
    listPublicTags,
    toggleCharacterLike,
    addCharacterComment,
    listCharacterComments,
    logger,
    config,
    query,
    getDbType,
    redisClient,
    isRedisReal,
    renderPage,
    renderRegisterPage,
    parseIdParam,
    getClientIp,
    hitLimit
  } = ctx;

  function getSameOriginBackUrl(req, fallback = '/characters/public') {
    const referer = String(req.get('referer') || '').trim();
    if (!referer) return fallback;
    try {
      const parsed = new URL(referer, `${req.protocol}://${req.get('host')}`);
      if (parsed.host === req.get('host')) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch (_) {}
    return fallback;
  }

  function canShowNsfw(req) {
    return Boolean(req.session?.user?.id && Number(req.session.user.show_nsfw || 0) === 1);
  }

  app.get('/', async (req, res, next) => {
    try {
      const characters = await listFeaturedPublicCharacters(6, { includeNsfw: canShowNsfw(req) });
      renderPage(res, 'home', {
        title: '首页',
        characters,
        meta: {
          url: '/',
          description: '楼阁是一个沉浸式 AI 角色对话空间，可以创建角色、公开分享，并与喜欢的人设持续展开故事。',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/characters/public', async (req, res, next) => {
    try {
      const page = Number.parseInt(req.query.page || '1', 10);
      const pageSize = Number.parseInt(req.query.pageSize || '12', 10);
      const keyword = String(req.query.q || '').trim();
      const sort = ['newest', 'oldest', 'likes', 'comments', 'usage', 'heat', 'random'].includes(String(req.query.sort || '').trim())
        ? String(req.query.sort || '').trim()
        : 'heat';
      const tags = String(req.query.tags || req.query.tag || '').trim();
      const tagMode = String(req.query.tagMode || 'or').trim() === 'and' ? 'and' : 'or';
      const includeNsfw = canShowNsfw(req);
      const [result, availableTags] = await Promise.all([
        listPublicCharacters({ page, pageSize, keyword, sort, tags, tagMode, includeNsfw }),
        listPublicTags({ includeNsfw }),
      ]);
      renderPage(res, 'public-characters', {
        title: '公开角色',
        characters: result.characters,
        pagination: result.pagination,
        filters: result.filters,
        availableTags,
        showNsfw: includeNsfw,
        meta: {
          url: `/characters/public${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`,
          description: keyword
            ? `在楼阁搜索「${keyword}」相关的公开角色，按热度、点赞、评论或使用量筛选。`
            : '浏览楼阁公开角色，按综合热度、点赞、评论或使用量筛选，找到适合开聊的人设。',
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/characters/public/:characterId', async (req, res, next) => {
    try {
      const characterId = parseIdParam(req.params.characterId, '角色 ID');
      const [character, comments] = await Promise.all([
        getPublicCharacterDetail(characterId, { includeNsfw: canShowNsfw(req) }),
        listCharacterComments(characterId, 50),
      ]);
      if (!character) {
        return renderPage(res, 'message', { title: '提示', message: '角色不存在或暂时不可公开查看。' });
      }

      renderPage(res, 'public-character-detail', {
        title: character.name,
        character,
        comments,
        meta: {
          url: `/characters/public/${character.id}`,
          description: character.summary || `在楼阁查看公开角色「${character.name}」，阅读评论并开始对话。`,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/characters/public/:characterId/like', async (req, res, next) => {
    try {
      if (!req.session?.user?.id) {
        return res.redirect('/login');
      }
      const characterId = parseIdParam(req.params.characterId, '角色 ID');
      const limited = await hitLimit(`rate:character-like:${req.session.user.id}`, 60, 60);
      if (limited) {
        return res.status(429).send('too many requests');
      }
      await toggleCharacterLike(characterId, req.session.user.id, { includeNsfw: canShowNsfw(req) });
      return res.redirect(getSameOriginBackUrl(req, '/characters/public'));
    } catch (error) {
      next(error);
    }
  });

  app.post('/characters/public/:characterId/comments', async (req, res, next) => {
    try {
      if (!req.session?.user?.id) {
        return res.redirect('/login');
      }
      const characterId = parseIdParam(req.params.characterId, '角色 ID');
      const limited = await hitLimit(`rate:character-comment:${req.session.user.id}:${getClientIp(req)}`, 60, 12);
      if (limited) {
        return res.status(429).send('too many requests');
      }
      await addCharacterComment(characterId, req.session.user.id, req.body.commentBody, { includeNsfw: canShowNsfw(req) });
      return res.redirect(getSameOriginBackUrl(req, '/characters/public'));
    } catch (error) {
      if (error.code === 'COMMENT_EMPTY') {
        return res.redirect(getSameOriginBackUrl(req, '/characters/public'));
      }
      next(error);
    }
  });

  app.get('/register', async (req, res, next) => {
    try {
      const captcha = await createCaptcha();
      renderRegisterPage(res, { captcha });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/captcha', async (req, res, next) => {
    try {
      const previousCaptchaId = String(req.query.previousCaptchaId || '').trim();
      const captcha = previousCaptchaId ? await refreshCaptcha(previousCaptchaId) : await createCaptcha();
      res.json(captcha);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/captcha/image/:captchaId', async (req, res, next) => {
    try {
      const svg = await getCaptchaImage(String(req.params.captchaId || '').trim());
      if (!svg) {
        return res.status(404).send('captcha expired');
      }
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.send(svg);
    } catch (error) {
      next(error);
    }
  });

  app.get('/healthz', async (req, res) => {
    logger.debug('Health check requested', {
      requestId: req.requestId,
      dbType: getDbType(),
      redisMode: isRedisReal() ? 'redis' : 'memory',
    });

    const checks = {
      ok: true,
      app: config.appName,
      version: config.appVersion,
      time: new Date().toISOString(),
      dbType: getDbType(),
      redisMode: isRedisReal() ? 'redis' : 'memory',
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    try {
      await query('SELECT 1');
      checks.services.database = 'ok';
    } catch (error) {
      checks.ok = false;
      checks.services.database = 'error';
      checks.databaseError = error.message;
    }

    try {
      await redisClient.ping();
      checks.services.redis = isRedisReal() ? 'ok' : 'memory';
    } catch (error) {
      checks.ok = false;
      checks.services.redis = 'error';
      checks.redisError = error.message;
    }

    return res.status(checks.ok ? 200 : 503).json(checks);
  });
}

module.exports = { registerPublicRoutes };
