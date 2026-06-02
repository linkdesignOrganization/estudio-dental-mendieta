# Resultados — Visual Checker (Construcción Visual · RONDA 2 · re-test)

> URL desplegada testeada: https://happy-coast-044ea7e0f.7.azurestaticapps.net
> Criterio asignado esta ronda: **DC-076** (odontograma — 32 piezas FDI + leyenda de 6 estados).
> Fallo de regresión: `tests/visual/DC-050-077-components.spec.ts:172` (desktop-chromium, 5.0s).
> Contexto del fix: el Developer cambió el bloque del odontograma de `@defer (on viewport)` a `@defer (on idle)` para corregir **BUG-E04** (no hidrataba por deep-link directo en mobile).

## Veredicto: DC-076 → **PASA** (test ajustado por TIMING — NO es bug)

Es el **caso (a)** de la asignación: el odontograma **renderiza correctamente** las 32 piezas y la leyenda; el fallo del test era una **carrera de timing** contra `@defer (on idle)`. Se ajustó SOLO el archivo de test. El código de la app NO se tocó.

---

## Resultados por Criterio

| Criterio | Estado | Breakpoint | Evidencia |
|----------|--------|------------|-----------|
| DC-076 | **PASA** (test ajustado) | desktop (≥992px) | `e2e/screenshots/DC-076-odontograma-desktop-pac029.png` |
| DC-076 | **PASA** (verificación adicional) | mobile (deep-link directo, viewport 393×851) | `e2e/screenshots/DC-076-odontograma-mobile-deeplink-pac029.png` |

### Verificación del render real (live, contra el sitio desplegado)

**Desktop (`/pacientes/pac-029/odontograma`, 1280×900):**
- 32 piezas presentes (`[aria-label^="Pieza"]` → count **32**).
- aria-label con formato FDI correcto: `"Pieza 18 (universal 1), Sana"`, `"Pieza 17 (universal 2), Sana"`, `"Pieza 16 (universal 3), Ausente"` → matchea `/Pieza\s+\d+\s+\(universal\s+\d+\),/`.
- Arcada superior (18→11 | 21→28) y arcada inferior con eje sutil; superficies blancas, íconos de estado por pieza (X en ausente, escudo en prótesis).
- Leyenda `.odo__legend` con los **6 estados**: `Sana · Caries · Obturación · Ausente · En tratamiento · Prótesis`.
- Variedad de estados en el seed de pac-029: 24 Sana, 3 Ausente, 3 Prótesis, 2 Obturación.

**Mobile deep-link directo (escenario de BUG-E04, `/pacientes/pac-029/odontograma`, 393×851):**
- 32 piezas presentes tras deep-link directo (sin navegar primero a otra pantalla) → BUG-E04 confirmado RESUELTO en prod.
- Leyenda con los 6 estados presente.
- **Sin scroll horizontal** (`document.documentElement.scrollWidth == clientWidth == 393`) → cumple DC-043 ("piezas legibles sin scroll horizontal" en mobile).

**A11y del odontograma (parte de DC-076):**
- Cada pieza con `aria-label` FDI+universal+estado (verificado en las 32).
- Leyenda con los 6 estados legibles.

---

## Causa raíz del fallo del test (timing) y fix aplicado

**Diagnóstico:** el test hacía un `await page.waitForTimeout(1000)` (espera fija) y luego leía el conteo de piezas con un `page.evaluate` + `expect(...).toBe(32)` **de un solo disparo (sin auto-retry)**. Con `@defer (on idle)`, la hidratación ocurre en la *idle window* del navegador, cuyo instante **no es determinista** (depende de red/CPU). Si el idle dispara después de los 1000ms, el snapshot leía 0 piezas → `expect(...).toBe(32)` reventaba inmediatamente. Por eso fallaba a ~5.0s de forma intermitente (carrera). Con `@defer (on viewport)` el patrón previo (scroll-into-view) disparaba la carga de otra manera; el cambio a `on idle` rompió ese supuesto.

**Reproducción:** corriendo el test ORIGINAL 5 veces seguidas pasó 5/5 pero siempre al borde (5.1–6.0s), confirmando que el margen del `waitForTimeout(1000)` fijo era frágil frente al instante variable del `on idle` (el fallo original a 5.0s cae dentro de ese rango).

**Fix (SOLO en el `.spec.ts`):** se reemplazó la espera fija por una espera **determinista** que aguarda a que el `@defer` puble el contenido, con auto-retry de `expect` (hasta `expect.timeout = 15s`):

- `await expect(page.locator('[aria-label^="Pieza"]')).toHaveCount(32)` — espera a que hidraten las 32 piezas (robusto para `on idle` y también para `on viewport`).
- `await expect(legendLocator).toBeVisible()` + `toContainText(...)` por cada uno de los 6 estados (`Sana`, `Caries`, `Obturación`, `Ausente`, `En tratamiento`, `Prótesis`).

De paso se corrigió el chequeo de la leyenda: antes colapsaba todo el whitespace y buscaba el literal `'Entratamiento'`; ahora usa `toContainText('En tratamiento')` (normaliza espacios), más claro y correcto.

**Archivo:** `e2e/tests/visual/DC-050-077-components.spec.ts` (test `DC-076`, ahora en línea 177). El código de la app NO fue modificado.

---

## Verificación del fix (ejecuciones contra el sitio desplegado)

| Ejecución | Proyecto | Resultado |
|-----------|----------|-----------|
| DC-076 ×3 | desktop-chromium | 3/3 PASA (4.8–5.3s) |
| DC-076 ×2 | mobile-chromium | 2/2 PASA (4.7–5.0s) |
| Archivo completo (8 tests) | desktop-chromium | **8/8 PASA** (39.2s) |
| Archivo completo (8 tests) | mobile-chromium | **8/8 PASA** (40.1s) |

El ajuste es determinista (no flaky en las repeticiones) y no rompe ningún otro test del archivo en ningún proyecto.

---

## Bugs Encontrados

Ninguno. El render del odontograma es correcto en desktop y en mobile (incluido deep-link directo). No se reporta BUG-Vxx para DC-076. (No se tocaron los `test.fixme` de BUG-V01/V04 — fuera de alcance esta ronda, los coordina el PM.)

---

## Tests Generados / Ajustados

- `e2e/tests/visual/DC-050-077-components.spec.ts` — ajustado el test `DC-076` (espera determinista al `@defer on idle`). Queda como **gate de regresión** para rondas futuras, pasando en ambos projects (desktop + mobile).

> No se crea archivo nuevo: DC-076 ya vivía en `DC-050-077-components.spec.ts` y la regla de la distribución es actualizar el `.spec.ts` desbloqueado existente, no duplicarlo.

---

## Comparación Visual

| Sección | Similitud vs Referencia | Notas |
|---------|------------------------|-------|
| Odontograma (32 piezas + leyenda) | N/A (componente propio del dominio, GAP-D03: sin análogo en la referencia) | Renderizado dentro del lenguaje del DS: superficies blancas, líneas `#e8e8ee`, estados pastel + ícono. Cumple DC-043/DC-076. Capturas de evidencia en `e2e/screenshots/DC-076-odontograma-{desktop,mobile-deeplink}-pac029.png`. |

## Brief Verification Results (BVC-xxx)

No aplica esta ronda: la distribución no asignó BVC-xxx nuevos al Visual Checker (los BVC afectados por BUG-V01 se re-verifican vía la regresión automatizada de los `test.fixme` re-habilitados, coordinada por el PM).
