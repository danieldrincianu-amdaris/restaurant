import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../src/app.js';
import { prisma, connectDatabase, disconnectDatabase } from '../src/lib/prisma.js';
import { Category } from '@prisma/client';

describe('Categories API', () => {
  let app: Express;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp(prisma);
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('GET /api/categories', () => {
    it('should return 200 with array of category values', async () => {
      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should contain exactly APPETIZER, MAIN, DRINK, DESSERT', async () => {
      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(
        expect.arrayContaining(['APPETIZER', 'MAIN', 'DRINK', 'DESSERT'])
      );
      expect(res.body.data).toHaveLength(4);
    });

    it('should match response format { data: [...] }', async () => {
      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).not.toHaveProperty('error');
    });
  });
});
