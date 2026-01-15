import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Order, OrderStatus } from '@restaurant/shared';
import KitchenOrderCard from './KitchenOrderCard';

interface DraggableOrderCardProps {
  order: Order;
  status: OrderStatus;
  onClick?: () => void;
}

/**
 * DraggableOrderCard - Wrapper that makes KitchenOrderCard draggable
 * 
 * Uses @dnd-kit's useDraggable hook to enable drag-and-drop functionality.
 * Provides visual feedback during drag (opacity reduction).
 * Touch-friendly with proper activation distance.
 */
export default function DraggableOrderCard({ order, status, onClick }: DraggableOrderCardProps) {
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

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
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
