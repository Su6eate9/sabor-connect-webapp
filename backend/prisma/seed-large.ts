import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper para gerar dados aleatórios
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: readonly T[] | T[]): T => arr[randomInt(0, arr.length - 1)];

// Arrays de dados para gerar conteúdo variado
const firstNames = [
  'Ana',
  'Bruno',
  'Carlos',
  'Daniela',
  'Eduardo',
  'Fernanda',
  'Gabriel',
  'Helena',
  'Igor',
  'Julia',
  'Lucas',
  'Maria',
  'Nicolas',
  'Olivia',
  'Pedro',
  'Rafaela',
  'Samuel',
  'Tatiana',
  'Victor',
  'Yasmin',
];
const lastNames = [
  'Silva',
  'Santos',
  'Oliveira',
  'Souza',
  'Rodrigues',
  'Ferreira',
  'Alves',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Martins',
  'Carvalho',
  'Rocha',
  'Almeida',
  'Nascimento',
  'Araújo',
  'Melo',
  'Barbosa',
];

const recipeTypes = [
  'Sobremesa',
  'Prato Principal',
  'Entrada',
  'Lanche',
  'Bebida',
  'Salada',
  'Sopa',
  'Acompanhamento',
];
const cuisines = [
  'Brasileira',
  'Italiana',
  'Japonesa',
  'Mexicana',
  'Francesa',
  'Indiana',
  'Chinesa',
  'Tailandesa',
  'Árabe',
  'Americana',
];
const adjectives = [
  'Delicioso',
  'Especial',
  'Tradicional',
  'Caseiro',
  'Gourmet',
  'Rápido',
  'Fácil',
  'Cremoso',
  'Crocante',
  'Suculento',
];
const ingredients = [
  'Farinha de Trigo',
  'Açúcar',
  'Ovos',
  'Leite',
  'Manteiga',
  'Chocolate',
  'Arroz',
  'Feijão',
  'Carne',
  'Frango',
  'Peixe',
  'Tomate',
  'Cebola',
  'Alho',
  'Azeite',
  'Sal',
  'Pimenta',
  'Queijo',
  'Cream Cheese',
  'Iogurte',
  'Banana',
  'Maçã',
  'Laranja',
  'Limão',
  'Abacate',
  'Cenoura',
  'Batata',
  'Brócolis',
  'Espinafre',
  'Couve',
];
const units = [
  'g',
  'kg',
  'ml',
  'l',
  'xícara',
  'colher de sopa',
  'colher de chá',
  'unidade',
  'pitada',
  'a gosto',
];
const difficulties = ['EASY', 'MEDIUM', 'HARD'] as const;

const tagNames = [
  'Sobremesa',
  'Brasileira',
  'Rápida',
  'Fit',
  'Vegetariana',
  'Vegana',
  'Café da Manhã',
  'Almoço',
  'Jantar',
  'Italiana',
  'Japonesa',
  'Mexicana',
  'Francesa',
  'Low Carb',
  'Sem Glúten',
  'Sem Lactose',
  'Proteico',
  'Lanche',
  'Aperitivo',
  'Festa',
  'Diet',
  'Light',
  'Comfort Food',
  'Gourmet',
  'Caseira',
];

