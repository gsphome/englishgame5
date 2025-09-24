#!/usr/bin/env node

/**
 * Render Time Measurement Utilities
 * Provides tools for measuring component render times and theme switching performance
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Creates a performance measurement utility for browser environments
 */
function createRenderTimeMeasurement() {
  return `
/**
 * Render Time Measurement Utility
 * Use this in browser console or test environments to measure render performance
 */
window.RenderTimeTracker = {
  measurements: [],
  
  /**
   * Starts a performance measurement
   */
  start(label) {
    const measurement = {
      label,
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
    
    this.measurements.push(measurement);
    return measurement;
  },
  
  /**
   * Ends a performance measurement
   */
  end(measurement) {
    measurement.endTime = performance.now();
    measurement.duration = measurement.endTime - measurement.startTime;
    
    console.log(\`⏱️ \${measurement.label}: \${measurement.duration.toFixed(2)}ms\`);
    return measurement;
  },
  
  /**
   * Measures theme switching time
   */
  async measureThemeSwitch(fromTheme, toTheme) {
    const measurement = this.start(\`Theme switch: \${fromTheme} → \${toTheme}\`);
    
    // Get theme toggle button or use settings store
    const themeToggle = document.querySelector('[data-theme-toggle]') || 
                       document.querySelector('.theme-toggle') ||
                       document.querySelector('.settings-theme-toggle');
    
    if (themeToggle) {
      themeToggle.click();
    } else {
      // Fallback: manually trigger theme change
      if (window.useSettingsStore) {
        const store = window.useSettingsStore.getState();
        store.setTheme(toTheme);
      }
    }
    
    // Wait for DOM updates
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    return this.end(measurement);
  },
  
  /**
   * Measures component mount time
   */
  measureComponentMount(componentSelector) {
    const measurement = this.start(\`Component mount: \${componentSelector}\`);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = Array.from(mutation.addedNodes);
          const targetComponent = addedNodes.find(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches(componentSelector) || node.querySelector(componentSelector))
          );
          
          if (targetComponent) {
            this.end(measurement);
            observer.disconnect();
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return measurement;
  },
  
  /**
   * Gets performance summary
   */
  getSummary() {
    const summary = {
      totalMeasurements: this.measurements.length,
      averageTime: 0,
      slowestMeasurement: null,
      fastestMeasurement: null,
      measurements: this.measurements
    };
    
    if (this.measurements.length > 0) {
      const durations = this.measurements
        .filter(m => m.duration !== null)
        .map(m => m.duration);
      
      summary.averageTime = durations.reduce((a, b) => a + b, 0) / durations.length;
      summary.slowestMeasurement = this.measurements.find(m => 
        m.duration === Math.max(...durations)
      );
      summary.fastestMeasurement = this.measurements.find(m => 
        m.duration === Math.min(...durations)
      );
    }
    
    return summary;
  },
  
  /**
   * Exports measurements as JSON
   */
  export() {
    const data = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      measurements: this.measurements,
      summary: this.getSummary()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`render-measurements-\${Date.now()}.json\`;
    a.click();
    
    URL.revokeObjectURL(url);
    return data;
  },
  
  /**
   * Clears all measurements
   */
  clear() {
    this.measurements = [];
    console.log('🧹 Measurements cleared');
  }
};

// Auto-start measuring if theme switching is detected
document.addEventListener('DOMContentLoaded', () => {
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'class' && 
          mutation.target === document.documentElement) {
        
        const classList = mutation.target.classList;
        const isDark = classList.contains('dark');
        const wasLight = !mutation.oldValue || !mutation.oldValue.includes('dark');
        
        if (isDark && wasLight) {
          console.log('🌙 Theme switched to dark');
        } else if (!isDark && !wasLight) {
          console.log('☀️ Theme switched to light');
        }
      }
    });
  });
  
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class']
  });
});

console.log('⏱️ RenderTimeTracker loaded. Use window.RenderTimeTracker to measure performance.');
`;
}

/**
 * Creates test utilities for measuring render times in test environments
 */
