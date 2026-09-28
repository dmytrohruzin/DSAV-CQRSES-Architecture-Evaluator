// =============================================================================
// Default Quality Attributes
// =============================================================================
// 12 predefined complexity quality-attribute components (10 OQAC + 2 PSQAC),
// each producing exactly one metric key.

import type { QualityAttribute } from '../lib/variation-selection/types'

export const DEFAULT_QUALITY_ATTRIBUTES: QualityAttribute[] = [
  // ---------------------------------------------------------------------------
  // Complexity attributes — OQAC
  // ---------------------------------------------------------------------------
  {
    name: 'Розроблення команди створення',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'createDevelopment',
    weightCriterion: 'Кількість команд створення'
  },
  {
    name: 'Модифікація команди створення',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'createModification',
    weightCriterion: 'Кількість модифікованих команд створення за період моніторингу'
  },
  {
    name: 'Розроблення команди оновлення',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'updateDevelopment',
    weightCriterion: 'Кількість команд оновлення'
  },
  {
    name: 'Модифікація команди оновлення',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'updateModification',
    weightCriterion: 'Кількість модифікованих команд оновлення за період моніторингу'
  },
  {
    name: 'Розроблення процесу досягнення узгодженості',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'ecDevelopment',
    weightCriterion: 'Кількість обробників досягнення узгодженості'
  },
  {
    name: 'Модифікація процесу досягнення узгодженості',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'ecModification',
    weightCriterion: 'Кількість модифікованих обробників досягнення узгодженості за період моніторингу'
  },
  {
    name: 'Розроблення запиту на читання даних',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'queryDevelopment',
    weightCriterion: 'Кількість обробників запитів'
  },
  {
    name: 'Модифікація запиту на читання даних',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'queryModification',
    weightCriterion: 'Кількість модифікованих обробників запитів за період моніторингу'
  },
  {
    name: 'Розроблення процесу перебудови проєкцій',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'projRebuildDev',
    weightCriterion: 'Кількість перебудов проєкцій'
  },
  {
    name: 'Модифікація процесу перебудови проєкцій',
    type: 'complexity',
    componentType: 'OQAC',
    enabled: true,
    metricKey: 'projRebuildMod',
    weightCriterion: 'Кількість модифікованих перебудов проєкцій за період моніторингу'
  },

  // ---------------------------------------------------------------------------
  // Complexity attributes — PSQAC
  // ---------------------------------------------------------------------------
  {
    name: 'Еволюція типів подій',
    type: 'complexity',
    componentType: 'PSQAC',
    enabled: true,
    metricKey: 'changeEventTypes',
    weightCriterion: 'Кількість змін типів подій'
  },
  {
    name: 'Видалення даних користувача (GDPR)',
    type: 'complexity',
    componentType: 'PSQAC',
    enabled: true,
    metricKey: 'dataRemoving',
    weightCriterion: 'Кількість операцій видалення даних'
  }
]
