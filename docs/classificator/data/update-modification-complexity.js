export const mCQRSdesignComplexity = [
  { activityName: 'Create command', complexity: 2 },
  { activityName: 'Validate command', complexity: 1 },
  { activityName: 'Route command', complexity: 1 },
  { activityName: 'Fetch aggregate', complexity: 4 },
  { activityName: `Update aggregate’s state`, complexity: 6 },
  { activityName: 'Save aggregate', complexity: 0 },
  { activityName: 'Dispatch events', complexity: 0 }
]

export const classicalCQRSdesignComplexity = [
  { activityName: 'Create command', complexity: 2 },
  { activityName: 'Validate command', complexity: 1 },
  { activityName: 'Route command', complexity: 1 },
  { activityName: 'Fetch aggregate', complexity: 10 },
  { activityName: `Update aggregate’s state`, complexity: 6 },
  { activityName: 'Save aggregate', complexity: 6 },
  { activityName: 'Dispatch events', complexity: 0 }
]

export const mCQRSrealizationComplexity = [
  { activityName: 'Create command', complexity: 3 },
  { activityName: 'Validate command', complexity: 3.03 },
  { activityName: 'Route command', complexity: 1.26 },
  { activityName: 'Fetch aggregate', complexity: 3.71 },
  { activityName: `Update aggregate’s state`, complexity: 10.19 },
  { activityName: 'Save aggregate', complexity: 4 },
  { activityName: 'Dispatch events', complexity: 1.19 }
]

export const classicalCQRSrealizationComplexity = [
  { activityName: 'Create command', complexity: 3.32 },
  { activityName: 'Validate command', complexity: 3.1 },
  { activityName: 'Route command', complexity: 1.68 },
  { activityName: 'Fetch aggregate', complexity: 12.9 },
  { activityName: `Update aggregate’s state`, complexity: 10.39 },
  { activityName: 'Save aggregate', complexity: 5.74 },
  { activityName: 'Dispatch events', complexity: 1.68 }
]
