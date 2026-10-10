import { useMemo } from "react"
import { Line } from "@react-three/drei"

import type { TireComparison, TireDimensions } from "@/lib/tire"

import { frontPlaneZ } from "./guideLabels"
import type { TireRole } from "./materials"
import { MM_TO_SCENE } from "./tireProfile"
import type { ComparisonViewMode } from "./TireScene"

interface ComparisonGuidesProps {
  comparison: TireComparison
  mode: ComparisonViewMode
  /** Horizontal offset of each tire from the scene center (0 in overlay). */
  separation: number
  colors: Record<TireRole, string>
}

const LINE_PAD = 0.05

/**
 * Overall-height reference lines spanning both tires, plus coaxial outlines in overlay mode,
 * so the size difference reads without orbiting.
 */
export function ComparisonGuides({ comparison, mode, separation, colors }: ComparisonGuidesProps) {
  const { original: o, proposed: p } = comparison
  const oR = (o.overallDiameterMm / 2) * MM_TO_SCENE
  const pR = (p.overallDiameterMm / 2) * MM_TO_SCENE
  const xMin = -separation - oR - LINE_PAD
  const xMax = separation + pR + LINE_PAD
  const z = frontPlaneZ(comparison)

  return (
    <group>
      <HeightLine y={oR * 2} xMin={xMin} xMax={xMax} color={colors.original} dashed />
      <HeightLine y={pR * 2} xMin={xMin} xMax={xMax} color={colors.proposed} />
      {mode === "overlay" && (
        <>
          <TireOutline dims={o} z={z} color={colors.original} dashed />
          <TireOutline dims={p} z={z} color={colors.proposed} />
        </>
      )}
    </group>
  )
}

function HeightLine({
  y,
  xMin,
  xMax,
  color,
  dashed,
}: {
  y: number
  xMin: number
  xMax: number
  color: string
  dashed?: boolean
}) {
  return (
    <Line
      points={[
        [xMin, y, 0],
        [xMax, y, 0],
      ]}
      color={color}
      lineWidth={1.25}
      dashed={dashed}
      dashSize={0.014}
      gapSize={0.01}
      transparent
      opacity={0.85}
      depthTest={false}
      depthWrite={false}
    />
  )
}

/** Outer diameter and rim circles on the front plane, centered on that tire's own axle height. */
function TireOutline({
  dims,
  z,
  color,
  dashed,
}: {
  dims: TireDimensions
  z: number
  color: string
  dashed?: boolean
}) {
  const outerR = (dims.overallDiameterMm / 2) * MM_TO_SCENE
  const rimR = (dims.rimDiameterMm / 2) * MM_TO_SCENE
  const outer = useMemo(() => circlePoints(outerR, outerR, z), [outerR, z])
  const rim = useMemo(() => circlePoints(rimR, outerR, z), [rimR, outerR, z])
  const common = {
    color,
    lineWidth: 1.5,
    dashed,
    dashSize: 0.016,
    gapSize: 0.01,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  }
  return (
    <>
      <Line points={outer} {...common} />
      <Line points={rim} {...common} opacity={0.7} />
    </>
  )
}

function circlePoints(radius: number, cy: number, z: number): [number, number, number][] {
  return Array.from({ length: 129 }, (_, i) => {
    const a = (i / 128) * Math.PI * 2
    return [Math.cos(a) * radius, cy + Math.sin(a) * radius, z]
  })
}
