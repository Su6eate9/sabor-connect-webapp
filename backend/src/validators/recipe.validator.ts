import { z } from 'zod';
import { Difficulty } from '@prisma/client';

export const createRecipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  prepTimeMinutes: z.number().int().positive('Prep time must be positive'),
  cookTimeMinutes: z.number().int().positive('Cook time must be positive'),
  difficulty: z.nativeEnum(Difficulty),
  portions: z.number().int().positive('Portions must be positive'),
  instructions: z.array(z.string().min(1)).min(1, 'At least one instruction is required'),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, 'Ingredient name is required'),
        quantity: z.string().min(1, 'Quantity is required'),
        unit: z.string().min(1, 'Unit is required'),
      })
    )
    .min(1, 'At least one ingredient is required'),
  tags: z.array(z.string()).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
