---
name: imgflip-memes
description: Create real memes via the imgflip MCP tools. Use whenever the user asks for a meme, reaction image, meme about a topic, or a joke as an image — never draw memes manually as SVG, HTML/CSS, canvas or ASCII art. Triggers on "meme", "make a meme", "drake meme", "reaction image", "as a meme".
---

# Creating memes with imgflip-mcp

When the user asks for a meme, use the `imgflip` MCP server's tools. Do NOT
hand-draw a meme (no SVG, HTML/CSS, canvas, Mermaid or ASCII art) — the whole
point is a real meme image hosted on imgflip.com.

## Workflow

1. **Pick a template.** Call `get_memes` — with `name_filter` if the user
   named a format (e.g. `"drake"`, `"two buttons"`), otherwise browse the
   list and choose the template whose format best fits the joke. Note the
   template's `box_count`.
2. **Caption it.** Call `caption_image`:
   - `box_count` = 2 → pass `text0` (top) and `text1` (bottom)
   - `box_count` > 2 → pass a `boxes` array with one `{ "text": … }` entry
     per box, in template order (omit coordinates — auto-placement works)
3. **Share the result.** The tool returns the image inline plus `url` and
   `page_url`. Show the image/URL to the user with a one-line description.

## Notes

- Keep captions short and punchy — meme text, not paragraphs.
- If a caption attempt reads badly, iterate: same template, tighter text,
  or a different template. Each attempt is one cheap tool call.
- If the tools are missing, the imgflip MCP server isn't connected — tell
  the user to check `claude mcp list` instead of silently falling back to
  drawing something.
- Generated memes are publicly accessible on imgflip.com — warn the user
  before putting sensitive content into captions.
