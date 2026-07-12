# VS Code / GitHub Copilot

GitHub Copilot's agent mode speaks MCP natively — no extension marketplace involved.

## One-click install

Use the **Install in VS Code** badge in the [README](https://github.com/mariokernich/imgflip-mcp#readme), or run:

```bash
code --add-mcp '{"name":"imgflip","command":"npx","args":["-y","imgflip-mcp"],"env":{"IMGFLIP_USERNAME":"${input:imgflip_username}","IMGFLIP_PASSWORD":"${input:imgflip_password}"},"inputs":[{"id":"imgflip_username","type":"promptString","description":"Imgflip username"},{"id":"imgflip_password","type":"promptString","description":"Imgflip password","password":true}]}'
```

VS Code prompts for your Imgflip username and password on first use (the password input is masked) and stores the server in your MCP configuration.

## Manual configuration

Alternatively, add the server to your user or workspace `mcp.json` (**Command Palette → "MCP: Open User Configuration"**):

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

## Verify

Open Copilot Chat in agent mode — the `get_memes` and `caption_image` tools appear in the tools picker. Try:

> *"Find a meme template about brains and caption it with our code review stages."*

## Registry discovery

Once published to the [MCP Registry](https://registry.modelcontextprotocol.io), the server is also discoverable in the [GitHub MCP Registry](https://github.com/mcp) and directly inside VS Code (**Extensions view → MCP SERVERS**).
