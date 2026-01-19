import { Link, Outlet } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';

function MainLayout() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-neutral-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary dark:text-blue-400">🍽️ RestaurantFlow</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/staff/orders/new" 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + New Order
              </Link>
              <Link 
                to="/staff/orders" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Orders
              </Link>
              <Link 
                to="/admin/menu" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Menu
              </Link>
              <Link 
                to="/kitchen" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                👨‍🍳 Kitchen
              </Link>
              <button
                onClick={toggleDarkMode}
                className="ml-4 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                aria-label={isDarkMode ? 'Dark mode - Click for light mode' : 'Light mode - Click for dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