async function generateLargeDataset() {
  console.log('🚀 Starting large scale data generation...\n');
  const startTime = Date.now();

  try {
    // 1. Criar Tags (25 tags)
    console.log('📌 Creating tags...');
    const tags = await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({
          where: { slug: name.toLowerCase().replace(/\s+/g, '-') },
          update: {},
          create: {
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
          },
        })
      )
    );
    console.log(`✅ Created ${tags.length} tags\n`);

    // 2. Criar Usuários em lotes (50.000 usuários)
    console.log('👥 Creating users...');
    const userCount = 50000;
    const userBatchSize = 1000;
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userIds: string[] = [];

    for (let i = 0; i < userCount; i += userBatchSize) {
      const batch = [];
      for (let j = 0; j < userBatchSize && i + j < userCount; j++) {
        const index = i + j;
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        batch.push({
          name: `${firstName} ${lastName}`,
          email: `user${index}@example.com`,
          passwordHash: hashedPassword,
          bio: randomInt(0, 2) === 0 ? `Amante da culinária ${randomElement(cuisines)}` : null,
        });
      }

      const result = await prisma.user.createManyAndReturn({
        data: batch,
        select: { id: true },
      });

      userIds.push(...result.map((u) => u.id));

      if ((i + userBatchSize) % 10000 === 0 || i + userBatchSize >= userCount) {
        console.log(`   Created ${Math.min(i + userBatchSize, userCount)}/${userCount} users`);
      }
    }
    console.log(`✅ Created ${userIds.length} users\n`);

    // 3. Criar Receitas em lotes (30.000 receitas)
    console.log('📖 Creating recipes...');
    const recipeCount = 30000;
    const recipeBatchSize = 500;
    const recipeIds: string[] = [];

    for (let i = 0; i < recipeCount; i += recipeBatchSize) {
      const batch = [];
      for (let j = 0; j < recipeBatchSize && i + j < recipeCount; j++) {
        const index = i + j;
        const type = randomElement(recipeTypes);
        const cuisine = randomElement(cuisines);
        const adjective = randomElement(adjectives);
        const title = `${adjective} ${type} ${cuisine} ${index}`;

        batch.push({
          title,
          slug: `${title.toLowerCase().replace(/\s+/g, '-')}-${index}`,
          description: `Uma deliciosa receita de ${type.toLowerCase()} da culinária ${cuisine.toLowerCase()}. Perfeito para qualquer ocasião!`,
          prepTimeMinutes: randomInt(5, 60),
          cookTimeMinutes: randomInt(10, 120),
          difficulty: randomElement(difficulties),
          portions: randomInt(2, 12),
          instructions: [
            'Prepare todos os ingredientes.',
            'Misture os ingredientes secos.',
            'Adicione os ingredientes líquidos.',
            'Cozinhe em fogo médio até o ponto desejado.',
            'Sirva quente ou frio, conforme preferir.',
          ],
          viewCount: randomInt(0, 1000),
          authorId: randomElement(userIds),
        });
      }

      const result = await prisma.recipe.createManyAndReturn({
        data: batch,
        select: { id: true },
      });

      recipeIds.push(...result.map((r) => r.id));

      if ((i + recipeBatchSize) % 5000 === 0 || i + recipeBatchSize >= recipeCount) {
        console.log(
          `   Created ${Math.min(i + recipeBatchSize, recipeCount)}/${recipeCount} recipes`
        );
      }
    }
    console.log(`✅ Created ${recipeIds.length} recipes\n`);

    // 4. Criar Ingredientes (5 por receita = 150.000 ingredientes)
    console.log('🥕 Creating ingredients...');
    const ingredientBatchSize = 2000;
    let totalIngredients = 0;

    for (let i = 0; i < recipeIds.length; i += ingredientBatchSize / 5) {
      const batch = [];
      const recipeBatch = recipeIds.slice(i, i + ingredientBatchSize / 5);

      for (const recipeId of recipeBatch) {
        const numIngredients = randomInt(3, 8);
        for (let j = 0; j < numIngredients; j++) {
          batch.push({
            name: randomElement(ingredients),
            quantity: `${randomInt(1, 500)}`,
            unit: randomElement(units),
            recipeId,
          });
        }
      }

      await prisma.ingredient.createMany({ data: batch });
      totalIngredients += batch.length;

      if (
        totalIngredients % 20000 < batch.length ||
        i + ingredientBatchSize / 5 >= recipeIds.length
      ) {
        console.log(`   Created ${totalIngredients} ingredients`);
      }
    }
    console.log(`✅ Created ${totalIngredients} ingredients\n`);

    // 5. Criar RecipeTags (2-4 tags por receita = ~90.000 relações)
    console.log('🏷️  Creating recipe-tag relations...');
    const recipeTagBatchSize = 2000;
    let totalRecipeTags = 0;

    for (let i = 0; i < recipeIds.length; i += recipeTagBatchSize) {
      const batch = [];
      const recipeBatch = recipeIds.slice(i, i + recipeTagBatchSize);

      for (const recipeId of recipeBatch) {
        const numTags = randomInt(2, 4);
        const selectedTags = new Set<string>();

        while (selectedTags.size < numTags) {
          selectedTags.add(randomElement(tags).id);
        }

        for (const tagId of selectedTags) {
          batch.push({ recipeId, tagId });
        }
      }

      await prisma.recipeTag.createMany({ data: batch, skipDuplicates: true });
      totalRecipeTags += batch.length;

      if (totalRecipeTags % 10000 < batch.length || i + recipeTagBatchSize >= recipeIds.length) {
        console.log(`   Created ${totalRecipeTags} recipe-tag relations`);
      }
    }
    console.log(`✅ Created ${totalRecipeTags} recipe-tag relations\n`);

    // 6. Criar Likes (20% dos usuários curtem em média 10 receitas = 100.000 likes)
    console.log('❤️  Creating likes...');
    const likeUsers = userIds.slice(0, Math.floor(userIds.length * 0.2));
    const likeBatchSize = 2000;
    let totalLikes = 0;

    for (let i = 0; i < likeUsers.length; i += likeBatchSize / 10) {
      const batch = [];
      const userBatch = likeUsers.slice(i, i + likeBatchSize / 10);

      for (const userId of userBatch) {
        const numLikes = randomInt(5, 15);
        const likedRecipes = new Set<string>();

        while (likedRecipes.size < numLikes) {
          likedRecipes.add(randomElement(recipeIds));
        }

        for (const recipeId of likedRecipes) {
          batch.push({ userId, recipeId });
        }
      }

      await prisma.like.createMany({ data: batch, skipDuplicates: true });
      totalLikes += batch.length;

      if (totalLikes % 10000 < batch.length || i + likeBatchSize / 10 >= likeUsers.length) {
        console.log(`   Created ${totalLikes} likes`);
      }
    }
    console.log(`✅ Created ${totalLikes} likes\n`);

    // 7. Criar Favoritos (15% dos usuários favoritam em média 8 receitas = 60.000 favoritos)
    console.log('⭐ Creating favorites...');
    const favoriteUsers = userIds.slice(0, Math.floor(userIds.length * 0.15));
    const favoriteBatchSize = 2000;
    let totalFavorites = 0;

    for (let i = 0; i < favoriteUsers.length; i += favoriteBatchSize / 8) {
      const batch = [];
      const userBatch = favoriteUsers.slice(i, i + favoriteBatchSize / 8);

      for (const userId of userBatch) {
        const numFavorites = randomInt(3, 12);
        const favoritedRecipes = new Set<string>();

        while (favoritedRecipes.size < numFavorites) {
          favoritedRecipes.add(randomElement(recipeIds));
        }

        for (const recipeId of favoritedRecipes) {
          batch.push({ userId, recipeId });
        }
      }

      await prisma.favorite.createMany({ data: batch, skipDuplicates: true });
      totalFavorites += batch.length;

      if (
        totalFavorites % 10000 < batch.length ||
        i + favoriteBatchSize / 8 >= favoriteUsers.length
      ) {
        console.log(`   Created ${totalFavorites} favorites`);
      }
    }
    console.log(`✅ Created ${totalFavorites} favorites\n`);

    // 8. Criar Comentários (10% das receitas têm comentários, média de 3 = 9.000 comentários)
    console.log('💬 Creating comments...');
    const commentRecipes = recipeIds.slice(0, Math.floor(recipeIds.length * 0.1));
    const commentBatchSize = 1000;
    let totalComments = 0;

    const commentTexts = [
      'Receita incrível! Ficou perfeito!',
      'Muito bom, toda a família adorou.',
      'Fácil de fazer e delicioso!',
      'Vou fazer de novo com certeza.',
      'Excelente receita, muito saborosa.',
      'Ficou maravilhoso, obrigado por compartilhar!',
      'Adorei! Super recomendo.',
      'Fiz hoje e ficou ótimo!',
    ];

    for (let i = 0; i < commentRecipes.length; i += commentBatchSize / 3) {
      const batch = [];
      const recipeBatch = commentRecipes.slice(i, i + commentBatchSize / 3);

      for (const recipeId of recipeBatch) {
        const numComments = randomInt(1, 5);

        for (let j = 0; j < numComments; j++) {
          batch.push({
            content: randomElement(commentTexts),
            authorId: randomElement(userIds),
            recipeId,
          });
        }
      }

      await prisma.comment.createMany({ data: batch });
      totalComments += batch.length;

      if (
        totalComments % 2000 < batch.length ||
        i + commentBatchSize / 3 >= commentRecipes.length
      ) {
        console.log(`   Created ${totalComments} comments`);
      }
    }
    console.log(`✅ Created ${totalComments} comments\n`);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n🎉 Large scale data generation completed!\n');
    console.log('📊 Summary:');
    console.log(`   Users:          ${userIds.length.toLocaleString()}`);
    console.log(`   Recipes:        ${recipeIds.length.toLocaleString()}`);
    console.log(`   Ingredients:    ${totalIngredients.toLocaleString()}`);
    console.log(`   Tags:           ${tags.length}`);
    console.log(`   Recipe-Tags:    ${totalRecipeTags.toLocaleString()}`);
    console.log(`   Likes:          ${totalLikes.toLocaleString()}`);
    console.log(`   Favorites:      ${totalFavorites.toLocaleString()}`);
    console.log(`   Comments:       ${totalComments.toLocaleString()}`);
    console.log(
      `   Total Records:  ${(userIds.length + recipeIds.length + totalIngredients + tags.length + totalRecipeTags + totalLikes + totalFavorites + totalComments).toLocaleString()}`
    );
    console.log(`\n⏱️  Time taken: ${duration} minutes`);
  } catch (error) {
    console.error('❌ Error generating data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
generateLargeDataset().catch((error) => {
  console.error(error);
  process.exit(1);
});
