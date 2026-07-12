# Security Policy

## Supported versions

Only the latest released version receives security fixes.

## Reporting a vulnerability

Please report vulnerabilities privately via
[GitHub Security Advisories](https://github.com/mariokernich/imgflip-mcp/security/advisories/new)
rather than opening a public issue. You can expect an initial response within
a week.

## Scope notes

- This server runs locally and holds your Imgflip credentials in environment
  variables (or the OS keychain when installed as a Claude Desktop
  extension). It sends them exclusively to `https://api.imgflip.com`.
- The Imgflip API itself (and anything on imgflip.com) is out of scope —
  report issues there to Imgflip directly.
