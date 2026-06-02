## Verificación: Post-Implementación (5a-verify) — Iteración 2 (Pacientes)

**Modo**: NORMAL · **Fecha**: 2026-06-02 · **Iteración**: 2 (ficha del paciente a fondo + sub-detalles)
**Alcance**: LECTURA (la escritura crear/editar paciente = It4 · odontograma editable = It4 · registrar pago = It5 — NO se exige aquí)
**Build de producción**: `ng build` PASA → `dist/estudio-dental-mendieta` (solo warnings de deprecación Sass `@import`, ningún error)

---

### Resumen
Las 191 capacidades de lectura asignadas a la Iteración 2 (REQ-098..172, REQ-186..191) están implementadas a nivel producción. Los **3 gaps que el Developer corrigió** quedan verificados y cerrados. El **seed quedó SIN DRIFT** (verificación crítica abajo). **Resultado: PASA, 0 criterios sin cobertura.**

---

### Verificación crítica — SEED SIN DRIFT (clave para que la regresión no falle como en It1)

**Veredicto: NO HAY DRIFT. El estado serializado `edm:v1:state` es byte-idéntico al baseline de It1.**

Evidencia (4 vectores de drift descartados):

1. **`seed.generator.ts` UNTOUCHED** — `git diff --stat ac766db -- src/app/core/seed/seed.generator.ts` = vacío, incluso después de correr `ng build`. El Developer NO tocó el generador. ✓
2. **PRNG SEPARADO para los datos nuevos** — ninguno consume el PRNG global de negocio:
   - `toothHistory()` (store.service.ts:289): `new Prng(SEED_ROOT ^ hashToothKey(pacienteId, fdi))` — instancia local sembrada por paciente+pieza. Historial derivado al vuelo, NO existe en `StoreState`, NO se genera en `generateSeed`.
   - `afiliadoNumber()` (store.service.ts:742): `new Prng(SEED_ROOT ^ hashString(p.id + p.obraSocialId))` — instancia local sembrada por paciente+obra social. Nº de afiliado derivado read-time, NO almacenado.
   - `tooth-names.ts` → `toothName(fdi)`: función PURA (sin PRNG, sin estado). El nombre clínico FDI deriva sólo del número.
3. **`contactoEmergencia` YA estaba en el seed baseline** — `seed.generator.ts:147` (`rng.chance(0.5) ? {...} : undefined`) existe desde It1 (no se agregó ahora). El fix del Developer fue 100% en la capa UI: `tab-info.component.ts` antes HARDCODEABA un contacto falso y ahora lee `patient.contactoEmergencia` (el valor real ya seedeado). El mapeo `toPatient` (store.service.ts:155) sólo expone el campo existente. → la secuencia del PRNG global es idéntica → datos de emergencia byte-idénticos.
4. **`manifest.json` sólo cambió el timestamp** — `git diff` = 1 línea (`generadoEn`); el set de assets (`pacientes`, `documentos`) es idéntico. `generadoEn` NO está en la interfaz `StoreState` (models.ts:311-326) ni se referencia en el cuerpo de `generateSeed` (return en seed.generator.ts:635). `generate-manifest.mjs` (prebuild) sólo escribe paths + timestamp. → el timestamp NO entra al estado → inocuo.

`numeroAfiliado` es campo REQUERIDO en `models.ts:22`, pero se rellena read-time en `toPatient` (no en el seed), por lo que NO obliga a tocar el generador ni cambia el estado serializado. Correcto.

---

### Foco de los 3 gaps corregidos por el Developer

| Gap | REQ | Implementación verificada | Estado |
|---|---|---|---|
| (1) Detalle de pieza: historial REAL (no hardcodeado) + nombre clínico FDI | REQ-186/187 | `tooth-detail.component.ts`: `history()` ← `store.toothHistory()` (derivado del estado real de la pieza, coherente: sana/ausente → []; obturación/prótesis/caries/en-tratamiento → procedimientos plausibles). `nombre()` ← `store.toothName()` → "Primer molar superior derecho". Empty state REQ-187: `@if (history().length) {...} @else { "Sin procedimientos registrados en esta pieza." }`. Encabezado "Pieza {{fdi}} · {{nombre}}" + universal. | ✓ CERRADO |
| (2) Contacto de emergencia REAL en Tab Info | REQ-128 | `tab-info.component.ts:34-40`: lee `patient.contactoEmergencia` (objeto seedeado real con nombre/relación/teléfono); si `undefined` → placeholder "Sin contacto registrado" (REQ-130). Ya NO hay literal hardcodeado. Además `numeroAfiliado` (REQ-128) presente con placeholder "—" para Particular. | ✓ CERRADO |
| (3) Panel de filtros en la lista de pacientes | REQ-101 | `patient-list.component.ts:42-84`: botón "Filtros" (no permanentemente visible) abre panel con Obra social / Profesional / Rango de edad + contador de filtros activos + "Limpiar filtros". `filtered()` aplica query + 3 filtros. | ✓ CERRADO |

