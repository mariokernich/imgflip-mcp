# Local Development

## Setup

The project uses [pnpm](https://pnpm.io), pinned via the `packageManager` field — `corepack enable` is all you need.

```bash
git clone https://github.com/mariokernich/imgflip-mcp.git
cd imgflip-mcp
corepack enable
pnpm install
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm dev` | Compile in watch mode |
| `pnpm test` | Build + run the full test suite (Vitest) |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm lint` / `pnpm lint:fix` | Biome lint & format |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm start` | Run the compiled server |

## Testing philosophy

Two layers, no real API calls:

- **`test/client.test.ts`** — unit tests for the API client with a mocked `fetch`: form encoding (including the `boxes[i][field]` array syntax), error paths, credential handling, timeouts.
- **`test/server.smoke.test.ts`** — boots the *compiled* server as a real subprocess and speaks MCP over stdio using the official SDK client: tool registration (free vs. Premium mode), annotations, prompt listing, error responses.

To poke at the server manually against the real API:

```bash
IMGFLIP_USERNAME=you IMGFLIP_PASSWORD=secret \
  npx @modelcontextprotocol/inspector node dist/index.js
```

## CI

Every push and PR runs lint, typecheck, the test suite (Node 20 + 22), a version-consistency check across all metadata files, and MCPB manifest validation — see `.github/workflows/ci.yml`.

## Versioning

`package.json` is the single version source. Don't edit versions in `server.json`, `manifest.json` or `.claude-plugin/*` by hand:

```bash
npm version patch   # bumps + syncs all files + creates the tag
git push origin main --follow-tags
```

(`npm version` is used deliberately — pnpm has no equivalent, and it never touches `node_modules`.)

## Documentation

This site is built with [ProperDocs](https://properdocs.org/) (the community continuation of MkDocs) and the Material theme; configuration lives in `properdocs.yml`. To work on it:

```bash
pip install -r requirements-docs.txt
properdocs serve        # live-reload at http://127.0.0.1:8000
properdocs build --strict
```

Deployed to GitHub Pages automatically on pushes to `main` that touch `docs/` or `properdocs.yml`.

## Contributing

Guidelines, PR checklist and scope notes: [`CONTRIBUTING.md`](https://github.com/mariokernich/imgflip-mcp/blob/main/CONTRIBUTING.md). The short version: new behavior needs a test, `pnpm lint` must be clean, English everywhere, and the server intentionally stays a thin mapping of the Imgflip API.
