# Verificación 5a — Iteración 4 (Pacientes escritura + Tratamientos)

**Verificador**: plan-verifier
**Fecha**: 2026-06-02
**Contexto**: Post-Implementación Iteraciones (5a-verify) · Modo NORMAL
**Criterios en alcance**: REQ-173..185 + F01 · REQ-192..205 · REQ-267..270 (Épica 11 odontograma editable)
**Superficie de código revisada** (diff vs HEAD `6fdfc0a`, excl. `output/`):
- `src/app/features/patients/patient-create.component.ts` (M, +196/-59)
- `src/app/features/patients/patient-flow.service.ts` (NUEVO)
- `src/app/features/patients/patient-list.component.ts` (M)
- `src/app/features/patients/tabs/tab-odontogram.component.ts` (M)
- `src/app/features/treatments/treatments-home.component.ts` (M)
- `src/app/features/treatments/treatment-type-detail.component.ts` (M)
- `src/app/core/persistence/store.service.ts` (M, solo aditivo)
- `public/seed/manifest.json` (M — solo timestamp `generadoEn`, ver Nota Seed)
- Reutilizados sin cambio (ya implementados en It2, parte de la cadena editable): `tooth-detail.component.ts`, `tooth-state-selector.component.ts`, `patients.routes.ts`

---

## Criterios Cubiertos ✓

### Crear paciente (REQ-173..181)
- **REQ-173** (2 pasos, ruta dedicada c/u) → `patients.routes.ts:10-11` rutas reales `nuevo/datos` (data.step=1) y `nuevo/clinico` (data.step=2); `goStep2()` NAVEGA (`router.navigate(['/pacientes','nuevo','clinico'])`), no es `signal` local. Estado del wizard en `PatientFlowService` (singleton `providedIn:'root'`) → back del navegador preserva datos. Corrige el pseudo-stepper de la demo.
- **REQ-174** (datos personales incl. GÉNERO) → `<select id="c-genero">` con Femenino/Masculino (`patient-create.component.ts:54-58`); valor leído de `this.genero()` y enviado en payload `genero: this.genero()` (línea 305). **Ya NO hardcodeado a 'mujer'** en la escritura. (Nota: el default del signal es `'mujer'` solo como valor inicial del form, sobreescribible por el usuario.)
- **REQ-175** (Paso 2 clínicos + foto opcional) → obra social, profesional, alergias, medicación, observaciones + foto vía `<input type=file>` oculto + `FileReader.readAsDataURL` (`onPhoto`, línea 269-275) persistida como data URL en `fotoPath`.
- **REQ-176** (valida inline requeridos + formato DNI) → `dniValido()` (7-8 dígitos), `err()` muestra error junto al campo; `goStep2()` bloquea avance si `!step1Valido()`.
- **REQ-177** (Atrás preserva datos + Cancelar con confirmación) → `goStep1()` navega preservando (estado en singleton); `cancel()`→`requiereConfirmacion()` abre `confirm-dialog`.
- **REQ-178** (persiste + navega a ficha + toast) → `crearPaciente()` devuelve id, `router.navigate(['/pacientes',id])` + `toast.success('Paciente creado.')`.
- **REQ-179** (sin foto → placeholder iniciales) → `app-avatar` cae a iniciales con `fotoPath:''` (sin imagen rota).
- **REQ-180** (mobile 2 pasos) → `@media (max-width:767px)` form a 1 columna + botones `flex:1`; touch en controles del form.
- **REQ-181** (indicador de paso) → `app-stepper [steps]=['Datos personales','Datos clínicos'] [current]=step()`.

### Editar paciente + DIRTY-CHECK F01 (REQ-182..185)
- **REQ-182** (ruta dedicada, form precargado) → ruta `:id/editar` (data.edit=true); `hydrateFromPatient()` precarga todos los campos desde `patientEntity`. Entrada desde menú de ficha (`patient-detail.component.ts:77`).
- **REQ-183** (guardar valida + persiste + vuelve a ficha + toast) → `save()` rama edición: `editarPaciente()` + `toast.success('Cambios guardados.')` + navega a ficha.
- **REQ-184 / F01** (cancelar pide confirmación SOLO si hay cambios reales) → `estaSucio() = snapshot() !== baseline`. `baseline` se congela en el constructor (línea 210). En edición `requiereConfirmacion()` devuelve `estaSucio()` (NO `hasData()` — corrige el falso prompt previo). **Baseline RE-congelado tras guardar** (línea 313: `this.baseline = this.snapshot()`) → no prompt post-guardado. En crear, confirma si `wizardTieneDatos()` (ambos pasos).
- **REQ-185** (mobile editar) → mismo `@media` 1 columna + acciones accesibles.

