# Flow Coverage — Cierre (UX multi-paso) · Flow Tester

> Cierre de cobertura solicitado por el plan-verifier (`verification-4f.md` §5c): generar
> `.spec.ts` DEDICADOS para los 9 UX multi-paso/transversales que estaban "PASA" en prosa
> pero sin test propio. Todo testeado contra el SITIO DESPLEGADO
> `https://happy-coast-044ea7e0f.7.azurestaticapps.net` (ambos projects: desktop-chromium + mobile-chromium).
> Se reutilizó `playwright.config.ts` y los helpers de `tests/_helpers/seed.ts`. Solo se tocaron archivos de test.

## Archivo generado
- `e2e/tests/flow/UX-multipaso-cierre.spec.ts` — **18 bloques `test()`** que cubren los **9 criterios**
  pedidos (UX-023, UX-024, UX-025, UX-029, UX-030, UX-033, UX-040, UX-042, UX-053).
- Resultado de ejecución del archivo: **36 passed / 0 failed** (18 tests × 2 projects).

## Resultados por Criterio

| Criterio | Escenario real navegado | Estado | Tests (.spec.ts) |
|----------|-------------------------|--------|------------------|
| **UX-023** Cancelar turno | Confirmación explícita + EJECUCIÓN ("Sí, cancelar") → badge "Cancelado", acciones terminales deshabilitadas, persiste tras refresh real. Rama "Volver" aborta. | **PASA** | 2 |
| **UX-024** Crear paciente (2 pasos) | Stepper "Paso N de 2"; "Atrás" PRESERVA el Paso 1; requeridos bloquean avance; "Crear paciente" persiste, navega a la ficha nueva, avatar a INICIALES (sin imagen rota). | **PASA** | 3 |
| **UX-025** Editar paciente | Form PRECARGADO con datos actuales; "Guardar cambios" persiste el dato editado y sobrevive refresh real. | **PASA (parcial — ver nota)** | 2 |
| **UX-029** Crear presupuesto (3 pasos) | Stepper "Paso N de 3"; TOTAL calculado automáticamente; "Atrás" conserva los tratamientos; "Crear presupuesto" persiste y navega al detalle. | **PASA (con hallazgo — ver nota)** | 2 |
| **UX-030** Aprobar presupuesto | "Aprobar" en pendiente → badge "Aprobado" persiste; ya aprobado/vencido NO ofrece aprobar de nuevo (no 2x). | **PASA** | 2 |
| **UX-033** Eliminar paciente | Menú ⋯ → "Eliminar" → confirmación ("no se puede deshacer") → "Sí, eliminar" navega a `/pacientes`, conteo decrece. Rama "Cancelar" aborta. | **PASA** | 2 |
| **UX-040** Transversal — Carga | Contrato anti-spinner en recorrido de flujos con contenido diferido (`@defer`): cero spinners; el diferido (odontograma) SÍ hidrata (32 piezas). | **PASA (alcance acotado — ver nota)** | 1 |
| **UX-042** Transversal — Error | id/ruta inexistente por entidad (paciente/turno/presupuesto/obra social) → pantalla "no encontrado" ESPECÍFICA, sin crash ni lenguaje de mock; retorno funcional. | **PASA (alcance acotado — ver nota)** | 2 |
| **UX-053** Reportes — Datos / Vacío | Dashboard SIEMPRE con datos calculados (6 KPIs + montos ARS), sin vacío global; los 4 reportes detallados renderizan sus 3 charts (figuras) sin crash. | **PASA (alcance acotado — ver nota)** | 2 |

**9/9 criterios cubiertos con .spec.ts dedicado.** 0 BLOQUEADOS.

## Hallazgos (honestidad sobre la demo)

Ninguno de los 9 resultó un shell vacío: **UX-024 y UX-029 son flujos COMPLETOS** en la demo (persisten
un recurso nuevo con id generado — `pac-…` / `pre-…`), no meros shells navegables como anticipaba el brief.
Los tests verifican esa persistencia real (conteo del store + navegación al recurso nuevo).

### HALLAZGO-F01 (severidad baja) — UX-025: la demo no expone "Cancelar con confirmación de descarte"
- **Criterio UX-025**: además de "Guardar cambios", pide un botón **"Cancelar"** que, con cambios pendientes,
  pida confirmación ("¿Descartar los cambios?…") y vuelva sin alterar.
- **Real en la demo**: `/pacientes/:id/editar` solo ofrece el breadcrumb "Pacientes" + "Guardar cambios".
  No hay botón "Cancelar" ni diálogo de descarte en ESTA pantalla.
- **Nota**: el patrón de descarte SÍ existe y está cubierto en otra pantalla análoga (descartar un pago con
  datos cargados → confirm-dialog "Descartar el pago", ver `DC-120-143-feedback.spec.ts` DC-142). Para la
  ficha de edición de paciente queda como **FASE 5** (funcionalidad de edición completa). Se testeó lo que SÍ
  aplica hoy: precarga + guardar persiste.

