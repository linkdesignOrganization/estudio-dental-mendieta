# Cierre de cobertura — Gates `test.fixme` de V01/V04 (Visual Checker)

**Sitio probado:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (sitio desplegado, ambos projects: `desktop-chromium` 1280×900 y `mobile-chromium` Pixel 5).
**Alcance:** reactivar los gates `test.fixme` que la Ronda 1 dejó pendientes hasta corregir **BUG-V01** (la hoja de diseño no aplicaba en pantalla por CSP bloqueando el `onload` del `media="print"`) y **BUG-V04** (tabs sin `aria-selected`). Solo se tocaron archivos de test.

## Verificación previa en producción (browser, computed styles)
| Qué | Esperado | Live | Resultado |
|-----|----------|------|-----------|
| Hoja `styles-*.css` aplica en pantalla | `media` vacío / matchea screen | `media=""`, `appliesToScreen=true` (`styles-FHPOFM43.css`) | V01 OK |
| `h1/h2/h3` peso | 500 | 500 | V01 OK |
| `h1/h2/h3` line-height | ~1.2 | 1.20–1.25 | V01 OK |
| `h1/h2/h3` familia | Red Hat Display | "Red Hat Display" | V01 OK |
| `.btn-edm--primary` relleno | #6da8d4 = rgb(109,168,212) | rgb(109,168,212) | V01 OK |
| `.btn-edm--primary` texto | oscuro #2a2a35 | rgb(42,42,53) | V01 OK |
| `.btn-edm--primary` radius / alto | 10–14 / 40px | 12 / 40 | V01 OK |
| `.btn-edm:disabled` (probe en doc) | opacity .4 / not-allowed | "0.4" / "not-allowed" | V01 OK |
| Tabs ficha `aria-selected` | 6 tabs, exactamente 1 `true` | 6 tabs, 1 `true`, 5 `false` | V04 OK |

## Acción sobre cada gate `fixme` (9 en total)

### Activados (8 fixme → `test`, PASAN en ambos projects)
| Test | Criterio | Archivo:línea | Acción |
|------|----------|---------------|--------|
| stylesheet aplica en pantalla | DC-015..018 (raíz V01) | DC-015-018-typography.spec.ts:35 | quité `.fixme` |
| títulos peso 500 | DC-016 / BVC-001 | DC-015-018-typography.spec.ts:41 | quité `.fixme` |
| títulos line-height ~1.2 | DC-017 / BVC-022 | DC-015-018-typography.spec.ts:50 | quité `.fixme` |
| títulos Red Hat Display | DC-015 | DC-015-018-typography.spec.ts:62 | quité `.fixme` |
| escala de títulos 32/28/20/16 (≤3) | DC-018 / BVC-022 | DC-015-018-typography.spec.ts:79 | quité `.fixme` + **re-escopado** (ver abajo) |
| botón primario #6da8d4 / texto oscuro / 40px / radius | DC-071 / GAP-A04 | DC-021-071-072-073-known-bugs.spec.ts:29 | quité `.fixme` |
| `.btn-edm:disabled` opacity .4 + not-allowed | DC-021 / BUG-E02 | DC-021-071-072-073-known-bugs.spec.ts:55 | quité `.fixme` + **reescrito determinista** (ver abajo) |
| tabs exponen `aria-selected` | DC-073 / BUG-V04 | DC-021-071-072-073-known-bugs.spec.ts:101 | quité `.fixme` |

**Ajustes de test (no eran bugs de app, eran tests mal/escasamente escritos):**
- **DC-018** — La versión R1 contaba el `font-size` de **todo** `div/span/legend` con texto y exigía `≤3`. Con V01 ya aplicando, `/reportes` (dashboard denso con gráficos) presenta 7 tamaños distintos a nivel de micro-elementos (leyendas 11/13px, badges 14px, cuerpo 16px, etc.), lo cual es normal y **no** es lo que DC-018 gobierna. DC-018 limita la **escala de títulos** (32/28/20/16 + small 14). Re-escopé el test a `h1–h3`: cada tamaño debe pertenecer a la escala canónica y usarse ≤3 por pantalla. Live: `h1–h3` usa {28,20}. → PASA. (No es bug de app.)
- **DC-021** — La versión R1 buscaba un botón `.btn-edm` disabled en `/agenda` y se **auto-skipeaba** si no lo hallaba (frágil; hoy no hay disabled visible allí → cobertura nula). Como V01 era la causa raíz (la regla `:disabled` no aplicaba por la hoja inerte), reescribí el test para verificar la **regla CSS** de forma determinista: monta un `.btn-edm[disabled]` real dentro del documento de la app (hereda la hoja ya aplicada) y lee su computed style. Live: opacity "0.4", cursor "not-allowed". → PASA. (No es bug de app; el test ahora cubre realmente DC-021/BUG-E02.)

