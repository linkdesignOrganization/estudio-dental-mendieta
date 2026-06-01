# Arquitectura — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Architect
**Fecha**: 2026-06-01
**Versión**: 1.0
**Proyecto**: Viewcase 02 — frontend-only, sin backend, persistencia en localStorage

---

## Visión General

Estudio Dental Mendieta es un sistema de gestión clínica **completamente frontend, sin backend ni base de datos**. Todo el estado (pacientes, turnos, tratamientos, presupuestos, facturas, documentos, cuenta corriente, configuración) vive en `localStorage` del navegador y persiste entre sesiones. El sistema arranca con un **seed dinámico** generado a partir de las fotos de pacientes (29 fotos: 12 hombres + 17 mujeres, donde el nombre de archivo codifica la edad y la carpeta el género) y permite al usuario **escribir** (crear paciente, agendar/reagendar turno, avanzar estados, registrar pago, editar el estado de piezas del odontograma). Una acción de "Restablecer datos" (en Configuración, con copy de producción) restaura todo al seed.

La decisión arquitectónica más importante es el **routing multi-pantalla estricto**: cada pantalla (lista, detalle, paso de un flujo, creación, edición) tiene una **ruta dedicada y única**; la URL es la fuente de verdad de la vista; el botón atrás del navegador funciona; y cualquier deep-link válido renderiza la pantalla correcta hidratando desde localStorage. Esto corrige explícitamente el anti-patrón del viewcase anterior (todo en una pantalla con drawers y modales gigantes). El sistema **NO** usa drawers como contenido principal, **NO** usa modales >50%, y los tabs de la ficha solo segmentan dimensiones del mismo objeto (el paciente).

La segunda decisión clave es el **presupuesto de performance**: bundle inicial <500KB gzipped y carga <3s en 4G. Se logra con **lazy loading agresivo por módulo de ruta** — el bundle inicial contiene solo el shell (layout + router + capa de persistencia + login); los 5 módulos (Agenda, Pacientes, Tratamientos, Facturación, Reportes), el odontograma y la librería de gráficos de Reportes se cargan bajo demanda. **No hay CRM tracking, analytics, ni telemetría de ningún tipo** — prohibido explícitamente por el cliente (REQ-258, REQ-272); la UI se presenta como producto real en producción.

### Stack Tecnológico
- **Frontend**: **Angular 21** (última estable: `@angular/core` 21.2.x, junio 2026). Standalone components por defecto (sin NgModules), control-flow nativo `@if`/`@for`/`@defer`, **signals** consolidados (`signal`/`computed`/`linkedSignal`/`resource`) y builder `@angular/build` (`application` builder) basado en esbuild/Vite. Requiere Node `^20.19 || ^22.12 || >=24`. Justificación en ADR-1.
- **CSS**: **Bootstrap 5** (grid + utilidades) como base, con una **capa de design tokens propia** (CSS custom properties) que materializa la paleta azul, Red Hat, spacing en múltiplos de 4 y radius 10–14px del `visual-analysis.md`. Bootstrap se importa selectivamente para no inflar el bundle (ver ADR-2).
- **Backend/API**: **Ninguno.** Sin servidor, sin API, sin base de datos. Toda la lógica corre en el cliente.
- **Estado**: Servicios singleton de Angular (`providedIn: 'root'`) con **signals** como store reactivo en memoria, respaldados por un **repositorio de persistencia** que serializa a `localStorage` (ver "Estrategia de Persistencia"). No se usa NgRx (overkill para frontend-only sin side-effects de red).
- **Routing**: Angular Router con rutas lazy (`loadChildren`/`loadComponent`), estrategia de URL `PathLocationStrategy` (HTML5), fallback a `index.html` configurado en Static Web Apps para deep-linking.
- **Iconografía**: **Phosphor** (regular, stroke ~1.5px) — confirmado en design pipeline (GAP-T05). Se carga como SVG sprite/componente, no como webfont completa, para controlar peso.
- **Tipografía**: **Red Hat Display + Red Hat Text**, pesos 400/500, self-hosted (woff2 subseteado) para evitar dependencia de red externa y cumplir <3s.
- **Gráficos (Reportes)**: librería ligera de charts (ej. **Chart.js** o **ApexCharts**) cargada **solo** en el módulo Reportes vía lazy load, nunca en el bundle inicial (ADR-7).
- **Deploy**: **Azure Static Web Apps**, URL default `*.azurestaticapps.net`, **sin dominio propio** (NFR-013). CI/CD gestionado por DevOps.

---

## Estructura de Módulos

