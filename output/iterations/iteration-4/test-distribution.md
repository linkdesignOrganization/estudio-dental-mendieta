# Plan de Distribución — QA Team · Iteración 4 (Pacientes escritura + Tratamientos)

> Generado por el QA Orchestrator en MODO PLAN (paso 5e-plan, Fase 5).
> Los sub-testers (Flow, Edge Case, Visual) leen este archivo vía Auto-Dispatch.
> El PM lanza los sub-testers directamente con este plan.

## Contexto de Testing
- **Iteración**: 4 (Pacientes escritura + Tratamientos)
- **Ronda**: 1 (no existe `qa-report.md` previo en `iteration-4/` → primera ronda)
- **URL del sitio desplegado**: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **URL del backend**: N/A (frontend-only, estado en localStorage)
- **Total criterios de esta iteración**: 27 funcionales nuevos/corregidos
  (REQ-173..181, REQ-182..185 + F01, REQ-192..197, REQ-198..201, REQ-202..205, REQ-267..270)
  + NFR transversales aplicables a las pantallas nuevas (NFR-002, NFR-004, NFR-020..023).
- **Criterios nuevos a testear (sub-testers esta ronda)**: 27 (ver gap-analysis abajo)
- **Criterios a re-testear (fallaron en ronda anterior)**: 0 (es Ronda 1 de It4)

> **TESTING CONTRA EL SITIO DESPLEGADO (obligatorio).** El PM pusheó It4 y verificó el deploy en paso 5d (run `26845395311` success, bundle `main-YIQ6IJV4.js`). Todo el testing es contra el SWA, NUNCA localhost. Helpers `tests/_helpers/seed.ts` (`gotoApp`, `warmSeed`, `readState`) ya apuntan al deploy vía `playwright.config.ts`.

---

## Gap-Analysis (test-por-test) — qué YA tiene cobertura vs qué es GAP de It4

La suite existente (568 passed verde) se construyó en Fase 4 (UX-xxx) + iteraciones 1-3 (REQ-xxx). Audité qué de la escritura de It4 YA tiene aserción dedicada y qué es net-new. **Solo se asignan sub-testers a los GAPS.** El resto = PASA automatizado.

