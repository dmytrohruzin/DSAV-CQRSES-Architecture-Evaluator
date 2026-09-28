// =============================================================================
// Default Variation Metrics
// =============================================================================
// Complexity-only metrics for the two reference variations. Keys correspond to
// `DEFAULT_QUALITY_ATTRIBUTES` metric keys.

export const DEFAULT_CLASSICAL_CQRS_METRICS: Record<string, number> = {
  createDevelopment: 28.23,
  createModification: 26.03,
  updateDevelopment: 42.94,
  updateModification: 33.14,
  ecDevelopment: 19.8,
  ecModification: 14.5,
  queryDevelopment: 19,
  queryModification: 17.2,
  projRebuildDev: 37.83,
  projRebuildMod: 32.63,
  changeEventTypes: 31.7,
  dataRemoving: 24.84
}

export const DEFAULT_MCQRS_METRICS: Record<string, number> = {
  createDevelopment: 28.95,
  createModification: 24.95,
  updateDevelopment: 35.8,
  updateModification: 30,
  ecDevelopment: 16,
  ecModification: 13.2,
  queryDevelopment: 18.8,
  queryModification: 17,
  projRebuildDev: 21.69,
  projRebuildMod: 18.69,
  changeEventTypes: 13.87,
  dataRemoving: 16
}
