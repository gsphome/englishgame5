
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
      `${label} time exceeded: ${measurement.duration.toFixed(2)}ms > ${maxTime}ms`
    );
  }
}

export function expectThemeSwitchTime(measurement, maxTime = 100) {
  expectRenderTime(measurement, maxTime, 'Theme switch');
}
