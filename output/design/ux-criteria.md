# UX Criteria — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Architect (2da invocación)
**Fecha**: 2026-06-01
**Versión**: 1.0

> **Fuentes**: `output/design/ux-flows.md` (navegación, 10 user journeys, ~40 pantallas / ~49 rutas con sus 5 estados, responsive, content strategy) · `output/architecture/architecture.md` (DEMO-001..021 de la Fase de Construcción Visual, modelo de datos en localStorage de 14 entidades, seed dinámico, plan de 5 iteraciones) · `output/requirements/requirements.md` (272 REQ + 20 NFR).
>
> **Naturaleza estructural (regla maestra, gobierna todo este documento)**: **multi-pantalla estricto**. Cada acción crear/editar/consultar tiene su ruta dedicada; la URL es la fuente de verdad de la vista; el botón atrás del navegador funciona; cualquier deep-link válido hidrata desde `localStorage`. **Sin drawers como contenido principal. Sin modales >50%. Sin tabs entre objetos distintos. Una acción primaria por pantalla. Un filtro visible. Tablas ≤5 columnas. Paginación, no infinite scroll.**
>
> **Pagos y Odontograma EDITABLES y PERSISTENTES** (Épica 11): registrar pago recalcula y persiste el saldo; cambiar el estado de una pieza dental persiste y se refleja en el odontograma. Ambos sobreviven a refresh y cierre del navegador, y ambos son **completamente operables en mobile**.
>
> **TODOS los flujos usables en mobile** (REQ-252): crear/editar paciente, crear turno, reagendar, crear presupuesto, registrar pago y editar odontograma — ninguno relegado a "solo desktop".
>
> **CERO rastro de demo/mock** (REQ-272 / DEMO-021): ningún texto ni elemento de la UI revela "demo", "mock", "simulación", "simulado", "de prueba", "ejemplo", "ficticio", "viewcase" ni atribución a Link Design. Producción real de punta a punta. El reset se llama **"Restablecer datos"** y vive **solo** en Configuración.
>
> **Idioma** (NFR-034): español rioplatense neutro, profesional pero cercano ("ficha del paciente", "turno", "obra social", "presupuesto"; **nunca** "expediente").

---

## Navegación y Routing

> Cada ruta navegable de la demo tiene al menos un UX-xxx. La URL refleja la vista, el botón atrás funciona y el deep-link hidrata desde `localStorage` (`SeedReadyGuard` garantiza el store hidratado antes del render). Flujos multi-paso = una ruta por paso (ADR-5).

