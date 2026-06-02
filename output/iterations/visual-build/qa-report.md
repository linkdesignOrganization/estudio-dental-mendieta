# QA Report — Construcción Visual (FASE 4)

> Consolidado por el QA Orchestrator (MODO CONSOLIDACIÓN, paso 4f-consolidate).
> Fuentes: `flow-results.md`, `edge-results.md`, `visual-results.md` (Ronda 1).
> Fase: **Construcción Visual (FASE 4)** · Modo: **NORMAL** (Visual Checker compara contra criterios DC-xxx, sin `image_compare`).

- **Ronda:** 1
- **Fecha:** 2026-06-02
- **Sitio testeado (desplegado, NO localhost):** https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **Sub-testers consolidados:** Flow Tester · Edge Case Tester · Visual Checker (3/3, todos reportaron)

---

## VEREDICTO

**HAY_BUGS — la iteración NO está lista para demo.**

Existe **1 bug CRÍTICO raíz (BUG-V01)** que degrada tipografía de títulos, botones primarios, estado disabled y touch targets en TODA la app, más **6 bugs independientes de severidad media/baja**. El gate de salida del ciclo (`0 bugs + 0 bloqueados`) NO se cumple.

- **Cobertura: 100% de criterios con resultado explícito** (47 UX + 28 edge + 158 DC/BVC/NFR).
- **0 criterios BLOQUEADOS** (ningún bug impidió ejecutar un criterio asignado; todos los FALLA son verificables).
- **Bugs a corregir: 7** (1 crítico raíz + 6 independientes). Tras corregir BUG-V01 se re-verifican los ~16 criterios derivados.
- **GIFs de demo grabados:** 3 (crear turno, registrar pago, recorrido del shell).

> El gate negativo CRÍTICO del cliente **BVC-027 (cero demo/mock/tracking) PASA**, y **GAP-A04 (sin texto blanco sobre azul medio) PASA**. El bloqueo a demo es de cumplimiento visual (BUG-V01), no de funcionalidad ni de fuga de "demo".

---

## Resumen de Cobertura

| Sub-tester | Criterios asignados | Con resultado | PASA | FALLA | BLOQUEADO | .spec.ts | GIFs |
|---|---|---|---|---|---|---|---|
| Flow Tester | 47 UX | 47 | 45 (+2 PASA c/observación) | 0 | 0 | 6 archivos | 3 |
| Edge Case Tester | 28 (UX/DC edge + NFR routing) | 28 | 28* | 0 (5 gaps → bugs) | 0 | 8 archivos | sí |
| Visual Checker | 158 (120 DC + 29 BVC + 9 NFR) | 158 | 138 | 20** | 0 | 7 archivos | sí |
| **TOTAL** | **233** | **233 (100%)** | **211** | **20** | **0** | **21 archivos** | **3 GIFs demo** |

\* Edge Case: los 28 criterios tienen guard funcional efectivo (PASA en comportamiento). Los 5 gaps reportados (BUG-E01/E03/E04/E06 + el visual E02) son carencias de UX/visual sobre criterios que igualmente cumplen su guard de seguridad funcional — se listan como bugs abajo.
\*\* Visual Checker: los 20 FALLA derivan de **un único bug raíz (BUG-V01)** salvo `aria-selected` en tabs (BUG-V04). Un solo fix de BUG-V01 resuelve ~16-18 de las 20 fallas.

---

## Bugs Consolidados (deduplicados)

> **DEDUPLICACIÓN aplicada:** varios sub-testers reportaron síntomas del mismo defecto raíz. **BUG-V01 (CRÍTICA)** es la causa raíz; absorbe **BUG-E02** (disabled sin token), **BUG-E05** (error CSP de consola), **BUG-V06** (touch targets <44px) y las ~18 fallas visuales de tipografía/botón. Estos NO se cuentan como bugs separados — se listan como **criterios afectados a re-verificar** tras el fix de V01. Los 6 bugs independientes (F01, E01, E03, E04, E06, V04) se corrigen aparte.

### Tabla de bugs a corregir

