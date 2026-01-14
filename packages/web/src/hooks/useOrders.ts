import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Order, OrderStatus } from '@restaurant/shared';

interface OrdersFilters {
  status?: OrderStatus;
  tableNumber?: number;
}

interface OrdersResponse {
  data: Order[];
  total: number;
}

export function useOrders(filters?: OrdersFilters) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.tableNumber) {
        params.append('tableNumber', filters.tableNumber.toString());
      }

      const query = params.toString();
      const endpoint = `/orders${query ? `?${query}` : ''}`;
      
      const response = await api.get<OrdersResponse>(endpoint);
      setOrders(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [filters?.status, filters?.tableNumber]);

  return {
    orders,
    isLoading,
    error,
    refresh,
  };
}