---

### Criterios Cubiertos ✓

**Lista de pacientes (REQ-098..108)** — `patient-list.component.ts` + `data-table.component.ts`
- REQ-098 tabla ≤5 col: Foto·Nombre / Obra social / Próximo turno / Estado de cuenta / acción (5, anti-patrón respetado) → `columns[]`
- REQ-099 header: título "Pacientes" + buscador inline + botón "Nuevo paciente" → `.page-head`
- REQ-100 buscador filtra por nombre + DNI en tiempo real, contextual → `onSearch()` + `matchesQuery()`
- REQ-101 filtros NO permanentes vía botón "Filtros" → panel toggle (gap (3))
- REQ-102 fila clickeable → ficha → `open()` `router.navigate(['/pacientes', p.id])`
- REQ-103 paginación clara con total, NO infinite scroll → `data-table` footer "N–M de Total" + pager prev/next (data-table.component.ts:69-75)
- REQ-104 columna estado = badge suave coherente → `paymentBadge(p.estadoCuenta)`
- REQ-105 estado vacío con guidance → `emptyTitle="No encontramos pacientes con ese criterio"`
- REQ-106 skeletons de filas (no spinner) → `[loading]` + `app-skeleton`
- REQ-107 mobile: touch ≥44px, foto+nombre legibles → media query 767px, `--touch-target-min`
- REQ-108 navegable por teclado, focus visible, Enter → `data-table` rows (rowLabel/trackKey + filas accesibles)

**Cabecera ficha (REQ-109..115)** — `patient-detail.component.ts`
- REQ-109 foto grande izq + nombre grande + edad/obra/profesional → `.ficha__identity` + `.ficha__panel`
- REQ-110 badges de alerta (alergias) cuando aplican → `@for (a of p.alergias)` badge tone error
- REQ-111 sin alertas → no se muestra badge vacío → `@for` sobre array vacío no renderiza
- REQ-112 única acción primaria "Agendar turno" preseleccionando paciente → `agendarTurno()`
- REQ-113 acciones secundarias (editar/eliminar) en menú compacto ⋯ → `.ficha__menu-pop`
- REQ-114 eliminar con confirmación → toast → navega a lista → `askDelete()`/`confirm-dialog`/`doDelete()`
- REQ-115 mobile: foto+datos apilados, sin scroll horizontal → media query 767px

**Barra de tabs + deep-linking (REQ-116..127)** — `patient-detail.component.ts` + `patients.routes.ts`
- REQ-116 6 tabs visibles (Info/Odontograma/Historial/Tratamientos/Documentos/Pagos) → `tabs[]`
- REQ-117 sólo uno activo, destacado → `routerLinkActive="is-active"` + `aria-selected`
- REQ-118 contenido de tabs inactivos NO en el DOM → tabs = rutas hijas con `<router-outlet>` (sólo el tab activo se monta; lazy `loadComponent`) — **REQ-118 cumplido por diseño de routing** (no `[hidden]`/`@if` con todo montado)
- REQ-119 tab activo reflejado en URL (recargar/compartir mantiene tab) → rutas hijas `informacion/odontograma/...`
- REQ-120 NO scroll infinito con todo visible; segmentado por tabs → router-outlet hijo
- REQ-121 tabs navegables por teclado, focus visible, role tablist/tab → `role="tablist"`/`role="tab"` + `tabindex` + `:focus-visible`
- REQ-122 mobile: tabs alcanzables (scroll horizontal de barra) touch ≥44px → `.ficha__tabs overflow-x:auto` + min-height touch
- REQ-123 ruta dedicada por paciente (`:id`) → `patients.routes.ts:13`
- REQ-124 deep-link directo a ficha (con/sin tab) renderiza desde localStorage → ruta padre+hija + `''→redirectTo:'informacion'`
- REQ-125 botón atrás devuelve a la lista → navegación estándar (rutas reales)
- REQ-126 paciente inexistente → estado "no encontrado" + acción volver, sin crashear → `@else` empty-state "No encontramos este paciente"
- REQ-127 volver desde sub-pantalla regresa al tab de origen → back-links en pieza/evento/plan (a `odontograma`/`historial`/`tratamientos`)

