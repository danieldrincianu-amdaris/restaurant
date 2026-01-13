import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import MenuManagement from '../pages/admin/MenuManagement';
import MenuItemForm from '../pages/admin/MenuItemForm';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'admin/menu', element: <MenuManagement /> },
      { path: 'admin/menu/new', element: <MenuItemForm /> },
      { path: 'admin/menu/:id/edit', element: <MenuItemForm /> },
    ],
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const router = createBrowserRouter(routes) as any;

export { router };
