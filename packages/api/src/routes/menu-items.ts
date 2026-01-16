import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Category, FoodType } from '@prisma/client';
import { MenuService } from '../services/menu.service.js';
import { createMenuItemSchema, updateMenuItemSchema } from '../schemas/menu-item.schema.js';
import { notFound, invalidInput } from '@restaurant/shared';
import { sendSuccess } from '../utils/response.js';

export function createMenuItemRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const menuService = new MenuService(prisma);

  /**
   * @swagger
   * /api/menu-items:
   *   get:
   *     summary: List all menu items
   *     description: Retrieve all menu items with optional filtering
   *     tags: [Menu Items]
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [APPETIZER, MAIN, DRINK, DESSERT]
   *         description: Filter by category
   *       - in: query
   *         name: foodType
   *         schema:
   *           type: string
   *           enum: [MEAT, PASTA, PIZZA, SEAFOOD, VEGETARIAN, SALAD, SOUP, SANDWICH, COFFEE, BEVERAGE, OTHER]
   *         description: Filter by food type
   *       - in: query
   *         name: available
   *         schema:
   *           type: boolean
   *         description: Filter by availability
   *     responses:
   *       200:
   *         description: List of menu items
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
   *                     $ref: '#/components/schemas/MenuItem'
   */
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

  /**
   * @swagger
   * /api/menu-items:
   *   post:
   *     summary: Create a new menu item
   *     description: Add a new item to the menu
   *     tags: [Menu Items]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - price
   *               - ingredients
   *               - category
   *               - foodType
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Margherita Pizza"
   *               price:
   *                 type: number
   *                 format: decimal
   *                 example: 12.99
   *               ingredients:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["tomato sauce", "mozzarella", "basil"]
   *               imageUrl:
   *                 type: string
   *                 nullable: true
   *               category:
   *                 type: string
   *                 enum: [APPETIZER, MAIN, DRINK, DESSERT]
   *               foodType:
   *                 type: string
   *                 enum: [MEAT, PASTA, PIZZA, SEAFOOD, VEGETARIAN, SALAD, SOUP, SANDWICH, COFFEE, BEVERAGE, OTHER]
   *               available:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: Menu item created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/MenuItem'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createMenuItemSchema.parse(req.body);
      const item = await menuService.createMenuItem(validated);
      return sendSuccess(res, item, 201);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/menu-items/{id}:
   *   get:
   *     summary: Get a single menu item by ID
   *     description: Retrieve detailed information about a specific menu item
   *     tags: [Menu Items]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Menu Item ID
   *     responses:
   *       200:
   *         description: Menu item details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/MenuItem'
   *       404:
   *         description: Menu item not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/menu-items/{id}:
   *   put:
   *     summary: Update a menu item
   *     description: Update menu item details
   *     tags: [Menu Items]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Menu Item ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               price:
   *                 type: number
   *                 format: decimal
   *               ingredients:
   *                 type: array
   *                 items:
   *                   type: string
   *               imageUrl:
   *                 type: string
   *                 nullable: true
   *               category:
   *                 type: string
   *                 enum: [APPETIZER, MAIN, DRINK, DESSERT]
   *               foodType:
   *                 type: string
   *                 enum: [MEAT, PASTA, PIZZA, SEAFOOD, VEGETARIAN, SALAD, SOUP, SANDWICH, COFFEE, BEVERAGE, OTHER]
   *               available:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Menu item updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/MenuItem'
   *       404:
   *         description: Menu item not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/menu-items/{id}:
   *   delete:
   *     summary: Delete a menu item
   *     description: Permanently remove a menu item
   *     tags: [Menu Items]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Menu Item ID
   *     responses:
   *       200:
   *         description: Menu item deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/MenuItem'
   *       404:
   *         description: Menu item not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @swagger
   * /api/menu-items/reorder:
   *   patch:
   *     summary: Reorder menu items
   *     description: Update the display order of menu items
   *     tags: [Menu Items]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - orderedIds
   *             properties:
   *               orderedIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["item1-id", "item2-id", "item3-id"]
   *                 description: Array of menu item IDs in desired display order
   *     responses:
   *       200:
   *         description: Menu items reordered successfully
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
   *                     $ref: '#/components/schemas/MenuItem'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch('/reorder', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
        throw invalidInput('orderedIds must be a non-empty array of menu item IDs');
      }

      const items = await menuService.reorderMenuItems(orderedIds);
      return sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
