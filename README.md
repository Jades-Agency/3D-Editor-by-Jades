# three-viewer

An open-source 3D model configurator built with Next.js, React Three Fiber, and Zustand. Drop a `.glb` or `.gltf` file, tweak materials and lighting in real-time, then copy ready-to-use R3F code.

## Features

- Drag-and-drop `.glb` / `.gltf` model loading with IndexedDB persistence
- Real-time physically-based material editor (roughness, metalness, transmission, IOR, clearcoat, iridescence, sheen, dispersion, anisotropy)
- Live lighting controls — ambient, spot, and point lights plus HDR environment presets
- Post-processing: bloom, noise, tone mapping
- Undo / redo with full history (Cmd+Z / Cmd+Shift+Z)
- One-click R3F code export (formatted with Prettier)
- URL-shareable state for environment, scale, FOV, and post-processing
- Dark / light theme

## Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| 3D rendering | React Three Fiber + Three.js |
| Post-processing | `@react-three/postprocessing` |
| Helpers | `@react-three/drei` |
| State | Zustand 5 + Zundo (undo/redo) |
| Animations | Framer Motion |
| Styling | Tailwind CSS v4 |
| Code output | CodeMirror 6 + Prettier |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the editor is at `/editor`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open Vitest UI |

## Project structure

```
src/
├── app/
│   ├── editor/page.tsx        Main editor layout
│   ├── layout.tsx             Root metadata
│   └── globals.css            Tailwind + theme variables
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx         React Three Fiber viewport
│   │   ├── BottomBar.tsx      Upload, undo/redo, theme toggle
│   │   ├── DropZone.tsx       File drop target
│   │   ├── CodeOutput.tsx     R3F code preview panel
│   │   ├── ColorPicker.tsx    HSL color picker popover
│   │   ├── OnboardingTour.tsx Animated first-run tour
│   │   └── inspector/         Inspector panel (split into sections)
│   │       ├── index.tsx      Panel shell
│   │       ├── ModelSection.tsx
│   │       ├── MaterialSection.tsx
│   │       ├── LightingSection.tsx
│   │       └── shared/        Reusable form controls
│   ├── ErrorBoundary.tsx      React error boundary
│   └── ui/
│       └── Spinner.tsx        Loading spinner
└── lib/
    ├── store.ts               Zustand store + Zundo temporal history
    ├── constants.ts           Shared constants (model path, defaults)
    ├── utils.ts               File validation helpers
    ├── materialRegistry.ts    Three.js material snapshot + override
    ├── modelLoader.ts         GLTF loading + disposal
    ├── modelCache.ts          IndexedDB model cache
    ├── codeGen.ts             R3F code generation
    ├── urlSync.ts             URL ↔ store state sync
    └── useColor.ts            Color format conversion utilities
```

## Architecture notes

**State management** — A single Zustand store holds all editor state. The `temporal` middleware from Zundo wraps the material, lighting, transform, environment, camera, post-processing, and animation slices to provide undo/redo. UI-only state (theme, onboarding flags) is intentionally excluded from history.

**Material system** — When a model loads, `prepareSceneAndSnapshot` traverses the scene, records each material's properties into a `MaterialOverride` plain object, and snapshots them as store state. `applyMaterialOverrides` then writes the current store values back to the live Three.js material instances on every render cycle.

**Model loading** — Models are parsed client-side via `GLTFLoader`. The parsed `ArrayBuffer` is cached in IndexedDB so the last-used model is restored on next visit without re-uploading.

**SSR** — All 3D components use `next/dynamic` with `ssr: false` since Three.js requires a browser environment.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
