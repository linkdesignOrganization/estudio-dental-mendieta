# Plan de Distribución — QA Team · Iteración 5 (Facturación + Pagos + Reportes — ÚLTIMA)

> Generado por el QA Orchestrator (MODO PLAN, paso 5e-plan). Los sub-testers lo leen vía Auto-Dispatch.
> **Iteración de CIERRE**: cierra los 272 REQ del proyecto. Gap-analysis test-por-test exhaustivo.

## Contexto de Testing
- **Iteración:** 5 (última — Épica 8 Facturación detalle, Épica 9 Reportes, Épica 11 Pagos editable con fecha)
- **Ronda:** 1 (no existe `qa-report.md` previo en `iteration-5/` → primera ronda)
- **Fase:** 5 (Iteraciones) · Modo: NORMAL
- **URL del sitio desplegado:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (SIEMPRE testear contra el deploy, NUNCA localhost)
- **Bundle servido en producción = build de It5:** `main-5NSLIGIB.js` (run `26853562866`, deploy verificado paso 5d). headSha == HEAD local.
- **Total criterios del proyecto:** 272 REQ + 20 NFR
- **Criterios NUEVOS/CORREGIDOS a testear esta ronda (con `.spec.ts` dedicado):** 23 (ver gap-analysis)
- **Resto:** PASA automatizado vía regresión de FASE 4 + iteraciones 1-4 (efectivamente VERDE — ver abajo)

---

## Regresión Automatizada (estado de partida)

- **Resultado de la regresión previa al plan:** **709 passed / 1 failed.**
- **El único rojo — UX-003 (sidebar nav, `DC-030-035-layout-shell` / nav)** **NO es bug ni cambio de título.** Diagnosticado como **flaky**: carrera de commit del redirect `/facturacion` → `/facturacion/presupuestos` introducido por It5 (el título del módulo activo se sincroniza un tick después del navigate). **REFORZADO por el Flow Tester** (`flow-ux003-it5.md`, 11/11 verde con gates web-first). **Regresión efectivamente VERDE.**
- **NO re-asignar UX-003.** Queda PASA (test estabilizado) en la consolidación.
- **Nota:** el `regression-results.md` de It5 no se escribió por un dir faltante ya resuelto; el resultado autoritativo es **709 pass + UX-003 reforzado verde**. La corrida de consolidación (que incorpora los specs nuevos de esta ronda) será la cifra final del qa-report.
- **Criterios verificados por automatización (PASA automatizado — NO asignar a sub-testers):** todo el alcance de Épicas 1-7 + 10 + la base de demo de Facturación/Reportes ya cubierto por la suite DC/UX/BVC de FASE 4 y los specs REQ de It1-4 (47 archivos `.spec.ts`). Incluye, entre los relevantes a Facturación/Reportes ya cerrados: UX-029 wizard presupuesto (creación E2E + total auto), UX-030 aprobar presupuesto (no 2x), UX-053 reportes (dashboard con datos + charts presentes sin crash), DC-115/116/117/118/119 (listas presupuestos/facturas + OS detalle pacientes-asociados + KPIs + charts financieros presentes), REQ-221..226 facturas (de la demo), DC-112/UX-050 pago monto-inválido + cancelar.
- **Regresiones de producto detectadas:** ninguna (0).

---

## Gap-Analysis test-por-test (los 4 entregables de It5)

> Método: para cada feature nueva/corregida se buscó cobertura **aseverada** (no transitiva) en los 47 specs. La suite está anclada en DC/UX/BVC + REQ; varios It5 ya tienen cobertura PARCIAL que parece total. Se asigna SOLO la sub-parte sin cubrir.

