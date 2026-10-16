# Validación de interfaz

Este proyecto incluye el servidor MCP oficial de Playwright en `.codex/config.toml` y el agente `validador_ui` en `.codex/agents/validador-ui.toml`.

Cuando el usuario pida validar la UI con el agente, usa `validador_ui` y las herramientas del MCP Playwright. Abre este proyecto como raíz de la sesión. Si el MCP aún no está disponible, informa que hay que volver a abrir la sesión y confiar en esta carpeta; no presentes pruebas directas de Playwright como si fueran llamadas MCP.

El comando `npm test` ejecuta las pruebas automatizadas. `npm run test:e2e` ejecuta los recorridos del navegador. `npm run test:mcp` valida una conexión MCP real con el servidor local y usa sus herramientas. `npm run report` abre el informe HTML. El archivo `README.md` indica qué necesita el proyecto para arrancar y qué pruebas utilizan respuestas simuladas.

No cambies la aplicación durante una validación salvo que el usuario pida corregir errores. Conserva los datos existentes. Un platillo de prueba debe tener nombre único y se debe eliminar al terminar. Guarda capturas, resultados y errores en `artifacts/`; nunca informes como aprobada una prueba que no se ejecutó.
