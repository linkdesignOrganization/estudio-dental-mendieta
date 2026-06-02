# QA Report — Iteración 4 (Pacientes escritura + Tratamientos)

> Consolidado por el QA Orchestrator (MODO CONSOLIDACIÓN, paso 5e-consolidate).
> Fase: **Iteraciones (FASE 5)** · Iteración: **4** · Modo: **NORMAL**.
> Alcance: escritura de Pacientes (REQ-173..185 + F01), Tratamientos lista+catálogo+detalle (REQ-192..205) y odontograma editable — Épica 11 (REQ-267..270).
> Testeado SIEMPRE contra el sitio desplegado: **https://happy-coast-044ea7e0f.7.azurestaticapps.net** (nunca localhost).
> Bundle servido en producción = build de It4 (`main-YIQ6IJV4.js`, run `26845395311`, deploy verificado en paso 5d).

## Resumen Ejecutivo

- **Ronda:** 1
- **Veredicto:** **LISTO PARA DEMO** ✅
- **Bugs:** **0**
- **Bloqueados:** **0**
- **Regresiones:** **0**
- **Criterios cubiertos:** 100% del alcance de Iteración 4 — los **22 nuevos/corregidos** (GAP del análisis) con `.spec.ts` dedicado esta ronda, el resto (REQ-178, REQ-179 parcial, REQ-182, REQ-183, REQ-199 estado) por **regresión automatizada verde** más la suite existente.
- **Criterios con test automatizado:** 100% — todo criterio PASA tiene `.spec.ts` asociado (nuevo esta iteración o suite existente).

**Iteración de ESCRITURA** (la primera que muta `localStorage`: crear/editar paciente, cambiar estado de pieza), por eso concentra más criterios que It1-3. Los tres sub-testers reportan **0 bugs**. El **fix de seguridad de la foto del paciente (REQ-175/179)** — foco crítico de la ronda — quedó **VERIFICADO en producción**: la foto opcional del Paso 2 **rechaza SVG** (cierra el vector XSS de `<svg>`/`<script>` embebido), **rechaza archivos > 2 MB** (protege la cuota de localStorage), valida **client-side ANTES de persistir**, y el `<script>` embebido **NO se ejecuta** (`window.__xss_executed` queda `false`). El **dirty-check de edición (REQ-184 / F01)**, explícitamente diferido a Fase 5 por UX-025 en Fase 4, quedó **implementado y verificado** en sus 3 ramas. El **odontograma editable** (selector de 6 estados, persistencia tras hard-reload con `@defer on immediate`, touch ≥44px) funciona en desktop y mobile. La regresión es **efectivamente VERDE** (**568 passed**); el único rojo (REQ-187 mobile) era una asunción de timing del propio test adaptada al nuevo `@defer on immediate`, **no un bug del producto**.

---

## Resultado por Criterio

### Crear paciente — REQ-173..181

