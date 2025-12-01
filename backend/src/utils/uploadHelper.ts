import path from 'path';
import fs from 'fs/promises';
import { config } from '../config';
import { isS3Configured, uploadToS3, deleteFromS3 } from '../config/s3';
import { processImage, deleteImageVersions, ImageSizes } from './imageProcessor';
import { logInfo, logError, logDebug } from '../config/logger';

export interface UploadResult {
  url: string;
  cdnUrl?: string;
  sizes?: ImageSizes;
  key?: string;
}

/**
 * Faz upload de uma imagem (S3 ou local)
 */
export const uploadImage = async (
  file: Express.Multer.File,
  options: {
    folder?: string;
    processImage?: boolean;
    quality?: number;
    addWatermark?: boolean;
  } = {}
): Promise<UploadResult> => {
  const {
    folder = 'recipes',
    processImage: shouldProcess = true,
    quality = 85,
    addWatermark = false,
  } = options;

  try {
    logDebug('Starting image upload', {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      useS3: isS3Configured(),
    });

    // Se S3 estiver configurado, usar S3
    if (isS3Configured()) {
      const result = await uploadToS3(file, folder);
      
      logInfo('Image uploaded to S3', {
        key: result.key,
        url: result.url,
        cdnUrl: result.cdnUrl,
      });

      return {
        url: result.cdnUrl || result.url,
        cdnUrl: result.cdnUrl,
        key: result.key,
      };
    }

    // Caso contrário, usar storage local
    const uploadDir = path.join(process.cwd(), config.upload.dir);

    // Garantir que o diretório existe
    await fs.mkdir(uploadDir, { recursive: true });

    if (shouldProcess) {
      // Processar imagem gerando múltiplos tamanhos
      const sizes = await processImage(file.buffer, file.originalname, uploadDir, {
        quality,
        addWatermark,
      });

      logInfo('Image processed and saved locally', {
        filename: file.originalname,
        sizes: Object.keys(sizes),
      });

      return {
        url: sizes.large, // URL principal (large)
        sizes,
      };
    } else {
      // Salvar imagem original sem processar
      const filename = file.originalname;
      const filepath = path.join(uploadDir, filename);
      
      await fs.writeFile(filepath, file.buffer);

      logInfo('Image saved locally without processing', {
        filename,
        path: filepath,
      });

      return {
        url: `/uploads/${filename}`,
      };
    }
  } catch (error) {
    logError('Error uploading image', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Faz upload de múltiplas imagens
 */
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  options: {
    folder?: string;
    processImage?: boolean;
    quality?: number;
    addWatermark?: boolean;
  } = {}
): Promise<UploadResult[]> => {
  try {
    logInfo('Starting multiple images upload', { count: files.length });

    const uploadPromises = files.map((file) => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);

    logInfo('Multiple images uploaded successfully', {
      count: results.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
    });

    return results;
  } catch (error) {
    logError('Error uploading multiple images', error);
    throw new Error('Failed to upload multiple images');
  }
};

/**
 * Deleta uma imagem (S3 ou local)
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    logDebug('Starting image deletion', { imageUrl });

    // Se for URL do S3, deletar do S3
    if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('r2.cloudflarestorage.com')) {
      // Extrair key da URL
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(3).join('/'); // Remove domínio
      
      await deleteFromS3(key);
      
      logInfo('Image deleted from S3', { key });
      return;
    }

    // Caso contrário, deletar do storage local
    const uploadDir = path.join(process.cwd(), config.upload.dir);
    
    // Deletar todas as versões da imagem
    await deleteImageVersions(imageUrl, uploadDir);

    logInfo('Image deleted from local storage', { imageUrl });
  } catch (error) {
    logError('Error deleting image', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Deleta múltiplas imagens
 */
export const deleteMultipleImages = async (imageUrls: string[]): Promise<void> => {
  try {
    logInfo('Starting multiple images deletion', { count: imageUrls.length });

    const deletePromises = imageUrls.map((url) => deleteImage(url));
    await Promise.all(deletePromises);

    logInfo('Multiple images deleted successfully', { count: imageUrls.length });
  } catch (error) {
    logError('Error deleting multiple images', error);
    throw new Error('Failed to delete multiple images');
  }
};

/**
 * Atualiza uma imagem (deleta antiga e faz upload da nova)
 */
export const updateImage = async (
  oldImageUrl: string | null,
  newFile: Express.Multer.File,
  options: {
    folder?: string;
    processImage?: boolean;
    quality?: number;
    addWatermark?: boolean;
  } = {}
): Promise<UploadResult> => {
  try {
    logDebug('Starting image update', {
      oldImageUrl,
      newFilename: newFile.originalname,
    });

    // Fazer upload da nova imagem
    const result = await uploadImage(newFile, options);

    // Deletar imagem antiga (se existir)
    if (oldImageUrl) {
      try {
        await deleteImage(oldImageUrl);
      } catch (error) {
        // Log mas não falha se não conseguir deletar a antiga
        logError('Error deleting old image during update', error);
      }
    }

    logInfo('Image updated successfully', {
      oldUrl: oldImageUrl,
      newUrl: result.url,
    });

    return result;
  } catch (error) {
    logError('Error updating image', error);
    throw new Error('Failed to update image');
  }
};

/**
 * Verifica se uma imagem existe (local ou S3)
 */
export const imageExists = async (imageUrl: string): Promise<boolean> => {
  try {
    // Se for URL do S3, assumir que existe (S3 é confiável)
    if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('r2.cloudflarestorage.com')) {
      return true;
    }

    // Verificar no storage local
    const filename = path.basename(imageUrl);
    const filepath = path.join(process.cwd(), config.upload.dir, filename);

    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  } catch (error) {
    logError('Error checking if image exists', error);
    return false;
  }
};

/**
 * Obtém o tamanho de uma imagem
 */
export const getImageSize = async (imageUrl: string): Promise<number> => {
  try {
    // Se for URL do S3, não podemos obter o tamanho facilmente
    if (imageUrl.includes('s3.amazonaws.com') || imageUrl.includes('r2.cloudflarestorage.com')) {
      return 0;
    }

    // Obter tamanho do arquivo local
    const filename = path.basename(imageUrl);
    const filepath = path.join(process.cwd(), config.upload.dir, filename);

    const stats = await fs.stat(filepath);
    return stats.size;
  } catch (error) {
    logError('Error getting image size', error);
    return 0;
  }
};

/**
 * Lista todas as imagens no storage local
 */
export const listLocalImages = async (): Promise<string[]> => {
  try {
    const uploadDir = path.join(process.cwd(), config.upload.dir);
    
    try {
      const files = await fs.readdir(uploadDir);
      return files.filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      });
    } catch (error) {
      // Se o diretório não existir, retornar array vazio
      return [];
    }
  } catch (error) {
    logError('Error listing local images', error);
    return [];
  }
};

/**
 * Calcula o tamanho total do storage local
 */
export const getLocalStorageSize = async (): Promise<number> => {
  try {
    const files = await listLocalImages();
    const uploadDir = path.join(process.cwd(), config.upload.dir);

    let totalSize = 0;
    for (const file of files) {
      const filepath = path.join(uploadDir, file);
      try {
        const stats = await fs.stat(filepath);
        totalSize += stats.size;
      } catch {
        // Ignorar arquivos que não podem ser lidos
      }
    }

    return totalSize;
  } catch (error) {
    logError('Error calculating local storage size', error);
    return 0;
  }
};

/**
 * Formata tamanho de bytes para formato legível
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