| Feature It5 | Criterios | Cobertura existente | Veredicto |
|---|---|---|---|
| **F02** — Crear presupuesto: "Atrás" repuebla el paciente del Paso 1 (`BudgetFlowService`) | REQ-216/219 (preservación) | `UX-multipaso-cierre.spec.ts` asevera el comportamiento **VIEJO** ("la demo NO repuebla el select al volver") + re-selecciona a mano → **obsoleto, contradice el fix** | **GAP → Flow** |
| **Pago editable con FECHA** | REQ-259/260/261/262/263 (happy-path + fecha) | `UX-050-DC-112-pago-monto-invalido.spec.ts` cubre solo monto-validación + cancelar; **NO** campo fecha, **NO** persistencia/saldo/badge | **GAP → Flow (E2E persiste) + Visual (fecha max=hoy, mobile ≥44px)** |
| **Presupuesto detalle**: condiciones / "válido hasta {venc}" / flag vencido / estados resueltos / link paciente | REQ-211/214/215 | `UX-030` (en `UX-multipaso-cierre`) cubre solo aprobar/no-2x; **NO** condiciones, **NO** válido-hasta, **NO** vencido, **NO** mensaje resuelto por estado, **NO** link paciente, **NO** mobile | **GAP → Flow + Visual (mobile)** |
| **Obras sociales detalle**: historial de liquidaciones | REQ-229/230 | `DC-117` cubre solo "Pacientes asociados"; **NO** la sección nueva "Historial de liquidaciones" | **GAP → Flow** |
| **Reportes**: KPI dashboard + 4 reportes con gráficos REALES + métricas + ARS + skeletons + mobile + a11y | REQ-232..246 | `UX-053`/`DC-118`/`DC-119` aseveran títulos de chart presentes + N `<figure>` (cobertura **de presencia**, pasaría con placeholders); **NO** geometría SVG/CSS por tipo, **NO** ARS (REQ-242), **NO** skeletons (REQ-246), **NO** responsive del grid (REQ-245), **NO** KPI por teclado (REQ-236) | **GAP → Flow (KPI calc + click-through) + Visual (geometría/ARS/skeleton/mobile/a11y)** |

**Criterios marcados PASA automatizado (cubiertos, NO asignar):** REQ-206..210 (lista presupuestos), REQ-212/213 (acción primaria + aprobar persiste — `UX-030`), REQ-216..220 + REQ-271 (wizard presupuesto creación E2E — `UX-029`/`UX-multipaso-cierre`), REQ-221..226 (facturas), REQ-227/228/231 (lista OS), REQ-237..244 charts **presencia** (la geometría se eleva a verificación esta ronda), REQ-247..251 (feedback transversal), REQ-264..266 (restablecer datos — `UX-088`/confirmaciones), REQ-267..270 (odontograma — It4). REQ-272 (anti-demo) se barre como aserción transversal en cada spec nuevo.

---

## Asignación: Flow Tester → e2e/tests/flow/
### Criterios asignados
- **REQ-216 / REQ-219 (F02 corregido):** crear presupuesto — al ir **"Atrás"** del Paso 2 → Paso 1, el `<select id="b-pac">` **conserva el paciente** (queda seleccionado, NO vuelve a "Elegí un paciente") y se puede avanzar **sin re-seleccionar**. La selección de tratamientos del Paso 2 también se preserva. Aseverar el comportamiento NUEVO (BudgetFlowService).
- **REQ-259 / REQ-261 / REQ-262 (pago editable E2E con fecha):** registrar un pago con monto>0 + **fecha** + medio + concepto → persiste el movimiento en la cuenta corriente, **recalcula el saldo**, el nuevo movimiento aparece en la lista, el **resumen (Cobrado/Saldo) se actualiza**, el **badge de estado de cuenta del paciente en la lista de pacientes queda coherente** con el nuevo saldo, toast "Pago registrado.", y **sobrevive a un refresh real** (hidrata desde localStorage).
- **REQ-260 (fecha en el modelo de datos):** el movimiento persistido lleva la **fecha elegida** (no la de hoy si se cambió). Verificar en el estado/lista.
- **REQ-211 / REQ-214 (presupuesto detalle):** el detalle muestra **"Válido hasta el {vencimiento}"**, la sección **"Condiciones"** (lista de 3 condiciones), el **flag "Vencido"** cuando aplica, y para estados resueltos (aprobado/rechazado/vencido) muestra el **mensaje coherente** en vez de la acción "Aprobar" (no se aprueba dos veces). El **link al paciente** (`.bdet__patient-link`) navega a su ficha (REQ-211 incluye "paciente").
- **REQ-229 / REQ-230 (obra social detalle):** el detalle muestra **"Historial de liquidaciones"** con ≥1 fila real (`.osd__settle-row`: período + estado "Liquidada"/"En proceso" + monto ARS), derivada del estado (no el empty-state). Un paciente asociado navega a su ficha (REQ-230).
- **REQ-232 / REQ-233 / REQ-234 (dashboard KPI):** el dashboard muestra ≤6 KPI cards con valores **CALCULADOS del estado real** (no hardcode); cada KPI es **clickeable y navega** a su reporte detallado correspondiente. Verificar el mapeo card→ruta de los 6 (`/reportes/{pacientes|tratamientos|financiero|productividad}` según el href de la card).

