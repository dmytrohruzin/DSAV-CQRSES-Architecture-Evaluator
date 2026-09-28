import { describe, expect, it } from 'vitest'
import type { PerformanceScale } from '../../lib/performance/types'
import { buildAnnotations, buildChartData, buildClassLabels } from './chart'

const SCALE: PerformanceScale[] = [
  { threshold: 400, score: 1 },
  { threshold: 200, score: 3 },
  { threshold: 100, score: 4 }
]

describe('buildChartData', () => {
  it('returns empty labels and datasets for fewer than two levels', () => {
    expect(buildChartData([])).toEqual({ labels: [], datasets: [] })
    expect(buildChartData([{ threshold: 100, score: 1 }])).toEqual({ labels: [], datasets: [] })
  })

  it('builds one black-line dataset per level with chart props', () => {
    const { labels, datasets } = buildChartData(SCALE)

    expect(labels.length).toBeGreaterThan(0)
    expect(datasets).toHaveLength(3)
    expect(datasets[0]?.label).toBe('< 400 ms (score 1)')
    expect(datasets[0]).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: 'rgba(17, 24, 39, 0.9)',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0
    })
    // Every curve uses the same neutral colour, like the reference plot.
    expect(datasets.every((d) => d.borderColor === 'rgba(17, 24, 39, 0.9)')).toBe(true)
    expect(datasets[0]?.data).toHaveLength(labels.length)
  })
})

describe('buildClassLabels', () => {
  it('places one class-score label per level at the curve peaks', () => {
    const labels = buildClassLabels(SCALE, 400)

    expect(Object.keys(labels)).toEqual(['class-0', 'class-1', 'class-2'])
    // Highest threshold (lowest score) plateaus on the right.
    expect(labels['class-0']).toMatchObject({ type: 'label', content: '1', yValue: 1 })
    // Middle class peaks at its threshold.
    expect(labels['class-1']).toMatchObject({ type: 'label', content: '3', xValue: 200 })
    // Lowest threshold (highest score) plateaus to the left of its threshold.
    expect(labels['class-2']).toMatchObject({ type: 'label', content: '4', xValue: 50 })
  })

  it('returns nothing for fewer than two levels', () => {
    expect(buildClassLabels([{ threshold: 100, score: 1 }], 100)).toEqual({})
  })
})

describe('buildAnnotations', () => {
  const metrics = [
    { name: 'Read', responseTimeMs: 43 },
    { name: 'Write', responseTimeMs: 132 }
  ]

  it('drops a vertical guide to the time axis per visible metric', () => {
    const annotations = buildAnnotations(metrics, SCALE, 400)

    expect(annotations['metric-0']).toMatchObject({ type: 'line', xMin: 43, xMax: 43, yMin: 0, borderDash: [6, 3] })
    expect(annotations['metric-1']).toMatchObject({ type: 'line', xMin: 132, xMax: 132, yMin: 0 })
  })

  it('adds horizontal crossing guides labelled with membership coefficients', () => {
    const annotations = buildAnnotations([{ name: 'Write', responseTimeMs: 132 }], SCALE, 400)

    // 132 ms crosses the score-4 (0.68) and score-3 (0.32) curves.
    expect(annotations['metric-0-cross-0']).toMatchObject({ type: 'line', xMin: 0, xMax: 132 })
    const values = Object.keys(annotations)
      .filter((k) => k.startsWith('metric-0-cross-'))
      .map((k) => annotations[k]?.label?.content)
    expect(values).toEqual(['0.32', '0.68'])
  })

  it('omits metrics outside the visible axis', () => {
    const annotations = buildAnnotations([{ name: 'Slow', responseTimeMs: 500 }], SCALE, 400)
    expect(Object.keys(annotations)).toEqual([])
  })

  it('alternates label positions between start and end', () => {
    const annotations = buildAnnotations(metrics, SCALE, 400)

    expect(annotations['metric-0']?.label).toMatchObject({ position: 'start', content: 'Read: 43 ms' })
    expect(annotations['metric-1']?.label).toMatchObject({ position: 'end', content: 'Write: 132 ms' })
  })
})
