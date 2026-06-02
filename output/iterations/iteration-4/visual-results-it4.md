# Resultados — Visual Checker · Iteración 4 (Pacientes escritura + Tratamientos) · Ronda 1

- **Modo**: NORMAL (comparación contra criterios DC-xxx/REQ-xxx de `design-criteria.md`; sin image_compare).
- **URL probada (sitio desplegado)**: https://happy-coast-044ea7e0f.7.azurestaticapps.net
- **Ejecución**: `npx playwright test` desde `e2e/`, ambos projects (`desktop-chromium` 1280px + `mobile-chromium` Pixel 5 ~393px).
- **Resultado de la suite generada**: **34 passed / 0 failed** (17 tests × 2 projects), 2.4m.
- **Bugs visuales encontrados**: **0**.
- **Verificación**: computed styles vía `page.evaluate` + `boundingBox()` reales + inspección de hojas de estilo (`:focus-visible`).

---

## Resultados por Criterio

| Criterio | Estado | Breakpoint(s) | Evidencia |
|----------|--------|---------------|-----------|
| **REQ-270** — selector de pieza touch ≥44px en mobile, sin scroll-x | **PASA** | mobile, desktop | 6 `.tss__opt` alto 52–77px (≥44); "Guardar estado" 44px; scrollWidth==innerWidth · `it4-tss-selector-mobile.png` |
| **REQ-270 / DC-077** — radiogroup con 6 radios visibles (no dropdown), opción marcada | **PASA** | mobile | `role=radiogroup` "Estado de la pieza" + 6 `role=radio`; 1 `.is-selected` + 1 `aria-checked=true`; 0 `<select>` en `.tss` |
| **REQ-270 / DC-076** — los 6 estados del dominio ofrecidos | **PASA** | mobile | Sana · Caries · Obturación · Ausente · En tratamiento · Prótesis (coherentes con la leyenda) |
| **REQ-270 / NFR-021** — focus ring visible en `.tss__opt` | **PASA** | mobile | `--focus-ring`=`0 0 0 2px #246991`; al enfocar → `rgb(36,105,145) 0 0 0 2px` |
| **REQ-198** — catálogo en cards aireadas (≥12, radius 10–14, costo), no tabla | **PASA** | desktop | 15 `a.ttcard`; radius 12px; padding 24px; gap 20px; todas con costo ARS; sombra+border:0 (DC-023); 0 `<table>` en `.catalog` · `it4-catalog-mobile.png` |
| **REQ-201** — catálogo responsive 1/2/3 col | **PASA** | mobile/tablet/desktop | 393px→1 col · 820px→2 col · 1280px→3 col; sin scroll-x en los 3 |
| **REQ-203** — costo ARS formateado en detalle de tipo | **PASA** | desktop | `$ 145.000` (regex es-AR `^\$\s?\d{1,3}(\.\d{3})*$`) |
| **REQ-205** — detalle de tipo usable en mobile | **PASA** | mobile | 4 `.surface-card` radius 14px; back-link `/tratamientos` 44px; sin scroll-x |
| **REQ-197** — lista de tratamientos usable en mobile (tabla→mini-cards) | **PASA** | mobile, desktop | mobile: tabla `display:none` + `.dt__card`×12; desktop: tabla 5 col [Paciente·Tratamiento·Profesional·Etapas·Próxima fecha]; sin scroll-x |
| **REQ-181** — indicador de paso visible | **PASA** | mobile | `.stepper__list` 2 items (Datos personales/Datos clínicos); `.stepper__count`="Paso 1 de 2"→"Paso 2 de 2"; `.is-current` migra correctamente |
| **REQ-180** — crear paciente (2 pasos) usable en mobile | **PASA** | mobile, desktop | Paso1: 8 controles 1 col (x=48) alto 44px, Siguiente 44px, género 44px; Paso2: Atrás+Crear 44px, `input[type=file] accept=image/*`; sin scroll-x; desktop control-height=40px |
| **REQ-185** — editar paciente usable en mobile | **PASA** | mobile | precargado (nombre="Bautista"); 8 controles 1 col 44px; "Guardar cambios" 44px; sin scroll-x |
| **NFR-021** (transversal It4) — focus ring en controles nuevos | **PASA** | mobile | `.tss__opt`, `.btn-edm`, `.section-nav__tab` → ring `#246991` 2px; `.input-edm/.select-edm` con regla `:focus-visible`=var(--focus-ring); `a.ttcard` con outline 3px visible |
| **NFR-022** (transversal It4) — touch targets ≥44px mobile | **PASA** | mobile | cubierto por REQ-180/185/270 (todos los controles nuevos ≥44px medidos con boundingBox real) |
| **NFR-004** — odontograma 32 piezas sin lag (`@defer on immediate`) | **PASA** | mobile | `/pacientes/pac-001/odontograma` hidrata 32 `button[aria-label^="Pieza"]`; leyenda 6 estados; sin scroll-x |
| **NFR-002** — bundle inicial < 500KB gzip | **PASA (heredado)** | — | build It4 `427.99 kB / 103.48 kB gzipped` (error-budgeted en build, ya verde en regresión) |
| **NFR-020** — contraste WCAG AA en pantallas nuevas | **PASA** | — | tokens del sistema (texto `#2a2a35`, secundario `#707080`, semánticos pastel) usados; receta GAP-A04 vigente; sin texto blanco sobre azul medio en los controles nuevos |
| **NFR-023** — labels en navegación | **N/A (justificado)** | — | It4 no modifica la navegación principal (sidebar/header intactos); fuera del alcance |
| **BVC-xxx** | **N/A** | — | It4 no introduce BVC nuevos; la suite `BVC-NFR-brief-compliance.spec.ts` corre como regresión (Fase 4) |

