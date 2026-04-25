/**
 * @file src/services/font-proxy-service.js
 * @description Same-origin Google Fonts proxy so mainland users do not need to hit Google Fonts directly from the browser.
 */

const logger = require('../lib/logger');

const GOOGLE_FONTS_CSS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
const CSS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FONT_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_FONT_BYTES = 8 * 1024 * 1024;

const cache = new Map();

function getCache(key) {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry;
}

function setCache(key, value, ttlMs) {
  cache.set(key, {
    ...value,
    expiresAt: Date.now() + ttlMs,
  });
}

function isAllowedFontFileUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' && parsed.hostname === 'fonts.gstatic.com' && /^\/s\//.test(parsed.pathname);
  } catch (_error) {
    return false;
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 15000);
  try {
    return await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome Safari OpenClawFontProxy/1.0',
        'Accept': options.accept || '*/*',
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function rewriteGoogleFontCss(css) {
  return String(css || '').replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, (_full, fontUrl) => {
    return `url(/fonts/google/file?url=${encodeURIComponent(fontUrl)})`;
  });
}

async function getGoogleFontCss() {
  const cacheKey = 'google-fonts-css';
  const cached = getCache(cacheKey);
  if (cached) {
    return cached.css;
  }

  const response = await fetchWithTimeout(GOOGLE_FONTS_CSS_URL, {
    accept: 'text/css,*/*;q=0.1',
    timeoutMs: 18000,
  });
  if (!response.ok) {
    throw new Error(`Google Fonts CSS fetch failed: HTTP ${response.status}`);
  }

  const css = rewriteGoogleFontCss(await response.text());
  setCache(cacheKey, { css }, CSS_CACHE_TTL_MS);
  return css;
}

async function getFontFile(rawUrl) {
  if (!isAllowedFontFileUrl(rawUrl)) {
    const error = new Error('FONT_URL_NOT_ALLOWED');
    error.statusCode = 400;
    throw error;
  }

  const cacheKey = `font-file:${rawUrl}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetchWithTimeout(rawUrl, {
    accept: 'font/woff2,font/woff,*/*;q=0.1',
    timeoutMs: 20000,
  });
  if (!response.ok) {
    throw new Error(`Google font file fetch failed: HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers.get('content-length') || '0');
  if (contentLength > MAX_FONT_BYTES) {
    const error = new Error('FONT_FILE_TOO_LARGE');
    error.statusCode = 413;
    throw error;
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_FONT_BYTES) {
    const error = new Error('FONT_FILE_TOO_LARGE');
    error.statusCode = 413;
    throw error;
  }

  const value = {
    buffer: Buffer.from(arrayBuffer),
    contentType: response.headers.get('content-type') || 'font/woff2',
  };
  setCache(cacheKey, value, FONT_CACHE_TTL_MS);
  return value;
}

function logFontProxyError(error, meta = {}) {
  logger.warn('[font-proxy] request failed', {
    error: error.message,
    ...meta,
  });
}

module.exports = {
  CSS_CACHE_TTL_MS,
  FONT_CACHE_TTL_MS,
  getGoogleFontCss,
  getFontFile,
  logFontProxyError,
};