```
src/
├── app/
│   ├── core/                         # Singletons, NO lazy — bundle inicial
│   │   ├── persistence/
│   │   │   ├── storage.service.ts          # Wrapper localStorage (get/set/remove, namespace + versión)
│   │   │   ├── store.service.ts            # Store en memoria (signals) + sync a storage
│   │   │   ├── repository.ts               # Repos genéricos por entidad (CRUD sobre el store)
│   │   │   └── schema-version.ts           # Versión de schema + migración/limpieza
│   │   ├── seed/
│   │   │   ├── seed.service.ts             # Orquesta generación del seed al 1er arranque y en reset
│   │   │   ├── manifest.loader.ts          # Carga assets/seed/manifest.json (fotos + documentos)
│   │   │   ├── generators/                 # Generadores deterministas por entidad
│   │   │   │   ├── patient.generator.ts        # Nombre AR, DNI, obra social, edad, género, historial
│   │   │   │   ├── odontogram.generator.ts     # 32 piezas coherentes con la edad
│   │   │   │   ├── appointment.generator.ts    # ≥50 turnos con distribución de estados
│   │   │   │   ├── treatment.generator.ts      # ≥40 tratamientos + planes
│   │   │   │   ├── billing.generator.ts        # ≥20 presupuestos, ≥25 facturas, cuenta corriente
│   │   │   │   ├── document.generator.ts       # 40–60 documentos desde pool de ~15 imágenes
│   │   │   │   └── catalog.generator.ts        # ≥12 tipos de tratamiento, 6 profesionales, 6 obras sociales
│   │   │   ├── ar-data.ts                  # Pools: apellidos/nombres AR por generación, obras sociales
│   │   │   └── prng.ts                     # RNG con semilla fija (seed reproducible)
│   │   ├── models/                         # Interfaces TypeScript de todas las entidades
│   │   ├── services/                       # Servicios de dominio (notifications, clock/relative-time, money)
│   │   └── guards/                         # SeedReadyGuard (asegura store hidratado antes de render)
│   │
│   ├── shared/                       # Reutilizable, NO lazy (o lazy fino) — usado por todos
│   │   ├── components/
│   │   │   ├── app-shell/                  # Layout: header + sidebar + <router-outlet>
│   │   │   ├── header/                     # Header persistente (logo, módulo activo, notif, avatar AD)
│   │   │   ├── sidebar/                    # 5 items + Config/Ayuda; drawer en mobile
│   │   │   ├── footer/                     # Footer discreto (versión, metadatos)
│   │   │   ├── status-badge/               # Badge pastel de estado (turno/tratamiento/pago)
│   │   │   ├── priority-pill/              # Pill de prioridad pastel
│   │   │   ├── avatar/ + avatar-stack/     # Avatar circular + overlapping +N
│   │   │   ├── data-table/                 # Tabla ≤5 col, paginación offset, skeletons
│   │   │   ├── empty-state/                # Estado vacío con guidance + 1 acción
│   │   │   ├── skeleton/                   # Skeletons (NO spinners)
│   │   │   ├── toast/ + toast.service.ts   # Toasts de éxito tras acción
│   │   │   ├── confirm-dialog/             # Modal de confirmación <50%, ≤3 campos
│   │   │   ├── filter-panel/               # 1 filtro visible + panel desplegable
│   │   │   ├── stepper/                    # Indicador de progreso para flujos multi-paso
│   │   │   ├── progress-card/              # Card con % grande (peso 500) + barra
│   │   │   ├── icon/                        # Wrapper Phosphor (16/20/24px)
│   │   │   └── photo/                       # Foto de paciente con fallback a iniciales
│   │   ├── pipes/                          # relativeTime, arsCurrency (ARS), dni, fdiTooth
│   │   └── directives/                     # focusRing, touchTarget, autofocus
│   │
│   ├── features/                     # Feature modules — TODOS lazy loaded
│   │   ├── auth/                           # Login (Feature 1.1)
│   │   ├── agenda/                         # Épica 3 (calendario, detalle, crear 3 pasos, reagendar, lista día)
│   │   ├── patients/                       # Épicas 4, 5, 6 (lista, ficha 6 tabs, crear/editar, sub-detalles)
│   │   ├── treatments/                     # Épica 7 (lista activos, catálogo, detalle tipo)
│   │   ├── billing/                        # Épica 8 (presupuestos, facturas, obras sociales)
│   │   ├── reports/                        # Épica 9 (dashboard KPI + 4 reportes con gráficos) — chart lib aquí
│   │   └── settings/                       # Configuración (incl. Restablecer datos — REQ-264)
│   │
│   ├── layout/                       # Definición de rutas raíz + shell wiring
│   └── app.routes.ts                 # Rutas top-level con loadChildren lazy
│
└── assets/
    ├── seed/
    │   ├── manifest.json                   # Generado: lista fotos (genero+edad) + pool de documentos
    │   ├── patients/{hombres,mujeres}/*.jpg # Fotos copiadas de input/mockpeople en build
    │   └── documents/*.jpg                  # Pool ~15 imágenes (10 radiografías + 5 fotos clínicas)
    ├── fonts/                              # Red Hat Display/Text woff2 subseteado
    ├── icons/                              # Phosphor SVG (subset usado)
    └── styles/
        ├── tokens.css                      # Design tokens (paleta, spacing, radius, sombras)
        └── theme.css                       # Overrides Bootstrap + estilos globales
```

### Módulos del Proyecto

| Módulo | Responsabilidad | Lazy Load | Dependencias |
|---|---|---|---|
| core | Persistencia (storage/store/repos), seed dinámico, modelos, servicios de dominio, guards | No | - |
| shared | Componentes/pipes/directivas reutilizables (shell, tabla, badges, toast, etc.) | No (componentes standalone, tree-shakeable) | core |
| auth | Login sin autenticación real, carga de seed, entrada al sistema | Sí | core, shared |
| agenda | Calendario (mes/semana/día), detalle de turno, crear turno (3 pasos), reagendar, lista del día | Sí | core, shared |
| patients | Lista, ficha con 6 tabs, odontograma interactivo, crear (2 pasos), editar, sub-detalles (pieza/evento/plan) | Sí | core, shared |
| treatments | Lista de activos, catálogo de tipos, detalle de tipo | Sí | core, shared |
| billing | Presupuestos (lista/detalle/crear 3 pasos), facturas (lista/detalle), obras sociales (cards/detalle) | Sí | core, shared |
| reports | Dashboard KPI (máx 6) + 4 reportes con gráficos (lib de charts vive aquí) | Sí | core, shared |
| settings | Configuración + acción "Restablecer datos" (reset al seed) | Sí | core, shared |
| layout | App shell (header + sidebar + outlet), wiring de rutas raíz | No | core, shared |

> El **odontograma** (32 piezas SVG interactivo) vive dentro de `patients` pero se aísla en un sub-componente lazy (`@defer`) para no penalizar la carga inicial de la ficha y respetar NFR-004 (32 piezas sin lag).

---

## Modelo de Datos (entidades en localStorage)

Todo el estado se serializa bajo un **namespace versionado**: clave raíz `edm:v1:state` (Estudio Dental Mendieta, schema v1). Las entidades son colecciones normalizadas (arrays de objetos con `id` string tipo `pac-001`, `tur-001`, etc.) referenciadas por id. El store en memoria expone signals; el repositorio persiste el árbol completo (o por colección) en cada mutación de forma debounced (ADR-4).

### Entidades

