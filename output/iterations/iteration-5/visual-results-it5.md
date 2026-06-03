# Resultados — Visual Checker · Iteración 5 (Facturación + Pagos + Reportes — ÚLTIMA) · Ronda 1

- **Modo:** NORMAL (verificación contra DC-xxx + computed styles; sin image_compare).
- **URL desplegada testeada:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (bundle `main-5NSLIGIB.js`).
- **Fecha de corrida:** 2026-06-03 · Hoy del viewcase: 2026-06-01.
- **Projects:** `desktop-chromium` (1280×900) + `mobile-chromium` (Pixel 5 / 390–393px).
- **Resultado de la corrida:** **32/32 PASSED** (16 tests × 2 projects). 0 fallos, 0 bloqueados.
- **Bugs visuales:** **0**.

Foco del plan cumplido: los 4 reportes muestran gráficos con **GEOMETRÍA real** (no vacíos/placeholders), cada chart en **card aireada SEPARADA** (radius 12–14, sombra-O-borde, gap 20px), montos en **ARS compacto**, **skeletons (no spinner)** al cargar/cambiar de reporte, y **responsive en mobile sin scroll horizontal**. Campo `#pay-date` con `max=hoy`, pago y presupuesto-detalle usables en mobile (≥44px).

---

## Resultados por Criterio

