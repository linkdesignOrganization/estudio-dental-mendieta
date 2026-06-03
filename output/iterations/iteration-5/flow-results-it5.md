# Resultados — Flow Tester · Iteración 5 (Facturación + Pagos + Reportes — ÚLTIMA) · Ronda 1

> Testeado contra el SITIO DESPLEGADO: https://happy-coast-044ea7e0f.7.azurestaticapps.net
> Bundle de It5 (`main-5NSLIGIB.js`). Ambos projects (desktop-chromium 1280×900 + mobile-chromium Pixel 5).
> Hoy del viewcase: 2026-06-01. Cada flujo se navegó en browser real; los specs se ejecutaron 2+ corridas (estables).

## Resumen
- **Criterios asignados:** REQ-216, REQ-219, REQ-259, REQ-260, REQ-261, REQ-262, REQ-211, REQ-214, REQ-229, REQ-230, REQ-232, REQ-233, REQ-234.
- **Veredicto:** 12 PASA · **1 FALLA parcial** (REQ-216 — defecto de vista en el `<select>`, BUG-F01).
- **Tests generados:** 5 archivos `.spec.ts` en `e2e/tests/flow/` (14 tests). Verde en ambos projects, estable en 2 corridas.

## Resultados por Criterio
| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| REQ-216 (F02 — el `<select id="b-pac">` conserva el paciente tras "Atrás") | **FALLA** | BUG-F01 · spec `REQ-216-219-budget-back-preserva.spec.ts` (test "defecto conocido") |
| REQ-219 (F02 — avanzar sin re-seleccionar + tratamientos preservados) | PASA | `REQ-216-219-budget-back-preserva.spec.ts` (test REQ-219) |
| REQ-259 (pago persiste el movimiento en la cuenta corriente) | PASA | `it5-flow-pago-tab-saldo-actualizado.png` |
| REQ-260 (el movimiento lleva la FECHA elegida, no la de hoy) | PASA | `it5-flow-pago-form-fecha.png` + aserción de estado |
| REQ-261 (recalcula saldo + resumen + badge coherente en la lista) | PASA | `it5-flow-pago-tab-saldo-actualizado.png` |
| REQ-262 (toast "Pago registrado." + sobrevive a refresh real) | PASA | `REQ-259-262-pago-con-fecha.spec.ts` |
| REQ-211 (detalle: válido-hasta + condiciones + flag vencido + link paciente) | PASA | `it5-flow-budget-detail-pre008.png` |
| REQ-214 (estados resueltos: mensaje coherente, no aprobar 2x) | PASA | `REQ-211-214-presupuesto-detalle.spec.ts` (test REQ-214) |
| REQ-229 (OS detalle: historial de liquidaciones con filas reales) | PASA | `REQ-229-230-obra-social-liquidaciones.spec.ts` |
| REQ-230 (paciente asociado de la OS navega a su ficha) | PASA | `REQ-229-230-obra-social-liquidaciones.spec.ts` (test REQ-230) |
| REQ-232 (≤6 KPI cards con valores calculados del estado) | PASA | `REQ-232-234-dashboard-kpi.spec.ts` |
| REQ-233 (KPI con valores reales, no hardcode) | PASA | `REQ-232-234-dashboard-kpi.spec.ts` (contraste vs. cálculo independiente) |
| REQ-234 (cada KPI clickeable navega a su reporte detallado — los 6) | PASA | `REQ-232-234-dashboard-kpi.spec.ts` (tests href + click-through) |

## Bugs Encontrados

BUG-F01:
- **Criterio:** REQ-216 (F02 — preservación del paciente al ir "Atrás" en Crear presupuesto).
- **Pasos para reproducir:**
  1. Ir a `/facturacion/presupuestos/nuevo/paciente` (Paso 1).
  2. En el `<select id="b-pac">` elegir un paciente (ej. "Diego Sosa" → value `pac-005`).
  3. "Siguiente" → Paso 2. Marcar uno o más tratamientos.
  4. "Atrás" → vuelve al Paso 1.
- **Resultado esperado (REQ-216 literal):** el `<select id="b-pac">` conserva el paciente seleccionado ("Diego Sosa"), NO vuelve a "Elegí un paciente".
- **Resultado actual:** el control nativo `<select>` muestra "Elegí un paciente" y su `.value` es `""`. El paciente se ve PERDIDO en la UI del Paso 1.
- **Matiz importante (NO es pérdida de estado):** el `BudgetFlowService` (singleton) SÍ conserva `pacienteId='pac-005'` y los `tipoIds`. Por eso al pulsar "Siguiente" SIN re-seleccionar, el flujo avanza al Paso 2 sin error de validación, los tratamientos siguen marcados (total intacto) y el Paso 3 muestra "Para: Diego Sosa". Es decir, **REQ-219 (avanzar sin re-seleccionar + tratamientos preservados) FUNCIONA**; lo que falla es exclusivamente la **re-sincronización visual del `<select>`** (el binding `[value]="flow.pacienteId()"` no re-pinta la opción seleccionada al re-renderizar el Paso 1).
- **Severidad:** media. El estado no se pierde y el usuario puede continuar, pero la pantalla sugiere lo contrario (puede confundir / inducir a re-elegir). Es un defecto de vista, no de datos.
- **Sugerencia (para el agente de implementación, vía QA Orchestrator):** sincronizar el valor mostrado del `<select>` con `flow.pacienteId()` al entrar al Paso 1 (p. ej. `[ngModel]`/`writeValue` o setear `el.value` tras render con `afterNextRender`/`effect`), de modo que muestre el paciente preservado.
- **Evidencia:** verificado en vivo 3 corridas (`#b-pac` value `""` + opción mostrada "Elegí un paciente"); capturado por el test guardia "REQ-216: [defecto conocido]" en `REQ-216-219-budget-back-preserva.spec.ts`.

