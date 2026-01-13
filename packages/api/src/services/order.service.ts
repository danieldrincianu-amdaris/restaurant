import { PrismaClient } from '@prisma/client';
import { CreateOrderInput, UpdateOrderInput } from '../schemas/order.schema.js';

export interface OrderFilters {
  status?: string;
  tableNumber?: number;
}

// Include for returning orders with items and menuItem details
const orderWithItems = {
  items: {
    include: {
      menuItem: true,
    },
  },
};

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async getAllOrders(filters?: OrderFilters) {
    const where: Record<string, unknown> = {};
    
    if (filters?.status) {
      where['status'] = filters.status;
    }
    
    if (filters?.tableNumber) {
      where['tableNumber'] = filters.tableNumber;
    }
    
    return this.prisma.order.findMany({
      where,
      include: orderWithItems,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: orderWithItems,
    });
  }

  async createOrder(data: CreateOrderInput) {
    return this.prisma.order.create({
      data: {
        tableNumber: data.tableNumber,
        serverName: data.serverName,
        status: 'PENDING',
      },
      include: orderWithItems,
    });
  }

  async updateOrder(id: string, data: UpdateOrderInput) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    return this.prisma.order.update({
      where: { id },
      data,
      include: orderWithItems,
    });
  }

  async deleteOrder(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    return this.prisma.order.delete({
      where: { id },
      include: orderWithItems,
    });
  }
}
