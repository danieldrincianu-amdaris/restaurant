import { useState } from 'react';
import { api } from '../lib/api';
import { Order } from '@restaurant/shared';

interface OrderResponse {
  data: Order;
}

export function useDeleteOrder(): {
  deleteOrder: (orderId: string) => Promise<Order | null>;
  isDeleting: boolean;
  error: string | null;
} {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteOrder = async (orderId: string): Promise<Order | null> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await api.delete<OrderResponse>(`/orders/${orderId}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order';
      setError(errorMessage);
      return null;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteOrder, isDeleting, error };
}