| Criterio | Descripción | Resultado | Sub-tester | Test automatizado | Evidencia |
|----------|-------------|-----------|------------|-------------------|-----------|
| **REQ-173** | 2 rutas dedicadas (`/pacientes/nuevo/datos` ↔ `/nuevo/clinico`); "Atrás" preserva el Paso 1 | **PASA** | Flow Tester | `e2e/tests/flow/REQ-173-179-crear-paciente-genero.spec.ts` | `flow-it4/REQ-174-crear-paso1-genero-masculino.png` |
| **REQ-174** | Selector de **GÉNERO** real → ficha refleja "Masculino" (ya **NO** el hardcode previo `'mujer'`) | **PASA** | Flow Tester | `REQ-173-179-crear-paciente-genero.spec.ts` | `flow-it4/REQ-174-178-ficha-creada-masculino.png` (subtítulo "· Masculino ·" + card Género) |
| **REQ-175** | Paso 2 clínicos + foto opcional; **rechaza SVG** y **> 2 MB** (fix de seguridad) | **PASA (seguridad OK)** | Edge Case Tester | `e2e/tests/edge-case/REQ-175-179-foto-validacion-seguridad.spec.ts` | toast "Formato no admitido…" / "La imagen supera los 2 MB…"; `window.__xss_executed=false` |
| **REQ-176** | Paso 1 valida inline + **formato DNI** (7-8 díg.); "Siguiente" no avanza con DNI inválido | **PASA** | Edge Case Tester | `e2e/tests/edge-case/REQ-176-dni-formato-validacion.spec.ts` | error inline "Ingresá un DNI válido." · 20/20 |
| **REQ-177** | "Cancelar" con datos pide **confirmación**; "Atrás" preserva el Paso 1 | **PASA** | Edge Case Tester | `e2e/tests/edge-case/REQ-177-cancelar-confirmacion-atras-preserva.spec.ts` | diálogo "Tenés datos cargados. ¿Querés descartar y salir?" · 16/16 |
| **REQ-178** | Persiste paciente nuevo + navega a la ficha + toast; sobrevive refresh real | **PASA** | Flow Tester | `REQ-173-179-crear-paciente-genero.spec.ts` | conteo `patients` +1; `flow-it4/REQ-174-178-ficha-creada-masculino.png` |
| **REQ-179** | Sin foto → avatar a iniciales (sin imagen rota); SVG rechazado **NO** persiste | **PASA** | Flow + Edge | `REQ-173-179-crear-paciente-genero.spec.ts` · `REQ-175-179-foto-validacion-seguridad.spec.ts` | avatar "JM"; `fotoPath` vacío tras rechazo · 16/16 |
| **REQ-180** | Crear (2 pasos) usable en **mobile** — 1 columna, controles ≥44px, sin scroll horizontal | **PASA** | Visual Checker | `e2e/tests/visual/REQ-180-185-patient-form-mobile.spec.ts` | 8 controles a x=48 alto 44px; Siguiente/Crear/género 44px |
| **REQ-181** | Indicador de paso visible (`app-stepper`: "Datos personales / Datos clínicos", "Paso N de 2") | **PASA** | Visual Checker | `REQ-180-185-patient-form-mobile.spec.ts` | `.stepper__count` "Paso 1 de 2"→"Paso 2 de 2"; `.is-current` migra |

### Editar paciente + DIRTY-CHECK F01 — REQ-182..185

| Criterio | Descripción | Resultado | Sub-tester | Test automatizado | Evidencia |
|----------|-------------|-----------|------------|-------------------|-----------|
| **REQ-182** | Ruta `/pacientes/:id/editar` con form **precargado** con los datos actuales | **PASA** | Flow Tester | `e2e/tests/flow/REQ-182-184-editar-paciente-dirty-check.spec.ts` | Mateo Gómez, DNI/tel/género precargados |
| **REQ-183** | "Guardar cambios" valida + persiste (refresh real) + vuelve a la ficha + toast | **PASA** | Flow Tester | `REQ-182-184-editar-paciente-dirty-check.spec.ts` | teléfono editado persiste tras reload |
| **REQ-184 / F01** | **Dirty-check** (diferido por UX-025, ahora implementado): rama 1 sin cambios → cancela directo, sin diálogo; rama 2 con cambios → diálogo de descarte; rama 3 tras guardar → baseline re-congelado, sin prompt | **PASA** | Flow Tester | `REQ-182-184-editar-paciente-dirty-check.spec.ts` (5 tests, 3 ramas) | `flow-it4/REQ-184-F01-dialogo-descarte-dirty-check.png` |
| **REQ-185** | Editar usable en **mobile** — 1 columna, "Guardar cambios" ≥44px, sin scroll horizontal | **PASA** | Visual Checker | `REQ-180-185-patient-form-mobile.spec.ts` | precargado ("Bautista"); 8 controles 44px |

### Tratamientos: lista de activos — REQ-192..197

