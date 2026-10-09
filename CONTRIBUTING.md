# Contributing to imgflip-mcp

Thanks for your interest in contributing!

Setup, commands, the test layout, CI and the release process are documented
once, in the **[local development guide](https://mariokernich.github.io/imgflip-mcp/development/)**
(source: [`docs/development.md`](docs/development.md)). The short version:

```bash
corepack enable && pnpm install
pnpm lint && pnpm typecheck && pnpm test
```

## Guidelines

- **Tests:** new behavior needs a test, and tests must not hit the real
  Imgflip API. See the [testing section](docs/development.md#testing-philosophy)
  for which file a test belongs in.
- **Lint/format:** run `pnpm lint:fix` before committing — CI enforces a
  clean `biome check`.
- **Versions:** don't edit version numbers by hand in `server.json`,
  `manifest.json` or `.claude-plugin/*`. They are derived from
  `package.json` via `pnpm sync-versions` (runs automatically on
  `npm version`), and CI fails on mismatches.
- **English only:** code, comments, docs and commit messages are in English.
- **Scope:** this server intentionally stays a thin, faithful mapping of the
  Imgflip API. Features that require server-side state, other APIs, or
  image processing beyond what Imgflip offers are out of scope.

## Pull requests

1. Fork and create a feature branch.
2. Make your changes (with tests).
3. Ensure `pnpm lint && pnpm typecheck && pnpm test` passes.
4. Add an entry under `[Unreleased]` in `CHANGELOG.md` if user-visible.
5. Open a PR with a clear description of the motivation and the change.