### Instrucciones específicas (Flow)
- **URL base:** https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **Rutas It5 (deep-link directo soportado, pero esperar el selector del contenido final):**
  - Crear presupuesto: `/facturacion/presupuestos/nuevo/paciente` (Paso 1) ↔ `/nuevo/items` (Paso 2) ↔ `/nuevo/confirmar` (Paso 3). Control paciente: `<select id="b-pac">` con label "Paciente"; opciones `{{nombre}} {{apellido}}` (ej. "Diego Sosa"). Botones "Siguiente"/"Atrás"/"Crear presupuesto". Total: `Total seleccionado` → `.wiz__running-total`.
  - Pago: `/pacientes/:id/pagos/nuevo` (ej. `pac-001`). Campos: `#pay-amount` (spinbutton "Monto (ARS)", min=1), **`#pay-date` (`<input type="date">` label "Fecha", `[max]="hoy"` = `2026-06-01`, valor inicial `2026-06-01`)**, `#pay-method` (select), `#pay-note`. Botón submit "Confirmar pago" (`[disabled]="!isValid()"`). Tras confirmar → vuelve a `/pacientes/:id/pagos`. Tab Pagos muestra "Saldo pendiente"/resumen + lista de movimientos.
  - Presupuesto detalle: `/facturacion/presupuestos/:id`. Selectores: `.bdet__section-title` ("Tratamientos incluidos"/"Condiciones"), texto "Válido hasta el", `.bdet__meta-item--warn` ("Vencido — la fecha de validez ya pasó"), `.bdet__resolved` (mensaje resuelto), `.bdet__patient-link`. **Pendiente** muestra botones "Rechazar"/"Aprobar presupuesto"; **no-pendiente** muestra `.bdet__resolved`.
  - Obra social detalle: `/facturacion/obras-sociales/:id` (ej. `os-osde`). Sección liquidaciones: `h3` "Historial de liquidaciones" + `.osd__settle-list` > `.osd__settle-row`. Pacientes: `.osd__patient` (link a `/pacientes/:id`).
  - Reportes dashboard: `/reportes`. KPI cards son `<a href="/reportes/...">`. Reportes detallados: `/reportes/{pacientes|tratamientos|financiero|productividad}`.
- **Datos de referencia (ancla del seed):** `pre-008` (P-00125) = PENDIENTE; `pre-020` (P-00137) = APROBADO. Para el flag "vencido"/estado "rechazado" buscar un presupuesto con ese estado en la lista (`/facturacion/presupuestos`) — los estados son pendiente/aprobado/rechazado/vencido. Hoy del viewcase = **2026-06-01**.
- **Navegación de tablas (evitar falso negativo):** las filas de `app-data-table` navegan por `(click)`→`router.navigate()`, **NO** por `<a href>`. Para abrir un detalle de presupuesto desde la lista: click en `app-data-table tbody tr` (desktop) / `.dt__card` (mobile) y esperar `.bdet__section-title`. Scrapear `a[href]` en la tabla da 0 filas → falso FAIL. (La lista de OS sí usa link "Ver detalle".)
- **NO usar `waitUntil:'networkidle'`** contra este SWA (cuelga por keep-alive). Usar `domcontentloaded` + `waitForSelector` por markup real.
- **Idempotencia de escritura (OBLIGATORIO):** el pago muta `localStorage`. Llamar `resetSeed()` en `afterEach`/`beforeEach` (helper `warmSeed`/`readState` en `e2e/tests/_helpers/seed.ts`) para no arrastrar saldo entre tests. Verificar persistencia con `reload({waitUntil:'domcontentloaded'})` + re-asserción del saldo.
- **GIFs/evidencia OBLIGATORIOS:** grabar el flujo de **registrar pago con fecha** (form → confirmar → saldo actualizado en el tab Pagos) y el de **presupuesto detalle** (condiciones + válido-hasta). PNGs de hito si la corrida va verde (video Playwright es retain-on-failure).
- **Barrido anti-demo (REQ-272):** en cada pantalla nueva, aseverar que el copy visible NO matchea `/\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i`.
- **NO duplicar** lo ya cubierto: la **creación E2E** del presupuesto (UX-029) y **aprobar** (UX-030) ya tienen spec → F02 solo asevera la **preservación al "Atrás"**. El **monto inválido** del pago (DC-112/UX-050) ya tiene spec → el pago nuevo asevera el **happy-path con fecha + persistencia + saldo**.

