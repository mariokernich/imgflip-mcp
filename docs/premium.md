# Premium Tools

Five tools require an [Imgflip **API Premium** subscription](https://imgflip.com/api_upgrade) and are **hidden by default** — free-tier users never see tools that would just error.

## Enabling

Set the environment variable in your client config (or tick *Enable Premium tools* in the Claude Desktop extension form):

```json
"env": {
  "IMGFLIP_USERNAME": "…",
  "IMGFLIP_PASSWORD": "…",
  "IMGFLIP_PREMIUM": "true"
}
```

After a client restart, `search_memes`, `get_meme`, `caption_gif`, `automeme` and `ai_meme` appear alongside the free tools. Parameter details for each: [Tools Reference](tools.md).

## What you get

| Tool | Superpower |
| --- | --- |
| `search_memes` | Search all 1M+ templates instead of the top ~100 |
| `get_meme` | Resolve any template id, however obscure |
| `caption_gif` | Animated GIF memes |
| `automeme` | Text in, finished meme out — Imgflip picks the template |
| `ai_meme` | Imgflip's AI writes the caption too |

## Two different "Premiums"

Imgflip has two separate paid things — easy to confuse:

| | What it unlocks here |
| --- | --- |
| **API Premium** | The five tools above ($9.99/mo base as of writing, includes usage quotas) |
| **Imgflip Premium** (the website subscription) | `no_watermark: true` on generated images |

You can have either, both, or neither. The core workflow — browse templates, caption memes — needs **neither**.

!!! info "Honest advice"
    Start free. `get_memes` + `caption_image` with the model choosing templates covers the vast majority of meme needs. Upgrade when you find yourself genuinely missing GIF captioning or deep search.
