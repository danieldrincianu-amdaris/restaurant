import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Category, FoodType } from '@restaurant/shared';
import { useMenuItem } from '../../hooks/useMenuItem';
import { useCreateMenuItem } from '../../hooks/useCreateMenuItem';
import { useUpdateMenuItem } from '../../hooks/useUpdateMenuItem';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useToast } from '../../contexts/ToastContext';
import IngredientsInput from '../../components/menu/IngredientsInput';
import ImageUpload from '../../components/menu/ImageUpload';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface FormData {
  name: string;
  price: string;
  category: Category | '';
  foodType: FoodType;
  ingredients: string[];
  imageUrl: string | null;
  available: boolean;
}

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
}

export default function MenuItemForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  // Hooks
  const { item, isLoading: isLoadingItem } = useMenuItem(id);
  const { createMenuItem, isSubmitting: isCreating } = useCreateMenuItem();
  const { updateMenuItem, isSubmitting: isUpdating } = useUpdateMenuItem();
  const { uploadImage, isUploading } = useImageUpload();

  // State
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    category: '',
    foodType: FoodType.OTHER,
    ingredients: [],
    imageUrl: null,
    available: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load item data for edit mode
  useEffect(() => {
    if (item && isEditMode) {
      setFormData({
        name: item.name,
        price: Number(item.price).toFixed(2),
        category: item.category,
        foodType: item.foodType,
        ingredients: item.ingredients,
        imageUrl: item.imageUrl,
        available: item.available,
      });
    }
  }, [item, isEditMode]);

  // Form field handlers
  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error for field being edited
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (!/^\d+(\.\d{0,2})?$/.test(formData.price)) {
      newErrors.price = 'Price must have at most 2 decimal places';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if new file selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const submitData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category as Category,
        foodType: formData.foodType,
        ingredients: formData.ingredients,
        imageUrl: imageUrl || undefined,
        available: formData.available,
      };

      if (isEditMode && id) {
        await updateMenuItem(id, submitData);
        showToast('Menu item updated successfully', 'success');
      } else {
        await createMenuItem(submitData);
        showToast('Menu item created successfully', 'success');
      }

      setIsDirty(false);
      navigate('/admin/menu');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save menu item', 'error');
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Discard changes?')) {
        navigate('/admin/menu');
      }
    } else {
      navigate('/admin/menu');
    }
  };

  const isSubmitting = isCreating || isUpdating || isUploading;

  if (isLoadingItem && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        to="/admin/menu"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
      >
        ← Back to Menu
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditMode ? `Edit: ${item?.name || 'Menu Item'}` : 'Add New Menu Item'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Upload */}
          <div className="md:col-span-1">
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => handleChange('imageUrl', url)}
              onFileSelect={setSelectedFile}
              isUploading={isUploading}
            />
          </div>

          {/* Name and Price */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => validateForm()}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  onBlur={() => validateForm()}
                  className={`w-full pl-8 pr-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>
          </div>
        </div>

        {/* Category and Food Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value as Category | '')}
              onBlur={() => validateForm()}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Select category</option>
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Food Type */}
          <div>
            <label htmlFor="foodType" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Food Type <span className="text-red-500">*</span>
            </label>
            <select
              id="foodType"
              value={formData.foodType}
              onChange={(e) => handleChange('foodType', e.target.value as FoodType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {Object.values(FoodType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ingredients */}
        <IngredientsInput
          value={formData.ingredients}
          onChange={(ingredients) => handleChange('ingredients', ingredients)}
        />

        {/* Availability */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={(e) => handleChange('available', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-600"
          />
          <label htmlFor="available" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            Available for ordering
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Menu Item' : 'Save Menu Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
