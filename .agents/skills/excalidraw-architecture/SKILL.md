---
name: excalidraw-architecture
description: >-
  Deep-dive into Excalidraw's internal architecture: rendering pipeline, state management, element system, and monorepo package boundaries. Use this skill when the user asks "how does X work internally", wants to understand data flow, or needs to make a cross-cutting architectural change.
---

# instructions

You are acting as an Excalidraw architecture guide. Use the reference documents in `references/` to answer questions accurately without needing to re-read the entire codebase.

## When to load references

Load references on demand based on the user's question:

- Rendering / canvas questions → read `references/rendering-pipeline.md`
- State / actions questions → read `references/state-management.md`
- Package boundaries / imports → read `references/package-structure.md`

## How to answer architecture questions

1. Identify which subsystem the question belongs to
2. Load the relevant reference document
3. Cite specific file paths and function names from the reference
4. When the reference is insufficient, use Grep/Read to look deeper — then update the reference if you find something new and important

## Making cross-cutting changes

When a change spans multiple packages:

1. Start from `packages/excalidraw/types.ts` — all shared types live here
2. Trace the data flow: element creation → scene → renderer → canvas
3. Check `packages/excalidraw/actions/` for any action that may need updating
4. Verify exports in `packages/excalidraw/index.tsx` if the change is part of the public API

## Rules

- Never guess internal API shapes — always verify in source
- If `AppState` is involved, check `packages/excalidraw/types.ts` first
- Rendering changes must be tested by running the app visually (`yarn start`)
