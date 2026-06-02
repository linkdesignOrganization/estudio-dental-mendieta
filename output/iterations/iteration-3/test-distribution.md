# Plan de Distribución — QA Team

> Iteración 3 (Módulo Agenda, REQ-059..097), FASE 5. Generado por el QA Orchestrator en MODO PLAN (paso 5e-plan).
> Los sub-testers (Flow, Edge Case, Visual) leen este archivo vía Auto-Dispatch.

## Contexto de Testing
- Iteración: 3 (Módulo Agenda — Épica 3, REQ-059..097)
- Ronda: 1 (no existe `qa-report.md` previo en `output/iterations/iteration-3/` → primera ronda de esta iteración)
- URL del sitio desplegado: **https://happy-coast-044ea7e0f.7.azurestaticapps.net** (verificada cargando en paso 5d, run `26834655604` success — ver infrastructure-setup.md)
- URL del backend: N/A (frontend-only, sin Functions)
- Total criterios de esta iteración (Épica 3): 39 (REQ-059..097)
- **Criterios nuevos/corregidos que requieren test dedicado esta ronda: 8** (ver gap-analysis abajo) → repartidos entre los 3 sub-testers
- Criterios restantes de la Épica 3 (31): **PASA automatizado** — cubiertos transitivamente por la suite de FASE 4 (visual-build) y verificados en la regresión 521-verde

### Testing contra sitio desplegado (obligatorio)
TODO el testing es contra el SWA desplegado, NUNCA localhost. El código de It3 ya está pusheado y deployado (paso 5d). Bundle servido `main-VR4MDJED.js` == build local → código de It3 realmente en producción.

> **Nota de rutas de la agenda (evitar falso negativo — de infrastructure-setup.md §It3):** `.agenda-row` (vista lista mobile) vive en `agenda-list-view.component.ts` y se renderiza en **`/agenda` con viewport mobile** (la lista es el default mobile). La ruta `/agenda/dia` carga un componente DISTINTO (`DayListComponent`, una **tabla** `app-data-table` con `<td class="cell">` de los turnos de HOY) y NO usa `.agenda-row`. Para llegar a un turno reagendable desde un probe, usar la lista mobile de `/agenda` (cada fila enlaza a `/agenda/:id`), no `/agenda/dia`. El form de reagendar usa `input#r-date` + botones `.resch__slot` (ocupados con `[disabled]`) + primario "Confirmar nuevo horario" (deshabilitado hasta elegir slot).

---

## Gap-analysis test-por-test (qué motiva las asignaciones)

> Conclusión: los 4 focos de feedback/cambio de It3 + sus criterios funcionales asociados **NO tienen `.spec.ts` dedicado** — solo cobertura transitiva que NO atrapa el bug corregido. Un Grep de `REQ-059..097` sobre `e2e/` devuelve **0 archivos** (la agenda se testea hoy con specs UX-xxx/DC-xxx de FASE 4). Por eso se asignan 8 criterios; el resto = PASA automatizado.

| Foco / criterio | REQ real | Cobertura existente | ¿Dedicado? | Veredicto |
|---|---|---|---|---|
| Vista **SEMANAL real** (toggle "Semana" rinde 7 columnas-día, antes mostraba el grid mensual = bug) | **REQ-060** | `UX-005` (UX-001-018-navigation-routing.spec.ts:136) y `UX-082` (UX-080-094-interactions-persistence.spec.ts:46) **solo asertan que la URL cambia a `?vista=semana`** — pasarían igual con el grid mensual viejo. NO verifican `app-week-view` ni las 7 `.week__col`. | **NO** (transitiva, no atrapa el bug) | **ASIGNAR → Flow** |
| **Notas internas** en el detalle del turno | **REQ-070** | Ninguna (`Notas internas`/`appt__notes` → 0 matches en `e2e/`) | **NO** | **ASIGNAR → Flow** |
| **Reagendar persiste `NotificationEntity` de WhatsApp REAL** (aparece en la campana, no solo toast) | **REQ-089** (+ REQ-088, REQ-091) | `DC-133` (DC-120-143-feedback.spec.ts:164) prueba que una notificación **del seed** navega a su ruta; la ruta `/agenda/:id/reagendar` solo se carga como smoke "shell renderiza" (UX-routes-navigability.spec.ts:27). **Nadie ejecuta el flujo reagendar→genera notificación→badge incrementa.** | **NO** (transitiva) | **ASIGNAR → Flow** |
| Panel de **"Filtros" secundario** de la Agenda (estado + tipo de tratamiento, no permanentemente visible) | **REQ-063** | `REQ-101-filtros-pacientes.spec.ts` cubre el patrón "Filtros" pero del **módulo Pacientes**, NO de la Agenda | **NO** | **ASIGNAR → Edge Case** |
| Reagendar **no permite slot ocupado** del mismo profesional | **REQ-090** | Ninguna dedicada (UX-050 cubre requeridos de *crear* turno, no slots ocupados de *reagendar*) | **NO** | **ASIGNAR → Edge Case** |
| **Default mobile en vista DÍA/LISTA** (filas `.agenda-row` ≥44px, no chips de 22px); desktop sigue en MES | **REQ-068** + **NFR-022** | Token `--touch-target-min:44px` (DC-001-029-design-tokens.spec.ts:124) y `.btn-edm`≥44px (DC-021-...known-bugs) existen, pero **nadie aserta el default mobile = lista ni la altura de `.agenda-row`** | **NO** | **ASIGNAR → Visual** |
| **Desktop arranca en MES** (default preservado tras el refactor) | **REQ-059** | UX-005 asume `/agenda` mensual pero no lo blinda contra el nuevo `effectiveView()` | parcial | **ASIGNAR → Visual** (junto con REQ-068, mismo componente `effectiveView`) |

