// =============================================================================
// DSAV-CQRSES Architecture Evaluator — Default Complexity Data
// =============================================================================
// Consolidated from docs/DSAV-CQRSES/classificator/data/*.js
// Each component contains activities with design and realization complexity
// values used by the fuzzy-logic classificator.

import type { Component } from '../lib/classification/types'

// -----------------------------------------------------------------------------
// Classical CQRS — Components
// -----------------------------------------------------------------------------

export const DEFAULT_CLASSICAL_CQRS_COMPONENTS: Component[] = [
  // --- Create (Development) ---
  {
    name: 'Створення (Розроблення)',
    activities: [
      { name: 'Формування команди', designComplexity: 6, realizationComplexity: 3.67 },
      { name: 'Валідація команди', designComplexity: 4, realizationComplexity: 3.5 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.83 },
      { name: 'Створення агрегату', designComplexity: 3, realizationComplexity: 13.67 },
      { name: 'Збереження агрегату', designComplexity: 10, realizationComplexity: 7 },
      { name: 'Публікація подій', designComplexity: 4, realizationComplexity: 2.17 }
    ]
  },
  // --- Create (Modification) ---
  {
    name: 'Створення (Модифікація)',
    activities: [
      { name: 'Формування команди', designComplexity: 2, realizationComplexity: 3.67 },
      { name: 'Валідація команди', designComplexity: 1, realizationComplexity: 3.5 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.83 },
      { name: 'Створення агрегату', designComplexity: 3, realizationComplexity: 13.67 },
      { name: 'Збереження агрегату', designComplexity: 0, realizationComplexity: 7 },
      { name: 'Публікація подій', designComplexity: 0, realizationComplexity: 2.17 }
    ]
  },
  // --- Update (Development) ---
  {
    name: 'Оновлення (Розроблення)',
    activities: [
      { name: 'Формування команди', designComplexity: 6, realizationComplexity: 3.32 },
      { name: 'Валідація команди', designComplexity: 4, realizationComplexity: 3.1 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.68 },
      { name: 'Отримання агрегату', designComplexity: 30, realizationComplexity: 12.9 },
      { name: 'Оновлення стану агрегату', designComplexity: 6, realizationComplexity: 10.39 },
      { name: 'Збереження агрегату', designComplexity: 24, realizationComplexity: 5.74 },
      { name: 'Публікація подій', designComplexity: 4, realizationComplexity: 1.68 }
    ]
  },
  // --- Update (Modification) ---
  {
    name: 'Оновлення (Модифікація)',
    activities: [
      { name: 'Формування команди', designComplexity: 2, realizationComplexity: 3.32 },
      { name: 'Валідація команди', designComplexity: 1, realizationComplexity: 3.1 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.68 },
      { name: 'Отримання агрегату', designComplexity: 10, realizationComplexity: 12.9 },
      { name: 'Оновлення стану агрегату', designComplexity: 6, realizationComplexity: 10.39 },
      { name: 'Збереження агрегату', designComplexity: 6, realizationComplexity: 5.74 },
      { name: 'Публікація подій', designComplexity: 0, realizationComplexity: 1.68 }
    ]
  },
  // --- Eventual Consistency (Development) ---
  {
    name: 'Досягнення узгодженості (Розроблення)',
    activities: [
      { name: 'Маршрутизація події', designComplexity: 3, realizationComplexity: 1.91 },
      { name: 'Опрацювання події', designComplexity: 26, realizationComplexity: 17.18 },
      { name: 'Надсилання сповіщень', designComplexity: 4, realizationComplexity: 2.82 }
    ]
  },
  // --- Eventual Consistency (Modification) ---
  {
    name: 'Досягнення узгодженості (Модифікація)',
    activities: [
      { name: 'Маршрутизація події', designComplexity: 1, realizationComplexity: 1.91 },
      { name: 'Опрацювання події', designComplexity: 5, realizationComplexity: 17.18 },
      { name: 'Надсилання сповіщень', designComplexity: 2, realizationComplexity: 2.82 }
    ]
  },
  // --- Query (Development) ---
  {
    name: 'Запит на читання (Розроблення)',
    activities: [
      { name: 'Формування запиту', designComplexity: 6, realizationComplexity: 2.83 },
      { name: 'Валідація запиту', designComplexity: 4, realizationComplexity: 3.83 },
      { name: 'Отримання проєкції', designComplexity: 8, realizationComplexity: 8.67 },
      { name: 'Перетворення проєкції на DTO', designComplexity: 2, realizationComplexity: 3 }
    ]
  },
  // --- Query (Modification) ---
  {
    name: 'Запит на читання (Модифікація)',
    activities: [
      { name: 'Формування запиту', designComplexity: 2, realizationComplexity: 2.83 },
      { name: 'Валідація запиту', designComplexity: 1, realizationComplexity: 3.83 },
      { name: 'Отримання проєкції', designComplexity: 4, realizationComplexity: 8.67 },
      { name: 'Перетворення проєкції на DTO', designComplexity: 2, realizationComplexity: 3 }
    ]
  },
  // --- Projection Rebuild (Development) ---
  {
    name: 'Перебудова проєкцій (Розроблення)',
    activities: [
      { name: 'Опрацювання запиту', designComplexity: 7, realizationComplexity: 4 },
      { name: 'Отримання інформації про проєкцію', designComplexity: 4, realizationComplexity: 2.29 },
      { name: 'Отримання знімка', designComplexity: 4, realizationComplexity: 5.86 },
      { name: 'Отримання подій', designComplexity: 4, realizationComplexity: 5 },
      { name: 'Побудова проєкції', designComplexity: 24, realizationComplexity: 36.43 },
      { name: 'Оновлення проєкції в базі даних', designComplexity: 10, realizationComplexity: 4.86 }
    ]
  },
  // --- Projection Rebuild (Modification) ---
  {
    name: 'Перебудова проєкцій (Модифікація)',
    activities: [
      { name: 'Опрацювання запиту', designComplexity: 1, realizationComplexity: 4 },
      { name: 'Отримання інформації про проєкцію', designComplexity: 4, realizationComplexity: 2.29 },
      { name: 'Отримання знімка', designComplexity: 0, realizationComplexity: 5.86 },
      { name: 'Отримання подій', designComplexity: 0, realizationComplexity: 5 },
      { name: 'Побудова проєкції', designComplexity: 12, realizationComplexity: 36.43 },
      { name: 'Оновлення проєкції в базі даних', designComplexity: 0, realizationComplexity: 4.86 }
    ]
  },
  // --- Change Event Types ---
  {
    name: 'Оновлення версії типу подій',
    activities: [
      { name: 'Створення сховища подій', designComplexity: 1, realizationComplexity: 12 },
      { name: 'Додавання нової версії типу подій', designComplexity: 1, realizationComplexity: 13 },
      { name: 'Реалізація функції трансформації', designComplexity: 2, realizationComplexity: 15 },
      { name: 'Запуск міграції даних', designComplexity: 3, realizationComplexity: 4 },
      { name: 'Перебудова проєкцій', designComplexity: 3, realizationComplexity: 16 },
      { name: 'Тестування', designComplexity: 2, realizationComplexity: 18 }
    ]
  },
  // --- Data Removing ---
  {
    name: 'Видалення даних користувача (GDPR)',
    activities: [
      { name: 'Створення сховища подій', designComplexity: 1, realizationComplexity: 12 },
      { name: 'Реалізація функції трансформації', designComplexity: 2, realizationComplexity: 11 },
      { name: 'Запуск міграції даних', designComplexity: 3, realizationComplexity: 4 },
      { name: 'Перебудова проєкцій', designComplexity: 3, realizationComplexity: 16 },
      { name: 'Тестування', designComplexity: 2, realizationComplexity: 8 }
    ]
  }
]

