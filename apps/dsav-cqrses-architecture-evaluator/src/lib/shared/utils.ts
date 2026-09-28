/** Parse a string to a number, defaulting to 0 for NaN / empty. */
export function sanitizeNumeric(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}
