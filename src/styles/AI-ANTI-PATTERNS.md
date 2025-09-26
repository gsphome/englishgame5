# AI Anti-Patterns Documentation

## Overview

This document defines anti-patterns that AI developers should avoid when working with FluentFlow's CSS architecture. These patterns are automatically detected by validation scripts and should be eliminated from the codebase.

## Critical Anti-Patterns

### ❌ Hybrid Code (Forbidden)

**Anti-Pattern: @apply Directives**

```css
/* NEVER use @apply directives */
.component {
  @apply bg-white text-black p-4; /* ❌ FORBIDDEN */
}
```

**Correct Pattern: Pure CSS with Design Tokens**

```css
/* ✅ CORRECT: Pure CSS with design tokens */
.component {
  background-color: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
  padding: 1rem;
}
```

**Anti-Pattern: Tailwind Classes in JSX**

```tsx
/* NEVER use Tailwind classes in JSX */
<div className="bg-white text-gray-500 hover:text-gray-700"> {/* ❌ FORBIDDEN */}
```

**Correct Pattern: Pure BEM Classes**

```tsx
/* ✅ CORRECT: Pure BEM classes */
<div className="component component--active">
```

### ❌ Direct Color Usage

**Anti-Pattern: Hardcoded Colors**

```css
/* NEVER use direct colors */
.component {
  color: #374151; /* ❌ Use var(--theme-text-primary) */
  background: white; /* ❌ Use var(--theme-bg-elevated) */
  border: 1px solid #ccc; /* ❌ Use var(--theme-border-soft) */
}
```

**Correct Pattern: Design Tokens**

```css
/* ✅ CORRECT: Design tokens */
.component {
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-soft);
}
```

### ❌ Non-BEM Naming

**Anti-Pattern: Various Naming Conventions**

```css
/* NEVER use non-BEM naming */
.componentTitle {
} /* ❌ camelCase */
.component-title {
} /* ❌ kebab-case without BEM */
.component_title {
} /* ❌ snake_case */
.ComponentTitle {
} /* ❌ PascalCase */
```

**Correct Pattern: Strict BEM**

```css
/* ✅ CORRECT: Strict BEM naming */
.component {
} /* Block */
.component__title {
} /* Element */
.component--active {
} /* Modifier */
.component__title--large {
} /* Element with modifier */
```

### ❌ Missing AI Documentation

**Anti-Pattern: Undocumented CSS**

```css
/* NEVER leave CSS undocumented */
.component {
  /* No AI context or validation comments */
  color: var(--theme-text-primary);
}
```

**Correct Pattern: AI-Documented CSS**

```css
/* ✅ CORRECT: AI-documented CSS */
/* AI_VALIDATION: BEM_BLOCK - Main component container */
/* AI_CONTEXT: Uses theme tokens for automatic light/dark adaptation */
.component {
  color: var(--theme-text-primary);
}
```

## Validation Patterns

### Automated Detection

The following patterns are automatically detected by validation scripts:

```javascript
// Anti-patterns detected by scripts
const AI_ANTI_PATTERNS = {
  TAILWIND_CLASSES: /@apply\s+[a-z-]+/g,
  DIRECT_COLORS: /#[0-9a-fA-F]{3,6}(?![^{]*var\()/g,
  NON_BEM_CLASSES: /\.[a-zA-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/g,
  MISSING_AI_CONTEXT: /\/\*(?!.*AI_CONTEXT).*\*\//g,
};
```

### Validation Commands

```bash
# Check for AI anti-patterns
npm run test:ai-patterns

# Check design token compliance
npm run test:ai-tokens

# Comprehensive AI validation
npm run test:ai-compliance
```

## Specific Anti-Pattern Examples

### 1. Mixed Methodologies

**❌ Anti-Pattern: Mixing BEM with Tailwind**

```tsx
// NEVER mix methodologies
<button className="btn btn--primary text-white hover:bg-blue-700">
```

**✅ Correct: Pure BEM**

```tsx
<button className="btn btn--primary">
```

```css
.btn--primary {
  color: var(--theme-text-on-colored);
  background-color: var(--theme-primary-blue);
}

.btn--primary:hover {
  background-color: var(--theme-primary-blue-hover);
}
```

### 2. Inconsistent Token Usage

**❌ Anti-Pattern: Mixed Token Types**

