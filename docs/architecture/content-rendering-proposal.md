# Content Rendering System - Architectural Proposal

## Overview
Replace the current HTML-in-JSON + sanitization approach with a structured content system that separates data, formatting rules, and presentation.

## Core Principles

1. **Data Purity**: JSON contains only semantic data, no presentation logic
2. **Declarative Formatting**: Rules-based content transformation
3. **Type Safety**: Full TypeScript support for content structures
4. **Security by Design**: No HTML injection vectors
5. **Extensibility**: Easy to add new content types and formats

## Architecture Components

### 1. Content Types System
```typescript
// Enhanced type system for structured content
export interface ContentSegment {
  type: 'text' | 'emphasis' | 'code' | 'term' | 'variable';
  content: string;
  metadata?: Record<string, any>;
}

export interface StructuredContent {
  segments: ContentSegment[];
  format?: 'plain' | 'quiz' | 'explanation';
}

// Enhanced QuizData with structured content
export interface QuizDataV2 extends BaseLearningData {
  question: StructuredContent;
  options: string[];
  correct: number | string;
  explanation?: StructuredContent;
}
```

### 2. Content Parser
```typescript
// Converts string patterns to structured content
export class ContentParser {
  static parseQuizContent(text: string): StructuredContent {
    // Parse 'quoted' text as terms
    // Parse **bold** as emphasis
    // Parse `code` as code segments
    // etc.
  }
}
```

### 3. Content Renderer
```typescript
// Renders structured content as React components
export const ContentRenderer: React.FC<{
  content: StructuredContent;
  theme?: 'quiz' | 'flashcard' | 'explanation';
}> = ({ content, theme }) => {
  return (
    <>
      {content.segments.map((segment, index) => (
        <ContentSegment 
          key={index} 
          segment={segment} 
          theme={theme} 
        />
      ))}
    </>
  );
};
```

### 4. Migration Strategy
- Phase 1: Implement new system alongside current
- Phase 2: Create migration tools for existing JSON
- Phase 3: Gradual replacement of components
- Phase 4: Remove legacy HTML sanitization

## Benefits

1. **Security**: No HTML injection possible
2. **Performance**: No runtime HTML parsing/sanitization
3. **Maintainability**: Clear separation of concerns
4. **Extensibility**: Easy to add new content types
5. **Testing**: Each layer can be tested independently
6. **Accessibility**: Semantic content structure
7. **Internationalization**: Format rules can be localized

## Implementation Priority

1. **High**: Quiz questions (most critical user-facing)
2. **Medium**: Flashcard content, explanations
3. **Low**: Complex formatting in other modes