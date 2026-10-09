import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ImgflipClient } from "../client.js";
import { fail, guarded, ok, okWithImage } from "../results.js";
import { boxSchema, createsMeme, readsOnly } from "./schemas.js";

/** Tools that work with a free Imgflip account (or without one). */
export function registerFreeTools(server: McpServer, client: ImgflipClient): void {
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
            'Case-insensitive substring to filter template names by, e.g. "drake"',
          ),
      },
      annotations: readsOnly,
    },
    ({ limit, name_filter }) =>
      guarded(async () => {
        let memes = await client.getMemes();
        if (name_filter) {
          const needle = name_filter.toLowerCase();
          memes = memes.filter((meme) => meme.name.toLowerCase().includes(needle));
        }
        if (limit !== undefined) {
          memes = memes.slice(0, limit);
        }
        return ok({ count: memes.length, memes });
      }),
  );

  server.registerTool(
    "caption_image",
    {
      title: "Create a meme from a template",
      description:
        "Create a real meme by captioning an Imgflip template — use this " +
        "whenever the user asks for a meme instead of drawing one yourself. " +
        "Returns the generated image inline plus its URL. Use get_memes first " +
        "to find a template_id and its box_count. For " +
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
      annotations: createsMeme,
    },
    async ({ template_id, text0, text1, boxes, font, max_font_size, no_watermark }) => {
      if (text0 === undefined && text1 === undefined && !boxes?.length) {
        return fail("No caption provided — pass text0/text1 or a non-empty boxes array.");
      }
      return guarded(async () =>
        okWithImage(
          await client.captionImage({
            templateId: template_id,
            ...(text0 !== undefined && { text0 }),
            ...(text1 !== undefined && { text1 }),
            ...(boxes !== undefined && { boxes }),
            ...(font !== undefined && { font }),
            ...(max_font_size !== undefined && { maxFontSize: max_font_size }),
            ...(no_watermark !== undefined && { noWatermark: no_watermark }),
          }),
        ),
      );
    },
  );
}