```css
/* NEVER mix semantic and theme tokens inconsistently */
.component {
  color: var(--text-primary); /* Semantic token */
  background: var(--theme-bg-elevated); /* Theme token */
}
```

**✅ Correct: Consistent Theme Tokens**

```css
/* Use theme tokens consistently */
.component {
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-elevated);
}
```

### 3. Poor Accessibility Patterns

**❌ Anti-Pattern: Missing Accessibility Features**

```css
/* NEVER ignore accessibility */
.button {
  padding: 4px; /* Too small for touch */
  /* No focus states */
}
```

**✅ Correct: Accessible Button**

```css
/* AI_VALIDATION: ACCESSIBILITY_COMPLIANCE */
.button {
  min-height: 44px; /* Touch target */
  min-width: 44px;
  padding: 0.75rem 1rem;
}

.button:focus {
  outline: 2px solid var(--theme-primary-blue);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none !important;
  }
}
```

### 4. Performance Anti-Patterns

**❌ Anti-Pattern: Inefficient CSS**

```css
/* NEVER use inefficient patterns */
.component * * * {
  /* Overly specific selectors */
  color: red !important; /* Unnecessary !important */
}

.component {
  transition: all 1s ease; /* Expensive transitions */
}
```

**✅ Correct: Performance-Optimized CSS**

```css
/* AI_VALIDATION: PERFORMANCE_OPTIMIZATION */
.component {
  color: var(--theme-text-primary);
  transition: color 0.2s ease; /* Specific property */
  contain: layout style; /* Layout containment */
}
```

## Migration Patterns

### From Hybrid to Pure CSS

**Step 1: Identify Anti-Patterns**

```bash
# Run validation to find issues
npm run test:ai-compliance
```

**Step 2: Replace @apply Directives**

```css
/* BEFORE */
.component {
  @apply bg-white text-gray-500 p-4;
}

/* AFTER */
.component {
  background-color: var(--theme-bg-elevated);
  color: var(--theme-text-secondary);
  padding: 1rem;
}
```

**Step 3: Update JSX Classes**

```tsx
// BEFORE
<div className="component text-gray-500 hover:text-gray-700">

// AFTER
<div className="component">
```

**Step 4: Add AI Documentation**

```css
/* AI_VALIDATION: BEM_BLOCK - Component container */
/* AI_CONTEXT: Uses theme tokens for light/dark adaptation */
.component {
  background-color: var(--theme-bg-elevated);
  color: var(--theme-text-secondary);
  padding: 1rem;
}
```

## Validation Integration

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:ai-compliance"
    }
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/ai-validation.yml
- name: AI Compliance Check
  run: npm run test:ai-compliance
```

### Development Workflow

```bash
# Before committing changes
npm run css:ai-validate

# Fix any issues found
npm run test:ai-patterns
npm run test:ai-tokens
npm run test:bem

# Verify fixes
npm run test:ai-compliance
```

## AI Development Guidelines

### 1. Always Use Design Tokens

- Prefer `var(--theme-*)` over `var(--semantic-*)`
- Never use direct colors like `#374151`
- Use fallback chains for robustness

### 2. Follow Strict BEM

- Block: `.component`
- Element: `.component__element`
- Modifier: `.component--modifier`
- No camelCase or other naming conventions

### 3. Document for AI

- Add `AI_VALIDATION:` comments
- Include `AI_CONTEXT:` explanations
- Provide `AI_USAGE:` examples

### 4. Ensure Accessibility

- Minimum 44px touch targets
- Focus states for all interactive elements
- Respect `prefers-reduced-motion`
- Support high contrast mode

### 5. Optimize Performance

- Use specific transition properties
- Implement layout containment
- Avoid expensive selectors
- Minimize `!important` usage

## Enforcement

These anti-patterns are automatically detected and prevented by:

1. **Validation Scripts**: Run during development and CI/CD
2. **Linting Rules**: ESLint and Stylelint configurations
3. **Pre-commit Hooks**: Prevent commits with anti-patterns
4. **Documentation**: Clear examples and guidelines

## Resources

- [AI Development Guide](./README-AI.md)
- [Example Component](./components/example-component.css)
- [Design Token System](./design-system/color-palette.css)
- [BEM Methodology](https://getbem.com/)

Remember: The goal is to create predictable, maintainable, and AI-friendly CSS that automatically adapts to theme contexts while following strict architectural patterns.
