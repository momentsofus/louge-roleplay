/**
 * @file src/services/live-reload-service.js
 * @description 开发环境热刷新服务。轮询 CSS/JS/EJS 指纹，源码变化时触发构建脚本并通过 SSE 通知浏览器刷新资源。
 * @notes 仅在 LIVE_RELOAD_ENABLED=true 时启动；生产应保持关闭。构建脚本通过 execFile 调用固定本地脚本路径，不接受用户输入。
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const EventEmitter = require('node:events');

const config = require('../config');
const logger = require('../lib/logger');

const projectRoot = path.join(__dirname, '..', '..');
const emitter = new EventEmitter();
emitter.setMaxListeners(200);

const state = {
  started: false,
  timer: null,
  cssSourceFingerprint: '',
  cssOutputFingerprint: '',
  jsSourceFingerprint: '',
  jsOutputFingerprint: '',
  viewFingerprint: '',
  cssVersion: String(Date.now()),
  reloadVersion: String(Date.now()),
  cssBuildPending: false,
  jsBuildPending: false,
  cssBuildTimer: null,
  jsBuildTimer: null,
};

function shouldSkipDir(name) {
  return name === 'node_modules' || name === '.git' || name === 'uploads' || name === 'logs' || name === 'data' || name === 'backups';
}

/**
 * 递归收集项目内匹配条件的文件路径。
 *
 * @param {string} relativeDir 相对项目根目录的起始目录。
 * @param {(relativePath:string)=>boolean} predicate 文件过滤函数。
 * @param {string[]} output 递归复用的输出数组。
 * @returns {string[]} 满足条件的相对路径列表。
 */
function walkFiles(relativeDir, predicate, output = []) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  let entries = [];
  try {
    entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  } catch (_) {
    return output;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name)) {
        walkFiles(path.join(relativeDir, entry.name), predicate, output);
      }
      continue;
    }
    if (!entry.isFile()) continue;
    const relativePath = path.join(relativeDir, entry.name).replace(/\\/g, '/');
    if (predicate(relativePath)) output.push(relativePath);
  }
  return output;
}

/**
 * 生成文件集合的轻量指纹。
 *
 * @param {string[]} files 相对项目根目录的文件路径列表。
 * @returns {string} 由路径、大小和 mtime 组成的可比较字符串。
 */
function statFingerprint(files) {
  return files.sort().map((relativePath) => {
    try {
      const stat = fs.statSync(path.join(projectRoot, relativePath));
      return `${relativePath}:${stat.size}:${Math.round(stat.mtimeMs)}`;
    } catch (_) {
      return `${relativePath}:missing`;
    }
  }).join('|');
}

function getCssSourceFiles() {
  return walkFiles('public/styles', (file) => file.endsWith('.css') && file !== 'public/styles/site-pages.css');
}

function getCssOutputFiles() {
  return ['public/styles/site-pages.css'].filter((file) => fs.existsSync(path.join(projectRoot, file)));
}

function getJsSourceFiles() {
  return walkFiles('public/js', (file) => file.endsWith('.js') && !file.startsWith('public/js/generated/'));
}

function getJsOutputFiles() {
  return walkFiles('public/js/generated', (file) => file.endsWith('.js'));
}

function getViewFiles() {
  return walkFiles('src/views', (file) => file.endsWith('.ejs'));
}

function getClientAssetVersion() {
  try {
    const stat = fs.statSync(path.join(projectRoot, 'public/js/live-reload-client.js'));
    return `${config.appVersion}-${Math.round(stat.mtimeMs)}`;
  } catch (_) {
    return config.appVersion || 'dev';
  }
}

function emitChange(kind) {
  const payload = {
    kind,
    cssVersion: state.cssVersion,
    reloadVersion: state.reloadVersion,
    time: Date.now(),
  };
  emitter.emit('change', payload);
}

/**
 * 执行固定的资源构建脚本。
 *
 * @param {string} scriptRelativePath scripts/ 下的固定脚本路径。
 * @param {(error: Error|null)=>void} callback 构建完成回调。
 * @returns {void}
 */
function runScript(scriptRelativePath, callback) {
  execFile(process.execPath, [path.join(projectRoot, scriptRelativePath)], {
    cwd: projectRoot,
    timeout: 30000,
    maxBuffer: 1024 * 1024,
  }, (error, stdout, stderr) => {
    if (stdout) logger.info('[live-reload] asset build stdout', { script: scriptRelativePath, stdout: stdout.trim() });
    if (stderr) logger.warn('[live-reload] asset build stderr', { script: scriptRelativePath, stderr: stderr.trim() });
    if (error) {
      logger.error('[live-reload] asset build failed', { script: scriptRelativePath, error: error.message });
      callback(error);
      return;
    }
    callback(null);
  });
}

