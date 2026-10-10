import { useMemo } from "react"

import type { TireDimensions } from "@/lib/tire"

import { rubberMaterial, treadGrooveMaterial } from "./materials"
import { MM_TO_SCENE } from "./tireProfile"
import { WheelMesh } from "./WheelMesh"

const MM = MM_TO_SCENE

interface TireMeshProps {
  dimensions: TireDimensions
  role: "original" | "proposed"
  ghost?: boolean
}

/** Torus cross-section matches nominal OD and rim diameter; wheel sits in the bore. */
export function TireMesh({ dimensions, role, ghost }: TireMeshProps) {
  const { major, minor, axleY } = useMemo(() => {
    const outerR = (dimensions.overallDiameterMm / 2) * MM
    const rimR = (dimensions.rimDiameterMm / 2) * MM
    return {
      major: (outerR + rimR) / 2,
      minor: (outerR - rimR) / 2,
      axleY: outerR,
    }
  }, [dimensions])

  const grooves = useMemo(
    () =>
      [0.72, 0.82, 0.92].map((t) => ({
        ringMajor: major + minor * t,
        tube: 0.0018,
      })),
    [major, minor],
  )

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <group position={[0, axleY, 0]}>
        <mesh castShadow receiveShadow>
          <torusGeometry args={[major, minor, 48, 128]} />
          <meshStandardMaterial
            {...rubberMaterial}
            transparent={ghost}
            opacity={ghost ? 0.35 : 1}
            depthWrite={!ghost}
          />
        </mesh>

        {grooves.map(({ ringMajor, tube }, i) => (
          <mesh key={i}>
            <torusGeometry args={[ringMajor, tube, 8, 96]} />
            <meshStandardMaterial {...treadGrooveMaterial} />
          </mesh>
        ))}

        <WheelMesh dimensions={dimensions} role={role} />
      </group>
    </group>
  )
}
