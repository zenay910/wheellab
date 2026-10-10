/** Shared PBR tuning for the comparison stage (no CDN textures). */

export type TireRole = "original" | "proposed"

/** Matches the stage legend swatches (`--muted-foreground` / `--proposed` in dark mode). */
export const ROLE_COLOR: Record<TireRole, string> = {
  original: "#a3a3a3",
  proposed: "#5eb8e8",
}

export interface ScenePalette {
  /** Matches `--stage` so fog fades the floor into the stage background. */
  stage: string
  gridCell: string
  gridSection: string
  /** Guide lines and labels; darker in light mode for contrast on the pale stage. */
  guide: Record<TireRole, string>
}

export const SCENE_PALETTE: Record<"light" | "dark", ScenePalette> = {
  dark: {
    stage: "#070707",
    gridCell: "#1c1c1c",
    gridSection: "#2c2c2c",
    guide: ROLE_COLOR,
  },
  light: {
    stage: "#f4f4f4",
    gridCell: "#e0e0e0",
    gridSection: "#c8c8c8",
    guide: { original: "#6b6b6b", proposed: "#1f6aa5" },
  },
}

export const rubberMaterial = {
  color: "#161616",
  roughness: 0.86,
  metalness: 0,
  envMapIntensity: 0.45,
} as const

/** Wheel face finish per role so the two wheels read differently side by side. */
export const wheelFinishMaterial: Record<
  TireRole,
  { color: string; roughness: number; metalness: number; envMapIntensity: number }
> = {
  original: { color: "#6a6e74", roughness: 0.4, metalness: 0.7, envMapIntensity: 1 },
  proposed: { color: "#d4d8dd", roughness: 0.28, metalness: 0.85, envMapIntensity: 1.3 },
}

export const wheelBarrelMaterial = {
  color: "#2b2b2b",
  roughness: 0.5,
  metalness: 0.85,
  envMapIntensity: 0.7,
} as const

export const brakeDiscMaterial = {
  color: "#6e6e6e",
  roughness: 0.55,
  metalness: 0.8,
  envMapIntensity: 0.6,
} as const

export const hubMaterial = {
  color: "#1f1f1f",
  roughness: 0.5,
  metalness: 0.75,
} as const
