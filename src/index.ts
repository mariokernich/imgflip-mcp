#!/usr/bin/env node
/**
 * imgflip-mcp — Model Context Protocol server for the Imgflip meme API.
 *
 * Exposes the Imgflip REST API (https://imgflip.com/api) as MCP tools over
 * stdio. Credentials are read from the IMGFLIP_USERNAME / IMGFLIP_PASSWORD
 * environment variables.
 */
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ImgflipClient } from "./client.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const client = new ImgflipClient(
  process.env["IMGFLIP_USERNAME"],
  process.env["IMGFLIP_PASSWORD"],
);

/**
 * Imgflip API Premium is optional. The premium-only tools (search_memes,
 * get_meme, caption_gif, automeme, ai_meme) are hidden unless explicitly
 * enabled, so free-tier users only see tools that will actually work.
 */
const premiumEnabled = ["1", "true", "yes"].includes(
  (process.env["IMGFLIP_PREMIUM"] ?? "").toLowerCase(),
);

const server = new McpServer({
  name: "imgflip",
  version,
});

/** Shared schema for a caption text box. */
const boxSchema = z.object({
  text: z.string().describe("Text to render in this box"),
  x: z.number().int().optional().describe("X coordinate in pixels (auto when omitted)"),
  y: z.number().int().optional().describe("Y coordinate in pixels (auto when omitted)"),
  width: z.number().int().optional().describe("Box width in pixels (auto when omitted)"),
  height: z
    .number()
    .int()
    .optional()
    .describe("Box height in pixels (auto when omitted)"),
  color: z.string().optional().describe('Font color as hex code, e.g. "#ffffff"'),
  outline_color: z
    .string()
    .optional()
    .describe('Font outline color as hex code, e.g. "#000000"'),
});

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string };

type ToolResult = {
  content: ContentBlock[];
  isError?: boolean;
};

function ok(payload: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
  };
}

function fail(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text", text: `Imgflip request failed: ${message}` }],
    isError: true,
  };
}

/** Images larger than this are returned as URL only, not embedded. */
const MAX_EMBED_BYTES = 2 * 1024 * 1024;

/**
 * Fetch a generated meme and return it as an inline MCP image block so
 * clients can render it directly. Returns null (URL-only fallback) for
 * oversized images or any download problem — embedding is best-effort
 * and must never fail the tool call.
 */
async function fetchImageBlock(url: string): Promise<ContentBlock | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) return null;
    const mimeType = response.headers.get("content-type") ?? "";
    if (!mimeType.startsWith("image/")) return null;
    const declaredSize = Number(response.headers.get("content-length"));
    if (declaredSize > MAX_EMBED_BYTES) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > MAX_EMBED_BYTES) return null;
    return { type: "image", data: buffer.toString("base64"), mimeType };
  } catch {
    return null;
  }
}

/** Result payload + the generated image embedded inline when possible. */
async function okWithImage(payload: { url: string }): Promise<ToolResult> {
  const result = ok(payload);
  const image = await fetchImageBlock(payload.url);
  if (image) result.content.push(image);
  return result;
}

