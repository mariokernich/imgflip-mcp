/**
 * End-to-end smoke test: boots the compiled server (dist/index.js, built by
 * the pretest hook) as a real subprocess and speaks MCP over stdio using the
 * official SDK client.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, it } from "vitest";

async function connect(env: Record<string, string>) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/index.js"],
    env: { ...process.env, ...env } as Record<string, string>,
  });
  const client = new Client({ name: "smoke-test", version: "0.0.0" });
  await client.connect(transport);
  return client;
}

describe("imgflip-mcp server over stdio", () => {
  it("registers only the free tools by default", async () => {
    const client = await connect({ IMGFLIP_PREMIUM: "" });
    try {
      const { tools } = await client.listTools();
      expect(tools.map((tool) => tool.name).sort()).toEqual([
        "caption_image",
        "get_memes",
      ]);
      expect(client.getInstructions()).toContain("never draw the meme yourself");
    } finally {
      await client.close();
    }
  });

  it("registers all seven tools and the prompt with IMGFLIP_PREMIUM=true", async () => {
    const client = await connect({ IMGFLIP_PREMIUM: "true" });
    try {
      const { tools } = await client.listTools();
      expect(tools.map((tool) => tool.name).sort()).toEqual([
        "ai_meme",
        "automeme",
        "caption_gif",
        "caption_image",
        "get_meme",
        "get_memes",
        "search_memes",
      ]);
      const readOnly = tools.find((tool) => tool.name === "get_memes");
      expect(readOnly?.annotations?.readOnlyHint).toBe(true);

      const { prompts } = await client.listPrompts();
      expect(prompts.map((prompt) => prompt.name)).toContain("make-meme");
    } finally {
      await client.close();
    }
  });

  it("rejects caption_image without credentials via isError", async () => {
    const client = await connect({
      IMGFLIP_USERNAME: "",
      IMGFLIP_PASSWORD: "",
    });
    try {
      const result = await client.callTool({
        name: "caption_image",
        arguments: { template_id: "181913649", text0: "top" },
      });
      expect(result.isError).toBe(true);
      expect(JSON.stringify(result.content)).toContain("IMGFLIP_USERNAME");
    } finally {
      await client.close();
    }
  });

  it("rejects caption_image without any caption text before hitting the API", async () => {
    const client = await connect({
      IMGFLIP_USERNAME: "user",
      IMGFLIP_PASSWORD: "secret",
    });
    try {
      const result = await client.callTool({
        name: "caption_image",
        arguments: { template_id: "181913649" },
      });
      expect(result.isError).toBe(true);
      expect(JSON.stringify(result.content)).toContain("No caption provided");
    } finally {
      await client.close();
    }
  });
});
