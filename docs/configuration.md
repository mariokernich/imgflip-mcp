# Configuration

The server is configured entirely through environment variables — set them in your MCP client's `env` block (or the extension config form in Claude Desktop).

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `IMGFLIP_USERNAME` | yes* | — | Your Imgflip account username |
| `IMGFLIP_PASSWORD` | yes* | — | Your Imgflip account password |
| `IMGFLIP_PREMIUM` | no | `false` | `true`/`1`/`yes` registers the five [Premium tools](premium.md) |

*Only `get_memes` works without credentials. Every other tool returns a descriptive error pointing at the missing variables.

!!! warning "Credentials are sent to Imgflip"
    The Imgflip API authenticates every request with username/password form fields — it has no API keys or tokens. The server sends them exclusively to `https://api.imgflip.com` over HTTPS ([details](privacy.md)). Consider a dedicated Imgflip account for API use.

## Behavior reference

Things that are fixed by design (no knobs, on purpose):

| Behavior | Value |
| --- | --- |
| Transport | stdio only |
| Imgflip API timeout | 30 seconds |
| Inline image embedding limit | 2 MB (larger results fall back to URL-only) |
| Image embed download timeout | 15 seconds (failure falls back to URL-only) |
| Server state | none — fully stateless |

## Version pinning

The examples use `npx -y imgflip-mcp`, which resolves the latest published version. To pin:

```json
"args": ["-y", "imgflip-mcp@1.0.0"]
```