| Criterio | Descripción | Resultado | Sub-tester | Test automatizado | Evidencia |
|----------|-------------|-----------|------------|-------------------|-----------|
| **REQ-192** | 5 columnas, 5.ª = **"Próxima fecha"** con dato real | **PASA** | Flow Tester | `e2e/tests/flow/REQ-192-196-tratamientos-lista.spec.ts` | `flow-it4/REQ-192-lista-tratamientos-proxima-fecha.png` |
| **REQ-193** | Único filtro principal = profesional; acota la lista correctamente | **PASA** | Flow Tester | `REQ-192-196-tratamientos-lista.spec.ts` | filtro Dra. Etcheverry → todas las filas son suyas |
| **REQ-194** | Fila clickeable → detalle del plan en la ficha del paciente | **PASA** | Flow Tester | `REQ-192-196-tratamientos-lista.spec.ts` | → `/pacientes/:id/plan/tra-xxx` |
| **REQ-195** | Filtro sin resultados → **estado vacío** con guidance, sin tabla ni crash | **PASA** | Edge Case Tester | `e2e/tests/edge-case/REQ-195-tratamientos-filtro-vacio.spec.ts` | "No hay tratamientos activos con este criterio" + guidance · 8/8 |
| **REQ-196** | Etapas legibles "X/Y" | **PASA** | Flow Tester | `REQ-192-196-tratamientos-lista.spec.ts` | regex `^\d+/\d+$` por fila |
| **REQ-197** | Lista usable en **mobile** (tabla → mini-cards) + skeletons | **PASA** | Visual Checker | `e2e/tests/visual/REQ-197-205-treatments-catalog-responsive.spec.ts` | mobile: `.dt__card`×12; desktop: tabla 5 col; sin scroll-x |

### Tratamientos: catálogo de tipos — REQ-198..201

| Criterio | Descripción | Resultado | Sub-tester | Test automatizado | Evidencia |
|----------|-------------|-----------|------------|-------------------|-----------|
| **REQ-198** | Catálogo en **cards aireadas** (no tabla densa) con descripción/costo/duración | **PASA** | Visual Checker | `REQ-197-205-treatments-catalog-responsive.spec.ts` | 15 `a.ttcard` radius 12px, padding 24px, gap 20px; 0 `<table>` · `visual-it4/it4-catalog-mobile.png` |
| **REQ-199** | ≥12 tipos (hay **15**); conteo UI == estado | **PASA** | Edge Case Tester | `e2e/tests/edge-case/REQ-199-200-catalogo-tipos-cards.spec.ts` | 15 cards, subtítulo "15 tipos en el catálogo" |
| **REQ-200** | Card clickeable → navega al detalle del tipo (`/tratamientos/tipos/:id`) | **PASA** | Edge Case Tester | `REQ-199-200-catalogo-tipos-cards.spec.ts` | href de las 15 cards mapean 1:1 a ids, sin enlaces rotos |
| **REQ-201** | Catálogo responsive 1-2 col en mobile | **PASA** | Visual Checker | `REQ-197-205-treatments-catalog-responsive.spec.ts` | 393px→1 col · 820px→2 col · 1280px→3 col; sin scroll-x |

### Tratamientos: detalle de tipo — REQ-202..205

| Criterio | Descripción | Resultado | Sub-tester | Test automatizado | Evidencia |
|----------|-------------|-----------|------------|-------------------|-----------|
| **REQ-202** | Detalle: pasos/materiales/costo/duración + **profesionales habilitados REAL** por especialidad (no el `slice(0,4)` previo) | **PASA** | Flow Tester | `e2e/tests/flow/REQ-202-204-tipo-tratamiento-detalle.spec.ts` | `flow-it4/REQ-202-detalle-tipo-profesionales-habilitados.png` — `tt-15`/`tt-04` devuelven conjuntos distintos (derivado, no fijo) |
| **REQ-203** | Costo en **pesos argentinos** correctamente formateado | **PASA** | Visual Checker | `REQ-197-205-treatments-catalog-responsive.spec.ts` | `$ 145.000` (regex es-AR) |
| **REQ-204** | Back-link vuelve al catálogo `/tratamientos` | **PASA** | Flow Tester | `REQ-202-204-tipo-tratamiento-detalle.spec.ts` | back-link → `/tratamientos` |
| **REQ-205** | Detalle de tipo usable en **mobile** | **PASA** | Visual Checker | `REQ-197-205-treatments-catalog-responsive.spec.ts` | 4 `.surface-card` radius 14px; back-link 44px; sin scroll-x |

### Odontograma editable — Épica 11 (REQ-267..270)