| ID | Criterio | Origen |
|---|---|---|
| UX-001 | `/login` es accesible y carga fuera del shell (sin sidebar ni header). "Ingresar como administradora" y "Saltar login" navegan a `/reportes` cargando el seed si no existe en `localStorage`. | DEMO-005 |
| UX-002 | El shell (header + sidebar + footer + `<router-outlet>`) envuelve todas las rutas internas excepto `/login`. El item del sidebar y el nombre del módulo en el header reflejan siempre la ruta activa (un solo item destacado por vez). | DEMO-001, DEMO-002 |
| UX-003 | Clic en cada item del sidebar (Agenda, Pacientes, Tratamientos, Facturación, Reportes, Configuración, Ayuda) navega a su ruta dedicada y actualiza la URL: `/agenda`, `/pacientes`, `/tratamientos`, `/facturacion/presupuestos`, `/reportes`, `/configuracion`, `/ayuda`. | DEMO-001, DEMO-004 |
| UX-004 | Inicio post-login = `/reportes` (dashboard de KPIs). Es el destino tanto del botón de login como del link "Saltar login". | DEMO-005, DEMO-014 |
| UX-005 | `/agenda` carga en vista mensual por default. El toggle Mes/Semana/Día refleja la vista activa en query/estado (`/agenda?vista=semana`, `/agenda?vista=dia`) sin cambiar de pantalla; `/agenda/dia` (lista del día) sí es ruta propia. | DEMO-007 |
| UX-006 | Cada bloque de turno del calendario navega a `/agenda/turno/:id` (ruta dedicada, NO drawer ni modal). El detalle de un `:id` inexistente muestra "No encontramos este turno" con acción de volver a Agenda, sin crashear. | DEMO-007, DEMO-004 |
| UX-007 | El flujo crear turno usa 3 rutas: `/agenda/nuevo/paciente` → `/agenda/nuevo/profesional` → `/agenda/nuevo/confirmar`. Reagendar usa `/agenda/turno/:id/reagendar`. La lista del día es `/agenda/dia`. | DEMO-015 |
| UX-008 | `/pacientes` lista la tabla; cada fila/card navega a `/pacientes/:id` que redirige a `/pacientes/:id/informacion` (tab default). Crear paciente usa `/pacientes/nuevo/datos` → `/pacientes/nuevo/clinico`. | DEMO-008, DEMO-009 |
| UX-009 | Los 6 tabs de la ficha reflejan el tab activo en la URL: `/pacientes/:id/informacion`, `/odontograma`, `/historial`, `/tratamientos`, `/documentos`, `/pagos`. Recargar o compartir el link mantiene el tab seleccionado. | DEMO-009, DEMO-011 |
| UX-010 | Las sub-pantallas de la ficha tienen ruta dedicada: detalle de pieza `/pacientes/:id/pieza/:fdi`, evento `/pacientes/:id/evento/:eid`, plan `/pacientes/:id/plan/:pid`, documento `/pacientes/:id/documento/:did`, registrar pago `/pacientes/:id/pagos/nuevo`, editar `/pacientes/:id/editar`. | DEMO-010, DEMO-011, DEMO-016 |
| UX-011 | `/tratamientos` (lista activos) → `/pacientes/:id/plan/:pid`. `/tratamientos/catalogo` (cards) → `/tratamientos/catalogo/:tid`. | DEMO-012 |
| UX-012 | `/facturacion` redirige a `/facturacion/presupuestos`. La sub-navegación de Facturación (Presupuestos / Facturas / Obras sociales) son 3 rutas hermanas reales (`/facturacion/presupuestos`, `/facturacion/facturas`, `/facturacion/obras-sociales`), no tabs ocultos en el DOM; cada destino es una pantalla completa con su ruta. | DEMO-013 |
| UX-013 | Crear presupuesto usa 3 rutas: `/facturacion/presupuestos/nuevo/paciente` → `/nuevo/tratamientos` → `/nuevo/revision`. Detalles: `/facturacion/presupuestos/:id`, `/facturacion/facturas/:id`, `/facturacion/obras-sociales/:id`. | DEMO-013, DEMO-018 |
| UX-014 | Los 4 reportes detallados tienen ruta propia: `/reportes/pacientes`, `/reportes/tratamientos`, `/reportes/financiero`, `/reportes/productividad`. Cada KPI card del dashboard navega a su reporte. | DEMO-014, DEMO-018 |
| UX-015 | El botón atrás del navegador funciona en TODOS los flujos: atrás desde una ficha → lista de pacientes (o pantalla previa real si se llegó desde Agenda/Reportes); atrás desde una sub-pantalla de tab → la ficha en el tab de origen (ej. salir de `/pacientes/:id/pieza/:fdi` vuelve a `/pacientes/:id/odontograma`); atrás desde el paso N de un flujo → paso N-1 con datos preservados. | DEMO-004 |
| UX-016 | Deep-linking: cargar directamente cualquier URL interna válida (ej. `*.azurestaticapps.net/pacientes/pac-007/pagos`) renderiza la pantalla correcta hidratando el store desde `localStorage` (fallback a `index.html` en SWA), sin requerir navegar desde el inicio. | DEMO-004 |
| UX-017 | Cualquier ruta inexistente redirige a `/no-encontrado` (pantalla sobria con "Volver al inicio" → `/reportes`); un id de paciente inválido muestra "No encontramos este paciente." con "Volver a la lista de pacientes" → `/pacientes`. Nunca crashea. | DEMO-004 |
| UX-018 | Mobile: el sidebar se transforma en drawer overlay invocado por el botón hamburguesa del header; al elegir un item navega y cierra el drawer. Es la única excepción de drawer permitida (navegación, no contenido principal). | DEMO-001, DEMO-020 |

---

## Mapa de Navegación

> Todas estas rutas son navegables en la Fase de Construcción Visual con datos del seed. Pantallas sin funcionalidad real completa (reagendar, crear presupuesto, reportes detallados, sub-detalles, configuración) se implementan como shell navegable con layout y placeholders coherentes (DEMO-018). El árbol completo y el conteo (~49 rutas / ~40 pantallas) están en `ux-flows.md` §2.

```
/
├── /login ........................... Login (fuera del shell)
│
└── (App Shell: header + sidebar + footer + <router-outlet>)
    ├── /reportes .................... [INICIO post-login] Dashboard ≤6 KPI cards
    │   ├── /reportes/pacientes ...... Reporte de pacientes (4 gráficos)
    │   ├── /reportes/tratamientos ... Reporte de tratamientos (3 gráficos)
    │   ├── /reportes/financiero ..... Reporte financiero (3 gráficos)
    │   └── /reportes/productividad .. Reporte de productividad (3 gráficos)
    │
    ├── /agenda ...................... Calendario (mensual default; ?vista=semana | ?vista=dia)
    │   ├── /agenda/dia .............. Lista de turnos del día (≤4 col)
    │   ├── /agenda/turno/:id ........ Detalle del turno (1 acción primaria)
    │   ├── /agenda/turno/:id/reagendar  Reagendar turno
    │   └── /agenda/nuevo/{paciente,profesional,confirmar}  Crear turno (3 pasos)
    │
    ├── /pacientes ................... Lista de pacientes (tabla ≤5 col; toggle Card/Tabla)
    │   ├── /pacientes/nuevo/{datos,clinico}  Crear paciente (2 pasos)
    │   └── /pacientes/:id ........... Ficha (cabecera + barra de 6 tabs)
    │       ├── /informacion ......... Tab 1 [default]
    │       ├── /odontograma ......... Tab 2 → /pacientes/:id/pieza/:fdi
    │       ├── /historial ........... Tab 3 → /pacientes/:id/evento/:eid
    │       ├── /tratamientos ........ Tab 4 → /pacientes/:id/plan/:pid
    │       ├── /documentos .......... Tab 5 → /pacientes/:id/documento/:did
    │       ├── /pagos ............... Tab 6 → /pacientes/:id/pagos/nuevo
    │       └── /editar .............. Editar paciente
    │
    ├── /tratamientos ................ Lista de activos (≤5 col)
    │   └── /tratamientos/catalogo ... Catálogo (≥12 cards) → /tratamientos/catalogo/:tid
    │
    ├── /facturacion → /facturacion/presupuestos
    │   ├── /facturacion/presupuestos  Lista → /:id ; nuevo/{paciente,tratamientos,revision}
    │   ├── /facturacion/facturas .... Lista → /:id
    │   └── /facturacion/obras-sociales  Lista → /:id
    │
    ├── /configuracion ............... Configuración (incl. "Restablecer datos")
    ├── /ayuda ....................... Ayuda (centro de ayuda / FAQ interno)
    └── /no-encontrado ............... Fallback (ruta inexistente; no crashea)
```

