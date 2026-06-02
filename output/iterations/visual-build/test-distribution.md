# Plan de Distribución — QA Team

> Generado por el QA Orchestrator en MODO PLAN. Lo leen los sub-testers (Flow, Edge Case, Visual) vía Auto-Dispatch.
> Fase: **Construcción Visual (FASE 4)** · **RONDA 2** (re-QA tras corrección de los 7 bugs de la Ronda 1).

## Contexto de Testing
- Iteración: visual-build (Fase 4)
- **Ronda: 2**
- URL del sitio desplegado: **https://happy-coast-044ea7e0f.7.azurestaticapps.net**
- URL del backend (si aplica): N/A (frontend-only, sin Functions)
- Total criterios esta iteración: 233 (47 UX + 28 edge/NFR-routing + 158 DC/BVC/NFR)
- **Criterios a re-testear esta ronda (los 9 fallos de la regresión): 9** (8 criterios distintos; UX-045 falló en 2 proyectos)
- Criterios marcados PASA (automatizado) por la regresión (NO se re-testean): **367 tests pasaron**

> **Estado del re-deploy (verificado por DevOps en infrastructure-setup.md):** los 7 bugs de la Ronda 1 fueron corregidos y re-desplegados (commit `41a7d9b`, run `26799504393` success, ~1m53s). El sitio sirve los fixes. **BUG-V01 (CRÍTICO/raíz) verificado RESUELTO en prod**: `index.html` sin `media="print"`/`onload`; la hoja del DS aplica en pantalla (`appliesToScreen=true`, 593 reglas activas), `.btn-edm--primary` computa `#6da8d4` azul / radius 12px / `Red Hat`. La causa raíz era `inlineCritical` (default del builder `application`); el fix fue `inlineCritical: false` en `angular.json`.

> **IMPORTANTE — Testeo contra el sitio DESPLEGADO, NUNCA localhost.** El PM ya pusheó los fixes y esperó el deploy (paso 4e) antes de esta ronda. Todo el testing va contra la URL de Azure SWA de arriba.

> **REGLA DE ROL (todos los sub-testers):** ustedes NO arreglan bugs ni modifican código de la app. Para los tests OBSOLETOS/desalineados (UX-045, DC-076, y los 6 de mobile) ustedes SÍ deben ACTUALIZAR el `.spec.ts` para que refleje el comportamiento correcto YA corregido / el layout mobile real. Si tras actualizar el test correctamente el flujo REALMENTE no funciona, entonces es BUG REAL → repórtenlo para el Developer (NO lo corrijan). **GIF obligatorio** de cada flujo que ejerzan. Escriban su resultado en `output/iterations/visual-build/{flow-tester,edge-case-tester,visual-checker}-results-ronda-2.md`.

---

## Asignación: Flow Tester → e2e/tests/flow/

### Criterios asignados (6) — los 6 fallos SOLO en mobile (todos ~19s = TIMEOUT)
- **UX-003**: los items del sidebar navegan a sus rutas. (`tests/flow/UX-001-018-navigation-routing.spec.ts:46`, mobile-chromium, timeout 18.2s)
- **UX-008**: fila de paciente navega a la ficha y redirige a `/informacion`. (`tests/flow/UX-001-018-navigation-routing.spec.ts:116`, mobile-chromium, timeout 19.1s)
- **UX-015**: botón atrás regresa de la ficha a la lista. (`tests/flow/UX-001-018-navigation-routing.spec.ts:198`, mobile-chromium, timeout 19.1s)
- **UX-027**: el badge de estado de cuenta es coherente con el saldo tras el pago. (`tests/flow/UX-020-032-critical-flows.spec.ts:163`, mobile-chromium, timeout 19.1s)
- **UX-067**: edge cases representados en el seed. (`tests/flow/UX-060-067-seed.spec.ts:99`, mobile-chromium, timeout 19.2s)
- **UX-080**: el buscador de pacientes filtra en vivo por nombre. (`tests/flow/UX-080-094-interactions-persistence.spec.ts:15`, mobile-chromium, timeout 19.1s)

