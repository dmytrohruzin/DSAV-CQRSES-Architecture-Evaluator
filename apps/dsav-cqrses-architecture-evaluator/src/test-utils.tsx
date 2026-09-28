import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { LanguageProvider } from './i18n/language-context'

/**
 * Custom render that wraps components with LanguageProvider.
 * All components that use `useLanguage()` require this wrapper.
 */
function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    ...options
  })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override the render export with our custom version
export { renderWithProviders as render }
