
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
    
    console.log(`⏱️ ${measurement.label}: ${measurement.duration.toFixed(2)}ms`);
    return measurement;
  },
  
  /**
   * Measures theme switching time
   */
  async measureThemeSwitch(fromTheme, toTheme) {
    const measurement = this.start(`Theme switch: ${fromTheme} → ${toTheme}`);
    
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
    const measurement = this.start(`Component mount: ${componentSelector}`);
    
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
    a.download = `render-measurements-${Date.now()}.json`;
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
