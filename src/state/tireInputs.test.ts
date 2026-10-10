import { describe, expect, it } from "vitest"

import {
  createInitialState,
  createTireInput,
  getInputIssues,
  stepValue,
  tireInputsReducer,
  type TireInputsAction,
  type TireInputsState,
} from "./tireInputs"

const run = (...actions: TireInputsAction[]): TireInputsState =>
  actions.reduce(tireInputsReducer, createInitialState())

describe("initial state", () => {
  it("starts with the worked example, imperial units, no errors", () => {
    const s = createInitialState()
    expect(s.units).toBe("imperial")
    expect(s.original.text).toBe("205/55R16")
    expect(s.proposed.text).toBe("225/45R17")
    expect(s.original.fields).toEqual({ width: "205", aspect: "55", rim: "16" })
    expect(s.original.lastValid).toEqual(s.original.size)
    expect(getInputIssues(s.original).hasVisibleErrors).toBe(false)
  })
})

describe("textChanged", () => {
  it("updates size, fields and lastValid live when the text parses and validates", () => {
    const s = run({ type: "textChanged", tire: "proposed", text: "245/40r18" })
    expect(s.proposed.text).toBe("245/40r18")
    expect(s.proposed.size).toEqual({ width: 245, aspect: 40, rim: 18 })
    expect(s.proposed.fields).toEqual({ width: "245", aspect: "40", rim: "18" })
    expect(s.proposed.lastValid).toEqual({ width: 245, aspect: 40, rim: 18 })
  })

  it("keeps size and lastValid while text is incomplete, without showing an error", () => {
    const s = run({ type: "textChanged", tire: "original", text: "22" })
    expect(s.original.text).toBe("22")
    expect(s.original.size).toEqual({ width: 205, aspect: 55, rim: 16 })
    expect(getInputIssues(s.original).textError).toBeUndefined()
  })

  it("updates size but not lastValid when text parses but is out of range", () => {
    const s = run({ type: "textChanged", tire: "original", text: "999/55R16" })
    expect(s.original.size.width).toBe(999)
    expect(s.original.fields.width).toBe("999")
    expect(s.original.lastValid.width).toBe(205)
  })

  it("only affects the targeted tire", () => {
    const s = run({ type: "textChanged", tire: "original", text: "185/65R15" })
    expect(s.proposed).toEqual(createInitialState().proposed)
  })
})

describe("textCommitted", () => {
  it("normalizes valid text", () => {
    const s = run(
      { type: "textChanged", tire: "original", text: " lt265/70 r 17 " },
      { type: "textCommitted", tire: "original" },
    )
    expect(s.original.text).toBe("LT265/70R17")
    expect(s.original.lastValid).toEqual({ width: 265, aspect: 70, rim: 17, prefix: "LT" })
  })

  it("shows a parse error after commit and keeps the typed text", () => {
    const s = run(
      { type: "textChanged", tire: "original", text: "abc" },
      { type: "textCommitted", tire: "original" },
    )
    const issues = getInputIssues(s.original)
    expect(s.original.text).toBe("abc")
    expect(issues.textError).toMatch(/205\/55R16/)
    expect(issues.hasVisibleErrors).toBe(true)
  })

  it("shows field range errors after committing parseable but invalid text", () => {
    const s = run(
      { type: "textChanged", tire: "original", text: "999/55R16" },
      { type: "textCommitted", tire: "original" },
    )
    const issues = getInputIssues(s.original)
    expect(issues.textError).toBeUndefined()
    expect(issues.fieldErrors.width).toMatch(/105–445/)
    expect(issues.fieldErrors.aspect).toBeUndefined()
    expect(issues.hasVisibleErrors).toBe(true)
  })

  it("makes committed text authoritative over stale field drafts", () => {
    const s = run(
      { type: "fieldChanged", tire: "original", field: "width", value: "" },
      { type: "textCommitted", tire: "original" },
    )
    expect(s.original.fields.width).toBe("205")
    expect(s.original.size.width).toBe(205)
    expect(getInputIssues(s.original).hasVisibleErrors).toBe(false)
  })

  it("clears the parse error as soon as the text becomes valid", () => {
    const s = run(
      { type: "textChanged", tire: "original", text: "abc" },
      { type: "textCommitted", tire: "original" },
      { type: "textChanged", tire: "original", text: "215/55R17" },
    )
    expect(getInputIssues(s.original).hasVisibleErrors).toBe(false)
    expect(s.original.lastValid).toEqual({ width: 215, aspect: 55, rim: 17 })
  })
})

