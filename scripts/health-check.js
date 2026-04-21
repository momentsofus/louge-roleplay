#!/usr/bin/env node
/**
 * @file scripts/health-check.js
 * @description 基础健康检查：配置、数据库、Redis、公开 HTTP 页面。
 */

const http = require('http');
const https = require('https');
const mysql = require('mysql2/promise');
const { createClient } = require('redis');
const config = require('../src/config');

function fetchStatus(url) {
  const client = url.startsWith('https://') ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.get(url, (res) => {
      res.resume();
      res.on('end', () => resolve(res.statusCode || 0));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => req.destroy(new Error(`timeout: ${url}`)));
  });
}

async function checkDatabase() {
  const conn = await mysql.createConnection(config.databaseUrl);
  try {
    await conn.query('SELECT 1');
    return 'ok';
  } finally {
    await conn.end();
  }
}

async function checkRedis() {
  const client = createClient({ url: config.redisUrl });
  await client.connect();
  try {
    await client.ping();
    return 'ok';
  } finally {
    await client.quit();
  }
}

async function main() {
  const baseUrl = String(config.appUrl || `http://127.0.0.1:${config.port}`).replace(/\/$/, '');
  const checks = [];

  checks.push(['config.databaseUrl', Boolean(config.databaseUrl)]);
  checks.push(['config.redisUrl', Boolean(config.redisUrl)]);
  checks.push(['config.sessionSecret_not_default', config.sessionSecret !== 'replace_me']);

  try {
    await checkDatabase();
    checks.push(['database', true]);
  } catch (error) {
    checks.push([`database (${error.message})`, false]);
  }

  try {
    await checkRedis();
    checks.push(['redis', true]);
  } catch (error) {
    checks.push([`redis (${error.message})`, false]);
  }

  for (const path of ['/', '/login', '/register', '/healthz']) {
    try {
      const status = await fetchStatus(`${baseUrl}${path}`);
      checks.push([`http ${path} -> ${status}`, status === 200]);
    } catch (error) {
      checks.push([`http ${path} (${error.message})`, false]);
    }
  }

  let hasFailure = false;
  for (const [name, ok] of checks) {
    console.log(`${ok ? 'OK ' : 'ERR'} ${name}`);
    if (!ok) {
      hasFailure = true;
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
