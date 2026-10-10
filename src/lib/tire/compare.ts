import { computeDimensions } from "./geometry"
import type { DimensionDelta, DimensionKey, TireComparison, TireSize } from "./types"

/** Overall-diameter change (in percent, either direction) above which fitment caution is shown. */
export const FITMENT_CAUTION_PERCENT = 3

const DIMENSION_KEYS = [
  "sectionWidthMm",
  "sidewallMm",
  "rimDiameterMm",
  "overallDiameterMm",
  "circumferenceMm",
  "revsPerKm",
  "revsPerMile",
] as const satisfies readonly DimensionKey[]

function delta(original: number, proposed: number): DimensionDelta {
  const absolute = proposed - original
  return { absolute, percent: (absolute / original) * 100 }
}

export function isFitmentCaution(overallDiameterPercent: number): boolean {
  return Math.abs(overallDiameterPercent) > FITMENT_CAUTION_PERCENT
}

/**
 * Compares a proposed tire against the original. Assumes the speedometer is calibrated
 * for the original tire at nominal unloaded diameter. Both sizes should pass validation.
 */
export function compareTires(originalSize: TireSize, proposedSize: TireSize): TireComparison {
  const original = computeDimensions(originalSize)
  const proposed = computeDimensions(proposedSize)

  const deltas = Object.fromEntries(
    DIMENSION_KEYS.map((key) => [key, delta(original[key], proposed[key])]),
  ) as Record<DimensionKey, DimensionDelta>

  const speedRatio = proposed.circumferenceMm / original.circumferenceMm

  return {
    original,
    proposed,
    deltas,
    rideHeightChangeMm: deltas.overallDiameterMm.absolute / 2,
    speedRatio,
    readingErrorPercent: (speedRatio - 1) * 100,
    fitmentCaution: isFitmentCaution(deltas.overallDiameterMm.percent),
  }
}

/** Actual road speed when the speedometer shows `indicatedSpeed` (any unit; same unit out). */
export function actualSpeed(comparison: TireComparison, indicatedSpeed: number): number {
  return indicatedSpeed * comparison.speedRatio
}

/** Actual distance travelled when the odometer shows `indicatedDistance` (any unit). */
export function actualDistance(comparison: TireComparison, indicatedDistance: number): number {
  return indicatedDistance * comparison.speedRatio
}