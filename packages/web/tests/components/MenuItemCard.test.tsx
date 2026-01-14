import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItemCard from '../../src/components/staff/MenuItemCard';
import { MenuItem, Category, FoodType } from '@restaurant/shared';

describe('MenuItemCard', () => {
  const mockItem: MenuItem = {
    id: '1',
    name: 'Caesar Salad',
    price: 12.99,
    ingredients: ['Romaine', 'Parmesan', 'Croutons'],
    imageUrl: '/images/caesar.jpg',
    category: Category.APPETIZER,
    foodType: FoodType.SALAD,
    available: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOnClick = vi.fn();

  it('renders item name, price, and image correctly', () => {
    render(<MenuItemCard item={mockItem} onClick={mockOnClick} />);

    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    
    const image = screen.getByAltText('Caesar Salad');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/caesar.jpg');
  });

  it('displays placeholder image when no imageUrl', () => {
    const itemWithoutImage: MenuItem = {
      ...mockItem,
      imageUrl: null,
    };

    const { container } = render(<MenuItemCard item={itemWithoutImage} onClick={mockOnClick} />);

    expect(screen.queryByAltText('Caesar Salad')).not.toBeInTheDocument();
    // Check placeholder div exists instead of searching for emoji text
    const placeholder = container.querySelector('.bg-gray-200');
    expect(placeholder).toBeInTheDocument();
  });

  it('calls onClick handler with item when clicked', () => {
    render(<MenuItemCard item={mockItem} onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /add caesar salad to order/i });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(mockItem);
  });

  it('formats price correctly', () => {
    const itemWithDecimal: MenuItem = {
      ...mockItem,
      price: 15.5,
    };

    render(<MenuItemCard item={itemWithDecimal} onClick={mockOnClick} />);

    expect(screen.getByText('$15.50')).toBeInTheDocument();
  });

  it('formats whole number price with two decimals', () => {
    const itemWholeNumber: MenuItem = {
      ...mockItem,
      price: 20,
    };

    render(<MenuItemCard item={itemWholeNumber} onClick={mockOnClick} />);

    expect(screen.getByText('$20.00')).toBeInTheDocument();
  });
});
