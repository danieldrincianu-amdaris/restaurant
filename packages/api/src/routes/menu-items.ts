import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Category, FoodType } from '@prisma/client';
import { MenuService } from '../services/menu.service.js';
import { createMenuItemSchema, updateMenuItemSchema } from '../schemas/menu-item.schema.js';
import { notFound } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export function createMenuItemRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const menuService = new MenuService(prisma);

  // GET /api/menu-items - List all menu items with optional filters
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, foodType, available } = req.query;
      
      const filters: any = {};
      if (category && typeof category === 'string') {
        filters.category = category as Category;
      }
      if (foodType && typeof foodType === 'string') {
        filters.foodType = foodType as FoodType;
      }
      if (available !== undefined) {
        filters.available = available === 'true';
      }
      
      const items = await menuService.getAllMenuItems(filters);
      return sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/menu-items - Create a new menu item
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createMenuItemSchema.parse(req.body);
      const item = await menuService.createMenuItem(validated);
      return sendSuccess(res, item, 201);
    } catch (error) {
      next(error);
    }
  });

  // GET /api/menu-items/:id - Get a single menu item by ID
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await menuService.getMenuItemById(req.params['id']!);
      
      if (!item) {
        throw notFound('Menu item');
      }
      
      return sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/menu-items/:id - Update a menu item
  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateMenuItemSchema.parse(req.body);
      const item = await menuService.updateMenuItem(req.params['id']!, validated);
      
      if (!item) {
        throw notFound('Menu item');
      }
      
      return sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  });

  // DELETE /api/menu-items/:id - Delete a menu item
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await menuService.deleteMenuItem(req.params['id']!);
      
      if (!item) {
        throw notFound('Menu item');
      }
      
      return sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
