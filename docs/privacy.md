# Privacy

`imgflip-mcp` is a local, stateless server. The short version: your data goes to Imgflip and nowhere else.

## What is processed

- **Imgflip credentials** (`IMGFLIP_USERNAME`, `IMGFLIP_PASSWORD`) — read from environment variables (or the Claude Desktop extension config, which stores the password in the OS keychain) and sent **only** to `https://api.imgflip.com` over HTTPS, because the Imgflip API authenticates every request with them.
- **Meme content** — template ids, caption texts and styling options are sent to the Imgflip API to generate the image.

## What is NOT done

- No analytics, telemetry or tracking of any kind
- No data stored on disk — the server is stateless
- No requests to any host other than `api.imgflip.com` (and `i.imgflip.com`, to download the generated image for inline display)
- No accounts, cookies or identifiers created

## The important caveat

!!! warning "Generated memes are public"
    Every generated meme is hosted on **imgflip.com under a publicly accessible URL**. Anyone with the link can view it, and Imgflip may index or surface it. Treat meme text like a public tweet, not a private note. Imgflip may also delete images that receive no views for an extended period.

## Third parties

Imgflip's handling of your account data and generated images is governed by the [Imgflip privacy policy](https://imgflip.com/privacy) and [terms of service](https://imgflip.com/terms).

The canonical policy file lives in the repository as [`PRIVACY.md`](https://github.com/mariokernich/imgflip-mcp/blob/main/PRIVACY.md) (also referenced by the Claude Desktop extension manifest). Questions: [open an issue](https://github.com/mariokernich/imgflip-mcp/issues).
