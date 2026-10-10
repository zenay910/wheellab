# WheelLab — Design Specification

Authoritative visual reference. Derived from shadcn **Lyra** preset (neutral, `rounded-none`, JetBrains Mono).

**Status:** v1 — *Approved* for the app shell, tokens, color mode, accent, and layout (T07). Component patterns for T08–T12 and the 3D section are *direction* (refine in their tasks; record changes here).

## Principles

- **Precise** — numbers and dimensions are first-class; alignment and spacing are tight.
- **Restrained** — no gratuitous gradients, neon, oversized radii, or decorative motion.
- **Automotive / instrument-like** — reads as engineering or configurator software, not generic SaaS.
- **3D as hero** — comparison stage dominates; chrome is minimal.

## Do not

- Excessive rounded cards, cartoon tires, or “AI slop” layouts. No `rounded-*` utilities in app code (Lyra is square).
- Gradients, glows, drop shadows, or colored large-area backgrounds.
- Compute tire dimensions in UI components (see AGENTS.md).
- Weaken fitment disclaimer visibility or wording.
- Use Lucide — Phosphor only, `*Icon`-suffixed exports (e.g. `TireIcon`, not deprecated `Tire`).
- Color-code deltas green/red. Deltas are neutral; only the ±3% caution uses `destructive`.

## Color mode

- **Dark only for MVP.** `<html lang="en" class="dark">` in `index.html` plus `<meta name="color-scheme" content="dark">` and `<meta name="theme-color" content="#0a0a0a">`. No toggle.
- Light tokens stay defined and valid (kept in sync) but are not a shipped mode.
- `html` gets `bg-background` in the base layer (prevents light overscroll flash).

## Design tokens

From `src/index.css` (Lyra / neutral oklch), plus three WheelLab tokens:

| Token | Light (`:root`) | Dark (`.dark`) | Tailwind | Use |
|-------|-----------------|----------------|----------|-----|
| `--proposed` | `oklch(0.5 0.11 240)` | `oklch(0.74 0.12 232)` | `bg-proposed`, `text-proposed`, `border-proposed`, `stroke-proposed` | Identity of the **proposed** tire |
| `--proposed-foreground` | `oklch(0.985 0 0)` | `oklch(0.145 0 0)` | `text-proposed-foreground` | Text on a solid proposed fill (rare) |
| `--stage` | `oklch(0.97 0 0)` | `oklch(0.12 0 0)` | `bg-stage` | Recessed background of the central stage |

`@theme inline` mappings: `--color-proposed: var(--proposed); --color-proposed-foreground: var(--proposed-foreground); --color-stage: var(--stage);`

Why not `chart-2`: it is `oklch(0.556 0 0)` — a neutral gray indistinguishable from `muted-foreground`. Do not use shadcn `accent` either: in Lyra it is the hover-surface gray. `chart-*` tokens stay unused.

Contrast (dark): `--proposed` on `background` 8.8:1, on `stage` 9.0:1, on `card` 8.0:1; `muted-foreground` on `background` 7.6:1; `destructive` on `background` 6.8:1. Light `--proposed` on white 5.9:1.

### Accent usage rules (`proposed`)

- **Use for:** proposed swatch (solid), 2D proposed stroke (T11), 3D proposed wheel-face accent and proposed annotations (T15/T17), optional `text-proposed` on the “Proposed” column heading.
- **Never for:** deltas, buttons/primary actions (primary stays neutral), cautions/errors (`destructive`), large fills, gradients, glows, focus rings.
- Fills: solid only at swatch/line scale. Outlines: `border-proposed/50` max. No tinted panels.
- **Original** tire = neutral: hollow swatch (`border border-muted-foreground`), default text, 2D stroke `muted-foreground`. Hollow vs filled swatch means identity never depends on color alone.

### Other tokens

- **Font:** JetBrains Mono Variable (`font-mono` on `html`).
- **Radius:** none (Lyra components are `rounded-none`).
- **Surfaces:** everything chrome sits on `bg-background`; the stage is `bg-stage`; popovers/tooltips use Lyra defaults. Separation is by **1px `border-border` rules, not gaps or cards.**

## Spacing and sizing

- 4px base. Panel inset `px-4` (16px). Stage overlays inset `3` (12px).
- Control height 32px (`h-8`, Lyra default for Input/Toggle/Button). Data rows `min-h-8`.
- Header `h-12` (48px). Panel section header `h-9` (36px).
- Icons 16px (`size-4`) inline; empty-state icon 32px (`size-8`).

