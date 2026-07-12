# Privacy Policy — imgflip-mcp

Last updated: 2026-07-12

`imgflip-mcp` is a local Model Context Protocol server that runs entirely on
your own machine. This document describes what data it handles.

## What data is processed

- **Imgflip credentials** (`IMGFLIP_USERNAME`, `IMGFLIP_PASSWORD`): read from
  environment variables (or the Claude Desktop extension configuration) and
  sent **only** to `https://api.imgflip.com` over HTTPS, because the Imgflip
  API authenticates every request with them.
- **Meme content**: template ids, caption texts and styling options you (or
  your AI assistant) provide are sent to the Imgflip API to generate the
  image. Generated memes are hosted publicly on imgflip.com.

## What this server does NOT do

- No analytics, telemetry or tracking of any kind.
- No data is stored on disk — the server is stateless.
- No data is sent to any host other than `api.imgflip.com`.
- No accounts, cookies or identifiers are created.

## Third parties

All meme generation is performed by Imgflip. Their handling of your account
data and generated images is governed by the
[Imgflip privacy policy](https://imgflip.com/privacy) and
[terms of service](https://imgflip.com/terms). Note that generated meme
images are publicly accessible to anyone who knows the URL.

## Contact

Questions or concerns: open an issue at
<https://github.com/mariokernich/imgflip-mcp/issues>.
