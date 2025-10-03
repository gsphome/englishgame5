import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    // Removed tailwindcss - now using pure CSS architecture
    autoprefixer: {}, // Keep for vendor prefix support
    // Enable cssnano for superior CSS optimization in production
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          // Advanced CSS optimizations
          discardComments: { removeAll: true },
          normalizeWhitespace: true,
          // Enable safe optimizations for better compression
          mergeLonghand: true,
          mergeRules: true,
          // Advanced optimizations for better performance
          reduceIdents: true,
          discardUnused: true,
          minifySelectors: true,
          // Optimize CSS custom properties
          customProperties: false, // Keep CSS variables intact
          // Optimize media queries
          mergeMediaQueries: true,
        }]
      }
    } : {})
  },
};