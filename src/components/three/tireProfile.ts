import type { TireDimensions } from "@/lib/tire"

export const MM_TO_SCENE = 0.001

/** Nominal overall height in scene units (meters). */
export function tireHeightM(dimensions: TireDimensions): number {
  return dimensions.overallDiameterMm * MM_TO_SCENE
}
