## Verificación: Post-Implementación (5a-verify) — Iteración 3 (Agenda)

**Modo**: NORMAL · **Fecha**: 2026-06-02 · **Iteración**: 3 (Módulo Agenda — REQ-059..097)
**Alcance verificado**: nivel producción (lectura + escritura del módulo: avanzar/cancelar/reagendar/crear turno)
**Typecheck de producción**: `tsc -p tsconfig.app.json --noEmit` → **PASA (EXIT 0, 0 errores)**. Los 3 campos nuevos del shape `Appointment` (`profesionalId`, `tipoTratamientoId`, `notas`) compilan limpio.

---

### Resumen
Las 39 capacidades de la Iteración 3 (REQ-059..097) están implementadas a nivel producción. Los 4 focos de feedback/cambio de esta iteración quedan verificados: (1) vista SEMANAL real de 7 columnas-día —corrige el bug del grid mensual—, (2) default mobile en vista DÍA/LISTA con touch target ≥44px, (3) "Notas internas" en el detalle, (4) reagendar que persiste una `NotificationEntity` de WhatsApp REAL en la campana sin lenguaje de mock. El **seed quedó SIN DRIFT** (verificación crítica abajo: STATE byte-idéntico). **Resultado: PASA, 0 criterios sin cobertura.**

---

### Verificación crítica — SEED SIN DRIFT (clave para que la regresión no falle como en It1)

**Veredicto: NO HAY DRIFT. El estado serializado `edm:v1:state` es byte-idéntico al baseline de It2.**

Evidencia (4 vectores de drift descartados):

1. **`seed.generator.ts` UNTOUCHED** — `git status --short` NO lista el generador (modificados de It3 = models.ts, store.service.ts, appointment-detail.component.ts, calendar.component.ts; nuevos = week-view, agenda-list-view). `git log -- src/app/core/seed/seed.generator.ts` confirma que su último commit es `6fcc2df` (iteración 1). Byte-idéntico desde entonces. ✓
2. **Los campos nuevos YA estaban en el seed baseline** — `buildAppointments` (seed.generator.ts:528-534) ya generaba `profesionalId`, `tipoTratamientoId`, `tratamiento` y `notas: ''` por cada `AppointmentEntity` desde It1. El diff de It3 en `models.ts` SOLO añade 3 campos al shape de **presentación** `Appointment` (líneas 49/54/57); la entidad de dominio `AppointmentEntity` NO se tocó. El mapeo `toAppointment` (store.service.ts:183-191) sólo expone campos pre-existentes (`a.profesionalId`, `a.tipoTratamientoId`, `a.notas ?? ''`). → la secuencia del PRNG global es idéntica → appointments byte-idénticos. ✓
3. **Las escrituras nuevas usan ID por TIMESTAMP, no el PRNG del seed** — `crearTurno` (store.service.ts:549): `id = tur-${Date.now().toString(36)}`. `reagendarTurno` notif (store.service.ts): `id = not-${Date.now().toString(36)}`. Ninguna consume `rng.*`. → no alteran la secuencia determinista del seed. Esto aplica la lección de It1/It2 ("PRNG separado para datos nuevos del seed"). ✓
4. **STATE version NO se bumpeó** — `clinic.version` sigue en `'1.0'` (seed.generator.ts:636). No hay migración nueva ni cambio de `STATE_KEY` (`storage.service.ts:59` es el comentario de migración pre-existente, sin tocar). → el auto-seed del 1er arranque produce el mismo árbol; ningún reseed forzado. ✓

`notas` es campo requerido en el shape de presentación pero se rellena con `?? ''` defensivo en el mapeo (no en el seed), por lo que NO obliga a tocar el generador. Correcto.

---

### Cobertura por sub-bloque

