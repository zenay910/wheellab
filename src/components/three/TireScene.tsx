import { useLayoutEffect, useMemo } from "react"
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { TOUCH } from "three"

import type { TireComparison } from "@/lib/tire"

import { TireMesh } from "./TireMesh"
import { tireHeightM } from "./tireProfile"

export type ComparisonViewMode = "sideBySide" | "overlay"

interface TireSceneProps {
  comparison: TireComparison
  mode: ComparisonViewMode
  /** Narrow stage (mobile): pull camera back and prefer overlay framing. */
  compact?: boolean
}

export function TireScene({ comparison, mode, compact }: TireSceneProps) {
  return (
    <Canvas
      className="absolute inset-0 size-full touch-none"
      gl={{ alpha: true, antialias: true }}
      shadows
      dpr={[1, 2]}
      camera={{ fov: 42, near: 0.01, far: 100, position: [0, 0.6, 2.2] }}
    >
      <SceneContent comparison={comparison} mode={mode} compact={compact} />
    </Canvas>
  )
}

function SceneContent({ comparison, mode, compact }: TireSceneProps) {
  const maxH = useMemo(
    () =>
      Math.max(
        tireHeightM(comparison.original),
        tireHeightM(comparison.proposed),
      ),
    [comparison],
  )

  const separation =
    mode === "sideBySide" ? (compact ? maxH * 0.42 + 0.08 : maxH * 0.55 + 0.12) : 0

  return (
    <>
      <ambientLight intensity={0.32} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.35}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.35} />
      <Environment resolution={512}>
        <Lightformer form="rect" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={2.5} rotation-y={Math.PI / 2} position={[-5, 2.5, 1]} scale={[8, 8, 1]} />
        <Lightformer form="ring" intensity={2} rotation-y={Math.PI / 2} position={[5, 2, 3]} scale={4} />
        <Lightformer form="rect" intensity={1.2} position={[0, 1, -5]} scale={[6, 3, 1]} />
      </Environment>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#121212" roughness={0.92} metalness={0.05} />
      </mesh>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={14} blur={2.8} far={5} />

      <group position={[-separation, 0, 0]}>
        <TireMesh dimensions={comparison.original} role="original" ghost={mode === "overlay"} />
      </group>
      <group position={[separation, 0, 0]}>
        <TireMesh dimensions={comparison.proposed} role="proposed" />
      </group>

      <CameraRig maxHeight={maxH} separation={separation} mode={mode} compact={compact} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={maxH * 1.2}
        maxDistance={maxH * 5}
        maxPolarAngle={Math.PI / 2 - 0.08}
        minPolarAngle={0.15}
        target={[0, maxH * 0.45, 0]}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      />
    </>
  )
}

function CameraRig({
  maxHeight,
  separation,
  mode,
  compact,
}: {
  maxHeight: number
  separation: number
  mode: ComparisonViewMode
  compact?: boolean
}) {
  const { camera } = useThree()

  useLayoutEffect(() => {
    const span = mode === "sideBySide" ? separation * 2 + maxHeight : maxHeight
    const distScale = compact ? 1.55 : 1.35
    const dist = Math.max(span * distScale, maxHeight * (compact ? 2.6 : 2.2))
    camera.position.set(separation * 0.35, maxHeight * (compact ? 0.5 : 0.55), dist)
    camera.lookAt(0, maxHeight * 0.45, 0)
  }, [camera, maxHeight, separation, mode, compact])

  return null
}
