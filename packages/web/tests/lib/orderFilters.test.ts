import { describe, it, expect } from 'vitest';
import { Order, OrderStatus } from '@restaurant/shared';
import {
  filterRecentCompleted,
  filterByStatus,
  excludeCanceled,
  applyKitchenFilters,
} from '../../src/lib/orderFilters';

describe('orderFilters', () => {
  const now = new Date();

  const createOrder = (
    id: string,
    status: OrderStatus,
    minutesAgo: number = 0
  ): Order => ({
    id,
    tableNumber: 1,
    serverName: 'Test',
    status,
    createdAt: new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString(),
    items: [],
  });

  describe('filterRecentCompleted', () => {
    it('returns completed orders within time window', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.COMPLETED, 10), // 10 min ago
        createOrder('2', OrderStatus.COMPLETED, 20), // 20 min ago
        createOrder('3', OrderStatus.PENDING, 5),
      ];

      const result = filterRecentCompleted(orders, 30);

      expect(result).toHaveLength(2);
      expect(result.map((o) => o.id)).toEqual(['1', '2']);
    });

    it('excludes completed orders older than time window', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.COMPLETED, 10), // 10 min ago
        createOrder('2', OrderStatus.COMPLETED, 45), // 45 min ago - too old
        createOrder('3', OrderStatus.COMPLETED, 60), // 60 min ago - too old
      ];

      const result = filterRecentCompleted(orders, 30);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('1');
    });

    it('excludes non-completed orders', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING, 5),
        createOrder('2', OrderStatus.IN_PROGRESS, 10),
        createOrder('3', OrderStatus.COMPLETED, 15),
      ];

      const result = filterRecentCompleted(orders, 30);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('3');
    });

    it('uses default 30 minute window', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.COMPLETED, 25),
        createOrder('2', OrderStatus.COMPLETED, 35),
      ];

      const result = filterRecentCompleted(orders);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('1');
    });
  });

  describe('filterByStatus', () => {
    it('returns only orders matching specified status', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING),
        createOrder('2', OrderStatus.IN_PROGRESS),
        createOrder('3', OrderStatus.PENDING),
        createOrder('4', OrderStatus.COMPLETED),
      ];

      const result = filterByStatus(orders, OrderStatus.PENDING);

      expect(result).toHaveLength(2);
      expect(result.map((o) => o.id)).toEqual(['1', '3']);
    });

    it('returns empty array when no matches', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING),
        createOrder('2', OrderStatus.IN_PROGRESS),
      ];

      const result = filterByStatus(orders, OrderStatus.HALTED);

      expect(result).toHaveLength(0);
    });
  });

  describe('excludeCanceled', () => {
    it('removes canceled orders from array', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING),
        createOrder('2', OrderStatus.CANCELED),
        createOrder('3', OrderStatus.COMPLETED),
        createOrder('4', OrderStatus.CANCELED),
      ];

      const result = excludeCanceled(orders);

      expect(result).toHaveLength(2);
      expect(result.map((o) => o.id)).toEqual(['1', '3']);
    });

    it('returns all orders when none are canceled', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING),
        createOrder('2', OrderStatus.COMPLETED),
      ];

      const result = excludeCanceled(orders);

      expect(result).toHaveLength(2);
    });
  });

  describe('applyKitchenFilters', () => {
    it('excludes canceled orders by default', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING),
        createOrder('2', OrderStatus.CANCELED),
        createOrder('3', OrderStatus.COMPLETED, 10),
      ];

      const result = applyKitchenFilters(orders);

      expect(result).toHaveLength(2);
      expect(result.find((o) => o.status === OrderStatus.CANCELED)).toBeUndefined();
    });

    it('includes canceled orders when showCanceled is true', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING),
        createOrder('2', OrderStatus.CANCELED),
      ];

      const result = applyKitchenFilters(orders, true);

      expect(result).toHaveLength(2);
      expect(result.find((o) => o.status === OrderStatus.CANCELED)).toBeDefined();
    });

    it('filters completed orders to recent only', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING),
        createOrder('2', OrderStatus.COMPLETED, 10), // Recent
        createOrder('3', OrderStatus.COMPLETED, 45), // Too old
      ];

      const result = applyKitchenFilters(orders, false, 30);

      expect(result).toHaveLength(2);
      expect(result.map((o) => o.id)).toEqual(['1', '2']);
    });

    it('keeps all non-completed orders regardless of age', () => {
      const orders: Order[] = [
        createOrder('1', OrderStatus.PENDING, 60), // Old but not completed
        createOrder('2', OrderStatus.IN_PROGRESS, 45), // Old but not completed
        createOrder('3', OrderStatus.HALTED, 30), // Old but not completed
      ];

      const result = applyKitchenFilters(orders, false, 30);

      expect(result).toHaveLength(3);
    });
  });
});