| Criterio | Descripción | Resultado | Sub-tester | Test automatizado | Evidencia |
|----------|-------------|-----------|------------|-------------------|-----------|
| **REQ-267** | `app-tooth-state-selector` ofrece **los 6 estados** (Sana/Caries/Obturación/Ausente/En tratamiento/Prótesis) como radiogroup | **PASA** | Flow + Visual | `e2e/tests/flow/REQ-267-269-odontograma-editable.spec.ts` · `e2e/tests/visual/REQ-270-tooth-state-selector-mobile.spec.ts` | `flow-it4/REQ-267-selector-6-estados-pieza.png`; `role=radiogroup` + 6 `role=radio`, 0 `<select>` |
| **REQ-268** | Cambia estado + "Guardar estado" → **persiste tras HARD reload** + se refleja en el odontograma (`@defer on immediate`, regresión BUG-E04; deep-link mobile hidrata 32 piezas) | **PASA** | Flow Tester | `REQ-267-269-odontograma-editable.spec.ts` | pieza Sana→Obturación persiste tras `reload({domcontentloaded})`; deep-link directo hidrata 32 piezas web-first |
| **REQ-269** | Coherencia con la ficha ("Estado actual" del detalle alineado con el diagrama y la leyenda) | **PASA** | Flow Tester | `REQ-267-269-odontograma-editable.spec.ts` | deep-link a `/pieza/:fdi` confirma "Estado actual: Obturación" + radio marcado |
| **REQ-270** | Selector de pieza con **touch ≥44px** en mobile, legible y sin scroll horizontal | **PASA** | Visual Checker | `REQ-270-tooth-state-selector-mobile.spec.ts` | 6 `.tss__opt` alto 52–77px; "Guardar estado" 44px; scrollWidth==innerWidth · `visual-it4/it4-tss-selector-mobile.png` |

### NFR transversales aplicables a las pantallas nuevas

| NFR | Criterio | Resultado | Verificación |
|-----|----------|-----------|--------------|
| **NFR-002** | Bundle inicial < 500KB gzipped | **PASA (heredado)** | build It4 `427.99 kB / 103.48 kB gzipped` (error-budgeted en build, verde en regresión) |
| **NFR-004** | Odontograma 32 piezas sin lag (`@defer on immediate`) | **PASA** | las 32 piezas hidratan en mobile; el cambio de estado no introduce lag perceptible |
| **NFR-020** | Contraste WCAG AA en pantallas nuevas | **PASA** | tokens del sistema (texto `#2a2a35`, secundario `#707080`, semánticos pastel); sin texto blanco sobre azul medio |
| **NFR-021** | Focus ring visible en controles nuevos | **PASA** | `.tss__opt`/`.btn-edm`/cards de catálogo/botones de wizard → ring `#246991` 2px; inputs/selects con `:focus-visible`=var(--focus-ring) |
| **NFR-022** | Touch targets ≥44px en mobile | **PASA** | cubierto por REQ-180/185/270 (boundingBox real de todos los controles nuevos) |
| **NFR-023** | Labels en navegación | **N/A (justificado)** | It4 no modifica la navegación principal (sidebar/header intactos) — fuera del alcance |
| **BVC-xxx** | Brief compliance | **N/A** | It4 no introduce BVC nuevos; `BVC-NFR-brief-compliance.spec.ts` (Fase 4) corre como regresión (verde) |

**Resumen por criterio:** todos los criterios del alcance de Iteración 4 → **PASA / PASA (heredado)**; **0 FALLA · 0 BLOQUEADO**; NFR-023 y BVC = **N/A justificado**.

---

## Foco crítico de la ronda: fix de seguridad de la foto (REQ-175 / REQ-179)

Verificado por el Edge Case Tester contra el deploy — **el fix funciona, NO hay bug de seguridad**:

- **Rechazo de SVG**: la allowlist raster (`image/jpeg|png|webp|gif`) excluye `image/svg+xml`. Un SVG con `<script>` embebido es **RECHAZADO** con toast "Formato no admitido…", **no se previsualiza ni persiste** como data URL → **vector XSS cerrado**. Verificado además que el `<script>` del SVG **NO se ejecuta** (`window.__xss_executed` queda `false`).
- **Límite de tamaño**: archivos > 2 MB (`MAX_PHOTO_BYTES = 2 * 1024 * 1024`) **RECHAZADOS** con toast "La imagen supera los 2 MB…" → protege la cuota de localStorage.
- **Momento de la validación**: client-side, **ANTES de persistir** (`onPhoto` en `patient-create.component.ts`). El paciente creado tras un rechazo queda con `fotoPath` vacío → fallback a iniciales (sin imagen rota).
- **Camino feliz**: un raster PNG (1×1) válido es **ACEPTADO** → previsualiza + persiste `fotoPath` `data:image/…`.

