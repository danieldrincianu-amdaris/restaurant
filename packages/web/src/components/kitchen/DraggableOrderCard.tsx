import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@restaurant/shared';
import KitchenOrderCard from './KitchenOrderCard';

interface DraggableOrderCardProps {
  order: Order;
  status: OrderStatus;
  onClick?: () => void;
  isNew?: boolean;
}

/**
 * DraggableOrderCard - Wrapper that makes KitchenOrderCard draggable
 * 
 * Uses @dnd-kit's useDraggable hook to enable drag-and-drop functionality.
 * Provides visual feedback during drag (opacity reduction).
 * Supports highlight animation for new orders and status changes.
 * Touch-friendly with proper activation distance.
 */
export default function DraggableOrderCard({ order, status, onClick, isNew = false }: DraggableOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: order.id,
    data: {
      order,
      status,
    },
  });

  // Track status changes for highlight animation
  const [showStatusHighlight, setShowStatusHighlight] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(status);

  useEffect(() => {
    if (status !== previousStatus) {
      setShowStatusHighlight(true);
      const timer = setTimeout(() => {
        setShowStatusHighlight(false);
      }, 500); // 500ms highlight per front-end spec
      setPreviousStatus(status);
      return () => clearTimeout(timer);
    }
  }, [status, previousStatus]);

  // New order pulse animation (CSS-based for better performance)
  const isRecentOrder = isNew && Date.now() - new Date(order.createdAt).getTime() < 5000;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${isRecentOrder ? 'animate-pulse-new-order' : ''}
        ${showStatusHighlight ? 'animate-status-change' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <KitchenOrderCard
        order={order}
        status={status}
        onClick={!isDragging ? onClick : undefined}
      />
    </div>
  );
}
