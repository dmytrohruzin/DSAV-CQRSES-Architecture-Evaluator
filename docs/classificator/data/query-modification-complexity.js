export const mCQRSdesignComplexity = [
  { activityName: 'Create query', complexity: 2 },
  { activityName: 'Validate query', complexity: 1 },
  { activityName: 'Fetch projection', complexity: 4 },
  { activityName: `Map projection to DTO`, complexity: 2 }
]

export const classicalCQRSdesignComplexity = [
  { activityName: 'Create query', complexity: 2 },
  { activityName: 'Validate query', complexity: 1 },
  { activityName: 'Fetch projection', complexity: 4 },
  { activityName: `Map projection to DTO`, complexity: 2 }
]

export const mCQRSrealizationComplexity = [
  { activityName: 'Create query', complexity: 2.33 },
  { activityName: 'Validate query', complexity: 2.92 },
  { activityName: 'Fetch projection', complexity: 7.42 },
  { activityName: `Map projection to DTO`, complexity: 3.42 }
]

export const classicalCQRSrealizationComplexity = [
  { activityName: 'Create query', complexity: 2.83 },
  { activityName: 'Validate query', complexity: 3.83 },
  { activityName: 'Fetch projection', complexity: 8.67 },
  { activityName: `Map projection to DTO`, complexity: 3 }
]
