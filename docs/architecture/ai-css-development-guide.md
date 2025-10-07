# AI Developer Experience Guide - CSS Architecture

## Overview

This guide provides AI developers with comprehensive patterns, examples, and validation rules for working with FluentFlow's pure CSS architecture. The system uses strict BEM methodology with design tokens and theme-aware variables.

## Architecture Philosophy

### Pure CSS Architecture (No Hybrid Code)

- **NO Tailwind classes** in HTML/JSX: `className="text-gray-500"` ❌
- **NO @apply directives** in CSS: `@apply bg-white text-black` ❌
- **Pure BEM only**: `className="compact-settings__close-btn"` ✅
- **Design tokens only**: `color: var(--theme-text-primary)` ✅

### Design Token System

All styling uses a centralized token system with theme-aware variables:

```css
/* ✅ CORRECT: Use theme-aware variables */
.component__element {
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-elevated);
  border-color: var(--theme-border-soft);
}

/* ❌ INCORRECT: Direct colors or Tailwind */
.component__element {
  color: #374151; /* Direct color */
  @apply bg-white text-black; /* @apply directive */
}
```

## BEM Methodology - Strict Implementation

### Naming Convention Rules

```css
/* Block: Component name */
.compact-settings {
}

/* Element: Component part */
.compact-settings__container {
}
.compact-settings__header {
}
.compact-settings__title {
}
.compact-settings__close-btn {
}

/* Modifier: Variation or state */
.compact-settings--active {
}
.compact-settings__close-btn--disabled {
}
.compact-settings__container--loading {
}
```

### AI Pattern Recognition

When creating new components, follow this structure:

1. **Identify the block** (main component name)
2. **List all elements** (parts of the component)
3. **Define modifiers** (variations and states)
4. **Use design tokens** for all styling properties

## Design Token Categories

### Text Hierarchy

```css
/* Primary text - main content */
color: var(--theme-text-primary);

/* Secondary text - labels, descriptions */
color: var(--theme-text-secondary);

/* Tertiary text - hints, placeholders */
color: var(--theme-text-tertiary);

/* Text on colored backgrounds */
color: var(--theme-text-on-colored);
```

### Background System

```css
/* Elevated surfaces - cards, modals */
background-color: var(--theme-bg-elevated);

/* Subtle backgrounds - sections */
background-color: var(--theme-bg-subtle);

/* Soft backgrounds - hover states */
background-color: var(--theme-bg-soft);

/* Primary background - main app */
background-color: var(--theme-bg-primary);
```

### Border System

```css
/* Almost invisible borders */
border-color: var(--theme-border-subtle);

/* Subtle borders - most common */
border-color: var(--theme-border-soft);

/* Medium borders - use sparingly */
border-color: var(--theme-border-medium);

/* Borders on colored backgrounds */
border-color: var(--theme-border-on-colored);
```

### Interactive Colors

```css
/* Primary actions */
background-color: var(--theme-primary-blue);
background-color: var(--theme-primary-blue-hover);
background-color: var(--theme-primary-blue-active);

/* Secondary actions */
background-color: var(--theme-primary-purple);
background-color: var(--theme-primary-purple-hover);
background-color: var(--theme-primary-purple-light);
```

## Component Development Pattern

### 1. Create Component Structure

```typescript
// Component.tsx
import './component-name.css';

export const ComponentName = () => {
  return (
    <div className="component-name">
      <div className="component-name__header">
        <h2 className="component-name__title">Title</h2>
        <button className="component-name__close-btn">×</button>
      </div>
      <div className="component-name__content">
        <p className="component-name__text">Content</p>
      </div>
    </div>
  );
};
```

### 2. Create CSS File

```css
/* component-name.css */

/* AI_VALIDATION: BEM_BLOCK */
.component-name {
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-soft);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* AI_VALIDATION: BEM_ELEMENT */
.component-name__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--theme-border-subtle);
}

/* AI_VALIDATION: BEM_ELEMENT */
.component-name__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin: 0;
}

/* AI_VALIDATION: BEM_ELEMENT */
.component-name__close-btn {
  padding: 0.5rem;
  background-color: transparent;
  border: none;
  border-radius: 0.25rem;
  color: var(--theme-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* AI_VALIDATION: BEM_ELEMENT_STATE */
.component-name__close-btn:hover {
  background-color: var(--theme-bg-subtle);
  color: var(--theme-text-primary);
}

/* AI_VALIDATION: BEM_ELEMENT_STATE */
.component-name__close-btn:focus {
  outline: 2px solid var(--theme-primary-blue);
  outline-offset: 2px;
}

/* AI_VALIDATION: BEM_ELEMENT */
.component-name__content {
  color: var(--theme-text-primary);
}

/* AI_VALIDATION: BEM_ELEMENT */
.component-name__text {
  color: var(--theme-text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* AI_VALIDATION: BEM_MODIFIER */
.component-name--loading {
  opacity: 0.6;
  pointer-events: none;
}

/* AI_VALIDATION: BEM_MODIFIER */
.component-name--error {
  border-color: var(--error);
}
```

