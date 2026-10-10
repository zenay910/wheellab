import { describe, expect, it } from "vitest"

import type { TireSize } from "./types"
import { TIRE_LIMITS, validateTireSize } from "./validate"

const size = (width: number, aspect: number, rim: number): TireSize => ({ width, aspect, rim })

describe("validateTireSize", () => {
  it.each([
    [size(205, 55, 16)],
    [size(225, 45, 17)],
    [size(215, 85, 16.5)],
    [{ width: 265, aspect: 70, rim: 17, prefix: "LT" } satisfies TireSize],
  ])("accepts common size %j with no issues", (input) => {
    expect(validateTireSize(input)).toEqual({ valid: true, errors: [], warnings: [] })
  })

  describe("range boundaries", () => {
    it("accepts inclusive min and max", () => {
      expect(validateTireSize(size(105, 20, 10)).valid).toBe(true)
      expect(validateTireSize(size(445, 95, 30)).valid).toBe(true)
    })

    it.each([
      ["width", size(100, 55, 16)],
      ["width", size(450, 55, 16)],
      ["aspect", size(205, 19, 16)],
      ["aspect", size(205, 96, 16)],
      ["rim", size(205, 55, 9.5)],
      ["rim", size(205, 55, 30.5)],
    ])("rejects out-of-range %s in %j", (field, input) => {
      const result = validateTireSize(input)
      expect(result.valid).toBe(false)
      expect(result.errors).toEqual([expect.objectContaining({ field, code: "out-of-range" })])
    })

    it("includes the allowed range in the message", () => {
      const [error] = validateTireSize(size(500, 55, 16)).errors
      expect(error.message).toBe("Width must be between 105–445 mm.")
    })
  })

  describe("increments and whole numbers", () => {
    it("rejects rims not in 0.5 in increments", () => {
      expect(validateTireSize(size(205, 55, 16.3)).errors).toEqual([
        expect.objectContaining({ field: "rim", code: "invalid-increment" }),
      ])
    })

    it.each([
      ["width", size(205.5, 55, 16)],
      ["aspect", size(205, 55.5, 16)],
    ])("rejects non-integer %s", (field, input) => {
      expect(validateTireSize(input).errors).toEqual([
        expect.objectContaining({ field, code: "not-whole-number" }),
      ])
    })

    it.each([[NaN], [Infinity]])("rejects non-finite value %s", (value) => {
      expect(validateTireSize(size(205, value, 16)).errors).toEqual([
        expect.objectContaining({ field: "aspect", code: "not-a-number" }),
      ])
    })
  })

  describe("warnings", () => {
    it("warns (but stays valid) when width is not a multiple of 5 mm", () => {
      const result = validateTireSize(size(207, 55, 16))
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.warnings).toEqual([
        expect.objectContaining({ field: "width", code: "non-standard-step" }),
      ])
    })

    it("does not warn about width step when width already has an error", () => {
      expect(validateTireSize(size(101, 55, 16)).warnings).toEqual([])
    })
  })

  it("reports one error per invalid field", () => {
    const result = validateTireSize(size(50, 10, 50))
    expect(result.errors.map((e) => e.field)).toEqual(["width", "aspect", "rim"])
  })

  it("exposes limits matching PROJECT.md", () => {
    expect(TIRE_LIMITS.width).toMatchObject({ min: 105, max: 445 })
    expect(TIRE_LIMITS.aspect).toMatchObject({ min: 20, max: 95 })
    expect(TIRE_LIMITS.rim).toMatchObject({ min: 10, max: 30, step: 0.5 })
  })
})
