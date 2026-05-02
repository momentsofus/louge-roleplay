/**
 * @file src/server-helpers/view-models.js
 * @description Shared view model helpers so pages render dates, numbers, roles, statuses and JSON responses consistently.
 */

'use strict';

function safeNumber(value, fallback = 0) {
  const number = Number(value ?? fallback);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value, locale = 'zh-CN') {
  return safeNumber(value).toLocaleString(locale || 'zh-CN');
}

function formatDateTime(value) {
  return String(value || '—').replace('T', ' ').slice(0, 19);
}

function roleLabel(role, t = (key) => key) {
  return t(role === 'admin' ? '管理员' : '普通用户');
}

function statusLabel(status, t = (key) => key) {
  if (status === 'active') return t('正常');
  if (status === 'blocked') return t('禁用');
  return t(status || '未知');
}

function accountStatusLabel(status, t = (key) => key) {
  return t(status === 'active' ? '状态正常' : '当前受限');
}

function billingModeLabel(mode, t = (key) => key) {
  return ({
    per_request: t('按请求'),
    per_token: t('按 Token'),
    hybrid: t('混合计费'),
  }[mode] || mode || t('未知'));
}

function quotaPeriodLabel(period, t = (key) => key) {
  return ({
    daily: t('每日'),
    monthly: t('每月'),
    lifetime: t('永久'),
  }[period] || period || t('未知'));
}

function apiOk(data = {}) {
  return { ok: true, data };
}

function apiError(message, code = 'ERROR', details = {}) {
  return {
    ok: false,
    error: {
      code,
      message: String(message || '请求失败'),
      ...details,
    },
  };
}

module.exports = {
  safeNumber,
  formatNumber,
  formatDateTime,
  roleLabel,
  statusLabel,
  accountStatusLabel,
  billingModeLabel,
  quotaPeriodLabel,
  apiOk,
  apiError,
};
