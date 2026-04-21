# Skill Test: testing-excalidraw

## Test scenario

**User question:** "Write tests for a new `ColorPicker` component I just created in `packages/excalidraw/components/ColorPicker.tsx`."

---

## Result WITHOUT the skill

The agent attempted to write tests without project-specific context:

- Used `jest.fn()` instead of `vi.fn()` (wrong test runner API)
- Imported the component from `@excalidraw/excalidraw` (the public index) instead of directly from the source file — causes circular dependency issues
- Used `fireEvent.click` instead of `userEvent.click` (less realistic simulation)
- Did not know about `setupTests.ts` or which canvas mocks are already present
- Placed the test file in `__tests__/` subdirectory instead of colocating it

**Sample output (without skill):**

```tsx
// Wrong: uses jest, wrong import path, wrong file location
import { ColorPicker } from "@excalidraw/excalidraw";
import { render } from "@testing-library/react";

test("renders", () => {
  render(<ColorPicker />);
});
```

**Quality:** Produces broken tests. Requires multiple correction rounds.

---

## Result WITH the skill

The agent read `SKILL.md`, then produced:

```tsx
// packages/excalidraw/components/ColorPicker.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { ColorPicker } from "./ColorPicker";
import type { ColorPickerProps } from "./ColorPicker";

const defaultProps: ColorPickerProps = {
  color: "#ff0000",
  onChange: vi.fn(),
  label: "Stroke color",
};

describe("ColorPicker", () => {
  it("renders the trigger button with accessible label", () => {
    render(<ColorPicker {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /stroke color/i }),
    ).toBeInTheDocument();
  });

  it("calls onChange with new color when swatch is clicked", async () => {
    const onChange = vi.fn();
    render(<ColorPicker {...defaultProps} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /stroke color/i }));
    await userEvent.click(screen.getByRole("button", { name: /#0000ff/i }));
    expect(onChange).toHaveBeenCalledWith("#0000ff");
  });
});
```

Then confirmed how to run it:

```bash
yarn test:app -- --watch=false ColorPicker
```

**Quality:** Correct on the first attempt. Follows all project conventions.

---

## Conclusion

Without the skill, the agent produced tests with 4 distinct mistakes (wrong runner API, wrong import path, wrong file placement, wrong event simulation method). With the skill, it produced correct, idiomatic tests in one shot.

**Skill verdict: effective.** The skill's explicit rules about `vi.*` vs `jest.*`, direct source imports, and `userEvent` preference eliminate the most common class of mistakes when writing tests in this repo.
