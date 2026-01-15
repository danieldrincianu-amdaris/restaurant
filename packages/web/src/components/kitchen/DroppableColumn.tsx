import { useDroppable } from '@dnd-kit/core';
import { Order, OrderStatus } from '@restaurant/shared';
import StatusColumn from './StatusColumn';
import { isValidTransition } from '../../lib/statusTransitions';
import { useDndState } from './KitchenDndContext';

interface DroppableColumnProps {
  status: OrderStatus;
  orders: Order[];
}

/**
 * DroppableColumn - Wrapper that makes StatusColumn a drop target
 * 
 * Uses @dnd-kit's useDroppable hook to enable column as drop zone.
 * Provides visual feedback for valid/invalid drop targets based on
 * status transition rules.
 */
export default function DroppableColumn({ status, orders }: DroppableColumnProps) {
  const { activeOrderStatus } = useDndState();
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      status,
    },
  });

  // Determine if this is a valid drop target
  const isValidTarget = activeOrderStatus
    ? isValidTransition(activeOrderStatus, status)
    : false;

  // Visual feedback classes
  let highlightClasses = '';
  if (isOver && activeOrderStatus) {
    if (isValidTarget) {
      // Valid drop zone - green highlight
      highlightClasses = 'ring-4 ring-green-400 ring-opacity-50';
    } else {
      // Invalid drop zone - red highlight
      highlightClasses = 'ring-4 ring-red-400 ring-opacity-50';
    }
  } else if (activeOrderStatus && !isValidTarget) {
    // Not over, but invalid target - dim
    highlightClasses = 'opacity-50';
  }

  return (
    <div ref={setNodeRef} className={`h-full transition-all ${highlightClasses}`}>
      <StatusColumn status={status} orders={orders} />
    </div>
  );
}
