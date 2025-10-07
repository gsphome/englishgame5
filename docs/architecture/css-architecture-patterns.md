# CSS Architecture Patterns - Pure BEM with Design Tokens

## Overview

This document outlines the new CSS architecture patterns implemented as part of the CSS architecture refactor. The system uses pure BEM methodology with design tokens for a maintainable, scalable, and theme-aware CSS architecture.

## BEM Methodology Patterns

### Block Naming Convention
```css
/* Block: Independent component */
.component-name {
  /* Base component styles */
}

.matching-component {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0.75rem;
}
```

### Element Naming Convention
```css
/* Element: Part of a block */
.block__element {
  /* Element styles */
}

.matching-component__header {
  margin-bottom: 1.5rem;
}

.matching-component__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--theme-text-primary);
}
```

### Modifier Naming Convention
```css
/* Modifier: Variation of block or element */
.block--modifier {
  /* Block modifier styles */
}

.block__element--modifier {
  /* Element modifier styles */
}

.matching-component__item--selected {
  background-color: var(--theme-bg-selected);
  border-color: var(--primary-blue);
}

.matching-component__button--primary {
  background-color: var(--primary-blue);
  color: var(--text-on-colored);
}
```

## Design Token System

### Token Categories

#### 1. Semantic Tokens (Base Layer)
```css
:root {
  /* Text tokens */
  --text-primary: #374151;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-on-colored: #ffffff;
  
  /* Background tokens */
  --bg-elevated: #ffffff;
  --bg-subtle: #fafafa;
  --bg-soft: #f9fafb;
  
  /* Border tokens */
  --border-subtle: #f9fafb;
  --border-soft: #f3f4f6;
  --border-medium: #e5e7eb;
  
  /* Interactive tokens */
  --primary-blue: #3b82f6;
  --primary-purple: #8b5cf6;
  --progress-complete: #22c55e;
  --error: #ef4444;
}
```

#### 2. Theme Context Variables (Mapping Layer)
```css
/* Light theme mapping */
html.light {
  --theme-text-primary: var(--text-primary);
  --theme-text-secondary: var(--text-secondary);
  --theme-bg-primary: var(--bg-elevated);
  --theme-bg-secondary: var(--bg-subtle);
  --theme-border-primary: var(--border-soft);
}

/* Dark theme mapping */
html.dark {
  --theme-text-primary: #f9fafb;
  --theme-text-secondary: #d1d5db;
  --theme-bg-primary: #1f2937;
  --theme-bg-secondary: #374151;
  --theme-border-primary: #374151;
}
```

### Token Usage Patterns

#### Component Implementation
```css
.component {
  /* Use theme context variables for theme-aware properties */
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-primary);
  border: 1px solid var(--theme-border-primary);
  
  /* Use semantic tokens for theme-independent properties */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 0.375rem;
}

.component__button {
  /* Use interactive tokens for consistent branding */
  background-color: var(--primary-blue);
  color: var(--text-on-colored);
}

.component__button:hover {
  background-color: var(--primary-purple);
}
```

#### Fallback Chain Pattern
```css
.component {
  /* Fallback chain: theme context → semantic token → hardcoded fallback */
  color: var(--theme-text-primary, var(--text-primary, #374151));
  background-color: var(--theme-bg-primary, var(--bg-elevated, #ffffff));
}
```

## Theme Context System

### 4 Theme Contexts

1. **Web Light** (`html.light` + `@media (min-width: 769px)`)
2. **Web Dark** (`html.dark` + `@media (min-width: 769px)`)
3. **Mobile Light** (`html.light` + `@media (max-width: 768px)`)
4. **Mobile Dark** (`html.dark` + `@media (max-width: 768px)`)

### Context-Specific Optimizations

#### Web Context (Desktop/Tablet)
```css
@media (min-width: 769px) {
  .component {
    /* Desktop-specific optimizations */
    padding: 1.5rem;
    font-size: 1rem;
  }
  
  .component__button:hover {
    /* Hover states for pointer devices */
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
```

#### Mobile Context (Touch Devices)
```css
@media (max-width: 768px) {
  .component {
    /* Mobile-specific optimizations */
    padding: 0.75rem;
    font-size: 0.875rem;
  }
  
  .component__button {
    /* Touch target optimization (44px minimum) */
    min-height: 44px;
    min-width: 44px;
    padding: 0.75rem 1rem;
  }
}
```

## Component Development Guidelines

### File Structure Pattern
```
src/styles/components/
├── component-name.css          # Component-specific styles
└── component-name/
    ├── base.css               # Base component styles
    ├── elements.css           # Element styles
    └── modifiers.css          # Modifier styles
```

### Component CSS Template
```css
/**
 * Component Name - BEM Implementation
 * 
 * Description of component purpose and usage
 * Uses design system tokens for theme consistency
 */

/* === COMPONENT BLOCK === */
.component-name {
  /* Base component styles using design tokens */
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-primary);
  border: 1px solid var(--theme-border-primary);
  
  /* Layout and positioning */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  /* Responsive base */
  padding: 0.75rem;
}

@media (min-width: 640px) {
  .component-name {
    padding: 1.5rem;
  }
}

/* === COMPONENT ELEMENTS === */
.component-name__header {
  margin-bottom: 1rem;
}

.component-name__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--theme-text-primary);
}

.component-name__content {
  flex: 1;
}

.component-name__footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--theme-border-primary);
}

/* === COMPONENT MODIFIERS === */
.component-name--compact {
  padding: 0.5rem;
}

.component-name--elevated {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* === ELEMENT MODIFIERS === */
.component-name__button--primary {
  background-color: var(--primary-blue);
  color: var(--text-on-colored);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.component-name__button--primary:hover {
  background-color: var(--primary-purple);
}

.component-name__button--secondary {
  background-color: transparent;
  color: var(--theme-text-secondary);
  border: 1px solid var(--theme-border-primary);
}

/* === STATE CLASSES === */
.component-name__item--selected {
  background-color: var(--primary-blue);
  color: var(--text-on-colored);
}

.component-name__item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### TSX Component Integration
```tsx
import React from 'react';
import '../../styles/components/component-name.css';

