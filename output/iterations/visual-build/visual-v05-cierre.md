# Cierre — Visual Checker · Re-test BUG-V05 (touch targets ≥44px en mobile)

**Gate:** DC-072 / DC-088 / BVC-017 — todo control interactivo en mobile debe tener hit-area ≥44px.
**Test:** `e2e/tests/visual/DC-021-071-072-073-known-bugs.spec.ts` → `DC-072/088 (BUG-V05): touch targets ≥44px en mobile`
**Sitio (desplegado):** https://happy-coast-044ea7e0f.7.azurestaticapps.net
**Viewport:** 375×812 (test) y Pixel 5 393px (sweep manual). Projects: `desktop-chromium` + `mobile-chromium`.
**Acción:** quité el `test.fixme` → test ACTIVO. Solo toqué archivos de test.

## Veredicto

**DC-072/088 = FALLA (gate ROJO).** BUG-V05 quedó **parcialmente corregido**: el grueso de los controles que reportó el fixme ya cumplen ≥44px, pero **2 controles residuales siguen <44px** en `/pacientes` mobile, por lo que el gate no puede pasar. → **Bug residual para el UI Developer.**

El test reactivado es ahora un gate de regresión legítimo y determinista (rojo hoy, verde cuando se cierren los 2 residuales). Se deja ACTIVO a propósito.

## Lo que el fix de V05 SÍ corrigió (verificado live, /pacientes 375px)

| Control | Antes (V05 abierto) | Ahora | Estado |
|---|---|---|---|
| `icon-btn header__burger` (hamburguesa) | 40×40 | **44×44** | OK |
| `icon-btn header__bell` (campana) | 40×40 | **44×44** | OK |
| `header__avatar-btn` (avatar "AD") | 32×32 | **44×44** (ícono visual 32px centrado) | OK |
| `icon-btn` "Editar paciente" (×12 en lista) | 40×40 | **44×44** | OK |
| `view-toggle__btn` "Tabla" / "Tarjetas" | <44 | **44** | OK |
| `icon-btn` "Página anterior/siguiente" | — | **44×44** | OK |
| `sidebar__item` (8 items del drawer) | — | **44** | OK |
| `btn-edm--primary` "Nuevo paciente" | — | **44** | OK |
| Tabs de la ficha (`role=tab`, 6) | — | **52** | OK |
| Piezas `.tooth` del odontograma (interactivas) | — | **53** | OK |

Total interactivos visibles en /pacientes: 30 → **28 cumplen ≥44px**.

## Controles residuales <44px (BUG-V05 RESIDUAL) — para UI Developer

Reproducido determinista en **ambos** projects (desktop-chromium y mobile-chromium). Set de fallo idéntico:

### RESIDUAL #1 — Input de búsqueda interno (CRÍTICO)
- **Elemento:** `input.search-pill__input` (placeholder "Buscar pacientes"), en el header de `/pacientes`.
- **Alto real:** **23px** (border-box). Ancho 106px.
- **Causa raíz:** el wrapper `.search-pill` SÍ mide **44px** (`min-height:44px`), pero el `<input>` interno NO se estira a la altura del pill: `height:23px`, `min-height:0`, `padding 1px/1px`. Tiene `align-self:stretch` pero el flex padre no lo estira (probablemente `align-items:center` en `.search-pill`, o el input fuerza su propia `height`). El control que recibe el foco de teclado y el tap real es de 23px de alto.
- **Fix sugerido:** que el `.search-pill__input` herede el alto del pill — p.ej. `align-self: stretch` efectivo (quitar `align-items:center` del pill o poner `height:100%`/`min-height:44px` al input). El objetivo es que el `getBoundingClientRect().height` del `<input>` sea ≥44px, no solo el del wrapper.
- **Evidencia:** `e2e/screenshots/v05-cierre-search-input-23px-residual.png` — outline verde discontinuo = `.search-pill` (44px), outline rojo = `.search-pill__input` (23px) centrado dentro.

