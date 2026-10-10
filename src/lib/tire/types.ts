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

/** Nominal, unloaded dimensions derived from a `TireSize`. Lengths in millimetres. */
export interface TireDimensions {
  size: TireSize
  sectionWidthMm: number
  sidewallMm: number
  rimDiameterMm: number
  overallDiameterMm: number
  circumferenceMm: number
  revsPerKm: number
  revsPerMile: number
}

/** Proposed minus original. `percent` is relative to the original value. */
export interface DimensionDelta {
  absolute: number
  percent: number
}

export type DimensionKey = Exclude<keyof TireDimensions, "size">

export interface TireComparison {
  original: TireDimensions
  proposed: TireDimensions
  deltas: Record<DimensionKey, DimensionDelta>
  /** Approximate change in ride height per corner: half the overall-diameter change. */
  rideHeightChangeMm: number
  /** `C_proposed / C_original`: actual speed (or distance) per unit indicated. */
  speedRatio: number
  /** Speedometer and odometer error in percent; positive means actual exceeds indicated. */
  readingErrorPercent: number
  /** True when overall diameter differs from the original by more than ±3%. */
  fitmentCaution: boolean
}