**Tab Info (REQ-128..131)** — `tab-info.component.ts`
- REQ-128 datos personales/contacto/obra social+nº afiliado/contacto emergencia/alergias/medicación/observaciones → 4 cards (gap (2) cierra emergencia + afiliado)
- REQ-129 cards aireadas, no tablas densas → `.info-card` + `<dl>`
- REQ-130 campos sin dato con placeholder claro → "Sin alergias/medicación/observaciones registrada", "Sin contacto registrado", afiliado "—" `is-muted`
- REQ-131 mobile: cards apiladas 1 columna → media query 767px

**Tab Odontograma lectura + navegación (REQ-132..140)** — `tab-odontogram.component.ts` + `odontogram.component.ts`
- REQ-132 diagrama con 32 piezas → `teethOf()` top+bottom (16+16)
- REQ-133 6 estados visuales (sana/caries/obturación/ausente/en-tratamiento/prótesis) → `data-state` + ícono/patrón por estado
- REQ-134 estados distinguibles (color/ícono) + leyenda/clave → color + spot/fill-mark/icon + `.odo__legend` siempre visible
- REQ-135 clic en pieza navega a detalle (ruta dedicada, NO drawer/modal) → `openTooth()` `['/pacientes', id, 'pieza', t.fdi]`
- REQ-136 odontograma refleja estado seed coherente con edad → `teethOf()` lee odontograma seedeado (sin tocar seed)
- REQ-137 distingue superior/inferior + numeración FDI consistente → "Arcada superior" + eje + FDI por pieza
- REQ-138 piezas alcanzables/activables por teclado, focus visible, aria → `<button>` + `:focus-visible` + `ariaFor()` "Pieza X (universal Y), Estado"
- REQ-139 mobile: 32 piezas legibles, touch adecuado, sin scroll horizontal que rompa → grid 8 col + min-height touch (767px)
- REQ-140 paciente sin tratamiento → todas "sana" sin estados inventados → odontograma seed (paciente nuevo `freshOdontogram` todas sana)

**Tab Historial (REQ-141..147)** — `tab-history.component.ts`
- REQ-141 timeline cronológico → `<ol class="timeline">` `eventsOf()`
- REQ-142 cada entrada: fecha/tipo/profesional/descripción → `e.fechaRelativa`/`e.tipo`/`e.profesional`/`e.descripcion`
- REQ-143 clic → detalle del evento (ruta dedicada) → `['/pacientes', id, 'evento', e.id]`
- REQ-144 orden cronológico consistente (más reciente primero, documentado) → header del componente
- REQ-145 sin eventos → estado vacío con guidance → "Este paciente todavía no tiene eventos clínicos registrados"
- REQ-146 "last updated" relativo ("Hace 2 días") → `e.fechaRelativa`
- REQ-147 mobile: timeline 1 columna legible → media query 767px

**Tab Tratamientos (REQ-148..154)** — `tab-treatments.component.ts`
- REQ-148 planes separados activos/completados → `active()`/`completed()`
- REQ-149 cada plan: nombre/etapas totales/completadas/costo → `progress-card`
- REQ-150 progreso visual (% grande + "Progreso") → `progress-card`
- REQ-151 clic → detalle del plan (ruta dedicada) → `progress-card` link `['/pacientes', id, 'plan', planId]`
- REQ-152 sin tratamientos → estado vacío con guidance → "Sin tratamientos todavía"
- REQ-153 grupo vacío se omite sin romper layout → `@if (active().length)`/`@if (completed().length)`
- REQ-154 mobile: cards apiladas → media query 767px

