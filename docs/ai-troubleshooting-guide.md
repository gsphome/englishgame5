# AI Development Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting solutions for common issues encountered during AI development with FluentFlow's CSS architecture. Each issue includes symptoms, root causes, and step-by-step resolution procedures.

## Quick Diagnostic Commands

```bash
# Run comprehensive diagnostics
npm run test:ai-compliance

# Check specific areas
npm run test:ai-patterns     # Pattern compliance issues
npm run test:ai-tokens       # Design token issues  
npm run test:bem             # BEM naming issues
npm run css:validate         # General CSS issues
npm run css:bundle-check     # Performance issues
```

## Common Issues and Solutions

### 1. @apply Directive Issues

#### Symptoms
```bash
❌ Error: Found @apply directives (forbidden): @apply bg-white, @apply text-gray-500
```

#### Root Cause
- Legacy Tailwind @apply directives still present in CSS files
- Hybrid architecture not fully converted to pure CSS

#### Resolution Steps

**Step 1: Identify affected files**
```bash
npm run test:ai-patterns | grep "@apply"
```

**Step 2: Convert @apply to pure CSS**
```css
/* ❌ BEFORE: Hybrid approach */
.component {
  @apply bg-white text-gray-500 p-4 rounded-lg;
}

/* ✅ AFTER: Pure CSS with design tokens */
.component {
  background-color: var(--theme-bg-elevated);
  color: var(--theme-text-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
}
```

**Step 3: Add AI validation comments**
```css
/* AI_VALIDATION: BEM_BLOCK - Component converted from @apply */
/* AI_CONTEXT: Uses theme tokens for automatic light/dark adaptation */
.component {
  background-color: var(--theme-bg-elevated);
  color: var(--theme-text-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
}
```

**Step 4: Validate conversion**
```bash
npm run test:ai-patterns
```

### 2. Tailwind Classes in TSX Files

#### Symptoms
```bash
❌ Error: Tailwind classes detected: text-gray-500, hover:text-gray-700, bg-white
```

#### Root Cause
- Inline Tailwind classes still present in JSX className attributes
- Components not fully converted to pure BEM

#### Resolution Steps

**Step 1: Identify affected components**
```bash
npm run test:bem | grep "TAILWIND_DETECTED"
```

**Step 2: Remove Tailwind classes from TSX**
```tsx
// ❌ BEFORE: Hybrid classes
<button className="btn btn--primary text-white hover:bg-blue-700">
  Click me
</button>

// ✅ AFTER: Pure BEM
<button className="btn btn--primary">
  Click me
</button>
```

**Step 3: Move styling to CSS file**
```css
/* AI_VALIDATION: BEM_ELEMENT - Button component */
.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* AI_VALIDATION: BEM_MODIFIER - Primary button variant */
.btn--primary {
  background-color: var(--theme-primary-blue);
  color: var(--theme-text-on-colored);
}

.btn--primary:hover {
  background-color: var(--theme-primary-blue-hover);
}
```

**Step 4: Import CSS in component**
```tsx
import './button.css';
```

### 3. Direct Color Usage

#### Symptoms
```bash
⚠️ Warning: Direct color usage found: #374151, #ffffff, rgba(0, 0, 0, 0.1)
```

#### Root Cause
- Hardcoded color values instead of design tokens
- Missing theme-aware color system

#### Resolution Steps

**Step 1: Identify direct colors**
```bash
npm run test:ai-tokens | grep "Direct color usage"
```

**Step 2: Replace with design tokens**
```css
/* ❌ BEFORE: Direct colors */
.component {
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* ✅ AFTER: Design tokens */
.component {
  color: var(--theme-text-primary);
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-soft);
  box-shadow: 0 1px 3px var(--shadow-subtle);
}
```

**Step 3: Add missing tokens if needed**
```css
/* In color-palette.css if token doesn't exist */
:root {
  --shadow-subtle: rgba(0, 0, 0, 0.1);
}
```

### 4. BEM Naming Violations

#### Symptoms
```bash
❌ Error: Invalid BEM naming: "componentTitle", "component-title"
```

#### Root Cause
- Non-BEM naming conventions used
- Inconsistent naming patterns

#### Resolution Steps

**Step 1: Identify naming violations**
```bash
npm run test:bem | grep "BEM_VIOLATION"
```

