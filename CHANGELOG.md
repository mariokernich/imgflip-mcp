# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/mariokernich/imgflip-mcp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mariokernich/imgflip-mcp/releases/tag/v1.0.0
