import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { logInfo, logError, logDebug } from '../config/logger';

export interface ImageSizes {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
}

export interface ProcessImageOptions {
  quality?: number;
  addWatermark?: boolean;
  watermarkText?: string;
}

/**
 * Processa uma imagem gerando múltiplos tamanhos otimizados
 */
export const processImage = async (
  buffer: Buffer,
  filename: string,
  uploadDir: string,
  options: ProcessImageOptions = {}
): Promise<ImageSizes> => {
  try {
    const { quality = 85, addWatermark = false, watermarkText = 'SaborConnect' } = options;

    // Garantir que o diretório existe
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(filename);
    const nameWithoutExt = path.basename(filename, ext);
    const timestamp = Date.now();

    logDebug('Processing image', {
      filename,
      size: buffer.length,
      quality,
      addWatermark,
    });

    // Obter metadados da imagem
    const metadata = await sharp(buffer).metadata();
    logDebug('Image metadata', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    });

    // Validar dimensões mínimas
    if (metadata.width && metadata.width < 400) {
      throw new Error('Image width must be at least 400px');
    }
    if (metadata.height && metadata.height < 300) {
      throw new Error('Image height must be at least 300px');
    }

    // Processar imagem base
    let imageProcessor = sharp(buffer)
      .rotate() // Auto-rotate baseado em EXIF
      .withMetadata({ orientation: undefined }); // Remove orientação EXIF

    // Adicionar watermark se solicitado
    if (addWatermark) {
      const watermarkSvg = Buffer.from(`
        <svg width="200" height="50">
          <style>
            .watermark { 
              fill: rgba(255, 255, 255, 0.5); 
              font-size: 20px; 
              font-family: Arial, sans-serif;
              font-weight: bold;
            }
          </style>
          <text x="10" y="30" class="watermark">${watermarkText}</text>
        </svg>
      `);

      imageProcessor = imageProcessor.composite([
        {
          input: watermarkSvg,
          gravity: 'southeast',
        },
      ]);
    }

    // Gerar thumbnail (300x200)
    const thumbnailFilename = `${nameWithoutExt}-${timestamp}-thumb.webp`;
    const thumbnailPath = path.join(uploadDir, thumbnailFilename);
    await imageProcessor
      .clone()
      .resize(300, 200, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: quality - 10 })
      .toFile(thumbnailPath);

    logDebug('Thumbnail created', { path: thumbnailPath });

    // Gerar medium (800x600)
    const mediumFilename = `${nameWithoutExt}-${timestamp}-medium.webp`;
    const mediumPath = path.join(uploadDir, mediumFilename);
    await imageProcessor
      .clone()
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(mediumPath);

    logDebug('Medium image created', { path: mediumPath });

    // Gerar large (1200x900)
    const largeFilename = `${nameWithoutExt}-${timestamp}-large.webp`;
    const largePath = path.join(uploadDir, largeFilename);
    await imageProcessor
      .clone()
      .resize(1200, 900, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(largePath);

    logDebug('Large image created', { path: largePath });

    // Salvar original otimizado
    const originalFilename = `${nameWithoutExt}-${timestamp}-original.webp`;
    const originalPath = path.join(uploadDir, originalFilename);
    await imageProcessor
      .clone()
      .webp({ quality: quality + 5 })
      .toFile(originalPath);

    logDebug('Original image saved', { path: originalPath });

    const result: ImageSizes = {
      thumbnail: `/uploads/${thumbnailFilename}`,
      medium: `/uploads/${mediumFilename}`,
      large: `/uploads/${largeFilename}`,
      original: `/uploads/${originalFilename}`,
    };

    logInfo('Image processed successfully', {
      filename,
      sizes: Object.keys(result),
      originalSize: buffer.length,
    });

    return result;
  } catch (error) {
    logError('Error processing image', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Deleta todas as versões de uma imagem
 */
export const deleteImageVersions = async (
  imageUrl: string,
  uploadDir: string
): Promise<void> => {
  try {
    // Extrair nome base do arquivo
    const filename = path.basename(imageUrl);
    const nameWithoutExt = filename.replace(/-(thumb|medium|large|original)\.webp$/, '');

    const versions = ['thumb', 'medium', 'large', 'original'];

    for (const version of versions) {
      const filepath = path.join(uploadDir, `${nameWithoutExt}-${version}.webp`);
      try {
        await fs.unlink(filepath);
        logDebug('Image version deleted', { filepath });
      } catch (error) {
        // Ignorar se arquivo não existir
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          logError('Error deleting image version', { filepath, error });
        }
      }
    }

    logInfo('All image versions deleted', { imageUrl });
  } catch (error) {
    logError('Error deleting image versions', error);
    throw new Error('Failed to delete image versions');
  }
};

/**
 * Limpa arquivos órfãos (imagens sem referência no banco)
 */
export const cleanOrphanedImages = async (
  uploadDir: string,
  validUrls: string[]
): Promise<number> => {
  try {
    logInfo('Starting orphaned images cleanup', { uploadDir });

    const files = await fs.readdir(uploadDir);
    let deletedCount = 0;

    for (const file of files) {
      const filepath = path.join(uploadDir, file);

      // Verificar se o arquivo está na lista de URLs válidas
      const isValid = validUrls.some((url) => url.includes(file));

      if (!isValid) {
        try {
          await fs.unlink(filepath);
          deletedCount++;
          logDebug('Orphaned image deleted', { filepath });
        } catch (error) {
          logError('Error deleting orphaned image', { filepath, error });
        }
      }
    }

    logInfo('Orphaned images cleanup completed', {
      totalFiles: files.length,
      deletedCount,
    });

    return deletedCount;
  } catch (error) {
    logError('Error cleaning orphaned images', error);
    throw new Error('Failed to clean orphaned images');
  }
};

/**
 * Valida se um arquivo é uma imagem válida
 */
export const validateImage = async (buffer: Buffer): Promise<boolean> => {
  try {
    const metadata = await sharp(buffer).metadata();
    return !!(metadata.width && metadata.height && metadata.format);
  } catch (error) {
    return false;
  }
};

/**
 * Obtém informações sobre uma imagem
 */
export const getImageInfo = async (
  buffer: Buffer
): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    };
  } catch (error) {
    logError('Error getting image info', error);
    throw new Error('Failed to get image info');
  }
};