| Bug | Severidad | Criterio(s) afectado(s) | Responsable | Resumen |
|-----|-----------|-------------------------|-------------|---------|
| **BUG-V01** | **CRÍTICA (raíz)** | DC-015, DC-016, DC-017, DC-018, DC-021, DC-071, DC-072, DC-073(visual), DC-088; BVC-001, BVC-015, BVC-017, BVC-022; NFR-022 | **Developer** (CSP/infra) + **UI Developer** (servir hoja) | Hoja global servida `media="print"` + `onload` bloqueado por CSP → no aplica en pantalla |
| BUG-F01 | Baja | UX-011 | **Developer** (routing) | Ruta `/tratamientos/catalogo` no existe (404 en deep-link directo) |
| BUG-E01 | Media | UX-050, DC-112 | **Developer** (funcional) | Mensaje inline de monto ≤0 inalcanzable por UI en Registrar pago |
| BUG-E03 | Media | UX-045, UX-041 | **Developer** (funcional) | Lista de pacientes vista Tarjetas sin match → grilla en blanco (falta empty-state) |
| BUG-E04 | Media | UX-047, UX-016 | **Developer** (funcional/SSR) | Odontograma no renderiza por deep-link directo en mobile (bloque @defer no hidrata) |
| BUG-E06 | Media | UX-091 | **Developer** (funcional) | Degradación sin localStorage sin aviso visible (estado `degraded` no consumido por UI) |
| BUG-V04 | Media (a11y) | DC-073 | **UI Developer** (a11y/markup) | Tabs de la ficha sin `aria-selected` |

---

### BUG-V01 — Stylesheet global de diseño no se aplica (media="print" + onload bloqueado por CSP) · **CRÍTICA / RAÍZ**
- **Severidad:** CRÍTICA (bloquea demo).
- **Criterios afectados (a re-verificar tras el fix):** DC-015, DC-016, DC-017, DC-018, DC-021, DC-071, DC-072, DC-073 (capa visual disabled), DC-088; BVC-001, BVC-015, BVC-017, BVC-022; NFR-022.
- **Responsable:** **Developer (config CSP / index.html)** para el fix raíz; **UI Developer** confirma estilos tras el swap. (Es un problema de cómo se sirve/inyecta la hoja, no de los tokens ni del SCSS de componentes.)
- **Descripción:** la hoja global se sirve como `<link rel="stylesheet" href="styles-FHPOFM43.css" media="print" onload="this.media='all'">`. La CSP `script-src 'self'` BLOQUEA el handler `onload` inline → `media` queda en `"print"` → la hoja **nunca aplica a pantalla** (`sheet.media.mediaText="print"`, `appliesToScreen=false`, confirmado en Playwright real). Los tokens (`:root` inline) y los estilos scoped de Angular SÍ aplican, por eso la app se ve casi correcta en screenshots, pero todo lo que vive en la hoja global se cae a estilos nativos del navegador.
- **Pasos para reproducir:**
  1. Abrir cualquier ruta (ej. `/reportes`).
  2. Inspeccionar consola → error `Executing inline event handler violates… 'script-src 'self''` (en TODAS las páginas).
  3. `getComputedStyle` de un `.btn-edm--primary` y de `h1`.
- **Resultado esperado:** botón primario `background:#6da8d4` + texto `#2a2a35`, alto 40px, radius 12px; `h1-h6` peso 500 / line-height 1.2 / Red Hat Display; `.btn-edm:disabled` opacity 0.4 + cursor not-allowed.
- **Resultado actual:** botón computa `#efefef`/negro/radius 0/27px/`display:block`; `h1` computa peso **700** (faux-bold) / line-height **1.60** / Red Hat **Text**; disabled computa opacity 1 / cursor default.
- **Síntomas absorbidos (mismo defecto raíz, NO bugs separados):**
  - **BUG-E02** (Edge) — botones disabled sin token (opacity 0.4 / not-allowed). El guard funcional sí cumple; solo es el aspecto visual → lo resuelve V01.
  - **BUG-E05** (Edge, baja) — error CSP de consola en todas las páginas. Es el MISMO `onload` inline; al hacer el swap CSP-compatible desaparece.
  - **BUG-V06** (Visual) — touch targets <44px en mobile (hamburguesa 28px, campana 29px, "Editar paciente" 21px, 21 controles). El sizing táctil de `.icon-btn`/`.btn-edm` vive en la hoja no aplicada → probablemente se resuelve con V01; **verificar explícitamente tras el fix** (NFR-022 / DC-072 / DC-088 / BVC-017).
  - **Fallas tipográficas** DC-015/016/017/018 + BVC-001/022 (títulos 700/lh 1.6/7 tamaños) y de botón DC-071 → todas de V01.
