import { Order, OrderStatus } from '@restaurant/shared';

interface StatusColumnProps {
  status: OrderStatus;
  orders: Order[];
}

const statusConfig = {
  [OrderStatus.PENDING]: {
    icon: '🔵',
    label: 'Pending',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
  },
  [OrderStatus.IN_PROGRESS]: {
    icon: '🟡',
    label: 'In Progress',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-600',
  },
  [OrderStatus.HALTED]: {
    icon: '⚫',
    label: 'Halted',
    bgColor: 'bg-gray-600',
    borderColor: 'border-gray-600',
    textColor: 'text-gray-700',
  },
  [OrderStatus.COMPLETED]: {
    icon: '🟢',
    label: 'Completed',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-600',
  },
  [OrderStatus.CANCELED]: {
    icon: '⭕',
    label: 'Canceled',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
  },
};

/**
 * StatusColumn - Single status column in kitchen kanban board
 * 
 * Displays orders for a specific status with header showing count
 * and scrollable order card area.
 */
export default function StatusColumn({ status, orders }: StatusColumnProps) {
  const config = statusConfig[status];
  const orderCount = orders.length;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Column Header */}
      <div className={`${config.bgColor} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <h2 className="text-white font-semibold text-lg">
            {config.label}
          </h2>
        </div>
        <span className="bg-white bg-opacity-30 text-white font-bold px-2.5 py-1 rounded-full text-sm min-w-[2rem] text-center">
          {orderCount}
        </span>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {orderCount === 0 ? (
          // Empty state
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No orders</p>
          </div>
        ) : (
          // Placeholder order cards - actual cards implemented in Story 3.5
          orders.map((order) => (
            <div
              key={order.id}
              className={`border-l-4 ${config.borderColor} bg-gray-50 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  #{order.id.slice(-6)}
                </span>
                <span className="text-sm text-gray-600">
                  Table {order.tableNumber}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>{order.items?.length || 0} items</p>
                <p className="text-xs text-gray-500 mt-1">
                  Server: {order.serverName}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
