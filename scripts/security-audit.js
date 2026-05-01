#!/usr/bin/env node
/**
 * @file scripts/security-audit.js
 * @description Lightweight production risk audit for configuration, dependency, and source-level guardrails.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const config = require('../src/config');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIRS = ['src', 'public/js'];

function statusLine(ok, label, detail = '') {
  const prefix = ok ? 'OK ' : 'ERR';
  console.log(`${prefix} ${label}${detail ? ` - ${detail}` : ''}`);
}

function listFiles(dir) {
  const root = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(root)) return [];
  const output = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(current)) {
        if (entry === 'node_modules' || entry === '.git') continue;
        stack.push(path.join(current, entry));
      }
    } else if (/\.(?:js|ejs)$/i.test(current)) {
      output.push(current);
    }
  }
  return output;
}

function runNpmAudit() {
  const result = spawnSync('npm', ['audit', '--omit=dev', '--audit-level=moderate', '--json'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
  });

  if (result.error) {
    return { ok: false, detail: result.error.message };
  }

  try {
    const parsed = JSON.parse(result.stdout || '{}');
    const total = Number(parsed?.metadata?.vulnerabilities?.total || 0);
    return { ok: total === 0, detail: total === 0 ? '0 vulnerabilities' : `${total} vulnerabilities` };
  } catch (_) {
    return { ok: result.status === 0, detail: result.status === 0 ? '0 vulnerabilities' : 'npm audit failed' };
  }
}

function scanSource() {
  const riskyPatterns = [
    { label: 'eval(', regex: /\beval\s*\(/ },
    { label: 'new Function', regex: /\bnew\s+Function\b/ },
    { label: 'child_process exec from request code', regex: /require\(['"]node:child_process['"]\)|require\(['"]child_process['"]\)/ },
  ];

  const findings = [];
  for (const dir of SOURCE_DIRS) {
    for (const file of listFiles(dir)) {
      const rel = path.relative(PROJECT_ROOT, file);
      const text = fs.readFileSync(file, 'utf8');
      for (const pattern of riskyPatterns) {
        if (pattern.regex.test(text)) {
          // scripts/security-audit.js intentionally uses child_process to run npm audit.
          if (rel === 'scripts/security-audit.js' && pattern.label.includes('child_process')) continue;
          findings.push(`${rel}: ${pattern.label}`);
        }
      }
    }
  }
  return findings;
}

function main() {
  const checks = [];
  checks.push(['production SESSION_SECRET configured', !config.sessionSecretIsEphemeral]);
  checks.push(['production COOKIE_SECURE enabled', process.env.NODE_ENV !== 'production' || config.cookieSecure]);
  checks.push(['production TRUST_PROXY enabled behind reverse proxy', process.env.NODE_ENV !== 'production' || config.trustProxy]);
  checks.push(['DATABASE_URL configured', Boolean(config.databaseUrl)]);
  checks.push(['REDIS_URL configured', Boolean(config.redisUrl)]);
  checks.push(['production fail-fast enabled', config.productionFailFast]);
  checks.push(['SQLite fallback disabled in production', process.env.NODE_ENV !== 'production' || !config.allowProductionSqliteFallback]);
  checks.push(['memory Redis fallback disabled in production', process.env.NODE_ENV !== 'production' || !config.allowProductionMemoryRedis]);
  checks.push(['rate limit fails closed in production', process.env.NODE_ENV !== 'production' || config.rateLimitFailClosed]);

  let failed = false;
  for (const [label, ok] of checks) {
    statusLine(Boolean(ok), label);
    if (!ok) failed = true;
  }

  const audit = runNpmAudit();
  statusLine(audit.ok, 'npm audit --omit=dev --audit-level=moderate', audit.detail);
  if (!audit.ok) failed = true;

  const sourceFindings = scanSource();
  statusLine(sourceFindings.length === 0, 'source risky primitive scan', sourceFindings.length ? sourceFindings.join('; ') : 'no risky primitives found');
  if (sourceFindings.length) failed = true;

  if (failed) {
    process.exitCode = 1;
  }
}

main();
