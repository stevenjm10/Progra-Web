# Repositorio de dos proyectos

Platillos y RickAndMorty son proyectos independientes. Lee el README de la carpeta correspondiente. Ejecuta npm ci y las pruebas desde esa carpeta, no desde la raíz.

La configuración MCP de la raíz usa Platillos/tools/playwright-mcp.cjs y necesita npm ci dentro de Platillos. Las configuraciones de cada proyecto funcionan al abrir la carpeta de ese proyecto como raíz.

Cuando se solicite validar la interfaz con el agente, usa validador_ui y el servidor MCP playwright. Conserva los datos anteriores; elimina solo los registros temporales creados por la prueba. Informa qué pruebas usan API real o simulada y guarda evidencia en artifacts/. No informes una llamada Playwright directa como si fuera MCP.

Nunca publiques credenciales de PostgreSQL ni agregues node_modules, target, artifacts o archivos .env a Git.
