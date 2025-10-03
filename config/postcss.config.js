import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    // Removed tailwindcss - now using pure CSS architecture
    autoprefixer: {}, // Keep for vendor prefix support
    // Add cssnano for CSS minification in production (more stable than esbuild for CSS)
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          // Configure cssnano to be less aggressive and avoid syntax issues
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          // Avoid aggressive optimizations that might cause issues
          mergeLonghand: false,
          mergeRules: false,
        }]
      }
    } : {})
  },
};