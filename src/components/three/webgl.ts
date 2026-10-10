/** Client-only WebGL probe for the 2D fallback path. */
export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
  } catch {
    return false
  }
}
