/** Shared PBR tuning for the comparison stage (no CDN textures). */

export const rubberMaterial = {
  color: "#141414",
  roughness: 0.88,
  metalness: 0.02,
  envMapIntensity: 0.35,
} as const

export const treadGrooveMaterial = {
  color: "#0a0a0a",
  roughness: 0.95,
  metalness: 0,
} as const

export const wheelBarrelMaterial = {
  color: "#2a2a2a",
  roughness: 0.45,
  metalness: 0.88,
  envMapIntensity: 0.9,
} as const

export const wheelFaceMaterial = {
  color: "#3d3d3d",
  roughness: 0.32,
  metalness: 0.92,
  envMapIntensity: 1,
} as const

export const wheelAccentMaterial = {
  color: "#5eb8e8",
  roughness: 0.28,
  metalness: 0.9,
  envMapIntensity: 1.1,
} as const

export const hubMaterial = {
  color: "#1f1f1f",
  roughness: 0.55,
  metalness: 0.75,
} as const