function scheduleCssBuild() {
  if (state.cssBuildTimer) clearTimeout(state.cssBuildTimer);
  state.cssBuildTimer = setTimeout(() => {
    if (state.cssBuildPending) return;
    state.cssBuildPending = true;
    runScript('scripts/build-css.js', () => {
      state.cssBuildPending = false;
      state.cssOutputFingerprint = statFingerprint(getCssOutputFiles());
      state.cssVersion = String(Date.now());
      emitChange('css');
    });
  }, 160);
}

function scheduleJsBuild() {
  if (state.jsBuildTimer) clearTimeout(state.jsBuildTimer);
  state.jsBuildTimer = setTimeout(() => {
    if (state.jsBuildPending) return;
    state.jsBuildPending = true;
    runScript('scripts/build-js.js', () => {
      state.jsBuildPending = false;
      state.jsOutputFingerprint = statFingerprint(getJsOutputFiles());
      state.reloadVersion = String(Date.now());
      emitChange('reload');
    });
  }, 160);
}

function snapshotFingerprints() {
  return {
    cssSource: statFingerprint(getCssSourceFiles()),
    cssOutput: statFingerprint(getCssOutputFiles()),
    jsSource: statFingerprint(getJsSourceFiles()),
    jsOutput: statFingerprint(getJsOutputFiles()),
    views: statFingerprint(getViewFiles()),
  };
}

/**
 * 对比资源/模板指纹并按变化类型触发 CSS 构建、JS 构建或页面刷新事件。
 *
 * @returns {void}
 */
function scanOnce() {
  const next = snapshotFingerprints();
  if (!state.cssSourceFingerprint) {
    state.cssSourceFingerprint = next.cssSource;
    state.cssOutputFingerprint = next.cssOutput;
    state.jsSourceFingerprint = next.jsSource;
    state.jsOutputFingerprint = next.jsOutput;
    state.viewFingerprint = next.views;
    return;
  }

  if (next.cssSource !== state.cssSourceFingerprint) {
    state.cssSourceFingerprint = next.cssSource;
    scheduleCssBuild();
  } else if (next.cssOutput !== state.cssOutputFingerprint) {
    state.cssOutputFingerprint = next.cssOutput;
    state.cssVersion = String(Date.now());
    emitChange('css');
  }

  if (next.jsSource !== state.jsSourceFingerprint) {
    state.jsSourceFingerprint = next.jsSource;
    scheduleJsBuild();
  } else if (next.jsOutput !== state.jsOutputFingerprint) {
    state.jsOutputFingerprint = next.jsOutput;
    state.reloadVersion = String(Date.now());
    emitChange('reload');
  }

  if (next.views !== state.viewFingerprint) {
    state.viewFingerprint = next.views;
    state.reloadVersion = String(Date.now());
    emitChange('reload');
  }
}

/**
 * 启动开发热刷新轮询器。
 *
 * @returns {void}
 */
function startLiveReloadWatcher() {
  if (!config.liveReloadEnabled || state.started) return;
  state.started = true;
  scanOnce();
  state.timer = setInterval(scanOnce, 1000);
  state.timer.unref();
  logger.info('[live-reload] watcher started', { intervalMs: 1000 });
}

function writeSse(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

/**
 * Express SSE handler。浏览器连接后先收到 ready 事件，之后在资源变化时收到 change 事件。
 *
 * @param {import('express').Request} req Express request。
 * @param {import('express').Response} res Express response。
 * @returns {void}
 */
function liveReloadSseHandler(req, res) {
  if (!config.liveReloadEnabled) {
    res.status(404).json({ ok: false });
    return;
  }

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  writeSse(res, 'ready', {
    kind: 'ready',
    cssVersion: state.cssVersion,
    reloadVersion: state.reloadVersion,
    time: Date.now(),
  });

  const onChange = (payload) => writeSse(res, 'change', payload);
  emitter.on('change', onChange);

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);
  heartbeat.unref();

  req.on('close', () => {
    clearInterval(heartbeat);
    emitter.off('change', onChange);
  });
}

module.exports = {
  startLiveReloadWatcher,
  liveReloadSseHandler,
  getClientAssetVersion,
};
