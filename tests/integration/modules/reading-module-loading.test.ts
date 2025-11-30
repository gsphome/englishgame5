import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService } from '../../../src/services/api';
import * as secureHttp from '../../../src/utils/secureHttp';
import * as pathUtils from '../../../src/utils/pathUtils';
import type { LearningModule, ReadingData } from '../../../src/types';

// Mock dependencies
vi.mock('../../../src/utils/secureHttp');
vi.mock('../../../src/utils/pathUtils');
vi.mock('../../../src/utils/logger', () => ({
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

describe('Reading Module Loading Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiService.clearCache();
    
    // Mock path utilities
    vi.mocked(pathUtils.getLearningModulesPath).mockReturnValue('/data/learningModules.json');
    vi.mocked(pathUtils.getAssetPath).mockImplementation((path: string) => `/assets/${path}`);
    vi.mocked(secureHttp.validateUrl).mockImplementation((url: string) => url);
  });

  describe('fetchModules - Reading Mode', () => {
    it('should fetch reading modules successfully', async () => {
      const mockModules = [
        {
          id: 'reading-business-a1',
          name: 'Business Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-business.json',
        },
        {
          id: 'reading-travel-a1',
          name: 'Travel Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 2,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-travel.json',
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      
      // Verify reading modules are properly enhanced
      const readingModules = result.data.filter(m => m.learningMode === 'reading');
      expect(readingModules).toHaveLength(2);
      expect(readingModules[0].estimatedTime).toBeDefined();
      expect(readingModules[0].difficulty).toBeDefined();
    });

    it('should load all 18 reading modules across CEFR levels', async () => {
      const mockModules = [
        // A1 level (3 modules)
        { id: 'reading-business-a1', name: 'Business Reading A1', learningMode: 'reading', level: ['a1'], category: 'Reading', unit: 1, prerequisites: [], dataPath: 'data/a1/a1-reading-business.json' },
        { id: 'reading-travel-a1', name: 'Travel Reading A1', learningMode: 'reading', level: ['a1'], category: 'Reading', unit: 2, prerequisites: [], dataPath: 'data/a1/a1-reading-travel.json' },
        { id: 'reading-daily-life-a1', name: 'Daily Life Reading A1', learningMode: 'reading', level: ['a1'], category: 'Reading', unit: 3, prerequisites: [], dataPath: 'data/a1/a1-reading-daily-life.json' },
        // A2 level (3 modules)
        { id: 'reading-culture-a2', name: 'Culture Reading A2', learningMode: 'reading', level: ['a2'], category: 'Reading', unit: 1, prerequisites: [], dataPath: 'data/a2/a2-reading-culture.json' },
        { id: 'reading-technology-a2', name: 'Technology Reading A2', learningMode: 'reading', level: ['a2'], category: 'Reading', unit: 2, prerequisites: [], dataPath: 'data/a2/a2-reading-technology.json' },
        { id: 'reading-health-a2', name: 'Health Reading A2', learningMode: 'reading', level: ['a2'], category: 'Reading', unit: 3, prerequisites: [], dataPath: 'data/a2/a2-reading-health.json' },
        // B1 level (3 modules)
        { id: 'reading-education-b1', name: 'Education Reading B1', learningMode: 'reading', level: ['b1'], category: 'Reading', unit: 1, prerequisites: [], dataPath: 'data/b1/b1-reading-education.json' },
        { id: 'reading-environment-b1', name: 'Environment Reading B1', learningMode: 'reading', level: ['b1'], category: 'Reading', unit: 2, prerequisites: [], dataPath: 'data/b1/b1-reading-environment.json' },
        { id: 'reading-social-media-b1', name: 'Social Media Reading B1', learningMode: 'reading', level: ['b1'], category: 'Reading', unit: 3, prerequisites: [], dataPath: 'data/b1/b1-reading-social-media.json' },
        // B2 level (3 modules)
        { id: 'reading-professional-b2', name: 'Professional Reading B2', learningMode: 'reading', level: ['b2'], category: 'Reading', unit: 1, prerequisites: [], dataPath: 'data/b2/b2-reading-professional.json' },
        { id: 'reading-global-issues-b2', name: 'Global Issues Reading B2', learningMode: 'reading', level: ['b2'], category: 'Reading', unit: 2, prerequisites: [], dataPath: 'data/b2/b2-reading-global-issues.json' },
        { id: 'reading-innovation-b2', name: 'Innovation Reading B2', learningMode: 'reading', level: ['b2'], category: 'Reading', unit: 3, prerequisites: [], dataPath: 'data/b2/b2-reading-innovation.json' },
        // C1 level (3 modules)
        { id: 'reading-academic-c1', name: 'Academic Reading C1', learningMode: 'reading', level: ['c1'], category: 'Reading', unit: 1, prerequisites: [], dataPath: 'data/c1/c1-reading-academic.json' },
        { id: 'reading-leadership-c1', name: 'Leadership Reading C1', learningMode: 'reading', level: ['c1'], category: 'Reading', unit: 2, prerequisites: [], dataPath: 'data/c1/c1-reading-leadership.json' },
        { id: 'reading-cultural-analysis-c1', name: 'Cultural Analysis Reading C1', learningMode: 'reading', level: ['c1'], category: 'Reading', unit: 3, prerequisites: [], dataPath: 'data/c1/c1-reading-cultural-analysis.json' },
        // C2 level (3 modules)
        { id: 'reading-specialized-c2', name: 'Specialized Reading C2', learningMode: 'reading', level: ['c2'], category: 'Reading', unit: 1, prerequisites: [], dataPath: 'data/c2/c2-reading-specialized.json' },
        { id: 'reading-philosophical-c2', name: 'Philosophical Reading C2', learningMode: 'reading', level: ['c2'], category: 'Reading', unit: 2, prerequisites: [], dataPath: 'data/c2/c2-reading-philosophical.json' },
        { id: 'reading-literary-c2', name: 'Literary Reading C2', learningMode: 'reading', level: ['c2'], category: 'Reading', unit: 3, prerequisites: [], dataPath: 'data/c2/c2-reading-literary.json' },
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModules();

      expect(result.success).toBe(true);
      
      // Verify we have exactly 18 reading modules
      const readingModules = result.data.filter(m => m.learningMode === 'reading');
      expect(readingModules).toHaveLength(18);
      
      // Verify 3 modules per level
      const a1Modules = readingModules.filter(m => m.level.includes('a1'));
      const a2Modules = readingModules.filter(m => m.level.includes('a2'));
      const b1Modules = readingModules.filter(m => m.level.includes('b1'));
      const b2Modules = readingModules.filter(m => m.level.includes('b2'));
      const c1Modules = readingModules.filter(m => m.level.includes('c1'));
      const c2Modules = readingModules.filter(m => m.level.includes('c2'));
      
      expect(a1Modules).toHaveLength(3);
      expect(a2Modules).toHaveLength(3);
      expect(b1Modules).toHaveLength(3);
      expect(b2Modules).toHaveLength(3);
      expect(c1Modules).toHaveLength(3);
      expect(c2Modules).toHaveLength(3);
    });
  });

  describe('fetchModuleData - Reading Content', () => {
    it('should fetch reading module with complete data structure', async () => {
      const mockModules = [
        {
          id: 'reading-business-a1',
          name: 'Business Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-business.json',
        }
      ];

      const mockReadingData: ReadingData = {
        title: 'Introduction to Business English',
        estimatedReadingTime: 8,
        learningObjectives: [
          'Understand basic business vocabulary',
          'Learn common business greetings',
        ],
        sections: [
          {
            id: 'intro',
            title: 'Business Communication Basics',
            type: 'introduction',
            content: 'Business English is essential for professional communication...',
          },
          {
            id: 'vocabulary',
            title: 'Key Business Terms',
            type: 'theory',
            content: 'Let\'s explore essential business vocabulary...',
            interactive: {
              highlights: ['professional communication', 'business etiquette'],
              tooltips: [
                {
                  term: 'etiquette',
                  definition: 'The customary code of polite behavior',
                }
              ],
            }
          }
        ],
        keyVocabulary: [
          {
            term: 'meeting',
            definition: 'A gathering of people for discussion',
            example: 'We have a team meeting at 3 PM',
            pronunciation: '/ˈmiːtɪŋ/',
          }
        ],
        grammarPoints: [
          {
            rule: 'Formal vs Informal Greetings',
            explanation: 'In business, use formal greetings like "Good morning"',
            examples: ['Formal: Good morning, Mr. Smith', 'Informal: Hi there!'],
            commonMistakes: ['Using "Hey" in professional emails'],
          }
        ],
      };

      vi.mocked(secureHttp.secureJsonFetch)
        .mockResolvedValueOnce(mockModules)
        .mockResolvedValueOnce([mockReadingData]);

      const result = await apiService.fetchModuleData('reading-business-a1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('reading-business-a1');
      expect(result.data.data).toBeDefined();
      
      const readingData = result.data.data[0] as ReadingData;
      expect(readingData.title).toBe('Introduction to Business English');
      expect(readingData.sections).toHaveLength(2);
      expect(readingData.learningObjectives).toHaveLength(2);
      expect(readingData.keyVocabulary).toHaveLength(1);
      expect(readingData.grammarPoints).toHaveLength(1);
    });

    it('should handle reading module with interactive content', async () => {
      const mockModules = [
        {
          id: 'reading-travel-a1',
          name: 'Travel Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 2,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-travel.json',
        }
      ];

      const mockReadingData: ReadingData = {
        title: 'Travel Essentials',
        estimatedReadingTime: 10,
        learningObjectives: ['Learn travel vocabulary'],
        sections: [
          {
            id: 'section1',
            title: 'At the Airport',
            type: 'examples',
            content: 'Common airport situations...',
            interactive: {
              tooltips: [
                { term: 'boarding pass', definition: 'Document needed to board a plane' },
                { term: 'gate', definition: 'Where you board the plane' },
              ],
              expandable: [
                {
                  title: 'Airport Vocabulary',
                  content: 'check-in, security, customs, baggage claim...',
                }
              ],
              highlights: ['passport', 'ticket', 'luggage'],
            }
          }
        ],
        keyVocabulary: [],
      };

      vi.mocked(secureHttp.secureJsonFetch)
        .mockResolvedValueOnce(mockModules)
        .mockResolvedValueOnce([mockReadingData]);

      const result = await apiService.fetchModuleData('reading-travel-a1');

      expect(result.success).toBe(true);
      const readingData = result.data.data[0] as ReadingData;
      
      // Verify interactive content
      expect(readingData.sections[0].interactive).toBeDefined();
      expect(readingData.sections[0].interactive?.tooltips).toHaveLength(2);
      expect(readingData.sections[0].interactive?.expandable).toHaveLength(1);
      expect(readingData.sections[0].interactive?.highlights).toHaveLength(3);
    });

    it('should handle reading module without optional fields', async () => {
      const mockModules = [
        {
          id: 'reading-minimal',
          name: 'Minimal Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-minimal.json',
        }
      ];

      const mockReadingData: ReadingData = {
        title: 'Minimal Reading Module',
        estimatedReadingTime: 5,
        learningObjectives: ['Basic objective'],
        sections: [
          {
            id: 'section1',
            title: 'Simple Section',
            type: 'introduction',
            content: 'Simple content without interactive elements',
          }
        ],
        keyVocabulary: [],
      };

      vi.mocked(secureHttp.secureJsonFetch)
        .mockResolvedValueOnce(mockModules)
        .mockResolvedValueOnce([mockReadingData]);

      const result = await apiService.fetchModuleData('reading-minimal');

      expect(result.success).toBe(true);
      const readingData = result.data.data[0] as ReadingData;
      
      // Verify minimal structure works
      expect(readingData.sections).toHaveLength(1);
      expect(readingData.sections[0].interactive).toBeUndefined();
      expect(readingData.grammarPoints).toBeUndefined();
    });
  });

  describe('Reading Module Error Handling', () => {
    it('should handle missing reading module gracefully', async () => {
      const mockModules = [
        {
          id: 'other-module',
          name: 'Other Module',
          learningMode: 'flashcard',
          level: ['a1'],
          category: 'Vocabulary',
          unit: 1,
          prerequisites: [],
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch).mockResolvedValue(mockModules);

      const result = await apiService.fetchModuleData('reading-nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Module reading-nonexistent not found');
    });

    it('should handle corrupted reading data', async () => {
      const mockModules = [
        {
          id: 'reading-corrupted',
          name: 'Corrupted Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-corrupted.json',
        }
      ];

      vi.mocked(secureHttp.secureJsonFetch)
        .mockResolvedValueOnce(mockModules)
        .mockRejectedValueOnce(new Error('Invalid JSON'));

      const result = await apiService.fetchModuleData('reading-corrupted');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
  });

  describe('Reading Module Caching', () => {
    it('should cache reading module data', async () => {
      const mockModules = [
        {
          id: 'reading-cached',
          name: 'Cached Reading',
          learningMode: 'reading',
          level: ['a1'],
          category: 'Reading',
          unit: 1,
          prerequisites: [],
          dataPath: 'data/a1/a1-reading-cached.json',
        }
      ];

      const mockReadingData: ReadingData = {
        title: 'Cached Reading',
        estimatedReadingTime: 5,
        learningObjectives: ['Test caching'],
        sections: [
          {
            id: 'section1',
            title: 'Section 1',
            type: 'introduction',
            content: 'Content',
          }
        ],
        keyVocabulary: [],
      };

      vi.mocked(secureHttp.secureJsonFetch)
        .mockResolvedValueOnce(mockModules)
        .mockResolvedValueOnce([mockReadingData]);

      // First call
      const result1 = await apiService.fetchModuleData('reading-cached');
      expect(result1.success).toBe(true);

      // Second call should use cache
      const result2 = await apiService.fetchModuleData('reading-cached');
      expect(result2.success).toBe(true);
      expect(result2.data).toEqual(result1.data);

      // Should only fetch data once (modules + data)
      expect(secureHttp.secureJsonFetch).toHaveBeenCalledTimes(2);
    });
  });
});
