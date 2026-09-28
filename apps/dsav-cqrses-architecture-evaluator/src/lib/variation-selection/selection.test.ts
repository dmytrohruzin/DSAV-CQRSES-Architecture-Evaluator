import { describe, expect, it } from 'vitest'

import { computeOptimalVariation, computeRelativeHostingPrice, pickCheapestConfigSatisfyingSla } from './selection'
import type { HardwareConfig, OptimalResult, SlaParameter, VariationHardwareData } from './types'

const SLA_LESS: SlaParameter = {
  id: 'p95',
  name: 'p95',
  unit: 'ms',
  direction: 'less-better',
  slaThreshold: 100
}
const SLA_MORE: SlaParameter = {
  id: 'throughput',
  name: 'throughput',
  unit: 'rps',
  direction: 'more-better',
  slaThreshold: 1000
}

function hw(id: string, price: number, slaValues: Record<string, number>): HardwareConfig {
  return { id, name: id, pricePerMonthUsd: price, slaValues }
}

describe('pickCheapestConfigSatisfyingSla', () => {
  it('returns null for empty config list', () => {
    expect(pickCheapestConfigSatisfyingSla([], [SLA_LESS])).toBeNull()
  })

  it('returns null when no config satisfies a less-better SLA', () => {
    const configs = [hw('a', 100, { p95: 150 }), hw('b', 200, { p95: 200 })]
    expect(pickCheapestConfigSatisfyingSla(configs, [SLA_LESS])).toBeNull()
  })

  it('returns the cheapest config satisfying a less-better SLA', () => {
    const configs = [hw('a', 100, { p95: 150 }), hw('b', 200, { p95: 80 }), hw('c', 150, { p95: 50 })]
    expect(pickCheapestConfigSatisfyingSla(configs, [SLA_LESS])?.id).toBe('c')
  })

  it('returns the cheapest config satisfying a more-better SLA', () => {
    const configs = [
      hw('a', 100, { throughput: 500 }),
      hw('b', 200, { throughput: 1500 }),
      hw('c', 300, { throughput: 2000 })
    ]
    expect(pickCheapestConfigSatisfyingSla(configs, [SLA_MORE])?.id).toBe('b')
  })

  it('requires all SLAs to be satisfied (multi-SLA case)', () => {
    const configs = [
      hw('a', 100, { p95: 80, throughput: 500 }),
      hw('b', 200, { p95: 200, throughput: 2000 }),
      hw('c', 150, { p95: 80, throughput: 1200 })
    ]
    expect(pickCheapestConfigSatisfyingSla(configs, [SLA_LESS, SLA_MORE])?.id).toBe('c')
  })

  it('excludes configs with missing SLA values', () => {
    const configs = [hw('a', 100, {}), hw('b', 200, { p95: 50 })]
    expect(pickCheapestConfigSatisfyingSla(configs, [SLA_LESS])?.id).toBe('b')
  })

  it('excludes configs with non-positive price', () => {
    const configs = [hw('a', 0, { p95: 50 }), hw('b', 200, { p95: 50 })]
    expect(pickCheapestConfigSatisfyingSla(configs, [SLA_LESS])?.id).toBe('b')
  })

  it('breaks ties on price by input order', () => {
    const configs = [hw('a', 100, { p95: 50 }), hw('b', 100, { p95: 50 })]
    expect(pickCheapestConfigSatisfyingSla(configs, [SLA_LESS])?.id).toBe('a')
  })

  it('returns the cheapest config when no SLA parameters are provided', () => {
    const configs = [hw('a', 100, {}), hw('b', 50, {})]
    expect(pickCheapestConfigSatisfyingSla(configs, [])?.id).toBe('b')
  })
})

