# Excalidraw Package Structure

## Monorepo layout

```text
packages/
  excalidraw/   → @excalidraw/excalidraw  (published npm package, public API)
  common/       → @excalidraw/common      (shared constants, utils)
  element/      → @excalidraw/element     (element CRUD, hit-testing, transforms)
  math/         → @excalidraw/math        (points, vectors, angles, matrices)
  utils/        → @excalidraw/utils       (general helpers)
excalidraw-app/ → Vite app (uses @excalidraw/excalidraw as a dependency)
```

## Import rules

- `excalidraw-app` may import from `@excalidraw/*` packages
- `packages/excalidraw` may import from `@excalidraw/common`, `element`, `math`, `utils`
- Lower-level packages (`math`, `common`) must NOT import from `excalidraw` (no circular deps)
- Public API surface is `packages/excalidraw/index.tsx` — only export from there

## Path aliases (tsconfig / vitest)

```json
"@excalidraw/common": ["packages/common/src/index.ts"],
"@excalidraw/element": ["packages/element/src/index.ts"],
"@excalidraw/math":    ["packages/math/src/index.ts"],
"@excalidraw/utils":   ["packages/utils/src/index.ts"]
```

## Build system

- Packages: **esbuild** via custom scripts in each `packages/*/package.json`
- App: **Vite** in `excalidraw-app/`
- Dev server: `yarn start` runs Vite in app dir, packages resolved via aliases

## Adding a new package export

1. Add export to `packages/<pkg>/src/index.ts`
2. If it's part of the public library API, also add to `packages/excalidraw/index.tsx`
3. Run `yarn test:typecheck` to confirm no broken imports