- **Fix sugerido:** servir la hoja con `media="all"` directamente, o reemplazar el swap por mecanismo CSP-compatible (`'self'` con archivo externo / añadir hash del handler a la CSP). Tras el fix, re-habilitar los `test.fixme` de `DC-015-018-typography.spec.ts` y `DC-021-071-072-073-known-bugs.spec.ts` para que entren en regresión.
- **Evidencia:** `e2e/screenshots/primary-button-crop.png`; inspección `link.media="print"`/`appliesToScreen:false`; computed h1 700/1.6; `.playwright-mcp/console-*.log` (error CSP).

### BUG-F01 — Ruta `/tratamientos/catalogo` no existe (404 en deep-link directo) · BAJA
- **Severidad:** baja.
- **Criterio afectado:** UX-011.
- **Responsable:** **Developer (routing).**
- **Descripción:** la ruta documentada `/tratamientos/catalogo` (y `/tratamientos/catalogo/:tid`) no existe en el deploy; un deep-link directo cae en "No encontramos esta página" (404 interno, sin crash). La implementación usó un toggle in-page "Activos / Catálogo de tipos" en `/tratamientos` + detalle en `/tratamientos/tipos/:id`.
- **Pasos para reproducir:** ir directo a `…/tratamientos/catalogo`.
- **Resultado esperado:** renderiza el catálogo de tipos.
- **Resultado actual:** pantalla "No encontramos esta página".
- **Mitigación:** el catálogo SÍ es accesible y completo (15 cards ≥12) vía la sub-nav in-page; solo difiere el naming de ruta. Sin pérdida de funcionalidad; solo falla el deep-link al nombre documentado.
- **Evidencia:** route-sweep (`notFound=true`); snapshot del toggle en `/tratamientos`.

### BUG-E01 — Registrar pago: mensaje inline de monto ≤0 nunca se muestra · MEDIA
- **Severidad:** media · Impacto de seguridad: no.
- **Criterios afectados:** UX-050, DC-112.
- **Responsable:** **Developer (funcional).**
- **Descripción:** con monto negativo/0 en `/pacientes/:id/pagos/nuevo`, el botón "Confirmar pago" queda deshabilitado (correcto) pero el mensaje inline "Ingresá un monto mayor a cero." nunca aparece. Raíz (verificada en `register-payment.component.ts`): `showError = touched && !isValid`, y `touched` solo se setea en `submit()`, que está bloqueado por `[disabled]="!isValid()"` → la rama de error es inalcanzable por UI normal.
- **Pasos para reproducir:** abrir Registrar pago → escribir `-500` (o `0`) en Monto → observar (no aparece mensaje).
- **Resultado esperado:** botón deshabilitado **Y** mensaje inline junto al campo.
- **Resultado actual:** botón deshabilitado, sin mensaje inline.
- **Contraste:** en Crear turno la validación inline SÍ funciona (touched se setea antes del guard) — la inconsistencia es solo en Registrar pago.
- **Evidencia:** `e2e/tests/edge-case/UX-050-DC-112-pago-monto-invalido.spec.ts`; observado en vivo.

### BUG-E03 — Lista de pacientes (vista Tarjetas) sin match: grilla en blanco · MEDIA
- **Severidad:** media · Impacto de seguridad: no (viola UX-041 "nunca pantalla en blanco ambigua" en la vista secundaria).
- **Criterios afectados:** UX-045, UX-041.
- **Responsable:** **Developer (funcional).**
- **Descripción:** en `/pacientes` → toggle "Tarjetas" → búsqueda sin match, la grilla queda en blanco (contador "0 pacientes en el sistema") sin empty-state. Raíz (verificada en `patient-list.component.ts`): la vista Tabla pasa `emptyTitle` al data-table; la vista Cards hace `@for` sobre `filtered()` **sin `@empty`/empty-state**.
- **Pasos para reproducir:** `/pacientes` → "Vista de tarjetas" → escribir `qqqnomatch`.
- **Resultado esperado:** empty-state con guidance ("No encontramos pacientes con ese criterio"), como en vista Tabla.
- **Resultado actual:** grilla en blanco sin empty-state.
- **Evidencia:** `e2e/tests/edge-case/UX-041-052-estados-vacios.spec.ts` (tabla = control positivo; tarjetas = gap).

