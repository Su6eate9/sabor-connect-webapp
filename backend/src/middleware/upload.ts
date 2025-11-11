import multer from 'multer';
import { Request } from 'express';
import { config } from '../config';
import { ValidationError } from '../utils/errors';
import { isS3Configured } from '../config/s3';

// Use memoryStorage para S3 (armazena em buffer)
// Se S3 não estiver configurado, pode usar diskStorage como fallback
const storage = multer.memoryStorage();

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
  },
});

// Log da configuração
if (isS3Configured()) {
  console.log('✅ Upload configurado para usar AWS S3');
} else {
  console.log('⚠️ AWS S3 não configurado - usando storage local como fallback');
}