**PASA automatizado (NO asignar — regresión 521-verde + cobertura transitiva de FASE 4):** REQ-061, REQ-062, REQ-064, REQ-065, REQ-066, REQ-067, REQ-069, REQ-071, REQ-072, REQ-073, REQ-074, REQ-075, REQ-076, REQ-077, REQ-078..087 (crear turno 3 pasos, ya de la demo, cubierto por UX-050/UX-multipaso), REQ-092..097 (lista del día, cubierto por UX-049/UX-093/UX-082). Estos se reflejan en el qa-report.md de consolidación como **PASA (automatizado)**.

---

## Asignación: Flow Tester → e2e/tests/flow/
### Criterios asignados (3)
- **REQ-060** — Vista SEMANAL **real**: en `/agenda?vista=semana` (desktop) debe montarse `app-week-view` con **7 columnas-día** (`.week__col`, lunes→domingo de la semana de hoy), grid mensual AUSENTE (`.cal__grid` = 0). NO basta con que la URL diga `?vista=semana`: hay que aserta el render de 7 columnas (este es el bug corregido).
- **REQ-070** — **Notas internas** en el detalle del turno: en `/agenda/:id` debe existir el bloque "Notas internas" (`.appt__notes-label`) con el contenido `a.notas`, o el placeholder controlado "Sin notas internas para este turno" cuando está vacío.
- **REQ-089** (+ REQ-088, REQ-091) — **Reagendar → notificación de WhatsApp REAL**: flujo E2E completo. Abrir `/agenda/:id/reagendar`, elegir nueva fecha (`input#r-date`) + un slot libre (`.resch__slot` no `[disabled]`), pulsar "Confirmar nuevo horario" → (a) el badge de la campana (`.header__badge`) **incrementa en 1**, (b) el panel de notificaciones (`.np__item`) muestra un item "Aviso de WhatsApp enviado" con lenguaje de producción (**sin "mock/simulado/de prueba"** — REQ-272), (c) toast "Se notificó al paciente por WhatsApp" / "Turno reagendado…", (d) el detalle del turno refleja la nueva fecha/hora. Persistencia: la notificación sobrevive a refresh.

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- Para reagendar, navegar al turno desde la **lista mobile de `/agenda`** (fila `<a>` → `/agenda/:id` → menú secundario "Reagendar"), o por deep-link `/agenda/:id/reagendar`. Usar un turno NO terminal (en-espera/confirmado) para que el reagendar esté disponible.
- **GIF OBLIGATORIO** del flujo de reagendar end-to-end (selección de slot → confirmación → badge de campana incrementa → item "Aviso de WhatsApp enviado" visible). Es el flujo estrella de esta iteración.
- La notificación nueva usa `id = not-${Date.now().toString(36)}` (no PRNG) → no toques el seed; tras tu test el estado puede quedar mutado, resetéalo entre tests (limpiar localStorage / volver al seed) para no contaminar otros specs.
- Genera los `.spec.ts` con prefijo de criterio real (ej. `REQ-060-semana-real.spec.ts`, `REQ-070-notas-internas.spec.ts`, `REQ-088-089-reagendar-notificacion.spec.ts`) en `e2e/tests/flow/`. Estos entran en la suite de regresión para iteraciones futuras.

## Asignación: Edge Case Tester → e2e/tests/edge-case/
### Criterios asignados (2)
- **REQ-063** — Panel de **"Filtros" secundario de la Agenda** (anti-patrón): los filtros de **estado** y **tipo de tratamiento** NO están permanentemente visibles. De entrada solo se ve el botón "Filtros" (el panel `filtersOpen` NO existe en el DOM o no es visible). Al pulsarlo se abre el panel; aplicar un filtro reduce el calendario; cerrar/limpiar restaura. OJO: es la Agenda (`calendar.component.ts`), NO la lista de Pacientes (esa ya tiene `REQ-101-filtros-pacientes.spec.ts` — no la dupliques).
- **REQ-090** — **Reagendar no permite slot ocupado** del mismo profesional: en `/agenda/:id/reagendar`, los slots ya ocupados por ese profesional en la fecha elegida aparecen `[disabled]` (`.resch__slot[disabled]`) y NO son seleccionables; el horario propio del turno actual se excluye correctamente si la fecha coincide. Verifica el caso límite con una fecha/profesional que tenga al menos un slot ocupado en el seed.

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- Edge cases anticipados: panel Filtros agenda cerrado→abierto→aplicado→limpiado; slot ocupado no clickeable en reagendar; combinación estado+tipo que da 0 turnos → estado vacío con guidance ("No hay turnos en este período…").
- Genera `.spec.ts` con prefijo real (ej. `REQ-063-agenda-filtros-panel.spec.ts`, `REQ-090-reagendar-slot-ocupado.spec.ts`) en `e2e/tests/edge-case/`.