interface ComponentProps {
  variant?: 'default' | 'compact' | 'elevated';
  children: React.ReactNode;
}

export const Component: React.FC<ComponentProps> = ({ 
  variant = 'default', 
  children 
}) => {
  const baseClass = 'component-name';
  const className = variant !== 'default' 
    ? `${baseClass} ${baseClass}--${variant}`
    : baseClass;

  return (
    <div className={className}>
      <header className="component-name__header">
        <h2 className="component-name__title">Component Title</h2>
      </header>
      
      <main className="component-name__content">
        {children}
      </main>
      
      <footer className="component-name__footer">
        <button className="component-name__button component-name__button--primary">
          Primary Action
        </button>
        <button className="component-name__button component-name__button--secondary">
          Secondary Action
        </button>
      </footer>
    </div>
  );
};
```

## Performance Optimization Patterns

### CSS Custom Property Optimization
```css
/* Efficient token usage */
.component {
  /* Group related properties */
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-primary);
  border-color: var(--theme-border-primary);
  
  /* Avoid excessive custom property lookups in animations */
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

/* Pre-calculate complex values */
:root {
  --component-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --component-border-radius: 0.375rem;
}
```

### Responsive Design Patterns
```css
/* Mobile-first approach */
.component {
  /* Base mobile styles */
  padding: 0.75rem;
  font-size: 0.875rem;
}

/* Progressive enhancement for larger screens */
@media (min-width: 640px) {
  .component {
    padding: 1rem;
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .component {
    padding: 1.5rem;
    font-size: 1.125rem;
  }
}
```

## Testing Patterns

### BEM Class Testing
```typescript
// Test BEM structure
expect(container.querySelector('.component-name')).toBeInTheDocument();
expect(container.querySelector('.component-name__header')).toBeInTheDocument();
expect(container.querySelector('.component-name__title')).toBeInTheDocument();

// Test modifiers
expect(container.querySelector('.component-name--compact')).toBeInTheDocument();
expect(container.querySelector('.component-name__button--primary')).toBeInTheDocument();
```

### Design Token Testing
```typescript
// Test design token availability
const computedStyle = getComputedStyle(document.documentElement);
expect(computedStyle.getPropertyValue('--theme-text-primary')).toBeTruthy();
expect(computedStyle.getPropertyValue('--primary-blue')).toBe('#3b82f6');
```

### Theme Context Testing
```typescript
// Test theme switching
document.documentElement.classList.add('dark');
const { container } = render(<Component />);
expect(container.querySelector('.component-name')).toBeInTheDocument();

document.documentElement.classList.remove('dark');
```

## Migration Patterns

### From Tailwind to BEM
```tsx
// BEFORE: Tailwind classes
<div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
  <h2 className="text-lg font-bold text-gray-900 mb-2">Title</h2>
  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
    Action
  </button>
</div>

// AFTER: Pure BEM with design tokens
<div className="component-name">
  <h2 className="component-name__title">Title</h2>
  <button className="component-name__button component-name__button--primary">
    Action
  </button>
</div>
```

### From @apply to Pure CSS
```css
/* BEFORE: @apply directives */
.component {
  @apply bg-white p-4 rounded-lg shadow-lg border border-gray-200;
}

.component__title {
  @apply text-lg font-bold text-gray-900 mb-2;
}

/* AFTER: Pure CSS with design tokens */
.component {
  background-color: var(--theme-bg-primary);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--theme-border-primary);
}

.component__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--theme-text-primary);
  margin-bottom: 0.5rem;
}
```

## Best Practices

### Do's ✅
- Use theme context variables for theme-aware properties
- Follow strict BEM naming conventions
- Group related CSS properties together
- Use semantic design tokens for consistent branding
- Implement mobile-first responsive design
- Test BEM class structure in components
- Document complex CSS patterns with comments

### Don'ts ❌
- Don't use Tailwind classes in HTML/TSX
- Don't use @apply directives in CSS
- Don't hardcode colors or spacing values
- Don't create overly specific CSS selectors
- Don't mix BEM with other naming conventions
- Don't skip theme context testing
- Don't create CSS without corresponding design tokens

### Performance Guidelines
- Keep CSS chunks under 500KB each
- Use efficient CSS custom property patterns
- Minimize CSS selector complexity
- Implement proper CSS lazy loading
- Test theme switching performance (< 100ms target)
- Monitor bundle size impact of new components

## Troubleshooting

### Common Issues and Solutions

#### BEM Class Not Applied
```typescript
// Check class name construction
const className = `${baseClass}__${element}--${modifier}`;
console.log('Generated class:', className);

// Verify CSS file is imported
import '../../styles/components/component-name.css';
```

#### Design Token Not Working
```css
/* Check token definition */
:root {
  --token-name: value; /* Make sure token is defined */
}

/* Check fallback chain */
.component {
  color: var(--theme-token, var(--base-token, #fallback));
}
```

#### Theme Context Issues
```typescript
// Verify theme class is applied
console.log('Theme classes:', document.documentElement.classList);

// Check media query matching
const isDesktop = window.matchMedia('(min-width: 769px)').matches;
console.log('Desktop context:', isDesktop);
```

This documentation provides comprehensive patterns for implementing and maintaining the pure BEM CSS architecture with design tokens.