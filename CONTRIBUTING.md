# Contributing

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
git clone <repo-url>
cd three-viewer
npm install
npm run dev
```

## Before opening a PR

Run both checks locally and make sure they pass:

```bash
npm run lint   # zero errors
npm test       # all tests pass
```

## Code standards

**No console statements.** ESLint enforces `no-console: error`. Use the `modelError` store state to surface errors to the user.

**No hardcoded paths.** All shared constants (model path, accepted extensions, store defaults) live in `src/lib/constants.ts`.

**No duplicate validation logic.** File-type and file-size checks go through `isValidModelFile` / `isModelFileTooLarge` in `src/lib/utils.ts`.

**Tests required for utility functions.** Any new function in `src/lib/` that is pure (no React, no Three.js, no browser APIs) must have a test in a sibling `.test.ts` file.

**Error boundaries.** New dynamic imports that render 3D content must be wrapped in `<ErrorBoundary>`.

**Three.js disposal.** Any code that creates geometries, materials, or textures must also dispose them. Use `disposeScene` from `src/lib/materialRegistry.ts` as the disposal utility; extend it if new resource types are introduced.

## PR checklist

- [ ] `npm run lint` passes with zero errors
- [ ] `npm test` passes
- [ ] No `console.log` / `console.warn` / `console.error` left in source
- [ ] No new hardcoded model paths or file-extension strings (use `constants.ts`)
- [ ] New utility functions have unit tests
- [ ] New dynamic imports are wrapped in `<ErrorBoundary>`
- [ ] PR description explains *why*, not just *what*
