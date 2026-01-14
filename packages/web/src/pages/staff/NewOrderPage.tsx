import { OrderProvider, useOrder } from '../../contexts/OrderContext';
import MenuBrowser from '../../components/staff/MenuBrowser';
import OrderBuilder from '../../components/staff/OrderBuilder';

function NewOrderContent() {
  const { addItem } = useOrder();

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

        {/* Right: Order Builder (40%) */}
        <div className="hidden md:block md:w-2/5 bg-white p-6">
          <OrderBuilder />
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

