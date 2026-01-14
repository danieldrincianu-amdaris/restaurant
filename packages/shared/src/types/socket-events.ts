// WebSocket event constants and payload types for Socket.io

import { Order, OrderItem, OrderStatus } from './order.js';
import { MenuItem } from './menu.js';

export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Order events (server → client broadcasts)
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  ORDER_STATUS_CHANGED: 'order:status-changed',
  
  // Order item events (server → client broadcasts)
  ORDER_ITEM_ADDED: 'order-item:added',
  ORDER_ITEM_UPDATED: 'order-item:updated',
  ORDER_ITEM_REMOVED: 'order-item:removed',
  
  // Menu item events (server → client broadcasts)
  MENU_ITEM_CREATED: 'menu-item:created',
  MENU_ITEM_UPDATED: 'menu-item:updated',
  MENU_ITEM_DELETED: 'menu-item:deleted',
  
  // Room subscription events (client → server)
  JOIN_KITCHEN: 'join:kitchen',
  LEAVE_KITCHEN: 'leave:kitchen',
  JOIN_ORDERS: 'join:orders',
  LEAVE_ORDERS: 'leave:orders',
} as const;

// Event payload types

export interface OrderCreatedPayload {
  order: Order;
}

export interface OrderUpdatedPayload {
  order: Order;
  changedFields?: string[];
}

export interface OrderDeletedPayload {
  orderId: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  updatedAt: string;
}

export interface OrderItemAddedPayload {
  orderId: string;
  item: OrderItem;
}

export interface OrderItemUpdatedPayload {
  orderId: string;
  item: OrderItem;
}

export interface OrderItemRemovedPayload {
  orderId: string;
  itemId: string;
}

export interface MenuItemCreatedPayload {
  menuItem: MenuItem;
}

export interface MenuItemUpdatedPayload {
  menuItem: MenuItem;
  changedFields?: string[];
}

export interface MenuItemDeletedPayload {
  menuItemId: string;
}