---

## Flujos de Usuario

> Flujos multi-pantalla con rutas reflejadas en la URL y botón atrás funcional. Los pasos preservan datos al ir "Atrás"; "Cancelar" pide confirmación si hay datos y vuelve a la pantalla de origen. Stepper de progreso visible en los flujos multi-paso. **Todos operables en mobile.** Los dos flujos críticos interactivos de la Construcción Visual (DEMO-015 crear turno, DEMO-016 registrar pago) recorren end-to-end con el seed; el resto se entrega como shell navegable (DEMO-018) y se completa en sus iteraciones.

| ID | Flujo | Criterio | Origen |
|---|---|---|---|
| UX-020 | Crear turno (3 pasos) | Recorrible end-to-end por 3 rutas con stepper "Paso N de 3": Paso 1 elegir paciente (combo con búsqueda, no avanza sin paciente — validación inline) → Paso 2 profesional + disponibilidad real (slot ocupado del profesional NO seleccionable) + duración → Paso 3 tratamiento + notas + resumen → "Confirmar turno" persiste y navega a `/agenda/turno/:idNuevo` con toast "Turno agendado." | DEMO-015 |
| UX-021 | Crear turno desde la ficha (pre-relleno) | "Agendar turno" en la cabecera de la ficha inicia el mismo flujo con el paciente **preseleccionado** (entra al Paso 2 con `pacienteId` en el estado del flujo, o Paso 1 con el paciente ya elegido). | DEMO-015, DEMO-009 |
| UX-022 | Avanzar estado de turno | Desde `/agenda/turno/:id`, la única acción primaria avanza el estado al siguiente paso lógico (confirmado → atendiendo → terminado); persiste, refleja el nuevo estado en pantalla y muestra toast "Turno actualizado." En estado terminal (terminado/cancelado) la acción primaria se deshabilita (opacidad 40%, cursor not-allowed). | DEMO-007 |
| UX-023 | Cancelar turno | "Cancelar turno" (menú ⋯) pide confirmación explícita ("¿Cancelar este turno? El paciente quedará sin la cita agendada." → "Sí, cancelar" / "Volver") antes de ejecutar; al confirmar persiste el estado cancelado + toast. | DEMO-007 |
| UX-023b | Reagendar turno | Desde el menú ⋯ → `/agenda/turno/:id/reagendar`: turno actual arriba + calendario para nueva fecha/hora (slot ocupado del mismo profesional NO seleccionable). "Confirmar reagendamiento" persiste la nueva fecha/hora, muestra la notificación presentada como real "Se notificó al paciente por WhatsApp." + toast "Turno reagendado." y vuelve al detalle con la nueva fecha. | DEMO-018 |
| UX-024 | Crear paciente (2 pasos) | 2 rutas con stepper "Paso N de 2": Paso 1 datos personales + contacto (validación inline de requeridos + formato DNI, no avanza sin requeridos) → Paso 2 datos clínicos + foto opcional (sin foto → fallback a iniciales en círculo pastel, no imagen rota) → "Crear paciente" persiste y navega a `/pacientes/:idNuevo` con toast "Paciente creado." "Atrás" preserva los datos del Paso 1. | DEMO-008 |
| UX-025 | Editar paciente | `/pacientes/:id/editar` con formulario precargado con los datos actuales; validación inline; "Guardar cambios" persiste, vuelve a la ficha y muestra toast "Cambios guardados." "Cancelar" con cambios pide confirmación ("¿Descartar los cambios?...") y vuelve sin alterar. | DEMO-009 |
| UX-026 | Registrar pago (FLUJO FIRMA) | Desde el tab Pagos, la acción primaria "Registrar pago" abre `/pacientes/:id/pagos/nuevo` (ruta dedicada, NO modal): monto (ARS) + fecha + concepto/medio; valida inline monto número positivo ("Ingresá un monto mayor a cero."). "Confirmar pago" agrega el movimiento, recalcula el saldo y persiste en `localStorage`; vuelve a `/pacientes/:id/pagos` con resumen (cobrado/saldo) y nuevo movimiento actualizados + toast "Pago registrado." | DEMO-016 |
| UX-027 | Coherencia del saldo tras pago | Tras registrar el pago, el badge de estado de cuenta del paciente en `/pacientes` (al día / con deuda / vencido) queda coherente con el nuevo saldo (derivado, no duplicado). "Cancelar" con datos pide confirmación y vuelve al tab Pagos sin alterar el saldo. | DEMO-016, DEMO-008 |
| UX-028 | Editar estado de pieza del odontograma | Desde `/pacientes/:id/odontograma`, clic en una pieza → `/pacientes/:id/pieza/:fdi`: control "Cambiar estado" con las 6 opciones (sana / caries / obturación / ausente / en tratamiento / prótesis). "Guardar cambio" persiste en `localStorage`, muestra toast "Estado de la pieza actualizado." y, al "Volver al odontograma", la pieza refleja visualmente el nuevo estado (color/chip + leyenda). El atrás del navegador también regresa al odontograma. | DEMO-010 |
| UX-029 | Crear presupuesto (3 pasos) | 3 rutas con stepper "Paso N de 3": Paso 1 paciente → Paso 2 agregar uno o varios tratamientos con **costo total calculado automáticamente** → Paso 3 revisión + "Confirmar presupuesto" persiste y navega a `/facturacion/presupuestos/:idNuevo` con toast "Presupuesto creado." "Atrás" preserva datos; "Cancelar" con confirmación vuelve a la lista. | DEMO-018 |
| UX-030 | Aprobar presupuesto | En `/facturacion/presupuestos/:id` (estado pendiente), la acción primaria "Aprobar" persiste el estado "aprobado" + toast "Presupuesto aprobado." Si está vencido o ya aprobado, la acción primaria se adapta o deshabilita (no se aprueba dos veces). | DEMO-018, DEMO-013 |
| UX-031 | Restablecer datos | En `/configuracion`, "Restablecer datos" pide confirmación que advierte la pérdida de cambios ("¿Restablecer los datos? Se perderán todos los cambios y el sistema volverá a su estado inicial." → "Sí, restablecer" / "Cancelar"); al confirmar regenera el seed determinista, rehidrata el store y muestra toast "Datos restablecidos correctamente." Es la **única** vía de reset (no está en el footer). | DEMO-018, DEMO-021 |
| UX-032 | Navegación cruzada paciente | Los links a paciente navegan a su ficha: desde el detalle del turno (`/pacientes/:id/informacion`), desde el detalle de obra social (paciente asociado → su ficha), y desde notificaciones (a la pantalla relevante). | DEMO-007, DEMO-013 |
| UX-033 | Eliminar paciente | "Eliminar paciente" (menú ⋯ de la ficha) pide confirmación ("¿Eliminar la ficha de [nombre]? Esta acción no se puede deshacer." → "Sí, eliminar" / "Cancelar"); al confirmar navega a `/pacientes` con toast "Paciente eliminado." | DEMO-009 |

