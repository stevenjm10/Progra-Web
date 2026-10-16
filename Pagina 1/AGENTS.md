# UI validation

The Playwright MCP server is configured in `.codex/config.toml`. The `ui_validator` agent is defined in `.codex/agents/ui-validator.toml`.

When the user requests agent-based UI validation, use `ui_validator` with the Playwright MCP tools. Open the appropriate project as the session root. If MCP is unavailable, report that the session must be reopened with this configuration; do not present direct Playwright calls as MCP calls.

Run `npm test` for the full browser suite, `npm run test:e2e` for UI workflows, `npm run test:mcp` for actual MCP calls and `npm run report` for the HTML report. Read the README for database and internet requirements.

Preserve existing data and clean up only uniquely named test records. Do not modify application code during validation unless the user asks for a fix. Keep code, comments and technical identifiers in English; keep the user-facing interface in Spanish. Save evidence under `artifacts/` and never claim unexecuted checks passed.
