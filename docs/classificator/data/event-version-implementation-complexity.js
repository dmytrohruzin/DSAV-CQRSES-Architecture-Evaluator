export const mCQRSdesignComplexity = [
  { activityName: 'Update snapshot types', complexity: 2 },
  { activityName: 'Rebuild connected projections', complexity: 1 },
  { activityName: 'Test', complexity: 2 }
]

export const classicalCQRSdesignComplexity = [
  { activityName: 'Create new event store', complexity: 1 },
  { activityName: 'Specify new types', complexity: 1 },
  { activityName: 'Transformation function', complexity: 2 },
  { activityName: 'Run migration', complexity: 3 },
  { activityName: 'Rebuild all projections', complexity: 3 },
  { activityName: `Test`, complexity: 2 }
]

export const mCQRSrealizationComplexity = [
  { activityName: 'Update snapshot types', complexity: 8 },
  { activityName: 'Rebuild connected projections', complexity: 5 },
  { activityName: 'Test', complexity: 7 }
]

export const classicalCQRSrealizationComplexity = [
  { activityName: 'Create new event store', complexity: 12 },
  { activityName: 'Specify new types', complexity: 13 },
  { activityName: 'Transformation function', complexity: 15 },
  { activityName: 'Run migration', complexity: 4 },
  { activityName: 'Rebuild all projections', complexity: 16 },
  { activityName: `Test`, complexity: 18 }
]