---

## Lógica de Estados

> Comportamiento de los 5 estados por pantalla (vacío / carga / error / éxito / muchos datos). El aspecto visual de skeleton, empty-state y toast lo detalla `design-criteria.md` (DC-xxx); aquí se define CÓMO se comporta cada transición. Regla maestra: **skeletons (nunca spinners)** al cargar; **toast tras cada acción**; **paginación offset (default 12) con contador "1–N de M"**, nunca infinite scroll. El mapa completo "qué estado aplica a cada pantalla" está en `ux-flows.md` §4.

| ID | Pantalla | Criterio | Origen |
|---|---|---|---|
| UX-040 | Transversal — Carga | Toda lista/sección que hidrata o computa datos muestra **skeletons** que imitan la forma del contenido (avatar circular + líneas para filas; cards fantasma para grillas; anillos fantasma para KPIs), con stagger por fila/card. **Nunca spinners.** | DEMO-017 |
| UX-041 | Transversal — Vacío | Toda lista/sección que puede quedar vacía muestra un empty state sobrio con guidance + (cuando aplica) 1 acción primaria; copy de negocio sin revelar mock. Nunca una pantalla en blanco ambigua. | DEMO-017 |
| UX-042 | Transversal — Error | Fallo al cargar/persistir → toast coral con mensaje claro + acción de reintento; ruta/id inexistente → pantalla "no encontrado" específica. El error nunca crashea la app ni revela mock. | DEMO-017, DEMO-004 |
| UX-043 | Transversal — Muchos datos | Listas largas (pacientes, turnos del día, presupuestos, facturas, tratamientos, movimientos, documentos, historial) usan paginación offset (10–15 filas, default 12) con contador de rango "1–12 de N". En la ficha la profundidad se da por tabs, nunca por scroll infinito. | DEMO-008, DEMO-017 |
| UX-044 | Agenda — Calendario | Período sin turnos → "No hay turnos en este período. Creá uno con Nuevo turno." + acción primaria. Día muy cargado → bloques se compactan / "+N más" lleva a `/agenda/dia`. | DEMO-007, DEMO-017 |
| UX-045 | Lista de pacientes — Vacío por búsqueda | Búsqueda/filtro sin resultados → "No encontramos pacientes con ese criterio. Probá con otro nombre o ajustá los filtros." (caso límite sin filtro: "Todavía no hay pacientes cargados. Creá el primero con Nuevo paciente."). | DEMO-008, DEMO-017 |
| UX-046 | Ficha — Tab Información (vacío por campo) | Campos sin dato muestran placeholder claro por campo ("Sin medicación registrada", "Sin alergias registradas", "Sin observaciones"), nunca en blanco ambiguo. Los badges de alerta (alergias/medicación) solo aparecen si aplican (no badge vacío). | DEMO-011 |
| UX-047 | Ficha — Odontograma (siempre 32) | El odontograma siempre muestra las 32 piezas; un paciente nuevo sin tratamientos → todas "sana" sin estados inventados. El estado de carga muestra skeleton del diagrama (arcadas fantasma). | DEMO-010 |
| UX-048 | Ficha — Historial / Tratamientos / Documentos / Pagos (vacíos) | Historial vacío → "Este paciente todavía no tiene eventos clínicos registrados." · Tratamientos vacío → "Este paciente todavía no tiene tratamientos." (grupo Activos/Completados vacío se omite sin romper layout) · Documentos vacío → "Este paciente todavía no tiene documentos cargados." (thumbnail roto → placeholder controlado, no ícono de error del navegador) · Pagos vacío → "Sin movimientos en la cuenta corriente." | DEMO-011 |
| UX-049 | Detalle de turno — Estado terminal | En turno terminado/cancelado la acción primaria de avance se deshabilita (opacidad 40%, cursor not-allowed) comunicando que no hay siguiente paso. Turno inexistente → "No encontramos este turno" + volver a Agenda. | DEMO-007 |
| UX-050 | Pasos de flujo — Vacío/Error | En cada paso, la acción primaria ("Siguiente" / "Confirmar...") está deshabilitada hasta cumplir los requeridos; el error de validación aparece inline junto al campo afectado (ej. paso 1 sin paciente: "Elegí un paciente para continuar."; DNI inválido: "Ingresá un DNI válido."; presupuesto sin tratamientos: "Agregá al menos un tratamiento."). | DEMO-015, DEMO-016 |
| UX-051 | Listas de Facturación — Vacío | Presupuestos vacío → "No hay presupuestos con este criterio. Creá uno con Nuevo presupuesto." · Facturas vacío → "No hay facturas con este criterio." · Obra social sin pacientes (detalle) → "Esta obra social no tiene pacientes asociados." | DEMO-013, DEMO-017 |
| UX-052 | Tratamientos — Vacío | Lista de activos sin resultados → "No hay tratamientos activos con este criterio." El catálogo (≥12 tipos fijos) no tiene estado vacío; carga con skeletons de card. | DEMO-012, DEMO-017 |
| UX-053 | Reportes — Datos calculados / Vacío por gráfico | El dashboard siempre tiene datos calculados del estado (sin estado vacío global); carga con skeletons de card (anillos fantasma). En los reportes detallados, un gráfico sin datos suficientes muestra "Sin datos suficientes para este gráfico." sin crashear. | DEMO-014, DEMO-017 |
| UX-054 | Cabecera de ficha estable | Cambiar de tab no recarga la cabecera (foto, nombre, datos básicos permanecen estables); solo cambia el contenido del tab activo. Paciente inexistente → "No encontramos este paciente." + "Volver a la lista". | DEMO-009 |

