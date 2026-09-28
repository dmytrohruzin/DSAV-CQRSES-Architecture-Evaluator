// CF Migration Complexity по классам процессов

export const canonicalToClassicalCQRSDesignComplexity = [
  { activityName: 'create', complexity: 0 },
  { activityName: 'update', complexity: 20 },
  { activityName: 'eventual consistency', complexity: 17 },
  { activityName: 'projection rebuild', complexity: 11 },
  { activityName: 'read', complexity: 0 }
]

export const canonicalToMCQRSDesignComplexity = [
  { activityName: 'create', complexity: 8 },
  { activityName: 'update', complexity: 22 },
  { activityName: 'eventual consistency', complexity: 9 },
  { activityName: 'projection rebuild', complexity: 22 },
  { activityName: 'read', complexity: 0 }
]

export const classicalToMCQRSDesignComplexity = [
  { activityName: 'create', complexity: 8 },
  { activityName: 'update', complexity: 22 },
  { activityName: 'eventual consistency', complexity: 9 },
  { activityName: 'projection rebuild', complexity: 20 },
  { activityName: 'read', complexity: 0 }
]

export const mCQRSToClassicalCQRSDesignComplexity = [
  { activityName: 'create', complexity: 4 },
  { activityName: 'update', complexity: 32 },
  { activityName: 'eventual consistency', complexity: 13 },
  { activityName: 'projection rebuild', complexity: 33 },
  { activityName: 'read', complexity: 0 }
]

export const mCQRSToMCQRSCoEDesignComplexity = [
  { activityName: 'create', complexity: 2 },
  { activityName: 'update', complexity: 2 },
  { activityName: 'eventual consistency', complexity: 8 },
  { activityName: 'projection rebuild', complexity: 0 },
  { activityName: 'read', complexity: 0 }
]

// Среднее время на один экземпляр процесса, минуты

export const canonicalToClassicalCQRSImplementationComplexity = [
  { activityName: 'create', complexity: 0 },
  { activityName: 'update', complexity: 17.5 },
  { activityName: 'eventual consistency', complexity: 15.88 },
  { activityName: 'projection rebuild', complexity: 13.5 },
  { activityName: 'read', complexity: 0 }
]

export const canonicalToMCQRSImplementationComplexity = [
  { activityName: 'create', complexity: 7 },
  { activityName: 'update', complexity: 20.67 },
  { activityName: 'eventual consistency', complexity: 10.88 },
  { activityName: 'projection rebuild', complexity: 24 },
  { activityName: 'read', complexity: 0 }
]

export const classicalToMCQRSImplementationComplexity = [
  { activityName: 'create', complexity: 6.5 },
  { activityName: 'update', complexity: 17.07 },
  { activityName: 'eventual consistency', complexity: 11.85 },
  { activityName: 'projection rebuild', complexity: 19 },
  { activityName: 'read', complexity: 0 }
]

export const mCQRSToClassicalCQRSImplementationComplexity = [
  { activityName: 'create', complexity: 4.5 },
  { activityName: 'update', complexity: 24.66 },
  { activityName: 'eventual consistency', complexity: 15.75 },
  { activityName: 'projection rebuild', complexity: 41.5 },
  { activityName: 'read', complexity: 0 }
]

export const mCQRSToMCQRSCoEImplementationComplexity = [
  { activityName: 'create', complexity: 5.5 },
  { activityName: 'update', complexity: 5.67 },
  { activityName: 'eventual consistency', complexity: 9.38 },
  { activityName: 'projection rebuild', complexity: 0 },
  { activityName: 'read', complexity: 0 }
]
