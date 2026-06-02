# Verificación Post-QA — Construcción Visual (paso 4f-verify) · Modo NORMAL

> Verificación INDEPENDIENTE de cobertura (completeness) por el Plan Verifier.
> No re-ejecuta la suite (la regresión dio exit 0 / 396 passed). Verifica que cada criterio
> de la demo tiene **test automatizado (.spec.ts)** que lo respalda — no basta "PASA" en prosa.
> Fuentes de verdad: `architecture.md` (DEMO-xxx), `design-criteria.md` (DC/BVC), `ux-criteria.md` (UX).
> Catálogo de tests: 21 `.spec.ts` en `e2e/tests/{flow,edge-case,visual}/` (163 bloques `test()`).

## Método
- Extracción del catálogo de criterios desde los 3 documentos de verdad.
- Grep de cada ID en el código real de los `.spec.ts` (no en los reportes de prosa del QA).
- Reconocimiento de **tests por rango** (un `test()` con título `DC-001..005` asserta DC-001..005 individualmente con `expect`). Se contabiliza la cobertura por rango, no solo por ID literal.
- Lectura completa de los specs de los 2 flujos críticos, BVC-027, tokens, shell, componentes, responsive, known-bugs, layout.
- Verificación de `test.fixme`/`.only`/`.skip` en el árbol de tests.

---

## 1. Los 21 DEMO-xxx — TODOS con cobertura de test ✓

Los 2 flujos críticos están plenamente automatizados con verificación de **persistencia real**; el resto de DEMO-xxx tiene cobertura vía sus UX-xxx/DC-xxx en specs.

- **DEMO-015 (crear turno)** → `flow/UX-020-032-critical-flows.spec.ts`: `UX-020` crea turno 3 pasos, navega a `/agenda/tur-*`, estado "Confirmado", **persiste** (`readState()` lee localStorage: `appointments.length === base+1`) **y** sobrevive `page.reload()` real (`UX-020/UX-084`). ✓ PERSISTENCIA VERIFICADA.
- **DEMO-016 (registrar pago)** → mismo archivo: `UX-026` registra pago en ruta dedicada `/pacientes/:id/pagos/nuevo`, recalcula `cobrado`/`saldo` con exactitud aritmética (`expect(saldoAfter).toBe(saldoBefore - monto)`), **persiste** tras `page.reload()` (`UX-026/UX-084` sobre pac-006). ✓ PERSISTENCIA VERIFICADA.
- DEMO-006/018 referenciados explícitamente en specs; el resto (DEMO-001..014, 017, 019..021) cubiertos transitivamente por los UX-xxx de navegación/routing/seed/interacciones que SÍ están en specs (UX-001..018, UX-060..067, UX-080..094) y por los DC de shell/componentes/responsive.

**Veredicto DEMO-xxx: 21/21 con cobertura de test automatizado.** ✓

## 2. Regla transversal BVC-027 (cero demo/mock + cero tracking) ✓

`visual/BVC-NFR-brief-compliance.spec.ts` — 3 tests dedicados, todos PASA en la regresión:
- Cero requests de tracking (regex de 25+ proveedores) en 4 rutas + cero SDKs de analytics en `window` (ga/gtag/dataLayer/fbq/Sentry/…).
- Cero lenguaje demo/mock (`demo|mock|viewcase|linkdesign|portfolio|lorem ipsum`) en 9 rutas incl. login y ruta basura.
- Sin ARCA/AFIP/CAE en las 3 rutas de facturación.

**Veredicto BVC-027: cubierto por test automatizado y PASA.** ✓

## 3. Los 4 tests "skipped" — son N/A condicionales, NO fixmes de bug ✓ (con observación)

