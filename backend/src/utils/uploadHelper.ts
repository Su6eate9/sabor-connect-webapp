import { Request } from 'express';
import fs from 'fs/promises';
import path from 'path';
import {
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  deleteMultipleFromS3,
  extractS3Key,
  isS3Configured,
} from '../config/s3';
import { logInfo, logError, logDebug } from '../config/logger';
import { config } from '../config';

interface UploadResult {
  url: string;
  key?: string;
  cdnUrl?: string;
}

/**
 * Faz upload de um arquivo (S3 ou local)
 */
export const uploadFile = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    // Se S3 estiver configurado, usa S3
    if (isS3Configured()) {
      const { url, key, cdnUrl } = await uploadToS3(file, folder);
      return { url: cdnUrl || url, key, cdnUrl };
    }

    // Fallback para storage local
    logDebug('Using local storage (S3 not configured)');

    const uploadDir = path.join(config.upload.dir, folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);

    const url = `/uploads/${folder}/${filename}`;

    logInfo('File uploaded locally', { url, size: file.size });

    return { url };
  } catch (error) {
    logError('Error uploading file', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Faz upload de múltiplos arquivos
 */
export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  folder: string = 'uploads'
): Promise<UploadResult[]> => {
  try {
    // Se S3 estiver configurado, usa S3
    if (isS3Configured()) {
      const results = await uploadMultipleToS3(files, folder);
      return results.map(({ url, key, cdnUrl }) => ({
        url: cdnUrl || url,
        key,
        cdnUrl,
      }));
    }

    // Fallback para storage local
    const uploadPromises = files.map((file) => uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    logError('Error uploading multiple files', error);
    throw new Error('Failed to upload files');
  }
};

/**
 * Deleta um arquivo (S3 ou local)
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Se for URL do S3, deleta do S3
    if (isS3Configured() && (url.includes('.s3.') || url.includes('cloudflare'))) {
      const key = extractS3Key(url);

      if (key) {
        await deleteFromS3(key);
        logInfo('File deleted from S3', { key });
        return;
      }
    }

    // Fallback para storage local
    logDebug('Using local storage for deletion');

    // Remove o prefixo /uploads/ da URL
    const relativePath = url.replace(/^\/uploads\//, '');
    const filepath = path.join(config.upload.dir, relativePath);

    try {
      await fs.unlink(filepath);
      logInfo('File deleted locally', { filepath });
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      logDebug('File not found (already deleted?)', { filepath });
    }
  } catch (error) {
    logError('Error deleting file', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Deleta múltiplos arquivos
 */
export const deleteMultipleFiles = async (urls: string[]): Promise<void> => {
  try {
    // Se S3 estiver configurado e todas URLs forem do S3
    if (
      isS3Configured() &&
      urls.every((url) => url.includes('.s3.') || url.includes('cloudflare'))
    ) {
      const keys = urls.map(extractS3Key).filter((key): key is string => key !== null);

      if (keys.length > 0) {
        await deleteMultipleFromS3(keys);
        logInfo('Files deleted from S3', { count: keys.length });
        return;
      }
    }

    // Fallback para storage local
    const deletePromises = urls.map((url) => deleteFile(url));
    await Promise.all(deletePromises);

    logInfo('Files deleted locally', { count: urls.length });
  } catch (error) {
    logError('Error deleting multiple files', error);
    throw new Error('Failed to delete files');
  }
};

/**
 * Middleware para processar upload e salvar URL
 */
export const processUpload = async (
  req: Request,
  _fieldName: string,
  folder: string = 'uploads'
) => {
  const file = req.file;

  if (!file) {
    return null;
  }

  const result = await uploadFile(file, folder);
  return result.url;
};

/**
 * Middleware para processar múltiplos uploads
 */
export const processMultipleUploads = async (
  req: Request,
  _fieldName: string,
  folder: string = 'uploads'
) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return [];
  }

  const results = await uploadMultipleFiles(files, folder);
  return results.map((r) => r.url);
};

export default {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
  processUpload,
  processMultipleUploads,
};
