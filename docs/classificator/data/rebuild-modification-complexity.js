export const mCQRSdesignComplexity = [
  { activityName: 'Process request', complexity: 1 },
  { activityName: 'Receive information about projection', complexity: 0 },
  { activityName: 'Fetch snapshot', complexity: 2 },
  { activityName: 'Fetch events', complexity: 0 },
  { activityName: `Build projection`, complexity: 2 },
  { activityName: 'Update the DB', complexity: 0 }
]

export const classicalCQRSdesignComplexity = [
  { activityName: 'Process request', complexity: 1 },
  { activityName: 'Receive information about projection', complexity: 4 },
  { activityName: 'Fetch snapshot', complexity: 0 },
  { activityName: 'Fetch events', complexity: 0 },
  { activityName: `Build projection`, complexity: 12 },
  { activityName: 'Update the DB', complexity: 0 }
]

export const mCQRSrealizationComplexity = [
  { activityName: 'Process request', complexity: 4.43 },
  { activityName: 'Receive information about projection', complexity: 0 },
  { activityName: 'Fetch snapshot', complexity: 6.57 },
  { activityName: 'Fetch events', complexity: 0 },
  { activityName: `Build projection`, complexity: 19.29 },
  { activityName: 'Update the DB', complexity: 4.14 }
]

export const classicalCQRSrealizationComplexity = [
  { activityName: 'Process request', complexity: 4 },
  { activityName: 'Receive information about projection', complexity: 2.29 },
  { activityName: 'Fetch snapshot', complexity: 5.86 },
  { activityName: 'Fetch events', complexity: 5 },
  { activityName: `Build projection`, complexity: 36.43 },
  { activityName: 'Update the DB', complexity: 4.86 }
]
