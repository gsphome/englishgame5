import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAppConfig, useAvailableCategories, useAvailableLevels } from '../../../src/hooks/useAppConfig';
import * as secureHttp from '../../../src/utils/secureHttp';
import * as pathUtils from '../../../src/utils/pathUtils';

// Mock the dependencies
vi.mock('../../../src/utils/secureHttp');
vi.mock('../../../src/utils/pathUtils');
vi.mock('../../../src/utils/logger', () => ({
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

const mockConfig = {
  learningSettings: {
    categories: [
      'Vocabulary',
      'Grammar', 
      'PhrasalVerbs',
      'Idioms',
      'Pronunciation',
      'Listening',
      'Reading',
      'Writing',
      'Speaking',
      'Review'
    ],
    levels: [
      { code: 'a1', name: 'Beginner', description: 'Basic level', color: '#4CAF50' },
      { code: 'a2', name: 'Elementary', description: 'Elementary level', color: '#8BC34A' },
      { code: 'b1', name: 'Intermediate', description: 'Intermediate level', color: '#FFC107' },
      { code: 'b2', name: 'Upper Intermediate', description: 'Upper intermediate level', color: '#FF9800' },
      { code: 'c1', name: 'Advanced', description: 'Advanced level', color: '#FF5722' },
      { code: 'c2', name: 'Proficient', description: 'Proficient level', color: '#F44336' }
    ],
    units: [
      { id: 1, name: 'Foundation', description: 'Basic foundation', targetLevel: ['a1'] },
      { id: 2, name: 'Building Blocks', description: 'Building blocks', targetLevel: ['a2'] },
      { id: 3, name: 'Communication', description: 'Communication skills', targetLevel: ['b1'] },
      { id: 4, name: 'Fluency', description: 'Fluency development', targetLevel: ['b2'] },
      { id: 5, name: 'Proficiency', description: 'Advanced proficiency', targetLevel: ['c1'] },
      { id: 6, name: 'Mastery', description: 'Language mastery', targetLevel: ['c2'] }
    ]
  },
  progressTracking: {
    enabled: true,
    adaptiveLearning: true
  }
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAppConfig hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pathUtils.getAssetPath).mockReturnValue('mocked-path');
  });

  describe('useAppConfig', () => {
    it('should load app config successfully', async () => {
      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockConfig);

      const { result } = renderHook(() => useAppConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockConfig);
      expect(result.current.data?.learningSettings.categories).toHaveLength(10);
      expect(result.current.data?.learningSettings.levels).toHaveLength(6);
    });

    it('should return fallback config on error', async () => {
      vi.mocked(secureHttp.secureJsonFetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAppConfig(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should return fallback config
      expect(result.current.data?.learningSettings.categories).toContain('Vocabulary');
      expect(result.current.data?.learningSettings.levels).toHaveLength(6);
    });
  });

  describe('useAvailableCategories', () => {
    it('should return categories from config', async () => {
      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockConfig);

      const { result } = renderHook(() => useAvailableCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.categories).toHaveLength(10);
      });

      expect(result.current.categories).toEqual(mockConfig.learningSettings.categories);
      expect(result.current.categories).toContain('Pronunciation');
      expect(result.current.categories).toContain('Review');
    });
  });

  describe('useAvailableLevels', () => {
    it('should return levels from config', async () => {
      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockConfig);

      const { result } = renderHook(() => useAvailableLevels(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.levels).toHaveLength(6);
      });

      expect(result.current.levels).toEqual(mockConfig.learningSettings.levels);
      expect(result.current.levels[0].code).toBe('a1');
      expect(result.current.levels[5].code).toBe('c2');
    });
  });
});