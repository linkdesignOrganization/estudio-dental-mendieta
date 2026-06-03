# Verificación Post-QA — Iteración 5 (Facturación + Pagos + Reportes — ÚLTIMA) · paso 5e-verify

> **Modo:** NORMAL · **Fase 5** (Iteraciones) · Iteración de CIERRE.
> **Fuente QA:** `output/iterations/iteration-5/qa-report.md` (Ronda 1: HAY_BUGS → 1 bug BUG-F01) + `flow-req216-fix.md` (corrección + test invertido) + `regression-results.md` (768 passed) + `visual-results-it5.md` (32/32, 0 bugs).
> **Estado QA final declarado:** LISTO tras ciclo anti-deferral.
> **Alcance verificado:** cada criterio del scope de It5 tiene resultado explícito + test automatizado; y — por ser la ÚLTIMA iteración — que los 272 REQ quedan TODOS cubiertos a través de las 5 iteraciones (sin REQ huérfano).

---

## Parte A — Cobertura del scope de Iteración 5 (53 criterios)

Scope de It5 según `architecture.md` (tabla de Iteración 5): **53 REQ** =
REQ-206..210, REQ-211..215, REQ-216..220+REQ-271, REQ-221..226, REQ-227..231, REQ-259..263, REQ-232..236, REQ-237..246, y el cierre transversal REQ-249/252/253/254/255/256.

### A.1 — Criterios con TEST DEDICADO esta ronda (27) — todos con resultado explícito ✓

