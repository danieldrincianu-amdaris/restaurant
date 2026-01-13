// Order-related types for RestaurantFlow

import type { MenuItem } from './menu.js';

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  HALTED = 'HALTED',
  CANCELED = 'CANCELED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  specialInstructions: string | null;
  createdAt: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  tableNumber: number;
  serverName: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CreateOrderInput {
  tableNumber: number;
  serverName: string;
  items?: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

// Valid status transitions
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.HALTED, OrderStatus.CANCELED],
  [OrderStatus.HALTED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELED]: [],
};
