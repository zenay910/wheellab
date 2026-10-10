import { describe, expect, it } from "vitest"

import { isWebGLAvailable } from "./webgl"

describe("isWebGLAvailable", () => {
  it("returns a boolean in jsdom (typically false without WebGL)", () => {
    expect(typeof isWebGLAvailable()).toBe("boolean")
  })
})
