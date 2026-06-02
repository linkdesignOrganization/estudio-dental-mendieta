# Plan de Distribución — QA Team · Iteración 1 (Fundación)

> Generado por el QA Orchestrator en MODO PLAN (paso 5e-plan).
> Leído por el Flow Tester vía Auto-Dispatch. Edge Case y Visual Checker NO tienen asignación esta ronda (ver más abajo).

## Contexto de Testing
- Iteración: 1 (Fundación)
- Ronda: 1
- URL del sitio desplegado: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- URL del backend (si aplica): N/A — frontend-only, estado en `localStorage` (`edm:v1:state`)
- Total criterios esta iteración: REQ-001..058 (+ reset REQ-264..266, transversal REQ-247/248/250/251, anti-patrones REQ-257/258/272) — la Iteración 1 (Fundación) fue mayormente AUDITORÍA de la base construida en Fase 4
- Criterios nuevos a testear (gaps corregidos en esta iteración SIN test dedicado): **2** (REQ-057, REQ-058)
- Criterios a re-testear (fallaron en ronda anterior): 0 (es Ronda 1 de Iteración 1)

### Naturaleza de esta iteración (leer antes de testear)
La Fundación (login, shell, header, sidebar, footer, routing multi-pantalla, persistencia localStorage, seed dinámico desde fotos, volúmenes mínimos, reset, feedback transversal, anti-patrones) **YA fue construida y testeada en Fase 4 (Construcción Visual)**. Existen **24 archivos `.spec.ts` / 480 tests** que cubren estos criterios y están **VERDES en regresión** (ver sección Regresión Automatizada). Por eso esta ronda asigna trabajo manual SOLO a los **2 gaps** que el Developer corrigió en esta iteración y que **no tienen aserción dedicada** en la suite existente. Todo lo demás se marca **PASA (automatizado)** en el qa-report.

---

## Asignación: Flow Tester → e2e/tests/flow/

### Criterios asignados
- **REQ-057**: el seed incluye exactamente **6 profesionales** con nombres / especialidades / años de experiencia **EXACTOS** del brief.
- **REQ-058 (sub-aspecto thumbnails)**: el tab **Documentos** de un paciente con documentos renderiza **thumbnails reales** (no rotos) del pool de imágenes. (Los volúmenes numéricos de REQ-058 —≥50 turnos, ≥40 tratamientos, 40–60 docs, ≥20 presupuestos, ≥25 facturas, etc.— YA están cubiertos por `UX-064`/`UX-065` en `UX-060-067-seed.spec.ts`; NO los re-testees. El único aspecto SIN cobertura dedicada es que los thumbnails del tab Documentos sean imágenes reales con `naturalWidth>0`.)

### Por qué SOLO estos 2 (gap-analysis — no re-cubrir lo verde)
La suite existente `e2e/tests/flow/UX-060-067-seed.spec.ts` ya asserta **conteos** del seed pero NO la **corrección exacta** de los 2 datos que el Developer corrigió en esta iteración:
- `UX-063` asserta únicamente `professionals.length === 6` → **no** verifica los 6 nombres exactos, **ni** las especialidades, **ni** los años (12/18/8/15/7/10). En toda la suite, los años no se assertan en ningún lado, y **Salinas** y **Béccar Varela** no se referencian en ningún test (los otros 4 aparecen solo incidentalmente como labels de dropdown en `UX-020-032-critical-flows.spec.ts`, sin validar el set completo ni especialidad+años). → **REQ-057 sin aserción dedicada.**
- `UX-064` asserta únicamente `documents.length` entre 40 y 60 (en localStorage) → **no** verifica que los thumbnails del **tab Documentos** rendericen como imagen real. Los checks de "imagen no rota" existentes corren sobre la **lista de pacientes / avatares** (`UX-048`, `DC-055/078`), NO sobre la grilla de Documentos. Los tests del tab Documentos que existen solo cubren el **empty-state** (`DC-110` con `pac-007`) y la **navegabilidad** (`UX-routes-navigability` con `pac-003`). → **REQ-058/thumbnails sin aserción dedicada.**

