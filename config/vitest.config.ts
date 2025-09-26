import { defineConfig } from 'vitest/config';

import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: { 
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, '../tests/setup.ts')],
    // CSS testing support
    css: {
      modules: {
        classNameStrategy: 'stable'
      }
    },
    // Environment configuration for CSS testing
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Thresholds para mantener calidad - ajustados a valores realistas
      thresholds: {
        global: {
          branches: 35,
          functions: 35,
          lines: 35,
          statements: 35
        }
      },
      exclude: [
        'node_modules/',
        'tests/',
        'config/',
        'scripts/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        // Exclude CSS files from coverage (they're tested differently)
        '**/*.css'
      ],
      // Incluir solo src/ para coverage más preciso
      include: ['src/**/*.{ts,tsx}'],
      // Reportar archivos no cubiertos
      all: true
    },
    // Test patterns for CSS-specific tests
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/unit/styles/**/*.{test,spec}.{js,ts}',
      'tests/integration/css/**/*.{test,spec}.{js,ts}',
      'tests/integration/performance/**/*.{test,spec}.{js,ts}'
    ]
  }
});