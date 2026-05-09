# Three-Viewer

A real-time 3D model viewer and configurator built with React Three Fiber and Next.js. Upload GLB/GLTF models, tweak materials, lights, and post-processing effects, then export the scene as ready-to-use React Three Fiber code.

---

## Features

- **Drag-and-drop model loading** — drop any GLB/GLTF file onto the canvas; the model is cached in IndexedDB and survives page reloads
- **Material inspector** — select any mesh and edit 50+ physical material properties in real time (color, roughness, metalness, transmission, IOR, clearcoat, sheen, iridescence, anisotropy, dispersion, and more)
- **Lighting controls** — configure ambient, spot, and point lights (color, intensity, position)
- **Environment presets** — switch between 10 HDRI environments: city, sunset, dawn, night, warehouse, forest, apartment, studio, lobby, park
- **Post-processing** — bloom (intensity, radius, luminance threshold/smoothing), film grain, and tone mapping exposure
- **Transform controls** — position, rotation, scale, and auto-rotation with speed control
- **Camera settings** — adjustable field of view and camera position
- **Code export** — generates formatted, copy-ready React Three Fiber JSX from the current scene configuration
- **Undo / redo** — full 100-step history with `Cmd+Z` / `Cmd+Shift+Z` (powered by Zundo)
- **Shareable URLs** — non-default settings are serialized into URL search params (environment, scale, FOV, bloom, noise)
- **Dark / light theme** — toggle with a button in the bottom bar
- **Onboarding tour** — animated cursor walkthrough for first-time users

---

## Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| React | React 19 |
| 3D rendering | Three.js 0.183, @react-three/fiber 9, @react-three/drei 10 |
| Post-processing | @react-three/postprocessing 3, postprocessing 6 |
| State | Zustand 5 + Zundo 2 (undo/redo middleware) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Code editor | CodeMirror 6 |
| Code formatting | Prettier 3 |
| URL state | nuqs 2 |
| UI primitives | @radix-ui/react-popover |

---

## Getting Started

```bash
npm install
npm run dev
```

The app is served at:

```
http://localhost:3000/releases/3d-editor
```

> Note: the app uses `basePath: '/releases/3d-editor'` in `next.config.ts`, so the root path redirects there automatically.

### Other commands

```bash
npm run build   # production build
npm start       # serve production build
npm run lint    # run ESLint
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (font, metadata)
│   ├── page.tsx            # Redirects to /editor
│   ├── fonts.ts            # Overused Grotesk font config
│   ├── globals.css         # CSS custom properties, Tailwind theme tokens
│   └── editor/
│       └── page.tsx        # Main editor entry point
│
├── components/
│   └── editor/
│       ├── Canvas.tsx          # React Three Fiber canvas, lights, model, post-processing
│       ├── InspectorPanel.tsx  # Right sidebar (model / material / lighting sections)
│       ├── BottomBar.tsx       # Upload, undo/redo, theme toggle, code toggle
│       ├── CodeOutput.tsx      # Read-only CodeMirror panel for generated code
│       ├── ColorPicker.tsx     # HSL popover with shade presets and hue slider
│       └── OnboardingTour.tsx  # Animated first-visit walkthrough
│
└── lib/
    ├── store.ts            # Central Zustand store with Zundo history
    ├── modelLoader.ts      # GLTFLoader wrapper
    ├── materialRegistry.ts # Mesh scanning and material override application
    ├── codeGen.ts          # JSX code generation from scene state
    ├── modelCache.ts       # IndexedDB read/write for uploaded models
    ├── urlSync.ts          # URL param serialization and deserialization
    └── useColor.ts         # Hex / RGB / HSL conversion utilities
```

---

## Architecture

### State management

All scene state lives in a single Zustand store (`src/lib/store.ts`). The Zundo middleware wraps it to capture snapshots on every change (200 ms debounce) and enable undo/redo. Only scene-relevant slices are tracked in history — materials, lights, transform, environment, camera, post-processing, and animation — so UI-only state changes don't pollute the history stack.

### Material system

When a model loads, `materialRegistry.ts` walks every mesh and creates a `MaterialOverride` record with captured defaults. The inspector panel reads and mutates these records; `applyMaterialOverrides()` is called on each render cycle to push the changes to the actual Three.js material objects. Materials are cloned to avoid mutating the GLTF cache.

### Model caching

Uploaded models are stored as `ArrayBuffer` in IndexedDB (`modelCache.ts`). On mount, the canvas checks the cache first. If a record exists it restores the model without requiring a re-upload; if the IndexedDB is empty it falls back to the bundled default `public/3d_model.glb`.

### Code generation

`codeGen.ts` reads the current store snapshot and produces self-contained React Three Fiber JSX. The output is formatted by Prettier and written into the CodeMirror panel. Clicking the copy button writes it to the clipboard.

### URL sharing

`urlSync.ts` serializes non-default values into URL search params using nuqs. Only changed params appear in the URL, keeping links short. Supported params: `env`, `scale`, `fov`, `bloom`, `noise`.

### Dynamic imports and SSR

All Three.js components are loaded with `next/dynamic` and `ssr: false`. This prevents server-side rendering of WebGL code, reduces the initial JS bundle, and defers heavy 3D libraries until the editor is actually mounted.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |

---

## Supported Model Formats

- **GLB** — recommended (single binary file)
- **GLTF** — supported (external resources resolved relative to the file)

Place a default fallback model at `public/3d_model.glb` to display something before the user uploads their own.

---

## Deployment

The app is a standard Next.js application with a `basePath` of `/releases/3d-editor`. To deploy under a different path, update `basePath` in `next.config.ts` and adjust any absolute asset references accordingly.

No server-side API routes are used — the app runs entirely in the browser.
