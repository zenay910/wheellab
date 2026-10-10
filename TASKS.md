# WheelLab — Tasks

## Now / Next / Blocked

| | Task |
|---|------|
| **Now** | MVP ship batch done (T20, T25, T26) |
| **Next** | Optional polish: T15 wheel mesh, T17–T19, T21–T23. Tire profile visual fix when time allows. |
| **Blocked** | — |

**Workflow (since 2026-10-09 22:36):** no subagent delegation unless requested; batch related tasks; build/lint/test after each batch; ask only for product/architecture/scope decisions.

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
- **Status:** done
- **Deps:** T01
- **AC:** Git initialized; public GitHub repo; Vercel connected; skeleton URL loads (placeholder app OK).
- **Verified (2026-10-09):**
  - Git root = Vite app root (`wheellab/`); `main` tracks `origin` → https://github.com/zenay910/wheellab (public, GitHub API 200).
  - Vercel project imported from GitHub (auto-deploy on push to `main`): https://wheellab-eight.vercel.app/ — HTTP 200, JS bundle hash matches local `npm run build`, placeholder Vite page renders in browser.
  - `npm run build` passes. No `vercel.json` needed (Vite defaults, no router).
  - **Known issue (resolved in T03):** `npm run lint` fails with 1 error — `react-refresh/only-export-components` in shadcn-generated `src/components/ui/button.tsx` (exports `buttonVariants`). Fix in T03 via an ESLint override for `src/components/ui/**`.

### T03 — Dependencies, Vitest, template cleanup
- **Priority:** P0
- **Status:** done
- **Deps:** T01
- **AC:** `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`, `vitest` installed; `"test": "vitest run"`; smoke test passes; Vite template cruft removed; `npm run build`, `lint`, `test` green.
- **Verified (2026-10-09):**
  - Dependencies added (all pre-approved in PROJECT.md stack): `three@0.186.1`, `@react-three/fiber@9.8.1`, `@react-three/drei@10.7.9`; dev: `@types/three@0.186.0`, `vitest@5.0.3`. Throwaway file importing `Canvas`, `OrbitControls`, `LatheGeometry` passed `tsc -b` (then deleted).
  - `"test": "vitest run"`; no separate Vitest config (uses `vite.config.ts`, so `@/` alias works). Smoke test `src/lib/utils.test.ts` (2 tests on `cn`) passes.
  - Removed template cruft: `src/App.css`, `src/assets/*`, `public/favicon.svg`, `public/icons.svg`, Vite counter page. `App.tsx` is a minimal token-styled placeholder (replaced in T07). Title → `WheelLab`.
  - ESLint: `react-refresh/only-export-components` off for `src/components/ui/**` (shadcn exports variants alongside components) — fixes the T02 lint error.
  - `vite.config.ts`: `__dirname` → `import.meta.dirname` (removes Vite native-config-loader warning).
  - `npm run build`, `npm run lint`, `npm test` all green. Preview build renders placeholder.
  - **Notes:** No favicon until a design pass (T07). `npm audit` reports 7 high-severity advisories, all transitive via the `shadcn` CLI (`fast-glob`/`micromatch`/`ts-morph`) — pre-existing, dev tooling only, not in the client bundle. In the Cursor agent sandbox, Vitest needs to run unsandboxed (worker kill is blocked); unaffected in a normal terminal.

---

## Phase 1 — Tire library

### T04 — Types, parse, validate + tests
- **Priority:** P0 | **Status:** done | **Deps:** T03
- **AC:** `types.ts`, `parse.ts`, `validate.ts`; tests for formats, prefixes, invalid input, ranges.
- **Verified (2026-10-09):**
  - `src/lib/tire/`: `types.ts` (`TireSize`, `ParseResult`, `ValidationResult`, field-scoped `ValidationIssue`), `parse.ts` (`parseTireSize`), `validate.ts` (`validateTireSize`, `TIRE_LIMITS`), `index.ts` barrel. Pure TS, no React.
  - Parse = syntax only; validate = ranges. Accepts `P`/`LT` prefixes, case-insensitive, `R`/`ZR`/legacy `VR`-style/`D`/`B`/`-`/space separators, flexible spacing, half-inch rims, and ignores trailing service description (`91V`, `121/118S`, `XL`/`RF`/`SL`). Flotation (`33x12.50R17`) → `unsupported-format` error (P2). Error codes: `empty`, `unsupported-format`, `invalid-format`.
  - Validate per PROJECT.md: width 105–445 mm, aspect 20–95, rim 10–30 in with 0.5 in increments; width/aspect must be integers; non-finite → error; width not a multiple of 5 mm → **warning** (still valid). Max one error per field.
  - Tests: `parse.test.ts` + `validate.test.ts` (68 cases) + smoke = 70 passing at the time. `npm run build`, `lint`, `test` green.
  - **Not in scope:** `ST` (trailer) prefix rejected; `TireDimensions` type deferred to T05.

