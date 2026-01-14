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
      menuItem: {
        findUnique: vi.fn(),
      },
      orderItem: {
        create: vi.fn(),
        findUnique: vi.fn(),
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

  describe('addOrderItem', () => {
    it('should add item to order successfully', async () => {
      const mockOrder = { id: 'order1', tableNumber: 5 };
      const mockMenuItem = { id: 'menu1', name: 'Pizza', available: true };
      const mockOrderWithItem = {
        id: 'order1',
        tableNumber: 5,
        items: [{ id: 'item1', menuItemId: 'menu1', quantity: 2 }],
      };

      mockPrisma.order.findUnique.mockResolvedValueOnce(mockOrder);
      mockPrisma.menuItem.findUnique.mockResolvedValue(mockMenuItem);
      mockPrisma.orderItem.create.mockResolvedValue({ id: 'item1' });
      mockPrisma.order.findUnique.mockResolvedValueOnce(mockOrderWithItem);

      const result = await orderService.addOrderItem('order1', {
        menuItemId: 'menu1',
        quantity: 2,
        specialInstructions: 'No olives',
      });

      expect(result).toEqual(mockOrderWithItem);
      expect(mockPrisma.orderItem.create).toHaveBeenCalledWith({
        data: {
          orderId: 'order1',
          menuItemId: 'menu1',
          quantity: 2,
          specialInstructions: 'No olives',
        },
      });
    });

    it('should return null when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.addOrderItem('order999', {
        menuItemId: 'menu1',
        quantity: 2,
      });

      expect(result).toBeNull();
      expect(mockPrisma.orderItem.create).not.toHaveBeenCalled();
    });

    it('should throw error when menu item not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.menuItem.findUnique.mockResolvedValue(null);

      await expect(
        orderService.addOrderItem('order1', {
          menuItemId: 'menu999',
          quantity: 2,
        })
      ).rejects.toThrow('Menu item not found');
    });

    it('should throw error when menu item unavailable', async () => {
      const mockMenuItem = { id: 'menu1', name: 'Pizza', available: false };
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.menuItem.findUnique.mockResolvedValue(mockMenuItem);

      await expect(
        orderService.addOrderItem('order1', {
          menuItemId: 'menu1',
          quantity: 2,
        })
      ).rejects.toThrow("Menu item 'Pizza' is not available (86'd)");
    });
  });

  describe('updateOrderItem', () => {
    it('should update order item successfully', async () => {
      const mockOrder = { id: 'order1' };
      const mockOrderItem = { id: 'item1', orderId: 'order1', quantity: 2 };
      const mockUpdatedOrder = {
        id: 'order1',
        items: [{ id: 'item1', quantity: 3, specialInstructions: 'Extra cheese' }],
      };

      mockPrisma.order.findUnique.mockResolvedValueOnce(mockOrder);
      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.orderItem.update.mockResolvedValue({ ...mockOrderItem, quantity: 3 });
      mockPrisma.order.findUnique.mockResolvedValueOnce(mockUpdatedOrder);

      const result = await orderService.updateOrderItem('order1', 'item1', {
        quantity: 3,
        specialInstructions: 'Extra cheese',
      });

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockPrisma.orderItem.update).toHaveBeenCalledWith({
        where: { id: 'item1' },
        data: { quantity: 3, specialInstructions: 'Extra cheese' },
      });
    });

    it('should return null when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.updateOrderItem('order999', 'item1', { quantity: 3 });

      expect(result).toBeNull();
      expect(mockPrisma.orderItem.update).not.toHaveBeenCalled();
    });

    it('should return null when order item not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.orderItem.findUnique.mockResolvedValue(null);

      const result = await orderService.updateOrderItem('order1', 'item999', { quantity: 3 });

      expect(result).toBeNull();
      expect(mockPrisma.orderItem.update).not.toHaveBeenCalled();
    });

    it('should return null when order item belongs to different order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.orderItem.findUnique.mockResolvedValue({
        id: 'item1',
        orderId: 'order2',
      });

      const result = await orderService.updateOrderItem('order1', 'item1', { quantity: 3 });

      expect(result).toBeNull();
      expect(mockPrisma.orderItem.update).not.toHaveBeenCalled();
    });
  });

  describe('removeOrderItem', () => {
    it('should remove order item successfully', async () => {
      const mockOrder = { id: 'order1' };
      const mockOrderItem = { id: 'item1', orderId: 'order1' };
      const mockUpdatedOrder = { id: 'order1', items: [] };

      mockPrisma.order.findUnique.mockResolvedValueOnce(mockOrder);
      mockPrisma.orderItem.findUnique.mockResolvedValue(mockOrderItem);
      mockPrisma.orderItem.delete.mockResolvedValue(mockOrderItem);
      mockPrisma.order.findUnique.mockResolvedValueOnce(mockUpdatedOrder);

      const result = await orderService.removeOrderItem('order1', 'item1');

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockPrisma.orderItem.delete).toHaveBeenCalledWith({
        where: { id: 'item1' },
      });
    });

    it('should return null when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.removeOrderItem('order999', 'item1');

      expect(result).toBeNull();
      expect(mockPrisma.orderItem.delete).not.toHaveBeenCalled();
    });

    it('should return null when order item not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.orderItem.findUnique.mockResolvedValue(null);

      const result = await orderService.removeOrderItem('order1', 'item999');

      expect(result).toBeNull();
      expect(mockPrisma.orderItem.delete).not.toHaveBeenCalled();
    });

    it('should return null when order item belongs to different order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.orderItem.findUnique.mockResolvedValue({
        id: 'item1',
        orderId: 'order2',
      });

      const result = await orderService.removeOrderItem('order1', 'item1');

      expect(result).toBeNull();
      expect(mockPrisma.orderItem.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status for valid transition PENDING to IN_PROGRESS', async () => {
      const mockOrder = { id: 'order1', status: 'PENDING' };
      const mockUpdatedOrder = {
        id: 'order1',
        status: 'IN_PROGRESS',
        updatedAt: new Date(),
        items: [],
      };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus('order1', { status: 'IN_PROGRESS' });

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order1' },
        data: { status: 'IN_PROGRESS' },
        include: mockOrderWithItems,
      });
    });

    it('should update status for valid transition PENDING to CANCELED', async () => {
      const mockOrder = { id: 'order1', status: 'PENDING' };
      const mockUpdatedOrder = { id: 'order1', status: 'CANCELED', items: [] };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus('order1', { status: 'CANCELED' });

      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should update status for valid transition IN_PROGRESS to COMPLETED', async () => {
      const mockOrder = { id: 'order1', status: 'IN_PROGRESS' };
      const mockUpdatedOrder = { id: 'order1', status: 'COMPLETED', items: [] };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus('order1', { status: 'COMPLETED' });

      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should update status for valid transition IN_PROGRESS to HALTED', async () => {
      const mockOrder = { id: 'order1', status: 'IN_PROGRESS' };
      const mockUpdatedOrder = { id: 'order1', status: 'HALTED', items: [] };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus('order1', { status: 'HALTED' });

      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should update status for valid transition HALTED to IN_PROGRESS', async () => {
      const mockOrder = { id: 'order1', status: 'HALTED' };
      const mockUpdatedOrder = { id: 'order1', status: 'IN_PROGRESS', items: [] };

      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await orderService.updateOrderStatus('order1', { status: 'IN_PROGRESS' });

      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should throw error for invalid transition COMPLETED to IN_PROGRESS', async () => {
      const mockOrder = { id: 'order1', status: 'COMPLETED' };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        orderService.updateOrderStatus('order1', { status: 'IN_PROGRESS' })
      ).rejects.toThrow('Cannot transition from COMPLETED to IN_PROGRESS');
    });

    it('should throw error for invalid transition CANCELED to PENDING', async () => {
      const mockOrder = { id: 'order1', status: 'CANCELED' };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        orderService.updateOrderStatus('order1', { status: 'PENDING' })
      ).rejects.toThrow('Cannot transition from CANCELED to PENDING');
    });

    it('should return null when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.updateOrderStatus('order999', { status: 'IN_PROGRESS' });

      expect(result).toBeNull();
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });
  });
});