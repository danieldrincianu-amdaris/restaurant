import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import healthRouter from './health.js';
import { createMenuItemRoutes } from './menu-items.js';
import { createUploadRoutes } from './upload.js';
import { createCategoriesRoutes } from './categories.js';
import { createFoodTypesRoutes } from './food-types.js';
import { createOrderRoutes } from './orders.js';

export function createRoutes(prisma: PrismaClient, io: SocketIOServer): Router {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/menu-items', createMenuItemRoutes(prisma));
  router.use('/upload', createUploadRoutes());
  router.use('/categories', createCategoriesRoutes());
  router.use('/food-types', createFoodTypesRoutes());
  router.use('/orders', createOrderRoutes(prisma, io));

  return router;
}
