# WheelLab — Project Definition

## Vision

WheelLab is an interactive automotive tire and wheel comparison application. It helps vehicle owners understand how changing tire and wheel dimensions affects physical measurements, speedometer readings, odometer accuracy, and overall proportions.

The central experience is a visually compelling, side-by-side comparison between an **original** tire and a **proposed** replacement — professional engineering clarity with a premium automotive configurator feel, not a generic SaaS dashboard.

## Target user

Vehicle owners considering plus-sizing, downsizing, or alternate tire specs who want numeric and visual clarity before talking to a shop or buying tires.

## Core user experience

1. Enter an original tire size (e.g. `205/55R16`).
2. Enter a proposed replacement (e.g. `225/45R17`).
3. View both tires with visualization that reflects true proportional differences.
4. Change dimensions and see immediate updates.
5. Compare width, sidewall height, wheel diameter, overall diameter, circumference, and percentage differences.
6. Understand actual vs indicated speed and odometer error.
7. See clear explanations of calculations and assumptions.

**Primary visual (P1):** interactive 3D tires from procedural geometry.  
**MVP guarantee:** proportional 2D side-by-side silhouette if WebGL is unavailable or 3D is not yet complete.

## Scope

### MVP (P0) — essential

- Functional tire-size inputs and validation
- Accurate, independently testable tire calculations
- Side-by-side proportional comparison (2D minimum)
- Live updates on input change
- Speedometer and odometer correction
- Responsive, polished UI
- Working deployed demonstration

### High priority (P1)

- Interactive 3D tire visualization (rotate, zoom)
- Dimensional annotations
- Intuitive comparison view controls (side-by-side, overlay)

### Optional (P2) — only if time permits

- Vehicle make/model/year selection
- Wheel appearance customization
- Tire presets and plus-size suggestions
- URL share state
- Flotation tire formats (e.g. `33x12.50R17`)

### Out of scope

- Authentication, accounts, payments
- Database (unless clearly justified later)
- E-commerce / tire purchasing
- Complete OEM fitment certification

## Fitment disclaimer (approved copy)

> **Fitment notice:** WheelLab compares nominal tire dimensions and rolling circumference. It does not verify clearance, load rating, wheel offset, brake fit, or manufacturer approval. Always confirm fitment with a qualified installer and your vehicle’s specifications.

When overall diameter differs from the original by more than **±3%**, show a **caution** state (badge or callout) recommending professional verification.

## Domain model and formulas

Metric sizing notation: **width / aspect R rim** (e.g. `205/55R16`).

- **Section width** \(W\) = width in mm (205 → 205 mm).
- **Sidewall height** \(H_s = W \times (\text{aspect} / 100)\).
- **Rim diameter** \(D_r\) = rim inches × 25.4 mm/in.
- **Overall diameter** \(D_o = D_r + 2 H_s\) (nominal, unloaded).
- **Circumference** \(C = \pi D_o\).
- **Revs per km** = \(10^6 / C\) (mm-based).
- **Revs per mile** = \(1{,}609{,}344 / C\) (mm-based).
- **Ride height change** (per corner) ≈ \((D_{o,\text{new}} - D_{o,\text{orig}}) / 2\).

### Speedometer and odometer (assumptions)

- Speedometer is calibrated for the **original** tire at nominal unloaded diameter.
- Indicated speed is proportional to wheel RPM; actual speed scales by circumference ratio:

  `actualSpeed = indicatedSpeed × (C_proposed / C_original)`

- Odometer distance accumulates with the same ratio (proposed tire registers **less** distance than indicated when \(C_\text{proposed} < C_\text{original}\)).

Loaded-radius effects largely cancel in the ratio and are **out of scope** for MVP; state this in the explanation panel.

### Worked example

| | Original | Proposed |
|---|----------|----------|
| Size | 205/55R16 | 225/45R17 |
| Sidewall | 205×0.55 = 112.75 mm | 225×0.45 = 101.25 mm |
| Rim | 16×25.4 = 406.4 mm | 17×25.4 = 431.8 mm |
| Overall Ø | 406.4 + 225.5 = **631.9 mm** | 431.8 + 202.5 = **634.3 mm** |
| Δ diameter | | +2.4 mm (~+0.38%) |

At 60 mph indicated, actual ≈ 60 × (634.3/631.9) ≈ **60.2 mph**.

## Technical stack

- React, TypeScript, Vite
- Tailwind CSS v4, shadcn/ui (Lyra / Radix)
- Three.js, React Three Fiber, Drei
- Phosphor icons
- Vitest for `src/lib/tire`
- Deploy: Vercel
- npm only

Business calculations stay in `src/lib/tire`; UI and 3D consume typed results.

## Constraints

- **Deadline:** Saturday, October 10, 2026, 12:00 PM Mountain Time — submission-ready demo.
- **Hackathon:** All project code written during the competition; publicly accessible repo; no reuse of prior project assets.
- **Judging:** Technology, design, completion, learning (equal weight).

## Assumptions (architecture)

1. Repo root = Vite app root (flatten from nested `wheellab/` when initializing git).
2. Vitest is the only added test/dev tooling beyond the stack above.
3. Icons: Phosphor (not Lucide).
4. Units: global metric/imperial toggle; tire width shown in mm; diameter/speed default to user-friendly imperial where noted in DESIGN.md.
5. MVP parsers: metric sizes; optional `P`/`LT` prefixes; variants like `205/55-16` and spaced forms.
6. 3D lighting: Lightformer-based environment (no runtime HDR CDN dependency).

## Input validation ranges (MVP)

| Field | Range | Notes |
|-------|-------|--------|
| Width (mm) | 105–445 | Warn on non-standard 5 mm steps |
| Aspect | 20–95 | |
| Rim (in) | 10–30 | Allow 0.5 increments |
