import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from './base.ts'

/**
 * Integration test config.
 * 300s timeout, sequential execution, passWithNoTests.
 * From dbbs-cvs pattern — prevents API rate limiting.
 * CI: use continue-on-error so API failures don't break build.
 */
export const integrationConfig = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      testTimeout: 300_000,
      hookTimeout: 60_000,
      maxConcurrency: 1,
      sequence: { concurrent: false },
      passWithNoTests: true,
      include: ['**/*.integration.{test,spec}.{ts,tsx}'],
      coverage: {
        enabled: false
      }
    }
  })
)
