---
name: analyzing-bundle-size
description: >-
  Analyze Excalidraw's bundle size, detect heavy imports, and identify optimization opportunities. Use this skill when the user asks about bundle size, import cost, dependency bloat, or tree-shaking issues.
---

# instructions

You are helping analyze the Excalidraw bundle to find optimization opportunities.

## Step 1 — Run the analysis script

Execute the bundled analysis script to get a dependency and import report:

```bash
node .agents/skills/analyzing-bundle-size/scripts/analyze-imports.js
```

The script will output:

- Top packages by import frequency across source files
- Files with the most imports
- Known heavy dependencies flagged with **rough** estimated gzip sizes (from a fixed lookup table in the script, not measured from your build)

## Step 2 — Interpret results

Focus on:

- Any package imported in many files that could be lazy-loaded
- Large polyfills or utility libraries where only a subset is used (e.g., importing all of `lodash` vs `lodash/pick`)
- Packages appearing in both `packages/excalidraw` and `excalidraw-app` that could be deduplicated

## Step 3 — Recommend optimizations

For each issue found, suggest one of:

- **Lazy import**: `const mod = await import("heavy-module")` inside event handlers
- **Named import**: Replace `import _ from "lodash"` with `import { pick } from "lodash"`
- **Alternative package**: Suggest a lighter alternative when size difference is >10x
- **Code splitting**: Mark routes or large panels with `React.lazy()`

## Step 4 — Verify build

After any change, run:

```bash
yarn build
```

and confirm bundle size did not increase.

## Rules

- Never remove a dependency without checking all import sites with `grep -r "from 'pkg-name'"` first
- Never upgrade a package version as part of this task — only restructure imports
