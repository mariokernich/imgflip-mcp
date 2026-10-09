#!/usr/bin/env node
/**
 * imgflip-mcp — Model Context Protocol server for the Imgflip meme API.
 *
 * Exposes the Imgflip REST API (https://imgflip.com/api) as MCP tools over
 * stdio. Credentials are read from the IMGFLIP_USERNAME / IMGFLIP_PASSWORD
 * environment variables.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";

const config = loadConfig();
const server = createServer(config);

await server.connect(new StdioServerTransport());
console.error(
  `imgflip-mcp server running on stdio (premium tools ${
    config.premium ? "enabled" : "disabled"
  })`,
);
