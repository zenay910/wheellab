import type { TireDimensions, TireSize } from "./types"

export const MM_PER_INCH = 25.4
export const MM_PER_KM = 1_000_000
export const MM_PER_MILE = 1_609_344

/**
 * Nominal, unloaded dimensions for a metric tire size (formulas in PROJECT.md).
 * Expects a size that passes `validateTireSize`.
 */
export function computeDimensions(size: TireSize): TireDimensions {
  const sectionWidthMm = size.width
  const sidewallMm = size.width * (size.aspect / 100)
  const rimDiameterMm = size.rim * MM_PER_INCH
  const overallDiameterMm = rimDiameterMm + 2 * sidewallMm
  const circumferenceMm = Math.PI * overallDiameterMm

  return {
    size,
    sectionWidthMm,
    sidewallMm,
    rimDiameterMm,
    overallDiameterMm,
    circumferenceMm,
    revsPerKm: MM_PER_KM / circumferenceMm,
    revsPerMile: MM_PER_MILE / circumferenceMm,
  }
}
