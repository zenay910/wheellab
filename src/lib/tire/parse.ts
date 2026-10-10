import type { ParseResult, TirePrefix } from "./types"

const NUM = String.raw`\d+(?:\.\d+)?`

/**
 * prefix? width / aspect separator rim [service description] [XL|RF|SL]
 * Separator: R, ZR, legacy speed-letter R (VR, HR…), D or B (bias), "-", or whitespace.
 */
const METRIC_PATTERN = new RegExp(
  String.raw`^(?<prefix>P|LT)?\s*(?<width>${NUM})\s*\/\s*(?<aspect>${NUM})` +
    String.raw`\s*(?:[HVWYZ]?R|[DB]|-|\s)\s*(?<rim>${NUM})` +
    String.raw`(?:\s+\d{2,3}(?:\/\d{2,3})?[A-Z]{1,2})?(?:\s+(?:XL|RF|SL))?$`,
)

const FLOTATION_PATTERN = new RegExp(String.raw`^(?:LT)?\s*${NUM}\s*X\s*${NUM}`)

/**
 * Parses a metric tire size string such as `205/55R16`, `P215/65R15`, `LT265/70R17`,
 * `205/55-16`, or `205 / 55 R 16`. Only checks syntax; use `validateTireSize` for ranges.
 */
export function parseTireSize(input: string): ParseResult {
  const normalized = input.trim().toUpperCase()

  if (normalized === "") {
    return { ok: false, error: { code: "empty", message: "Enter a tire size, e.g. 205/55R16." } }
  }

  if (FLOTATION_PATTERN.test(normalized)) {
    return {
      ok: false,
      error: {
        code: "unsupported-format",
        message: "Flotation sizes (e.g. 33x12.50R17) are not supported yet. Use metric, e.g. 285/70R17.",
      },
    }
  }

  const groups = METRIC_PATTERN.exec(normalized)?.groups
  if (!groups) {
    return {
      ok: false,
      error: { code: "invalid-format", message: "Use width/aspect R rim, e.g. 205/55R16." },
    }
  }

  return {
    ok: true,
    value: {
      width: Number(groups.width),
      aspect: Number(groups.aspect),
      rim: Number(groups.rim),
      ...(groups.prefix ? { prefix: groups.prefix as TirePrefix } : {}),
    },
  }
}
