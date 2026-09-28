// Characterization fixtures for the fuzzy performance scoring currently
// implemented inside this component (scoreFuzzy / describeClass). These lock
// the exact scores and formula strings before the math moves to
// src/lib/performance — the same numbers must hold after the extraction.
import { describe, expect, it, vi } from 'vitest'

import type { PerformanceMetric, PerformanceScale } from '../../lib/performance/types'
import { render, screen } from '../../test-utils'
import { PerformanceEvaluation } from './performance-evaluation'

const DEFAULT_SCALE: PerformanceScale[] = [
  { threshold: 400, score: 1 },
  { threshold: 350, score: 2 },
  { threshold: 200, score: 3 },
  { threshold: 100, score: 4 },
  { threshold: 50, score: 5 }
]

function renderWithMetrics(metrics: PerformanceMetric[], scale: PerformanceScale[] = DEFAULT_SCALE) {
  render(<PerformanceEvaluation scale={scale} onScaleChange={vi.fn()} metrics={metrics} onMetricsChange={vi.fn()} />)
}

describe('fuzzy performance scoring — fixture values', () => {
  it('scores below the lowest threshold as the pure highest class', () => {
    renderWithMetrics([{ name: 'Read', responseTimeMs: 43 }])

    expect(screen.getByText('1 × 5 = 5.00')).toBeInTheDocument()
    expect(screen.getByText('5.00')).toBeInTheDocument()
  })

  it('scores above the highest threshold as the pure lowest class', () => {
    renderWithMetrics([{ name: 'Slow', responseTimeMs: 450 }])

    expect(screen.getByText('1 × 1 = 1.00')).toBeInTheDocument()
    expect(screen.getByText('1.00')).toBeInTheDocument()
  })

  it('scores a transition-zone value as the weighted combination (132 ms)', () => {
    renderWithMetrics([{ name: 'Write', responseTimeMs: 132 }])

    expect(screen.getByText('4 × 0.68 + 3 × 0.32 = 3.68')).toBeInTheDocument()
    expect(screen.getByText('3.68')).toBeInTheDocument()
  })

  it('weights the transition midpoint evenly (150 ms)', () => {
    renderWithMetrics([{ name: 'Mid', responseTimeMs: 150 }])

    expect(screen.getByText('4 × 0.50 + 3 × 0.50 = 3.50')).toBeInTheDocument()
    expect(screen.getByText('3.50')).toBeInTheDocument()
  })

  it('scores a value exactly on a threshold as the pure class of that threshold', () => {
    renderWithMetrics([{ name: 'Edge', responseTimeMs: 200 }])

    expect(screen.getByText('3 × 1.00 + 2 × 0.00 = 3.00')).toBeInTheDocument()
    expect(screen.getByText('3.00')).toBeInTheDocument()
  })

  it('returns the lone level score for a single-level scale', () => {
    renderWithMetrics([{ name: 'Only', responseTimeMs: 10 }], [{ threshold: 100, score: 2 }])

    expect(screen.getByText('1 × 2 = 2.00')).toBeInTheDocument()
    expect(screen.getByText('2.00')).toBeInTheDocument()
  })
})
