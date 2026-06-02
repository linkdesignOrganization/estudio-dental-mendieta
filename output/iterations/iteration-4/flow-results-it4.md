# Resultados — Flow Tester · Iteración 4 (Pacientes escritura + Tratamientos) · Ronda 1

- **Sitio testeado**: https://happy-coast-044ea7e0f.7.azurestaticapps.net (SWA desplegado — NUNCA localhost)
- **Bundle**: `main-YIQ6IJV4.js` (deploy 5d verificado por el PM)
- **Projects ejecutados**: `desktop-chromium` (1280×900) + `mobile-chromium` (Pixel 5 ~393px)
- **Estabilidad**: **2 corridas consecutivas verdes** en AMBOS projects → **36/36 passed** cada una (sin flakiness). Reutiliza `playwright.config.ts` + helpers `tests/_helpers/seed.ts` (`gotoApp`, `warmSeed`, `readState`, `resetSeed`).
- **Idempotencia**: los specs que MUTAN `localStorage` (crear paciente, editar+guardar, cambiar estado de pieza) llaman `resetSeed()` en `afterEach` → re-hidratan el seed byte-idéntico, sin arrastre entre tests.

## Resultados por Criterio

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| REQ-173 (2 rutas dedicadas crear: /nuevo/datos ↔ /nuevo/clinico + Atrás preserva) | **PASA** | `e2e/evidence/flow-it4/REQ-174-crear-paso1-genero-masculino.png` · test `REQ-173-179...:48` |
| REQ-174 (selector de GÉNERO real → ficha Masculino, NO hardcode 'mujer') | **PASA** | `REQ-174-178-ficha-creada-masculino.png` (subtítulo "· Masculino ·" + card Género "Masculino") |
| REQ-178 (persiste paciente nuevo + navega a ficha + sobrevive refresh real) | **PASA** | `REQ-174-178-ficha-creada-masculino.png` · conteo `patients` +1 · test `:81` y `:142` |
| REQ-179 (sin foto → avatar a iniciales, sin imagen rota) | **PASA** | avatar "JM" en `REQ-174-178-ficha-creada-masculino.png`; 0 `<img>` rotas aseveradas |
| REQ-182 (ruta /editar precargada con datos actuales) | **PASA** | test `REQ-182-184...:51` (Mateo Gómez, DNI/tel/género precargados) |
| REQ-183 (Guardar cambios valida+persiste+ficha+refresh real) | **PASA** | test `:68` (teléfono editado persiste tras reload) |
| REQ-184 / F01 — rama 1 (cancelar SIN cambios → directo, sin diálogo) | **PASA** | test `:91` |
| REQ-184 / F01 — rama 2 (cancelar CON cambios → diálogo "Tenés datos cargados. ¿Querés descartar y salir?") | **PASA** | `REQ-184-F01-dialogo-descarte-dirty-check.png` · test `:108` (ambas sub-ramas: "Seguir editando" aborta / "Sí, descartar" ejecuta) |
| REQ-184 / F01 — rama 3 (tras Guardar el baseline se re-congela → cancelar luego no pide descartar) | **PASA** | test `:145` |
| REQ-267 (selector ofrece LOS 6 estados: Sana/Caries/Obturación/Ausente/En tratamiento/Prótesis) | **PASA** | `REQ-267-selector-6-estados-pieza.png` · test `REQ-267-269...:46` (radiogroup, 6 radios) |
| REQ-268 (cambiar estado + Guardar → persiste tras HARD reload + refleja en odontograma; @defer on immediate / regresión BUG-E04; deep-link mobile 32 piezas) | **PASA** | test `:76` (pieza Sana→Obturación, persiste tras `reload({domcontentloaded})`, 32 piezas web-first) y `:119` (deep-link directo hidrata 32) |
| REQ-269 (coherencia con la ficha: "Estado actual" del detalle alineado con el diagrama) | **PASA** | test `:76` (deep-link a /pieza/:fdi confirma "Estado actual: Obturación" + radio marcado) |
| REQ-192 (5 columnas, 5.ª = "Próxima fecha" con dato real) | **PASA** | `REQ-192-lista-tratamientos-proxima-fecha.png` · test `REQ-192-196...:49` |
| REQ-193 (único filtro = profesional; acota la lista) | **PASA** | test `:91` (filtro por Dra. Carolina Etcheverry → todas las filas son suyas) |
| REQ-194 (fila → detalle del plan en la ficha del paciente) | **PASA** | test `:121` (→ `/pacientes/:id/plan/tra-xxx`) |
| REQ-196 (etapas X/Y legibles) | **PASA** | test `:49` (regex `^\d+/\d+$` por fila) |
| REQ-202 (detalle tipo: pasos/materiales/costo/duración + profesionales habilitados REAL por especialidad) | **PASA** | `REQ-202-detalle-tipo-profesionales-habilitados.png` · tests `:44`, `:73`, `:91` |
| REQ-204 (back-link vuelve al catálogo /tratamientos) | **PASA** | test `:105` |

