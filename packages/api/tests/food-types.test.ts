import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../src/app.js';
import { prisma, connectDatabase, disconnectDatabase } from '../src/lib/prisma.js';
import { FoodType } from '@prisma/client';

describe('Food Types API', () => {
  let app: Express;

  beforeAll(async () => {
    await connectDatabase();
    app = createApp(prisma);
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('GET /api/food-types', () => {
    it('should return 200 with array of food type values', async () => {
      const res = await request(app).get('/api/food-types');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should contain all FoodType enum values', async () => {
      const res = await request(app).get('/api/food-types');

      expect(res.status).toBe(200);
      const expectedFoodTypes = Object.values(FoodType);
      expect(res.body.data).toEqual(expect.arrayContaining(expectedFoodTypes));
      expect(res.body.data).toHaveLength(expectedFoodTypes.length);
    });

    it('should match response format { data: [...] }', async () => {
      const res = await request(app).get('/api/food-types');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).not.toHaveProperty('error');
    });
  });
});