---

## Mock Data (Seed)

> El seed es **dinámico** (deriva de las fotos, no hardcodea la cantidad) y **reproducible** (PRNG de semilla fija, ADR-8). Datos realistas argentinos — sin "Lorem ipsum". El estado vive en `localStorage` bajo `edm:v1:state` (14 entidades normalizadas). Variedad suficiente para demostrar funcionalidad y edge cases. Detalle del pipeline en `architecture.md` "Carga del Seed Dinámico".

| ID | Criterio | Origen |
|---|---|---|
| UX-060 | Pacientes derivados de las fotos | El seed genera **29 pacientes** desde las carpetas de fotos (12 hombres + 17 mujeres): edad del nombre de archivo (soporta sufijos `23-1.jpg`/`23-2.jpg` → dos pacientes distintos de esa edad), género de la carpeta. La cantidad NO está hardcodeada; `.DS_Store` se ignora. La foto se muestra correctamente en lista y ficha. | DEMO-006 |
| UX-061 | Datos del paciente plausibles | Cada paciente recibe: nombre argentino plausible coherente con edad y género (apellidos por generación), DNI con formato AR, obra social con distribución típica (OSDE/Galeno/Swiss Medical/PAMI/IOMA/Particulares), profesional de cabecera (de los 6), contacto y contacto de emergencia. | DEMO-006, DEMO-011 |
| UX-062 | Odontograma e historial coherentes con la edad | El odontograma de cada paciente refleja estado por pieza coherente con la edad (niños con piezas de leche; adultos mayores con ausencias/prótesis; mezcla sano/tratado/activo). El historial clínico es variable por edad (niños/adolescentes con menos eventos; mezcla de nuevos sin historial y antiguos con historial extenso). | DEMO-006, DEMO-010, DEMO-011 |
| UX-063 | Datos fijos del staff y catálogo | El seed incluye los datos fijos: clínica "Estudio Dental Mendieta" (CUIT 30-71234567-8), **6 profesionales** con especialidades distintas, **6 obras sociales**, y **≥12 tipos de tratamiento** en el catálogo (limpieza, ortodoncia con brackets, ortodoncia invisible, implante unitario/múltiple, conducto, blanqueamiento, carilla, corona, extracción simple/de molar, prótesis fija/removible). | DEMO-006, DEMO-012, DEMO-013 |
| UX-064 | Volúmenes mínimos de operación viva | El seed cumple: **≥50 turnos** (distribución ~30% confirmados/en-espera futuros, ~50% terminados pasados, ~10% atendiendo/hoy, ~10% cancelados), **≥40 tratamientos** (activos/completados) coherentes con edad, **40–60 documentos** repartiendo un pool de ~15 imágenes (10 radiografías + 5 fotos clínicas), e histórico de **≥60 días**. | DEMO-006, DEMO-007, DEMO-011, DEMO-012 |
| UX-065 | Volúmenes de facturación y cuenta corriente | El seed cumple: **≥20 presupuestos** en distintos estados (pendiente/aprobado/rechazado/vencido), **≥25 facturas** de los últimos 60 días en distintos estados (emitida/pagada/vencida/anulada), y AccountMovements por paciente con mezcla representativa al-día/con-deuda. El estado de cuenta (badge) es derivado del saldo, coherente entre la lista y el tab Pagos. | DEMO-006, DEMO-013, DEMO-016 |
| UX-066 | KPIs y reportes calculados del estado | Los valores del dashboard (pacientes nuevos del mes, turnos atendidos, tratamientos completados, ingresos facturados, ingresos cobrados, deuda pendiente) y los gráficos de los 4 reportes se **calculan del estado real** (seed + acciones del usuario), nunca hardcodeados; montos en ARS formateados. | DEMO-014 |
| UX-067 | Edge cases representados en el seed | El seed representa edge cases navegables: pacientes nuevos sin historial, pacientes con deuda y al día, boca sana vs. con tratamientos, turnos en los 5 estados, presupuestos/facturas en todos sus estados. Esto alimenta los estados de UI (vacío/muchos datos) de las pantallas. | DEMO-006, DEMO-017 |