> Estos 6 PASAN en desktop-chromium (siguen contando como PASA automatizado en desktop) — el fallo es exclusivo de mobile-chromium.

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **Diagnóstico de la causa (del PM):** los 6 fallan SOLO en **mobile-chromium por TIMEOUT (~19s)**, pero PASAN en desktop. La causa probable es que los tests asumen **layout DESKTOP** (sidebar con items visibles, buscador en su posición desktop) pero en **mobile el sidebar es un DRAWER cerrado** y los selectores no encuentran sus targets → el locator/`expect` espera hasta agotar el timeout. NO es BUG-V01 (ya resuelto) ni un fallo de desktop.
- **Protocolo para CADA uno de los 6 (en mobile REAL contra el sitio desplegado, viewport mobile-chromium del `playwright.config.ts`):**
  1. Navegá el flujo a mano en mobile: abrí el **drawer** (botón hamburguesa) cuando el flujo dependa del sidebar (UX-003, y la navegación a la ficha en UX-008/UX-015/UX-027); ubicá el **buscador** en su posición mobile (UX-080); verificá la representación del seed en la vista mobile (UX-067).
  2. **Determiná cuál de los dos casos es:**
     - **(a) El flujo SÍ funciona en mobile**, pero el test no lo ejerce bien (asume layout desktop) → **ADAPTÁ el `.spec.ts`**: abrir el drawer antes de clickear items del sidebar, usar selectores/roles mobile, esperar la apertura del drawer, etc. El test adaptado debe PASAR en mobile-chromium **y seguir pasando en desktop-chromium** (no rompas el caso desktop — usá condicionales por viewport o un helper "abrir nav" que funcione en ambos). Tras adaptar, el criterio → **PASA**.
     - **(b) El flujo NO funciona en mobile** (el drawer no abre, el item no navega, el buscador no filtra, el botón atrás no regresa, etc.) → es **BUG REAL**. El cliente **EXIGE que TODOS los flujos sean usables en mobile** (REQ responsive — ver UX-018/UX-093/DC-080..089). NO lo arregles: reportá BUG-Fxx con pasos, esperado vs actual, severidad y evidencia (screenshot/GIF). El criterio → **FALLA**.
- **Flujos E2E prioritarios en mobile:** abrir/cerrar drawer y navegar desde él (UX-003); fila de paciente → ficha → redirección a `/informacion` (UX-008); botón atrás ficha→lista (UX-015); coherencia del badge de estado de cuenta tras registrar un pago (UX-027 — toca el flujo crítico de saldo); buscador filtrando en vivo (UX-080).
- **GIF obligatorio** de al menos: el drawer mobile navegando (UX-003) y el buscador filtrando en mobile (UX-080). Si encontrás un BUG real, GIF del fallo.
- Contexto del seed para UX-067 (ya validado en Ronda 1 en desktop): 29 pacientes (12H+17M), incluye edge cases (paciente con saldo deudor vs al día, paciente sin documentos, boca sana vs con tratamientos, turnos en 5 estados, `pac-001` con edad extrema). Verificá que esos edge cases del seed son visibles/representados en la **vista mobile**.

---

## Asignación: Edge Case Tester → e2e/tests/edge-case/

### Criterios asignados (1) — fallo en desktop + mobile (test OBSOLETO tras fix de BUG-E03)
- **UX-045** (desktop + mobile): empty-state en la vista **Tarjetas** de la lista de pacientes cuando una búsqueda no tiene match. (`tests/edge-case/UX-041-052-estados-vacios.spec.ts:36`, desktop timeout 19.4s + mobile timeout 19.1s)

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **El test está OBSOLETO (del PM):** el test `tests/edge-case/UX-041-052-estados-vacios.spec.ts:36` afirma actualmente *"la vista de tarjetas sin match NO muestra empty-state (gap conocido BUG-E03)"* — es decir, codifica el GAP de la Ronda 1 como comportamiento esperado. Pero el Developer **YA corrigió BUG-E03**: agregó `@empty` con `EmptyStateComponent` a la vista Tarjetas. Por eso el test ahora falla (el empty-state SÍ aparece y el assert "NO aparece" revienta hasta timeout).
- **Tu tarea:** **ACTUALIZÁ el `.spec.ts`** para que verifique que **AHORA el empty-state SÍ aparece** en la vista Tarjetas cuando no hay match — igual que ya lo hace la vista Tabla (que era el control positivo en Ronda 1). Pasos a ejercer en el sitio desplegado:
  1. `/pacientes` → toggle **"Vista de tarjetas"** → escribí un término sin match (ej. `qqqnomatch`).
  2. Verificá que aparece el **empty-state con guidance** ("No encontramos pacientes con ese criterio" o copy equivalente), SIN lenguaje demo/mock, y que el contador es coherente.
  3. Hacé que el test PASE en desktop-chromium **y** mobile-chromium.
- **Si por algún motivo el empty-state NO aparece** en la vista Tarjetas (el fix no quedó bien) → entonces SÍ es bug: reportá BUG-Exx (re-apertura de BUG-E03) con evidencia. NO lo arregles. El criterio → **FALLA**.
- Si aparece correctamente → el criterio **UX-045 → PASA** y el test queda como gate de regresión para rondas futuras (criterio DESBLOQUEADO de la Ronda 1).
- **Edge cases anticipados:** verificá que la vista Tabla (control positivo) sigue mostrando su empty-state; verificá que el empty-state desaparece al limpiar la búsqueda (vuelve la grilla de tarjetas con el seed); coherencia del contador.
- GIF/screenshot del empty-state en la vista Tarjetas como evidencia.

