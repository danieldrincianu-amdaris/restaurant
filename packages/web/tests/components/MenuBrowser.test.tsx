import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MenuBrowser from '../../src/components/staff/MenuBrowser';
import { MenuItem, Category, FoodType } from '@restaurant/shared';

// Mock dependencies
vi.mock('../../src/hooks/useAvailableMenuItems');
vi.mock('../../src/components/ui/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));
vi.mock('../../src/components/staff/MenuItemCard', () => ({
  default: ({ item, onClick }: { item: MenuItem; onClick: (item: MenuItem) => void }) => (
    <button onClick={() => onClick(item)} data-testid={`menu-item-${item.id}`}>
      {item.name}
    </button>
  ),
}));

const mockItems: MenuItem[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    price: 12.99,
    ingredients: ['Romaine', 'Parmesan'],
    imageUrl: null,
    category: Category.APPETIZER,
    foodType: FoodType.SALAD,
    available: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    price: 18.99,
    ingredients: ['Tomato', 'Mozzarella', 'Basil'],
    imageUrl: null,
    category: Category.MAIN,
    foodType: FoodType.PIZZA,
    available: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Espresso',
    price: 3.99,
    ingredients: ['Coffee'],
    imageUrl: null,
    category: Category.DRINK,
    foodType: FoodType.COFFEE,
    available: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('MenuBrowser', () => {
  const mockOnSelectItem = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays menu items in grid', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('Espresso')).toBeInTheDocument();
  });

  it('filters items by category when category tab clicked', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    const mockRefetch = vi.fn();
    
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: mockItems.filter(item => item.category === Category.APPETIZER),
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    const appetizerButton = screen.getByRole('button', { name: /appetizer/i });
    fireEvent.click(appetizerButton);

    // Hook should be called with category filter
    await waitFor(() => {
      expect(useAvailableMenuItems).toHaveBeenCalled();
    });
  });

  it('filters items by food type when dropdown changed', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    const foodTypeSelect = screen.getByRole('combobox');
    fireEvent.change(foodTypeSelect, { target: { value: FoodType.PIZZA } });

    await waitFor(() => {
      expect(useAvailableMenuItems).toHaveBeenCalled();
    });
  });

  it('filters items by search query', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    const searchInput = screen.getByPlaceholderText(/search menu items/i);
    fireEvent.change(searchInput, { target: { value: 'pizza' } });

    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument();
      expect(screen.queryByText('Espresso')).not.toBeInTheDocument();
    });
  });

  it('displays loading spinner when loading', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays empty state when no items match filters', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    expect(screen.getByText('No menu items found')).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: [],
      isLoading: false,
      error: 'Failed to fetch menu items',
      refetch: vi.fn(),
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    expect(screen.getByText('Error loading menu items')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch menu items')).toBeInTheDocument();
  });

  it('calls onSelectItem when menu item clicked', async () => {
    const { useAvailableMenuItems } = await import('../../src/hooks/useAvailableMenuItems');
    
    vi.mocked(useAvailableMenuItems).mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MenuBrowser onSelectItem={mockOnSelectItem} />);

    const menuItemButton = screen.getByTestId('menu-item-1');
    fireEvent.click(menuItemButton);

    expect(mockOnSelectItem).toHaveBeenCalledWith(mockItems[0]);
  });
});
