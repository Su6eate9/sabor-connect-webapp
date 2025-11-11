import { PrismaClient, Difficulty } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  console.log('Creating users...');
  const user1 = await prisma.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      name: 'Maria Silva',
      email: 'maria@example.com',
      passwordHash: await hashPassword('password123'),
      bio: 'Apaixonada por culinária brasileira e receitas caseiras.',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'joao@example.com' },
    update: {},
    create: {
      name: 'João Santos',
      email: 'joao@example.com',
      passwordHash: await hashPassword('password123'),
      bio: 'Chef amador, sempre experimentando novos sabores.',
    },
  });

  console.log('✅ Users created');

  // Create tags
  console.log('Creating tags...');
  const tagsData = [
    'Brasileira',
    'Italiana',
    'Sobremesa',
    'Vegana',
    'Vegetariana',
    'Sem Glúten',
    'Fit',
    'Rápida',
    'Café da Manhã',
    'Almoço',
    'Jantar',
    'Lanche',
  ];

  const tags = await Promise.all(
    tagsData.map((tagName) =>
      prisma.tag.upsert({
        where: { slug: slugify(tagName, { lower: true, strict: true }) },
        update: {},
        create: {
          name: tagName,
          slug: slugify(tagName, { lower: true, strict: true }),
        },
      })
    )
  );

  console.log('✅ Tags created');

  // Create recipes
  console.log('Creating recipes...');

  const recipes = [
    {
      title: 'Brigadeiro Tradicional',
      description:
        'O clássico doce brasileiro, perfeito para festas e comemorações. Cremoso e delicioso!',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      difficulty: Difficulty.EASY,
      portions: 20,
      instructions: [
        'Em uma panela, misture o leite condensado, o chocolate em pó e a manteiga.',
        'Cozinhe em fogo médio, mexendo sempre, até desgrudar do fundo da panela.',
        'Deixe esfriar e modele as bolinhas.',
        'Passe no chocolate granulado e sirva em forminhas.',
      ],
      ingredients: [
        { name: 'Leite condensado', quantity: '1', unit: 'lata' },
        { name: 'Chocolate em pó', quantity: '3', unit: 'colheres de sopa' },
        { name: 'Manteiga', quantity: '1', unit: 'colher de sopa' },
        { name: 'Chocolate granulado', quantity: '100', unit: 'g' },
      ],
      tags: ['Sobremesa', 'Brasileira', 'Rápida'],
      authorId: user1.id,
    },
    {
      title: 'Feijoada Completa',
      description:
        'A tradicional feijoada brasileira com todos os acompanhamentos. Ideal para reunir a família!',
      prepTimeMinutes: 30,
      cookTimeMinutes: 180,
      difficulty: Difficulty.HARD,
      portions: 8,
      instructions: [
        'Deixe o feijão de molho na véspera.',
        'Cozinhe o feijão com as carnes defumadas e salgadas.',
        'Adicione temperos a gosto e deixe cozinhar por cerca de 3 horas.',
        'Sirva com arroz, couve, farofa e laranja.',
      ],
      ingredients: [
        { name: 'Feijão preto', quantity: '500', unit: 'g' },
        { name: 'Linguiça calabresa', quantity: '300', unit: 'g' },
        { name: 'Costela de porco', quantity: '500', unit: 'g' },
        { name: 'Bacon', quantity: '200', unit: 'g' },
        { name: 'Cebola', quantity: '2', unit: 'unidades' },
        { name: 'Alho', quantity: '6', unit: 'dentes' },
      ],
      tags: ['Brasileira', 'Almoço', 'Jantar'],
      authorId: user2.id,
    },
    {
      title: 'Salada Caesar Vegana',
      description:
        'Versão vegana da clássica salada caesar, leve e nutritiva!',
      prepTimeMinutes: 15,
      cookTimeMinutes: 0,
      difficulty: Difficulty.EASY,
      portions: 4,
      instructions: [
        'Lave e corte as folhas de alface.',
        'Prepare o molho batendo no liquidificador todos os ingredientes.',
        'Misture a alface com o molho e os croutons.',
        'Sirva imediatamente.',
      ],
      ingredients: [
        { name: 'Alface romana', quantity: '1', unit: 'maço' },
        { name: 'Croutons', quantity: '100', unit: 'g' },
        { name: 'Castanha de caju', quantity: '1/2', unit: 'xícara' },
        { name: 'Limão', quantity: '2', unit: 'unidades' },
        { name: 'Azeite', quantity: '4', unit: 'colheres de sopa' },
      ],
      tags: ['Vegana', 'Vegetariana', 'Fit', 'Rápida'],
      authorId: user1.id,
    },
    {
      title: 'Panquecas Americanas',
      description:
        'Panquecas fofas e deliciosas para um café da manhã especial!',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      difficulty: Difficulty.EASY,
      portions: 4,
      instructions: [
        'Misture todos os ingredientes secos.',
        'Adicione os ingredientes líquidos e misture até ficar homogêneo.',
        'Aqueça uma frigideira antiaderente.',
        'Despeje pequenas porções da massa e cozinhe até dourar dos dois lados.',
      ],
      ingredients: [
        { name: 'Farinha de trigo', quantity: '2', unit: 'xícaras' },
        { name: 'Açúcar', quantity: '2', unit: 'colheres de sopa' },
        { name: 'Fermento em pó', quantity: '1', unit: 'colher de sopa' },
        { name: 'Leite', quantity: '1 1/2', unit: 'xícara' },
        { name: 'Ovos', quantity: '2', unit: 'unidades' },
        { name: 'Manteiga derretida', quantity: '3', unit: 'colheres de sopa' },
      ],
      tags: ['Café da Manhã', 'Sobremesa', 'Rápida'],
      authorId: user2.id,
    },
    {
      title: 'Risoto de Cogumelos',
      description:
        'Cremoso risoto italiano com cogumelos frescos. Sofisticado e delicioso!',
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      difficulty: Difficulty.MEDIUM,
      portions: 4,
      instructions: [
        'Refogue a cebola e o alho no azeite.',
        'Adicione o arroz e torre por 2 minutos.',
        'Vá adicionando o caldo quente aos poucos, mexendo sempre.',
        'Acrescente os cogumelos e finalize com manteiga e queijo.',
      ],
      ingredients: [
        { name: 'Arroz arbóreo', quantity: '300', unit: 'g' },
        { name: 'Cogumelos variados', quantity: '400', unit: 'g' },
        { name: 'Caldo de legumes', quantity: '1', unit: 'litro' },
        { name: 'Vinho branco', quantity: '1/2', unit: 'xícara' },
        { name: 'Queijo parmesão', quantity: '100', unit: 'g' },
        { name: 'Manteiga', quantity: '2', unit: 'colheres de sopa' },
      ],
      tags: ['Italiana', 'Vegetariana', 'Jantar'],
      authorId: user1.id,
    },
  ];

  for (const recipeData of recipes) {
    const { tags: recipeTags, ingredients, ...recipeInfo } = recipeData;
    const slug = slugify(recipeInfo.title, { lower: true, strict: true });

    await prisma.recipe.upsert({
      where: { slug },
      update: {},
      create: {
        ...recipeInfo,
        slug,
        ingredients: {
          create: ingredients,
        },
        tags: {
          create: recipeTags.map((tagName) => ({
            tag: {
              connect: {
                slug: slugify(tagName, { lower: true, strict: true }),
              },
            },
          })),
        },
      },
    });
  }

  console.log('✅ Recipes created');

  // Create some interactions
  console.log('Creating interactions...');

  const allRecipes = await prisma.recipe.findMany();

  // Add likes
  await prisma.like.createMany({
    data: [
      { userId: user1.id, recipeId: allRecipes[1].id },
      { userId: user1.id, recipeId: allRecipes[3].id },
      { userId: user2.id, recipeId: allRecipes[0].id },
      { userId: user2.id, recipeId: allRecipes[2].id },
    ],
    skipDuplicates: true,
  });

  // Add favorites
  await prisma.favorite.createMany({
    data: [
      { userId: user1.id, recipeId: allRecipes[1].id },
      { userId: user2.id, recipeId: allRecipes[0].id },
    ],
    skipDuplicates: true,
  });

  // Add comments
  await prisma.comment.createMany({
    data: [
      {
        content: 'Ficou perfeito! A família adorou!',
        authorId: user1.id,
        recipeId: allRecipes[1].id,
      },
      {
        content: 'Muito bom, vou fazer de novo com certeza.',
        authorId: user2.id,
        recipeId: allRecipes[0].id,
      },
    ],
  });

  console.log('✅ Interactions created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