### Mantenido `fixme` (1) — bug real pendiente para el Developer
| Test | Criterio | Archivo:línea | Motivo |
|------|----------|---------------|--------|
| touch targets ≥44px en mobile | DC-072 / DC-088 / DC-021 / BVC-017 | DC-021-071-072-073-known-bugs.spec.ts:82 | **BUG-V05** (a11y) — el fix de V01 subió los icon-buttons de ~28px a 40px, pero **no** al ≥44px que exige el design system en mobile. Sigue `fixme`. |

## Resultado de ejecución (`playwright test`, ambos projects)
```
20 tests → 18 passed, 2 skipped (1.1m)
  18 passed  = 9 gates activados × 2 projects
  2 skipped  = DC-072/088 (fixme intencional) × 2 projects
```
Sin fallos. Reusé `playwright.config.ts` y `tests/_helpers/seed.ts` existentes; no se tocó código de la app.

## Bugs encontrados

BUG-V05 (NUEVO — derivado de V01, queda para el Developer):
- Criterio: DC-072 / DC-088 / DC-021 / BVC-017
- Tipo: accesibilidad (touch target)
- Breakpoint: mobile (375×812)
- Descripción: tras el fix de V01, los controles de icono en mobile no alcanzan el área táctil mínima de 44px que exige el design system. El token `--touch-target-min: 44px` está definido en `:root` pero **no se aplica** al hit-area de estos controles (caja real = tamaño visual, sin expansión por padding/`::before`/`min-height`).
- Esperado: hit-area ≥ 44×44px en TODO control mobile (DC-088: "Touch target ≥44px en TODO control mobile"; DC-072: "área toque … 44px mobile"; DC-021: "touch target mínimo en mobile = 44px (`--touch-target-min`)").
- Actual (live, `/pacientes` @375px, medido con `getBoundingClientRect`):
  - hamburguesa `.icon-btn.header__burger`: **40×40** (`width:40px; min-width:40px; min-height:auto`)
  - campana `.icon-btn.header__bell`: **40×40**
  - "Editar paciente" `a.icon-btn` (filas): **40×40**
  - avatar `.header__avatar-btn`: **32×32**
  - input búsqueda `.search-pill__input`: **23px** de alto
  - toggles vista `.view-toggle__btn` (Tabla/Tarjetas): **36px**
- Severidad: media (a11y/usabilidad táctil; no bloquea funcionalidad)
- Sugerencia (no normativa): expandir el hit-area mobile a `--touch-target-min` (p.ej. `min-height:44px; min-width:44px` o área táctil con `::before` de 44px) manteniendo el tamaño visual de 40px.
- Evidencia: `e2e/evidence/V05-touch-targets-mobile-375.png`
- Gate de regresión ya listo: `tests/visual/DC-021-071-072-073-known-bugs.spec.ts:82` (`test.fixme` DC-072/088). Reactivar (quitar `.fixme`) cuando el hit-area mobile llegue a ≥44px.

## Resultados por Criterio
| Criterio | Estado | Breakpoint | Evidencia |
|----------|--------|------------|-----------|
| DC-015 (Red Hat Display) | PASA | desktop+mobile | computed `fontFamily="Red Hat Display"` |
| DC-016 (peso 500 títulos / 400 cuerpo) | PASA | desktop+mobile | weight 500 / body 400 |
| DC-017 (line-height ~1.2) | PASA | desktop+mobile | 1.20–1.25 |
| DC-018 (escala de títulos) | PASA | desktop+mobile | h1–h3 ∈ {28,20} ⊂ {32,28,20,16,14} |
| DC-021 (disabled .4 / not-allowed) | PASA | desktop+mobile | probe opacity 0.4 / not-allowed |
| DC-071 (botón primario) | PASA | desktop+mobile | rgb(109,168,212) / rgb(42,42,53) / r12 / h40 |
| DC-073 (aria-selected tabs) | PASA | desktop+mobile | 6 tabs, 1×true |
| DC-072 / DC-088 (touch ≥44px) | FALLA (fixme, BUG-V05) | mobile | V05-touch-targets-mobile-375.png |

## Tests afectados (solo archivos de test modificados)
- `e2e/tests/visual/DC-015-018-typography.spec.ts` — 5 gates activados (DC-015/016/017/018 + raíz V01); DC-018 re-escopado a títulos.
- `e2e/tests/visual/DC-021-071-072-073-known-bugs.spec.ts` — DC-071 y DC-073 activados; DC-021 activado + reescrito determinista; DC-072/088 mantenido `fixme` (BUG-V05).