| Criterio | Estado | Breakpoint | Evidencia |
|----------|--------|------------|-----------|
| REQ-235 (KPI grid responsive, ≤6 cards, sin scroll-x) | PASA | desktop (3 col) / mobile (1 col) | `e2e/screenshots/it5/REQ-235-kpi-dashboard-mobile.png` |
| REQ-236 (KPI alcanzable+activable por teclado, focus ring 2px #246991) | PASA | desktop / mobile | spec (computed `boxShadow` + Enter navega) |
| REQ-237..244 — geometría REAL pacientes (line, bar, bar, hbar, hbar = 5) | PASA | desktop / mobile | spec `auditCharts` |
| REQ-237..244 — geometría REAL tratamientos (bar, hbar, hbar, donut = 4) | PASA | desktop / mobile | `e2e/screenshots/it5/REQ-237-244-tratamientos-charts-desktop.png` |
| REQ-237..244 — geometría REAL financiero (line, hbar, bar, bar, donut = 5) | PASA | desktop / mobile | `e2e/screenshots/it5/REQ-237-244-financiero-charts-desktop.png` |
| REQ-237..244 — geometría REAL productividad (hbar, bar, donut = 3) | PASA | desktop / mobile | spec `auditCharts` |
| REQ-237..244 — cada chart en card aireada SEPARADA (1 figura/card, radius 10–14, sombra O borde, gap 16–20) | PASA | desktop / mobile | spec (computed) + screenshots |
| REQ-242 — ARS compacto en charts financieros (`$ N,N M` / `$ NNN K` / `$ NN.NNN`) | PASA | desktop / mobile | `e2e/screenshots/it5/REQ-237-244-financiero-charts-desktop.png` |
| REQ-245 — `.charts` 2 col (desktop) → 1 col (mobile) sin scroll-x; geometría intacta en mobile | PASA | desktop (2 col) / mobile (1 col) | spec (gridTemplateColumns) |
| REQ-245 — los 4 reportes detallados a 390px sin scroll horizontal | PASA | mobile | spec (scrollWidth==innerWidth) |
| REQ-246 — skeleton "Cargando reporte" al entrar a un reporte (NO spinner) | PASA | desktop / mobile | spec (MutationObserver atómico) |
| REQ-246 — skeleton "Cargando indicadores" al "Actualizar" el dashboard (NO spinner) | PASA | desktop / mobile | spec (MutationObserver atómico) |
| REQ-246 — ningún `.spinner` en dashboard/reportes; sin `chart-empty` con el seed | PASA | desktop | spec (recorrido 5 rutas) |
| REQ-260 — `#pay-date` `type=date` + `label[for] "Fecha"` + `max=2026-06-01` + valor inicial poblado | PASA | desktop | `e2e/screenshots/it5/REQ-260-263-pago-form-mobile.png` |
| REQ-263 — pago en mobile: 1 col, `#pay-date`/`#pay-amount`/Confirmar/Cancelar ≥44px, column-reverse, sin scroll-x | PASA | mobile | `e2e/screenshots/it5/REQ-260-263-pago-form-mobile.png` |
| REQ-215 — presupuesto detalle en mobile: 1 col, acción primaria/secundaria ≥44px, column-reverse, sin scroll-x | PASA | mobile | `e2e/screenshots/it5/REQ-215-presupuesto-detalle-mobile.png` |

**Anti-demo (REQ-272):** barrido en reportes, form de pago y detalle de presupuesto → **sin coincidencias** con `/\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i`. PASA transversal.

---

## Bugs Encontrados

**Ninguno.** 0 bugs visuales. La cáscara de It5 cumple los DC-xxx asignados en los 3 breakpoints.

> Nota de autoría (no es bug de producto): 4 tests fallaron en la 1ª corrida por timing de test (montaje escalonado `edm-rise-in` de las chart-cards + ventana transitoria del skeleton ~450ms). Se corrigieron en el spec con esperas web-first (`toHaveCount`) y captura atómica del skeleton (MutationObserver instalado y acción disparada en el mismo `page.evaluate`, resuelto vía `waitForFunction`). El producto siempre estuvo correcto; la corrida final es 32/32 verde.

---

## Tests Generados

Todos en `e2e/tests/visual/` (reutilizan `playwright.config.ts` + helpers `_helpers/seed.ts`; corren en ambos projects):

- `e2e/tests/visual/REQ-237-244-report-charts-geometry.spec.ts` — geometría real por tipo de los 4 reportes (bar/hbar/line/donut, conteo por reporte), cards aireadas SEPARADAS (radius/sombra-O-borde/gap), ARS compacto (REQ-242), responsive 2→1 col + sin scroll-x mobile (REQ-245), anti-demo. **7 tests × 2 projects.**
- `e2e/tests/visual/REQ-235-236-246-kpi-skeleton.spec.ts` — KPI grid responsive (REQ-235), KPI teclado + focus ring (REQ-236), skeletons "Cargando reporte"/"Cargando indicadores" sin spinner (REQ-246), ausencia de `.spinner`/`chart-empty`. **5 tests × 2 projects.**
- `e2e/tests/visual/REQ-260-263-215-pago-presupuesto-mobile.spec.ts` — `#pay-date` (type=date, max=hoy, label, valor inicial) (REQ-260), pago mobile ≥44px/1 col/column-reverse (REQ-263), presupuesto detalle mobile ≥44px/1 col (REQ-215), anti-demo. **3 tests × 2 projects.**

**Total: 16 tests × 2 projects = 32 casos.**

Evidencia (PNGs de hito) en `e2e/screenshots/it5/`:
- `REQ-237-244-financiero-charts-desktop.png` — line + hbar (ARS) + bar (ARS) + bar + donut, cards separadas.
- `REQ-237-244-tratamientos-charts-desktop.png` — bar + hbar + hbar + donut ("29%").
- `REQ-235-kpi-dashboard-mobile.png` — 6 KPI cards apiladas en 1 columna.
- `REQ-260-263-pago-form-mobile.png` — form de pago 1 col, Fecha (date picker nativo), botones full-width column-reverse.
- `REQ-215-presupuesto-detalle-mobile.png` — detalle 1 col (header + Válido hasta + Tratamientos + Total + Condiciones).

---

## Comparación Visual

| Sección | Geometría / Nivel vs Design System (DC-048/049/119) | Notas |
|---------|------------------------------------------------------|-------|
| Reporte financiero | Premium — line con área de relleno + 4 gráficos más, cards blancas flotantes separadas | ARS compacto correcto (`$ 3,3 M` … `$ 92.000`); grid 2 col 482px + gap 20px |
| Reporte tratamientos | Premium — bar/hbar/hbar + donut con arco y "29%" central | 4 cards aireadas; no se ve genérico/template |
| Reporte pacientes | Premium — line + 2 bar + 2 hbar, aria-labels con datos reales | 5 cards |
| Reporte productividad | Premium — hbar + bar + donut | 3 cards |
| Dashboard KPI | ≤6 cards clickeables (valores calculados: 13 / 7 / 14 / `$ 4.32 M` / `$ 2.00 M` / `$ 3.37 M`) | 3 col desktop → 1 col mobile; focus ring azul profundo |
| Form de pago (mobile) | Limpio, 1 col, controles 294×44, Fecha con date-picker nativo | column-reverse (primaria arriba) |
| Presupuesto detalle (mobile) | 1 col, badge pastel "Pendiente", Condiciones en surface bordeado | acciones 294×44, column-reverse |

> No se usó `mcp__image_compare` (modo NORMAL): la verificación es contra los DC-xxx por computed styles + geometría SVG/CSS real, no contra referencias pixel a pixel.

---

## Detalle del contrato verificado en vivo (para trazabilidad/regresión)

**Geometría de charts (selectores de `mini-chart.component.ts`):**
- `bar`  → `.mc__bar[style*="height:%"]` (≥2 barras, máx > 0). Ej. financiero "Deuda por antigüedad": 57% / 71% / 17% / 100%.
- `hbar` → `.mc__hfill[style*="width:%"]` (≥2 rellenos, máx > 0) + `.mc__hval` ARS.
- `line` → `polyline.mc__line-path[points]` (≥2 puntos; hay además `polyline.mc__line-area` de relleno → se targetea `.mc__line-path` específicamente).
- `donut` → `circle.mc__donut-arc[stroke-dasharray]` (>0) + `.mc__donut-num` con "%". Ej. financiero "Tasa de cobranza" dasharray=289.02, "100%".
- Conteo por reporte: **pacientes 5 · tratamientos 4 · financiero 5 · productividad 3** (`main figure.mc`).

**Cards de chart:** `article.surface-card.chart-card` (1 `figure.mc` cada una) · radius **12–14px** · padding **24px** · box-shadow `rgba(42,42,53,0.04) 0 1px 4px` · border-top **0px** (DC-023 borde-O-sombra) · grid `.charts` gap **20px**, `482px 482px` @1280px → `358px` (1 col) @390px.

**ARS compacto (REQ-242):** `$ 3,3 M` · `$ 2,2 M` · `$ 1,8 M` · `$ 790 K` · `$ 92.000` · `$ 28.000` · `$ 782 K` · `$ 977 K` · `$ 235 K` · `$ 1,4 M` · `$ 8,1 M` · `$ 10,3 M` (ningún número crudo).

**Skeletons (REQ-246):** wrapper `[aria-busy="true"]` con `app-skeleton` dentro · dashboard `aria-label="Cargando indicadores"` (se dispara con "Actualizar") · reporte detallado `aria-label="Cargando reporte"` (se dispara al navegar) · **0 `.spinner`** en todas las rutas · **0 `chart-empty`** / "Sin datos suficientes" con el seed (todos los charts tienen datos → el empty es source-only, documentado, no alcanzable por UI).

**KPI (REQ-235/236):** 6 `<a href="/reportes/{pacientes|productividad|tratamientos|financiero}">` (focusables; Enter navega) · grid 3 col (314px×3) @1280px → 1 col (358px) @390px, sin scroll-x · focus ring `:focus-visible` = `rgb(36,105,145) 0 0 0 2px` (#246991, DC-028).

**Pago (REQ-260/263):** `#pay-date` `type=date` `max="2026-06-01"` `value="2026-06-01"` + `label[for="pay-date"]` "Fecha"; `#pay-amount` `type=number` `min=1`. Mobile 390px: `#pay-date` 294×44 · `#pay-amount` 294×44 · "Confirmar pago" 294×44 (y≈675) · "Cancelar" 294×44 (y≈731) · `.form` actions `flex-direction: column-reverse` · `scrollWidth==innerWidth==390`.

**Presupuesto detalle (REQ-215):** `article.surface-card.is-lg.bdet` radius 14px · `.bdet__patient-link` → `/pacientes/pac-012` · "Válido hasta el 23/06/2026" · 2 `.bdet__section-title` (Tratamientos incluidos / Condiciones, 3 ítems) · pendiente → botones "Rechazar" + "Aprobar presupuesto". Mobile 390px: "Aprobar presupuesto" 294×44 · "Rechazar" 294×44 · `.bdet__actions` `column-reverse` · sin scroll-x.

---

## Brief Verification Results (BVC)

**N/A para It5.** El plan no asignó BVC-xxx nuevos en esta iteración (el `BVC-NFR-brief-compliance.spec.ts` corre como regresión, verde). No aplica a este Visual Checker en It5.