> **Nota:** UX-041 también figuraba como afectado por BUG-E03 en la Ronda 1, pero su test pasó en la regresión (la rama Tabla cubre UX-041). Al cerrar UX-045 con el empty-state de Tarjetas, UX-041 queda completo. No requiere test nuevo aparte salvo que detectes una regresión.

---

## Asignación: Visual Checker → e2e/tests/visual/

### Criterios asignados (1) — fallo en desktop (timing del @defer tras fix de BUG-E04)
- **DC-076** (desktop): odontograma con **32 piezas FDI** (con `aria-label`) y **leyenda de 6 estados**. (`tests/visual/DC-050-077-components.spec.ts:172`, desktop-chromium, 5.0s)

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- Breakpoints: este criterio falló en **desktop**; verificá en desktop (≥992px). (El gap mobile de deep-link de BUG-E04 se cubrió por el lado funcional en la Ronda 1; aquí el foco es el render del odontograma.)
- **Cambio relevante (del PM):** para corregir **BUG-E04** (el odontograma no hidrataba por deep-link directo en mobile), el Developer cambió el bloque del odontograma de `@defer (on viewport)` a **`@defer (on idle)`**. Este cambio de estrategia de carga altera el **timing** de cuándo aparecen las 32 piezas → es la causa probable de que el test (que esperaba el patrón de `on viewport`, p.ej. un scroll-into-view) ahora falle en 5s.
- **Tu tarea — distinguí entre los dos casos:**
  1. Navegá a la pantalla del odontograma (ficha de paciente → tab Odontograma, ej. `/pacientes/pac-029/odontograma`) en desktop, en el sitio desplegado.
  2. Verificá **el render real**: ¿aparecen las **32 piezas** (numeración FDI, cada una con `aria-label`) y la **leyenda de 6 estados**?
     - **(a) Renderiza las 32 piezas correctamente** (solo cambió CUÁNDO aparecen, por el `@defer on idle`) → el test necesita **AJUSTE DE TIMING**: actualizá el `.spec.ts` para esperar al `@defer on idle` (esperar a que el contenedor del odontograma se pueble / `networkidle` / estado idle, en vez de forzar el scroll-into-view propio de `on viewport`). El test ajustado debe PASAR. Criterio **DC-076 → PASA**.
     - **(b) NO renderiza las 32 piezas** (o faltan piezas / falta la leyenda / faltan `aria-label`) tras esperar el idle razonablemente → es **BUG REAL de render**. NO lo arregles: reportá BUG-Vxx con counts (esperado 32, actual N), esperado vs actual y evidencia. Criterio **DC-076 → FALLA**.
- **Verificación de a11y del odontograma (parte de DC-076):** cada pieza con `aria-label` FDI; leyenda con los 6 estados legibles.
- Screenshot del odontograma con las 32 piezas + leyenda como evidencia.
- **NOTA — los `test.fixme` de BUG-V01/V04 NO son tu tarea esta ronda.** Los gates `test.fixme` de `DC-015-018-typography.spec.ts` y `DC-021-071-072-073-known-bugs.spec.ts` cuentan entre los 22 skipped de la regresión; su re-habilitación post-fix de BUG-V01/V04 la coordina el PM/Developer al re-correr la suite completa. No los toques en esta asignación salvo indicación explícita del PM.

### BVC-xxx asignados (Brief Verification Criteria)
| BVC-xxx | Criterio del Cliente | Tipo de verificación |
|---------|---------------------|---------------------|
| _(ninguno nuevo esta ronda)_ | Los BVC afectados por BUG-V01 (BVC-001, BVC-015, BVC-017, BVC-022) se re-verifican vía la regresión automatizada de los `test.fixme` re-habilitados (coordinada por el PM al re-correr la suite completa), no como asignación manual a sub-tester. BVC-027 (CRÍTICO, cero demo/tracking) PASÓ en Ronda 1 y no fue tocado por los fixes. | — |

---

