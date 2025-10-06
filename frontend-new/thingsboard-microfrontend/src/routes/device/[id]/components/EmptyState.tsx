export const EmptyState = () => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="text-gray-500 mb-4">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Medical Parameters Configured
      </h3>
      <p className="text-gray-600 mb-4">
        Start by adding medical parameters with their threshold values for monitoring.
      </p>
      <p className="text-sm text-gray-500">
        Available parameters: Temperature, Heart Rate, Oxygen Saturation, Respiratory Rate
      </p>
    </div>
  );
};