### Tratamientos: lista de activos (REQ-192..197)
- **REQ-192** (5 columnas, 5ta = **Próxima fecha** prevista) → columna cambiada de badge `estado` a `proxima` "Próxima fecha" (`treatments-home.component.ts:101`); celda renderiza `t.proximaFecha` con ícono calendario, o "Sin fecha prevista" si vacío. `proximaFecha` proviene del seed original (`seed.generator.ts:259`) y se mapea view-time (`store.service.ts:229`). 5 columnas (paciente/tratamiento/profesional/etapas/próxima) — cumple el máximo del anti-patrón.
- **REQ-193** (único filtro principal = profesional) → `<select>` profesional visible; demás filtros fuera (sin regresión).
- **REQ-194** (fila clickeable → detalle plan) → `openPlan()` navega a `/pacientes/:id/plan/:id`.
- **REQ-195** (estado vacío) → rama `@else` con empty-state (preexistente, sin regresión).
- **REQ-196** (etapas legibles X/Y) → `{{ t.etapasCompletadas }}/{{ t.etapasTotales }}`.
- **REQ-197** (mobile + skeletons) → `@media (max-width:767px)` catálogo 1 col; skeletons preexistentes.

### Tratamientos: catálogo de tipos (REQ-198..201)
- **REQ-198** (cards aireadas con costo/duración) → `treatment-type-card` en grid (3/2/1 col responsive).
- **REQ-199** (≥12 tipos) → `AR_TREATMENT_TYPES` tt-01..tt-15 = 15 tipos (≥12 cumplido; los 15 listados en `TYPE_ESPECIALIDADES`).
- **REQ-200** (card clickeable → detalle) → navegación a `tipos/:id`.
- **REQ-201** (mobile 1-2 col) → grid responsive.

### Tratamientos: detalle de tipo (REQ-202..205)
- **REQ-202** (pasos, materiales, costo, duración, **profesionales habilitados REAL**) → `profesionales()` ahora usa `store.treatmentTypeProfessionals(id)` (derivado por especialidad: generalista siempre + especialista que matchea el tipo via mapa estático `TYPE_ESPECIALIDADES`). **Reemplaza** el `professionals().slice(0,4)` genérico previo. Muestra avatar-stack + lista nombre·especialidad. Garantiza ≥1 profesional.
- **REQ-203** (costo en ARS formateado) → `ars` pipe (preexistente).
- **REQ-204** (volver al catálogo) → back-link preexistente.
- **REQ-205** (mobile) → `@media (max-width:767px)` grid 1 col.

### Odontograma editable — Épica 11 (REQ-267..270)
- **REQ-267** (control 6 estados) → `tooth-state-selector` itera sobre `STATE_META` que define EXACTAMENTE los 6: sana, caries, obturación, ausente, en-tratamiento, prótesis (`odontogram.component.ts:6-12`). Radiogroup con `role=radio` + `aria-checked`.
- **REQ-268** (cambia, persiste, se refleja + `@defer on immediate` mobile deep-link) → `tooth-detail.save()` → `store.setToothState()` (map inmutable de la pieza, persiste con flag) + toast + navega al odontograma. Tab odontograma migrado de `@defer (on idle)` a **`@defer (on immediate)`** (`tab-odontogram.component.ts:29`) → hidratación determinista de las 32 piezas en deep-link/refresh/mobile (corrige BUG-E04 "fragile"). El SVG sigue aislado en chunk lazy (NFR-004 intacto), con placeholder/loading skeleton.
- **REQ-269** (coherencia con la ficha) → `setToothState` solo muta `piezas[].estado`; odontograma + leyenda quedan consistentes; no genera evento (no exigido).
- **REQ-270** (mobile selector ≥44px) → `.tss__opt { min-height: 44px }`; grid 2 col en `@media (max-width:767px)`, operable sin scroll horizontal.

