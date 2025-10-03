import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    // Removed tailwindcss - now using pure CSS architecture
    autoprefixer: {}, // Keep for vendor prefix support
    // Temporarily disable cssnano - using esbuild for CSS minification
    // ...(process.env.NODE_ENV === 'production' ? {
    //   cssnano: {
    //     preset: ['default', {
    //       discardComments: { removeAll: true },
    //       normalizeWhitespace: true,
    //       mergeLonghand: false,
    //       mergeRules: false,
    //     }]
    //   }
    // } : {})
  },
};