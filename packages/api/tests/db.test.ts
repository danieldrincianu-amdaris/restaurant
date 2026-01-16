import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { prisma, connectDatabase } from '../src/lib/prisma.js';
import { Category, FoodType } from '@prisma/client';

describe('Database Connection', () => {
  it('should connect to database', async () => {
    const connected = await connectDatabase();
    expect(connected).toBe(true);
    
    const result = await prisma.$queryRaw<[{ connected: number }]>`SELECT 1 as connected`;
    expect(result[0].connected).toBe(1);
  });
});

describe('MenuItem Model', () => {
  let testItemId: string | null = null;

  afterEach(async () => {
    // Cleanup test item
    if (testItemId) {
      await prisma.menuItem.delete({ where: { id: testItemId } }).catch(() => {});
      testItemId = null;
    }
  });

  it('should create a menu item', async () => {
    const item = await prisma.menuItem.create({
      data: {
        name: 'Test Pizza',
        price: 15.99,
        ingredients: ['cheese', 'tomato', 'basil'],
        category: Category.MAIN,
        foodType: FoodType.PIZZA,
      },
    });
    
    testItemId = item.id;
    
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Test Pizza');
    expect(Number(item.price)).toBe(15.99);
    expect(item.category).toBe('MAIN');
    expect(item.available).toBe(true);
  });

  it('should read a menu item by id', async () => {
    const created = await prisma.menuItem.create({
      data: {
        name: 'Test Pasta',
        price: 12.99,
        ingredients: ['pasta', 'sauce'],
        category: Category.MAIN,
        foodType: FoodType.PASTA,
      },
    });
    
    testItemId = created.id;
    
    const found = await prisma.menuItem.findUnique({
      where: { id: created.id },
    });
    
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Test Pasta');
  });

  it('should update a menu item', async () => {
    const created = await prisma.menuItem.create({
      data: {
        name: 'Update Test',
        price: 10.00,
        ingredients: ['test'],
        category: Category.APPETIZER,
      },
    });
    
    testItemId = created.id;
    
    const updated = await prisma.menuItem.update({
      where: { id: created.id },
      data: { name: 'Updated Name', available: false },
    });
    
    expect(updated.name).toBe('Updated Name');
    expect(updated.available).toBe(false);
  });

  it('should delete a menu item', async () => {
    const created = await prisma.menuItem.create({
      data: {
        name: 'Delete Test',
        price: 5.00,
        ingredients: ['test'],
        category: Category.DRINK,
      },
    });
    
    await prisma.menuItem.delete({ where: { id: created.id } });
    
    const found = await prisma.menuItem.findUnique({
      where: { id: created.id },
    });
    
    expect(found).toBeNull();
  });

  it('should filter menu items by category', async () => {
    const item = await prisma.menuItem.create({
      data: {
        name: 'Filter Test Dessert',
        price: 8.00,
        ingredients: ['sugar'],
        category: Category.DESSERT,
      },
    });
    
    testItemId = item.id;
    
    const desserts = await prisma.menuItem.findMany({
      where: { category: Category.DESSERT },
    });
    
    expect(desserts.length).toBeGreaterThan(0);
    expect(desserts.every(d => d.category === 'DESSERT')).toBe(true);
  });
});
