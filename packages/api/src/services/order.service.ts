import { PrismaClient } from '@prisma/client';
import { CreateOrderInput, UpdateOrderInput } from '../schemas/order.schema.js';
import { AddOrderItemInput, UpdateOrderItemInput } from '../schemas/order-item.schema.js';
import { UpdateStatusInput, STATUS_TRANSITIONS } from '../schemas/order-status.schema.js';
import { AppError, invalidStatusTransition } from '../utils/errors.js';

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

  async addOrderItem(orderId: string, data: AddOrderItemInput) {
    // Check order exists
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return null;
    }

    // Check menu item exists and is available
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: data.menuItemId },
    });

    if (!menuItem) {
      throw new AppError(
        'MENU_ITEM_NOT_FOUND',
        'Menu item not found',
        400
      );
    }

    if (!menuItem.available) {
      throw new AppError(
        'MENU_ITEM_UNAVAILABLE',
        `Menu item '${menuItem.name}' is not available (86'd)`,
        400
      );
    }

    // Create order item
    await this.prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: data.menuItemId,
        quantity: data.quantity,
        specialInstructions: data.specialInstructions,
      },
    });

    // Return full order with items
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderWithItems,
    });
  }

  async updateOrderItem(orderId: string, itemId: string, data: UpdateOrderItemInput) {
    // Check order exists
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return null;
    }

    // Check order item exists and belongs to the order
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!orderItem || orderItem.orderId !== orderId) {
      return null;
    }

    // Update order item
    await this.prisma.orderItem.update({
      where: { id: itemId },
      data,
    });

    // Return full order with items
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderWithItems,
    });
  }

  async removeOrderItem(orderId: string, itemId: string) {
    // Check order exists
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return null;
    }

    // Check order item exists and belongs to the order
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!orderItem || orderItem.orderId !== orderId) {
      return null;
    }

    // Delete order item
    await this.prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Return full order with remaining items
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderWithItems,
    });
  }

  async updateOrderStatus(id: string, data: UpdateStatusInput) {
    // Check order exists
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      return null;
    }

    // Get current status
    const currentStatus = order.status;
    const newStatus = data.status;

    // Validate transition using STATUS_TRANSITIONS map
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw invalidStatusTransition(currentStatus, newStatus);
    }

    // Update order status (Prisma auto-updates updatedAt)
    return this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: orderWithItems,
    });
  }
}
