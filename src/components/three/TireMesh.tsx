import { useEffect, useMemo } from "react"
import * as THREE from "three"

import { computeDimensions, type TireDimensions } from "@/lib/tire"

import { ROLE_COLOR, rubberMaterial, type TireRole } from "./materials"
import { buildSidewallStripeGeometry, buildTireGeometry } from "./tireGeometry"
import { MM_TO_SCENE } from "./tireProfile"
import { WheelMesh } from "./WheelMesh"

interface TireMeshProps {
  dimensions: TireDimensions
  role: TireRole
  /** Translucent shell only (overlay reference), no wheel. */
  ghost?: boolean
}

/**
 * Revolved tire body with tread, role-colored sidewall stripe, and wheel. Axle along Z, resting on y = 0.
 * Ghost and solid branches are keyed so switching remounts the material (R3F does not reset removed
 * props like `transparent`/`opacity`); `dispose={null}` keeps the shared geometry alive across that.
 */
export function TireMesh({ dimensions, role, ghost }: TireMeshProps) {
  // Keyed on `size` (stable while the other tire is edited) so only the changed tire rebuilds.
  const { size } = dimensions
  const tire = useMemo(() => buildTireGeometry(computeDimensions(size)), [size])
  const stripe = useMemo(() => buildSidewallStripeGeometry(computeDimensions(size)), [size])
  useEffect(
    () => () => {
      tire.dispose()
      stripe.dispose()
    },
    [tire, stripe],
  )

  const outerR = (dimensions.overallDiameterMm / 2) * MM_TO_SCENE

  if (ghost) {
    return (
      <group key="ghost" position={[0, outerR, 0]}>
        <mesh geometry={tire} dispose={null}>
          <meshStandardMaterial
            color={ROLE_COLOR[role]}
            roughness={0.6}
            transparent
            opacity={0.12}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  }

  return (
    <group key="solid" position={[0, outerR, 0]}>
      <mesh geometry={tire} castShadow receiveShadow dispose={null}>
        <meshStandardMaterial {...rubberMaterial} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} geometry={stripe} scale={[1, 1, side]} dispose={null}>
          <meshStandardMaterial
            color={ROLE_COLOR[role]}
            roughness={0.5}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <WheelMesh dimensions={dimensions} role={role} />
    </group>
  )
}
