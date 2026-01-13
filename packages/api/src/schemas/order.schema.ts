import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const createOrderSchema = z.object({
  tableNumber: z.number().int().positive('Table number must be a positive integer'),
  serverName: z.string().min(1, 'Server name is required'),
});

export const updateOrderSchema = z.object({
  tableNumber: z.number().int().positive('Table number must be a positive integer').optional(),
  serverName: z.string().min(1, 'Server name is required').optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
