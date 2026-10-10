import { MM_PER_INCH, MM_PER_KM, MM_PER_MILE } from "./geometry"
import type { TireSize } from "./types"

export type UnitSystem = "metric" | "imperial"

export const KM_PER_MILE = MM_PER_MILE / MM_PER_KM

const MINUS = "\u2212"

const formatters = new Map<number, Intl.NumberFormat>()

/** Fixed-decimal number with thousands separators (en-US, so output is deterministic). */
export function formatNumber(value: number, decimals: number): string {
  let formatter = formatters.get(decimals)
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      signDisplay: "negative",
    })
    formatters.set(decimals, formatter)
  }
  return formatter.format(value).replace("-", MINUS)
}

/** Like `formatNumber` but always signed (`+1.2`, `−1.2`); values that round to zero are unsigned. */
export function formatSigned(value: number, decimals: number): string {
  const text = formatNumber(Math.abs(value), decimals)
  if (Number(text.replace(/,/g, "")) === 0) return text
  return (value < 0 ? MINUS : "+") + text
}

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH
}

export function convertSpeed(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value
  return from === "metric" ? value / KM_PER_MILE : value * KM_PER_MILE
}

const LENGTH = {
  metric: { unit: "mm", decimals: 1, fromMm: (mm: number) => mm },
  imperial: { unit: "in", decimals: 2, fromMm: mmToInches },
} as const

/** `631.9 mm` or `24.88 in`. */
export function formatLength(mm: number, system: UnitSystem): string {
  const { unit, decimals, fromMm } = LENGTH[system]
  return `${formatNumber(fromMm(mm), decimals)} ${unit}`
}

/** Signed length change: `+2.4 mm` or `+0.09 in`. */
export function formatLengthDelta(mm: number, system: UnitSystem): string {
  const { unit, decimals, fromMm } = LENGTH[system]
  return `${formatSigned(fromMm(mm), decimals)} ${unit}`
}

/** Speed already expressed in `system` units: `60.2 mph` or `96.6 km/h`. */
export function formatSpeed(value: number, system: UnitSystem, decimals = 1): string {
  return `${formatNumber(value, decimals)} ${system === "metric" ? "km/h" : "mph"}`
}

/** Distance already expressed in `system` units: `100.4 km` or `100.4 mi`. */
export function formatDistance(value: number, system: UnitSystem, decimals = 1): string {
  return `${formatNumber(value, decimals)} ${system === "metric" ? "km" : "mi"}`
}

/** `503.7 rev/km` or `810.7 rev/mi`, picking the matching field for `system`. */
export function formatRevs(
  revs: { revsPerKm: number; revsPerMile: number },
  system: UnitSystem,
): string {
  return system === "metric"
    ? `${formatNumber(revs.revsPerKm, 1)} rev/km`
    : `${formatNumber(revs.revsPerMile, 1)} rev/mi`
}

/** Signed percent: `+0.38%`, `−10.20%`, `0.00%`. */
export function formatPercentDelta(percent: number, decimals = 2): string {
  return `${formatSigned(percent, decimals)}%`
}

/** Canonical size string: `205/55R16`, `LT215/85R16.5`. */
export function formatTireSize(size: TireSize): string {
  return `${size.prefix ?? ""}${size.width}/${size.aspect}R${size.rim}`
}