Cobertura automatizada: `e2e/tests/edge-case/REQ-175-179-foto-validacion-seguridad.spec.ts` (16/16, fixtures en memoria con `setInputFiles({buffer})`, sin archivos en disco). Adyacente a NFR-010 (sanitización/seguridad de inputs).

---

## Regresión Automatizada

- **Comando:** `npx playwright test e2e/tests/` (ambos projects, single-run `2026-06-02T18:15`).
- **Resultado:** **568 passed · 1 failed · 7 skipped** → tras la adaptación del único rojo: **efectivamente VERDE.**
- **El único fallo (REQ-187, `tests/edge-case/REQ-187-pieza-vacia.spec.ts`, solo mobile-chromium)** **NO es un bug del producto**. El odontograma renderea las 32 piezas correctamente en mobile (verificado en vivo 3×, deep-link y flujo de usuario). El fallo era una **asunción de timing del propio test** heredada de `@defer (on idle)`: un `scrollIntoViewIfNeeded()` imperativo previo (línea 69) competía con la hidratación del chunk lazy y agotaba su `actionTimeout` bajo la emulación mobile. El Edge Case Tester lo **adaptó al patrón web-first** (aserción polling `toHaveCount(32)` ANTES de tocar la pieza) — **solo el test, sin tocar código de app** — y confirmó **10/10 verde en ambos projects** (3+ corridas estables). Detalle en `output/iterations/iteration-4/edge-req187.md`. **NO re-asignado.**
- **Regresiones de producto:** **ninguna** (0). Ningún criterio previamente verde rompió por el código de It4.
- **Seed sin drift:** verificado byte-idéntico el STATE generado (`verification-5a.md` §SEED SIN DRIFT). El `store.service.ts` es solo aditivo (`treatmentTypeProfessionals()` es view-time, no entra en `StoreState` ni consume el PRNG de negocio); las escrituras del usuario usan ids por `Date.now()` (no PRNG); el odontograma de un paciente nuevo nace con 32 piezas determinísticas "sana".
  - **Salvedad documental (NO bloqueante, NO es drift):** `public/seed/manifest.json` cambió solo el campo `generadoEn` (timestamp), que es metadata inerte no consumida por `manifest.loader.ts`. El STATE resultante es byte-idéntico; el archivo no lo es literalmente. Recomendación menor al Developer para futuras iteraciones: no re-generar `manifest.json` si la lista de imágenes no cambió (o hacer el timestamp determinista).
- Fuente: `output/iterations/iteration-4/regression-results.md` (single-run) + `edge-req187.md` (diagnóstico y adaptación que la supersede) + las corridas completas de los sub-testers (Flow 36/36 ×2; Edge `tests/edge-case/` 218 passed; Visual 34 passed).

---

## Bugs Consolidados

**Ninguno.** Los 3 sub-testers reportan **0 bugs**; nada que deduplicar por causa raíz. Ningún criterio "PASA con gap". El fix de seguridad de la foto (foco crítico) y el dirty-check de edición (F01, diferido por UX-025) quedaron verificados sin defectos.

### Hallazgos / observaciones registradas para trazabilidad (NO son bugs)

