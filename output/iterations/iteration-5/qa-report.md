# QA Report — Iteración 5 (Facturación + Pagos + Reportes — ÚLTIMA) · Consolidado

> Consolidado por el QA Orchestrator (MODO CONSOLIDACIÓN, paso 5e-consolidate).
> Iteración de CIERRE del proyecto (272 REQ + 20 NFR).

- **Ronda:** 1
- **Fase:** 5 (Iteraciones) · Modo: NORMAL
- **URL del sitio desplegado testeado:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (bundle de It5 `main-5NSLIGIB.js`, deploy verificado paso 5d)
- **Projects:** desktop-chromium (1280×900) + mobile-chromium (Pixel 5 / ~390px)
- **Sub-testers lanzados:** flow-tester, visual-checker (edge-case-tester sin asignación esta ronda — justificado en test-distribution.md)
- **Veredicto:** **HAY_BUGS** — 1 bug (BUG-F01, severidad media, view-sync del `<select>` de presupuesto). 0 bloqueados. El resto del alcance de It5 (24 criterios) PASA.

---

## Veredicto

**NO listo para demo final — requiere 1 corrección (BUG-F01).**

El alcance funcional y de datos de It5 está correcto: el pago editable con fecha persiste y recalcula saldo/badge, el detalle de presupuesto muestra condiciones/válido-hasta/estados resueltos/link a paciente, las obras sociales muestran el historial de liquidaciones, y los 4 reportes renderizan geometría REAL (no placeholders) con ARS compacto, skeletons (no spinner) y responsive sin scroll-x. El único defecto es de **vista** (no de estado): tras "Atrás" en crear presupuesto el `<select id="b-pac">` no re-pinta el paciente preservado. El estado del `BudgetFlowService` SÍ se conserva (REQ-219 PASA), pero la UI sugiere lo contrario, contradiciendo el F02 del cliente ("Atrás debe REPOBLAR el paciente"). Ciclo de corrección: el Developer arregla BUG-F01, se relanza Ronda 2 para re-verificar REQ-216.

---

## Resultados por Criterio

### Flow Tester — `e2e/tests/flow/` (13 criterios)

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| REQ-216 (F02 — el `<select id="b-pac">` conserva el paciente tras "Atrás") | **FALLA** | BUG-F01 · `REQ-216-219-budget-back-preserva.spec.ts` (guardia "defecto conocido") |
| REQ-219 (F02 — avanzar sin re-seleccionar + tratamientos preservados) | PASA | `REQ-216-219-budget-back-preserva.spec.ts` |
| REQ-259 (pago persiste el movimiento en la cuenta corriente) | PASA | `it5-flow-pago-tab-saldo-actualizado.png` |
| REQ-260 (el movimiento lleva la FECHA elegida, no la de hoy) | PASA | `it5-flow-pago-form-fecha.png` + aserción de estado |
| REQ-261 (recalcula saldo + resumen + badge coherente en la lista) | PASA | `it5-flow-pago-tab-saldo-actualizado.png` |
| REQ-262 (toast "Pago registrado." + sobrevive a refresh real) | PASA | `REQ-259-262-pago-con-fecha.spec.ts` |
| REQ-211 (detalle: válido-hasta + condiciones + flag vencido + link paciente) | PASA | `it5-flow-budget-detail-pre008.png` |
| REQ-214 (estados resueltos: mensaje coherente, no aprobar 2x) | PASA | `REQ-211-214-presupuesto-detalle.spec.ts` |
| REQ-229 (OS detalle: historial de liquidaciones con filas reales) | PASA | `REQ-229-230-obra-social-liquidaciones.spec.ts` |
| REQ-230 (paciente asociado de la OS navega a su ficha) | PASA | `REQ-229-230-obra-social-liquidaciones.spec.ts` |
| REQ-232 (≤6 KPI cards con valores calculados del estado) | PASA | `REQ-232-234-dashboard-kpi.spec.ts` |
| REQ-233 (KPI con valores reales, no hardcode) | PASA | `REQ-232-234-dashboard-kpi.spec.ts` |
| REQ-234 (cada KPI clickeable navega a su reporte — los 6) | PASA | `REQ-232-234-dashboard-kpi.spec.ts` (href + click-through) |

