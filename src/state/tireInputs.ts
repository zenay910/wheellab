import {
  DEFAULT_ORIGINAL,
  DEFAULT_PROPOSED,
  TIRE_LIMITS,
  formatTireSize,
  parseTireSize,
  validateTireSize,
  type TireField,
  type TireSize,
  type UnitSystem,
} from "@/lib/tire"

export type TireKey = "original" | "proposed"
export type ErrorSlot = "text" | TireField

const FIELDS = ["width", "aspect", "rim"] as const satisfies readonly TireField[]

export interface TireInputState {
  /** Full size string as typed. */
  text: string
  /** Per-field drafts as typed, so partial input ("2" on the way to "225") is not forced into `size`. */
  fields: Record<TireField, string>
  /** Current values; may be invalid (NaN for blank / non-numeric drafts). */
  size: TireSize
  /** Most recent size that parsed and validated. Downstream comparison uses this. */
  lastValid: TireSize
  /** Errors are only shown after a commit (blur / Enter); cleared once the control becomes valid. */
  showErrors: Record<ErrorSlot, boolean>
}

export interface TireInputsState {
  units: UnitSystem
  original: TireInputState
  proposed: TireInputState
}

export type TireInputsAction =
  | { type: "textChanged"; tire: TireKey; text: string }
  | { type: "textCommitted"; tire: TireKey }
  | { type: "fieldChanged"; tire: TireKey; field: TireField; value: string }
  | { type: "fieldCommitted"; tire: TireKey; field: TireField }
  | { type: "fieldStepped"; tire: TireKey; field: TireField; direction: 1 | -1 }
  | { type: "reverted"; tire: TireKey }
  | { type: "unitsChanged"; units: UnitSystem }

const NO_ERRORS: Record<ErrorSlot, boolean> = { text: false, width: false, aspect: false, rim: false }

function fieldStrings(size: TireSize): Record<TireField, string> {
  return { width: String(size.width), aspect: String(size.aspect), rim: String(size.rim) }
}

export function createTireInput(size: TireSize): TireInputState {
  return {
    text: formatTireSize(size),
    fields: fieldStrings(size),
    size,
    lastValid: size,
    showErrors: NO_ERRORS,
  }
}

export function createInitialState(units: UnitSystem = "imperial"): TireInputsState {
  return {
    units,
    original: createTireInput(DEFAULT_ORIGINAL),
    proposed: createTireInput(DEFAULT_PROPOSED),
  }
}

function parseDraft(value: string): number {
  return /^\s*\d+(\.\d*)?\s*$/.test(value) ? Number(value) : NaN
}

/** Next value on the step grid in `direction`, clamped to the field limits. */
export function stepValue(field: TireField, value: number, direction: 1 | -1): number {
  const { min, max, step } = TIRE_LIMITS[field]
  const units = value / step
  const next =
    direction > 0
      ? (Math.floor(units + 1e-9) + 1) * step
      : (Math.ceil(units - 1e-9) - 1) * step
  return Math.min(max, Math.max(min, next))
}

/** Clears error flags for controls that are now valid and promotes a fully valid size to `lastValid`. */
function settle(state: TireInputState): TireInputState {
  const validation = validateTireSize(state.size)
  const showErrors = { ...state.showErrors }
  for (const field of FIELDS) {
    if (!validation.errors.some((e) => e.field === field)) showErrors[field] = false
  }
  if (parseTireSize(state.text).ok) showErrors.text = false

  return {
    ...state,
    showErrors,
    lastValid: validation.valid ? state.size : state.lastValid,
  }
}

function withFieldValue(state: TireInputState, field: TireField, draft: string): TireInputState {
  const size = { ...state.size, [field]: parseDraft(draft) }
  const allFinite = FIELDS.every((f) => Number.isFinite(size[f]))
  return settle({
    ...state,
    fields: { ...state.fields, [field]: draft },
    size,
    text: allFinite ? formatTireSize(size) : state.text,
  })
}

function updateTire(state: TireInputState, action: TireInputsAction): TireInputState {
  switch (action.type) {
    case "textChanged": {
      const parsed = parseTireSize(action.text)
      if (!parsed.ok) return { ...state, text: action.text }
      return settle({
        ...state,
        text: action.text,
        size: parsed.value,
        fields: fieldStrings(parsed.value),
      })
    }

    case "textCommitted": {
      const parsed = parseTireSize(state.text)
      if (!parsed.ok) return { ...state, showErrors: { ...state.showErrors, text: true } }
      return settle({
        ...state,
        text: formatTireSize(parsed.value),
        size: parsed.value,
        fields: fieldStrings(parsed.value),
        showErrors: { text: false, width: true, aspect: true, rim: true },
      })
    }

    case "fieldChanged":
      return withFieldValue(state, action.field, action.value)

    case "fieldCommitted": {
      const value = state.size[action.field]
      return settle({
        ...state,
        fields: Number.isFinite(value)
          ? { ...state.fields, [action.field]: String(value) }
          : state.fields,
        showErrors: { ...state.showErrors, [action.field]: true },
      })
    }

    case "fieldStepped": {
      const current = state.size[action.field]
      const base = Number.isFinite(current) ? current : state.lastValid[action.field]
      const next = stepValue(action.field, base, action.direction)
      return withFieldValue(state, action.field, String(next))
    }

    case "reverted":
      return createTireInput(state.lastValid)

    default:
      return state
  }
}

export function tireInputsReducer(
  state: TireInputsState,
  action: TireInputsAction,
): TireInputsState {
  if (action.type === "unitsChanged") return { ...state, units: action.units }
  return { ...state, [action.tire]: updateTire(state[action.tire], action) }
}

export interface InputIssues {
  textError?: string
  fieldErrors: Partial<Record<TireField, string>>
  fieldWarnings: Partial<Record<TireField, string>>
  /** Any error is visible (text or field); the comparison is showing `lastValid`. */
  hasVisibleErrors: boolean
}

/** Messages to display for one tire's inputs, honoring the show-after-commit flags. */
export function getInputIssues(state: TireInputState): InputIssues {
  const parsed = parseTireSize(state.text)
  const validation = validateTireSize(state.size)

  const textError = state.showErrors.text && !parsed.ok ? parsed.error.message : undefined

  const fieldErrors: InputIssues["fieldErrors"] = {}
  for (const issue of validation.errors) {
    if (state.showErrors[issue.field]) fieldErrors[issue.field] = issue.message
  }

  const fieldWarnings: InputIssues["fieldWarnings"] = {}
  for (const issue of validation.warnings) fieldWarnings[issue.field] = issue.message

  return {
    textError,
    fieldErrors,
    fieldWarnings,
    hasVisibleErrors: textError !== undefined || Object.keys(fieldErrors).length > 0,
  }
}