### RESIDUAL #2 — Skip link "Saltar al contenido"
- **Elemento:** `a.skip-link` "Saltar al contenido" (link de accesibilidad de salto al contenido, presente en el DOM de todas las vistas).
- **Alto real:** **42px** (border-box). `height:41.59px` = line-height 25.6 + padding 8/8. Faltan ~2px.
- **Causa raíz:** `min-height:0`; el alto sale solo de line-height + padding. 2px corto de 44.
- **Fix sugerido:** `min-height: var(--touch-target-min)` (44px) sobre `.skip-link`, o subir padding vertical a 10px. Aparece en TODAS las rutas (componente global), no solo /pacientes.

## Hallazgo secundario (fuera del scope del gate, informativo)

En `/agenda` mobile (vista semana), **25 chips `.cal__appt`** (turnos clickeables del grid semanal) miden **22px de alto**. El gate oficial corre sobre `/pacientes`, así que no bloquea DC-072/088, pero es la MISMA clase de incumplimiento de touch-target. Probable causa: la grilla semanal densa no colapsa a vista día/lista en mobile. Recomendación al Developer/Architect: o subir el alto de los slots/chips, o que la agenda use una vista de lista (día/agenda) en <768px. **No** lo convierto en gate aquí porque excede el alcance del re-test de V05; queda documentado para decisión de producto.

## Resultados por Criterio

| Criterio | Estado | Breakpoint | Evidencia |
|---|---|---|---|
| DC-072 / DC-088 / BVC-017 (touch ≥44px mobile) | **FALLA** | mobile (375 / Pixel 5) | screenshots abajo; test rojo en ambos projects |

## Bugs Encontrados

**BUG-V05 (RESIDUAL):**
- Criterio: DC-072 / DC-088 / BVC-017
- Tipo: accesibilidad (a11y) / design-criteria-compliance
- Breakpoint: mobile (375px y Pixel 5 393px)
- Descripción: 2 controles interactivos visibles siguen bajo 44px de hit-area tras el fix de V05.
  - `input.search-pill__input` "Buscar pacientes" → **23px** (wrapper `.search-pill` ok a 44px, pero el input interno no se estira).
  - `a.skip-link` "Saltar al contenido" → **42px** (global, todas las vistas).
- Esperado: hit-area (border-box) ≥44px de alto en CADA control interactivo (`--touch-target-min: 44px`).
- Actual: 23px (search input) y 42px (skip link). Resto de controles ya cumplen.
- Severidad: **alta** (gate de a11y + BVC del cliente; bloquea cierre de DC-072/088).
- Evidencia: `e2e/screenshots/v05-cierre-search-input-23px-residual.png`, `e2e/screenshots/v05-cierre-pacientes-mobile-375.png`.

## Tests
- `e2e/tests/visual/DC-021-071-072-073-known-bugs.spec.ts` → `DC-072/088 (BUG-V05)` **reactivado** (sin `.fixme`). Estado actual: **FALLA** (rojo determinista en ambos projects). Quedará verde automáticamente cuando search-input y skip-link lleguen a ≥44px. No se generan nuevos .spec.ts; el gate ya existía.

## Salida del test (resumen)

```
2 failed
  [desktop-chromium] › DC-072/088 (BUG-V05): touch targets ≥44px en mobile
  [mobile-chromium]  › DC-072/088 (BUG-V05): touch targets ≥44px en mobile

Error: controles bajo 44px en mobile
- Expected  []
+ Received  [ { h: 42, t: "Saltar al contenido" }, { h: 23, t: "Buscar pacientes" } ]
```

## Conclusión
DC-072/088 **NO** queda cerrado. El fix de V05 resolvió burger/bell/avatar/Editar/view-toggles/tabs/odontograma/sidebar, pero faltan **2 controles**: `search-pill__input` (23px) y `skip-link` (42px). Devuelvo a UI Developer para fix residual; al corregirlos, el gate ya activo pasará a verde sin más cambios de test.
