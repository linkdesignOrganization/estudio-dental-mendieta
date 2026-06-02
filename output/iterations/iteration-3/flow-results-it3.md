# Resultados — Flow Tester (Iteración 3 · Agenda · Ronda 1)

> Testeado contra el SITIO DESPLEGADO: https://happy-coast-044ea7e0f.7.azurestaticapps.net
> Bundle servido en producción = build de It3 (`main-VR4MDJED.js`, run `26834655604`).
> Ambos projects de Playwright (`desktop-chromium` 1280×900 · `mobile-chromium` Pixel 5).
> Config reusada: `e2e/playwright.config.ts`. Helpers reusados/extendidos: `e2e/tests/_helpers/seed.ts`.

## Resultados por Criterio
| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| **REQ-060** — Vista SEMANAL real (7 columnas-día, sin grid mensual) | **PASA** | `e2e/evidence/iteration-3/REQ-060-semana-real-desktop.png` · spec `REQ-060-semana-real.spec.ts` (2 tests desktop) |
| **REQ-070** — Notas internas en el detalle del turno (label + placeholder controlado) | **PASA** | `e2e/evidence/iteration-3/REQ-070-notas-internas-detalle.png` · spec `REQ-070-notas-internas.spec.ts` (3 tests, ambos projects) |
| **REQ-089** (+ **REQ-088**, **REQ-091**) — Reagendar → notificación de WhatsApp REAL | **PASA** | GIF `e2e/evidence/iteration-3/reagendar-whatsapp-flujo.gif` + `reagendar-01-slot-seleccionado.png` / `reagendar-02-notificacion-whatsapp.png` · spec `REQ-088-089-reagendar-notificacion.spec.ts` (3 tests, ambos projects) |

### Detalle de verificación (en vivo + automatizado)

**REQ-060 — Vista SEMANAL real.** En `/agenda?vista=semana` (desktop) se monta `app-week-view .week` con
`grid-template-columns: repeat(7,1fr)` → **7 `.week__col`** (Lun 1 → Dom 7 de junio 2026, hoy=lunes 1 marcado
`is-today`), cada columna con sus turnos como bloques clickeables (`a[href^="/agenda/tur-"]`). El **grid mensual
`.cal__grid` está AUSENTE** (`toHaveCount(0)`). El toggle "Semana" desde la vista Mes cambia el render (no solo
la URL): grid mensual desaparece y aparecen las 7 columnas; botón "Semana" queda `is-active`; volver a "Mes"
restaura el grid. → Es exactamente lo que el bug corregido requería (UX-005/UX-082 solo asertaban la URL y
pasaban con el grid viejo; este spec aserta el RENDER). Mobile: la vista semanal es de escritorio → los 2 tests
se saltan en `mobile-chromium` (el default mobile = lista/día lo cubre Visual REQ-068).

**REQ-070 — Notas internas.** El detalle `/agenda/:id` incluye SIEMPRE el bloque `.appt__notes` con label
`.appt__notes-label` = "Notas internas". En el seed determinista TODOS los turnos nacen con `notas: ''`
(`seed.generator.ts:534`), por lo que el estado observable es el **placeholder CONTROLADO** `.appt__notes-empty`
= "Sin notas internas para este turno." (nunca un hueco vacío ni "undefined"). El spec aserta que existe
EXACTAMENTE uno de los dos estados (`.appt__notes-body` XOR `.appt__notes-empty`), que el label está presente en
cualquier turno (llegando desde el calendario, sin depender de un id puntual), y que sobrevive al deep-link/refresh.
Nota: la aceptación contempla literalmente "…o el placeholder controlado cuando está vacío" → cubierto honestamente.

**REQ-089 / REQ-088 / REQ-091 — Reagendar → notificación de WhatsApp REAL (flujo estrella).** Flujo E2E completo
verificado EN VIVO y automatizado:
- (a) **Badge +1**: el badge de la campana `.header__badge` pasó de **5 → 6** al confirmar (verificado en vivo).
  El spec lee el badge inicial dinámicamente (`bellBadgeCount`) y aserta `inicial + 1` con `expect.poll`
  (no hardcodea "6") → robusto ante cambios de seed.
- (b) **Item real en la campana**: el panel `.np__item` muestra **"Aviso de WhatsApp enviado"** con subtítulo
  "Isabella Pérez fue notificado del nuevo horario: Mar 9 jun · 09:00", marcado "sin leer" (`.np__dot`).
  **Red anti-demo REQ-272**: el texto del item NO contiene "mock/simulado/de prueba/fake/dummy/lorem"
  (aserción negativa explícita).
