export const mCQRSdesignComplexity = [
  { activityName: 'Create command', complexity: 2 },
  { activityName: 'Validate command', complexity: 1 },
  { activityName: 'Route command', complexity: 1 },
  { activityName: 'Create aggregate', complexity: 3 },
  { activityName: `Save aggregate`, complexity: 0 },
  { activityName: 'Dispatch events', complexity: 0 }
]

export const classicalCQRSdesignComplexity = [
  { activityName: 'Create command', complexity: 2 },
  { activityName: 'Validate command', complexity: 1 },
  { activityName: 'Route command', complexity: 1 },
  { activityName: 'Create aggregate', complexity: 3 },
  { activityName: `Save aggregate`, complexity: 0 },
  { activityName: 'Dispatch events', complexity: 0 }
]

export const mCQRSrealizationComplexity = [
  { activityName: 'Create command', complexity: 3 },
  { activityName: 'Validate command', complexity: 1.83 },
  { activityName: 'Route command', complexity: 1.33 },
  { activityName: 'Create aggregate', complexity: 8 },
  { activityName: `Save aggregate`, complexity: 2.67 },
  { activityName: 'Dispatch events', complexity: 1.17 }
]

export const classicalCQRSrealizationComplexity = [
  { activityName: 'Create command', complexity: 3.67 },
  { activityName: 'Validate command', complexity: 3.5 },
  { activityName: 'Route command', complexity: 1.83 },
  { activityName: 'Create aggregate', complexity: 13.67 },
  { activityName: `Save aggregate`, complexity: 7 },
  { activityName: 'Dispatch events', complexity: 2.17 }
]
