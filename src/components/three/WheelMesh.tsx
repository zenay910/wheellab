import { useEffect, useMemo } from "react"
import * as THREE from "three"

import type { TireDimensions } from "@/lib/tire"

import {
  hubMaterial,
  wheelAccentMaterial,
  wheelBarrelMaterial,
  wheelFaceMaterial,
} from "./materials"
import { computeWheelMetrics } from "./wheelMetrics"

interface WheelMeshProps {
  dimensions: TireDimensions
  role: "original" | "proposed"
}

/**
 * Barrel, face, spokes, and hub — sized from rim diameter and section width.
 * Axle is local Y (maps to world Z after the parent tire rotation).
 */
export function WheelMesh({ dimensions, role }: WheelMeshProps) {
  const m = useMemo(() => computeWheelMetrics(dimensions), [dimensions])
  const accent = role === "proposed"

  const faceGeometry = useMemo(() => {
    const inner = m.hubRadius * 1.15
    const outer = m.rimRadius * 0.92
    return new THREE.RingGeometry(inner, outer, 64)
  }, [m.hubRadius, m.rimRadius])

  const accentRingGeometry = useMemo(
    () => new THREE.RingGeometry(m.rimRadius * 0.78, m.rimRadius * 0.92, 64),
    [m.rimRadius],
  )

  useEffect(() => {
    return () => {
      faceGeometry.dispose()
      accentRingGeometry.dispose()
    }
  }, [faceGeometry, accentRingGeometry])

  return (
    <group>
      {/* Barrel */}
      <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m.rimRadius, m.rimRadius, m.rimWidth, 64, 1, false]} />
        <meshStandardMaterial {...wheelBarrelMaterial} />
      </mesh>

      {/* Outboard face (camera side, +X) */}
      <mesh
        geometry={faceGeometry}
        position={[m.rimWidth / 2 + 0.0008, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        castShadow
      >
        <meshStandardMaterial {...wheelFaceMaterial} side={THREE.DoubleSide} />
      </mesh>

      {accent && (
        <mesh
          geometry={accentRingGeometry}
          position={[m.rimWidth / 2 + 0.0012, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <meshStandardMaterial {...wheelAccentMaterial} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Inboard face */}
      <mesh
        geometry={faceGeometry}
        position={[-(m.rimWidth / 2 + 0.0008), 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <meshStandardMaterial {...wheelBarrelMaterial} side={THREE.DoubleSide} />
      </mesh>

      <Spokes metrics={m} />

      {/* Hub cap */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[m.hubRadius, m.hubRadius, m.rimWidth * 1.02, 32]} />
        <meshStandardMaterial {...hubMaterial} />
      </mesh>
      <mesh position={[m.rimWidth / 2 + 0.0015, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[m.hubRadius * 0.85, 32]} />
        <meshStandardMaterial {...hubMaterial} />
      </mesh>
    </group>
  )
}

function Spokes({ metrics: m }: { metrics: ReturnType<typeof computeWheelMetrics> }) {
  const spokes = useMemo(() => {
    const inner = m.hubRadius * 1.2
    const outer = m.rimRadius * 0.88
    const length = outer - inner
    const thickness = m.rimWidth * 0.22
    const depth = m.rimWidth * 0.55
    return Array.from({ length: m.spokeCount }, (_, i) => {
      const angle = (i / m.spokeCount) * Math.PI * 2
      return { angle, length, inner, thickness, depth }
    })
  }, [m])

  return (
    <group>
      {spokes.map(({ angle, length, inner, thickness, depth }, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * (inner + length / 2),
            0,
            Math.sin(angle) * (inner + length / 2),
          ]}
          rotation={[0, angle, 0]}
          castShadow
        >
          <boxGeometry args={[length, depth, thickness]} />
          <meshStandardMaterial {...wheelFaceMaterial} />
        </mesh>
      ))}
    </group>
  )
}
