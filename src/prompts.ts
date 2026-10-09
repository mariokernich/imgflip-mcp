import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
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
}
