import { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@restaurant/shared';
import { useOrders } from '../../hooks/useOrders';
import { useOrderEvents } from '../../hooks/useOrderEvents';
import { useNotificationSound } from '../../hooks/useNotificationSound';
import { useBrowserNotification } from '../../hooks/useBrowserNotification';
import { applyKitchenFilters } from '../../lib/orderFilters';
import KitchenDndContext from './KitchenDndContext';
import DroppableColumn from './DroppableColumn';
import { api } from '../../lib/api';

interface KitchenBoardProps {
  isMuted?: boolean;
}

/**
 * KitchenBoard - Kanban-style board with 4 status columns
 * 
 * Displays orders organized by status (Pending, In Progress, Halted, Completed).
 * Responsive layout: 4-across on desktop, 2x2 on tablet portrait.
 * Real-time updates via WebSocket with animations and notifications.
 */
export default function KitchenBoard({ isMuted = false }: KitchenBoardProps) {
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

  // Initialize orders from API
  useEffect(() => {
    if (initialOrders) {
      setOrders(initialOrders);
    }
  }, [initialOrders]);

  // Real-time order updates via WebSocket
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">⚠️ Error Loading Orders</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Apply kitchen filters
  const filteredOrders = applyKitchenFilters(orders, showCanceled, 30);

  // Filter orders by status
  const pendingOrders = filteredOrders.filter(o => o.status === OrderStatus.PENDING);
  const inProgressOrders = filteredOrders.filter(o => o.status === OrderStatus.IN_PROGRESS);
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

  return (
    <div className="h-full p-4">
      {/* Show Canceled Toggle */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setShowCanceled(!showCanceled)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            showCanceled
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          />
          <DroppableColumn
            status={OrderStatus.IN_PROGRESS}
            orders={inProgressOrders}
            newOrderIds={newOrderIds}
          />
          <DroppableColumn
            status={OrderStatus.HALTED}
            orders={haltedOrders}
            newOrderIds={newOrderIds}
          />
          <DroppableColumn
            status={OrderStatus.COMPLETED}
            orders={completedOrders}
            newOrderIds={newOrderIds}
          />
        </div>
      </KitchenDndContext>
    </div>
  );
}
