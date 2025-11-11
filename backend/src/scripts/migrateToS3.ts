import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { uploadToS3, isS3Configured } from '../config/s3';
import { logInfo, logError, logDebug } from '../config/logger';

const prisma = new PrismaClient();

interface MigrationStats {
  total: number;
  migrated: number;
  failed: number;
  skipped: number;
  errors: Array<{ url: string; error: string }>;
}

/**
 * Migra imagens locais para S3
 */
async function migrateImagesToS3() {
  if (!isS3Configured()) {
    console.error('❌ AWS S3 não está configurado!');
    console.log('Configure as seguintes variáveis de ambiente:');
    console.log('  - AWS_ACCESS_KEY_ID');
    console.log('  - AWS_SECRET_ACCESS_KEY');
    console.log('  - AWS_REGION');
    console.log('  - AWS_S3_BUCKET');
    process.exit(1);
  }

  console.log('🚀 Iniciando migração de imagens para S3...\n');

  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // 1. Migrar imagens de receitas
    console.log('📝 Migrando imagens de receitas...');
    await migrateRecipeImages(stats);

    // 2. Migrar avatares de usuários
    console.log('\n👤 Migrando avatares de usuários...');
    await migrateUserAvatars(stats);

    // 3. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de imagens:     ${stats.total}`);
    console.log(`✅ Migradas:          ${stats.migrated}`);
    console.log(`⏭️  Puladas:           ${stats.skipped}`);
    console.log(`❌ Falhas:            ${stats.failed}`);
    console.log('='.repeat(60));

    if (stats.errors.length > 0) {
      console.log('\n❌ Erros encontrados:');
      stats.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.url}`);
        console.log(`     Erro: ${error.error}`);
      });
    }

    if (stats.migrated > 0) {
      console.log('\n✅ Migração concluída com sucesso!');
      console.log('💡 Dica: Teste a aplicação e depois delete as imagens locais antigas.');
    }
  } catch (error) {
    console.error('\n❌ Erro fatal durante migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Migra imagens de receitas
 */
async function migrateRecipeImages(stats: MigrationStats) {
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      image: true,
    },
  });

  for (const recipe of recipes) {
    if (!recipe.image) {
      continue;
    }

    stats.total++;

    // Se já é URL do S3 ou CDN, pula
    if (recipe.image.includes('.s3.') || recipe.image.includes('cloudflare')) {
      logDebug('Image already on S3/CDN, skipping', { recipeId: recipe.id, image: recipe.image });
      stats.skipped++;
      continue;
    }

    try {
      // Tenta carregar arquivo local
      const localPath = path.join(
        process.env.UPLOAD_DIR || './uploads',
        recipe.image.replace(/^\/uploads\//, '')
      );

      const fileBuffer = await fs.readFile(localPath);
      const fileName = path.basename(localPath);

      // Cria objeto Multer.File mock
      const file: Express.Multer.File = {
        fieldname: 'image',
        originalname: fileName,
        encoding: '7bit',
        mimetype: getMimeType(fileName),
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: null as any,
        destination: '',
        filename: fileName,
        path: localPath,
      };

      // Upload para S3
      const { url, cdnUrl } = await uploadToS3(file, 'recipes');
      const newUrl = cdnUrl || url;

      // Atualiza banco de dados
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { image: newUrl },
      });

      logInfo('Recipe image migrated', {
        recipeId: recipe.id,
        oldUrl: recipe.image,
        newUrl,
      });

      stats.migrated++;
      console.log(`  ✅ Receita ${recipe.id}: ${fileName} → S3`);
    } catch (error: any) {
      logError('Failed to migrate recipe image', error);
      stats.failed++;
      stats.errors.push({
        url: recipe.image,
        error: error.message,
      });
      console.log(`  ❌ Receita ${recipe.id}: ${error.message}`);
    }
  }
}

/**
 * Migra avatares de usuários
 */
async function migrateUserAvatars(stats: MigrationStats) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      avatar: true,
    },
  });

  for (const user of users) {
    if (!user.avatar) {
      continue;
    }

    stats.total++;

    // Se já é URL do S3 ou CDN, pula
    if (user.avatar.includes('.s3.') || user.avatar.includes('cloudflare')) {
      logDebug('Avatar already on S3/CDN, skipping', { userId: user.id, avatar: user.avatar });
      stats.skipped++;
      continue;
    }

    try {
      // Tenta carregar arquivo local
      const localPath = path.join(
        process.env.UPLOAD_DIR || './uploads',
        user.avatar.replace(/^\/uploads\//, '')
      );

      const fileBuffer = await fs.readFile(localPath);
      const fileName = path.basename(localPath);

      // Cria objeto Multer.File mock
      const file: Express.Multer.File = {
        fieldname: 'avatar',
        originalname: fileName,
        encoding: '7bit',
        mimetype: getMimeType(fileName),
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: null as any,
        destination: '',
        filename: fileName,
        path: localPath,
      };

      // Upload para S3
      const { url, cdnUrl } = await uploadToS3(file, 'avatars');
      const newUrl = cdnUrl || url;

      // Atualiza banco de dados
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: newUrl },
      });

      logInfo('User avatar migrated', {
        userId: user.id,
        oldUrl: user.avatar,
        newUrl,
      });

      stats.migrated++;
      console.log(`  ✅ Usuário ${user.id}: ${fileName} → S3`);
    } catch (error: any) {
      logError('Failed to migrate user avatar', error);
      stats.failed++;
      stats.errors.push({
        url: user.avatar,
        error: error.message,
      });
      console.log(`  ❌ Usuário ${user.id}: ${error.message}`);
    }
  }
}

/**
 * Determina MIME type baseado na extensão
 */
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Executa a migração
migrateImagesToS3().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
