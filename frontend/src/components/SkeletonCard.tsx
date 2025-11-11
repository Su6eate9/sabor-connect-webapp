export const SkeletonCard = () => {
  return (
    <div className="card animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-16"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-14"></div>
        </div>
      </div>
    </div>
  );
};