### BUG-E04 — Odontograma no renderiza por deep-link directo en mobile · MEDIA
- **Severidad:** media · Impacto de seguridad: no (afecta compartir/recargar la URL del odontograma en mobile).
- **Criterios afectados:** UX-047, UX-016.
- **Responsable:** **Developer (funcional / hidratación @defer).**
- **Descripción:** deep-link directo a `/pacientes/:id/odontograma` en viewport mobile deja 0 piezas (el encabezado del tab carga, pero el diagrama —bloque `@defer`— no hidrata). Por tab-click in-app sí rinde 32; en desktop el deep-link directo también rinde 32.
- **Pasos para reproducir:** (mobile) ir directo a `/pacientes/pac-029/odontograma` → esperar/scrollear.
- **Resultado esperado:** 32 piezas (UX-047 "siempre 32 piezas"; UX-016 deep-link renderiza correcto).
- **Resultado actual:** 0 piezas en mobile por deep-link directo.
- **Evidencia:** counts verificados (desktop deep-link=32, mobile deep-link=0, mobile vía tab=32); `e2e/tests/edge-case/UX-041-052-estados-vacios.spec.ts`.

### BUG-E06 — Degradación sin localStorage sin aviso visible · MEDIA
- **Severidad:** media · Impacto de seguridad: no.
- **Criterio afectado:** UX-091.
- **Responsable:** **Developer (funcional).**
- **Descripción:** con localStorage bloqueado (modo privado) o cuota llena, la app degrada a memoria y navega el seed sin crashear (correcto), pero no muestra ningún aviso. Raíz (verificada): `StorageService.degraded` se setea en `probe()`/`write()` y se re-exporta en el store, pero **ninguna parte de la UI lo consume** (sin toast/banner).
- **Pasos para reproducir:** bloquear localStorage (addInitScript) → cargar `/reportes`.
- **Resultado esperado:** degrada a memoria, navega sin crashear, **Y** aviso claro (toast informativo) sin lenguaje de demo.
- **Resultado actual:** degrada y navega sin crashear, sin aviso.
- **Evidencia:** `e2e/tests/edge-case/UX-091-degradacion-sin-localstorage.spec.ts` (no-crash = assertion dura; aviso = expectativa documentada).

### BUG-V04 — Tabs de la ficha sin `aria-selected` · MEDIA (a11y)
- **Severidad:** media (accesibilidad).
- **Criterio afectado:** DC-073.
- **Responsable:** **UI Developer (a11y / markup).**
- **Descripción:** los 6 `<a role="tab">` de la ficha solo marcan el activo con la clase `is-active`; ninguno expone `aria-selected` (todos `null`), ni `aria-controls`/roving `tabindex`. Los lectores de pantalla no anuncian el tab activo. (Nota: el comportamiento "tab inactivo NO en el DOM" SÍ cumple — 1 solo tabpanel; el gap es solo el atributo ARIA.)
- **Resultado esperado:** cada `role="tab"` con `aria-selected="true|false"` (patrón WAI-ARIA tabs), exactamente uno `true`.
- **Resultado actual:** `aria-selected` ausente.
- **Evidencia:** computed `[{txt:'Información general', ariaSelected:null, classes:'ficha__tab is-active'}, …]`.

---

## Resultado por Criterio

### Flow Tester — UX-xxx (camino feliz): 45 PASA · 0 FALLA · 0 BLOQUEADO

Todos PASA. UX-005 y UX-011 PASAN con observaciones de desvío de naming de ruta (no rompen flujo).

