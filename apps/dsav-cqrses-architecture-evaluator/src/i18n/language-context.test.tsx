import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider, useLanguage } from './language-context'

// ---------------------------------------------------------------------------
// Test helper component that exercises the context API
// ---------------------------------------------------------------------------

function TestConsumer() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="translated">{t('common.appTitle')}</span>
      <button type="button" onClick={() => setLocale('ua')}>
        Switch to UA
      </button>
      <button type="button" onClick={() => setLocale('en')}>
        Switch to EN
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  describe('LanguageProvider', () => {
    it('should default to English locale', () => {
      // Arrange & Act
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      )

      // Assert
      expect(screen.getByTestId('locale')).toHaveTextContent('en')
    })

    it('should translate using the current locale', () => {
      // Arrange & Act
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      )

      // Assert
      expect(screen.getByTestId('translated')).toHaveTextContent('DSAV-CQRSES')
    })

    it('should switch locale when setLocale is called', () => {
      // Arrange
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      )

      // Act
      fireEvent.click(screen.getByText('Switch to UA'))

      // Assert
      expect(screen.getByTestId('locale')).toHaveTextContent('ua')
    })

    it('should persist locale to localStorage', () => {
      // Arrange
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      )

      // Act
      fireEvent.click(screen.getByText('Switch to UA'))

      // Assert
      expect(localStorage.getItem('dsav-locale')).toBe('ua')
    })

    it('should read stored locale from localStorage', () => {
      // Arrange
      localStorage.setItem('dsav-locale', 'ua')

      // Act
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      )

      // Assert
      expect(screen.getByTestId('locale')).toHaveTextContent('ua')
    })

    it('should default to en when localStorage has invalid value', () => {
      // Arrange
      localStorage.setItem('dsav-locale', 'invalid')

      // Act
      render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      )

      // Assert
      expect(screen.getByTestId('locale')).toHaveTextContent('en')
    })
  })

  describe('useLanguage', () => {
    it('should throw when used outside LanguageProvider', () => {
      // Arrange — suppress console.error from React error boundary
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act & Assert
      expect(() => render(<TestConsumer />)).toThrow('useLanguage must be used within a LanguageProvider')

      spy.mockRestore()
    })
  })
})