Estos 2 gaps fueron **confirmados a nivel de fuente por el plan-verifier** (verification-5a.md, §"Notas para QA"), que recomendó explícitamente blindarlos en la suite de regresión.

### Instrucciones específicas
- **URL base**: https://happy-coast-044ea7e0f.7.azurestaticapps.net (testear SIEMPRE contra el sitio desplegado, NUNCA localhost).
- **Helpers a reutilizar**: `e2e/tests/_helpers/seed.ts` ya expone `gotoApp(page, path)`, `warmSeed(page)` y `readState(page)` (lee `localStorage['edm:v1:state']`). Sigue el patrón de `UX-060-067-seed.spec.ts`.
- **Nuevo archivo sugerido**: `e2e/tests/flow/REQ-057-058-seed-fundacion.spec.ts` (NO modifiques `UX-060-067-seed.spec.ts`; agregá un archivo nuevo para los 2 gaps). Estos `.spec.ts` deben quedar en la suite de regresión para rondas/iteraciones futuras.

- **REQ-057 — aserción exacta de los 6 profesionales** (leer `readState(page).professionals` y verificar el set completo; el ORDEN no importa, el contenido sí):

  | Nombre | Especialidad | Años |
  |---|---|---|
  | Dra. Carolina Etcheverry | Ortodoncia | 12 |
  | Dr. Martín Aguilera | Endodoncia | 18 |
  | Dra. Soledad Russo | Odontología general | 8 |
  | Dr. Juan Pablo Acuña | Implantología | 15 |
  | Dra. Laura Béccar Varela | Estética dental | 7 |
  | Dr. Federico Salinas | Odontopediatría | 10 |

  - Verificá que `professionals.length === 6` y que cada tupla (nombre, especialidad, años) aparece exactamente una vez. Cuidá los acentos (Martín, Acuña, Béccar) y los caracteres exactos del nombre del campo del estado.
  - Verificá también el **runtime**: en la ficha de un paciente, el header muestra "Profesional de cabecera: {uno de los 6}". Por ejemplo `/pacientes/pac-001/informacion` muestra "Dr. Federico Salinas" (dato confirmado en infrastructure-setup.md); usá el nombre que el estado asigne a ese paciente, no lo hardcodees a ciegas.

- **REQ-058 (thumbnails) — el tab Documentos renderiza imágenes reales (no rotas)**:
  - Elegí un paciente **que SÍ tenga documentos** (NO `pac-001`/`pac-007`, que NO tienen y muestran el empty-state controlado — eso es por diseño, no es bug). **`pac-002` (Mateo Gómez) SÍ tiene documento** (confirmado en infrastructure-setup.md). Si querés robustez, derivá del estado un `patientId` cuyo `documents` no esté vacío en vez de hardcodear.
  - Navegá a `/pacientes/{id}/documentos` y verificá que la grilla muestra al menos un `<img>` de thumbnail con `naturalWidth > 0` (imagen real cargada, no rota). Patrón anti-imagen-rota: `el.complete && el.naturalWidth === 0 && !!el.getAttribute('src')` debe dar **0** sobre los thumbnails del tab.
  - Los thumbnails reales son SVG autoalojados del pool de 15 (`/imagenes/documentos/foto-*.svg` y `radiografia-*.svg`), servidos con `image/svg+xml`. Basta con que `naturalWidth>0` confirme que cargan; no hace falta validar el content-type a nivel HTTP (eso ya lo verificó DevOps en el deploy).
- **GIF obligatorio**: grabá un GIF corto del recorrido que evidencia el gap (ficha → header con profesional de cabecera, y tab Documentos con thumbnails cargados).

---

## Asignación: Edge Case Tester → e2e/tests/edge-case/

### Criterios asignados
- **Ninguno esta ronda.**

