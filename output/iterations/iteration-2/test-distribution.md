# Plan de Distribución — QA Team · Iteración 2 (Pacientes — ficha a fondo)

> Generado por el QA Orchestrator (MODO PLAN, paso 5e-plan).
> Fase: **Iteraciones (FASE 5)** · Iteración: **2 (ficha del paciente a fondo)** · Modo: **NORMAL**.
> Naturaleza: **AUDITORÍA PROPORCIONAL** sobre la ficha de 6 tabs ya construida en FASE 4 e Iteración 1. La inmensa mayoría de los criterios de la ficha (REQ-098..172, 186..191) ya está cubierta por la demo y por los **486 tests** de la suite, verdes en regresión (exit 0, seed byte-idéntico, sin drift). Esta iteración solo **blinda los gaps sin aserción dedicada** que el Developer corrigió/agregó en Iteración 2. Los sub-testers DEBEN generar `.spec.ts` para esos gaps, de modo que entren en la suite de regresión de rondas/iteraciones futuras.

---

## Contexto de Testing
- Iteración: **2** (Pacientes — ficha del paciente a fondo)
- Ronda: **1** (no existe `qa-report.md` en `output/iterations/iteration-2/` → primera ronda de esta iteración)
- URL del sitio desplegado (testear SIEMPRE contra esto, NUNCA localhost): **https://happy-coast-044ea7e0f.7.azurestaticapps.net**
- URL del backend: **N/A** — frontend-only, estado en `localStorage` (`edm:v1:state`); seed servido en `/seed/manifest.json`.
- Total criterios de la ficha (Épicas 4/5/6): cubiertos en su mayoría por regresión; ver abajo.
- **Criterios NUEVOS/CORREGIDOS a testear esta iteración (sin cobertura dedicada): 4** → REQ-186, REQ-187, REQ-128, REQ-101.
- Criterios a re-testear (fallaron en ronda anterior): **0** (es la Ronda 1 de la iteración).

---

## Resultado del gap-analysis (test-por-test)

El Developer corrigió/agregó 3 áreas en Iteración 2. Se auditó la suite (`e2e/tests/**`) buscando aserciones dedicadas para cada una. **Hallazgo clave:** ningún `.spec.ts` referencia un `REQ-1xx` — toda la suite está anclada en DC/UX/BVC (FASE 4) + REQ-057/058 (Iteración 1). La cobertura de estas áreas, donde existe, es **transitiva** y NO asevera el comportamiento nuevo.

| Área del Developer | Criterio | ¿Cobertura dedicada hoy? | Veredicto |
|---|---|---|---|
| Pantalla E — detalle de pieza: historial REAL derivado del store + nombre clínico FDI | **REQ-186** | **Parcial / transitiva.** `UX-028/UX-086` (`flow/UX-020-032-critical-flows.spec.ts:236`) cubre solo el **control editable de estado** (Sana→Caries + persistencia). `UX-080` (`flow/UX-080-094-...:93`) solo asevera que existe el heading `"Pieza 13"`. **Nadie asevera** el nombre clínico FDI ni el historial real derivado del store. | **GAP → asignar** (parte de control YA cubierta; parte de historial/nombre NO) |
| Pantalla E — estado vacío para piezas sanas/ausentes | **REQ-187** | **No.** Cero matches de `"Sin procedimientos"` en toda la suite. `UX-047` solo cuenta 32 piezas. | **GAP → asignar** |
| Tab Info — contacto de emergencia REAL (antes hardcodeado) + número de afiliado | **REQ-128** | **Parcial / transitiva inversa.** `DC-106` (`visual/DC-100-119-ui-states.spec.ts:54`) cubre solo el **camino VACÍO** (pac-007 sin contacto → placeholder "Sin contacto registrado"). **Nadie asevera** el camino POBLADO: contacto de emergencia con datos reales + número de afiliado renderizados. Cero matches de `"afiliado"` en la suite. | **GAP → asignar** (camino vacío YA cubierto; camino poblado NO) |
| Lista de pacientes — panel de FILTROS (obra social / profesional / rango de edad) | **REQ-101** | **No.** Cero matches de un botón/panel `"Filtros"` sobre `/pacientes`. Los matches de "Filtrar por profesional" son del módulo **Tratamientos**, no de Pacientes. El empty-state de `/pacientes` menciona "ajustá los filtros" pero ningún test abre el panel ni aplica un filtro. | **GAP → asignar** |

