import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { apiService } from '../../../src/services/api';
import * as secureHttp from '../../../src/utils/secureHttp';
import * as pathUtils from '../../../src/utils/pathUtils';
import { renderWithProviders } from '../../helpers/test-utils';
import MatchingComponent from '../../../src/components/learning/MatchingComponent';
import type { LearningModule } from '../../../src/types';

// Mock dependencies
vi.mock('../../../src/utils/secureHttp');
vi.mock('../../../src/utils/pathUtils');
vi.mock('../../../src/utils/logger', () => ({
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

describe('API Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.clearCache();
    
    // Mock path utilities
    vi.mocked(pathUtils.getLearningModulesPath).mockReturnValue('/data/learningModules.json');
    vi.mocked(pathUtils.getAssetPath).mockImplementation((path: string) => `/assets/${path}`);
  });

  describe('fetchModules', () => {
    it('should fetch and enhance modules successfully', async () => {
      const mockModules = [
        {
          id: 'test-module-1',
          name: 'Test Module 1',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'test-module-2',
          name: 'Test Module 2',
          learningMode: 'quiz',
          level: ['a2'],
          category: 'Grammar',
          unit: 2,
          prerequisites: ['test-module-1'],
          estimatedTime: 10,
          difficulty: 4,
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      const result = await apiService.fetchModules();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      
      // Check enhancement of first module (missing values)
      expect(result.data[0].estimatedTime).toBe(5); // Default value
      expect(result.data[0].difficulty).toBe(3); // Default value
      expect(result.data[0].tags).toEqual(['Vocabulary']); // Default from category
      
      // Check second module (has values)
      expect(result.data[1].estimatedTime).toBe(10); // Original value
      expect(result.data[1].difficulty).toBe(4); // Original value
    });

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(secureHttp.secureJsonFetch).mockRejectedValue(new Error('Network error'));
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      const result = await apiService.fetchModules();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Network error');
    });

    it('should use cache on subsequent calls', async () => {
      const mockModules = [
        {
          id: 'test-module-1',
          name: 'Test Module 1',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: [],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      // First call
      const result1 = await apiService.fetchModules();
      expect(result1.success).toBe(true);

      // Second call should use cache
      const result2 = await apiService.fetchModules();
      expect(result2.success).toBe(true);
      expect(result2.data).toEqual(result1.data);

      // secureJsonFetch should only be called once
      expect(secureHttp.secureJsonFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchModuleData', () => {
    it('should fetch module with data successfully', async () => {
      const mockModules = [
        {
          id: 'test-flashcard',
          name: 'Test Flashcard',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: [],
          dataPath: 'data/test-flashcard.json',
        }
      ];

      const mockModuleData = [
        { en: 'hello', es: 'hola' },
        { en: 'goodbye', es: 'adiós' }
      ];

      vi.mocked(secureHttp.secureJsonFetch)
        .mockResolvedValueOnce(mockModules) // First call for modules list
        .mockResolvedValueOnce(mockModuleData); // Second call for module data
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      const result = await apiService.fetchModuleData('test-flashcard');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('test-flashcard');
      expect(result.data.data).toEqual(mockModuleData);
      expect(secureHttp.secureJsonFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle module not found', async () => {
      const mockModules = [
        {
          id: 'existing-module',
          name: 'Existing Module',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: [],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      const result = await apiService.fetchModuleData('non-existent-module');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Module non-existent-module not found');
    });

    it('should handle module without dataPath', async () => {
      const mockModules = [
        {
          id: 'no-data-module',
          name: 'No Data Module',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: [],
          // No dataPath
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      const result = await apiService.fetchModuleData('no-data-module');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('no-data-module');
      expect(result.data.data).toBeUndefined();
      // Should only call once for modules list, not for data
      expect(secureHttp.secureJsonFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('filterModuleData', () => {
    const mockData = [
      { category: 'Vocabulary', level: 'a1', text: 'Item 1' },
      { category: 'Grammar', level: 'a1', text: 'Item 2' },
      { category: 'Vocabulary', level: 'b1', text: 'Item 3' },
      { category: 'PhrasalVerbs', level: 'b1', text: 'Item 4' },
    ];

    it('should filter by categories', () => {
      const result = apiService.filterModuleData(
        mockData,
        { categories: ['Vocabulary'] },
        'test-module'
      );

      expect(result).toHaveLength(2);
      expect(result.every(item => item.category === 'Vocabulary')).toBe(true);
    });

    it('should filter by level', () => {
      const result = apiService.filterModuleData(
        mockData,
        { level: 'a1' },
        'test-module'
      );

      expect(result).toHaveLength(2);
      expect(result.every(item => item.level === 'a1')).toBe(true);
    });

    it('should apply limit', () => {
      const result = apiService.filterModuleData(
        mockData,
        { limit: 2 },
        'test-module'
      );

      expect(result).toHaveLength(2);
    });

    it('should handle sorting modules differently', () => {
      const result = apiService.filterModuleData(
        mockData,
        { categories: ['Vocabulary'], level: 'a1' },
        'sorting-test-module'
      );

      // For sorting modules, categories filter is ignored
      expect(result).toHaveLength(2); // Only level filter applied
      expect(result.every(item => item.level === 'a1')).toBe(true);
    });

    it('should handle empty data', () => {
      const result = apiService.filterModuleData(
        [],
        { categories: ['Vocabulary'] },
        'test-module'
      );

      expect(result).toEqual([]);
    });

    it('should handle non-array data', () => {
      const result = apiService.filterModuleData(
        null as any,
        { categories: ['Vocabulary'] },
        'test-module'
      );

      expect(result).toEqual([]);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      apiService.clearCache();
      const stats = apiService.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });

    it('should provide cache statistics', async () => {
      const mockModules = [{ id: 'test', name: 'Test', learningMode: 'flashcard', level: ['a1'], category: 'Vocabulary', unit: 1, prerequisites: [] }];
      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      await apiService.fetchModules();
      
      const stats = apiService.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.keys.length).toBeGreaterThan(0);
    });
  });

  describe('CSS Architecture Integration', () => {
    it('should verify component rendering works with new CSS architecture', async () => {
      // Mock API data for component rendering
      const mockModule: LearningModule = {
        id: 'css-test-module',
        name: 'CSS Test Module',
        learningMode: 'matching',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
        data: [
          { id: '1', left: 'Hello', right: 'Hola', explanation: 'Basic greeting' },
          { id: '2', left: 'Goodbye', right: 'Adiós', explanation: 'Farewell' }
        ]
      };

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue([mockModule]);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      // Fetch module data through API
      const apiResult = await apiService.fetchModuleData('css-test-module');
      expect(apiResult.success).toBe(true);

      // Render component with API data
      const { container } = renderWithProviders(
        <MatchingComponent module={apiResult.data} />
      );

      // Verify component renders with proper BEM classes
      expect(container.querySelector('.matching-component')).toBeInTheDocument();
      expect(container.querySelector('.matching-component__item')).toBeInTheDocument();
      
      // Verify no Tailwind classes are present
      const elementsWithClasses = container.querySelectorAll('[class]');
      elementsWithClasses.forEach(element => {
        const classList = Array.from(element.classList);
        classList.forEach(className => {
          // Skip utility classes and non-BEM classes
          if (className.startsWith('sr-') || className === 'lucide' || className.includes('icon')) {
            return;
          }
          
          // Should not contain Tailwind patterns
          const tailwindPatterns = [
            /^(bg|text|border|p|m|w|h|flex|grid|rounded|shadow)-/,
            /^(hover|focus|active|dark):/,
            /^(sm|md|lg|xl):/
          ];
          
          const hasTailwindPattern = tailwindPatterns.some(pattern => pattern.test(className));
          expect(hasTailwindPattern).toBe(false);
        });
      });
    });

    it('should test theme context affects component appearance in integration', async () => {
      const mockModule: LearningModule = {
        id: 'theme-test-module',
        name: 'Theme Test Module',
        learningMode: 'matching',
        level: ['a1'],
        category: 'Vocabulary',
        unit: 1,
        prerequisites: [],
        data: [
          { id: '1', left: 'Test', right: 'Prueba', explanation: 'Test word' }
        ]
      };

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue([mockModule]);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      const apiResult = await apiService.fetchModuleData('theme-test-module');
      expect(apiResult.success).toBe(true);

      // Test light theme
      document.documentElement.classList.remove('dark');
      const { container: lightContainer } = renderWithProviders(
        <MatchingComponent module={apiResult.data} />
      );

      // Test dark theme
      document.documentElement.classList.add('dark');
      const { container: darkContainer } = renderWithProviders(
        <MatchingComponent module={apiResult.data} />
      );

      // Both should render with same BEM structure
      expect(lightContainer.querySelector('.matching-component')).toBeInTheDocument();
      expect(darkContainer.querySelector('.matching-component')).toBeInTheDocument();
      
      // Clean up
      document.documentElement.classList.remove('dark');
    });

    it('should ensure API data loading does not conflict with CSS changes', async () => {
      const mockModules = [
        {
          id: 'load-test-1',
          name: 'Load Test 1',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: [],
        },
        {
          id: 'load-test-2',
          name: 'Load Test 2',
          learningMode: 'quiz',
          level: ['a2'],
          category: 'Grammar',
          unit: 2,
          prerequisites: [],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      // Measure API performance
      const startTime = performance.now();
      const result = await apiService.fetchModules();
      const endTime = performance.now();
      const apiLoadTime = endTime - startTime;

      // API should load quickly regardless of CSS architecture
      expect(result.success).toBe(true);
      expect(apiLoadTime).toBeLessThan(100); // Should be fast

      // Verify data structure is not affected by CSS changes
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('load-test-1');
      expect(result.data[1].id).toBe('load-test-2');
    });

    it('should validate BEM class structure in API-driven components', async () => {
      const mockModule: LearningModule = {
        id: 'bem-validation-module',
        name: 'BEM Validation Module',
        learningMode: 'matching',
        level: ['b1'],
        category: 'Grammar',
        unit: 3,
        prerequisites: [],
        data: [
          { id: '1', left: 'Complex', right: 'Complejo', explanation: 'Advanced word' },
          { id: '2', left: 'Simple', right: 'Simple', explanation: 'Basic word' }
        ]
      };

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue([mockModule]);
      vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);

      const apiResult = await apiService.fetchModuleData('bem-validation-module');
      const { container } = renderWithProviders(
        <MatchingComponent module={apiResult.data} />
      );

      // Validate strict BEM naming in API-driven component
      const elementsWithClasses = container.querySelectorAll('[class]');
      elementsWithClasses.forEach(element => {
        const classList = Array.from(element.classList);
        classList.forEach(className => {
          // Skip utility classes
          if (className.startsWith('sr-') || className === 'lucide' || className.includes('icon')) {
            return;
          }
          
          // Should follow BEM pattern: block__element--modifier
          const bemPattern = /^[a-z-]+(__[a-z-]+)?(--[a-z-]+)?$/;
          expect(className).toMatch(bemPattern);
        });
      });
    });
  });
});