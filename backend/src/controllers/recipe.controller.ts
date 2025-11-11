import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import {
  createRecipeSchema,
  updateRecipeSchema,
  CreateRecipeInput,
  UpdateRecipeInput,
} from '../validators/recipe.validator';
import { config } from '../config';

export const getRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      tags,
      difficulty,
      page = '1',
      limit = config.pagination.defaultLimit.toString(),
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(
      parseInt(limit as string, 10),
      config.pagination.maxLimit
    );
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      where.tags = {
        some: {
          tag: {
            slug: { in: tagArray },
          },
        },
      };
    }

    // Get recipes with counts
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: order },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(
      res,
      recipes.map((recipe) => ({
        ...recipe,
        tags: recipe.tags.map((rt) => rt.tag),
      })),
      200,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            bio: true,
          },
        },
        ingredients: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundError('Recipe');
    }

    // Increment view count
    await prisma.recipe.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return sendSuccess(res, {
      ...recipe,
      tags: recipe.tags.map((rt) => rt.tag),
    });
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const data = createRecipeSchema.parse(req.body) as CreateRecipeInput;

    // Generate slug
    const slug = slugify(data.title, { lower: true, strict: true });

    // Handle cover image from upload
    const coverImageUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : null;

    // Create recipe with ingredients and tags
    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        prepTimeMinutes: data.prepTimeMinutes,
        cookTimeMinutes: data.cookTimeMinutes,
        difficulty: data.difficulty,
        portions: data.portions,
        instructions: data.instructions,
        coverImageUrl,
        authorId: userId,
        ingredients: {
          create: data.ingredients,
        },
        tags: {
          create: data.tags?.map((tagName) => ({
            tag: {
              connectOrCreate: {
                where: { slug: slugify(tagName, { lower: true, strict: true }) },
                create: {
                  name: tagName,
                  slug: slugify(tagName, { lower: true, strict: true }),
                },
              },
            },
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        ingredients: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return sendSuccess(
      res,
      {
        ...recipe,
        tags: recipe.tags.map((rt) => rt.tag),
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const data = updateRecipeSchema.parse(req.body) as UpdateRecipeInput;

    // Check if recipe exists and user is author
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new NotFoundError('Recipe');
    }

    if (existingRecipe.authorId !== userId) {
      throw new AuthorizationError();
    }

    // Update recipe
    const updateData: any = { ...data };

    if (data.title) {
      updateData.slug = slugify(data.title, { lower: true, strict: true });
    }

    if ((req as any).file) {
      updateData.coverImageUrl = `/uploads/${(req as any).file.filename}`;
    }

    // Handle ingredients update
    if (data.ingredients) {
      await prisma.ingredient.deleteMany({
        where: { recipeId: id },
      });
      updateData.ingredients = {
        create: data.ingredients,
      };
    }

    // Handle tags update
    if (data.tags) {
      await prisma.recipeTag.deleteMany({
        where: { recipeId: id },
      });
      updateData.tags = {
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { slug: slugify(tagName, { lower: true, strict: true }) },
              create: {
                name: tagName,
                slug: slugify(tagName, { lower: true, strict: true }),
              },
            },
          },
        })),
      };
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        ingredients: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return sendSuccess(res, {
      ...recipe,
      tags: recipe.tags.map((rt) => rt.tag),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check if recipe exists and user is author
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      throw new NotFoundError('Recipe');
    }

    if (recipe.authorId !== userId) {
      throw new AuthorizationError();
    }

    await prisma.recipe.delete({
      where: { id },
    });

    return sendSuccess(res, { message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = config.pagination.defaultLimit.toString() } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(
      parseInt(limit as string, 10),
      config.pagination.maxLimit
    );
    const skip = (pageNum - 1) * limitNum;

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: { authorId: userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.recipe.count({ where: { authorId: userId } }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(
      res,
      recipes.map((recipe) => ({
        ...recipe,
        tags: recipe.tags.map((rt) => rt.tag),
      })),
      200,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      }
    );
  } catch (error) {
    next(error);
  }
};
