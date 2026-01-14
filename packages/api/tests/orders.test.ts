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

  describe('POST /api/orders/:id/items', () => {
    let testMenuItemId: string;

    beforeAll(async () => {
      // Create a test menu item for order items
      const menuItem = await prisma.menuItem.create({
        data: {
          name: 'Test Pizza',
          price: 15.99,
          category: 'MAIN',
          foodType: 'PIZZA',
          ingredients: ['cheese', 'tomato'],
          available: true,
        },
      });
      testMenuItemId = menuItem.id;
    });

    afterAll(async () => {
      // Cleanup test menu item
      await prisma.menuItem.delete({ where: { id: testMenuItemId } }).catch(() => {});
    });

    it('should add item to order successfully', async () => {
      // Create test order
      const order = await prisma.order.create({
        data: {
          tableNumber: 10,
          serverName: 'Alice',
          status: 'PENDING',
        },
      });
      testOrderId = order.id;

      const res = await request(app)
        .post(`/api/orders/${order.id}/items`)
        .send({
          menuItemId: testMenuItemId,
          quantity: 2,
          specialInstructions: 'No olives',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe(order.id);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].menuItemId).toBe(testMenuItemId);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].specialInstructions).toBe('No olives');
    });

    it('should return 400 for quantity less than 1', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 11, serverName: 'Bob', status: 'PENDING' },
      });
      testOrderId = order.id;

      const res = await request(app)
        .post(`/api/orders/${order.id}/items`)
        .send({
          menuItemId: testMenuItemId,
          quantity: 0,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for unavailable menu item', async () => {
      // Create unavailable menu item
      const unavailableItem = await prisma.menuItem.create({
        data: {
          name: 'Unavailable Item',
          price: 10.0,
          category: 'MAIN',
          foodType: 'OTHER',
          ingredients: [],
          available: false,
        },
      });

      const order = await prisma.order.create({
        data: { tableNumber: 12, serverName: 'Carol', status: 'PENDING' },
      });
      testOrderId = order.id;

      const res = await request(app)
        .post(`/api/orders/${order.id}/items`)
        .send({
          menuItemId: unavailableItem.id,
          quantity: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MENU_ITEM_UNAVAILABLE');

      // Cleanup
      await prisma.menuItem.delete({ where: { id: unavailableItem.id } });
    });

    it('should return 400 for non-existent menu item', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 13, serverName: 'Dave', status: 'PENDING' },
      });
      testOrderId = order.id;

      const res = await request(app)
        .post(`/api/orders/${order.id}/items`)
        .send({
          menuItemId: 'nonexistent123',
          quantity: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MENU_ITEM_NOT_FOUND');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .post('/api/orders/nonexistent123/items')
        .send({
          menuItemId: testMenuItemId,
          quantity: 1,
        });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/orders/:id/items/:itemId', () => {
    it('should update order item successfully', async () => {
      // Create order with item
      const menuItem = await prisma.menuItem.create({
        data: {
          name: 'Update Test Item',
          price: 12.0,
          category: 'MAIN',
          foodType: 'OTHER',
          ingredients: [],
          available: true,
        },
      });

      const order = await prisma.order.create({
        data: {
          tableNumber: 20,
          serverName: 'Eve',
          status: 'PENDING',
          items: {
            create: {
              menuItemId: menuItem.id,
              quantity: 1,
            },
          },
        },
        include: { items: true },
      });
      testOrderId = order.id;

      const itemId = order.items[0].id;

      const res = await request(app)
        .put(`/api/orders/${order.id}/items/${itemId}`)
        .send({
          quantity: 3,
          specialInstructions: 'Extra sauce',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(order.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedItem = res.body.data.items.find((i: any) => i.id === itemId);
      expect(updatedItem.quantity).toBe(3);
      expect(updatedItem.specialInstructions).toBe('Extra sauce');

      // Cleanup - delete orderItem first to avoid foreign key constraint
      await prisma.orderItem.deleteMany({ where: { menuItemId: menuItem.id } });
      await prisma.menuItem.delete({ where: { id: menuItem.id } });
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .put('/api/orders/nonexistent123/items/item123')
        .send({ quantity: 2 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for non-existent item', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 21, serverName: 'Frank', status: 'PENDING' },
      });
      testOrderId = order.id;

      const res = await request(app)
        .put(`/api/orders/${order.id}/items/nonexistent123`)
        .send({ quantity: 2 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/orders/:id/items/:itemId', () => {
    it('should remove order item successfully', async () => {
      // Create order with item
      const menuItem = await prisma.menuItem.create({
        data: {
          name: 'Delete Test Item',
          price: 8.0,
          category: 'APPETIZER',
          foodType: 'OTHER',
          ingredients: [],
          available: true,
        },
      });

      const order = await prisma.order.create({
        data: {
          tableNumber: 30,
          serverName: 'Grace',
          status: 'PENDING',
          items: {
            create: {
              menuItemId: menuItem.id,
              quantity: 2,
            },
          },
        },
        include: { items: true },
      });
      testOrderId = order.id;

      const itemId = order.items[0].id;

      const res = await request(app).delete(`/api/orders/${order.id}/items/${itemId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(order.id);
      expect(res.body.data.items).toHaveLength(0);

      // Verify item is deleted
      const deletedItem = await prisma.orderItem.findUnique({ where: { id: itemId } });
      expect(deletedItem).toBeNull();

      // Cleanup
      await prisma.menuItem.delete({ where: { id: menuItem.id } });
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app).delete('/api/orders/nonexistent123/items/item123');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for non-existent item', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 31, serverName: 'Hank', status: 'PENDING' },
      });
      testOrderId = order.id;

      const res = await request(app).delete(`/api/orders/${order.id}/items/nonexistent123`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status for valid transition', async () => {
      const order = await prisma.order.create({
        data: {
          tableNumber: 40,
          serverName: 'Ian',
          status: 'PENDING',
        },
      });
      testOrderId = order.id;

      const res = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(order.id);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('should return 400 for invalid status value', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 41, serverName: 'Jane', status: 'PENDING' },
      });
      testOrderId = order.id;

      const res = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid transition COMPLETED to IN_PROGRESS', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 42, serverName: 'Kevin', status: 'COMPLETED' },
      });
      testOrderId = order.id;

      const res = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
      expect(res.body.error.message).toContain('Cannot transition from COMPLETED to IN_PROGRESS');
    });

    it('should return 400 for invalid transition CANCELED to PENDING', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 43, serverName: 'Laura', status: 'CANCELED' },
      });
      testOrderId = order.id;

      const res = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'PENDING' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
      expect(res.body.error.message).toContain('Cannot transition from CANCELED to PENDING');
    });

    it('should return 404 for non-existent order', async () => {
      const res = await request(app)
        .patch('/api/orders/nonexistent123/status')
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should verify updatedAt changes after status update', async () => {
      const order = await prisma.order.create({
        data: { tableNumber: 44, serverName: 'Mike', status: 'PENDING' },
      });
      testOrderId = order.id;

      const originalUpdatedAt = order.updatedAt;

      // Wait a tiny bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const res = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(new Date(res.body.data.updatedAt).getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });

    it('should test full workflow PENDING to IN_PROGRESS to COMPLETED', async () => {
      // Create order in PENDING status
      const order = await prisma.order.create({
        data: { tableNumber: 45, serverName: 'Nancy', status: 'PENDING' },
      });
      testOrderId = order.id;

      // Transition to IN_PROGRESS
      const res1 = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'IN_PROGRESS' });

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('IN_PROGRESS');

      // Transition to COMPLETED
      const res2 = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'COMPLETED' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('COMPLETED');

      // Verify COMPLETED is terminal - cannot transition
      const res3 = await request(app)
        .patch(`/api/orders/${order.id}/status`)
        .send({ status: 'PENDING' });

      expect(res3.status).toBe(400);
      expect(res3.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });
  });
});
