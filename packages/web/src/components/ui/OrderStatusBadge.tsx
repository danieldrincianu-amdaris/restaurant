import { OrderStatus } from '@restaurant/shared';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig = {
  [OrderStatus.PENDING]: {
    label: 'Pending',
    className: 'bg-blue-100 text-blue-800',
  },
  [OrderStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [OrderStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800',
  },
  [OrderStatus.HALTED]: {
    label: 'Halted',
    className: 'bg-red-100 text-red-800',
  },
  [OrderStatus.CANCELED]: {
    label: 'Canceled',
    className: 'bg-gray-100 text-gray-800',
  },
};

function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default OrderStatusBadge;
