import { OrderProvider, useOrder } from '../../contexts/OrderContext';
import MenuBrowser from '../../components/staff/MenuBrowser';

function NewOrderContent() {
  const { addItem, items } = useOrder();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Order</h1>
            <p className="text-sm text-gray-500 mt-1">
              Select menu items to add to order
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Menu Browser (60%) */}
        <div className="w-full md:w-3/5 border-r border-gray-200 bg-gray-50">
          <MenuBrowser onSelectItem={addItem} />
        </div>

        {/* Right: Order Builder Placeholder (40%) */}
        <div className="hidden md:block md:w-2/5 bg-white p-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500">No items yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Select items from the menu to start building an order
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                {items.length} item{items.length !== 1 ? 's' : ''} added
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.menuItemId}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{item.menuItem.name}</div>
                      <div className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold text-blue-600">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    $
                    {items
                      .reduce(
                        (sum, item) => sum + item.menuItem.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewOrderPage() {
  return (
    <OrderProvider>
      <NewOrderContent />
    </OrderProvider>
  );
}

export default NewOrderPage;

