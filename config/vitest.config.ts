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
      ]
    }
  }
});