| Criterio | Estado | Test (.spec.ts) |
|---|---|---|
| REQ-211 (detalle presupuesto: válido-hasta + condiciones + flag vencido + link paciente) | PASA | `flow/REQ-211-214-presupuesto-detalle.spec.ts` |
| REQ-214 (estados resueltos, no aprobar 2x) | PASA | `flow/REQ-211-214-presupuesto-detalle.spec.ts` |
| REQ-215 (presupuesto detalle mobile: 1 col, ≥44px, sin scroll-x) | PASA | `visual/REQ-260-263-215-pago-presupuesto-mobile.spec.ts` |
| REQ-216 (el `<select>` RE-MUESTRA el paciente tras "Atrás" — **BUG-F01 corregido**) | **PASA (fix verificado)** | `flow/REQ-216-219-budget-back-preserva.spec.ts` (test INVERTIDO) |
| REQ-219 (avanzar sin re-seleccionar + tratamientos preservados) | PASA | `flow/REQ-216-219-budget-back-preserva.spec.ts` |
| REQ-229 (OS detalle: historial de liquidaciones con filas reales) | PASA | `flow/REQ-229-230-obra-social-liquidaciones.spec.ts` |
| REQ-230 (paciente asociado de OS navega a su ficha) | PASA | `flow/REQ-229-230-obra-social-liquidaciones.spec.ts` |
| REQ-232 (≤6 KPI cards con valores calculados) | PASA | `flow/REQ-232-234-dashboard-kpi.spec.ts` |
| REQ-233 (KPI con valores reales, no hardcode) | PASA | `flow/REQ-232-234-dashboard-kpi.spec.ts` |
| REQ-234 (cada KPI clickeable navega a su reporte — los 6) | PASA | `flow/REQ-232-234-dashboard-kpi.spec.ts` |
| REQ-235 (KPI grid responsive, ≤6 cards, sin scroll-x) | PASA | `visual/REQ-235-236-246-kpi-skeleton.spec.ts` |
| REQ-236 (KPI por teclado, focus ring 2px #246991) | PASA | `visual/REQ-235-236-246-kpi-skeleton.spec.ts` |
| REQ-237 (gráficos reporte pacientes — geometría real) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-238 (gráficos legibles con categoría vacía, no crashea) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-239 (gráficos reporte tratamientos) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-240 (datos reales tratamientos) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-241 (gráficos reporte financiero) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-242 (ARS compacto en charts financieros) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-243 (gráficos productividad) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-244 (datos reales productividad) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-245 (reportes 2→1 col, sin scroll-x mobile) | PASA | `visual/REQ-237-244-report-charts-geometry.spec.ts` |
| REQ-246 (skeleton "Cargando reporte/indicadores", NO spinner) | PASA | `visual/REQ-235-236-246-kpi-skeleton.spec.ts` |
| REQ-259 (pago persiste el movimiento) | PASA | `flow/REQ-259-262-pago-con-fecha.spec.ts` |
| REQ-260 (el movimiento lleva la FECHA elegida + `#pay-date` type=date max=hoy) | PASA | `flow/REQ-259-262-pago-con-fecha.spec.ts` + `visual/REQ-260-263-215-*` |
| REQ-261 (recalcula saldo + resumen + badge coherente) | PASA | `flow/REQ-259-262-pago-con-fecha.spec.ts` |
| REQ-262 (toast + sobrevive a refresh real) | PASA | `flow/REQ-259-262-pago-con-fecha.spec.ts` |
| REQ-263 (pago mobile: 1 col, ≥44px, column-reverse, sin scroll-x) | PASA | `visual/REQ-260-263-215-pago-presupuesto-mobile.spec.ts` |

**27/27 con resultado explícito (todos PASA) y test automatizado dedicado.** 0 sin resultado, 0 bloqueados.

### A.2 — Criterios del scope cubiertos por REGRESIÓN (PASA automatizado) (26) ✓

La base de Facturación/Reportes y el cierre transversal ya tienen `.spec.ts` en la suite (FASE 4 + It1-4); It5 los mantiene verdes vía regresión. Cada uno tiene test automatizado existente:

| Criterio(s) | Cobertura automatizada |
|---|---|
| REQ-206..210 (lista presupuestos, badges, empty/skeleton) | `flow/UX-multipaso-cierre.spec.ts` (UX-029/030) + `visual/DC-100-119-ui-states.spec.ts` + `UX-041-052-estados-vacios.spec.ts` |
| REQ-212, REQ-213 (acción primaria por estado, aprobar persiste) | `flow/UX-multipaso-cierre.spec.ts` (UX-030 aprobar → "Aprobado" persiste, no aprobar 2x) |
| REQ-217, REQ-218, REQ-220 (agregar tratamientos + total auto, revisión, persistir+navegar) | `flow/UX-multipaso-cierre.spec.ts` (UX-029 end-to-end: total auto-calc, confirmar persiste, navega al detalle) |
| REQ-221..226 (facturas lista/detalle, sin ARCA/AFIP, empty/skeleton, mobile) | `visual/DC-*` + `UX-041-052-estados-vacios.spec.ts` + anti-fiscal en barrido REQ-272 |
| REQ-227, REQ-228, REQ-231 (obras sociales cards, navegan, mobile, empty-state) | `flow/REQ-229-230-obra-social-liquidaciones.spec.ts` (empty-state "Particular") + `visual/DC-080-089-responsive.spec.ts` |
| REQ-271 (crear presupuesto 3 pasos mobile) | `flow/UX-093-mobile-flows.spec.ts` (`/facturacion/presupuestos`) + `flow/UX-multipaso-cierre.spec.ts` (UX-029, corre en `mobile-chromium`) |
| REQ-249 (validación inline junto al campo) | `flow/UX-050-crear-turno-requeridos.spec.ts` + `REQ-176-dni-formato-validacion.spec.ts` + `UX-050-DC-112-pago-monto-invalido.spec.ts` |
| REQ-252, REQ-253, REQ-254 (responsive total, ≥44px, sin scroll-x) | `visual/DC-080-089-responsive.spec.ts` + `flow/UX-093-mobile-flows.spec.ts` + los mobile-specs de It4/It5 |
| REQ-255 (focus ring en todo clickeable) | `visual/DC-001-029-design-tokens.spec.ts` (DC-028 focus ring #246991, confirmado en vivo en It5) |
| REQ-256 (contraste WCAG AA) | `visual/DC-001-029-design-tokens.spec.ts` + `BVC-NFR-brief-compliance.spec.ts` |

**26/26 con test automatizado (PASA automatizado vía regresión).** El QA report lo declara explícitamente ("todo lo no perteneciente al delta de It5 → PASA automatizado vía la suite DC/UX/BVC + REQ").

### A.3 — Confirmaciones críticas pedidas por el PM

1. **BUG-F01 corregido — REQ-216 verifica el FIX, no el defecto.** ✓
   El test `flow/REQ-216-219-budget-back-preserva.spec.ts` quedó INVERTIDO: el título ya no dice "[defecto conocido]"; ahora es *"el `<select>` re-muestra el paciente preservado tras 'Atrás' (BUG-F01 corregido)"*. Asserts del comportamiento corregido: `toHaveValue('pac-005')` (línea 103), `option:checked` `toHaveText('Diego Sosa')` (104), y candado de no-regresión `not.toHaveText('Elegí un paciente')` (107). Fix del Developer = `viewChild` + `afterNextRender` en `budget-create.component.ts`, desplegado. Verificado en vivo 3/3 corridas, desktop + mobile (`flow-req216-fix.md`). El deuda-de-test gemela (UX-029 en `UX-multipaso-cierre.spec.ts`) también se actualizó al comportamiento corregido.

2. **Los 4 reportes tienen gráficos/métricas REALES.** ✓
   Visual Checker 32/32 verde, 0 bugs. Geometría SVG real por reporte (conteo en vivo): pacientes 5 · tratamientos 4 · financiero 5 · productividad 3; tipos bar/hbar/line/donut con `style`/`points`/`dasharray` reales (no placeholders, no `chart-empty`). Cada chart en card aireada SEPARADA (radius 12–14, sombra-O-borde, gap 20). ARS compacto en financiero (`$ 3,3 M` … `$ 92.000`). Skeletons "Cargando reporte/indicadores" (0 `.spinner`). Responsive 2→1 col sin scroll-x. KPIs calculados del estado (13/7/14/`$4.32M`/`$2.00M`/`$3.37M`).

3. **Pago editable con fecha persiste.** ✓
   REQ-259/260/261/262 PASA: el movimiento se agrega con la FECHA elegida (no la de hoy), recalcula saldo (Saldo pendiente $171.980) + resumen + badge coherente en la lista ("Con deuda"), muestra toast "Pago registrado." y SOBREVIVE a refresh real. `#pay-date` `type=date` `max=2026-06-01` con valor inicial; valida monto positivo inline. Mobile ≥44px, 1 col, column-reverse, sin scroll-x (REQ-263).

---

## Parte B — Estado de la suite de regresión (post-fix)

- `regression-results.md` (single-run, 2026-06-02T23:41): **768 passed · 8 skipped**, con 2 rojos = el test REQ-216 OBSOLETO (`spec:89`, aún con la aserción vieja `toHaveText('Elegí un paciente')`, rojo porque la app YA estaba corregida).
- `flow-req216-fix.md` (2026-06-02T23:49, posterior): ese test fue INVERTIDO a verificar el fix → 3/3 corridas verde en ambos projects. Los 2 rojos obsoletos se convierten en verdes.
- **Resultado efectivo post-inversión: regresión VERDE.** El único patrón rojo era el test obsoleto, ya invertido. 0 regresiones de producto.
- Visual Checker: **32/32 PASSED**, 0 bugs.
- UX-003 (sidebar nav title): flaky histórico reforzado y estabilizado (no es bug ni cambio de título) → PASA.

---

## Parte C — Cierre del proyecto: cobertura de los 272 REQ a través de las 5 iteraciones (CRÍTICO)

> Por ser la ÚLTIMA iteración, se verifica que NINGÚN REQ-001..272 quede huérfano.

**Mapa REQ → iteración** (de la tabla de Plan de Iteraciones de `architecture.md`, líneas 286-372). Unión computada de todas las asignaciones:

| Iteración | Rangos REQ asignados | Estado de cierre |
|---|---|---|
| It1 — Fundación (shell, routing, persistencia, seed, reset, feedback, anti-demo) | 1-58, 247/248/250/251, 257/258/264/265/266, 272 | **LISTO** (verification-5a PASA · qa LISTO · 480 passed) |
| It2 — Pacientes lista/ficha/tabs lectura + sub-detalles | 98-172, 186-191 | **LISTO PARA DEMO** (verification-5a PASA · qa LISTO · 486 passed/0 failed) |
| It3 — Agenda (calendario + flujos de turno) | 59-97 | **LISTO PARA DEMO** (verification-5a + 5e PASA · qa LISTO · 536 passed/0 failed) |
| It4 — Pacientes escritura + Tratamientos + odontograma editable | 173-185, 192-205, 267-270 | **LISTO PARA DEMO** (verification-5a PASA · qa LISTO · 568 passed efectivo VERDE) |
| It5 — Facturación + Pagos editable + Reportes + cierre transversal | 206-246, 249, 252-256, 259-263, 271 | **LISTO** (este informe · 768 passed efectivo VERDE + 32/32 visual) |

**Verificación de unión (cómputo exhaustivo):**
- Total REQ esperados: **272** (REQ-001..272).
- Unión de asignaciones de las 5 iteraciones: **272**.
- **REQ huérfanos (sin iteración): NINGUNO.**
- **REQ fuera de rango: NINGUNO.**

Coincide con la afirmación de `architecture.md` línea 372: *"Iteraciones 1–5 cubren los 272 REQ-IDs (REQ-001 a REQ-272) + los 20 NFR"*. Confirmado independientemente por unión de conjuntos, no por confianza en la prosa.

> FASE 4 (visual-build) cerró **LISTO_PARA_DEMO** (396 passed / 0 failed; verification-4f-reverify PASA — los ~76 criterios DC/UX/BVC con `.spec.ts` propio cerrados). Esta es la base estructural sobre la que descansan los criterios It5 cubiertos por regresión.

---

## Verificación de Cobertura (resumen)

- **Criterios del scope It5 (53):** 53/53 con resultado explícito (52 PASA + REQ-216 PASA tras fix). **0 sin resultado · 0 bloqueados.**
- **Criterios con test automatizado:** 53/53 (27 dedicados esta ronda + 26 por regresión con `.spec.ts` existente). **0 PASA sin test.**
- **BUG-F01:** corregido, desplegado y RE-VERIFICADO (test invertido a `toHaveValue('pac-005')`, no documenta el defecto). 0 bugs abiertos.
- **Cierre del proyecto:** **272/272 REQ cubiertos** a través de las 5 iteraciones — **0 REQ huérfanos**. Las 5 iteraciones + FASE 4 cerraron LISTO/LISTO PARA DEMO.

### Condición de salida (FASE 5 · Iteración 5 — cierre)
`0 sin resultado + 0 bloqueados + 0 PASA-sin-test + 0 regresiones (post-inversión) + 100% cubiertos + 0 REQ huérfanos`
**CUMPLIDA.**

### Resultado: PASA (0 criterios sin cobertura · 0 bloqueados · 0 sin test · 272/272 REQ cubiertos sin huérfanos)
