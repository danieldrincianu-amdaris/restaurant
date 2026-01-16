import { Order, OrderStatus, STATUS_TRANSITIONS } from '@restaurant/shared';

interface BulkActionsToolbarProps {
  selectedCount: number;
  selectedOrders: Order[];
  onClearSelection: () => void;
  onMoveToStatus: (status: OrderStatus) => void;
}

/**
 * BulkActionsToolbar - Toolbar for bulk order status updates
 * 
 * Appears when one or more orders are selected.
 * Allows moving all selected orders to a new status in bulk.
 * Validates that all selected orders can transition to target status.
 */
export default function BulkActionsToolbar({ 
  selectedCount,
  selectedOrders,
  onClearSelection, 
  onMoveToStatus 
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  // Check if all selected orders can transition to a given status
  const canTransitionTo = (targetStatus: OrderStatus): boolean => {
    return selectedOrders.every(order => {
      const allowedTransitions = STATUS_TRANSITIONS[order.status];
      return allowedTransitions.includes(targetStatus);
    });
  };

  const canMoveToInProgress = canTransitionTo(OrderStatus.IN_PROGRESS);
  const canMoveToHalted = canTransitionTo(OrderStatus.HALTED);
  const canMoveToCompleted = canTransitionTo(OrderStatus.COMPLETED);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg px-6 py-4">
      <div className="flex items-center gap-4">
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {selectedCount} order{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
          >
            Clear
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

        {/* Status action buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Move all to:</span>
          
          <button
            onClick={() => onMoveToStatus(OrderStatus.IN_PROGRESS)}
            disabled={!canMoveToInProgress}
            title={!canMoveToInProgress ? 'One or more selected orders cannot transition to In Progress' : ''}
            className="px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500"
          >
            In Progress
          </button>
          
          <button
            onClick={() => onMoveToStatus(OrderStatus.HALTED)}
            disabled={!canMoveToHalted}
            title={!canMoveToHalted ? 'One or more selected orders cannot transition to Halted' : ''}
            className="px-3 py-1.5 rounded-md bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-600"
          >
            Halted
          </button>
          
          <button
            onClick={() => onMoveToStatus(OrderStatus.COMPLETED)}
            disabled={!canMoveToCompleted}
            title={!canMoveToCompleted ? 'One or more selected orders cannot transition to Completed' : ''}
            className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}
