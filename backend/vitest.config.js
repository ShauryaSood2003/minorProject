// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,  // allows using describe, it, expect without imports
    environment: 'node',  // or 'jsdom' if you're testing browser code
  },
});
