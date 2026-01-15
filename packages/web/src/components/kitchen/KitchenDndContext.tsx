import { ReactNode, useState, createContext, useContext } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { Order, OrderStatus } from '@restaurant/shared';
import { isValidTransition } from '../../lib/statusTransitions';
import KitchenOrderCard from './KitchenOrderCard';

interface KitchenDndContextProps {
  children: ReactNode;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

interface DndState {
  activeOrderStatus: OrderStatus | null;
}

const DndStateContext = createContext<DndState>({ activeOrderStatus: null });

export function useDndState() {
  return useContext(DndStateContext);
}

/**
 * KitchenDndContext - DndContext wrapper with kitchen-specific drag handlers
 * 
 * Configures sensors for both pointer (mouse) and touch devices.
 * Handles drag events with status transition validation and optimistic updates.
 * Provides DragOverlay for visual feedback during drag.
 */
export default function KitchenDndContext({ children, onStatusChange }: KitchenDndContextProps) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeStatus, setActiveStatus] = useState<OrderStatus | null>(null);

  // Configure sensors with touch-friendly activation distance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8, // Touch-friendly threshold
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const order = active.data.current?.order as Order | undefined;
    const status = active.data.current?.status as OrderStatus | undefined;

    if (order && status) {
      setActiveOrder(order);
      setActiveStatus(status);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset active state
    setActiveOrder(null);
    setActiveStatus(null);

    if (!over) {
      return;
    }

    const orderId = active.id as string;
    const currentStatus = active.data.current?.status as OrderStatus;
    const targetStatus = over.id as OrderStatus;

    // No change if dropped in same column
    if (currentStatus === targetStatus) {
      return;
    }

    // Validate transition
    if (!isValidTransition(currentStatus, targetStatus)) {
      console.warn(`Invalid transition: ${currentStatus} → ${targetStatus}`);
      return;
    }

    // Perform status change with optimistic update handling in parent
    try {
      await onStatusChange(orderId, targetStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <DndStateContext.Provider value={{ activeOrderStatus: activeStatus }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeOrder && activeStatus ? (
            <div className="opacity-70">
              <KitchenOrderCard order={activeOrder} status={activeStatus} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DndStateContext.Provider>
  );
}
