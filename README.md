# WheelLab

Interactive tire and wheel size comparison for Ensign BUILD 2026. Enter original and proposed metric tire sizes, compare nominal dimensions and rolling circumference, and see how speedometer and odometer readings change — with a proportional 2D/3D visual comparison.

**Live demo:** https://wheellab-eight.vercel.app/  
**Source:** https://github.com/zenay910/wheellab  
**Demo script:** [DEMO.md](./DEMO.md)

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
| `npm test` | Run Vitest once |

## Project docs

- [PROJECT.md](./PROJECT.md) — scope, formulas, disclaimer
- [TASKS.md](./TASKS.md) — task list and status
- [AGENTS.md](./AGENTS.md) — development workflow
- [DESIGN.md](./DESIGN.md) — UI and 3D spec
- [DEMO.md](./DEMO.md) — judge demo walkthrough

## Folder structure

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

## Ensign BUILD 2026

Built during the hackathon; source is public for submission. Tire profile / 3D mesh polish may continue in optional tasks (T15, T17+).
