import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '../../test-utils'
import { LanguageSwitcher } from './language-switcher'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LanguageSwitcher', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render EN and UA buttons', () => {
    // Arrange & Act
    render(<LanguageSwitcher />)

    // Assert
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('UA')).toBeInTheDocument()
  })

  it('should mark EN as pressed by default', () => {
    // Arrange & Act
    render(<LanguageSwitcher />)

    // Assert
    expect(screen.getByText('EN')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('UA')).toHaveAttribute('aria-pressed', 'false')
  })

  it('should switch to UA when UA button is clicked', () => {
    // Arrange
    render(<LanguageSwitcher />)

    // Act
    fireEvent.click(screen.getByText('UA'))

    // Assert
    expect(screen.getByText('UA')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('EN')).toHaveAttribute('aria-pressed', 'false')
  })

  it('should switch back to EN when EN button is clicked after UA', () => {
    // Arrange
    render(<LanguageSwitcher />)

    // Act
    fireEvent.click(screen.getByText('UA'))
    fireEvent.click(screen.getByText('EN'))

    // Assert
    expect(screen.getByText('EN')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('UA')).toHaveAttribute('aria-pressed', 'false')
  })
})
