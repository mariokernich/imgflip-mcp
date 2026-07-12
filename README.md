# imgflip-mcp

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for the [Imgflip meme generator API](https://imgflip.com/api). It lets any MCP-capable client — Claude Desktop, Claude Code, Cursor, VS Code, and others — browse meme templates and generate memes through natural conversation.

> *"Make me a Drake meme about writing tests vs. testing in production"* → 🖼️ done.

## Features

| Tool | Description | Imgflip endpoint | Requirements |
| --- | --- | --- | --- |
| `get_memes` | List the ~100 most popular meme templates, with optional name filtering | `GET /get_memes` | none |
| `caption_image` | Caption a template and get the generated image URL | `POST /caption_image` | free Imgflip account |
| `search_memes` | Search 1M+ templates by name | `POST /search_memes` | API Premium |
| `get_meme` | Look up a single template by id | `POST /get_meme` | API Premium |
| `caption_gif` | Caption an animated GIF template | `POST /caption_gif` | API Premium |
| `automeme` | Auto-pick a template for a piece of text | `POST /automeme` | API Premium |
| `ai_meme` | Let Imgflip's AI invent a whole meme | `POST /ai_meme` | API Premium |

The two everyday tools — listing templates and creating memes — work with a **free** Imgflip account. The Premium tools require an [Imgflip API Premium subscription](https://imgflip.com/api_upgrade) and will return a descriptive error otherwise.

## Prerequisites

- **Node.js 18+**
- An **Imgflip account** ([sign up for free](https://imgflip.com/signup)) — required for every tool except `get_memes`

The server reads your credentials from two environment variables:

| Variable | Description |
| --- | --- |
| `IMGFLIP_USERNAME` | Your Imgflip username |
| `IMGFLIP_PASSWORD` | Your Imgflip password |

> **Note:** The Imgflip API authenticates with username/password form fields — it does not offer API keys. Consider creating a dedicated Imgflip account for API use.

## Installation

### From source

```bash
git clone https://github.com/mariokernich/imgflip-mcp.git
cd imgflip-mcp
npm install
npm run build
```

The compiled server entry point is `dist/index.js`. It communicates over **stdio**, so your MCP client launches it as a subprocess — there is no port or daemon to manage.

## Client configuration

### Claude Code

```bash
claude mcp add imgflip \
  --env IMGFLIP_USERNAME=your-username \
  --env IMGFLIP_PASSWORD=your-password \
  -- node /absolute/path/to/imgflip-mcp/dist/index.js
```

Verify with `claude mcp list` — the `imgflip` server should show as connected.

### Claude Desktop

Add the server to your `claude_desktop_config.json` (**Settings → Developer → Edit Config**):

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "imgflip": {
      "command": "node",
      "args": ["/absolute/path/to/imgflip-mcp/dist/index.js"],
      "env": {
        "IMGFLIP_USERNAME": "your-username",
        "IMGFLIP_PASSWORD": "your-password"
      }
    }
  }
}
```

Restart Claude Desktop afterwards; the tools appear under the 🔌 tools menu.

### Cursor / VS Code / other MCP clients

Any client that supports stdio MCP servers uses the same shape — command `node`, argument `dist/index.js`, plus the two environment variables. Example for Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "imgflip": {
      "command": "node",
      "args": ["/absolute/path/to/imgflip-mcp/dist/index.js"],
      "env": {
        "IMGFLIP_USERNAME": "your-username",
        "IMGFLIP_PASSWORD": "your-password"
      }
    }
  }
}
```

## Usage examples

Once connected, just talk to your assistant. Some prompts that map directly onto the tools:

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

### Premium tools

These require an [Imgflip API Premium](https://imgflip.com/api_upgrade) subscription on the account you authenticate with:

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

Without Premium, these tools return a clear error from the Imgflip API instead of failing silently.

## Error handling

All tools return errors as readable text with the MCP `isError` flag set, so your assistant can react to them:

- **Missing credentials** — set `IMGFLIP_USERNAME` / `IMGFLIP_PASSWORD` in the server's `env` block
- **Invalid credentials / no Premium** — the original Imgflip error message is passed through
- **Unknown `template_id`** — double-check the id via `get_memes` or `search_memes`

## Development

```bash
npm install        # install dependencies
npm run build      # compile TypeScript to dist/
npm run dev        # compile in watch mode
npm run typecheck  # type-check without emitting
npm start          # run the compiled server
```

Test interactively with the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
IMGFLIP_USERNAME=you IMGFLIP_PASSWORD=secret \
  npx @modelcontextprotocol/inspector node dist/index.js
```

### Project structure

```
src/
  index.ts    MCP server: tool registration and stdio transport
  client.ts   Thin typed client for the Imgflip REST API
  types.ts    Shared type definitions for API payloads
```

## Notes on the Imgflip API

- Generated images are hosted by Imgflip and may be deleted when they receive no views for a long period.
- `get_memes` returns the top ~100 templates ordered by caption popularity over the last 30 days, so results change over time.
- All generation endpoints are `application/x-www-form-urlencoded` POST requests; this server handles the encoding (including the `boxes[i][field]` array syntax) for you.
- Full upstream documentation: <https://imgflip.com/api>

## License

[MIT](LICENSE)
