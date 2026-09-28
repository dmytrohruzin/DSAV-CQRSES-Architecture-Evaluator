import react from '@vitejs/plugin-react'
import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from './base.ts'

/**
 * Shared React component library config.
 * Uses jsdom and @vitejs/plugin-react for automatic JSX transform.
 */
export const reactLibraryConfig = mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom'
    }
  })
)