### HALLAZGO-F02 (severidad baja) — UX-029: "Atrás" no repuebla el paciente del Paso 1
- **Criterio UX-029**: `"Atrás" preserva datos`.
- **Real en la demo**: al volver del Paso 2 al Paso 1 del wizard de presupuesto, el `<select>` de Paciente
  vuelve a "Elegí un paciente" (no se repuebla); hay que re-elegirlo para volver a avanzar. En cambio, la
  **selección de tratamientos del Paso 2 SÍ se conserva** (el total queda intacto y los checkboxes siguen
  marcados al re-entrar). El wizard de **crear paciente (UX-024) SÍ preserva** su Paso 1 — la inconsistencia es
  solo del wizard de presupuesto.
- **Impacto demo**: bajo (el flujo se completa; solo molesta re-elegir el paciente). El test asserta el
  comportamiento REAL (tratamientos preservados; paciente re-seleccionado), sin afirmar una preservación que la
  demo no hace. Recomendado para pulido en FASE 5.

## Criterios con alcance acotado (documentado, no es falla)

- **UX-040 (aspecto del skeleton)**: el skeleton de carga es **transitorio y no-determinista** — las listas
  hidratan SÍNCRONAS desde localStorage (sin ventana observable de skeleton) y el contenido diferido usa
  `@defer (on idle)` (instante no-determinista). Lo verificable de extremo a extremo es el **contrato "nunca
  spinners"** + que el contenido diferido sí termina renderizando. El aspecto fino del skeleton (forma de
  avatar/líneas, stagger) descansa en verificación visual (cubierto por el equipo Visual en
  `DC-100-119-ui-states.spec.ts` / `DC-120-143-feedback.spec.ts`, que también asserta el "cero spinners").
- **UX-042 (toast de error de carga/persistencia)**: NO alcanzable por UI — la app es **offline-first**
  (estado en localStorage), no hay ruta que dispare un error de runtime de carga/persistencia para ver el toast
  coral de reintento. Se testeó la parte ALCANZABLE y de mayor valor de demo: la pantalla "no encontrado"
  específica por entidad (4 entidades), sin crash ni mock. La parte del toast de error queda source-verified.
- **UX-053 ("Sin datos suficientes para este gráfico")**: NO alcanzable con el seed — los 4 reportes detallados
  tienen datos en todos sus charts (12 gráficos verificados con figura). El copy del empty por-gráfico está
  source-verified pero no es disparable por UI con el seed poblado (mismo criterio que los empties de
  presupuestos/facturas en `UX-041-052-estados-vacios.spec.ts`). Se testeó el camino real: datos calculados en
  el dashboard + charts renderizados sin crash.

## Tests Generados
- `e2e/tests/flow/UX-multipaso-cierre.spec.ts`
  - UX-023: cancelar turno — confirmación + "Sí, cancelar" persiste el estado Cancelado
  - UX-023: "Volver" en la confirmación NO cancela el turno
  - UX-024: crear paciente — "Atrás" preserva los datos del Paso 1
  - UX-024: el Paso 1 no avanza sin los datos requeridos
  - UX-024: crear paciente end-to-end persiste, navega a la ficha y usa avatar a iniciales
  - UX-025: editar paciente — el formulario llega precargado con los datos actuales
  - UX-025: "Guardar cambios" persiste el dato editado (refresh real)
  - UX-029: crear presupuesto — total auto-calculado y "Atrás" preserva los tratamientos
  - UX-029: crear presupuesto end-to-end persiste y navega al detalle
  - UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo
  - UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar
  - UX-033: eliminar paciente — confirmación + "Sí, eliminar" navega a la lista y decrece el conteo
  - UX-033: "Cancelar" en la confirmación NO elimina el paciente
  - UX-040: carga transversal sin spinners en un recorrido de flujos (loading vía skeleton/@defer)
  - UX-042: id inexistente por entidad muestra "no encontrado" específico, sin crash ni mock
  - UX-042: desde "paciente no encontrado" el retorno lleva a la lista real
  - UX-053: el dashboard de reportes muestra datos calculados (sin estado vacío global)
  - UX-053: los reportes detallados renderizan sus charts con datos, sin crash

## Ejecución
- `npx playwright test tests/flow/UX-multipaso-cierre.spec.ts` (desde `e2e/`, ambos projects): **36 passed / 0 failed**.
- Suite completa (regresión, ambos projects, `npx playwright test`): **480 passed / 0 failed** (exit 0, 37.4 min).
  El archivo nuevo (36 tests) convive sin regresiones con los 21 specs existentes (444 → 480).
- 0 `.only` / 0 `.fixme` / 0 `.skip` en el archivo de cierre.
