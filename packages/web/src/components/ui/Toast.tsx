import { useToast, Toast as ToastType } from '../../contexts/ToastContext';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast: ToastType) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md
            ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
            animate-slide-in
          `}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white hover:text-gray-200 font-bold text-lg"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
