import { describe, expect, it } from "vitest"
import * as THREE from "three"

import { computeDimensions, parseTireSize } from "@/lib/tire"

import { buildTireGeometry, tireShape } from "./tireGeometry"
import { MM_TO_SCENE } from "./tireProfile"

function dims(input: string) {
  const parsed = parseTireSize(input)
  if (!parsed.ok) throw new Error(input)
  return computeDimensions(parsed.value)
}

describe("buildTireGeometry", () => {
  it.each(["205/55R16", "245/45R18", "LT265/75R16"])("matches nominal size for %s", (size) => {
    const d = dims(size)
    const geometry = buildTireGeometry(d)
    geometry.computeBoundingBox()
    const box = geometry.boundingBox!
    const size3 = box.getSize(new THREE.Vector3())

    expect(size3.x / MM_TO_SCENE).toBeCloseTo(d.overallDiameterMm, -1)
    expect(size3.y / MM_TO_SCENE).toBeCloseTo(d.overallDiameterMm, -1)
    expect(size3.z / MM_TO_SCENE).toBeCloseTo(d.sectionWidthMm, -1)
    geometry.dispose()
  })

  it("faces point outward on the tread and sidewall", () => {
    const geometry = buildTireGeometry(dims("225/45R17"))
    const pos = geometry.getAttribute("position")
    const normal = geometry.getAttribute("normal")
    let outermost = 0
    let widest = 0
    const radius = (i: number) => Math.hypot(pos.getX(i), pos.getY(i))
    for (let i = 0; i < pos.count; i++) {
      if (pos.getZ(i) > pos.getZ(widest)) widest = i
      if (radius(i) > radius(outermost)) outermost = i
    }
    const radialNormal =
      (normal.getX(outermost) * pos.getX(outermost) + normal.getY(outermost) * pos.getY(outermost)) /
      radius(outermost)
    expect(radialNormal).toBeGreaterThan(0.5)
    expect(normal.getZ(widest)).toBeGreaterThan(0.5)
    geometry.dispose()
  })

  it("builds fast enough to rebuild on every size edit", () => {
    const d = dims("265/70R17")
    buildTireGeometry(d).dispose()
    const t0 = performance.now()
    buildTireGeometry(d).dispose()
    expect(performance.now() - t0).toBeLessThan(150)
  })

  it("keeps the bead inside the section width", () => {
    const s = tireShape(dims("225/45R17"))
    expect(s.beadHalf).toBeLessThan(s.sectionHalf)
    expect(s.treadHalf).toBeLessThan(s.sectionHalf)
  })
})