| Criterio It4 | ¿Cobertura existente? | Decisión |
|---|---|---|
| REQ-173 (2 rutas dedicadas crear) | `UX-multipaso-cierre` UX-024 testea el shell + "Atrás" preserva, pero como flujo Fase-4 | **GAP parcial** → re-anclar a REQ con la novedad (género). Flow |
| REQ-174 (selector GÉNERO, antes hardcode 'mujer') | **NINGUNA** — UX-024 no toca género | **GAP** → Flow (crear "hombre" → ficha Masculino) |
| REQ-175 (Paso 2 clínicos + foto opcional) | parcial (shell), foto sin validar | **GAP** → Flow (sin foto) + Edge (validación foto) |
| REQ-176 (valida inline + formato DNI) | UX-024 "no avanza sin requeridos" (genérico) | **GAP** (formato DNI puntual) → Edge |
| REQ-177 (Atrás preserva + Cancelar c/ confirmación) | UX-024 cubre "Atrás preserva"; Cancelar-confirmación NO | **GAP** (cancelar con confirmación) → Edge |
| REQ-178 (persiste + navega a ficha + toast) | UX-024 end-to-end persiste + avatar iniciales | **PASA automatizado** (lo cubre UX-024); se re-asevera en el flujo de género |
| REQ-179 (sin foto → placeholder iniciales) | UX-024 asevera "sin imágenes rotas" | **PASA automatizado** parcial; Flow lo re-asevera en el caso género |
| REQ-180 (mobile 2 pasos) | NINGUNA dedicada (mobile crear) | **GAP** → Visual |
| REQ-181 (indicador de paso) | implícito en UX-024 (`Paso 1 de 2`) | **GAP** (aserción visual del stepper) → Visual |
| REQ-182 (ruta dedicada editar, precargado) | `UX-multipaso-cierre` UX-025 testea precarga | **PASA automatizado** (UX-025); re-ancla en Flow |
| REQ-183 (guardar valida + persiste + ficha + toast) | UX-025 "Guardar cambios persiste (refresh)" | **PASA automatizado** (UX-025) |
| **REQ-184 / F01 (DIRTY-CHECK)** | UX-025 **EXPLÍCITAMENTE lo difirió a Fase 5** (ver su nota: "la demo NO expone Cancelar con confirmación de descarte… queda para FASE 5") | **GAP CRÍTICO** → Flow (3 ramas: sin cambios→sin diálogo; con cambios→diálogo; tras guardar→sin prompt) |
| REQ-185 (mobile editar) | NINGUNA dedicada | **GAP** → Visual |
| REQ-192 (5 col, 5ta = Próxima fecha) | `UX-routes-navigability` solo abre `/tratamientos` como SHELL (200 + módulo); NO asevera columnas/Próxima fecha | **GAP** → Flow |
| REQ-193 (único filtro = profesional) | NINGUNA dedicada en tratamientos | cubierto indirecto por patrón; **GAP menor** → Flow lo asevera de paso |
| REQ-194 (fila → detalle plan) | NINGUNA dedicada | **GAP** → Flow |
| REQ-195 (estado vacío filtro sin resultados) | NINGUNA dedicada | **GAP** → Edge |
| REQ-196 (etapas X/Y legible) | NINGUNA dedicada | **GAP** → Flow |
| REQ-197 (mobile + skeletons) | NINGUNA dedicada | **GAP** → Visual |
| REQ-198 (cards aireadas, no tabla densa) | NINGUNA dedicada | **GAP** → Visual |
| REQ-199 (≥12 tipos; hay 15) | `UX-060-067` UX-063 cuenta "≥12 tipos de tratamiento" en el ESTADO | **PASA automatizado** (estado); Edge re-asevera en la UI del catálogo |
| REQ-200 (card → detalle) | `UX-routes-navigability` abre `tipos/tt-01` como shell | **GAP** (click real de card) → Edge |
| REQ-201 (mobile 1-2 col catálogo) | NINGUNA dedicada | **GAP** → Visual |
| REQ-202 (detalle tipo: pasos/materiales/costo/duración + **profesionales habilitados REAL por especialidad**) | NINGUNA dedicada; el "profesionales habilitados real" es net-new de It4 | **GAP** → Flow |
| REQ-203 (costo ARS formateado) | patrón `ars` cubierto en otras pantallas | **GAP menor** → Visual lo asevera en el detalle de tipo |
| REQ-204 (volver al catálogo) | NINGUNA dedicada | **GAP** → Flow |
| REQ-205 (mobile detalle tipo) | NINGUNA dedicada | **GAP** → Visual |
| **REQ-267 (selector 6 estados)** | `UX-020-032` UX-028/UX-086 cambia SOLO sana→caries (1 transición) | **GAP** (los 6 estados ofrecidos) → Flow |
| **REQ-268 (cambia, persiste, refleja + `@defer on immediate`)** | UX-028/UX-086 cubre persiste+refleja con `reload({domcontentloaded})` (1 estado) | **GAP** (hard-reload + deep-link mobile 32 piezas, regresión BUG-E04) → Flow |
| REQ-269 (coherencia con la ficha) | NINGUNA dedicada | **GAP** → Flow (de paso, en el cambio de estado) |
| REQ-270 (mobile selector ≥44px) | NINGUNA dedicada | **GAP** → Visual |

**Resumen del gap-analysis:** 27 criterios de It4. **PASA automatizado (cubiertos por la suite existente):** REQ-178, REQ-179 (parcial), REQ-182, REQ-183, REQ-199 (estado). **GAP que requieren sub-tester esta ronda:** los 22 restantes, distribuidos abajo. Es una iteración de ESCRITURA → más criterios que It1-3 (esperado).

---

## Asignación: Flow Tester → e2e/tests/flow/

### Criterios asignados (11)
- **REQ-173 / REQ-174 / REQ-178 / REQ-179**: crear paciente — flujo 2 rutas (`/pacientes/nuevo/datos` → `/pacientes/nuevo/clinico`) con **selector de GÉNERO**. Crear un paciente **"hombre"** (Masculino) end-to-end, persiste + navega a `/pacientes/{id}/informacion`, ficha refleja **Masculino** (NO "mujer"), toast de éxito, avatar a iniciales (sin foto, sin imagen rota).
- **REQ-182 / REQ-183**: editar paciente — ruta `/pacientes/:id/editar` con form **precargado**; "Guardar cambios" persiste (refresh real) y vuelve a la ficha. (Re-ancla UX-025 a REQ; PASA automatizado pero se re-asevera para tener el .spec.ts bajo REQ de It4.)
- **REQ-184 / F01 (DIRTY-CHECK, crítico)**: editar paciente — **3 ramas**:
  1. SIN cambios → "Cancelar" sale DIRECTO a la ficha, **sin diálogo de confirmación**.
  2. CON cambios reales (editar teléfono) → "Cancelar" muestra `app-confirm-dialog` "Tenés datos cargados. ¿Querés descartar y salir?".
  3. Tras "Guardar cambios" → el baseline se re-congela → NO aparece prompt post-guardado.