## Layout grid

Full-bleed (no max width). Regions are divided by 1px borders; no gutters.

### Desktop (≥1024px, `lg`) — fixed 100svh frame

```
┌─────────────────────────────────────────────────────────────┐
│ Header h-12: mark + WheelLab │ descriptor     unit toggle   │
├──────────────┬──────────────────────────────┬───────────────┤
│ Control rail │ Central stage (bg-stage)     │ Data panel    │
│ Original     │ legend TL        toolbar TR  │ Comparison    │
│ Proposed     │                              │ Speedometer   │
│ (scrolls)    │ status BL          ground    │ Calculations  │
│              │                              │ (scrolls)     │
├──────────────┴──────────────────────────────┴───────────────┤
│ Footer: fitment disclaimer (always visible, auto height)    │
└─────────────────────────────────────────────────────────────┘
```

- Frame: `lg:grid lg:h-svh lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:overflow-hidden`. The page never scrolls on desktop; rail and data panel scroll independently (`lg:min-h-0 lg:overflow-y-auto`). The stage never scrolls.
- Columns (rail / stage / data):

| Breakpoint | Classes | At breakpoint width |
|------------|---------|---------------------|
| `lg` 1024 | `lg:grid-cols-[16rem_minmax(0,1fr)_24rem]` | 256 / 384 / 384 px |
| `xl` 1280 | `xl:grid-cols-[18rem_minmax(0,1fr)_26rem]` | 288 / 576 / 416 px |
| `2xl` 1536 | `2xl:grid-cols-[20rem_minmax(0,1fr)_28rem]` | 320 / 768 / 448 px |

  The data panel is wider than the rail because the comparison table needs 4 columns (label, original, proposed, Δ) with values up to ~10ch (`1,985.1 mm`).
- Borders: rail `lg:border-r`, data `lg:border-l`, header `border-b`, footer `border-t`.

### Mobile (<1024px) — page scroll

Order: Header (sticky) → Stage (`h-[40svh] min-h-64`) → Inputs (tabs Original | Proposed) → Data panels → Disclaimer (end of page, not sticky).

- DOM order is rail → stage → data (keyboard reaches inputs first on desktop); on mobile the stage is moved up with `order-first lg:order-none`.
- Header is `sticky top-0 z-20` on mobile (unit toggle always reachable), `lg:static`.
- Each region gets `border-b` when stacked.
- Disclaimer is not sticky on mobile: 5–6 lines at 360px would take ~25% of the viewport. It follows the data panels (where comparisons are shown) in full; the ±3% caution (T12) appears inline with the comparison.

### Control rail tabs pattern

One `Tabs` (`defaultValue="original"`) wraps both tire sections:

- `TabsList variant="line"` with `className="w-full lg:hidden"`; two triggers with a `TireSwatch` + label.
- Both `TabsContent` use `forceMount` and `className="data-[state=inactive]:hidden lg:data-[state=inactive]:block"` → tabs on mobile, both stacked on desktop. No JS media queries.

## Shell components

- **AppShell** — owns every landmark and its layout classes; slot components render content only.
- **PanelSection** — the only section header pattern in rail and data panel:
  - Wrapper `div.border-b.border-border.last:border-b-0` with `role="group"` + `aria-labelledby` (title id); header row `flex h-9 items-center gap-2 px-4`; optional 16px icon slot `text-muted-foreground`; title `h2.text-xs.font-medium.uppercase.tracking-wider.text-muted-foreground`; optional right slot `ml-auto flex items-center gap-2`; body `px-4 pb-4`.