- **OBS-1 — REQ-184/F01: destino del descarte en EDICIÓN.** El plan asumía que "Sí, descartar" vuelve a la lista. El comportamiento REAL (verificado en vivo y en `doCancel()`): al descartar una **edición** se vuelve a la **ficha del paciente** (`/pacientes/:id/informacion`), no a `/pacientes` — coherente (descartás los cambios y seguís viendo a ese paciente). El descarte del **alta** sí va a `/pacientes`. Además, "Cancelar" del editor es el back-link superior "Pacientes" (que dispara `cancel()`), no un botón literal "Cancelar". El test asevera el destino real por flujo. **No es un bug.**
- **OBS-2 — REQ-192: formato de "Próxima fecha".** El plan anticipaba `dd/mm/aaaa`; el formato REAL del producto (`formatShortDate`) es corto "Jue 25 jun". El test asevera el formato real. **No es un bug.**
- **OBS-3 — REQ-192/195: el caso "Sin fecha prevista" y el empty-state del filtro NO son alcanzables por el seed virgen** (los 6 profesionales tienen ≥1 plan activo; solo los planes completados tienen `proximaFecha` vacía, y la vista de activos los excluye). El Edge Case Tester ejerce la rama del empty-state de forma **DETERMINISTA** marcando temporalmente como `completado` los planes de un profesional en localStorage (recarga re-hidrata lo persistido, no regenera) y restaura con `resetSeed`. **Cableado y correcto, no UI-reachable con el seed** → **PASA** con nota source-verified, no es FALLA ni hueco de cobertura. (Conviene que el PM lo sepa: en uso real, el usuario solo verá ese empty-state al completar todos los tratamientos de un profesional.)
- **OBS-4 — REQ-202: profesionales derivados por especialidad confirmados reales** (no `slice(0,4)`): `tt-15` Odontopediatría → Dra. Soledad Russo (general) + Dr. Federico Salinas (Odontopediatría); `tt-04` Conducto → Dra. Russo + Dr. Martín Aguilera (Endodoncia); `tt-01` sin especialidad mapeada → solo el generalista (garantía ≥1).
- **OBS-5 — Copy anti-demo (REQ-272 transversal):** todos los estados vacíos, errores inline, toasts y diálogos verificados NO contienen lenguaje de demo/mock (demo/mock/simulado/de prueba/ficticio/viewcase/lorem ipsum/link design).

---

## Tests Automatizados Generados (esta ronda)

| Sub-tester | Archivo | Casos | Estado |
|------------|---------|-------|--------|
| Flow Tester | `e2e/tests/flow/REQ-173-179-crear-paciente-genero.spec.ts` | 3 tests × 2 projects | Verde, estable (2 corridas idénticas) |
| Flow Tester | `e2e/tests/flow/REQ-182-184-editar-paciente-dirty-check.spec.ts` | 5 tests (3 ramas F01) × 2 projects | Verde, estable |
| Flow Tester | `e2e/tests/flow/REQ-267-269-odontograma-editable.spec.ts` | 3 tests (6 estados + hard-reload + deep-link mobile 32 piezas) × 2 projects | Verde, estable |
| Flow Tester | `e2e/tests/flow/REQ-192-196-tratamientos-lista.spec.ts` | 3 tests × 2 projects | Verde, estable |
| Flow Tester | `e2e/tests/flow/REQ-202-204-tipo-tratamiento-detalle.spec.ts` | 4 tests (derivación por especialidad) × 2 projects | Verde, estable |
| Edge Case Tester | `e2e/tests/edge-case/REQ-176-dni-formato-validacion.spec.ts` | 10 tests × 2 projects (20) | Verde, estable |
| Edge Case Tester | `e2e/tests/edge-case/REQ-175-179-foto-validacion-seguridad.spec.ts` | 8 tests × 2 projects (16) | Verde, estable |
| Edge Case Tester | `e2e/tests/edge-case/REQ-177-cancelar-confirmacion-atras-preserva.spec.ts` | 8 tests × 2 projects (16) | Verde, estable |
| Edge Case Tester | `e2e/tests/edge-case/REQ-195-tratamientos-filtro-vacio.spec.ts` | 4 tests × 2 projects (8) | Verde, estable |
| Edge Case Tester | `e2e/tests/edge-case/REQ-199-200-catalogo-tipos-cards.spec.ts` | 6 tests × 2 projects (11 + 1 skip intencional) | Verde, estable |
| Edge Case Tester | `e2e/tests/edge-case/REQ-187-pieza-vacia.spec.ts` (MODIFICADO) | adaptación web-first del wait al `@defer on immediate` (solo el test) | Verde 10/10 |
| Visual Checker | `e2e/tests/visual/REQ-270-tooth-state-selector-mobile.spec.ts` | 5 tests × 2 projects | Verde |
| Visual Checker | `e2e/tests/visual/REQ-197-205-treatments-catalog-responsive.spec.ts` | 7 tests × 2 projects | Verde |
| Visual Checker | `e2e/tests/visual/REQ-180-185-patient-form-mobile.spec.ts` | 5 tests × 2 projects | Verde (34 ejecuciones, 2.4m) |

**Idempotencia (escritura):** los specs que mutan `localStorage` (crear paciente, editar+guardar, cambiar estado de pieza, empty-state forzado) llaman `resetSeed()` en `afterEach`/`beforeEach` → re-hidratan el seed byte-idéntico, sin arrastre entre tests. Existencia de los `.spec.ts` verificada con Glob absoluto: **5 en `flow/` + 5 nuevos (+1 modificado) en `edge-case/` + 3 en `visual/`**.

