# Diagnóstico UX-022 — Flow Tester

**Criterio:** UX-022 — "avanzar estado del turno (confirmado → atendiendo) persiste"
**Archivo:** `e2e/tests/flow/UX-020-032-critical-flows.spec.ts`
**Sitio:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (desplegado, no localhost)
**Veredicto:** (a) FLAKY por carrera del wizard — **NO es bug de la app**. Test ESTABILIZADO. UX-022 queda **PASA estable**.

---

## Resumen

El fallo era intermitente (1 de 480 en la re-regresión, solo desktop-chromium). El
comportamiento de la app es **correcto**: crear un turno siempre nace `Confirmado`, y
`Avanzar estado` (Confirmado → Atendiendo) funciona y **persiste** en localStorage (verificado
con `page.reload()` real). El problema vivía en el **test**, no en el producto.

## Evidencia de la causa raíz

Artefacto de la corrida que falló (`test-results/.../error-context.md`), capturado antes de
limpiarse:

- Error real en **línea 101** (`await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/)`), no en la 104.
- URL recibida: `…/agenda/nuevo/confirmar` → el wizard quedó **atascado en el Paso 3**.
- El snapshot del DOM mostraba el resumen del paso 3 **completamente vacío**:
  `text: Paciente — Profesional — Fecha y hora — · —`.

Es decir: se hizo clic en "Confirmar turno" con el estado del flujo (`AppointmentFlowService`)
**vacío**. `confirm()` llamó a `crearTurno({...vacío})`, `flow.reset()` y `router.navigate`,
pero al no haber un turno válido el wizard nunca llegó al detalle `/agenda/tur-…` y el test
expiró esperando esa URL.

### Por qué pasaba (carrera de navegación del wizard)

El wizard de "Nuevo turno" tiene 3 pasos en **rutas dedicadas**; cada "Siguiente" hace
`router.navigateByUrl(...)` y luego `step.set(...)` (`appointment-create.component.ts`). El
estado vive en un singleton en memoria (`appointment-flow.service.ts`). Cuando Playwright
encadena clics muy rápido (`selectOption` → `fill` → slot → Siguiente → Siguiente → Confirmar),
existe una ventana en la que un click "Siguiente"/"Confirmar" se dispara **antes** de que el
paso comprometa su dato en el flow / antes de que el render del nuevo paso se asiente. Resultado:
se confirma con el flow vacío. Por timing, se reproducía con baja frecuencia y sensible al
viewport (de ahí "solo desktop").

Descartado bug de aislamiento por localStorage: Playwright crea un **contexto nuevo por test**,
así que cada test re-hidrata el seed fresco (`warmSeed`) y el slot elegido siempre está libre
dentro de una corrida. El disparador era la **carrera del wizard**, no estado persistido sucio.

## Reproducción

- `npx playwright test -g "UX-022"` en aislamiento: pasa (no encadena con otros tests → menos presión de timing).
- El fallo solo aparecía esporádicamente dentro de la suite completa. La firma exacta (resumen
  vacío en `/confirmar`) quedó capturada en el artefacto, lo que permitió diagnosticarlo sin
  depender de re-disparar la intermitencia.

## Corrección aplicada (solo el archivo de test)

Se reescribió UX-022 para **GATEAR cada transición** con aserciones web-first (auto-reintento),
de modo que el wizard no pueda avanzar/confirmar con datos sin comprometer:

1. **Paso 1:** tras elegir "Diego Sosa", se espera `is-selected` en la tarjeta del paciente antes de "Siguiente".
2. **Paso 2:** se valida que el slot esté `toBeEnabled()` (disponible), se hace clic y se espera
   `is-selected` en el slot (garantiza `flow.hora` comprometido) antes de "Siguiente".
3. **Paso 3 (gate clave):** se asserta que el resumen muestra `Diego Sosa` y `Dr. Juan Pablo Acuña`
   (resumen NO vacío) **antes** de "Confirmar turno". Esto elimina exactamente el modo de fallo
   observado (confirmar con resumen "— · —").
4. **Fecha determinista:** `2026-09-30` (lejana y única) → el slot está libre con cualquier seed,
   sin depender de estado previo ni colisionar con otros tests del archivo.
5. Verificaciones finales intactas: detalle nace `Confirmado`, `Avanzar estado` → `Atendiendo`,
   y **persiste** tras `page.reload()` real.

No se tocó código de la app (`src/**`), ni requirements/architecture/design-criteria. Solo el
archivo de test.

## Confirmación de estabilidad

| Corrida | Alcance | Projects | Resultado |
|---|---|---|---|
| `-g "UX-022" --repeat-each=3` | UX-022 aislado | desktop + mobile | 6/6 PASS |
| `UX-020-032-critical-flows` | archivo completo | desktop + mobile | 20/20 PASS |
| `-g "UX-022" --repeat-each=2` | UX-022 aislado | desktop + mobile | 4/4 PASS |

Total: **12 corridas verdes consecutivas de UX-022** en ambos projects + archivo completo
20/20 en contexto. UX-022 queda **PASA estable**.

## Resultados por Criterio

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| UX-022 | PASA (test estabilizado) | corridas verdes arriba; `error-context.md` documentó la causa raíz |

## Bugs Encontrados

Ninguno de producto. El avance de estado del turno funciona y persiste correctamente. El fallo
era de fiabilidad del test (carrera del wizard), ya corregido.

## Tests Generados / Modificados

- `e2e/tests/flow/UX-020-032-critical-flows.spec.ts` — test UX-022 reescrito (gates web-first + fecha determinista). Único archivo tocado.
