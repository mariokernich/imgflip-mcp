# Publishing & Distribution Guide

This document describes every channel through which `imgflip-mcp` is (or can
be) distributed, what each one requires, and how a release works end to end.

## Overview

| Channel | Audience | Artifact | How it gets there |
| --- | --- | --- | --- |
| [npm](https://www.npmjs.com) | everyone (`npx -y imgflip-mcp`) | npm package | `npm publish` (automated by CI) |
| [MCP Registry](https://registry.modelcontextprotocol.io) | all MCP clients | `server.json` metadata | `mcp-publisher` (automated by CI) |
| [GitHub MCP Registry](https://github.com/mcp) | Copilot / VS Code users | — | fed automatically from the MCP Registry |
| Claude Desktop extension directory | Claude Desktop users | `.mcpb` bundle | built by CI, submitted manually once |
| Claude Code plugin marketplace | Claude Code users | this repo itself | nothing to publish — the repo is the marketplace |
| Community directories (Smithery, Glama, mcp.so, PulseMCP) | discovery | — | mostly indexed automatically |

The repo already contains all required metadata files:

```
package.json      npm package + "mcpName" ownership proof for the MCP Registry
server.json       MCP Registry entry (registry metadata, env var docs)
manifest.json     Claude Desktop Extension (MCPB) manifest with user_config
.mcpbignore       what to exclude from the .mcpb bundle
.claude-plugin/   Claude Code plugin + marketplace definition
.mcp.json         MCP server definition used by the Claude Code plugin
PRIVACY.md        privacy policy (required for the Claude extension directory)
.github/workflows/publish.yml   the automated release pipeline
```

## One-time setup

1. **npm account** — create/log into an npm account that may publish the
   `imgflip-mcp` package name, generate an *automation* access token, and add
   it to the GitHub repo as the `NPM_TOKEN` actions secret
   (**Settings → Secrets and variables → Actions**).
2. Nothing else — the MCP Registry step authenticates via GitHub OIDC (the
   `io.github.mariokernich/*` namespace is proven by the workflow running in
   this repo), and the GitHub release is created with the built-in
   `GITHUB_TOKEN`.

## Cutting a release

1. Bump the version — one command updates `package.json` and syncs it to
   `server.json`, `manifest.json` and `.claude-plugin/*` (via the
   `scripts/sync-versions.mjs` hook), commits, and creates the tag:

   ```bash
   npm version patch   # or minor / major
   ```

2. Push with the tag:

   ```bash
   git push origin main --follow-tags
   ```

3. The `Publish` workflow then:
   - verifies the version consistency,
   - builds and publishes the npm package (with provenance),
   - publishes `server.json` to the MCP Registry,
   - packs the Desktop Extension and attaches
     `imgflip-mcp-v1.0.1.mcpb` to a GitHub release.

Everything below documents what each channel is and the manual steps, in case
you ever need to run them by hand.

---

## 1. npm

The MCP Registry stores metadata only — the actual code must live on npm.
The published package contains `dist/` plus a `bin` entry, so consumers run
it with `npx -y imgflip-mcp` and never need to clone this repo.

Manual publish:

```bash
pnpm install --frozen-lockfile && pnpm build
npm publish --access public
```

(`npm publish` also works in this pnpm repo — publishing only packs `dist/`
per the `files` field and needs no `node_modules` layout knowledge.)

The `mcpName` field in `package.json`
(`io.github.mariokernich/imgflip-mcp`) is how the MCP Registry verifies that
the npm package and the registry entry belong together — don't remove it.

## 2. Official MCP Registry (→ Copilot, VS Code, Claude Code)

The [MCP Registry](https://registry.modelcontextprotocol.io) is the shared,
open catalog that downstream clients consume — most importantly the
[GitHub MCP Registry](https://github.com/mcp) that Copilot and VS Code use
for MCP server discovery, and Claude Code's `/mcp` ecosystem. Publishing
here once makes the server discoverable in all of them; there is no separate
"Copilot marketplace" submission.

The entry is described by [`server.json`](https://github.com/mariokernich/imgflip-mcp/blob/main/server.json). The namespace
`io.github.mariokernich/*` is authenticated via GitHub (interactive device
login locally, OIDC in CI).

Manual publish:

```bash
# install the publisher CLI (or: brew install mcp-publisher)
# note: release assets use amd64/arm64, not uname's x86_64/aarch64
ARCH=$(uname -m); case "$ARCH" in x86_64) ARCH=amd64 ;; aarch64) ARCH=arm64 ;; esac
curl -fsSL "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_${ARCH}.tar.gz" | tar xz mcp-publisher

./mcp-publisher login github     # opens a device-code login
./mcp-publisher publish          # validates and uploads server.json
```

Verify afterwards:

```bash
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=io.github.mariokernich/imgflip-mcp"
```

## 3. Claude Desktop extension directory (.mcpb)

Claude Desktop installs local MCP servers as one-click **Desktop Extensions**
(`.mcpb` bundles — a zip of `manifest.json`, `dist/` and production
`node_modules`). Our [`manifest.json`](https://github.com/mariokernich/imgflip-mcp/blob/main/manifest.json) declares the
credentials as `user_config`, so Claude Desktop shows a friendly form
(username, password, premium checkbox) at install time and stores the
password in the OS keychain — users never touch JSON.

Build locally:

```bash
pnpm install --frozen-lockfile && pnpm build
# hoisted layout = flat, symlink-free node_modules for a portable bundle
rm -rf node_modules
pnpm install --prod --frozen-lockfile --config.node-linker=hoisted
pnpm dlx @anthropic-ai/mcpb pack . imgflip-mcp.mcpb
```

Test it by double-clicking the file (or **Settings → Extensions → Install
extension…**) in Claude Desktop.

Distribution options:

- **GitHub release** — the CI pipeline attaches the `.mcpb` to every release;
  anyone can download and double-click it. Works today, no review needed.
- **Official extension directory** — submit the extension through Anthropic's
  submission process (see the
  [connectors/extension submission docs](https://claude.com/docs/connectors/building/submission)
  and the
  [Desktop Extensions announcement](https://www.anthropic.com/engineering/desktop-extensions)).
  Requirements already covered by this repo: MIT license, privacy policy
  (`PRIVACY.md` + `privacy_policies` in the manifest + the Privacy section in
  the README), `user_config` for secrets, and no bundled credentials.

> **Note:** the claude.ai **Connectors directory** (web) only lists *remote*
> MCP servers (hosted, OAuth). This server is local/stdio by design — the
> desktop extension directory is the right Claude channel for it.

## 4. Claude Code plugin marketplace

Claude Code marketplaces are decentralized: any repo containing
`.claude-plugin/marketplace.json` *is* a marketplace. This repo doubles as
one, with the plugin defined by `.claude-plugin/plugin.json` and the MCP
server wiring in `.mcp.json`.

Users install it with:

```
/plugin marketplace add mariokernich/imgflip-mcp
/plugin install imgflip@imgflip-mcp
```

The plugin starts the server via `npx -y imgflip-mcp` and passes through the
`IMGFLIP_USERNAME` / `IMGFLIP_PASSWORD` / `IMGFLIP_PREMIUM` environment
variables, so users just export those in their shell profile.

To get listed in community-curated marketplace collections, submit the repo
to lists like [claudecodemarketplace.com](https://claudecodemarketplace.com)
or awesome-claude-plugins style repos — but the self-hosted marketplace above
works without any approval.

## 5. VS Code / GitHub Copilot

Once the server is in the MCP Registry it appears in the GitHub MCP Registry
and VS Code's MCP server browsing (**Extensions view → MCP SERVERS**,
`@mcp` search). Independent of that, the README contains an
**Install in VS Code** badge that deep-links VS Code's `vscode:mcp/install`
handler with the full server config (including secure prompts for the
credentials).

To regenerate the badge URL after config changes:

```bash
python3 - <<'EOF'
import json, urllib.parse
cfg = {
  "name": "imgflip",
  "command": "npx",
  "args": ["-y", "imgflip-mcp"],
  "env": {
    "IMGFLIP_USERNAME": "${input:imgflip_username}",
    "IMGFLIP_PASSWORD": "${input:imgflip_password}"
  },
  "inputs": [
    {"id": "imgflip_username", "type": "promptString", "description": "Imgflip username"},
    {"id": "imgflip_password", "type": "promptString", "description": "Imgflip password", "password": True}
  ]
}
uri = "vscode:mcp/install?" + json.dumps(cfg, separators=(",", ":"))
print("https://insiders.vscode.dev/redirect?url=" + urllib.parse.quote(uri, safe=""))
EOF
```

CLI alternative for users:

```bash
code --add-mcp '{"name":"imgflip","command":"npx","args":["-y","imgflip-mcp"],"env":{"IMGFLIP_USERNAME":"${input:imgflip_username}","IMGFLIP_PASSWORD":"${input:imgflip_password}"},"inputs":[{"id":"imgflip_username","type":"promptString","description":"Imgflip username"},{"id":"imgflip_password","type":"promptString","description":"Imgflip password","password":true}]}'
```

## 6. Community directories

These significantly boost discovery and mostly index automatically once the
npm package and MCP Registry entry exist:

- [Smithery](https://smithery.ai) — claim/submit the server with your GitHub login
- [Glama](https://glama.ai/mcp/servers) — indexes GitHub automatically; claiming improves the listing
- [mcp.so](https://mcp.so) — submit via their form/GitHub issue
- [PulseMCP](https://www.pulsemcp.com) — indexes the MCP Registry

## Release checklist (TL;DR)

- [ ] `NPM_TOKEN` secret exists (one-time)
- [ ] `CHANGELOG.md`: move `[Unreleased]` entries under the new version
- [ ] `pnpm lint && pnpm test` green
- [ ] `npm version patch|minor|major` (bumps + syncs all version fields + tags)
- [ ] `git push origin main --follow-tags` → CI publishes npm + MCP Registry + `.mcpb` release
- [ ] (first release only) submit the `.mcpb` to the Claude extension directory
- [ ] (optional) claim listings on Smithery/Glama
