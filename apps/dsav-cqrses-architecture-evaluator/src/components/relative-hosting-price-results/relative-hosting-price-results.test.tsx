import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '../../test-utils'
import { RelativeHostingPriceResults } from './relative-hosting-price-results'

describe('RelativeHostingPriceResults', () => {
  afterEach(cleanup)

  it('shows a placeholder when results are empty', () => {
    render(<RelativeHostingPriceResults results={[]} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders price and pc per row and marks the cheapest as reference', () => {
    render(
      <RelativeHostingPriceResults
        results={[
          { name: 'A', price: 200, pc: 2, isMin: false, slaUnmet: false },
          { name: 'B', price: 100, pc: 1, isMin: true, slaUnmet: false }
        ]}
      />
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('200.00')).toBeInTheDocument()
    expect(screen.getByText('100.00')).toBeInTheDocument()
    expect(screen.getByText('2.000')).toBeInTheDocument()
    expect(screen.getByText('1.000')).toBeInTheDocument()
    expect(screen.getByText(/reference/i)).toBeInTheDocument()
  })

  it('renders dashes and SLA-not-met badge for unmet variations', () => {
    render(
      <RelativeHostingPriceResults results={[{ name: 'X', price: null, pc: null, isMin: false, slaUnmet: true }]} />
    )
    expect(screen.getByText(/sla not met/i)).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })
})
