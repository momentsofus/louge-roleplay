#!/usr/bin/env node
/**
 * @file scripts/smoke-test.js
 * @description 生产冒烟检查：只做只读探测，不写业务数据。
 */

const http = require('http');
const https = require('https');
const config = require('../src/config');

function fetchText(url) {
  const client = url.startsWith('https://') ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode || 0, headers: res.headers, body });
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error(`Request timeout: ${url}`));
    });
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const envBaseUrl = String(process.env.SMOKE_BASE_URL || '').trim();
  const baseUrl = (envBaseUrl || config.appUrl || `http://127.0.0.1:${config.port}`).replace(/\/$/, '');
  const checks = [
    {
      name: 'Home page',
      path: '/',
      expect: (res) => {
        assert(res.statusCode === 200, `expected 200, got ${res.statusCode}`);
        assert(res.body.includes(config.appName), 'home page missing app name');
      },
    },
    {
      name: 'Login page',
      path: '/login',
      expect: (res) => {
        assert(res.statusCode === 200, `expected 200, got ${res.statusCode}`);
        assert(res.body.includes('登录') || res.body.includes('登入'), 'login page missing login text');
      },
    },
    {
      name: 'Register page',
      path: '/register',
      expect: (res) => {
        assert(res.statusCode === 200, `expected 200, got ${res.statusCode}`);
        assert(res.body.includes('注册'), 'register page missing register text');
      },
    },
    {
      name: 'Characters new requires auth',
      path: '/characters/new',
      expect: (res) => {
        assert([302, 303].includes(res.statusCode), `expected redirect, got ${res.statusCode}`);
        assert(String(res.headers.location || '').includes('/login'), 'characters/new should redirect to login');
      },
    },
    {
      name: 'Admin requires auth',
      path: '/admin',
      expect: (res) => {
        assert([302, 303].includes(res.statusCode), `expected redirect, got ${res.statusCode}`);
        assert(String(res.headers.location || '').includes('/login'), 'admin should redirect to login');
      },
    },
    {
      name: 'Healthz returns healthy JSON',
      path: '/healthz',
      expect: (res) => {
        assert(res.statusCode === 200, `expected 200, got ${res.statusCode}`);
        assert(res.body.includes('"ok":true'), 'healthz missing ok=true');
        assert(res.body.includes('"database":"ok"'), 'healthz missing database ok');
        assert(res.body.includes('"redis":"ok"'), 'healthz missing redis ok');
      },
    },
    {
      name: 'Missing page returns 404',
      path: '/__smoke_not_found__',
      expect: (res) => {
        assert(res.statusCode === 404, `expected 404, got ${res.statusCode}`);
      },
    },
  ];

  console.log(`Smoke test base URL: ${baseUrl}`);

  for (const check of checks) {
    const response = await fetchText(`${baseUrl}${check.path}`);
    check.expect(response);
    console.log(`✓ ${check.name} (${check.path})`);
  }

  console.log('\nSmoke test passed.');
}

main().catch((error) => {
  console.error(`Smoke test failed: ${error.message}`);
  process.exitCode = 1;
});