- **TireSwatch** — `size-2.5` square; original = `border border-muted-foreground`, proposed = `bg-proposed`. Always `aria-hidden`, always next to a text label.
- **ComparisonStage** — `section` with required `aria-label`, `absolute inset-0 overflow-hidden bg-stage`; overlay slots: `legend` (top-left, `pointer-events-none`), `toolbar` (top-right, T18), `status` (bottom-left, T11 scale bar / T12 caution). Children = canvas or 2D view, full-bleed.
- **Stage empty state** — block anchored `absolute inset-x-0 top-0 bottom-[22%]` (centered above the ground line); `ComparisonStage` `caption` prop supplies the size line; centered `TireIcon` (`size-8 text-muted-foreground/50`, `weight="light"`), caption “Comparison view” (section-label style) and the two size strings; dashed ground line `border-t border-dashed border-border` at `bottom-[22%]` with a “Ground” label at right. Previews the T11 common ground line.
- **Header** — `WheelLabMark` (16px inline SVG: outer ring `currentColor`, inner ring `stroke-proposed`) + wordmark `Wheel` + `Lab` in `text-muted-foreground` (`h1 aria-label="WheelLab"` so the split span reads as one word); vertical `Separator` + descriptor “Tire size comparison” (`hidden sm:flex`); right: unit `ToggleGroup` (Metric | Imperial).
- **Favicon** — `public/favicon.svg`, same mark on `#0a0a0a`.
- **FitmentDisclaimer** — `InfoIcon` + approved copy verbatim (`WarningIcon` is reserved for the caution state).

## Units

- Global toggle in header; default **imperial** (PROJECT.md assumption 4). Tire size strings and section width always in mm.
- `ToggleGroup type="single" variant="outline" size="sm" spacing={0}`; ignore empty value (Radix allows deselect).

## Typography scale

| Use | Class / size |
|-----|----------------|
| App title (h1) | `text-sm font-medium tracking-wide uppercase` |
| Section label (h2) | `text-xs font-medium uppercase tracking-wider text-muted-foreground` |
| Primary values | `text-sm tabular-nums` (data rows may use `text-xs`) |
| Body / help / disclaimer | `text-xs/relaxed` |
| Delta / badge | `text-xs` in `Badge` |

Use tabular figures for all numeric columns. Do not reduce text opacity below `text-muted-foreground` (opacity only on decorative icons/lines).

## Component inventory (shadcn)

**Present:** Button, Input, Label, Tabs, Toggle (dependency of ToggleGroup), ToggleGroup, Slider, Tooltip, Separator, Badge — installed unmodified via `npx shadcn add`. Customize per use with `className`, never by editing `src/components/ui/*`.

- Tooltip needs one app-level `<TooltipProvider delayDuration={300}>` (Lyra default is 0).
- ToggleGroup items: add `text-muted-foreground data-[state=on]:text-foreground` so the selected state is not only a background change.

**Patterns (direction for T08–T12):**

- **Data row:** label left (muted), value right (tabular), delta as signed value in `foreground` — no color. Rows `min-h-8 border-b border-border`, labels may wrap.
- **TireSizeInput:** compact text field for the full size string + one row per field (width / aspect / rim).
- **ComparisonTable:** grid `grid-cols-[minmax(0,1fr)_repeat(3,auto)]` or a `<table>`; sticky column header within the scrolling data panel.
- **SpeedometerPanel:** Slider for indicated speed; two readouts (indicated vs actual).
- **Caution (T12):** `Badge variant="destructive"` + `WarningIcon` + text “Caution: diameter change >3%”.

## 3D scene specification

- **Scale:** 1 unit = 1 meter (`mm / 1000`).
- **Canvas:** transparent (`gl={{ alpha: true }}`) so `bg-stage` shows through; fills `ComparisonStage` children.
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
| Swatch | Hollow square, `border-muted-foreground` | Solid square, `bg-proposed` |
| Label | Default/muted text + swatch | Default text + swatch (optional `text-proposed` heading) |
| 3D rubber | Standard black | Same (difference via wheel/annotation) |
| 2D SVG stroke | `muted-foreground` | `proposed` stroke |
| Delta column | — | signed value, `foreground` |

## Accessibility

- Landmarks: `header` (banner), `main`, `footer` (contentinfo). Inside `main`, three labeled `section` regions: “Tire sizes” (rail, `id="tire-inputs"`), the stage (`aria-label` describing comparison mode), “Comparison results” (data). Inputs/results are primary content → `section`, not `aside`.
- Headings: one `h1` (wordmark); `h2` per `PanelSection`. `PanelSection` is a `div`, not a `section`, to avoid landmark noise.
- Skip link “Skip to tire inputs” (`sr-only focus:not-sr-only`) as the first focusable element.
- All inputs labeled; errors associated with fields (`aria-invalid`, `aria-describedby`).
- Focus visible: Lyra ring tokens; custom focusables use `focus-visible:outline-1 focus-visible:outline-ring`.
- Do not rely on color alone for ±3% caution — include text (“Caution: diameter change &gt;3%”).
- Unit toggle group has `aria-label="Unit system"`.
