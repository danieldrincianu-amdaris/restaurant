import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderStatus } from '@restaurant/shared';
import { OrderProvider, useOrder as useOrderContext } from '../../contexts/OrderContext';
import { useOrder } from '../../hooks/useOrder';
import { useDeleteOrder } from '../../hooks/useDeleteOrder';
import { useToast } from '../../contexts/ToastContext';
import MenuBrowser from '../../components/staff/MenuBrowser';
import OrderBuilder from '../../components/staff/OrderBuilder';
import DeleteOrderDialog from '../../components/staff/DeleteOrderDialog';

function EditOrderContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, isLoading, error } = useOrder(id);
  const { loadExistingOrder, addItem } = useOrderContext();
  const { deleteOrder, isDeleting } = useDeleteOrder();
  const { addToast } = useToast();
  const [showInProgressWarning, setShowInProgressWarning] = useState(false);
  const [hasLoadedOrder, setHasLoadedOrder] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!order) return;

    setShowDeleteDialog(false);
    const deletedOrder = await deleteOrder(order.id);
    
    if (deletedOrder) {
      navigate('/staff/orders', { replace: true });
      addToast('Order deleted successfully', 'success');
    } else {
      addToast('Failed to delete order', 'error');
      navigate('/staff/orders', { replace: true });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const canDelete = order && (order.status === OrderStatus.PENDING || order.status === OrderStatus.CANCELED);
  const cannotDeleteReason = 
    order?.status === OrderStatus.IN_PROGRESS
      ? 'Cannot delete orders in progress'
      : order?.status === OrderStatus.COMPLETED
      ? 'Cannot delete completed orders'
      : undefined;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading order...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-800 dark:text-red-200 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/staff/orders')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">⚠️ Warning</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Kitchen has started this order. Changes may affect preparation.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/staff/orders')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleWarningDismiss}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
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
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Order #{order.id.slice(-6)}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Make changes to this order
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canDelete ? (
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Delete Order
              </button>
            ) : (
              <div className="group relative">
                <button
                  disabled
                  className="px-4 py-2 text-gray-400 dark:text-gray-600 font-medium cursor-not-allowed"
                >
                  Delete Order
                </button>
                {cannotDeleteReason && (
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                    <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {cannotDeleteReason}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/staff/orders')}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Delete Confirmation Dialog */}
      <DeleteOrderDialog
        isOpen={showDeleteDialog}
        order={order}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Menu Browser (60%) */}
        <div className="w-full md:w-3/5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <MenuBrowser onSelectItem={addItem} />
        </div>

        {/* Right: Order Builder (40%) */}
        <div className="hidden md:block md:w-2/5 bg-white dark:bg-gray-800 p-6">
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

