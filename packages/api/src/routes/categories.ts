import { Router } from 'express';
import { Category } from '@prisma/client';
import { sendSuccess } from '../utils/response.js';

export function createCategoriesRoutes(): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const categories = Object.values(Category);
    sendSuccess(res, categories);
  });

  return router;
}
