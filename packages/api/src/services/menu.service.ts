import { PrismaClient, MenuItem, Category, FoodType } from '@prisma/client';
import { CreateMenuItemInput, UpdateMenuItemInput } from '../schemas/menu-item.schema.js';

export interface MenuFilters {
  category?: Category;
  foodType?: FoodType;
  available?: boolean;
}

export class MenuService {
  constructor(private prisma: PrismaClient) {}

  async getAllMenuItems(filters?: MenuFilters): Promise<MenuItem[]> {
    const where: any = {};
    
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.foodType) {
      where.foodType = filters.foodType;
    }
    
    if (filters?.available !== undefined) {
      where.available = filters.available;
    }
    
    return this.prisma.menuItem.findMany({ where });
  }

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    return this.prisma.menuItem.findUnique({
      where: { id },
    });
  }

  async createMenuItem(data: CreateMenuItemInput): Promise<MenuItem> {
    return this.prisma.menuItem.create({
      data: {
        name: data.name,
        price: data.price,
        ingredients: data.ingredients,
        imageUrl: data.imageUrl ?? null,
        category: data.category,
        foodType: data.foodType ?? 'OTHER',
        available: data.available ?? true,
      },
    });
  }

  async updateMenuItem(id: string, data: UpdateMenuItemInput): Promise<MenuItem | null> {
    // Check if item exists
    const existing = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async deleteMenuItem(id: string): Promise<MenuItem | null> {
    // Check if item exists
    const existing = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}