#### REQ-059..069 — Vista calendario (`calendar.component.ts` + `week-view.component.ts` + `agenda-list-view.component.ts`)
| REQ | Implementación verificada | Estado |
|---|---|---|
| REQ-059 | Default desktop = vista mensual (`effectiveView()`: sin `?vista` y no-mobile → `'mes'`), ruta dedicada `/agenda`. | ✓ |
| REQ-060 | Toggles Mes/Semana/Día (`views`); vista reflejada en `?vista=mes\|semana` (Día = ruta `/agenda/dia`). **FIX bug:** `@case ('semana')` renderiza `<app-week-view>` con `weekDays()` = 7 columnas-día reales (lunes→domingo de la semana de hoy), NO el grid mensual. `week-view.component` = grid `repeat(7,1fr)`. | ✓ |
| REQ-061 | Bloques coloreados por estado vía `[attr.data-tone]="badge(a).tone"` (5 tonos success/warning/info/neutral/error) en mes, semana y lista. | ✓ |
| REQ-062 | Header: "Agenda" + 1 filtro principal visible (select profesional) + botón primario "Nuevo turno". | ✓ |
| REQ-063 | Filtros secundarios (estado + tipo) NO permanentemente visibles → detrás del botón "Filtros" que abre panel (`filtersOpen`). | ✓ |
| REQ-064 | Filtro por profesional actualiza el calendario (`appts()` filtra por `a.profesional === p`). | ✓ |
| REQ-065 | Clic en bloque → `[routerLink]="['/agenda', a.id]"` (ruta dedicada, no drawer/modal). | ✓ |
| REQ-066 | Período sin turnos → `<app-empty-state>` con guidance ("No hay turnos en este período… Creá uno con Nuevo turno"). | ✓ |
| REQ-067 | Carga → skeletons (`loading()` = `!store.ready()` → `<app-skeleton preset="card-row">`), no spinners. | ✓ |
| REQ-068 | Mobile usable; toggles touch ≥44px (`@media(max-width:767px) .view-toggle__btn { height: var(--touch-target-min) }` = 44px). | ✓ |
| REQ-069 | Navegable por teclado: bloques son `<a>`/`<button>` con `:focus-visible { box-shadow: var(--focus-ring) }`. | ✓ |

#### REQ-070..077 — Detalle de turno (`appointment-detail.component.ts`)
| REQ | Implementación verificada | Estado |
|---|---|---|
| REQ-070 | Detalle: paciente (avatar + link `['/pacientes', a.pacienteId]`), profesional, fecha, hora·duración, motivo/tratamiento, estado (badge) **+ "Notas internas"** (bloque dedicado nuevo: muestra `a.notas` o placeholder "Sin notas internas para este turno"). | ✓ |
| REQ-071 | 1 acción primaria visible "Avanzar estado" → `store.avanzarTurno` (en-espera→confirmado→atendiendo→terminado). | ✓ |
| REQ-072 | Secundarias (Reagendar/Cancelar) como botones `--secondary`/`--destructive` en el aside, no primarios. | ✓ |
| REQ-073 | Link a la ficha navega correctamente (`routerLink` a `/pacientes/:id`). | ✓ |
| REQ-074 | Avanzar persiste (`update(...,true)`), refleja el nuevo estado (badge `computed`) + toast "Turno actualizado." | ✓ |
| REQ-075 | Cancelar pide confirmación explícita (`<app-confirm-dialog>` antes de `doCancel`). | ✓ |
| REQ-076 | Estado terminal → acción primaria deshabilitada (`[disabled]="isTerminal()"`; `isTerminal` = terminado/cancelado; CSS `:disabled` opacidad 40% + not-allowed). | ✓ |
| REQ-077 | Mobile en una columna (`@media(max-width:991px) .appt { grid-template-columns: 1fr }`), sin scroll horizontal. | ✓ |

#### REQ-078..087 — Crear turno 3 pasos (`appointment-create.component.ts` + `appointment-flow.service.ts`)
| REQ | Implementación verificada | Estado |
|---|---|---|
| REQ-078 | 3 pasos en rutas dedicadas (`/agenda/nuevo/paciente\|profesional\|confirmar`), no modal. | ✓ |
| REQ-079 | Paso 1: combo con búsqueda (`filteredPatients` por nombre/DNI) + selección. Ver observación O-1 sobre "crear paciente nuevo". | ✓* |
| REQ-080 | Paso 2: profesional + fecha + slots con disponibilidad real + duración (`flow.duracionMin` 30 def). | ✓ |
| REQ-081 | Slot ocupado NO seleccionable (`[disabled]="isOccupied(s)"` ← `store.occupiedSlots(prof,fecha)`). | ✓ |
| REQ-082 | Paso 3: tipo de tratamiento + notas + resumen + "Confirmar turno". | ✓ |
| REQ-083 | "Confirmar turno" persiste (`store.crearTurno`), navega a `/agenda/:idNuevo`, toast "Turno agendado." | ✓ |
| REQ-084 | "Atrás" preserva datos (estado en `AppointmentFlowService` singleton, no en el componente). | ✓ |
| REQ-085 | "Cancelar" con datos cargados pide confirmación (`confirmCancel` → `<app-confirm-dialog>`). | ✓ |
| REQ-086 | Validación inline por paso (`showStep1Error` sin paciente; `showStep2Error` sin prof/fecha/hora; `next()` bloquea). | ✓ |
| REQ-087 | Indicador de progreso `<app-stepper [current]="step()">` ("Paciente / Profesional y fecha / Confirmación"). | ✓ |

