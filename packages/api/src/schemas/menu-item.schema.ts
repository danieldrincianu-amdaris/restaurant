import { z } from 'zod';
import { Category, FoodType } from '@prisma/client';

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be greater than 0'),
  ingredients: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional().nullable(),
  category: z.nativeEnum(Category),
  foodType: z.nativeEnum(FoodType).default('OTHER'),
  available: z.boolean().default(true),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
