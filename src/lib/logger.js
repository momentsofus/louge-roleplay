/**
 * @file src/lib/logger.js
 * @description 提供统一日志输出方法，便于定位请求、错误与调试信息。
 */

function formatMeta(meta = {}) {
  try {
    return JSON.stringify(meta);
  } catch (error) {
    return '{"meta":"unserializable"}';
  }
}

function log(level, message, meta = {}) {
  const time = new Date().toISOString();
  console.log(`[${time}] [${level}] ${message} ${formatMeta(meta)}`);
}

module.exports = {
  info(message, meta) {
    log('INFO', message, meta);
  },
  warn(message, meta) {
    log('WARN', message, meta);
  },
  error(message, meta) {
    log('ERROR', message, meta);
  },
  debug(message, meta) {
    log('DEBUG', message, meta);
  },
};
