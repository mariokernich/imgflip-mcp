# Claude Desktop

Two ways to install — the extension is the comfortable one.

## Option A — Desktop Extension (recommended)

Claude Desktop supports one-click local MCP servers as **Desktop Extensions** (`.mcpb` bundles).

1. Download the latest `imgflip-mcp-*.mcpb` from the [releases page](https://github.com/mariokernich/imgflip-mcp/releases).
2. Double-click the file, or use **Settings → Extensions → Install extension…**
3. Fill in the configuration form:
   - **Imgflip username** / **Imgflip password** — stored in your OS keychain, not in a config file
   - **Enable Premium tools** — leave off unless your account has [API Premium](../premium.md)

That's it. No JSON, no terminal.

!!! note "Building the bundle yourself"
    ```bash
    pnpm install --frozen-lockfile && pnpm build
    rm -rf node_modules
    pnpm install --prod --frozen-lockfile --config.node-linker=hoisted
    pnpm dlx @anthropic-ai/mcpb pack . imgflip-mcp.mcpb
    ```

## Option B — manual JSON config

1. Open **Settings → Developer → Edit Config**. This opens (or creates) `claude_desktop_config.json`:

    === "macOS"
        ```
        ~/Library/Application Support/Claude/claude_desktop_config.json
        ```

    === "Windows"
        ```
        %APPDATA%\Claude\claude_desktop_config.json
        ```

2. Add the server under `mcpServers`:

    ```json
    {
      "mcpServers": {
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

    Add `"IMGFLIP_PREMIUM": "true"` to `env` if you have API Premium.

3. **Fully restart** Claude Desktop — quit from the tray/menu bar, don't just close the window.

## Verify

Open a new chat: the Imgflip tools appear in the tools menu (🔌 icon). Try:

> *"Make a 'This Is Fine' meme about our flaky CI pipeline."*

The finished meme renders directly in the chat.
