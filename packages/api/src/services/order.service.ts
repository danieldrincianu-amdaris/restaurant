import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { CreateOrderInput, UpdateOrderInput } from '../schemas/order.schema.js';
import { AddOrderItemInput, UpdateOrderItemInput } from '../schemas/order-item.schema.js';
import { UpdateStatusInput, STATUS_TRANSITIONS } from '../schemas/order-status.schema.js';
import { AppError, invalidStatusTransition } from '@restaurant/shared';
import { SOCKET_EVENTS } from '@restaurant/shared';

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
  constructor(
    private prisma: PrismaClient,
    private io: SocketIOServer
  ) {}

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
    const order = await this.prisma.order.create({
      data: {
        tableNumber: data.tableNumber,
        serverName: data.serverName,
        status: 'PENDING',
        items: data.items ? {
          create: data.items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
        } : undefined,
      },
      include: orderWithItems,
    });

    // Emit order:created event
    try {
      this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_CREATED, { order });
    } catch (error) {
      console.error('Failed to emit ORDER_CREATED:', error);
    }

    return order;
  }

  async updateOrder(id: string, data: UpdateOrderInput) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const order = await this.prisma.order.update({
      where: { id },
      data,
      include: orderWithItems,
    });

    // Emit order:updated event
    try {
      const changedFields = Object.keys(data);
      this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_UPDATED, { 
        order, 
        changedFields 
      });
    } catch (error) {
      console.error('Failed to emit ORDER_UPDATED:', error);
    }

    return order;
  }

  async deleteOrder(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return null;
    }

    const order = await this.prisma.order.delete({
      where: { id },
      include: orderWithItems,
    });

    // Emit order:deleted event
    try {
      this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_DELETED, { orderId: id });
    } catch (error) {
      console.error('Failed to emit ORDER_DELETED:', error);
    }

    return order;
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
    const createdItem = await this.prisma.orderItem.create({
      data: {
        orderId,
        menuItemId: data.menuItemId,
        quantity: data.quantity,
        specialInstructions: data.specialInstructions,
      },
      include: {
        menuItem: true,
      },
    });

    // Emit order-item:added event
    try {
      this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_ITEM_ADDED, {
        orderId,
        item: createdItem,
      });
    } catch (error) {
      console.error('Failed to emit ORDER_ITEM_ADDED:', error);
    }

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
    const updatedItem = await this.prisma.orderItem.update({
      where: { id: itemId },
      data,
      include: {
        menuItem: true,
      },
    });

    // Emit order-item:updated event
    try {
      this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_ITEM_UPDATED, {
        orderId,
        item: updatedItem,
      });
    } catch (error) {
      console.error('Failed to emit ORDER_ITEM_UPDATED:', error);
    }

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

    // Emit order-item:removed event
    try {
      this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_ITEM_REMOVED, {
        orderId,
        itemId,
      });
    } catch (error) {
      console.error('Failed to emit ORDER_ITEM_REMOVED:', error);
    }

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
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: orderWithItems,
    });

    // Emit order:status-changed event
    try {
      this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, {
        orderId: id,
        previousStatus: currentStatus,
        newStatus: newStatus,
        updatedAt: updatedOrder.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error('Failed to emit ORDER_STATUS_CHANGED:', error);
    }

    return updatedOrder;
  }

  async bulkUpdateStatus(orderIds: string[], newStatus: string) {
    // Validate all orders exist and transitions are valid
    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: orderWithItems,
    });

    if (orders.length !== orderIds.length) {
      throw new AppError('NOT_FOUND', 'One or more orders not found', 404);
    }

    // Validate all transitions are valid
    for (const order of orders) {
      const validTransitions = STATUS_TRANSITIONS[order.status];
      if (!validTransitions || !validTransitions.includes(newStatus)) {
        throw invalidStatusTransition(order.status, newStatus);
      }
    }

    // Update all orders in a transaction
    const updatedOrders = await this.prisma.$transaction(
      orders.map((order) =>
        this.prisma.order.update({
          where: { id: order.id },
          data: { status: newStatus as any },
          include: orderWithItems,
        })
      )
    );

    // Emit individual order:status-changed events for each order
    try {
      for (const order of orders) {
        const updatedOrder = updatedOrders.find(o => o.id === order.id);
        if (updatedOrder) {
          this.io.to('kitchen').to('orders').emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, {
            orderId: updatedOrder.id,
            previousStatus: order.status,
            newStatus: newStatus,
            updatedAt: updatedOrder.updatedAt.toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to emit ORDER_STATUS_CHANGED events:', error);
    }

    return updatedOrders;
  }
}