| Entidad | Campos clave | Relaciones | Origen seed |
|---|---|---|---|
| **Clinic** (singleton) | nombre, CUIT (30-71234567-8), dirección, logo, versión | - | REQ-056 |
| **Professional** | id, nombre, especialidad, añosExperiencia, avatar | - | 6 fijos (REQ-057) |
| **ObraSocial** | id, nombre, logoPlaceholder | ← pacientes, facturas | 6 fijas (REQ-058) |
| **Patient** | id, nombre, género, edad/fechaNac, dni, fotoPath, obraSocialId, profesionalCabeceraId, contacto, contactoEmergencia, alergias[], medicación[], observaciones, estadoCuenta(derivado) | obraSocial, profesional; → odontograma, turnos, tratamientos, documentos, eventos, movimientos | dinámico desde fotos (29) |
| **Tooth** (dentro de Odontogram por paciente) | numeroFDI (11–48), numeroUniversal (1–32), estado (sana/caries/obturación/ausente/en-tratamiento/prótesis), procedimientos[] | ← patient | REQ-053, coherente con edad |
| **Appointment** (turno) | id, pacienteId, profesionalId, fecha, hora, duración, tipoTratamientoId, estado (confirmado/en-espera/atendiendo/terminado/cancelado), notas | patient, professional, treatmentType | ≥50 (REQ-058) |
| **TreatmentType** (catálogo) | id, nombre, descripción, costoRef, duraciónEst, pasos[], materiales[], profesionalesHabilitados[] | - | ≥12 fijos (REQ-199) |
| **TreatmentPlan** (tratamiento del paciente) | id, pacienteId, tipoId, profesionalId, etapas[]{nombre, completada}, etapasTotales, etapasCompletadas, costo, estado(activo/completado), próximaFecha | patient, type, professional | ≥40 (REQ-058) |
| **ClinicalEvent** (historial) | id, pacienteId, fecha, tipo, profesionalId, descripción | patient, professional | variable por edad (REQ-052) |
| **Document** | id, pacienteId, nombre, thumbnailPath, fullPath, tipo(radiografía/foto) | patient | 40–60 desde pool ~15 (REQ-058) |
| **Budget** (presupuesto) | id, pacienteId, fechaEmisión, tratamientos[], costoDesglosado, total, condiciones, vencimiento, estado (pendiente/aprobado/rechazado/vencido) | patient | ≥20 (REQ-058) |
| **Invoice** (factura) | id, pacienteId, numero, fechaEmisión, items[], totales, estado (emitida/pagada/vencida/anulada), obraSocialId? | patient, obraSocial | ≥25 últimos 60 días (REQ-058) |
| **AccountMovement** (cuenta corriente) | id, pacienteId, fecha, concepto, monto, signo (cargo/pago), medioPago? | patient | mezcla al-día/deuda (REQ-055) |
| **Notification** | id, tipo (turno/pago/cumpleaños/tratamiento), título, subtítulo, fecha, leída | patient? | derivado del estado |
| **Settings** (singleton) | preferencias UI, versión schema | - | defaults |

**Notas de modelo:**
- `estadoCuenta` del paciente (al día / con deuda / vencido) es **derivado** del saldo de sus `AccountMovement`, no se almacena duplicado — garantiza coherencia entre el badge de la lista y el tab Pagos (REQ-163, REQ-262).
- El estado de cada `Tooth` es **fuente de verdad** del odontograma; editarlo (REQ-267/268) muta directamente la colección y el odontograma re-renderiza desde el store.
- Numeración dental **FDI primaria** (cuadrantes 1–4, piezas 1–8 → 11..48) + universal 1–32 como tooltip (GAP-T03, REQ-137).
- Montos siempre en **ARS** formateados con pipe `arsCurrency` (REQ-162, REQ-203, REQ-242).

---

## Estrategia de Persistencia y Reset

### Persistencia (Épica 2)
1. **Capa de storage** (`storage.service.ts`): wrapper único sobre `localStorage` con namespace `edm:` + versión de schema. Maneja serialización JSON, manejo de cuota llena / modo privado (REQ-040: degrada a estado en memoria con aviso, sin crashear), y nunca bloquea la UI (escrituras debounced, ADR-4 — cumple NFR-005).
2. **Store reactivo** (`store.service.ts`): mantiene el estado completo en **signals** en memoria. Las pantallas leen del store (no de localStorage directo). Toda mutación pasa por el repositorio.
3. **Hidratación al arranque**: al iniciar la app, el store intenta leer `edm:v1:state` de localStorage. Si existe → hidrata. Si no existe → dispara la generación del seed (ver abajo). Un `SeedReadyGuard` asegura que el store esté hidratado antes de renderizar cualquier ruta interna (cubre deep-linking REQ-031/124: incluso entrando directo a `/pacientes/pac-007`, el seed se hidrata primero).
4. **Versionado de schema** (REQ-041): la clave incluye `v1`. Si una build futura sube a `v2` y encuentra `v1`, ejecuta migración o reset limpio (decisión: para un viewcase, reset limpio al seed nuevo es aceptable y se documenta).

**Qué persiste** (cada una sobrevive a refresh y cierre del navegador): crear paciente (REQ-033), agendar turno (REQ-034), avanzar estado de turno (REQ-035), avanzar etapa de tratamiento (REQ-036), registrar pago (REQ-037/261), aprobar presupuesto / cambiar estado factura (REQ-038), editar ficha (REQ-039), editar estado de pieza del odontograma (REQ-268).

### Reset al seed (REQ-264/265/266)
- La acción vive **exclusivamente en Configuración**, con copy de producción ("Restablecer datos" / "Restaurar configuración inicial"), **sin** la palabra demo/mock/simulación en label, descripción, confirmación ni toast.
- **NO** existe en el footer ni en ningún otro lugar (REQ-027/266).
- Flujo: clic → modal de confirmación explícita advirtiendo pérdida de cambios → al confirmar, `seed.service` borra `edm:v1:state`, regenera el seed completo de forma determinista (mismo resultado que el primer arranque) y rehidrata el store → toast de éxito con copy de producción.

---

## Carga del Seed Dinámico (Feature 2.2)

El seed **NO** hardcodea la cantidad de pacientes; la deriva de las fotos presentes. Pipeline:

### 1. Generación del `manifest.json` (build-time)
Un script de build (`scripts/generate-manifest.mjs`, ejecutado por DevOps en el pipeline / `prebuild`) recorre `input/mockpeople/{hombres,mujeres}/`, ignora no-imágenes (`.DS_Store`), y para cada foto válida produce una entrada con: `path`, `genero` (de la carpeta), `edad` (del nombre de archivo, soportando sufijos `23-1.jpg`/`23-2.jpg` → REQ-047). El mismo script copia las fotos a `assets/seed/patients/...` y arma el pool de documentos en `assets/seed/documents/`. El manifest queda en `assets/seed/manifest.json` (NFR-033). **Set actual entregado: 29 pacientes** (12 hombres: edades 1,2,4,5,28,30,33,35,40,43,76,80 · 17 mujeres: 3,4,7,14,22,23,25,32,55,62,65,67,68,70,72,80,85).

> Nota: por ser SWA estático sin backend, la lectura de carpetas ocurre en **build-time** (no en runtime) y se materializa en `manifest.json`. En runtime el navegador hace `fetch('assets/seed/manifest.json')`. Si en el futuro se agregan/quitan fotos, basta re-correr el script y re-desplegar; la cantidad de pacientes se ajusta sola (REQ-042/043).

### 2. Generación del estado seed (runtime, 1er arranque o reset)
`seed.service` ejecuta los generadores en orden de dependencias, todos con un **PRNG de semilla fija** (`prng.ts`) para que el seed sea **reproducible** (mismo seed siempre → mismos datos, importante para QA y para que el reset devuelva exactamente el estado original):

