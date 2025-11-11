import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logInfo, logError, logDebug } from './logger';
import crypto from 'crypto';
import path from 'path';

// Configuração do cliente S3 (compatível com R2)
const s3Config: any = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

// Suporte para CloudFlare R2 (endpoint customizado)
if (process.env.AWS_ENDPOINT_URL) {
  s3Config.endpoint = process.env.AWS_ENDPOINT_URL;
}

const s3Client = new S3Client(s3Config);

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'saborconnect-uploads';
const CDN_URL = process.env.CDN_URL || ''; // CloudFlare CDN URL (se configurado)

/**
 * Gera um nome único para o arquivo
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);

  // Remove caracteres especiais do nome
  const safeName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${safeName}-${timestamp}-${randomString}${extension}`;
};

/**
 * Determina o Content-Type baseado na extensão
 */
export const getContentType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };

  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Upload de arquivo para S3
 */
export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<{ key: string; url: string; cdnUrl?: string }> => {
  try {
    const fileName = generateUniqueFileName(file.originalname);
    const key = `${folder}/${fileName}`;

    logDebug('Uploading file to S3', {
      originalName: file.originalname,
      key,
      size: file.size,
      mimetype: file.mimetype,
    });

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: getContentType(file.originalname),
      ContentDisposition: 'inline',
      CacheControl: 'public, max-age=31536000', // 1 ano
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    // URL direta do S3
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    // URL do CDN (se configurado)
    const cdnUrl = CDN_URL ? `${CDN_URL}/${key}` : undefined;

    logInfo('File uploaded to S3 successfully', {
      key,
      url,
      cdnUrl,
      size: file.size,
    });

    return { key, url, cdnUrl };
  } catch (error) {
    logError('Error uploading file to S3', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Upload de múltiplos arquivos para S3
 */
export const uploadMultipleToS3 = async (
  files: Express.Multer.File[],
  folder: string = 'uploads'
): Promise<Array<{ key: string; url: string; cdnUrl?: string }>> => {
  try {
    const uploadPromises = files.map((file) => uploadToS3(file, folder));
    const results = await Promise.all(uploadPromises);

    logInfo('Multiple files uploaded to S3', {
      count: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
    });

    return results;
  } catch (error) {
    logError('Error uploading multiple files to S3', error);
    throw new Error('Failed to upload files to S3');
  }
};

/**
 * Deleta arquivo do S3
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    logDebug('Deleting file from S3', { key });

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    logInfo('File deleted from S3 successfully', { key });
  } catch (error) {
    logError('Error deleting file from S3', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Deleta múltiplos arquivos do S3
 */
export const deleteMultipleFromS3 = async (keys: string[]): Promise<void> => {
  try {
    const deletePromises = keys.map((key) => deleteFromS3(key));
    await Promise.all(deletePromises);

    logInfo('Multiple files deleted from S3', { count: keys.length });
  } catch (error) {
    logError('Error deleting multiple files from S3', error);
    throw new Error('Failed to delete files from S3');
  }
};

/**
 * Gera URL assinada para acesso temporário (se o bucket for privado)
 */
export const generateSignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

    logDebug('Generated signed URL', { key, expiresIn });

    return signedUrl;
  } catch (error) {
    logError('Error generating signed URL', error);
    throw new Error('Failed to generate signed URL');
  }
};

/**
 * Extrai a key do S3 de uma URL completa
 */
export const extractS3Key = (url: string): string | null => {
  try {
    // Tenta extrair de URL do S3
    const s3Pattern = new RegExp(`https://${BUCKET_NAME}\\.s3\\.[^/]+\\.amazonaws\\.com/(.+)`);
    const s3Match = url.match(s3Pattern);

    if (s3Match) {
      return s3Match[1];
    }

    // Tenta extrair de URL do CDN
    if (CDN_URL) {
      const cdnPattern = new RegExp(`${CDN_URL}/(.+)`);
      const cdnMatch = url.match(cdnPattern);

      if (cdnMatch) {
        return cdnMatch[1];
      }
    }

    return null;
  } catch (error) {
    logError('Error extracting S3 key from URL', error);
    return null;
  }
};

/**
 * Verifica se o S3 está configurado
 */
export const isS3Configured = (): boolean => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
};

logInfo('S3 client initialized', {
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: BUCKET_NAME,
  configured: isS3Configured(),
  cdnEnabled: !!CDN_URL,
});

export default s3Client;
