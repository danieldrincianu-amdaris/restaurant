import { z } from 'zod';

export const addOrderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  specialInstructions: z.string().optional(),
});

export const updateOrderItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  specialInstructions: z.string().optional(),
});

export type AddOrderItemInput = z.infer<typeof addOrderItemSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
