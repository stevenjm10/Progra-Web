# Pagina 1

Proyecto independiente: Java 17, Spring Boot, PostgreSQL y frontend HTML/CSS/JavaScript vanilla. Ya no incluye Rick and Morty ni depende de su carpeta.

## Abrir la aplicación

En NetBeans, abrir **esta carpeta Pagina 1**, hacer Clean and Build y Run. Dirección: **http://localhost:8080/**. La clase principal es `uce.edu.Platillos.PlatillosApplication`.

También puede arrancarse desde PowerShell en esta carpeta:

```powershell
npm start
```

Necesita Java 17 y PostgreSQL activo. Se conserva la conexión a la base `reservas` en `src/main/resources/application.properties` y la tabla `platillo`, incluidos los 10 platillos existentes. La separación no borra ni copia datos de PostgreSQL. No hace falta ejecutar de nuevo `datos-ejemplo.sql`; el archivo sirve para cargar ejemplos si se usa una base nueva y evita duplicar nombres existentes.

## Archivos de la aplicación

- `src/main/java/uce/edu/Platillos/`: modelo, repositorio, servicio, controlador y clase principal.
- `src/main/resources/static/index.html`: tarjetas de texto, búsqueda inmediata y botones de navegación.
- `lista-platillos.html` / `lista-platillos.js`: tabla, editar y eliminar.
- `nuevo-platillo.html` / `nuevo-platillo.js`: crear; con `?id=ID` permite editar. Botón Regresar al final.
- `api.js`: llamadas fetch a `/api/platillos`.
- `estilos.css`: estilos básicos y media queries.

Endpoints: GET y POST `/api/platillos`; GET, PUT y DELETE `/api/platillos/{id}`.

## Pruebas Playwright

Node.js 20 o posterior y Microsoft Edge instalado. Antes de la primera ejecución, instalar las dependencias con `npm ci`.

```powershell
npm test
npm run report
```

Las pruebas arrancan **su propia instancia de Spring Boot en el puerto 8090**, prueban las pantallas y paran el servidor al finalizar. PostgreSQL debe estar activo. No ocupan el puerto 8080 de NetBeans.

- `npm run test:e2e`: navegación, botones Regresar, tarjetas, búsqueda inmediata y CRUD completo desde la UI con persistencia comprobada tras recargar.
- `npm run test:mcp`: conecta un cliente MCP al servidor real de Playwright y comprueba las pantallas mediante sus herramientas; no guarda datos en esta prueba.
- `mvnw.cmd test`: 8 pruebas HTTP Java con repositorio simulado, independientes de PostgreSQL.

La prueba CRUD crea un registro de nombre único `E2E-...` y elimina solo ese registro, incluso si falla una comprobación. Los informes HTML, JSON, trazas y capturas se guardan en `artifacts/`.

## Agente con MCP

- `.codex/config.toml`: registra Playwright MCP para este proyecto.
- `.codex/agents/validador-ui.toml`: define el agente `validador_ui`, que hereda el modelo de tu sesión.
- `tools/playwright-mcp.cjs`: arranca la versión local del MCP en Edge headless con sesión aislada.
- `tests/mcp/conexion.spec.js`: comprueba la conexión MCP y sus herramientas realmente; no simula el servidor MCP.

Abre **Pagina 1 como proyecto en Codex** y vuelve a abrir la sesión para cargar su configuración. Acepta la confianza de esta carpeta si Codex lo solicita. Arranca la aplicación y envía:

> Usa el agente validador_ui conectado al MCP Playwright para validar http://localhost:8080. Prueba navegación, búsqueda, crear, editar, recargar, eliminar y los botones Regresar. Conserva los registros anteriores y guarda el informe y las capturas en artifacts/mcp.

La definición del agente y el MCP están integrados en el proyecto. El agente se ejecuta cuando lo solicitas en una sesión que haya cargado esta configuración; las pruebas npm son automatización reproducible y no una llamada a un modelo de IA. Si no aparecen herramientas Playwright en Codex, hay que recargar esa sesión, no afirmar que el MCP está activo en una sesión antigua.

## Configuración de PostgreSQL para esta copia de GitHub

La contraseña no está incluida en el repositorio. Antes de ejecutar la aplicación o sus pruebas E2E, define las variables en la misma terminal PowerShell:

```powershell
$env:DB_PASSWORD = 'TU_CLAVE_DE_POSTGRES'
$env:DB_USER = 'postgres'
$env:DB_URL = 'jdbc:postgresql://localhost:5432/reservas'
npm start
```

En NetBeans, configura DB_PASSWORD en el entorno de ejecución o inicia NetBeans desde una terminal que ya tenga esa variable. El archivo datos-ejemplo.sql contiene los 10 platillos de ejemplo para una base nueva; los registros personales de PostgreSQL no se suben a GitHub.
