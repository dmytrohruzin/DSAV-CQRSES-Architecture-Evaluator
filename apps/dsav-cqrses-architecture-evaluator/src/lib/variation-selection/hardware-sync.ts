// =============================================================================
// Hardware ↔ Variation/SLA Schema Synchronization
// =============================================================================
// Keeps the hardware-configuration blocks aligned with the variation list and
// the SLA parameter schema: blocks follow variation names, every config gets a
// NaN placeholder for newly added SLA parameters, and stale SLA values are
// dropped when a parameter is removed.

import type { SlaParameter, VariationHardwareData } from './types'

export function syncHardwareWithVariations(
  hardware: VariationHardwareData[],
  variationNames: string[],
  slaParameters: SlaParameter[]
): VariationHardwareData[] {
  const byName = new Map(hardware.map((h) => [h.variationName, h]))
  return variationNames.map((name) => {
    const existing = byName.get(name)
    if (existing) {
      return {
        variationName: name,
        configs: existing.configs.map((c) => {
          const slaValues = { ...c.slaValues }
          for (const sla of slaParameters) {
            if (!(sla.id in slaValues)) slaValues[sla.id] = Number.NaN
          }
          for (const id of Object.keys(slaValues)) {
            if (!slaParameters.some((s) => s.id === id)) {
              delete slaValues[id]
            }
          }
          return { ...c, slaValues }
        })
      }
    }
    return { variationName: name, configs: [] }
  })
}