## Regresión Automatizada (lee de regression-results.md)
- Resultado de `npx playwright test e2e/tests/` (single-run, 2026-06-02T02:46:39): **367 passed · 9 failed · 22 skipped** (exit 1).
- **Criterios verificados por automatización (PASA automatizado — NO asignar a sub-testers):** los 367 tests que pasaron cubren la inmensa mayoría de UX-xxx, DC-xxx, BVC-xxx y NFR-xxx (navegación/routing desktop, flujos críticos UX-020/UX-026 con persistencia tras refresh real, seed desktop, interacciones/persistencia, tokens de diseño, layout/shell, componentes salvo DC-076, responsive estructural, brief-compliance incl. **BVC-027 crítico**, NFR perf/a11y base). Estos NO se re-testean en la Ronda 2.
- **Los 22 skipped** son los `test.fixme` que encierran el comportamiento correcto esperado de BUG-V01/V04 (gates post-fix). Se re-habilitan y deben pasar al cerrar el ciclo — **coordinado por el PM al re-correr la suite completa tras esta ronda**, no asignados a sub-tester aquí.
- **Criterios con regresión detectada (los 9 fallos — ya corregidos por el Developer antes de esta ronda; se re-verifican manualmente esta ronda):**

  | # | Test | Proyecto | Causa probable | Sub-tester | Acción esperada |
  |---|------|----------|----------------|-----------|-----------------|
  | 1 | UX-045 (`edge-case/UX-041-052-estados-vacios.spec.ts:36`) | desktop + mobile | Test OBSOLETO: aserta el gap de BUG-E03 que YA se corrigió (vista Tarjetas ahora tiene `@empty`) | Edge Case | Actualizar test → verificar que el empty-state SÍ aparece |
  | 2 | DC-076 (`visual/DC-050-077-components.spec.ts:172`) | desktop | Timing del odontograma: `@defer (on viewport)` → `@defer (on idle)` (fix de BUG-E04) | Visual | Ajustar timing del test, o reportar bug de render si faltan piezas |
  | 3 | UX-003 (`flow/UX-001-018-navigation-routing.spec.ts:46`) | mobile (timeout 18.2s) | Test asume sidebar desktop; en mobile es DRAWER cerrado | Flow | Adaptar a mobile (abrir drawer) o reportar bug si no navega |
  | 4 | UX-008 (`flow/UX-001-018-navigation-routing.spec.ts:116`) | mobile (timeout 19.1s) | Layout mobile (drawer / navegación a ficha) | Flow | Adaptar a mobile o reportar bug |
  | 5 | UX-015 (`flow/UX-001-018-navigation-routing.spec.ts:198`) | mobile (timeout 19.1s) | Layout mobile (botón atrás ficha→lista) | Flow | Adaptar a mobile o reportar bug |
  | 6 | UX-027 (`flow/UX-020-032-critical-flows.spec.ts:163`) | mobile (timeout 19.1s) | Layout mobile (badge de saldo tras pago) | Flow | Adaptar a mobile o reportar bug |
  | 7 | UX-067 (`flow/UX-060-067-seed.spec.ts:99`) | mobile (timeout 19.2s) | Layout mobile (representación del seed) | Flow | Adaptar a mobile o reportar bug |
  | 8 | UX-080 (`flow/UX-080-094-interactions-persistence.spec.ts:15`) | mobile (timeout 19.1s) | Layout mobile (buscador en otra posición) | Flow | Adaptar a mobile o reportar bug |

  > Los criterios desbloqueados de la Ronda 1 (BUG-E03 → UX-045; BUG-E04 → DC-076) DEBEN quedar con `.spec.ts` que PASE, para entrar en la suite de regresión de rondas futuras.

---

## Criterios Pendientes de Testing Manual
- **Total criterios que requieren sub-testers esta ronda: 8 criterios distintos** (9 fallos de regresión; UX-045 cuenta como 1 criterio que falló en 2 proyectos).
  - Flow Tester: 6 (UX-003, UX-008, UX-015, UX-027, UX-067, UX-080).
  - Edge Case Tester: 1 (UX-045).
  - Visual Checker: 1 (DC-076).
- **Criterios FALLARON en ronda anterior (re-verificar fix) / con test desalineado al fix:**
  - Edge Case: **UX-045** (fix de BUG-E03 — test obsoleto que aserta el gap ya corregido).
  - Visual: **DC-076** (fix de BUG-E04 — cambio `@defer on viewport` → `on idle`).
  - Flow: **UX-003, UX-008, UX-015, UX-027, UX-067, UX-080** (fallan SOLO en mobile por timeout; tests asumen layout desktop).
- **Criterios DESBLOQUEADOS (antes con gap por bug, ahora plenamente testeables — actualizar .spec.ts para regresión):** UX-045 (vista Tarjetas, vía fix de BUG-E03) y DC-076 (render del odontograma tras fix de BUG-E04). Sus `.spec.ts` actualizados entran en la suite de regresión automatizada para rondas futuras.
- **Criterios nuevos sin test automatizado:** ninguno (es re-QA de Construcción Visual, no se agregan criterios nuevos).

> **Recordatorio de gate de salida (Fase 4):** `0 fallos + 0 bloqueados + 0 regresiones + 100% criterios cubiertos + 100% criterios con test automatizado`. Esta ronda cierra los 9 fallos de regresión; el PM re-corre la suite completa (incluyendo los 22 `test.fixme` re-habilitados de BUG-V01/V04) antes de declarar LISTO_PARA_DEMO.
