# Contributing to imgflip-mcp

Thanks for your interest in contributing! This document covers everything you
need to get started.

## Development setup

This project uses [pnpm](https://pnpm.io) — the exact version is pinned via the
`packageManager` field, so `corepack enable` is all you need.

```bash
git clone https://github.com/mariokernich/imgflip-mcp.git
cd imgflip-mcp
corepack enable
pnpm install
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm dev` | Compile in watch mode |
| `pnpm test` | Build + run the full test suite (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Lint & format check (Biome) |
| `pnpm lint:fix` | Auto-fix lint/format issues |
| `pnpm typecheck` | Type-check without emitting |

To try your changes against the real Imgflip API, use the MCP Inspector:

```bash
IMGFLIP_USERNAME=you IMGFLIP_PASSWORD=secret \
  npx @modelcontextprotocol/inspector node dist/index.js
```

## Guidelines

- **Tests:** new behavior needs a test. Client logic is unit-tested with a
  mocked `fetch` (`test/client.test.ts`); anything visible over the MCP
  protocol belongs in the stdio smoke tests (`test/server.smoke.test.ts`).
  Tests must not hit the real Imgflip API.
- **Lint/format:** run `npm run lint:fix` before committing — CI enforces a
  clean `biome check`.
- **Versions:** don't edit version numbers by hand in `server.json`,
  `manifest.json` or `.claude-plugin/*`. They are derived from
  `package.json` via `npm run sync-versions` (runs automatically on
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

## Releases (maintainers)

```bash
npm version patch   # bumps package.json + syncs all other version fields
git push origin main --follow-tags
```

(`npm version` is used deliberately — pnpm has no equivalent command, and it
only touches `package.json`, the sync script and git, never `node_modules`.)

The tag triggers the [publish workflow](.github/workflows/publish.yml). See
[docs/PUBLISHING.md](docs/PUBLISHING.md) for the full distribution guide.
