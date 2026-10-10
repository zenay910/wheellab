import type { TireDimensions } from "@/lib/tire"

import { MM_TO_SCENE } from "./tireProfile"

export interface WheelMetrics {
  rimRadius: number
  rimWidth: number
  hubRadius: number
  outerRadius: number
  spokeCount: number
}

/** Scene-space wheel dimensions derived from nominal tire data (meters). */
export function computeWheelMetrics(dims: TireDimensions): WheelMetrics {
  const rimRadius = (dims.rimDiameterMm / 2) * MM_TO_SCENE
  const outerRadius = (dims.overallDiameterMm / 2) * MM_TO_SCENE
  const rimWidth = Math.min(dims.sectionWidthMm * 0.58, dims.rimDiameterMm * 0.42) * MM_TO_SCENE
  const hubRadius = rimRadius * 0.22
  return {
    rimRadius,
    rimWidth: Math.max(rimWidth, 0.04),
    hubRadius: Math.max(hubRadius, 0.025),
    outerRadius,
    spokeCount: 5,
  }
}
