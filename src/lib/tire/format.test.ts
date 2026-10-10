import { describe, expect, it } from "vitest"

import {
  KM_PER_MILE,
  convertSpeed,
  formatDistance,
  formatLength,
  formatLengthDelta,
  formatLengthDeltaValue,
  formatLengthValue,
  formatNumber,
  formatPercentDelta,
  formatRevs,
  formatSigned,
  formatSpeed,
  formatTireSize,
  lengthUnit,
  mmToInches,
} from "./format"
import { computeDimensions } from "./geometry"
import { parseTireSize } from "./parse"

const M = "\u2212"

describe("formatNumber / formatSigned", () => {
  it("uses fixed decimals and thousands separators", () => {
    expect(formatNumber(1985.1724, 1)).toBe("1,985.2")
    expect(formatNumber(16, 2)).toBe("16.00")
  })

  it("uses a true minus sign and never shows negative zero", () => {
    expect(formatNumber(-11.5, 1)).toBe(`${M}11.5`)
    expect(formatNumber(-0.001, 1)).toBe("0.0")
  })

  it("always signs non-zero values", () => {
    expect(formatSigned(2.4, 1)).toBe("+2.4")
    expect(formatSigned(-2.4, 1)).toBe(`${M}2.4`)
    expect(formatSigned(-1234.5, 1)).toBe(`${M}1,234.5`)
  })

  it("leaves values that round to zero unsigned", () => {
    expect(formatSigned(0, 1)).toBe("0.0")
    expect(formatSigned(0.04, 1)).toBe("0.0")
    expect(formatSigned(-0.04, 1)).toBe("0.0")
  })
})

describe("unit conversion", () => {
  it("converts mm to inches", () => {
    expect(mmToInches(25.4)).toBe(1)
    expect(mmToInches(631.9)).toBeCloseTo(24.878, 3)
  })

  it("converts speeds between systems", () => {
    expect(KM_PER_MILE).toBeCloseTo(1.609344, 10)
    expect(convertSpeed(60, "imperial", "metric")).toBeCloseTo(96.5606, 3)
    expect(convertSpeed(100, "metric", "imperial")).toBeCloseTo(62.1371, 3)
    expect(convertSpeed(88, "metric", "metric")).toBe(88)
    expect(convertSpeed(convertSpeed(70, "imperial", "metric"), "metric", "imperial")).toBeCloseTo(70, 10)
  })
})

describe("lengths", () => {
  it("formats metric in mm (1 dp) and imperial in inches (2 dp)", () => {
    expect(formatLength(631.9, "metric")).toBe("631.9 mm")
    expect(formatLength(631.9, "imperial")).toBe("24.88 in")
    expect(formatLength(1985.1724, "metric")).toBe("1,985.2 mm")
  })

  it("formats signed length deltas", () => {
    expect(formatLengthDelta(2.4, "metric")).toBe("+2.4 mm")
    expect(formatLengthDelta(2.4, "imperial")).toBe("+0.09 in")
    expect(formatLengthDelta(-11.5, "metric")).toBe(`${M}11.5 mm`)
    expect(formatLengthDelta(0, "imperial")).toBe("0.00 in")
  })

  it("formats unit-less values that match the unit-bearing formatters", () => {
    expect(lengthUnit("metric")).toBe("mm")
    expect(lengthUnit("imperial")).toBe("in")
    expect(formatLengthValue(1985.1724, "metric")).toBe("1,985.2")
    expect(formatLengthValue(631.9, "imperial")).toBe("24.88")
    expect(formatLengthDeltaValue(2.4, "metric")).toBe("+2.4")
    expect(formatLengthDeltaValue(-11.5, "imperial")).toBe(`${M}0.45`)
  })
})

describe("speed, distance, revs", () => {
  it("labels speed by system", () => {
    expect(formatSpeed(60.2279, "imperial")).toBe("60.2 mph")
    expect(formatSpeed(96.56, "metric")).toBe("96.6 km/h")
    expect(formatSpeed(60, "imperial", 0)).toBe("60 mph")
  })

  it("labels distance by system", () => {
    expect(formatDistance(100.37981, "metric")).toBe("100.4 km")
    expect(formatDistance(100.37981, "imperial", 2)).toBe("100.38 mi")
  })

  it("picks rev/km or rev/mi", () => {
    const dims = computeDimensions({ width: 205, aspect: 55, rim: 16 })
    expect(formatRevs(dims, "metric")).toBe("503.7 rev/km")
    expect(formatRevs(dims, "imperial")).toBe("810.7 rev/mi")
  })
})

describe("formatPercentDelta", () => {
  it.each([
    [0.37981, "+0.38%"],
    [-10.1996, `${M}10.20%`],
    [7.248, "+7.25%"],
    [0, "0.00%"],
    [-0.004, "0.00%"],
  ])("%s → %s", (percent, expected) => {
    expect(formatPercentDelta(percent)).toBe(expected)
  })

  it("supports custom precision", () => {
    expect(formatPercentDelta(0.37981, 1)).toBe("+0.4%")
  })
})

describe("formatTireSize", () => {
  it.each([
    [{ width: 205, aspect: 55, rim: 16 }, "205/55R16"],
    [{ width: 215, aspect: 85, rim: 16.5, prefix: "LT" as const }, "LT215/85R16.5"],
    [{ width: 215, aspect: 65, rim: 15, prefix: "P" as const }, "P215/65R15"],
  ])("formats %j as %s", (size, expected) => {
    expect(formatTireSize(size)).toBe(expected)
  })

  it("round-trips through parseTireSize", () => {
    const size = { width: 265, aspect: 70, rim: 17, prefix: "LT" as const }
    expect(parseTireSize(formatTireSize(size))).toEqual({ ok: true, value: size })
  })
})