---

## Interacciones

> Comportamiento funcional de la demo sobre los datos del seed. Incluye persistencia (la columna vertebral de la propuesta de valor), reset, validaciones, feedback y el comportamiento de los 6 tabs. Toda escritura es reactiva en memoria de inmediato y se serializa a `localStorage` (debounced; inmediata en confirmaciones — ADR-4).

| ID | Criterio | Origen |
|---|---|---|
| UX-080 | Buscador inline contextual | El buscador de la lista de pacientes filtra por nombre (y opcionalmente DNI) **en vivo**, solo dentro de la pantalla activa (nunca global). Sin resultados → empty state con guidance. No hay búsqueda global ni command palette. | DEMO-008 |
| UX-081 | Filtro único visible + panel | Cada lista (Agenda, Pacientes, Tratamientos) muestra un solo filtro principal a la vista (por profesional, normalmente); los filtros secundarios viven en un panel desplegable "Filtros". Aplicar el filtro actualiza la lista/calendario sin reload. | DEMO-007, DEMO-008, DEMO-012 |
| UX-082 | Toggle de vista de Agenda | El toggle Mes/Semana/Día cambia la vista del calendario reflejándola en query/estado, sin navegar a otra pantalla. Toggle Card/Tabla en la lista de pacientes alterna entre vista densa (tabla ≤5 col) y persona-céntrica (cards) sin introducir filtros ni acciones extra. | DEMO-007, DEMO-008 |
| UX-083 | Tab inactivo NO en el DOM | En la ficha del paciente, solo el tab activo se renderiza; el contenido de los tabs inactivos **NO está en el DOM** y se carga solo al hacer clic en su tab. La ficha nunca usa scroll infinito con todos los datos a la vez (segmentación estricta por tabs). | DEMO-009, DEMO-011 |
| UX-084 | Persistencia entre sesiones | Estas escrituras persisten en `localStorage` y sobreviven a refresh y cierre/reapertura del navegador: crear paciente, agendar turno, avanzar estado de turno, reagendar, registrar pago, editar ficha, aprobar presupuesto, y cambiar el estado de una pieza del odontograma. Tras refrescar, el cambio sigue presente. | DEMO-016, DEMO-010 |
| UX-085 | Saldo de cuenta corriente derivado y coherente | Al registrar un pago, el movimiento se agrega, el saldo se recalcula (deuda/al día/saldo a favor) y el resumen (cobrado/saldo) se actualiza en pantalla de inmediato; el badge de estado de cuenta en la lista de pacientes queda coherente (derivado del saldo, no duplicado). Cargos y pagos se distinguen visualmente (negativos vs positivos). | DEMO-016, DEMO-008 |
| UX-086 | Odontograma se refleja tras editar | Al guardar el cambio de estado de una pieza, el odontograma re-renderiza desde el store: al volver, la pieza muestra el nuevo estado (color/chip) coherente con la leyenda. La numeración es FDI primaria (11–48) con universal 1–32 en tooltip. La coherencia con el resto de la ficha se mantiene (no entra en estado inconsistente). | DEMO-010 |
| UX-087 | Disponibilidad real en turnos | En el Paso 2 de crear turno y en reagendar, la disponibilidad refleja los turnos existentes: un slot ya ocupado para ese profesional NO es seleccionable (mensaje inline). El costo total del presupuesto se calcula automáticamente al agregar/quitar tratamientos. | DEMO-015, DEMO-018 |
| UX-088 | Confirmaciones antes de acciones destructivas | Toda acción destructiva o irreversible pide confirmación explícita ANTES de ejecutar: eliminar paciente, cancelar turno, cancelar un flujo con datos, descartar edición con cambios, descartar un pago con datos, y restablecer datos. | DEMO-009, DEMO-007, DEMO-016 |
| UX-089 | Toast tras cada acción exitosa | Después de cada acción exitosa (crear, editar, aprobar, avanzar estado, reagendar, registrar pago, cambiar estado de pieza, restablecer datos) se muestra un toast claro con copy de producción. La validación de formularios es inline (no solo al enviar), con el error junto al campo afectado. | DEMO-016, DEMO-017 |
| UX-090 | Restablecer datos restaura el seed determinista | "Restablecer datos" (solo en Configuración) regenera el seed completo de forma determinista (mismo PRNG → exactamente el estado original) y rehidrata el store; tras confirmar, las listas vuelven a sus valores iniciales. No existe ninguna otra vía de reset (no en el footer). | DEMO-018, DEMO-021 |
| UX-091 | localStorage no disponible degrada sin crashear | Si `localStorage` no está disponible (modo privado restrictivo / cuota llena), el sistema degrada a estado en memoria con un aviso claro (toast informativo, sin lenguaje de demo) y permite navegar el seed sin crashear. | DEMO-004, DEMO-017 |
| UX-092 | Notificaciones internas navegables | El panel de notificaciones (anclado al header, <50% / hoja inferior en mobile) lista turnos por confirmar, pagos vencidos, cumpleaños y tratamientos por vencer con timestamp relativo y diferenciación leído/no-leído; el contador se refleja en el badge del header; cada notificación navega a una ruta real (detalle de turno, tab Pagos, etc.). | DEMO-002 |
| UX-093 | Mobile — todos los flujos operables | Todos los flujos son completamente usables en mobile (no solo consulta): crear/editar paciente, crear turno, reagendar, crear presupuesto, registrar pago y editar el estado de pieza del odontograma. Touch target ≥44px en todo control (incluidos pasos de flujo, "Registrar pago", el formulario de pago y el selector de estado de pieza); sin scroll horizontal no intencional en ningún viewport mobile estándar, incluido el odontograma editable. | DEMO-020 |
| UX-094 | Cero rastro de demo en el copy interactivo | Ningún texto de toasts, confirmaciones, empty states, notificaciones, validaciones, Configuración ni copy de cualquier pantalla revela "demo", "mock", "simulación", "simulado", "de prueba", "ejemplo", "ficticio" ni "viewcase". La notificación de WhatsApp al reagendar se presenta como envío real; facturas/presupuestos nunca mencionan ARCA/AFIP; el reset se llama "Restablecer datos". | DEMO-021 |

