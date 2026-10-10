/** Optional service-type prefix on metric sizes (P-metric passenger, LT light truck). */
export type TirePrefix = "P" | "LT"

/** A metric tire size, e.g. `205/55R16` → `{ width: 205, aspect: 55, rim: 16 }`. */
export interface TireSize {
  /** Section width in millimetres. */
  width: number
  /** Aspect ratio: sidewall height as a percentage of section width. */
  aspect: number
  /** Rim diameter in inches. */
  rim: number
  prefix?: TirePrefix
}

export type TireField = "width" | "aspect" | "rim"

export type ParseErrorCode = "empty" | "unsupported-format" | "invalid-format"

export interface ParseError {
  code: ParseErrorCode
  message: string
}

export type ParseResult =
  | { ok: true; value: TireSize }
  | { ok: false; error: ParseError }

export type ValidationIssueCode =
  | "not-a-number"
  | "not-whole-number"
  | "out-of-range"
  | "invalid-increment"
  | "non-standard-step"

export interface ValidationIssue {
  field: TireField
  code: ValidationIssueCode
  message: string
}

export interface ValidationResult {
  /** True when there are no errors. Warnings do not affect validity. */
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}
