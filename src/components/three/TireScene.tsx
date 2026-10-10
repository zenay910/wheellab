import { memo, useLayoutEffect, useMemo, useRef } from "react"
import { ContactShadows, Environment, Grid, Lightformer, OrbitControls } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { TOUCH } from "three"

import type { Theme } from "@/hooks/usePreferences"
import type { TireComparison, UnitSystem } from "@/lib/tire"

import { ComparisonGuides } from "./ComparisonGuides"
import { SCENE_PALETTE, type ScenePalette } from "./materials"
import { buildGuideLabels } from "./guideLabels"
import { SceneLabelOverlay, SceneLabelProjector } from "./SceneLabels"
import { TireMesh } from "./TireMesh"
import { tireHeightM } from "./tireProfile"

export type ComparisonViewMode = "sideBySide" | "overlay"

interface TireSceneProps {
  comparison: TireComparison
  units: UnitSystem
  mode: ComparisonViewMode
  theme: Theme
  /** Narrow stage (mobile): pull camera back and prefer overlay framing. */
  compact?: boolean
}

export function TireScene({ comparison, units, mode, theme, compact }: TireSceneProps) {
  const palette = SCENE_PALETTE[theme]
  const maxH = Math.max(tireHeightM(comparison.original), tireHeightM(comparison.proposed))
  const separation = mode === "sideBySide" ? maxH * (compact ? 0.5 : 0.55) + 0.08 : 0
  const labels = useMemo(
    () => buildGuideLabels(comparison, units, mode, separation),
    [comparison, units, mode, separation],
  )
  const labelElements = useRef(new Map<string, HTMLDivElement>())

  return (
    <>
      <Canvas
        className="absolute inset-0 size-full touch-none"
        gl={{ alpha: true, antialias: true }}
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ fov: FOV_DEG, near: 0.01, far: 100, position: [0, 0.6, 2.2] }}
      >
        <SceneContent
          comparison={comparison}
          mode={mode}
          maxH={maxH}
          separation={separation}
          palette={palette}
          shadowOpacity={theme === "dark" ? 0.55 : 0.35}
        />
        <SceneLabelProjector labels={labels} elements={labelElements} />
      </Canvas>
      <SceneLabelOverlay labels={labels} elements={labelElements} colors={palette.guide} />
    </>
  )
}

function SceneContent({
  comparison,
  mode,
  maxH,
  separation,
  palette,
  shadowOpacity,
}: {
  comparison: TireComparison
  mode: ComparisonViewMode
  maxH: number
  separation: number
  palette: ScenePalette
  shadowOpacity: number
}) {
  const { width, height } = useThree((s) => s.size)
  const dist = fitDistance(maxH, separation, width / Math.max(height, 1))

  return (
    <>
      <fog attach="fog" args={[palette.stage, dist * 1.15, dist * 2.6]} />
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
      <StudioEnvironment />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.45} />
      </mesh>
      <Grid
        position={[0, 0.0005, 0]}
        infiniteGrid
        cellSize={0.05}
        cellThickness={0.6}
        cellColor={palette.gridCell}
        sectionSize={0.25}
        sectionThickness={1}
        sectionColor={palette.gridSection}
        fadeDistance={dist * 1.6}
        fadeStrength={1.5}
      />
      <ContactShadows position={[0, 0.001, 0]} opacity={shadowOpacity} scale={14} blur={2.8} far={5} />

      <group position={[-separation, 0, 0]}>
        <TireMesh dimensions={comparison.original} role="original" ghost={mode === "overlay"} />
      </group>
      <group position={[separation, 0, 0]}>
        <TireMesh dimensions={comparison.proposed} role="proposed" />
      </group>
      <ComparisonGuides
        comparison={comparison}
        mode={mode}
        separation={separation}
        colors={palette.guide}
      />

      <CameraRig maxHeight={maxH} distance={dist} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={maxH * 1.2}
        maxDistance={dist * 2}
        maxPolarAngle={Math.PI / 2 - 0.08}
        minPolarAngle={0.15}
        target={[0, maxH * 0.45, 0]}
        touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      />
    </>
  )
}

/** Memoized: drei's <Environment> re-captures its cube map whenever its children change identity. */
const StudioEnvironment = memo(function StudioEnvironment() {
  return (
    <Environment resolution={512}>
      <Lightformer form="rect" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, 0]} scale={[10, 10, 1]} />
      <Lightformer form="rect" intensity={2.5} rotation-y={Math.PI / 2} position={[-5, 2.5, 1]} scale={[8, 8, 1]} />
      <Lightformer form="ring" intensity={2} rotation-y={Math.PI / 2} position={[5, 2, 3]} scale={4} />
      <Lightformer form="rect" intensity={1.2} position={[0, 1, -5]} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={1.6} rotation-y={Math.PI} position={[0, 1, 6]} scale={[10, 4, 1]} />
    </Environment>
  )
})

const FOV_DEG = 42
/** World-space room beside the tires for the diameter labels. */
const LABEL_ROOM_M = 0.08

/** Camera distance that fits both tires plus guide labels in the current viewport aspect. */
function fitDistance(maxHeight: number, separation: number, aspect: number): number {
  const tanHalf = Math.tan(((FOV_DEG / 2) * Math.PI) / 180)
  const halfH = maxHeight * 0.72
  const halfW = separation + maxHeight / 2 + LABEL_ROOM_M
  return Math.max(halfH / tanHalf, halfW / (tanHalf * aspect))
}

function CameraRig({ maxHeight, distance }: { maxHeight: number; distance: number }) {
  const { camera } = useThree()

  useLayoutEffect(() => {
    camera.position.set(0, maxHeight * 0.62, distance)
    camera.lookAt(0, maxHeight * 0.45, 0)
  }, [camera, maxHeight, distance])

  return null
}
