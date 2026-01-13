import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '../src/services/order.service.js';

describe('OrderService', () => {
  let orderService: OrderService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPrisma: any;

  const mockOrderWithItems = {
    items: {
      include: {
        menuItem: true,
      },
    },
  };

  beforeEach(() => {
    mockPrisma = {
      order: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    orderService = new OrderService(mockPrisma);
  });

  describe('getAllOrders', () => {
    it('should return all orders without filters', async () => {
      const mockOrders = [
        { id: '1', tableNumber: 5, serverName: 'Alice', items: [] },
        { id: '2', tableNumber: 12, serverName: 'Bob', items: [] },
      ];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getAllOrders();

      expect(result).toEqual(mockOrders);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: {},
        include: mockOrderWithItems,
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should filter by status', async () => {
      const mockOrders = [{ id: '1', status: 'PENDING', items: [] }];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      await orderService.getAllOrders({ status: 'PENDING' });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        include: mockOrderWithItems,
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should filter by tableNumber', async () => {
      const mockOrders = [{ id: '1', tableNumber: 5, items: [] }];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      await orderService.getAllOrders({ tableNumber: 5 });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { tableNumber: 5 },
        include: mockOrderWithItems,
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should filter by both status and tableNumber', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);

      await orderService.getAllOrders({ status: 'IN_PROGRESS', tableNumber: 12 });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { status: 'IN_PROGRESS', tableNumber: 12 },
        include: mockOrderWithItems,
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = {
        id: '1',
        tableNumber: 5,
        serverName: 'Alice',
        items: [
          { id: 'item1', menuItemId: 'menu1', quantity: 2, menuItem: { name: 'Pizza' } },
        ],
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('1');

      expect(result).toEqual(mockOrder);
      expect(mockPrisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: mockOrderWithItems,
      });
    });

    it('should return null when not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.getOrderById('999');

      expect(result).toBeNull();
    });
  });

  describe('createOrder', () => {
    it('should create order with PENDING status', async () => {
      const input = {
        tableNumber: 5,
        serverName: 'Alice',
      };
      const mockCreated = {
        id: '1',
        tableNumber: 5,
        serverName: 'Alice',
        status: 'PENDING',
        items: [],
      };
      mockPrisma.order.create.mockResolvedValue(mockCreated);

      const result = await orderService.createOrder(input);

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.order.create).toHaveBeenCalledWith({
        data: {
          tableNumber: 5,
          serverName: 'Alice',
          status: 'PENDING',
        },
        include: mockOrderWithItems,
      });
    });
  });

  describe('updateOrder', () => {
    it('should update order when exists', async () => {
      const existing = { id: '1', tableNumber: 5, serverName: 'Alice' };
      const update = { tableNumber: 10, serverName: 'Bob' };
      const mockUpdated = { ...existing, ...update, items: [] };

      mockPrisma.order.findUnique.mockResolvedValue(existing);
      mockPrisma.order.update.mockResolvedValue(mockUpdated);

      const result = await orderService.updateOrder('1', update);

      expect(result).toEqual(mockUpdated);
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: update,
        include: mockOrderWithItems,
      });
    });

    it('should return null when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.updateOrder('999', { serverName: 'Test' });

      expect(result).toBeNull();
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteOrder', () => {
    it('should delete order when exists', async () => {
      const existing = { id: '1', tableNumber: 5, serverName: 'Alice', items: [] };
      mockPrisma.order.findUnique.mockResolvedValue(existing);
      mockPrisma.order.delete.mockResolvedValue(existing);

      const result = await orderService.deleteOrder('1');

      expect(result).toEqual(existing);
      expect(mockPrisma.order.delete).toHaveBeenCalledWith({
        where: { id: '1' },
        include: mockOrderWithItems,
      });
    });

    it('should return null when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.deleteOrder('999');

      expect(result).toBeNull();
      expect(mockPrisma.order.delete).not.toHaveBeenCalled();
    });
  });
});
