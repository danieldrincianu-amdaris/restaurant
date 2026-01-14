import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { OrderService } from '../services/order.service.js';
import { createOrderSchema, updateOrderSchema } from '../schemas/order.schema.js';
import { addOrderItemSchema, updateOrderItemSchema } from '../schemas/order-item.schema.js';
import { updateStatusSchema } from '../schemas/order-status.schema.js';
import { notFound } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export function createOrderRoutes(prisma: PrismaClient, io: SocketIOServer): Router {
  const router = Router();
  const orderService = new OrderService(prisma, io);

  // GET /api/orders - List all orders with optional filters
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

  // POST /api/orders - Create a new order
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(validated);
      return sendSuccess(res, order, 201);
    } catch (error) {
      next(error);
    }
  });

  // GET /api/orders/:id - Get a single order
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

  // PUT /api/orders/:id - Update an order
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

  // DELETE /api/orders/:id - Delete an order
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

  // PATCH /api/orders/:id/status - Update order status
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

  // POST /api/orders/:id/items - Add item to order
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

  // PUT /api/orders/:id/items/:itemId - Update order item
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

  // DELETE /api/orders/:id/items/:itemId - Remove order item
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

  return router;
}
