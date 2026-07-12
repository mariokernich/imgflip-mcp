# Creating Memes

The standard workflow, and everything beyond top-text/bottom-text.

## The two-step workflow

**Step 1 — find a template.** `get_memes`, optionally filtered:

```json
{ "name": "get_memes", "arguments": { "name_filter": "drake" } }
```

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

The important field is **`box_count`** — it decides how you caption.

**Step 2 — caption it.** For `box_count: 2`, `text0` (top) and `text1` (bottom) are enough:

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

You get back `url` (the image) and `page_url` (the meme's page on imgflip.com), plus the image itself embedded inline.

## Templates with more than two boxes

Pass a `boxes` array instead of `text0`/`text1` — one entry per box, in template order. Example: Expanding Brain (`box_count: 4`):

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

!!! note
    When `boxes` is set, `text0`/`text1` are ignored. Boxes beyond the template's `box_count` are ignored by Imgflip.

## Custom positioning and colors

Omitted coordinates are auto-placed, which is right 95% of the time. For the other 5%, every box accepts:

| Field | Type | Description |
| --- | --- | --- |
| `text` | string | The text (required) |
| `x`, `y` | integer | Top-left corner in pixels |
| `width`, `height` | integer | Box size in pixels |
| `color` | hex string | Font color, e.g. `"#ffffff"` |
| `outline_color` | hex string | Outline color, e.g. `"#000000"` |

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

The template's `width`/`height` from `get_memes` gives you the coordinate space.

## Styling

- `font` — `"impact"` (default, the only correct choice) or `"arial"` (for cowards)
- `max_font_size` — maximum size in pixels (default 50); text automatically shrinks to fit its box
- `no_watermark` — removes the imgflip.com watermark, requires an Imgflip Premium **account** subscription (different from API Premium — see [Premium Tools](premium.md))

## Useful template ids

The classics, for when you don't want to look them up:

| Template | id | box_count |
| --- | --- | --- |
| Drake Hotline Bling | `181913649` | 2 |
| Distracted Boyfriend | `112126428` | 3 |
| Two Buttons | `87743020` | 3 |
| Expanding Brain | `93895088` | 4 |
| Change My Mind | `129242436` | 2 |
| One Does Not Simply | `61579` | 2 |

!!! warning "Popularity shifts"
    `get_memes` reflects the last 30 days, so the popular list changes over time — ids above stay valid either way, since captioning works for any template id.
