# VS Code / GitHub Copilot

GitHub Copilot's agent mode speaks MCP natively — no extension marketplace involved.

## One-click install

Use the **Install in VS Code** badge in the [README](https://github.com/mariokernich/imgflip-mcp#readme), or run:

```bash
code --add-mcp '{"name":"imgflip","command":"npx","args":["-y","imgflip-mcp"],"env":{"IMGFLIP_USERNAME":"${input:imgflip_username}","IMGFLIP_PASSWORD":"${input:imgflip_password}"},"inputs":[{"id":"imgflip_username","type":"promptString","description":"Imgflip username"},{"id":"imgflip_password","type":"promptString","description":"Imgflip password","password":true}]}'
```

VS Code prompts for your Imgflip username and password on first use (the password input is masked) and stores the server in your MCP configuration.

## Manual configuration

Alternatively, add the server to your user-level `mcp.json`. Always open it via **Command Palette → "MCP: Open User Configuration"** — that lands in the right file on every OS (Windows: `%APPDATA%\Code\User\mcp.json`, macOS: `~/Library/Application Support/Code/User/mcp.json`, Linux: `~/.config/Code/User/mcp.json`). Note the top-level key is `servers` (not `mcpServers` like in other clients):

```json
{
  "servers": {
    "imgflip": {
      "command": "npx",
      "args": ["-y", "imgflip-mcp"],
      "env": {
        "IMGFLIP_USERNAME": "your-username",
        "IMGFLIP_PASSWORD": "your-password"
      }
    }
  }
}
```

## Verify — step by step

1. **Server running?** Command Palette → **"MCP: List Servers"** → `imgflip` must be listed and *Running*. On the very first start VS Code shows a **trust confirmation** — until you confirm it once, the server never starts (the most common silent failure).
2. **Agent mode.** MCP tools only work in Copilot Chat's **Agent** mode — switch the mode dropdown from *Ask*/*Edit* to *Agent*.
3. **Tools enabled?** Click the tools icon (🔧) in the chat input and make sure `imgflip` is checked. Copilot caps active tools at ~128, so with many MCP servers some get silently deselected.
4. **Prove it:** type `#` in the chat — `get_memes` and `caption_image` must appear in the suggestions. Then try:

    > *"#caption_image Make a Drake meme: top 'reading the docs', bottom 'asking the one colleague who knows'."*

    The `#tool` reference forces Copilot to use the tool. If `#` doesn't offer the tools, the server isn't connected — go back to step 1.

!!! tip "Copilot draws an SVG instead of using the tools?"
    That's the tell-tale sign the tools aren't available in the current chat (missing config, unstarted server, or deselected tools) — walk through the steps above. When the tools *are* available but Copilot still free-styles, mention "use the imgflip tools" once or use a `#tool` reference; Copilot weighs MCP server instructions less strongly than Claude does.

After updating the server (new npm release), restart it via **MCP: List Servers → imgflip → Restart** so `npx` picks up the new version.

## Registry discovery

Once published to the [MCP Registry](https://registry.modelcontextprotocol.io), the server is also discoverable in the [GitHub MCP Registry](https://github.com/mcp) and directly inside VS Code (**Extensions view → MCP SERVERS**).
