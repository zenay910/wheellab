import type { TireDimensions } from "@/lib/tire"

export const MM_TO_SCENE = 0.001

/** Nominal overall height in scene units (meters). */
export function tireHeightM(dimensions: TireDimensions): number {
  return dimensions.overallDiameterMm * MM_TO_SCENE
}

/** 2D lathe profile point: x = radius from axis, y = height from ground (mm). */
export interface ProfilePoint {
  x: number
  y: number
}

/**
 * Half-profile for `LatheGeometry` (positive x only). Outer silhouette matches nominal
 * overall diameter; sidewall bulge capped at section width.
 */
export function buildTireLathePoints(dims: TireDimensions, segments = 32): ProfilePoint[] {
  const outerR = dims.overallDiameterMm / 2
  const rimR = dims.rimDiameterMm / 2
  const sectionR = dims.sectionWidthMm / 2
  const overall = dims.overallDiameterMm
  const cy = outerR

  const points: ProfilePoint[] = []

  // Bead / inner edge at the ground line.
  points.push({ x: rimR, y: 0 })

  // Sidewall bulge toward section width.
  const bulgeY = Math.min(dims.sidewallMm * 0.55, overall * 0.35)
  points.push({ x: Math.min(sectionR, outerR), y: bulgeY * 0.45 })
  points.push({ x: Math.min(sectionR, outerR), y: bulgeY })

  // Outer arc from lower shoulder to tread (circle centered at (0, cy)).
  const arcStartY = bulgeY
  const arcEndY = overall
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = arcStartY + t * (arcEndY - arcStartY)
    const dy = y - cy
    const circleX = Math.sqrt(Math.max(0, outerR * outerR - dy * dy))
    const x = Math.min(circleX, sectionR + (outerR - sectionR) * t)
    points.push({ x, y })
  }

  // Deduplicate consecutive near-identical points.
  return points.filter((p, i, arr) => {
    if (i === 0) return true
    const prev = arr[i - 1]
    return Math.hypot(p.x - prev.x, p.y - prev.y) > 0.05
  })
}
