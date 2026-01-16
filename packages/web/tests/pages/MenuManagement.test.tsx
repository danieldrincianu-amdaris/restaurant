import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Category, FoodType, MenuItem } from '@restaurant/shared';
import MenuManagement from '../../src/pages/admin/MenuManagement';
import * as useMenuItemsHook from '../../src/hooks/useMenuItems';
import * as useUpdateAvailabilityHook from '../../src/hooks/useUpdateAvailability';
import * as useDeleteMenuItemHook from '../../src/hooks/useDeleteMenuItem';
import * as ToastContext from '../../src/contexts/ToastContext';

// Mock the hooks
vi.mock('../../src/hooks/useMenuItems');
vi.mock('../../src/hooks/useUpdateAvailability');
vi.mock('../../src/hooks/useDeleteMenuItem');
vi.mock('../../src/contexts/ToastContext', async () => {
  const actual = await vi.importActual('../../src/contexts/ToastContext');
  return {
    ...actual,
    useToast: vi.fn(),
  };
});

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    price: 12.99,
    ingredients: ['romaine', 'parmesan'],
    imageUrl: null,
    category: Category.APPETIZER,
    foodType: FoodType.SALAD,
    available: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('MenuManagement Page', () => {
  const mockUpdateAvailability = vi.fn();
  const mockRefetch = vi.fn();
  const mockDeleteMenuItem = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useUpdateAvailabilityHook, 'useUpdateAvailability').mockReturnValue({
      updateAvailability: mockUpdateAvailability,
      isUpdating: false,
      error: null,
    });

    vi.spyOn(useDeleteMenuItemHook, 'useDeleteMenuItem').mockReturnValue({
      deleteMenuItem: mockDeleteMenuItem,
      isDeleting: false,
      error: null,
    });

    vi.spyOn(ToastContext, 'useToast').mockReturnValue({
      toasts: [],
      showToast: mockShowToast,
      removeToast: vi.fn(),
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('displays loading spinner while fetching', () => {
    vi.spyOn(useMenuItemsHook, 'useMenuItems').mockReturnValue({
      items: [],
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<MenuManagement />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays empty state when no items exist', () => {
    vi.spyOn(useMenuItemsHook, 'useMenuItems').mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<MenuManagement />);

    expect(screen.getByText('No menu items yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first item to get started!')).toBeInTheDocument();
  });

  it('displays error state on API failure', () => {
    vi.spyOn(useMenuItemsHook, 'useMenuItems').mockReturnValue({
      items: [],
      isLoading: false,
      error: 'Failed to fetch menu items',
      refetch: mockRefetch,
    });

    renderWithRouter(<MenuManagement />);

    expect(screen.getByText('Error loading menu items')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch menu items')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('displays menu items when loaded successfully', () => {
    vi.spyOn(useMenuItemsHook, 'useMenuItems').mockReturnValue({
      items: mockMenuItems,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<MenuManagement />);

    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
  });

  it('renders page header and add button', () => {
    vi.spyOn(useMenuItemsHook, 'useMenuItems').mockReturnValue({
      items: mockMenuItems,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<MenuManagement />);

    expect(screen.getByText('Menu Management')).toBeInTheDocument();
    expect(screen.getByText('+ Add New Item')).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    vi.spyOn(useMenuItemsHook, 'useMenuItems').mockReturnValue({
      items: mockMenuItems,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithRouter(<MenuManagement />);

    expect(screen.getByText('Filter:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
  });

  describe('Delete functionality', () => {
    beforeEach(() => {
      vi.spyOn(useMenuItemsHook, 'useMenuItems').mockReturnValue({
        items: mockMenuItems,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });
    });

    it('delete button opens confirmation modal', async () => {
      renderWithRouter(<MenuManagement />);

      const deleteButton = screen.getByRole('button', { name: /delete caesar salad/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Menu Item')).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to delete 'caesar salad'/i)).toBeInTheDocument();
      });
    });

    it('confirming delete removes item from list', async () => {
      mockDeleteMenuItem.mockResolvedValue(mockMenuItems[0]);

      renderWithRouter(<MenuManagement />);

      // Open modal
      const deleteButton = screen.getByRole('button', { name: /delete caesar salad/i });
      fireEvent.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByText('Delete Menu Item')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteMenuItem).toHaveBeenCalledWith('1');
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('successful delete shows success toast', async () => {
      mockDeleteMenuItem.mockResolvedValue(mockMenuItems[0]);

      renderWithRouter(<MenuManagement />);

      // Open modal and confirm
      const deleteButton = screen.getByRole('button', { name: /delete caesar salad/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Menu Item')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Caesar Salad deleted successfully', 'success');
      });
    });

    it('failed delete shows error toast', async () => {
      mockDeleteMenuItem.mockRejectedValue(new Error('Failed to delete item'));

      renderWithRouter(<MenuManagement />);

      // Open modal and confirm
      const deleteButton = screen.getByRole('button', { name: /delete caesar salad/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Menu Item')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Failed to delete item', 'error');
      });
    });

    it('cancel closes modal without deleting', async () => {
      renderWithRouter(<MenuManagement />);

      // Open modal
      const deleteButton = screen.getByRole('button', { name: /delete caesar salad/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Menu Item')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Delete Menu Item')).not.toBeInTheDocument();
      });

      expect(mockDeleteMenuItem).not.toHaveBeenCalled();
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });
});
