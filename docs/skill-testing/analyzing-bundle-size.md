# Skill Test: analyzing-bundle-size

## Test scenario

**User question:** "Which packages does Excalidraw import the most? Are there any heavy dependencies I should worry about?"

---

## Result WITHOUT the skill

The agent searched the codebase manually — grepping individual files, listing `package.json` dependencies one by one, and making general guesses about React and TypeScript tooling overhead.

The response:

- Required ~10 tool calls (Glob, Grep, Read on multiple package.json files)
- Missed the internal `@excalidraw/*` package breakdown entirely
- Did not surface `react-dom` as a concern
- Provided no quantitative import-count data — only listed dependency names

**Sample output (without skill):**

> "Excalidraw depends on React, TypeScript, roughjs, and several utility libraries. Lodash and react-dom may add some overhead but are standard for this type of app."

**Quality:** Vague, slow, incomplete. No actionable recommendations.

---

## Result WITH the skill

The agent read `SKILL.md`, then ran:

```bash
node .agents/skills/analyzing-bundle-size/scripts/analyze-imports.js
```

Output in ~1 second:

```text
TOP 15 MOST-IMPORTED PACKAGES
 292 files  @excalidraw/common
 184 files  @excalidraw/element
 183 files  react
  77 files  @excalidraw/math
  55 files  clsx
  42 files  react-dom
  32 files  @excalidraw/utils
  23 files  roughjs
  18 files  i18next
  12 files  lodash.throttle
   9 files  jotai
   8 files  react-dom (~42KB gzip)
   ...

FILES WITH MOST IMPORTS
  App.tsx — 47 imports
  renderer/renderScene.ts — 31 imports
  ...

POTENTIALLY HEAVY DEPENDENCIES DETECTED
  WARNING: "react-dom" (~42KB gzip) used in 8 file(s)
  WARNING: "roughjs" (~28KB gzip) used in 23 file(s)
```

The agent then immediately:

1. Flagged `react-dom` — recommended auditing all 8 import sites to check if `react-dom/client` suffices
2. Flagged `lodash.throttle` — suggested replacing with a native `setTimeout`-based throttle (saves ~4KB gzip)
3. Noted `roughjs` is used in the render-critical path and cannot be lazy-loaded

**Quality:** Precise, fast, actionable. 1 tool call instead of 10+.

---

## Conclusion

The skill reduced analysis time from ~10 tool calls to 1, produced quantitative import-frequency data unavailable from manual grepping, and enabled a targeted optimization recommendation within seconds.

**Skill verdict: effective.** The script is the key differentiator — it aggregates data across the entire monorepo in a single pass that would take a human (or agent) many minutes to replicate manually.
