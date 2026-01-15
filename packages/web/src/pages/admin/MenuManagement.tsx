import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useUpdateAvailability } from '../../hooks/useUpdateAvailability';
import { useDeleteMenuItem } from '../../hooks/useDeleteMenuItem';
import { useToast } from '../../contexts/ToastContext';
import { MenuItem } from '@restaurant/shared';
import ReorderableMenuItemTable from '../../components/menu/ReorderableMenuItemTable';
import MenuFilters from '../../components/menu/MenuFilters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/menu/EmptyState';
import ErrorState from '../../components/menu/ErrorState';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

function MenuManagement() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFoodType, setSelectedFoodType] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const { items, isLoading, error, refetch } = useMenuItems(
    selectedCategory || undefined,
    selectedFoodType || undefined
  );

  const [itemsState, setItemsState] = useState(items);
  const { updateAvailability } = useUpdateAvailability(itemsState, setItemsState);
  const { deleteMenuItem, isDeleting } = useDeleteMenuItem();

  // Sync items from hook to local state
  useEffect(() => {
    setItemsState(items);
  }, [items]);

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      await updateAvailability(id, available);
    } catch (err) {
      // Error already handled in hook with rollback
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/menu/${id}/edit`);
  };

  const handleDelete = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMenuItem(itemToDelete.id);
      showToast(`${itemToDelete.name} deleted successfully`, 'success');
      setShowDeleteModal(false);
      setItemToDelete(null);
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete item', 'error');
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleReorder = async (reorderedItems: MenuItem[]) => {
    try {
      const orderedIds = reorderedItems.map((item) => item.id);
      const response = await fetch('/api/menu-items/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder menu items');
      }

      showToast('Menu items reordered successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reorder items', 'error');
      throw err; // Re-throw to trigger rollback in component
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
        <Link
          to="/admin/menu/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          + Add New Item
        </Link>
      </div>

      <MenuFilters
        selectedCategory={selectedCategory}
        selectedFoodType={selectedFoodType}
        onCategoryChange={setSelectedCategory}
        onFoodTypeChange={setSelectedFoodType}
      />

      {isLoading && <LoadingSpinner />}

      {!isLoading && error && <ErrorState error={error} onRetry={refetch} />}

      {!isLoading && !error && items.length === 0 && <EmptyState />}

      {!isLoading && !error && items.length > 0 && (
        <ReorderableMenuItemTable
          items={itemsState.length > 0 ? itemsState : items}
          onReorder={handleReorder}
          onToggleAvailability={handleToggleAvailability}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Menu Item"
        message={`Are you sure you want to delete '${itemToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MenuManagement;