### Visual Checker — `e2e/tests/visual/` (15 criterios · 0 bugs visuales)

| Criterio | Estado | Breakpoint | Evidencia |
|----------|--------|------------|-----------|
| REQ-235 (KPI grid responsive, ≤6 cards, sin scroll-x) | PASA | desktop 3 col / mobile 1 col | `REQ-235-kpi-dashboard-mobile.png` |
| REQ-236 (KPI alcanzable+activable por teclado, focus ring 2px #246991) | PASA | desktop / mobile | spec (computed boxShadow + Enter navega) |
| REQ-237..244 — geometría REAL pacientes (line+bar+bar+hbar+hbar = 5) | PASA | desktop / mobile | spec `auditCharts` |
| REQ-237..244 — geometría REAL tratamientos (bar+hbar+hbar+donut = 4) | PASA | desktop / mobile | `REQ-237-244-tratamientos-charts-desktop.png` |
| REQ-237..244 — geometría REAL financiero (line+hbar+bar+bar+donut = 5) | PASA | desktop / mobile | `REQ-237-244-financiero-charts-desktop.png` |
| REQ-237..244 — geometría REAL productividad (hbar+bar+donut = 3) | PASA | desktop / mobile | spec `auditCharts` |
| REQ-237..244 — cada chart en card aireada SEPARADA (radius 10–14, sombra-O-borde, gap 16–20) | PASA | desktop / mobile | spec (computed) + screenshots |
| REQ-242 — ARS compacto en charts financieros (`$ N,N M` / `$ NNN K` / `$ NN.NNN`) | PASA | desktop / mobile | `REQ-237-244-financiero-charts-desktop.png` |
| REQ-245 — `.charts` 2 col → 1 col sin scroll-x; geometría intacta en mobile | PASA | desktop 2 col / mobile 1 col | spec (gridTemplateColumns + scrollWidth==innerWidth) |
| REQ-246 — skeleton "Cargando reporte"/"Cargando indicadores" (NO spinner) | PASA | desktop / mobile | spec (MutationObserver atómico, 0 `.spinner`) |
| REQ-260 — `#pay-date` type=date + label "Fecha" + max=2026-06-01 + valor inicial | PASA | desktop / mobile | `REQ-260-263-pago-form-mobile.png` |
| REQ-263 — pago mobile: 1 col, controles/botones ≥44px, column-reverse, sin scroll-x | PASA | mobile | `REQ-260-263-pago-form-mobile.png` |
| REQ-215 — presupuesto detalle mobile: 1 col, acciones ≥44px, column-reverse, sin scroll-x | PASA | mobile | `REQ-215-presupuesto-detalle-mobile.png` |

> **Corrida del Visual Checker: 32/32 PASSED** (16 tests × 2 projects). 0 fallos, 0 bloqueados, **0 bugs visuales**. Nota de autoría: 4 tests fallaron en la 1ª corrida por timing de test (montaje escalonado `edm-rise-in` + ventana del skeleton ~450ms); se corrigieron en el spec con esperas web-first y captura atómica del skeleton. El producto siempre estuvo correcto; corrida final verde. **Ningún test del Visual Checker quedó incompleto o sin ejecutar.**

### Anti-demo (REQ-272) — transversal
PASA. Barrido en ambos sub-testers (wizard, tab pagos, detalle de presupuesto, OS, dashboard, 4 reportes, form de pago) → sin coincidencias con `/\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i`.

---

## Regresión Automatizada

- **Resultado:** **709 passed.** Efectivamente VERDE.
- **UX-003 (sidebar nav title)** — único rojo histórico, diagnosticado **flaky** (carrera de commit del redirect `/facturacion` → `/facturacion/presupuestos` de It5; el título se sincroniza un tick después del navigate). **REFORZADO por el Flow Tester** (`flow-ux003-it5.md`, 11/11 verde con gates web-first). **NO es bug ni cambio de título** → queda **PASA (test estabilizado)**.
- **Regresiones de producto:** **ninguna (0).**
- Todo el alcance de Épicas 1-7 + 10 + la base de Facturación/Reportes ya cerrada en FASE 4 + It1-4 → **PASA (automatizado)** vía 47 specs de la suite DC/UX/BVC + REQ.

---

## Bugs Consolidados

> **Total: 1 bug.** Sin root-cause dedup aplicable (defecto único y aislado). **Bugs visuales del Visual Checker: 0.**

### BUG-F01 — el `<select>` de paciente no re-muestra el valor preservado tras "Atrás"
- **Severidad:** media
- **Criterio afectado:** REQ-216 (F02 — preservación del paciente al ir "Atrás" en Crear presupuesto)
- **Corresponde a:** **Developer** (view-sync / binding del `<select id="b-pac">` con `flow.pacienteId()` al re-renderizar el Paso 1 — NO es un problema de estado ni de estilos)
- **Pasos para reproducir:**
  1. Ir a `/facturacion/presupuestos/nuevo/paciente` (Paso 1).
  2. En el `<select id="b-pac">` elegir un paciente (ej. "Diego Sosa" → value `pac-005`).
  3. "Siguiente" → Paso 2. Marcar uno o más tratamientos.
  4. "Atrás" → vuelve al Paso 1.
- **Resultado esperado (REQ-216 literal):** el `<select id="b-pac">` conserva el paciente seleccionado ("Diego Sosa"), NO vuelve a "Elegí un paciente".
- **Resultado actual:** el control nativo `<select>` muestra "Elegí un paciente" y su `.value` es `""`. El paciente se ve PERDIDO en la UI del Paso 1.
- **Matiz (NO es pérdida de estado):** el `BudgetFlowService` (singleton) SÍ conserva `pacienteId='pac-005'` + los `tipoIds`. Al pulsar "Siguiente" SIN re-seleccionar, el flujo avanza sin error, los tratamientos siguen marcados (total intacto) y el Paso 3 muestra "Para: Diego Sosa". Es decir, **REQ-219 FUNCIONA (PASA)**; lo que falla es exclusivamente la **re-sincronización visual del `<select>`** (el binding `[value]="flow.pacienteId()"` no re-pinta la opción seleccionada al re-renderizar el Paso 1).
- **Sugerencia (para el Developer):** sincronizar el valor mostrado del `<select>` con `flow.pacienteId()` al entrar al Paso 1 (ej. `[ngModel]`/`writeValue`, o setear `el.value` tras render con `afterNextRender`/`effect`), de modo que muestre el paciente preservado.
- **Evidencia:** verificado en vivo 3 corridas (`#b-pac` value `""` + opción "Elegí un paciente"); capturado por el test guardia "REQ-216: [defecto conocido]" en `REQ-216-219-budget-back-preserva.spec.ts`.
- **Acción de seguimiento al corregir (deuda de test conocida):** actualizar **AMBOS** — (1) el guardia REQ-216 a `toHaveValue('pac-005')`, y (2) el comentario obsoleto de `UX-multipaso-cierre.spec.ts` (UX-029), que afirma el comportamiento VIEJO ("la demo NO repuebla el select al volver"). Ese spec **sigue pasando** porque su aserción coincide con el defecto actual (`value=""`); NO causa rojo en regresión, pero su comentario contradice el fix F02 a nivel de estado (REQ-219). Es deuda de test, no un segundo bug.

---

## Tests Automatizados Generados

### Flow Tester — `e2e/tests/flow/` (5 archivos, 14 tests; verde en ambos projects, estable en 2+ corridas)
- `REQ-216-219-budget-back-preserva.spec.ts` — F02: "Atrás" preserva el flujo (REQ-219 PASA) + guardia del defecto de vista del `<select>` (REQ-216, documenta BUG-F01).
- `REQ-259-262-pago-con-fecha.spec.ts` — pago editable con fecha: persistencia + fecha elegida + saldo recalculado (estado+UI) + refresh real + badge coherente en la lista (Con deuda → Al día).
- `REQ-211-214-presupuesto-detalle.spec.ts` — detalle: válido-hasta + condiciones (3) + flag vencido + mensajes resueltos por estado (no 2x) + link al paciente.
- `REQ-229-230-obra-social-liquidaciones.spec.ts` — OS: historial de liquidaciones con filas reales (período + estado + ARS) + navegación a ficha de paciente + empty-state de "Particular".
- `REQ-232-234-dashboard-kpi.spec.ts` — dashboard: ≤6 KPI calculados (contraste vs. estado) + mapeo card→ruta (href) de los 6 + click-through.

### Visual Checker — `e2e/tests/visual/` (3 archivos, 16 tests × 2 projects = 32 casos; corrida final 32/32 verde)
- `REQ-237-244-report-charts-geometry.spec.ts` — geometría real por tipo de los 4 reportes (bar/hbar/line/donut, conteo por reporte), cards aireadas SEPARADAS, ARS compacto (REQ-242), responsive 2→1 col + sin scroll-x mobile (REQ-245), anti-demo. 7 tests × 2.
- `REQ-235-236-246-kpi-skeleton.spec.ts` — KPI grid responsive (REQ-235), KPI teclado + focus ring (REQ-236), skeletons sin spinner (REQ-246), ausencia de `.spinner`/`chart-empty`. 5 tests × 2.
- `REQ-260-263-215-pago-presupuesto-mobile.spec.ts` — `#pay-date` (type=date, max=hoy, label, valor inicial) (REQ-260), pago mobile ≥44px/1 col/column-reverse (REQ-263), presupuesto detalle mobile (REQ-215), anti-demo. 3 tests × 2.

---

## GIFs / PNGs de Evidencia

### Flow (`e2e/evidence/flow-it5/`)
- `it5-flow-pago-form-fecha.png` — form de registrar pago con Fecha "20/05/2026" editable (REQ-260) + monto/medio/concepto + "Confirmar pago".
- `it5-flow-pago-tab-saldo-actualizado.png` — tab Pagos tras confirmar: Saldo pendiente $171.980 + resumen + badge "Con deuda" coherente (REQ-259/261).
- `it5-flow-budget-detail-pre008.png` — detalle P-00125: "Válido hasta el 23/06/2026" + "Condiciones" (3) + link paciente + "Aprobar presupuesto" (REQ-211/214).

### Visual (`e2e/screenshots/it5/`)
- `REQ-237-244-financiero-charts-desktop.png` — line + hbar (ARS) + bar (ARS) + bar + donut, cards separadas.
- `REQ-237-244-tratamientos-charts-desktop.png` — bar + hbar + hbar + donut ("29%").
- `REQ-235-kpi-dashboard-mobile.png` — 6 KPI cards apiladas en 1 columna.
- `REQ-260-263-pago-form-mobile.png` — form de pago 1 col, Fecha (date picker nativo), botones full-width column-reverse.
- `REQ-215-presupuesto-detalle-mobile.png` — detalle 1 col (header + Válido hasta + Tratamientos + Total + Condiciones).

> Videos Playwright: `retain-on-failure` (sin residual relevante — todos los specs nuevos verdes).

---

## Verificación de Cobertura

- **Criterios cubiertos:** 25/25 del alcance de It5 (cada uno con resultado explícito: 24 PASA + 1 FALLA). 0 criterios sin resultado.
- **Criterios con test automatizado:** 100% — cada PASA tiene su `.spec.ts` asociado; REQ-216 (FALLA) tiene test guardia que documenta el bug.
- **Criterios BLOQUEADOS:** 0. (BUG-F01 no bloquea ningún otro criterio — REQ-219 y el resto se ejecutaron sin impedimento.)
- **Cobertura por sub-tester (audit asignado-vs-reportado):**
  - Flow Tester: 13 asignados / 13 reportados ✓ · 5 specs presentes ✓ · GIFs presentes ✓
  - Visual Checker: 15 criterios asignados / 15 reportados ✓ · 3 specs presentes ✓ · 5 PNGs presentes ✓ · reporte completo, corrida final verde, sin tests incompletos ✓
  - Edge Case Tester: sin asignación (justificado en test-distribution.md) — no falta.
- **Cierre del proyecto (272 REQ):** todo lo no perteneciente a It5 queda **PASA (automatizado)** vía la suite de regresión (709 passed, 0 regresiones). Ningún REQ de cierre quedó sin resultado.

### Condición de salida (FASE 5 · Iteración 5 — cierre)
`0 fallos + 0 bloqueados + 0 regresiones + 100% cubiertos + 100% con test automatizado`
**NO cumplida** — 1 fallo abierto (BUG-F01). Falta 1 ciclo de corrección + Ronda 2 de re-verificación de REQ-216 antes del demo final.
