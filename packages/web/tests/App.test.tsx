import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to RestaurantFlow/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<App />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('+ New Order')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });
});
