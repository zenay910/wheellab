import { describe, expect, it } from "vitest"

import { compareTires, parseTireSize } from "@/lib/tire"

import { buildGuideLabels } from "./guideLabels"

function comparison(a: string, b: string) {
  const o = parseTireSize(a)
  const p = parseTireSize(b)
  if (!o.ok || !p.ok) throw new Error("bad size")
  return compareTires(o.value, p.value)
}

describe("buildGuideLabels", () => {
  const c = comparison("205/55R16", "265/70R17")

  it("anchors diameter labels at each tire top with the signed delta", () => {
    const labels = buildGuideLabels(c, "metric", "sideBySide", 0.4)
    const original = labels.find((l) => l.id === "diameter-original")!
    const proposed = labels.find((l) => l.id === "diameter-proposed")!
    expect(original.position[1]).toBeCloseTo(c.original.overallDiameterMm / 1000, 6)
    expect(proposed.position[1]).toBeCloseTo(c.proposed.overallDiameterMm / 1000, 6)
    expect(original.position[0]).toBe(-0.4)
    expect(proposed.secondary?.startsWith("+")).toBe(true)
  })

  it("adds tire captions only side by side", () => {
    expect(buildGuideLabels(c, "metric", "sideBySide", 0.4)).toHaveLength(4)
    expect(buildGuideLabels(c, "metric", "overlay", 0)).toHaveLength(2)
  })
})
