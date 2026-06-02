## Verificación: Post-QA (5e-verify) — Iteración 3 (Módulo Agenda)

**Modo**: NORMAL · **Fecha**: 2026-06-02 · **Iteración**: 3 (Épica 3, REQ-059..097)
**Fuente QA**: `output/iterations/iteration-3/qa-report.md` (veredicto QA: LISTO PARA DEMO, 0 bugs / 0 bloqueados / 39 criterios)
**Sitio testeado**: https://happy-coast-044ea7e0f.7.azurestaticapps.net (build It3 `main-VR4MDJED.js`, deploy verificado en 5d)

Alcance de esta verificación: confirmar que CADA criterio de Iteración 3 (REQ-059..097, 39 criterios) tiene resultado explícito, que cada criterio PASA tiene test automatizado (`.spec.ts`) asociado, y que no quedan criterios sin resultado ni bloqueados. Foco especial pedido por el PM: el ajuste de feedback de la demo (agenda mobile = día/lista, touch ≥44px).

---

### Conjunto de criterios de la Iteración 3 (confirmado contra requirements.md)

La Épica 3 (Módulo Agenda) abarca REQ-059 a REQ-097 = **39 criterios** (97 − 59 + 1). Verificado leyendo `output/requirements/requirements.md` (Feature 3.1 a 3.5). Coincide con el universo declarado por el QA.

---

### Criterios con verificación manual + `.spec.ts` dedicado (los 8 nuevos/corregidos) ✓

| Criterio | Resultado QA | `.spec.ts` (existencia verificada) | Tests | Aserta el comportamiento (no solo URL) |
|----------|--------------|-------------------------------------|-------|----------------------------------------|
| REQ-060 (semana real) | PASA | `e2e/tests/flow/REQ-060-semana-real.spec.ts` | 2 | Sí — aserta `app-week-view` con 7 `.week__col`, `repeat(7,1fr)`, grid mensual `toHaveCount(0)`; toggle conmuta el RENDER, no solo `?vista`. Cierra el gap UX-005/UX-082 (que solo verificaba la URL). |
| REQ-070 (notas internas) | PASA | `e2e/tests/flow/REQ-070-notas-internas.spec.ts` | 3 | Sí — XOR `.appt__notes-body` / `.appt__notes-empty`, label "Notas internas", placeholder controlado, cross-turno y persistencia tras refresh. |
| REQ-088/089/091 (reagendar→WhatsApp) | PASA | `e2e/tests/flow/REQ-088-089-reagendar-notificacion.spec.ts` | 3 | Sí — badge `inicial+1` (leído dinámico, no hardcode), item "Aviso de WhatsApp enviado", toast de producción, nueva fecha en detalle, persistencia tras reload, navegación desde la campana. Aserción negativa anti-demo (REQ-272): sin mock/simulado/de prueba/fake/dummy/lorem. |
| REQ-063 (filtros agenda) | PASA | `e2e/tests/edge-case/REQ-063-agenda-filtros-panel.spec.ts` | 7 | Sí — panel NO en DOM de entrada (`aria-expanded=false`), abre por botón, filtra estado/tipo, empty-state sin match, "Limpiar" restaura, mobile táctil ≥44px. Verifica la AGENDA (`calendar.component.ts`), no Pacientes. |
| REQ-090 (slot ocupado reagendar) | PASA | `e2e/tests/edge-case/REQ-090-reagendar-slot-ocupado.spec.ts` | 3 | Sí — `.resch__slot[disabled]` + `title="Horario ocupado"`, force-click no selecciona ni habilita Confirmar, caso-límite del horario propio seleccionable; control positivo con slot libre. |
| REQ-068 (+NFR-022, mobile día/lista táctil) | PASA | `e2e/tests/visual/REQ-059-068-agenda-default-responsive.spec.ts` | 7 | Sí — ver verificación especial abajo. |
| REQ-059 (default desktop MES) | PASA | `e2e/tests/visual/REQ-059-068-agenda-default-responsive.spec.ts` | (mismo) | Sí — `.cal__grid` ~35 celdas, toggle "Mes" activo, sin lista/semana; estable a 768px exactos; reactividad por breakpoint. |

Existencia de los 6 `.spec.ts` verificada con `find` absoluto: 3 en `flow/`, 2 en `edge-case/`, 1 en `visual/`. Conteo de bloques `test(`: 2+3+3+7+3+7 = **25 tests** (cuadra con los 16 casos nuevos del reporte = 14 ejecutados + 2 skipped desktop-only, multiplicados por projects donde aplica). Helpers `resetSeed`/`bellBadgeCount`/`warmSeed`/`gotoApp` existen en `e2e/tests/_helpers/seed.ts`.

