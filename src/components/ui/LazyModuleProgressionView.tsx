import React, { Suspense, lazy } from 'react';

// Lazy load the ModuleProgressionView component
const ModuleProgressionView = lazy(() =>
  import('./ModuleProgressionView').then(module => ({ default: module.ModuleProgressionView }))
);

interface LazyModuleProgressionViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModuleProgressionSkeleton: React.FC = () => (
  <div className="module-progression-overlay">
    <div className="module-progression-container">
      <div className="module-progression-header">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
        </div>
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
      </div>
      <div className="module-progression-content">
        {/* Summary skeleton */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="flex justify-center gap-8 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-8 mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mx-auto"></div>
        </div>

        {/* Units skeleton */}
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div>
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                <div className="w-24 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2].map(j => (
                <div key={j}>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(k => (
                      <div
                        key={k}
                        className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                        </div>
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LazyModuleProgressionView: React.FC<LazyModuleProgressionViewProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <Suspense fallback={<ModuleProgressionSkeleton />}>
      <ModuleProgressionView isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
};
