# AGENTS.md

## Project Overview

Excalidraw is an open-source, collaborative virtual whiteboard for sketching hand-drawn-like diagrams. Built with React and TypeScript, it uses a custom Canvas 2D rendering engine and custom state management via `actionManager`.

## Tech Stack

- **Language**: TypeScript (strict mode)
- **UI**: React 19 (functional components, hooks only)
- **Build**: Vite
- **Testing**: Vitest + React Testing Library
- **Package Manager**: Yarn 1.x with workspaces
- **Linting**: ESLint + Prettier

## Project Structure

```
excalidraw-monorepo/
├── excalidraw-app/        # Vite-based web application
├── packages/
│   ├── excalidraw/        # Core library (@excalidraw/excalidraw)
│   │   ├── components/    # React UI components
│   │   ├── actions/       # State actions (actionManager)
│   │   ├── renderer/      # Canvas rendering pipeline
│   │   ├── scene/         # Scene management
│   │   └── types.ts       # Core type definitions (AppState)
│   ├── math/              # Math utilities (points, angles, vectors)
│   ├── element/           # Element types and operations
│   ├── common/            # Shared utilities
│   └── utils/             # General utilities
├── examples/              # Usage examples (Next.js, browser script)
└── dev-docs/              # Developer documentation
```

## Key Commands

- `yarn` — install dependencies
- `yarn start` — start dev server (excalidraw-app)
- `yarn build` — build the app
- `yarn test:app` — run Vitest tests
- `yarn test:typecheck` — TypeScript type checking
- `yarn test:code` — ESLint
- `yarn test:other` — Prettier check
- `yarn test:all` — run all checks
- `yarn fix` — auto-fix linting and formatting

## Architecture

- **State Management**: custom `actionManager` (NOT Redux/Zustand/MobX). State updates via `actionManager.dispatch()` only. State type: `AppState` in `packages/excalidraw/types.ts`.
- **Rendering**: Canvas 2D rendering via custom engine (NOT React DOM for drawing). Pipeline: Scene -> `renderScene()` -> canvas 2D context.
- **Monorepo**: Yarn workspaces with `@excalidraw/*` package aliases defined in `tsconfig.json`.

## Conventions

- Functional components with hooks only (no class components)
- Named exports only (no default exports)
- Props type: `{ComponentName}Props`
- Colocated tests: `ComponentName.test.tsx`
- TypeScript strict mode — no `any`, no `@ts-ignore`
- SCSS modules or CSS custom properties for styling
- kebab-case for utility files, PascalCase for components

## Skills

Available skills in `.agents/skills/`:

| Skill | Type | Purpose |
| ------- | ------ | --------- |
| `creating-excalidraw-components` | Simple | Scaffold React components following Excalidraw naming, styling, and state-management conventions |
| `analyzing-bundle-size` | With scripts | Run `scripts/analyze-imports.js` to detect heavy dependencies and import patterns; recommend tree-shaking and lazy-load opportunities |
| `excalidraw-architecture` | With references | Answer deep architecture questions (rendering pipeline, state management, package boundaries) using pre-built reference docs loaded on demand |
| `testing-excalidraw` | Simple | Write Vitest + React Testing Library tests following project conventions (correct runner API, colocated files, userEvent, direct source imports) |

### Skill details

**creating-excalidraw-components**
Guides creation of new UI components in `packages/excalidraw/components/`. Enforces named exports, `{Name}Props` types, SCSS modules, and `actionManager.executeAction()` for actions.

**analyzing-bundle-size**
Runs `node .agents/skills/analyzing-bundle-size/scripts/analyze-imports.js` to scan all `.ts/.tsx` source files and produce a ranked report of package import frequency and known-heavy dependency warnings.

**excalidraw-architecture**
Loads reference documents from `references/` on demand:

- `rendering-pipeline.md` — Canvas 2D rendering stages, coordinate system, roughjs
- `state-management.md` — actionManager, AppState, undo/history
- `package-structure.md` — monorepo boundaries, build system, import rules

**testing-excalidraw**
Guides writing tests for components and utilities in the Excalidraw monorepo. Specifies correct test runner (`vi.*` not `jest.*`), file placement (colocated, not `__tests__/`), import paths (source files, not public index), and interaction helpers (`userEvent` over `fireEvent`).

### Skill test results

See `docs/skill-testing/` for documented test scenarios (with/without skill) and conclusions:

- `docs/skill-testing/analyzing-bundle-size.md`
- `docs/skill-testing/testing-excalidraw.md`
