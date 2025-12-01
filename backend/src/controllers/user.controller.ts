import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';
import { NotFoundError, AuthorizationError } from '../utils/errors';

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            recipes: true,
            favorites: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            recipes: true,
            favorites: true,
            likes: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    // Check authorization
    if (userId !== id) {
      throw new AuthorizationError();
    }

    const { name, bio } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // Handle avatar upload
    if ((req as any).file) {
      updateData.avatarUrl = `/uploads/${(req as any).file.filename}`;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Buscar estatísticas
    const [recipesCount, likesReceived, favoritesReceived, commentsReceived] = await Promise.all([
      prisma.recipe.count({ where: { authorId: id } }),
      prisma.like.count({
        where: {
          recipe: {
            authorId: id,
          },
        },
      }),
      prisma.favorite.count({
        where: {
          recipe: {
            authorId: id,
          },
        },
      }),
      prisma.comment.count({
        where: {
          recipe: {
            authorId: id,
          },
        },
      }),
    ]);

    return sendSuccess(res, {
      recipesCount,
      likesReceived,
      favoritesReceived,
      commentsReceived,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { page = '1', limit = '12' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
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
        tags: fav.recipe.tags.map((rt) => rt.tag),
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
