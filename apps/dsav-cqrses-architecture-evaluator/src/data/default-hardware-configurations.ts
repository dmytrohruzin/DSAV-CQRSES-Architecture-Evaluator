// =============================================================================
// Default Hardware Configurations per Variation
// =============================================================================
// Numbers taken from Table 4 of the experimental dataset: yearly price (USD)
// plus measured values for each SLA parameter on six AWS EC2 instance types.

import type { VariationHardwareData } from '../lib/variation-selection/types'

interface RawHardwareConfig {
  name: string
  price: number
  errorRatePct: number
  p95Queries: number
  p95CreateCommands: number
  p95UpdateCommands: number
  p95ConsistencyAchievement: number
}

function toConfig(prefix: string, raw: RawHardwareConfig) {
  return {
    id: `${prefix}-${raw.name}`,
    name: raw.name,
    pricePerMonthUsd: raw.price,
    slaValues: {
      errorRatePct: raw.errorRatePct,
      p95Queries: raw.p95Queries,
      p95CreateCommands: raw.p95CreateCommands,
      p95UpdateCommands: raw.p95UpdateCommands,
      p95ConsistencyAchievement: raw.p95ConsistencyAchievement
    }
  }
}

const MCQRS_HARDWARE: RawHardwareConfig[] = [
  {
    name: 'm7i-gp3',
    price: 97.67,
    errorRatePct: 0.01,
    p95Queries: 9.07,
    p95CreateCommands: 18.03,
    p95UpdateCommands: 20.31,
    p95ConsistencyAchievement: 34.36
  },
  {
    name: 'm7i-io2',
    price: 209.95,
    errorRatePct: 0.01,
    p95Queries: 5.54,
    p95CreateCommands: 12.74,
    p95UpdateCommands: 14.58,
    p95ConsistencyAchievement: 23.2
  },
  {
    name: 'm7a-gp3',
    price: 110.89,
    errorRatePct: 0.02,
    p95Queries: 3.13,
    p95CreateCommands: 8.3,
    p95UpdateCommands: 8.3,
    p95ConsistencyAchievement: 14.43
  },
  {
    name: 'm7a-io2',
    price: 223.17,
    errorRatePct: 0.01,
    p95Queries: 2.25,
    p95CreateCommands: 5.65,
    p95UpdateCommands: 6.02,
    p95ConsistencyAchievement: 10.2
  },
  {
    name: 'm7g-gp3',
    price: 80.91,
    errorRatePct: 2.77,
    p95Queries: 6267.1,
    p95CreateCommands: 5528.47,
    p95UpdateCommands: 6427.51,
    p95ConsistencyAchievement: 6442.18
  },
  {
    name: 'm7g-io2',
    price: 193.19,
    errorRatePct: 0.16,
    p95Queries: 376.1,
    p95CreateCommands: 353.92,
    p95UpdateCommands: 534.29,
    p95ConsistencyAchievement: 677.06
  }
]

const CLASSICAL_CQRS_HARDWARE: RawHardwareConfig[] = [
  {
    name: 'm7i-gp3',
    price: 97.67,
    errorRatePct: 0.0,
    p95Queries: 6.72,
    p95CreateCommands: 10.27,
    p95UpdateCommands: 14.77,
    p95ConsistencyAchievement: 25.84
  },
  {
    name: 'm7i-io2',
    price: 209.95,
    errorRatePct: 0.01,
    p95Queries: 5.87,
    p95CreateCommands: 8.23,
    p95UpdateCommands: 12.45,
    p95ConsistencyAchievement: 21.79
  },
  {
    name: 'm7a-gp3',
    price: 110.89,
    errorRatePct: 0.0,
    p95Queries: 2.62,
    p95CreateCommands: 4.84,
    p95UpdateCommands: 6.78,
    p95ConsistencyAchievement: 11.79
  },
  {
    name: 'm7a-io2',
    price: 223.17,
    errorRatePct: 0.0,
    p95Queries: 2.44,
    p95CreateCommands: 4.26,
    p95UpdateCommands: 5.79,
    p95ConsistencyAchievement: 10.16
  },
  {
    name: 'm7g-gp3',
    price: 80.91,
    errorRatePct: 2.48,
    p95Queries: 5381.69,
    p95CreateCommands: 7896.22,
    p95UpdateCommands: 9517.94,
    p95ConsistencyAchievement: 8423.07
  },
  {
    name: 'm7g-io2',
    price: 193.19,
    errorRatePct: 0.35,
    p95Queries: 672.7,
    p95CreateCommands: 662.22,
    p95UpdateCommands: 1716.79,
    p95ConsistencyAchievement: 1625.26
  }
]

export const DEFAULT_HARDWARE_DATA: VariationHardwareData[] = [
  {
    variationName: 'Classical CQRS',
    configs: CLASSICAL_CQRS_HARDWARE.map((raw) => toConfig('classical', raw))
  },
  {
    variationName: 'mCQRS',
    configs: MCQRS_HARDWARE.map((raw) => toConfig('mcqrs', raw))
  }
]