- **REQ-267 / REQ-268 / REQ-269**: odontograma editable — desde `/pacientes/:id/pieza/:fdi`, el `app-tooth-state-selector` ofrece **los 6 estados** (sana, caries, obturación, ausente, en tratamiento, prótesis); cambiar estado + "Guardar estado" → **persiste tras HARD reload** + se refleja en el odontograma (aria-label/chip actualizado) + leyenda coherente.
- **REQ-192 / REQ-193 / REQ-194 / REQ-196**: lista de tratamientos activos — tabla con **columna "Próxima fecha"** (5ta col, con dato real `dd/mm/aaaa` y caso "Sin fecha prevista"), filtro principal por profesional, fila clickeable → detalle del plan, etapas legibles "X/Y".
- **REQ-202 / REQ-204**: detalle de tipo de tratamiento — `/tratamientos/tipos/:id` muestra pasos típicos, materiales, costo, duración y **"profesionales habilitados" REAL por especialidad** (generalista siempre + especialista que matchea el tipo; NO el `slice(0,4)` genérico previo); back-link vuelve al catálogo.

### Instrucciones específicas
- **URL base**: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **Camino del usuario REAL** (no deep-link forzado salvo regresión): listado → ficha → sub-pantalla. Para crear: `gotoApp(page,'/pacientes/nuevo/datos')` (la ruta `/pacientes/nuevo` NO existe → cae a 404; usar `nuevo/datos`). Editar: `/pacientes/:id/editar`. Pieza: `/pacientes/:id/pieza/:fdi`.
- **REQ-174 (género) — punto caliente del plan-verifier**: el default del signal del form es `'mujer'` solo como valor INICIAL del `<select id="c-genero">` (opciones Femenino/Masculino). Hay que ELEGIR "Masculino" explícitamente y verificar que la ficha creada refleja Masculino → prueba que la escritura usa `this.genero()`, no el hardcode previo.
- **REQ-268 — regresión BUG-E04 (`@defer on immediate`)**: el tab odontograma migró de `@defer (on idle)` a `(on immediate)` en It4 para hidratar las 32 piezas de forma determinista en deep-link/refresh. El diagrama es un chunk lazy: tras navegar al tab o tras HARD reload, **esperar web-first** `expect(page.getByRole('button',{name:/^Pieza \d+/})).toHaveCount(32)` ANTES de tocar una pieza (NO un `scrollIntoView` imperativo previo — ese no reintenta y compite con el `@defer`). Verificar la persistencia con `page.reload({waitUntil:'domcontentloaded'})` y, si es factible, un deep-link directo a `/pieza/:fdi` que confirme el estado guardado.
- **REQ-268 — NO re-asignar la transición sana→caries básica**: ya la cubre `UX-020-032` UX-028/UX-086 (PASA). Lo NUEVO es: (a) los 6 estados ofrecidos en el selector, (b) hard-reload + el endurecimiento `on immediate`. Enfocar ahí.
- **REQ-184/F01 — copy exacto** del diálogo de descarte: "Tenés datos cargados. ¿Querés descartar y salir?" (verificado en 5d). NO debe revelar lenguaje de demo/mock.
- **REQ-202 (profesionales habilitados real)**: verificar que un tipo de **odontopediatría/ortodoncia** muestra al especialista correcto + el generalista, y que un tipo distinto muestra OTRO conjunto (prueba de que es derivado por especialidad, no fijo). Garantía: ≥1 profesional siempre.
- **GIF obligatorio**: grabar el flujo de **crear paciente "hombre" con género** (datos → clínico → ficha Masculino) y el flujo de **cambiar el estado de una pieza** (pieza → selector 6 estados → Guardar → odontograma reflejado).

---

## Asignación: Edge Case Tester → e2e/tests/edge-case/

### Criterios asignados (7)
- **REQ-176**: crear paciente — el Paso 1 valida inline los requeridos y el **formato del DNI** (7-8 dígitos); "Siguiente" NO avanza a `nuevo/clinico` con DNI inválido y muestra el error junto al campo.
- **REQ-175 / REQ-179 (SEGURIDAD — foto)**: validación de la foto opcional del Paso 2:
  - **Rechaza SVG** (raster only — fix de seguridad de It4: la foto excluye SVG para evitar XSS vía `<svg>`/script embebido).
  - **Rechaza archivos > 2 MB** (límite de tamaño).
  - **Acepta** un raster válido pequeño (jpg/png) → se previsualiza/persiste como data URL; sin foto → placeholder iniciales (sin imagen rota).
  - Verificar el mensaje de error inline de tipo/tamaño (copy de producción, sin lenguaje de demo).
