import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';
import { NotFoundError, AuthorizationError } from '../utils/errors';

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
