import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useUpdateAvailability } from '../../hooks/useUpdateAvailability';
import MenuItemTable from '../../components/menu/MenuItemTable';
import MenuFilters from '../../components/menu/MenuFilters';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/menu/EmptyState';
import ErrorState from '../../components/menu/ErrorState';

function MenuManagement() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFoodType, setSelectedFoodType] = useState('');

  const { items, isLoading, error, refetch } = useMenuItems(
    selectedCategory || undefined,
    selectedFoodType || undefined
  );

  const [itemsState, setItemsState] = useState(items);
  const { updateAvailability } = useUpdateAvailability(itemsState, setItemsState);

  // Sync items from hook to local state
  useEffect(() => {
    setItemsState(items);
  }, [items]);

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      await updateAvailability(id, available);
    } catch (err) {
      // Error already handled in hook with rollback
      console.error('Failed to update availability:', err);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/menu/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    // Delete confirmation will be implemented in Story 1.9
    alert(`Delete functionality coming in Story 1.9. Item ID: ${id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
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
        <MenuItemTable
          items={itemsState.length > 0 ? itemsState : items}
          onToggleAvailability={handleToggleAvailability}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default MenuManagement;