**Cobertura: 18/18 criterios asignados PASAN.** 0 BLOQUEADOS. 0 FALLA.

## Bugs Encontrados

**Ninguno.** Todos los criterios asignados se comportan según el criterio de aceptación. No se reportan BUG-Fxx esta ronda.

## Hallazgos honestos (aserciones ajustadas al comportamiento REAL del producto)

Ninguno es un bug; son precisiones donde la realidad del deploy difería de supuestos del plan/plan-verifier. Las aserciones se escribieron sobre el comportamiento REAL observado en vivo:

1. **REQ-184 / F01 — destino del descarte en EDICIÓN.** El plan asumía que "Sí, descartar" vuelve a la lista. El comportamiento REAL (verificado en vivo y en código `doCancel()`): al descartar una **edición** se vuelve a la **ficha del paciente** (`/pacientes/:id/informacion`), no a `/pacientes` — coherente (descartás los cambios y seguís viendo a ese paciente). El descarte del **alta** sí va a `/pacientes`. El test asevera el destino real por flujo. Además, la acción "Cancelar" del editor es el **back-link superior "Pacientes"** (button que dispara `cancel()`), no un botón literal "Cancelar".

2. **REQ-192 — formato de "Próxima fecha".** El plan anticipaba `dd/mm/aaaa`. El formato REAL del producto (`formatShortDate`) es **corto: "Jue 25 jun"** (DiaCorto día mesCorto). El test asevera el formato real (regex `(Dom|Lun|...|Sáb) \d{1,2} (ene|...|dic)`), no el supuesto.

3. **REQ-192 — caso "Sin fecha prevista" NO alcanzable en la vista de activos.** La lista de activos excluye los planes completados (`estado !== 'completado'`), y en el seed SOLO los completados tienen `proximaFecha` vacía. Por tanto "Sin fecha prevista" no aparece en esta vista con el seed actual (source-verified, no es un agujero de cobertura). El test asevera que TODA fila activa trae una fecha real y que el placeholder NO aparece. El estado vacío del FILTRO sin resultados (REQ-195) lo cubre el edge-case-tester.

4. **REQ-202 — profesionales derivados por especialidad (confirmado real, no `slice(0,4)`).** Verificado con dos tipos distintos que devuelven conjuntos distintos: `tt-15` Odontopediatría → Dra. Soledad Russo (Odontología general) + Dr. Federico Salinas (Odontopediatría); `tt-04` Tratamiento de conducto → Dra. Soledad Russo + Dr. Martín Aguilera (Endodoncia). `tt-01` sin especialidad mapeada → solo el generalista (garantía ≥1).

## Tests Generados (.spec.ts en e2e/tests/flow/)

- `e2e/tests/flow/REQ-173-179-crear-paciente-genero.spec.ts` — REQ-173/174/178/179 (3 tests)
- `e2e/tests/flow/REQ-182-184-editar-paciente-dirty-check.spec.ts` — REQ-182/183/184·F01 (5 tests, las 3 ramas del dirty-check)
- `e2e/tests/flow/REQ-267-269-odontograma-editable.spec.ts` — REQ-267/268/269 (3 tests, 6 estados + hard-reload + deep-link mobile 32 piezas)
- `e2e/tests/flow/REQ-192-196-tratamientos-lista.spec.ts` — REQ-192/193/194/196 (3 tests)
- `e2e/tests/flow/REQ-202-204-tipo-tratamiento-detalle.spec.ts` — REQ-202/204 (4 tests, derivación por especialidad)

**Total: 5 archivos, 18 tests × 2 projects = 36 ejecuciones, 36/36 verdes (×2 corridas).**

## Evidencia / GIFs de Flujos

Los GIFs solicitados se documentan como secuencias de capturas de los hitos del flujo (la grabación de video de Playwright es `retain-on-failure` y no produce artefacto en pasada verde; los hitos quedan en PNG):

- **Crear paciente "hombre" con género** (datos → clínico → ficha Masculino):
  - `e2e/evidence/flow-it4/REQ-174-crear-paso1-genero-masculino.png` (Paso 1, género Masculino elegido)
  - `e2e/evidence/flow-it4/REQ-174-178-ficha-creada-masculino.png` (ficha creada, "· Masculino ·" + card Género)
- **Cambiar el estado de una pieza** (pieza → selector 6 estados → Guardar → odontograma reflejado):
  - `e2e/evidence/flow-it4/REQ-267-selector-6-estados-pieza.png` (radiogroup con los 6 estados)
  - (la persistencia tras hard-reload + reflejo en el diagrama está aseverada en el test `REQ-267-269...:76`)
- **Dirty-check (F01)**: `e2e/evidence/flow-it4/REQ-184-F01-dialogo-descarte-dirty-check.png`
- **Lista de tratamientos (Próxima fecha)**: `e2e/evidence/flow-it4/REQ-192-lista-tratamientos-proxima-fecha.png`
- **Detalle de tipo (profesionales habilitados reales)**: `e2e/evidence/flow-it4/REQ-202-detalle-tipo-profesionales-habilitados.png`
