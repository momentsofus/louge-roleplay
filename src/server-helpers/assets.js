/**
 * @file src/server-helpers/assets.js
 * @description 前端静态资源版本与 URL 生成。模板不再手写 ?v=，统一通过 assetUrl/assetVersion 管理缓存失效。
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const PACKAGE_VERSION = config.appVersion || 'dev';
const assetVersionCache = new Map();

function normalizeAssetPath(assetPath = '') {
  const raw = String(assetPath || '').trim();
  if (!raw) return '';
  if (/^(?:https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

function canUseFileFingerprint(assetPath = '') {
  const normalizedPath = normalizeAssetPath(assetPath);
  if (!normalizedPath || !normalizedPath.startsWith('/public/')) return false;
  if (normalizedPath.includes('\0') || normalizedPath.includes('..')) return false;
  return true;
}

function buildFileFingerprint(assetPath = '') {
  const normalizedPath = normalizeAssetPath(assetPath);
  if (!canUseFileFingerprint(normalizedPath)) return PACKAGE_VERSION;
  try {
    const absolutePath = path.join(PROJECT_ROOT, normalizedPath.replace(/^\/+/, ''));
    const relativePath = path.relative(PROJECT_ROOT, absolutePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) return PACKAGE_VERSION;
    const stat = fs.statSync(absolutePath);
    return `${PACKAGE_VERSION}-${Math.floor(stat.mtimeMs).toString(36)}-${Number(stat.size || 0).toString(36)}`;
  } catch (_) {
    return PACKAGE_VERSION;
  }
}

function assetVersion(assetPath = '') {
  const normalizedPath = normalizeAssetPath(assetPath);
  if (!normalizedPath) return config.assetVersion || PACKAGE_VERSION;

  // 开发热更新客户端需要跟随 live reload 服务的即时版本，其他资源优先使用显式 ASSET_VERSION，未配置则按文件指纹自动失效缓存。
  if (normalizedPath === '/public/js/live-reload-client.js' && config.liveReloadEnabled) {
    return require('../services/live-reload-service').getClientAssetVersion() || config.assetVersion || PACKAGE_VERSION;
  }

  if (config.assetVersion) return config.assetVersion;

  if (!assetVersionCache.has(normalizedPath)) {
    assetVersionCache.set(normalizedPath, buildFileFingerprint(normalizedPath));
  }
  return assetVersionCache.get(normalizedPath);
}

function assetUrl(assetPath = '') {
  const normalizedPath = normalizeAssetPath(assetPath);
  if (!normalizedPath) return '';
  if (/^(?:https?:)?\/\//i.test(normalizedPath) || normalizedPath.startsWith('data:')) return normalizedPath;

  const version = assetVersion(normalizedPath);
  if (!version) return normalizedPath;

  const separator = normalizedPath.includes('?') ? '&' : '?';
  return `${normalizedPath}${separator}v=${encodeURIComponent(version)}`;
}

module.exports = {
  assetVersion,
  assetUrl,
};
