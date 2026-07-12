#!/usr/bin/env node
/**
 * Propagates the version from package.json to every other file that
 * carries one (server.json, manifest.json, Claude Code plugin files).
 * Runs automatically via the "version" npm script, so a plain
 * `npm version patch|minor|major` keeps the whole repo consistent.
 *
 * Versions are swapped in-place via text replacement so the files keep
 * their exact (Biome-checked) formatting.
 */
import { readFileSync, writeFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));

const files = [
  "server.json",
  "manifest.json",
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  // Matches only exact "version" keys ("manifest_version" etc. stay untouched).
  const updated = text.replace(/("version"\s*:\s*")[^"]+(")/g, `$1${version}$2`);
  JSON.parse(updated); // sanity check before writing
  writeFileSync(file, updated);
}

console.log(`Synced version ${version} to: ${files.join(", ")}`);