1. **Datos fijos**: Clinic (REQ-056), 6 Professionals (REQ-057), 6 ObrasSociales + ≥12 TreatmentTypes (REQ-058/199).
2. **Patients** (REQ-048..055): por cada entrada del manifest → nombre argentino plausible coherente con edad y género (apellidos por generación), DNI formato AR, obra social con distribución típica, profesional de cabecera, foto del path.
3. **Odontograma por paciente** (REQ-053/136): 32 piezas con estado coherente con la edad (niños con piezas de leche, adultos mayores con ausencias/prótesis; mezcla sano/tratado/activo). Paciente nuevo → todas "sana" (REQ-140).
4. **Historial clínico** variable por edad (REQ-052), **Tratamientos** ≥40 coherentes con edad (REQ-054), **Documentos** 40–60 repartiendo el pool de ~15 imágenes (REQ-058, GAP-T08).
5. **Facturación**: ≥20 Budgets, ≥25 Invoices (últimos 60 días), AccountMovements por paciente con mezcla al-día/deuda (REQ-055/058).
6. **Turnos** ≥50 con distribución de estados ~30% confirmados/en-espera futuros, ~50% terminados pasados, ~10% atendiendo/hoy, ~10% cancelados (REQ-058, GAP-T07).
7. **Notificaciones** derivadas (turnos por confirmar, pagos vencidos, cumpleaños, tratamientos por vencer).

Histórico mínimo de **60 días** (NFR-031) y edge cases representados (pacientes nuevos sin historial, con deuda, boca sana vs con tratamientos — NFR-032).

---

## Decisiones de Arquitectura (ADRs)

### ADR-1: Framework frontend — Angular 21 (standalone)
- **Contexto**: El BA delega la elección al Architect (GAP-T02); lo vinculante son los NFR (bundle <500KB gzipped, lazy loading, routing multi-pantalla con deep-linking). El default del equipo es Angular. La app es grande (5 módulos, ficha de 6 tabs, odontograma interactivo, ~40 pantallas, formularios multi-paso). Es un **proyecto nuevo en 2026**, por lo que se parte de la **última versión estable** del framework, no de una versión antigua.
- **Decisión**: **Angular 21** (última estable confirmada: `@angular/core` 21.2.x, junio 2026) con **standalone components** (por defecto, sin NgModules), control-flow nativo (`@if`/`@for`/`@defer`), **signals** como API de estado consolidada, Angular Router con rutas lazy (`loadComponent`/`loadChildren`), y el `application` builder de `@angular/build` (esbuild/Vite). Toolchain sobre Node `^20.19 || ^22.12 || >=24`.
- **Justificación**: (1) **Proyecto nuevo → última estable**: arrancar en la versión vigente evita deuda técnica de día cero y un upgrade inmediato; standalone, signals y el nuevo control-flow ya están **consolidados y estables** en Angular 21 (no son experimentales como en 17), por lo que la arquitectura usa las APIs vigentes sin riesgo de churn. (2) **Favorable al budget <500KB gzipped**: las versiones recientes traen mejor **tree-shaking** y un runtime más liviano gracias a la migración completa a esbuild/Vite y a la eliminación progresiva de dependencias internas (p. ej. menor superficie de `zone.js`), lo que reduce el initial chunk frente a Angular 17. (3) El router con `loadComponent`/`loadChildren` da lazy loading por ruta de forma idiomática, manteniendo el **bundle inicial** acotado al shell. (4) `@defer` permite diferir el odontograma y las charts. (5) Es el default del equipo → menor riesgo de ejecución, convenciones existentes, mejor mantenibilidad. **El presupuesto <500KB gzipped es alcanzable** porque el bundle inicial solo carga Angular core + router + shell + login; cada módulo de feature y la librería de gráficos viven en chunks separados.
- **Alternativas descartadas**: **Angular 17/versiones antiguas** (innecesario para un proyecto nuevo; menor tree-shaking y APIs aún no consolidadas → deuda técnica inmediata). **Preact/SolidJS** (bundle más chico pero fuera del stack del equipo, mayor riesgo, sin ganancia real dado que el cuello no es el runtime sino el contenido lazy). **React** (viable, pero Angular es el default y trae router + forms + DI integrados, evitando ensamblar el stack). **Angular con NgModules clásicos** (más boilerplate; standalone es la dirección actual y el default en Angular 21).
- **Riesgo y mitigación**: el peso base de Angular sigue siendo mayor que el de micro-frameworks. Mitigación: **budget de bundle configurado en `angular.json`** (warning a 450KB, error a 500KB gzipped sobre el initial), lazy de TODO excepto shell, fuentes/iconos subseteados, charts solo en Reportes. Se valida en CI. El upgrade a Angular 21 desde el default del equipo no introduce cambios de arquitectura: standalone/signals/control-flow/lazy ya eran la dirección elegida y aquí simplemente están en su forma vigente.

