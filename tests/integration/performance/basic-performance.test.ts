import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAppConfig } from '../../../src/hooks/useAppConfig';
import { apiService } from '../../../src/services/api';
import * as secureHttp from '../../../src/utils/secureHttp';
import * as pathUtils from '../../../src/utils/pathUtils';

// Mock dependencies
vi.mock('../../../src/utils/secureHttp');
vi.mock('../../../src/utils/pathUtils');
vi.mock('../../../src/utils/logger', () => ({
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('Basic Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.clearCache();
    
    // Mock path utilities
    vi.mocked(pathUtils.getLearningModulesPath).mockReturnValue('/data/learningModules.json');
    vi.mocked(pathUtils.getAssetPath).mockImplementation((path: string) => `/assets/${path}`);
    vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);
  });

  describe('Hook Performance', () => {
    it('should load app config within reasonable time', async () => {
      const mockConfig = {
        learningSettings: {
          categories: ['Vocabulary', 'Grammar', 'PhrasalVerbs', 'Idioms'],
          levels: [
            { code: 'a1', name: 'Beginner', description: 'Basic level', color: '#4CAF50' },
            { code: 'a2', name: 'Elementary', description: 'Elementary level', color: '#8BC34A' },
          ],
          units: [
            { id: 1, name: 'Foundation', description: 'Basic foundation', targetLevel: ['a1'] },
            { id: 2, name: 'Building Blocks', description: 'Building blocks', targetLevel: ['a2'] },
          ]
        },
        progressTracking: {
          enabled: true,
          adaptiveLearning: true
        }
      };

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockConfig);

      const startTime = performance.now();
      
      const { result } = renderHook(() => useAppConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 2000 });

      const loadTime = performance.now() - startTime;
      
      expect(loadTime).toBeLessThan(1000); // Should load within 1 second
      expect(result.current.data).toBeDefined();
      
      console.log(`✅ App config loaded in ${Math.round(loadTime)}ms`);
    });

    it('should handle multiple concurrent hook calls efficiently', async () => {
      const mockConfig = {
        learningSettings: {
          categories: ['Vocabulary', 'Grammar'],
          levels: [{ code: 'a1', name: 'Beginner', description: 'Basic level', color: '#4CAF50' }],
          units: [{ id: 1, name: 'Foundation', description: 'Basic foundation', targetLevel: ['a1'] }]
        },
        progressTracking: { enabled: true, adaptiveLearning: true }
      };

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockConfig);

      const startTime = performance.now();
      
      // Create multiple concurrent hook calls
      const hooks = Array(5).fill(null).map(() => 
        renderHook(() => useAppConfig(), { wrapper: createWrapper() })
      );

      // Wait for all to complete
      await Promise.all(hooks.map(({ result }) => 
        waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        }, { timeout: 2000 })
      ));

      const totalTime = performance.now() - startTime;
      
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
      
      // All should have the same data
      hooks.forEach(({ result }) => {
        expect(result.current.data).toEqual(mockConfig);
      });
      
      console.log(`✅ ${hooks.length} concurrent config loads completed in ${Math.round(totalTime)}ms`);
    });
  });

  describe('API Service Performance', () => {
    it('should fetch modules efficiently', async () => {
      const mockModules = Array(20).fill(null).map((_, i) => ({
        id: `module-${i}`,
        name: `Module ${i}`,
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
      }));

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const startTime = performance.now();
      
      const result = await apiService.fetchModules();
      
      const loadTime = performance.now() - startTime;
      
      expect(loadTime).toBeLessThan(500); // Should load within 500ms
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(20);
      
      console.log(`✅ ${result.data.length} modules fetched in ${Math.round(loadTime)}ms`);
    });

    it('should benefit from caching on repeated calls', async () => {
      const mockModules = Array(10).fill(null).map((_, i) => ({
        id: `module-${i}`,
        name: `Module ${i}`,
        learningMode: 'flashcard',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
      }));

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      // First call
      const startTime1 = performance.now();
      const result1 = await apiService.fetchModules();
      const firstCallTime = performance.now() - startTime1;

      // Second call (should use cache)
      const startTime2 = performance.now();
      const result2 = await apiService.fetchModules();
      const secondCallTime = performance.now() - startTime2;

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result2.data).toEqual(result1.data);
      
      // Second call should be significantly faster
      expect(secondCallTime).toBeLessThan(firstCallTime);
      expect(secondCallTime).toBeLessThan(50); // Cached call should be very fast
      
      // Should only make one actual HTTP call
      expect(secureHttp.secureJsonFetch).toHaveBeenCalledTimes(1);
      
      console.log(`✅ First call: ${Math.round(firstCallTime)}ms, Cached call: ${Math.round(secondCallTime)}ms`);
    });

    it('should handle large data filtering efficiently', () => {
      const largeDataSet = Array(1000).fill(null).map((_, i) => ({
        category: i % 2 === 0 ? 'Vocabulary' : 'Grammar',
        level: i % 3 === 0 ? 'a1' : 'b1',
        text: `Item ${i}`,
      }));

      const startTime = performance.now();
      
      const filtered = apiService.filterModuleData(
        largeDataSet,
        { categories: ['Vocabulary'], level: 'a1' },
        'test-module'
      );
      
      const filterTime = performance.now() - startTime;
      
      expect(filterTime).toBeLessThan(100); // Should filter within 100ms
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(item => item.category === 'Vocabulary' && item.level === 'a1')).toBe(true);
      
      console.log(`✅ Filtered ${largeDataSet.length} items to ${filtered.length} in ${Math.round(filterTime)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with repeated operations', async () => {
      const mockConfig = {
        learningSettings: {
          categories: ['Vocabulary'],
          levels: [{ code: 'a1', name: 'Beginner', description: 'Basic level', color: '#4CAF50' }],
          units: [{ id: 1, name: 'Foundation', description: 'Basic foundation', targetLevel: ['a1'] }]
        },
        progressTracking: { enabled: true, adaptiveLearning: true }
      };

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockConfig);

      // Measure initial memory if available
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform multiple operations
      for (let i = 0; i < 10; i++) {
        const { result, unmount } = renderHook(() => useAppConfig(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        }, { timeout: 1000 });

        // Clean up
        unmount();
        apiService.clearCache();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory should not grow significantly
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        const growthPercentage = (memoryGrowth / initialMemory) * 100;
        
        expect(growthPercentage).toBeLessThan(100); // Less than 100% growth
        
        console.log(`✅ Memory growth: ${Math.round(growthPercentage)}% after 10 iterations`);
      } else {
        console.log('✅ Memory measurement not available, but test completed without errors');
      }
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors quickly', async () => {
      vi.mocked(secureHttp.secureJsonFetch).mockRejectedValue(new Error('Network error'));

      const startTime = performance.now();
      
      const result = await apiService.fetchModules();
      
      const errorTime = performance.now() - startTime;
      
      expect(errorTime).toBeLessThan(1000); // Should fail quickly
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      
      console.log(`✅ Error handled in ${Math.round(errorTime)}ms`);
    });

    it('should handle invalid hook usage gracefully', async () => {
      // Test with invalid config
      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(null);

      const startTime = performance.now();
      
      const { result } = renderHook(() => useAppConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      }, { timeout: 2000 });

      const responseTime = performance.now() - startTime;
      
      expect(responseTime).toBeLessThan(2000);
      // Should return fallback config
      expect(result.current.data).toBeDefined();
      
      console.log(`✅ Invalid config handled with fallback in ${Math.round(responseTime)}ms`);
    });
  });
});