---

## Asignación: Visual Checker → e2e/tests/visual/
### Criterios asignados
- **REQ-235 / REQ-236 (dashboard KPI responsive + a11y):** las KPI cards se apilan en 1-2 columnas en mobile; son **alcanzables y activables por teclado** con focus ring visible.
- **REQ-237..244 — geometría REAL de los gráficos (eleva la cobertura de "presencia" a "render"):** por cada reporte, aseverar que cada `app-mini-chart` renderiza la **geometría correcta según su tipo**, no un bloque vacío:
  - `bar` → `.mc__bar` con `style*="height"` (% > 0)
  - `hbar` → `.mc__hfill` con `style*="width"` (% > 0)
  - `line` → `svg polyline.mc__line-path` con atributo `points` de ≥2 puntos
  - `donut` → `svg circle.mc__donut-arc` con `stroke-dasharray` + número "%" visible
  - Conteo de charts por reporte (del código `report-detail.component.ts`): **pacientes 5, tratamientos 4, financiero 5, productividad 3** (`main figure` count).
- **REQ-242 (formato ARS):** en el reporte financiero, los valores de los charts con `valueFormat='ars'` (Facturación por OS, Deuda por antigüedad, Cobranzas vs facturado) se muestran como pesos compactos `$ 1,2 M` / `$ 320 K` / `$ 8.500` (no números crudos).
- **REQ-245 (reportes responsive):** el grid `.charts` pasa de 2 columnas (desktop) a 1 columna (<768px) sin scroll horizontal; los charts se adaptan/leen sin romper layout.
- **REQ-246 (skeletons + chart-empty):** al entrar a un reporte aparecen **skeletons** (`app-skeleton`, `[aria-busy="true"]`, ~450ms) antes de los charts — **NO spinner**. El estado "Sin datos suficientes para este gráfico" es source-only (con el seed todos los charts tienen datos) → verificación visual/source, documentar.
- **REQ-260 (fecha del pago — UI):** `#pay-date` es `<input type="date">` con `label[for="pay-date"]` "Fecha" y `[max]="2026-06-01"` (no permite fechas futuras); valor inicial poblado.
- **REQ-263 / REQ-215 (mobile ≥44px, sin scroll-x):** el formulario de **registrar pago** (campos en 1 columna, controles incl. `#pay-date` y botones ≥44px) y el **detalle de presupuesto** (1 columna, acción primaria/secundaria accesibles) son usables en mobile sin scroll horizontal.

### Instrucciones específicas (Visual)
- **URL base:** https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **Breakpoints:** mobile (<768px, usar ~390px), tablet (768-991px), desktop (≥992px, usar 1280px). El grid de reportes y el form de pago colapsan a 1 columna en `@media (max-width:767px)`.
- **Selectores de geometría (de `mini-chart.component.ts`):** `figure.mc` (cada chart) + `.mc__bar` / `.mc__hfill` / `polyline.mc__line-path[points]` / `circle.mc__donut-arc[stroke-dasharray]` + `.mc__donut-num`. El valor ARS aparece en `.mc__bar-val` / `.mc__hval` (texto). Reportes detallados: `/reportes/{pacientes|tratamientos|financiero|productividad}`; cada chart-card = `article.surface-card.chart-card` con `h3.t-title` (título) + `.t-small.t-secondary` (nota).
- **Skeleton:** la card de carga es `article.surface-card.chart-card` con `app-skeleton` dentro y el wrapper `[aria-busy="true"][aria-label="Cargando reporte"]`. Es transitorio (~450ms via `setTimeout` en el effect) — capturar con assertion web-first inmediata al `goto`, o documentar como visual si la ventana es no-determinista. **NUNCA** debe aparecer un elemento con clase `spinner`.
- **Touch targets:** medir `boundingBox()` real de `#pay-date`, "Confirmar pago", "Cancelar" (pago) y de la acción primaria del detalle de presupuesto en viewport 390px → alto/ancho ≥44px. El form de pago colapsa botones a `width:100%` y `column-reverse` en mobile.
- **Mobile de reportes/charts:** verificar `scrollWidth == innerWidth` (sin scroll horizontal) en `/reportes` y en al menos un reporte detallado a 390px.
- **Anti-demo (REQ-272):** barrer el copy de reportes y del form de pago.
- **GIFs/evidencia:** capturas de los 4 reportes mostrando la geometría real (1 por tipo de chart como mínimo) + mobile del form de pago. PNGs de hito.
- **NO duplicar** la cobertura de **presencia de títulos de chart** (UX-053/DC-119 ya la tienen) — el foco es la **GEOMETRÍA + ARS + skeleton + responsive + a11y de KPIs**.

