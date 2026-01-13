import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Category, FoodType, MenuItem } from '@restaurant/shared';
import MenuManagement from '../../src/pages/admin/MenuManagement';
import * as useMenuItemsHook from '../../src/hooks/useMenuItems';
import * as useUpdateAvailabilityHook from '../../src/hooks/useUpdateAvailability';

// Mock the hooks
vi.mock('../../src/hooks/useMenuItems');
vi.mock('../../src/hooks/useUpdateAvailability');

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('MenuManagement Page', () => {
  const mockUpdateAvailability = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useUpdateAvailabilityHook, 'useUpdateAvailability').mockReturnValue({
      updateAvailability: mockUpdateAvailability,
      isUpdating: false,
      error: null,
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
});
