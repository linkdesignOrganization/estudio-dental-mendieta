# Resultados — Visual Checker — DC-071 (reconciliación viewport-aware)

**Tarea:** Ajustar el test DC-071 por conflicto de criterios con DC-072/088 (touch targets ≥44px mobile).
**Sitio testeado (desplegado):** https://happy-coast-044ea7e0f.7.azurestaticapps.net
**Archivo de test tocado (ÚNICO):** `e2e/tests/visual/DC-021-071-072-073-known-bugs.spec.ts`
**Código de la app:** NO modificado (es correcto).

## Diagnóstico del conflicto
El design system define DOS contratos de altura para `.btn-edm` que NO se contradicen, dependen del viewport:
- **DC-021 / DC-069 / DC-071** → altura de control = **40px** (`--control-height`).
- **DC-021 / DC-072 / DC-088 / BVC-017** → touch target en mobile **≥44px** (`--touch-target-min`).

El fix de **BUG-V05** subió `.btn-edm` a `min-height:44px` SOLO en el breakpoint mobile (correcto, el cliente exige ≥44px táctil en mobile). El test DC-071 original hardcodeaba `expect(btn.height).toBe(40)` sin distinguir viewport, por eso **fallaba en mobile-chromium** (donde el botón mide 44px). El código es correcto; el test era el desactualizado.

## Verificación en producción (computed-style, ambos viewports)
| Propiedad | Desktop (1280px) | Mobile (Pixel 5, 393px) | Esperado | Resultado |
|-----------|------------------|--------------------------|----------|-----------|
| `background-color` | rgb(109,168,212) = `#6da8d4` | rgb(109,168,212) = `#6da8d4` | `#6da8d4` | PASA (ambos) |
| `color` (texto) | rgb(42,42,53) = `#2a2a35` | rgb(42,42,53) = `#2a2a35` | oscuro `#2a2a35`, NO blanco (GAP-A04) | PASA (ambos) |
| `border-radius` | 12px | 12px | 10–14px | PASA (ambos) |
| altura (rect) | **40px** | **44px** (`min-height:44px`) | 40px desktop / ≥44px mobile | PASA (ambos) |

Botón verificado: "Agendar turno" (`button.btn-edm--primary`) en `/pacientes/pac-001/informacion`.

## Cambio aplicado al test
El gate DC-071 ahora es **viewport-aware**:
- Detecta el viewport del project vía `page.viewportSize()` (umbral DC-080: `<1200px` = mobile).
- **Comunes a ambos viewports:** relleno `#6da8d4`, texto oscuro `#2a2a35`, radius 10–14px.
- **Altura ramificada:**
  - desktop → `expect(height).toBe(40)` (DC-021/DC-071).
  - mobile → `expect(height).toBeGreaterThanOrEqual(44)` (DC-072/088/BVC-017).
- La altura se mide con `getBoundingClientRect().height` (refleja el `min-height` del touch target).
- Header del archivo actualizado documentando la reconciliación DC-071 ↔ DC-072/088.

No se tocaron los otros 3 gates del archivo (DC-021, DC-072/088, DC-073).

## Resultados por Criterio
| Criterio | Estado | Project / Breakpoint | Evidencia |
|----------|--------|----------------------|-----------|
| DC-071 | **PASA** | desktop-chromium (1280px, alto 40px) | `e2e/screenshots/dc071-btn-primary-desktop-40px.png` |
| DC-071 | **PASA** | mobile-chromium (Pixel 5 393px, alto 44px) | `e2e/screenshots/dc071-btn-primary-mobile-44px.png` |

## Ejecución del test (npx playwright test, ambos projects)
```
✓  1 [desktop-chromium] › DC-071 (BUG-V01): botón primario #6da8d4 + texto oscuro + radius 10-14 (alto 40px desktop / ≥44px mobile) (5.0s)
✓  2 [mobile-chromium]  › DC-071 (BUG-V01): botón primario #6da8d4 + texto oscuro + radius 10-14 (alto 40px desktop / ≥44px mobile) (4.6s)

  2 passed (10.4s)
```

Verificación de no-regresión (gates no tocados del mismo archivo):
```
✓ [desktop-chromium] DC-021 (BUG-E02/BUG-V01): .btn-edm:disabled aplica (opacity 0.4 + not-allowed)
✓ [desktop-chromium] DC-073 (BUG-V04): los tabs de la ficha exponen aria-selected
✓ [mobile-chromium]  DC-021 (BUG-E02/BUG-V01): .btn-edm:disabled aplica (opacity 0.4 + not-allowed)
✓ [mobile-chromium]  DC-073 (BUG-V04): los tabs de la ficha exponen aria-selected

  4 passed (17.8s)
```

> Nota: el gate DC-072/088 (touch targets globales) sigue ROJO por su BUG-V05 RESIDUAL preexistente
> (input.search-pill__input 23px + a.skip-link 42px en /pacientes mobile). Fuera del alcance de esta
> tarea; no se tocó.

## Bugs Encontrados
Ninguno nuevo. El código de la app es correcto en ambos viewports. El conflicto era únicamente en la aserción del test, ahora reconciliado.

## Tests Generados / Modificados
- `e2e/tests/visual/DC-021-071-072-073-known-bugs.spec.ts` (DC-071 ahora viewport-aware; header documentado)

## Conclusión
DC-071 queda **PASA en ambos projects** (desktop-chromium y mobile-chromium). Reconciliación DC-071 ↔ DC-072/088 completada sin tocar el código de la app.
