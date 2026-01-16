import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { createServer, Server as HTTPServer } from 'http';
import { PrismaClient } from '@prisma/client';
import { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from '../src/app.js';
import { prisma as globalPrisma } from '../src/lib/prisma.js';
import { SOCKET_EVENTS, OrderCreatedPayload, OrderUpdatedPayload, OrderStatusChangedPayload, OrderDeletedPayload, OrderItemAddedPayload, OrderItemUpdatedPayload, OrderItemRemovedPayload } from '@restaurant/shared';
import request from 'supertest';

describe('Order Events Broadcasting', () => {
  let httpServer: HTTPServer;
  let app: Express;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let io: SocketIOServer;
  let prisma: PrismaClient;
  let client: ClientSocket;
  const serverUrl = 'http://localhost:3002';
  let testMenuItemId: string;

  beforeAll(async () => {
    prisma = globalPrisma;
    httpServer = createServer();
    
    const result = createApp(prisma, httpServer);
    app = result.app;
    io = result.io;
    
    httpServer.on('request', app);
    
    await new Promise<void>((resolve) => {
      httpServer.listen(3002, () => resolve());
    });
  });

  afterAll(async () => {
    httpServer.close();
  });

  beforeEach(async () => {
    // Create test menu item (cleanup in afterEach)
    const menuItem = await prisma.menuItem.create({
      data: {
        name: 'Test Pizza',
        price: 12.99,
        category: 'MAIN',
        available: true,
      },
    });
    testMenuItemId = menuItem.id;

    // Create fresh socket connection
    client = ioClient(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Wait for connection
    await new Promise<void>((resolve) => client.on('connect', () => resolve()));
  });

  afterEach(async () => {
    if (client?.connected) {
      client.disconnect();
    }
    // Clean up test data (in reverse dependency order)
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    if (testMenuItemId) {
      await prisma.menuItem.delete({ where: { id: testMenuItemId } }).catch(() => {});
    }
  });

  describe('order:created event', () => {
    it('should broadcast to kitchen room when order is created via API', async () => {
      // Client joins kitchen room
      client.emit(SOCKET_EVENTS.JOIN_KITCHEN);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const eventPromise = new Promise<OrderCreatedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_CREATED, resolve);
      });

      // Create order via API
      await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        })
        .expect(201);

      const payload = await eventPromise;
      expect(payload.order).toBeDefined();
      expect(payload.order.tableNumber).toBe(5);
      expect(payload.order.serverName).toBe('Alice');
      expect(payload.order.status).toBe('PENDING');
    });

    it('should broadcast to orders room when order is created', async () => {
      client.emit(SOCKET_EVENTS.JOIN_ORDERS);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const eventPromise = new Promise<OrderCreatedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_CREATED, resolve);
      });

      await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 10,
          serverName: 'Bob',
        })
        .expect(201);

      const payload = await eventPromise;
      expect(payload.order.tableNumber).toBe(10);
    });
  });

  describe('order:updated event', () => {
    it('should broadcast when order is updated via API', async () => {
      client.emit(SOCKET_EVENTS.JOIN_KITCHEN);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create order first
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        });
      
      const orderId = createResponse.body.data.id;

      const eventPromise = new Promise<OrderUpdatedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_UPDATED, resolve);
      });

      // Update order
      await request(app)
        .put(`/api/orders/${orderId}`)
        .send({
          serverName: 'Updated Alice',
          tableNumber: 6,
        })
        .expect(200);

      const payload = await eventPromise;
      expect(payload.order.serverName).toBe('Updated Alice');
      expect(payload.order.tableNumber).toBe(6);
      expect(payload.changedFields).toBeDefined();
    });
  });

  describe('order:status-changed event', () => {
    it('should broadcast with previous and new status', async () => {
      client.emit(SOCKET_EVENTS.JOIN_KITCHEN);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create order
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        });
      
      const orderId = createResponse.body.data.id;

      const eventPromise = new Promise<OrderStatusChangedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, resolve);
      });

      // Update status
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({
          status: 'IN_PROGRESS',
        })
        .expect(200);

      const payload = await eventPromise;
      expect(payload.orderId).toBe(orderId);
      expect(payload.previousStatus).toBe('PENDING');
      expect(payload.newStatus).toBe('IN_PROGRESS');
      expect(payload.updatedAt).toBeDefined();
    });
  });

  describe('order:deleted event', () => {
    it('should broadcast order ID when deleted via API', async () => {
      client.emit(SOCKET_EVENTS.JOIN_ORDERS);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create order
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        });
      
      const orderId = createResponse.body.data.id;

      const eventPromise = new Promise<OrderDeletedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_DELETED, resolve);
      });

      // Delete order
      await request(app)
        .delete(`/api/orders/${orderId}`)
        .expect(200);

      const payload = await eventPromise;
      expect(payload.orderId).toBe(orderId);
    });
  });

  describe('order-item events', () => {
    it('should broadcast order-item:added when item added via API', async () => {
      client.emit(SOCKET_EVENTS.JOIN_KITCHEN);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create order
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        });
      
      const orderId = createResponse.body.data.id;

      const eventPromise = new Promise<OrderItemAddedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_ITEM_ADDED, resolve);
      });

      // Add item
      await request(app)
        .post(`/api/orders/${orderId}/items`)
        .send({
          menuItemId: testMenuItemId,
          quantity: 2,
          specialInstructions: 'No olives',
        })
        .expect(201);

      const payload = await eventPromise;
      expect(payload.orderId).toBe(orderId);
      expect(payload.item.quantity).toBe(2);
      expect(payload.item.menuItem).toBeDefined();
      expect(payload.item.specialInstructions).toBe('No olives');
    });

    it('should broadcast order-item:updated when item updated via API', async () => {
      client.emit(SOCKET_EVENTS.JOIN_KITCHEN);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create order and item
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        });
      
      const orderId = createResponse.body.data.id;

      const itemResponse = await request(app)
        .post(`/api/orders/${orderId}/items`)
        .send({
          menuItemId: testMenuItemId,
          quantity: 2,
        });
      
      const itemId = itemResponse.body.data.items[0].id;

      const eventPromise = new Promise<OrderItemUpdatedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_ITEM_UPDATED, resolve);
      });

      // Update item
      await request(app)
        .put(`/api/orders/${orderId}/items/${itemId}`)
        .send({
          quantity: 3,
          specialInstructions: 'Extra cheese',
        })
        .expect(200);

      const payload = await eventPromise;
      expect(payload.orderId).toBe(orderId);
      expect(payload.item.quantity).toBe(3);
      expect(payload.item.specialInstructions).toBe('Extra cheese');
    });

    it('should broadcast order-item:removed when item deleted via API', async () => {
      client.emit(SOCKET_EVENTS.JOIN_KITCHEN);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create order and item
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        });
      
      const orderId = createResponse.body.data.id;

      const itemResponse = await request(app)
        .post(`/api/orders/${orderId}/items`)
        .send({
          menuItemId: testMenuItemId,
          quantity: 2,
        });
      
      const itemId = itemResponse.body.data.items[0].id;

      const eventPromise = new Promise<OrderItemRemovedPayload>((resolve) => {
        client.on(SOCKET_EVENTS.ORDER_ITEM_REMOVED, resolve);
      });

      // Delete item
      await request(app)
        .delete(`/api/orders/${orderId}/items/${itemId}`)
        .expect(200);

      const payload = await eventPromise;
      expect(payload.orderId).toBe(orderId);
      expect(payload.itemId).toBe(itemId);
    });
  });
});
