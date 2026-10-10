import type { RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { cn } from "@/lib/utils"

import type { LabelPlacement, SceneLabel } from "./guideLabels"
import type { TireRole } from "./materials"

export type LabelElements = RefObject<Map<string, HTMLDivElement>>

const PLACEMENT_CLASS: Record<LabelPlacement, string> = {
  above: "-translate-x-1/2 -translate-y-full pb-1",
  aboveLeft: "-translate-x-full -translate-y-full pb-1",
  aboveRight: "-translate-y-full pb-1",
  below: "-translate-x-1/2 pt-2",
}

const ALIGN_CLASS: Record<LabelPlacement, string> = {
  above: "items-center",
  aboveLeft: "items-end",
  aboveRight: "items-start",
  below: "items-center",
}

/** DOM labels drawn over the canvas; `SceneLabelProjector` moves them each frame. */
export function SceneLabelOverlay({
  labels,
  elements,
  colors,
}: {
  labels: SceneLabel[]
  elements: LabelElements
  colors: Record<TireRole, string>
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {labels.map((label) => (
        <div
          key={label.id}
          ref={(el) => {
            if (el) elements.current.set(label.id, el)
            else elements.current.delete(label.id)
          }}
          className="absolute top-0 left-0 invisible"
        >
          <div className={cn("flex", PLACEMENT_CLASS[label.placement])}>
            <div
              className={cn(
                "flex flex-col rounded-sm px-1 text-[10px] leading-tight whitespace-nowrap tabular-nums sm:text-xs",
                !label.caption && "bg-stage/75",
                ALIGN_CLASS[label.placement],
              )}
            >
              <span className={cn(label.caption && "uppercase")} style={{ color: colors[label.role] }}>
                {label.primary}
              </span>
              {label.secondary && <span className="text-muted-foreground">{label.secondary}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const projected = new THREE.Vector3()

/** Projects each label anchor into canvas pixels. Must render inside the R3F <Canvas>. */
export function SceneLabelProjector({
  labels,
  elements,
}: {
  labels: SceneLabel[]
  elements: LabelElements
}) {
  useFrame(({ camera, size }) => {
    for (const label of labels) {
      const el = elements.current.get(label.id)
      if (!el) continue
      projected.set(...label.position).project(camera)
      if (projected.z > 1) {
        el.style.visibility = "hidden"
        continue
      }
      const x = ((projected.x + 1) / 2) * size.width
      const y = ((1 - projected.y) / 2) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.visibility = "visible"
    }
  })
  return null
}
