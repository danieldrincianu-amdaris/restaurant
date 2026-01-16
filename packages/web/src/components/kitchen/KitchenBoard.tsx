import { useEffect, useState } from 'react';
import { Order, OrderStatus, STATUS_TRANSITIONS } from '@restaurant/shared';
import { useOrders } from '../../hooks/useOrders';
import { useOrderEvents } from '../../hooks/useOrderEvents';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useBrowserNotification } from '../../hooks/useBrowserNotification';
import { type AlertLevel } from '../../hooks/useWaitTimeAlert';
import { getWaitTimeThresholds } from '../../config/waitTimeThresholds';
import { applyKitchenFilters } from '../../lib/orderFilters';
import KitchenDndContext from './KitchenDndContext';
import DroppableColumn from './DroppableColumn';
import BulkActionsToolbar from './BulkActionsToolbar';
import { api } from '../../lib/api';

interface KitchenBoardProps {
  isMuted?: boolean;
  isPrioritySorted?: boolean;
}

/**
 * KitchenBoard - Kanban-style board with 4 status columns
 * 
 * Displays orders organized by status (Pending, In Progress, Halted, Completed).
 * Responsive layout: 4-across on desktop, 2x2 on tablet portrait.
 * Real-time updates via WebSocket with animations and notifications.
 * 
 * Priority sorting (optional): Float orders with wait time alerts to the top
 */
