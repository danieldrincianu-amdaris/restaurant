import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import MainLayout from '../src/components/layout/MainLayout';
import HomePage from '../src/pages/HomePage';
import AdminDashboard from '../src/pages/admin/AdminDashboard';
import MenuManagement from '../src/pages/admin/MenuManagement';

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
      { initialEntries: ['/'] }
    );

    render(<RouterProvider router={router as any} />);
    expect(screen.getByText(/Welcome to RestaurantFlow/i)).toBeInTheDocument();
  });

  it('renders AdminDashboard at /admin route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            { path: 'admin', element: <AdminDashboard /> },
          ],
        },
      ],
      { initialEntries: ['/admin'] }
    );

    render(<RouterProvider router={router as any} />);
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  it('renders MenuManagement at /admin/menu route', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            { path: 'admin/menu', element: <MenuManagement /> },
          ],
        },
      ],
      { initialEntries: ['/admin/menu'] }
    );

    render(<RouterProvider router={router as any} />);
    expect(screen.getByText(/Manage your restaurant menu items/i)).toBeInTheDocument();
  });
});
