import * as THREE from "three"
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js"

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

const ANGULAR_SEGMENTS = 480
const TREAD_STEPS = 96
const CROWN_MM = 2
const TREAD_PITCH_MM = 34

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
function sidewallPoints(s: TireShape): THREE.Vector2[] {
  const H = s.sidewall
  const sidewall = new THREE.SplineCurve([
    new THREE.Vector2(s.beadHalf, s.rimR),
    new THREE.Vector2(s.beadHalf + (s.sectionHalf - s.beadHalf) * 0.6, s.rimR + H * 0.12),
    new THREE.Vector2(s.sectionHalf, s.rimR + H * 0.45),
    new THREE.Vector2(s.sectionHalf * 0.97, s.rimR + H * 0.72),
    new THREE.Vector2(s.treadHalf + (s.sectionHalf - s.treadHalf) * 0.75, s.outerR - H * 0.1),
  ]).getPoints(56)

  const shoulderStart = sidewall[sidewall.length - 1]
  const shoulder = new THREE.QuadraticBezierCurve(
    shoulderStart,
    new THREE.Vector2(shoulderStart.x, s.outerR - CROWN_MM),
    new THREE.Vector2(s.treadHalf, s.outerR - CROWN_MM),
  ).getPoints(16)

  return [...sidewall, ...shoulder.slice(1)]
}

/** 0 = tread surface, 1 = full groove depth. Pattern repeats a whole number of pitches per turn. */
function treadGroove(u: number, pitch: number): number {
  const au = Math.abs(u)
  const side = u > 0 ? 0.5 : 0
  if (Math.abs(au - 0.2) < 0.045 || Math.abs(au - 0.58) < 0.05) return 1
  if (au > 0.58) return frac(pitch + side) < 0.2 ? 1 : 0
  if (au > 0.2) return frac(pitch + u * 1.4 + side * 0.5) < 0.09 ? 0.55 : 0
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

  // Counter-clockwise loop in (radius, axial) so the lathe faces point outward.
  const loopAxialRadius = [
    ...side.map((p) => new THREE.Vector2(-p.x, p.y)),
    ...tread,
    ...[...side].reverse(),
  ]
  const profile = [
    new THREE.Vector2(s.rimR - 1, s.beadHalf),
    new THREE.Vector2(s.rimR - 1, -s.beadHalf),
    ...loopAxialRadius.map((p) => new THREE.Vector2(p.y, p.x)),
    new THREE.Vector2(s.rimR - 1, s.beadHalf),
  ]

  const lathe = new THREE.LatheGeometry(profile, ANGULAR_SEGMENTS)
  lathe.deleteAttribute("normal")
  lathe.deleteAttribute("uv")
  const geometry = mergeVertices(lathe)
  lathe.dispose()

  const pitches = Math.round((2 * Math.PI * s.outerR) / TREAD_PITCH_MM)
  const depth = Math.min(8, s.sidewall * 0.08)
  const treadFloor = s.outerR - CROWN_MM - 0.01
  const pos = geometry.getAttribute("position") as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const a = pos.getY(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    if (r < treadFloor || Math.abs(a) > s.treadHalf) continue
    const g = treadGroove(a / s.treadHalf, (Math.atan2(x, z) / (2 * Math.PI)) * pitches)
    if (g === 0) continue
    const k = (r - depth * g) / r
    pos.setX(i, x * k)
    pos.setZ(i, z * k)
  }

  geometry.computeVertexNormals()
  geometry.scale(MM_TO_SCENE, MM_TO_SCENE, MM_TO_SCENE)
  geometry.rotateX(Math.PI / 2)
  return geometry
}

/** Thin band hugging the +axial sidewall, used as a role-colored identification stripe. */
export function buildSidewallStripeGeometry(dims: TireDimensions): THREE.BufferGeometry {
  const s = tireShape(dims)
  const lo = s.rimR + s.sidewall * 0.56
  const hi = s.rimR + s.sidewall * 0.63
  const band = sidewallPoints(s)
    .filter((p) => p.y >= lo && p.y <= hi)
    .map((p) => new THREE.Vector2(p.y, p.x + 0.6))
  if (band.length < 2) return new THREE.BufferGeometry()

  const geometry = new THREE.LatheGeometry(band, 256)
  geometry.scale(MM_TO_SCENE, MM_TO_SCENE, MM_TO_SCENE)
  geometry.rotateX(Math.PI / 2)
  return geometry
}