export default function KitchenBoard({ isMuted = false, isPrioritySorted = false }: KitchenBoardProps) {
  // Fetch initial orders
  const { orders: initialOrders, isLoading, error } = useOrders();
  
  // Local state for orders (updated in real-time)
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Track new orders for pulse animation
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  
  // Track pending column flash animation
  const [isPendingFlashing, setIsPendingFlashing] = useState(false);
  
  // Notification hooks
  const { play: playNotificationSound } = useNotificationSound('', isMuted);
  const { requestPermission, showNotification } = useBrowserNotification();

  // Request notification permission on first interaction
  useEffect(() => {
    const handleFirstClick = async () => {
      await requestPermission();
    };
    document.addEventListener('click', handleFirstClick, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, [requestPermission]);
  
  // Show canceled toggle (persisted in localStorage)
  const [showCanceled, setShowCanceled] = useState(() => {
    const stored = localStorage.getItem('kitchen.showCanceled');
    return stored === 'true';
  });

  // Bulk selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Initialize orders from API
  useEffect(() => {
    if (initialOrders) {
      setOrders(initialOrders);
    }
  }, [initialOrders]);

  // Real-time order updates via WebSocket
  // NOTE: For high-frequency updates, consider using useBatchedUpdates:
  // const { addUpdate } = useBatchedUpdates({
  //   onFlush: (updates) => {
  //     setOrders(prev => {
  //       let result = prev;
  //       updates.forEach(({ payload }) => {
  //         // Apply each update sequentially
  //         if (payload.type === 'create') result = [...result, payload.order];
  //         if (payload.type === 'update') result = result.map(o => o.id === payload.order.id ? payload.order : o);
  //       });
  //       return result;
  //     });
  //   },
  //   windowMs: 100,
  // });
  useOrderEvents({
    room: 'kitchen',
    onCreate: ({ order }) => {
      setOrders((prev) => {
        // Prevent duplicate: check if order already exists
        if (prev.some(o => o.id === order.id)) {
          return prev;
        }
        
        // Play audio notification (if not muted)
        playNotificationSound();
        
        // Show browser notification (if tab is hidden)
        showNotification(
          `New Order - Table ${order.tableNumber}`,
          `Order #${order.id.slice(0, 8)} - ${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}`
        );
        
        // Flash Pending column header
        if (order.status === OrderStatus.PENDING) {
          setIsPendingFlashing(true);
          setTimeout(() => setIsPendingFlashing(false), 500);
        }
        
        // Mark as new for animation
        setNewOrderIds(ids => new Set([...ids, order.id]));
        // Remove from new set after 5 seconds
        setTimeout(() => {
          setNewOrderIds(ids => {
            const updated = new Set(ids);
            updated.delete(order.id);
            return updated;
          });
        }, 5000);
        
        return [...prev, order];
      });
    },
    onUpdate: ({ order }) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== order.id) return o;
          // Only update if newer (compare updatedAt timestamps)
          if (new Date(o.updatedAt) >= new Date(order.updatedAt)) {
            return o; // Stale update, ignore
          }
          return order;
        })
      );
    },
    onDelete: ({ orderId }) => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    },
    onStatusChange: ({ orderId, newStatus }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
        )
      );
    },
    onItemAdded: ({ orderId, item }) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          // Add item if not already present
          if (o.items.some(i => i.id === item.id)) return o;
          return { ...o, items: [...o.items, item] };
        })
      );
    },
    onItemUpdated: ({ orderId, item }) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            items: o.items.map(i => (i.id === item.id ? item : i)),
          };
        })
      );
    },
    onItemRemoved: ({ orderId, itemId }) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            items: o.items.filter(i => i.id !== itemId),
          };
        })
      );
    },
  });

  // Refresh completed filter every minute to drop stale orders
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => [...prev]); // Trigger re-render to reapply filters
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Persist showCanceled preference
  useEffect(() => {
    localStorage.setItem('kitchen.showCanceled', showCanceled.toString());
  }, [showCanceled]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-xl font-semibold mb-2">⚠️ Error Loading Orders</p>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  // Apply kitchen filters
  const filteredOrders = applyKitchenFilters(orders, showCanceled, 30);

  // Helper to get alert level for an order
  const thresholds = getWaitTimeThresholds();
  const getOrderAlertLevel = (order: Order): AlertLevel => {
    const now = Date.now();
    const created = new Date(order.createdAt).getTime();
    const elapsedMinutes = Math.floor((now - created) / 60000);

    if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELED) {
      return 'none';
    }

    if (order.status === OrderStatus.PENDING) {
      if (elapsedMinutes >= thresholds.pendingCriticalMinutes) return 'critical';
      if (elapsedMinutes >= thresholds.pendingWarningMinutes) return 'warning';
    }

    if (order.status === OrderStatus.IN_PROGRESS) {
      if (elapsedMinutes >= thresholds.inProgressWarningMinutes) return 'warning';
    }

    return 'none';
  };

  // Sort orders by alert priority if enabled
  const sortByPriority = (ordersToSort: Order[]): Order[] => {
    if (!isPrioritySorted) {
      return ordersToSort;
    }

    return [...ordersToSort].sort((a, b) => {
      const alertA = getOrderAlertLevel(a);
      const alertB = getOrderAlertLevel(b);
      
      // Priority order: critical > warning > none
      const priorityMap = { critical: 3, warning: 2, none: 1 };
      const priorityDiff = priorityMap[alertB] - priorityMap[alertA];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // If same alert level, maintain chronological order (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  // Filter orders by status and apply priority sorting
  const pendingOrders = sortByPriority(filteredOrders.filter(o => o.status === OrderStatus.PENDING));
  const inProgressOrders = sortByPriority(filteredOrders.filter(o => o.status === OrderStatus.IN_PROGRESS));
  const haltedOrders = filteredOrders.filter(o => o.status === OrderStatus.HALTED);
  const completedOrders = filteredOrders.filter(o => o.status === OrderStatus.COMPLETED);

  // Handle status change via drag-and-drop
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Find the order to get its current status
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const originalStatus = order.status;

    // Optimistic update - move card immediately
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o
      )
    );

    try {
      // API call to update status
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Success - WebSocket will broadcast to other clients
    } catch (error) {
      // Revert on failure
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: originalStatus } : o
        )
      );
      console.error('Failed to update order status:', error);
      // TODO: Show error toast notification
    }
  };

  // Bulk selection handlers
  const handleSelectionChange = (orderId: string, selected: boolean) => {
    setSelectedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(orderId);
      } else {
        newSet.delete(orderId);
      }
      return newSet;
    });
  };

  const handleClearSelection = () => {
    setSelectedOrderIds(new Set());
    setIsBulkMode(false);
  };

  const handleBulkMoveToStatus = async (newStatus: OrderStatus) => {
    const orderIds = Array.from(selectedOrderIds);
    if (orderIds.length === 0) return;

    try {
      // Call bulk update API
      await api.post('/orders/bulk-status', {
        orderIds,
        status: newStatus,
      });

      // Clear selection after successful update
      handleClearSelection();
      
      // WebSocket will broadcast individual events for real-time updates
    } catch (error) {
      console.error('Failed to bulk update order status:', error);
      alert(`Failed to update orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="h-full p-4">
      {/* Controls row */}
      <div className="mb-3 flex justify-between items-center">
        {/* Bulk mode toggle */}
        <button
          onClick={() => {
            const newBulkMode = !isBulkMode;
            setIsBulkMode(newBulkMode);
            if (!newBulkMode) {
              // Clearing selection when DISABLING bulk mode
              handleClearSelection();
            }
          }}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isBulkMode
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isBulkMode ? '✓ Bulk Mode' : 'Bulk Mode'}
        </button>

        {/* Show Canceled Toggle */}
        <button
          onClick={() => setShowCanceled(!showCanceled)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            showCanceled
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {showCanceled ? '✓ Show Canceled' : 'Show Canceled'}
        </button>
      </div>

      {/* 4-column grid: 4-across on desktop, 2x2 on tablet portrait */}
      <KitchenDndContext onStatusChange={handleStatusChange}>
        <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DroppableColumn
            status={OrderStatus.PENDING}
            orders={pendingOrders}
            newOrderIds={newOrderIds}
            isFlashing={isPendingFlashing}
            selectedOrderIds={selectedOrderIds}
            onSelectionChange={handleSelectionChange}
            isBulkMode={isBulkMode}
          />
          <DroppableColumn
            status={OrderStatus.IN_PROGRESS}
            orders={inProgressOrders}
            newOrderIds={newOrderIds}
            selectedOrderIds={selectedOrderIds}
            onSelectionChange={handleSelectionChange}
            isBulkMode={isBulkMode}
          />
          <DroppableColumn
            status={OrderStatus.HALTED}
            orders={haltedOrders}
            newOrderIds={newOrderIds}
            selectedOrderIds={selectedOrderIds}
            onSelectionChange={handleSelectionChange}
            isBulkMode={isBulkMode}
          />
          <DroppableColumn
            status={OrderStatus.COMPLETED}
            orders={completedOrders}
            newOrderIds={newOrderIds}
            selectedOrderIds={selectedOrderIds}
            onSelectionChange={handleSelectionChange}
            isBulkMode={isBulkMode}
          />
        </div>
      </KitchenDndContext>

      {/* Bulk actions toolbar (fixed at bottom) */}
      <BulkActionsToolbar
        selectedCount={selectedOrderIds.size}
        selectedOrders={orders.filter(o => selectedOrderIds.has(o.id))}
        onClearSelection={handleClearSelection}
        onMoveToStatus={handleBulkMoveToStatus}
      />
    </div>
  );
}
