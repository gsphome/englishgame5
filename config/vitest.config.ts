import { defineConfig } from 'vitest/config';

import { resolve } from 'path';

export default defineConfig({
  test: { 
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, '../tests/setup.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Thresholds para mantener calidad
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
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
        '**/vitest.config.ts'
      ],
      // Incluir solo src/ para coverage más preciso
      include: ['src/**/*.{ts,tsx}'],
      // Reportar archivos no cubiertos
      all: true
    }
  }
});