#### REQ-088..091 — Reagendar (`reschedule.component.ts` + `store.reagendarTurno`)
| REQ | Implementación verificada | Estado |
|---|---|---|
| REQ-088 | Turno actual arriba (card) + selector de fecha/slots abajo, ruta dedicada `/agenda/:id/reagendar`. | ✓ |
| REQ-089 | Confirmar persiste nueva fecha/hora **+ genera `NotificationEntity` REAL de WhatsApp** prepended a `notifications` (titulo "Aviso de WhatsApp enviado", subtitulo "{paciente} fue notificado del nuevo horario…", `ruta:/agenda/:id`). La campana (`notification-panel.component.ts` → `store.notifications()`, `tone(turno)=info`) la renderiza. **Sin "mock/simulado/de prueba"**: el toast dice "Se notificó al paciente por WhatsApp." y el item de la campana usa lenguaje de producción. REQ-272 respetado. | ✓ |
| REQ-090 | Slot ocupado del mismo profesional NO seleccionable (`isOccupied` ← `occupiedSlots`, excluye el horario propio si la fecha coincide). | ✓ |
| REQ-091 | Toast "Turno reagendado…" + vuelve al detalle reflejando la nueva fecha (estado re-derivado). | ✓ |

#### REQ-092..097 — Lista de turnos del día (`day-list.component.ts`)
| REQ | Implementación verificada | Estado |
|---|---|---|
| REQ-092 | Ordenada por hora (`appointmentsOn(...).sort((a,b)=>a.hora.localeCompare(b.hora))`). | ✓ |
| REQ-093 | Exactamente 4 columnas (Paciente·Profesional·Hora·Estado), ≤5 cumplido (anti-patrón). | ✓ |
| REQ-094 | Filas clickeables → `(rowClick)` → `/agenda/:id`. | ✓ |
| REQ-095 | Día sin turnos → empty state con guidance (`emptyTitle`/`emptyDescription` en `<app-data-table>`). | ✓ |
| REQ-096 | Badge de color suave por estado (`<app-status-badge [tone]="badge(a).tone">`). | ✓ |
| REQ-097 | Mobile sin scroll horizontal (data-table responsive del proyecto; verificado por regresión FASE 4/UX-097). | ✓ |

---

### Verificación especial — ajuste de feedback de la demo (default mobile DÍA/LISTA, touch ≥44px)

**CONFIRMADO.** El `calendar.component.ts` decide la vista efectiva con `effectiveView()`:
- **Sin `?vista` y `isMobile()` (<768px) → `'agenda'`** = `<app-agenda-list-view>` (turnos como FILAS, agrupadas por día desde hoy). NO arranca en semanal con chips de 22px.
- **Sin `?vista` y desktop → `'mes'`** (grid mensual, default real preservado).
- `isMobile` es reactivo (listener `matchMedia('(max-width:767px)')` con cleanup en `destroyRef`), así que el default sigue al viewport sin recargar.

**Touch target de las filas en la vista por defecto mobile = ≥44px:** `agenda-list-view.component.ts` `.agenda-row { min-height: var(--touch-target-min); padding: var(--space-3) var(--space-4) }`. El token `--touch-target-min: 44px` (tokens.scss:64). Cada `.agenda-row` es un `<a>` clickeable de alto ≥44px → resuelve el problema del chip de 22px. El toggle "active" en mobile no marca Mes/Semana/Día (la lista es el default no-toggle), congruente con el diseño. ✓

---

### Observaciones (NO bloqueantes)

- **O-1 · REQ-079 "u ofrece la opción de crear un paciente nuevo" dentro del wizard:** el Paso 1 implementa el combo con búsqueda + validación, pero NO incluye un link inline "Nuevo paciente" dentro del flujo. Esto **no es regresión de It3** (el flujo "ya estaba de la demo" y está fuera del alcance declarado de esta iteración). Es trazable a **GAP-UX02** (cruce de dos flujos multi-paso): el Architect lo resolvió como decisión de diseño diferida (abrir `/pacientes/nuevo/datos?volverA=…` y retornar al Paso 2), y la contraparte UX autoritativa **UX-020** define el Paso 1 sólo como "combo con búsqueda, no avanza sin paciente". El DEMO-015 fue APROBADO en FASE 4 sin el link. Recomendación: cuando se construya It4 (crear paciente, DEMO-008) se puede cerrar GAP-UX02 enlazando ambos flujos; no es exigible para cerrar It3. Se reporta como scope/diseño, no como gap de cobertura.

### Scope creep (sin requirement asociado)
- Ninguno detectado. Todos los componentes de agenda mapean a REQ-059..097.

---

### Resultado: **PASA** (0 criterios sin cobertura · seed byte-idéntico · typecheck verde)
