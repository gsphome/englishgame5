# FluentFlow Enhancement Design Guidelines

## Overview

This document provides design guidelines for implementing new learning enhancement features while maintaining visual consistency with the existing FluentFlow system.

## Color Usage Guidelines

### 1. Base Colors (Always use existing system colors)

```css
/* For backgrounds and containers */
background-color: var(--header-bg);
border: 1px solid var(--header-border);

/* For text */
color: var(--header-text-primary); /* Main text */
color: var(--header-text-secondary); /* Secondary text */
```

### 2. Enhancement-Specific Colors

#### Gamification Elements

```css
/* Points display */
.points-display {
  color: var(--points-color); /* #f59e0b light, #fbbf24 dark */
}

/* Streak indicators */
.streak-indicator {
  color: var(--streak-color); /* #ef4444 light, #f87171 dark */
}

/* Badge types */
.badge--gold {
  color: var(--badge-gold);
}
.badge--silver {
  color: var(--badge-silver);
}
.badge--bronze {
  color: var(--badge-bronze);
}
```

#### Progress States

```css
.progress--complete {
  color: var(--progress-complete);
}
.progress--partial {
  color: var(--progress-partial);
}
.progress--locked {
  color: var(--progress-locked);
}
.progress--available {
  color: var(--progress-available);
}
```

#### Daily Challenge States

```css
.challenge--available {
  border-color: var(--challenge-available);
}
.challenge--completed {
  border-color: var(--challenge-completed);
}
.challenge--missed {
  border-color: var(--challenge-missed);
}
```

## BEM-Like Naming Convention

### Structure

```
.block-name
.block-name__element
.block-name--modifier
.block-name__element--modifier
```

### Examples for New Components

#### Daily Challenge Card

```css
.daily-challenge                    /* Block */
.daily-challenge__header           /* Element */
.daily-challenge__content          /* Element */
.daily-challenge__footer           /* Element */
.daily-challenge--available       /* Modifier */
.daily-challenge--completed       /* Modifier */
.daily-challenge__header--highlighted  /* Element + Modifier */
```

#### Progress Analytics

```css
.progress-analytics
.progress-analytics__chart
.progress-analytics__legend
.progress-analytics__metric
.progress-analytics--compact
.progress-analytics__chart--loading
```

#### Gamification Elements

```css
.gamification-panel
.gamification-panel__points
.gamification-panel__badges
.gamification-panel__streak
.gamification-panel--collapsed
.gamification-panel__badge--unlocked
```

## Component Structure Template

```css
/* Component: Daily Challenge Card */
.daily-challenge {
  /* Base styles using system colors */
  background-color: var(--header-bg);
  border: 1px solid var(--header-border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease-in-out;
}

.daily-challenge__header {
  color: var(--header-text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.daily-challenge__points {
  color: var(--points-color);
  font-weight: 700;
}

.daily-challenge__streak {
  color: var(--streak-color);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* State modifiers */
.daily-challenge--available {
  border-color: var(--challenge-available);
  box-shadow: 0 0 0 1px var(--challenge-available);
}

.daily-challenge--completed {
  border-color: var(--challenge-completed);
  background-color: rgba(16, 185, 129, 0.05);
}

.daily-challenge--missed {
  border-color: var(--challenge-missed);
  opacity: 0.7;
}

/* Hover states */
.daily-challenge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .daily-challenge:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

## Accessibility Requirements

### 1. Color Contrast

- Text on background: minimum 4.5:1 ratio (AA)
- Large text: minimum 3:1 ratio (AA)
- Interactive elements: minimum 3:1 ratio

### 2. Focus States

```css
.interactive-element:focus {
  outline: 2px solid var(--header-focus-ring);
  outline-offset: 2px;
}
```

### 3. Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

## Responsive Design

### Breakpoints (following existing system)

```css
/* Mobile first approach */
.component {
  /* Mobile styles */
}

@media (min-width: 640px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

## File Organization

```
src/styles/
├── design-system/
│   ├── color-palette.css          # This file
│   └── enhancement-guidelines.md  # This document
├── components/
│   ├── enhancements/
│   │   ├── daily-challenge.css
│   │   ├── progress-analytics.css
│   │   ├── gamification.css
│   │   └── thematic-paths.css
│   └── existing components...
└── components.css
```

## Import Order

```css
/* In new component CSS files */
@import '../design-system/color-palette.css';

/* Component-specific styles */
.component-name {
  /* styles using palette variables */
}
```

## Testing Checklist

- [ ] Component works in both light and dark modes
- [ ] Colors maintain proper contrast ratios
- [ ] BEM-like naming convention followed
- [ ] Responsive design implemented
- [ ] Focus states defined for interactive elements
- [ ] Reduced motion preferences respected
- [ ] High contrast mode supported
