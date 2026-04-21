/**
 * @file scripts/grant-admin.js
 * @description 手动授予管理员权限。只允许本机显式执行，不走隐式自动提权。
 * 用法：node scripts/grant-admin.js <username>
 */

const { query } = require('../src/lib/db');

async function main() {
  const username = String(process.argv[2] || '').trim();
  if (!username) {
    throw new Error('Usage: node scripts/grant-admin.js <username>');
  }

  const users = await query('SELECT id, username, role, status FROM users WHERE username = ? LIMIT 1', [username]);
  const user = users[0];
  if (!user) {
    throw new Error(`User not found: ${username}`);
  }

  await query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', ['admin', user.id]);
  const updated = await query('SELECT id, username, role, status FROM users WHERE id = ? LIMIT 1', [user.id]);
  console.log(JSON.stringify(updated[0], null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
