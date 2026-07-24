# Ponytail

An npm package / AI agent skill that adds "lazy senior dev" mode to AI coding agents (Claude Code, Cursor, GitHub Copilot, Opencode, etc.). It makes agents write less, reuse more, and only build what's needed.

## Stack
- **Runtime:** Node.js (no external dependencies in the main package)
- **Sub-packages:** `pi-extension/` (no deps), `ponytail-mcp/` (@modelcontextprotocol/sdk, zod)
- **Tests:** Node.js built-in test runner (`node --test`)

## How to run tests
```
# All tests
node --test tests/*.test.js

# Sub-package tests
npm test --prefix pi-extension
npm test --prefix ponytail-mcp
```

## Project structure
- `skills/` — Agent skill files (SKILL.md per skill)
- `hooks/` — Claude Code / Copilot hook scripts
- `tests/` — Main test suite
- `pi-extension/` — PI platform extension
- `ponytail-mcp/` — MCP server that serves Ponytail instructions
- `examples/` — Before/after examples
- `benchmarks/` — Benchmark results and scripts

## User preferences
