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

function dedupePoints(points: ProfilePoint[], minDist = 0.08): ProfilePoint[] {
  return points.filter((p, i, arr) => {
    if (i === 0) return true
    const prev = arr[i - 1]
    return Math.hypot(p.x - prev.x, p.y - prev.y) > minDist
  })
}

/**
 * Side-meridian half-profile (positive x). Outer envelope matches nominal overall
 * diameter; sidewall bulge respects section width.
 */
export function buildTireLathePoints(dims: TireDimensions, arcSegments = 36): ProfilePoint[] {
  const outerR = dims.overallDiameterMm / 2
  const rimR = dims.rimDiameterMm / 2
  const sectionR = dims.sectionWidthMm / 2
  const beadR = rimR + Math.min(4, dims.sidewallMm * 0.06)
  const treadBand = Math.min(8, dims.overallDiameterMm * 0.012)
  const shoulderY = dims.sidewallMm * 0.88
  const cy = outerR

  const points: ProfilePoint[] = [
    { x: beadR, y: 0 },
    { x: sectionR * 0.9, y: dims.sidewallMm * 0.1 },
    { x: sectionR, y: dims.sidewallMm * 0.42 },
    { x: sectionR * 0.97, y: shoulderY },
  ]

  const arcStart = shoulderY
  const arcEnd = dims.overallDiameterMm - treadBand
  for (let i = 0; i <= arcSegments; i++) {
    const y = arcStart + (i / arcSegments) * (arcEnd - arcStart)
    const dy = y - cy
    const onCircle = Math.sqrt(Math.max(0, outerR * outerR - dy * dy))
    points.push({ x: onCircle, y })
  }

  points.push({ x: outerR, y: arcEnd })
  points.push({ x: outerR, y: dims.overallDiameterMm })

  return dedupePoints(points)
}

/** Y positions (mm, ground-up) for circumferential tread grooves on the lathe solid. */
export function treadGrooveHeights(dims: TireDimensions): number[] {
  const top = dims.overallDiameterMm
  const band = Math.min(10, dims.overallDiameterMm * 0.015)
  return [top - band * 0.35, top - band * 0.65, top - band * 0.95]
}

/** Groove major radius (mm) at a given meridian height on the outer envelope. */
export function grooveRadiusAtHeight(dims: TireDimensions, yMm: number): number {
  const outerR = dims.overallDiameterMm / 2
  const cy = outerR
  const dy = yMm - cy
  return Math.sqrt(Math.max(0, outerR * outerR - dy * dy)) * 0.985
}