## Theme Context System

### 4 Theme Contexts

The system supports 4 distinct theme contexts:

1. **Web Light** (`html.light` + `@media (min-width: 769px)`)
2. **Web Dark** (`html.dark` + `@media (min-width: 769px)`)
3. **Mobile Light** (`html.light` + `@media (max-width: 768px)`)
4. **Mobile Dark** (`html.dark` + `@media (max-width: 768px)`)

### Theme-Aware Development

```css
/* AI_VALIDATION: THEME_CONTEXT_USAGE */
/* Base styles use theme variables - automatically adapt */
.component {
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-elevated);
}

/* Context-specific optimizations when needed */
@media (max-width: 768px) {
  .component__button {
    min-height: 44px; /* Touch target optimization */
    padding: 0.75rem;
  }
}

@media (min-width: 769px) {
  .component__button:hover {
    transform: translateY(-1px); /* Hover effects for desktop */
  }
}
```

## CSS Specificity Hierarchy

### Controlled Specificity Order

```css
/* 1. Design Tokens (0,0,0,1) */
:root {
  --token: value;
}

/* 2. BEM Base (0,0,1,0) */
.block__element {
}

/* 3. BEM Modifiers (0,0,2,0) */
.block__element--modifier {
}

/* 4. Theme Context (0,0,1,1) */
html.light .block__element {
}

/* 5. State Overrides (0,0,2,0) */
.block__element:hover {
}
.block__element:focus {
}

/* 6. Important (use sparingly) */
.block__element {
  property: value !important;
}
```

## AI Validation Patterns

### Automated Validation Comments

Use these comments for AI validation:

```css
/* AI_VALIDATION: BEM_BLOCK - Main component block */
.component-name {
}

/* AI_VALIDATION: BEM_ELEMENT - Component element */
.component-name__element {
}

/* AI_VALIDATION: BEM_MODIFIER - Component variation */
.component-name--modifier {
}

/* AI_VALIDATION: DESIGN_TOKEN_USAGE - Uses design tokens */
.component {
  color: var(--theme-text-primary);
}

/* AI_VALIDATION: THEME_CONTEXT_USAGE - Theme-aware styling */
.component {
  background-color: var(--theme-bg-elevated);
}

/* AI_VALIDATION: NO_TAILWIND - Pure CSS, no Tailwind */
.component {
  padding: 1rem;
} /* Not @apply p-4 */

/* AI_VALIDATION: ACCESSIBILITY - Accessible implementation */
.component:focus {
  outline: 2px solid var(--theme-primary-blue);
}
```

## Anti-Patterns to Avoid

### ❌ Hybrid Code (Forbidden)

```css
/* NEVER mix BEM with Tailwind */
.component__element {
  @apply bg-white text-black p-4; /* ❌ @apply forbidden */
}
```

```tsx
/* NEVER use Tailwind classes in JSX */
<div className="component text-gray-500 hover:text-gray-700"> {/* ❌ Tailwind forbidden */}
```

### ❌ Direct Colors

```css
/* NEVER use direct colors */
.component {
  color: #374151; /* ❌ Use var(--theme-text-primary) */
  background: white; /* ❌ Use var(--theme-bg-elevated) */
}
```

### ❌ Non-BEM Naming

```css
/* NEVER use non-BEM naming */
.componentTitle {
} /* ❌ Use .component__title */
.component-title {
} /* ❌ Use .component__title */
.component_title {
} /* ❌ Use .component__title */
```

## Performance Guidelines

### CSS Chunk Management

- Keep CSS files under 500KB per chunk
- Use lazy loading for component CSS
- Minimize CSS custom property re-evaluation

### Optimization Patterns

```css
/* AI_VALIDATION: PERFORMANCE_OPTIMIZED */
.component {
  /* Group related properties */
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-elevated);
  border-color: var(--theme-border-soft);

  /* Optimize transitions */
  transition: all 0.2s ease;

  /* Use transform for animations */
  transform: translateZ(0); /* GPU acceleration */
}

.component:hover {
  transform: translateY(-1px) translateZ(0);
}
```

