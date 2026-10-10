import { useEffect, useMemo } from "react"
import * as THREE from "three"

import type { TireDimensions } from "@/lib/tire"

import { MM_TO_SCENE, buildTireLathePoints } from "./tireProfile"

const MM = MM_TO_SCENE
const LATHE_SEGMENTS = 96

const rubber = {
  color: "#1a1a1a",
  roughness: 0.92,
  metalness: 0.05,
} as const

const rimMetal = {
  color: "#3a3a3a",
  roughness: 0.35,
  metalness: 0.85,
} as const

interface TireMeshProps {
  dimensions: TireDimensions
  role: "original" | "proposed"
  /** Overlay mode: original is translucent. */
  ghost?: boolean
}

export function TireMesh({ dimensions, role, ghost }: TireMeshProps) {
  const { geometry, rimGeometry } = useMemo(() => {
    const profile = buildTireLathePoints(dimensions).map((p) => new THREE.Vector2(p.x * MM, p.y * MM))
    const geo = new THREE.LatheGeometry(profile, LATHE_SEGMENTS)
    geo.computeBoundingBox()

    const rimR = (dimensions.rimDiameterMm / 2) * MM
    const outerR = (dimensions.overallDiameterMm / 2) * MM
    const rimProfile = [
      new THREE.Vector2(rimR * 0.72, 0),
      new THREE.Vector2(rimR, outerR * 0.08),
      new THREE.Vector2(rimR * 0.85, outerR * 0.14),
      new THREE.Vector2(rimR * 0.72, 0),
    ]
    const rimGeo = new THREE.LatheGeometry(rimProfile, 48)

    return { geometry: geo, rimGeometry: rimGeo }
  }, [dimensions])

  const liftY = useMemo(() => {
    const clone = geometry.clone()
    clone.rotateX(Math.PI / 2)
    clone.computeBoundingBox()
    const lifted = -(clone.boundingBox?.min.y ?? 0)
    clone.dispose()
    return lifted
  }, [geometry])

  useEffect(() => {
    return () => {
      geometry.dispose()
      rimGeometry.dispose()
    }
  }, [geometry, rimGeometry])

  const accent = role === "proposed" ? "#5eb8e8" : "#666666"

  return (
    <group position={[0, liftY, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          {...rubber}
          transparent={ghost}
          opacity={ghost ? 0.38 : 1}
          depthWrite={!ghost}
        />
      </mesh>
      <mesh geometry={rimGeometry} castShadow>
        <meshStandardMaterial {...rimMetal} color={accent} metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  )
}
