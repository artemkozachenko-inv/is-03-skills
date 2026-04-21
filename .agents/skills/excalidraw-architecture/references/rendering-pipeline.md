# Excalidraw Rendering Pipeline

## Overview

Excalidraw uses a **Canvas 2D rendering engine** — React renders the UI chrome, but all drawing happens on HTML `<canvas>` elements via the 2D context API.

## Key files

- `packages/excalidraw/renderer/staticScene.ts` — `renderStaticScene()` (static layer)
- `packages/excalidraw/renderer/interactiveScene.ts` — `renderInteractiveScene()` (selection, handles, interaction)
- `packages/excalidraw/renderer/renderNewElementScene.ts` — `renderNewElementScene()` (in-progress element)
- `packages/element/src/renderElement.ts` — `renderElement()` from `@excalidraw/element` (per-element canvas drawing)
- `packages/excalidraw/components/canvases/` — `StaticCanvas`, `InteractiveCanvas`, `NewElementCanvas` wire React to the render functions
- `packages/excalidraw/components/App.tsx` — app shell; canvas components receive elements and trigger redraws

There is no single `renderScene.ts`; the pipeline is split across the modules above.

## Pipeline stages

1. **Scene change** — element is added/modified in the scene (`elements` / `Scene`)
2. **React re-render** — canvas components receive props and call the appropriate render function
3. **Scene render functions** — `renderStaticScene`, `renderInteractiveScene`, and/or `renderNewElementScene` iterate elements and apply viewport transforms
4. **`renderElement()`** (`@excalidraw/element`) — dispatches to element-specific draw logic
5. **Canvas 2D draw calls** — `ctx.beginPath()`, `ctx.fill()`, `ctx.stroke()`, etc.

## Coordinate system

- Elements use **scene coordinates** (world space)
- Viewport transform: `scrollX`, `scrollY`, `zoom` (a `{ value: NormalizedZoomValue }` object) stored in `AppState`, plus `offsetLeft`/`offsetTop` for the canvas position within the page
- Canonical helpers in `packages/common/src/utils.ts` (exported via `@excalidraw/common`):
  - `sceneCoordsToViewportCoords({ sceneX, sceneY }, { zoom, scrollX, scrollY, offsetLeft, offsetTop })`
    → `x = (sceneX + scrollX) * zoom.value + offsetLeft`
  - `viewportCoordsToSceneCoords({ clientX, clientY }, { zoom, scrollX, scrollY, offsetLeft, offsetTop })`
    → `x = (clientX - offsetLeft) / zoom.value - scrollX`
- Always use these helpers rather than inlining the formula, to stay in sync with `AppState`

## Performance notes

- Throttling: static scene uses `throttleRAF` for `renderStaticScene`
- `roughCanvas` (roughjs) used for hand-drawn look where applicable
- During drag, interactive layer updates frequently; static content may be cached

## When to touch this

- Adding or changing how an element draws on canvas: start in `packages/element/src/renderElement.ts` and related element code
- Changing zoom/scroll transforms: renderer files above and `AppState` in `packages/excalidraw/types.ts`
- Hit testing: see `packages/element/src/collision.ts`
