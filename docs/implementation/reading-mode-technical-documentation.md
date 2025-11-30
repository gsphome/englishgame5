# Reading Mode - Technical Documentation

## Overview

The Reading Mode is the sixth universal learning mode in FluentFlow, designed to provide structured, theory-based content that complements interactive exercises. This documentation covers the component API, data structures, CSS architecture, and extension patterns.

**Version:** 1.0.0  
**Last Updated:** November 30, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Component API](#component-api)
2. [Data Structure](#data-structure)
3. [CSS Architecture](#css-architecture)
4. [Integration Points](#integration-points)
5. [Extending Reading Mode](#extending-reading-mode)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)

---

## Component API

### ReadingComponent

The main component for rendering reading mode content.

#### Props

```typescript
interface ReadingComponentProps {
  module: LearningModule;
}
```

**Parameters:**
- `module` (LearningModule): The learning module containing reading data
  - Must have `learningMode: 'reading'`
  - Data should be an array with a single ReadingData object
  - Follows the standard LearningModule interface

#### Component Structure

```typescript
const ReadingComponent: React.FC<ReadingComponentProps> = ({ module }) => {
  // State management
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [startTime] = useState(Date.now());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Hooks (following FlashcardComponent pattern)
  const { updateUserScore } = useUserStore();
  const { language } = useSettingsStore();
  const { returnToMenu } = useMenuNavigation();
  const { addProgressEntry } = useProgressStore();
  const { t } = useTranslation(language);
  useLearningCleanup();

  // ... component logic
};
```

#### Key Features

1. **Section Navigation**: Navigate through reading sections with Previous/Next controls
2. **Interactive Elements**: Tooltips, expandable content, and highlights
3. **Progress Tracking**: Automatic progress registration on completion
4. **Keyboard Navigation**: Arrow keys, Enter, and Escape support
5. **Responsive Design**: Optimized for mobile, tablet, and desktop
6. **Theme Support**: Full light/dark mode compatibility
7. **Internationalization**: All text via i18n keys

#### State Management

| State | Type | Purpose |
|-------|------|---------|
| `currentSectionIndex` | number | Tracks current section being viewed |
| `startTime` | number | Records session start for time tracking |
| `expandedItems` | Set<number> | Tracks which expandable items are open |
| `activeTooltip` | string \| null | Tracks which tooltip is currently displayed |

#### Navigation Methods

```typescript
// Navigate to next section or complete reading
const handleNext = useCallback(() => {
  if (currentSectionIndex < readingSections.length - 1) {
    setCurrentSectionIndex(currentSectionIndex + 1);
    // Reset interactive states
    setExpandedItems(new Set());
    setActiveTooltip(null);
  } else {
    // Complete reading and register progress
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    addProgressEntry({
      score: 100,
      totalQuestions: readingSections.length,
      correctAnswers: readingSections.length,
      moduleId: module.id,
      learningMode: 'reading',
      timeSpent: timeSpent,
    });
    updateUserScore(module.id, 100, timeSpent);
    returnToMenu();
  }
}, [currentSectionIndex, readingSections.length, startTime, ...]);

// Navigate to previous section
const handlePrev = useCallback(() => {
  if (currentSectionIndex > 0) {
    setCurrentSectionIndex(currentSectionIndex - 1);
    setExpandedItems(new Set());
    setActiveTooltip(null);
  }
}, [currentSectionIndex]);
```

#### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ArrowRight` | Next section |
| `ArrowLeft` | Previous section |
| `Enter` | Next section |
| `Escape` | Return to menu |

---

## Data Structure

### ReadingData Interface

The main data structure for reading modules.

```typescript
interface ReadingData extends BaseLearningData {
  title: string;                      // Module title
  sections: ReadingSection[];         // Content sections
  learningObjectives: string[];       // Learning goals
  keyVocabulary: KeyTerm[];          // Important terms
  grammarPoints?: GrammarPoint[];    // Optional grammar rules
  estimatedReadingTime: number;      // Minutes to complete
}
```

### ReadingSection Interface

Individual content sections within a reading module.

```typescript
interface ReadingSection {
  id: string;                        // Unique section identifier
  title: string;                     // Section heading
  content: string;                   // Main text content
  type: 'introduction' | 'theory' | 'examples' | 'summary';
  interactive?: ReadingInteractive;  // Optional interactive elements
}
```

**Section Types:**
- `introduction`: Opening section, sets context
- `theory`: Explanatory content, concepts
- `examples`: Practical examples and use cases
- `summary`: Recap and key takeaways

### ReadingInteractive Interface

Optional interactive elements for sections.

```typescript
interface ReadingInteractive {
  highlights?: string[];             // Terms to highlight
  tooltips?: ReadingTooltip[];      // Clickable term definitions
  expandable?: ReadingExpandable[]; // Collapsible content blocks
}
```

### ReadingTooltip Interface

```typescript
interface ReadingTooltip {
  term: string;        // The term to display
  definition: string;  // Definition shown on click
}
```

### ReadingExpandable Interface

```typescript
interface ReadingExpandable {
  title: string;    // Expandable section title
  content: string;  // Content revealed when expanded
}
```

### KeyTerm Interface

Vocabulary terms with definitions and examples.

```typescript
interface KeyTerm {
  term: string;           // The vocabulary word
  definition: string;     // Clear definition
  example: string;        // Usage example
  pronunciation?: string; // Optional IPA notation
}
```

### GrammarPoint Interface

Grammar rules and explanations.

```typescript
interface GrammarPoint {
  rule: string;              // Grammar rule name
  explanation: string;       // Detailed explanation
  examples: string[];        // Usage examples
  commonMistakes?: string[]; // Optional common errors
}
```

### JSON File Structure

Reading modules are stored as JSON files in `public/data/{level}/`:

```json
{
  "title": "Introduction to Business English",
  "estimatedReadingTime": 8,
  "learningObjectives": [
    "Understand basic business vocabulary and greetings",
    "Learn the difference between formal and informal communication"
  ],
  "sections": [
    {
      "id": "intro",
      "title": "Welcome to Business English",
      "type": "introduction",
      "content": "Business English is the language used in professional settings..."
    },
    {
      "id": "greetings",
      "title": "Professional Greetings",
      "type": "theory",
      "content": "In business, we use formal greetings...",
      "interactive": {
        "tooltips": [
          {
            "term": "formal",
            "definition": "Following official rules and customs"
          }
        ],
        "expandable": [
          {
            "title": "More Examples",
            "content": "Additional greeting examples..."
          }
        ]
      }
    }
  ],
  "keyVocabulary": [
    {
      "term": "meeting",
      "definition": "A gathering of people to discuss work topics",
      "example": "We have a team meeting at 3 PM today.",
      "pronunciation": "/ˈmiːtɪŋ/"
    }
  ],
  "grammarPoints": [
    {
      "rule": "Formal vs Informal Greetings",
      "explanation": "In business, always use formal greetings...",
      "examples": [
        "Formal: Good morning, Mr. Smith.",
        "Informal: Hey John!"
      ],
      "commonMistakes": [
        "Using 'Hey' in professional emails"
      ]
    }
  ]
}
```

### File Naming Convention

```
public/data/{level}/{level}-reading-{theme}.json
```

**Examples:**
- `public/data/a1/a1-reading-business.json`
- `public/data/b2/b2-reading-professional.json`
- `public/data/c1/c1-reading-academic.json`

---

## CSS Architecture

### BEM Naming Convention

Reading mode follows **pure BEM** (Block Element Modifier) architecture with local, AI-maintainable styles.

#### Block

```css
.reading-component__container { }
```

#### Elements

```css
.reading-component__content { }
.reading-component__section-title { }
.reading-component__vocabulary-card { }
.reading-component__grammar-point { }
```

#### Modifiers

```css
.reading-component__tooltip-trigger--active { }
.reading-component__expandable-trigger--expanded { }
```

### CSS File Structure

**Location:** `src/styles/components/reading-component.css`

**Import in component:**
```typescript
import '../../styles/components/reading-component.css';
```

### Key CSS Classes

| Class | Purpose |
|-------|---------|
| `.reading-component__container` | Main wrapper, sets layout and theme variables |
| `.reading-component__content` | Content area with responsive padding |
| `.reading-component__section-title` | Section heading styles |
| `.reading-component__section-content` | Main text content with optimal line height |
| `.reading-component__objectives` | Learning objectives list |
| `.reading-component__vocabulary-grid` | Responsive grid for vocabulary cards |
| `.reading-component__vocabulary-card` | Individual vocabulary term card |
| `.reading-component__grammar-point` | Grammar rule container |
| `.reading-component__tooltip-trigger` | Clickable tooltip button |
| `.reading-component__expandable` | Collapsible content section |

### CSS Variables (Local Scope)

```css
.reading-component__container {
  /* Spacing */
  --reading-spacing-xs: 0.25rem;
  --reading-spacing-sm: 0.5rem;
  --reading-spacing-md: 1rem;
  --reading-spacing-lg: 1.5rem;
  --reading-spacing-xl: 2rem;
  
  /* Typography */
  --reading-font-size-sm: 0.875rem;
  --reading-font-size-base: 1rem;
  --reading-font-size-lg: 1.125rem;
  --reading-font-size-xl: 1.25rem;
  --reading-font-size-title: 1.75rem;
  
  /* Line Heights */
  --reading-line-height-tight: 1.3;
  --reading-line-height-normal: 1.6;
  --reading-line-height-relaxed: 1.7;
  
  /* Layout */
  --reading-max-width: 100%;
  --reading-touch-target: 44px;
  --reading-border-radius: 0.5rem;
  
  /* Theme Colors (inherit from global) */
  --reading-bg-primary: var(--theme-bg-primary);
  --reading-text-primary: var(--theme-text-primary);
  --reading-accent-primary: var(--theme-accent-primary);
}
```

### Responsive Breakpoints

| Breakpoint | Width | Grid Columns | Font Size Base |
|------------|-------|--------------|----------------|
| Mobile | < 768px | 1 column | 1rem |
| Tablet | 768px - 1024px | 2 columns | 1.0625rem |
| Desktop | > 1024px | 3 columns | 1.125rem |
| Ultra-wide | > 1440px | 3 columns | 1.125rem |

### Anti-Hierarchy Principles

1. **Maximum 2 levels of nesting** - Avoid deep CSS hierarchies
2. **Prefer duplication over complexity** - Repeat styles for clarity
3. **Local variables** - Component-scoped, not global dependencies
4. **Self-contained breakpoints** - Each breakpoint is independent
5. **No cascading inheritance** - Explicit styles at each level

---

## Integration Points

### Type System

Reading mode extends the existing type system in `src/types/index.ts`:

```typescript
// LearningMode union type
export type LearningMode = 'flashcard' | 'quiz' | 'completion' | 
                           'sorting' | 'matching' | 'reading';

// Reading-specific interfaces
export interface ReadingData extends BaseLearningData { ... }
export interface ReadingSection { ... }
export interface KeyTerm { ... }
export interface GrammarPoint { ... }
```

### Module Configuration

Reading modules are registered in `public/data/learningModules.json`:

```json
{
  "id": "reading-business-a1",
  "name": "Business Reading",
  "learningMode": "reading",
  "dataPath": "data/a1/a1-reading-business.json",
  "level": ["a1"],
  "category": "Reading",
  "unit": 1,
  "prerequisites": [],
  "description": "Introduction to business English concepts",
  "estimatedTime": 8,
  "difficulty": 1
}
```

### Router Integration

Reading mode is lazy-loaded in `src/App.tsx`:

```typescript
const ReadingComponent = lazy(() => 
  import('./components/learning/ReadingComponent')
);

// In AppRouter
case 'reading':
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReadingComponent module={currentModule} />
    </Suspense>
  );
```

### Progress System

Reading completion is tracked via `useProgressStore`:

```typescript
addProgressEntry({
  score: 100,                          // Reading is completion-based
  totalQuestions: readingSections.length,
  correctAnswers: readingSections.length,
  moduleId: module.id,
  learningMode: 'reading',
  timeSpent: timeSpent,
});
```

### Internationalization

All user-facing text uses i18n keys:

```typescript
const { t } = useTranslation(language);

// Usage
<h3>{t('reading.component.objectives')}</h3>
<button>{t('reading.component.nextSection')}</button>
```

**Key i18n namespaces:**
- `reading.component.*` - Component UI text
- `reading.navigation.*` - Navigation labels
- `reading.accessibility.*` - Screen reader text

---

## Extending Reading Mode

### Adding New Section Types

1. **Update the type definition** in `src/types/index.ts`:

```typescript
export interface ReadingSection {
  id: string;
  title: string;
  content: string;
  type: 'introduction' | 'theory' | 'examples' | 'summary' | 'practice'; // Add new type
  interactive?: ReadingInteractive;
}
```

2. **Add rendering logic** in `ReadingComponent.tsx`:

```typescript
{currentSection?.type === 'practice' && (
  <div className="reading-component__practice">
    {/* Practice section rendering */}
  </div>
)}
```

3. **Add CSS styles** in `reading-component.css`:

```css
.reading-component__practice {
  background: var(--reading-bg-secondary);
  padding: var(--reading-spacing-md);
  border-radius: var(--reading-border-radius);
}
```

### Adding New Interactive Elements

1. **Extend ReadingInteractive interface**:

```typescript
export interface ReadingInteractive {
  highlights?: string[];
  tooltips?: ReadingTooltip[];
  expandable?: ReadingExpandable[];
  quiz?: QuizQuestion[];  // New interactive element
}
```

2. **Add state management**:

```typescript
const [quizAnswers, setQuizAnswers] = useState<Map<string, string>>(new Map());
```

3. **Implement rendering**:

```typescript
{currentSection?.interactive?.quiz && (
  <div className="reading-component__quiz">
    {/* Quiz rendering logic */}
  </div>
)}
```

### Creating New Reading Modules

1. **Create JSON file** in appropriate level folder:

```bash
public/data/b1/b1-reading-environment.json
```

2. **Follow data structure**:

```json
{
  "title": "Environmental Awareness",
  "estimatedReadingTime": 10,
  "learningObjectives": [...],
  "sections": [...],
  "keyVocabulary": [...],
  "grammarPoints": [...]
}
```

3. **Register in learningModules.json**:

```json
{
  "id": "reading-environment-b1",
  "name": "Environmental Reading",
  "learningMode": "reading",
  "dataPath": "data/b1/b1-reading-environment.json",
  "level": ["b1"],
  "category": "Reading",
  "unit": 2,
  "prerequisites": ["reading-business-a2"],
  "estimatedTime": 10,
  "difficulty": 3
}
```

4. **Add i18n translations** if needed for custom content.

### Adding Multimedia Support

To add audio or images to reading content:

1. **Extend ReadingSection interface**:

```typescript
export interface ReadingSection {
  // ... existing fields
  multimedia?: {
    audio?: string;    // Audio file URL
    images?: string[]; // Image URLs
  };
}
```

2. **Add rendering in component**:

```typescript
{currentSection?.multimedia?.audio && (
  <audio 
    controls 
    src={currentSection.multimedia.audio}
    className="reading-component__audio"
  />
)}
```

3. **Add CSS styles**:

```css
.reading-component__audio {
  width: 100%;
  margin: var(--reading-spacing-md) 0;
}
```

---

## Code Examples

### Example 1: Basic Reading Module

```json
{
  "title": "Daily Routines",
  "estimatedReadingTime": 5,
  "learningObjectives": [
    "Learn vocabulary for daily activities",
    "Understand time expressions"
  ],
  "sections": [
    {
      "id": "intro",
      "title": "Your Daily Routine",
      "type": "introduction",
      "content": "Everyone has a daily routine - things we do every day..."
    }
  ],
  "keyVocabulary": [
    {
      "term": "wake up",
      "definition": "To stop sleeping and become conscious",
      "example": "I wake up at 7 AM every morning.",
      "pronunciation": "/weɪk ʌp/"
    }
  ]
}
```

### Example 2: Interactive Section with Tooltips

```json
{
  "id": "business-terms",
  "title": "Business Terminology",
  "type": "theory",
  "content": "Understanding business terms is essential...",
  "interactive": {
    "tooltips": [
      {
        "term": "stakeholder",
        "definition": "A person with an interest in a business"
      },
      {
        "term": "revenue",
        "definition": "Income generated from business activities"
      }
    ]
  }
}
```

### Example 3: Section with Expandable Content

```json
{
  "id": "advanced-concepts",
  "title": "Advanced Grammar",
  "type": "theory",
  "content": "Let's explore advanced grammar concepts...",
  "interactive": {
    "expandable": [
      {
        "title": "Subjunctive Mood",
        "content": "The subjunctive mood is used to express wishes, suggestions..."
      },
      {
        "title": "Conditional Perfect",
        "content": "This tense describes hypothetical past situations..."
      }
    ]
  }
}
```

### Example 4: Custom Hook for Reading Analytics

```typescript
// hooks/useReadingAnalytics.ts
import { useState, useEffect } from 'react';

export const useReadingAnalytics = (sectionId: string) => {
  const [timeOnSection, setTimeOnSection] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnSection(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const logSectionComplete = () => {
    console.log(`Section ${sectionId} completed in ${timeOnSection}s`);
    // Send to analytics service
  };

  return { timeOnSection, logSectionComplete };
};

// Usage in ReadingComponent
const { timeOnSection, logSectionComplete } = useReadingAnalytics(currentSection.id);
```

### Example 5: Custom Content Renderer

```typescript
// utils/readingContentRenderer.ts
export const renderReadingContent = (content: string): string => {
  // Add custom formatting
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
    .replace(/\n\n/g, '</p><p>')                       // Paragraphs
    .replace(/^(.+)$/gm, '<p>$1</p>');                 // Wrap in p tags
};

// Usage
<div 
  dangerouslySetInnerHTML={{ 
    __html: renderReadingContent(currentSection.content) 
  }} 
/>
```

---

## Best Practices

### Data Structure

1. **Keep sections focused** - Each section should cover one concept
2. **Optimal section count** - 4-6 sections per module for best engagement
3. **Estimated time accuracy** - Test reading time with real users
4. **Progressive difficulty** - Start simple, build complexity
5. **Include examples** - Always provide practical usage examples

### Content Writing

1. **Clear objectives** - State what learners will achieve
2. **Active voice** - Use direct, engaging language
3. **Consistent terminology** - Use the same terms throughout
4. **Cultural sensitivity** - Avoid region-specific idioms
5. **Accessibility** - Write for screen readers and translations

### Component Development

1. **Follow existing patterns** - Match FlashcardComponent structure
2. **Use existing hooks** - Leverage useMenuNavigation, useProgressStore
3. **Maintain i18n** - Never hardcode user-facing text
4. **Test responsiveness** - Verify on mobile, tablet, desktop
5. **Keyboard accessibility** - Support full keyboard navigation

### CSS Development

1. **Pure BEM naming** - No hybrid classes or Tailwind utilities
2. **Local variables** - Component-scoped CSS custom properties
3. **Avoid deep nesting** - Maximum 2 levels
4. **Mobile-first** - Start with mobile styles, enhance for desktop
5. **Theme support** - Test both light and dark modes

### Performance

1. **Lazy loading** - Component is lazy-loaded via React.lazy()
2. **Optimize images** - Compress images if adding multimedia
3. **Minimize bundle** - Keep CSS under 50KB
4. **Efficient state** - Use useCallback and useMemo appropriately
5. **Monitor metrics** - Track load times and user engagement

### Testing

1. **Unit tests** - Test navigation, state management, interactions
2. **Integration tests** - Verify data loading and progress tracking
3. **Accessibility tests** - Screen reader and keyboard navigation
4. **Responsive tests** - All breakpoints and orientations
5. **Theme tests** - Light and dark mode rendering

### Internationalization

1. **Complete translations** - All text in both English and Spanish
2. **Consistent keys** - Follow `reading.component.*` pattern
3. **Fallback handling** - Graceful degradation for missing keys
4. **Context awareness** - Use interpolation for dynamic content
5. **RTL support** - Consider right-to-left languages for future

---

## Troubleshooting

### Common Issues

**Issue:** Reading data not loading  
**Solution:** Verify `dataPath` in learningModules.json matches actual file location

**Issue:** Sections not navigating  
**Solution:** Check that `sections` array exists and has valid data

**Issue:** Tooltips not appearing  
**Solution:** Ensure `interactive.tooltips` is properly structured in JSON

**Issue:** CSS not applying  
**Solution:** Verify CSS import in component: `import '../../styles/components/reading-component.css'`

**Issue:** Progress not tracking  
**Solution:** Confirm `addProgressEntry` is called with correct parameters

### Debug Mode

Enable debug logging:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Current section:', currentSection);
  console.log('Reading data:', readingData);
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Nov 30, 2025 | Initial release with full reading mode implementation |

---

## Additional Resources

- **Design Document:** `.kiro/specs/reading-mode/design.md`
- **Requirements:** `.kiro/specs/reading-mode/requirements.md`
- **Implementation Tasks:** `.kiro/specs/reading-mode/tasks.md`
- **Component Source:** `src/components/learning/ReadingComponent.tsx`
- **Type Definitions:** `src/types/index.ts`
- **CSS Styles:** `src/styles/components/reading-component.css`

---

## Support

For questions or issues:
1. Review this documentation
2. Check existing reading modules for examples
3. Refer to design and requirements documents
4. Follow established patterns from other learning modes

---

**Document Maintained By:** FluentFlow Development Team  
**Last Review:** November 30, 2025
