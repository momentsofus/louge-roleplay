/**
 * @file src/lib/sqlite-schema/seed.js
 * @description 默认套餐、默认 LLM provider 与旧套餐模型权益回填。
 */

'use strict';

const config = require('../../config');

function maskApiKey(apiKey = '') {
  const raw = String(apiKey || '').trim();
  if (!raw) return '';
  if (raw.length <= 8) return `${raw.slice(0, 2)}***${raw.slice(-2)}`;
  return `${raw.slice(0, 4)}***${raw.slice(-4)}`;
}


function buildLegacyPlanModelsJson(provider = {}) {
  const entries = [
    ['standard', '标准模型', provider.standard_model || provider.model],
    ['jailbreak', '破限模型', provider.jailbreak_model || provider.standard_model || provider.model],
    ['force_jailbreak', '强破限模型', provider.force_jailbreak_model || provider.jailbreak_model || provider.standard_model || provider.model],
  ];
  const seen = new Set();
  return JSON.stringify(entries
    .map(([modelKey, label, modelId], index) => ({
      modelKey,
      label,
      providerId: provider.id,
      modelId: String(modelId || '').trim(),
      requestMultiplier: 1,
      tokenMultiplier: 1,
      isDefault: index === 0,
      sortOrder: index * 10,
    }))
    .filter((item) => {
      if (!item.modelId || seen.has(item.modelKey)) return false;
      seen.add(item.modelKey);
      return true;
    }));
}

