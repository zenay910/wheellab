import { useEffect, useMemo } from "react"
import * as THREE from "three"

import { computeDimensions, type TireDimensions } from "@/lib/tire"

import {
  ROLE_COLOR,
  brakeDiscMaterial,
  hubMaterial,
  wheelBarrelMaterial,
  wheelFinishMaterial,
  type TireRole,
} from "./materials"
import { computeWheelMetrics, type WheelMetrics } from "./wheelMetrics"

interface WheelMeshProps {
  dimensions: TireDimensions
  role: TireRole
}

const SPOKE_PAIRS = 5
const LUG_COUNT = 5

/** Twin-spoke wheel with brake disc and role-colored caliper — axle along Z (matches tire). */
export function WheelMesh({ dimensions, role }: WheelMeshProps) {
  const { size } = dimensions
  const m = useMemo(() => computeWheelMetrics(computeDimensions(size)), [size])
  const spokeGeometry = useMemo(() => buildSpokeGeometry(m), [m])
  useEffect(() => () => spokeGeometry.dispose(), [spokeGeometry])

  const finish = wheelFinishMaterial[role]
  const half = m.rimWidth / 2
  const lip = m.rimRadius * 0.035
  const spokeZ = half * 0.45
  const spokeLength = m.rimRadius * 0.93 - m.hubRadius * 0.9
  const spokeTilt = Math.atan2(half * 0.3, spokeLength)
  const discRadius = m.rimRadius * 0.74
  const discZ = -half * 0.25
  const discThickness = m.rimWidth * 0.12

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[m.rimRadius * 0.98, m.rimRadius * 0.98, m.rimWidth, 72, 1, true]} />
        <meshStandardMaterial {...wheelBarrelMaterial} side={THREE.DoubleSide} />
      </mesh>

      {[half, -half].map((z) => (
        <mesh key={z} position={[0, 0, z]} castShadow>
          <torusGeometry args={[m.rimRadius + lip * 0.3, lip, 14, 96]} />
          <meshStandardMaterial {...finish} />
        </mesh>
      ))}
      <mesh position={[0, 0, half * 0.92]}>
        <ringGeometry args={[m.rimRadius * 0.88, m.rimRadius * 0.99, 96]} />
        <meshStandardMaterial {...finish} side={THREE.DoubleSide} />
      </mesh>

      {Array.from({ length: SPOKE_PAIRS * 2 }, (_, i) => {
        const pair = Math.floor(i / 2)
        const offset = (i % 2 === 0 ? -1 : 1) * 0.11
        const angle = (pair / SPOKE_PAIRS) * Math.PI * 2 + Math.PI / 2 + offset
        return (
          <group key={i} rotation={[0, 0, angle]} position={[0, 0, spokeZ]}>
            <mesh
              geometry={spokeGeometry}
              rotation={[0, spokeTilt, 0]}
              castShadow
              receiveShadow
              dispose={null}
            >
              <meshStandardMaterial {...finish} />
            </mesh>
          </group>
        )
      })}

      <mesh position={[0, 0, half * 0.62]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[m.hubRadius * 1.05, m.hubRadius * 1.15, half * 0.5, 40]} />
        <meshStandardMaterial {...finish} />
      </mesh>
      <mesh position={[0, 0, half * 0.88]}>
        <circleGeometry args={[m.hubRadius * 0.42, 32]} />
        <meshStandardMaterial {...hubMaterial} />
      </mesh>
      <mesh position={[0, 0, half * 0.885]}>
        <ringGeometry args={[m.hubRadius * 0.3, m.hubRadius * 0.38, 32]} />
        <meshStandardMaterial color={ROLE_COLOR[role]} roughness={0.35} metalness={0.4} />
      </mesh>
      {Array.from({ length: LUG_COUNT }, (_, i) => {
        const a = (i / LUG_COUNT) * Math.PI * 2 + Math.PI / 2
        const r = m.hubRadius * 0.7
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, Math.sin(a) * r, half * 0.88]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[m.hubRadius * 0.11, m.hubRadius * 0.11, half * 0.12, 6]} />
            <meshStandardMaterial color="#9a9a9a" roughness={0.3} metalness={1} />
          </mesh>
        )
      })}

      <mesh position={[0, 0, discZ]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[discRadius, discRadius, discThickness, 64]} />
        <meshStandardMaterial {...brakeDiscMaterial} />
      </mesh>
      <Caliper metrics={m} role={role} discRadius={discRadius} z={discZ} />
    </group>
  )
}

function Caliper({
  metrics: m,
  role,
  discRadius,
  z,
}: {
  metrics: WheelMetrics
  role: TireRole
  discRadius: number
  z: number
}) {
  const angle = Math.PI * 0.8
  const r = discRadius * 0.86
  return (
    <mesh
      position={[Math.cos(angle) * r, Math.sin(angle) * r, z]}
      rotation={[0, 0, angle + Math.PI / 2]}
      castShadow
    >
      <boxGeometry args={[discRadius * 0.62, discRadius * 0.24, m.rimWidth * 0.34]} />
      <meshStandardMaterial color={ROLE_COLOR[role]} roughness={0.42} metalness={0.25} />
    </mesh>
  )
}

/** Tapered spoke along +X from hub to rim, extruded toward +Z. */
function buildSpokeGeometry(m: WheelMetrics): THREE.ExtrudeGeometry {
  const r0 = m.hubRadius * 0.9
  const r1 = m.rimRadius * 0.93
  const w0 = m.hubRadius * 0.2
  const w1 = m.rimRadius * 0.045
  const shape = new THREE.Shape()
  shape.moveTo(r0, -w0)
  shape.lineTo(r1, -w1)
  shape.lineTo(r1, w1)
  shape.lineTo(r0, w0)
  shape.closePath()
  const depth = m.rimWidth * 0.14
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.3,
    bevelSize: Math.min(w0, w1) * 0.35,
    bevelSegments: 3,
    curveSegments: 1,
  })
}