`grep` del árbol completo de tests:
- **`test.fixme`: 0 ocurrencias.** **`.only`: 0.** → No queda NINGÚN gate de bug sin re-activar. Los `test.fixme` de BUG-V01/V04/V05 de rondas previas fueron re-activados (hoy son `test()` normales en `DC-015-018-typography.spec.ts` y `DC-021-071-072-073-known-bugs.spec.ts`).
- Los `test.skip` que existen son **6 skips condicionales en runtime** (no estáticos), que producen los 4 skipped según seed/viewport:
  - `UX-049-DC-104` :45 `skip(!terminal)` · :64 `skip(!activo)` — saltan solo si el seed no tiene turno terminal/activo.
  - `UX-088-031` :64 `skip(!activo)` — ídem.
  - `UX-routes-navigability` :74 `skip(!ev)` — salta si pac-003 no tiene evento.
  - `UX-001-018` :259 + `UX-093` :11 `skip(project !== 'mobile-chromium')` — tests mobile-only (corren en mobile, skip en desktop).

**Veredicto: NINGÚN `test.fixme` de bug pendiente.** ✓ La sustancia de la regla #3 se cumple.

> **OBSERVACIÓN (defecto de documentación, NO bloqueante):** el `qa-report.md` (líneas 28, 72, 121, 184) justifica los 4 skipped como *"N/A de seguridad server-side: inyección SQL / auth-bypass / sanitización"*. **Esa justificación es incorrecta** — NO existe ningún test de seguridad server-side en la suite; los skips reales son seed-condicionales y viewport-condicionales (arriba). La conclusión del QA (los skips no son fixmes pendientes) es correcta, pero el motivo declarado no matchea el código. Recomendación: corregir la narrativa del qa-report para que describa los skips reales. Apéndase a `pending-feedback.md` para el QA Orchestrator.

## 4. Cobertura por catálogo — criterios CON .spec.ts (por rango)

- **DC tokens 001..029** — `DC-001-029-design-tokens.spec.ts` + `DC-015-018-typography.spec.ts`: paleta, neutros, semánticos, tipografía Red Hat/pesos, escala, spacing, sombra, radius, motion, focus, overrides BS, GAP-A04. ✓
- **DC shell 030..035, 050, 052** — `DC-030-035-layout-shell.spec.ts`. ✓
- **DC componentes 053, 055, 056, 063, 064, 071, 072, 073, 074, 076, 078** — `DC-050-077-components.spec.ts` + `DC-021-071-072-073-known-bugs.spec.ts`. ✓
- **DC responsive 080..084, 088** — `DC-080-089-responsive.spec.ts`. ✓
- **DC edge-states 104, 112, 126** — `edge-case/`. ✓
- **UX**: 61 de 70 referenciados/cubiertos en flow+edge (navegación 001..018, flujos 020..032, seed 060..067, interacciones/persistencia 080..094, edge 041..054). ✓
- **BVC**: 21 de 29 con assertion dedicada. ✓
- **NFR**: 001..004, 006..009, 013, 020, 023 con assertion. ✓

## 5. Criterios SIN .spec.ts — solo "PASA" en prosa (gap de la regla #1)

La regla #1 del gate exige `.spec.ts` por criterio; "NO basta PASA en prosa". El grep del código revela que el QA marcó como PASA (vía inspección visual / cobertura transitiva) criterios que **no tienen assertion automatizada propia**:

### 5a. Bloque DC-100..143 — "5 estados de UI por pantalla" (gap principal)
El `visual-results.md` lo admite (línea 106): *"DC-100..119 → PASA (visual; comportamiento lo cubre Flow/Edge)"*. Solo **3 de ~37** tienen `.spec.ts` (DC-104, DC-112, DC-126). **Sin assertion automatizada:**
`DC-100, 101, 102, 103, 105, 106, 107, 108, 109, 110, 111, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131, 132, 133, 140, 141, 142, 143` (29 criterios).
> Naturaleza: son **descriptores de ASPECTO de estados** (empty/skeleton/error/loading/toast por pantalla). El COMPORTAMIENTO de varios de estos estados SÍ está automatizado en Flow/Edge (empty-states `UX-041..052`, paginación `UX-043`, no-encontrado `UX-017/DC-126`, disabled-en-inválido `DC-112`, estado terminal `DC-104`, skeleton/notificaciones vía `UX-040`/`UX-092`). El faltante es la verificación AUTOMATIZADA del aspecto (skeleton vs spinner, placeholder por campo vacío, toasts semánticos con `aria-live`) — hoy descansa en screenshots manuales.