**Step 2: Fix naming conventions**
```css
/* ❌ BEFORE: Invalid naming */
.componentTitle { }        /* camelCase */
.component-title { }       /* kebab-case */
.component_title { }       /* snake_case */

/* ✅ AFTER: Proper BEM */
.component__title { }      /* BEM element */
```

**Step 3: Update TSX references**
```tsx
// ❌ BEFORE
<h2 className="componentTitle">Title</h2>

// ✅ AFTER  
<h2 className="component__title">Title</h2>
```

### 5. Missing AI Documentation

#### Symptoms
```bash
⚠️ Warning: Component file lacks AI documentation
```

#### Root Cause
- CSS files missing AI validation comments
- Insufficient documentation for AI comprehension

#### Resolution Steps

**Step 1: Add AI validation comments**
```css
/* AI_VALIDATION: BEM_BLOCK - Main component container */
/* AI_CONTEXT: Learning card component for displaying module information */
/* AI_USAGE: Used in dashboard and module selection screens */
.learning-card {
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-soft);
  border-radius: 0.5rem;
  padding: 1rem;
}

/* AI_VALIDATION: BEM_ELEMENT - Card header section */
.learning-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

/* AI_VALIDATION: BEM_MODIFIER - Active card state */
.learning-card--active {
  border-color: var(--theme-primary-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### 6. Unknown Design Tokens

#### Symptoms
```bash
⚠️ Warning: Unknown token used: --theme-border-primary, --dynamic-width
```

#### Root Cause
- Using tokens that don't exist in the design system
- Typos in token names

#### Resolution Steps

**Step 1: Check available tokens**
```bash
# List all available tokens
grep -r "^  --" src/styles/design-system/color-palette.css
```

**Step 2: Use correct token names**
```css
/* ❌ BEFORE: Unknown tokens */
.component {
  border-color: var(--theme-border-primary);  /* Doesn't exist */
  width: var(--dynamic-width);                /* Doesn't exist */
}

/* ✅ AFTER: Correct tokens */
.component {
  border-color: var(--theme-border-soft);     /* Exists */
  width: var(--card-width-mobile);            /* Define if needed */
}
```

**Step 3: Add missing tokens if legitimate**
```css
/* In utilities/dynamic-values.css */
:root {
  --card-width-mobile: 100%;
  --card-width-tablet: 300px;
  --card-width-desktop: 350px;
}
```

### 7. CSS Bundle Size Issues

#### Symptoms
```bash
❌ Error: CSS chunks exceed 500KB limit
```

#### Root Cause
- CSS files too large
- Inefficient CSS patterns
- Duplicate styles

#### Resolution Steps

**Step 1: Analyze bundle composition**
```bash
npm run css:analyze
npm run css:bundle-check --verbose
```

**Step 2: Identify large files**
```bash
# Find largest CSS files
find src/styles -name "*.css" -exec wc -c {} + | sort -n
```

**Step 3: Optimize CSS**
```css
/* ❌ BEFORE: Inefficient CSS */
.component-1 { background-color: var(--theme-bg-elevated); }
.component-2 { background-color: var(--theme-bg-elevated); }
.component-3 { background-color: var(--theme-bg-elevated); }

/* ✅ AFTER: Shared utility class */
.elevated-bg {
  background-color: var(--theme-bg-elevated);
}
```

**Step 4: Split large components**
```css
/* Split large component CSS into multiple files */
/* component-base.css */
.component { /* base styles */ }

/* component-variants.css */  
.component--variant1 { /* variant styles */ }
.component--variant2 { /* variant styles */ }
```

### 8. Theme Switching Performance Issues

#### Symptoms
```bash
❌ Error: Theme switching exceeds 100ms target
```

#### Root Cause
- Expensive CSS transitions
- Too many properties transitioning
- Inefficient CSS custom property usage

#### Resolution Steps

**Step 1: Optimize transitions**
```css
/* ❌ BEFORE: Expensive transitions */
.component {
  transition: all 0.5s ease;  /* Transitions everything */
}

