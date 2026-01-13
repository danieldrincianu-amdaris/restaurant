import { useState, KeyboardEvent } from 'react';

interface IngredientsInputProps {
  value: string[];
  onChange: (ingredients: string[]) => void;
}

export default function IngredientsInput({ value, onChange }: IngredientsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    onChange(value.filter((i) => i !== ingredient));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Ingredients
      </label>
      <div className="space-y-2">
        {/* Chips Display */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((ingredient) => (
              <div
                key={ingredient}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span>{ingredient}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient)}
                  className="text-blue-600 hover:text-blue-800 font-bold"
                  aria-label={`Remove ${ingredient}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type ingredient and press Enter"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="button"
            onClick={addIngredient}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
