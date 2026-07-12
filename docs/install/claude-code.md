# Claude Code

Two ways again — the plugin is the zero-maintenance one.

## Option A — as a plugin

This repository doubles as a [Claude Code plugin marketplace](../publishing.md#4-claude-code-plugin-marketplace):

```text
/plugin marketplace add mariokernich/imgflip-mcp
/plugin install imgflip@imgflip-mcp
```

The plugin starts the server via `npx -y imgflip-mcp` and reads your credentials from the shell environment, so export them once in `~/.bashrc` / `~/.zshrc`:

```bash
export IMGFLIP_USERNAME="your-username"
export IMGFLIP_PASSWORD="your-password"
# optional, only with an API Premium subscription:
export IMGFLIP_PREMIUM="true"
```

## Option B — register the server directly

```bash
claude mcp add imgflip \
  --env IMGFLIP_USERNAME=your-username \
  --env IMGFLIP_PASSWORD=your-password \
  -- npx -y imgflip-mcp
```

Add `--env IMGFLIP_PREMIUM=true` for the [Premium tools](../premium.md).

By default this registers the server for the current project; use `claude mcp add --scope user …` to make it available everywhere.

## Verify

```bash
claude mcp list   # "imgflip" should show as ✔ connected
```

Then, inside any session:

> *"Which meme templates are trending right now?"*

!!! tip "Memes in your workflow"
    Claude Code can drop meme links into commit messages, PR descriptions or generated docs. Whether it *should* is between you and your reviewers — see [Use Cases & Ideas](../use-cases.md).
