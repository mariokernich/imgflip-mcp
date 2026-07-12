# imgflip-mcp

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for the [Imgflip meme generator API](https://imgflip.com/api). It lets Claude (and any other MCP-capable client) browse meme templates and generate memes through natural conversation.

> **You:** *"Make me a Drake meme about writing tests vs. testing in production"*
> **Claude:** 🖼️ *calls `get_memes` → calls `caption_image` → sends you the image link*

Everything you need is a **free Imgflip account**. An Imgflip API Premium subscription is **optional** — it unlocks five extra tools (search, GIF captioning, automeme, AI memes), which stay hidden unless you explicitly enable them.

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

```bash
git clone https://github.com/mariokernich/imgflip-mcp.git
cd imgflip-mcp
npm install
npm run build
```

The compiled server entry point is `dist/index.js`. It communicates over **stdio**, so your MCP client launches it as a subprocess — there is no port or daemon to manage.

## Using with Claude

### Claude Desktop

1. Open Claude Desktop and go to **Settings → Developer → Edit Config**. This opens (or creates) `claude_desktop_config.json`:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the server under `mcpServers` (create the key if the file is empty):

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

   If you have API Premium and want the extra tools, add `"IMGFLIP_PREMIUM": "true"` to the `env` block.
3. Fully restart Claude Desktop (quit from the tray/menu bar, not just close the window).
4. Open a new chat — the Imgflip tools now show up in the tools menu (🔌 icon). Try:

   > *"Make a Drake meme: top 'manually formatting code', bottom 'letting the linter do it'."*

   Claude will look up the template, call `caption_image`, and reply with the finished image link.

### Claude Code (CLI)

Register the server once:

```bash
claude mcp add imgflip \
  --env IMGFLIP_USERNAME=your-username \
  --env IMGFLIP_PASSWORD=your-password \
  -- node /absolute/path/to/imgflip-mcp/dist/index.js
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

## Other MCP clients (Cursor, VS Code, …)

Any client that supports stdio MCP servers uses the same shape — command `node`, argument `dist/index.js`, plus the environment variables. Example for Cursor (`.cursor/mcp.json`):

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
