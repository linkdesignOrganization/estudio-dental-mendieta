# QA Report — Iteración 2 (Pacientes — ficha del paciente a fondo)

> Consolidado por el QA Orchestrator (MODO CONSOLIDACIÓN, paso 5e-consolidate).
> Fase: **Iteraciones (FASE 5)** · Iteración: **2** · Modo: **NORMAL** · Naturaleza: **auditoría proporcional** sobre la ficha de 6 tabs.
> Testeado SIEMPRE contra el sitio desplegado: **https://happy-coast-044ea7e0f.7.azurestaticapps.net** (nunca localhost).

## Resumen Ejecutivo

- **Ronda:** 1
- **Veredicto:** **LISTO PARA DEMO** ✅
- **Bugs:** **0**
- **Bloqueados:** **0**
- **Regresiones:** **0**
- **Criterios cubiertos:** 100% — los 4 gaps con `.spec.ts` dedicado, el resto por regresión automatizada verde.
- **Criterios con test automatizado:** 100% — todo criterio PASA tiene `.spec.ts` asociado (nuevos esta iteración o suite existente).

Las dos áreas de auditoría proporcional de esta iteración (los 4 criterios sin aserción dedicada que el Developer corrigió/agregó) **PASAN** en desktop y mobile contra el sitio desplegado, con tests dedicados nuevos que entran en la suite de regresión futura. El resto de los criterios de la ficha (REQ-098..172, 186..191) queda **PASA (automatizado)** por la regresión verde (486 passed / 0 failed, seed byte-idéntico, sin drift).

---

## Resultado por Criterio

### Criterios con verificación manual + `.spec.ts` dedicado esta ronda (los 4 gaps)

| Criterio | Descripción | Resultado | Sub-tester | Test automatizado | Evidencia |
|----------|-------------|-----------|------------|-------------------|-----------|
| **REQ-186** | Detalle de pieza: nombre clínico FDI + historial REAL derivado del store (no hardcodeado) | **PASA** | Flow Tester | `e2e/tests/flow/REQ-186-128-pieza-info-real.spec.ts` | `REQ-186-pieza-18-pac-003-historial-real.png` · `REQ-186-flujo-listado-ficha-odontograma-pieza.gif` |
| **REQ-128** | Tab Información (camino POBLADO): contacto de emergencia real + número de afiliado | **PASA** | Flow Tester | `e2e/tests/flow/REQ-186-128-pieza-info-real.spec.ts` | `REQ-128-info-pac-001-contacto-afiliado.png` · `REQ-128-info-poblada-pac-001.gif` |
| **REQ-187** | Detalle de pieza: pieza sana/ausente muestra empty-state "Sin procedimientos registrados…", sin crash | **PASA** | Edge Case Tester | `e2e/tests/edge-case/REQ-187-pieza-vacia.spec.ts` | `REQ-187-pieza-sana-empty.png` · `REQ-187-pieza-empty-state.gif` |
| **REQ-101** | Lista de pacientes: panel de Filtros (obra social / profesional / rango de edad) oculto por defecto, abre vía botón, filtra coherente, empty-state sin match, usable en mobile ≥44px | **PASA** | Edge Case Tester | `e2e/tests/edge-case/REQ-101-filtros-pacientes.spec.ts` | `REQ-101-filtros-empty-state.png` · `REQ-101-filtros-flow.gif` |

**Notas de verificación clave (lo que blindaron los gaps):**
- **REQ-186** — "real, no hardcodeado" probado por contraste: Pieza 18 (Obturación, historial de 3 pasos restaurativos) vs Pieza 28 del mismo paciente (En tratamiento, historial endodóntico distinto). El historial varía según el estado real de cada pieza → descarta un bloque fijo. Nombre FDI presente (`Pieza 18 · Tercer molar superior derecho`) y profesional de cabecera real coherente con la ficha.
- **REQ-128** — camino POBLADO (pac-001), distinto del camino vacío ya cubierto por `DC-106` sobre pac-007: contacto de emergencia con valor real (`Soledad Álvarez (Hijo/a) · +54 11 5309-1236`) y número de afiliado (`5653 1461 3760`) junto a la obra social. Verificado por camino real y deep-link, en ambos viewports.
- **REQ-187** — empty-state condicional (no permanente): probado contra pieza Sana, pieza Ausente y control positivo con historial. Copy de producción exacto, sin lenguaje de demo, sin crash.
- **REQ-101** — anti-patrón verificado: panel NO visible por defecto (`aria-expanded=false`), abre vía botón "Filtros". Filtra por cada dimensión (OSDE 29→4, profesional 29→3, rango de edad), combina dimensiones, cae en empty-state sin match ("No encontramos pacientes con ese criterio" + guidance), y "Limpiar filtros" restaura el listado completo. Mobile usable con touch target ≥44px.

### Criterios cubiertos por regresión automatizada (PASA automatizado)

Todos los criterios restantes de la ficha del paciente de Iteración 2, cubiertos por la suite de tests (verde en la regresión de esta ronda, exit 0):

| Rango de criterios | Cobertura | Resultado |
|--------------------|-----------|-----------|
| **REQ-098..127** | Lista + cabecera + tabs + deep-linking (salvo el panel de filtros REQ-101, cubierto arriba) | **PASA (automatizado)** |
| **REQ-129..172** | Los 6 tabs y su coherencia transversal (salvo el camino poblado de REQ-128, cubierto arriba) | **PASA (automatizado)** |
| **REQ-173..191** | Crear/editar/detalles de pieza (salvo historial/nombre de REQ-186 y empty-state REQ-187, cubiertos arriba) | **PASA (automatizado)** |