## Accessibility Requirements

### Mandatory Accessibility Patterns

```css
/* AI_VALIDATION: ACCESSIBILITY_COMPLIANT */
.component__button {
  /* Minimum touch target */
  min-height: 44px;
  min-width: 44px;

  /* Focus indicators */
  outline: none;
}

.component__button:focus {
  outline: 2px solid var(--theme-primary-blue);
  outline-offset: 2px;
}

.component__button:focus-visible {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* High contrast support */
@media (prefers-contrast: high) {
  .component {
    border-width: 2px;
    border-style: solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none !important;
    animation: none !important;
  }
}
```

## File Organization

### Required File Structure

```
src/styles/
├── design-system/
│   ├── color-palette.css     # All design tokens
│   └── breakpoints.css       # Media queries
├── themes/
│   ├── web-light.css         # Desktop light theme
│   ├── web-dark.css          # Desktop dark theme
│   ├── mobile-light.css      # Mobile light theme
│   └── mobile-dark.css       # Mobile dark theme
├── components/
│   └── component-name.css    # Pure BEM CSS
└── utilities/
    └── dynamic-values.css    # CSS custom properties
```

### Import Pattern

```css
/* component-name.css */
/* AI_VALIDATION: PROPER_IMPORTS */
/* Design tokens automatically available via index.css */
/* No need to import color-palette.css in components */

.component-name {
  /* Use tokens directly */
  color: var(--theme-text-primary);
}
```

## Testing Integration

### CSS Testing Patterns

```typescript
// AI_VALIDATION: TESTABLE_CSS
describe('ComponentName CSS', () => {
  it('should use design tokens', () => {
    const element = screen.getByTestId('component');
    expect(element).toHaveStyle({
      color: 'var(--theme-text-primary)',
    });
  });

  it('should follow BEM naming', () => {
    const element = screen.getByTestId('component');
    expect(element.className).toMatch(/^component-name(__\w+)?(--\w+)?$/);
  });
});
```

## Migration from Hybrid Code

### Step-by-Step Migration

1. **Identify Tailwind classes** in JSX
2. **Remove @apply directives** from CSS
3. **Create BEM structure** for component
4. **Replace with design tokens**
5. **Add AI validation comments**
6. **Test in all 4 theme contexts**

### Example Migration

```tsx
// BEFORE (Hybrid)
<button className="compact-settings__close-btn text-gray-500 hover:text-gray-700">

// AFTER (Pure BEM)
<button className="compact-settings__close-btn">
```

```css
/* BEFORE (Hybrid) */
.compact-settings__close-btn {
  @apply p-2 text-gray-500 hover:text-gray-700;
}

/* AFTER (Pure CSS with Design Tokens) */
/* AI_VALIDATION: BEM_ELEMENT */
.compact-settings__close-btn {
  padding: 0.5rem;
  color: var(--theme-text-secondary);
  transition: color 0.2s ease;
}

/* AI_VALIDATION: BEM_ELEMENT_STATE */
.compact-settings__close-btn:hover {
  color: var(--theme-text-primary);
}
```

## Quick Reference

### Essential Design Tokens

```css
/* Text */
var(--theme-text-primary)     /* Main text */
var(--theme-text-secondary)   /* Secondary text */
var(--theme-text-tertiary)    /* Tertiary text */
var(--theme-text-on-colored)  /* Text on colored backgrounds */

/* Backgrounds */
var(--theme-bg-primary)       /* Main background */
var(--theme-bg-elevated)      /* Cards, modals */
var(--theme-bg-subtle)        /* Subtle backgrounds */
var(--theme-bg-soft)          /* Hover states */

/* Borders */
var(--theme-border-subtle)    /* Almost invisible */
var(--theme-border-soft)      /* Most common */
var(--theme-border-medium)    /* Use sparingly */

/* Interactive */
var(--theme-primary-blue)     /* Primary actions */
var(--theme-primary-purple)   /* Secondary actions */
```

### BEM Quick Check

- Block: `.component-name`
- Element: `.component-name__element`
- Modifier: `.component-name--modifier`
- State: `.component-name__element:hover`

### Validation Commands

```bash
# Check BEM compliance
npm run test:bem

# Validate design tokens
npm run test:tokens

# Check CSS chunks
npm run css:bundle-check

# Full CSS validation
npm run css:validate
```

This guide ensures consistent, maintainable, and AI-friendly CSS development within the FluentFlow architecture.