## Tests Generados
- `e2e/tests/flow/REQ-216-219-budget-back-preserva.spec.ts` — F02: "Atrás" preserva el flujo (REQ-219, PASA) + guardia del defecto de vista del `<select>` (REQ-216, documenta BUG-F01).
- `e2e/tests/flow/REQ-259-262-pago-con-fecha.spec.ts` — pago editable con fecha: persistencia + fecha elegida + saldo recalculado (estado+UI) + refresh real + badge coherente en la lista (Con deuda → Al día).
- `e2e/tests/flow/REQ-211-214-presupuesto-detalle.spec.ts` — detalle: válido-hasta + condiciones (3) + flag vencido + mensajes resueltos por estado (no 2x) + link al paciente.
- `e2e/tests/flow/REQ-229-230-obra-social-liquidaciones.spec.ts` — OS: historial de liquidaciones con filas reales (período + estado + ARS) + navegación a ficha de paciente + empty-state de "Particular".
- `e2e/tests/flow/REQ-232-234-dashboard-kpi.spec.ts` — dashboard: ≤6 KPI calculados (contraste vs. estado) + mapeo card→ruta (href) de los 6 + click-through navega a cada reporte.

## GIFs / PNGs de Flujos (evidencia)
- `e2e/evidence/flow-it5/it5-flow-pago-form-fecha.png` — formulario de registrar pago con la **Fecha "20/05/2026"** editable (REQ-260) + monto/medio/concepto + "Confirmar pago".
- `e2e/evidence/flow-it5/it5-flow-pago-tab-saldo-actualizado.png` — tab Pagos tras confirmar: **Saldo pendiente $171.980** (221.980 − 50.000), resumen Facturado/Cobrado/Saldo + badge "Con deuda" coherente (REQ-259/261).
- `e2e/evidence/flow-it5/it5-flow-budget-detail-pre008.png` — detalle de presupuesto P-00125: **"Válido hasta el 23/06/2026"** + sección **"Condiciones"** (3) + link paciente "Roberto Suárez" + acción "Aprobar presupuesto" (REQ-211/214).
- Videos Playwright: `retain-on-failure` (sólo en fallos); todos los specs verdes → sin video residual relevante.

## Notas de Honestidad / Cobertura
- **Persistencia del pago (REQ-262):** `movementsOf` ordena por fecha DESC, así que un pago con fecha pasada (20/05) NO queda como primera fila si existe un movimiento del seed con fecha más reciente. La persistencia se asevera de forma robusta vía **lectura del estado** (`localStorage`) + **saldo recalculado** (estado y UI) que sobreviven al `reload()`, no por la posición en la lista. El movimiento creado SÍ es localizable por concepto/monto en la lista.
- **Idempotencia de escritura:** el pago muta `localStorage` → `resetSeed()` en `beforeEach`/`afterEach` del spec de pagos (helper `seed.ts`). El resto de specs son read-only (`warmSeed`).
- **Spec obsoleto en regresión (a consolidar por el QA Orchestrator):** `UX-multipaso-cierre.spec.ts` (FASE 4, UX-029) afirma el comportamiento VIEJO del `<select>` ("la demo no repuebla el select al volver") y re-selecciona el paciente a mano. Ese test SIGUE PASANDO porque el defecto de vista (BUG-F01) coincide con lo que afirma (`value=""` tras "Atrás"). NO causa rojo en regresión, pero su COMENTARIO contradice el fix F02 a nivel de estado (REQ-219). Recomendación: cuando se corrija BUG-F01, actualizar AMBOS — el guardia REQ-216 (a `toHaveValue('pac-005')`) y el comentario de UX-029.
- **Navegación viewport-agnóstica:** el badge de la lista de pacientes se asevera con el helper `patientRow()` (resuelve fila desktop `.dt__tr` o card mobile `.dt__card` visible), por eso el spec de pago verde en AMBOS projects.
- **Anti-demo (REQ-272):** barrido en cada pantalla nueva (wizard, tab pagos, detalle de presupuesto, OS, dashboard) — sin coincidencias con `/\b(demo|mock|simulaci\w*|…)\b/i`.

## Estabilidad
- Corrida 1 (ambos projects): 28 tests → 27 pass / 1 fail (mobile badge, selector desktop-only) → CORREGIDO con `patientRow()`.
- Corrida 2 (ambos projects, tras fix): 28 tests verdes.
- Corrida 3 de confirmación (ambos projects): 28 tests verdes (sin flakiness).
- Gates web-first aplicados en navegación que pasa por redirects (`/facturacion`, wizard, click-through de KPIs): `toHaveURL` + espera de selector de contenido final; lección UX-022/UX-003/REQ-187 incorporada.
