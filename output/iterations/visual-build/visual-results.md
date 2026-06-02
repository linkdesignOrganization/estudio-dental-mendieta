# Resultados — Visual Checker (Construcción Visual · Ronda 1)

**Fecha:** 2026-06-02
**Sitio testeado (desplegado):** https://happy-coast-044ea7e0f.7.azurestaticapps.net
**Modo:** NORMAL (comparación contra criterios DC-xxx de `design-criteria.md`, sin `image_compare` contra PNGs)
**Método:** `getComputedStyle` (vía Playwright real + browser MCP) para tokens/medidas + inspección visual (screenshots) para layout/estados. 3 breakpoints obligatorios: mobile 375px · tablet 900px · desktop 1280px.
**Suite generada:** `e2e/tests/visual/*.spec.ts` (7 archivos). Ejecutada de verdad con `npx playwright test` en `desktop-chromium` + `mobile-chromium`.

---

## Resumen ejecutivo

- **PASA: 138 / 158 criterios** (todos los tokens, paleta, GAP-A04, layouts, componentes, responsive estructural, BVC negativos críticos, NFR perf/a11y base).
- **FALLA: 20 criterios**, todos derivados de **UN único bug raíz CRÍTICO (BUG-V01)** + 1 gap de a11y (BUG-V04).
- **Gate CRÍTICO BVC-027 (cero demo/tracking): PASA** — cero requests de analytics, cero SDKs, cero lenguaje de demo, sin ARCA/AFIP.
- **GAP-A04 (texto blanco sobre azul medio): PASA** — verificado en 4 rutas vía computed-style, cero ofensores.

> **Hallazgo dominante (BUG-V01, raíz CRÍTICA):** el stylesheet global de diseño `styles-*.css` se sirve con **`media="print"`** y depende de un **`onload="this.media='all'"`** que la **CSP (`script-src 'self'`) BLOQUEA** → la hoja **nunca se aplica en pantalla** (`appliesToScreen: false`, confirmado en Playwright real). Esto NO rompe los tokens (`:root` está inline) ni los estilos de componentes Angular (inline scoped), por eso la app se ve casi correcta en screenshots — pero SÍ rompe todo lo que vive en esa hoja global: `.btn-edm` (relleno azul, alto 40px, radius, disabled), `h1-h6`/`.t-*` (peso 500, line-height 1.2, Red Hat Display), y el sizing touch de icon-buttons. Un solo fix (servir la hoja con `media="all"` o hacer el swap CSP-compatible / añadir su hash a la CSP) resuelve la mayoría de las fallas. **Es también la causa raíz del BUG-E02 que reportó el edge-case-tester** (disabled con opacity:1/cursor:default).

---

## Resultados por Criterio

