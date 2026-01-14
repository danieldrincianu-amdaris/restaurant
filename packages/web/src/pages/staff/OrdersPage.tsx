import { Link } from 'react-router-dom';

function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track and manage your orders
            </p>
          </div>
          <Link
            to="/staff/orders/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            + New Order
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600">
            Active orders list will be implemented in the next story
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