---

## Asignación: Edge Case Tester → e2e/tests/edge-case/
### Criterios asignados
- **Ninguno nuevo esta ronda.**

### Justificación
El gap-analysis no aisló ninguna sub-parte de borde NUEVA sin cubrir en It5:
- El **monto inválido** del pago (vacío/0/negativo/no-numérico + `aria-invalid` + cancelar con confirmación) ya está blindado por `UX-050-DC-112-pago-monto-invalido.spec.ts` (FASE 4) → **PASA automatizado**, NO re-asignar.
- **REQ-214** (no aprobar dos veces / estado vencido o aprobado adapta la acción) tiene su lógica de borde cubierta por `UX-030` (ya aprobado NO ofrece aprobar) **más** el camino nuevo del **mensaje resuelto por estado** que se asignó al **Flow Tester** (junto con condiciones/válido-hasta, para no fragmentar el mismo detalle en dos sub-testers).
- **REQ-238** (charts legibles con categoría vacía, no crashean) y el chart-empty (REQ-246) NO son alcanzables por UI con el seed (todos los charts tienen datos) → source-verified, cubierto por la geometría que asevera el Visual; forzar un FALLA ahí sería un falso positivo.
- Los empties de lista (presupuestos/facturas/OS) ya están en `DC-100-119-ui-states` (FASE 4).

> Si durante la consolidación se detectara una sub-parte de borde sin cubrir, el PM puede relanzar el Edge Case Tester. Para esta ronda **NO se lanza** (sin criterios asignados).

---

## BVC-xxx asignados (Brief Verification Criteria)
- **Ninguno nuevo en It5.** El `BVC-NFR-brief-compliance.spec.ts` (FASE 4) corre como regresión (verde). It5 no introduce criterios de brief nuevos.

---

## Criterios Pendientes de Testing Manual (resumen)
- **Total criterios que requieren sub-testers esta ronda:** 23 (Flow 15 + Visual 8 efectivos; varios compartidos entre detalle).
- **Criterios FALLARON en ronda anterior (re-verificar fix):** ninguno (It5 es Ronda 1).
- **Criterios DESBLOQUEADOS (antes bloqueados por bug):** ninguno.
- **Criterios nuevos/corregidos sin test dedicado (esta ronda genera `.spec.ts`):**
  - Flow: REQ-216, REQ-219 (F02); REQ-259, REQ-260, REQ-261, REQ-262 (pago con fecha); REQ-211, REQ-214 (presupuesto detalle + link); REQ-229, REQ-230 (OS liquidaciones); REQ-232, REQ-233, REQ-234 (KPI dashboard).
  - Visual: REQ-235, REQ-236 (KPI responsive/a11y); REQ-237..244 geometría real; REQ-242 (ARS); REQ-245 (reportes responsive); REQ-246 (skeletons); REQ-260, REQ-263, REQ-215 (mobile pago + presupuesto detalle).
- **Sub-testers a lanzar esta ronda:** **flow-tester, visual-checker** (Edge Case Tester sin criterios → no se lanza).

---

## Condición de Salida (FASE 5 · Iteración 5 — cierre del proyecto)
`0 fallos + 0 bloqueados + 0 regresiones + 100% criterios cubiertos (los 272 REQ) + 100% criterios con test automatizado = listo para demo final`.
Al ser la ÚLTIMA iteración, la consolidación debe confirmar que **ningún REQ de cierre quedó sin resultado** (PASA / PASA automatizado / N-A justificado), no solo el alcance de It5.
