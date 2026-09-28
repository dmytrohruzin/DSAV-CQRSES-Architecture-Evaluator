export const mCQRSdesignComplexity = [
  { activityName: 'Anonymize data in snapshot', complexity: 1 },
  { activityName: 'Rebuild connected projections', complexity: 1 },
  { activityName: 'Anonymize data in events', complexity: 1 },
  { activityName: 'Test', complexity: 1 }
]

export const classicalCQRSdesignComplexity = [
  { activityName: 'Create new event store', complexity: 1 },
  { activityName: 'Transformation function', complexity: 2 },
  { activityName: 'Run migration', complexity: 3 },
  { activityName: 'Rebuild all projections', complexity: 3 },
  { activityName: `Test`, complexity: 2 }
]

export const mCQRSrealizationComplexity = [
  { activityName: 'Anonymize data in snapshot', complexity: 3 },
  { activityName: 'Rebuild connected projections', complexity: 1 },
  { activityName: 'Anonymize data in events', complexity: 4 },
  { activityName: 'Test', complexity: 3 }
]

export const classicalCQRSrealizationComplexity = [
  { activityName: 'Create new event store', complexity: 12 },
  { activityName: 'Transformation function', complexity: 11 },
  { activityName: 'Run migration', complexity: 4 },
  { activityName: 'Rebuild all projections', complexity: 16 },
  { activityName: `Test`, complexity: 8 }
]
