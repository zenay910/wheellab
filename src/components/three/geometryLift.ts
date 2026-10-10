import * as THREE from "three"

/** After rotating a lathe (Y-axis) by +90° on X, shift so the lowest point sits on y=0. */
export function liftAfterSideRotation(geometry: THREE.BufferGeometry): number {
  const clone = geometry.clone()
  clone.rotateX(Math.PI / 2)
  clone.computeBoundingBox()
  const lift = -(clone.boundingBox?.min.y ?? 0)
  clone.dispose()
  return lift
}
