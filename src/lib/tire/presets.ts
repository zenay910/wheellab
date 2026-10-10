import type { TireSize } from "./types"

export type PresetCategory = "compact" | "sedan" | "performance" | "suv" | "truck"

export interface TirePreset {
  size: TireSize
  category: PresetCategory
}

/** Initial comparison: the PROJECT.md worked example. */
export const DEFAULT_ORIGINAL: TireSize = { width: 205, aspect: 55, rim: 16 }
export const DEFAULT_PROPOSED: TireSize = { width: 225, aspect: 45, rim: 17 }

/** Common metric sizes. Plus-size suggestions are T22 (P2). */
export const TIRE_PRESETS: readonly TirePreset[] = [
  { category: "compact", size: { width: 185, aspect: 65, rim: 15 } },
  { category: "compact", size: { width: 195, aspect: 65, rim: 15 } },
  { category: "compact", size: { width: 205, aspect: 55, rim: 16 } },
  { category: "sedan", size: { width: 215, aspect: 55, rim: 17 } },
  { category: "sedan", size: { width: 225, aspect: 45, rim: 17 } },
  { category: "sedan", size: { width: 235, aspect: 45, rim: 18 } },
  { category: "performance", size: { width: 245, aspect: 40, rim: 18 } },
  { category: "performance", size: { width: 255, aspect: 35, rim: 19 } },
  { category: "performance", size: { width: 275, aspect: 35, rim: 20 } },
  { category: "suv", size: { width: 225, aspect: 65, rim: 17 } },
  { category: "suv", size: { width: 235, aspect: 60, rim: 18 } },
  { category: "suv", size: { width: 255, aspect: 55, rim: 19 } },
  { category: "truck", size: { width: 265, aspect: 70, rim: 17, prefix: "LT" } },
  { category: "truck", size: { width: 275, aspect: 60, rim: 20 } },
  { category: "truck", size: { width: 285, aspect: 70, rim: 17, prefix: "LT" } },
]
