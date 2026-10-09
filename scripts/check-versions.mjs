#!/usr/bin/env node
/**
 * Verifies that every file carrying a version (server.json, manifest.json,
 * Claude Code plugin files) matches package.json. Used by CI and by the
 * publish workflow, which also passes the release tag to compare against:
 *
 *   node scripts/check-versions.mjs            # consistency check only
 *   node scripts/check-versions.mjs v1.2.3     # ...and must equal the tag
 */
import { readFileSync } from "node:fs";

const read = (file) => JSON.parse(readFileSync(file, "utf8"));

const pkg = read("package.json").version;
const server = read("server.json");
const found = {
  "server.json": server.version,
  "server.json packages[0]": server.packages[0]?.version,
  "manifest.json": read("manifest.json").version,
  ".claude-plugin/plugin.json": read(".claude-plugin/plugin.json").version,
  ".claude-plugin/marketplace.json": read(".claude-plugin/marketplace.json").plugins[0]
    ?.version,
};

const tag = process.argv[2];
const expected = tag ? tag.replace(/^v/, "") : pkg;
if (tag) found["package.json"] = pkg;

const mismatches = Object.entries(found).filter(([, version]) => version !== expected);
for (const [file, version] of mismatches) {
  console.error(
    `::error::Version mismatch: expected ${expected}, ${file} has ${version}` +
      (tag ? "" : " (run pnpm run sync-versions)"),
  );
}
if (mismatches.length > 0) process.exit(1);
console.log(`All versions match ${expected}`);
