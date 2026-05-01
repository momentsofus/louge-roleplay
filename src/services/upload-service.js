/**
 * @file src/services/upload-service.js
 * @description 角色卡头像与对话背景图上传处理。只接受小尺寸常见图片，保存到 public/uploads/characters。
 */

'use strict';

const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const multer = require('multer');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const CHARACTER_UPLOAD_DIR = path.join(PROJECT_ROOT, 'public', 'uploads', 'characters');
const PUBLIC_CHARACTER_UPLOAD_BASE = '/public/uploads/characters';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

fs.mkdirSync(CHARACTER_UPLOAD_DIR, { recursive: true });

function normalizeStoredImagePath(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (!raw.startsWith(`${PUBLIC_CHARACTER_UPLOAD_BASE}/`)) return null;
  if (raw.includes('..') || raw.includes('\\')) return null;
  if (path.basename(raw) !== raw.slice(PUBLIC_CHARACTER_UPLOAD_BASE.length + 1)) return null;
  const ext = path.extname(raw).toLowerCase();
  if (![...ALLOWED_IMAGE_TYPES.values()].includes(ext)) return null;
  return raw;
}

function buildStoredImagePath(filename) {
  return `${PUBLIC_CHARACTER_UPLOAD_BASE}/${filename}`;
}

function getUploadFilePath(storedPath) {
  const normalized = normalizeStoredImagePath(storedPath);
  if (!normalized) return null;
  return path.join(CHARACTER_UPLOAD_DIR, path.basename(normalized));
}

function deleteStoredImageIfOwned(storedPath) {
  const filePath = getUploadFilePath(storedPath);
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (_) {
    // best effort cleanup only
  }
}

const characterImageStorage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, CHARACTER_UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = ALLOWED_IMAGE_TYPES.get(String(file.mimetype || '').toLowerCase()) || '.img';
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${ext}`);
  },
});

const characterImageUpload = multer({
  storage: characterImageStorage,
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 2,
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_IMAGE_TYPES.has(String(file.mimetype || '').toLowerCase())) {
      const error = new Error('IMAGE_TYPE_NOT_SUPPORTED');
      error.code = 'IMAGE_TYPE_NOT_SUPPORTED';
      cb(error);
      return;
    }
    cb(null, true);
  },
});

function cleanupUploadedCharacterFiles(files = {}) {
  for (const list of Object.values(files || {})) {
    for (const file of Array.isArray(list) ? list : []) {
      if (file?.path) {
        try { fs.unlinkSync(file.path); } catch (_) {}
      }
    }
  }
}

function mapMulterError(error) {
  if (!error) return error;
  if (error.code === 'LIMIT_FILE_SIZE') {
    error.message = 'IMAGE_FILE_TOO_LARGE';
  }
  return error;
}

function uploadCharacterImages(req, res, next) {
  characterImageUpload.fields([
    { name: 'avatarImage', maxCount: 1 },
    { name: 'backgroundImage', maxCount: 1 },
  ])(req, res, (error) => {
    if (error) {
      cleanupUploadedCharacterFiles(req.files);
      next(mapMulterError(error));
      return;
    }
    next();
  });
}
function getUploadedCharacterImagePaths(files = {}) {
  const avatarFile = Array.isArray(files.avatarImage) ? files.avatarImage[0] : null;
  const backgroundFile = Array.isArray(files.backgroundImage) ? files.backgroundImage[0] : null;
  return {
    avatarImagePath: avatarFile ? buildStoredImagePath(avatarFile.filename) : null,
    backgroundImagePath: backgroundFile ? buildStoredImagePath(backgroundFile.filename) : null,
  };
}


module.exports = {
  uploadCharacterImages,
  getUploadedCharacterImagePaths,
  cleanupUploadedCharacterFiles,
  deleteStoredImageIfOwned,
  normalizeStoredImagePath,
};
