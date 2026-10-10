import { describe, expect, it } from "vitest"

import {
  FITMENT_CAUTION_PERCENT,
  actualDistance,
  actualSpeed,
  compareTires,
  isFitmentCaution,
} from "./compare"
import type { TireSize } from "./types"

const ORIGINAL: TireSize = { width: 205, aspect: 55, rim: 16 }
const PROPOSED: TireSize = { width: 225, aspect: 45, rim: 17 }

describe("compareTires — PROJECT.md worked example (205/55R16 → 225/45R17)", () => {
  const cmp = compareTires(ORIGINAL, PROPOSED)

  it("computes both tires' dimensions", () => {
    expect(cmp.original.overallDiameterMm).toBeCloseTo(631.9, 10)
    expect(cmp.proposed.overallDiameterMm).toBeCloseTo(634.3, 10)
  })

  it("computes absolute and percent deltas (proposed − original)", () => {
    expect(cmp.deltas.sectionWidthMm).toEqual({ absolute: 20, percent: expect.closeTo(9.7561, 3) })
    expect(cmp.deltas.sidewallMm.absolute).toBeCloseTo(-11.5, 10)
    expect(cmp.deltas.sidewallMm.percent).toBeCloseTo(-10.1996, 3)
    expect(cmp.deltas.rimDiameterMm.absolute).toBeCloseTo(25.4, 10)
    expect(cmp.deltas.overallDiameterMm.absolute).toBeCloseTo(2.4, 10)
    expect(cmp.deltas.overallDiameterMm.percent).toBeCloseTo(0.37981, 4)
    expect(cmp.deltas.circumferenceMm.percent).toBeCloseTo(0.37981, 4)
  })

  it("shows fewer revolutions per distance for the larger tire", () => {
    expect(cmp.deltas.revsPerKm.absolute).toBeLessThan(0)
    expect(cmp.deltas.revsPerMile.percent).toBeCloseTo(-0.37837, 4)
  })

  it("computes ride height change as half the diameter change", () => {
    expect(cmp.rideHeightChangeMm).toBeCloseTo(1.2, 10)
  })

  it("reads ~60.2 mph actual at 60 mph indicated", () => {
    expect(cmp.speedRatio).toBeCloseTo(634.3 / 631.9, 12)
    expect(actualSpeed(cmp, 60)).toBeCloseTo(60.2279, 3)
    expect(cmp.readingErrorPercent).toBeCloseTo(0.37981, 4)
  })

  it("travels ~100.38 actual per 100 indicated on the odometer", () => {
    expect(actualDistance(cmp, 100)).toBeCloseTo(100.37981, 4)
  })

  it("does not flag fitment caution (+0.38%)", () => {
    expect(cmp.fitmentCaution).toBe(false)
  })
})

describe("compareTires — larger diameter change", () => {
  it("flags caution for a plus-size above +3% (205/55R16 → 245/45R18, OD 677.7 mm)", () => {
    const cmp = compareTires(ORIGINAL, { width: 245, aspect: 45, rim: 18 })
    expect(cmp.proposed.overallDiameterMm).toBeCloseTo(677.7, 10)
    expect(cmp.deltas.overallDiameterMm.percent).toBeCloseTo(7.2480, 3)
    expect(cmp.fitmentCaution).toBe(true)
    expect(actualSpeed(cmp, 100)).toBeGreaterThan(100)
  })

  it("flags caution for a downsize below −3% and reads slow (205/55R16 → 185/60R14, OD 577.6 mm)", () => {
    const cmp = compareTires(ORIGINAL, { width: 185, aspect: 60, rim: 14 })
    expect(cmp.proposed.overallDiameterMm).toBeCloseTo(577.6, 10)
    expect(cmp.deltas.overallDiameterMm.percent).toBeCloseTo(-8.5931, 3)
    expect(cmp.fitmentCaution).toBe(true)
    expect(cmp.rideHeightChangeMm).toBeCloseTo(-27.15, 10)
    expect(actualSpeed(cmp, 100)).toBeCloseTo(91.4069, 3)
    expect(cmp.readingErrorPercent).toBeLessThan(0)
  })
})

describe("compareTires — identical sizes", () => {
  it("has zero deltas, unit ratio and no caution", () => {
    const cmp = compareTires(ORIGINAL, { ...ORIGINAL })
    for (const d of Object.values(cmp.deltas)) {
      expect(d).toEqual({ absolute: 0, percent: 0 })
    }
    expect(cmp.speedRatio).toBe(1)
    expect(cmp.readingErrorPercent).toBe(0)
    expect(cmp.rideHeightChangeMm).toBe(0)
    expect(actualSpeed(cmp, 65)).toBe(65)
    expect(cmp.fitmentCaution).toBe(false)
  })
})

describe("isFitmentCaution", () => {
  it("uses a 3% threshold", () => {
    expect(FITMENT_CAUTION_PERCENT).toBe(3)
  })

  it.each([
    [0, false],
    [2.99, false],
    [3, false],
    [-3, false],
    [3.0001, true],
    [-3.0001, true],
    [10, true],
  ])("isFitmentCaution(%s) is %s (strictly more than ±3 percent)", (percent, expected) => {
    expect(isFitmentCaution(percent)).toBe(expected)
  })
})
