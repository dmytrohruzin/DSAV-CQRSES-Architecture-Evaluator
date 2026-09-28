// =============================================================================
// Default Quality Attribute Component Weights
// =============================================================================
// Values match the legacy DSAV-CQRSES v1 formulas computed at the average
// project parameters (create=8.5, update=31, eventualConsistency=44,
// queries=22.5, projections=17, modificationOld=0.62, mvpDevTime=7,
// assessmentPeriod=12, expFreqChangeEvents=2, expFreqDataRemoving=0.58):
//
//   changeEventTypes  = (mvpDevTime + assessmentPeriod) · expFreqChangeEvents
//   dataRemoving      = assessmentPeriod · expFreqDataRemoving
//   *Development      = matching base parameter
//   *Modification     = base parameter · modificationOld

export const DEFAULT_COMPONENT_WEIGHTS: Record<string, number> = {
  createDevelopment: 7,
  createModification: 4.34,
  updateDevelopment: 31,
  updateModification: 19.22,
  ecDevelopment: 46,
  ecModification: 28.52,
  queryDevelopment: 20,
  queryModification: 12.4,
  projRebuildDev: 12,
  projRebuildMod: 7.44,
  changeEventTypes: 18,
  dataRemoving: 6
}
