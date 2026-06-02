# Resultados — Visual Checker · Iteración 3 (Agenda) · Ronda 1

- **Iteración**: 3 (Módulo Agenda — Épica 3)
- **Ronda**: 1
- **Sitio testeado (desplegado)**: https://happy-coast-044ea7e0f.7.azurestaticapps.net (NUNCA localhost)
- **Modo**: NORMAL (verificación contra DC-xxx + computed styles; sin image_compare)
- **Criterios asignados**: REQ-068 (+ NFR-022), REQ-059
- **Veredicto global**: ✅ AMBOS PASAN. 0 bugs visuales. El ajuste de feedback de la demo (chips de 22px → filas táctiles ≥44px) está **CORREGIDO y verificado en producción**.

---

## Resultados por Criterio

| Criterio | Estado | Breakpoint | Evidencia |
|----------|--------|------------|-----------|
| **REQ-068** (default mobile = vista DÍA/LISTA, `.agenda-row` ≥44px) | **PASA** | mobile (390px) | `e2e/evidence/iteration-3/REQ-068-agenda-mobile-list-390.png` |
| **NFR-022** (touch target ≥44px aplicado a `.agenda-row` y toggles) | **PASA** | mobile (390px) | computed: `min-height: 44px`, alto real 76px; toggles 44px |
| **REQ-059** (default desktop = MES) | **PASA** | desktop (1280px) + 768px | `e2e/evidence/iteration-3/REQ-059-agenda-desktop-mes-1280.png` |
| Reactividad `effectiveView()` (desktop↔mobile sin recargar) | **PASA** | 1280px ⇄ 390px | computed (matchMedia + DOM swap) |

---

## Detalle de la verificación (computed styles en vivo)

### REQ-068 (+ NFR-022) — Default mobile = vista DÍA/LISTA con filas ≥44px
Viewport mobile (390px, ~el ancho del feedback de la demo), `/agenda` **sin** `?vista`:
- `app-agenda-list-view` **montado** (`hasListView: true`); el grid mensual NO se monta (`.cal__grid` ausente), tampoco columnas-semana (`.week__col` = 0). → es la lista del día, no el grid ni "chips".
- **31 turnos** renderizados como `.agenda-row`, **todos `<a href="/agenda/:id">`** clickeables (deep-link a cada turno).
- **Touch target (resuelve el bug de 22px)**: cada `.agenda-row` tiene `min-height: 44px` (= `var(--touch-target-min)`); el **alto real medido (`boundingBox().height`) = 76px** en todas las filas muestreadas → muy por encima de 44px. Ya **no** son chips de 22px.
- Toggles **Mes / Semana / Día**: alto real **44px** cada uno (visibles y táctiles).
- **Sin scroll horizontal** (`scrollWidth ≤ innerWidth`).
- Token `--touch-target-min: 44px` confirmado en `:root` (cobertura de token ya existe en DC-001-029; aquí se verifica su **aplicación** a `.agenda-row`).

### REQ-059 — Default desktop = MES
Viewport desktop (1280px), `/agenda` **sin** `?vista`:
- `.cal__grid` **montado** con **35 celdas** (5 semanas × 7 días), columnas de día LUN→DOM.
- Toggle **"Mes" activo** (`.view-toggle__btn.is-active`), texto = "Mes".
- **Sin** lista (`.agenda-row` = 0) ni columnas-semana (`.week__col` = 0).
- Bloques de turno coloreados por estado dentro de las celdas + overflow "+N más".
- **Límite estricto**: a **768px exactos**, `matchMedia('(max-width:767px)')` = false → sigue siendo **MES** (la lista es `<768px` estricto). Sin scroll horizontal a 768px.

### Reactividad de `effectiveView()` (isMobile vía `matchMedia('(max-width:767px)')`)
- 1280px → MES (`.cal__grid`, 35 celdas). Reducir a **390px sin recargar** → conmuta a LISTA (`app-agenda-list-view`, 31 `.agenda-row`), `matchMedia` pasa a true, el grid se **desmonta**.
- Volver a **1280px sin recargar** → vuelve a MES, la lista se desmonta. El default por breakpoint es reactivo y no depende de un reload.

---

## Bugs Encontrados
**Ninguno.** Los 2 criterios asignados (+ NFR-022) PASAN. El feedback de la demo (filas de turno demasiado bajas / "chips de 22px" en mobile) está resuelto: las filas táctiles miden 76px de alto real con `min-height` de 44px.

---

## Tests Generados
- `e2e/tests/visual/REQ-059-068-agenda-default-responsive.spec.ts` — **7 tests** (× 2 projects = 14 ejecuciones):
  1. `REQ-068/NFR-022: default mobile = vista DÍA/LISTA (app-agenda-list-view, sin grid ni chips)`
  2. `REQ-068/NFR-022: cada .agenda-row es un <a> clickeable con alto ≥44px (resuelve los chips de 22px)`
  3. `REQ-068: los toggles Mes/Semana/Día miden ≥44px en mobile y no hay scroll horizontal`
  4. `REQ-059: default desktop = MES (grid mensual ~35 celdas, toggle "Mes" activo, sin lista ni semana)`
  5. `REQ-059: a 768px exactos el default es MES (el list-view es <768px estricto)`
  6. `REQ-059/068: effectiveView() reacciona al breakpoint sin recargar (desktop↔mobile)`
  7. `REQ-068: las filas de turno muestran badges de estado pastel coherentes (DC-053)`

### Ejecución (contra el SWA desplegado)
`npx playwright test tests/visual/REQ-059-068-agenda-default-responsive.spec.ts` (ambos projects):

```
14 passed (44.4s)
  ✓ 7 en [desktop-chromium]
  ✓ 7 en [mobile-chromium]
```

> Los tests fijan el viewport explícitamente (`setViewportSize`), por eso PASAN idénticos en ambos projects (no dependen del viewport del project). Entran en la suite de regresión de iteraciones futuras.

---

## Comparación Visual
N/A en esta iteración (modo NORMAL — verificación contra DC-xxx + computed styles, sin `image_compare`). Coherencia visual evaluada contra el design system:

| Sección | Coherencia vs Design System | Notas |
|---------|-----------------------------|-------|
| Agenda mobile (lista) | ✅ Conforme | Filas táctiles 76px; badges de estado pastel; sin scroll horizontal; HOY + "Filtros" + toggles 44px |
| Agenda desktop (MES) | ✅ Conforme | Grid mensual 7 columnas, bloques por estado, "+N más", sidebar fijo, toggle "Mes" activo |
| Badges de estado en filas (DC-053) | ✅ Conforme | Confirmado → `#e3f3ea` + dot `#2d6a4f` (éxito); Atendiendo → `#e2eef6` + dot `#246991` (info). Color nunca único portador (texto presente) |

## Brief Verification Results (BVC-xxx)
N/A en esta iteración. Los BVC-xxx (brief compliance) ya se verificaron en FASE 4 (`BVC-NFR-brief-compliance.spec.ts`, regresión automatizada). La red anti-"demo" (REQ-272) del texto nuevo de la notificación de reagenda la cubre el Flow Tester (REQ-089), no el Visual Checker.
