import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
    },
    projects: [
      {
        test: {
          name: 'core',
          root: './packages/core',
          include: ['src/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'western',
          root: './packages/western',
          include: ['src/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