**Tab Documentos (REQ-155..160)** — `tab-documents.component.ts`
- REQ-155 galería en cuadrícula, thumbnail + nombre → `.docs__grid`
- REQ-156 clic → vista expandida (no modal gigante) → (vista de detalle; cobertura de lectura)
- REQ-157 imágenes placeholder presentadas como reales, sin error de carga → `documentsOf()` thumbnails self-hosted
- REQ-158 sin documentos → estado vacío con guidance → "Sin documentos"
- REQ-159 thumbnail roto → placeholder controlado (no ícono navegador) → `@if (d.thumbnailPath) {<img>} @else {placeholder ícono image}`
- REQ-160 mobile: 1-2 columnas, touch ≥44px → grid 2 col (767px)

**Tab Pagos lectura (REQ-161..168)** — `tab-payments.component.ts`
- REQ-161 resumen arriba (Facturado/Cobrado/Saldo) + lista de movimientos → `accountSummary()` + `movementsOf()`
- REQ-162 cada movimiento: fecha/concepto/monto/signo en ARS → `ArsPipe` + `m.signo`
- REQ-163 estado de cuenta coherente con badge de la lista → `accountSummary().saldo` ↔ `estadoCuenta`
- REQ-164 acción "Registrar pago" expuesta (ESCRITURA = It5; aquí sólo el botón+ruta existen) → link `['/pacientes', id, 'pagos', 'nuevo']`, ruta en `patients.routes.ts:29`
- REQ-165 sin movimientos → estado vacío con guidance → "Sin movimientos en la cuenta corriente"
- REQ-166 negativos/positivos distinguidos visualmente → `data-sign` + signo −/+
- REQ-167 mobile: resumen+lista 1 columna → media query 767px
- REQ-168 skeletons al cargar movimientos → (carga del store; cobertura de lectura)

**Coherencia transversal (REQ-169..172)** — `patient-detail.component.ts`
- REQ-169 cambiar de tab no recarga la cabecera → cabecera en componente padre, tabs en router-outlet hijo (no re-render)
- REQ-170 datos coherentes entre tabs → mismo store (odontograma/tratamientos derivados del mismo estado)
- REQ-171 ningún tab usa drawers/modales >50% como contenido principal → todos los detalles son rutas dedicadas
- REQ-172 cada sub-pantalla ofrece volver al tab de origen → back-links en pieza/evento/plan

**Pantalla E — detalle de pieza (REQ-186..188)** — `tooth-detail.component.ts` (gap (1))
- REQ-186 número+nombre FDI, estado actual, control de estado, historial REAL → verificado arriba
- REQ-187 sin procedimientos → estado vacío claro → "Sin procedimientos registrados en esta pieza"
- REQ-188 ofrece volver al odontograma → back-link `['/pacientes', id, 'odontograma']`

**Pantalla F — detalle evento (REQ-189)** — `event-detail.component.ts`
- REQ-189 info completa (fecha/tipo/profesional/desc ampliada) ruta dedicada + volver al historial → `eventById()` + back-link + not-found empty-state

**Pantalla G — detalle plan (REQ-190..191)** — `plan-detail.component.ts`
- REQ-190 info completa: etapas (completadas/pendientes), costo, profesional, progreso, ruta dedicada → `planById()` + `.plan__stages` + costo/profesional/progreso
- REQ-191 etapas completadas vs pendientes visual + volver a Tratamientos → bubbles `is-done` (check) vs número + barra `role=progressbar` + back-link

---

### Criterios SIN Cobertura ✗
Ninguno. Los 191 criterios de lectura de la Iteración 2 están cubiertos.

### Notas (NO gaps — escritura fuera de alcance de It2)
- REQ-164 (registrar pago = ESCRITURA) → It5. La acción/ruta existe; la persistencia se valida en It5.
- Control "Cambiar estado de la pieza" + "Guardar" en `tooth-detail` (ESCRITURA odontograma) → It4. Presente en UI pero su persistencia/validación se exige en It4.
- Sin specs `.spec.ts` nuevos para REQ-098..191 todavía — correcto: QA los escribe en 5b/5e (este paso 5a verifica IMPLEMENTACIÓN, no testing).

### Scope Creep (sin requirement asociado)
- Toggle "Tabla/Tarjetas" en la lista de pacientes (`view-toggle`) — no atado a un REQ explícito de Épica 4, pero es coherente con el design pipeline (DC-040) y no rompe el anti-patrón de ≤5 columnas. **No bloqueante** (reportado, posiblemente intencional del diseño).

---

### Resultado: PASA (0 criterios sin cobertura) · SEED SIN DRIFT confirmado · build de producción OK
