import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import IngredientsInput from '../../src/components/menu/IngredientsInput';

describe('IngredientsInput', () => {
  it('renders with empty ingredients list', () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={[]} onChange={mockOnChange} />);
    
    expect(screen.getByPlaceholderText(/type ingredient/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ add/i })).toBeInTheDocument();
  });

  it('displays existing ingredients as chips', () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={['tomato', 'cheese', 'basil']} onChange={mockOnChange} />);
    
    expect(screen.getByText('tomato')).toBeInTheDocument();
    expect(screen.getByText('cheese')).toBeInTheDocument();
    expect(screen.getByText('basil')).toBeInTheDocument();
  });

  it('adds ingredient when clicking Add button', async () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={[]} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/type ingredient/i);
    await userEvent.type(input, 'lettuce');
    
    const addButton = screen.getByRole('button', { name: /\+ add/i });
    await userEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['lettuce']);
  });

  it('adds ingredient when pressing Enter key', async () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={[]} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/type ingredient/i);
    await userEvent.type(input, 'onion{Enter}');
    
    expect(mockOnChange).toHaveBeenCalledWith(['onion']);
  });

  it('removes ingredient when clicking remove button', async () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={['tomato', 'cheese']} onChange={mockOnChange} />);
    
    const removeButton = screen.getByLabelText(/remove tomato/i);
    await userEvent.click(removeButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['cheese']);
  });

  it('does not add duplicate ingredients', async () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={['tomato']} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/type ingredient/i);
    await userEvent.type(input, 'tomato');
    
    const addButton = screen.getByRole('button', { name: /\+ add/i });
    await userEvent.click(addButton);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('trims whitespace from ingredients', async () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={[]} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText(/type ingredient/i);
    await userEvent.type(input, '  garlic  ');
    
    const addButton = screen.getByRole('button', { name: /\+ add/i });
    await userEvent.click(addButton);
    
    expect(mockOnChange).toHaveBeenCalledWith(['garlic']);
  });

  it('does not add empty ingredients', async () => {
    const mockOnChange = vi.fn();
    render(<IngredientsInput value={[]} onChange={mockOnChange} />);
    
    const addButton = screen.getByRole('button', { name: /\+ add/i });
    await userEvent.click(addButton);
    
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