| Criterio | Resultado | Nota |
|----------|-----------|------|
| UX-001, UX-002, UX-003, UX-004 | PASA | login fuera del shell, shell envuelve internas, sidebar→ruta, inicio=/reportes |
| UX-005 | PASA (obs OBS-F02) | toggle "Día" navega a `/agenda/dia` en vez de `?vista=dia` (defendible, no rompe) |
| UX-006, UX-007, UX-008, UX-009, UX-010 | PASA | rutas dedicadas (no modal), 3 rutas crear turno, lista→ficha, 6 tabs en URL, sub-pantallas |
| UX-011 | PASA (→ BUG-F01) | catálogo accesible vía toggle in-page; ruta `/tratamientos/catalogo` no existe (deep-link 404) |
| UX-012, UX-013, UX-014 | PASA | sub-nav 3 rutas reales (sin ARCA/AFIP), crear presupuesto navegable, 4 reportes navegan |
| UX-015, UX-016 | PASA | botón atrás preserva datos; deep-linking hidrata desde localStorage |
| UX-018 | PASA | drawer mobile navega y cierra |
| **UX-020** (FLUJO CRÍTICO 1) | **PASA** | crear turno persiste (+1), navega al detalle "Confirmado", sobrevive refresh real + toast. GIF |
| UX-021, UX-022 | PASA | agendar desde ficha preselecciona; avanzar estado persiste tras refresh |
| **UX-026** (FLUJO CRÍTICO 2/FIRMA) | **PASA** | registrar pago en ruta dedicada, recalcula saldo con exactitud, toast. GIF |
| UX-027, UX-028, UX-032 | PASA | badge coherente con saldo; editar pieza persiste tras refresh; navegación cruzada |
| UX-060..067 | PASA | seed: 29 pacientes (12H+17M), 6 prof, 6 OS, 15 tipos, 56 turnos (5 estados), 49 planes, 44 docs, 22 presup, 28 facturas, 100 movimientos; KPIs calculados |
| UX-080..083 | PASA | búsqueda inline (no global), filtro único, toggles, tab inactivo fuera del DOM |
| UX-084 | PASA | 3 escrituras (turno, pago, pieza) sobreviven refresh REAL |
| UX-085, UX-086, UX-087 | PASA | saldo derivado con signos; odontograma refleja edición (FDI+universal); disponibilidad real |
| UX-089, UX-090 | PASA | toast + validación inline; "Restablecer datos" solo en Config, copy producción |
| UX-092, UX-093, UX-094 | PASA | notificaciones navegables/contador; flujos mobile sin scroll-x; cero rastro de demo |

### Edge Case Tester — ramas edge/NFR routing: 28 cubiertos (guard funcional efectivo; 5 gaps → bugs)

| Criterio | Resultado | Nota |
|----------|-----------|------|
| UX-050 (pago monto ≤0) | PASA c/gap → **BUG-E01** | botón deshabilitado efectivo; mensaje inline inalcanzable |
| DC-112 | PASA c/gap → **BUG-E01** | transiciones correctas; mensaje inline no alcanzable |
| UX-050 (crear turno Paso 1/2) | PASA | error inline SÍ visible; no avanza sin requeridos |
| UX-041 (vacíos transversal) | PASA | empty states sin demo/mock |
| UX-044 | PASA (no UI-reachable) | empty-state cableado; seed fijo poblado, no alcanzable por filtro; camino real validado |
| UX-045 | PASA c/gap → **BUG-E03** | tabla muestra empty-state ✔; tarjetas en blanco ✗ |
| UX-046 | PASA (cubierto por Visual) | placeholders sin lenguaje mock |
| UX-047 | PASA c/gap → **BUG-E04** | 32 piezas vía tab (desktop+mobile) ✔; deep-link directo mobile = 0 piezas ✗ |
| UX-048 | PASA | empty-state pagos vacíos + 0 imágenes rotas (fallback iniciales) |
| UX-051, UX-052 | PASA (parcial no-reachable) | empty-states cableados; seed no llega a 0 por filtro; fallback no-blanco validado |
| UX-006, UX-017, UX-054 | PASA | id inexistente → "No encontramos…" + volver, sin crash; rutas basura → /no-encontrado |
| UX-049 | PASA (gap visual → **BUG-V01/E02**) | "Avanzar estado" disabled efectivo; aspecto disabled cae a UA default (resuelve V01) |
| DC-104, DC-126 | PASA | detalle turno error/terminal; deep-link ficha inválida hidrata sin crash |
| UX-091 | PASA c/gap → **BUG-E06** | no crashea + navega seed en memoria ✔; sin aviso visible ✗ |
| UX-043 | PASA | paginación "1–12/13–24/25–29 de 29", offset 12, sin infinite scroll |
| UX-088, UX-031 | PASA | confirmación antes de destructivas; Restablecer datos con advertencia + copy producción |
| NFR-006..009, NFR-013 | PASA | URL refleja vista; deep-link válido hidrata; inexistentes no crashean; SPA fallback Azure → 200 |

