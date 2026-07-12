# Tools Reference

All tool and parameter names mirror the [Imgflip API](https://imgflip.com/api) endpoints one-to-one.

| Tool | What it does | Needs | Availability |
| --- | --- | --- | --- |
| [`get_memes`](#get_memes) | List popular templates | nothing | always |
| [`caption_image`](#caption_image) | Create a meme | free account | always |
| [`search_memes`](#search_memes) | Search 1M+ templates | API Premium | opt-in |
| [`get_meme`](#get_meme) | Look up one template | API Premium | opt-in |
| [`caption_gif`](#caption_gif) | Caption animated GIFs | API Premium | opt-in |
| [`automeme`](#automeme) | Auto-pick a template for text | API Premium | opt-in |
| [`ai_meme`](#ai_meme) | Let AI invent the whole meme | API Premium | opt-in |

The opt-in tools only register when `IMGFLIP_PREMIUM=true` — see [Premium Tools](premium.md).

---

## `get_memes`

Returns the ~100 most popular templates, ordered by how often they were captioned in the last 30 days. Free, no credentials required.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `limit` | integer 1–100 | no | Cap the number of results |
| `name_filter` | string | no | Case-insensitive substring match on the template name |

```json
{ "name": "get_memes", "arguments": { "name_filter": "drake" } }
```

Each template includes `id` (needed for `caption_image`), `name`, `url`, `width`, `height` and `box_count` — the number of text boxes it supports.

## `caption_image`

Captions a template and returns the generated image — as a URL **and** as an inline image (up to 2 MB).

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `template_id` | string | yes | From `get_memes`, e.g. `"181913649"` for Drake |
| `text0` | string | no* | Top text (two-box templates) |
| `text1` | string | no* | Bottom text (two-box templates) |
| `boxes` | array (≤20) | no* | Per-box text/position/color — see [Creating Memes](creating-memes.md) |
| `font` | `impact` \| `arial` | no | Default: `impact`, as tradition demands |
| `max_font_size` | integer px | no | Default 50; text auto-shrinks to fit |
| `no_watermark` | boolean | no | Requires an Imgflip Premium account |

*At least `text0`, `text1` or a non-empty `boxes` array is required — the server rejects empty captions before they reach the API.

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

Response payload:

```json
{
  "url": "https://i.imgflip.com/9x7abc.jpg",
  "page_url": "https://imgflip.com/i/9x7abc"
}
```

## `search_memes`

:material-star: **Premium.** Full-text search across the entire Imgflip template database (1M+ entries, up to 25 results).

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `query` | string | yes | e.g. `"confused cat"` |
| `include_nsfw` | boolean | no | Default `false` |

!!! tip "Free alternative"
    `get_memes` with `name_filter` searches the popular templates without Premium — that covers the classics.

## `get_meme`

:material-star: **Premium.** Fetch a single template by id — works for any of the 1M+ templates, not just the popular ones.

| Parameter | Type | Required |
| --- | --- | --- |
| `template_id` | string | yes |

## `caption_gif`

:material-star: **Premium.** Like `caption_image`, but for animated GIF templates. Only accepts `boxes` (no `text0`/`text1`); returns a `.gif` URL.

| Parameter | Type | Required |
| --- | --- | --- |
| `template_id` | string | yes |
| `boxes` | array (1–20) | yes |
| `no_watermark` | boolean | no |

## `automeme`

:material-star: **Premium.** You provide only text; Imgflip picks a fitting template from ~2000 well-known formats and splits the text onto it.

| Parameter | Type | Required |
| --- | --- | --- |
| `text` | string | yes |
| `no_watermark` | boolean | no |

```json
{ "name": "automeme", "arguments": { "text": "one does not simply deploy on a friday" } }
```

## `ai_meme`

:material-star: **Premium.** Imgflip's AI invents the whole meme — template choice and caption text.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `model` | `openai` \| `classic` | no | `openai` is better, costs Imgflip credits; default `classic` |
| `template_id` | string | no | Force a template instead of letting the AI choose |
| `prefix_text` | string | no | Start of the caption for the AI to complete |
| `no_watermark` | boolean | no | |

The response additionally contains the chosen `template_id` and `texts`.

---

## The `make-meme` prompt

Besides tools, the server registers one MCP **prompt**: `make-meme`. It guides the model through template selection and captioning.

| Argument | Required | Description |
| --- | --- | --- |
| `topic` | yes | What the meme should be about |
| `template` | no | A template preference, e.g. `"Drake"` |

In Claude Desktop, prompts appear in the ➕ menu; other clients expose them via their prompt pickers.

## Tool annotations

The lookup tools (`get_memes`, `search_memes`, `get_meme`) are annotated with `readOnlyHint: true`, so clients that support annotations can auto-approve them safely. The generating tools are marked non-destructive and non-idempotent.
