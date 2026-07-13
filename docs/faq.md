# FAQ & Troubleshooting

## FAQ

**Do I need to pay for anything?**
No. A free Imgflip account covers the core workflow. [API Premium](premium.md) only adds the five opt-in extras.

**Why does the server only show two tools?**
Intentional: the Premium tools stay hidden unless `IMGFLIP_PREMIUM=true`, so you never see tools that would just error on a free account. Two tools that work beat seven that don't.

**Why username and password instead of an API key?**
Ask Imgflip — their API has worked this way since forever. Pragmatic mitigation: use a dedicated Imgflip account and let your client store the password securely (the Claude Desktop extension uses the OS keychain).

**Are my memes private?**
No. Everything you generate lands on imgflip.com under a public URL. Maybe don't caption the unreleased quarterly numbers. Imgflip may also delete images that get no views for a long time — archive keepers.

**Can I remove the watermark?**
`no_watermark: true` works if your Imgflip **account** has the website's Premium subscription (distinct from API Premium — see [the two Premiums](premium.md#two-different-premiums)).

**Does this only work with Claude?**
No — any stdio MCP client works: Copilot in VS Code, Cursor, and friends. Claude just happens to have excellent taste in memes.

**Is this an official Imgflip project?**
No, independent community project. All generation happens through their public API, subject to the [Imgflip terms](https://imgflip.com/terms).

## Troubleshooting

### "Imgflip credentials are not configured"

The server can't see `IMGFLIP_USERNAME` / `IMGFLIP_PASSWORD`. Check they're in the **server's** `env` block (not just your shell), and restart the client — most clients only read MCP config at startup.

### The meme arrives as a link but no image

Embedding is best-effort: images over 2 MB or a failed download fall back to URL-only. The URL always works. If it never embeds, check that the machine can reach `i.imgflip.com`.

### "Imgflip API did not respond within 30s" / HTTP errors

Network path issue between the server and `api.imgflip.com` — corporate proxies and sandboxed environments are the usual suspects. Test directly:

```bash
curl -s https://api.imgflip.com/get_memes | head -c 200
```

### Premium tools error despite `IMGFLIP_PREMIUM=true`

The flag only *registers* the tools; the Imgflip account itself must have the API Premium subscription. The error message you see is Imgflip's own answer.

### "Invalid template ID"

The id doesn't exist (or is animated-only for `caption_image`). Re-check via `get_memes` — or `search_memes`/`get_meme` with Premium.

### The assistant draws an SVG instead of calling the tools

Since v1.0.1 the server sends MCP instructions that tell models to always
use the Imgflip tools for meme requests — make sure you're on the latest
version (`npx` picks it up automatically; restart your client). If it still
happens, say "use the imgflip tools" once, or check that the server is
actually connected (see below) — a silent SVG is often a sign the tools
aren't available at all.

### Tools don't show up in the client at all

1. Restart the client fully (Claude Desktop: quit from tray, not window-close).
2. Test the server in isolation with the [MCP Inspector](install/other-clients.md#mcp-inspector-for-testing).
3. Check the client's MCP logs — Claude Desktop: **Settings → Developer → Open Logs**.

Still stuck? [Open an issue](https://github.com/mariokernich/imgflip-mcp/issues) — ideally with the failing tool call and your client. Bonus points if the bug report contains a meme.