// -----------------------------------------------------------------------------
// mCQRS — Components
// -----------------------------------------------------------------------------

export const DEFAULT_MCQRS_COMPONENTS: Component[] = [
  // --- Create (Development) ---
  {
    name: 'Створення (Розроблення)',
    activities: [
      { name: 'Формування команди', designComplexity: 6, realizationComplexity: 3 },
      { name: 'Валідація команди', designComplexity: 4, realizationComplexity: 1.83 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.33 },
      { name: 'Створення агрегату', designComplexity: 3, realizationComplexity: 8 },
      { name: 'Збереження агрегату', designComplexity: 18, realizationComplexity: 2.67 },
      { name: 'Публікація подій', designComplexity: 4, realizationComplexity: 1.17 }
    ]
  },
  // --- Create (Modification) ---
  {
    name: 'Створення (Модифікація)',
    activities: [
      { name: 'Формування команди', designComplexity: 2, realizationComplexity: 3 },
      { name: 'Валідація команди', designComplexity: 1, realizationComplexity: 1.83 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.33 },
      { name: 'Створення агрегату', designComplexity: 3, realizationComplexity: 8 },
      { name: 'Збереження агрегату', designComplexity: 0, realizationComplexity: 2.67 },
      { name: 'Публікація подій', designComplexity: 0, realizationComplexity: 1.17 }
    ]
  },
  // --- Update (Development) ---
  {
    name: 'Оновлення (Розроблення)',
    activities: [
      { name: 'Формування команди', designComplexity: 6, realizationComplexity: 3 },
      { name: 'Валідація команди', designComplexity: 4, realizationComplexity: 3.03 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.26 },
      { name: 'Отримання агрегату', designComplexity: 14, realizationComplexity: 3.71 },
      { name: 'Оновлення стану агрегату', designComplexity: 6, realizationComplexity: 10.19 },
      { name: 'Збереження агрегату', designComplexity: 18, realizationComplexity: 4 },
      { name: 'Публікація подій', designComplexity: 4, realizationComplexity: 1.19 }
    ]
  },
  // --- Update (Modification) ---
  {
    name: 'Оновлення (Модифікація)',
    activities: [
      { name: 'Формування команди', designComplexity: 2, realizationComplexity: 3 },
      { name: 'Валідація команди', designComplexity: 1, realizationComplexity: 3.03 },
      { name: 'Маршрутизація команди', designComplexity: 1, realizationComplexity: 1.26 },
      { name: 'Отримання агрегату', designComplexity: 4, realizationComplexity: 3.71 },
      { name: 'Оновлення стану агрегату', designComplexity: 6, realizationComplexity: 10.19 },
      { name: 'Збереження агрегату', designComplexity: 0, realizationComplexity: 4 },
      { name: 'Публікація подій', designComplexity: 0, realizationComplexity: 1.19 }
    ]
  },
  // --- Eventual Consistency (Development) ---
  {
    name: 'Досягнення узгодженості (Розроблення)',
    activities: [
      { name: 'Маршрутизація події', designComplexity: 3, realizationComplexity: 1.3 },
      { name: 'Опрацювання події', designComplexity: 18, realizationComplexity: 11.7 },
      { name: 'Надсилання сповіщень', designComplexity: 4, realizationComplexity: 2.21 }
    ]
  },
  // --- Eventual Consistency (Modification) ---
  {
    name: 'Досягнення узгодженості (Модифікація)',
    activities: [
      { name: 'Маршрутизація події', designComplexity: 1, realizationComplexity: 1.3 },
      { name: 'Опрацювання події', designComplexity: 4, realizationComplexity: 11.7 },
      { name: 'Надсилання сповіщень', designComplexity: 2, realizationComplexity: 2.21 }
    ]
  },
  // --- Query (Development) ---
  {
    name: 'Запит на читання (Розроблення)',
    activities: [
      { name: 'Формування запиту', designComplexity: 6, realizationComplexity: 2.33 },
      { name: 'Валідація запиту', designComplexity: 4, realizationComplexity: 2.92 },
      { name: 'Отримання проєкції', designComplexity: 8, realizationComplexity: 7.42 },
      { name: 'Перетворення проєкції на DTO', designComplexity: 2, realizationComplexity: 3.42 }
    ]
  },
  // --- Query (Modification) ---
  {
    name: 'Запит на читання (Модифікація)',
    activities: [
      { name: 'Формування запиту', designComplexity: 2, realizationComplexity: 2.33 },
      { name: 'Валідація запиту', designComplexity: 1, realizationComplexity: 2.92 },
      { name: 'Отримання проєкції', designComplexity: 4, realizationComplexity: 7.42 },
      { name: 'Перетворення проєкції на DTO', designComplexity: 2, realizationComplexity: 3.42 }
    ]
  },
  // --- Projection Rebuild (Development) ---
  {
    name: 'Перебудова проєкцій (Розроблення)',
    activities: [
      { name: 'Опрацювання запиту', designComplexity: 7, realizationComplexity: 4.43 },
      { name: 'Отримання знімка', designComplexity: 6, realizationComplexity: 6.57 },
      { name: 'Побудова проєкції', designComplexity: 4, realizationComplexity: 19.29 },
      { name: 'Оновлення проєкції в базі даних', designComplexity: 10, realizationComplexity: 4.14 }
    ]
  },
  // --- Projection Rebuild (Modification) ---
  {
    name: 'Перебудова проєкцій (Модифікація)',
    activities: [
      { name: 'Опрацювання запиту', designComplexity: 1, realizationComplexity: 4.43 },
      { name: 'Отримання знімка', designComplexity: 2, realizationComplexity: 6.57 },
      { name: 'Побудова проєкції', designComplexity: 2, realizationComplexity: 19.29 },
      { name: 'Оновлення проєкції в базі даних', designComplexity: 0, realizationComplexity: 4.14 }
    ]
  },
  // --- Change Event Types ---
  {
    name: 'Оновлення версії типу подій',
    activities: [
      { name: 'Оновлення версії типу подій у знімку', designComplexity: 2, realizationComplexity: 8 },
      { name: 'Перебудова проєкцій', designComplexity: 1, realizationComplexity: 5 },
      { name: 'Тестування', designComplexity: 2, realizationComplexity: 7 }
    ]
  },
  // --- Data Removing ---
  {
    name: 'Видалення даних користувача (GDPR)',
    activities: [
      { name: 'Анонімізація даних у знімку', designComplexity: 1, realizationComplexity: 3 },
      { name: 'Перебудова проєкцій', designComplexity: 1, realizationComplexity: 1 },
      { name: 'Анонімізація даних у сховищі подій', designComplexity: 1, realizationComplexity: 4 },
      { name: 'Тестування', designComplexity: 1, realizationComplexity: 3 }
    ]
  }
]

// -----------------------------------------------------------------------------
// Combined dataset — both architectures
// -----------------------------------------------------------------------------
// The Parameters Assessment page seeds its complexity table with every
// component from both architectures. Names are prefixed with the architecture
// label so the two sets stay distinguishable (and unique) in a single list.

export const CLASSICAL_CQRS_LABEL = 'Classical CQRS'
export const MCQRS_LABEL = 'mCQRS'

function withArchitecturePrefix(label: string, components: Component[]): Component[] {
  return components.map((component) => ({
    ...component,
    name: `${label} — ${component.name}`,
    activities: component.activities.map((activity) => ({ ...activity }))
  }))
}

export const DEFAULT_COMPLEXITY_COMPONENTS: Component[] = [
  ...withArchitecturePrefix(CLASSICAL_CQRS_LABEL, DEFAULT_CLASSICAL_CQRS_COMPONENTS),
  ...withArchitecturePrefix(MCQRS_LABEL, DEFAULT_MCQRS_COMPONENTS)
]
