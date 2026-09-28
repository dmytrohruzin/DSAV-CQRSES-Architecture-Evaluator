import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '../../test-utils'
import { RelativeComplexityResults } from './relative-complexity-results'

describe('RelativeComplexityResults', () => {
  afterEach(cleanup)

  it('shows a placeholder when results are empty', () => {
    render(<RelativeComplexityResults results={[]} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders a row per variation with formatted rc', () => {
    render(
      <RelativeComplexityResults
        results={[
          { name: 'A', r: 53.38, rc: 1.5, isMin: false },
          { name: 'B', r: 46.62, rc: 1, isMin: true }
        ]}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('1.500')).toBeInTheDocument()
    expect(screen.getByText('1.000')).toBeInTheDocument()
  })

  it('marks the minimum-r row with a reference badge', () => {
    render(
      <RelativeComplexityResults
        results={[
          { name: 'A', r: 53.38, rc: 1.15, isMin: false },
          { name: 'B', r: 46.62, rc: 1, isMin: true }
        ]}
      />
    )
    expect(screen.getByText(/reference/i)).toBeInTheDocument()
  })
})