/* ✅ AFTER: Specific transitions */
.component {
  transition: color 0.2s ease, background-color 0.2s ease;
}
```

**Step 2: Use GPU acceleration**
```css
.component {
  transform: translateZ(0);  /* Force GPU layer */
  contain: layout style;     /* Layout containment */
}
```

**Step 3: Minimize repaints**
```css
/* Avoid properties that cause layout/paint */
.component {
  /* ❌ Causes layout */
  transition: width 0.3s ease, height 0.3s ease;
  
  /* ✅ Composite only */
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

### 9. Component CSS Not Loading

#### Symptoms
- Component renders but styles not applied
- CSS file exists but not loaded

#### Root Cause
- Missing CSS import in component
- Incorrect file path
- CSS syntax errors

#### Resolution Steps

**Step 1: Verify CSS import**
```tsx
// In component TSX file
import './component-name.css';  // Must match exact filename
```

**Step 2: Check file paths**
```bash
# Verify CSS file exists
ls -la src/styles/components/component-name.css

# Check import path is correct relative to TSX file
```

**Step 3: Validate CSS syntax**
```bash
# Check for CSS syntax errors
npm run lint:css  # If available
# Or manually check CSS file for syntax issues
```

### 10. Design Token Resolution Issues

#### Symptoms
- CSS custom properties not resolving
- Styles falling back to browser defaults

#### Root Cause
- Token not defined in design system
- Theme context not properly set
- Circular token references

#### Resolution Steps

**Step 1: Verify token definition**
```bash
# Check if token exists
grep -r "theme-text-primary" src/styles/design-system/
```

**Step 2: Check theme context**
```css
/* Verify theme context is set */
html.light {
  --theme-text-primary: var(--text-primary);
}

html.dark {
  --theme-text-primary: var(--text-on-dark);
}
```

**Step 3: Add fallback values**
```css
.component {
  /* Add fallback chain */
  color: var(--theme-text-primary, var(--text-primary, #374151));
}
```

## Advanced Troubleshooting

### Performance Debugging

**Monitor CSS Performance**
```javascript
// Add to browser console for performance monitoring
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.name.includes('css')) {
      console.log(`CSS: ${entry.name} - ${entry.duration}ms`);
    }
  });
});
observer.observe({ entryTypes: ['measure', 'navigation'] });
```

**Theme Switch Timing**
```javascript
// Measure theme switch performance
const startTime = performance.now();
document.documentElement.classList.toggle('dark');
requestAnimationFrame(() => {
  const endTime = performance.now();
  console.log(`Theme switch: ${endTime - startTime}ms`);
});
```

### Bundle Analysis

**Analyze CSS Dependencies**
```bash
# Generate dependency graph
npm run css:analyze --graph

# Check for circular dependencies
npm run css:analyze --circular

# Identify unused CSS
npm run css:analyze --unused
```

### Validation Debugging

**Verbose Validation Output**
```bash
# Get detailed validation information
npm run test:ai-compliance --verbose

# Debug specific validation
npm run test:ai-patterns --debug
npm run test:ai-tokens --debug
npm run test:bem --debug
```

## Prevention Strategies

### 1. Pre-commit Validation
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:ai-compliance"
    }
  }
}
```

### 2. Development Workflow
```bash
# Run after each change
npm run test:ai-patterns

# Before committing
npm run css:validate

# Before pushing
npm run test:ai-compliance
```

### 3. Code Review Checklist
- [ ] All @apply directives removed
- [ ] No Tailwind classes in TSX
- [ ] Design tokens used consistently
- [ ] BEM naming followed strictly
- [ ] AI documentation added
- [ ] Performance targets met

## Emergency Procedures

### Rollback to Previous State
```bash
# If validation fails completely
git checkout HEAD~1 -- src/styles/

# Restore from backup branch
git checkout backup/css-hybrid -- src/styles/

# Reset to last known good state
git reset --hard <commit-hash>
```

### Quick Fixes for CI/CD
```bash
# Temporary disable validation (emergency only)
npm run test:ai-compliance --no-fail

# Skip specific validations
npm run test:ai-compliance --skip-patterns --skip-tokens
```

## Getting Help

### Internal Resources
- [AI Development Guide](./architecture/ai-css-development-guide.md)
- [AI Anti-Patterns](./architecture/ai-anti-patterns.md)
- [Example Component](../src/styles/components/example-component.css)

### Validation Commands
```bash
# Get help for specific commands
npm run test:ai-compliance --help
npm run test:ai-patterns --help
npm run css:validate --help
```

### Debug Information
```bash
# Generate debug report
npm run test:ai-compliance --debug > debug-report.txt

# Include system information
npm run test:ai-compliance --system-info
```

This troubleshooting guide should resolve most common issues encountered during AI development with FluentFlow's CSS architecture. For issues not covered here, refer to the validation output and error messages for specific guidance.