import { useEffect, useRef, useState } from "react"

import {
  MM_PER_INCH,
  type TireComparison,
  type TireDimensions,
  type UnitSystem,
} from "@/lib/tire"

interface TireSilhouette2DProps {
  comparison: TireComparison
  units: UnitSystem
}

const PAD_X = 24
/** Space reserved above the tires for the stage legend overlay. */
const TOP_RESERVE = 64
/** Space reserved below the ground line for view captions, the scale bar, and the stage status badge. */
const BOTTOM_RESERVE = 88
const MIN_SCALE_BAR_PX = 40
const SCALE_BAR_MM: Record<UnitSystem, number[]> = {
  metric: [20, 50, 100, 200, 500, 1000],
  imperial: [1, 2, 4, 8, 20, 40].map((inches) => inches * MM_PER_INCH),
}

/**
 * Side and front silhouettes of both tires on one ground line, drawn to a single mm→px scale.
 * Dashed outline on the proposed tire shows the original for direct comparison.
 * This is the MVP comparison view and the fallback when WebGL is unavailable.
 */
export function TireSilhouette2D({ comparison, units }: TireSilhouette2DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="absolute inset-0">
      {size.width > 0 && size.height > 0 && (
        <Drawing comparison={comparison} units={units} width={size.width} height={size.height} />
      )}
    </div>
  )
}

function Drawing({
  comparison,
  units,
  width,
  height,
}: TireSilhouette2DProps & { width: number; height: number }) {
  const { original: o, proposed: p } = comparison
  const maxDiameter = Math.max(o.overallDiameterMm, p.overallDiameterMm)
  const gapSmall = maxDiameter * 0.12
  const gapLarge = maxDiameter * 0.3
  const contentMm =
    o.overallDiameterMm +
    gapSmall +
    o.sectionWidthMm +
    gapLarge +
    p.overallDiameterMm +
    gapSmall +
    p.sectionWidthMm

  const groundY = Math.max(TOP_RESERVE + 40, height - BOTTOM_RESERVE)
  const scale = Math.min((width - 2 * PAD_X) / contentMm, (groundY - TOP_RESERVE) / maxDiameter)
  const startX = (width - contentMm * scale) / 2

  const originalSideX = startX
  const originalFrontX = originalSideX + (o.overallDiameterMm + gapSmall) * scale
  const proposedSideX =
    originalFrontX + (o.sectionWidthMm + gapLarge) * scale
  const proposedFrontX = proposedSideX + (p.overallDiameterMm + gapSmall) * scale

  const scaleBarMm =
    SCALE_BAR_MM[units].find((mm) => mm * scale >= MIN_SCALE_BAR_PX) ?? SCALE_BAR_MM[units].at(-1)!
  const scaleBarPx = scaleBarMm * scale
  const scaleBarLabel =
    units === "metric" ? `${scaleBarMm} mm` : `${Math.round(scaleBarMm / MM_PER_INCH)} in`
  const barRight = width - PAD_X
  // Sits above the stage status slot (caution badge, bottom-left) so the two never overlap.
  const barY = groundY + 40

  const description =
    `Side and front silhouettes of the original and proposed tires, drawn to the same scale. ` +
    `Overall diameter ${o.overallDiameterMm.toFixed(1)} mm original, ` +
    `${p.overallDiameterMm.toFixed(1)} mm proposed.`

  return (
    <svg
      role="img"
      aria-label={description}
      width={width}
      height={height}
      className="block text-xs"
    >
      <line
        x1={0}
        x2={width}
        y1={groundY}
        y2={groundY}
        className="stroke-border"
        strokeDasharray="4 4"
      />

      <SideView tire={o} x={originalSideX} groundY={groundY} scale={scale} className="stroke-muted-foreground" />
      <FrontView tire={o} x={originalFrontX} groundY={groundY} scale={scale} className="stroke-muted-foreground" />

      <SideView tire={p} x={proposedSideX} groundY={groundY} scale={scale} className="stroke-proposed" />
      <FrontView tire={p} x={proposedFrontX} groundY={groundY} scale={scale} className="stroke-proposed" />

      {/* Original outline on the proposed tire, aligned on the ground. */}
      <circle
        cx={proposedSideX + (p.overallDiameterMm / 2) * scale}
        cy={groundY - (o.overallDiameterMm / 2) * scale}
        r={(o.overallDiameterMm / 2) * scale}
        fill="none"
        strokeDasharray="4 3"
        className="stroke-muted-foreground"
      />
      <rect
        x={proposedFrontX + ((p.sectionWidthMm - o.sectionWidthMm) / 2) * scale}
        y={groundY - o.overallDiameterMm * scale}
        width={o.sectionWidthMm * scale}
        height={o.overallDiameterMm * scale}
        fill="none"
        strokeDasharray="4 3"
        className="stroke-muted-foreground"
      />

      <ViewCaption x={originalSideX + (o.overallDiameterMm / 2) * scale} y={groundY + 16} text="Side" />
      <ViewCaption x={originalFrontX + (o.sectionWidthMm / 2) * scale} y={groundY + 16} text="Front" />
      <ViewCaption x={proposedSideX + (p.overallDiameterMm / 2) * scale} y={groundY + 16} text="Side" />
      <ViewCaption x={proposedFrontX + (p.sectionWidthMm / 2) * scale} y={groundY + 16} text="Front" />

      <g className="stroke-muted-foreground">
        <line x1={barRight - scaleBarPx} x2={barRight} y1={barY} y2={barY} />
        <line x1={barRight - scaleBarPx} x2={barRight - scaleBarPx} y1={barY - 4} y2={barY + 4} />
        <line x1={barRight} x2={barRight} y1={barY - 4} y2={barY + 4} />
      </g>
      <text
        x={barRight - scaleBarPx - 8}
        y={barY + 4}
        textAnchor="end"
        className="fill-muted-foreground tabular-nums"
      >
        {scaleBarLabel}
      </text>
    </svg>
  )
}

interface ViewProps {
  tire: TireDimensions
  x: number
  groundY: number
  scale: number
  className: string
}

/** Wheel side view: tire outer edge, rim edge, and axle. */
function SideView({ tire, x, groundY, scale, className }: ViewProps) {
  const outerR = (tire.overallDiameterMm / 2) * scale
  const rimR = (tire.rimDiameterMm / 2) * scale
  const cx = x + outerR
  const cy = groundY - outerR

  return (
    <g fill="none" strokeWidth={1.5} className={className}>
      <circle cx={cx} cy={cy} r={outerR} />
      <circle cx={cx} cy={cy} r={rimR} />
      <circle cx={cx} cy={cy} r={2} className="fill-current" />
    </g>
  )
}

/** Tread view: section width by overall diameter, with the rim diameter marked. */
function FrontView({ tire, x, groundY, scale, className }: ViewProps) {
  const w = tire.sectionWidthMm * scale
  const h = tire.overallDiameterMm * scale
  const rimTop = groundY - h / 2 - (tire.rimDiameterMm / 2) * scale
  const rimBottom = groundY - h / 2 + (tire.rimDiameterMm / 2) * scale

  return (
    <g fill="none" strokeWidth={1.5} className={className}>
      <rect x={x} y={groundY - h} width={w} height={h} />
      <line x1={x} x2={x + w} y1={rimTop} y2={rimTop} strokeWidth={1} strokeDasharray="2 3" />
      <line x1={x} x2={x + w} y1={rimBottom} y2={rimBottom} strokeWidth={1} strokeDasharray="2 3" />
    </g>
  )
}

function ViewCaption({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-muted-foreground uppercase">
      {text}
    </text>
  )
}
