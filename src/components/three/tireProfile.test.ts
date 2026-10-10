import { describe, expect, it } from "vitest"

import { computeDimensions } from "@/lib/tire/geometry"
import { parseTireSize } from "@/lib/tire/parse"

import { MM_TO_SCENE, buildTireLathePoints } from "./tireProfile"

describe("tire geometry helpers", () => {
  it("lathe profile reaches nominal overall diameter (legacy / 2D reference)", () => {
    const size = parseTireSize("205/55R16")
    expect(size.ok).toBe(true)
    if (!size.ok) return
    const dims = computeDimensions(size.value)
    const points = buildTireLathePoints(dims)
    expect(Math.max(...points.map((p) => p.y))).toBeCloseTo(dims.overallDiameterMm, 0)
    expect(Math.max(...points.map((p) => p.x))).toBeCloseTo(dims.overallDiameterMm / 2, 0)
  })

  it("torus major/minor matches OD and rim for 225/45R17", () => {
    const size = parseTireSize("225/45R17")
    expect(size.ok).toBe(true)
    if (!size.ok) return
    const dims = computeDimensions(size.value)
    const outerR = (dims.overallDiameterMm / 2) * MM_TO_SCENE
    const rimR = (dims.rimDiameterMm / 2) * MM_TO_SCENE
    const major = (outerR + rimR) / 2
    const minor = (outerR - rimR) / 2
    expect(major + minor).toBeCloseTo(outerR, 5)
    expect(major - minor).toBeCloseTo(rimR, 5)
  })
})
