# imgflip-mcp

[![CI](https://github.com/mariokernich/imgflip-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/mariokernich/imgflip-mcp/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/imgflip-mcp?logo=npm)](https://www.npmjs.com/package/imgflip-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Imgflip_MCP-0098FF?logo=githubcopilot)](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22imgflip%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22imgflip-mcp%22%5D%2C%22env%22%3A%7B%22IMGFLIP_USERNAME%22%3A%22%24%7Binput%3Aimgflip_username%7D%22%2C%22IMGFLIP_PASSWORD%22%3A%22%24%7Binput%3Aimgflip_password%7D%22%7D%2C%22inputs%22%3A%5B%7B%22id%22%3A%22imgflip_username%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22Imgflip%20username%22%7D%2C%7B%22id%22%3A%22imgflip_password%22%2C%22type%22%3A%22promptString%22%2C%22description%22%3A%22Imgflip%20password%22%2C%22password%22%3Atrue%7D%5D%7D)

There's an MCP server for your database. One for your Kubernetes cluster. One for your cloud bill, one for your ticket system, and at least twelve for reading PDFs. Serious servers for serious work.

But somewhere along the way, the ecosystem forgot the workload that actually keeps engineering teams running: **memes**.

`imgflip-mcp` closes that gap. It's a [Model Context Protocol](https://modelcontextprotocol.io) server for the [Imgflip meme generator API](https://imgflip.com/api), so Claude (or any other MCP client) can browse thousands of meme templates and caption them mid-conversation — turning your AI assistant into the coworker who always has the right reaction image.

> **You:** *"Make me a Drake meme about writing tests vs. testing in production"*
> **Claude:** 🖼️ *calls `get_memes` → calls `caption_image` → sends you the image link*

Everything you need is a **free Imgflip account**. An Imgflip API Premium subscription is **optional** — it unlocks five extra tools (search, GIF captioning, automeme, AI memes), which stay hidden unless you explicitly enable them.

## What would I even use this for?

More than you'd think. Once meme generation is one sentence away, it sneaks into real workflows:

- **Docs people actually finish reading.** Let Claude write your README section and cap it with a fitting meme — retention engineering at its finest.
- **Release notes with a punchline.** "v2.0: we rewrote everything" hits different next to an *Expanding Brain* meme of your migration steps.
- **Code review, but kind.** Answer the 400-line PR with a *Two Buttons* meme instead of a lecture. Same message, fewer hurt feelings.
- **Retros & standups.** Feed in the sprint summary, get the *This Is Fine* recap the team deserves.
- **Incident postmortems.** Nothing says "blameless" like a well-chosen *Disaster Girl* on the last slide.
- **Slack announcements.** Deploy freezes, on-call handovers, "the build is green again" — all measurably more effective as memes.

Is any of this *necessary*? No. Neither is syntax highlighting, and yet here we are.

## Tools

### Free tools (enabled by default)

| Tool | Description | Imgflip endpoint | Requirements |
| --- | --- | --- | --- |
| `get_memes` | List the ~100 most popular meme templates, with optional name filtering | `GET /get_memes` | none |
| `caption_image` | Caption a template and get the generated image URL | `POST /caption_image` | free Imgflip account |

These two tools cover the everyday use case end to end: find a template, put text on it, get the image URL.

### Premium tools (optional, opt-in)

| Tool | Description | Imgflip endpoint |
| --- | --- | --- |
| `search_memes` | Search 1M+ templates by name | `POST /search_memes` |
| `get_meme` | Look up a single template by id | `POST /get_meme` |
| `caption_gif` | Caption an animated GIF template | `POST /caption_gif` |
| `automeme` | Auto-pick a template for a piece of text | `POST /automeme` |
| `ai_meme` | Let Imgflip's AI invent a whole meme | `POST /ai_meme` |

These require an [Imgflip API Premium subscription](https://imgflip.com/api_upgrade) and are **not registered by default**, so free-tier users never see tools that would fail. If you have Premium, enable them by setting `IMGFLIP_PREMIUM=true`.

### Extras

- **Inline images:** every meme-generating tool returns the result both as URL *and* as an embedded image (up to 2 MB), so clients like Claude Desktop render the meme directly in the chat.
- **`make-meme` prompt:** an MCP prompt that guides the model through template selection and captioning — pass a `topic` and optionally a `template` preference.
- **Tool annotations:** lookup tools are marked `readOnlyHint` so clients can auto-approve them safely.

## Prerequisites

- **Node.js 18+**
- An **Imgflip account** ([sign up for free](https://imgflip.com/signup)) — required for every tool except `get_memes`

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `IMGFLIP_USERNAME` | yes* | Your Imgflip username |
| `IMGFLIP_PASSWORD` | yes* | Your Imgflip password |
| `IMGFLIP_PREMIUM` | no | Set to `true` to also register the five Premium tools (default: off) |

\* Only `get_memes` works without credentials.

> **Note:** The Imgflip API authenticates with username/password form fields — it does not offer API keys. Consider creating a dedicated Imgflip account for API use.

## Installation

The server communicates over **stdio**, so your MCP client launches it as a subprocess — there is no port or daemon to manage. Pick whichever route fits your client:

| Route | Best for | How |
| --- | --- | --- |
| **npx** | most clients | `npx -y imgflip-mcp` — no clone, no build (requires the package on npm, see [docs/PUBLISHING.md](docs/PUBLISHING.md)) |
| **Desktop Extension (`.mcpb`)** | Claude Desktop | download from [Releases](https://github.com/mariokernich/imgflip-mcp/releases), double-click, fill in the credentials form |
| **Claude Code plugin** | Claude Code | `/plugin marketplace add mariokernich/imgflip-mcp` — this repo is its own plugin marketplace |
| **VS Code button** | Copilot users | click the *Install in VS Code* badge above |
| **From source** | development | see below |

### From source

```bash
git clone https://github.com/mariokernich/imgflip-mcp.git
cd imgflip-mcp
corepack enable   # provides pnpm (see packageManager in package.json)
pnpm install
pnpm build
```

The compiled server entry point is `dist/index.js`; the config examples below use `npx -y imgflip-mcp`, which you can always replace with `node /absolute/path/to/imgflip-mcp/dist/index.js`.

## Using with Claude

### Claude Desktop

**Option A — one-click Desktop Extension (recommended):**

1. Download the latest `imgflip-mcp-*.mcpb` file from the [Releases page](https://github.com/mariokernich/imgflip-mcp/releases) (or build it yourself: `npx @anthropic-ai/mcpb pack`).
2. Double-click the file (or use **Settings → Extensions → Install extension…**).
3. Claude Desktop shows a configuration form: enter your Imgflip username and password (stored in the OS keychain) and, if you have API Premium, tick *Enable Premium tools*. Done — no JSON editing required.

**Option B — manual JSON config:**

1. Open Claude Desktop and go to **Settings → Developer → Edit Config**. This opens (or creates) `claude_desktop_config.json`:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the server under `mcpServers` (create the key if the file is empty):

   ```json
   {
     "mcpServers": {
       "imgflip": {
         "command": "npx",
         "args": ["-y", "imgflip-mcp"],
         "env": {
           "IMGFLIP_USERNAME": "your-username",
           "IMGFLIP_PASSWORD": "your-password"
         }
       }
     }
   }
   ```

   If you have API Premium and want the extra tools, add `"IMGFLIP_PREMIUM": "true"` to the `env` block.
3. Fully restart Claude Desktop (quit from the tray/menu bar, not just close the window).
4. Open a new chat — the Imgflip tools now show up in the tools menu (🔌 icon). Try:

   > *"Make a Drake meme: top 'manually formatting code', bottom 'letting the linter do it'."*

   Claude will look up the template, call `caption_image`, and reply with the finished image link.

### Claude Code (CLI)

**Option A — as a plugin.** This repository is its own [plugin marketplace](docs/PUBLISHING.md#4-claude-code-plugin-marketplace):

```text
/plugin marketplace add mariokernich/imgflip-mcp
/plugin install imgflip@imgflip-mcp
```

The plugin reads `IMGFLIP_USERNAME`, `IMGFLIP_PASSWORD` and (optionally) `IMGFLIP_PREMIUM` from your shell environment, so export them in your `~/.bashrc`/`~/.zshrc`.

**Option B — register the MCP server directly:**

```bash
claude mcp add imgflip \
  --env IMGFLIP_USERNAME=your-username \
  --env IMGFLIP_PASSWORD=your-password \
  -- npx -y imgflip-mcp
```

Add `--env IMGFLIP_PREMIUM=true` if you have API Premium. Verify with:

```bash
claude mcp list   # "imgflip" should show as ✔ connected
```

Then simply ask inside any `claude` session:

> *"Generate a 'This Is Fine' meme about our flaky CI pipeline and give me the URL."*

By default Claude Code adds the server to the current project; use `claude mcp add --scope user …` to make it available in all your projects.

### What a conversation looks like

```text
You:    Which meme templates are trending right now?
Claude: [calls get_memes with limit 10] Here are the current top 10: 
        Drake Hotline Bling, Distracted Boyfriend, Two Buttons, ...

You:    Take the Two Buttons one. Button 1 "fix the root cause",
        button 2 "add another workaround", and make it so.
Claude: [calls caption_image with boxes]
        Here's your meme: https://i.imgflip.com/9x7abc.jpg
```

## VS Code / GitHub Copilot

Click the **Install in VS Code** badge at the top of this README — VS Code opens, prompts securely for your Imgflip username and password, and registers the server for Copilot's agent mode. Equivalent CLI one-liner:

```bash
code --add-mcp '{"name":"imgflip","command":"npx","args":["-y","imgflip-mcp"],"env":{"IMGFLIP_USERNAME":"${input:imgflip_username}","IMGFLIP_PASSWORD":"${input:imgflip_password}"},"inputs":[{"id":"imgflip_username","type":"promptString","description":"Imgflip username"},{"id":"imgflip_password","type":"promptString","description":"Imgflip password","password":true}]}'
```

Once published to the [MCP Registry](https://registry.modelcontextprotocol.io), the server is also discoverable in the [GitHub MCP Registry](https://github.com/mcp) and directly inside VS Code (**Extensions view → MCP SERVERS**).

## Other MCP clients (Cursor, …)

Any client that supports stdio MCP servers uses the same shape — command `npx`, args `["-y", "imgflip-mcp"]` (or `node` + path to `dist/index.js`), plus the environment variables. Example for Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "imgflip": {
      "command": "npx",
      "args": ["-y", "imgflip-mcp"],
      "env": {
        "IMGFLIP_USERNAME": "your-username",
        "IMGFLIP_PASSWORD": "your-password"
      }
    }
  }
}
```

## Usage examples

Some prompts that map directly onto the tools:

- *"Show me the most popular meme templates right now."* → `get_memes`
- *"Find a meme template with 'brain' in the name."* → `get_memes` with `name_filter: "brain"`
- *"Make a Drake meme: top 'manually formatting code', bottom 'letting the linter do it'."* → `caption_image`
- *"Create an Expanding Brain meme with four stages about coffee, tea, energy drinks, and pure willpower."* → `caption_image` with `boxes`
- *"Search all of Imgflip for 'confused cat' templates."* → `search_memes` (Premium)
- *"Auto-meme this: one does not simply deploy on a Friday."* → `automeme` (Premium)
- *"Let the AI make a meme about standup meetings."* → `ai_meme` (Premium)

### Typical workflow: create a meme

**Step 1 — find a template.** Call `get_memes` (optionally with `name_filter`):

```json
{
  "name": "get_memes",
  "arguments": { "name_filter": "drake" }
}
```

Response (excerpt):

```json
{
  "count": 1,
  "memes": [
    {
      "id": "181913649",
      "name": "Drake Hotline Bling",
      "url": "https://i.imgflip.com/30b1gx.jpg",
      "width": 1200,
      "height": 1200,
      "box_count": 2
    }
  ]
}
```

**Step 2 — caption it.** For templates with two boxes, `text0`/`text1` is enough:

```json
{
  "name": "caption_image",
  "arguments": {
    "template_id": "181913649",
    "text0": "Manually formatting code",
    "text1": "Letting the linter do it"
  }
}
```

Response:

```json
{
  "url": "https://i.imgflip.com/9x7abc.jpg",
  "page_url": "https://imgflip.com/i/9x7abc"
}
```

`url` is the direct image; `page_url` is the meme's page on imgflip.com.

### Templates with more than two boxes

Check the template's `box_count` and pass a `boxes` array instead of `text0`/`text1`. Example — Expanding Brain (`box_count: 4`):

```json
{
  "name": "caption_image",
  "arguments": {
    "template_id": "93895088",
    "boxes": [
      { "text": "Drip coffee" },
      { "text": "Espresso" },
      { "text": "Energy drinks" },
      { "text": "Pure willpower" }
    ]
  }
}
```

Boxes are auto-positioned when you omit coordinates. For full control, each box also accepts `x`, `y`, `width`, `height` (pixels), `color`, and `outline_color` (hex codes):

```json
{
  "text": "STONKS",
  "x": 10,
  "y": 225,
  "width": 548,
  "height": 100,
  "color": "#ffffff",
  "outline_color": "#000000"
}
```

Styling options for `caption_image`:

- `font` — `"impact"` (default) or `"arial"`
- `max_font_size` — maximum font size in pixels (default 50); text shrinks automatically to fit
- `no_watermark` — removes the imgflip.com watermark (Imgflip Premium accounts only)

### Premium tools (only when `IMGFLIP_PREMIUM=true`)

Remember: Premium is entirely optional — everything above works on the free tier. With an [Imgflip API Premium](https://imgflip.com/api_upgrade) subscription and `IMGFLIP_PREMIUM=true`, five more tools become available:

```json
{ "name": "search_memes", "arguments": { "query": "confused cat" } }
```

```json
{ "name": "automeme", "arguments": { "text": "one does not simply deploy on a friday" } }
```

```json
{
  "name": "ai_meme",
  "arguments": { "model": "openai", "prefix_text": "when the standup meeting" }
}
```

`ai_meme` returns the generated image plus the template and texts the AI chose:

```json
{
  "url": "https://i.imgflip.com/9xyz12.jpg",
  "page_url": "https://imgflip.com/i/9xyz12",
  "template_id": 61579,
  "texts": ["when the standup meeting", "could have been a slack message"]
}
```

If your account lacks Premium, these tools return the original Imgflip error message instead of failing silently.

## Error handling

All tools return errors as readable text with the MCP `isError` flag set, so Claude can react to them:

- **Missing credentials** — set `IMGFLIP_USERNAME` / `IMGFLIP_PASSWORD` in the server's `env` block
- **Invalid credentials / no Premium** — the original Imgflip error message is passed through
- **Unknown `template_id`** — double-check the id via `get_memes` or `search_memes`

## Development

This project uses [pnpm](https://pnpm.io) (`corepack enable` sets it up automatically):

```bash
pnpm install        # install dependencies
pnpm build          # compile TypeScript to dist/
pnpm dev            # compile in watch mode
pnpm test           # build + run the Vitest suite (unit + stdio smoke tests)
pnpm lint           # Biome lint & format check
pnpm typecheck      # type-check without emitting
pnpm start          # run the compiled server
```

CI runs lint, typecheck, tests, a version-consistency check and MCPB manifest validation on every push and pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and [CHANGELOG.md](CHANGELOG.md) for release history.

Test interactively with the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
IMGFLIP_USERNAME=you IMGFLIP_PASSWORD=secret \
  npx @modelcontextprotocol/inspector node dist/index.js
```

### Project structure

```
src/
  index.ts        MCP server: tools, prompt, stdio transport
  client.ts       Thin typed client for the Imgflip REST API
  types.ts        Shared type definitions for API payloads
test/             Vitest suite (client unit tests + stdio smoke tests)
scripts/          sync-versions.mjs (single-source version from package.json)
server.json       MCP Registry metadata
manifest.json     Claude Desktop Extension (MCPB) manifest
.claude-plugin/   Claude Code plugin + marketplace definition
.mcp.json         MCP server wiring for the Claude Code plugin
docs/PUBLISHING.md  distribution guide (npm, registries, extension, plugin)
```

## Distribution

The server is distributed through the npm registry, the [official MCP Registry](https://registry.modelcontextprotocol.io) (which feeds the [GitHub MCP Registry](https://github.com/mcp) used by Copilot), a Claude Desktop Extension (`.mcpb`) attached to each GitHub release, and this repo's built-in Claude Code plugin marketplace. Releases are fully automated: push a `vX.Y.Z` tag and the [publish workflow](.github/workflows/publish.yml) does the rest. See **[docs/PUBLISHING.md](docs/PUBLISHING.md)** for the complete guide, including the one-time setup and manual fallbacks.

## Privacy

This server runs locally and is stateless: your Imgflip credentials and meme texts are sent exclusively to `https://api.imgflip.com` (which requires them for authentication and generation), and nothing is logged, stored, or sent anywhere else. Generated memes are hosted publicly on imgflip.com. Details in [PRIVACY.md](PRIVACY.md); Imgflip's own handling is covered by the [Imgflip privacy policy](https://imgflip.com/privacy).

## Notes on the Imgflip API

- Generated images are hosted by Imgflip and may be deleted when they receive no views for a long period.
- `get_memes` returns the top ~100 templates ordered by caption popularity over the last 30 days, so results change over time.
- All generation endpoints are `application/x-www-form-urlencoded` POST requests; this server handles the encoding (including the `boxes[i][field]` array syntax) for you.
- Full upstream documentation: <https://imgflip.com/api>

## FAQ

**Do I need to pay for anything?**
No. A free Imgflip account covers the core workflow (browse templates, create memes). Imgflip API Premium is only needed for the five opt-in extras like template search and AI memes — the server works happily without it, forever.

**Why does the server only show two tools?**
That's intentional. The five Premium tools stay hidden unless you set `IMGFLIP_PREMIUM=true`, so you never see tools that would just error on a free account. Two tools that work beat seven that don't.

**Why username and password instead of an API key?**
Ask Imgflip — their API has authenticated this way since forever. The pragmatic answer: create a dedicated Imgflip account just for the API and let your MCP client store the password (the Claude Desktop extension puts it in the OS keychain).

**Are my memes private?**
No. Everything you generate is hosted on imgflip.com under a public URL — anyone with the link can see it. Maybe don't caption the unreleased quarterly numbers. Imgflip may also delete images that get no views for a long time, so archive anything you're attached to.

**Can I get rid of the watermark?**
Yes, pass `no_watermark: true` — but it only works if your Imgflip account has a Premium subscription. Otherwise the watermark stays, as a small tribute to the free lunch you're eating.

**The meme shows up as a link but not as an image. Why?**
The server embeds the generated image inline when it can (up to 2 MB). If the image is bigger or the download hiccups, you still get the URL — embedding is best-effort by design and never fails the request.

**My template has four text boxes. How do I fill them all?**
Skip `text0`/`text1` and pass the `boxes` array instead — one entry per box, optionally with position and colors. Check the template's `box_count` from `get_memes` to know how many you need.

**Does this only work with Claude?**
No — any MCP client that speaks stdio works: GitHub Copilot in VS Code, Cursor, and friends. Claude just happens to have excellent taste in memes.

**Is this an official Imgflip project?**
No, it's an independent community project. All meme generation happens through their public API — see the [Imgflip terms](https://imgflip.com/terms) for what's allowed.

**Something's broken. Where do I complain?**
[Open an issue](https://github.com/mariokernich/imgflip-mcp/issues) — ideally with the tool call that failed and your client. Bonus points if the bug report contains a meme.

## License

[MIT](LICENSE)
