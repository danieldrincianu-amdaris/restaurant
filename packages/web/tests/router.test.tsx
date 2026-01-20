import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RouterProvider, createMemoryRouter, Navigate } from 'react-router-dom';
import { ToastProvider } from '../src/contexts/ToastContext';
import MainLayout from '../src/components/layout/MainLayout';
import HomePage from '../src/pages/HomePage';
import MenuManagement from '../src/pages/admin/MenuManagement';

// Mock the hooks for MenuManagement
vi.mock('../src/hooks/useMenuItems', () => ({
  useMenuItems: () => ({
    items: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../src/hooks/useUpdateAvailability', () => ({
  useUpdateAvailability: () => ({
    updateAvailability: vi.fn(),
    isUpdating: false,
    error: null,
  }),
}));

vi.mock('../src/hooks/useDeleteMenuItem', () => ({
  useDeleteMenuItem: () => ({
    deleteMenuItem: vi.fn(),
    isDeleting: false,
    error: null,
  }),
}));

describe('Router', () => {
  it('renders HomePage at root route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            { index: true, element: <HomePage /> },
          ],
        },
      ],
      { 
        initialEntries: ['/'],
      }
    );

    render(<RouterProvider router={router as any} />);
    expect(screen.getByText(/Welcome to RestaurantFlow/i)).toBeInTheDocument();
  });

  it('redirects /admin to /admin/menu route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            { path: 'admin', element: <Navigate to="/admin/menu" replace /> },
            { path: 'admin/menu', element: <ToastProvider><MenuManagement /></ToastProvider> },
          ],
        },
      ],
      { 
        initialEntries: ['/admin'],
      }
    );

    render(<RouterProvider router={router as any} />);
    expect(screen.getByRole('heading', { name: 'Menu Management', level: 1 })).toBeInTheDocument();
  });

  it('renders MenuManagement at /admin/menu route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            { path: 'admin/menu', element: <ToastProvider><MenuManagement /></ToastProvider> },
          ],
        },
      ],
      { 
        initialEntries: ['/admin/menu'],
      }
    );

    render(<RouterProvider router={router as any} />);
    expect(screen.getByRole('heading', { name: 'Menu Management', level: 1 })).toBeInTheDocument();
  });
});
