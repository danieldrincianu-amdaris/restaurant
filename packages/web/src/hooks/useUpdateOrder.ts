import { useState } from 'react';
import { api } from '../lib/api';
import { Order } from '@restaurant/shared';

interface OrderResponse {
  data: Order;
}

interface UpdateOrderInput {
  tableNumber?: number;
  serverName?: string;
}

interface AddOrderItemInput {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

interface UpdateOrderItemInput {
  quantity?: number;
  specialInstructions?: string;
}

export function useUpdateOrder(): {
  updateOrder: (orderId: string, data: UpdateOrderInput) => Promise<Order | null>;
  addOrderItem: (orderId: string, data: AddOrderItemInput) => Promise<Order | null>;
  updateOrderItem: (orderId: string, itemId: string, data: UpdateOrderItemInput) => Promise<Order | null>;
  removeOrderItem: (orderId: string, itemId: string) => Promise<Order | null>;
  isUpdating: boolean;
  error: string | null;
} {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateOrder = async (orderId: string, data: UpdateOrderInput): Promise<Order | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await api.put<OrderResponse>(`/orders/${orderId}`, data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const addOrderItem = async (
    orderId: string,
    itemData: AddOrderItemInput
  ): Promise<Order | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await api.post<OrderResponse>(`/orders/${orderId}/items`, itemData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateOrderItem = async (
    orderId: string,
    itemId: string,
    itemData: UpdateOrderItemInput
  ): Promise<Order | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await api.put<OrderResponse>(
        `/orders/${orderId}/items/${itemId}`,
        itemData
      );
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const removeOrderItem = async (orderId: string, itemId: string): Promise<Order | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await api.delete<OrderResponse>(`/orders/${orderId}/items/${itemId}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateOrder,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    isUpdating,
    error,
  };
}
