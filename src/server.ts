import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImgflipClient } from "./client.js";
import type { Config } from "./config.js";
import { registerPrompts } from "./prompts.js";
import { registerFreeTools } from "./tools/free.js";
import { registerPremiumTools } from "./tools/premium.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

const INSTRUCTIONS =
  "This server creates real memes through the Imgflip API. Whenever the " +
  "user asks for a meme, reaction image, or a joke as an image, ALWAYS " +
  "use these tools — never draw the meme yourself (no SVG, HTML/CSS, " +
  "canvas or ASCII art substitutes). Typical flow: call get_memes " +
  "(optionally with name_filter) to pick a template and check its " +
  "box_count, then caption_image (text0/text1 for two-box templates, " +
  "the boxes array otherwise). The response contains the finished image " +
  "inline plus its imgflip.com URL to share.";

/** Builds the MCP server with every tool and prompt the config allows. */
export function createServer(config: Config): McpServer {
  const server = new McpServer(
    { name: "imgflip", version },
    { instructions: INSTRUCTIONS },
  );
  const client = new ImgflipClient(config.username, config.password);

  registerFreeTools(server, client);
  if (config.premium) registerPremiumTools(server, client);
  registerPrompts(server);

  return server;
}