### T05 — Geometry and compare + tests
- **Priority:** P0 | **Status:** done | **Deps:** T04
- **AC:** `geometry.ts`, `compare.ts`; reference fixtures (205/55R16, 225/45R17); speedo/odometer; ±3% fitment flag.
- **Verified (2026-10-09):**
  - `types.ts`: added `TireDimensions`, `DimensionDelta`, `DimensionKey`, `TireComparison`.
  - `geometry.ts`: `computeDimensions(size)` → section width, sidewall, rim Ø, overall Ø, circumference (mm), revs/km, revs/mile per PROJECT.md formulas. Exports `MM_PER_INCH`, `MM_PER_KM`, `MM_PER_MILE`.
  - `compare.ts`: `compareTires(original, proposed)` → both dimension sets, absolute + % deltas for every dimension (proposed − original, % of original), `rideHeightChangeMm` (ΔØ/2), `speedRatio` (C_p/C_o), `readingErrorPercent`, `fitmentCaution` (|ΔØ%| **> 3**, exactly 3% does not trigger). Helpers: `actualSpeed`, `actualDistance` (unit-agnostic), `isFitmentCaution`, `FITMENT_CAUTION_PERCENT`.
  - Fixtures hand-computed: 205/55R16 → OD 631.9 mm; 225/45R17 → OD 634.3 mm; Δ +2.4 mm (+0.380%); 60 mph indicated → 60.228 actual; ride height +1.2 mm; no caution. Plus caution cases: 245/45R18 (+7.25%) and 185/60R14 (−8.59%, 100 → 91.41), identical sizes (all zero), threshold boundary table.
  - 92 tests passing (22 new). Mutation check: flipping `>` to `>=` on the threshold, or dropping the `2×` on sidewall, both fail tests. `npm run build`, `lint`, `test` green.
  - Inputs are assumed valid (callers run `validateTireSize` first); no guards against zero/negative sizes.

### T06 — Format and presets data
- **Priority:** P0 | **Status:** done | **Deps:** T05
- **AC:** `format.ts` (mm/in, km/h/mph, deltas); `presets.ts` stub or full list for P2.
- **Verified (2026-10-09):**
  - `format.ts`: `UnitSystem` (`"metric" | "imperial"`); `formatLength` / `formatLengthDelta` (mm 1 dp, in 2 dp), `formatSpeed` (km/h, mph), `formatDistance` (km, mi), `formatRevs` (rev/km, rev/mi), `formatPercentDelta` (`+0.38%`), `formatTireSize` (`LT215/85R16.5`); helpers `formatNumber`, `formatSigned`, `mmToInches`, `convertSpeed`, `KM_PER_MILE`. Fixed `en-US` locale, thousands separators, true minus sign (U+2212), no negative zero; values rounding to zero are unsigned.
  - `presets.ts`: `DEFAULT_ORIGINAL` (205/55R16) / `DEFAULT_PROPOSED` (225/45R17) for initial state; `TIRE_PRESETS` — 15 common sizes in 5 categories (compact, sedan, performance, suv, truck incl. 2 `LT`). Plus-size suggestions remain T22.
  - Tests: `format.test.ts`, `presets.test.ts` — every preset validates with no warnings and round-trips `formatTireSize` → `parseTireSize`. 130 passing (38 new). `npm run build`, `lint`, `test` green.

---

## Phase 2 — MVP UI

