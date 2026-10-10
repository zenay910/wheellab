# WheelLab

Interactive tire and wheel size comparison for Ensign BUILD 2026. Enter original and proposed metric tire sizes, compare nominal dimensions and rolling circumference, and see how speedometer and odometer readings change — with a proportional 2D/3D visual comparison.

**Live demo:** _(URL after Vercel deploy — see T02)_

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (Lyra)
- Three.js + React Three Fiber + Drei (3D)
- Vitest (tire calculation tests)
- Phosphor icons

## Setup

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default Vite port).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with HMR |
| `npm run build` | Typecheck + production build |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest (after T03) |

## Project docs

- [PROJECT.md](./PROJECT.md) — scope, formulas, disclaimer
- [TASKS.md](./TASKS.md) — task list and status
- [AGENTS.md](./AGENTS.md) — development workflow
- [DESIGN.md](./DESIGN.md) — UI and 3D spec

## Folder structure (target)

```
src/
  lib/tire/          # Pure tire math (tested)
  components/
    ui/              # shadcn
    tire/            # Inputs, tables, 2D silhouette
    three/           # R3F scene and meshes
  hooks/
  App.tsx
```

## Disclaimer

WheelLab compares **nominal** tire dimensions only. It does not verify wheel offset, suspension clearance, load rating, or manufacturer fitment. Confirm changes with a qualified installer.

## License / hackathon

Built during Ensign BUILD 2026. Source will be public for submission.
