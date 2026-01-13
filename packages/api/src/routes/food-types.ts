import { Router } from 'express';
import { FoodType } from '@prisma/client';
import { sendSuccess } from '../utils/response.js';

export function createFoodTypesRoutes(): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const foodTypes = Object.values(FoodType);
    sendSuccess(res, foodTypes);
  });

  return router;
}
