import { useState } from 'react';
import { MenuItem } from '@restaurant/shared';
import { api } from '../lib/api';

interface UseDeleteMenuItemResult {
  deleteMenuItem: (id: string) => Promise<MenuItem>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteMenuItem(): UseDeleteMenuItemResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMenuItem = async (id: string): Promise<MenuItem> => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await api.delete<{ data: MenuItem }>(`/menu-items/${id}`);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteMenuItem,
    isDeleting,
    error,
  };
}
