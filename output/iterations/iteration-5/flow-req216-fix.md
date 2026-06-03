# Resultados — Flow Tester · Actualización REQ-216 (BUG-F01 corregido)

> Tarea puntual: invertir el test "[defecto conocido]" de REQ-216 tras la corrección de **BUG-F01**
> por el Developer (`viewChild` + `afterNextRender` en `budget-create.component.ts`), ya desplegado.
> Corrida SIN worktree. Solo se tocaron archivos de test.
> Sitio testeado: https://happy-coast-044ea7e0f.7.azurestaticapps.net (Azure SWA, deploy en vivo).

## Verificación en vivo del fix (antes de tocar los tests)
Flujo ejecutado contra el deploy (browser real, ambos projects desktop + mobile):
crear presupuesto → Paso 1 elegir **Diego Sosa** (`#b-pac` = `pac-005`) → "Siguiente" → Paso 2 → "Atrás" → Paso 1.

Resultado observado tras "Atrás":
- `#b-pac` `.value` = **`pac-005`** (NO vacío).
- `#b-pac option:checked` = **"Diego Sosa"** (NO el placeholder "Elegí un paciente").

→ El fix funciona: el `<select>` AHORA re-muestra el paciente preservado. Como el re-sync ocurre en
`afterNextRender` (un microtick después del re-render del Paso 1), el value se asserta con espera
web-first (`toHaveValue` reintenta) / poll — no con lectura síncrona.

## Resultados por Criterio
| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| REQ-216 | **PASA** (fix verificado) | Verificación en vivo + test invertido verde 3/3 corridas, desktop + mobile |
| REQ-219 | PASA | Reforzado con assert del select (`toHaveValue('pac-005')`); verde 3/3, ambos projects |
| UX-029 (preserva paciente + tratamientos) | PASA | Actualizado (ya no re-elige paciente); verde 3/3, ambos projects |

## Bugs Encontrados
Ninguno. BUG-F01 quedó CORREGIDO y verificado (el select re-muestra `pac-005` / "Diego Sosa" tras "Atrás").
No se reabre ningún bug.

## Cambios en tests (solo archivos de test)
1. `e2e/tests/flow/REQ-216-219-budget-back-preserva.spec.ts`
   - **Test REQ-216 INVERTIDO**: de "[defecto conocido] el `<select>` no re-muestra el paciente"
     (afirmaba `toHaveValue('')` + opción "Elegí un paciente") a **verificar el comportamiento
     corregido**: tras "Atrás", `toHaveValue('pac-005')` y `option:checked` = "Diego Sosa". Se quitó
     el "[defecto conocido]" del título. Se añadió candado de no-regresión: `option:checked`
     `not.toHaveText('Elegí un paciente')`.
   - **Test REQ-219 reforzado**: tras "Atrás" se añadió `await expect(#b-pac).toHaveValue('pac-005')`
     (web-first), coherente con el fix.
   - Docstring de cabecera reescrito: BUG-F01 pasa de "DEFECTO DE VISTA hoy" a "CORREGIDO
     (viewChild + afterNextRender)"; se documenta el uso de espera web-first por `afterNextRender`.
2. `e2e/tests/flow/UX-multipaso-cierre.spec.ts`
   - **Test UX-029** "crear presupuesto … Atrás preserva": ya NO re-elige el paciente al volver al
     Paso 1; ahora asserta `getByLabel('Paciente').toHaveValue('pac-005')` y avanza sin re-seleccionar.
     Título y comentarios actualizados (de "la demo no repuebla el select" → "BUG-F01 corregido: el
     select conserva al paciente"). El resto del flujo (total auto-calculado, tratamientos preservados,
     resumen Paso 3) se mantiene.

Nota: los demás `F01` del repo (`REQ-182-184-editar-paciente-dirty-check.spec.ts`) son un bug DISTINTO
(dirty-check de REQ-184), no el de presupuestos; no se tocaron. Ningún otro test referencia `#b-pac`
ni el defecto del select de presupuestos.

## Ejecución (estabilidad)
`npx playwright test … -g "REQ-216|REQ-219|UX-029: crear presupuesto"` desde `e2e/`, AMBOS projects
(`desktop-chromium` + `mobile-chromium`):
- Corrida 1: **8 passed** (38.7s)
- Corrida 2: **8 passed** (37.9s)
- Corrida 3: **8 passed** (39.2s)

(8 = REQ-216 + REQ-219 + UX-029-preserva + UX-029-e2e-persiste, x2 projects.) Estable, sin flaky.

## Tests Generados / Modificados
- e2e/tests/flow/REQ-216-219-budget-back-preserva.spec.ts (REQ-216 invertido + REQ-219 reforzado)
- e2e/tests/flow/UX-multipaso-cierre.spec.ts (UX-029 actualizado)

## GIFs de Flujos
No se grabaron GIFs (tarea de actualización de test; evidencia = verificación en vivo + 3 corridas verdes).