server.registerTool(
  "get_memes",
  {
    title: "List popular meme templates",
    description:
      "Get the ~100 most popular Imgflip meme templates (ordered by how often " +
      "they were captioned in the last 30 days). Each template includes its id " +
      "(needed for caption_image), name, image URL, dimensions and box_count " +
      "(how many text boxes it supports). Free, no credentials required.",
    inputSchema: {
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Maximum number of templates to return (default: all, up to 100)"),
      name_filter: z
        .string()
        .optional()
        .describe('Case-insensitive substring to filter template names by, e.g. "drake"'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  async ({ limit, name_filter }) => {
    try {
      let memes = await client.getMemes();
      if (name_filter) {
        const needle = name_filter.toLowerCase();
        memes = memes.filter((meme) => meme.name.toLowerCase().includes(needle));
      }
      if (limit !== undefined) {
        memes = memes.slice(0, limit);
      }
      return ok({ count: memes.length, memes });
    } catch (error) {
      return fail(error);
    }
  },
);

server.registerTool(
  "caption_image",
  {
    title: "Create a meme from a template",
    description:
      "Caption an Imgflip meme template and get back the URL of the generated " +
      "image. Use get_memes first to find a template_id and its box_count. For " +
      "simple two-line memes pass text0 (top) and text1 (bottom); for templates " +
      "with more than two boxes, or for custom styling/positioning, pass the " +
      "boxes array instead (boxes takes precedence over text0/text1). Requires " +
      "a free Imgflip account (IMGFLIP_USERNAME / IMGFLIP_PASSWORD).",
    inputSchema: {
      template_id: z
        .string()
        .describe('Template id from get_memes, e.g. "181913649" for Drake'),
      text0: z.string().optional().describe("Top text (ignored when boxes is set)"),
      text1: z.string().optional().describe("Bottom text (ignored when boxes is set)"),
      boxes: z
        .array(boxSchema)
        .max(20)
        .optional()
        .describe(
          "Up to 20 text boxes for templates with more than two boxes or for " +
            "custom positioning/colors. Omitted coordinates are auto-placed.",
        ),
      font: z
        .enum(["impact", "arial"])
        .optional()
        .describe("Font family (default: impact)"),
      max_font_size: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum font size in pixels (default: 50)"),
      no_watermark: z
        .boolean()
        .optional()
        .describe("Remove the imgflip.com watermark (Imgflip Premium only)"),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async ({ template_id, text0, text1, boxes, font, max_font_size, no_watermark }) => {
    if (text0 === undefined && text1 === undefined && !boxes?.length) {
      return fail("No caption provided — pass text0/text1 or a non-empty boxes array.");
    }
    try {
      const result = await client.captionImage({
        templateId: template_id,
        ...(text0 !== undefined && { text0 }),
        ...(text1 !== undefined && { text1 }),
        ...(boxes !== undefined && { boxes }),
        ...(font !== undefined && { font }),
        ...(max_font_size !== undefined && { maxFontSize: max_font_size }),
        ...(no_watermark !== undefined && { noWatermark: no_watermark }),
      });
      return await okWithImage(result);
    } catch (error) {
      return fail(error);
    }
  },
);

if (premiumEnabled) {
  server.registerTool(
    "search_memes",
    {
      title: "Search meme templates (Premium)",
      description:
        "Search the full Imgflip database of over one million meme templates " +
        "by name. Returns up to 25 matching templates. Requires an Imgflip API " +
        "Premium subscription; use get_memes with name_filter as the free " +
        "alternative for popular templates.",
      inputSchema: {
        query: z.string().describe('Search query, e.g. "confused cat"'),
        include_nsfw: z
          .boolean()
          .optional()
          .describe("Include not-safe-for-work templates (default: false)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ query, include_nsfw }) => {
      try {
        const memes = await client.searchMemes(query, include_nsfw ?? false);
        return ok({ count: memes.length, memes });
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "get_meme",
    {
      title: "Get one meme template by id (Premium)",
      description:
        "Fetch a single meme template by its id, including name, image URL, " +
        "dimensions and box_count. Works for any of the one million templates " +
        "in the Imgflip database, not just the popular ones. Requires Imgflip " +
        "API Premium.",
      inputSchema: {
        template_id: z.string().describe("The meme template id to look up"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ template_id }) => {
      try {
        return ok(await client.getMeme(template_id));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "caption_gif",
    {
      title: "Caption an animated GIF template (Premium)",
      description:
        "Add captions to an animated Imgflip GIF template and get back the URL " +
        "of the generated GIF. Unlike caption_image this endpoint only accepts " +
        "the boxes array (no text0/text1). Requires Imgflip API Premium.",
      inputSchema: {
        template_id: z.string().describe("Id of an animated GIF template"),
        boxes: z
          .array(boxSchema)
          .min(1)
          .max(20)
          .describe("Text boxes to render on the GIF"),
        no_watermark: z.boolean().optional().describe("Remove the imgflip.com watermark"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ template_id, boxes, no_watermark }) => {
      try {
        const result = await client.captionGif(template_id, boxes, no_watermark ?? false);
        return await okWithImage(result);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "automeme",
    {
      title: "Auto-generate a meme from text (Premium)",
      description:
        "Turn a single piece of text into a meme: Imgflip automatically picks " +
        "a fitting template from ~2000 well-known meme formats and splits the " +
        "text onto it. Requires Imgflip API Premium.",
      inputSchema: {
        text: z
          .string()
          .describe('The meme text, e.g. "one does not simply write bug-free code"'),
        no_watermark: z.boolean().optional().describe("Remove the imgflip.com watermark"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ text, no_watermark }) => {
      try {
        const result = await client.automeme(text, no_watermark ?? false);
        return await okWithImage(result);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "ai_meme",
    {
      title: "Generate a meme with AI (Premium)",
      description:
        "Have Imgflip's AI invent a meme from scratch: it picks (or you fix) a " +
        "template and writes the caption text itself. Optionally seed it with " +
        "prefix_text to steer the topic. Returns the image URL plus the chosen " +
        "template and texts. Requires Imgflip API Premium.",
      inputSchema: {
        model: z
          .enum(["openai", "classic"])
          .optional()
          .describe(
            'AI model: "openai" (better quality, costs Imgflip credits) or ' +
              '"classic" (Imgflip\'s own model, default)',
          ),
        template_id: z
          .string()
          .optional()
          .describe("Force a specific template instead of letting the AI choose"),
        prefix_text: z
          .string()
          .optional()
          .describe("Beginning of the meme text for the AI to complete"),
        no_watermark: z.boolean().optional().describe("Remove the imgflip.com watermark"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ model, template_id, prefix_text, no_watermark }) => {
      try {
        const result = await client.aiMeme({
          ...(model !== undefined && { model }),
          ...(template_id !== undefined && { templateId: template_id }),
          ...(prefix_text !== undefined && { prefixText: prefix_text }),
          ...(no_watermark !== undefined && { noWatermark: no_watermark }),
        });
        return await okWithImage(result);
      } catch (error) {
        return fail(error);
      }
    },
  );
}

server.registerPrompt(
  "make-meme",
  {
    title: "Make a meme",
    description:
      "Guided meme creation: picks a fitting Imgflip template for a topic " +
      "and captions it.",
    argsSchema: {
      topic: z.string().describe("What the meme should be about"),
      template: z
        .string()
        .optional()
        .describe('Optional template preference, e.g. "Drake" or "Two Buttons"'),
    },
  },
  ({ topic, template }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text:
            `Create a meme about: ${topic}\n\n` +
            (template
              ? `Use the "${template}" template — find its id via the get_memes tool (name_filter).\n`
              : "First call get_memes and pick the template whose format best fits the joke.\n") +
            "Mind the template's box_count: use text0/text1 for two-box " +
            "templates, otherwise pass a boxes array. Then call caption_image " +
            "and share the resulting meme with a short explanation of the joke.",
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(
  `imgflip-mcp server running on stdio (premium tools ${
    premiumEnabled ? "enabled" : "disabled"
  })`,
);
