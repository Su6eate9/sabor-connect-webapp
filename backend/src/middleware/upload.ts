import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';
import { ValidationError } from '../utils/errors';
import { isS3Configured } from '../config/s3';
import { logInfo, logWarn } from '../config/logger';

// Sempre usar memoryStorage para processar com Sharp
const storage = multer.memoryStorage();

// Gera nome único para arquivo
const generateFileName = (originalname: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalname);
  const nameWithoutExt = path.basename(originalname, ext);
  
  // Remove caracteres especiais e limita tamanho
  const safeName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  return `${safeName}-${timestamp}-${randomString}${ext}`;
};

// File filter com validação mais robusta
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Validar MIME type
  if (!config.upload.allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new ValidationError(
        'Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.'
      )
    );
  }

  // Validar extensão do arquivo
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(
      new ValidationError(
        'Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed.'
      )
    );
  }

  // Sanitizar nome do arquivo
  file.originalname = generateFileName(file.originalname);

  cb(null, true);
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize, // 5MB
    files: 1, // Apenas 1 arquivo por vez
  },
});

// Upload múltiplo (até 5 imagens)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
    files: 5,
  },
});

// Helper para obter URL da imagem
export const getImageUrl = (filename: string | null): string | null => {
  if (!filename) return null;
  
  // Se for URL completa, retornar como está
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // Se for caminho relativo, adicionar /uploads
  if (!filename.startsWith('/')) {
    return `/uploads/${filename}`;
  }
  
  return filename;
};

// Helper para extrair nome do arquivo da URL
export const extractFilename = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    // Remover query params e hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Extrair nome do arquivo
    const parts = cleanUrl.split('/');
    return parts[parts.length - 1];
  } catch (error) {
    return null;
  }
};

// Log da configuração
if (isS3Configured()) {
  logInfo('Upload configured to use AWS S3/R2');
} else {
  logWarn('AWS S3 not configured - using local storage as fallback');
}

export default upload;
