#!/usr/bin/env node
/**
 * Analyze import patterns across Excalidraw source files.
 * Outputs: top imported packages, files with most imports, and suspected heavy deps.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../../..");
const SEARCH_DIRS = ["packages", "excalidraw-app"];
const IMPORT_RE = /from\s+['"]([^'"./][^'"]*)['"]/g;

const packageCounts = {};
const fileCounts = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".cache", "build"].includes(entry.name)) continue;
      walk(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const src = fs.readFileSync(full, "utf8");
      let match;
      let count = 0;
      const seen = new Set();
      while ((match = IMPORT_RE.exec(src)) !== null) {
        const pkg = match[1].split("/").slice(0, match[1].startsWith("@") ? 2 : 1).join("/");
        if (!seen.has(pkg)) {
          seen.add(pkg);
          packageCounts[pkg] = (packageCounts[pkg] || 0) + 1;
        }
        count++;
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
  "framer-motion": 55,
  "three": 580,
  "d3": 80,
};

console.log("\n=== TOP 15 MOST-IMPORTED PACKAGES ===");
const sorted = Object.entries(packageCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [pkg, count] of sorted) {
  const sizeNote = KNOWN_SIZES[pkg] ? ` (~${KNOWN_SIZES[pkg]}KB gzip)` : "";
  console.log(`  ${count.toString().padStart(4)} files  ${pkg}${sizeNote}`);
}

console.log("\n=== TOP 10 FILES WITH MOST IMPORTS ===");
const topFiles = fileCounts.sort((a, b) => b.count - a.count).slice(0, 10);
for (const { file, count } of topFiles) {
  console.log(`  ${count.toString().padStart(4)} imports  ${file}`);
}

console.log("\n=== POTENTIALLY HEAVY DEPENDENCIES DETECTED ===");
let found = false;
for (const [pkg, size] of Object.entries(KNOWN_SIZES)) {
  if (packageCounts[pkg]) {
    console.log(`  WARNING: "${pkg}" (~${size}KB gzip) used in ${packageCounts[pkg]} file(s)`);
    found = true;
  }
}
if (!found) console.log("  None of the known heavy packages detected.");

console.log("\nDone. Total packages found:", Object.keys(packageCounts).length);