**Conclusión:** 4 criterios requieren `.spec.ts` dedicado esta iteración. El resto de criterios de Iteración 2 = **PASA (automatizado)** por la regresión verde (ver sección de Regresión). Plan **proporcional**: 2 sub-testers, sin Visual Checker (los cambios son de datos/contenido/funcionalidad, no de tokens de diseño ni superficies responsive nuevas; lo visual de estas pantallas ya está cubierto por la suite visual de FASE 4, verde en regresión).

---

## Asignación: Flow Tester → e2e/tests/flow/

### Criterios asignados
- **REQ-186** — Detalle de pieza dental: el **historial REAL** de procedimientos (derivado del store, NO hardcodeado) y el **nombre clínico FDI** de la pieza se renderizan. (El control editable de estado YA está cubierto por `UX-028/UX-086`; NO lo dupliques — enfócate en el **nombre de pieza** y en el **historial real**.)
- **REQ-128** — Tab Información general: en un paciente que SÍ tiene los datos, se renderizan el **contacto de emergencia REAL** (con su valor, no placeholder) y el **número de afiliado** junto a la obra social. (El camino VACÍO con placeholder YA está cubierto por `DC-106` sobre pac-007 — aquí cubrí el camino POBLADO en un paciente distinto que sí los tenga.)

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- Camino real del usuario (no deep-link forzado salvo para regresión): listado → ficha → tab/odontograma → pieza.
- **REQ-186 — pieza con historial:** elige una pieza que en el seed tenga procedimientos previos (una pieza "en tratamiento", "obturación", "prótesis" o "caries", NO una sana). Navega `odontograma → click en esa pieza → /pacientes/{id}/pieza/{fdi}`. Asevera: (a) el **nombre clínico FDI** de la pieza aparece (ej. "Incisivo central superior derecho", "Primer molar inferior izquierdo" — no solo el número); (b) el **historial de procedimientos** lista entradas reales coherentes con el estado de esa pieza (NO un texto hardcodeado genérico). Para confiar en que es "real derivado del store", verifica coherencia con el odontograma/historial del mismo paciente o que el contenido varía entre dos piezas/pacientes distintos.
- **REQ-128 — Info poblada:** elige un paciente del seed que tenga contacto de emergencia y afiliado (NO pac-007, que es el caso vacío). Navega a `/pacientes/{id}/informacion`. Asevera que la card de contacto muestra el **valor real** del contacto de emergencia (nombre/relación/teléfono según el modelo) y que aparece el **número de afiliado** asociado a la obra social. Confirma que NO es el placeholder "Sin contacto registrado".
- **GIF obligatorio:** graba el flujo `listado → ficha → odontograma → pieza con historial` (cubre REQ-186 de punta a punta) y, si es barato, un segundo de la ficha Info poblada.
- Genera el/los `.spec.ts` en `e2e/tests/flow/` con nombre que ancle los REQ (ej. `REQ-186-128-pieza-info-real.spec.ts`). Estos specs entran en la regresión de rondas/iteraciones futuras.

---

## Asignación: Edge Case Tester → e2e/tests/edge-case/

### Criterios asignados
- **REQ-187** — Detalle de pieza dental: una pieza **sana o ausente** (sin procedimientos) muestra el **estado vacío** explícito "Sin procedimientos registrados en esta pieza" (copy de producción, sin lenguaje de demo), NO una sección en blanco ambigua ni un crash.
- **REQ-101** — Lista de pacientes: el **panel de Filtros** (obra social / profesional / rango de edad) NO está permanentemente visible; se abre vía un botón "Filtros", aplica el filtro y reduce el listado de forma coherente; si la combinación no arroja resultados, cae en el empty-state con guidance.

