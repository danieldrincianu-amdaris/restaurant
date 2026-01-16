import { Router } from 'express';
import { FoodType } from '@prisma/client';
import { sendSuccess } from '../utils/response.js';

export function createFoodTypesRoutes(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/food-types:
   *   get:
   *     summary: Get all food types
   *     description: Retrieve list of all available food type classifications (enum values)
   *     tags: [Food Types]
   *     responses:
   *       200:
   *         description: List of food types
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
   *                     enum: [MEAT, PASTA, PIZZA, SEAFOOD, VEGETARIAN, SALAD, SOUP, SANDWICH, COFFEE, BEVERAGE, OTHER]
   */
  router.get('/', (req, res) => {
    const foodTypes = Object.values(FoodType);
    sendSuccess(res, foodTypes);
  });

  return router;
}
