---
name: testing-excalidraw
description: >-
  Write Vitest + React Testing Library tests for Excalidraw components and
  utilities following project conventions. Use when the user asks to add tests,
  write a test suite, increase coverage, or verify component behavior.
---

# Testing Excalidraw

## When to use this skill

Use when the user asks to write, fix, or extend tests for any code in the
Excalidraw monorepo — React components, utility functions, canvas helpers,
or action handlers.

## Test stack

- **Runner**: Vitest (configured in `vitest.config.mts`)
- **Component testing**: React Testing Library (`@testing-library/react`)
- **Setup file**: `setupTests.ts` at the repo root
- **Mocks**: `vi.mock()` / `vi.fn()` from Vitest (never `jest.*`)

## File placement rules

| What you're testing | Test file location |
| --- | --- |
| React component | Colocated: `ComponentName.test.tsx` next to the component |
| Utility function | Colocated: `utilName.test.ts` next to the source file |
| Action handler | `packages/excalidraw/actions/__tests__/actionName.test.ts` |

## How to write a component test

1. Import the component and render it with `render()` from `@testing-library/react`
2. Wrap in `<ExcalidrawActionContext.Provider>` if the component calls `actionManager`
3. Use `screen.getByRole` / `screen.getByText` — avoid `getByTestId` unless no semantic query works
4. Assert user-visible behavior, not internal state

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyPanel } from "./MyPanel";

describe("MyPanel", () => {
  it("renders the panel title", () => {
    render(<MyPanel appState={mockAppState} elements={[]} />);
    expect(screen.getByText("My Panel")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<MyPanel appState={mockAppState} elements={[]} onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
```

## How to write a utility test

```ts
import { describe, it, expect } from "vitest";
import { clamp } from "./math";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps to min", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
});
```

## Running tests

```bash
# Run all tests once
yarn test:app -- --watch=false

# Run a single file
yarn test:app -- --watch=false MyPanel

# Run with coverage
yarn test:app -- --coverage --watch=false
```

## Rules

- Never use `any` in test files — TypeScript strict mode applies
- Do not import from `packages/excalidraw/index.tsx` in tests — import directly from source files
- Mock canvas APIs (`getContext`, `measureText`) in `setupTests.ts`, not per-test
- Prefer `userEvent` over `fireEvent` for simulating user interactions
