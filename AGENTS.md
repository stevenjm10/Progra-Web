# Two independent projects

`Pagina 1` and `Pagina 2` are independent applications. Keep these folder names as requested by the user. Run npm commands from the relevant project folder. Read each README before starting.

The root Playwright MCP configuration uses `Pagina 1/tools/playwright-mcp.cjs`, which requires `npm ci` inside `Pagina 1`. Each project also has its own MCP configuration and `ui_validator` agent.

Keep all code, comments, identifiers, API routes and technical documentation in English. Keep the visible web interface and dish content in Spanish. Preserve existing database records when migrating legacy names. For UI validation, use the agent and actual MCP tools; distinguish mocked and real APIs and clean up only temporary test records.

At the user's explicit request, local PostgreSQL settings are included for grading. Do not add credentials for other services, node_modules, target, artifacts or environment files to Git.
