export default class DSAVCQRSES {
  constructor(params, classicalCQRSMetrics, mCQRSMetrics) {
    this.params = params
    this.classicalCQRSMetrics = classicalCQRSMetrics
    this.mCQRSMetrics = mCQRSMetrics
  }

  calculateApplicability(perfCoef, complCoef) {
    const {
      create,
      update,
      eventualConsistency,
      queries,
      projections,
      expectedFrequencyChangeEventTypesPerSprint,
      expectedFrequencyDataRemovingPerSprint,
      mvpDevTimeSprints,
      assessmentPeriodSprints,
      // additionNew,
      modificationOld,
      read,
      write
    } = this.params

    const classicalCQRS = this.classicalCQRSMetrics
    const mCQRS = this.mCQRSMetrics

    // Normalization of model parameters

    const isPerformanceNorm = { read, write }

    const isComplexity = {
      changeEventTypes: (mvpDevTimeSprints + assessmentPeriodSprints) * expectedFrequencyChangeEventTypesPerSprint,
      dataRemoving: assessmentPeriodSprints * expectedFrequencyDataRemovingPerSprint,

      createDevelopment: create,
      createModification: create * modificationOld,
      updateDevelopment: update,
      updateModification: update * modificationOld,
      eventualConsistencyDevelopment: eventualConsistency,
      eventualConsistencyModification: eventualConsistency * modificationOld,
      queryDevelopment: queries,
      queryModification: queries * modificationOld,
      projectionRebuildDevelopment: projections,
      projectionRebuildModification: projections * modificationOld
    }

    // console.log('isComplexity')
    // console.table(Object.entries(isComplexity).reduce((acc, [key, value]) => ({ ...acc, [key]: value.toFixed(2) }), {}))

    const isTotalComplexity = Object.values(isComplexity).reduce((sum, value) => sum + value, 0)

    const isComplexityNorm = Object.keys(isComplexity).reduce(
      (agg, key) => ({
        ...agg,
        [key]: isComplexity[key] / isTotalComplexity
      }),
      {}
    )

    if (Math.abs(Object.values(isComplexityNorm).reduce((sum, value) => sum + value, 0) - 1) > 0.0001) {
      console.warn('Normalization failed isComplexityNorm')
    }

    // Normalization of metrics

    const classicalCQRSNorm = Object.keys(classicalCQRS).reduce(
      (agg, key) => ({
        ...agg,
        [key]: 1 / classicalCQRS[key] / (1 / classicalCQRS[key] + 1 / mCQRS[key])
      }),
      {}
    )

    const mCQRSNorm = Object.keys(classicalCQRS).reduce(
      (agg, key) => ({
        ...agg,
        [key]: 1 / mCQRS[key] / (1 / classicalCQRS[key] + 1 / mCQRS[key])
      }),
      {}
    )

    Object.keys(classicalCQRS).forEach((key) => {
      if (Math.abs(mCQRSNorm[key] + classicalCQRSNorm[key] - 1) > 0.0001) {
        console.warn('Normalization failed', key)
      }
    })

    const combinedCQRSNorm = Object.keys(classicalCQRS).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          classicalCQRS: classicalCQRSNorm[key].toFixed(4),
          mCQRS: mCQRSNorm[key].toFixed(4),
          diff: (mCQRSNorm[key] - classicalCQRSNorm[key]).toFixed(4)
        }
      }),
      {}
    )
    console.log('combinedCQRSNorm')
    console.table(combinedCQRSNorm)

    // Calculations of IS case

    const isCaseComplexity = Object.keys(isComplexityNorm).reduce(
      (agg, key) => ({
        ...agg,
        [key]: isComplexityNorm[key] * complCoef
      }),
      {}
    )

    const isCasePerformance = Object.keys(isPerformanceNorm).reduce(
      (agg, key) => ({
        ...agg,
        [key]: isPerformanceNorm[key] * perfCoef
      }),
      {}
    )

    const complexitySum = Object.values(isCaseComplexity).reduce((sum, value) => sum + value, 0)
    const performanceSum = Object.values(isCasePerformance).reduce((sum, value) => sum + value, 0)
    if (Math.abs(complexitySum + performanceSum - 1) > 0.001) {
      console.warn('Normalization failed isCase', complexitySum, performanceSum)
    }

    const isCase = { ...isCaseComplexity, ...isCasePerformance }
    console.log('isCase')
    console.table(Object.entries(isCase).reduce((acc, [key, value]) => ({ ...acc, [key]: value.toFixed(4) }), {}))

    const classicalCQRSApplication = Object.keys(isCase).reduce(
      (agg, key) => ({
        ...agg,
        [key]: classicalCQRSNorm[key] * isCase[key]
      }),
      {}
    )

    const mCQRSApplication = Object.keys(isCase).reduce(
      (agg, key) => ({
        ...agg,
        [key]: mCQRSNorm[key] * isCase[key]
      }),
      {}
    )

    const classicalCQRSResult =
      Math.round(Object.values(classicalCQRSApplication).reduce((sum, value) => sum + value, 0) * 10000) / 100
    const mCQRSResult = Math.round(Object.values(mCQRSApplication).reduce((sum, value) => sum + value, 0) * 10000) / 100

    if (mCQRSResult + classicalCQRSResult !== 100) {
      console.warn('Normalization failed result', mCQRSResult + classicalCQRSResult)
    }

    return { mCQRSResult, classicalCQRSResult }
  }
}
