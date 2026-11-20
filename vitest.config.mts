import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    server: {
      deps: {
        inline: ['next-intl'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      'server-only': path.resolve(import.meta.dirname, './tests/mocks/server-only.ts'),
      'next/navigation': path.resolve(import.meta.dirname, './tests/mocks/next-navigation.ts'),
    },
  },
});
