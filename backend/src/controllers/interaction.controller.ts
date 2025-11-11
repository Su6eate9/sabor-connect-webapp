import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';
import { NotFoundError, ConflictError } from '../utils/errors';
import { createCommentSchema, CreateCommentInput } from '../validators/recipe.validator';
import { config } from '../config';

export const likeRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { recipeId } = req.params;

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundError('Recipe');
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictError('Recipe already liked');
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        userId,
        recipeId,
      },
    });

    return sendSuccess(res, like, 201);
  } catch (error) {
    next(error);
  }
};

export const unlikeRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { recipeId } = req.params;

    // Check if like exists
    const like = await prisma.like.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (!like) {
      throw new NotFoundError('Like');
    }

    await prisma.like.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    return sendSuccess(res, { message: 'Recipe unliked successfully' });
  } catch (error) {
    next(error);
  }
};

export const favoriteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { recipeId } = req.params;

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundError('Recipe');
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictError('Recipe already favorited');
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        recipeId,
      },
    });

    return sendSuccess(res, favorite, 201);
  } catch (error) {
    next(error);
  }
};

export const unfavoriteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { recipeId } = req.params;

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundError('Favorite');
    }

    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    return sendSuccess(res, { message: 'Recipe removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { page = '1', limit = config.pagination.defaultLimit.toString() } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(
      parseInt(limit as string, 10),
      config.pagination.maxLimit
    );
    const skip = (pageNum - 1) * limitNum;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          recipe: {
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
          },
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(
      res,
      favorites.map((fav) => ({
        ...fav.recipe,
        tags: fav.recipe.tags.map((rt: any) => rt.tag),
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

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { recipeId } = req.params;
    const { content } = createCommentSchema.parse(req.body) as CreateCommentInput;

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundError('Recipe');
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        recipeId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return sendSuccess(res, comment, 201);
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recipeId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { recipeId },
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
        },
      }),
      prisma.comment.count({ where: { recipeId } }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return sendSuccess(res, comments, 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { commentId } = req.params;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    // Only author can delete
    if (comment.authorId !== userId) {
      throw new AuthorizationError();
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return sendSuccess(res, { message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};