---

## CRM Tracking

> **N/A — Este proyecto NO incluye CRM tracking, analytics ni telemetría de ningún tipo.**
>
> El cliente lo prohíbe explícitamente (REQ-258: "El sistema NO incluye... analytics ni tracking"; REQ-272: cero rastro de demo/atribución). `architecture.md` lo formaliza en **ADR-7** ("Sin tracking/analytics, sin backend, sin auth real") y **GAP-A01**, y **omite deliberadamente** el criterio DEMO de CRM tracking que el template estándar incluiría. En consecuencia, **no se crea UX-090 de tracking** (el ID UX-090 se reutilizó arriba para "Restablecer datos restaura el seed").
>
> **Verificación para QA (ausencia, no presencia)**: confirmar que NO existe ningún SDK ni evento de analytics/tracking/CRM (open, navegación, scroll, heartbeat, CTA, custom, etc.) en ninguna fase ni bundle. La UI se presenta como producto real en producción, sin telemetría.

| ID | Criterio | Origen |
|---|---|---|
| — | No aplica. Sin CRM tracking por requisito del cliente (REQ-258 / REQ-272, ADR-7, GAP-A01). QA verifica la **ausencia** de cualquier SDK/evento de analytics. | DEMO-021 (ausencia) |

---

## Gaps de UX Descubiertos

> Ninguno bloqueante. Decisiones de coordinación dentro del lenguaje multi-pantalla; varias ya resueltas en `ux-flows.md` §16. No requieren al cliente. Refieren a DEMO-IDs (los UX-xxx se derivan de DEMO-xxx).

