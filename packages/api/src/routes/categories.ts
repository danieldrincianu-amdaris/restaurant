import { Router } from 'express';
import { Category } from '@prisma/client';
import { sendSuccess } from '../utils/response.js';

export function createCategoriesRoutes(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/categories:
   *   get:
   *     summary: Get all menu categories
   *     description: Retrieve list of all available menu categories (enum values)
   *     tags: [Categories]
   *     responses:
   *       200:
   *         description: List of categories
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: string
   *                     enum: [APPETIZER, MAIN, DRINK, DESSERT]
   */
  router.get('/', (req, res) => {
    const categories = Object.values(Category);
    sendSuccess(res, categories);
  });

  return router;
}