> Nota de alcance (Edge): inyección SQL / auth-bypass / sanitización server-side = **N/A** (frontend-only, sin backend ni login real). La superficie de seguridad aquí es robustez de routing/deep-linking + degradación + ausencia de tracking — toda cubierta.

### Visual Checker — DC/BVC/NFR: 138 PASA · 20 FALLA · 0 BLOQUEADO

**PASA (138):** todos los tokens (DC-001..029: paleta azul 4 tonos, neutros, semánticos pastel, fuentes Red Hat 400/500 cargadas, escala/spacing/sombra/radius/motion/focus-ring tokens, overrides Bootstrap), layouts/shell (DC-030..049), componentes (DC-050..077: badges, avatar, stack +N, tablas ≤5 col + paginación, tabs 1 tabpanel, odontograma 32 piezas a11y, empty-state), responsive estructural (DC-080..089: sidebar→drawer, tabla→cards, tabs scroll, sin scroll-x en 3 BP), estados/feedback (DC-100..143 aspecto), **GAP-A04 (0 ofensores)**, NFR perf (001..005) y a11y base (020/021/023), y **23 BVC + BVC-027 crítico**.

**FALLA (20) — todas de BUG-V01 salvo DC-073 a11y (BUG-V04):**

| Criterio | Resultado | Causa |
|----------|-----------|-------|
| DC-015 (títulos Red Hat Display) | FALLA | **BUG-V01** (h1 computa "Red Hat Text") |
| DC-016 (títulos peso 500) | FALLA | **BUG-V01** (h1/h2/h3 computan 700 faux-bold) |
| DC-017 / BVC-022 (line-height títulos ~1.2) | FALLA | **BUG-V01** (h1 lh 1.60) |
| DC-018 / BVC-022 (máx 3 tamaños/pantalla) | FALLA | **BUG-V01** (/reportes muestra 7 tamaños; `.t-*` no aplican) |
| DC-021 / BVC-015 (disabled opacity 0.4) | FALLA | **BUG-V01** (disabled computa opacity 1) |
| DC-071 (button primary relleno #6da8d4 / 40px / radius) | FALLA | **BUG-V01** (estilo nativo #efefef/radius 0/27px) |
| DC-072 / DC-088 / BVC-017 / NFR-022 (touch ≥44px) | FALLA (**BUG-V06**, deriva de V01) | controles 21-36px en mobile |
| DC-073 a11y (tabs `aria-selected`) | FALLA (**BUG-V04**) | los 6 `role=tab` con `aria-selected:null` |
| BVC-001 (parcial) | PARCIAL | fuentes 400/500 OK; títulos 700 por V01 |

> Las ~16-18 fallas que NO son BUG-V04 colapsan a un solo fix (BUG-V01). El reporte del Visual Checker marcó `test.fixme` en `DC-015-018-typography.spec.ts` y `DC-021-071-072-073-known-bugs.spec.ts` encerrando el valor correcto esperado para que entren en regresión post-fix.

### Brief Verification Criteria (BVC) — 29

- **PASA: 23** + **BVC-027 (CRÍTICO) PASA** (0 requests analytics, 0 SDKs, 0 lenguaje demo en 9 rutas, sin ARCA/AFIP, footer sobrio, reset solo en Config).
- **PARCIAL/FALLA por BUG-V01: 4** — BVC-001 (títulos 700), BVC-015 (disabled 0.4), BVC-017 (touch ≥44px), BVC-022 (line-height títulos/3 tamaños).
- **BVC-029** (calma profesional): PASA con matiz — sube a "excelente" tras corregir BUG-V01 (los títulos faux-bold restan sobriedad).

### NFR (a11y / perf)

| NFR | Resultado | Nota |
|-----|-----------|------|
| NFR-001 (carga <3s) | PASA | `loadEventEnd` ~245ms cache / cold <3s |
| NFR-002 (bundle <500KB) | PASA | initial chunk <500KB cold en /login |
| NFR-003 (lazy loading) | PASA | múltiples chunk-*.js (code-splitting) |
| NFR-004 (odontograma sin lag) | PASA | render interacción <4s desktop / <5s mobile (3/3 estable) |
| NFR-006..009, NFR-013 (robustez routing / SPA fallback) | PASA | URL refleja vista; deep-link hidrata; SPA fallback 200 |
| NFR-020 (contraste AA) | PASA | badges/semánticos AA; GAP-A04 OK |
| NFR-022 (touch ≥44px mobile) | FALLA (**BUG-V06** ← V01) | controles 21-36px |
| NFR-023 (íconos nav con label) | PASA | 7 links sidebar con label |

---

## Regresión Automatizada

**N/A — Ronda 1.** No existía suite previa ni `regression-results.md`; este es el primer ciclo de QA. Los 3 sub-testers GENERARON la suite inicial de `.spec.ts`. Resultados de ejecución de la suite recién creada (contra el sitio desplegado):

- **Flow:** 90/90 PASA (desktop) + 4/4 PASA (mobile-específicos).
- **Edge:** 100/100 PASA (50 desktop + 50 mobile).
- **Visual:** 45 passed + 9 skipped (los `test.fixme` que encierran el comportamiento correcto, gates post-fix de BUG-V01/V04), 0 fallos reales.

> En rondas futuras esta suite entra como regresión. Los `test.fixme` se re-habilitan al corregir BUG-V01/V04 y deben pasar para cerrar el ciclo.

---

## Tests Automatizados Generados (21 archivos .spec.ts)

### Flow Tester — `e2e/tests/flow/` (6 archivos)
- `UX-001-018-navigation-routing.spec.ts` — 21 tests (login, shell, sidebar, toggles, tabs, botón atrás, deep-linking, drawer mobile).
- `UX-020-032-critical-flows.spec.ts` — 10 tests (2 flujos críticos con persistencia tras refresh real, avanzar estado, editar pieza, navegación cruzada).
- `UX-060-067-seed.spec.ts` — 8 tests (volúmenes y plausibilidad del seed).
- `UX-080-094-interactions-persistence.spec.ts` — 13 tests (búsqueda inline, filtro, tab-fuera-del-DOM, persistencia, reset, notificaciones, cero-demo).
- `UX-routes-navigability.spec.ts` — 39 tests (38 rutas navegables + 1 sub-ruta de evento).
- `UX-093-mobile-flows.spec.ts` — 3 tests (pago y turno operables en mobile, sin scroll horizontal).

### Edge Case Tester — `e2e/tests/edge-case/` (8 archivos)
- `UX-050-DC-112-pago-monto-invalido.spec.ts` — monto inválido (vacío/0/negativo/letras), aria-invalid/min, cancelar.
- `UX-050-crear-turno-requeridos.spec.ts` — requeridos Paso 1/2, búsqueda sin match en wizard, cancelar con datos.
- `UX-017-rutas-inexistentes-deeplink.spec.ts` — ruta basura, paciente/turno inexistente, deep-link, SPA fallback, barrido.
- `UX-041-052-estados-vacios.spec.ts` — pacientes sin match (tabla vs tarjetas), pagos vacíos, avatar, tratamientos/presup/facturas/OS, odontograma 32 piezas + gap mobile.
- `UX-049-DC-104-turno-terminal.spec.ts` — turno terminal deshabilita avance, control negativo, lista del día.
- `UX-043-paginacion-limites.spec.ts` — paginación offset 12, contador "1–N de M", sin infinite scroll, prev/next.
- `UX-091-degradacion-sin-localstorage.spec.ts` — localStorage bloqueado/cuota llena: no-crash + navegación; aviso documentado.
- `UX-088-031-confirmaciones-destructivas.spec.ts` — Restablecer datos (confirma/cancela/foco), cancelar turno desde detalle.

### Visual Checker — `e2e/tests/visual/` (7 archivos)
- `DC-001-029-design-tokens.spec.ts` — 13/13 PASS (tokens, paleta, GAP-A04, semánticos, focus ring, overrides BS).
- `DC-015-018-typography.spec.ts` — 1 PASS + 5 fixme (gates post-fix de BUG-V01).
- `DC-030-035-layout-shell.spec.ts` — 6/6 PASS (shell, sidebar, header, footer, login, no-encontrado).
- `DC-050-077-components.spec.ts` — 8/8 PASS (badges, avatar, stack +N, tablas, tabs, ficha, odontograma, empty-state).
- `DC-080-089-responsive.spec.ts` — 6/6 PASS (sidebar→drawer, tabla→cards, ficha mobile, tabs scroll, sin scroll-x 3 BP).
- `BVC-NFR-brief-compliance.spec.ts` — PASS desktop+mobile (BVC-027 tracking/demo, BVC-018/011/012, NFR perf/a11y).
- `DC-021-071-072-073-known-bugs.spec.ts` — fixme (gates de regresión de BUG-V01/E02/V04/V06 hasta el fix).

### Infra compartida (generada por Flow, reutilizada por Edge y Visual)
- `e2e/playwright.config.ts` (baseURL = sitio desplegado; proyectos desktop-chromium + mobile-chromium).
- `e2e/tests/_helpers/seed.ts` (warm-seed, lectura de estado, parser ARS).

---

## GIFs de Flujos (para la demo del cliente)

- `output/iterations/visual-build/gifs/flujo-crear-turno.gif` — crear turno 3 pasos end-to-end (DEMO-015).
- `output/iterations/visual-build/gifs/flujo-registrar-pago.gif` — registrar pago / flujo firma end-to-end (DEMO-016).
- `output/iterations/visual-build/gifs/recorrido-shell.gif` — recorrido del shell (Reportes → Agenda → Pacientes → ficha → tabs).

---

## Observaciones (no son BUG — desvíos menores documentados)

- **OBS-F02 (UX-005):** el toggle "Día" navega a `/agenda/dia` (ruta propia legítima) en vez de `?vista=dia`. Defendible; no rompe flujo. Cosmético.
- **OBS-F03 (UX-006/020):** el detalle de turno vive en `/agenda/:id` (ej. `/agenda/tur-008`) en lugar de `/agenda/turno/:id`. Ruta dedicada real, no modal → cumple la intención. No es bug.
- **OBS-F04 (DOM):** en lista de pacientes, vista Tabla y Cards se renderizan ambas (una oculta por CSS) → nombre duplicado en DOM. La lógica de filtro es correcta. Higiene de DOM/responsive.
- **Doble `<h1>` en la ficha (Visual):** `<h1>` del header (módulo) + `<h1>` del nombre. DC-074 exige el nombre como `<h1>` (cumple); el header es `<h1>` app-wide. No es violación dura; informativo.
- **Coherencia del seed (Visual, nota de alcance):** `pac-001` "Bautista Álvarez" figura con "1 años · nacido 19/05/2025" + DNI. Es coherencia de datos (UX-061/062), no de la capa visual — corresponde verificar al Flow Tester en una próxima ronda si se considera defecto.

---

## Próximo paso (para el PM)

Hay 7 bugs a corregir → **lanzar ciclo de corrección (Ronda 2)**:
- **Developer:** BUG-V01 (CSP/index.html — raíz, prioridad), BUG-F01 (routing catálogo), BUG-E01, BUG-E03, BUG-E04, BUG-E06.
- **UI Developer:** confirmar estilos tras swap de BUG-V01, BUG-V04 (`aria-selected` en tabs).

Tras el fix, en la Ronda 2 se re-verifican manualmente los criterios FALLA/afectados, se re-habilitan los `test.fixme` (DC-015..018, DC-021/071/072/073) y se corre la regresión automatizada completa. **Gate de salida: 0 bugs + 0 bloqueados + 100% criterios cubiertos + 100% criterios PASA con test automatizado.**
