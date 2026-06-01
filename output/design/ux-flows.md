# UX Flows — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: UX Flow Designer
**Fecha**: 2026-06-01
**Fuente de diseño**: `output/design/visual-analysis.md` (único input visual, prescriptivo 🔒) + `output/requirements/requirements.md` (272 REQ + 20 NFR) + `output/architecture/architecture.md` (Angular 17, 7 módulos lazy, rutas).
**Versión**: 1.0

> **Naturaleza estructural (prioridad máxima):** **multi-pantalla estricto.** Cada acción crear/editar/consultar tiene su ruta dedicada; la URL es la fuente de verdad de la vista; el botón atrás del navegador funciona; cualquier deep-link válido hidrata desde localStorage. **Sin drawers como contenido principal. Sin modales >50%. Sin tabs entre objetos distintos. Una sola acción primaria por pantalla. Un solo filtro visible. Tablas ≤5 columnas. Paginación, no infinite scroll.**

> **CERO rastro de demo/mock (REQ-272 / BVC-027):** todo el copy y la UI se presentan como producto real en producción. Ninguna aparición de "demo", "mock", "simulación", "simulado", "de prueba", "ejemplo", "ficticio", "viewcase" ni atribución a Link Design. El reset se llama **"Restablecer datos"** y vive **solo** en Configuración. La notificación de WhatsApp al reagendar se presenta como envío real. Facturas/presupuestos nunca mencionan ARCA/AFIP.

> **Idioma (NFR-034):** español rioplatense neutro, profesional pero cercano ("ficha del paciente", "turno", "obra social", "presupuesto"; **nunca** "expediente").

---

## Índice

