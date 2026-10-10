import { describe, expect, it } from "vitest"

import { parseTireSize } from "./parse"

describe("parseTireSize", () => {
  describe("standard metric formats", () => {
    it.each([
      ["205/55R16", { width: 205, aspect: 55, rim: 16 }],
      ["225/45R17", { width: 225, aspect: 45, rim: 17 }],
      ["205/55r16", { width: 205, aspect: 55, rim: 16 }],
      ["  205/55R16  ", { width: 205, aspect: 55, rim: 16 }],
      ["285/30ZR20", { width: 285, aspect: 30, rim: 20 }],
      ["205/55VR16", { width: 205, aspect: 55, rim: 16 }],
      ["7.50/80D16", { width: 7.5, aspect: 80, rim: 16 }],
      ["205/55B16", { width: 205, aspect: 55, rim: 16 }],
    ])("parses %j", (input, expected) => {
      expect(parseTireSize(input)).toEqual({ ok: true, value: expected })
    })
  })

  describe("variants", () => {
    it.each([
      ["205/55-16"],
      ["205/55 R16"],
      ["205/55 R 16"],
      ["205 / 55 R 16"],
      ["205/55 16"],
      ["205/55 ZR16"],
    ])("parses %j as 205/55R16", (input) => {
      expect(parseTireSize(input)).toEqual({
        ok: true,
        value: { width: 205, aspect: 55, rim: 16 },
      })
    })

    it("parses half-inch rims", () => {
      expect(parseTireSize("LT215/85R16.5")).toEqual({
        ok: true,
        value: { width: 215, aspect: 85, rim: 16.5, prefix: "LT" },
      })
    })

    it.each([["205/55R16 91V"], ["225/45R17 94W XL"], ["265/70R17 121/118S"], ["205/55R16 RF"]])(
      "ignores trailing service description in %j",
      (input) => {
        const result = parseTireSize(input)
        expect(result.ok).toBe(true)
      },
    )
  })

  describe("prefixes", () => {
    it.each([
      ["P215/65R15", "P", 215, 65, 15],
      ["p215/65r15", "P", 215, 65, 15],
      ["P 215/65R15", "P", 215, 65, 15],
      ["LT265/70R17", "LT", 265, 70, 17],
      ["lt265/70r17", "LT", 265, 70, 17],
      ["LT 265/70 R17", "LT", 265, 70, 17],
    ])("parses %j with prefix %s", (input, prefix, width, aspect, rim) => {
      expect(parseTireSize(input)).toEqual({ ok: true, value: { width, aspect, rim, prefix } })
    })

    it("omits prefix when absent", () => {
      const result = parseTireSize("205/55R16")
      expect(result.ok && "prefix" in result.value).toBe(false)
    })
  })

  describe("invalid input", () => {
    it.each([[""], ["   "]])("rejects empty input %j", (input) => {
      expect(parseTireSize(input)).toMatchObject({ ok: false, error: { code: "empty" } })
    })

    it.each([["33x12.50R17"], ["33X12.50-15"], ["LT33x12.50R15"]])(
      "reports flotation size %j as unsupported",
      (input) => {
        expect(parseTireSize(input)).toMatchObject({
          ok: false,
          error: { code: "unsupported-format" },
        })
      },
    )

    it.each([
      ["205"],
      ["205/55"],
      ["205/R16"],
      ["/55R16"],
      ["205-55-16"],
      ["205/5516"],
      ["205/55X16"],
      ["205/55R"],
      ["abc/55R16"],
      ["205/55R16/"],
      ["ST205/75R15"],
      ["-205/55R16"],
      ["205/55R16 hello"],
      ["205/55R16junk"],
    ])("rejects %j", (input) => {
      expect(parseTireSize(input)).toMatchObject({ ok: false, error: { code: "invalid-format" } })
    })

    it("returns a human-readable message", () => {
      const result = parseTireSize("nonsense")
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error.message).toMatch(/205\/55R16/)
    })
  })

  it("does not range-check (validation is separate)", () => {
    expect(parseTireSize("999/5R99")).toEqual({
      ok: true,
      value: { width: 999, aspect: 5, rim: 99 },
    })
  })
})
