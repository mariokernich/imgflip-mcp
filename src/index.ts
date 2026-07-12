#!/usr/bin/env node
/**
 * imgflip-mcp — Model Context Protocol server for the Imgflip meme API.
 *
 * Exposes the Imgflip REST API (https://imgflip.com/api) as MCP tools over
 * stdio. Credentials are read from the IMGFLIP_USERNAME / IMGFLIP_PASSWORD
 * environment variables.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ImgflipClient } from "./client.js";

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
  version: "1.0.0",
});

/** Shared schema for a caption text box. */
const boxSchema = z.object({
  text: z.string().describe("Text to render in this box"),
  x: z.number().int().optional().describe("X coordinate in pixels (auto when omitted)"),
  y: z.number().int().optional().describe("Y coordinate in pixels (auto when omitted)"),
  width: z.number().int().optional().describe("Box width in pixels (auto when omitted)"),
  height: z.number().int().optional().describe("Box height in pixels (auto when omitted)"),
  color: z
    .string()
    .optional()
    .describe('Font color as hex code, e.g. "#ffffff"'),
  outline_color: z
    .string()
    .optional()
    .describe('Font outline color as hex code, e.g. "#000000"'),
});

type ToolResult = {
  content: { type: "text"; text: string }[];
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
        .describe(
          "Case-insensitive substring to filter template names by, e.g. \"drake\"",
        ),
    },
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
  },
  async ({ template_id, text0, text1, boxes, font, max_font_size, no_watermark }) => {
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
      return ok(result);
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
        no_watermark: z
          .boolean()
          .optional()
          .describe("Remove the imgflip.com watermark"),
      },
    },
    async ({ template_id, boxes, no_watermark }) => {
      try {
        return ok(await client.captionGif(template_id, boxes, no_watermark ?? false));
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
          .describe(
            'The meme text, e.g. "one does not simply write bug-free code"',
          ),
        no_watermark: z
          .boolean()
          .optional()
          .describe("Remove the imgflip.com watermark"),
      },
    },
    async ({ text, no_watermark }) => {
      try {
        return ok(await client.automeme(text, no_watermark ?? false));
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
        no_watermark: z
          .boolean()
          .optional()
          .describe("Remove the imgflip.com watermark"),
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
        return ok(result);
      } catch (error) {
        return fail(error);
      }
    },
  );
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(
  `imgflip-mcp server running on stdio (premium tools ${
    premiumEnabled ? "enabled" : "disabled"
  })`,
);
