import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuItem } from '@restaurant/shared';
import { GripVertical } from 'lucide-react';

interface ReorderableMenuItemTableProps {
  items: MenuItem[];
  onReorder: (items: MenuItem[]) => Promise<void>;
  onToggleAvailability: (id: string, available: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

interface SortableRowProps {
  item: MenuItem;
  onToggleAvailability: (id: string, available: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

function SortableRow({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isDragging ? 'z-50' : ''}`}
    >
      <td className="px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-4 py-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 text-2xl">
            🍽️
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {item.name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{formatPrice(item.price)}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.category}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.foodType}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleAvailability(item.id, !item.available)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            item.available
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
          aria-label={`Toggle availability for ${item.name}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              item.available ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          {item.available ? 'Available' : 'Unavailable'}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            aria-label={`Edit ${item.name}`}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(item.id, item.name)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            aria-label={`Delete ${item.name}`}
          >
            🗑 Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function ReorderableMenuItemTable({
  items,
  onReorder,
  onToggleAvailability,
  onEdit,
  onDelete,
}: ReorderableMenuItemTableProps) {
  const [localItems, setLocalItems] = useState(items);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(reorderedItems);

      // Save order to backend
      setIsSaving(true);
      try {
        await onReorder(reorderedItems);
      } catch (error) {
        // Rollback on error
        setLocalItems(items);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Sync with parent items changes
  if (JSON.stringify(items) !== JSON.stringify(localItems) && !isSaving) {
    setLocalItems(items);
  }

  return (
    <div className="overflow-x-auto">
      {isSaving && (
        <div className="mb-2 text-sm text-blue-600 dark:text-blue-400">
          Saving new order...
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Available
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <SortableContext
              items={localItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {localItems.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onToggleAvailability={onToggleAvailability}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}

export default ReorderableMenuItemTable;