### ADR-2: Bootstrap 5 selectivo + capa de tokens propia
- **Contexto**: Bootstrap 5 es el default de CSS del equipo, pero el `visual-analysis.md` prescribe un design system muy específico (paleta azul de 4 tonos, Red Hat 400/500, radius 10–14px, "borde O sombra, no ambos", spacing múltiplos de 4). Importar todo Bootstrap inflaría el bundle y sus defaults (sombras, radius, tipografía) chocan con el brief.
- **Decisión**: Usar Bootstrap 5 **solo por su grid y un subconjunto de utilidades** (layout responsive, flex, spacing), importado de forma selectiva vía SCSS (no el CSS completo). Encima, una **capa de design tokens** en `tokens.css` (CSS custom properties) que define la paleta, tipografía, radius, sombras y spacing del brief, y **sobreescribe** los defaults de Bootstrap que violan los anti-patrones (radius >14px, sombras Material, Inter).
- **Justificación**: Aprovecha el default del equipo para el sistema de grid responsive (clave para "todos los flujos usables en mobile") sin heredar su estética. Los tokens centralizan el design system y facilitan que el Design Team materialice el `design-criteria.md`.
- **Alternativas descartadas**: **Bootstrap completo sin tokens** (viola anti-patrones #1/#3/#6/#7 por defecto, infla bundle). **CSS puro sin framework** (perdería el grid responsive maduro y el default del equipo, más trabajo para responsive).

### ADR-3: Estado con signals + repositorio sobre localStorage (sin NgRx)
- **Contexto**: Hay que mantener un estado rico (13 entidades) reactivo y persistirlo, pero **no hay red ni side-effects asíncronos** (todo es síncrono sobre localStorage). NgRx está pensado para apps con efectos de red y flujos complejos.
- **Decisión**: Un `StoreService` singleton con **signals** como única fuente de verdad en memoria, expuesto a las pantallas como señales de solo-lectura/computed. Las mutaciones pasan por repositorios (`repository.ts`) que actualizan el signal y disparan persistencia debounced.
- **Justificación**: Simplicidad > flexibilidad. Signals dan reactividad fina sin boilerplate de actions/reducers/effects. La derivación de `estadoCuenta` y KPIs se hace con `computed()`, garantizando coherencia (REQ-170/234/262). Menos código = menos superficie de bug en un viewcase.
- **Alternativas descartadas**: **NgRx Store/Effects** (overkill sin efectos de red, más boilerplate). **Servicios con BehaviorSubject** (válido, pero signals es la dirección moderna de Angular y se integra mejor con el change detection sin zona).

### ADR-4: Persistencia debounced y no-bloqueante
- **Contexto**: NFR-005 exige que lecturas/escrituras de localStorage no bloqueen la UI de forma perceptible. Escribir todo el árbol en cada tecla de un formulario sería costoso.
- **Decisión**: Las mutaciones actualizan el store en memoria **de inmediato** (UI reactiva instantánea) y la **serialización a localStorage se hace debounced** (~150–300ms) y por lotes. Persistencia explícita inmediata solo en acciones de confirmación (guardar paciente, confirmar turno, registrar pago).
- **Justificación**: La UI nunca espera al disco; el costo de `JSON.stringify` del árbol se amortiza. Para un dataset de viewcase el árbol es pequeño (<1–2MB), bien dentro de la cuota de localStorage.
- **Alternativas descartadas**: **IndexedDB** (async, más robusto para grandes volúmenes, pero el brief dice localStorage explícitamente y el volumen no lo requiere). **Escritura síncrona en cada cambio** (riesgo de jank en formularios).

### ADR-5: Routing multi-pantalla estricto con deep-linking y fallback SWA
- **Contexto**: PRIORIDAD MÁXIMA del cliente (Épica 1, Feature 1.5, NFR-006..009). Corrige el error del viewcase anterior. Cada acción debe tener su ruta; el botón atrás debe funcionar; el deep-link debe hidratar desde localStorage; nada de drawers/modales como contenido principal.
- **Decisión**: Cada pantalla = una ruta dedicada. Flujos multi-paso = **una ruta por paso** (ej. `/agenda/nuevo/paciente`, `/agenda/nuevo/profesional`, `/agenda/nuevo/confirmar`), no un modal multi-step. La ficha del paciente y sus tabs reflejan el tab en la URL (`/pacientes/:id/odontograma`). Estado del wizard preservado entre pasos vía un servicio de flujo scoped a la ruta padre (preserva datos al ir "Atrás", REQ-084/177/219). `PathLocationStrategy` + **fallback a `index.html`** en `staticwebapp.config.json` (provisto por DevOps) para que deep-links como `*.azurestaticapps.net/pacientes/pac-007/pagos` rendericen correctamente (NFR-013).
- **Justificación**: Es el requisito estructural #1 y la médula de la propuesta de valor. El Router de Angular lo soporta nativamente (guards, resolvers, rutas hijas, lazy).
- **Alternativas descartadas**: **SPA con modales/drawers para sub-vistas** (explícitamente prohibido, anti-patrón #13/#14, NFR-009). **HashLocationStrategy** (URLs feas con `#`, peor para "la URL refleja el estado"; con fallback de SWA no es necesario).

### ADR-6: Lazy loading por feature module + diferido del odontograma y charts
- **Contexto**: NFR-002/003 (bundle <500KB, lazy de módulos secundarios) y NFR-004 (odontograma sin lag). El odontograma (32 piezas SVG) y la librería de gráficos de Reportes son los componentes más pesados.
- **Decisión**: Los 7 features (auth, agenda, patients, treatments, billing, reports, settings) se cargan vía `loadChildren` **solo al navegar a su ruta**. Dentro de `patients`, el odontograma se carga con `@defer` (al activar el tab Odontograma). La librería de charts se importa **solo** dentro del módulo `reports`.
- **Justificación**: El bundle inicial queda reducido al shell + login. Reportes (con charts, lo más pesado) no penaliza a quien nunca entra. El odontograma no penaliza la apertura de la ficha.
- **Alternativas descartadas**: **Eager loading de todo** (rompe el budget). **Cargar charts en el bundle común** (penaliza a todos los módulos).

### ADR-7: Sin tracking/analytics, sin backend, sin auth real
- **Contexto**: El cliente prohíbe explícitamente analytics/tracking (REQ-258) y cualquier rastro de "demo/mock" (REQ-272); no hay autenticación real ni roles (solo vista administradora); no hay APIs externas ni integración fiscal (ARCA/AFIP — REQ-224/258).
- **Decisión**: **Cero** dependencias de telemetría, CRM, analytics o SDKs de tracking en cualquier fase. El login es un botón que carga seed y navega (sin validar credenciales, REQ-004). La "notificación de WhatsApp" al reagendar es un mensaje de UI presentado como real, **sin** envío real ni texto que lo delate (REQ-089). Facturas/presupuestos son entidades internas, nunca mencionan organismos fiscales.
- **Justificación**: Requisito duro del cliente y de la naturaleza frontend-only. Reduce superficie y peso del bundle.
- **Alternativas descartadas**: Ninguna — es una restricción, no una elección.

### ADR-8: Seed reproducible con PRNG de semilla fija
- **Contexto**: El seed debe ser realista y variado (NFR-030/032) pero también **estable**: el reset debe devolver exactamente el estado original (REQ-265), y QA necesita datos predecibles para escribir tests.
- **Decisión**: Toda la aleatoriedad del seed pasa por un **PRNG con semilla fija** (`prng.ts`, ej. mulberry32). Mismo seed → mismos pacientes, turnos, montos, estados, siempre.
- **Justificación**: Determinismo = reset fiel + tests estables + builds reproducibles. La variedad se logra con la lógica de los generadores (coherencia por edad), no con aleatoriedad no controlada.
- **Alternativas descartadas**: `Math.random()` sin semilla (seed distinto en cada arranque/reset, rompe REQ-265 y dificulta QA).

---

## Plan de Iteraciones

### Fase de Construcción Visual (FASE 4) — Criterios DEMO
**Scope**: Frontend-only con datos mock. Todas las pantallas del `design-criteria.md` navegables con el estilo visual definitivo (Red Hat, paleta azul, radius 10–14px, soft-UI Task Dasher). Los 1–2 flujos críticos son interactivos con datos mock (el seed dinámico ya se carga). Features no implementados visibles como shell (estados vacíos, placeholders). **Sin tracking de ningún tipo** (prohibido). Presentado como producto real (cero rastro de demo).
**Entregable**: Aplicación desplegada en `*.azurestaticapps.net` que el cliente navega para validar estructura, multi-pantalla, flujos y estilo visual antes del desarrollo funcional completo.

> **Nota crítica**: este proyecto **NO incluye CRM tracking** (REQ-258/272, §12 del brief lo prohíbe). El template estándar incluye un DEMO de CRM tracking — aquí se **omite deliberadamente**. No hay criterio DEMO de analytics/tracking en ninguna fase.

| ID | Feature | Criterio de demo | Origen |
|---|---|---|---|
| DEMO-001 | Shell — Sidebar | Sidebar con 5 items (Agenda, Pacientes, Tratamientos, Facturación, Reportes) + Configuración/Ayuda, icono+label siempre visible, item activo destacado | REQ-017, REQ-018, REQ-019, REQ-020 |
| DEMO-002 | Shell — Header | Header persistente con logo (isotipo+wordmark "Estudio Dental Mendieta"), nombre del módulo activo, notificaciones con badge y avatar "AD"; sin búsqueda global ni "demo" | REQ-008, REQ-009, REQ-010, REQ-011, REQ-012, REQ-013 |
| DEMO-003 | Shell — Footer | Footer discreto con versión y metadatos, sin atribución a portfolio, sin "Resetear demo", sin lenguaje de demo | REQ-025, REQ-026, REQ-027, REQ-028 |
| DEMO-004 | Routing multi-pantalla | Cada pantalla tiene ruta dedicada; botón atrás funciona; deep-link a una URL interna renderiza desde localStorage | REQ-029, REQ-030, REQ-031 |
| DEMO-005 | Login | Pantalla de login con botón "Ingresar como administradora" + link "Saltar login"; sin credenciales reales; carga seed y entra | REQ-001, REQ-002, REQ-003, REQ-004 |
| DEMO-006 | Seed dinámico cargado | El sistema arranca con el seed generado desde las 29 fotos (12 H + 17 M, edad del nombre de archivo, género de la carpeta); fotos visibles en lista y ficha | REQ-042, REQ-043, REQ-044, REQ-045, REQ-046 |
| DEMO-007 | Agenda — Calendario | Vista mensual por default con toggles mes/semana/día; turnos como bloques coloreados por estado; header con filtro por profesional + "Nuevo turno" | REQ-059, REQ-060, REQ-061, REQ-062 |
| DEMO-008 | Pacientes — Lista | Tabla ≤5 columnas (foto, nombre, obra social, próximo turno, estado de cuenta) con buscador inline, paginación (no infinite scroll) y "Nuevo paciente" | REQ-098, REQ-099, REQ-100, REQ-103 |
| DEMO-009 | Pacientes — Ficha (cabecera + 6 tabs) | Cabecera con foto grande, nombre, datos, badges de alerta, 1 acción primaria "Agendar turno"; barra de 6 tabs (Info, Odontograma, Historial, Tratamientos, Documentos, Pagos), tab inactivo no en DOM | REQ-109, REQ-112, REQ-116, REQ-117, REQ-118 |
| DEMO-010 | Odontograma interactivo | Diagrama de 32 piezas con estado visual por pieza + leyenda; clic en pieza navega a su detalle (ruta dedicada) | REQ-132, REQ-133, REQ-134, REQ-135 |
| DEMO-011 | Tabs de la ficha (contenido) | Los 6 tabs renderizan su contenido (Info en cards aireadas, Historial timeline, Tratamientos activos/completados, Documentos en grilla, Pagos con resumen + movimientos) | REQ-128, REQ-141, REQ-148, REQ-155, REQ-161 |
| DEMO-012 | Tratamientos | Lista de activos ≤5 columnas + catálogo de tipos en cards aireadas (≥12 tipos) | REQ-192, REQ-198, REQ-199 |
| DEMO-013 | Facturación | Lista de presupuestos y de facturas (≤4–5 col, badges de estado) + obras sociales en cards aireadas (logo, pacientes, deuda) | REQ-206, REQ-210, REQ-221, REQ-227 |
| DEMO-014 | Reportes — Dashboard | Dashboard con ≤6 KPI cards clickeables (pacientes nuevos, turnos, tratamientos, ingresos, cobrado, deuda) con valores calculados del estado | REQ-232, REQ-233, REQ-234 |
| DEMO-015 | Flujo crítico 1 — Crear turno (3 pasos) | Flujo recorrible de inicio a fin con 3 rutas (paciente → profesional/fecha → confirmación), indicador de progreso, confirma y persiste | REQ-078, REQ-079, REQ-080, REQ-082, REQ-083, REQ-087 |
| DEMO-016 | Flujo crítico 2 — Registrar pago | Desde el tab Pagos, "Registrar pago" en ruta dedicada; valida monto positivo; persiste; saldo y badge se actualizan; toast | REQ-164, REQ-259, REQ-260, REQ-261, REQ-262 |
| DEMO-017 | Estados vacíos y skeletons | Listas/secciones que pueden quedar vacías muestran estado vacío con guidance; al cargar muestran skeletons (no spinners) | REQ-066, REQ-105, REQ-145, REQ-250, REQ-251 |
| DEMO-018 | Pantallas shell (resto) | Secciones aún no funcionales completas (reagendar, crear presupuesto, reportes detallados, configuración, sub-detalles) visibles como shell navegable con su layout y placeholders coherentes | Estructural |
| DEMO-019 | Design system aplicado | Tokens CSS del design-criteria: paleta azul (4 tonos), Red Hat 400/500, spacing múltiplos de 4, radius 10–14px, borde O sombra, iconos Phosphor 16/20/24 | Estructural (BVC-001..006, BVC-014) |
| DEMO-020 | Responsive desktop + mobile | Todas las pantallas se adaptan desktop/tablet/mobile; sidebar → drawer en mobile; touch target ≥44px; sin scroll horizontal | REQ-016, REQ-023, REQ-107, REQ-252, REQ-253, REQ-254 |
| DEMO-021 | Cero rastro de demo/mock | Ningún texto/elemento de la UI (header, footer, login, toasts, vacíos, configuración) revela demo/mock/simulación/viewcase; presentado como producción real | REQ-011, REQ-026, REQ-027, REQ-272 |

> 21 criterios DEMO. Los REQ-IDs del BA se asignan a partir de Iteración 1 (abajo). Cada DEMO-xxx funcional tendrá cobertura en `design-criteria.md` (DC-xxx, capa visual) y/o `ux-criteria.md` (UX-xxx, capa funcional — 2da invocación de este Architect).

---

### Iteración 1: Fundación — Shell, Routing, Persistencia y Seed
**Scope**: La base sobre la que todo se construye. App shell (header/sidebar/footer), routing multi-pantalla con deep-linking, capa de persistencia versionada en localStorage, generación del seed dinámico desde las fotos, login y el sistema de feedback transversal (toasts, confirmaciones, estados vacíos, skeletons). Configuración con "Restablecer datos".
**Entregable**: App navegable con el shell completo, login, datos seed cargados y persistentes, y reset funcional. Es el esqueleto vivo.

| Feature | Criterios cubiertos | Dependencias |
|---|---|---|
| Login y entrada | REQ-001 a REQ-007 | - |
| Header persistente | REQ-008 a REQ-016 | - |
| Sidebar de navegación | REQ-017 a REQ-024 | - |
| Footer | REQ-025 a REQ-028 | - |
| Routing multi-pantalla (estructural) | REQ-029 a REQ-031; NFR-006..009 | - |
| Persistencia en localStorage | REQ-032 a REQ-041 | Routing |
| Seed dinámico desde fotos | REQ-042 a REQ-055 | Persistencia |
| Datos seed mínimos + reset | REQ-056, REQ-057, REQ-058 | Seed |
| Restablecer datos (Configuración) | REQ-264, REQ-265, REQ-266 | Seed, Persistencia |
| Feedback transversal (toasts, confirmaciones, vacíos, skeletons) | REQ-247, REQ-248, REQ-250, REQ-251 | Shell |
| Anti-patrones y "cero demo" (red de seguridad inicial) | REQ-257, REQ-258, REQ-272 | Shell |

---

### Iteración 2: Pacientes — Lista, Ficha y Tabs de lectura (la pieza fuerte)
**Scope**: El centro del sistema. Lista de pacientes (tabla ≤5 col + buscador + paginación), cabecera de la ficha, barra de 6 tabs con deep-linking, y el contenido **de lectura** de los 6 tabs (Info general, Odontograma con detalle de pieza —lectura—, Historial, Tratamientos, Documentos, Pagos —resumen lectura—). Sub-detalles: detalle de pieza (lectura), evento clínico, plan.
**Entregable**: Ficha del paciente completa y navegable (la pantalla-firma), con odontograma visible e interactivo en navegación. Lista funcional con búsqueda y paginación.

| Feature | Criterios cubiertos | Dependencias |
|---|---|---|
| Lista de pacientes | REQ-098 a REQ-108 | It. 1 (seed, shell) |
| Cabecera de la ficha | REQ-109 a REQ-115 | Lista |
| Barra de tabs + navegación/deep-linking | REQ-116 a REQ-127 | Cabecera |
| Tab 1 — Información general | REQ-128 a REQ-131 | Tabs |
| Tab 2 — Odontograma (lectura + navegación a pieza) | REQ-132 a REQ-140 | Tabs |
| Tab 3 — Historial clínico | REQ-141 a REQ-147 | Tabs |
| Tab 4 — Tratamientos del paciente | REQ-148 a REQ-154 | Tabs |
| Tab 5 — Documentos | REQ-155 a REQ-160 | Tabs |
| Tab 6 — Pagos (resumen + movimientos, lectura) | REQ-161 a REQ-168 | Tabs |
| Coherencia transversal de tabs | REQ-169 a REQ-172 | Todos los tabs |
| Detalle de pieza dental (lectura) | REQ-186, REQ-187, REQ-188 | Odontograma |
| Detalle de evento clínico y de plan | REQ-189, REQ-190, REQ-191 | Historial, Tratamientos |

---

### Iteración 3: Agenda — Calendario y flujos de turnos
**Scope**: Módulo Agenda completo. Calendario (mes/semana/día), detalle de turno con avance de estado, crear turno (flujo 3 pasos en rutas dedicadas con validación de slots), reagendar (con notificación de WhatsApp presentada como real), lista del día.
**Entregable**: Operación de agenda viva: ver, crear, avanzar, reagendar y cancelar turnos, todo persistente.

| Feature | Criterios cubiertos | Dependencias |
|---|---|---|
| Pantalla A — Vista calendario | REQ-059 a REQ-069 | It. 1, It. 2 (pacientes para asignar) |
| Pantalla B — Detalle del turno (avance de estado) | REQ-070 a REQ-077 | Calendario |
| Pantalla C — Crear turno (3 pasos) | REQ-078 a REQ-087 | Calendario, Pacientes |
| Pantalla D — Reagendar turno | REQ-088 a REQ-091 | Detalle de turno |
| Pantalla E — Lista de turnos del día | REQ-092 a REQ-097 | Calendario |

---

### Iteración 4: Pacientes escritura + Tratamientos
**Scope**: Cierra la escritura del módulo Pacientes (crear paciente 2 pasos, editar ficha, editar estado de pieza del odontograma) y entrega el módulo Tratamientos (lista de activos, catálogo de tipos, detalle de tipo).
**Entregable**: El sistema "vive" en Pacientes: alta de paciente, edición, y odontograma editable persistente. Catálogo de tratamientos navegable.

| Feature | Criterios cubiertos | Dependencias |
|---|---|---|
| Crear paciente (2 pasos) | REQ-173 a REQ-181 | It. 2 (ficha) |
| Editar información del paciente | REQ-182 a REQ-185 | It. 2 (ficha) |
| Odontograma editable (cambiar estado de pieza) | REQ-267, REQ-268, REQ-269, REQ-270 | It. 2 (detalle de pieza) |
| Tratamientos — Lista de activos | REQ-192 a REQ-197 | It. 1, It. 2 |
| Tratamientos — Catálogo de tipos | REQ-198 a REQ-201 | It. 1 |
| Tratamientos — Detalle de tipo | REQ-202 a REQ-205 | Catálogo |

---

### Iteración 5: Facturación, Pagos editable y Reportes
**Scope**: Módulo Facturación completo (presupuestos lista/detalle/crear 3 pasos, facturas lista/detalle, obras sociales cards/detalle), la **escritura de Pagos** (registrar pago en la cuenta corriente, con saldo recalculado y coherencia de badges), y el módulo Reportes (dashboard KPI + 4 reportes con gráficos).
**Entregable**: Sistema completo end-to-end. Facturación operativa, pagos editables persistentes, y reportes con datos reales del estado. Cierra los 272 REQ.

| Feature | Criterios cubiertos | Dependencias |
|---|---|---|
| Presupuestos — Lista | REQ-206 a REQ-210 | It. 1, It. 2 |
| Presupuestos — Detalle (acción por estado) | REQ-211 a REQ-215 | Lista presupuestos |
| Presupuestos — Crear (3 pasos, incl. mobile) | REQ-216 a REQ-220, REQ-271 | Pacientes, Tratamientos |
| Facturas — Lista y detalle | REQ-221 a REQ-226 | It. 1, It. 2 |
| Obras sociales — Lista y detalle | REQ-227 a REQ-231 | Pacientes |
| Pagos editable — Registrar pago | REQ-259 a REQ-263 (complementa REQ-164) | It. 2 (tab Pagos) |
| Reportes — Dashboard KPI | REQ-232 a REQ-236 | Todo el estado (datos reales) |
| Reportes — Pacientes / Tratamientos / Financiero / Productividad | REQ-237 a REQ-246 | Dashboard, charts lib |
| Cierre de calidad transversal (responsive total, a11y, anti-patrones) | REQ-249, REQ-252 a REQ-256 | Todas las iteraciones |

> **Cobertura**: Iteraciones 1–5 cubren los 272 REQ-IDs (REQ-001 a REQ-272) + los 20 NFR. Los criterios transversales de calidad (Épica 10) se distribuyen: la red de seguridad estructural y "cero demo" arranca en It. 1 y se reverifica en It. 5; responsive/validación/a11y se aplican en cada iteración sobre las pantallas entregadas y se cierran formalmente en It. 5.

---

## Diagrama de Dependencias

```
            ┌─────────┐
            │  core   │  (persistence · seed · models · domain services · guards)
            └────┬────┘
                 │
            ┌────▼────┐
            │ shared  │  (app-shell · header · sidebar · table · badges · toast · ...)
            └────┬────┘
                 │
   ┌──────┬──────┼──────┬──────────┬──────────┬─────────┐
   │      │      │      │          │          │         │
┌──▼─┐ ┌──▼──┐ ┌─▼────┐ ┌─▼──────┐ ┌▼───────┐ ┌▼──────┐ ┌▼────────┐
│auth│ │agen-│ │pati- │ │treat-  │ │billing │ │reports│ │settings │
│    │ │ da  │ │ ents │ │ ments  │ │        │ │(charts)│ │         │
└────┘ └──┬──┘ └──┬───┘ └────────┘ └───┬────┘ └───────┘ └────┬────┘
          │       │                    │                     │
          └───────┴── usan pacientes/tratamientos para ──────┘
                       turnos, presupuestos, reset

  layout (shell wiring) envuelve todo · todos los features son LAZY
```

**Orden de dependencias entre iteraciones**: It.1 (fundación) → It.2 (pacientes, base de casi todo) → It.3 (agenda usa pacientes) → It.4 (escritura pacientes + tratamientos) → It.5 (facturación/pagos/reportes usan pacientes + tratamientos + todo el estado).

---

## Infraestructura Cloud

Servicios cloud requeridos. Por ser **frontend-only sin backend ni base de datos**, la infraestructura se reduce a hosting estático con CI/CD. DevOps provisiona Static Web Apps + CI/CD en FASE 3.5 (antes de la Fase de Construcción Visual). **No hay FASE 3.5-INFRA con servicios adicionales** — no hay base de datos, ni auth provider, ni storage server, ni API.

| Servicio | Propósito | Configuración clave |
|---|---|---|
| **Azure Static Web Apps** | Hosting del frontend Angular (SPA estática). Único servicio cloud del proyecto. | URL default `*.azurestaticapps.net` (SIN dominio propio, NFR-013). **Fallback a `index.html`** vía `staticwebapp.config.json` para que el routing multi-pantalla y el deep-linking funcionen (NFR-006..009/013). Sin funciones API (`api_location` vacío). Build: output del `ng build` (carpeta `dist/`). |
| **GitHub Actions / Azure Pipelines (CI/CD)** | Build y deploy automático a SWA en cada push. Incluye el `prebuild` que genera `manifest.json` y copia las fotos del seed a `assets/`. | Workflow de SWA: `app_location` = raíz, `output_location` = `dist/<app>/browser`. Paso previo: `node scripts/generate-manifest.mjs`. Validación de **budget de bundle** (falla si initial >500KB gzipped). |

**Servicios NO requeridos** (y por qué): **base de datos** (todo en localStorage del cliente), **Entra ID / auth provider** (sin autenticación real, REQ-004/258), **Blob Storage** (las fotos y documentos son assets estáticos versionados en el repo, no subidas de usuario), **App Service / Functions** (sin backend ni API), **CDN propio** (SWA ya sirve con CDN integrado), **analytics / Application Insights de tracking de usuario** (prohibido por el cliente, REQ-258/272).

---

## Gaps Técnicos Descubiertos

> **0 gaps que requieran al cliente.** Los 17 gaps de requirements ya fueron resueltos por el BA en Fase 2 (incluida la elección de framework delegada al Architect, GAP-T02, resuelta en ADR-1). Las observaciones siguientes son **notas de implementación / coordinación**, no gaps bloqueantes — se documentan para el Design Team, DevOps y QA.

| # | Observación | Impacto | Recomendación |
|---|---|---|---|
| GAP-A01 | El template estándar de arquitectura incluye un criterio DEMO de **CRM tracking**; este proyecto lo **prohíbe** (REQ-258, REQ-272, §12). | Cobertura DEMO | Se **omitió** el DEMO de tracking deliberadamente. QA debe verificar la **ausencia** de cualquier SDK de analytics/tracking (no su presencia). Documentado en la nota de la Fase 4 y en ADR-7. |
| GAP-A02 | El seed dinámico "lee carpetas", pero en hosting estático sin backend no hay lectura de FS en runtime. | Carga del seed | Resuelto por diseño: la lectura de carpetas ocurre en **build-time** (`scripts/generate-manifest.mjs`) y se materializa en `assets/seed/manifest.json`; runtime hace `fetch`. DevOps debe incluir ese script en el pipeline (ver Infraestructura Cloud). Si se agregan/quitan fotos, re-correr el script. |
| GAP-A03 | Presupuesto de bundle <500KB gzipped con Angular es ajustado si no se disciplina el lazy loading. | NFR-002 | Mitigado en ADR-1/ADR-6: budget configurado en `angular.json` (warn 450KB / error 500KB sobre initial), lazy de todo excepto shell, charts solo en Reportes, fuentes/iconos subseteados. DevOps valida el budget en CI. Si se excede, primera palanca: diferir más sub-componentes con `@defer`. |
| GAP-A04 | Contraste del azul medio `#6da8d4` no soporta texto blanco a nivel AA (señalado en `visual-analysis.md`). | NFR-020, REQ-256 | No es gap de arquitectura sino de diseño; se traslada al Design Team (texto oscuro sobre azul medio, o azul más profundo derivado para superficies con texto blanco). Se menciona aquí para trazabilidad con QA de accesibilidad. |
| GAP-A05 | "Notificación de WhatsApp" al reagendar (REQ-089) sin envío real. | REQ-089, REQ-272 | Implementar como mensaje de UI/notificación interna presentado como real ("Se notificó al paciente por WhatsApp"), sin texto que delate simulación y sin integración externa. Coherente con ADR-7. |