- **REQ-177**: crear paciente — "Cancelar" con datos cargados pide **confirmación** antes de descartar; "Atrás" preserva los datos del Paso 1 (re-ancla la rama de cancelación que UX-024 no cubría).
- **REQ-195**: lista de tratamientos activos — aplicar el filtro por profesional que **no arroje resultados** muestra un **estado vacío** con guidance (no pantalla en blanco, no crash).
- **REQ-199 / REQ-200**: catálogo de tipos — la UI renderiza **≥12 cards** (hay 15 tipos tt-01..tt-15); cada card es clickeable y **navega al detalle** del tipo (`/tratamientos/tipos/:id`).

### Instrucciones específicas
- **URL base**: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **REQ-175/179 (foto) — cómo construir los fixtures sin archivos en disco**: usar `setInputFiles` con buffers en memoria (Playwright `setInputFiles(name, {name, mimeType, buffer})`). El `<input type=file>` está oculto (se dispara desde un botón); localizarlo por `page.locator('input[type=file]')` y `setInputFiles` directo. Para >2MB: `Buffer.alloc(2.1*1024*1024)`. Para SVG: `mimeType:'image/svg+xml'` con bytes `<svg…>`. Para raster válido: un PNG mínimo (1x1) en base64.
- **REQ-175/179 — severidad**: el rechazo de SVG es un **fix de seguridad** (adyacente a NFR-010). Un fallo aquí (la app acepta SVG o no limita el tamaño) es severidad ALTA. Confirmar que la validación ocurre client-side ANTES de persistir.
- **Edge cases anticipados**: DNI con letras/menos de 7 dígitos/más de 8; foto con extensión `.svg` disfrazada de otro tipo (verificar que valida por mimeType/contenido, no solo por extensión); filtro de tratamientos por un profesional sin tratamientos activos asignados.
- **Estados vacíos sin lenguaje de demo/mock**: el copy de cualquier estado vacío NO debe contener demo/mock/simulado/de prueba/ficticio/viewcase (REQ-272 transversal).
- **GIF obligatorio**: grabar el intento de **subir una foto SVG / >2MB rechazada** con el mensaje de error inline.

---

## Asignación: Visual Checker → e2e/tests/visual/

### Criterios asignados (10 + NFR)
- **REQ-180 / REQ-185**: crear (2 pasos) y editar paciente **usables en mobile** — formularios a 1 columna, inputs de altura consistente, navegación entre pasos y guardar/cancelar accesibles, **touch target ≥44px**, **sin scroll horizontal**.
- **REQ-181**: indicador de paso visible (`app-stepper` "Datos personales / Datos clínicos", "Paso 1 de 2"/"Paso 2 de 2").
- **REQ-197 / REQ-201 / REQ-205**: tratamientos — lista (skeletons mientras carga + mobile), catálogo (cards 1-2 columnas en mobile) y detalle de tipo usables en mobile.
- **REQ-198**: catálogo en **cards aireadas** (NO tabla densa) con descripción/costo/duración.
- **REQ-203**: costo en **pesos argentinos** correctamente formateado en el detalle de tipo.
- **REQ-270**: odontograma editable — el `app-tooth-state-selector` (`.tss__opt`) tiene **touch target ≥44px** en mobile, legible y operable **sin scroll horizontal**; el odontograma editable se navega cómodamente en celular.

### Instrucciones específicas
- **URL base**: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **Breakpoints**: mobile (<768px), tablet (768-991px), desktop (≥992px). El proyecto `mobile-chromium` (~390px) ya existe en `playwright.config.ts`; los tests mobile-only se hacen con `test.skip(project!=='mobile-chromium')`.
- **Touch targets ≥44px**: medir `getBoundingClientRect()` de los controles de los formularios multi-paso (botones Siguiente/Atrás/Guardar/Cancelar, `<select id=c-genero>`, inputs), del botón "Registrar pago" y del **selector de estado de pieza** (`.tss__opt`). Regla global vive en `theme.scss` (`--touch-target-min: 44px` en `@media (max-width:767px)`); validar que aplica en las pantallas NUEVAS de It4.
- **Sin scroll horizontal**: `documentElement.scrollWidth - clientWidth <= 2` en `/pacientes/nuevo/datos`, `/pacientes/nuevo/clinico`, `/pacientes/:id/editar`, `/tratamientos`, `/tratamientos/tipos/:id`, y el odontograma editable.

