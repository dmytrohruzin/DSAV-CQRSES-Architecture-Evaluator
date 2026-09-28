export const mCQRSdesignComplexity = [
  { activityName: 'Route event', complexity: 3 },
  { activityName: 'Handle event (Update projection)', complexity: 18 },
  { activityName: 'Notify client', complexity: 4 }
]

export const classicalCQRSdesignComplexity = [
  { activityName: 'Route event', complexity: 3 },
  { activityName: 'Handle event (Update projection)', complexity: 26 },
  { activityName: 'Notify client', complexity: 4 }
]

export const mCQRSrealizationComplexity = [
  { activityName: 'Route event', complexity: 1.3 },
  { activityName: 'Handle event (Update projection)', complexity: 11.7 },
  { activityName: 'Notify client', complexity: 2.21 }
]

export const classicalCQRSrealizationComplexity = [
  { activityName: 'Route event', complexity: 1.91 },
  { activityName: 'Handle event (Update projection)', complexity: 17.18 },
  { activityName: 'Notify client', complexity: 2.82 }
]
