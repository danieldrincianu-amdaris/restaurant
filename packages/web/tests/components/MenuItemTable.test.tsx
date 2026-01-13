import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Category, FoodType, MenuItem } from '@restaurant/shared';
import MenuItemTable from '../../src/components/menu/MenuItemTable';

describe('MenuItemTable', () => {
  const mockItems: MenuItem[] = [
    {
      id: '1',
      name: 'Caesar Salad',
      price: 12.99,
      ingredients: ['romaine', 'parmesan', 'croutons'],
      imageUrl: null,
      category: Category.APPETIZER,
      foodType: FoodType.SALAD,
      available: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Margherita Pizza',
      price: 18.99,
      ingredients: ['tomato', 'mozzarella', 'basil'],
      imageUrl: 'https://example.com/pizza.jpg',
      category: Category.MAIN,
      foodType: FoodType.PIZZA,
      available: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockHandlers = {
    onToggleAvailability: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders table with correct columns', () => {
    render(<MenuItemTable items={mockItems} {...mockHandlers} />);

    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getAllByText('Available')[0]).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays menu items correctly', () => {
    render(<MenuItemTable items={mockItems} {...mockHandlers} />);

    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('APPETIZER')).toBeInTheDocument();
    expect(screen.getByText('SALAD')).toBeInTheDocument();

    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument();
    expect(screen.getByText('$18.99')).toBeInTheDocument();
    expect(screen.getByText('MAIN')).toBeInTheDocument();
    expect(screen.getByText('PIZZA')).toBeInTheDocument();
  });

  it('formats price with $ and 2 decimal places', () => {
    render(<MenuItemTable items={mockItems} {...mockHandlers} />);

    expect(screen.getByText('$12.99')).toBeInTheDocument();
    expect(screen.getByText('$18.99')).toBeInTheDocument();
  });

  it('shows placeholder icon when no image', () => {
    render(<MenuItemTable items={mockItems} {...mockHandlers} />);

    const placeholders = screen.getAllByText('🍽️');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('displays availability status correctly', () => {
    render(<MenuItemTable items={mockItems} {...mockHandlers} />);

    const availableButtons = screen.getAllByText('Available');
    expect(availableButtons.length).toBeGreaterThan(0);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('renders edit and delete buttons', () => {
    render(<MenuItemTable items={mockItems} {...mockHandlers} />);

    const editButtons = screen.getAllByText(/Edit/);
    const deleteButtons = screen.getAllByText(/Delete/);

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });
});
