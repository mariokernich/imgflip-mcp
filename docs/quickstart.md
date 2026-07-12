# Quickstart

From zero to your first meme in about five minutes.

## 1. Get an Imgflip account

Sign up for free at [imgflip.com/signup](https://imgflip.com/signup). The Imgflip API authenticates with your username and password (it has no API keys), so consider creating a dedicated account for API use.

!!! tip
    A free account is all you need. Ignore anything that says "Premium" for now — see [Premium Tools](premium.md) if you get curious later.

## 2. Connect the server to your client

The server runs over stdio and is started by your MCP client via `npx` — nothing to install or keep running yourself.

=== "Claude Desktop"

    Add to `claude_desktop_config.json` (**Settings → Developer → Edit Config**):

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

    Then fully restart Claude Desktop. Prefer one-click? See the [`.mcpb` extension install](install/claude-desktop.md).

=== "Claude Code"

    ```bash
    claude mcp add imgflip \
      --env IMGFLIP_USERNAME=your-username \
      --env IMGFLIP_PASSWORD=your-password \
      -- npx -y imgflip-mcp
    ```

=== "VS Code / Copilot"

    ```bash
    code --add-mcp '{"name":"imgflip","command":"npx","args":["-y","imgflip-mcp"],"env":{"IMGFLIP_USERNAME":"${input:imgflip_username}","IMGFLIP_PASSWORD":"${input:imgflip_password}"},"inputs":[{"id":"imgflip_username","type":"promptString","description":"Imgflip username"},{"id":"imgflip_password","type":"promptString","description":"Imgflip password","password":true}]}'
    ```

## 3. Make a meme

Open a chat and try:

> *"Show me the most popular meme templates right now."*

> *"Make a Drake meme: top 'manually formatting code', bottom 'letting the linter do it'."*

Your assistant will call `get_memes`, pick the template, call `caption_image`, and show you the result — as an inline image plus a link like `https://i.imgflip.com/…jpg`.

## Next steps

- [Tools Reference](tools.md) — every tool, every parameter
- [Creating Memes](creating-memes.md) — templates with more than two text boxes, fonts, colors, positioning
- [Use Cases & Ideas](use-cases.md) — what to actually do with this power