---

## GIFs / Evidencia de Flujos

> La grabación de video de Playwright es `retain-on-failure` y no produce artefacto en pasada verde; los hitos de cada flujo quedan como capturas PNG.

| Flujo | Evidencia |
|-------|-----------|
| Crear paciente "hombre" con género (datos → clínico → ficha Masculino) | `e2e/evidence/flow-it4/REQ-174-crear-paso1-genero-masculino.png` + `REQ-174-178-ficha-creada-masculino.png` |
| Cambiar el estado de una pieza (selector 6 estados → Guardar → odontograma reflejado) | `e2e/evidence/flow-it4/REQ-267-selector-6-estados-pieza.png` (+ persistencia aseverada en el test) |
| Dirty-check (F01) — diálogo de descarte con cambios reales | `e2e/evidence/flow-it4/REQ-184-F01-dialogo-descarte-dirty-check.png` |
| Lista de tratamientos (columna "Próxima fecha") | `e2e/evidence/flow-it4/REQ-192-lista-tratamientos-proxima-fecha.png` |
| Detalle de tipo (profesionales habilitados reales) | `e2e/evidence/flow-it4/REQ-202-detalle-tipo-profesionales-habilitados.png` |
| Foto SVG / > 2 MB rechazada (intento de subida con error inline) | aseverado en `REQ-175-179-foto-validacion-seguridad.spec.ts` (toasts de rechazo) |
| Mobile — selector de pieza (touch ≥44px) y catálogo aireado | `e2e/evidence/visual-it4/it4-tss-selector-mobile.png` + `it4-catalog-mobile.png` |
| Odontograma mobile 32 piezas (regresión REQ-187) | `e2e/evidence/edge-case/iteration-4/REQ-187-odontograma-mobile-32piezas.png` |

---

## Auditoría de Cobertura

- ✅ **Asignados vs reportados (Flow):** REQ-173/174/178/179, REQ-182/183, REQ-184·F01, REQ-267/268/269, REQ-192/193/194/196, REQ-202/204 asignados → **todos con resultado PASA**. Sin huecos.
- ✅ **Asignados vs reportados (Edge Case):** REQ-176, REQ-175/179, REQ-177, REQ-195, REQ-199/200 asignados → **todos con resultado PASA**. Sin huecos. (+ REQ-187 adaptado a verde.)
- ✅ **Asignados vs reportados (Visual):** REQ-180/181/185, REQ-197/198/201/203/205, REQ-270 + NFR-002/004/020/021/022 asignados → **todos con resultado PASA**; NFR-023 = N/A justificado. Sin huecos.
- ✅ **Artefactos `.spec.ts`:** verificados con Glob absoluto — **5 en `e2e/tests/flow/`, 5 nuevos (+1 modificado) en `e2e/tests/edge-case/`, 3 en `e2e/tests/visual/`**.
- ✅ **Evidencia:** 6 PNGs en `flow-it4/`, 2 en `visual-it4/`, 1 en `edge-case/iteration-4/` — verificados con Glob absoluto.
- ✅ **Todo criterio PASA tiene test automatizado** asociado (nuevo esta ronda o suite existente).
- ✅ **0 criterios sin resultado · 0 BLOQUEADOS · 0 FALLA · 0 regresiones de producto.**
- ✅ **100% del alcance de Iteración 4 cubierto:** los 22 nuevos/corregidos con `.spec.ts` dedicado + el resto por regresión automatizada verde.

---

## Veredicto

**LISTO PARA DEMO.** Condición de salida de FASE 5 (Iteración 4) cumplida: **0 fallos + 0 bloqueados + 0 regresiones + 100% criterios cubiertos + 100% criterios con test automatizado.** La escritura de Pacientes (crear con género real + foto validada, editar con dirty-check F01), el módulo de Tratamientos (lista con "Próxima fecha", catálogo aireado, detalle con profesionales habilitados reales) y el **odontograma editable** (6 estados, persistencia tras hard-reload, mobile ≥44px) están completos y blindados en producción. El **fix de seguridad de la foto** (rechazo SVG/XSS + límite 2 MB) quedó **verificado**. No se requiere ciclo de corrección.
