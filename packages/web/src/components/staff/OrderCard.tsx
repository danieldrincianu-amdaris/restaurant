import { Order, OrderStatus } from '@restaurant/shared';
import { useNavigate } from 'react-router-dom';
import { memo } from 'react';
import OrderStatusBadge from '../ui/OrderStatusBadge';
import { formatTimeElapsed } from '../../utils/time';
import { useRenderCount } from '../../hooks/useRenderCount';

interface OrderCardProps {
  order: Order;
  isNew?: boolean;
  isUpdated?: boolean;
}

function OrderCard({ order, isNew = false, isUpdated = false }: OrderCardProps) {
  // Example: Performance monitoring in development
  useRenderCount('OrderCard', { orderId: order.id, status: order.status });
  
  const navigate = useNavigate();
  const timeElapsed = formatTimeElapsed(order.createdAt);
  const isPending = order.status === OrderStatus.PENDING;

  const handleCardClick = () => {
    navigate(`/staff/orders/${order.id}/edit`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/staff/orders/${order.id}/edit`);
  };

  // Determine animation classes
  const animationClasses = isNew
    ? 'animate-new-order'
    : isUpdated
    ? 'animate-status-update'
    : '';

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow cursor-pointer ${animationClasses}`}
      data-testid={`order-card-${order.id}`}
      style={{ contain: 'layout style paint' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order #{order.id.slice(-6)}
          </h3>
          <OrderStatusBadge status={order.status} />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">⏱️ {timeElapsed}</span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Table:</span>
          <span className="text-gray-900 dark:text-gray-100">{order.tableNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Server:</span>
          <span className="text-gray-900 dark:text-gray-100">{order.serverName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Items:</span>
          <span className="text-gray-900 dark:text-gray-100">{order.items.length}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCardClick}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          View
        </button>
        {isPending && (
          <button
            onClick={handleEditClick}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

// Custom comparison function for React.memo
// Only re-render if order data, isNew, or isUpdated changes
const arePropsEqual = (prevProps: OrderCardProps, nextProps: OrderCardProps) => {
  return (
    prevProps.order.id === nextProps.order.id &&
    prevProps.order.status === nextProps.order.status &&
    prevProps.order.updatedAt === nextProps.order.updatedAt &&
    prevProps.order.items.length === nextProps.order.items.length &&
    prevProps.isNew === nextProps.isNew &&
    prevProps.isUpdated === nextProps.isUpdated
  );
};

export default memo(OrderCard, arePropsEqual);
