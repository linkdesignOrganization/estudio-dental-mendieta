# Resultados — Edge Case Tester · Iteración 4 (Pacientes escritura + Tratamientos) · Ronda 1

> Testing contra el SITIO DESPLEGADO: https://happy-coast-044ea7e0f.7.azurestaticapps.net
> Suite ejecutada con `npx playwright test` desde `e2e/` en ambos projects (desktop-chromium + mobile-chromium), workers=1, fullyParallel=false.
> Reusa `e2e/playwright.config.ts` y los helpers `e2e/tests/_helpers/seed.ts` (gotoApp, resetSeed, readState, STATE_KEY).

## Resumen
- **Criterios asignados**: 7 → **REQ-176, REQ-175, REQ-179, REQ-177, REQ-195, REQ-199, REQ-200**. Todos **PASAN**.
- **Bugs encontrados**: 0. En particular, **el fix de seguridad de la foto (REQ-175/179) PASA** — NO hay bug de seguridad.
- **Tests nuevos**: 5 archivos `.spec.ts` en `e2e/tests/edge-case/` → **72 tests nuevos** (verde en ambos projects).
- **Estabilidad**: corrida completa de `tests/edge-case/` (incluye los nuevos + los previos) = **218 passed / 2 skipped / 0 failed**, sin retries ni flaky. Los 2 skips son `test.skip` intencionales (mapeo de href de cards solo desktop; 1 skip previo del repo).

## Resultados por Criterio
| Criterio | Estado | Input/Condición | Evidencia |
|----------|--------|-----------------|-----------|
| REQ-176 | PASA | DNI inválido (3 díg., letras, 9 díg., vacío) bloquea "Siguiente" + error inline "Ingresá un DNI válido." junto al campo; 7/8 díg. y "30.123.456" avanzan; corrección en vivo desbloquea | `e2e/tests/edge-case/REQ-176-dni-formato-validacion.spec.ts` — 20/20 (10×2 projects) |
| REQ-175 | PASA (seguridad OK) | SVG con `<script>` (image/svg+xml) RECHAZADO con toast "Formato no admitido…"; archivo 2.1 MB RECHAZADO con toast "La imagen supera los 2 MB…"; no previsualiza; `<script>` NO se ejecuta; reintento tras rechazo funciona (input se limpia) | `e2e/tests/edge-case/REQ-175-179-foto-validacion-seguridad.spec.ts` |
| REQ-179 | PASA | Raster PNG 1×1 válido ACEPTADO → previsualiza data URL + persiste `fotoPath` data:image/…; SVG rechazado NO persiste (paciente creado queda con `fotoPath` vacío); sin foto → iniciales (sin imagen rota) | `e2e/tests/edge-case/REQ-175-179-foto-validacion-seguridad.spec.ts` — 16/16 (8×2 projects) |
| REQ-177 | PASA | "Cancelar" con datos (Paso 1 o Paso 2) → diálogo "Tenés datos cargados. ¿Querés descartar y salir?"; "Seguir editando" conserva; "Sí, descartar" → /pacientes + wizard limpio; sin datos sale directo; "Atrás" preserva Paso 1 (ida/vuelta repetida) | `e2e/tests/edge-case/REQ-177-cancelar-confirmacion-atras-preserva.spec.ts` — 16/16 (8×2 projects) |
| REQ-195 | PASA | Filtro de tratamientos sin resultados → empty-state "No hay tratamientos activos con este criterio" + guidance "Ajustá el filtro o creá un nuevo plan…", sin tabla ni crash; recuperable con "Todos"; control positivo: filtro con planes muestra filas | `e2e/tests/edge-case/REQ-195-tratamientos-filtro-vacio.spec.ts` — 8/8 (4×2 projects) |
| REQ-199 | PASA | Catálogo renderiza 15 cards (≥12), conteo UI == estado, subtítulo "15 tipos en el catálogo"; cada card con nombre + costo ARS + duración | `e2e/tests/edge-case/REQ-199-200-catalogo-tipos-cards.spec.ts` |
| REQ-200 | PASA | Click en card navega a `/tratamientos/tipos/:id` (detalle del tipo correcto, paramétrico por id); href de las 15 cards mapean 1:1 a los ids del estado, sin duplicados ni enlaces rotos | `e2e/tests/edge-case/REQ-199-200-catalogo-tipos-cards.spec.ts` — 11 passed + 1 skip intencional (12 = 6×2 projects) |

## Bugs Encontrados
**Ninguno.** El fix de seguridad de la foto del paciente (REQ-175/179), foco crítico de esta ronda, **funciona correctamente**:
- La validación es client-side y ocurre ANTES de persistir (`onPhoto` en `patient-create.component.ts`).
- SVG (`image/svg+xml`) se rechaza por la allowlist raster (`image/jpeg|png|webp|gif`) → no es persistible como data URL → vector XSS cerrado. Verificado además que el `<script>` embebido del SVG NO se ejecuta (`window.__xss_executed` queda `false`).
- Archivos > 2 MB (`MAX_PHOTO_BYTES = 2 * 1024 * 1024`) se rechazan por tamaño → protege la cuota de localStorage.
- Ambos rechazos muestran toast de error con copy de producción y NO previsualizan/persisten la foto inválida (el paciente creado queda con `fotoPath` vacío → fallback a iniciales).

## Observaciones (no-bug, informativas para el PM/QA-Orchestrator)
- **REQ-195 — empty-state inalcanzable por el seed virgen**: los planes de tratamiento se asignan al profesional de cabecera del paciente y, en el seed determinista, **los 6 profesionales (prof-01..prof-06) tienen ≥1 plan activo**. Por eso el dropdown de filtro, sobre el seed virgen, NUNCA cae en el empty-state por sí solo (verificado en vivo: Aguilera y Acuña, los menos cargados, tienen 3 planes activos cada uno). Para ejercer la rama del estado vacío de forma DETERMINISTA, el spec marca temporalmente como `completado` todos los planes activos de un profesional en localStorage, recarga (el store re-hidrata el persistido, no regenera) y filtra → empty-state; luego `resetSeed` restaura el seed virgen. Esto valida el COMPORTAMIENTO del estado vacío sin depender de datos que no se dan en el seed. No es un bug del producto, pero conviene que el PM lo sepa: en uso real con esta semilla, el usuario solo verá ese empty-state al completar todos los tratamientos de un profesional.
- **Copy anti-demo (REQ-272 transversal)**: todos los estados vacíos, errores inline, toasts y diálogos verificados NO contienen lenguaje de demo/mock (demo/mock/simulado/de prueba/ficticio/viewcase/lorem ipsum/link design).

## Tests Generados (escritos en disco)
- `e2e/tests/edge-case/REQ-176-dni-formato-validacion.spec.ts`
- `e2e/tests/edge-case/REQ-175-179-foto-validacion-seguridad.spec.ts`
- `e2e/tests/edge-case/REQ-177-cancelar-confirmacion-atras-preserva.spec.ts`
- `e2e/tests/edge-case/REQ-195-tratamientos-filtro-vacio.spec.ts`
- `e2e/tests/edge-case/REQ-199-200-catalogo-tipos-cards.spec.ts`

## Comando de verificación
```
cd e2e && npx playwright test tests/edge-case/   # 218 passed / 2 skipped / 0 failed (ambos projects)
```
