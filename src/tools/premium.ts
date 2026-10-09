import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { ImgflipClient } from "../client.js";
import { guarded, ok, okWithImage } from "../results.js";
import { boxSchema, createsMeme, readsOnly } from "./schemas.js";

/** Tools that require an Imgflip API Premium subscription (IMGFLIP_PREMIUM). */
export function registerPremiumTools(server: McpServer, client: ImgflipClient): void {
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
      annotations: readsOnly,
    },
    ({ query, include_nsfw }) =>
      guarded(async () => {
        const memes = await client.searchMemes(query, include_nsfw ?? false);
        return ok({ count: memes.length, memes });
      }),
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
      annotations: readsOnly,
    },
    ({ template_id }) => guarded(async () => ok(await client.getMeme(template_id))),
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
      annotations: createsMeme,
    },
    ({ template_id, boxes, no_watermark }) =>
      guarded(async () =>
        okWithImage(await client.captionGif(template_id, boxes, no_watermark ?? false)),
      ),
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
      annotations: createsMeme,
    },
    ({ text, no_watermark }) =>
      guarded(async () =>
        okWithImage(await client.automeme(text, no_watermark ?? false)),
      ),
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
      annotations: createsMeme,
    },
    ({ model, template_id, prefix_text, no_watermark }) =>
      guarded(async () =>
        okWithImage(
          await client.aiMeme({
            ...(model !== undefined && { model }),
            ...(template_id !== undefined && { templateId: template_id }),
            ...(prefix_text !== undefined && { prefixText: prefix_text }),
            ...(no_watermark !== undefined && { noWatermark: no_watermark }),
          }),
        ),
      ),
  );
}
