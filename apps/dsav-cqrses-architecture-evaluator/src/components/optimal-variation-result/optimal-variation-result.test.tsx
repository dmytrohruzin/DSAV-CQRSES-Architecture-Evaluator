import { afterEach, describe, expect, it } from 'vitest'
import type { OptimalResult } from '../../lib/variation-selection/types'
import { cleanup, render, screen } from '../../test-utils'
import { OptimalVariationResult } from './optimal-variation-result'

function row(overrides: Partial<OptimalResult>): OptimalResult {
  return {
    variationName: 'A',
    rc: 1,
    cheapestConfig: null,
    hardwarePrice: null,
    developmentCost: null,
    totalCost: null,
    isOptimal: false,
    slaUnmet: false,
    ...overrides
  }
}

describe('OptimalVariationResult', () => {
  afterEach(cleanup)

  it('shows a placeholder when there are no rows', () => {
    render(<OptimalVariationResult results={[]} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders the variation name, rc and hardware fields', () => {
    render(
      <OptimalVariationResult
        results={[
          row({
            variationName: 'Classical CQRS',
            rc: 1.5,
            cheapestConfig: { id: 'a', name: 'm7i-gp3', pricePerMonthUsd: 97.67, slaValues: {} },
            hardwarePrice: 97.67,
            developmentCost: 150000,
            totalCost: 150097.67
          })
        ]}
      />
    )
    expect(screen.getByText('Classical CQRS')).toBeInTheDocument()
    expect(screen.getByText('m7i-gp3')).toBeInTheDocument()
    expect(screen.getByText('1.500')).toBeInTheDocument()
  })

  it('marks the optimal row with a badge', () => {
    render(
      <OptimalVariationResult
        results={[
          row({ variationName: 'A', isOptimal: true, totalCost: 100 }),
          row({ variationName: 'B', totalCost: 200 })
        ]}
      />
    )
    expect(screen.getByText(/optimal/i)).toBeInTheDocument()
  })

  it('marks SLA-failing rows with an "SLA not met" badge and dashes the numeric cells', () => {
    render(
      <OptimalVariationResult
        results={[row({ variationName: 'X', slaUnmet: true, hardwarePrice: null, totalCost: null })]}
      />
    )
    expect(screen.getByText(/sla not met/i)).toBeInTheDocument()
  })
})