- (c) **Toast de confirmación**: `.toast__msg` = "Turno reagendado. Se notificó al paciente por WhatsApp."
  (copy de producción, verificado por el spec).
- (d) **Nueva fecha/hora en el detalle**: el turno pasó de "Lunes 1 de junio · 10:00" a
  "Martes 9 de junio de 2026 · 09:00" (la fecha por defecto del form es `2026-06-09`).
- **REQ-091 persistencia**: tras `page.reload()` el badge sigue incrementado y el item sigue en la campana
  (estado persistido en localStorage; `reagendarTurno` persiste inmediato).
- **REQ-088 navegación**: abrir el aviso desde la campana (estando en otra sección) navega a `/agenda/:id` del
  turno reagendado (deep-link de la notificación).

> **Idempotencia**: la notificación usa `id = not-${Date.now()}` (no PRNG) y reagendar MUTA estado persistido.
> Para no contaminar otros specs ni acumular badges, cada test del flujo parte de un **seed fresco**
> (`resetSeed`: borra `edm:v1:state` + reload → el guard re-hidrata el seed byte-idéntico). El badge de partida
> es por tanto determinista y el delta +1 verificable.

## Bugs Encontrados
**Ninguno.** Los 3 focos asignados (REQ-060 semana real, REQ-070 notas internas, REQ-088/089/091 reagendar→WhatsApp)
funcionan correctamente en el sitio desplegado. 0 errores de consola observados en agenda (mes/semana), detalle y
reagenda durante el sondeo en vivo.

## Tests Generados
- `e2e/tests/flow/REQ-060-semana-real.spec.ts` — 2 tests (desktop): deep-link `?vista=semana` y toggle "Semana" rinden la semana real (7 columnas, sin grid mensual). Se saltan en mobile (vista de escritorio).
- `e2e/tests/flow/REQ-070-notas-internas.spec.ts` — 3 tests (ambos projects): bloque "Notas internas" con label + placeholder controlado, presencia cross-turno, persistencia tras refresh.
- `e2e/tests/flow/REQ-088-089-reagendar-notificacion.spec.ts` — 3 tests (ambos projects): REQ-089 (badge +1 + item "Aviso de WhatsApp enviado" + toast + nueva fecha + anti-demo), REQ-091 (persistencia tras refresh), REQ-088 (navegación desde la campana al turno reagendado).
- Helper extendido (reusable por futuras iteraciones): `e2e/tests/_helpers/seed.ts` → `resetSeed()` (reset a seed fresco para flujos que mutan estado) y `bellBadgeCount()` (lectura robusta del badge de la campana).

## Estabilidad
- Specs nuevos ejecutados **2 veces consecutivas** en ambos projects: **14 passed / 2 skipped** en ambas corridas (sin flakiness). Los 2 skipped son los REQ-060 desktop-only correctamente saltados en `mobile-chromium`.
- Anti-flakiness aplicado (lección UX-022/UX-003): esperas web-first (`expect`/`expect.poll`), esperar selectores antes de avanzar (`is-selected` antes de "Confirmar", `dialog` + `.np__item` antes de asertar), `bellBadgeCount` con `expect.poll` para la reactividad del signal, y `gotoApp` (espera el shell sembrado) antes de cada paso.

## GIFs de Flujos
- `e2e/evidence/iteration-3/reagendar-whatsapp-flujo.gif` — flujo estrella reagendar end-to-end: form → selección de slot → "Confirmar nuevo horario" → detalle con nueva fecha (Mar 9 jun · 09:00) → campana abierta con badge incrementado e item "Aviso de WhatsApp enviado".

## Regresión completa
- `npx playwright test e2e/tests/` (ambos projects, single-run 2026-06-02): **536 passed / 0 failed / 6 skipped** (542 total, ~43min). **VERDE.**
- Subió de 521 (baseline pre-It3) a **536** porque esta ronda añade 16 casos (14 ejecutados + 2 skipped REQ-060 desktop-only). Los 3 specs nuevos integran limpio; **0 regresiones** en la suite existente.
- Notable: **UX-003** (único fallo de la corrida previa, diagnosticado flaky de test y estabilizado) pasó en esta corrida → la regresión es efectivamente verde sin asteriscos.
