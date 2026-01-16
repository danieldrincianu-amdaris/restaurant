import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { OrderService } from '../services/order.service.js';
import { createOrderSchema, updateOrderSchema } from '../schemas/order.schema.js';
import { addOrderItemSchema, updateOrderItemSchema } from '../schemas/order-item.schema.js';
import { updateStatusSchema } from '../schemas/order-status.schema.js';
import { notFound, invalidInput } from '@restaurant/shared';
import { sendSuccess } from '../utils/response.js';

export function createOrderRoutes(prisma: PrismaClient, io: SocketIOServer): Router {
  const router = Router();
  const orderService = new OrderService(prisma, io);

  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: List all orders
   *     description: Retrieve all orders with optional filtering by status and table number
   *     tags: [Orders]
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, IN_PROGRESS, COMPLETED, HALTED, CANCELED]
   *         description: Filter by order status
   *       - in: query
   *         name: tableNumber
   *         schema:
   *           type: integer
   *         description: Filter by table number
   *     responses:
   *       200:
   *         description: List of orders
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
   *                     $ref: '#/components/schemas/Order'
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, tableNumber } = req.query;
      
      const filters: { status?: string; tableNumber?: number } = {};
      if (status && typeof status === 'string') {
        filters.status = status;
      }
      if (tableNumber && typeof tableNumber === 'string') {
        filters.tableNumber = parseInt(tableNumber, 10);
      }
      
      const orders = await orderService.getAllOrders(filters);
      return sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Create a new order
   *     description: Create a new order with items
   *     tags: [Orders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tableNumber
   *               - serverName
   *               - items
   *             properties:
   *               tableNumber:
   *                 type: integer
   *                 example: 5
   *               serverName:
   *                 type: string
   *                 example: "John Doe"
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - menuItemId
   *                     - quantity
   *                   properties:
   *                     menuItemId:
   *                       type: string
   *                     quantity:
   *                       type: integer
   *                       minimum: 1
   *                     specialInstructions:
   *                       type: string
   *     responses:
   *       201:
   *         description: Order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(validated);
      return sendSuccess(res, order, 201);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/{id}:
   *   get:
   *     summary: Get a single order by ID
   *     description: Retrieve detailed information about a specific order including items
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     responses:
   *       200:
   *         description: Order details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.getOrderById(req.params['id']!);
      
      if (!order) {
        throw notFound('Order');
      }
      
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/{id}:
   *   put:
   *     summary: Update an order
   *     description: Update order details (table number and server name)
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tableNumber:
   *                 type: integer
   *               serverName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Order updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateOrderSchema.parse(req.body);
      const order = await orderService.updateOrder(req.params['id']!, validated);
      
      if (!order) {
        throw notFound('Order');
      }
      
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/{id}:
   *   delete:
   *     summary: Delete an order
   *     description: Permanently delete an order and all associated items
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     responses:
   *       200:
   *         description: Order deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.deleteOrder(req.params['id']!);
      
      if (!order) {
        throw notFound('Order');
      }
      
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/{id}/status:
   *   patch:
   *     summary: Update order status
   *     description: Transition order to a new status (PENDING → IN_PROGRESS → COMPLETED or HALTED/CANCELED)
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [PENDING, IN_PROGRESS, COMPLETED, HALTED, CANCELED]
   *     responses:
   *       200:
   *         description: Status updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       400:
   *         description: Invalid status transition
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Order not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateStatusSchema.parse(req.body);
      const order = await orderService.updateOrderStatus(req.params['id']!, validated);
      
      if (!order) {
        throw notFound('Order');
      }
      
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/{id}/items:
   *   post:
   *     summary: Add item to order
   *     description: Add a new item to an existing order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - menuItemId
   *               - quantity
   *             properties:
   *               menuItemId:
   *                 type: string
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *               specialInstructions:
   *                 type: string
   *     responses:
   *       201:
   *         description: Item added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/:id/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = addOrderItemSchema.parse(req.body);
      const order = await orderService.addOrderItem(req.params['id']!, validated);
      
      if (!order) {
        throw notFound('Order');
      }
      
      return sendSuccess(res, order, 201);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/{id}/items/{itemId}:
   *   put:
   *     summary: Update order item
   *     description: Update quantity or special instructions for an order item
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *       - in: path
   *         name: itemId
   *         required: true
   *         schema:
   *           type: string
   *         description: Order Item ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *                 minimum: 1
   *               specialInstructions:
   *                 type: string
   *     responses:
   *       200:
   *         description: Item updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order or item not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.put('/:id/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateOrderItemSchema.parse(req.body);
      const order = await orderService.updateOrderItem(
        req.params['id']!,
        req.params['itemId']!,
        validated
      );
      
      if (!order) {
        throw notFound('Order or Order Item');
      }
      
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/{id}/items/{itemId}:
   *   delete:
   *     summary: Remove order item
   *     description: Remove an item from an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *       - in: path
   *         name: itemId
   *         required: true
   *         schema:
   *           type: string
   *         description: Order Item ID
   *     responses:
   *       200:
   *         description: Item removed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order or item not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.delete('/:id/items/:itemId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.removeOrderItem(
        req.params['id']!,
        req.params['itemId']!
      );
      
      if (!order) {
        throw notFound('Order or Order Item');
      }
      
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  });

  /**
   * @swagger
   * /api/orders/bulk-status:
   *   post:
   *     summary: Bulk update order statuses
   *     description: Update status for multiple orders at once
   *     tags: [Orders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - orderIds
   *               - status
   *             properties:
   *               orderIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["order1-id", "order2-id"]
   *               status:
   *                 type: string
   *                 enum: [PENDING, IN_PROGRESS, COMPLETED, HALTED, CANCELED]
   *     responses:
   *       200:
   *         description: Orders updated successfully
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
   *                     $ref: '#/components/schemas/Order'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/bulk-status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderIds, status } = req.body;
      
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        throw invalidInput('orderIds must be a non-empty array');
      }
      
      if (typeof status !== 'string') {
        throw invalidInput('status is required');
      }
      
      const updatedOrders = await orderService.bulkUpdateStatus(orderIds, status);
      return sendSuccess(res, updatedOrders);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
