import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderStatus, Order } from '@restaurant/shared';
import { useOrders } from '../../hooks/useOrders';
import { useOrderEvents } from '../../hooks/useOrderEvents';
import { useCompletedNotifications } from '../../hooks/useCompletedNotifications';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useToast } from '../../contexts/ToastContext';
import OrderCard from '../../components/staff/OrderCard';
import LastUpdatedIndicator from '../../components/ui/LastUpdatedIndicator';
import KeyboardShortcutsHelp from '../../components/common/KeyboardShortcutsHelp';

function OrdersPage() {
  const { orders, setOrders, isLoading, error, refresh } = useOrders();
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentServer, setCurrentServer] = useState<string>('');
  const [recentlyUpdatedOrderIds, setRecentlyUpdatedOrderIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [completedNotificationsEnabled] = useCompletedNotifications();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const { showToast } = useToast();

  // Get current server name from localStorage
  useEffect(() => {
    const savedServer = localStorage.getItem('lastServerName') || '';
    setCurrentServer(savedServer);
  }, []);

  // Clear animation state after duration
  useEffect(() => {
    if (recentlyUpdatedOrderIds.size > 0) {
      const timer = setTimeout(() => {
        setRecentlyUpdatedOrderIds(new Set());
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [recentlyUpdatedOrderIds]);

  // Incremental state update handlers
  const handleOrderCreated = useCallback((payload: { order: Order }) => {
    setOrders((prev) => {
      // Deduplication: check if order already exists
      const exists = prev.some((o) => o.id === payload.order.id);
      if (exists) return prev;
      
      // Add new order to beginning of list
      return [payload.order, ...prev];
    });
    
    setRecentlyUpdatedOrderIds((prev) => new Set(prev).add(payload.order.id));
    setLastUpdated(new Date());
  }, [setOrders]);

  const handleOrderUpdated = useCallback((payload: { order: Order }) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === payload.order.id ? payload.order : o))
    );
    
    setRecentlyUpdatedOrderIds((prev) => new Set(prev).add(payload.order.id));
    setLastUpdated(new Date());
  }, [setOrders]);

  const handleOrderDeleted = useCallback((payload: { orderId: string }) => {
    setOrders((prev) => prev.filter((o) => o.id !== payload.orderId));
    setLastUpdated(new Date());
  }, [setOrders]);

  const handleOrderStatusChanged = useCallback((payload: { orderId: string; newStatus: OrderStatus; updatedAt: string }) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === payload.orderId
          ? { ...o, status: payload.newStatus, updatedAt: payload.updatedAt }
          : o
      );
      
      // Show notification if order is completed and notifications are enabled
      if (payload.newStatus === OrderStatus.COMPLETED && completedNotificationsEnabled) {
        const order = updated.find((o) => o.id === payload.orderId);
        if (order && order.serverName === currentServer) {
          showToast(
            `Order #${order.id.slice(-6)} is ready for Table ${order.tableNumber}`,
            'success'
          );
        }
      }
      
      return updated;
    });
    
    setRecentlyUpdatedOrderIds((prev) => new Set(prev).add(payload.orderId));
    setLastUpdated(new Date());
  }, [setOrders, completedNotificationsEnabled, currentServer, showToast]);

  // Subscribe to real-time order events with incremental handlers
  useOrderEvents({
    room: 'orders',
    onCreate: handleOrderCreated,
    onUpdate: handleOrderUpdated,
    onDelete: handleOrderDeleted,
    onStatusChange: handleOrderStatusChanged,
  });

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
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'n',
        action: () => navigate('/staff/orders/new'),
        description: 'Create new order',
        category: 'Navigation',
      },
      {
        key: 'r',
        action: () => handleRefresh(),
        description: 'Refresh orders',
        category: 'Actions',
      },
      {
        key: '?',
        action: () => setShowShortcutsHelp(true),
        description: 'Show keyboard shortcuts',
        category: 'Help',
      },
    ],
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={[
          {
            key: 'n',
            ctrl: true,
            action: () => {},
            description: 'Create new order',
            category: 'Navigation',
          },
          {
            key: 'r',
            ctrl: true,
            action: () => {},
            description: 'Refresh orders',
            category: 'Actions',
          },
          {
            key: '?',
            action: () => {},
            description: 'Show keyboard shortcuts',
            category: 'Help',
          },
        ]}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Orders</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage your orders</p>
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterTab === 'all'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilterTab('my')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filterTab === 'my'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              My Orders
            </button>
          </div>

          {/* Status Filter and Refresh */}
          <div className="flex items-center gap-3">
            <LastUpdatedIndicator lastUpdated={lastUpdated} />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value={OrderStatus.PENDING}>Pending</option>
              <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
              <option value={OrderStatus.HALTED}>Halted</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-800 dark:text-red-300 mb-4">{error}</p>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Active Orders</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
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
              <OrderCard 
                key={order.id} 
                order={order}
                isNew={recentlyUpdatedOrderIds.has(order.id) && orders.findIndex(o => o.id === order.id) === 0}
                isUpdated={recentlyUpdatedOrderIds.has(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;

