# Progra Web

Two independent projects with English source code and a Spanish user interface. The folder names `Pagina 1` and `Pagina 2` are retained as requested.

| Project | Description | Development URL |
| --- | --- | --- |
| [Pagina 1](Pagina%201/README.md) | Java 17, Spring Boot, PostgreSQL and dish CRUD | http://localhost:8080/ |
| [Pagina 2](Pagina%202/README.md) | Vanilla JavaScript consuming the Rick and Morty API | http://localhost:3000/ |

## Run

Use Node.js 20+ and Microsoft Edge. Page 1 also requires Java 17 and PostgreSQL. From the desired project directory:

```powershell
npm ci
npm start
```

Page 1 includes the user's local PostgreSQL settings for grading: database `reservas` on localhost:5432. Create that database first. Spring Boot creates the `dish` table. Run `sample-data.sql` to insert ten sample dishes. If upgrading from the previous Spanish database schema, run `migrate-legacy-schema.sql` before starting; it renames the table and columns without deleting records.

## Tests and MCP agent

Run `npm test` and then `npm run report` from either project directory. Test servers use ports 8090 and 8091 and are stopped automatically. Results are stored under `artifacts/` and are not committed.

Both projects include Playwright E2E tests, an actual Playwright MCP connection test and the `ui_validator` agent. Page 1 tests use PostgreSQL and clean up their own temporary record. Page 2 deterministic tests mock API responses; `npm run test:live` also checks the real API. Its MCP test uses the real API.

Open a project folder in Codex and reopen the session to load its MCP configuration. Ask: "Use ui_validator with Playwright MCP to validate the application and save evidence." The root MCP configuration uses Page 1's dependencies, so install those first if opening the entire repository.

Source code, filenames, variables, comments, API paths, JSON properties, tests and documentation use English. Visible labels, navigation, validation messages and sample dish content remain Spanish.
