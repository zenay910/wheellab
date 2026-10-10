# WheelLab — Agent Instructions

Persistent development rules for humans and AI assistants working on WheelLab (Ensign BUILD 2026).

## Documentation map

| Document | Purpose |
|----------|---------|
| [PROJECT.md](./PROJECT.md) | Product vision, scope, formulas, constraints, disclaimer |
| [TASKS.md](./TASKS.md) | Prioritized tasks, status, acceptance criteria |
| [DESIGN.md](./DESIGN.md) | Visual system and UI/3D specifications |
| [README.md](./README.md) | Setup, scripts, public demo URL |

Read the relevant doc before starting work.

## Commands

Run from the repository root (Vite app root):

```bash
npm run dev      # local development
npm run build    # production build
npm run lint     # ESLint
npm test         # Vitest (tire library tests)
```

## Development workflow

1. Consult the relevant project documentation.
2. Propose or select **one** task from [TASKS.md](./TASKS.md).
3. Wait for approval before implementation.
4. Implement the task.
5. Run relevant tests and verification.
6. Report results and limitations.
7. Update task status in TASKS.md after verification.
8. **Stop** before starting the next task.

## Code rules

- **Tire math** lives only in `src/lib/tire/`. Pure functions, no React imports. Unit-tested.
- **Components** (`src/components/`, `src/components/three/`) consume `TireDimensions` / `TireComparison`; they do not compute sidewall, diameter, circumference, or speedometer factors.
- **UI primitives**: shadcn/ui in `src/components/ui/`. Do not duplicate shadcn patterns ad hoc.
- **Icons**: `@phosphor-icons/react` only (Lyra preset).
- **Styling**: Tailwind v4 + design tokens in `src/index.css`. No inline magic colors outside tokens.
- **Package manager**: npm only. New dependencies require a note in TASKS.md and justification.
- **No** router, global state library, or backend unless scope changes in PROJECT.md.

## Definition of done (per task)

- Acceptance criteria in TASKS.md are met.
- `npm run build`, `npm run lint`, and `npm test` pass (when applicable to the task).
- TASKS.md status updated.
- Fitment disclaimer wording is never weakened (see PROJECT.md).

## Commits

Use: `T##: short summary` (e.g. `T05: tire geometry and compare with tests`).

Only commit when the user asks.

## Hackathon rules

- All implementation occurs during Ensign BUILD 2026.
- Do not reuse previously developed project code or assets.
- Final code must be publicly accessible.
- Mathematical comparison does **not** certify physical fitment — keep disclaimer visible where comparisons are shown.

## Architecture reminder

```
src/lib/tire/     → parse, validate, geometry, compare, format (tested)
src/components/tire/  → inputs, tables, 2D silhouette, panels
src/components/three/   → R3F scene, lathe tires, annotations
App state           → useReducer; derived values memoized from lib/tire
```

See PROJECT.md for formulas and DESIGN.md for layout and 3D spec.
