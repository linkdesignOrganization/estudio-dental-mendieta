---
name: dev-team-prose-mode-and-regression
description: "Cómo correr el plugin dev-team en este proyecto/Mac — modo PROSA, regresión --no-chunks, sub-testers secuenciales"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a4848c2a-08a3-4513-aac1-735bf9a414cc
---

Al orquestar el plugin dev-team (`/dev-team:start-project`) en este proyecto (ClinicaDental, frontend-only Angular 21 en SWA), tres ajustes de entorno fueron necesarios y NO son obvios:

1. **Modo PROSA, no workflow autónomo.** El workflow `construccion-visual.js` hardcodea agregar "CRM tracking (eventos open/scroll/CTA/heartbeat)" en el paso 4b — pero este cliente PROHIBIÓ todo tracking (REQ-258/272). Además el worktree isolation falla ("not in a git repository") porque el `git init` lo hace el DevOps en FASE 3.5, DESPUÉS del arranque de sesión, y el harness fija esa capacidad al inicio. Por eso FASE 4 y FASE 5 se corrieron en PROSA (el fallback documentado).

2. **Sub-testers SECUENCIALES, sin worktree.** Como el worktree no está disponible, lanzar los 3 sub-testers en paralelo corrompe el browser MCP compartido. Lanzarlos uno a la vez (flow → edge → visual), cada uno escribiendo directo en el árbol principal.

3. **Regresión con `--no-chunks` desde `e2e/`.** El `run-regression.sh` en modo chunked (default) falla en macOS: usa `sed` con `\s` (BSD sed no lo soporta), extrae mal los nombres de project y corre 0 tests. El `playwright.config.ts` vive en `e2e/` (no en la raíz). Comando que funciona: `cd e2e && REGRESSION_TESTS_DIR=tests bash <ruta>/run-regression.sh <abs-output> --no-chunks`. La suite completa tarda ~40-60 min (correr en background). Crear el dir de output ANTES (ej. `output/iterations/iteration-N/`) o el script no escribe el reporte.

**Why:** sin estos ajustes la construcción aborta o reporta falsos negativos, y se pierde mucho tiempo re-descubriéndolos en cada iteración.
**How to apply:** en una futura ronda de Enhancement sobre este proyecto, arrancar directo en modo PROSA, correr la regresión con `--no-chunks`, y lanzar sub-testers secuenciales. Ver [[clinica-dental-prng-seed-drift]] para la otra lección recurrente.
