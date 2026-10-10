# WheelLab — Tasks

## Now / Next / Blocked

| | Task |
|---|------|
| **Now** | — (await approval for next task after Phase 0 docs) |
| **Next** | T02 — git init, GitHub, Vercel skeleton |
| **Blocked** | — |

Phase time targets (Mountain Time, deadline Sat 12:00 PM):

| Phase | Window | Goal |
|-------|--------|------|
| 0 | Hour 1 | Docs, git, deps, deploy skeleton |
| 1 | ~1.5 h | Tire library + tests |
| 2 | ~2 h | MVP UI + 2D comparison |
| 3 | ~3 h | 3D scene + tires |
| 4 | ~2 h | Annotations, polish, responsive |
| 5 | optional | URL, presets, wheel customize |
| 6 | final ~2 h | QA, README, demo |

**Critical path:** T01 → T03 → T04 → T05 → T08 → (T09, T10, T11) → T20 → T25 → T26  
3D track (T13–T18) is high priority but not required for first deployable MVP.

---

## Phase 0 — Harness and foundation

### T01 — Harness documentation
- **Priority:** P0
- **Status:** done
- **Deps:** —
- **AC:** AGENTS.md, PROJECT.md, TASKS.md, DESIGN.md (provisional), README.md exist; AGENTS.md encodes 8-step workflow.

### T02 — Repository and deploy skeleton
- **Priority:** P0
- **Status:** pending
- **Deps:** T01
- **AC:** Git initialized; public GitHub repo; Vercel connected; skeleton URL loads (placeholder app OK).

### T03 — Dependencies, Vitest, template cleanup
- **Priority:** P0
- **Status:** pending
- **Deps:** T01
- **AC:** `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `vitest` installed; `"test": "vitest run"`; smoke test passes; Vite template cruft removed; `npm run build`, `lint`, `test` green.

---

## Phase 1 — Tire library

### T04 — Types, parse, validate + tests
- **Priority:** P0 | **Status:** pending | **Deps:** T03
- **AC:** `types.ts`, `parse.ts`, `validate.ts`; tests for formats, prefixes, invalid input, ranges.

### T05 — Geometry and compare + tests
- **Priority:** P0 | **Status:** pending | **Deps:** T04
- **AC:** `geometry.ts`, `compare.ts`; reference fixtures (205/55R16, 225/45R17); speedo/odometer; ±3% fitment flag.

### T06 — Format and presets data
- **Priority:** P0 | **Status:** pending | **Deps:** T05
- **AC:** `format.ts` (mm/in, km/h/mph, deltas); `presets.ts` stub or full list for P2.

---

## Phase 2 — MVP UI

### T07 — App shell + shadcn components
- **Priority:** P0 | **Status:** pending | **Deps:** T03, DESIGN.md
- **AC:** Layout per DESIGN.md; add input, label, tabs, toggle-group, slider, tooltip, separator, badge.

### T08 — TireSizeInput (original + proposed)
- **Priority:** P0 | **Status:** pending | **Deps:** T04, T07
- **AC:** Text parse + steppers; validation UI; wired to `useReducer`.

### T09 — ComparisonTable
- **Priority:** P0 | **Status:** pending | **Deps:** T05, T08
- **AC:** All dimensions + absolute and % deltas.

### T10 — SpeedometerPanel
- **Priority:** P0 | **Status:** pending | **Deps:** T05, T08
- **AC:** Indicated speed slider; actual speed; odometer per 100 km/mi; unit toggle.

### T11 — TireSilhouette2D
- **Priority:** P0 | **Status:** pending | **Deps:** T05, T08
- **AC:** SVG side view, common ground line, scale bar; WebGL fallback path.

### T12 — Fitment disclaimer + caution badge
- **Priority:** P0 | **Status:** pending | **Deps:** T05
- **AC:** PROJECT.md copy; ±3% caution visible.

---

## Phase 3–4 — 3D and polish

### T13 — TireScene
- **Priority:** P1 | **Status:** pending | **Deps:** T03
- **AC:** Canvas, Lightformers, ContactShadows, OrbitControls limits, responsive container.

### T14 — TireMesh (LatheGeometry)
- **Priority:** P1 | **Status:** pending | **Deps:** T13, T05
- **AC:** Profile from dims; dispose on update; bounding box within 0.5% of computed OD/width.

### T15 — WheelMesh
- **Priority:** P1 | **Status:** pending | **Deps:** T14
- **AC:** Barrel, face, spokes, hub.

### T16 — Side-by-side and overlay modes
- **Priority:** P1 | **Status:** pending | **Deps:** T14
- **AC:** Camera auto-fit to larger tire.

### T17 — DimensionAnnotations
- **Priority:** P1 | **Status:** pending | **Deps:** T16
- **AC:** Html labels + lines; toggle.

### T18 — View controls
- **Priority:** P1 | **Status:** pending | **Deps:** T16
- **AC:** Mode toggle; Front/Side/3-4; annotations; auto-rotate.

### T19 — ExplanationPanel
- **Priority:** P1 | **Status:** pending | **Deps:** T05
- **AC:** Formulas with live substituted values; assumptions stated.

### T20 — Responsive pass
- **Priority:** P0 | **Status:** pending | **Deps:** T07–T11
- **AC:** Stack &lt;1024px; canvas sizing; touch orbit.

---

## Phase 5 — Optional

### T21 — URL state | P2 | pending | Deps: T08  
### T22 — Presets + plus-size suggestions | P2 | pending  
### T23 — Wheel finish / spokes | P2 | pending | Deps: T15  

---

## Phase 6 — Ship

### T25 — QA
- **Priority:** P0 | **Status:** pending
- **AC:** Cross-browser/mobile; keyboard; no-WebGL fallback; basic Lighthouse sanity.

### T26 — README and demo
- **Priority:** P0 | **Status:** pending
- **AC:** Live URL in README; demo script; production deploy verified.
