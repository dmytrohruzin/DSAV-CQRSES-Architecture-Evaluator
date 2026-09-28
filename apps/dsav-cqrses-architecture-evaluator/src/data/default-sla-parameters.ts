// =============================================================================
// Default SLA Parameters
// =============================================================================
// Preset SLA targets:
//  - p95 server response time for commands & queries ≤ 15 ms
//  - p95 time from command receipt to consistent system state ≤ 30 ms
//  - error rate < 0.1 %

import type { SlaParameter } from '../lib/variation-selection/types'

export const DEFAULT_SLA_PARAMETERS: SlaParameter[] = [
  {
    id: 'errorRatePct',
    name: 'Частка помилок',
    unit: '%',
    direction: 'less-better',
    slaThreshold: 0.1
  },
  {
    id: 'p95Queries',
    name: 'p95 Запити',
    unit: 'ms',
    direction: 'less-better',
    slaThreshold: 15
  },
  {
    id: 'p95CreateCommands',
    name: 'p95 Команди створення',
    unit: 'ms',
    direction: 'less-better',
    slaThreshold: 15
  },
  {
    id: 'p95UpdateCommands',
    name: 'p95 Команди оновлення',
    unit: 'ms',
    direction: 'less-better',
    slaThreshold: 15
  },
  {
    id: 'p95ConsistencyAchievement',
    name: 'p95 Досягнення узгодженості',
    unit: 'ms',
    direction: 'less-better',
    slaThreshold: 30
  }
]
