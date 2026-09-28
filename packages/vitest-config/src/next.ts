import react from '@vitejs/plugin-react'
import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from './base.ts'

/**
 * Next.js config.
 * Uses jsdom environment and @vitejs/plugin-react for automatic JSX transform.
 */
export const nextConfig = mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      exclude: ['node_modules', '.next', 'e2e']
    }
  })
)
