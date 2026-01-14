import { useState } from 'react';
import { api } from '../lib/api';
import { Order } from '@restaurant/shared';

interface OrderItem {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

interface CreateOrderInput {
  tableNumber: number;
  serverName: string;
  items: OrderItem[];
}

interface CreateOrderResponse {
  data: Order;
}

export function useCreateOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (input: CreateOrderInput): Promise<Order> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post<CreateOrderResponse>('/orders', input);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createOrder,
    isSubmitting,
    error,
  };
}
