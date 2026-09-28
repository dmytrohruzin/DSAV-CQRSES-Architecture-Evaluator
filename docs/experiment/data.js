// Parametric Model

export const maxParams = {
  create: 10,
  update: 35,
  eventualConsistency: 52,
  queries: 29,
  projections: 22,
  expectedFrequencyChangeEventTypesPerSprint: 3,
  expectedFrequencyDataRemovingPerSprint: 0.66,
  mvpDevTimeSprints: 8,
  assessmentPeriodSprints: 12,
  modificationOld: 0.62,
  read: 0.9,
  write: 0.1
}

export const minParams = {
  create: 7,
  update: 27,
  eventualConsistency: 36,
  queries: 16,
  projections: 12,
  expectedFrequencyChangeEventTypesPerSprint: 1,
  expectedFrequencyDataRemovingPerSprint: 0.5,
  mvpDevTimeSprints: 6,
  assessmentPeriodSprints: 12,
  modificationOld: 0.62,
  read: 0.9,
  write: 0.1
}

export const avgParams = {
  create: (maxParams.create + minParams.create) / 2,
  update: (maxParams.update + minParams.update) / 2,
  eventualConsistency: (maxParams.eventualConsistency + minParams.eventualConsistency) / 2,
  queries: (maxParams.queries + minParams.queries) / 2,
  projections: (maxParams.projections + minParams.projections) / 2,
  expectedFrequencyChangeEventTypesPerSprint:
    (maxParams.expectedFrequencyChangeEventTypesPerSprint + minParams.expectedFrequencyChangeEventTypesPerSprint) / 2,
  expectedFrequencyDataRemovingPerSprint:
    (maxParams.expectedFrequencyDataRemovingPerSprint + minParams.expectedFrequencyDataRemovingPerSprint) / 2,
  mvpDevTimeSprints: (maxParams.mvpDevTimeSprints + minParams.mvpDevTimeSprints) / 2,
  assessmentPeriodSprints: (maxParams.assessmentPeriodSprints + minParams.assessmentPeriodSprints) / 2,
  modificationOld: (maxParams.modificationOld + minParams.modificationOld) / 2,
  read: (maxParams.read + minParams.read) / 2,
  write: (maxParams.write + minParams.write) / 2
}

// Metrics

export const classicalCQRS = {
  // Performance
  read: 5,
  write: 2.93,
  // Complexity
  createDevelopment: 27.68,
  createModification: 26.18,
  updateDevelopment: 42.04,
  updateModification: 33.54,
  eventualConsistencyDevelopment: 20.26,
  eventualConsistencyModification: 14.5,
  queryDevelopment: 18,
  queryModification: 17.5,
  projectionRebuildDevelopment: 38.83,
  projectionRebuildModification: 33.33,
  changeEventTypes: 32,
  dataRemoving: 25.14
}

export const mCQRS = {
  // Performance
  read: 5,
  write: 3.68,
  // Complexity
  createDevelopment: 27.35,
  createModification: 25.1,
  updateDevelopment: 34,
  updateModification: 30.5,
  eventualConsistencyDevelopment: 15.5,
  eventualConsistencyModification: 13.5,
  queryDevelopment: 17.8,
  queryModification: 17.3,
  projectionRebuildDevelopment: 28.69,
  projectionRebuildModification: 26.69,
  changeEventTypes: 13.87,
  dataRemoving: 16
}
