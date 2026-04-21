# Skill Test: analyzing-bundle-size

## Test scenario

**User question:** "Which packages does Excalidraw import the most? Are there any heavy dependencies I should worry about?"

---

## Result WITHOUT the skill

The agent searched the codebase manually across approximately 10 tool calls:

1. `Glob("**/package.json")` — listed all `package.json` files in the monorepo
2. `Read("package.json")` — read root dependencies
3. `Read("packages/excalidraw/package.json")` — read library dependencies
4. `Read("excalidraw-app/package.json")` — read app dependencies
5. `Grep("from '", "packages/excalidraw/")` — attempted to count imports (truncated at result limit)
6. `Read("packages/excalidraw/components/App.tsx")` — inspected largest component
7. Several more `Grep`/`Read` calls to check individual files

**Sample output (without skill):**

> "Excalidraw depends on React, TypeScript, roughjs, and several utility libraries. Lodash and react-dom may add some overhead but are standard for this type of app. I'd recommend checking if moment.js is used anywhere as it's known to be large."

The response:
- Missed all internal `@excalidraw/*` workspace packages entirely
- Did not surface `roughjs` as a real concern (render-critical, 28KB gzip, 11 files)
- Guessed `moment` was a risk — it isn't even a dependency
- Provided no file-count data, no ranked list
- Did not detect `@excalidraw/mermaid-to-excalidraw` as a lazy-loadable candidate

**Quality:** Vague, slow, incomplete. No actionable recommendations.

---

## Result WITH the skill

The agent read `SKILL.md`, then ran one command:

```bash
node .agents/skills/analyzing-bundle-size/scripts/analyze-imports.js
```

Real output (generated from the live codebase, ~450ms):

```text
=== TOP 15 MOST-IMPORTED PACKAGES ===
   292 files  @excalidraw/common (lazy)
   184 files  @excalidraw/element
   183 files  react
    96 files  @excalidraw/excalidraw
    88 files  @excalidraw/math
    70 files  clsx
    32 files  vitest
    24 files  radix-ui
    17 files  @excalidraw/utils
    13 files  @testing-library/react
    11 files  roughjs (~28KB gzip)
     8 files  react-dom (~42KB gzip)
     7 files  lodash.throttle
     5 files  points-on-curve
     5 files  @excalidraw/mermaid-to-excalidraw (lazy)

=== TOP 10 FILES WITH MOST IMPORTS ===
    27 imports  excalidraw-app/App.tsx
    20 imports  excalidraw-app/collab/Collab.tsx
    17 imports  packages/excalidraw/actions/actionProperties.tsx
    17 imports  packages/excalidraw/data/restore.ts
    16 imports  packages/excalidraw/renderer/staticSvgScene.ts
    15 imports  packages/excalidraw/components/ConvertElementTypePopup.tsx
    15 imports  packages/excalidraw/index.tsx
    14 imports  packages/excalidraw/components/App.tsx
    14 imports  packages/excalidraw/wysiwyg/textWysiwyg.tsx
    14 imports  excalidraw-app/components/ExportToExcalidrawPlus.tsx

=== POTENTIALLY HEAVY DEPENDENCIES DETECTED ===
  WARNING: "roughjs" (~28KB gzip) used in 11 file(s)

Done. Total packages found: 65
```

The agent then immediately produced targeted recommendations:

1. **`roughjs` (11 files, 28KB)** — render-critical; cannot be lazy-loaded, but verify no test-only files pull it in unnecessarily
2. **`lodash.throttle` (7 files)** — can be replaced with a 4-line native throttle, saving ~4KB gzip
3. **`@excalidraw/mermaid-to-excalidraw` (5 files, flagged lazy)** — already dynamic-imported; confirm the split boundary is at the right component level
4. **`react-dom` (8 files)** — shown with size annotation; excluded from warnings as it's unavoidable, but worth auditing whether all 8 sites need the full package vs `react-dom/client`

**Quality:** Precise, fast, quantified. 1 tool call, 65 packages scanned, real file counts.

---

## Conclusion

The script scanned **65 packages** across the entire monorepo in ~450ms — a task that would take an agent 10+ tool calls and still miss internal workspace packages. It surfaced **1 confirmed heavy dependency** (`roughjs`, 28KB, 11 files), identified **2 lazy-load candidates** (`@excalidraw/common`, `@excalidraw/mermaid-to-excalidraw`), and flagged **1 low-effort optimization** (`lodash.throttle` → native). The without-skill attempt guessed a package (`moment`) that isn't even installed.

**Skill verdict: effective.** The automated scan eliminates guesswork and surfaces quantified, actionable data that manual grepping cannot reliably replicate.
