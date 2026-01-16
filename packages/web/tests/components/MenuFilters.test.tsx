import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Category, FoodType } from '@restaurant/shared';
import MenuFilters from '../../src/components/menu/MenuFilters';

describe('MenuFilters', () => {
  const mockHandlers = {
    onCategoryChange: vi.fn(),
    onFoodTypeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter dropdowns', () => {
    render(
      <MenuFilters
        selectedCategory=""
        selectedFoodType=""
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Filter:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
  });

  it('displays all category options', () => {
    render(
      <MenuFilters
        selectedCategory=""
        selectedFoodType=""
        {...mockHandlers}
      />
    );

    const categories = Object.values(Category);
    categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('displays all food type options', () => {
    render(
      <MenuFilters
        selectedCategory=""
        selectedFoodType=""
        {...mockHandlers}
      />
    );

    const foodTypes = Object.values(FoodType);
    foodTypes.forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  it('calls onCategoryChange when category is selected', () => {
    render(
      <MenuFilters
        selectedCategory=""
        selectedFoodType=""
        {...mockHandlers}
      />
    );

    const categorySelect = screen.getAllByRole('combobox')[0]!;
    fireEvent.change(categorySelect, { target: { value: Category.APPETIZER } });

    expect(mockHandlers.onCategoryChange).toHaveBeenCalledWith(Category.APPETIZER);
  });

  it('calls onFoodTypeChange when food type is selected', () => {
    render(
      <MenuFilters
        selectedCategory=""
        selectedFoodType=""
        {...mockHandlers}
      />
    );

    const foodTypeSelect = screen.getAllByRole('combobox')[1]!;
    fireEvent.change(foodTypeSelect, { target: { value: FoodType.PIZZA } });

    expect(mockHandlers.onFoodTypeChange).toHaveBeenCalledWith(FoodType.PIZZA);
  });

  it('displays selected values correctly', () => {
    render(
      <MenuFilters
        selectedCategory={Category.MAIN}
        selectedFoodType={FoodType.PASTA}
        {...mockHandlers}
      />
    );

    const categorySelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
    const foodTypeSelect = screen.getAllByRole('combobox')[1] as HTMLSelectElement;

    expect(categorySelect.value).toBe(Category.MAIN);
    expect(foodTypeSelect.value).toBe(FoodType.PASTA);
  });
});
