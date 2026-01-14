import { useOrder } from '../../contexts/OrderContext';
import OrderItemRow from './OrderItemRow';

function OrderBuilder() {
  const { items, tableNumber, serverName, setTableNumber, setServerName } = useOrder();

  const total = items.reduce((sum, item) => sum + Number(item.menuItem.price) * item.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h2 className="text-xl font-bold mb-4">Order #NEW</h2>
        
        {/* Table Number and Server Name Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Table Number *
            </label>
            <input
              id="tableNumber"
              type="number"
              min="1"
              value={tableNumber ?? ''}
              onChange={(e) => setTableNumber(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Table #"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="serverName" className="block text-sm font-medium text-gray-700 mb-1">
              Server Name *
            </label>
            <input
              id="serverName"
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="Server name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 font-medium">No items yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Select items from the menu to start building an order
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <OrderItemRow key={item.menuItemId} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Running Total */}
      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderBuilder;
