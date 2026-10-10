import type { TireField, TireSize, ValidationIssue, ValidationResult } from "./types"

export const TIRE_LIMITS = {
  width: { min: 105, max: 445, step: 5, unit: "mm" },
  aspect: { min: 20, max: 95, step: 5, unit: "" },
  rim: { min: 10, max: 30, step: 0.5, unit: "in" },
} as const satisfies Record<TireField, { min: number; max: number; step: number; unit: string }>

const LABELS: Record<TireField, string> = {
  width: "Width",
  aspect: "Aspect ratio",
  rim: "Rim diameter",
}

function rangeText(field: TireField): string {
  const { min, max, unit } = TIRE_LIMITS[field]
  return unit ? `${min}–${max} ${unit}` : `${min}–${max}`
}

/**
 * Checks a tire size against the MVP input ranges.
 * Errors: non-finite values, non-integer width/aspect, out of range, rim not in 0.5 in increments.
 * Warnings: width not on a 5 mm step (valid but non-standard).
 */
export function validateTireSize(size: TireSize): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  for (const field of ["width", "aspect", "rim"] as const) {
    const value = size[field]
    const label = LABELS[field]
    const { min, max } = TIRE_LIMITS[field]

    if (!Number.isFinite(value)) {
      errors.push({ field, code: "not-a-number", message: `${label} must be a number.` })
      continue
    }

    if (field !== "rim" && !Number.isInteger(value)) {
      errors.push({ field, code: "not-whole-number", message: `${label} must be a whole number.` })
      continue
    }

    if (value < min || value > max) {
      errors.push({
        field,
        code: "out-of-range",
        message: `${label} must be between ${rangeText(field)}.`,
      })
      continue
    }

    if (field === "rim" && !Number.isInteger(value * 2)) {
      errors.push({
        field,
        code: "invalid-increment",
        message: `${label} must be in 0.5 in increments.`,
      })
    }
  }

  if (
    !errors.some((issue) => issue.field === "width") &&
    size.width % TIRE_LIMITS.width.step !== 0
  ) {
    warnings.push({
      field: "width",
      code: "non-standard-step",
      message: `Width ${size.width} mm is not a standard size (usually a multiple of 5 mm).`,
    })
  }

  return { valid: errors.length === 0, errors, warnings }
}
