# Proyecto 2: Rick and Morty

Proyecto independiente en HTML, CSS y JavaScript vanilla. No requiere Java, Spring Boot, PostgreSQL ni archivos del proyecto Platillos. Consume directamente la API pública de Rick and Morty.

## Ejecutar

Node.js 20 o posterior. Desde PowerShell en esta carpeta:

```powershell
npm start
```

Abrir **http://localhost:3000/**. Se puede tener abierto al mismo tiempo que Platillos en el puerto 8080. No abrir los HTML mediante `file://`.

Los archivos del sitio están en `public/`: `index.html`, `personajes.js` y `estilos.css`. El pequeño servidor local está en `tools/iniciar.cjs` y solo sirve archivos de `public/`.

Consume los tres recursos `https://rickandmortyapi.com/api/character`, `/location` y `/episode`. Las tarjetas muestran imagen y texto; al pulsar una se abre un diálogo con detalles. La búsqueda espera 4 segundos desde la última tecla, muestra un spinner y cancela consultas antiguas. Hay paginación y estados de error, reintento y búsqueda vacía.

## Playwright

Node.js 20 o posterior y Microsoft Edge instalado. Antes de la primera ejecución, instalar las dependencias con `npm ci`.

```powershell
npm test
npm run report
```

Las pruebas arrancan su propio servidor en el puerto **8091** y lo detienen al terminar. El servidor normal usa 3000.

- `npm run test:e2e`: pruebas reproducibles con respuestas de API **simuladas**, para comprobar temporizadores, tres recursos, modal, imágenes, errores, paginación y diseño móvil sin depender de internet. No simulan el tiempo de forma imprecisa: controlan el reloj del navegador para comprobar 3999 ms y luego 1 ms adicional.
- `npm run test:live`: también ejecuta la comprobación con la API real y necesita internet.
- `npm run test:mcp`: usa el protocolo MCP real y herramientas del servidor oficial de Playwright para abrir el sitio, consultar la API real, mostrar detalles, medir la espera de búsqueda y guardar una captura.
- `npm test`: pruebas E2E reproducibles y prueba MCP real; la prueba E2E adicional de API real se omite salvo que se use `test:live`. La prueba MCP sí necesita internet.

Los resultados, capturas y trazas quedan en `artifacts/`. `npm run report` abre el informe HTML.

## Agente de UI con MCP

El servidor se configura en `.codex/config.toml`; el agente `validador_ui` está definido en `.codex/agents/validador-ui.toml`. Usa Edge headless y un contexto aislado; no utiliza tu perfil personal del navegador.

Abre **RickAndMorty como proyecto en Codex** y vuelve a abrir la sesión para cargar el MCP local. Confía en esta carpeta si Codex lo solicita. Arranca `npm start` y envía:

> Usa el agente validador_ui y el MCP Playwright para validar http://localhost:3000. Comprueba las tarjetas, las imágenes, los tres recursos de API, los detalles, el cierre, la paginación, el spinner y el debounce de cuatro segundos. Guarda resultados y capturas en artifacts/mcp.

Las pruebas de `tests/mcp/` verifican la conexión real y registran las llamadas realizadas. La definición del agente no equivale a ejecutar un modelo: el agente se usa desde la sesión Codex que cargue este proyecto.

Documentación: https://rickandmortyapi.com/documentation y https://github.com/microsoft/playwright-mcp
