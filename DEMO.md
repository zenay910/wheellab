# WheelLab — Demo script (~2 minutes)

**URL:** https://wheellab-eight.vercel.app/

## Setup (before judges arrive)

- Open the live URL in Chrome (desktop or laptop).
- Confirm default sizes: **205/55R16** (original) vs **225/45R17** (proposed).
- Unit toggle: **Imperial** (default).

## Flow

1. **Hook (15 s)** — WheelLab compares nominal tire sizes and shows how plus-sizing changes diameter, speedometer error, and proportions. It does not certify physical fitment.

2. **Inputs (20 s)** — Change proposed to **245/45R18** (type in the text field, Enter). Point out live updates in the table and 3D stage. Note the **caution** when diameter change exceeds 3%.

3. **Visualization (30 s)** — Drag to orbit the 3D tires. Toggle **Overlay** to see the original ghosted inside the proposed. Mention 2D SVG fallback if WebGL is unavailable.

4. **Numbers (30 s)** — Comparison table: overall diameter, circumference, revs/mile. Speedometer panel: 60 mph indicated → actual speed and odometer error for 100 mi.

5. **Reset (15 s)** — Revert proposed to **225/45R17** or a size close to the vehicle’s OE. Read the footer **fitment notice** verbatim if asked about safety.

6. **Close (10 s)** — Source on GitHub; tire math is unit-tested in `src/lib/tire`.

## Quick checks if something breaks

- Hard refresh (Ctrl+Shift+R).
- Try overlay mode on a narrow window (defaults to overlay under 1024px).
- Disable hardware acceleration only if testing the 2D fallback path.
