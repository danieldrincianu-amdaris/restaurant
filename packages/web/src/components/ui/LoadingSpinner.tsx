function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12" role="status">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;