### Instrucciones específicas
- URL base: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **REQ-187 — pieza vacía:** elige una pieza **Sana** (o **Ausente**) — el seed las tiene en abundancia (un paciente joven/sano sirve, ej. recorre el odontograma hasta una pieza con aria-label que contenga "Sana"). Navega `odontograma → click → /pacientes/{id}/pieza/{fdi}`. Asevera que aparece el copy exacto del estado vacío "Sin procedimientos registrados …" y que la pantalla no crashea (header/nombre de pieza presentes). Edge complementario: contrasta con una pieza CON historial (control positivo) para probar que el empty-state es condicional, no permanente.
- **REQ-101 — panel de filtros:** en `/pacientes`, asevera primero que los filtros (obra social / profesional / rango de edad) **NO** están visibles de entrada (anti-patrón REQ-101) y que existe un botón "Filtros". Ábrelo. Aplica al menos un filtro de cada dimensión disponible (obra social, profesional, rango de edad) y verifica que el listado se reduce de forma coherente (el contador "N pacientes en el sistema"/visibles cambia y las filas restantes cumplen el criterio). Edge cases: (a) una combinación de filtros sin match → empty-state "No encontramos pacientes con ese criterio" + guidance; (b) limpiar/cerrar el panel restaura el listado completo. Cuida los **breakpoints**: en mobile el panel debe seguir siendo usable (touch target ≥44px).
- **GIF obligatorio:** graba el flujo del panel de Filtros en `/pacientes` (abrir → aplicar obra social/profesional/edad → ver listado filtrado → combinación sin match → limpiar). Opcionalmente uno corto de la pieza sana mostrando el empty-state.
- Genera el/los `.spec.ts` en `e2e/tests/edge-case/` con nombre que ancle los REQ (ej. `REQ-187-pieza-vacia.spec.ts`, `REQ-101-filtros-pacientes.spec.ts`). Entran en la regresión futura.

---

## Asignación: Visual Checker → e2e/tests/visual/

**SIN asignación esta iteración (Ronda 1).**

Justificación (proporcionalidad): los 3 cambios del Developer en Iteración 2 son de **datos/contenido/funcionalidad** (historial real derivado del store, nombre FDI, contacto/afiliado reales, panel de filtros), no introducen tokens de diseño nuevos ni superficies responsive nuevas. El cumplimiento visual de la ficha del paciente, el detalle de pieza y la lista de pacientes (tokens, tipografía, spacing, estados, touch targets ≥44px, skeletons-no-spinners) ya está cubierto por la suite visual de FASE 4 (`DC-*` + `BVC-*`), **verde en la regresión de esta iteración (486/0)**. No hay gap visual dedicado que blindar. El aspecto responsive puntual del panel de Filtros y del empty-state de pieza se verifica dentro de las asignaciones del Edge Case Tester (instrucción de breakpoints), sin duplicar un sub-tester completo.

### BVC-xxx asignados (Brief Verification Criteria)
- Ninguno nuevo esta iteración. Los BVC del brief ya están verdes en la regresión (ver `BVC-NFR-brief-compliance.spec.ts` y `DC-120-143-feedback.spec.ts`).

---

## Regresión Automatizada (lee de regression-results.md)

- Comando: `npx playwright test` (single-run, `--no-chunks`), corrida `2026-06-02T12:35:34`.
- **Resultado de `output/iterations/iteration-2/regression-results.md`: exit code 0 — 486 passed · 0 failed · 4 skipped (39.3m).** Seed byte-idéntico, **sin drift** de secuencia.
- **Criterios verificados por automatización (PASA automatizado — NO asignar a sub-testers):** todos los criterios de la ficha del paciente y del sistema cubiertos por la suite de 25 archivos `.spec.ts`. En concreto, para Iteración 2: **REQ-098..127** (lista + cabecera + tabs + deep-linking, salvo el panel de filtros REQ-101), **REQ-129..172** (los 6 tabs y su coherencia transversal, salvo el camino poblado de REQ-128), **REQ-173..191** (crear/editar/detalles, salvo historial/nombre de REQ-186 y empty-state REQ-187). Quedan como PASA (automatizado) en el qa-report.
- **Criterios con regresión detectada (ya corregidos por el Developer antes de esta ronda):** **ninguno** — 0 failed, sin drift.

---

## Criterios Pendientes de Testing Manual

- **Total criterios que requieren sub-testers esta ronda: 4.**
  - Flow Tester: **2** → REQ-186 (historial real + nombre FDI), REQ-128 (Info poblada: emergencia + afiliado).
  - Edge Case Tester: **2** → REQ-187 (pieza vacía), REQ-101 (panel de filtros de pacientes).
  - Visual Checker: **0** (sin asignación — justificado arriba).
- Criterios que FALLARON en ronda anterior (re-verificar fix): **ninguno** (Ronda 1 de la iteración).
- Criterios DESBLOQUEADOS (antes bloqueados por bug, ahora testeables): **ninguno**.
- Criterios nuevos sin test automatizado (generar `.spec.ts` esta ronda): **REQ-186, REQ-187, REQ-128, REQ-101**.

> Recordatorio para los sub-testers: testear SIEMPRE contra el sitio desplegado (la URL de arriba), NUNCA localhost. GIFs obligatorios de los flujos principales. No corregir código ni tests — solo reportar.
