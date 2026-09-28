import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '../../test-utils'
import { NavTabs } from './nav-tabs'

// ---------------------------------------------------------------------------
// Mock Next.js Link component
// ---------------------------------------------------------------------------

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NavTabs', () => {
  afterEach(() => {
    cleanup()
  })

  it('should render a navigation element with correct aria-label', () => {
    // Arrange & Act
    render(<NavTabs />)

    // Assert
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument()
  })

  it('should render three tab links', () => {
    // Arrange & Act
    render(<NavTabs />)

    // Assert
    expect(screen.getByText('Parameters Assessment')).toBeInTheDocument()
    expect(screen.getByText('Variation Selection')).toBeInTheDocument()
    expect(screen.getByText('Migration Roadmap')).toBeInTheDocument()
  })

  it('should link to correct routes', () => {
    // Arrange & Act
    render(<NavTabs />)

    // Assert
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute('href', '/parameters-assessment')
    expect(links[1]).toHaveAttribute('href', '/variation-selection')
    expect(links[2]).toHaveAttribute('href', '/migration-roadmap')
  })
})
