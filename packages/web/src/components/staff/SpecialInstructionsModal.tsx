import { useState, useEffect, useRef } from 'react';

interface SpecialInstructionsModalProps {
  isOpen: boolean;
  itemName: string;
  currentInstructions: string | null;
  onSave: (instructions: string) => void;
  onClose: () => void;
}

function SpecialInstructionsModal({
  isOpen,
  itemName,
  currentInstructions,
  onSave,
  onClose,
}: SpecialInstructionsModalProps) {
  const [instructions, setInstructions] = useState(currentInstructions || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInstructions(currentInstructions || '');
  }, [currentInstructions, isOpen]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(instructions.trim());
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Special Instructions</h2>
        <p className="text-sm text-gray-600 mb-4">{itemName}</p>

        <textarea
          ref={textareaRef}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., No onions, extra sauce, well done..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 active:scale-95 transition-transform"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpecialInstructionsModal;