**Resumen**: 18 criterios verificados → **18 PASA / 0 FALLA / 0 BLOQUEADO** (NFR-023 = N/A justificado, BVC = N/A).

---

## Bugs Encontrados

**Ninguno.** Las tres áreas de foco del plan (selector de 6 estados del odontograma con touch ≥44px, cards del catálogo aireadas con radius/costo, stepper de crear paciente) cumplen los criterios DC/REQ y los NFR de accesibilidad/responsive. No se detectó ningún desvío de `design-criteria-compliance` ni `responsive` ni `accesibilidad`.

---

## Tests Generados

- `e2e/tests/visual/REQ-270-tooth-state-selector-mobile.spec.ts` — REQ-270 (+ DC-076/077, NFR-021/022). 5 tests.
- `e2e/tests/visual/REQ-197-205-treatments-catalog-responsive.spec.ts` — REQ-197/198/201/203/205 (+ DC-046/062/063/081/084). 7 tests.
- `e2e/tests/visual/REQ-180-185-patient-form-mobile.spec.ts` — REQ-180/181/185 (+ DC-070/085/087/088, NFR-021/022). 5 tests.

Total: **17 tests** × 2 projects = **34 ejecuciones**, todas verdes. Entran en la suite de regresión de iteraciones futuras.

### Evidencia (screenshots)
- `e2e/evidence/visual-it4/it4-tss-selector-mobile.png` — selector de 6 estados en mobile (touch ≥44px, 2 columnas).
- `e2e/evidence/visual-it4/it4-catalog-mobile.png` — catálogo de tipos en cards aireadas (mobile, 1 columna).

---

## Comparación Visual

| Sección | Verificación | Notas |
|---------|--------------|-------|
| Selector de estado de pieza | Computed-style + boundingBox | 6 opciones tocables (grid 2 col, 142.5px), alto 52–77px; opción actual tintada `.is-selected`; nivel premium (no dropdown denso) — alineado a DC-077 |
| Catálogo de tipos | Computed-style | 15 cards `surface-card` radius 12px, padding 24px, sombra ultra-sutil `rgba(42,42,53,0.04)` sin borde (DC-022/023); aire generoso (gap 20px) — se ve al nivel de las referencias (Task Dasher pricing), no template |
| Detalle de tipo | Computed-style | costo ARS `$ 145.000` es-AR; 4 cards aireadas radius 14px/padding 32px |
| Wizard crear/editar paciente | Computed-style + boundingBox | stepper `Paso N de 2` con item actual destacado; 1 columna en mobile, controles 44px (mobile) / 40px (desktop) — DC-069/070/087 |
| Lista de tratamientos | Computed-style | tabla ≤5 col en desktop (Próxima fecha = 5ta), mini-cards en mobile — DC-063/081, sin exceder BVC-009 |

---

## Brief Verification Results

No aplica a Iteración 4: no se introdujeron criterios BVC-xxx nuevos. Los 29 BVC de Fase 4 ya están verificados en `visual-build/` y la suite `BVC-NFR-brief-compliance.spec.ts` los cubre como regresión (verde en `regression-results.md`).