1. [Principios maestros de UX](#1-principios-maestros-de-ux)
2. [Mapa de Navegación (árbol de rutas ~40 pantallas)](#2-mapa-de-navegación)
3. [Shell de la aplicación (sidebar · header · footer)](#3-shell-de-la-aplicación)
4. [Sistema de estados de UI (comportamiento transversal)](#4-sistema-de-estados-de-ui)
5. [Estrategia responsive (3 breakpoints)](#5-estrategia-responsive)
6. [User Journeys de los 5 módulos](#6-user-journeys-de-los-5-módulos)
7. [Pantallas — Shell / global](#7-pantallas--shell--global)
8. [Pantallas — Agenda](#8-pantallas--agenda)
9. [Pantallas — Pacientes (lista + ficha de 6 tabs)](#9-pantallas--pacientes)
10. [Pantallas — Pacientes (sub-pantallas)](#10-pantallas--pacientes-sub-pantallas)
11. [Pantallas — Tratamientos](#11-pantallas--tratamientos)
12. [Pantallas — Facturación](#12-pantallas--facturación)
13. [Pantallas — Reportes (dashboard layout)](#13-pantallas--reportes)
14. [Pantallas — Configuración y Ayuda](#14-pantallas--configuración-y-ayuda)
15. [Content Strategy (barrido anti-demo + copy final)](#15-content-strategy)
16. [Gaps de UX descubiertos](#16-gaps-de-ux-descubiertos)

---

## 1. Principios maestros de UX

Estos principios gobiernan todas las pantallas. Derivan de la fuente prescriptiva y resuelven el error del viewcase anterior (todo aglomerado con drawers + modales gigantes).

| # | Principio | Aplicación práctica |
|---|---|---|
| P1 | **Cada acción, su pantalla** | Crear/editar/consultar = ruta dedicada. Flujos multi-paso = una ruta por paso. La ficha refleja el tab en la URL. El botón atrás siempre devuelve a la pantalla previa real. |
| P2 | **Una sola acción primaria por pantalla** | Un único botón de acento azul por pantalla (máx una secundaria visible). El resto de acciones en menú compacto "⋯". |
| P3 | **Un solo filtro principal visible** | En listas, un filtro a la vista (por profesional, normalmente) + buscador inline cuando aplica. Los demás filtros en panel desplegable "Filtros". |
| P4 | **Tablas ≤5 columnas** (turnos del día y facturas ≤4) | Recorte estricto. Lo que no entra en columnas va al detalle (su propia pantalla). |
| P5 | **Aire con propósito** | Las pantallas con poco contenido se ven espaciosas, no rellenadas. El espacio comunica orden y jerarquía. |
| P6 | **Persona-céntrico** | El paciente es el sujeto, no una fila. Foto grande en la ficha, avatares circulares en listas, empty states humanos. La ficha es la pantalla-firma. |
| P7 | **Sin drawers / sin modales gigantes** | Drawers prohibidos como contenido principal (el drawer de navegación mobile sí se permite). Modales solo para confirmaciones cortas <50%, máx 3 campos. |
| P8 | **Tabs solo para el mismo objeto** | Los 6 tabs de la ficha = dimensiones del mismo paciente. Tab inactivo **no en el DOM**. Nunca tabs para navegar entre objetos distintos. |
| P9 | **Skeletons, no spinners; toast tras cada acción** | Carga con skeletons que imitan la forma del contenido (stagger por fila). Éxito → toast. Error → toast coral + reintento. |
| P10 | **Mobile completo** | TODOS los flujos usables en celular (no solo consulta): crear/editar paciente, crear turno, reagendar, crear presupuesto, registrar pago, editar odontograma. Touch target ≥44px. |
| P11 | **Cero demo** | Presentación de producto real de punta a punta (REQ-272). |

---

## 2. Mapa de Navegación

> Árbol completo de rutas. Cada hoja es una pantalla con ruta dedicada. Las rutas reflejan exactamente la vista; el deep-link hidrata desde localStorage (REQ-031/124). Los flujos multi-paso usan **una ruta por paso** (ADR-5).

```
/ (raíz)
│
├── /login ……………………………………… Login (sin auth real). Botón "Ingresar como administradora" + link "Saltar login"
│
└── (App Shell: header + sidebar + footer + <router-outlet>)
    │
    ├── /reportes ………………………………… [INICIO post-login] Dashboard de KPIs (≤6 cards)
    │   ├── /reportes/pacientes ……………… Reporte de pacientes (4 gráficos)
    │   ├── /reportes/tratamientos ………… Reporte de tratamientos (3 gráficos)
    │   ├── /reportes/financiero ………………Reporte financiero (3 gráficos)
    │   └── /reportes/productividad …………Reporte de productividad (3 gráficos)
    │
    ├── /agenda …………………………………… Calendario (mensual default; toggles semana/día)
    │   ├── /agenda?vista=semana ………… (mismo componente, vista reflejada en query/estado)
    │   ├── /agenda?vista=dia …………………(idem)
    │   ├── /agenda/dia ……………………………Lista de turnos del día (≤4 col)
    │   ├── /agenda/turno/:id …………………Detalle del turno (1 acción primaria "avanzar estado")
    │   ├── /agenda/turno/:id/reagendar … Reagendar turno (turno actual + calendario)
    │   └── /agenda/nuevo ……………………… Crear turno — flujo de 3 pasos:
    │       ├── /agenda/nuevo/paciente ……Paso 1 — Paciente
    │       ├── /agenda/nuevo/profesional  Paso 2 — Profesional + fecha (disponibilidad real)
    │       └── /agenda/nuevo/confirmar …Paso 3 — Tratamiento + confirmación
    │
    ├── /pacientes ……………………………… Lista de pacientes (tabla ≤5 col; toggle Card/Tabla)
    │   ├── /pacientes/nuevo ……………………Crear paciente — flujo de 2 pasos:
    │   │   ├── /pacientes/nuevo/datos ……Paso 1 — Datos personales + contacto
    │   │   └── /pacientes/nuevo/clinico …Paso 2 — Datos clínicos + foto opcional
    │   └── /pacientes/:id ………………………Ficha del paciente (cabecera estable + barra de 6 tabs)
    │       ├── /pacientes/:id/informacion …… Tab 1 — Información general [tab default]
    │       ├── /pacientes/:id/odontograma …… Tab 2 — Odontograma (32 piezas)
    │       │   └── /pacientes/:id/pieza/:fdi …… Detalle de pieza dental (estado editable)
    │       ├── /pacientes/:id/historial ……… Tab 3 — Historial clínico (timeline)
    │       │   └── /pacientes/:id/evento/:eid …Detalle de evento clínico
    │       ├── /pacientes/:id/tratamientos … Tab 4 — Tratamientos (activos / completados)
    │       │   └── /pacientes/:id/plan/:pid …… Detalle de plan de tratamiento
    │       ├── /pacientes/:id/documentos …… Tab 5 — Documentos (galería en grilla)
    │       │   └── /pacientes/:id/documento/:did … Vista expandida del documento
    │       ├── /pacientes/:id/pagos …………… Tab 6 — Pagos (resumen + movimientos)
    │       │   └── /pacientes/:id/pagos/nuevo … Registrar pago (ruta dedicada)
    │       └── /pacientes/:id/editar ………… Editar paciente (form precargado)
    │
    ├── /tratamientos ………………………… Lista de tratamientos activos (tabla ≤5 col)
    │   ├── /tratamientos/catalogo ……………Catálogo de tipos (cards aireadas, ≥12)
    │   └── /tratamientos/catalogo/:tid ……Detalle de tipo de tratamiento
    │
    ├── /facturacion ……………………………[redirige a] /facturacion/presupuestos
    │   ├── /facturacion/presupuestos ………Lista de presupuestos (tabla 4–5 col)
    │   │   ├── /facturacion/presupuestos/nuevo … Crear presupuesto — flujo de 3 pasos:
    │   │   │   ├── …/nuevo/paciente …………Paso 1 — Paciente
    │   │   │   ├── …/nuevo/tratamientos …Paso 2 — Tratamientos (costo total)
    │   │   │   └── …/nuevo/revision …………Paso 3 — Revisión + confirmación
    │   │   └── /facturacion/presupuestos/:id … Detalle de presupuesto (acción por estado)
    │   ├── /facturacion/facturas …………………Lista de facturas (tabla ≤4 col)
    │   │   └── /facturacion/facturas/:id ……Detalle de factura (ítems + totales)
    │   └── /facturacion/obras-sociales ……Lista de obras sociales (cards aireadas)
    │       └── /facturacion/obras-sociales/:id … Detalle de obra social
    │
    ├── /configuracion ……………………… Configuración (incl. "Restablecer datos")
    │
    ├── /ayuda ………………………………………Ayuda (centro de ayuda / FAQ interno)
    │
    └── /no-encontrado …………………… Fallback "no encontrado" (ruta inexistente; no crashea)
```

**Conteo de pantallas (rutas dedicadas):** Login (1) · No encontrado (1) · Reportes dashboard + 4 reportes (5) · Agenda calendario + lista día + detalle turno + reagendar + 3 pasos crear (7) · Pacientes lista + ficha base + 6 tabs + detalle pieza + detalle evento + detalle plan + documento expandido + registrar pago + editar + 2 pasos crear (15) · Tratamientos lista + catálogo + detalle tipo (3) · Facturación: presupuestos lista + detalle + 3 pasos crear, facturas lista + detalle, obras sociales lista + detalle (9) · Configuración (1) · Ayuda (1). **≈ 49 rutas; ~40 pantallas "de pantalla completa" distintas** (los tabs comparten cabecera; los 3 pasos comparten stepper).

**Reglas de navegación de retorno (REQ-030/125/127/172):**
- Atrás desde cualquier ficha → lista de pacientes (o pantalla previa real si se llegó desde Agenda/Reportes).
- Atrás desde una sub-pantalla de tab (pieza/evento/plan/documento/registrar pago) → la ficha **en el tab de origen** (ej. salir de detalle de pieza vuelve a `/pacientes/:id/odontograma`).
- Atrás desde un paso N de un flujo → paso N-1 con datos preservados; atrás desde el paso 1 → pantalla que originó el flujo.
- "Cancelar" en un flujo → confirmación → pantalla de origen (lista o ficha).

---

## 3. Shell de la aplicación

> El shell envuelve todas las pantallas internas (no el Login). Persistente, fijo, replica el chasis soft-UI de Task Dasher adaptado a la familia azul. Cubre DEMO-001/002/003/004 y BVC-007/008/025/027.

### 3.1 Layout general del shell

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  HEADER (fijo, alto ~64px)                                                     │
│  [≡ mobile] [isotipo+wordmark]   "Pacientes"      [🔔 3] [AD ▾]               │
├───────────────┬────────────────────────────────────────────────────────────────┤
│  SIDEBAR      │                                                                │
│  (fijo, 232px)│   <router-outlet>                                              │
│               │                                                                │
│  [logo]       │   ── Canvas #fafafa con cards blancas flotantes ──            │
│               │                                                                │
│  ▸ Agenda     │   (contenido de la pantalla activa)                           │
│  ▸ Pacientes  │                                                                │
│  ▸ Tratam.    │                                                                │
│  ▸ Facturación│                                                                │
│  ▸ Reportes   │                                                                │
│  ───────────  │                                                                │
│  ▸ Config.    │                                                                │
│  ▸ Ayuda      │                                                                │
│               ├────────────────────────────────────────────────────────────────┤
│               │  FOOTER (discreto): "Estudio Dental Mendieta · v1.0 · 2026"   │
└───────────────┴────────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar (DEMO-001 · BVC-007 · REQ-017..024)

**Layout:** columna fija de ~232px (rango 230–250), fondo blanco/casi-canvas, no colapsable en desktop. Logo isotipo + wordmark **"Estudio Dental Mendieta"** arriba. Item activo en **píldora azul-cielo tintada** (`#c5d8e8` muy lavado) con esquinas redondeadas (radius 10–14px) — adaptación del item activo elevado de Task Dasher.

**Items (orden EXACTO, ícono Phosphor + label SIEMPRE visible):**

| Orden | Item | Ícono Phosphor (regular) | Ruta destino | Badge |
|---|---|---|---|---|
| 1 | Agenda | `calendar-blank` | `/agenda` | — |
| 2 | Pacientes | `users` | `/pacientes` | — |
| 3 | Tratamientos | `tooth` | `/tratamientos` | — |
| 4 | Facturación | `receipt` | `/facturacion/presupuestos` | — |
| 5 | Reportes | `chart-bar` | `/reportes` | — |
| — | *separador* | — | — | — |
| 6 | Configuración | `gear` | `/configuracion` | — |
| 7 | Ayuda | `question` | `/ayuda` | — |

**Reglas:**
- **Exactamente 5 items principales** + separador + Configuración/Ayuda (ni más, ni menos — BVC-007).
- **Nunca ícono sin label** (BVC-025 / anti-patrón #18). Ícono 20px a la izquierda + label.
- El item de la ruta activa se destaca con la píldora azul-cielo (REQ-019). Solo uno activo por vez, sincronizado con la URL.
- Hover visible en todos los items (tinte de fondo sutil ≤250ms); focus ring visible; alcanzable por teclado (REQ-024).
- Clic navega a la ruta dedicada del módulo y actualiza la URL (REQ-022).
- **Mobile:** se transforma en **drawer overlay** invocado por el botón hamburguesa del header (permitido para navegación — BVC-023). Los items mantienen ícono + label y touch target ≥44px. Al elegir un item, el drawer se cierra y navega.

### 3.3 Header (DEMO-002 · BVC-008 · REQ-008..016)

**Layout (izquierda → derecha):**
1. **Mobile:** botón hamburguesa (`list`, abre el drawer del sidebar).
2. **Logo:** isotipo (símbolo dental sutil) + wordmark "Estudio Dental Mendieta", sobrio, en paleta azul. (En desktop el logo principal vive en el sidebar; el header puede mostrar solo el wordmark o el nombre del módulo — ver punto 3.)
3. **Nombre del módulo activo:** texto sincronizado con la ruta ("Agenda", "Pacientes", "Tratamientos", "Facturación", "Reportes", "Configuración", "Ayuda"). (REQ-009)
4. **Buscador contextual** (opcional, solo donde aplica — ej. lista de pacientes): pill de búsqueda radius 10–14px que filtra **solo la pantalla activa**, nunca global. **NO** hay búsqueda global ni command palette ni atajos globales (REQ-013/014 · BVC-008/024).
5. **Notificaciones:** ícono `bell` con badge contador (cantidad de notificaciones internas: turnos por confirmar, pagos vencidos, cumpleaños, tratamientos por vencer). Badge azul medio con texto oscuro. (REQ-012)
6. **Avatar del usuario:** círculo con iniciales **"AD"** (la administradora). Menú compacto al clic (ver Configuración / cerrar sesión → vuelve a Login).

**Prohibiciones explícitas (REQ-011/013 · BVC-008/027):**
- **SIN** carrito (es de e-commerce, no aplica).
- **SIN** badge "demo", "mock", "Demo interactivo de…", ni texto/elemento que delate el mock.
- **SIN** atribución a Link Design / portfolio.
- **SIN** búsqueda global / command palette / atajos globales visibles.

**Comportamiento:** fijo y visible en todas las pantallas internas (no en Login — REQ-015). En mobile se adapta: el wordmark puede acortarse al isotipo, el buscador colapsa a un ícono `magnifying-glass`, pero el acceso al menú (hamburguesa) y al avatar se mantienen (REQ-016).

### 3.4 Notificaciones (panel desde el header)

> No es pantalla con ruta propia; es un panel contextual ligero (<50% en desktop, hoja inferior compacta en mobile) anclado al ícono de campana. Patrón de lista de notificaciones de Task Dasher, adaptado.

- **Layout de fila:** leading circular (ícono temático con fondo de color para sistema / avatar para persona) + título (peso 500) + subtítulo gris + **timestamp relativo** a la derecha ("hace 30 min", "hace 1 h", "hace 2 días").
- **Diferenciación leído/no-leído por item** (GAP del brief resuelto): dot azul leading o fondo azul-cielo muy tenue en no-leídos.
- **Filtros pill:** "Todas" / "Sin leer".
- **Mapeo de íconos:** turno → `calendar-blank`; pago vencido → `receipt` (acento coral); cumpleaños → avatar o `cake` pastel; tratamiento por vencer → `tooth` (warning ámbar).
- **Contador de no-leídos** reflejado en el badge del header.
- **Copy 100% de producción** (sin rastro de demo). Cada notificación es clickeable y navega a la pantalla relevante (detalle de turno, tab Pagos del paciente, etc.).

### 3.5 Footer (DEMO-003 · REQ-025..028)

**Layout:** banda discreta al pie del área de contenido, una sola línea de texto secundario gris, sin competir con el contenido.
- **Contenido:** `Estudio Dental Mendieta · v1.0 · 2026` (versión de producto + nombre de la clínica + año).
- **Prohibido:** link de atribución a Link Design / portfolio (REQ-026); cualquier acción "Resetear demo" o similar (REQ-027 — el reset vive solo en Configuración); cualquier texto que sugiera demo/mock.

### 3.6 Estados del shell (REQ-029..031 · REQ-126)

| Estado | Comportamiento |
|---|---|
| Módulo activo sincronizado | El item del sidebar y el nombre del módulo en el header siempre reflejan la ruta actual. |
| Deep-link directo | Cargar cualquier URL interna válida (ej. `/pacientes/pac-007/pagos`) renderiza la pantalla correcta hidratando el store desde localStorage (`SeedReadyGuard` garantiza store hidratado antes del render). |
| Botón atrás | Funciona en todos los flujos (PathLocationStrategy + fallback a index en SWA). |
| Ruta inexistente | `/no-encontrado` → pantalla "no encontrado" sobria con acción de volver al inicio; **no crashea**. |
| localStorage no disponible | Degrada a estado en memoria con un aviso claro (toast informativo, sin lenguaje de demo) y permite navegar el seed sin crashear (REQ-040). |

---

## 4. Sistema de estados de UI

> Comportamiento transversal de los **5 estados** por pantalla. El aspecto visual de los componentes (skeleton, empty-state, toast) lo detalla el Component Designer; aquí defino el **comportamiento por pantalla**. Cubre DEMO-017 · REQ-066/067/105/106/145/250/251.

| Estado | Cuándo aparece | Comportamiento visual (qué hace la pantalla) |
|---|---|---|
| **Vacío** | La lista/sección no tiene datos (período sin turnos, paciente sin documentos, búsqueda sin resultados, etc.) | Empty state sobrio persona-céntrico: ícono Phosphor liviano + texto secundario con **guidance** + **1 acción primaria** (cuando aplica). Copy con sentido de negocio, **sin** revelar mock. Ej.: "No hay turnos en este período. Creá uno con **Nuevo turno**." |
| **Carga** | Mientras se hidratan/computan datos de una lista o sección | **Skeletons** que imitan la forma del contenido (avatar circular + líneas para filas; cards fantasma para grillas), con **stagger** (delay incremental por fila/card, fade+rise ≤250ms). **NUNCA spinners** (BVC-016). |
| **Error** | Fallo al cargar/persistir, o localStorage no disponible | **Toast coral pastel** con mensaje claro + **acción de reintento**. Para ruta inexistente → pantalla "no encontrado". El error nunca crashea la app ni revela mock. |
| **Éxito** | Datos cargados correctamente; o tras una acción del usuario | Contenido normal renderizado. Tras una **acción** (crear, editar, aprobar, avanzar estado, registrar pago, reset) → **toast de éxito** con copy de producción. |
| **Muchos datos** | Lista larga (pacientes, turnos, presupuestos, facturas, tratamientos) | **Paginación offset** (10–15 filas, default 12) con **contador de rango** "1–12 de N". **NUNCA infinite scroll** (BVC-026). En la ficha, la profundidad se da por **tabs**, nunca por scroll infinito. |

**Mapa de qué estado aplica a cada pantalla** (referencia rápida — el detalle vive en cada pantalla):

| Pantalla | Vacío | Carga (skeleton) | Error | Muchos datos (paginación) |
|---|---|---|---|---|
| Calendario Agenda | ✓ (período sin turnos) | ✓ | ✓ | N/A (calendario) |
| Lista turnos del día | ✓ (día sin turnos) | ✓ | ✓ | ✓ si el día tiene muchos |
| Detalle de turno | N/A | ✓ | ✓ (turno inexistente → no encontrado) | N/A |
| Lista de pacientes | ✓ (búsqueda sin resultados) | ✓ | ✓ | ✓ |
| Ficha — Tab Info | placeholders por campo vacío | ✓ | ✓ (paciente inexistente) | N/A |
| Ficha — Odontograma | N/A (siempre 32 piezas) | ✓ | ✓ | N/A |
| Ficha — Historial | ✓ (paciente nuevo) | ✓ | ✓ | ✓ si historial extenso |
| Ficha — Tratamientos | ✓ (sin tratamientos) | ✓ | ✓ | N/A |
| Ficha — Documentos | ✓ (sin documentos) | ✓ | ✓ (thumbnail roto → placeholder) | ✓ si muchos docs |
| Ficha — Pagos | ✓ (sin movimientos) | ✓ | ✓ | ✓ si muchos movimientos |
| Lista de tratamientos | ✓ | ✓ | ✓ | ✓ |
| Catálogo de tipos | N/A (≥12 fijos) | ✓ | ✓ | N/A (12–15 cards) |
| Lista de presupuestos | ✓ | ✓ | ✓ | ✓ |
| Lista de facturas | ✓ | ✓ | ✓ | ✓ |
| Obras sociales | ✓ (OS sin pacientes en detalle) | ✓ | ✓ | N/A (6 cards) |
| Reportes dashboard | datos calculados (siempre hay) | ✓ | ✓ | N/A (≤6 KPIs) |
| Reportes detallados | ✓ por gráfico sin datos | ✓ | ✓ | N/A |

---

## 5. Estrategia responsive

> Transversal — **TODOS los flujos usables en mobile** (REQ-252). Cubre DEMO-020 · REQ-016/023/068/077/097/107/115/122/131/139/147/154/160/167/180/197/201/205/215/226/231/235/245/253/254/263/270/271.

### 5.1 Breakpoints

| Breakpoint | Ancho | Layout maestro |
|---|---|---|
| **Mobile** | < 768px | 1 columna. Sidebar → drawer overlay (hamburguesa). Header compacto. Tablas → layout vertical "ficha" (label izq / valor der por fila). Cards en 1 columna. Barra de 6 tabs con scroll horizontal. Flujos multi-paso en 1 columna. Avatar de ficha recentrado solapando el banner. KPIs en 1–2 columnas. |
| **Tablet** | 768–1199px | 2 columnas donde aplica. Sidebar visible (puede estrecharse) o drawer según ancho. Tablas conservan columnas clave; cards en 2 columnas; ficha con cabecera + tabs; KPIs en 2–3 columnas. |
| **Desktop** | ≥ 1200px | 3 columnas (patrón maestro). Sidebar fijo 232px. Tablas con todas sus columnas (≤5). Ficha con header asimétrico (foto+nombre izq / panel de datos der). Cards en 3 columnas. KPIs en 3 columnas. |

### 5.2 Patrón maestro de transformación (3 columnas → 1 columna)

| Elemento | Desktop | Mobile |
|---|---|---|
| **Sidebar** | columna fija 232px | drawer overlay por hamburguesa (cierra al navegar) |
| **Tabla** (data-table) | filas con ≤5 columnas | cada fila se transforma en una mini-card vertical: la celda "visual" (foto) arriba-izq, nombre como título, el resto como pares **label / valor** apilados; la fila completa sigue siendo clickeable (touch target ≥44px) |
| **Cabecera de ficha** | foto grande izq + nombre arriba + panel de datos der (asimetría) | foto **recentrada solapando el banner** + nombre centrado debajo + datos apilados en una columna |
| **Barra de 6 tabs** | barra horizontal completa | scroll horizontal de la barra (o chips deslizables), tab activo siempre a la vista, touch target ≥44px |
| **Cards en grid** (catálogo, obras sociales, KPIs) | 3 columnas | 1–2 columnas |
| **Flujos multi-paso** | columna central + stepper arriba | una columna; stepper compacto arriba; botones Atrás/Siguiente fijos al pie, ancho cómodo |
| **Calendario** | grilla mensual completa | mes adaptado (días apilados o vista semana/día priorizada); toggles con touch target ≥44px |
| **Odontograma** | arcadas superior/inferior completas | piezas legibles sin scroll horizontal que rompa layout; cada pieza con touch target adecuado; arcadas apiladas verticalmente |
| **Formularios** | campos en 1–2 columnas | 1 columna, inputs altura 40px (touch ≥44px), labels arriba |

### 5.3 Reglas duras de responsive

- **Touch target ≥44px** en TODO control mobile, incluidos: controles de los flujos multi-paso, botón "Registrar pago", el formulario de pago completo, el selector de estado de pieza dental, los toggles del calendario, las filas de tabla clickeables (REQ-253).
- **Sin scroll horizontal no intencional** en ningún viewport mobile estándar, incluyendo pantallas de creación/edición y el odontograma editable (REQ-254).
- **Ningún flujo "solo desktop":** crear/editar paciente, crear turno, reagendar, crear presupuesto, registrar pago y editar odontograma son completamente operables en celular (REQ-252).

---

## 6. User Journeys de los 5 módulos

> Journeys prioritarios end-to-end, **multi-pantalla**, con rutas reflejadas en la URL y botón atrás funcional. Cada paso indica la pantalla destino y las ramas (error / cancelar / volver).

### 6.1 Agenda — Ver agenda → abrir turno → avanzar estado

```
1. Sidebar "Agenda"                         → /agenda  (calendario mensual)
2. (opcional) Filtrar por profesional       → /agenda  (calendario filtrado)
3. (opcional) Toggle a vista día            → /agenda?vista=dia  ó  /agenda/dia (lista del día)
4. Clic en bloque de turno                  → /agenda/turno/:id  (detalle del turno)
5. Acción primaria "Avanzar estado"          → mismo detalle, estado actualizado + TOAST éxito (persiste)
   ├─ Si estado terminal (terminado/cancelado): acción primaria deshabilitada (op 40%)
   ├─ Acción secundaria "Reagendar" (menú ⋯) → /agenda/turno/:id/reagendar
   └─ Acción secundaria "Cancelar" (menú ⋯)  → confirmación (<50%) → cancela + TOAST
6. Atrás                                     → vuelve al calendario/lista del día
```

### 6.2 Agenda — Crear turno (flujo de 3 pasos, end-to-end)

```
1. "Nuevo turno" (calendario)               → /agenda/nuevo/paciente   [Paso 1/3]
   · Seleccionar paciente (combo con búsqueda) u opción "Crear paciente nuevo"
   · Validación inline: no avanza sin paciente (REQ-086)
   · "Siguiente"                             → /agenda/nuevo/profesional [Paso 2/3]
2. Paso 2 — Profesional + fecha
   · Elegir profesional → ver disponibilidad real → elegir slot → duración estimada
   · No permite slot ocupado para ese profesional (REQ-081)
   · "Atrás" preserva datos del Paso 1       → /agenda/nuevo/paciente
   · "Siguiente"                             → /agenda/nuevo/confirmar  [Paso 3/3]
3. Paso 3 — Tratamiento + confirmación
   · Elegir tratamiento previsto + notas + revisar resumen
   · "Confirmar turno"                       → persiste → /agenda/turno/:idNuevo + TOAST éxito
   Ramas transversales:
   ├─ "Cancelar" (cualquier paso)            → confirmación → /agenda (descarta el turno en progreso)
   └─ Stepper de progreso visible en los 3 pasos (Paso N de 3)
```

**Pre-relleno desde la ficha (REQ-112):** "Agendar turno" en la cabecera de la ficha inicia el mismo flujo con el paciente **preseleccionado**, entrando directo al Paso 2 (`/agenda/nuevo/profesional` con `pacienteId` en el estado del flujo), o mostrando el Paso 1 con el paciente ya elegido.

### 6.3 Pacientes — Lista → ficha → tab Pagos → registrar pago → saldo actualizado (FLUJO FIRMA)

```
1. Sidebar "Pacientes"                       → /pacientes  (tabla ≤5 col)
2. Buscar por nombre (buscador inline)       → /pacientes  (lista filtrada en vivo)
   └─ Sin resultados → empty state con guidance
3. Clic en fila                              → /pacientes/:id/informacion  (ficha, tab 1 default)
4. Clic en tab "Pagos"                       → /pacientes/:id/pagos  (resumen + movimientos)
   (la cabecera permanece estable; tab inactivo sale del DOM)
5. Acción primaria "Registrar pago"          → /pacientes/:id/pagos/nuevo  (ruta dedicada, NO modal)
   · Ingresar monto (ARS) + fecha + concepto/medio
   · Validación inline: monto número positivo (REQ-260)
   · "Confirmar pago"                         → persiste movimiento + recalcula saldo
6. Resultado                                  → vuelve a /pacientes/:id/pagos
   · Resumen (cobrado, saldo) actualizado en pantalla
   · Nuevo movimiento en la lista
   · Badge de estado de cuenta del paciente coherente en /pacientes (al día/con deuda/vencido)
   · TOAST de éxito
   Ramas:
   └─ "Cancelar" (con datos) → confirmación → vuelve a /pacientes/:id/pagos sin alterar saldo
```

### 6.4 Pacientes — Odontograma → detalle de pieza → cambiar estado (editable, persistente)

```
1. Ficha → tab "Odontograma"                 → /pacientes/:id/odontograma  (32 piezas + leyenda)
2. Clic en una pieza                          → /pacientes/:id/pieza/:fdi  (detalle de pieza)
   · Muestra número FDI + nombre + estado actual + historial de procedimientos
3. Control "Cambiar estado" (6 opciones)      → elegir: sana / caries / obturación / ausente / en tratamiento / prótesis
4. "Guardar cambio"                           → persiste (sobrevive refresh) + TOAST éxito
5. "Volver al odontograma"                    → /pacientes/:id/odontograma
   · La pieza refleja visualmente el nuevo estado (color/chip + leyenda)
   (Atrás del navegador también regresa al odontograma — REQ-127)
```

### 6.5 Pacientes — Crear paciente (flujo de 2 pasos)

```
1. "Nuevo paciente" (lista)                  → /pacientes/nuevo/datos  [Paso 1/2]
   · Nombre, género, edad/fecha, DNI, contacto
   · Validación inline: requeridos + formato DNI (REQ-176)
   · "Siguiente"                             → /pacientes/nuevo/clinico  [Paso 2/2]
2. Paso 2 — Datos clínicos
   · Alergias, medicación, observaciones, profesional de cabecera, foto opcional
   · Foto opcional sin cargar → fallback a iniciales en círculo pastel (REQ-179)
   · "Atrás" preserva datos del Paso 1
   · "Crear paciente"                         → persiste → /pacientes/:idNuevo + TOAST éxito
   Ramas:
   └─ "Cancelar" → confirmación → /pacientes (descarta)
```

### 6.6 Tratamientos — Lista de activos / catálogo → detalle de tipo

```
1. Sidebar "Tratamientos"                    → /tratamientos  (lista de activos, ≤5 col)
2a. Clic en fila                             → /pacientes/:id/plan/:pid  (detalle del plan del paciente)
2b. Solapa/enlace "Catálogo de tipos"         → /tratamientos/catalogo  (cards aireadas, ≥12)
3. Clic en card de tipo                       → /tratamientos/catalogo/:tid  (detalle de tipo)
   · Pasos, materiales, costo ARS, duración, profesionales habilitados
4. "Volver al catálogo"                        → /tratamientos/catalogo
```

### 6.7 Facturación — Presupuestos: crear (3 pasos) → aprobar

```
1. Sidebar "Facturación"                     → /facturacion/presupuestos  (tabla 4–5 col)
2. "Nuevo presupuesto"                        → /facturacion/presupuestos/nuevo/paciente  [Paso 1/3]
   · Seleccionar paciente → "Siguiente"
3. Paso 2 — Tratamientos                      → …/nuevo/tratamientos  [Paso 2/3]
   · Agregar uno o varios tratamientos → costo total se calcula automáticamente
   · "Atrás" preserva datos → "Siguiente"
4. Paso 3 — Revisión                          → …/nuevo/revision  [Paso 3/3]
   · Resumen completo → "Confirmar presupuesto"
   · Persiste → /facturacion/presupuestos/:idNuevo + TOAST éxito
5. En el detalle (estado pendiente): acción primaria "Aprobar"
   · "Aprobar" → persiste estado "aprobado" + TOAST éxito
   · Si vencido/ya aprobado: acción primaria se adapta o deshabilita (no se aprueba dos veces)
   Ramas:
   └─ "Cancelar" (cualquier paso) → confirmación → /facturacion/presupuestos
```

### 6.8 Facturación — Obra social → paciente asociado → ficha

```
1. Facturación → "Obras sociales"            → /facturacion/obras-sociales  (cards aireadas)
2. Clic en card                               → /facturacion/obras-sociales/:id  (detalle)
   · Info + pacientes asociados + historial de liquidaciones
3. Clic en un paciente asociado               → /pacientes/:id/informacion  (su ficha)
```

### 6.9 Reportes — Dashboard → KPI → reporte detallado

```
1. (post-login / sidebar "Reportes")         → /reportes  (≤6 KPI cards calculadas del estado)
2. Clic en KPI "Ingresos cobrados"           → /reportes/financiero  (gráficos en cards aireadas)
   · Cada gráfico con skeleton al cargar; empty state por gráfico sin datos
3. Atrás                                       → /reportes
```

### 6.10 Reagendar (sub-journey de Agenda con notificación real)

```
1. Detalle de turno → menú ⋯ → "Reagendar"   → /agenda/turno/:id/reagendar
   · Turno actual arriba + calendario abajo (nueva fecha/hora)
   · No permite slot ocupado del mismo profesional (REQ-090)
2. "Confirmar reagendamiento"                 → persiste nueva fecha/hora
   · Genera notificación de WhatsApp presentada como REAL: "Se notificó al paciente por WhatsApp."
   · TOAST de éxito → vuelve a /agenda/turno/:id con nueva fecha reflejada
```

---

## 7. Pantallas — Shell / global

### 7.1 Pantalla: Login

**Ruta:** `/login`
**Layout:** card centrada sobre canvas `#fafafa`. Opción **split interno** dentro de la card: a la izquierda una imagen sobria (foto de la clínica/equipo o ilustración liviana — **NUNCA** el gradiente aurora), a la derecha el formulario minimalista. No es split de pantalla completa: es una card embebida. Sin sidebar ni header (es la única pantalla fuera del shell).

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Logo "Estudio Dental Mendieta" | dumb | Identidad de marca arriba del formulario |
| Card centrada (split imagen/form) | dumb | Contenedor de la entrada |
| Botón primario "Ingresar como administradora" | smart | Carga seed (si no existe) y navega a `/reportes` |
| Link "Saltar login" | smart | Navega directo a `/reportes` sin pasar por el botón |
| Inputs sutiles (decorativos) | dumb | Estética de login de producto; no validan credenciales reales |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | N/A (siempre muestra el form) | — |
| Carga | Tras clic, mientras se hidrata/genera el seed | Botón en estado de carga sutil (sin spinner pesado); transición ≤250ms |
| Error | Si el seed/localStorage falla | Aviso claro inline + permite reintentar; degrada sin crashear |
| Éxito | Seed listo | Navega a `/reportes` |
| Muchos datos | N/A | — |

#### Contenido y Copy
- Título: "Estudio Dental Mendieta"
- Subtítulo: "Ingresá para gestionar la agenda, las fichas y la facturación de la clínica."
- CTA principal: "Ingresar como administradora"
- Link secundario: "Saltar login"
- **Prohibido:** cualquier texto que diga demo/mock/prueba; no se pide usuario/contraseña reales (REQ-004).

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | La card ocupa ~92% del ancho; el split se apila (imagen arriba opcional, form debajo) o se omite la imagen; botón y link con touch target ≥44px; sin scroll horizontal (REQ-005) |
| Tablet | Card centrada con split visible |
| Desktop | Card centrada con split imagen \| form |

---

### 7.2 Pantalla: No encontrado (fallback)

**Ruta:** `/no-encontrado` (y cualquier ruta inexistente redirige aquí)
**Layout:** dentro del shell. Empty state centrado: ícono Phosphor liviano (`compass` o `magnifying-glass`) + mensaje + 1 acción primaria.

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Único | Ruta no existe / id inválido | Ícono + mensaje + botón "Volver al inicio" |

#### Contenido y Copy
- Título: "No encontramos esta página."
- Subtítulo: "Puede que el enlace haya cambiado o la página ya no exista."
- CTA principal: "Volver al inicio" (→ `/reportes`)
- **Caso paciente inexistente** (REQ-126): mensaje específico "No encontramos este paciente." + "Volver a la lista de pacientes" (→ `/pacientes`).

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Todos | Una columna centrada; botón touch ≥44px |

---

## 8. Pantallas — Agenda

### 8.1 Pantalla: Calendario (Agenda)

**Ruta:** `/agenda` (vista mensual default; `?vista=semana` / `?vista=dia` reflejan la vista en la URL/estado)
**Layout:** header de pantalla (título + filtro + acción primaria) sobre el calendario. Calendario como card blanca flotante. Turnos = bloques coloreados por estado. Mucho aire alrededor.

```
┌─────────────────────────────────────────────────────────────┐
│ Agenda            [Profesional ▾]  [Filtros]   [+ Nuevo turno]│  ← 1 filtro visible + 1 acción primaria
│  ◂  Junio 2026  ▸     [ Mes | Semana | Día ]   [Ver lista día]│  ← toggles de vista
├─────────────────────────────────────────────────────────────┤
│  Lun  Mar  Mié  Jue  Vie  Sáb  Dom                           │
│  ┌──┐ ┌──┐ ┌──┐ ...                                          │
│  │  │ │■ │ │■■│        ■ = bloque de turno (color por estado)│
│  └──┘ └──┘ └──┘                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Header de pantalla | dumb | Título "Agenda" + filtro + acción primaria |
| Filtro por profesional | smart | Único filtro visible; filtra el calendario (REQ-064) |
| Botón "Filtros" + panel | smart | Filtros secundarios (estado, tipo) en panel desplegable (REQ-063) |
| Toggle de vista (Mes/Semana/Día) | smart | Cambia vista; refleja en URL/estado (REQ-060) |
| Botón "Ver lista del día" | smart | Navega a `/agenda/dia` |
| Botón primario "Nuevo turno" | smart | Inicia flujo `/agenda/nuevo/paciente` |
| Grilla de calendario | smart | Renderiza períodos y bloques de turno |
| Bloque de turno | smart | Coloreado por estado; clic → `/agenda/turno/:id` |
| Avatar-stack | dumb | Pacientes de un día con turno (overlapping +N) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Período (mes/semana/día) sin turnos | Empty state con guidance: "No hay turnos en este período. Creá uno con **Nuevo turno**." + acción primaria |
| Carga | Mientras carga la agenda | Skeletons (celdas/bloques fantasma con stagger), NO spinners |
| Error | Fallo al cargar | Toast coral + reintento |
| Éxito | Turnos cargados | Bloques coloreados por estado, navegables |
| Muchos datos | Día muy cargado | Bloques se compactan / "+N más" lleva a `/agenda/dia` |

#### Contenido y Copy
- Título: "Agenda"
- Filtro: "Profesional" (default: "Todos los profesionales")
- CTA principal: "Nuevo turno"
- Secundaria: "Ver lista del día"
- Leyenda de estados: Confirmado · En espera · Atendiendo · Terminado · Cancelado (badges pastel)

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Calendario adaptado (días apilados o se prioriza vista semana/día); toggles con touch ≥44px; bloques legibles; filtro y "Nuevo turno" accesibles; sin scroll horizontal (REQ-068) |
| Tablet | Grilla mensual con bloques compactos |
| Desktop | Grilla mensual completa con bloques y avatar-stack |

---

### 8.2 Pantalla: Detalle del turno

**Ruta:** `/agenda/turno/:id`
**Layout:** card de detalle con la información del turno; **una acción primaria** "Avanzar estado"; secundarias en menú compacto "⋯".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Encabezado de turno | dumb | Fecha, hora, duración, estado actual (badge) |
| Foto + link al paciente | smart | Foto pequeña; link → `/pacientes/:id/informacion` (REQ-073) |
| Datos del turno | dumb | Profesional, tratamiento previsto, notas internas |
| Botón primario "Avanzar estado" | smart | confirmado → atendiendo → terminado; persiste + toast (REQ-074) |
| Menú "⋯" (secundarias) | smart | "Reagendar" → `/agenda/turno/:id/reagendar` · "Cancelar" → confirmación |
| Badge de estado | dumb | Color pastel por estado |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | N/A | — |
| Carga | Hidratando el turno | Skeleton del detalle |
| Error | Turno inexistente | "No encontramos este turno" + volver a Agenda |
| Éxito | Turno cargado | Detalle completo + acción primaria |
| Estado terminal | Turno terminado/cancelado | Acción primaria deshabilitada (op 40%, cursor not-allowed) comunicando que no hay siguiente paso (REQ-076) |

#### Contenido y Copy
- Título: "Turno — [Nombre del paciente]"
- Acción primaria: según estado → "Confirmar turno" / "Iniciar atención" / "Marcar como terminado"
- Secundarias (menú): "Reagendar", "Cancelar turno"
- Confirmación de cancelar: "¿Cancelar este turno? El paciente quedará sin la cita agendada." → "Sí, cancelar" / "Volver"
- Toast éxito: "Turno actualizado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Información en una columna, legible, sin scroll horizontal; acción primaria full-width al pie; menú ⋯ accesible (REQ-077) |
| Tablet/Desktop | Detalle en card centrada |

---

### 8.3 Pantalla: Crear turno — Paso 1 (Paciente)

**Ruta:** `/agenda/nuevo/paciente`
**Layout:** stepper de progreso arriba (Paso 1 de 3) + card del paso. Una acción primaria "Siguiente".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (1 de 3) | dumb | Indica paso actual (REQ-087) |
| Combo de paciente con búsqueda | smart | Selección de paciente existente (REQ-079) |
| Opción "Crear paciente nuevo" | smart | Deriva a `/pacientes/nuevo/datos` (retorna al flujo) |
| Botón primario "Siguiente" | smart | Valida → `/agenda/nuevo/profesional` |
| Botón "Cancelar" | smart | Confirmación → `/agenda` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin paciente elegido | "Siguiente" deshabilitado; hint de selección |
| Carga | Cargando lista de pacientes en el combo | Skeleton del combo |
| Error | Validación: sin paciente | Mensaje inline junto al combo (REQ-086) |
| Éxito | Paciente elegido | "Siguiente" habilitado |

#### Contenido y Copy
- Título: "Nuevo turno"
- Subtítulo del paso: "¿Para qué paciente es el turno?"
- CTA principal: "Siguiente"
- Secundaria: "Cancelar"
- Validación: "Elegí un paciente para continuar."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna; combo full-width; stepper compacto; botones al pie touch ≥44px |

---

### 8.4 Pantalla: Crear turno — Paso 2 (Profesional y fecha)

**Ruta:** `/agenda/nuevo/profesional`
**Layout:** stepper (2 de 3) + selección de profesional + vista de disponibilidad real + duración. Una acción primaria "Siguiente".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (2 de 3) | dumb | Progreso |
| Selector de profesional | smart | Elige profesional (de los 6) |
| Vista de disponibilidad | smart | Slots libres/ocupados reales; bloquea ocupados (REQ-081) |
| Selector de duración | smart | Duración estimada |
| Botón "Atrás" | smart | Preserva datos → Paso 1 (REQ-084) |
| Botón primario "Siguiente" | smart | Valida → `/agenda/nuevo/confirmar` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin profesional/slot | "Siguiente" deshabilitado |
| Carga | Cargando disponibilidad | Skeleton de la grilla de slots |
| Error | Slot inválido/ocupado | Slot ocupado no seleccionable; mensaje inline |
| Éxito | Slot elegido | "Siguiente" habilitado |

#### Contenido y Copy
- Subtítulo del paso: "Elegí profesional y horario."
- Hint disponibilidad: "Mostramos solo los horarios libres de cada profesional."
- CTA principal: "Siguiente" · Secundaria: "Atrás"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Disponibilidad en lista vertical de slots tocables (≥44px); una columna; sin scroll horizontal |

---

### 8.5 Pantalla: Crear turno — Paso 3 (Tratamiento y confirmación)

**Ruta:** `/agenda/nuevo/confirmar`
**Layout:** stepper (3 de 3) + tratamiento previsto + notas + resumen + confirmación.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (3 de 3) | dumb | Progreso |
| Selector de tratamiento | smart | Tratamiento previsto |
| Campo de notas | smart | Notas internas |
| Card de resumen | dumb | Paciente + profesional + fecha/hora + tratamiento |
| Botón primario "Confirmar turno" | smart | Persiste → `/agenda/turno/:idNuevo` + toast (REQ-083) |
| Botón "Atrás" | smart | Preserva datos → Paso 2 |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin tratamiento | "Confirmar turno" deshabilitado |
| Carga | Guardando | Botón en carga sutil |
| Error | Validación faltante | Mensaje inline |
| Éxito | Turno creado | Navega al detalle + toast "Turno agendado." |

#### Contenido y Copy
- Subtítulo del paso: "Revisá el turno y confirmá."
- CTA principal: "Confirmar turno"
- Toast éxito: "Turno agendado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Resumen y campos en una columna; botón confirmar full-width |

---

### 8.6 Pantalla: Reagendar turno

**Ruta:** `/agenda/turno/:id/reagendar`
**Layout:** turno actual arriba (card de contexto) + calendario abajo para elegir nueva fecha/hora. Una acción primaria "Confirmar reagendamiento".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card de turno actual | dumb | Contexto del turno a mover |
| Calendario/selector de slot | smart | Nueva fecha/hora; bloquea slots ocupados (REQ-090) |
| Botón primario "Confirmar reagendamiento" | smart | Persiste + notificación WhatsApp (presentada real) + toast |
| Botón "Cancelar" | smart | Vuelve al detalle del turno |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin nueva fecha elegida | Acción primaria deshabilitada |
| Carga | Cargando disponibilidad | Skeleton del calendario |
| Error | Slot ocupado | No seleccionable + mensaje |
| Éxito | Reagendado | Toast + nueva fecha reflejada en el detalle |

#### Contenido y Copy
- Título: "Reagendar turno"
- Subtítulo: "Elegí la nueva fecha y hora para [Nombre del paciente]."
- CTA principal: "Confirmar reagendamiento"
- Notificación post-acción (presentada como real, REQ-089): "Se notificó al paciente por WhatsApp."
- Toast éxito: "Turno reagendado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Card de contexto arriba + selector de slots vertical tocable; una columna |

---

### 8.7 Pantalla: Lista de turnos del día

**Ruta:** `/agenda/dia`
**Layout:** tabla de **≤4 columnas** ordenada por hora. Filas clickeables.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Selector de fecha | smart | Día visible |
| data-table (4 col) | smart | Paciente · Profesional · Hora · Estado (REQ-093) |
| Badge de estado | dumb | Color pastel coherente con la agenda (REQ-096) |
| Fila clickeable | smart | → `/agenda/turno/:id` (REQ-094) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Día sin turnos | "No hay turnos para este día. Agendá uno con **Nuevo turno**." |
| Carga | Cargando turnos | Skeletons de fila (stagger) |
| Error | Fallo | Toast coral + reintento |
| Éxito | Turnos del día | Filas ordenadas por hora con badge |
| Muchos datos | Día muy cargado | Paginación con contador "1–12 de N" |

#### Contenido y Copy
- Título: "Turnos del día"
- Columnas: "Paciente", "Profesional", "Hora", "Estado"
- CTA principal: "Nuevo turno"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cada fila → mini-card vertical (paciente arriba, profesional/hora/estado como pares label/valor); sin scroll horizontal (REQ-097); touch ≥44px |

---

## 9. Pantallas — Pacientes

> El centro del sistema y la pieza-firma. La ficha replica la página Profile de Task Dasher con banner azul sobrio (NO aurora) y 6 tabs.

### 9.1 Pantalla: Lista de pacientes

**Ruta:** `/pacientes`
**Layout:** header (título + buscador inline + acción primaria) + tabla **≤5 columnas** con paginación. **Toggle Card/Tabla** (mejora persona-céntrica; Tabla es la vista primaria que cumple ≤5 col).

```
┌──────────────────────────────────────────────────────────────────┐
│ Pacientes      [🔍 Buscar paciente…]  [Filtros]   [+ Nuevo paciente]│
│                                         [ ▦ Tabla | ▧ Cards ]       │
├──────────────────────────────────────────────────────────────────┤
│ FOTO  NOMBRE                OBRA SOCIAL   PRÓXIMO TURNO   CUENTA    │  ← ≤5 columnas
│ ◯    Carolina Méndez       OSDE          12 jun, 10:30   [Al día]  │
│ ◯    Julián Ferreyra       Particular    —               [Con deuda]│
│ ...                                          1–12 de 29  ◂ 1 2 3 ▸ │  ← paginación
└──────────────────────────────────────────────────────────────────┘
```

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Header de pantalla | dumb | Título "Pacientes" + buscador + acción primaria |
| Buscador inline | smart | Filtra por nombre (y DNI opcional) en vivo, contextual (REQ-100) |
| Botón "Filtros" + panel | smart | Obra social, edad, profesional en panel desplegable (REQ-101) |
| Toggle Card/Tabla | smart | Cambia entre vista densa (tabla) y persona-céntrica (cards) |
| data-table (≤5 col) | smart | Foto · Nombre · Obra social · Próximo turno · Estado de cuenta (REQ-098) |
| Badge de pago | dumb | Al día / Con deuda / Vencido (REQ-104) |
| Card de paciente (vista Cards) | dumb | Foto circular + nombre + datos + badge + "Ver ficha" |
| Paginación + contador | smart | "1–12 de N"; NO infinite scroll (REQ-103) |
| Fila/card clickeable | smart | → `/pacientes/:id/informacion` (REQ-102) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Búsqueda/filtro sin resultados | "No encontramos pacientes con ese criterio. Probá con otro nombre o ajustá los filtros." |
| Carga | Cargando lista | Skeletons de fila (avatar circular + líneas, stagger) |
| Error | Fallo | Toast coral + reintento |
| Éxito | Pacientes cargados | Tabla/cards navegables |
| Muchos datos | 29 pacientes (o más) | Paginación con contador "1–12 de 29" |

#### Contenido y Copy
- Título: "Pacientes"
- Buscador: placeholder "Buscar paciente por nombre o DNI"
- Columnas: "Foto", "Nombre", "Obra social", "Próximo turno", "Estado de cuenta"
- CTA principal: "Nuevo paciente"
- Vacío sin filtro (caso límite): "Todavía no hay pacientes cargados. Creá el primero con **Nuevo paciente**."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cada fila → mini-card vertical (foto + nombre arriba; obra social/próximo turno/cuenta como pares); buscador full-width; touch ≥44px; sin scroll horizontal (REQ-107) |
| Tablet | Tabla con columnas clave o cards en 2 columnas |
| Desktop | Tabla completa ≤5 col o grid de cards en 3 columnas |

---

### 9.2 Pantalla: Ficha del paciente — Cabecera + barra de 6 tabs

**Ruta:** `/pacientes/:id` (redirige a `/pacientes/:id/informacion`)
**Layout (PANTALLA-FIRMA):** banner azul sobrio (degradé `#c5d8e8`→blanco muy tenue, **NUNCA aurora**). Header con **asimetría intencional**: foto grande circular (borde blanco) + nombre grande a la izquierda; panel de datos liviano con icon-chips a la derecha. **Una acción primaria** "Agendar turno". Secundarias en menú "⋯". Debajo, **barra horizontal de 6 tabs**. La cabecera permanece **estable** al cambiar de tab (REQ-169).

```
┌──────────────────────────────────────────────────────────────────────┐
│ ░░░░ banner azul sobrio (degradé cielo→blanco muy tenue) ░░░░          │
│  ◯◯◯                                                                  │
│  ◯foto◯   Carolina Méndez                    │ Edad: 34 años          │
│  ◯◯◯      34 años · OSDE                      │ Obra social: OSDE      │
│           [Alergia: Penicilina] [Medicación]  │ Profesional: Dra. Russo│
│                                  [+ Agendar turno]   [⋯]               │  ← 1 primaria + menú
├──────────────────────────────────────────────────────────────────────┤
│ ▸Información │ Odontograma │ Historial │ Tratamientos │ Documentos │ Pagos │  ← 6 tabs
└──────────────────────────────────────────────────────────────────────┘
```

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Banner azul sobrio | dumb | Fondo del header (NO aurora — adaptación crítica Patrón 11) |
| Foto grande circular | smart | Foto del paciente con fallback a iniciales (REQ-109) |
| Nombre + datos básicos | dumb | Nombre grande (peso 500) + edad · obra social · profesional |
| Badges de alerta | dumb | Alergias / medicación / observaciones críticas **solo si aplican** (REQ-110/111) |
| Panel de datos (icon-chips) | dumb | Datos clave a la derecha (asimetría) |
| Botón primario "Agendar turno" | smart | Inicia flujo de turno con paciente preseleccionado (REQ-112) |
| Menú "⋯" (secundarias) | smart | "Editar ficha" → `/pacientes/:id/editar` · "Eliminar" → confirmación (REQ-113/114) |
| Barra de 6 tabs | smart | Navega entre tabs; refleja tab en URL; tab inactivo NO en DOM (REQ-116/118/119) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | N/A (siempre hay paciente) | — |
| Carga | Hidratando la ficha | Skeleton de cabecera (avatar circular + líneas) |
| Error | Paciente inexistente | "No encontramos este paciente." + "Volver a la lista" (REQ-126) |
| Éxito | Ficha cargada | Cabecera completa + tabs |

#### Contenido y Copy
- Título visual: nombre completo del paciente (gran jerarquía)
- Subtítulo: "[edad] años · [obra social]"
- CTA principal: "Agendar turno"
- Secundarias (menú): "Editar ficha", "Eliminar paciente"
- Confirmación eliminar: "¿Eliminar la ficha de [nombre]? Esta acción no se puede deshacer." → "Sí, eliminar" / "Cancelar"
- Toast tras eliminar: "Paciente eliminado." → navega a `/pacientes`

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Foto **recentrada solapando el banner** + nombre centrado debajo + datos apilados en una columna; badges debajo; acción primaria full-width; barra de tabs con scroll horizontal (touch ≥44px); sin scroll horizontal de página (REQ-115/122) |
| Tablet | Header con foto izq + datos; tabs completos |
| Desktop | Header asimétrico (foto+nombre izq / panel datos der); barra de 6 tabs completa |

---

### 9.3 Tab 1 — Información general

**Ruta:** `/pacientes/:id/informacion`
**Layout:** cards aireadas (NO tablas densas) con datos personales y clínicos. Mucho aire.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card "Datos personales" | dumb | Nombre, género, edad/fecha, DNI |
| Card "Contacto" | dumb | Teléfono, email, dirección, contacto de emergencia |
| Card "Obra social" | dumb | Obra social + número de afiliado |
| Card "Datos clínicos" | dumb | Alergias, medicación habitual, observaciones generales |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío (por campo) | Campo sin dato | Placeholder claro: "Sin medicación registrada", "Sin alergias registradas" (REQ-130), nunca en blanco ambiguo |
| Carga | Cargando | Skeletons de card |
| Error | Fallo | Toast + reintento |
| Éxito | Datos cargados | Cards aireadas |

#### Contenido y Copy
- Secciones: "Datos personales", "Contacto", "Obra social", "Datos clínicos"
- Placeholders: "Sin medicación registrada", "Sin alergias registradas", "Sin observaciones"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards apiladas en una columna, legibles (REQ-131) |
| Desktop | Cards en 2 columnas aireadas |

---

### 9.4 Tab 2 — Odontograma (32 piezas interactivo)

**Ruta:** `/pacientes/:id/odontograma`
**Layout:** diagrama dental con las 32 piezas (arcada superior + inferior distinguidas) + **leyenda/clave** de estados. Cada pieza clickeable → ruta de detalle. (El componente odontograma carga con `@defer` — ADR-6.)

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Odontograma (32 piezas SVG) | smart | Arcadas superior/inferior; numeración FDI 11–48 + universal 1–32 en tooltip (REQ-132/137) |
| Pieza dental | smart | Estado visual (sana/caries/obturación/ausente/en-tratamiento/prótesis); clic → `/pacientes/:id/pieza/:fdi` (REQ-135) |
| Leyenda/clave | dumb | Explica cada estado con color/chip pastel (REQ-134) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | N/A — siempre 32 piezas; paciente nuevo → todas "sana" (REQ-140) | Diagrama completo |
| Carga | Cargando odontograma (`@defer`) | Skeleton del diagrama (arcadas fantasma) |
| Error | Fallo | Toast + reintento |
| Éxito | Estados reflejados | Piezas coloreadas según estado seed coherente con la edad (REQ-136) |

#### Contenido y Copy
- Título: "Odontograma"
- Leyenda: "Sana", "Caries", "Obturación", "Ausente", "En tratamiento", "Prótesis"
- Hint: "Tocá una pieza para ver su detalle y cambiar su estado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | 32 piezas legibles, arcadas apiladas; cada pieza con touch target adecuado; sin scroll horizontal que rompa layout (REQ-139) |
| Desktop | Arcadas superior/inferior lado a lado o apiladas con aire |

---

### 9.5 Tab 3 — Historial clínico

**Ruta:** `/pacientes/:id/historial`
**Layout:** timeline cronológico de eventos clínicos (más reciente primero, consistente). Clic en una entrada → detalle del evento.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Timeline | smart | Eventos ordenados cronológicamente (REQ-141/144) |
| Bloque de evento | smart | Fecha, tipo, profesional, descripción corta + relative-time (REQ-142/146); clic → `/pacientes/:id/evento/:eid` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Paciente nuevo sin eventos | "Este paciente todavía no tiene eventos clínicos registrados." (REQ-145) |
| Carga | Cargando timeline | Skeletons de bloque (stagger) |
| Error | Fallo | Toast + reintento |
| Éxito | Eventos cargados | Timeline navegable |
| Muchos datos | Historial extenso | Paginación o "Ver más" sin infinite scroll |

#### Contenido y Copy
- Título: "Historial clínico"
- Vacío: "Este paciente todavía no tiene eventos clínicos registrados."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Timeline en una columna, legible (REQ-147) |

---

### 9.6 Tab 4 — Tratamientos del paciente

**Ruta:** `/pacientes/:id/tratamientos`
**Layout:** dos grupos — **Activos** y **Completados**. Cada plan como progress-card con **% grande** (peso 500, azul medio) + label "Progreso". Clic → detalle del plan.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Grupo "Activos" | dumb | Sección de planes en curso |
| Grupo "Completados" | dumb | Sección de planes finalizados |
| progress-card | smart | Nombre + etapas X/Y + % grande + barra + costo; clic → `/pacientes/:id/plan/:pid` (REQ-149/150/151) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin tratamientos | "Este paciente todavía no tiene tratamientos." |
| Grupo vacío | Solo activos o solo completados | El grupo vacío se omite o muestra mensaje breve, sin romper layout (REQ-153) |
| Carga | Cargando | Skeletons de card |
| Error | Fallo | Toast + reintento |
| Éxito | Planes cargados | Cards con progreso |

#### Contenido y Copy
- Título: "Tratamientos"
- Subsecciones: "Activos", "Completados"
- Label de progreso: "Progreso" + "[X] de [Y] etapas"
- Vacío: "Este paciente todavía no tiene tratamientos."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards de plan apiladas en una columna (REQ-154) |

---

### 9.7 Tab 5 — Documentos

**Ruta:** `/pacientes/:id/documentos`
**Layout:** galería en cuadrícula; cada documento con thumbnail + nombre. Clic → vista expandida.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Grilla de documentos | smart | Thumbnails + nombre (REQ-155) |
| Card de documento | smart | Thumbnail con fallback a placeholder controlado; clic → `/pacientes/:id/documento/:did` (REQ-156/159) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin documentos | "Este paciente todavía no tiene documentos cargados." |
| Carga | Cargando | Skeletons de thumbnail |
| Error | Thumbnail no carga | Placeholder de imagen controlado (no ícono de error del navegador) (REQ-159) |
| Éxito | Documentos cargados | Grilla navegable (presentados como documentos clínicos reales, sin etiqueta de mock — REQ-157) |
| Muchos datos | Muchos documentos | Paginación |

#### Contenido y Copy
- Título: "Documentos"
- Vacío: "Este paciente todavía no tiene documentos cargados."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Grilla a 1–2 columnas; thumbnails legibles; touch ≥44px (REQ-160) |

---

### 9.8 Tab 6 — Pagos / Estado de cuenta

**Ruta:** `/pacientes/:id/pagos`
**Layout:** **resumen arriba** (total facturado · total cobrado · saldo/deuda) + **lista de movimientos** abajo. **Una acción primaria** "Registrar pago".

```
┌──────────────────────────────────────────────────────────┐
│ Estado de cuenta                          [+ Registrar pago]│
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│ │Facturado │ │ Cobrado  │ │  Saldo   │                    │
│ │ $480.000 │ │ $360.000 │ │ $120.000 │ ← deuda en coral   │
│ └──────────┘ └──────────┘ └──────────┘                    │
├──────────────────────────────────────────────────────────┤
│ FECHA      CONCEPTO            MONTO        TIPO            │
│ 28 may     Conducto pieza 36   −$45.000     Cargo          │
│ 30 may     Pago parcial        +$30.000     Pago           │
└──────────────────────────────────────────────────────────┘
```

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Cards de resumen | smart | Total facturado · cobrado · saldo (derivado del estado, REQ-161/163) |
| Botón primario "Registrar pago" | smart | → `/pacientes/:id/pagos/nuevo` (REQ-164/259) |
| Lista de movimientos | smart | Fecha · concepto · monto (ARS) · signo/tipo (REQ-162) |
| Distinción cargo/pago | dumb | Negativos (deuda) y positivos (pagos) visualmente distintos (REQ-166) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin movimientos | "Sin movimientos en la cuenta corriente." (REQ-165) |
| Carga | Cargando movimientos | Skeletons (REQ-168) |
| Error | Fallo | Toast + reintento |
| Éxito | Cuenta cargada | Resumen + lista; estado coherente con badge en lista de pacientes (REQ-163) |
| Muchos datos | Muchos movimientos | Paginación |

#### Contenido y Copy
- Título: "Estado de cuenta"
- Resumen: "Total facturado", "Total cobrado", "Saldo"
- CTA principal: "Registrar pago"
- Columnas: "Fecha", "Concepto", "Monto", "Tipo"
- Vacío: "Sin movimientos en la cuenta corriente."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Resumen (cards apiladas) + lista en una columna; movimientos como mini-cards; sin scroll horizontal (REQ-167) |

---

## 10. Pantallas — Pacientes (sub-pantallas)

### 10.1 Pantalla: Crear paciente — Paso 1 (Datos personales)

**Ruta:** `/pacientes/nuevo/datos`
**Layout:** stepper (1 de 2) + formulario de datos personales y contacto en una columna. Acción primaria "Siguiente".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (1 de 2) | dumb | Progreso (REQ-181) |
| Form datos personales | smart | Nombre, género, edad/fecha, DNI, contacto (REQ-174) |
| Validación inline DNI | smart | Formato + requeridos antes de avanzar (REQ-176) |
| Botón primario "Siguiente" | smart | Valida → `/pacientes/nuevo/clinico` |
| Botón "Cancelar" | smart | Confirmación → `/pacientes` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Form en blanco | "Siguiente" deshabilitado hasta requeridos |
| Error | Validación inline | Error junto al campo (DNI inválido, requerido faltante) |
| Éxito | Form válido | "Siguiente" habilitado |

#### Contenido y Copy
- Título: "Nuevo paciente"
- Subtítulo del paso: "Datos personales y de contacto"
- Validación DNI: "Ingresá un DNI válido."
- CTA: "Siguiente" · Secundaria: "Cancelar"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna; inputs altura 40px (touch ≥44px); botones al pie; sin scroll horizontal (REQ-180) |

---

### 10.2 Pantalla: Crear paciente — Paso 2 (Datos clínicos)

**Ruta:** `/pacientes/nuevo/clinico`
**Layout:** stepper (2 de 2) + datos clínicos + foto opcional. Acción primaria "Crear paciente".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (2 de 2) | dumb | Progreso |
| Form datos clínicos | smart | Alergias, medicación, observaciones, profesional de cabecera (REQ-175) |
| Carga de foto opcional | smart | Foto opcional; fallback a iniciales si no se carga (REQ-179) |
| Botón "Atrás" | smart | Preserva datos del Paso 1 (REQ-177) |
| Botón primario "Crear paciente" | smart | Persiste → `/pacientes/:idNuevo` + toast (REQ-178) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Guardando | Botón en carga sutil |
| Error | Validación | Mensaje inline |
| Éxito | Paciente creado | Navega a la ficha + toast "Paciente creado." |

#### Contenido y Copy
- Subtítulo del paso: "Datos clínicos iniciales"
- CTA: "Crear paciente" · Secundaria: "Atrás"
- Toast éxito: "Paciente creado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna; carga de foto tocable; touch ≥44px |

---

### 10.3 Pantalla: Editar paciente

**Ruta:** `/pacientes/:id/editar`
**Layout:** formulario editable precargado con los datos actuales, en una columna. Acción primaria "Guardar cambios".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Form precargado | smart | Datos actuales editables (REQ-182) |
| Validación inline | smart | Valida antes de guardar (REQ-183) |
| Botón primario "Guardar cambios" | smart | Persiste → vuelve a la ficha + toast |
| Botón "Cancelar" | smart | Confirmación si hubo cambios → vuelve a la ficha sin alterar (REQ-184) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Precargando datos | Skeleton del form |
| Error | Validación | Mensaje inline |
| Éxito | Guardado | Navega a la ficha + toast "Cambios guardados." |

#### Contenido y Copy
- Título: "Editar ficha — [nombre]"
- CTA: "Guardar cambios" · Secundaria: "Cancelar"
- Confirmación cancelar con cambios: "¿Descartar los cambios? No se guardará lo que modificaste." → "Descartar" / "Seguir editando"
- Toast éxito: "Cambios guardados."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna; inputs consistentes; guardar/cancelar accesibles; touch ≥44px (REQ-185) |

---

### 10.4 Pantalla: Detalle de pieza dental (estado editable)

**Ruta:** `/pacientes/:id/pieza/:fdi`
**Layout:** número + nombre de la pieza + estado actual + **control editable de estado** + historial de procedimientos. Volver al odontograma.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Encabezado de pieza | dumb | Número FDI + nombre de la pieza + estado actual (REQ-186) |
| Control de estado (6 opciones) | smart | sana/caries/obturación/ausente/en-tratamiento/prótesis (REQ-267) |
| Botón primario "Guardar cambio" | smart | Persiste estado + toast; al volver el odontograma refleja el cambio (REQ-268) |
| Historial de procedimientos | dumb | Procedimientos sobre esa pieza |
| Enlace "Volver al odontograma" | smart | → `/pacientes/:id/odontograma` (REQ-188) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin procedimientos | "Sin procedimientos registrados en esta pieza." (REQ-187) |
| Carga | Cargando | Skeleton |
| Error | Fallo | Toast + reintento |
| Éxito | Pieza cargada / estado cambiado | Estado actualizado + toast |

#### Contenido y Copy
- Título: "Pieza [FDI] — [nombre de la pieza]"
- Control: "Estado de la pieza" con las 6 opciones
- CTA: "Guardar cambio" · Secundaria: "Volver al odontograma"
- Vacío: "Sin procedimientos registrados en esta pieza."
- Toast éxito: "Estado de la pieza actualizado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Selector de estado con touch target ≥44px, legible, operable sin scroll horizontal; odontograma editable cómodo en celular (REQ-270) |

---

### 10.5 Pantalla: Detalle de evento clínico

**Ruta:** `/pacientes/:id/evento/:eid`
**Layout:** información completa del evento en card; volver al historial.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card de evento | dumb | Fecha, tipo, profesional, descripción ampliada (REQ-189) |
| Enlace "Volver al historial" | smart | → `/pacientes/:id/historial` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Cargando | Skeleton |
| Error | Evento inexistente | "No encontramos este evento" + volver |
| Éxito | Evento cargado | Detalle completo |

#### Contenido y Copy
- Título: "[Tipo de evento] — [fecha]"
- Secundaria: "Volver al historial"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna, legible |

---

### 10.6 Pantalla: Detalle de plan de tratamiento

**Ruta:** `/pacientes/:id/plan/:pid`
**Layout:** información completa del plan: etapas (completadas/pendientes), costo, profesional, progreso. Volver al tab Tratamientos.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Encabezado de plan | dumb | Nombre, profesional asignado, costo ARS, progreso (REQ-190) |
| progress-card / barra | dumb | % de avance (peso 500) |
| Lista de etapas | dumb | Etapas completadas vs pendientes, visualmente claras (REQ-191) |
| Enlace "Volver a Tratamientos" | smart | → `/pacientes/:id/tratamientos` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Cargando | Skeleton |
| Error | Plan inexistente | "No encontramos este plan" + volver |
| Éxito | Plan cargado | Etapas + progreso |

#### Contenido y Copy
- Título: "[Nombre del tratamiento]"
- Secciones: "Etapas completadas", "Etapas pendientes"
- Secundaria: "Volver a Tratamientos"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Etapas y progreso en una columna |

---

### 10.7 Pantalla: Registrar pago

**Ruta:** `/pacientes/:id/pagos/nuevo`
**Layout:** ruta dedicada (NO modal gigante). Formulario en una columna: monto (ARS) + fecha + concepto/medio. Acción primaria "Confirmar pago".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Campo monto (ARS) | smart | Valida número positivo inline (REQ-260) |
| Campo fecha | smart | Fecha del pago |
| Campo concepto/medio | smart | Concepto o medio de pago |
| Botón primario "Confirmar pago" | smart | Persiste movimiento + recalcula saldo + toast (REQ-261/262) |
| Botón "Cancelar" | smart | Confirmación si hay datos → vuelve al tab Pagos sin alterar saldo (REQ-263) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Form en blanco | "Confirmar pago" deshabilitado |
| Error | Monto inválido (≤0 o no numérico) | Error inline junto al campo: "Ingresá un monto mayor a cero." |
| Carga | Guardando | Botón en carga sutil |
| Éxito | Pago registrado | Vuelve al tab Pagos; saldo + badge actualizados; toast "Pago registrado." |

#### Contenido y Copy
- Título: "Registrar pago — [nombre]"
- Campos: "Monto", "Fecha", "Concepto / Medio de pago"
- CTA: "Confirmar pago" · Secundaria: "Cancelar"
- Validación: "Ingresá un monto mayor a cero."
- Confirmación cancelar con datos: "¿Descartar este pago? No se registrará el movimiento." → "Descartar" / "Seguir"
- Toast éxito: "Pago registrado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Campos en una columna; touch ≥44px; sin scroll horizontal (REQ-263) |

---

## 11. Pantallas — Tratamientos

### 11.1 Pantalla: Lista de tratamientos activos

**Ruta:** `/tratamientos`
**Layout:** tabla **≤5 columnas** con filtro principal por profesional. Acceso al catálogo de tipos.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Header de pantalla | dumb | Título + filtro + acceso a catálogo |
| Filtro por profesional | smart | Único filtro visible (REQ-193) |
| Botón "Filtros" + panel | smart | Filtros secundarios desplegables |
| data-table (≤5 col) | smart | Paciente (foto) · Tratamiento · Profesional · Etapas X/Y · Próxima fecha (REQ-192) |
| Columna de etapas | dumb | Progreso legible "3/5" (REQ-196) |
| Fila clickeable | smart | → `/pacientes/:id/plan/:pid` (REQ-194) |
| Enlace "Catálogo de tipos" | smart | → `/tratamientos/catalogo` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin activos o filtro sin resultados | "No hay tratamientos activos con este criterio." (REQ-195) |
| Carga | Cargando | Skeletons de fila (REQ-197) |
| Error | Fallo | Toast + reintento |
| Éxito | Tratamientos cargados | Tabla navegable |
| Muchos datos | Muchos tratamientos | Paginación con contador |

#### Contenido y Copy
- Título: "Tratamientos"
- Columnas: "Paciente", "Tratamiento", "Profesional", "Etapas", "Próxima fecha"
- Acceso: "Ver catálogo de tipos"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Filas → mini-cards verticales; etapas como "3/5"; sin scroll horizontal |

---

### 11.2 Pantalla: Catálogo de tipos de tratamiento

**Ruta:** `/tratamientos/catalogo`
**Layout:** cards aireadas (NO tabla densa), ≥12 tipos. Cada card clickeable → detalle del tipo.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Grid de cards de tipo | smart | ≥12 tipos en cards aireadas (REQ-198/199) |
| Card de tipo | smart | Descripción corta + costo ARS + duración estimada; clic → `/tratamientos/catalogo/:tid` (REQ-200) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | N/A (≥12 fijos) | — |
| Carga | Cargando | Skeletons de card |
| Error | Fallo | Toast + reintento |
| Éxito | Catálogo cargado | Grid navegable |

#### Contenido y Copy
- Título: "Catálogo de tipos de tratamiento"
- Tipos (12 mínimos): "Limpieza profesional", "Ortodoncia con brackets", "Ortodoncia invisible", "Implante unitario", "Implante múltiple", "Conducto", "Blanqueamiento", "Carilla estética", "Corona", "Extracción simple", "Extracción de molar", "Prótesis fija", "Prótesis removible"
- Por card: "Desde $[costo]" + "[duración estimada]"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards en 1–2 columnas (REQ-201) |
| Desktop | Cards en 3 columnas |

---

### 11.3 Pantalla: Detalle de tipo de tratamiento

**Ruta:** `/tratamientos/catalogo/:tid`
**Layout:** información completa del tipo en cards aireadas. Volver al catálogo.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Encabezado del tipo | dumb | Nombre + descripción |
| Card "Pasos típicos" | dumb | Pasos del tratamiento (REQ-202) |
| Card "Materiales" | dumb | Materiales |
| Card "Costo y duración" | dumb | Costo ARS formateado (REQ-203) + duración |
| Card "Profesionales habilitados" | dumb | Avatares de profesionales |
| Enlace "Volver al catálogo" | smart | → `/tratamientos/catalogo` (REQ-204) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Cargando | Skeleton |
| Error | Tipo inexistente | "No encontramos este tipo" + volver |
| Éxito | Tipo cargado | Cards aireadas |

#### Contenido y Copy
- Título: "[Nombre del tipo]"
- Secciones: "Pasos típicos", "Materiales", "Costo de referencia", "Duración estimada", "Profesionales habilitados"
- Secundaria: "Volver al catálogo"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards apiladas en una columna (REQ-205) |

---

## 12. Pantallas — Facturación

> Mock interno SIN ARCA/AFIP, presentado como real. Facturas/presupuestos nunca mencionan organismos fiscales (REQ-224/258).

### 12.1 Pantalla: Lista de presupuestos

**Ruta:** `/facturacion/presupuestos`
**Layout:** tabla **4–5 columnas** + acción primaria "Nuevo presupuesto". Solapas internas de Facturación (Presupuestos / Facturas / Obras sociales).

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Sub-navegación de Facturación | smart | Presupuestos · Facturas · Obras sociales |
| data-table (4–5 col) | smart | Paciente · Fecha de emisión · Monto · Estado (REQ-206) |
| Badge de estado | dumb | Pendiente / Aprobado / Rechazado / Vencido (REQ-210) |
| Botón primario "Nuevo presupuesto" | smart | → `/facturacion/presupuestos/nuevo/paciente` (REQ-207) |
| Fila clickeable | smart | → `/facturacion/presupuestos/:id` (REQ-208) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin presupuestos o filtro sin resultados | "No hay presupuestos con este criterio. Creá uno con **Nuevo presupuesto**." (REQ-209) |
| Carga | Cargando | Skeletons de fila |
| Error | Fallo | Toast + reintento |
| Éxito | Presupuestos cargados | Tabla con badges |
| Muchos datos | Muchos presupuestos | Paginación con contador |

#### Contenido y Copy
- Título: "Presupuestos"
- Columnas: "Paciente", "Fecha", "Monto", "Estado"
- CTA principal: "Nuevo presupuesto"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Filas → mini-cards; sub-navegación como chips deslizables; touch ≥44px |

---

### 12.2 Pantalla: Detalle del presupuesto

**Ruta:** `/facturacion/presupuestos/:id`
**Layout:** información completa + **una acción primaria según el estado**.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Encabezado | dumb | Paciente + estado (badge) + fecha + vencimiento |
| Desglose de tratamientos | dumb | Tratamientos incluidos + costo desglosado (REQ-211) |
| Card de condiciones | dumb | Condiciones + total |
| Botón primario contextual | smart | "Aprobar" si pendiente; se adapta/deshabilita si vencido/aprobado (REQ-212/213/214) |
| Menú "⋯" (secundarias) | smart | Acciones secundarias |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Cargando | Skeleton |
| Error | Inexistente | "No encontramos este presupuesto" + volver |
| Éxito | Cargado | Detalle + acción primaria coherente con estado |
| Estado bloqueado | Vencido / ya aprobado | Acción primaria deshabilitada (no se aprueba dos veces) |

#### Contenido y Copy
- Título: "Presupuesto — [nombre del paciente]"
- Acción primaria: "Aprobar" (si pendiente)
- Toast éxito: "Presupuesto aprobado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Información en una columna; acción primaria full-width; sin scroll horizontal (REQ-215) |

---

### 12.3 Pantalla: Crear presupuesto — Paso 1 (Paciente)

**Ruta:** `/facturacion/presupuestos/nuevo/paciente`
**Layout:** stepper (1 de 3) + selección de paciente. Acción primaria "Siguiente".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (1 de 3) | dumb | Progreso |
| Combo de paciente con búsqueda | smart | Selección de paciente (REQ-216) |
| Botón primario "Siguiente" | smart | Valida → `…/nuevo/tratamientos` |
| Botón "Cancelar" | smart | Confirmación → `/facturacion/presupuestos` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin paciente | "Siguiente" deshabilitado |
| Error | Validación | Mensaje inline (REQ-219) |
| Éxito | Paciente elegido | "Siguiente" habilitado |

#### Contenido y Copy
- Título: "Nuevo presupuesto"
- Subtítulo: "¿Para qué paciente es el presupuesto?"
- CTA: "Siguiente" · Secundaria: "Cancelar"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna; touch ≥44px (REQ-271) |

---

### 12.4 Pantalla: Crear presupuesto — Paso 2 (Tratamientos)

**Ruta:** `/facturacion/presupuestos/nuevo/tratamientos`
**Layout:** stepper (2 de 3) + agregar tratamientos + **costo total automático**. Acción primaria "Siguiente".

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (2 de 3) | dumb | Progreso |
| Selector de tratamientos | smart | Agregar uno o varios (REQ-217) |
| Cálculo de costo total | smart | Suma automática, legible (REQ-217/271) |
| Botón "Atrás" | smart | Preserva datos (REQ-219) |
| Botón primario "Siguiente" | smart | → `…/nuevo/revision` |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin tratamientos agregados | "Agregá al menos un tratamiento." |
| Error | Validación | Mensaje inline |
| Éxito | Tratamientos agregados | Costo total calculado + "Siguiente" habilitado |

#### Contenido y Copy
- Subtítulo: "Agregá los tratamientos del presupuesto"
- Total: "Total estimado: $[monto]"
- CTA: "Siguiente" · Secundaria: "Atrás"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna; total legible y visible; touch ≥44px; sin scroll horizontal (REQ-271) |

---

### 12.5 Pantalla: Crear presupuesto — Paso 3 (Revisión)

**Ruta:** `/facturacion/presupuestos/nuevo/revision`
**Layout:** stepper (3 de 3) + resumen completo + confirmación.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Stepper (3 de 3) | dumb | Progreso |
| Card de resumen | dumb | Paciente + tratamientos + total (REQ-218) |
| Botón primario "Confirmar presupuesto" | smart | Persiste → detalle + toast (REQ-220) |
| Botón "Atrás" | smart | Preserva datos |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Guardando | Botón en carga sutil |
| Error | Validación | Mensaje inline |
| Éxito | Presupuesto creado | Navega al detalle + toast "Presupuesto creado." |

#### Contenido y Copy
- Subtítulo: "Revisá el presupuesto y confirmá."
- CTA: "Confirmar presupuesto"
- Toast éxito: "Presupuesto creado."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Resumen en una columna; botón full-width (REQ-271) |

---

### 12.6 Pantalla: Lista de facturas

**Ruta:** `/facturacion/facturas`
**Layout:** tabla **≤4 columnas**. Solapa de Facturación activa.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| data-table (≤4 col) | smart | Paciente · Número · Monto · Estado (REQ-221) |
| Badge de estado | dumb | Emitida / Pagada / Vencida / Anulada |
| Fila clickeable | smart | → `/facturacion/facturas/:id` (REQ-222) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | Sin facturas o filtro sin resultados | "No hay facturas con este criterio." (REQ-225) |
| Carga | Cargando | Skeletons de fila |
| Error | Fallo | Toast + reintento |
| Éxito | Facturas cargadas | Tabla con badges |
| Muchos datos | Muchas facturas | Paginación con contador |

#### Contenido y Copy
- Título: "Facturas"
- Columnas: "Paciente", "Número", "Monto", "Estado"
- **Nunca** menciona ARCA/AFIP (REQ-224).

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Filas → mini-cards (REQ-226) |

---

### 12.7 Pantalla: Detalle de factura

**Ruta:** `/facturacion/facturas/:id`
**Layout:** información completa + ítems + totales + estado. Sin acciones fiscales.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Encabezado | dumb | Número + paciente + estado (badge) |
| Lista de ítems | dumb | Ítems facturados (REQ-223) |
| Card de totales | dumb | Totales en ARS |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Cargando | Skeleton |
| Error | Inexistente | "No encontramos esta factura" + volver |
| Éxito | Cargada | Detalle completo (sin mención fiscal — REQ-224) |

#### Contenido y Copy
- Título: "Factura [número]"
- Secciones: "Ítems", "Totales"
- **Prohibido** cualquier texto fiscal (ARCA/AFIP).

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Una columna, legible (REQ-226) |

---

### 12.8 Pantalla: Lista de obras sociales

**Ruta:** `/facturacion/obras-sociales`
**Layout:** **cards aireadas** (NO tabla). Cada card = logo-en-círculo + nombre + mini-stats (pacientes activos · deuda) + avatares overlapping.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Grid de cards de obra social | smart | 6 obras sociales en cards aireadas (REQ-227) |
| Card de obra social | smart | Logo + nombre + pacientes activos + deuda; clic → `/facturacion/obras-sociales/:id` (REQ-228) |
| Avatar-stack | dumb | Pacientes/profesionales asociados (+N) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | N/A (6 fijas) | — |
| Carga | Cargando | Skeletons de card |
| Error | Fallo | Toast + reintento |
| Éxito | OS cargadas | Grid navegable |

#### Contenido y Copy
- Título: "Obras sociales"
- Obras sociales: "OSDE", "Galeno", "Swiss Medical", "PAMI", "IOMA", "Particulares"
- Por card: "[N] pacientes activos" + "Deuda: $[monto]"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards en 1–2 columnas (REQ-231) |

---

### 12.9 Pantalla: Detalle de obra social

**Ruta:** `/facturacion/obras-sociales/:id`
**Layout:** información + pacientes asociados + historial de liquidaciones. Navegar a la ficha de un paciente asociado.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Encabezado | dumb | Logo + nombre + info (REQ-229) |
| Lista de pacientes asociados | smart | Clic en paciente → `/pacientes/:id/informacion` (REQ-230) |
| Historial de liquidaciones | dumb | Liquidaciones |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | OS sin pacientes | "Esta obra social no tiene pacientes asociados." (REQ-231) |
| Carga | Cargando | Skeleton |
| Error | Inexistente | "No encontramos esta obra social" + volver |
| Éxito | Cargada | Detalle + pacientes |

#### Contenido y Copy
- Título: "[Nombre de la obra social]"
- Secciones: "Pacientes asociados", "Liquidaciones"
- Vacío: "Esta obra social no tiene pacientes asociados."

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards/listas en una columna (REQ-231) |

---

## 13. Pantallas — Reportes

> El **dashboard layout** anti-clutter: grilla aireada de **≤6 KPI cards** clickeables; cada KPI con anillo/gauge de progreso (% grande centrado + label + 0/100). Gráficos detallados en cards aireadas separadas (Apple Health-like). Chart lib carga lazy solo aquí.

### 13.1 Pantalla: Dashboard de Reportes (INICIO post-login)

**Ruta:** `/reportes`
**Layout (DASHBOARD ANTI-CLUTTER):** grilla aireada de hasta 6 KPI cards. **Cada KPI = una métrica única con visualización clara** (número grande peso 500 + azul medio + anillo/gauge de progreso + label + marcadores 0/100). **PROHIBIDO amontonar:** nada de tablas de datos en el dashboard; cada card respira. Cada card es clickeable y lleva a su reporte detallado.

```
┌──────────────────────────────────────────────────────────────────┐
│ Reportes                                                          │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                     │
│ │ Pacientes  │ │   Turnos   │ │Tratamientos│                     │
│ │  nuevos    │ │ atendidos  │ │completados │   ← KPI cards        │
│ │    ◜18◝    │ │    ◜142◝   │ │    ◜27◝    │   (% grande + anillo)│
│ │  este mes  │ │  este mes  │ │  este mes  │                     │
│ └────────────┘ └────────────┘ └────────────┘                     │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                     │
│ │  Ingresos  │ │  Ingresos  │ │   Deuda    │                     │
│ │ facturados │ │  cobrados  │ │ pendiente  │                     │
│ │ $2.480.000 │ │ $1.920.000 │ │  $560.000  │  ← montos ARS       │
│ └────────────┘ └────────────┘ └────────────┘                     │
└──────────────────────────────────────────────────────────────────┘
```

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Grid de KPI cards (≤6) | smart | Grilla aireada, máx 6 cards (REQ-232) |
| kpi-card | smart | Métrica única + anillo/gauge + label; clic → reporte detallado (REQ-233) |

**Las 6 KPIs (valores calculados del estado, NO hardcodeados — REQ-234):**
1. Pacientes nuevos del mes → `/reportes/pacientes`
2. Turnos atendidos → `/reportes/productividad`
3. Tratamientos completados → `/reportes/tratamientos`
4. Ingresos facturados → `/reportes/financiero`
5. Ingresos cobrados → `/reportes/financiero`
6. Deuda pendiente → `/reportes/financiero`

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío | N/A (siempre hay datos calculados) | — |
| Carga | Calculando KPIs | Skeletons de card (anillos fantasma, stagger) |
| Error | Fallo | Toast + reintento |
| Éxito | KPIs calculados | Grid de cards clickeables |

#### Contenido y Copy
- Título: "Reportes"
- Labels: "Pacientes nuevos", "Turnos atendidos", "Tratamientos completados", "Ingresos facturados", "Ingresos cobrados", "Deuda pendiente"
- Sub-label temporal: "este mes" donde aplica

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | KPI cards en 1–2 columnas, apiladas; cada card legible; touch ≥44px (REQ-235) |
| Tablet | 2–3 columnas |
| Desktop | 3 columnas (2 filas de 3) |

---

### 13.2 Pantalla: Reporte de pacientes

**Ruta:** `/reportes/pacientes`
**Layout:** gráficos en **cards aireadas separadas** (una métrica por card, espacio para respirar). 4 gráficos.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card gráfico "Pacientes nuevos en el tiempo" | smart | Serie temporal (REQ-237) |
| Card gráfico "Distribución por obra social" | smart | Distribución |
| Card gráfico "Distribución por edad y género" | smart | Distribución |
| Card gráfico "Ranking de profesionales" | smart | Ranking |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío (por gráfico) | Categoría sin datos | Empty state por gráfico: "Sin datos suficientes para este gráfico." (no crashea — REQ-238/246) |
| Carga | Cargando gráficos | Skeletons por card (REQ-246) |
| Error | Fallo | Toast + reintento |
| Éxito | Gráficos cargados | Cards con visualizaciones legibles |

#### Contenido y Copy
- Título: "Reporte de pacientes"
- Cards: "Pacientes nuevos en el tiempo", "Distribución por obra social", "Distribución por edad y género", "Ranking de profesionales"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Gráficos se adaptan o permiten lectura sin scroll horizontal que rompa layout (REQ-245) |

---

### 13.3 Pantalla: Reporte de tratamientos

**Ruta:** `/reportes/tratamientos`
**Layout:** 3 gráficos en cards aireadas separadas.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card "Tipos más realizados" | smart | Ranking de tipos (REQ-239) |
| Card "Tasa de finalización" | smart | % de finalización |
| Card "Duración promedio" | smart | Duración media |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío (por gráfico) | Sin datos | "Sin datos suficientes para este gráfico." |
| Carga | Cargando | Skeletons por card |
| Error | Fallo | Toast + reintento |
| Éxito | Cargado | Gráficos reflejan datos reales (REQ-240) |

#### Contenido y Copy
- Título: "Reporte de tratamientos"
- Cards: "Tipos más realizados", "Tasa de finalización", "Duración promedio"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Gráficos adaptados, sin scroll horizontal que rompa layout (REQ-245) |

---

### 13.4 Pantalla: Reporte financiero

**Ruta:** `/reportes/financiero`
**Layout:** 3 gráficos en cards aireadas separadas. Montos en ARS.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card "Ingresos por mes" | smart | Serie temporal en ARS (REQ-241) |
| Card "Facturación por obra social" | smart | Distribución en ARS |
| Card "Deuda por antigüedad" | smart | Aging de deuda |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío (por gráfico) | Sin datos | "Sin datos suficientes para este gráfico." |
| Carga | Cargando | Skeletons por card |
| Error | Fallo | Toast + reintento |
| Éxito | Cargado | Montos en ARS formateados (REQ-242) |

#### Contenido y Copy
- Título: "Reporte financiero"
- Cards: "Ingresos por mes", "Facturación por obra social", "Deuda por antigüedad"
- Montos: ARS formateado correctamente.

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Gráficos adaptados (REQ-245) |

---

### 13.5 Pantalla: Reporte de productividad

**Ruta:** `/reportes/productividad`
**Layout:** 3 gráficos en cards aireadas separadas.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card "Producción por profesional" | smart | Producción por profesional (REQ-243) |
| Card "Atendidos vs cancelados" | smart | Comparativa |
| Card "Tasa de presentación" | smart | % de presentación |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Vacío (por gráfico) | Sin datos | "Sin datos suficientes para este gráfico." |
| Carga | Cargando | Skeletons por card |
| Error | Fallo | Toast + reintento |
| Éxito | Cargado | Gráficos reflejan datos reales (REQ-244) |

#### Contenido y Copy
- Título: "Reporte de productividad"
- Cards: "Producción por profesional", "Turnos atendidos vs cancelados", "Tasa de presentación"

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Gráficos adaptados, sin scroll horizontal que rompa layout (REQ-245) |

---

## 14. Pantallas — Configuración y Ayuda

### 14.1 Pantalla: Configuración

**Ruta:** `/configuracion`
**Layout:** secciones de ajustes en cards aireadas. Contiene la acción **"Restablecer datos"** con copy de producción (el botón "Resetear demo" NO existe).

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Card "Datos de la clínica" | dumb | Nombre, CUIT, dirección (lectura) |
| Card "Preferencias" | smart | Preferencias de UI |
| Card "Administración del sistema" | smart | Contiene "Restablecer datos" |
| Botón "Restablecer datos" | smart | Confirmación que advierte pérdida → restaura al estado inicial + toast (REQ-264/265) |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Carga | Cargando | Skeleton |
| Error | Fallo | Toast + reintento |
| Éxito | Cargada | Cards de ajustes |
| Confirmación de reset | Al activar "Restablecer datos" | Modal de confirmación <50% advirtiendo pérdida de cambios (REQ-265) |

#### Contenido y Copy (CRÍTICO — cero demo)
- Título: "Configuración"
- Sección: "Administración del sistema"
- Acción: **"Restablecer datos"** (NUNCA "Resetear demo")
- Descripción de la acción: "Restaurá el sistema a su estado inicial. Se perderán los cambios realizados."
- Confirmación: "¿Restablecer los datos? Se perderán todos los cambios y el sistema volverá a su estado inicial." → "Sí, restablecer" / "Cancelar"
- Toast éxito: "Datos restablecidos correctamente."
- **Prohibido:** las palabras "demo", "mock", "simulación", "simulado", "de prueba", "ejemplo", "ficticio", "viewcase" en label, descripción, confirmación y toast (REQ-264). Es la **única vía de reset** (no está en el footer — REQ-027/266).

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards apiladas; "Restablecer datos" usable, touch ≥44px (REQ-266) |

---

### 14.2 Pantalla: Ayuda

**Ruta:** `/ayuda`
**Layout:** centro de ayuda interno: secciones informativas / FAQ bien estructuradas, con lógica de negocio (cómo agendar un turno, cómo registrar un pago, cómo editar el odontograma). Cards aireadas.

#### Componentes
| Componente | Tipo | Responsabilidad |
|---|---|---|
| Secciones de FAQ | dumb | Preguntas frecuentes estructuradas por tema |
| Card por tema | dumb | Agenda · Pacientes · Facturación · Reportes |

#### Estados de UI
| Estado | Descripción | Indicador visual |
|---|---|---|
| Éxito | Contenido de ayuda | Secciones aireadas |
| Carga | Cargando | Skeleton |

#### Contenido y Copy (cero demo)
- Título: "Ayuda"
- Temas: "Cómo agendar un turno", "Cómo gestionar la ficha de un paciente", "Cómo registrar un pago", "Cómo trabajar con el odontograma", "Cómo crear un presupuesto"
- Tono profesional pero cercano; **sin** lenguaje de demo.

#### Responsive
| Breakpoint | Cambios |
|---|---|
| Mobile | Cards apiladas en una columna |

---

## 15. Content Strategy

> CRÍTICA — REQ-272 / BVC-027 + NFR-034. Todo el copy en **español rioplatense neutro**, profesional pero cercano. **Barrido anti-demo de punta a punta.** Presentación como producto real en producción.

### 15.1 Glosario de marca (términos correctos)

| Usar | NO usar |
|---|---|
| ficha del paciente | expediente |
| turno | cita / appointment |
| obra social | seguro / aseguradora |
| presupuesto | cotización / quote |
| profesional / odontólogo/a | doctor (a secas) |
| estado de cuenta | balance |
| registrar pago | cargar pago / agregar pago |
| restablecer datos | resetear demo / restaurar mock |
| Estudio Dental Mendieta | la app / el sistema demo |

### 15.2 Barrido anti-demo (palabras y elementos PROHIBIDOS en toda la UI)

**Prohibido en header, footer, login, toasts, notificaciones, empty states, tooltips, Configuración, copy de cualquier pantalla:**
- "demo", "mock", "simulación", "simulado", "de prueba", "ejemplo", "ficticio", "viewcase"
- "Demo interactivo de…", "Resetear demo"
- Atribución a Link Design / portfolio / sitio de portfolio
- Cualquier mención a ARCA / AFIP / integración fiscal (en facturas/presupuestos)

**Presentaciones como reales (no delatar el mock):**
- Notificación de WhatsApp al reagendar: "Se notificó al paciente por WhatsApp." (presentada como envío real — REQ-089)
- Documentos clínicos (radiografías/fotos): se presentan como documentos reales del paciente, sin etiqueta de mock (REQ-157)
- Facturas/presupuestos: documentos reales del sistema, sin organismos fiscales (REQ-224)
- Reset: "Restablecer datos" como función normal de administración, solo en Configuración (REQ-264)

### 15.3 Catálogo de copy final por superficie (extracto canónico)

| Superficie | Copy final |
|---|---|
| Login — título | "Estudio Dental Mendieta" |
| Login — subtítulo | "Ingresá para gestionar la agenda, las fichas y la facturación de la clínica." |
| Login — CTA | "Ingresar como administradora" / "Saltar login" |
| Footer | "Estudio Dental Mendieta · v1.0 · 2026" |
| Sidebar items | "Agenda" · "Pacientes" · "Tratamientos" · "Facturación" · "Reportes" · "Configuración" · "Ayuda" |
| Agenda — vacío | "No hay turnos en este período. Creá uno con Nuevo turno." |
| Turno — cancelar (confirm) | "¿Cancelar este turno? El paciente quedará sin la cita agendada." |
| Reagendar — notificación | "Se notificó al paciente por WhatsApp." |
| Crear turno — toast | "Turno agendado." |
| Pacientes — sin resultados | "No encontramos pacientes con ese criterio. Probá con otro nombre o ajustá los filtros." |
| Ficha — eliminar (confirm) | "¿Eliminar la ficha de [nombre]? Esta acción no se puede deshacer." |
| Tab Info — placeholders | "Sin medicación registrada" · "Sin alergias registradas" · "Sin observaciones" |
| Historial — vacío | "Este paciente todavía no tiene eventos clínicos registrados." |
| Tratamientos (tab) — vacío | "Este paciente todavía no tiene tratamientos." |
| Documentos — vacío | "Este paciente todavía no tiene documentos cargados." |
| Pagos — vacío | "Sin movimientos en la cuenta corriente." |
| Registrar pago — validación | "Ingresá un monto mayor a cero." |
| Registrar pago — toast | "Pago registrado." |
| Detalle pieza — vacío | "Sin procedimientos registrados en esta pieza." |
| Detalle pieza — toast | "Estado de la pieza actualizado." |
| Crear paciente — toast | "Paciente creado." |
| Editar paciente — toast | "Cambios guardados." |
| Presupuestos — vacío | "No hay presupuestos con este criterio. Creá uno con Nuevo presupuesto." |
| Presupuesto — toast aprobar | "Presupuesto aprobado." |
| Facturas — vacío | "No hay facturas con este criterio." |
| Obra social — vacío | "Esta obra social no tiene pacientes asociados." |
| Reportes — gráfico sin datos | "Sin datos suficientes para este gráfico." |
| Configuración — reset (acción) | "Restablecer datos" |
| Configuración — reset (confirm) | "¿Restablecer los datos? Se perderán todos los cambios y el sistema volverá a su estado inicial." |
| Configuración — reset (toast) | "Datos restablecidos correctamente." |
| No encontrado | "No encontramos esta página." + "Volver al inicio" |
| Paciente no encontrado | "No encontramos este paciente." + "Volver a la lista de pacientes" |

### 15.4 Datos de marca y sector (para que el contenido posicione a la clínica como real)

- **Clínica:** Estudio Dental Mendieta · CUIT 30-71234567-8 · dirección de zona céntrica.
- **6 profesionales:** Dra. Carolina Etcheverry (ortodoncia) · Dr. Martín Aguilera (endodoncia) · Dra. Soledad Russo (odontología general) · Dr. Juan Pablo Acuña (implantología) · Dra. Laura Béccar Varela (estética dental) · Dr. Federico Salinas (odontopediatría).
- **6 obras sociales:** OSDE · Galeno · Swiss Medical · PAMI · IOMA · Particulares.
- **Catálogo de tratamientos (12+):** Limpieza profesional, Ortodoncia con brackets, Ortodoncia invisible, Implante unitario, Implante múltiple, Conducto, Blanqueamiento, Carilla estética, Corona, Extracción simple, Extracción de molar, Prótesis fija, Prótesis removible.
- **Montos:** siempre ARS formateado ("$120.000").
- **Tiempos relativos:** "hace 30 min", "hace 1 h", "hace 2 días", "hace 5 días".

---

## 16. Gaps de UX descubiertos

> Ninguno bloqueante. Notas de coordinación dentro del lenguaje prescriptivo; varias ya resueltas por la fuente. No requieren al cliente.

| # | Gap | Impacto | Recomendación |
|---|---|---|---|
| GAP-UX01 | **Vista activa del calendario (mes/semana/día) en la URL.** El brief pide que la vista activa se refleje en la URL/estado (REQ-060) pero el árbol de rutas no separa rutas por vista. | Deep-link a una vista específica | Reflejar la vista como **query param** (`/agenda?vista=semana`) en lugar de ruta hija, manteniendo el calendario en una sola pantalla. Documentado en el mapa de navegación. La lista del día sí tiene ruta propia (`/agenda/dia`). |
| GAP-UX02 | **"Crear paciente nuevo" dentro del flujo de crear turno** (REQ-079) cruza dos flujos multi-paso. | Preservación de estado entre flujos | Recomiendo abrir el flujo de crear paciente (`/pacientes/nuevo/datos`) con un parámetro de retorno (`?volverA=/agenda/nuevo/profesional`); al crear el paciente, retornar al Paso 2 del turno con el paciente preseleccionado. Mantiene multi-pantalla sin perder contexto. |
| GAP-UX03 | **Sub-navegación interna de Facturación** (Presupuestos / Facturas / Obras sociales) podría confundirse con tabs entre objetos. | Riesgo de violar anti-patrón #16 (tabs entre objetos) | Tratarla como **navegación de sección** (no como los tabs de la ficha): son 3 listas hermanas dentro del módulo Facturación, cada una con su ruta dedicada (`/facturacion/presupuestos`, `/facturacion/facturas`, `/facturacion/obras-sociales`). No es "tabs del mismo objeto"; es navegación de módulo con rutas reales. Se permite como sub-nav porque cada destino es una ruta completa, no contenido oculto en el DOM. |
| GAP-UX04 | **Toggle Card/Tabla en lista de pacientes** (Patrón 12) no es obligatorio por requirements (REQ-098 prescribe tabla ≤5 col). | Mejora persona-céntrica | Propuesto como mejora: Tabla = vista primaria (cumple ≤5 col); Card View = cards de paciente (persona-céntrico). El toggle queda a criterio de implementación dentro del lenguaje. No introduce filtros ni acciones extra. |
| GAP-UX05 | **Ayuda** (REQ-020) no tiene criterios de contenido en requirements (solo existe como item del sidebar). | Pantalla shell sin spec funcional | Diseñada como centro de ayuda interno (FAQ por tema con lógica de negocio), copy de producción, sin demo. Es pantalla shell navegable (DEMO-018). |
| GAP-UX06 | **Pantalla de inicio post-login.** REQ-002 dice "dashboard de Reportes (o pantalla de inicio definida)". | Ambigüedad de destino inicial | Decisión: el inicio post-login es **`/reportes`** (dashboard de KPIs), porque da una vista de operación viva inmediata (pacientes nuevos, turnos, ingresos). Documentado en el mapa de navegación. |
| GAP-UX07 | **Notificaciones** como panel vs pantalla. Task Dasher las trata como pantalla; el brief las menciona como patrón de lista. | Coherencia multi-pantalla | Decisión: panel contextual ligero anclado al header (no contenido principal, <50%, hoja inferior en mobile). Cada notificación navega a una **ruta real** (detalle de turno, tab Pagos). Mantiene multi-pantalla sin convertir el panel en drawer de contenido. |

---

## Verificación de cobertura (antes del retorno)

- **DEMO-001..004** (shell): sidebar 5 items + Config/Ayuda, header sin búsqueda global, footer discreto, routing multi-pantalla — §3.
- **DEMO-007/008/009/011/012/013/014** (layouts de módulos): calendario, lista pacientes, ficha + 6 tabs, contenido de tabs, tratamientos, facturación, dashboard Reportes — §8–§13.
- **DEMO-015/016** (flujos multi-paso): crear turno (3 pasos) y registrar pago — §8.3–8.5, §10.7, §6.2, §6.3.
- **DEMO-017** (estados): sistema de estados por pantalla + tabla de mapeo — §4 + cada pantalla.
- **DEMO-018** (shell del resto): reagendar, crear presupuesto, reportes detallados, configuración, sub-detalles, Ayuda — §8.6, §12.3–12.5, §13.2–13.5, §14, §10.
- **DEMO-020** (responsive): 3 breakpoints + patrón maestro + reglas duras — §5 + cada pantalla.
- **DEMO-021** (cero demo): content strategy + barrido anti-demo — §15.
- **BVC-007/008/010/011/012/023/024/025/026/027/028**: aplicados en shell, listas, flujos y content strategy.
- **~40 pantallas / ~49 rutas** con layout + 5 estados (vacío/carga/error/éxito/muchos datos) + responsive (mobile/tablet/desktop) — §7–§14.
- **Los 5 módulos** con user journeys multi-pantalla — §6.
- **Reglas duras** (multi-pantalla estricto, 1 acción primaria, ≤5 col, 1 filtro, sin drawers, sin modales >50%, tabs solo del mismo objeto, pagos + odontograma editables) — aplicadas transversalmente.
- **NFR-034** (rioplatense neutro) — §15.
