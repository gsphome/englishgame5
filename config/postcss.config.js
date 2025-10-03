import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    // Removed tailwindcss - now using pure CSS architecture
    autoprefixer: {}, // Keep for vendor prefix support
    // cssnano disabled - esbuild provides better CSS optimization for this project
  },
};