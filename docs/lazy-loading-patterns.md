# Lazy Loading Patterns - AI Context Preservation

## Overview

This document preserves the lazy loading patterns implemented in the CSS Architecture Refactor for AI context and future development. The lazy loading system ensures optimal performance by loading components and CSS chunks only when needed.

## React.lazy Component Implementation

### Current Implementation Pattern

All learning components use React.lazy with error handling:

```typescript
const FlashcardComponent = lazy(() =>
  import('../learning/FlashcardComponent')
    .then(module => ({
      default: module.default,
    }))
    .catch(() => ({
      default: () => <div className="error">Failed to load Flashcard component</div>,
    }))
);

const QuizComponent = lazy(() =>
  import('../learning/QuizComponent')
    .then(module => ({
      default: module.default,
    }))
    .catch(() => ({
      default: () => <div className="error">Failed to load Quiz component</div>,
    }))
);

const CompletionComponent = lazy(() =>
  import('../learning/CompletionComponent')
    .then(module => ({
      default: module.default,
    }))
    .catch(() => ({
      default: () => <div className="error">Failed to load Completion component</div>,
    }))
);

const SortingComponent = lazy(() =>
  import('../learning/SortingComponent')
    .then(module => ({
      default: module.default,
    }))
    .catch(() => ({
      default: () => <div className="error">Failed to load Sorting component</div>,
    }))
);

const MatchingComponent = lazy(() =>
  import('../learning/MatchingComponent')
    .then(module => ({
      default: module.default,
    }))
    .catch(() => ({
      default: () => <div className="error">Failed to load Matching component</div>,
    }))
);
```

### Suspense Wrapper

Components are wrapped in Suspense with proper error boundaries:

```typescript
<Suspense fallback={<ComponentLoader />}>
  <LearningComponentWrapper moduleId={moduleId}>
    {module => {
      switch (currentView) {
        case 'flashcard':
          return <FlashcardComponent module={module} />;
        case 'quiz':
          return <QuizComponent module={module} />;
        case 'completion':
          return <CompletionComponent module={module} />;
        case 'sorting':
          return <SortingComponent module={module} />;
        case 'matching':
          return <MatchingComponent module={module} />;
        default:
          return <div>Unknown view: {currentView}</div>;
      }
    }}
  </LearningComponentWrapper>
</Suspense>
```

## CSS Chunk Loading

### Component CSS Chunks

Components that import CSS files generate separate CSS chunks:

- **FlashcardComponent**: `FlashcardComponent-[hash].css` (1.18KB)
- **CompletionComponent**: `CompletionComponent-[hash].css` (2KB)
- **SortingComponent**: `SortingComponent-[hash].css` (19.76KB)
- **MatchingComponent**: `MatchingComponent-[hash].css` (10.94KB)
- **QuizComponent**: No CSS chunk (uses shared styles only)

### CSS Import Pattern

Components with dedicated styles use this pattern:

```typescript
// In component file (e.g., FlashcardComponent.tsx)
import '../../styles/components/flashcard-component.css';
```

### Main CSS Bundle

The main CSS bundle (`index-[hash].css`) contains:
- Design system tokens
- Theme contexts (web-light, web-dark, mobile-light, mobile-dark)
- Shared component styles
- Global utilities

Size: 307.64KB (62% of 500KB target)

## Theme Context Loading

### Static Theme Loading (Current)

All theme files are loaded statically in the main bundle:

```css
/* In src/styles/components.css */
@import './themes/web-light.css';     /* 11.38KB */
@import './themes/web-dark.css';      /* 7.01KB */
@import './themes/mobile-light.css';  /* 9.72KB */
@import './themes/mobile-dark.css';   /* 9.24KB */
```

### Theme Files Structure

Each theme file contains:
- Media queries for responsive behavior
- Dark mode rules (`.dark` selectors)
- CSS custom properties for design tokens
- Context-specific optimizations

## Vite Configuration for Lazy Loading

### CSS Code Splitting

```typescript
// config/vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'components': [
          'src/components/learning/FlashcardComponent.tsx',
          'src/components/learning/QuizComponent.tsx',
          'src/components/learning/CompletionComponent.tsx',
          'src/components/learning/MatchingComponent.tsx',
          'src/components/learning/SortingComponent.tsx'
        ]
      },
      assetFileNames: (assetInfo) => {
        if (assetInfo.name?.endsWith('.css')) {
          if (assetInfo.name.includes('index')) {
            return 'assets/main-[hash].css';
          }
          if (assetInfo.name.includes('Component')) {
            return 'assets/components-[hash].css';
          }
          return 'assets/[name]-[hash].css';
        }
        return 'assets/[name]-[hash][extname]';
      }
    }
  },
  cssCodeSplit: true,
  cssMinify: 'esbuild'
}
```

