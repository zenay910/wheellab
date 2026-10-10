import * as THREE from "three"
import type { TireDimensions } from "@/lib/tire"

import { MM_TO_SCENE } from "./tireProfile"
import { computeWheelMetrics } from "./wheelMetrics"

/** Cross-section landmarks in millimetres (radius from axle, half-widths along the axle). */
export interface TireShape {
  outerR: number
  rimR: number
  sidewall: number
  sectionHalf: number
  treadHalf: number
  beadHalf: number
}

const ANGULAR_SEGMENTS = 360
const TREAD_STEPS = 64
const CROWN_MM = 2
const TREAD_PITCH_MM = 40

export function tireShape(dims: TireDimensions): TireShape {
  const outerR = dims.overallDiameterMm / 2
  const rimR = dims.rimDiameterMm / 2
  const sectionHalf = dims.sectionWidthMm / 2
  return {
    outerR,
    rimR,
    sidewall: outerR - rimR,
    sectionHalf,
    treadHalf: sectionHalf * 0.8,
    beadHalf: computeWheelMetrics(dims).rimWidth / MM_TO_SCENE / 2,
  }
}

/** Sidewall from bead to shoulder on the +axial side, as (axial, radius) points. */
function sidewallPoints(s: TireShape, samples = 28): THREE.Vector2[] {
  const H = s.sidewall
  const sidewall = new THREE.SplineCurve([
    new THREE.Vector2(s.beadHalf, s.rimR),
    new THREE.Vector2(s.beadHalf + (s.sectionHalf - s.beadHalf) * 0.6, s.rimR + H * 0.12),
    new THREE.Vector2(s.sectionHalf, s.rimR + H * 0.45),
    new THREE.Vector2(s.sectionHalf * 0.97, s.rimR + H * 0.72),
    new THREE.Vector2(s.treadHalf + (s.sectionHalf - s.treadHalf) * 0.75, s.outerR - H * 0.1),
  ]).getPoints(samples)

  const shoulderStart = sidewall[sidewall.length - 1]
  const shoulder = new THREE.QuadraticBezierCurve(
    shoulderStart,
    new THREE.Vector2(shoulderStart.x, s.outerR - CROWN_MM),
    new THREE.Vector2(s.treadHalf, s.outerR - CROWN_MM),
  ).getPoints(8)

  return [...sidewall, ...shoulder.slice(1)]
}

/** 0 = tread surface, 1 = full groove depth. Pattern repeats a whole number of pitches per turn. */
function treadGroove(u: number, pitch: number): number {
  const au = Math.abs(u)
  const side = u > 0 ? 0.5 : 0
  if (Math.abs(au - 0.2) < 0.045 || Math.abs(au - 0.58) < 0.05) return 1
  if (au > 0.58) return frac(pitch + side) < 0.25 ? 1 : 0
  if (au > 0.2) return frac(pitch + u * 1.4 + side * 0.5) < 0.12 ? 0.55 : 0
  return 0
}

function frac(x: number): number {
  return x - Math.floor(x)
}

/**
 * Closed tire body revolved around the axle (Z in the returned geometry), in scene units.
 * Sidewall bulge, rounded shoulders, slight crown, and a molded tread pattern.
 */
export function buildTireGeometry(dims: TireDimensions): THREE.BufferGeometry {
  const s = tireShape(dims)
  const side = sidewallPoints(s)

  const tread: THREE.Vector2[] = []
  for (let i = 1; i < TREAD_STEPS; i++) {
    const a = -s.treadHalf + (i / TREAD_STEPS) * 2 * s.treadHalf
    const u = a / s.treadHalf
    tread.push(new THREE.Vector2(a, s.outerR - CROWN_MM * u * u))
  }

  // Closed cross-section loop as (axial, radius): bore, -axial sidewall, tread, +axial sidewall.
  const profile = [
    new THREE.Vector2(s.beadHalf, s.rimR - 1),
    new THREE.Vector2(-s.beadHalf, s.rimR - 1),
    ...side.map((p) => new THREE.Vector2(-p.x, p.y)),
    ...tread,
    ...[...side].reverse(),
  ]

  const pitches = Math.round((2 * Math.PI * s.outerR) / TREAD_PITCH_MM)
  const depth = Math.min(8, s.sidewall * 0.08)
  const treadFloor = s.outerR - CROWN_MM - 0.01
  const n = ANGULAR_SEGMENTS
  const m = profile.length

  // Indexed grid wrapping in both directions: no seam duplicates, so normals stay smooth.
  const positions = new Float32Array(n * m * 3)
  for (let i = 0; i < n; i++) {
    const phi = (i / n) * Math.PI * 2
    const cos = Math.cos(phi)
    const sin = Math.sin(phi)
    const pitch = (i / n) * pitches
    for (let j = 0; j < m; j++) {
      const a = profile[j].x
      let r = profile[j].y
      if (r >= treadFloor && Math.abs(a) <= s.treadHalf) {
        r -= depth * treadGroove(a / s.treadHalf, pitch)
      }
      const k = (i * m + j) * 3
      positions[k] = r * cos * MM_TO_SCENE
      positions[k + 1] = r * sin * MM_TO_SCENE
      positions[k + 2] = a * MM_TO_SCENE
    }
  }

  const indices = new Uint32Array(n * m * 6)
  let t = 0
  for (let i = 0; i < n; i++) {
    const i1 = (i + 1) % n
    for (let j = 0; j < m; j++) {
      const j1 = (j + 1) % m
      const a = i * m + j
      const b = i1 * m + j
      const c = i1 * m + j1
      const d = i * m + j1
      indices[t++] = a
      indices[t++] = b
      indices[t++] = d
      indices[t++] = b
      indices[t++] = c
      indices[t++] = d
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()
  return geometry
}

/** Thin band hugging the +axial sidewall, used as a role-colored identification stripe. */
export function buildSidewallStripeGeometry(dims: TireDimensions): THREE.BufferGeometry {
  const s = tireShape(dims)
  const lo = s.rimR + s.sidewall * 0.56
  const hi = s.rimR + s.sidewall * 0.63
  const band = sidewallPoints(s, 120)
    .filter((p) => p.y >= lo && p.y <= hi)
    .map((p) => new THREE.Vector2(p.y, p.x + 0.6))
  if (band.length < 2) return new THREE.BufferGeometry()

  const geometry = new THREE.LatheGeometry(band, 128)
  geometry.scale(MM_TO_SCENE, MM_TO_SCENE, MM_TO_SCENE)
  geometry.rotateX(Math.PI / 2)
  return geometry
}
