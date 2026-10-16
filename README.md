# Progra Web

Dos proyectos independientes en un repositorio, con pruebas E2E y conexión al MCP oficial de Playwright.

| Carpeta | Aplicación | Dirección normal |
| --- | --- | --- |
| [Pagina 1](Pagina%201/README.md) | Java 17, Spring Boot, PostgreSQL y CRUD de platillos | http://localhost:8080/ |
| [Pagina 2](Pagina%202/README.md) | HTML, CSS y JavaScript vanilla con API de personajes, ubicaciones y episodios | http://localhost:3000/ |

## Inicio

Cada carpeta tiene su propio package.json y package-lock.json. Necesitas Node.js 20+ y Microsoft Edge. Para Pagina 1 también necesitas Java 17 y PostgreSQL.

Desde la carpeta del proyecto que quieras ejecutar:

```powershell
npm ci
npm start
```

Pagina 1 incluye la configuración local de PostgreSQL directamente en application.properties; no requiere variables de entorno. Se usa la base reservas y la tabla platillo. Si es una base nueva, crea la base, ejecuta Spring Boot para generar la tabla y carga Pagina 1/datos-ejemplo.sql.

## Pruebas y agente

En cualquiera de las dos carpetas:

```powershell
npm test
npm run report
```

- test:e2e: recorridos de la interfaz. Pagina 1 usa PostgreSQL real y un registro temporal que elimina al terminar. Pagina 2 usa respuestas simuladas para las pruebas reproducibles.
- test:mcp: conexión MCP real y uso de sus herramientas en el navegador.
- test:live: activa las comprobaciones E2E con la API real de Rick and Morty.
- Las pruebas arrancan y detienen sus propios servidores en 8090 y 8091.
- Los informes y capturas se generan en artifacts/ y no se versionan.

Cada proyecto incluye .codex/config.toml y el agente validador_ui. Al abrir la raíz de este repositorio en Codex también hay una configuración MCP común, que utiliza la instalación de Pagina 1 (ejecuta npm ci en Pagina 1 antes de usarla). Solicita el agente indicando el proyecto y su URL.

La página de platillos muestra tarjetas solo de texto, búsqueda inmediata y páginas separadas para lista y nuevo/editar. La página de Rick and Morty muestra imágenes, detalles emergentes y búsqueda con debounce de cuatro segundos e indicador de carga.

La configuración de PostgreSQL de localhost está incluida por petición del autor para la evaluación. También se incluye el script SQL con los 10 platillos de ejemplo. No se incluyen dependencias instaladas ni archivos compilados.