### 5b. DC intermedios "en rango" no asertados individualmente
Nominalmente dentro de títulos de rango (DC-036..049 shell, DC-050..077 componentes, DC-080..089 responsive) pero sin `expect` propio:
`DC-036, 037, 038, 039, 042, 044, 045, 046, 047, 048, 049, 051, 054, 057, 058, 059, 060, 061, 062, 065, 066, 067, 068, 070, 075, 077, 085, 086, 087, 089`.
> Varios fueron verificados visualmente (el `visual-results.md` los lista: DC-036/040/041/043/047/048/049 con screenshot). El gap es de automatización, no necesariamente de verificación.

### 5c. UX sin .spec.ts (9)
`UX-023` (cancelar turno), `UX-024` (crear paciente 2 pasos), `UX-025` (editar paciente), `UX-029` (crear presupuesto 3 pasos), `UX-030` (aprobar presupuesto), `UX-033` (eliminar paciente), `UX-040` (skeletons de carga transversal), `UX-042` (toast de error transversal), `UX-053` (reportes datos calculados / vacío por gráfico).
> Son flujos multi-paso y estados transversales (DEMO-007/008/009/013/017/018). Algunos comparten DEMO con UX ya cubiertos, pero el flujo específico (stepper crear/editar/eliminar paciente, crear/aprobar presupuesto) NO tiene test propio.

### 5d. BVC sin assertion dedicada (8)
`BVC-010, 014, 016, 019, 023, 028, 029` (+ `BVC-015` se cubre vía DC-021 disabled). Mayormente subjetivos/visuales ("calma profesional", "aire comunica orden", iconografía Phosphor) — verificados en `visual-results.md` como subjective/visual.

---

## Scope Creep (elementos de test sin criterio asociado)
- Ninguno. Todos los IDs referenciados en specs existen en los documentos de verdad (la comparación inversa UX/DC/BVC spec→catálogo dio 0 IDs inexistentes).

---

## Síntesis

| Regla del gate | Resultado |
|---|---|
| #1 Cada criterio de demo con `.spec.ts` (no prosa) | **PARCIAL** — los 21 DEMO + flujos críticos + BVC-027 ✓; pero ~29 DC del bloque 100..143, ~30 DC intermedios, 9 UX y 8 BVC sin assertion automatizada propia |
| #2 Sin criterios sin cubrir ni bloqueados | Bloqueados: 0 ✓. "Sin cubrir por automatización": ver #1 |
| #3 4 skipped son N/A (no fixmes de bug) | **PASA** ✓ — 0 `test.fixme`, 0 `.only`; skips son seed/viewport-condicionales (motivo del qa-report mal documentado, no bloqueante) |
| #4 BVC-027 con test y PASA | **PASA** ✓ |
| #5 2 flujos críticos verifican persistencia | **PASA** ✓ — `readState()` + `page.reload()` real en ambos |

## Resultado: FALLA (regla #1 — ~76 criterios de demo con "PASA" en prosa sin .spec.ts propio)

Los 5 puntos explícitos que el PM pidió confirmar (21 DEMO, flujos críticos, BVC-027, 4 skipped) **están todos satisfechos**. El FALLO es estrictamente por la regla #1 del gate de Fase 4 ("100% criterios con test automatizado"): un subconjunto material de criterios de aspecto/estado (sobre todo el bloque DC-100..143 de los 5 estados de UI por pantalla, más flujos UX multi-paso) descansa en verificación visual/transitiva, sin assertion `.spec.ts` propia. El QA debe generar tests automatizados para esos criterios (o el PM/QA debe re-clasificar formalmente cuáles son N/A-automatización con justificación explícita por criterio).