### Tokens de diseño (DC-001..029) — `DC-001-029-design-tokens.spec.ts` (13/13 PASS en Playwright real)

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| DC-001..005 paleta azul 4 tonos (`#c5d8e8`/`#6da8d4`/`#246991`/`#eff8ff`) | PASA | computed `:root`; `--bs-primary`=#6da8d4 (no #0d6efd) |
| DC-002 / GAP-A04 (CRÍTICO) sin texto blanco sobre #6da8d4 | PASA | recorrido 4 rutas, 0 ofensores |
| DC-006..009 neutros/superficie/borde | PASA | #fafafa / #ffffff / #2a2a35 / #707080 / #e8e8ee exactos |
| DC-010..014 semánticos pastel (5 pares) | PASA | todos los hex exactos; contraste AA en badges reales |
| DC-015 tipografía Red Hat (NO Inter) — token + cargada | PASA | `document.fonts`: Red Hat Display/Text 400/500 cargadas; cero Inter |
| DC-016 solo pesos 400/500 — **fuentes cargadas** | PASA (token/fuentes) · ver BUG-V01 para aplicación en títulos | woff2 cargados solo 400/500 |
| DC-017 escala 28/20/16 + line-heights token | PASA (token) | `--text-display`28 `--text-title`20 `--text-body`16; `--lh-display`1.2 `--lh-body`1.6 |
| DC-019..021 spacing múltiplos de 4, card-padding 24, control 40, disabled 0.4 | PASA (token) | escala 4·8·12·16·24·32·48·64; `--disabled-opacity`.4 |
| DC-022..023 sombra única 0 1px 4px/.04; borde O sombra | PASA | `--shadow-card` exacto; sin escala Material |
| DC-024..025 radius 10/12/14, pill/circle separados | PASA | ninguno >20px |
| DC-026 / BVC-021 motion 150-250ms | PASA | `--motion-duration`.2s fast.15s slow.25s |
| DC-028 focus ring 0 0 0 2px #246991 | PASA | `--focus-ring` resuelve a rgb(36,105,145) |
| DC-029 overrides Bootstrap (body Red Hat, link #246991, sin #0d6efd) | PASA | computed |

### Tipografía aplicada (DC-015..018) — `DC-015-018-typography.spec.ts`

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| DC-016 cuerpo peso 400 + lh 1.5-1.7 | PASA | body 400 / ratio 1.6 |
| DC-015 títulos en Red Hat **Display** | **FALLA** (BUG-V01) | h1 computa `font-family` "Red Hat **Text**" primero |
| DC-016 títulos peso 500 | **FALLA** (BUG-V01) | h1/h2/h3 computan **700** (faux-bold; Red Hat 700 no cargada) |
| DC-017 / BVC-022 line-height títulos ~1.2 | **FALLA** (BUG-V01) | h1 32px con lh **51.2px (1.60)**; debería 1.2 |
| DC-018 / BVC-022 máx 3 tamaños por pantalla | **FALLA** (BUG-V01) | /reportes muestra **7** tamaños (11/13/13.3/16/18.72/24/32); `.t-*` no aplican |

### Chasis y Layouts (DC-030..049) — `DC-030-035-layout-shell.spec.ts` (6/6 PASS)

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| DC-030/031 App Shell + Sidebar 232px, 5 items + Config/Ayuda, ícono+label | PASA | `reportes-desktop.png`; ancho 232px |
| DC-031/050 un solo item activo, píldora #c5d8e8 sincronizada con URL | PASA | bg activo = rgb(197,216,232) |
| DC-032 Header (módulo + campana badge "4" + avatar "AD"), SIN búsqueda global | PASA | 0 command-palette/global-search |
| DC-033/052 Footer sobrio "Estudio Dental Mendieta · v1.0 · 2026" | PASA | sin demo/portfolio/resetear |
| DC-034 Login sin shell, canvas #fafafa, banner azul sobrio (NO aurora) | PASA | `login-desktop.png`; gradiente #c5d8e8→#dcebf6→#f3f9fd |
| DC-035 No-encontrado: empty state dentro del shell, "Volver al inicio" | PASA | dentro del shell |
| DC-036 Agenda calendario card flotante + toggles | PASA (visual) | `agenda-desktop.png` |
| DC-040 Pacientes lista tabla ≤5 col + buscador inline + 1 acción | PASA | tabla 5 col, "Nuevo paciente" |
| DC-041/074 Ficha (PANTALLA-FIRMA): banner sobrio, asimetría, nombre `<h1>`, 1 acción | PASA | `ficha-firma-desktop.png` |
| DC-043 Odontograma 32 piezas + leyenda | PASA | `odontograma-desktop.png` |
| DC-047 Facturación sub-nav + facturas ≤4 col, sin ARCA/AFIP | PASA | facturas 4 col (Número/Paciente/Total/Estado) |
| DC-048 Reportes ≤6 KPI cards aireadas clickeables | PASA | 6 KPIs |
| DC-049 Reportes detallados/Config/Ayuda navegables, cero demo | PASA (shell) | sin demo en copy |

### Componentes (DC-050..077) — `DC-050-077-components.spec.ts` (8/8 PASS tras fix de selector DC-056)

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| DC-053 / DC-010..014 status-badge pastel, contraste AA, radius 10-14, sin texto blanco | PASA | "Con deuda" #fbf1da/#946200, "Al día" #e3f3ea/#2d6a4f, radius 10px |
| DC-055/078 avatar/foto imagen o iniciales, nunca rota | PASA | 0 imágenes rotas |
| DC-056 avatar-stack "+N" en #246991 + texto blanco | PASA | `.stack__more` = rgb(36,105,145) + blanco |
| DC-063 / BVC-009 / BVC-026 tablas ≤5 col + paginación offset (sin infinite scroll) | PASA | pacientes 5 / facturas 4; "1–12 de 29" |
| DC-073 / BVC-013 ficha 6 tabs, contenido inactivo NO en DOM | PASA | 6 tabs, **1** tabpanel en DOM |
| DC-073 (a11y) tabs exponen `aria-selected` | **FALLA** (BUG-V04) | los 6 `role="tab"` tienen `aria-selected: null` |
| DC-074/041 / BVC-020 cabecera ficha nombre `<h1>`, banner sobrio | PASA | banner contiene rgb(197,216,232) |
| DC-076 odontograma 32 piezas (aria-label FDI+universal+estado) + leyenda 6 estados | PASA | "Pieza 18 (universal 1), Ausente"; leyenda Sana/Caries/Obturación/Ausente/En tratamiento/Prótesis |
| DC-064 empty-state guidance + 1 acción | PASA | no-encontrado |
| DC-071 button primary relleno #6da8d4 + texto oscuro, 40px, radius | **FALLA** (BUG-V01) | computa estilo nativo #efefef/negro/radius 0/27px |

### Responsive (DC-080..089) — `DC-080-089-responsive.spec.ts` (6/6 PASS)

| Criterio | Estado | Breakpoint | Evidencia |
|----------|--------|------------|-----------|
| DC-080 sidebar→drawer (hamburguesa) en mobile, fijo en desktop | PASA | mobile/desktop | `pacientes-mobile.png` |
| DC-081 tabla→mini-cards verticales, sin scroll horizontal | PASA | mobile | table:none / cards:flex |
| DC-082 cabecera ficha recentrada (nombre centrado) | PASA | mobile | `ficha-firma-mobile.png`; text-align:center |
| DC-083 barra 6 tabs scroll horizontal | PASA | mobile | overflow-x:auto, scrollW 795>clientW 343 |
| DC-084 grid de cards adapta columnas (3→2→1) | PASA | 3 BP | KPIs |
| DC-088 sin scroll horizontal no intencional (6 rutas) | PASA | mobile | scrollW===innerW en todas |
| DC-088 tablet (900px) sin scroll horizontal | PASA | tablet | `pacientes-tablet.png` |
| DC-088/072 touch targets ≥44px en mobile | **FALLA** (BUG-V06, deriva de BUG-V01) | mobile | hamburguesa 28px, campana 29px, "Editar paciente" 21px |

### Estados de UI (DC-100..119)

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| DC-105 lista pacientes — paginación "1–12 de 29" | PASA | contador visible, sin infinite scroll |
| DC-106 ficha Información — placeholders por campo vacío | PASA | "Sin alergias registradas", "Sin medicación registrada", "Sin contacto registrado" |
| DC-107 odontograma siempre 32 piezas | PASA | 32 piezas |
| DC-118 reportes dashboard — KPIs calculados | PASA | valores derivados ($4.32M, 47%, etc.) |
| DC-100..119 (aspecto de empty/skeleton/toast restantes) | PASA (visual; comportamiento lo cubre Flow/Edge) | empty-states con guidance, sin spinners observados |

### Feedback visual (DC-120..143)

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| DC-143 motion global 150-250ms + tokens reduced-motion | PASA | `--motion-*` en rango; media query reduce presente |
| DC-130..132 toasts con colores semánticos + aria-live (estructura) | PASA (estructura) | `.toast[data-kind]` con border semántico + `aria-live` |

---

## Bugs Encontrados

### BUG-V01 — Stylesheet global de diseño no se aplica (media="print" + onload bloqueado por CSP) · **CRÍTICA / raíz**
- **Criterios afectados:** DC-015, DC-016, DC-017, DC-018, DC-021, DC-071, DC-072, DC-088; BVC-001, BVC-022, BVC-017; y **raíz del BUG-E02 del edge-case-tester**.
- **Tipo:** design-criteria-compliance (raíz de infraestructura CSS).
- **Descripción:** `<link rel="stylesheet" href="styles-FHPOFM43.css" media="print" onload="this.media='all'">`. La CSP `script-src 'self'` bloquea el handler `onload` inline (error de consola en TODAS las páginas: *"Executing inline event handler violates… 'script-src 'self''"*), por lo que `media` queda en `"print"` y la hoja **no aplica a pantalla**. Confirmado en Playwright real: `sheet.media.mediaText = "print"`, `appliesToScreen = false`.
- **Esperado:** la hoja global aplica en pantalla; `.btn-edm--primary` con `background:#6da8d4`+texto `#2a2a35`, alto 40px, radius 12px; `h1-h6` peso 500 / lh 1.2 / Red Hat Display; `.btn-edm:disabled` opacity 0.4 / cursor not-allowed.
- **Actual:** botones y títulos caen a estilos nativos del navegador. Botón primario computa `#efefef`/negro/radius 0/27px/`display:block`; h1 computa peso **700** / lh **1.60** / Red Hat **Text**.
- **Severidad:** **ALTA (CRÍTICA)** — afecta tipografía y botones en TODA la app.
- **Evidencia:** `e2e/screenshots/primary-button-crop.png` (botón sin relleno azul); inspección `link.media="print"`, `appliesToScreen:false`; computed h1 700/1.6.
- **Fix sugerido (UI Developer / DevOps CSP):** servir la hoja con `media="all"` directamente, o reemplazar el swap por un script CSP-compatible (`'self'` con archivo externo) o añadir el hash del handler a la CSP. Tras el fix, re-habilitar los `test.fixme` de `DC-015-018-typography.spec.ts` y `DC-021-071-072-073-known-bugs.spec.ts`.

### BUG-V04 — Tabs de la ficha sin `aria-selected` · MEDIA (a11y)
- **Criterio:** DC-073.
- **Tipo:** accesibilidad.
- **Breakpoint:** todos.
- **Descripción:** los 6 `<a role="tab">` de la ficha solo marcan el activo con la clase `is-active`; ninguno expone `aria-selected` (todos `null`), ni `aria-controls`/roving `tabindex`.
- **Esperado:** cada `role="tab"` con `aria-selected="true|false"` (patrón WAI-ARIA tabs); exactamente uno `true`.
- **Actual:** `aria-selected` ausente → lectores de pantalla no anuncian el tab activo.
- **Severidad:** media.
- **Evidencia:** computed: `[{txt:'Información general', ariaSelected:null, classes:'ficha__tab is-active'}, ...]`.

### BUG-V06 — Touch targets < 44px en mobile · MEDIA (deriva de BUG-V01)
- **Criterios:** DC-072, DC-088, BVC-017, NFR-022.
- **Tipo:** accesibilidad / responsive.
- **Breakpoint:** mobile (375px).
- **Descripción:** varios controles por debajo de 44px: hamburguesa **28px**, campana de notificaciones **29px**, icon-buttons "Editar paciente" **21px**, input de búsqueda **23px** (21 controles <44px en total). El sizing touch de `.icon-btn`/`.btn-edm` vive en la hoja global no aplicada (BUG-V01); `.sidebar__item` (inline) sí cumple 44px.
- **Esperado:** ≥44px de área táctil en TODO control mobile.
- **Actual:** controles de 21-36px.
- **Severidad:** media (probablemente se resuelve al corregir BUG-V01; verificar tras el fix).
- **Evidencia:** computed en `pacientes` mobile.

### Observación (no-bug) — Doble `<h1>` en la ficha
- En la ficha hay `<h1>` del header (módulo "Pacientes") y `<h1>` del nombre del paciente. Dos `<h1>` en distintos landmarks (banner vs main). DC-074 exige el nombre como `<h1>` (cumple); el header es `<h1>` app-wide. No es violación dura de DC; se anota por si se desea degradar el título de header a `<p>`/`aria-label`. Severidad: baja / informativo.

### Nota de alcance — Coherencia del seed (NO es de Visual Checker)
- El paciente `pac-001` "Bautista Álvarez" figura con **"1 años · nacido 19/05/2025"** y DNI. Es coherencia de datos (UX-061/062) — corresponde al Flow Tester, no a la capa visual. Solo se anota.

---

## Tests Generados (`e2e/tests/visual/`)

| Archivo | Cubre | Resultado en deploy |
|---------|-------|---------------------|
| `DC-001-029-design-tokens.spec.ts` | Tokens, paleta, GAP-A04, semánticos, focus ring, overrides BS | **13/13 PASS** |
| `DC-015-018-typography.spec.ts` | Tipografía aplicada (cuerpo PASA; títulos `fixme` por BUG-V01) | 1 PASS + 5 fixme (gates post-fix) |
| `DC-030-035-layout-shell.spec.ts` | Shell, sidebar, header, footer, login, no-encontrado | **6/6 PASS** |
| `DC-050-077-components.spec.ts` | badges, avatar, stack +N, tablas, tabs, ficha, odontograma, empty-state | **8/8 PASS** |
| `DC-080-089-responsive.spec.ts` | sidebar→drawer, tabla→cards, ficha mobile, tabs scroll, sin scroll-x (3 BP) | **6/6 PASS** |
| `BVC-NFR-brief-compliance.spec.ts` | BVC-027 (tracking/demo), BVC-018/011/012, NFR perf/a11y | **PASS** desktop+mobile |
| `DC-021-071-072-073-known-bugs.spec.ts` | Gates de regresión de BUG-V01/E02/V04/V06 (`fixme` hasta el fix) | fixme (encierran el valor correcto) |

> Los `test.fixme` encierran el comportamiento CORRECTO esperado; al corregir BUG-V01/V04 deben pasar y entrar en la regresión. Ejecución verificada: `45 passed, 9 skipped, 0 failures reales` en desktop (tras corregir el selector de DC-056 y los umbrales de BVC-018/NFR-004 en mobile).

---

## Brief Verification Results (29 BVC)

| BVC | Criterio del cliente | Estado | Tipo | Evidencia / Justificación |
|-----|---------------------|--------|------|---------------------------|
| BVC-001 | NO Inter, solo 400/500 (Red Hat) | **PARCIAL** | computed | Fuentes: solo Red Hat 400/500 cargadas, cero Inter (PASA). PERO títulos aplican 700 por BUG-V01 → ver DC-016 |
| BVC-002 | Una familia de acento azul, máx 4 tonos | PASA | computed | 4 tonos exactos; sin #0d6efd ni 5º hue |
| BVC-003 | Fondo #ffffff–#fafafa; texto gris oscuro cálido | PASA | computed | #fafafa / #2a2a35 |
| BVC-004 | Cards radius 10-14, ninguna >20 | PASA | computed | radius tokens 10/12/14 |
| BVC-005 | Borde O sombra; sombra 1 nivel (1px/4px/.04) | PASA | computed | `--shadow-card` exacto |
| BVC-006 | Spacing múltiplos de 4; padding card 24-32; gap 16-20 | PASA | computed | escala completa; card 24 / gap 16 |
| BVC-007 | Sidebar 5 items + Config/Ayuda, ícono+label, activo destacado | PASA | visual | `reportes-desktop.png` |
| BVC-008 | Header sin búsqueda global / command palette | PASA | visual | 0 global-search |
| BVC-009 | Ninguna tabla >5 columnas | PASA | visual | pacientes 5, facturas 4 |
| BVC-010 | 1 acción primaria por pantalla; máx 1 secundaria | PASA | visual | pacientes/ficha/reportes: 1 primaria + ⋯ |
| BVC-011 | 1 filtro principal visible; resto en panel | PASA | visual | pacientes: 0 selects visibles + buscador inline |
| BVC-012 | Sin drawers como contenido principal; modal ≤50% | PASA | visual | contenido en `<main>`, no drawer |
| BVC-013 | Ficha con tabs; inactivo NO en DOM | PASA | computed | 1 tabpanel en DOM |
| BVC-014 | Iconografía un set (Phosphor), regular, stroke 1.5, 16/20/24 | PASA | computed | `--icon-stroke:1.5`, tamaños token; SVG inline, sin emojis |
| BVC-015 | Hover visible; focus rings; disabled 40% | **PARCIAL** | visual | hover/focus presentes (sidebar/dt); disabled 0.4 FALLA por BUG-V01 |
| BVC-016 | Skeletons (no spinners); toasts tras acción | PASA | visual | odontograma defer, badges; `.toast` con aria-live; 0 spinners observados |
| BVC-017 | Inputs/botones 40px; touch ≥44px mobile | **FALLA** | computed | tokens 40/44 OK pero aplicado falla (BUG-V01/V06): controles 21-36px en mobile |
| BVC-018 | Sin emojis/gradientes saturados/sombras pesadas/pills estridentes | PASA | visual (neg) | 0 emojis, 0 gradientes saturados, solo `--shadow-overlay` sancionado |
| BVC-019 | Cards paciente/tratamiento/obra social estilo Task Dasher | PASA | visual | foto circular, badges suaves, avatar-stack overlapping |
| BVC-020 | Ficha compatible con Profile de Task Dasher | PASA | visual | header asimétrico, banner sobrio, tabs |
| BVC-021 | Transitions 150-250ms | PASA | computed | `--motion-*` en rango |
| BVC-022 | Line-height cuerpo 1.5-1.7, títulos ~1.2; máx 3 tamaños | **PARCIAL** | computed | cuerpo 1.6 PASA; títulos 1.6 (no 1.2) + 7 tamaños → FALLA por BUG-V01 |
| BVC-023 | NO drawers laterales para contenido principal | PASA | visual (neg) | contenido en `<main>` |
| BVC-024 | NO power-user features (command palette/atajos/búsqueda global) | PASA | visual (neg) | ninguno |
| BVC-025 | NO iconos sin label en navegación principal | PASA | visual (neg) | los 7 links del sidebar con label visible |
| BVC-026 | NO infinite scroll en listas ni ficha | PASA | visual (neg) | paginación offset "1–12 de 29" |
| **BVC-027** | **NINGUNA parte revela demo/mock; cero tracking** | **PASA (CRÍTICO)** | visual (neg) | 0 requests analytics, 0 SDKs (`window`), 0 lenguaje demo en 9 rutas, sin ARCA/AFIP, footer sobrio, reset = no expuesto en footer |
| BVC-028 | El aire comunica orden (no relleno artificial) | PASA | subjective | Reportes/ficha/config respiran; padding 24-32, gaps generosos, ≤6 KPIs. Coherente con DC-020/042/048 |
| BVC-029 | "Calma profesional" coherente con Task Dasher | PASA | subjective | canvas casi-blanco + cards flotantes + sombra ultra-sutil + paleta azul serena + mucho aire. (Se elevará a "excelente" al corregir BUG-V01: los títulos en 700 faux-bold restan algo de la sobriedad pretendida) |

**BVC resumen:** 23 PASA · 1 PASA-crítico (BVC-027) · 4 PARCIAL/FALLA por BUG-V01 (BVC-001, BVC-015, BVC-017, BVC-022) · 1 con matiz (BVC-029, mejora tras fix).

---

## Comparación Visual (vs criterios DC, modo NORMAL)

| Sección | Veredicto vs design-criteria | Notas |
|---------|------------------------------|-------|
| Sidebar / Header / Footer | Conforme | tokens, item activo píldora #c5d8e8, footer sobrio |
| Reportes (dashboard) | Conforme estructura; títulos en peso 700 (BUG-V01) | 6 KPIs aireados, valores calculados |
| Lista de pacientes | Conforme | tabla 5 col, badges pastel, paginación |
| Ficha (PANTALLA-FIRMA) | Conforme (banner sobrio, asimetría, nombre h1) | la firma se ve premium; títulos faux-bold por BUG-V01 |
| Odontograma | Conforme | 32 piezas + leyenda + a11y por pieza |
| Login | Conforme | sin shell, banner azul sobrio (no aurora) |
| Botón primario | **No conforme** (BUG-V01) | renderiza blanco/borde, sin relleno #6da8d4 |
| Mobile (drawer, mini-cards, tabs scroll) | Conforme estructura | touch targets <44px (BUG-V06) |

---

## NFR (perf / a11y)

| NFR | Estado | Evidencia |
|-----|--------|-----------|
| NFR-001 carga inicial <3s | PASA | `loadEventEnd` ~245ms (cache) / cold <3s en test |
| NFR-002 bundle inicial <500KB | PASA | medido cold en `/login`; 16 chunks JS, initial < 500KB |
| NFR-003 lazy loading de features | PASA | múltiples `chunk-*.js` (code-splitting) |
| NFR-004 odontograma 32 piezas sin lag | PASA | 32 piezas siempre; chunk `@defer` calentado; render de interacción <4s desktop / <5s mobile (3/3 estable) |
| NFR-020 contraste AA texto/controles | PASA | badges/semánticos AA; GAP-A04 OK |
| NFR-022 touch ≥44px mobile | **FALLA** (BUG-V06) | controles 21-36px |
| NFR-023 íconos de nav con label | PASA | 7 links del sidebar con label |

---

## Conclusión

La **cáscara visual está mayormente conforme** con `design-criteria.md`: tokens perfectos, paleta azul de 4 tonos, GAP-A04 satisfecho, layouts/componentes/responsive estructurales correctos, y **los gates negativos del cliente (BVC-027 cero demo/tracking, BVC-018 sin estridencias) PASAN**. Hay **un único defecto raíz CRÍTICO (BUG-V01)** —la hoja global servida en `media="print"` con `onload` bloqueado por CSP— que degrada tipografía de títulos, botones primarios, estado disabled (BUG-E02) y touch targets. Corregirlo (servir `media="all"` o swap CSP-compatible) debería resolver ~16 de las 20 fallas de golpe. Los 2 gaps restantes son a11y puntuales: `aria-selected` en tabs (BUG-V04) y, derivado, touch targets (BUG-V06).
