import {
  formatLength,
  formatLengthDelta,
  formatTireSize,
  type TireComparison,
  type UnitSystem,
} from "@/lib/tire"

import type { TireRole } from "./materials"
import { MM_TO_SCENE } from "./tireProfile"
import type { ComparisonViewMode } from "./TireScene"

/** Where the label box sits relative to its projected anchor point. */
export type LabelPlacement = "above" | "aboveLeft" | "aboveRight" | "below"

export interface SceneLabel {
  id: string
  position: [number, number, number]
  placement: LabelPlacement
  role: TireRole
  primary: string
  secondary?: string
  caption?: boolean
}

/** Horizontal offset of overlay diameter labels from the shared tire top. */
const OVERLAY_LABEL_GAP = 0.04

export function frontPlaneZ(comparison: TireComparison): number {
  const { original: o, proposed: p } = comparison
  return (Math.max(o.sectionWidthMm, p.sectionWidthMm) / 2) * MM_TO_SCENE + 0.004
}

/** Diameter callouts at each tire top, plus role/size captions under each tire in side-by-side. */
export function buildGuideLabels(
  comparison: TireComparison,
  units: UnitSystem,
  mode: ComparisonViewMode,
  separation: number,
): SceneLabel[] {
  const { original: o, proposed: p } = comparison
  const overlay = mode === "overlay"
  const labels: SceneLabel[] = [
    {
      id: "diameter-original",
      position: [overlay ? -OVERLAY_LABEL_GAP : -separation, o.overallDiameterMm * MM_TO_SCENE, 0],
      placement: overlay ? "aboveLeft" : "above",
      role: "original",
      primary: `Ø ${formatLength(o.overallDiameterMm, units)}`,
    },
    {
      id: "diameter-proposed",
      position: [overlay ? OVERLAY_LABEL_GAP : separation, p.overallDiameterMm * MM_TO_SCENE, 0],
      placement: overlay ? "aboveRight" : "above",
      role: "proposed",
      primary: `Ø ${formatLength(p.overallDiameterMm, units)}`,
      secondary: formatLengthDelta(comparison.deltas.overallDiameterMm.absolute, units),
    },
  ]

  if (!overlay) {
    const z = frontPlaneZ(comparison)
    labels.push(
      {
        id: "caption-original",
        position: [-separation, 0, z],
        placement: "below",
        role: "original",
        primary: "Original",
        secondary: formatTireSize(o.size),
        caption: true,
      },
      {
        id: "caption-proposed",
        position: [separation, 0, z],
        placement: "below",
        role: "proposed",
        primary: "Proposed",
        secondary: formatTireSize(p.size),
        caption: true,
      },
    )
  }

  return labels
}