## Performance Metrics

### Bundle Size Compliance

All CSS chunks remain under 500KB target:
- ✅ Main bundle: 307.64KB (62% of target)
- ✅ Component chunks: 1.18KB - 19.76KB each
- ✅ Total CSS: 343.1KB

### Loading Performance

- Components load on-demand when view changes
- CSS chunks load with their respective components
- Error boundaries prevent cascade failures
- Loading skeletons provide smooth UX

## Critical Preservation Points

### For AI Development

1. **Component Lazy Loading**: Must maintain React.lazy() patterns
2. **CSS Chunk Independence**: Each component CSS must remain separate
3. **Error Handling**: Preserve error boundaries and fallbacks
4. **Suspense Usage**: Maintain proper loading states
5. **Bundle Size Targets**: Keep all chunks under 500KB

### Verification Checklist

- [x] All learning components still use React.lazy()
- [x] CSS chunks are generated for each component (where applicable)
- [x] Error handling remains functional
- [x] Suspense boundaries work correctly
- [x] Bundle sizes comply with targets

## Testing Patterns

### Dynamic Import Testing

```javascript
// Test lazy loading functionality
describe('Lazy Loading Preservation', () => {
  it('should load components dynamically', async () => {
    const { FlashcardComponent } = await import('../components/learning/FlashcardComponent');
    expect(FlashcardComponent).toBeDefined();
  });

  it('should load CSS with component', async () => {
    // Verify CSS chunk is loaded when component is imported
    const initialStylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
    await import('../components/learning/FlashcardComponent');
    const finalStylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
    expect(finalStylesheets).toBeGreaterThan(initialStylesheets);
  });
});
```

### Store Dynamic Imports

```javascript
// Dynamic store imports for testing
import('./src/stores/toastStore.js').then(({ toast }) => {
  toast.success('Test message');
});
```

### Hook Dynamic Imports

```typescript
// Dynamic hook imports in tests
const { useModuleData } = await import('../../../src/hooks/useModuleData');
```

### Utility Dynamic Imports

```javascript
// Dynamic utility imports
const { execSync } = await import('child_process');
const fs = await import('fs/promises');
const path = await import('path');
```

## Future Enhancements

### Dynamic Theme Loading (Planned)

Future implementation could load themes dynamically based on context:

```typescript
// Planned: Dynamic theme loading
const loadTheme = async (context: 'web-light' | 'web-dark' | 'mobile-light' | 'mobile-dark') => {
  const theme = await import(`../styles/themes/${context}.css`);
  return theme;
};
```

### Progressive CSS Loading

Potential optimization for very large applications:

```typescript
// Planned: Progressive CSS loading
const loadComponentStyles = async (componentName: string) => {
  if (document.querySelector(`link[href*="${componentName}"]`)) {
    return; // Already loaded
  }
  
  const styles = await import(`../styles/components/${componentName}.css`);
  return styles;
};
```

## Monitoring and Validation

### Automated Verification

Use `scripts/validation/verify-lazy-loading.js` to validate:
- React.lazy component definitions
- CSS chunk generation
- Theme file availability
- Suspense usage
- Error boundary implementation

### Performance Monitoring

Use `scripts/analysis/css-bundle-analyzer.js` to monitor:
- Bundle size compliance
- Chunk distribution
- Optimization opportunities
- Tree-shaking effectiveness

## AI Development Guidelines

### When Adding New Components

1. Use React.lazy pattern for learning components
2. Import CSS files if component needs dedicated styles
3. Add error boundaries and fallbacks
4. Test lazy loading behavior
5. Verify bundle size impact

### When Modifying Existing Components

1. Preserve existing lazy loading patterns
2. Maintain CSS import structure
3. Test that chunks still generate correctly
4. Verify error handling still works
5. Check bundle size compliance

### When Refactoring CSS

1. Maintain component CSS separation
2. Preserve theme context loading
3. Keep chunks under 500KB target
4. Test lazy loading still works
5. Verify no regression in loading performance

This documentation ensures that the lazy loading patterns are preserved and can be understood by AI systems for future development and maintenance.