> Cobertura transitiva ancla en la suite `DC-*` / `UX-*` / `BVC-*` de FASE 4 + REQ-057/058 de Iteración 1. Los 4 gaps de esta iteración (REQ-186, REQ-128, REQ-187, REQ-101) añaden la aserción dedicada que faltaba, de modo que su comportamiento nuevo queda blindado en regresión a partir de ahora.

---

## Regresión Automatizada

- **Comando:** `npx playwright test` (single-run, `--no-chunks`), corrida `2026-06-02T12:35:34`.
- **Resultado:** **exit code 0 — 486 passed · 0 failed · 4 skipped** (39.3m).
- **Seed:** byte-idéntico, **sin drift** de secuencia del PRNG determinista.
- **Regresiones detectadas:** **ninguna** (0 failed). Ningún criterio previamente verde rompió en esta iteración.
- Fuente: `output/iterations/iteration-2/regression-results.md`.

Tras agregar los 3 specs nuevos de esta ronda, la regresión cruzada con las specs de flujo que tocan las mismas áreas (UX-080-094 + UX-020-032 + REQ-186-128) dio **56 passed sin cross-contamination**; los specs de edge-case dieron **26 passed** estables en 2 corridas. Los nuevos archivos entran en la suite de regresión de rondas/iteraciones futuras.

---

## Bugs Consolidados

**Ninguno.** 0 bugs reportados por los sub-testers; nada que deduplicar por causa raíz. Ningún criterio "PASA con gap".

### Observaciones registradas para trazabilidad (NO son bugs)

- **OBS-1 (touch target desktop vs. mobile, REQ-101).** El botón "Filtros" y los comboboxes miden 40px en desktop y 44px en mobile. El contrato ≥44px es una exigencia MOBILE (cumplida); 40px en desktop es un control compacto válido para mouse. La aserción de 44px se aplica solo al project mobile. No es incumplimiento de REQ-101.
- **OBS-2 (odontograma `@defer`, relacionado con BUG-E04 ya documentado en iteraciones previas).** El diagrama del odontograma hidrata por viewport/idle; el flujo de usuario de REQ-187 navega vía tab Odontograma (no deep-link a `/odontograma`), evitando el gap mobile de BUG-E04, y pasa en ambos projects. No es un bug nuevo de esta iteración ni regresión.

---

## Tests Automatizados Generados (esta ronda)

| Sub-tester | Archivo | Casos | Estado |
|------------|---------|-------|--------|
| Flow Tester | `e2e/tests/flow/REQ-186-128-pieza-info-real.spec.ts` | 5 tests × 2 projects = **10** | Verde, estable (2 corridas idénticas) |
| Edge Case Tester | `e2e/tests/edge-case/REQ-187-pieza-vacia.spec.ts` | 5 tests × 2 projects = **10** | Verde, estable |
| Edge Case Tester | `e2e/tests/edge-case/REQ-101-filtros-pacientes.spec.ts` | 8 tests × 2 projects = **16** | Verde, estable |

**Total casos nuevos:** 36 (10 flow + 26 edge-case), todos verdes en desktop-chromium + mobile-chromium. Existencia de los 3 archivos verificada con Glob.

---

## GIFs de Flujos

| Flujo | Archivo |
|-------|---------|
| REQ-186 — listado → ficha → odontograma → detalle de Pieza 18 (nombre FDI + historial real) | `e2e/evidence/iteration-2/REQ-186-flujo-listado-ficha-odontograma-pieza.gif` |
| REQ-128 — ficha Info poblada (pac-001): contacto de emergencia real + afiliado | `e2e/evidence/iteration-2/REQ-128-info-poblada-pac-001.gif` |
| REQ-187 — pieza sana mostrando el empty-state | `e2e/evidence/edge-case/iteration-2/REQ-187-pieza-empty-state.gif` |
| REQ-101 — panel de Filtros (abrir → aplicar dimensiones → empty-state sin match → limpiar) | `e2e/evidence/edge-case/iteration-2/REQ-101-filtros-flow.gif` |

---

## Auditoría de Cobertura

- ✅ **Asignados vs reportados (Flow):** REQ-186, REQ-128 asignados → ambos con resultado PASA. Sin huecos.
- ✅ **Asignados vs reportados (Edge Case):** REQ-187, REQ-101 asignados → ambos con resultado PASA. Sin huecos.
- ✅ **Visual Checker:** sin asignación (justificada en test-distribution.md — cambios de datos/contenido/funcionalidad, no de tokens ni superficies responsive nuevas; lo visual ya verde en regresión). Ausencia correcta, no es sub-tester faltante.
- ✅ **Artefactos `.spec.ts`:** los 3 archivos existen (verificado con Glob absoluto: 1 en `flow/`, 2 en `edge-case/`).
- ✅ **GIFs:** presentes para los 4 flujos principales (verificado con Glob absoluto).
- ✅ **Todo criterio PASA tiene test automatizado** asociado (nuevo o suite existente).
- ✅ **0 criterios sin resultado · 0 BLOQUEADOS · 0 FALLA.**

---

## Veredicto

**LISTO PARA DEMO.** Condición de salida de FASE 5 (Iteración 2) cumplida: **0 fallos + 0 bloqueados + 0 regresiones + 100% criterios cubiertos + 100% criterios con test automatizado.** La ficha del paciente a fondo está completa y blindada. No se requiere ciclo de corrección.