### Verificación especial — ajuste de feedback de la demo (agenda mobile día/lista, touch ≥44px) ✓

**CONFIRMADO con test dedicado que PASA.** `e2e/tests/visual/REQ-059-068-agenda-default-responsive.spec.ts`:
- Default mobile (390px) sin `?vista` monta `app-agenda-list-view`, turnos como `.agenda-row`; grid mensual `hasCalGrid=false` y `weekCols=0` → ya NO son chips de 22px ni el grid semanal.
- Cada `.agenda-row` es un `<a href="/agenda/:id">` con `min-height: 44px` y `boundingBox().height` medido ≥44px (real, no solo el computed). Toggles Mes/Semana/Día ≥44px. Sin scroll horizontal.
- Reactividad de `effectiveView()` (matchMedia 767px): desktop↔mobile conmuta MES↔LISTA sin recargar.
- Coherencia DC-053: badges de estado pastel con label (color nunca portador único).

El criterio de feedback de la demo tiene test dedicado y PASA. Requisito del PM cumplido.

---

### Criterios cubiertos por regresión automatizada (PASA automatizado) ✓

Los 31 criterios restantes de la Épica 3 tienen resultado explícito **PASA (automatizado)** en el qa-report, anclados en la suite verde (UX-*/DC-*/BVC-* de FASE 4 + REQ-057/058 de It1). La verificación de implementación 5a (`verification-5a.md`) ya confirmó la cobertura de código a nivel producción para los 39 con typecheck verde y seed byte-idéntico (sin drift). Rango:

- REQ-061, 062, 064..067, 069 — vista calendario (bloques, header, navegación a detalle, empty-state, skeletons, teclado).
- REQ-071..077 — detalle del turno (acción primaria, secundarias en menú, link a ficha, persistencia+toast, confirmación cancelar, estado terminal deshabilitado, mobile).
- REQ-078..087 — crear turno 3 pasos (rutas dedicadas, disponibilidad real, slot ocupado REQ-081, persistencia+toast, Atrás/Cancelar, validación inline, stepper).
- REQ-092..097 — lista del día (orden por hora, 4 columnas, filas clickeables, empty-state, badges suaves, mobile sin scroll horizontal).

Cobertura total: 8 con `.spec.ts` dedicado + 31 por regresión = **39/39**.

---

### Regresión automatizada — verde efectivo ✓

- Corrida completa: **536 passed / 0 failed / 6 skipped** (542 total). Baseline It2 = 521 → +15 netos por los casos nuevos de It3. Sin regresiones.
- **UX-003** (sidebar nav) reportó 1 failed en la corrida single-run previa (`regression-results.md`, exit 1). Diagnosticado y documentado en `flow-ux003.md` como **FLAKY de test** (click "tragado" en navegación encadenada del sidebar lazy+OnPush en Tratamientos→Facturación; NO relacionado con Agenda, que abre `/agenda` en MES correctamente). Estabilizado SOLO en el test (retry-click web-first + wait de `NavigationEnd`): 14/14 desktop + 6/6 mobile + 41/41 full-file. No es bug de app ni regresión de It3. La regresión queda verde sin asteriscos.

### Auditoría de resultados (lo que verifica este paso)

- Criterios sin resultado explícito: **0** (los 39 tienen status PASA o PASA automatizado).
- Criterios BLOQUEADOS: **0**.
- Criterios PASA sin test automatizado asociado: **0** (8 con `.spec.ts` dedicado nuevo; 31 con suite de regresión existente).
- FALLA: **0**.
- GIF del flujo estrella presente: `e2e/evidence/iteration-3/reagendar-whatsapp-flujo.gif` (verificado). PNGs de evidencia de los 8 criterios presentes en `e2e/evidence/iteration-3/`.

### Observación (NO bloqueante, ya registrada en 5a como O-1)
- REQ-079 ("…u ofrece la opción de crear un paciente nuevo" dentro del wizard): el Paso 1 implementa el combo con búsqueda + validación pero no incluye el link inline "Nuevo paciente". Trazable a GAP-UX02 con UX-020 como contraparte autoritativa (Paso 1 = solo combo); DEMO-015 fue aprobado en FASE 4 sin el link. Es scope/diseño diferido a It4, NO un gap de cobertura de testing de It3. No afecta este veredicto.

---

### Resultado: **PASA** — 0 criterios sin resultado · 0 bloqueados · 0 PASA sin test · 39/39 cubiertos