describe('computeOptimalVariation', () => {
  const swp = 100_000

  const hwData: VariationHardwareData[] = [
    {
      variationName: 'A',
      configs: [hw('a-cheap', 100, { p95: 50 }), hw('a-fast', 300, { p95: 30 })]
    },
    {
      variationName: 'B',
      configs: [hw('b-only', 200, { p95: 80 })]
    },
    {
      variationName: 'C',
      configs: [hw('c-bad', 50, { p95: 500 })]
    }
  ]

  const rcs = [
    { name: 'A', r: 50, rc: 2.0, isMin: false },
    { name: 'B', r: 33.33, rc: 1.333, isMin: false },
    { name: 'C', r: 25, rc: 1.0, isMin: true }
  ]

  it('computes totalCost = swp · rc + cheapest price', () => {
    const result = computeOptimalVariation(rcs, hwData, [SLA_LESS], swp)
    expect(result[0]).toMatchObject({
      variationName: 'A',
      rc: 2.0,
      hardwarePrice: 100,
      developmentCost: 200_000,
      totalCost: 200_100,
      slaUnmet: false
    })
    expect(result[1]).toMatchObject({
      variationName: 'B',
      hardwarePrice: 200,
      developmentCost: 133_300,
      totalCost: 133_500,
      slaUnmet: false
    })
  })

  it('marks SLA-failing variations as unmet with null totalCost', () => {
    const result = computeOptimalVariation(rcs, hwData, [SLA_LESS], swp)
    const c = result[2]
    expect(c).toBeDefined()
    expect(c?.slaUnmet).toBe(true)
    expect(c?.cheapestConfig).toBeNull()
    expect(c?.totalCost).toBeNull()
    expect(c?.hardwarePrice).toBeNull()
    expect(c?.isOptimal).toBe(false)
  })

  it('flags the row with the minimum totalCost as isOptimal', () => {
    const result = computeOptimalVariation(rcs, hwData, [SLA_LESS], swp)
    const optimalRows = result.filter((r) => r.isOptimal)
    expect(optimalRows).toHaveLength(1)
    expect(optimalRows[0]?.variationName).toBe('B')
  })

  it('flags no row as optimal when every variation fails SLA', () => {
    const result = computeOptimalVariation(rcs, hwData, [{ ...SLA_LESS, slaThreshold: 0 }], swp)
    expect(result.every((r) => r.isOptimal === false)).toBe(true)
    expect(result.every((r) => r.slaUnmet)).toBe(true)
  })

  it('skips developmentCost when swp is NaN', () => {
    const result = computeOptimalVariation(rcs, hwData, [SLA_LESS], Number.NaN)
    expect(result[0]?.developmentCost).toBeNull()
    expect(result[0]?.totalCost).toBeNull()
  })

  it('returns a row with null fields for variations without a hardware block', () => {
    const result = computeOptimalVariation([{ name: 'X', r: 100, rc: 1, isMin: true }], [], [SLA_LESS], swp)
    expect(result[0]).toMatchObject({
      variationName: 'X',
      cheapestConfig: null,
      hardwarePrice: null,
      totalCost: null,
      slaUnmet: true
    })
  })

  it('returns empty array for empty input', () => {
    expect(computeOptimalVariation([], [], [], swp)).toEqual([])
  })
})

function optimalRow(overrides: Partial<OptimalResult>): OptimalResult {
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

describe('computeRelativeHostingPrice', () => {
  it('returns empty array for empty input', () => {
    expect(computeRelativeHostingPrice([])).toEqual([])
  })

  it('assigns pc = 1 to the cheapest variation and pc > 1 to others', () => {
    const result = computeRelativeHostingPrice([
      optimalRow({ variationName: 'A', hardwarePrice: 300 }),
      optimalRow({ variationName: 'B', hardwarePrice: 200 }),
      optimalRow({ variationName: 'C', hardwarePrice: 100 })
    ])
    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({ name: 'A', price: 300, pc: 3, isMin: false, slaUnmet: false })
    expect(result[1]).toMatchObject({ name: 'B', price: 200, pc: 2, isMin: false, slaUnmet: false })
    expect(result[2]).toMatchObject({ name: 'C', price: 100, pc: 1, isMin: true, slaUnmet: false })
  })

  it('marks only the first occurrence as min when there are ties', () => {
    const result = computeRelativeHostingPrice([
      optimalRow({ variationName: 'A', hardwarePrice: 100 }),
      optimalRow({ variationName: 'B', hardwarePrice: 100 }),
      optimalRow({ variationName: 'C', hardwarePrice: 200 })
    ])
    expect(result[0]?.isMin).toBe(true)
    expect(result[1]?.isMin).toBe(false)
    expect(result[1]?.pc).toBe(1)
    expect(result[2]?.pc).toBe(2)
  })

  it('returns null fields with slaUnmet=true for SLA-failing rows and ignores them when picking the min', () => {
    const result = computeRelativeHostingPrice([
      optimalRow({ variationName: 'A', hardwarePrice: 200 }),
      optimalRow({ variationName: 'B', hardwarePrice: null, slaUnmet: true }),
      optimalRow({ variationName: 'C', hardwarePrice: 400 })
    ])
    expect(result[0]).toMatchObject({ name: 'A', price: 200, pc: 1, isMin: true, slaUnmet: false })
    expect(result[1]).toMatchObject({ name: 'B', price: null, pc: null, isMin: false, slaUnmet: true })
    expect(result[2]).toMatchObject({ name: 'C', price: 400, pc: 2, isMin: false, slaUnmet: false })
  })

  it('returns all-null fields when every variation fails SLA', () => {
    const result = computeRelativeHostingPrice([
      optimalRow({ variationName: 'A', hardwarePrice: null, slaUnmet: true }),
      optimalRow({ variationName: 'B', hardwarePrice: null, slaUnmet: true })
    ])
    expect(result.every((r) => r.price === null && r.pc === null && !r.isMin && r.slaUnmet)).toBe(true)
  })
})
