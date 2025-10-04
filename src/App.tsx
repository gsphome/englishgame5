import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRouter } from './components/layout/AppRouter';
import { MemoizedHeader, MemoizedToastContainer } from './components/ui/MemoizedComponents';
import { useAppStore } from './stores/appStore';
import { useMaxLimits } from './hooks/useMaxLimits';
import { useSystemTheme } from './hooks/useSystemTheme';
import { toast } from './stores/toastStore';

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { currentView } = useAppStore();

  // Calculate max limits based on available data
  useMaxLimits();

  // Set up system theme listener
  useSystemTheme();

  // Handle view changes and cleanup
  useEffect(() => {
    const prevView = sessionStorage.getItem('prevView') || 'menu';
    sessionStorage.setItem('prevView', currentView);

    // Clear toasts when changing views (immediate, no delays)
    if (currentView !== prevView) {
      const learningModes = ['flashcard', 'quiz', 'completion', 'sorting', 'matching'];

      if (learningModes.includes(prevView) || learningModes.includes(currentView)) {
        toast.clearOnNavigation();
      }
    }

    // Restore scroll position when returning to menu
    if (currentView === 'menu' && prevView !== 'menu') {
      const savedScroll = sessionStorage.getItem('menuGridScrollPosition');
      if (savedScroll) {
        const scrollPos = parseInt(savedScroll, 10);
        requestAnimationFrame(() => {
          const gridElement = document.querySelector('.main-menu__grid');
          if (gridElement) {
            gridElement.scrollTop = scrollPos;
          }
        });
      }
    }
  }, [currentView]);

  return (
    <ErrorBoundary>
      <div className="layout-container" data-view={currentView}>
        <MemoizedHeader />

        <main className="layout-main">
          <AppRouter />
        </main>

        <MemoizedToastContainer />
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
