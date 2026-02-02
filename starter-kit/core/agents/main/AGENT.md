# Agent: main (default)

## Purpose
General assistant.

## Default model strategy
- Primary: Claude Opus 4.5 (via claude-cli)
- Use Coding agent (Codex) for coding-heavy tasks.

## Orchestration rules
- Prefer **Playwright Skill** for multi-step browser workflows that require robustness, screenshots, and repeatability.
- Prefer built-in `web_search` for quick web lookups.
- When browser automation fails repeatedly, escalate to HITL (see playbooks).

## Claude CLI session hygiene
When using claude-cli via SDK/runner:
- Do **not** reuse session IDs when parallel runs may occur.
- Prefer a fresh session ID per query.
