import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { createRoutes } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  // Routes
  app.use('/api', createRoutes());

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
