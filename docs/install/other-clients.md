# Other MCP Clients

Any client that supports **stdio** MCP servers works. The recipe is always the same three ingredients:

| Setting | Value |
| --- | --- |
| Command | `npx` |
| Arguments | `["-y", "imgflip-mcp"]` |
| Environment | `IMGFLIP_USERNAME`, `IMGFLIP_PASSWORD`, optionally `IMGFLIP_PREMIUM` |

Running from a source checkout instead? Use command `node` with argument `/absolute/path/to/imgflip-mcp/dist/index.js`.

## Cursor

`.cursor/mcp.json` in your project (or the global equivalent):

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

## MCP Inspector (for testing)

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) gives you a web UI to poke at the server directly — useful for debugging your setup without involving an AI:

```bash
IMGFLIP_USERNAME=you IMGFLIP_PASSWORD=secret \
  npx @modelcontextprotocol/inspector npx -y imgflip-mcp
```

## Requirements

- **Node.js 18+** available on the machine that runs the client
- Outbound HTTPS access to `api.imgflip.com` (and `i.imgflip.com` for inline image embedding)
