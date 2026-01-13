import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../src/app.js';
import { prisma, connectDatabase, disconnectDatabase } from '../src/lib/prisma.js';
import { Category } from '@prisma/client';

describe('Menu Items API', () => {
  let app: Express;
  let testItemId: string | null = null;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp(prisma);
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  afterEach(async () => {
    // Cleanup test item if created
    if (testItemId) {
      await prisma.menuItem.delete({ where: { id: testItemId } }).catch(() => {});
      testItemId = null;
    }
  });

  describe('POST /api/menu-items', () => {
    it('should create menu item with valid data', async () => {
      const res = await request(app)
        .post('/api/menu-items')
        .send({
          name: 'Test Pizza',
          price: 15.99,
          ingredients: ['cheese', 'tomato'],
          category: 'MAIN',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Test Pizza');
      expect(Number(res.body.data.price)).toBe(15.99);
      expect(res.body.data.category).toBe('MAIN');

      testItemId = res.body.data.id;
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/menu-items')
        .send({
          price: 15.99,
          category: 'MAIN',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for negative price', async () => {
      const res = await request(app)
        .post('/api/menu-items')
        .send({
          name: 'Test Item',
          price: -5,
          category: 'MAIN',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const res = await request(app)
        .post('/api/menu-items')
        .send({
          name: 'Test Item',
          price: 10,
          category: 'INVALID',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/menu-items', () => {
    it('should return all menu items', async () => {
      const res = await request(app).get('/api/menu-items');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/menu-items?category=DESSERT');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      res.body.data.forEach((item: any) => {
        expect(item.category).toBe('DESSERT');
      });
    });

    it('should filter by foodType', async () => {
      const res = await request(app).get('/api/menu-items?foodType=PIZZA');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter by available', async () => {
      const res = await request(app).get('/api/menu-items?available=true');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      res.body.data.forEach((item: any) => {
        expect(item.available).toBe(true);
      });
    });
  });

  describe('GET /api/menu-items/:id', () => {
    it('should return menu item when found', async () => {
      // Create test item first
      const created = await prisma.menuItem.create({
        data: {
          name: 'Find Test',
          price: 10.00,
          ingredients: ['test'],
          category: Category.APPETIZER,
        },
      });
      testItemId = created.id;

      const res = await request(app).get(`/api/menu-items/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.id);
      expect(res.body.data.name).toBe('Find Test');
    });

    it('should return 404 when not found', async () => {
      const res = await request(app).get('/api/menu-items/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain('not found');
    });
  });

  describe('PUT /api/menu-items/:id', () => {
    it('should update menu item with valid data', async () => {
      // Create test item first
      const created = await prisma.menuItem.create({
        data: {
          name: 'Update Test',
          price: 10.00,
          ingredients: ['test'],
          category: Category.MAIN,
        },
      });
      testItemId = created.id;

      const res = await request(app)
        .put(`/api/menu-items/${created.id}`)
        .send({
          name: 'Updated Name',
          available: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.available).toBe(false);
    });

    it('should return 404 when updating non-existent item', async () => {
      const res = await request(app)
        .put('/api/menu-items/nonexistent')
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid update data', async () => {
      const created = await prisma.menuItem.create({
        data: {
          name: 'Validation Test',
          price: 10.00,
          ingredients: [],
          category: Category.MAIN,
        },
      });
      testItemId = created.id;

      const res = await request(app)
        .put(`/api/menu-items/${created.id}`)
        .send({ price: -10 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/menu-items/:id', () => {
    it('should delete menu item when exists', async () => {
      const created = await prisma.menuItem.create({
        data: {
          name: 'Delete Test',
          price: 5.00,
          ingredients: [],
          category: Category.DRINK,
        },
      });

      const res = await request(app).delete(`/api/menu-items/${created.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(created.id);

      // Verify deleted
      const found = await prisma.menuItem.findUnique({ where: { id: created.id } });
      expect(found).toBeNull();

      testItemId = null; // Already deleted
    });

    it('should return 404 when deleting non-existent item', async () => {
      const res = await request(app).delete('/api/menu-items/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
