import { nextConfig } from '@dbbs/vitest-config/next'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  nextConfig,
  defineConfig({
    test: {
      setupFiles: ['./vitest.setup.ts'],
      coverage: {
        exclude: ['src/app/**/*', 'src/lib/**/types.ts']
      }
    }
  })
)
