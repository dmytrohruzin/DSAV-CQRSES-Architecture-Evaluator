import { describe, expect, it } from 'vitest'
import { computeMembershipSeries } from './membership'
import type { PerformanceScale } from './types'

const SCALE: PerformanceScale[] = [
  { threshold: 400, score: 1 },
  { threshold: 200, score: 3 },
  { threshold: 100, score: 4 }
]

describe('computeMembershipSeries', () => {
  it('returns empty arrays for fewer than two levels', () => {
    expect(computeMembershipSeries([])).toEqual({ xValues: [], series: [] })
    expect(computeMembershipSeries([{ threshold: 100, score: 1 }])).toEqual({ xValues: [], series: [] })
  })

  it('samples the axis up to 110% of the highest threshold', () => {
    const { xValues } = computeMembershipSeries(SCALE)

    expect(xValues[0]).toBe(0)
    expect(xValues[xValues.length - 1]).toBeLessThanOrEqual(440)
    expect(xValues[xValues.length - 1]).toBeGreaterThan(400)
  })

  it('returns one series per level in descending threshold order', () => {
    const { series } = computeMembershipSeries(SCALE)

    expect(series.map((s) => s.level.threshold)).toEqual([400, 200, 100])
  })

  it('gives the highest-threshold class full membership above its threshold', () => {
    const { xValues, series } = computeMembershipSeries(SCALE)
    const top = series[0]
    const idxAbove = xValues.findIndex((x) => x >= 400)

    expect(top?.values[idxAbove]).toBe(1)
  })

  it('gives the lowest-threshold class full membership below its threshold', () => {
    const { xValues, series } = computeMembershipSeries(SCALE)
    const bottom = series[series.length - 1]
    const idxBelow = xValues.findIndex((x) => x <= 100)

    expect(bottom?.values[idxBelow]).toBe(1)
  })

  it('peaks middle classes at their own threshold and fades to 0 at neighbours', () => {
    const { xValues, series } = computeMembershipSeries(SCALE)
    const middle = series[1]
    const atOwn = xValues.indexOf(200)
    const atUpper = xValues.indexOf(400)
    const atLower = xValues.indexOf(100)

    expect(middle?.values[atOwn]).toBe(1)
    expect(middle?.values[atUpper]).toBe(0)
    expect(middle?.values[atLower]).toBe(0)
  })
})
