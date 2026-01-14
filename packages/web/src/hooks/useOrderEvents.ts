// Custom React hook for subscribing to real-time order events via WebSocket

import { useEffect, useRef } from 'react';
import { getSocket, subscribeToKitchen, subscribeToOrders, unsubscribeFromKitchen, unsubscribeFromOrders } from '../lib/socket';
import {
  SOCKET_EVENTS,
  OrderCreatedPayload,
  OrderUpdatedPayload,
  OrderDeletedPayload,
  OrderStatusChangedPayload,
  OrderItemAddedPayload,
  OrderItemUpdatedPayload,
  OrderItemRemovedPayload,
} from '@restaurant/shared';

export interface UseOrderEventsOptions {
  /** Which room to subscribe to: 'kitchen' for kitchen display, 'orders' for staff views */
  room: 'kitchen' | 'orders';
  
  /** Callback when new order is created */
  onCreate?: (payload: OrderCreatedPayload) => void;
  
  /** Callback when order is updated */
  onUpdate?: (payload: OrderUpdatedPayload) => void;
  
  /** Callback when order is deleted */
  onDelete?: (payload: OrderDeletedPayload) => void;
  
  /** Callback when order status changes */
  onStatusChange?: (payload: OrderStatusChangedPayload) => void;
  
  /** Callback when item is added to order */
  onItemAdded?: (payload: OrderItemAddedPayload) => void;
  
  /** Callback when order item is updated */
  onItemUpdated?: (payload: OrderItemUpdatedPayload) => void;
  
  /** Callback when item is removed from order */
  onItemRemoved?: (payload: OrderItemRemovedPayload) => void;
}

/**
 * React hook for subscribing to real-time order events
 * 
 * Automatically subscribes to the specified room (kitchen or orders) and
 * registers event listeners for all order-related events. Cleans up
 * subscriptions and listeners on unmount.
 * 
 * @param options - Configuration including room and event callbacks
 * 
 * @example
 * ```tsx
 * function KitchenDisplay() {
 *   const [orders, setOrders] = useState<Order[]>([]);
 *   
 *   useOrderEvents({
 *     room: 'kitchen',
 *     onCreate: ({ order }) => {
 *       setOrders(prev => [...prev, order]);
 *     },
 *     onStatusChange: ({ orderId, newStatus }) => {
 *       setOrders(prev => prev.map(o => 
 *         o.id === orderId ? { ...o, status: newStatus } : o
 *       ));
 *     },
 *   });
 *   
 *   return <div>{orders.map(o => <OrderCard key={o.id} order={o} />)}</div>;
 * }
 * ```
 */
export function useOrderEvents(options: UseOrderEventsOptions): void {
  const { room, onCreate, onUpdate, onDelete, onStatusChange, onItemAdded, onItemUpdated, onItemRemoved } = options;

  // Use refs to store callbacks to avoid re-subscribing when callbacks change
  const onCreateRef = useRef(onCreate);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onStatusChangeRef = useRef(onStatusChange);
  const onItemAddedRef = useRef(onItemAdded);
  const onItemUpdatedRef = useRef(onItemUpdated);
  const onItemRemovedRef = useRef(onItemRemoved);

  // Keep refs up to date
  useEffect(() => {
    onCreateRef.current = onCreate;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
    onStatusChangeRef.current = onStatusChange;
    onItemAddedRef.current = onItemAdded;
    onItemUpdatedRef.current = onItemUpdated;
    onItemRemovedRef.current = onItemRemoved;
  }, [onCreate, onUpdate, onDelete, onStatusChange, onItemAdded, onItemUpdated, onItemRemoved]);

  useEffect(() => {
    const socket = getSocket();

    // Subscribe to appropriate room
    if (room === 'kitchen') {
      subscribeToKitchen();
    } else {
      subscribeToOrders();
    }

    // Event handler wrappers that use refs
    const handleOrderCreated = (payload: OrderCreatedPayload) => {
      onCreateRef.current?.(payload);
    };

    const handleOrderUpdated = (payload: OrderUpdatedPayload) => {
      onUpdateRef.current?.(payload);
    };

    const handleOrderDeleted = (payload: OrderDeletedPayload) => {
      onDeleteRef.current?.(payload);
    };

    const handleOrderStatusChanged = (payload: OrderStatusChangedPayload) => {
      onStatusChangeRef.current?.(payload);
    };

    const handleOrderItemAdded = (payload: OrderItemAddedPayload) => {
      onItemAddedRef.current?.(payload);
    };

    const handleOrderItemUpdated = (payload: OrderItemUpdatedPayload) => {
      onItemUpdatedRef.current?.(payload);
    };

    const handleOrderItemRemoved = (payload: OrderItemRemovedPayload) => {
      onItemRemovedRef.current?.(payload);
    };

    // Register event listeners
    socket.on(SOCKET_EVENTS.ORDER_CREATED, handleOrderCreated);
    socket.on(SOCKET_EVENTS.ORDER_UPDATED, handleOrderUpdated);
    socket.on(SOCKET_EVENTS.ORDER_DELETED, handleOrderDeleted);
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleOrderStatusChanged);
    socket.on(SOCKET_EVENTS.ORDER_ITEM_ADDED, handleOrderItemAdded);
    socket.on(SOCKET_EVENTS.ORDER_ITEM_UPDATED, handleOrderItemUpdated);
    socket.on(SOCKET_EVENTS.ORDER_ITEM_REMOVED, handleOrderItemRemoved);

    // Cleanup function
    return () => {
      // Unsubscribe from room
      if (room === 'kitchen') {
        unsubscribeFromKitchen();
      } else {
        unsubscribeFromOrders();
      }

      // Remove event listeners
      socket.off(SOCKET_EVENTS.ORDER_CREATED, handleOrderCreated);
      socket.off(SOCKET_EVENTS.ORDER_UPDATED, handleOrderUpdated);
      socket.off(SOCKET_EVENTS.ORDER_DELETED, handleOrderDeleted);
      socket.off(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleOrderStatusChanged);
      socket.off(SOCKET_EVENTS.ORDER_ITEM_ADDED, handleOrderItemAdded);
      socket.off(SOCKET_EVENTS.ORDER_ITEM_UPDATED, handleOrderItemUpdated);
      socket.off(SOCKET_EVENTS.ORDER_ITEM_REMOVED, handleOrderItemRemoved);
    };
  }, [room]); // Only re-run if room changes
}
