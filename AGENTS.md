# Repositorio de dos proyectos

Pagina 1 y Pagina 2 son proyectos independientes. Lee el README de la carpeta correspondiente. Ejecuta npm ci y las pruebas desde esa carpeta, no desde la raíz.

La configuración MCP de la raíz usa Pagina 1/tools/playwright-mcp.cjs y necesita npm ci dentro de Pagina 1. Las configuraciones de cada proyecto funcionan al abrir la carpeta de ese proyecto como raíz.

Cuando se solicite validar la interfaz con el agente, usa validador_ui y el servidor MCP playwright. Conserva los datos anteriores; elimina solo los registros temporales creados por la prueba. Informa qué pruebas usan API real o simulada y guarda evidencia en artifacts/. No informes una llamada Playwright directa como si fuera MCP.

Por petición explícita del usuario, la configuración de PostgreSQL de localhost se incluye para evaluación. No agregues credenciales de otros servicios, node_modules, target, artifacts ni archivos .env a Git.
