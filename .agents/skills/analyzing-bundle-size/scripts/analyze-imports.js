#!/usr/bin/env node
/**
 * Analyze import patterns across Excalidraw source files.
 * Outputs: top imported packages, files with most imports, and suspected heavy deps.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../../..");
const SEARCH_DIRS = ["packages", "excalidraw-app"];

// Static named/default and side-effect imports: `from 'pkg'` and `import 'pkg'`
const STATIC_IMPORT_RE = /(?:from|import)\s+['"]([^'"./][^'"]*)['"]/g;
// Dynamic imports: `import('pkg')`
const DYNAMIC_IMPORT_RE = /import\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g;
// CommonJS requires: `require('pkg')`
const REQUIRE_RE = /require\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g;

const SKIP_DIRS = new Set([
  "node_modules", "dist", ".cache", "build",
  ".git", "coverage", "out", ".next", "__snapshots__", ".yarn",
]);

const packageCounts = {};
const lazyPackages = new Set();
const fileCounts = [];

/**
 * Normalize a raw import specifier to its top-level package name.
 * Scoped packages (e.g. "@scope/pkg/deep") are reduced to "@scope/pkg";
 * all others are reduced to the first path segment.
 *
 * @param {string} raw - The raw import specifier extracted from source code.
 * @returns {string} The normalized package name.
 */
function normalizePkg(raw) {
  return raw.split("/").slice(0, raw.startsWith("@") ? 2 : 1).join("/");
}

/**
 * Recursively walk a directory tree and collect import statistics for each
 * TypeScript/JavaScript source file found.
 * Results are accumulated into the module-level `packageCounts`, `lazyPackages`,
 * and `fileCounts` variables.
 *
 * @param {string} dir - Absolute path to the directory to walk.
 * @returns {void}
 */
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      let src;
      try {
        src = fs.readFileSync(full, "utf8");
      } catch (err) {
        process.stderr.write(`SKIP ${full}: ${err.message}\n`);
        continue;
      }

      let count = 0;
      const seen = new Set();

      /**
       * Record a single package import hit for the current file.
       * Deduplicates per-file counts and marks the package as lazily loaded
       * when applicable.
       *
       * @param {string} pkg - Normalized package name to record.
       * @param {boolean} [isLazy=false] - Whether the import is dynamic (lazy).
       * @returns {void}
       */
      const recordPkg = (pkg, isLazy = false) => {
        if (!seen.has(pkg)) {
          seen.add(pkg);
          packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
        }
        if (isLazy) lazyPackages.add(pkg);
        count++;
      };

      try {
        let match;
        STATIC_IMPORT_RE.lastIndex = 0;
        while ((match = STATIC_IMPORT_RE.exec(src)) !== null) {
          recordPkg(normalizePkg(match[1]));
        }
        DYNAMIC_IMPORT_RE.lastIndex = 0;
        while ((match = DYNAMIC_IMPORT_RE.exec(src)) !== null) {
          recordPkg(normalizePkg(match[1]), true);
        }
        REQUIRE_RE.lastIndex = 0;
        while ((match = REQUIRE_RE.exec(src)) !== null) {
          recordPkg(normalizePkg(match[1]));
        }
      } catch (err) {
        process.stderr.write(`SKIP ${full}: ${err.message}\n`);
        continue;
      }

      if (count > 0) {
        fileCounts.push({ file: path.relative(ROOT, full), count });
      }
    }
  }
}

for (const dir of SEARCH_DIRS) {
  walk(path.join(ROOT, dir));
}

const KNOWN_SIZES = {
  "lodash": 24,
  "moment": 67,
  "rxjs": 40,
  "core-js": 90,
  "react-dom": 42,
  "roughjs": 28,
  "framer-motion": 55,
  "three": 580,
  "d3": 80,
};

// Packages excluded from the heavy-dependency warning (render-critical or unavoidable).
const HEAVY_WARNING_IGNORE = new Set(["react-dom"]);

console.log("\n=== TOP 15 MOST-IMPORTED PACKAGES ===");
const sorted = Object.entries(packageCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [pkg, count] of sorted) {
  const sizeNote = KNOWN_SIZES[pkg] ? ` (~${KNOWN_SIZES[pkg]}KB gzip)` : "";
  const lazyNote = lazyPackages.has(pkg) ? " (lazy)" : "";
  console.log(`  ${count.toString().padStart(4)} files  ${pkg}${sizeNote}${lazyNote}`);
}

console.log("\n=== TOP 10 FILES WITH MOST IMPORTS ===");
const topFiles = fileCounts.sort((a, b) => b.count - a.count).slice(0, 10);
for (const { file, count } of topFiles) {
  console.log(`  ${count.toString().padStart(4)} imports  ${file}`);
}

console.log("\n=== POTENTIALLY HEAVY DEPENDENCIES DETECTED ===");
let found = false;
for (const [pkg, size] of Object.entries(KNOWN_SIZES)) {
  if (packageCounts[pkg] && !HEAVY_WARNING_IGNORE.has(pkg)) {
    console.log(`  WARNING: "${pkg}" (~${size}KB gzip) used in ${packageCounts[pkg]} file(s)`);
    found = true;
  }
}
if (!found) console.log("  None of the known heavy packages detected.");

console.log("\nDone. Total packages found:", Object.keys(packageCounts).length);