describe("fieldChanged / fieldCommitted", () => {
  it("re-syncs text and lastValid when the field is valid", () => {
    const s = run({ type: "fieldChanged", tire: "original", field: "width", value: "225" })
    expect(s.original.text).toBe("225/55R16")
    expect(s.original.lastValid.width).toBe(225)
  })

  it("keeps partial drafts without forcing an error until commit", () => {
    const typing = run({ type: "fieldChanged", tire: "original", field: "width", value: "2" })
    expect(typing.original.fields.width).toBe("2")
    expect(typing.original.lastValid.width).toBe(205)
    expect(getInputIssues(typing.original).fieldErrors.width).toBeUndefined()

    const committed = tireInputsReducer(typing, {
      type: "fieldCommitted",
      tire: "original",
      field: "width",
    })
    expect(getInputIssues(committed.original).fieldErrors.width).toMatch(/105–445/)
  })

  it("treats blank or non-numeric drafts as NaN and leaves text unchanged", () => {
    const s = run(
      { type: "fieldChanged", tire: "original", field: "rim", value: "" },
      { type: "fieldCommitted", tire: "original", field: "rim" },
    )
    expect(s.original.size.rim).toBeNaN()
    expect(s.original.text).toBe("205/55R16")
    expect(getInputIssues(s.original).fieldErrors.rim).toBe("Rim diameter must be a number.")

    const hex = run({ type: "fieldChanged", tire: "original", field: "width", value: "0xff" })
    expect(hex.original.size.width).toBeNaN()
  })

  it("accepts a trailing decimal point while typing", () => {
    const s = run({ type: "fieldChanged", tire: "original", field: "rim", value: "16." })
    expect(s.original.size.rim).toBe(16)
  })

  it("normalizes the draft on commit", () => {
    const s = run(
      { type: "fieldChanged", tire: "original", field: "rim", value: "16.50" },
      { type: "fieldCommitted", tire: "original", field: "rim" },
    )
    expect(s.original.fields.rim).toBe("16.5")
    expect(s.original.text).toBe("205/55R16.5")
  })

  it("clears a field error once the field becomes valid", () => {
    const s = run(
      { type: "fieldChanged", tire: "original", field: "aspect", value: "10" },
      { type: "fieldCommitted", tire: "original", field: "aspect" },
      { type: "fieldChanged", tire: "original", field: "aspect", value: "50" },
    )
    expect(getInputIssues(s.original).fieldErrors.aspect).toBeUndefined()
  })

  it("preserves the prefix on field edits", () => {
    const s = run(
      { type: "textChanged", tire: "proposed", text: "LT265/70R17" },
      { type: "fieldChanged", tire: "proposed", field: "width", value: "285" },
    )
    expect(s.proposed.text).toBe("LT285/70R17")
    expect(s.proposed.lastValid.prefix).toBe("LT")
  })

  it("updates the comparison for a non-standard width and shows a warning (not an error)", () => {
    const s = run({ type: "fieldChanged", tire: "original", field: "width", value: "207" })
    const issues = getInputIssues(s.original)
    expect(s.original.lastValid.width).toBe(207)
    expect(issues.fieldWarnings.width).toMatch(/not a standard size/)
    expect(issues.hasVisibleErrors).toBe(false)
  })
})

describe("stepValue", () => {
  it.each([
    ["width", 205, 1, 210],
    ["width", 205, -1, 200],
    ["width", 207, 1, 210],
    ["width", 207, -1, 205],
    ["width", 445, 1, 445],
    ["width", 105, -1, 105],
    ["width", 500, -1, 445],
    ["aspect", 55, 1, 60],
    ["aspect", 20, -1, 20],
    ["rim", 16, 1, 16.5],
    ["rim", 16.5, -1, 16],
    ["rim", 16.3, 1, 16.5],
    ["rim", 16.3, -1, 16],
    ["rim", 30, 1, 30],
  ] as const)("%s %s step %s → %s", (field, value, direction, expected) => {
    expect(stepValue(field, value, direction)).toBe(expected)
  })
})

describe("fieldStepped", () => {
  it("steps, re-syncs text and updates lastValid", () => {
    const s = run({ type: "fieldStepped", tire: "original", field: "rim", direction: 1 })
    expect(s.original.fields.rim).toBe("16.5")
    expect(s.original.text).toBe("205/55R16.5")
    expect(s.original.lastValid.rim).toBe(16.5)
  })

  it("steps from lastValid when the current value is not a number, and clears the error", () => {
    const s = run(
      { type: "fieldChanged", tire: "original", field: "width", value: "" },
      { type: "fieldCommitted", tire: "original", field: "width" },
      { type: "fieldStepped", tire: "original", field: "width", direction: 1 },
    )
    expect(s.original.size.width).toBe(210)
    expect(getInputIssues(s.original).fieldErrors.width).toBeUndefined()
  })

  it("steps an out-of-range value back into range", () => {
    const s = run(
      { type: "fieldChanged", tire: "original", field: "aspect", value: "99" },
      { type: "fieldCommitted", tire: "original", field: "aspect" },
      { type: "fieldStepped", tire: "original", field: "aspect", direction: -1 },
    )
    expect(s.original.size.aspect).toBe(95)
    expect(getInputIssues(s.original).hasVisibleErrors).toBe(false)
  })
})

describe("reverted", () => {
  it("restores the last valid size and clears errors", () => {
    const s = run(
      { type: "fieldChanged", tire: "original", field: "width", value: "225" },
      { type: "textChanged", tire: "original", text: "garbage" },
      { type: "textCommitted", tire: "original" },
      { type: "reverted", tire: "original" },
    )
    expect(s.original).toEqual(createTireInput({ width: 225, aspect: 55, rim: 16 }))
  })
})

describe("unitsChanged", () => {
  it("changes units without touching tire inputs", () => {
    const before = createInitialState()
    const after = tireInputsReducer(before, { type: "unitsChanged", units: "metric" })
    expect(after.units).toBe("metric")
    expect(after.original).toBe(before.original)
    expect(after.proposed).toBe(before.proposed)
  })
})
