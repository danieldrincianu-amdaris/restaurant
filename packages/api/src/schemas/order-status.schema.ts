import { z } from 'zod';

// OrderStatus values matching Prisma enum
const OrderStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'HALTED', 'CANCELED']);

export const updateStatusSchema = z.object({
  status: OrderStatus,
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// Status transition validation map
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['IN_PROGRESS', 'CANCELED'],
  IN_PROGRESS: ['COMPLETED', 'HALTED', 'CANCELED'],
  HALTED: ['IN_PROGRESS', 'CANCELED'],
  COMPLETED: [],
  CANCELED: [],
};