function createTestRenderUtils() {
  return `
/**
 * Test Render Time Utilities
 * For use in Vitest/Jest test environments
 */

import { performance } from 'perf_hooks';

export class TestRenderTracker {
  constructor() {
    this.measurements = [];
  }
  
  /**
   * Measures React component render time
   */
  async measureComponentRender(renderFunction) {
    const startTime = performance.now();
    const result = await renderFunction();
    const endTime = performance.now();
    
    const measurement = {
      type: 'component-render',
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    };
    
    this.measurements.push(measurement);
    return { result, measurement };
  }
  
  /**
   * Measures theme switching in test environment
   */
  async measureThemeSwitch(themeChangeFunction) {
    const startTime = performance.now();
    await themeChangeFunction();
    const endTime = performance.now();
    
    const measurement = {
      type: 'theme-switch',
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    };
    
    this.measurements.push(measurement);
    return measurement;
  }
  
  /**
   * Gets average render time for a specific type
   */
  getAverageTime(type) {
    const filtered = this.measurements.filter(m => m.type === type);
    if (filtered.length === 0) return 0;
    
    return filtered.reduce((sum, m) => sum + m.duration, 0) / filtered.length;
  }
  
  /**
   * Exports measurements for analysis
   */
  export() {
    return {
      measurements: this.measurements,
      summary: {
        totalMeasurements: this.measurements.length,
        averageComponentRender: this.getAverageTime('component-render'),
        averageThemeSwitch: this.getAverageTime('theme-switch')
      }
    };
  }
}

// Performance assertion helpers
export function expectRenderTime(measurement, maxTime, label = 'Render') {
  if (measurement.duration > maxTime) {
    throw new Error(
      \`\${label} time exceeded: \${measurement.duration.toFixed(2)}ms > \${maxTime}ms\`
    );
  }
}

export function expectThemeSwitchTime(measurement, maxTime = 100) {
  expectRenderTime(measurement, maxTime, 'Theme switch');
}
`;
}

/**
 * Main function to set up render time tracking infrastructure
 */
async function setupRenderTimeTracking() {
  console.log('⏱️ Setting up render time tracking infrastructure...');
  
  // Create performance utilities directory
  const perfDir = path.join(process.cwd(), 'scripts/performance');
  await fs.mkdir(perfDir, { recursive: true });
  
  // Create browser measurement utility
  const browserUtilPath = path.join(perfDir, 'browser-render-tracker.js');
  await fs.writeFile(browserUtilPath, createRenderTimeMeasurement());
  
  // Create test utilities
  const testUtilsDir = path.join(process.cwd(), 'tests/helpers');
  const testUtilPath = path.join(testUtilsDir, 'render-time-utils.ts');
  await fs.writeFile(testUtilPath, createTestRenderUtils());
  
  // Create documentation
  const docPath = path.join(process.cwd(), 'docs/performance-monitoring.md');
  const documentation = `# Performance Monitoring Infrastructure

## Overview
This document describes the performance monitoring tools set up for the CSS architecture refactor.

## Tools Available

### 1. Bundle Size Tracker
- **Location**: \`scripts/performance/bundle-size-tracker.js\`
- **Usage**: \`node scripts/performance/bundle-size-tracker.js\`
- **Purpose**: Monitors CSS and JS bundle sizes, ensures chunks stay under 500KB

### 2. Theme Switching Performance
- **Location**: \`scripts/performance/theme-baseline.js\`
- **Usage**: \`node scripts/performance/theme-baseline.js\`
- **Purpose**: Measures theme switching performance baseline

### 3. Browser Render Tracker
- **Location**: \`scripts/performance/browser-render-tracker.js\`
- **Usage**: Load in browser console for real-time performance monitoring
- **Purpose**: Measures actual render times in browser environment

### 4. Test Render Utilities
- **Location**: \`tests/helpers/render-time-utils.ts\`
- **Usage**: Import in test files for performance assertions
- **Purpose**: Automated performance testing in CI/CD

## Usage Examples

### Browser Console
\`\`\`javascript
// Load the tracker
// Then use:
const measurement = window.RenderTimeTracker.start('My Component');
// ... trigger render ...
window.RenderTimeTracker.end(measurement);
\`\`\`

### Test Environment
\`\`\`typescript
import { TestRenderTracker, expectThemeSwitchTime } from '../helpers/render-time-utils';

const tracker = new TestRenderTracker();
const measurement = await tracker.measureThemeSwitch(() => setTheme('dark'));
expectThemeSwitchTime(measurement); // Asserts < 100ms
\`\`\`

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
`;

  await fs.writeFile(docPath, documentation);
  
  console.log('✅ Render time tracking infrastructure created:');
  console.log(`  📄 Browser tracker: ${path.basename(browserUtilPath)}`);
  console.log(`  🧪 Test utilities: ${path.basename(testUtilPath)}`);
  console.log(`  📚 Documentation: ${path.basename(docPath)}`);
  
  return {
    browserUtilPath,
    testUtilPath,
    docPath
  };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupRenderTimeTracking().catch(console.error);
}

export { setupRenderTimeTracking, createRenderTimeMeasurement, createTestRenderUtils };