| # | Gap | DEMO-IDs afectados | Recomendación |
|---|---|---|---|
| GAP-UX01 | Vista activa del calendario (mes/semana/día) en la URL: el árbol de rutas no separa rutas por vista, pero REQ-060 pide reflejar la vista activa. | DEMO-007 | Reflejar la vista como **query param** (`/agenda?vista=semana`) manteniendo el calendario en una sola pantalla; la lista del día sí tiene ruta propia (`/agenda/dia`). Resuelto en UX-005 / UX-082. |
| GAP-UX02 | "Crear paciente nuevo" dentro del flujo de crear turno cruza dos flujos multi-paso (preservación de estado entre flujos). | DEMO-015, DEMO-008 | Abrir `/pacientes/nuevo/datos` con parámetro de retorno (`?volverA=/agenda/nuevo/profesional`); al crear el paciente, retornar al Paso 2 del turno con el paciente preseleccionado. Mantiene multi-pantalla sin perder contexto (relacionado con UX-021). |
| GAP-UX03 | Sub-navegación de Facturación (Presupuestos / Facturas / Obras sociales) podría confundirse con tabs entre objetos distintos (anti-patrón). | DEMO-013 | Tratarla como **navegación de sección**: 3 listas hermanas, cada una con ruta dedicada real (no contenido oculto en el DOM). No es "tabs del mismo objeto". Resuelto en UX-012. |
| GAP-UX04 | Toggle Card/Tabla en la lista de pacientes no es obligatorio por requirements (REQ-098 prescribe tabla ≤5 col). | DEMO-008 | Propuesto como mejora persona-céntrica: Tabla = vista primaria (cumple ≤5 col), Cards = persona-céntrico. Queda a criterio de implementación; no introduce filtros ni acciones extra. Resuelto en UX-082. |
| GAP-UX05 | Ayuda (`/ayuda`) no tiene criterios de contenido en requirements (solo existe como item del sidebar). | DEMO-018 | Diseñada como centro de ayuda interno (FAQ por tema con lógica de negocio: cómo agendar un turno, registrar un pago, editar el odontograma, crear un presupuesto), copy de producción, sin demo. Pantalla shell navegable. |
| GAP-UX06 | Inicio post-login: REQ-002 dice "dashboard de Reportes (o pantalla de inicio definida)". | DEMO-005, DEMO-014 | Decisión: el inicio es **`/reportes`** (dashboard de KPIs), por dar una vista de operación viva inmediata. Resuelto en UX-004. |
| GAP-UX07 | Notificaciones como panel vs pantalla (coherencia multi-pantalla). | DEMO-002 | Decisión: panel contextual ligero anclado al header (<50%, hoja inferior en mobile), donde cada notificación navega a una ruta real. No se convierte en drawer de contenido. Resuelto en UX-092. |

---

## Verificación de cobertura (antes del retorno)

- **75 criterios UX-xxx** (UX-001..018, UX-020..033 incl. UX-023b, UX-040..054, UX-060..067, UX-080..094): navegación/routing, mapa de navegación, flujos multi-paso, lógica de los 5 estados, mock data/seed dinámico, interacciones/persistencia.
- **Cobertura de los 21 DEMO-xxx**:
  - DEMO-001 (sidebar) → UX-002, UX-003, UX-018
  - DEMO-002 (header) → UX-002, UX-092
  - DEMO-003 (footer) → cubierto visualmente por DC-xxx; su prohibición de reset/atribución se verifica en UX-031/UX-090/UX-094
  - DEMO-004 (routing multi-pantalla) → UX-003, UX-006, UX-015, UX-016, UX-017, UX-091
  - DEMO-005 (login) → UX-001, UX-004
  - DEMO-006 (seed dinámico) → UX-060..067
  - DEMO-007 (calendario) → UX-005, UX-006, UX-022, UX-023, UX-044, UX-049, UX-081
  - DEMO-008 (lista pacientes) → UX-008, UX-024, UX-043, UX-045, UX-080, UX-082
  - DEMO-009 (ficha + 6 tabs) → UX-008, UX-009, UX-021, UX-025, UX-033, UX-054, UX-083
  - DEMO-010 (odontograma) → UX-010, UX-028, UX-047, UX-086
  - DEMO-011 (contenido de tabs) → UX-009, UX-046, UX-048, UX-062..065
  - DEMO-012 (tratamientos) → UX-011, UX-052, UX-063
  - DEMO-013 (facturación) → UX-012, UX-013, UX-029, UX-030, UX-051, UX-065
  - DEMO-014 (reportes dashboard) → UX-004, UX-014, UX-053, UX-066
  - DEMO-015 (crear turno 3 pasos) → UX-007, UX-020, UX-021, UX-050, UX-087
  - DEMO-016 (registrar pago) → UX-010, UX-026, UX-027, UX-084, UX-085, UX-089
  - DEMO-017 (estados vacíos/skeletons) → UX-040..043, UX-044, UX-045, UX-051..053, UX-067
  - DEMO-018 (pantallas shell: reagendar, crear presupuesto, reportes detallados, configuración, sub-detalles) → UX-013, UX-014, UX-023b, UX-029, UX-030, UX-031, UX-087, UX-090
  - DEMO-019 (design system) → capa visual, cubierto por DC-xxx en design-criteria.md (no aplica UX-xxx funcional)
  - DEMO-020 (responsive) → UX-018, UX-093
  - DEMO-021 (cero demo) → UX-031, UX-090, UX-094 + sección CRM Tracking (ausencia)
- **DEMO puramente visuales** (DEMO-003 footer en su capa estética, DEMO-019 design system) están cubiertos por DC-xxx en `design-criteria.md`, no aquí. Ningún DEMO-xxx funcional queda sin cobertura.
- **Reglas duras** (multi-pantalla estricto, 1 acción primaria, ≤5 col, 1 filtro, sin drawers, sin modales >50%, tabs solo del mismo objeto con tab inactivo fuera del DOM, pagos + odontograma editables/persistentes, todos los flujos en mobile, cero demo) → aplicadas transversalmente en UX-001..094.
- **CRM tracking**: omitido deliberadamente (REQ-258/272, ADR-7, GAP-A01); QA verifica ausencia.