### Justificación
Los criterios edge-case de la Fundación (degradación sin localStorage REQ-040, deep-link de rutas inexistentes REQ-031/126, confirmaciones destructivas REQ-027/075/114/265, límites de paginación REQ-103, estado terminal de turno REQ-076, estados vacíos REQ-066/095/105/130/145/152/158/165/187) ya tienen `.spec.ts` dedicados (`UX-091-degradacion-sin-localstorage`, `UX-017-rutas-inexistentes-deeplink`, `UX-088-031-confirmaciones-destructivas`, `UX-043-paginacion-limites`, `UX-049-DC-104-turno-terminal`, `UX-041-052-estados-vacios`) y están **VERDES en la regresión de 480 tests**. No hay edge cases nuevos introducidos por los 2 gaps de esta iteración. → Estos criterios se marcan **PASA (automatizado)** en el qa-report; no se relanza este sub-tester.

---

## Asignación: Visual Checker → e2e/tests/visual/

### Criterios asignados
- **Ninguno esta ronda.**

### Justificación
Los gaps de esta iteración (REQ-057 nombres de profesionales, REQ-058 thumbnails reales) son de **corrección de datos del seed**, verificables vía estado + render funcional (asignados al Flow Tester), NO cambios de diseño visual / tokens / responsive. El cumplimiento visual de la Fundación (tokens DC-xxx, layout del shell, tipografía, componentes, estados UI, feedback, responsive, brief compliance BVC/NFR) ya tiene cobertura dedicada (`DC-001-029-design-tokens`, `DC-030-035-layout-shell`, `DC-015-018-typography`, `DC-050-077-components`, `DC-080-089-responsive`, `DC-100-119-ui-states`, `DC-120-143-feedback`, `BVC-NFR-brief-compliance`, `DC-021-071-072-073-known-bugs`) y está **VERDE en regresión**. → Estos criterios se marcan **PASA (automatizado)**; no se relanza este sub-tester.

### BVC-xxx asignados (Brief Verification Criteria)
- Ninguno nuevo esta ronda (los BVC/NFR de la Fundación están en `BVC-NFR-brief-compliance.spec.ts`, verde en regresión).

---

## Regresión Automatizada (lee de regression-results.md)
- Resultado de `npx playwright test e2e/tests/`: **479 passed, 1 failed, 4 skipped** (última corrida 2026-06-02T10:47:51).
- **Estado real: VERDE (efectivamente 480/480).** El único fallo (`UX-022: avanzar estado del turno confirmado → atendiendo persiste`, en `UX-020-032-critical-flows.spec.ts`) fue diagnosticado como **flaky** (condición de carrera del wizard, **NO bug**) y **ESTABILIZADO** por el flow-tester (12 corridas verdes + archivo completo 20/20 — ver `flow-ux022.md`). **NO se re-asigna UX-022.**
- **Criterios verificados por automatización (PASA automatizado — NO asignar a sub-testers)**: prácticamente TODA la Fundación — REQ-001..056, REQ-058 (volúmenes numéricos), reset REQ-264..266, persistencia REQ-032..041, routing REQ-029..031, seed dinámico REQ-042..055, feedback transversal REQ-247/248/250/251, anti-patrones REQ-257/258/272. Cubiertos por los 24 `.spec.ts` (`UX-*`, `DC-*`, `BVC-NFR-*`).
- **Criterios con regresión detectada (ya corregidos por Developer antes de esta ronda)**: ninguno. (El re-deploy `6fcc2df` corrigió la regresión de saldos del seed —PRNG separado para thumbnails— y la regresión re-corrió verde salvo el flaky UX-022 ya estabilizado.)

---

## Criterios Pendientes de Testing Manual
- **Total criterios que requieren sub-testers esta ronda: 2** (ambos al Flow Tester).
- Criterios FALLARON en ronda anterior (re-verificar fix): ninguno (Ronda 1).
- Criterios DESBLOQUEADOS (antes bloqueados por bug, ahora testeables): ninguno.
- **Criterios nuevos sin test automatizado (gaps corregidos en esta iteración)**:
  - **REQ-057** — 6 profesionales con nombres/especialidades/años EXACTOS del brief → Flow Tester (generar `.spec.ts` dedicado).
  - **REQ-058 (thumbnails)** — tab Documentos renderiza thumbnails reales (no rotos) → Flow Tester (generar `.spec.ts` dedicado).
