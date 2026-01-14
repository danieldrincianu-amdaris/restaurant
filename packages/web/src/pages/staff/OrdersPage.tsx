import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OrderStatus } from '@restaurant/shared';
import { useOrders } from '../../hooks/useOrders';
import OrderCard from '../../components/staff/OrderCard';

function OrdersPage() {
  const { orders, isLoading, error, refresh } = useOrders();
  const [filterTab, setFilterTab] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentServer, setCurrentServer] = useState<string>('');

  // Get current server name from localStorage
  useEffect(() => {
    const savedServer = localStorage.getItem('lastServerName') || '';
    setCurrentServer(savedServer);
  }, []);

  // Filter active orders (exclude COMPLETED and CANCELED)
  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELED
    );
  }, [orders]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    let filtered = [...activeOrders];

    // Apply "My Orders" filter
    if (filterTab === 'my' && currentServer) {
      filtered = filtered.filter((order) => order.serverName === currentServer);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Sort by creation time (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }, [activeOrders, filterTab, statusFilter, currentServer]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage your orders</p>
          </div>
          <Link
            to="/staff/orders/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            + New Order
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilterTab('my')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterTab === 'my'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              My Orders
            </button>
          </div>

          {/* Status Filter and Refresh */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value={OrderStatus.PENDING}>Pending</option>
              <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
              <option value={OrderStatus.HALTED}>Halted</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh orders"
            >
              <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" role="status" aria-label="Loading orders"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Orders</h2>
            <p className="text-gray-600 mb-4">
              {filterTab === 'my'
                ? "You don't have any active orders"
                : 'No active orders at the moment'}
            </p>
            <Link
              to="/staff/orders/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create New Order
            </Link>
          </div>
        )}

        {/* Orders Grid */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;

