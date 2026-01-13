import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../src/app.js';
import { prisma, connectDatabase, disconnectDatabase } from '../src/lib/prisma.js';

describe('Orders API', () => {
  let app: Express;
  let testOrderId: string | null = null;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp(prisma);
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  afterEach(async () => {
    // Cleanup test order if created (cascade will handle order items)
    if (testOrderId) {
      await prisma.order.delete({ where: { id: testOrderId } }).catch(() => {});
      testOrderId = null;
    }
  });

  describe('POST /api/orders', () => {
    it('should create order with valid data', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: 'Alice',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.tableNumber).toBe(5);
      expect(res.body.data.serverName).toBe('Alice');
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);

      testOrderId = res.body.data.id;
    });

    it('should return 400 for missing tableNumber', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          serverName: 'Alice',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid tableNumber (zero)', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 0,
          serverName: 'Alice',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid tableNumber (negative)', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: -5,
          serverName: 'Alice',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing serverName', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty serverName', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          tableNumber: 5,
          serverName: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/orders', () => {
    it('should return all orders', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter by status', async () => {
      // Create test order with specific status
      const created = await prisma.order.create({
        data: {
          tableNumber: 99,
          serverName: 'Test Filter',
          status: 'PENDING',
        },
      });
      testOrderId = created.id;

      const res = await request(app).get('/api/orders?status=PENDING');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      
      // Find our test order in results
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const foundOrder = res.body.data.find((order: any) => order.id === testOrderId);
      expect(foundOrder).toBeDefined();
      expect(foundOrder.status).toBe('PENDING');
    });

    it('should filter by tableNumber', async () => {
      // Create test order with specific table
      const created = await prisma.order.create({
        data: {
          tableNumber: 88,
          serverName: 'Test Table',
          status: 'PENDING',
        },
      });
      testOrderId = created.id;

      const res = await request(app).get('/api/orders?tableNumber=88');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      
      // Verify all results match table number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.body.data.forEach((order: any) => {
        expect(order.tableNumber).toBe(88);
      });
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order when found', async () => {
      // Create test order first
      const created = await prisma.order.create({
        data: {
          tableNumber: 10,
          serverName: 'Find Test',
          status: 'PENDING',
        },
      });
      testOrderId = created.id;

      const res = await request(app).get(`/api/orders/${testOrderId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testOrderId);
      expect(res.body.data.tableNumber).toBe(10);
      expect(res.body.data.serverName).toBe('Find Test');
      expect(res.body.data).toHaveProperty('items');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/nonexistent123');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('should update order with valid data', async () => {
      // Create test order first
      const created = await prisma.order.create({
        data: {
          tableNumber: 15,
          serverName: 'Update Test',
          status: 'PENDING',
        },
      });
      testOrderId = created.id;

      const res = await request(app)
        .put(`/api/orders/${testOrderId}`)
        .send({
          tableNumber: 20,
          serverName: 'Updated Name',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testOrderId);
      expect(res.body.data.tableNumber).toBe(20);
      expect(res.body.data.serverName).toBe('Updated Name');
      expect(res.body.data).toHaveProperty('items');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/nonexistent123')
        .send({
          tableNumber: 20,
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should delete order when exists', async () => {
      // Create test order first
      const created = await prisma.order.create({
        data: {
          tableNumber: 25,
          serverName: 'Delete Test',
          status: 'PENDING',
        },
      });
      const orderId = created.id;

      const res = await request(app).delete(`/api/orders/${orderId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(orderId);

      // Verify order is actually deleted
      const check = await prisma.order.findUnique({ where: { id: orderId } });
      expect(check).toBeNull();

      testOrderId = null; // Already deleted
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).delete('/api/orders/nonexistent123');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
