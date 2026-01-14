import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderStatus } from '@restaurant/shared';
import { OrderProvider, useOrder as useOrderContext } from '../../contexts/OrderContext';
import { useOrder } from '../../hooks/useOrder';
import MenuBrowser from '../../components/staff/MenuBrowser';
import OrderBuilder from '../../components/staff/OrderBuilder';

function EditOrderContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, isLoading, error } = useOrder(id);
  const { loadExistingOrder, addItem } = useOrderContext();
  const [showInProgressWarning, setShowInProgressWarning] = useState(false);
  const [hasLoadedOrder, setHasLoadedOrder] = useState(false);

  useEffect(() => {
    if (order && !hasLoadedOrder) {
      // Check if order is non-editable
      if (
        order.status === OrderStatus.COMPLETED ||
        order.status === OrderStatus.CANCELED
      ) {
        // Redirect to orders list (or could show view-only)
        navigate('/staff/orders');
        return;
      }

      // Show warning for IN_PROGRESS orders
      if (order.status === OrderStatus.IN_PROGRESS) {
        setShowInProgressWarning(true);
      } else {
        // Load order directly for PENDING and HALTED
        loadExistingOrder(order);
        setHasLoadedOrder(true);
      }
    }
  }, [order, hasLoadedOrder, loadExistingOrder, navigate]);

  const handleWarningDismiss = () => {
    if (order) {
      loadExistingOrder(order);
      setHasLoadedOrder(true);
    }
    setShowInProgressWarning(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/staff/orders')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // IN_PROGRESS warning modal
  if (showInProgressWarning) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Warning</h2>
          <p className="text-gray-700 mb-6">
            Kitchen has started this order. Changes may affect preparation.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/staff/orders')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleWarningDismiss}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Continue Editing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Order #{order.id.slice(-6)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Make changes to this order
            </p>
          </div>
          <button
            onClick={() => navigate('/staff/orders')}
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

function EditOrderPage() {
  return (
    <OrderProvider>
      <EditOrderContent />
    </OrderProvider>
  );
}

export default EditOrderPage;

