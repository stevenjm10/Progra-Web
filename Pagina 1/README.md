# Page 1: Restaurant dishes

Independent Java 17 / Spring Boot / PostgreSQL application with a vanilla HTML, CSS and JavaScript frontend. The visible interface remains Spanish.

## Run

Start PostgreSQL on localhost:5432 and create the `reservas` database. Local database settings are included in `src/main/resources/application.properties` at the author's explicit request for grading. Adjust them if your PostgreSQL installation uses different settings.

Open this folder in NetBeans, select Clean and Build, then Run. The main class is `uce.edu.restaurant.RestaurantApplication`. Alternatively:

```powershell
npm ci
npm start
```

Open http://localhost:8080/. Java 17 and Node.js 20+ are required. Spring Boot creates the `dish` table on a fresh database; execute `sample-data.sql` to load ten example dishes without duplicating existing names.

### Existing database upgrade

Before starting this version against the old schema, run `migrate-legacy-schema.sql` in the same database. It renames the old table and columns to English while preserving IDs and all existing rows. The script is transactional and can be run again after migration. The database name `reservas` is retained to preserve the existing connection.

## Source files

- `src/main/java/uce/edu/restaurant/`: `RestaurantApplication`, `Dish`, `DishRepository`, `DishService` and `DishController`.
- `src/main/resources/static/index.html` and `dishes.js`: non-clickable text cards and immediate local search.
- `dish-list.html` / `dish-list.js`: registered dishes, edit and delete actions.
- `dish-form.html` / `dish-form.js`: create a dish or edit with `?id=ID`; return button at the bottom.
- `api.js`: shared fetch helper using async/await.
- `styles.css`: basic styling and responsive Grid/Flexbox rules.

## REST API

| Method | Path | Action |
| --- | --- | --- |
| GET | `/api/dishes` | List dishes |
| GET | `/api/dishes/{id}` | Find a dish |
| POST | `/api/dishes` | Create a dish |
| PUT | `/api/dishes/{id}` | Update a dish |
| DELETE | `/api/dishes/{id}` | Delete a dish |

```json
{"name":"Seco de pollo","category":"Plato fuerte","description":"Pollo con arroz","price":4.50,"available":true}
```

Creation returns 201, deletion 204, missing IDs 404 and invalid input 400. JSON properties and code identifiers are English; the displayed dish data and validation messages are Spanish.

## Tests

Microsoft Edge is used by default. Run `npm test` for the UI and MCP tests, `npm run test:e2e` for browser workflows, `npm run test:mcp` for the actual MCP connection, and `npm run report` to view the report. The test server runs on port 8090. CRUD tests verify real persistence after reload and remove only their uniquely named temporary dish. Run `mvnw.cmd test` for eight Java endpoint tests with a mocked repository.

## UI agent

`.codex/config.toml` registers the local Playwright MCP server; `.codex/agents/ui-validator.toml` defines `ui_validator`. Open this project folder in Codex and reopen the session. Start the application, then ask the agent to validate http://localhost:8080/. It should preserve existing records, use actual browser tools and save screenshots and results under `artifacts/mcp/`. Automated tests do not themselves execute an AI model.
