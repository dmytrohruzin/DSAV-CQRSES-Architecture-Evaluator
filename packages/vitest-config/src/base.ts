import { defineConfig } from 'vitest/config'

/**
 * Shared base Vitest configuration.
 * All packages extend this config.
 */
export const baseConfig = defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Barrels + bootstrap entrypoints have no unit-testable logic
      // and are exercised via integration/e2e instead.
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/index.ts',
        'src/**/main.ts'
      ],
      reporter: ['text', 'lcov', 'json-summary'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
})
