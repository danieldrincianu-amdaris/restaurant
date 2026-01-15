import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MenuService } from '../src/services/menu.service.js';
import { Category, FoodType } from '@prisma/client';

describe('MenuService', () => {
  let menuService: MenuService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      menuItem: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    menuService = new MenuService(mockPrisma);
  });

  describe('getAllMenuItems', () => {
    it('should return all menu items without filters', async () => {
      const mockItems = [{ id: '1', name: 'Pizza' }, { id: '2', name: 'Pasta' }];
      mockPrisma.menuItem.findMany.mockResolvedValue(mockItems);

      const result = await menuService.getAllMenuItems();

      expect(result).toEqual(mockItems);
      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by category', async () => {
      const mockItems = [{ id: '1', name: 'Pizza', category: 'MAIN' }];
      mockPrisma.menuItem.findMany.mockResolvedValue(mockItems);

      await menuService.getAllMenuItems({ category: Category.MAIN });

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { category: 'MAIN' },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should filter by foodType and available', async () => {
      mockPrisma.menuItem.findMany.mockResolvedValue([]);

      await menuService.getAllMenuItems({
        foodType: FoodType.PIZZA,
        available: true,
      });

      expect(mockPrisma.menuItem.findMany).toHaveBeenCalledWith({
        where: { foodType: 'PIZZA', available: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('getMenuItemById', () => {
    it('should return menu item when found', async () => {
      const mockItem = { id: '1', name: 'Pizza' };
      mockPrisma.menuItem.findUnique.mockResolvedValue(mockItem);

      const result = await menuService.getMenuItemById('1');

      expect(result).toEqual(mockItem);
      expect(mockPrisma.menuItem.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null when not found', async () => {
      mockPrisma.menuItem.findUnique.mockResolvedValue(null);

      const result = await menuService.getMenuItemById('999');

      expect(result).toBeNull();
    });
  });

  describe('createMenuItem', () => {
    it('should create menu item with valid data', async () => {
      const input = {
        name: 'Pizza',
        price: 15.99,
        ingredients: ['cheese', 'tomato'],
        category: Category.MAIN,
        foodType: FoodType.PIZZA,
        available: true,
      };
      const mockCreated = { id: '1', ...input };
      mockPrisma.menuItem.create.mockResolvedValue(mockCreated);

      const result = await menuService.createMenuItem(input);

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.menuItem.create).toHaveBeenCalledWith({
        data: {
          name: 'Pizza',
          price: 15.99,
          ingredients: ['cheese', 'tomato'],
          imageUrl: null,
          category: 'MAIN',
          foodType: 'PIZZA',
          available: true,
        },
      });
    });
  });

  describe('updateMenuItem', () => {
    it('should update menu item when exists', async () => {
      const existing = { id: '1', name: 'Pizza' };
      const update = { name: 'Updated Pizza' };
      const mockUpdated = { ...existing, ...update };

      mockPrisma.menuItem.findUnique.mockResolvedValue(existing);
      mockPrisma.menuItem.update.mockResolvedValue(mockUpdated);

      const result = await menuService.updateMenuItem('1', update);

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.menuItem.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: update,
      });
    });

    it('should return null when item does not exist', async () => {
      mockPrisma.menuItem.findUnique.mockResolvedValue(null);

      const result = await menuService.updateMenuItem('999', { name: 'Test' });

      expect(result).toBeNull();
      expect(mockPrisma.menuItem.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete menu item when exists', async () => {
      const existing = { id: '1', name: 'Pizza' };
      mockPrisma.menuItem.findUnique.mockResolvedValue(existing);
      mockPrisma.menuItem.delete.mockResolvedValue(existing);

      const result = await menuService.deleteMenuItem('1');

      expect(result).toEqual(existing);
      expect(mockPrisma.menuItem.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null when item does not exist', async () => {
      mockPrisma.menuItem.findUnique.mockResolvedValue(null);

      const result = await menuService.deleteMenuItem('999');

      expect(result).toBeNull();
      expect(mockPrisma.menuItem.delete).not.toHaveBeenCalled();
    });
  });
});