## Asignación: Visual Checker → e2e/tests/visual/
### Criterios asignados (2 + NFR)
- **REQ-068** (+ **NFR-022**) — **Default mobile = vista DÍA/LISTA con filas ≥44px**: en viewport mobile (<768px), `/agenda` sin `?vista` arranca en `app-agenda-list-view` (turnos como `.agenda-row`, NO en chips de 22px ni en el grid semanal). Cada `.agenda-row` es un `<a>` clickeable con altura **≥44px** (`min-height: var(--touch-target-min)` = 44px). Mide el `boundingBox().height` real de varias filas. Los toggles de vista (cuando visibles) también ≥44px.
- **REQ-059** — **Default desktop = MES**: en viewport desktop (≥992px), `/agenda` sin `?vista` monta el grid mensual (`.cal__grid` presente, ~35 celdas), toggle "Mes" activo, sin columnas-semana. Blinda el default contra el nuevo `effectiveView()` del refactor.

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- Breakpoints: **mobile (<768px)** → debe ser lista DÍA con `.agenda-row` ≥44px; **desktop (≥992px)** → debe ser MES. Verifica que el cambio de breakpoint cambia el default sin recargar (el `isMobile` es reactivo vía `matchMedia('(max-width:767px)')`).
- `--touch-target-min: 44px` ya tiene cobertura de token (DC-001-029) — aquí lo nuevo es **aplicarlo a `.agenda-row`** y al default mobile de la agenda, no re-verificar el token.
- Genera `.spec.ts` con prefijo real (ej. `REQ-059-068-agenda-default-responsive.spec.ts`) en `e2e/tests/visual/`.

### BVC-xxx asignados (Brief Verification Criteria)
- N/A en esta iteración: los BVC-xxx (brief compliance) ya fueron verificados en FASE 4 (`BVC-NFR-brief-compliance.spec.ts`) y entran como regresión automatizada. La red anti-"demo" (REQ-272) aplica al texto nuevo de la notificación de reagenda → la cubre el Flow Tester en REQ-089 (sin "mock/simulado/de prueba").

---

## Regresión Automatizada (lee de regression-results.md)
- Resultado de `npx playwright test e2e/tests/` (single-run, 2026-06-02T14:43:48): **521 passed / 1 failed / 4 skipped**.
- **Único fallo = UX-003** (sidebar nav, UX-001-018-navigation-routing.spec.ts) → **diagnosticado FLAKY por el Flow Tester** (click "tragado" en navegación encadenada del sidebar, NO relacionado con Agenda; desktop abre `/agenda` en MES correctamente). Test estabilizado (retry-click web-first + wait de `NavigationEnd`), 14/14 desktop + 6/6 mobile post-fix. **Regresión efectivamente VERDE.** Ver `output/iterations/iteration-3/flow-ux003.md`. **NO re-asignar UX-003.**
- Criterios de la Épica 3 verificados por automatización (PASA automatizado — NO asignar a sub-testers): REQ-061, REQ-062, REQ-064, REQ-065, REQ-066, REQ-067, REQ-069, REQ-071, REQ-072, REQ-073, REQ-074, REQ-075, REQ-076, REQ-077, REQ-078..087, REQ-092..097.
- Criterios con regresión detectada (ya corregidos por el Developer antes de esta ronda): **ninguno** (el fallo de UX-003 era flake de test, no regresión de app; el seed quedó byte-idéntico — sin drift, ver verification-5a.md).

## Criterios Pendientes de Testing Manual
- Total criterios que requieren sub-testers esta ronda: **8** (REQ-059, REQ-060, REQ-063, REQ-068, REQ-070, REQ-088/089/091 agrupados, REQ-090) → Flow 3 · Edge Case 2 · Visual 2.
- Criterios que FALLARON en ronda anterior (re-verificar fix): ninguno (Ronda 1 de It3).
- Criterios DESBLOQUEADOS (antes bloqueados por bug, ahora testeables): ninguno.
- Criterios nuevos/corregidos sin test automatizado dedicado (generar `.spec.ts` — entran en regresión futura): REQ-059, REQ-060, REQ-063, REQ-068, REQ-070, REQ-088, REQ-089, REQ-090, REQ-091.
