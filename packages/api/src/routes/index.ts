import { Router } from 'express';
import healthRouter from './health.js';

export function createRoutes(): Router {
  const router = Router();

  router.use(healthRouter);

  return router;
}
