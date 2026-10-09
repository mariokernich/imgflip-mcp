# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-09

### Changed

- **Node.js 22 or newer is now required** (`engines`, MCPB manifest).
  Node 18 and 20 are end-of-life and no longer tested; CI now runs on
  Node 22, 24 and 26. The tools, their parameters and the configuration
  are unchanged.
- Updated `@modelcontextprotocol/sdk` to 1.32 and `zod` to 4.6.
- `IMGFLIP_PREMIUM` now ignores surrounding whitespace, and empty
  `IMGFLIP_USERNAME`/`IMGFLIP_PASSWORD` values are treated as unset.
- Internal: the server is split into focused modules (config, result
  helpers, free/premium tools, prompts) with a `createServer()` factory;
  tool behavior is unchanged.
- Development tooling: TypeScript 7, Vitest 5, Biome rule presets; the
  test suite is now type-checked too.
- The README is now a compact landing page; detailed guides live only on
  the documentation site, and CONTRIBUTING.md links to the development
  guide instead of duplicating it.

### Fixed

- Security: the dependency update resolves all `pnpm audit` findings,
  including the advisory in `@modelcontextprotocol/sdk` < 1.31 and
  vulnerable transitive versions of `proxy-addr`, `fast-uri`, `hono`,
  `qs` and `ip-address`. These ship inside the `.mcpb` Desktop Extension.
- The publish workflow now verifies the Claude Code plugin versions too,
  using the same `scripts/check-versions.mjs` as CI.

## [1.0.1] - 2026-07-13

### Fixed

- Models drew memes themselves (SVG/HTML) instead of calling the tools: the
  server now ships MCP `instructions` telling clients to always use the
  Imgflip tools for meme requests, the `caption_image` description says so
  explicitly, and the Claude Code plugin gained an `imgflip-memes` skill
  that routes meme requests to the MCP tools.

## [1.0.0] - 2026-07-12

### Added

- MCP server exposing the Imgflip API over stdio with seven tools:
  `get_memes`, `caption_image` (free) and `search_memes`, `get_meme`,
  `caption_gif`, `automeme`, `ai_meme` (Premium, opt-in via
  `IMGFLIP_PREMIUM=true`).
- Generated memes are returned both as URL and as an inline MCP image block
  (up to 2 MB) so clients can render them directly.
- `make-meme` MCP prompt for guided meme creation.
- Tool annotations (`readOnlyHint` etc.) and client-side validation for
  `caption_image`.
- Distribution metadata for every major channel: npm (`mcpName`), the
  official MCP Registry (`server.json`), Claude Desktop Extensions
  (`manifest.json` + icon), and a built-in Claude Code plugin marketplace
  (`.claude-plugin/`, `.mcp.json`).
- Automated release pipeline (npm + MCP Registry + `.mcpb` release asset)
  and CI (lint, typecheck, tests, version-consistency, manifest validation).
- Vitest test suite: unit tests for the API client and stdio smoke tests
  against the compiled server.
- Biome for linting/formatting, Dependabot for dependency updates.
- pnpm as the package manager (pinned via `packageManager`, used in CI).

[Unreleased]: https://github.com/mariokernich/imgflip-mcp/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/mariokernich/imgflip-mcp/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/mariokernich/imgflip-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mariokernich/imgflip-mcp/releases/tag/v1.0.0
