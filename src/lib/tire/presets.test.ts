import { describe, expect, it } from "vitest"

import { formatTireSize } from "./format"
import { parseTireSize } from "./parse"
import { DEFAULT_ORIGINAL, DEFAULT_PROPOSED, TIRE_PRESETS } from "./presets"
import { validateTireSize } from "./validate"

describe("presets", () => {
  it("defaults to the PROJECT.md worked example", () => {
    expect(formatTireSize(DEFAULT_ORIGINAL)).toBe("205/55R16")
    expect(formatTireSize(DEFAULT_PROPOSED)).toBe("225/45R17")
  })

  it.each(TIRE_PRESETS.map((p) => [formatTireSize(p.size), p.size]))(
    "%s is valid with no warnings and round-trips through the parser",
    (label, size) => {
      expect(validateTireSize(size)).toEqual({ valid: true, errors: [], warnings: [] })
      expect(parseTireSize(label)).toEqual({ ok: true, value: size })
    },
  )

  it("has no duplicate sizes", () => {
    const labels = TIRE_PRESETS.map((p) => formatTireSize(p.size))
    expect(new Set(labels).size).toBe(labels.length)
  })
})