---

## SEED SIN DRIFT — Verificación CRÍTICA (confirmado, con UNA salvedad documental)

**Confirmado byte-idéntico el STATE generado**:
1. **Fuentes del seed NO tocadas**: `git diff --name-only src/app/core/seed/` = VACÍO. `seed.generator.ts`, `prng.ts`, `ar-data.ts`, `manifest.loader.ts`, `tooth-names.ts` intactos.
2. **`store.service.ts` solo ADITIVO**: agrega `treatmentTypeProfessionals()` + mapa `TYPE_ESPECIALIDADES` (metadata de presentación consumida en la vista, NO entra en `StoreState`, NO llama `generateSeed`, NO consume el PRNG global de negocio). El diff NO introduce ningún `generateSeed`/`new Prng(SEED_ROOT)` para datos de negocio.
3. **Escrituras del usuario usan ids por timestamp (NO PRNG)**: `crearPaciente` → `pac-${Date.now().toString(36)}`; movimientos `mv-…`; notificaciones `not-…`; presupuestos/facturas `pre-/P-…`; todos `Date.now()`. `editarPaciente` = spread merge puro. `setToothState` = map puro de `estado`. `freshOdontogram()` (paciente nuevo) = 32 piezas determinísticas, todas "sana". → ninguna escritura toca el PRNG del seed.
4. **"Profesionales habilitados" es view-time**: `treatmentTypeProfessionals(id)` filtra `professionals()` por especialidad en el render del catálogo; no persiste nada. Self-report del Developer: hash de `StoreState` `f4a6…f1c1` idéntico antes/después.
5. **PRNG residual = separado y determinista** (preexistente de It2, NO tocado): `new Prng(SEED_ROOT ^ hashToothKey(...))` (historial de pieza, línea 305) y afiliado (línea 801) — sembrados por entidad, view-time, fuera del flujo de escritura del usuario.

**Salvedad documental (NO bloqueante, NO es drift)**: `public/seed/manifest.json` SÍ aparece modificado, pero el ÚNICO cambio es el campo `generadoEn` (timestamp `…16:49:58` → `…19:49:45`). Verificado que `generadoEn` es **metadata inerte**: `manifest.loader.ts` solo lee `data.pacientes.length` y los arrays de fotos/documentos — `generadoEn` NO se consume en ningún punto de la generación del seed (grep en `src/`). Por tanto el STATE resultante es byte-idéntico; pero el archivo `manifest.json` NO es literalmente byte-idéntico. El Developer evidentemente re-ejecutó `scripts/generate-manifest.mjs` (que reescribe el timestamp) aunque la lista de archivos no cambió. Recomendación menor: para futuras iteraciones, no re-generar `manifest.json` si la lista de imágenes no cambió, o hacer el timestamp determinista, para que la afirmación "manifest byte-idéntico" sea literal. No afecta cobertura ni introduce drift de datos.

---

## Scope Creep (sin requirement asociado)
- **Ninguno.** Toda la superficie de código mapea a REQ del alcance. `patient-flow.service.ts` es soporte estructural de REQ-173/177 (no es feature nueva). `TYPE_ESPECIALIDADES` es soporte de REQ-202.

## Criterios SIN Cobertura ✗
- **Ninguno** en el alcance de la Iteración 4.

## Notas para QA (5e) — fuera del alcance de 5a (no bloquean este gate)
- 5a verifica COBERTURA DE CÓDIGO de los REQ; la verificación de tests automatizados (`.spec.ts` por criterio, resultado PASA/FALLA, deep-link mobile real renderizando 32 piezas, persistencia tras reload) corresponde a QA (5e) y al gate 5e-verify.
- Puntos calientes sugeridos para 5e: REQ-268 deep-link mobile a `/odontograma` (regresión BUG-E04, contar 32 piezas tras `@defer on immediate`); REQ-184/F01 (editar sin cambios → NO prompt; con cambios → prompt; tras guardar → NO prompt); REQ-174 (crear paciente "hombre" → ficha refleja Masculino, no todos mujer); REQ-192 (columna "Próxima fecha" con dato real y caso "Sin fecha prevista").

---

## Resultado: PASA (0 criterios sin cobertura)
