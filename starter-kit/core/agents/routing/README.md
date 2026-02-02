# Routing & Agent Selection

This starter kit assumes:
- **main** agent is the default entrypoint.
- **opus** is used when you explicitly ask for Opus/Claude for writing/reasoning.
- **coding** is used when you explicitly ask for Codex/coding, or when a task is clearly implementation-heavy.

Exact routing/bindings depend on your Clawdbot installation and channel setup.

Tip: prefer explicit invocation in operational scripts:
- `clawdbot agent --agent opus ...`
- `clawdbot agent --agent coding ...`
