/**
 * @file src/server-helpers/navigation.js
 * @description Central navigation definitions for shared layout/admin pages.
 */

'use strict';

const ADMIN_NAV_ITEMS = [
  { key: 'dashboard', href: '/admin', label: '用户与总览', badge: 'Home', description: '后台总览、用户与权限管理。', hub: false },
  { key: 'providers', href: '/admin/providers', label: 'LLM 配置', badge: 'LLM', description: 'Provider、模型发现、并发、超时、价格都放这边。', hub: true },
  { key: 'models', href: '/admin/models', label: '预设模型', badge: 'Models', description: '统一维护模型 ID、前台名称和描述，套餐直接复用。', hub: true },
  { key: 'plans', href: '/admin/plans', label: '套餐配置', badge: 'Plans', description: '套餐额度、计费模式、默认套餐、优先级这些都单独管。', hub: true },
  { key: 'prompts', href: '/admin/prompts', label: 'Prompt 配置', badge: 'Prompt', description: '全局片段、排序和最终 Prompt 预览都在这里，不再跟别的表单挤一起。', hub: true },
  { key: 'notifications', href: '/admin/notifications', label: '通知中心', badge: 'Notice', description: '客服入口、站内通知、强制弹窗和新人提醒统一配置。', hub: true },
  { key: 'site-messages', href: '/admin/site-messages', label: '站内信管理', badge: 'Mail', description: '可追踪的定向站内信、全体消息和已读状态管理。', hub: true },
  { key: 'logs', href: '/admin/logs', label: '日志查询', badge: 'Logs', description: '按日期、等级、文件、错误类型和函数名筛查运行日志。', hub: true },
  { key: 'characters', href: '/admin/characters', label: '角色卡管理', badge: 'Cards', description: '全局查看角色卡，禁用、恢复、删除并追踪关联对话。', hub: true },
  { key: 'character-import', href: '/admin/characters/import', label: '批量导入酒馆卡', badge: 'Import', description: '上传 SillyTavern / TavernAI 的 PNG 或 JSON 角色卡，先预览再入库。', hub: true },
  { key: 'conversations', href: '/admin/conversations', label: '对话记录', badge: 'Chats', description: '全局查看会话，按用户、角色卡和日期筛选。', hub: true },
];

const LAYOUT_NAV_ITEMS = [
  { key: 'home', href: '/', label: '首页', auth: 'any' },
  { key: 'dashboard', href: '/dashboard', label: '控制台', auth: 'user' },
  { key: 'profile', href: '/profile', label: '个人资料', auth: 'user' },
  { key: 'messages', href: '/messages', label: '站内信', auth: 'user', badge: 'siteMessages' },
  { key: 'admin', href: '/admin', label: '管理后台', auth: 'admin' },
  { key: 'character-new', href: '/characters/new', label: '创建角色', auth: 'user' },
  { key: 'login', href: '/login', label: '登录', auth: 'guest' },
  { key: 'register', href: '/register', label: '注册', auth: 'guest' },
];

function translateItems(items, t = (key) => key) {
  return items.map((item) => ({
    ...item,
    label: t(item.label),
    description: item.description ? t(item.description) : item.description,
  }));
}

function getAdminNavItems(t) {
  return translateItems(ADMIN_NAV_ITEMS, t);
}

function getAdminHubItems(t) {
  return getAdminNavItems(t).filter((item) => item.hub);
}

function getLayoutNavItems(currentUser, t) {
  const isAdmin = currentUser?.role === 'admin';
  return translateItems(LAYOUT_NAV_ITEMS, t).filter((item) => {
    if (item.auth === 'user') return Boolean(currentUser);
    if (item.auth === 'admin') return isAdmin;
    if (item.auth === 'guest') return !currentUser;
    return true;
  });
}

module.exports = {
  ADMIN_NAV_ITEMS,
  LAYOUT_NAV_ITEMS,
  getAdminNavItems,
  getAdminHubItems,
  getLayoutNavItems,
};
