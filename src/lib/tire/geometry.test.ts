import { describe, expect, it } from "vitest"

import { computeDimensions } from "./geometry"

describe("computeDimensions", () => {
  it("matches the PROJECT.md worked example for 205/55R16", () => {
    const dims = computeDimensions({ width: 205, aspect: 55, rim: 16 })
    expect(dims.sectionWidthMm).toBe(205)
    expect(dims.sidewallMm).toBeCloseTo(112.75, 10)
    expect(dims.rimDiameterMm).toBeCloseTo(406.4, 10)
    expect(dims.overallDiameterMm).toBeCloseTo(631.9, 10)
    expect(dims.circumferenceMm).toBeCloseTo(1985.1724, 3)
    expect(dims.revsPerKm).toBeCloseTo(503.735, 2)
    expect(dims.revsPerMile).toBeCloseTo(810.682, 2)
  })

  it("matches the PROJECT.md worked example for 225/45R17", () => {
    const dims = computeDimensions({ width: 225, aspect: 45, rim: 17 })
    expect(dims.sidewallMm).toBeCloseTo(101.25, 10)
    expect(dims.rimDiameterMm).toBeCloseTo(431.8, 10)
    expect(dims.overallDiameterMm).toBeCloseTo(634.3, 10)
    expect(dims.circumferenceMm).toBeCloseTo(1992.7122, 3)
  })

  it("handles half-inch rims and keeps the input size", () => {
    const size = { width: 215, aspect: 85, rim: 16.5, prefix: "LT" as const }
    const dims = computeDimensions(size)
    expect(dims.size).toBe(size)
    expect(dims.rimDiameterMm).toBeCloseTo(419.1, 10)
    expect(dims.overallDiameterMm).toBeCloseTo(419.1 + 2 * 182.75, 10)
  })

  it("keeps revs-per-distance consistent with circumference", () => {
    const dims = computeDimensions({ width: 265, aspect: 70, rim: 17 })
    expect(dims.revsPerKm * dims.circumferenceMm).toBeCloseTo(1_000_000, 6)
    expect(dims.revsPerMile / dims.revsPerKm).toBeCloseTo(1.609344, 10)
  })
})