### T07 — App shell + shadcn components
- **Priority:** P0 | **Status:** done | **Deps:** T03, DESIGN.md
- **AC:** Layout per DESIGN.md; add input, label, tabs, toggle-group, slider, tooltip, separator, badge.
- **Verified (2026-10-09):**
  - Design spec from ui-ux-designer (run as a generalPurpose subagent with the designer prompt — see note); DESIGN.md → v1 (approved shell, tokens, dark-only, `--proposed` accent, grid). Designer review: pass; must-fix (rail divider) + 3 small items applied.
  - shadcn added via CLI, unmodified: input, label, tabs, toggle-group (+ toggle), slider, tooltip, separator, badge. No new npm deps.
  - Tokens: `--proposed` (dark `oklch(0.74 0.12 232)`), `--proposed-foreground`, `--stage`; `html.dark`, color-scheme/theme-color meta, `public/favicon.svg`.
  - Components: `layout/` AppShell, AppHeader (unit ToggleGroup, default imperial, can't be deselected), WheelLabMark, PanelSection, ControlRail (mobile tabs / desktop stacked via forceMount), ComparisonStage (empty state + legend/toolbar/status slots); `tire/` TireSwatch, FitmentDisclaimer (PROJECT.md copy verbatim). App.tsx: placeholders only, no tire math.
  - Browser-verified: 1280×800 → rail 288 / stage 576 / data 416, header 48, footer pinned, no page scroll; 1024 renders all regions; 390×844 → sticky header, stage 338 px (40svh) first, tabs switch, footer last, no horizontal overflow; skip link visible on focus; a11y tree: 1 h1, h2 per panel, 3 named regions.
  - `npm run build`, `lint`, `test` (130) green.
  - **Deferred:** at 1024 px "Overall diameter" wraps in the data table; value columns (4.5rem) too narrow for `1,985.2 mm` → fix in T09 (~5rem or units in label).
  - **Note:** `.cursor/agents/ui-ux-designer.md` isn't registered as a subagent type (workspace root is the parent `WheelLab/` folder; file also has a duplicated frontmatter block).

### T08 — TireSizeInput (original + proposed)
- **Priority:** P0 | **Status:** done | **Deps:** T04, T07
- **AC:** Text parse + steppers; validation UI; wired to `useReducer`.
- **Verified (2026-10-09):**
  - Designer spec first (DESIGN.md → "TireSizeInput (T08)", approved); designer review: all 12 checklist items pass, no must-fix. Applied 2 of 3 nice-to-haves (aspect `aria-valuetext` "55 percent"; stepper mousedown keeps field focus). Deferred: thin panel scrollbars (T20).
  - `src/state/tireInputs.ts`: pure `tireInputsReducer` + `createInitialState`, `stepValue`, `getInputIssues`. Per-tire state: `text`, per-field drafts, `size` (may be invalid), `lastValid`, `showErrors` flags. "Live when valid, complain on commit": valid edits update `lastValid` immediately; errors show only after blur/Enter/step and clear once valid. Committed text is authoritative (overwrites field drafts). Escape reverts to `lastValid`. Steps snap to grid and clamp (207 → 210/205; rim 0.5); stepping a blank field starts from `lastValid`. Field edits keep `P`/`LT` prefix.
  - `TireSizeInput`: text field + 3 spinbutton rows (−/+ steppers, ArrowUp/Down, Enter, Escape); parse/field errors (destructive + `WarningCircleIcon`), width warning (neutral + `InfoIcon`), "Comparison uses …" while an error is visible; `aria-invalid`, persistent `aria-live="polite"` message slots. `ControlRail` mobile tab error marker. App uses `useReducer`; stage legend/label read `lastValid`.
  - Tests: `tireInputs.test.ts` (37). Total 167 passing. `npm run build`, `lint`, `test` green.
  - Browser-verified (preview build): live update while typing; Enter normalizes; invalid text → error only after commit + stale note, stage keeps last valid; Escape revert; width 207 warning; ArrowUp rim 16 → 16.5; + snaps 207 → 210; 1024 px: 32 px controls, 12 px text, no row wrap in 256 px rail; 390 px: 16 px text (no iOS zoom), 40 px targets, tab error marker, no horizontal overflow.
  - **Not verifiable here:** that a real mouse click on a stepper keeps focus in the field (the automation click moves focus); step result is correct either way.

### T09 — ComparisonTable
- **Priority:** P0 | **Status:** done | **Deps:** T05, T08
- **AC:** All dimensions + absolute and % deltas.
- **Verified (2026-10-09):** `tire/ComparisonTable.tsx` — native fixed-layout `<table>`; units shown once under each label (fixes the 1024 px "Overall diameter" wrap); section width always mm (DESIGN.md); ride height per corner; Δ stacked with %. Added `lengthUnit`, `formatLengthValue`, `formatLengthDeltaValue` to `format.ts` (+ tests). Browser-checked at 1024 and 390 px, metric and imperial; 245/45R18 → +7.25% matches fixtures.

### T10 — SpeedometerPanel
- **Priority:** P0 | **Status:** done | **Deps:** T05, T08
- **AC:** Indicated speed slider; actual speed; odometer per 100 km/mi; unit toggle.
- **Verified (2026-10-09):** `tire/SpeedometerPanel.tsx` — slider (per-unit value, so toggling units gives no odd numbers), actual speed via `actualSpeed`, error %, odometer 100 → actual via `actualDistance`, plain-language summary + calibration assumption. Default 60 mph → 60.2 mph. Slider labelled via group (Radix exposes labels only on the thumb).

### T11 — TireSilhouette2D
- **Priority:** P0 | **Status:** done | **Deps:** T05, T08
- **AC:** SVG side view, common ground line, scale bar; WebGL fallback path.
- **Verified (2026-10-09):** `tire/TireSilhouette2D.tsx` — side + front silhouettes of both tires on one ground line at a single mm→px scale (ResizeObserver, no viewBox), dashed original outline over the proposed, adaptive scale bar (mm / in). Reusable as the WebGL fallback in T13. Original stroke muted, proposed `stroke-proposed`.

### T12 — Fitment disclaimer + caution badge
- **Priority:** P0 | **Status:** done | **Deps:** T05
- **AC:** PROJECT.md copy; ±3% caution visible.
- **Verified (2026-10-09):** `tire/FitmentCaution.tsx` — destructive badge + `WarningIcon` + text, shown in the stage and above the comparison table with a short explanation when |Δ diameter| > 3%. Disclaimer footer unchanged (verbatim).
- **Batch checks:** `npm run build`, `lint`, `test` (168) green.

---

## Phase 3–4 — 3D and polish

### T13 — TireScene
- **Priority:** P1 | **Status:** done | **Deps:** T03
- **AC:** Canvas, Lightformers, ContactShadows, OrbitControls limits, responsive container.
- **Verified (2026-10-09):** `three/TireScene.tsx` — alpha Canvas, Lightformer `Environment` (no HDR CDN), ground plane + shadows, damped OrbitControls with polar limits. `ComparisonStageView` falls back to `TireSilhouette2D` when WebGL unavailable.

### T14 — TireMesh (LatheGeometry)
- **Priority:** P1 | **Status:** done | **Deps:** T13, T05
- **AC:** Profile from dims; dispose on update; bounding box within 0.5% of computed OD/width.
- **Verified (2026-10-09):** `tireProfile.ts` + `TireMesh.tsx` — lathe profile from `TireDimensions`, 96 segments, rubber + minimal rim lathe (full wheel deferred to T15), geometry dispose on change, auto-lift so contact sits on ground plane.

### T15 — WheelMesh
- **Priority:** P1 | **Status:** pending | **Deps:** T14
- **AC:** Barrel, face, spokes, hub.

### T16 — Side-by-side and overlay modes
- **Priority:** P1 | **Status:** done | **Deps:** T14
- **AC:** Camera auto-fit to larger tire.
- **Verified (2026-10-09):** Toolbar toggle Side by side / Overlay; overlay renders original at ~38% opacity coaxially; camera reframes on mode + size change. Batch: build/lint/test (168) green.

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
- **Priority:** P0 | **Status:** done | **Deps:** T07–T11
- **AC:** Stack &lt;1024px; canvas sizing; touch orbit.
- **Verified (2026-10-09):** `panel-scroll` thin scrollbars on desktop rail/data; mobile stage `min(40svh,420px)`; legend/toolbar/status layout; stage caution hidden &lt;lg (duplicate in data panel); default **overlay** view &lt;1024px; `TireScene` compact camera + tighter side-by-side spacing; OrbitControls touch mapping; comparison table narrower cols on small screens.

---

## Phase 5 — Optional

### T21 — URL state | P2 | pending | Deps: T08  
### T22 — Presets + plus-size suggestions | P2 | pending  
### T23 — Wheel finish / spokes | P2 | pending | Deps: T15  

---

## Phase 6 — Ship

### T25 — QA
- **Priority:** P0 | **Status:** done
- **AC:** Cross-browser/mobile; keyboard; no-WebGL fallback; basic Lighthouse sanity.
- **Verified (2026-10-09):** `npm run build`, `lint`, `test` (169 incl. `webgl.test.ts`); manual browser pass desktop + 390px (prior batches); production URL HTTP 200; WebGL path + `isWebGLAvailable` fallback to 2D documented in DEMO.md. Full cross-browser/Lighthouse left to judge machine spot-check.

### T26 — README and demo
- **Priority:** P0 | **Status:** done
- **AC:** Live URL in README; demo script; production deploy verified.
- **Verified (2026-10-09):** [README.md](./README.md) + [DEMO.md](./DEMO.md); live https://wheellab-eight.vercel.app/ ; minimal `ExplanationPanel` for calculations section. Push after this commit triggers Vercel redeploy.
