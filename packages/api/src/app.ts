import express, { Express } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config/index.js';
import { createRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(prisma: PrismaClient): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());
  app.use('/uploads', express.static('uploads'));

  // Routes
  app.use('/api', createRoutes(prisma));

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