### NFR asignados a Visual (performance + accesibilidad)
| NFR | Criterio | Verificación en It4 |
|---|---|---|
| NFR-002 | Bundle inicial < 500KB gzipped | Re-confirmar en las rutas nuevas (ya error-budgeted en build; spot-check vía tamaño de transferencia). It4 build: `427.99 kB / 103.48 kB gzipped` |
| NFR-004 | Odontograma 32 piezas sin lag | Tras `@defer on immediate`: las 32 piezas hidratan y el cambio de estado no introduce lag perceptible (`browser_evaluate` del tiempo de render del tab) |
| NFR-020 | Contraste WCAG AA | Texto/controles de las pantallas nuevas (crear/editar paciente, catálogo, detalle de tipo, selector de pieza) cumplen AA |
| NFR-021 | Focus ring visible | Todo control nuevo (selector género, selector de estado de pieza, cards de catálogo, botones de wizard) tiene focus ring por teclado |
| NFR-022 | Touch targets ≥44px mobile | Ver arriba (cubre REQ-180/185/270/253) |
| NFR-023 | Labels en navegación | N/A para It4 (no cambia la navegación principal) — justificar N/A |

### BVC-xxx asignados
| BVC-xxx | Criterio del Cliente | Tipo de verificación |
|---------|---------------------|---------------------|
| — | N/A en It4 | Los BVC (brief compliance) son criterios de Fase 4 ya verificados en `visual-build/`. La suite `BVC-NFR-brief-compliance.spec.ts` corre como regresión; It4 no introduce nuevos BVC. |

- **GIF obligatorio**: grabar el recorrido **mobile** de crear paciente (2 pasos sin scroll horizontal) y del selector de estado de pieza con touch targets ≥44px.

---

## Regresión Automatizada (de regression-results.md)
- **Resultado de `npx playwright test e2e/tests/`** (single-run `--no-chunks`, 2026-06-02T18:15): **568 passed / 1 failed / 7 skipped**.
- **El único fallo (REQ-187 mobile-chromium)** ya fue **adaptado al nuevo timing del odontograma (`@defer on immediate`)** por el edge-case-tester (10/10 verde, NO es bug). **Regresión efectivamente VERDE.** **NO re-asignar REQ-187.**
- **Criterios verificados por automatización (PASA automatizado — NO asignar a sub-testers)**: toda la suite Fase 4 (UX-xxx, DC-xxx, BVC-xxx) + iteraciones 1-3 (REQ-057/058 seed, REQ-059/060/063/068/070/088/089/090 agenda, REQ-101 filtros, REQ-128/186/187 ficha+pieza). Dentro del alcance de escritura de It4, quedan PASA automatizado por la suite existente: **REQ-178, REQ-179 (parcial), REQ-182, REQ-183, REQ-199 (estado), y la transición básica sana→caries del odontograma (UX-028/UX-086)**.
- **Criterios con regresión detectada (ya corregidos antes de esta ronda)**: ninguno de datos/lógica. El único rojo era de **timing de test** (REQ-187), ya adaptado por el edge-case-tester — no es regresión de producto.

---

## Criterios Pendientes de Testing Manual (sub-testers esta ronda)
- **Total criterios que requieren sub-testers esta ronda**: **22** (Flow 11 · Edge 7 · Visual 10; con solapamiento intencional mínimo en REQ-182/183 re-anclados y REQ-203/270 visuales).
- **Criterios que FALLARON en ronda anterior (re-verificar fix)**: 0 (Ronda 1 de It4).
- **Criterios DESBLOQUEADOS (antes bloqueados por bug, ahora testeables — generar .spec.ts)**: 0 (no hubo ronda previa).
- **Criterios nuevos sin test automatizado dedicado** (los GAP del análisis):
  - Crear paciente con **género** + foto opcional: REQ-173, REQ-174, REQ-175, REQ-176, REQ-177, REQ-179, REQ-180, REQ-181.
  - Editar paciente **dirty-check (F01)**: REQ-184, REQ-185 (mobile).
  - **Odontograma editable** (6 estados, persiste hard-reload, mobile ≥44px): REQ-267, REQ-268, REQ-269, REQ-270.
  - **Tratamientos** lista (Próxima fecha): REQ-192, REQ-193, REQ-194, REQ-195, REQ-196, REQ-197.
  - **Tratamientos** catálogo + detalle: REQ-198, REQ-200, REQ-201, REQ-202, REQ-203, REQ-204, REQ-205.
- **Sub-testers a lanzar**: **flow-tester, edge-case-tester, visual-checker** (los 3 tienen criterios asignados).
- Cada sub-tester deja sus resultados en `output/iterations/iteration-4/{flow-tester,edge-case-tester,visual-checker}-results-ronda-1.md` y sus `.spec.ts` en `e2e/tests/{flow,edge-case,visual}/`.
