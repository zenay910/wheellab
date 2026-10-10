# WheelLab — Design Specification (Provisional)

Authoritative visual reference until a final design pass replaces this document. Derived from shadcn **Lyra** preset (neutral, `rounded-none`, JetBrains Mono).

## Principles

- **Precise** — numbers and dimensions are first-class; alignment and spacing are tight.
- **Restrained** — no gratuitous gradients, neon, oversized radii, or decorative motion.
- **Automotive / instrument-like** — reads as engineering or configurator software, not generic SaaS.
- **3D as hero** — comparison stage dominates; chrome is minimal.

## Do not

- Excessive rounded cards, cartoon tires, or “AI slop” layouts.
- Compute tire dimensions in UI components (see AGENTS.md).
- Weaken fitment disclaimer visibility.
- Use Lucide if Phosphor is already configured.

## Design tokens

From `src/index.css` (Lyra / neutral oklch):

- **Font:** JetBrains Mono Variable (`font-mono` on `html`).
- **Radius:** `rounded-none` on interactive surfaces (Lyra default).
- **Surfaces:** `background`, `card`, `muted`, `border` CSS variables.
- **Accent (proposed tire / positive deltas):** reserve `chart-2` or a single oklch accent — use consistently for “Proposed” labels and favorable/neutral deltas; use `destructive` only for errors and strong cautions (e.g. &gt;3% diameter).
- **Original tire:** default foreground/muted; no loud color coding.

Dark mode: supported via `.dark` tokens; prefer dark stage background for 3D if it improves contrast (optional toggle later).

## Layout grid

### Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────────┐
│ Header: WheelLab wordmark + unit toggle (optional)          │
├──────────────┬──────────────────────────────┬───────────────┤
│ Control rail │ Central stage (3D or 2D)     │ Data panel    │
│ Original     │                              │ Comparison    │
│ Proposed     │                              │ Speedo        │
│ inputs       │                              │ Explanations  │
└──────────────┴──────────────────────────────┴───────────────┘
│ Footer: fitment disclaimer (always visible)                 │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (&lt;1024px)

Stack: Header → Stage (min-height ~40vh) → Inputs (tabs Original | Proposed) → Data panels → Disclaimer.

## Typography scale

| Use | Class / size |
|-----|----------------|
| App title | `text-sm font-medium tracking-wide uppercase` |
| Section label | `text-xs text-muted-foreground uppercase` |
| Primary values | `text-sm tabular-nums` |
| Delta / badge | `text-xs` in `Badge` |

Use tabular figures for all numeric columns.

## Component inventory (shadcn)

**Present:** Button  
**Add for MVP:** Input, Label, Tabs, ToggleGroup, Slider, Tooltip, Separator, Badge  

**Patterns:**

- **Data row:** label left (muted), value right (tabular), delta as signed `%` with color token.
- **TireSizeInput:** one row per field (width / aspect / rim) + compact text field for full size string.
- **ComparisonTable:** dense table or definition list; sticky header on scroll in data panel.
- **SpeedometerPanel:** Slider for indicated speed; two readouts (indicated vs actual).

Icons: Phosphor, 16px inline with labels.

## 3D scene specification

- **Scale:** 1 unit = 1 meter (`mm / 1000`).
- **Tire mesh:** `LatheGeometry` from parametric profile; ~96 segments; rubber `MeshStandardMaterial` (roughness ~0.9, near-black `#1a1a1a`).
- **Wheel:** metallic material (metalness ~0.85); proposed wheel may use subtle accent on face only.
- **Ground:** subtle grid or matte plane; `ContactShadows` from drei.
- **Lighting:** `Environment` + `Lightformer` only (no HDR CDN presets).
- **Controls:** `OrbitControls` — min/max distance, limit polar angle (no under-floor); damped.
- **Modes:** Side-by-side (shared ground, ride-height delta visible); Overlay (coaxial, original ~40% opacity).
- **Annotations:** drei `Html` + line primitives; toggle off by default on mobile if cluttered.
- **Fallback:** same container shows `TireSilhouette2D` when WebGL unavailable.

## Original vs proposed (visual language)

| Element | Original | Proposed |
|---------|----------|----------|
| Label | Muted foreground | Accent or primary emphasis |
| 3D rubber | Standard black | Same (difference via wheel/annotation) |
| 2D SVG stroke | `muted-foreground` | accent stroke |
| Delta column | — | signed % next to proposed column |

## Accessibility

- All inputs labeled; errors associated with fields.
- Stage has `aria-label` describing comparison mode.
- Focus visible (Lyra ring tokens).
- Do not rely on color alone for ±3% caution — include text (“Caution: diameter change &gt;3%”).

## Status

**Provisional** — T07 must follow this doc; update this file when the final design spec is ready.
