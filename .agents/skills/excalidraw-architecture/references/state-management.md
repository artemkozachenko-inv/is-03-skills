# Excalidraw State Management

## Overview

Excalidraw uses a **custom `actionManager`** — NOT Redux, Zustand, or MobX. All state mutations must go through this system.

## Key files

- `packages/excalidraw/actions/manager.tsx` — `ActionManager` class
- `packages/excalidraw/actions/types.ts` — `Action` interface
- `packages/excalidraw/actions/` — individual action implementations
- `packages/excalidraw/types.ts` — `AppState` type (source of truth for all UI state)

## How actions work

```text
User interaction
  → actionManager.executeAction(action, source?, value?)
  → action.perform(elements, appState, value, app)
  → returns { appState?, elements?, ... } (see ActionResult in types)
  → App merges returned state → triggers re-render
```

## `AppState` key fields

- `viewBackgroundColor` — canvas background
- `selectedElementIds` — Record<id, true>
- `editingElement` — element currently being edited (or null)
- `zoom` — `{ value: NormalizedZoomValue }`
- `scrollX`, `scrollY` — viewport offset
- `activeTool` — current tool (type + customType)

## Rules for state changes

1. Never mutate `AppState` directly — always return a new partial from `action.perform()`
2. Element mutations use `mutateElement()` from `packages/element/src/mutateElement.ts`
3. `commitToHistory: true` in action return marks the change as undoable

## History / Undo

- `packages/excalidraw/history.ts` manages undo/redo stacks
- Only actions returning `commitToHistory: true` are recorded
