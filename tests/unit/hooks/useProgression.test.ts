import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProgression } from '../../../src/hooks/useProgression';
import { useProgressStore } from '../../../src/stores/progressStore';
import { useAllModules } from '../../../src/hooks/useModuleData';
import { progressionService } from '../../../src/services/progressionService';
import type { LearningModule } from '../../../src/types';

// Mock dependencies
vi.mock('../../../src/stores/progressStore');
vi.mock('../../../src/hooks/useModuleData');
vi.mock('../../../src/services/progressionService');
vi.mock('../../../src/utils/logger', () => ({
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

const mockModules: LearningModule[] = [
  {
    id: 'flashcard-basic-vocabulary-a1',
    name: 'Basic Vocabulary',
    learningMode: 'flashcard',
    level: ['a1'],
    category: 'Vocabulary',
    unit: 1,
    prerequisites: [],
    estimatedTime: 5,
    difficulty: 1
  },
  {
    id: 'matching-basic-grammar-a1',
    name: 'Basic Grammar',
    learningMode: 'matching',
    level: ['a1'],
    category: 'Grammar',
    unit: 1,
    prerequisites: ['flashcard-basic-vocabulary-a1'],
    estimatedTime: 5,
    difficulty: 1
  },
  {
    id: 'flashcard-family-a2',
    name: 'Family',
    learningMode: 'flashcard',
    level: ['a2'],
    category: 'Vocabulary',
    unit: 2,
    prerequisites: ['matching-basic-grammar-a1'],
    estimatedTime: 5,
    difficulty: 2
  }
];

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

describe('useProgression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useAllModules
    vi.mocked(useAllModules).mockReturnValue({
      data: mockModules,
      isLoading: false,
      error: null,
    });
    
    // Mock useProgressStore
    vi.mocked(useProgressStore).mockReturnValue({
      getCompletedModuleIds: vi.fn().mockReturnValue(['flashcard-basic-vocabulary-a1']),
      isModuleCompleted: vi.fn().mockImplementation((moduleId: string) => 
        moduleId === 'flashcard-basic-vocabulary-a1'
      ),
    });
    
    // Mock progressionService methods
    vi.mocked(progressionService.initialize).mockImplementation(() => {});
    vi.mocked(progressionService.getUnlockedModules).mockReturnValue([
      mockModules[0], mockModules[1]
    ]);
    vi.mocked(progressionService.getLockedModules).mockReturnValue([
      mockModules[2]
    ]);
    vi.mocked(progressionService.getNextAvailableModules).mockReturnValue([
      mockModules[1]
    ]);
    vi.mocked(progressionService.getProgressionStats).mockReturnValue({
      totalModules: 3,
      completedModules: 1,
      unlockedModules: 2,
      lockedModules: 1,
      completionPercentage: 33
    });
    vi.mocked(progressionService.isModuleUnlocked).mockImplementation((moduleId: string) => {
      return moduleId !== 'flashcard-family-a2';
    });
    vi.mocked(progressionService.getModulePrerequisites).mockReturnValue([]);
    vi.mocked(progressionService.getMissingPrerequisites).mockReturnValue([]);
    vi.mocked(progressionService.getProgressionPath).mockReturnValue([]);
    vi.mocked(progressionService.getModulesByUnit).mockReturnValue([]);
    vi.mocked(progressionService.getUnitCompletionStatus).mockReturnValue({
      total: 2,
      completed: 1,
      percentage: 50,
      allCompleted: false
    });
  });

  it('should initialize progression service with modules and completed IDs', async () => {
    renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(progressionService.initialize).toHaveBeenCalledWith(
        mockModules,
        ['flashcard-basic-vocabulary-a1']
      );
    });
  });

  it('should return progression data when modules are loaded', async () => {
    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unlockedModules).toHaveLength(2);
    expect(result.current.lockedModules).toHaveLength(1);
    expect(result.current.nextAvailableModules).toHaveLength(1);
    expect(result.current.stats.completionPercentage).toBe(33);
  });

  it('should provide progression utilities', async () => {
    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isModuleUnlocked('flashcard-basic-vocabulary-a1')).toBe(true);
    expect(result.current.isModuleUnlocked('flashcard-family-a2')).toBe(false);
    expect(result.current.canAccessModule('flashcard-basic-vocabulary-a1')).toBe(true);
  });

  it('should handle loading state correctly', () => {
    vi.mocked(useAllModules).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should handle error state correctly', () => {
    const error = new Error('Failed to load modules');
    vi.mocked(useAllModules).mockReturnValue({
      data: [],
      isLoading: false,
      error,
    });

    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.unlockedModules).toEqual([]);
    expect(result.current.lockedModules).toEqual([]);
  });

  it('should return correct module status', async () => {
    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.getModuleStatus('flashcard-basic-vocabulary-a1')).toBe('completed');
    expect(result.current.getModuleStatus('matching-basic-grammar-a1')).toBe('unlocked');
    expect(result.current.getModuleStatus('flashcard-family-a2')).toBe('locked');
  });

  it('should get unlocked modules by unit', async () => {
    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(progressionService.getModulesByUnit).mockReturnValue([mockModules[0], mockModules[1]]);
    vi.mocked(progressionService.isModuleUnlocked).mockImplementation((moduleId: string) => {
      return moduleId === 'flashcard-basic-vocabulary-a1' || moduleId === 'matching-basic-grammar-a1';
    });

    const unlockedInUnit1 = result.current.getUnlockedModulesByUnit(1);
    expect(unlockedInUnit1).toHaveLength(2);
  });

  it('should get next recommended module', async () => {
    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(progressionService.getNextAvailableModules).mockReturnValue([mockModules[1]]);

    const nextModule = result.current.getNextRecommendedModule();
    expect(nextModule).toEqual(mockModules[1]);
  });

  it('should return null when no next module available', async () => {
    const { result } = renderHook(() => useProgression(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(progressionService.getNextAvailableModules).mockReturnValue([]);

    const nextModule = result.current.getNextRecommendedModule();
    expect(nextModule).toBeNull();
  });
});