function migratePresetModelsFromPlansSqlite(db) {
  const presetRows = db.prepare('SELECT id, provider_id, model_id FROM preset_models').all();
  const existingBySignature = new Map((presetRows || []).map((preset) => [`${Number(preset.provider_id || 0)}::${String(preset.model_id || '').trim()}`, preset]));
  const plans = db.prepare('SELECT id, plan_models_json FROM plans ORDER BY id ASC').all();
  const groups = new Map();

  (plans || []).forEach((plan) => {
    let items = [];
    try {
      const parsed = JSON.parse(String(plan.plan_models_json || '[]'));
      items = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      items = [];
    }
    items.forEach((item) => {
      const providerId = Number(item.providerId ?? item.provider_id ?? 0);
      const modelId = String(item.modelId ?? item.model_id ?? '').trim();
      if (!providerId || !modelId) return;
      const signature = `${providerId}::${modelId}`;
      if (!groups.has(signature)) {
        groups.set(signature, { providerId, modelId, labels: [], keys: [], planIds: [] });
      }
      const group = groups.get(signature);
      group.labels.push(item.label || item.name || '');
      group.keys.push(item.modelKey || item.model_key || '');
      group.planIds.push(Number(plan.id));
    });
  });

  function fallbackLabel(modelId) {
    return String(modelId || 'model').split('/').pop().replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function fallbackKey(value) {
    return String(value || 'model').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'model';
  }

  groups.forEach((group) => {
    const signature = `${group.providerId}::${group.modelId}`;
    if (existingBySignature.has(signature)) return;
    const labels = [...new Set(group.labels.map((item) => String(item || '').trim()).filter(Boolean))];
    const name = labels.length ? labels.slice(0, 3).join(' / ') : fallbackLabel(group.modelId);
    const result = db.prepare(`
      INSERT INTO preset_models (
        provider_id, model_key, model_id, name, description, status, sort_order, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NULL, 'active', 0, ?, NOW(), NOW())
    `).run(
      group.providerId,
      fallbackKey(group.keys.find(Boolean) || name || group.modelId),
      group.modelId,
      name,
      JSON.stringify({ migratedFromPlanIds: [...new Set(group.planIds)] }),
    );
    existingBySignature.set(signature, { id: Number(result.lastInsertRowid), provider_id: group.providerId, model_id: group.modelId });
  });

  const freshPresetRows = db.prepare('SELECT id, provider_id, model_id FROM preset_models').all();
  const freshBySignature = new Map((freshPresetRows || []).map((preset) => [`${Number(preset.provider_id || 0)}::${String(preset.model_id || '').trim()}`, preset]));

  (plans || []).forEach((plan) => {
    let items = [];
    try {
      const parsed = JSON.parse(String(plan.plan_models_json || '[]'));
      items = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      items = [];
    }
    let changed = false;
    const migrated = items.map((item) => {
      const providerId = Number(item.providerId ?? item.provider_id ?? 0);
      const modelId = String(item.modelId ?? item.model_id ?? '').trim();
      const preset = freshBySignature.get(`${providerId}::${modelId}`);
      if (!preset || Number(item.presetModelId || item.preset_model_id || 0) === Number(preset.id)) return item;
      changed = true;
      return { ...item, presetModelId: Number(preset.id) };
    });
    if (changed) {
      db.prepare('UPDATE plans SET plan_models_json = ?, updated_at = NOW() WHERE id = ?').run(JSON.stringify(migrated), plan.id);
    }
  });
}

/**
 * 初始化 SQLite 数据库表结构，并写入种子数据（套餐、默认 LLM 提供商）。
 * 所有 CREATE TABLE 使用 IF NOT EXISTS，可以安全重复调用。
 *
 * @param {import('node:sqlite').DatabaseSync} db
 */

function seedSqliteDefaults(db) {
// ─── 默认套餐种子数据 ─────────────────────────────────────────────────────────
  const planCount = db.prepare('SELECT COUNT(*) AS cnt FROM plans').get();
  if (Number(planCount.cnt || 0) === 0) {
    db.exec(`
      INSERT INTO plans (
        code, name, description, billing_mode, quota_period, request_quota, token_quota,
        priority_weight, concurrency_limit, max_output_tokens, status, is_default, sort_order,
        created_at, updated_at
      ) VALUES
      ('free',  '免费版', '适合体验产品基础能力',     'per_request', 'daily',   200,   200000,  10, 1, 1024, 'active', 1, 10, NOW(), NOW()),
      ('basic', '基础版', '按次/按量都可承接的主力套餐', 'hybrid',      'monthly', 3000,  3000000, 30, 2, 2048, 'active', 0, 20, NOW(), NOW()),
      ('pro',   '高级版', '更高优先级与更稳定的排队保障', 'per_token',   'monthly', 10000, 12000000,80, 3, 4096, 'active', 0, 30, NOW(), NOW())
    `);
  }

  // ─── 默认 LLM 提供商（仅当 ENV 中配置了 Key 时写入）─────────────────────────
  const providerCount = db.prepare('SELECT COUNT(*) AS cnt FROM llm_providers').get();
  if (
    Number(providerCount.cnt || 0) === 0
    && config.openaiBaseUrl
    && config.openaiApiKey
    && config.openaiModel
  ) {
    const masked = maskApiKey(config.openaiApiKey);
    const models = JSON.stringify([config.openaiModel]);
    db.prepare(`
      INSERT INTO llm_providers (
        name, provider_type, base_url, api_key, api_key_masked, model,
        standard_model, jailbreak_model, force_jailbreak_model, compression_model,
        available_models_json, max_context_tokens, trim_context_tokens,
        is_active, status, max_concurrency, timeout_ms,
        input_token_price, output_token_price, created_at, updated_at
      ) VALUES (?, 'openai_compatible', ?, ?, ?, ?, ?, ?, ?, ?, ?, 81920, 61440, 1, 'active', 5, 60000, 0, 0, NOW(), NOW())
    `).run(
      'Default OpenAI Compatible',
      config.openaiBaseUrl,
      config.openaiApiKey,
      masked,
      config.openaiModel,
      config.openaiModel,
      config.openaiModel,
      config.openaiModel,
      config.openaiModel,
      models,
    );
  }

  const activeProviderForPlanBackfill = db.prepare(`
    SELECT id, model, standard_model, jailbreak_model, force_jailbreak_model
    FROM llm_providers
    WHERE is_active = 1 AND status = 'active'
    ORDER BY id ASC
    LIMIT 1
  `).get();
  if (activeProviderForPlanBackfill) {
    const legacyPlanModelsJson = buildLegacyPlanModelsJson(activeProviderForPlanBackfill);
    if (JSON.parse(legacyPlanModelsJson).length) {
      db.prepare("UPDATE plans SET plan_models_json = ?, updated_at = NOW() WHERE plan_models_json IS NULL OR plan_models_json = '' OR plan_models_json = '[]'").run(legacyPlanModelsJson);
    }
  }

  migratePresetModelsFromPlansSqlite(db);
  seedSqliteFonts(db);
}

function seedSqliteFonts(db) {
  const defaults = [
    ['inter-ui', 'Inter · 默认界面字体', '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI", sans-serif', 'https://fonts.xuejourney.xin/css2?family=Inter:wght@400;500;600;700;800&xuejourney=woff2&display=swap', 'Inter 适合清楚、现代的对话阅读。', 10],
    ['system-sans-cn', '系统黑体 · 中文优先', '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI", sans-serif', null, '系统中文黑体更稳，加载也更轻。', 20],
    ['system-serif-cn', '系统宋体 · 叙事阅读', '"Songti SC", "SimSun", "Noto Serif CJK SC", serif', null, '系统宋体更像小说正文，适合慢慢读。', 30],
    ['jetbrains-mono', 'JetBrains Mono · 等宽风格', '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace', 'https://fonts.xuejourney.xin/css2?family=JetBrains+Mono:wght@400;500;600;700&xuejourney=woff2&display=swap', 'JetBrains Mono 会让对话带一点终端和手稿感。', 40],
    ['ma-shan-zheng', 'Ma Shan Zheng · 马善政', '"Ma Shan Zheng", "STKaiti", "KaiTi", cursive', 'https://fonts.xuejourney.xin/css2?family=Ma+Shan+Zheng&xuejourney=woff2&display=swap', '马善政带着题字和手写感，适合更有江湖气的对白。', 50],
    ['zcool-xiaowei', 'ZCOOL XiaoWei · 站酷小薇', '"ZCOOL XiaoWei", "Songti SC", "SimSun", serif', 'https://fonts.xuejourney.xin/css2?family=ZCOOL+XiaoWei&xuejourney=woff2&display=swap', '站酷小薇像旧书标题，也适合温雅一点的叙事。', 60],
    ['zhi-mang-xing', 'Zhi Mang Xing · 志莽行', '"Zhi Mang Xing", "STKaiti", "KaiTi", cursive', 'https://fonts.xuejourney.xin/css2?family=Zhi+Mang+Xing&xuejourney=woff2&display=swap', '志莽行更潇洒，像把一句话写在风里。', 70],
    ['zcool-qingke-huangyou', 'ZCOOL QingKe HuangYou · 站酷庆科黄油体', '"ZCOOL QingKe HuangYou", "PingFang SC", "Microsoft YaHei", sans-serif', 'https://fonts.xuejourney.xin/css2?family=ZCOOL+QingKe+HuangYou&xuejourney=woff2&display=swap', '庆科黄油体轻快醒目，适合更活泼的聊天氛围。', 80],
    ['long-cang', 'Long Cang · 龙藏体', '"Long Cang", "STKaiti", "KaiTi", cursive', 'https://fonts.xuejourney.xin/css2?family=Long+Cang&xuejourney=woff2&display=swap', '龙藏体笔意更散，适合古风、梦境和带余韵的角色。', 90],
  ];
  const exists = db.prepare('SELECT id FROM fonts WHERE code = ? LIMIT 1');
  const insert = db.prepare(`
    INSERT INTO fonts (code, name, css_stack, stylesheet_url, preview_text, status, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, NOW(), NOW())
  `);
  defaults.forEach((item) => {
    if (exists.get(item[0])) return;
    insert.run(...item);
  });
}

module.exports = { seedSqliteDefaults };