/**
 * Redimensiona uma imagem para dimensões específicas
 */
export const resizeImage = async (
  buffer: Buffer,
  width: number,
  height: number,
  options: { fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'; quality?: number } = {}
): Promise<Buffer> => {
  try {
    const { fit = 'cover', quality = 85 } = options;

    return await sharp(buffer)
      .resize(width, height, { fit })
      .webp({ quality })
      .toBuffer();
  } catch (error) {
    logError('Error resizing image', error);
    throw new Error('Failed to resize image');
  }
};

/**
 * Converte imagem para WebP
 */
export const convertToWebP = async (
  buffer: Buffer,
  quality: number = 85
): Promise<Buffer> => {
  try {
    return await sharp(buffer).webp({ quality }).toBuffer();
  } catch (error) {
    logError('Error converting to WebP', error);
    throw new Error('Failed to convert to WebP');
  }
};

/**
 * Adiciona watermark a uma imagem
 */
export const addWatermark = async (
  buffer: Buffer,
  text: string,
  position: 'southeast' | 'southwest' | 'northeast' | 'northwest' = 'southeast'
): Promise<Buffer> => {
  try {
    const watermarkSvg = Buffer.from(`
      <svg width="200" height="50">
        <style>
          .watermark { 
            fill: rgba(255, 255, 255, 0.6); 
            font-size: 18px; 
            font-family: Arial, sans-serif;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          }
        </style>
        <text x="10" y="30" class="watermark">${text}</text>
      </svg>
    `);

    return await sharp(buffer)
      .composite([
        {
          input: watermarkSvg,
          gravity: position,
        },
      ])
      .toBuffer();
  } catch (error) {
    logError('Error adding watermark', error);
    throw new Error('Failed to add watermark');
  }
};
