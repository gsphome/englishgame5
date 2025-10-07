# Performance Monitoring Infrastructure

## Overview
This document describes the performance monitoring tools set up for the CSS architecture refactor.

## Tools Available

### 1. Bundle Size Tracker
- **Location**: `scripts/performance/bundle-size-tracker.js`
- **Usage**: `node scripts/performance/bundle-size-tracker.js`
- **Purpose**: Monitors CSS and JS bundle sizes, ensures chunks stay under 500KB

### 2. Theme Switching Performance
- **Location**: `scripts/performance/theme-baseline.js`
- **Usage**: `node scripts/performance/theme-baseline.js`
- **Purpose**: Measures theme switching performance baseline

### 3. Browser Render Tracker
- **Location**: `scripts/performance/browser-render-tracker.js`
- **Usage**: Load in browser console for real-time performance monitoring
- **Purpose**: Measures actual render times in browser environment

### 4. Test Render Utilities
- **Location**: `tests/helpers/render-time-utils.ts`
- **Usage**: Import in test files for performance assertions
- **Purpose**: Automated performance testing in CI/CD

## Usage Examples

### Browser Console
```javascript
// Load the tracker
// Then use:
const measurement = window.RenderTimeTracker.start('My Component');
// ... trigger render ...
window.RenderTimeTracker.end(measurement);
```

### Test Environment
```typescript
import { TestRenderTracker, expectThemeSwitchTime } from '../helpers/render-time-utils';

const tracker = new TestRenderTracker();
const measurement = await tracker.measureThemeSwitch(() => setTheme('dark'));
expectThemeSwitchTime(measurement); // Asserts < 100ms
```

## Performance Targets

### CSS Bundle Sizes
- **Individual chunks**: < 500KB each
- **Total CSS**: Monitor for regression

### Theme Switching
- **Target**: < 100ms per switch
- **Measurement**: DOM update completion time

### Component Rendering
- **Target**: < 50ms for typical components
- **Measurement**: Mount to first paint time

## Monitoring Schedule

### Pre-Migration
- ✅ Baseline established
- ✅ Bundle sizes documented
- ✅ Theme switching baseline recorded

### During Migration
- Monitor after each major component refactor
- Track bundle size changes
- Verify performance targets maintained

### Post-Migration
- Final performance validation
- Regression testing
- Documentation updates
