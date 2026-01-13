import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import healthRouter from './health.js';
import { createMenuItemRoutes } from './menu-items.js';

export function createRoutes(prisma: PrismaClient): Router {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/menu-items', createMenuItemRoutes(prisma));

  return router;
}
