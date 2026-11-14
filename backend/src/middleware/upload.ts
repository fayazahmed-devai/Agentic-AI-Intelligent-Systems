import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { FileModality } from '../types/index.js';

if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = uuidv4().slice(0, 8);
    cb(null, `${Date.now()}_${cleanBase}_${unique}${ext}`);
  },
});

export function detectModality(mimeType: string, filename: string): FileModality {
  const ext = path.extname(filename).toLowerCase();

  if (mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.ogg'].includes(ext)) {
    return 'audio';
  }
  if (mimeType.startsWith('video/') || ['.mp4', '.mov', '.webm', '.mkv'].includes(ext)) {
    return 'video';
  }
  if (mimeType === 'text/plain' || ext === '.txt') {
    return 'text';
  }
  return 'document';
}

const allowedExtensions = [
  '.pdf',
  '.docx',
  '.txt',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.mp3',
  '.wav',
  '.m4a',
  '.mp4',
  '.mov',
  '.webm',
];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext) || file.mimetype.match(/^(image|audio|video)\//)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type (${ext}). Allowed: PDF, DOCX, TXT, Images (JPG, PNG, WEBP), Audio (MP3, WAV, M4A), Video (MP4, MOV, WEBM).`
      )
    );
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024,
  },
  fileFilter,
});

