# Page 2: Rick and Morty

Independent vanilla HTML, CSS and JavaScript project. It does not require Java, Spring Boot, PostgreSQL or files from Page 1. All source code and technical documentation are English; the visible interface remains Spanish.

## Run

Use Node.js 20+ and run these commands from this folder:

```powershell
npm ci
npm start
```

Open http://localhost:3000/. The local server only serves `public/`; do not open HTML files with file://. Both projects can run simultaneously.

## Source and API

- `public/index.html`: search box, character grid, pagination and details dialog.
- `public/characters.js`: async/await API requests, image cards, details, cancellation and error handling.
- `public/styles.css`: responsive layout and spinner animation.
- `tools/start.cjs`: local HTTP server.

The page consumes https://rickandmortyapi.com/api/character, /location and /episode. Clicking a character opens a dialog with its image, species, status, origin, location, dimension and first episode. Close it with the button or Escape.

Search uses a 4000 ms debounce measured from the last keystroke. Each new keystroke resets the timer; a spinner stays visible while waiting or loading. Superseded requests are cancelled.

## Tests

Use Microsoft Edge and run `npm test`, then `npm run report`. Tests start their own server on port 8091 and stop it when finished.

- `npm run test:e2e`: deterministic UI tests with mocked API responses; checks debounce timing, spinner, three resources, modal, error recovery, pagination and mobile layout.
- `npm run test:live`: also runs the E2E check against the real API; requires internet.
- `npm run test:mcp`: actual MCP protocol connection, live API details, measured debounce and screenshots. It can use the visible retry control if the external API temporarily fails.

Reports, screenshots and traces are stored under `artifacts/` and are excluded from Git.

## UI agent

`.codex/config.toml` configures Playwright MCP, and `.codex/agents/ui-validator.toml` defines `ui_validator`. Open this project folder in Codex and reopen the session. Start the application and ask the agent to validate http://localhost:3000/ through MCP. The browser uses a headless, isolated Edge session, not your personal browser profile. The test suite verifies MCP tools directly; running an AI agent is a separate action requested from Codex.

API documentation: https://rickandmortyapi.com/documentation
MCP documentation: https://github.com/microsoft/playwright-mcp
