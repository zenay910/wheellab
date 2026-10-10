import { useEffect, useMemo } from "react"
import * as THREE from "three"

import type { TireDimensions } from "@/lib/tire"

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

/** Revolved tire body with tread, role-colored sidewall stripe, and wheel. Axle along Z, resting on y = 0. */
export function TireMesh({ dimensions, role, ghost }: TireMeshProps) {
  const tire = useMemo(() => buildTireGeometry(dimensions), [dimensions])
  const stripe = useMemo(() => buildSidewallStripeGeometry(dimensions), [dimensions])
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
      <group position={[0, outerR, 0]}>
        <mesh geometry={tire}>
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
    <group position={[0, outerR, 0]}>
      <mesh geometry={tire} castShadow receiveShadow>
        <meshStandardMaterial {...rubberMaterial} />
      </mesh>
      {[1, -1].map((side) => (
        <mesh key={side} geometry={stripe} scale={[1, 1, side]}>
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
