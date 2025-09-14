import React, { Suspense, lazy } from 'react';

// Lazy load the ProgressDashboard component
const ProgressDashboard = lazy(() =>
  import('./ProgressDashboard').then(module => ({ default: module.ProgressDashboard }))
);

interface LazyProgressDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProgressDashboardSkeleton: React.FC = () => (
  <div className="dashboard-modal-overlay">
    <div className="dashboard-modal-container">
      <div className="p-6 sm:p-8">
        {/* Enhanced Header with Better Contrast */}
        <div className="dashboard-header">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
          </div>
          <div className="dashboard-action-buttons">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="animate-pulse">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-300 dark:bg-gray-600 rounded mr-2 sm:mr-3"></div>
                  <div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-4"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const LazyProgressDashboard: React.FC<LazyProgressDashboardProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <Suspense fallback={<ProgressDashboardSkeleton />}>
      <ProgressDashboard isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
};
