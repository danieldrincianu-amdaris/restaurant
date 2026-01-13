import { Link } from 'react-router-dom';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">🍽️</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h3>
      <p className="text-gray-500 mb-6">Add your first item to get started!</p>
      <Link
        to="/admin/menu/new"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        + Add New Item
      </Link>
    </div>
  );
}

export default EmptyState;
