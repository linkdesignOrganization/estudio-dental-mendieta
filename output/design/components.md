# Componentes — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Component Designer
**Fecha**: 2026-06-01
**Fuentes**: `visual-analysis.md` (visión visual prescriptiva 🔒 + 29 BVC + 13 patrones Task Dasher traducidos + decisiones holísticas), `requirements.md` (272 REQ + 20 NFR), `architecture.md` (Angular 17 standalone, catálogo `shared/`)
**Stack de implementación**: Angular 17+ standalone (`@if`/`@for`/`@defer`), Bootstrap 5 selectivo (grid + utilidades) + capa de tokens propia, iconografía **Phosphor** (regular, stroke 1.5px) como SVG, tipografía **Red Hat Display + Text** (400/500) self-hosted.

> **Cómo leer este documento.** Este es el catálogo de la librería `shared/` + componentes de dominio. Para cada componente: **inputs/outputs** (en términos Angular), **estados** (default/hover/focus/active/disabled/selected/loading/error según aplique), **variantes**, **responsive** (TODO usable en mobile, touch ≥44px), **accesibilidad** (focus visible, contraste WCAG AA, ARIA) y los **valores exactos prescriptivos** del brief. Donde un valor está marcado 🔒 es CLIENT-SPECIFIED y se usa EXACTO. Los tokens (`--color-accent`, `--space-16`, etc.) los define el Visual System Designer en `design-tokens.md`; aquí los referencio por nombre semántico y doy el valor cuando es load-bearing.

---

## Convenciones globales (aplican a TODOS los componentes)

### Tokens de referencia (valores 🔒 del brief — el Visual System Designer los formaliza)

| Token semántico | Valor 🔒 | Uso |
|---|---|---|
| `--color-accent-soft` | `#c5d8e8` (azul cielo) | Fondo de estado seleccionado/activo, hover sutil, track de progreso, banner de ficha |
| `--color-accent` | `#6da8d4` (azul medio) | Relleno de barra de progreso, item activo, **una** acción primaria, icon-chips |
| `--color-accent-deep` | azul más profundo derivado (≈ `#3d7aad`, lo fija el Visual System Designer) | Texto/ícono sobre claro, superficies con texto blanco, círculo "+N", número de progreso |
| `--color-accent-tint` | azul casi-blanco (≈ `#eef4f9`) | Fondo tintado de tab activo / fila seleccionada / chip de iniciales |
| `--color-bg` | `#ffffff`–`#fafafa` | Canvas (app) y superficie de card |
| `--color-text` | `~#2a2a35` | Texto principal (gris oscuro cálido, NUNCA negro) |
| `--color-text-muted` | `~#707080` | Subtítulos, captions, labels, timestamps |
| `--color-border` | `#e8e8ee` | Borde de card/input (0.5–1px), dividers |
| `--shadow-1` | offset 1px / blur 4px / op 0.04 | Único nivel de sombra. **Card vive con borde O sombra, NUNCA ambos** (BVC-005) |
| `--radius-card` | 10–14px | Radius de cards, badges, inputs, botones. **>20px PROHIBIDO** (BVC-004) |
| `--space-*` | 4·8·12·16·24·32·48·64 | Escala base, todo múltiplo de 4 (BVC-006) |
| `--control-h` | 40px | Altura de inputs y botones (BVC-017) |
| `--touch-min` | 44px | Touch target mínimo en mobile (BVC-017 / NFR-022) |
| `--disabled-op` | 40% | Opacidad de elementos disabled (BVC-015) |
| `--motion` | 150–250ms, easing suave | Transiciones y hover (BVC-021) |

### Semánticos pastel (siempre fondo pastel + texto/ícono en versión oscura del mismo hue — NUNCA texto blanco sobre pastel claro)

| Semántico | Fondo pastel | Texto/ícono (oscuro del hue) | Uso |
|---|---|---|---|
| Éxito (verde) | verde pastel | verde profundo | Confirmado, Al día, Completado, toast de éxito |
| Error (coral) | coral pastel | coral profundo | Cancelado, Vencido, toast de error |
| Warning (ámbar) | ámbar pastel | ámbar profundo | Atrasado, Con deuda, por confirmar |
| Info (azul) | azul info pastel | `--color-accent-deep` | Atendiendo, En curso, informativos |
| Neutro (gris) | gris muy tenue | `--color-text-muted` | Terminado, En pausa, estados sin color |

> El Visual System Designer fija los hex exactos de cada par y documenta el ratio de contraste; aquí se usan por nombre. **Regla maestra de legibilidad (GAP-A04):** texto/glifo SIEMPRE en la versión oscura del hue, garantizando ≥4.5:1.

### Reglas transversales de estado (BVC-015) — obligatorias en CADA elemento clickeable

- **Hover** (cards, filas, items de lista, botones, pills, icon-buttons, tabs, piezas del odontograma, KPI cards): visible, ≤250ms, easing suave. Receta por defecto: tinte de fondo a `--color-accent-soft` al 12–18% **o** elevación a `--shadow-1` (no ambas a la vez con borde). NUNCA transform agresivo — máximo `translateY(-1px)` o `scale(1.01)`.
- **Focus**: focus ring SIEMPRE visible (NUNCA `outline:none` sin reemplazo). Ring = 2px `--color-accent-deep` con offset 2px, o `box-shadow` equivalente. Requisito de teclado (NFR-021 / REQ-255).
- **Active/pressed**: leve oscurecimiento del fondo o `translateY(0)` desde hover (feedback táctil).
- **Disabled**: opacidad 40%, `cursor: not-allowed`, no recibe focus ni hover.
- **Selected/activo** (nav, fila, tab): fondo `--color-accent-tint`/`--color-accent-soft` tintado, esquinas redondeadas (`--radius-card`), consistente en toda la app.

### Reglas anti-demo (BVC-027 / REQ-272) — aplican al copy de TODO componente

- CERO apariciones de: demo · mock · simulación · simulado · de prueba · ejemplo · ficticio · viewcase · atribución a Link Design/portfolio.
- Todo el copy en **español rioplatense neutro**, profesional pero cercano ("ficha del paciente", "turno", "obra social"; NUNCA "expediente"). NFR-034.
- Sin emojis decorativos en ningún componente (anti-patrón #5 / BVC-018). Los íconos son Phosphor SVG, nunca emoji.

### Iconografía (🔒 BVC-014)

Un solo set **Phosphor regular**, stroke 1.5px. Tamaños fijos: **16px** inline, **20px** botones/filas, **24px** acciones primarias. Los íconos **heredan el color del texto contiguo** (`currentColor`); excepción: íconos de estado toman su color semántico. **Ningún ícono sin label en navegación** (BVC-025).

### Motion holística — carga con stagger (aplica a listas/grids de cards)

Un único momento orquestado por pantalla: al entrar a una lista/grid, los **skeletons** (obligatorios, BVC-016) se revelan con **stagger** (delay incremental ~40ms por fila/card), y al hidratar, las filas/cards entran con **fade + rise mínimo** (`opacity 0→1`, `translateY(8px→0)`), ≤250ms. NUNCA spinners.

---

# 1 · Chasis / Navegación

## Componente: `app-shell`

Layout maestro: header persistente + sidebar + `<router-outlet>` + footer. Vive en `shared/components/app-shell/`. NO en login.

- **Inputs**: `activeModule: ModuleId` (sincronizado con la ruta), `notificationCount: number`.
- **Outputs**: `(toggleMobileNav)`.
- **Composición**: grid de 2 columnas en desktop (sidebar fijo ~230–250px + área de contenido con header sticky arriba, outlet en el medio, footer abajo). Canvas `--color-bg` (`#fafafa`); las pantallas montan cards blancas flotantes encima (chasis soft-UI Task Dasher).
- **Responsive**:
  - Desktop (≥1024px): sidebar fijo visible; header full.
  - Tablet (768–1023px): sidebar fijo; header puede comprimir el wordmark.
  - Mobile (<768px): sidebar oculto → se invoca como **drawer overlay** por botón hamburguesa del header (permitido: drawer de NAVEGACIÓN, BVC-023); contenido a 1 columna.
- **Accesibilidad**: `<header>` landmark, `<nav>` landmark en sidebar, `<main>` en el outlet, `<footer>` landmark. Skip-link "Saltar al contenido" oculto hasta foco.

## Componente: `sidebar` (DEMO-001 · REQ-017..024 · BVC-007 · Patrón 1)

Columna fija con 5 items principales + Configuración/Ayuda. Item activo en píldora (traducción de Task Dasher: píldora blanca elevada → adaptada a radius 10–14px + fondo azul-cielo tintado).

- **Inputs**: `items: NavItem[]` (label, icon Phosphor, route, badgeCount?), `activeRoute: string`, `isMobileOpen: boolean`.
- **Outputs**: `(navigate)`, `(close)` (mobile).
- **Estructura**: logo arriba (isotipo dental sutil + wordmark "Estudio Dental Mendieta"). Orden EXACTO de items: **Agenda · Pacientes · Tratamientos · Facturación · Reportes** → separador (`--color-border` 1px) → **Configuración · Ayuda**. Cada item = ícono Phosphor 20px (izquierda) + label de texto SIEMPRE visible. Item de notificaciones/pendientes lleva **badge de conteo** circular (fondo `--color-accent-deep`, texto blanco — el deep sí pasa AA con blanco; el accent medio no) a la derecha.
- **Estados por item**:
  - default: texto `--color-text-muted`, ícono heredando.
  - **hover**: fondo `--color-accent-soft` al ~14%, texto `--color-text`, ≤250ms.
  - **active/seleccionado** (ruta actual): **píldora** con fondo `--color-accent-soft` tintado, radius 10–14px, texto `--color-text`, ícono en `--color-accent-deep`, indicador sutil (no barra lateral pesada). Sincronizado con la URL (REQ-019/022).
  - focus: ring visible (teclado).
- **Variantes**: `desktop` (fijo, NO colapsable — REQ-021), `mobile-drawer` (overlay con backdrop translúcido, ancho ~80vw máx 320px, cierra al tocar backdrop o navegar).
- **Responsive**: desktop fijo; mobile → drawer overlay por hamburguesa. Items mantienen icono + label y **touch target ≥44px** por fila (REQ-023). Sin scroll horizontal.
- **Accesibilidad**: `role="navigation"`, `aria-label="Navegación principal"`. Item activo con `aria-current="page"`. Badge de conteo con `aria-label="N notificaciones"`. Navegable por teclado (Tab/Enter), focus ring visible (REQ-024). **NUNCA íconos sin label** (BVC-025 / anti-patrón #18). Drawer mobile: trap de foco mientras está abierto, `Escape` cierra.
- **Premium**: la píldora activa "flota" con el lenguaje soft-UI; transición de fondo ≤250ms al cambiar de ruta.

## Componente: `header` (DEMO-002 · REQ-008..016 · BVC-008 · Patrón 2)

Barra superior persistente. Sin búsqueda global, sin command palette, sin carrito, **sin badge demo**.

- **Inputs**: `moduleName: string` (nombre del módulo activo, sincronizado con ruta), `notificationCount: number`, `user: { initials: 'AD' }`, `contextSearch?: { placeholder, value }` (search CONTEXTUAL opcional por pantalla).
- **Outputs**: `(toggleNav)` (hamburguesa mobile), `(openNotifications)`, `(openUserMenu)`, `(contextSearchChange)`.
- **Estructura** (izq → der): [hamburguesa solo mobile] · logo (isotipo+wordmark, oculta wordmark en mobile) · nombre del módulo activo (REQ-009) · spacer · [search-pill **contextual** si la pantalla lo provee — filtra SOLO el contexto actual, NUNCA global, REQ-014] · campana de notificaciones con **badge contador** (dot + número, fondo `--color-accent-deep`) · avatar "AD".
- **Sub-pieza `search-pill`**: input contextual, altura 40px, radius 10–14px (NO la píldora total de Task Dasher — anti-patrón #7), borde `--color-border`, ícono lupa Phosphor 16px a la izquierda. Estados hover/focus estándar.
- **Estados**: campana y avatar son icon-buttons (ver `icon-button`): hover/focus/active. Badge contador oculto si `count === 0`.
- **Variantes**: `transparent`/`solid` NO aplican aquí (la app no usa hero); header siempre solid sobre canvas, separado por `--color-border` inferior O `--shadow-1` (no ambos).
- **Responsive**: mobile colapsa wordmark y search-pill (search puede pasar a un icon-button que expande); hamburguesa visible; campana y avatar siempre accesibles, touch ≥44px (REQ-016). Sin scroll horizontal.
- **Accesibilidad**: `role="banner"`. Campana `aria-label="Notificaciones, N sin leer"`, `aria-haspopup`. Avatar `aria-label="Cuenta: Administradora"`, `aria-haspopup="menu"`. Search-pill con `<label>` asociado (visualmente oculto). Activable por teclado.
- **Anti-demo**: ningún texto/elemento "demo", ningún "Resetear demo", nada que delate el mock (REQ-011 / BVC-027). NO búsqueda global ni atajos globales (REQ-013 / BVC-024).

## Componente: `footer` (DEMO-003 · REQ-025..028)

Pie discreto. No compite con el contenido. Sin atribución, sin reset.

- **Inputs**: `version: string` (ej. "v1.0"), `clinicName: string`, `year: number`.
- **Estructura**: una línea sobria, texto `--color-text-muted`, tamaño cuerpo: nombre de la clínica + "v1.0" + año. Separado del contenido por `--color-border` superior 1px.
- **Estados**: estático; si incluyera un link (ej. Ayuda), hover/focus estándar.
- **Responsive**: en mobile la línea puede envolver a 2 renglones centrados; sin scroll horizontal.
- **Accesibilidad**: `role="contentinfo"`. Contraste de `--color-text-muted` sobre `#fafafa` ≥4.5:1 (verificado por Visual System Designer).
- **Anti-demo (CRÍTICO)**: NO incluye "v1.0 demo", NO link a Link Design/portfolio, NO acción "Resetear demo" ni similar (REQ-026/027 / BVC-027). El reset vive SOLO en Configuración.

---

# 2 · Datos / Estado (badges, avatares, foto, tiempo)

## Componente: `status-badge` (REQ-096/104/210 · BVC-018 · Patrón 6 — A INTRODUCIR)

Pill pastel de estado. Task Dasher NO tiene badges de estado de actividad → se **derivan** de sus status soft-badges + priority pills, pero en versión **pastel** (anti-patrón #4: nada estridente).

- **Inputs**: `kind: 'turno' | 'tratamiento' | 'pago'`, `value: StatusValue`, `size?: 'sm' | 'md'` (default md), `withDot?: boolean` (default true).
- **Estructura**: pill redondeado (radius dentro de 10–14px o pill suave), padding compacto (`--space-8` horizontal / `--space-4` vertical), **fondo pastel del hue + texto en versión oscura del mismo hue**, opcional **dot/ícono de estado** 16px en color semántico a la izquierda. Tamaño de texto = cuerpo (no introduce un 4º tamaño). Peso 500.
- **Mapeos prescritos** (del Patrón 6):

  | kind | value → semántico |
  |---|---|
  | **turno** | Confirmado → éxito · En espera → warning · Atendiendo → info · Terminado → neutro · Cancelado → error |
  | **tratamiento** | En curso → info · Atrasado → warning · En pausa → neutro · Completado → éxito |
  | **pago** | Al día → éxito · Con deuda → warning · Vencido → error |

- **Estados**: el badge es **no interactivo** por defecto (es un indicador). Si se usa como filtro-chip clickeable, recibe hover/focus (ver `filter-panel`). Nunca disabled.
- **Variantes**: `sm` (en filas densas de tabla), `md` (en cards/cabeceras). El bloque coloreado de turno en el **calendario** reutiliza el mismo mapeo cromático como fondo de bloque.
- **Responsive**: el texto no se trunca; en filas mobile el badge baja de línea junto al timestamp si hace falta. Touch N/A (no clickeable).
- **Accesibilidad**: el color NUNCA es el único portador de significado → SIEMPRE acompaña **texto** (REQ-256, color-independiente). `aria-label` redundante si solo hay dot. Contraste texto-sobre-pastel ≥4.5:1 (par oscuro del hue).
- **Regla de disciplina**: máximo **un** status-badge + **un** priority-pill por registro (no saturar la fila). Se acompaña de `relative-time` como complemento, no sustituto (Patrón 8).

## Componente: `priority-pill` (REQ asociado P7 · Patrón 7)

Pill High/Mid/Low en versión **pastel** (atenuar los sólidos saturados de Task Dasher).

- **Inputs**: `level: 'high' | 'mid' | 'low'`, `size?: 'sm' | 'md'`.
- **Estructura**: idéntica receta que `status-badge` (pill pastel, texto oscuro del hue). Mapeo: High → coral/error pastel · Mid → ámbar/warning pastel · Low → verde/éxito pastel. Aplica a urgencia de turno (ej. turno de hoy sin confirmar = High) o nivel de atención.
- **Estados**: no interactivo (indicador).
- **Accesibilidad**: texto "Alta/Media/Baja" siempre presente (color-independiente). Contraste ≥4.5:1.
- **Disciplina**: convive con el status-badge sin saturar; máx uno de cada por registro.

## Componente: `avatar` (REQ-046/109/179 · Patrón 4/5)

Avatar circular con fallback determinista a iniciales.

- **Inputs**: `src?: string`, `name: string` (para iniciales y alt), `size: 'xs'(24) | 'sm'(32) | 'md'(48) | 'lg'(88) | 'xl'(120)`.
- **Estructura**: círculo; si `src` carga → imagen `object-fit: cover`; si falta o falla (`onerror`) → **iniciales** (1–2 letras de `name`) centradas sobre fondo `--color-accent-tint` (pastel), texto `--color-accent-deep` peso 500. **NUNCA imagen rota** (REQ-179/159). En la ficha (lg/xl) lleva **borde blanco** 2–4px (efecto recortado tipo Profile de Task Dasher).
- **Estados**: si es clickeable (avatar en celda que abre ficha), hereda hover/focus de la fila contenedora. Loading: skeleton circular (ver `skeleton`).
- **Responsive**: tamaños fijos por contexto; en mobile la foto de ficha pasa a `lg` recentrada solapando el banner (ver cabecera de ficha).
- **Accesibilidad**: `alt` = nombre del paciente/profesional cuando es imagen; las iniciales son decorativas (`aria-hidden`) porque el nombre está adyacente; si el avatar va solo, `role="img"` + `aria-label="Foto de {name}"`.

## Componente: `avatar-stack` (REQ asociado P5 · Patrón 5)

Cluster de avatares solapados con círculo "+N".

- **Inputs**: `people: { src?, name }[]`, `max?: number` (default 4), `size?: 'sm'(32)` (default).
- **Estructura**: avatares circulares ~28–32px con **borde blanco 2px**, solapados ~40% (margin-left negativo). Si `people.length > max` → último círculo muestra **"+N"** con fondo `--color-accent-deep` (NO el medio — para que el texto blanco/oscuro pase AA) y texto contrastante. Orden z-index ascendente (el primero arriba).
- **Uso**: profesionales asignados a un tratamiento; pacientes con turno en un día (Agenda); pacientes/profesionales de una obra social.
- **Estados**: si el stack es clickeable (abre lista), hover (leve separación de avatares) + focus ring en el grupo.
- **Responsive**: en mobile reduce `max` a 3 si el ancho es chico; mantiene legible.
- **Accesibilidad**: `aria-label` que enumera ("Carolina, Martín, Soledad y 2 más") en el grupo; el "+N" no es solo color → tiene número visible.

## Componente: `photo` (foto de paciente — alias semántico de `avatar` lg/xl con fallback)

Variante de `avatar` para la foto protagonista del paciente en lista (sm) y ficha (xl). Fallback determinista a iniciales en círculo pastel (REQ-179). Garantiza: nunca imagen rota; placeholder controlado si un thumbnail no carga (REQ-159). En Documentos, los thumbnails que fallan muestran un placeholder de "imagen no disponible" sobrio (ícono Phosphor `image` + fondo neutro), no el ícono de error del navegador.

## Componente: `relative-time` (REQ-146 · Patrón 8)

Timestamp relativo en español.

- **Inputs**: `date: Date | string`.
- **Salida**: formato relativo en español rioplatense: "hace 30 min", "hace 1 h", "hace 5 días", "ayer", "hace 2 semanas". Implementado vía pipe `relativeTime` (architecture). Color `--color-text-muted`, tamaño cuerpo.
- **Estructura**: alineado a la derecha en filas/tablas; en la ficha y listas operativas (turnos, tratamientos, pagos, notificaciones).
- **Responsive**: en mobile **baja a una segunda línea** dentro del item (no compite horizontalmente).
- **Accesibilidad**: `<time datetime="ISO">` con el valor relativo como contenido y la fecha absoluta en `title`/`aria-label` ("3 de mayo de 2026, 14:20").

---

# 3 · Cards (replican Task Dasher — BVC-019)

> Todas las cards: superficie blanca, radius 10–14px, padding 24–32px, separación 16–20px entre cards, **borde O sombra (NUNCA ambos)**. Clickeables → hover (elevación `--shadow-1` o tinte) + focus ring + cursor pointer. Carga → skeleton con la forma de la card + stagger.

## Componente: `patient-card` (DEMO-011 · REQ-098/107 · Patrón 4)

Card de paciente persona-céntrica (Card View de la lista; también reutilizable en obras sociales/resultados).

- **Inputs**: `patient: { foto, nombre, edad, obraSocial, telefono?, proximaCita?, estadoCuenta }`.
- **Outputs**: `(open)` (→ ficha), `(edit)`.
- **Estructura**: `photo` circular grande centrado (md/lg ~88px) arriba + **nombre** peso 500 (tamaño subtítulo) + subtítulo `edad · obra social` (`--color-text-muted`) + divider tenue + 2 filas de **icon-chips azules** (teléfono, próxima cita: ícono Phosphor 16px en `--color-accent-deep` + label gris + valor) + **`status-badge` de pago** (estadoCuenta) + footer "Ver ficha" (link azul) con acción inline editar (icon-button lápiz, gris).
- **Estados**: hover (elevación + footer "Ver ficha" se refuerza); focus ring en toda la card; loading skeleton (círculo + 3 líneas).
- **Responsive**: en grid desktop 3 columnas → 1 columna mobile; touch ≥44px en card y en el icon-button editar. Foto y nombre siempre legibles.
- **Accesibilidad**: card como `<a>`/`role="link"` con `aria-label="Ficha de {nombre}"`; el botón editar es un control independiente (no anidar interactivos: editar va fuera del área de link o con `stopPropagation` + foco propio). Persona-céntrico: la foto es protagonista.

## Componente: `treatment-card` / `progress-card` (DEMO-011/012 · REQ-150/196 · Patrón 3)

Card de tratamiento con número grande de progreso + barra. Traducción clave: el "% enorme y bold" de Task Dasher → **número grande en peso 500 + azul medio** (NO bold).

- **Inputs**: `title: string`, `percent: number` (0–100), `stages?: { done, total }` (ej. 3/5), `status?: StatusValue`, `nextDate?`, `professionals?: Person[]`.
- **Outputs**: `(open)` (→ detalle de plan), `(menu)`.
- **Estructura**: **% grande** (tamaño display, peso **500**, color `--color-accent` o `--color-accent-deep` para legibilidad) + label "Progreso" (`--color-text-muted`, cuerpo) + **barra de progreso** (relleno `--color-accent` `#6da8d4`, track `--color-accent-soft` `#c5d8e8` o `--color-border`) + nombre del tratamiento (peso 500) + opcional "X/Y etapas" + opcional `status-badge` (solo si la barra/estado representa estado real: ej. "Atrasado" → warning) + `avatar-stack` de profesionales + menú `⋯` (icon-button) en esquina sup. der.
- **Estados**: hover (elevación); focus ring; menú `⋯` con hover/focus; loading skeleton (línea grande + barra + 2 líneas).
- **Variante** `progress-card` "pura": solo % + label + barra, sin nombre (reutilizable para progreso de un plan en su detalle).
- **Responsive**: 1 columna en mobile; barra full-width; % grande mantiene escala. Touch ≥44px en card y menú.
- **Accesibilidad**: barra de progreso `role="progressbar"` con `aria-valuenow/min/max` y `aria-label="Progreso del tratamiento: 60%"`. El % grande no es solo decorativo → tiene el `aria-label`. Color semántico de estado siempre con texto.
- **Disciplina cromática**: el azul es la familia única; semánticos SOLO si la barra representa estado, nunca decoración (se evita la paleta rosa/ámbar/verde decorativa de Task Dasher).

## Componente: `obra-social-card` (DEMO-013 · REQ-227 · Patrón 10 — FUSIÓN)

Card de obra social (fusión de Company card `/companies` + company card del dashboard).

- **Inputs**: `obraSocial: { logo, nombre, pacientesActivos, deuda, ultimoPago? }`, `members?: Person[]`.
- **Outputs**: `(open)` (→ detalle).
- **Estructura**: **logo dentro de círculo** con borde sutil (`--color-border`) arriba + nombre peso 500 + divider + **mini-stats con icon-chips azules**: pacientes activos · deuda (formato ARS, `arsCurrency`) · último pago — cada uno con ícono Phosphor 16px en `--color-accent-deep` + label gris + valor + opcional `avatar-stack` de pacientes/profesionales asociados.
- **Estados**: hover (elevación) + focus ring; loading skeleton (círculo logo + nombre + 3 mini-stats).
- **Responsive**: grid 1–2 columnas en mobile (REQ-231); stats apiladas legibles.
- **Accesibilidad**: card como link `aria-label="Obra social {nombre}"`. Deuda con texto, no solo color. Logo con `alt={nombre}` (fallback a iniciales si no carga).
- **Mock interno**: presentada como real, SIN ARCA/AFIP (BVC-027). El logo es un placeholder controlado, nunca rotular como placeholder.

## Componente: `kpi-card` (DEMO-014 · REQ-232..236 · Patrón 3 anillo/gauge)

Card de KPI clickeable para el dashboard de Reportes. El anillo/gauge de Task Dasher es ideal aquí.

- **Inputs**: `label: string`, `value: string | number` (puede ser ARS, conteo o %), `format?: 'number' | 'ars' | 'percent'`, `gauge?: { percent }` (opcional anillo), `icon?: Phosphor`.
- **Outputs**: `(open)` (→ reporte detallado).
- **Estructura**: **valor/número grande** (tamaño display, peso 500, color `--color-accent-deep`) + label (`--color-text-muted`) + opcional **anillo/gauge** (% centrado + "Progreso" + marcadores 0/100) cuando el KPI es porcentual. Montos en ARS formateados. Máximo 6 KPIs en la grilla (REQ-232).
- **KPIs** (los 6): pacientes nuevos · turnos atendidos · tratamientos completados · ingresos facturados (ARS) · cobrado (ARS) · deuda (ARS).
- **Estados**: hover (elevación + sutil refuerzo del valor); focus ring; active. Loading skeleton (número grande + label).
- **Responsive**: grilla aireada → 1–2 columnas en mobile (REQ-235); valor grande mantiene escala.
- **Accesibilidad**: card clickeable (link) `aria-label="{label}: {value}, ver reporte"`; alcanzable y activable por teclado con focus visible (REQ-236). Anillo con `role="progressbar"` + aria si aplica. Valor calculado del estado real (REQ-234), nunca hardcodeado.

## Componente: `treatment-type-card` (DEMO-012 · REQ-198..201)

Card aireada del catálogo de tipos de tratamiento (≥12 tipos).

- **Inputs**: `type: { nombre, descripcionCorta, costoRef, duracionEst, icon? }`.
- **Outputs**: `(open)` (→ detalle de tipo).
- **Estructura**: ícono/símbolo del tipo (opcional, Phosphor) + nombre peso 500 + descripción corta (`--color-text-muted`, line-height 1.5–1.7) + costo de referencia (ARS) + duración estimada. Aire generoso (no tabla densa).
- **Estados**: hover (elevación) + focus ring; loading skeleton.
- **Responsive**: grid 1–2 columnas en mobile (REQ-201).
- **Accesibilidad**: card como link `aria-label="{nombre}, ver detalle"`. Costo con texto formateado ARS.

---

# 4 · Tablas / Listas

## Componente: `data-table` (DEMO-008/012/013 · BVC-009 · Patrón 9)

Tabla genérica **≤5 columnas estricto**, paginación offset, skeletons. Hereda el ESTILO de Task Dasher pero recorta columnas.

- **Inputs**: `columns: Column[]` (≤5; el componente lanza warning de dev si se exceden), `rows: Row[]`, `pageSize?: number` (default 12, GAP-T04), `totalCount: number`, `currentPage: number`, `loading: boolean`, `emptyConfig: EmptyStateConfig`.
- **Outputs**: `(rowClick)` (→ ruta dedicada), `(pageChange)`, `(rowAction)` (editar/eliminar).
- **Estructura**:
  - **Header**: labels en `--color-text-muted`, **uppercase** con letter-spacing (tracking), tamaño cuerpo. Sin fondo pesado.
  - **Filas**: alto cómodo ~48px; divider `--color-border` 1px muy tenue entre filas; celda "visual" con `avatar` pequeño (xs/sm) cuando aplica; última columna = **acciones** (icon-buttons editar/eliminar a la derecha, gris).
  - **Footer**: contador de rango **"1–12 de N"** (esquina) + **paginación offset** (anterior/siguiente + números). NUNCA infinite scroll (BVC-026 / anti-patrón #19).
- **Estados de fila**: hover (fondo `--color-accent-soft` ~12%, ≤250ms); focus ring (fila alcanzable por teclado, abrible con Enter); active. La fila completa es clickeable → navega a ruta dedicada (REQ-102/094/208/222 etc.).
- **Estado de carga**: filas skeleton (avatar circular + líneas) con **stagger** por fila (BVC-016) — NO spinner.
- **Estado vacío**: monta `empty-state` con guidance cuando `rows.length === 0` (sin resultados / sin datos).
- **Variantes**:
  - `default` (5 col): lista de pacientes (foto · nombre · obra social · próximo turno · estado de cuenta), tratamientos activos (paciente · tratamiento · profesional · etapas X/Y · próxima fecha).
  - `compact-4col`: **lista de turnos del día** (paciente · profesional · hora · estado — ≤4, REQ-093) y **facturas** (paciente · número · monto · estado — ≤4, REQ-221). Presupuestos 4–5 col (paciente · fecha · monto · estado).
- **Responsive (CRÍTICO)**: en mobile la tabla se **transforma a layout vertical tipo "ficha"** — cada fila se convierte en un bloque-card con pares **label (izq) / valor (der)** por dato; la columna visual (avatar+nombre) encabeza el bloque; las acciones quedan accesibles (touch ≥44px). **Sin scroll horizontal** (REQ-107/097). La paginación se mantiene (contador + anterior/siguiente).
- **Accesibilidad**: `<table>` semántica con `<thead>`/`<tbody>`/`scope="col"`; o en su defecto `role="table"`/`row`/`cell`. Filas alcanzables y activables por teclado, focus visible (REQ-108/121). Acciones con `aria-label` ("Editar {nombre}"). Paginación con `aria-label` y estado de página actual.
- **Disciplina**: máximo 5 columnas SIEMPRE (BVC-009 / anti-patrón #11). Donde Task Dasher ponía "Company" → Tratamiento/Profesional; "Last Online" → Última visita relativa.

## Componente: `empty-state` (DEMO-017 · REQ-066/105/145/250 · BVC negative)

Estado vacío sobrio, persona-céntrico, con guidance + 1 acción primaria.

- **Inputs**: `icon: Phosphor` (liviano), `title: string`, `description: string` (guidance), `primaryAction?: { label, action }`.
- **Estructura**: ícono Phosphor grande (24px+, stroke 1.5px, color `--color-text-muted` o azul tenue) + título (peso 500, tamaño subtítulo) + descripción con **guidance** (`--color-text-muted`, cuerpo) + **una** acción primaria (botón, opcional). Mucho aire alrededor (BVC-028). Centrado en su contenedor.
- **Copy ejemplos (guidance, anti-demo)**:
  - Agenda vacía: "No hay turnos en este período. Creá uno con **Nuevo turno**."
  - Pacientes sin resultados: "No encontramos pacientes con ese criterio."
  - Historial vacío: "Este paciente todavía no tiene eventos clínicos registrados."
  - Pagos vacío: "Sin movimientos en la cuenta corriente."
  - Pieza sin procedimientos: "Sin procedimientos registrados en esta pieza."
- **Estados**: la acción primaria es un `button` con sus estados. El estado vacío en sí es estático.
- **Responsive**: se centra en 1 columna; ícono y texto legibles; botón touch ≥44px.
- **Accesibilidad**: ícono `aria-hidden` (decorativo, el título comunica); título como encabezado de la región. Acción con foco.
- **Anti-demo**: NUNCA copy que delate mock (BVC-027). Tono persona-céntrico y profesional.

## Componente: `skeleton` (DEMO-017 · REQ-067/106/251 · BVC-016)

Skeleton que imita la forma del contenido. NUNCA spinner.

- **Inputs**: `shape: 'line' | 'circle' | 'rect' | 'card-row' | 'card'`, `width?`, `height?`, `count?`, `staggerIndex?`.
- **Estructura**: bloques con fondo `--color-border`/gris muy tenue y **shimmer sutil** (animación de barrido ≤ suave, dentro del lenguaje, sin saturación). Presets:
  - `card-row`: círculo (avatar) + 2–3 líneas → para filas de tabla/lista.
  - `card`: forma de la card correspondiente (círculo + número grande + barra + líneas).
- **Stagger**: cada instancia recibe `staggerIndex` → `animation-delay` incremental (~40ms) para el efecto de revelado por fila/card (motion holística).
- **Responsive**: el skeleton replica el layout responsive del contenido que reemplaza (en mobile, forma vertical).
- **Accesibilidad**: contenedor con `aria-busy="true"` y `aria-label="Cargando…"`; los bloques `aria-hidden`. Al hidratar, `aria-busy="false"`.
- **Prohibido**: spinners (BVC-016). Toda carga de lista/sección usa skeletons.

---

# 5 · Feedback / Overlays

## Componente: `toast` + `toast.service` (REQ-074/083/248 · BVC-016)

Notificación tras acción. Éxito (auto-dismiss) / error (persistente + reintento).

- **API del servicio**: `toast.success(message)`, `toast.error(message, { retry? })`, `toast.info(message)`.
- **Estructura**: pieza compacta esquina (inferior/superior según definición de UX), fondo blanco con borde semántico O fondo pastel semántico tenue, ícono Phosphor de estado (check/x/info) en color semántico + mensaje (`--color-text`, cuerpo). **Éxito** → fondo/acento verde pastel, **auto-dismiss ~3s**. **Error** → coral pastel, **persistente** + acción "Reintentar".
- **Motion**: entrada animada **ease-in suave** (slide+fade), salida fade. ≤250ms (BVC-021).
- **Estados**: hover sobre el toast pausa el auto-dismiss; botón "Reintentar"/cerrar con hover/focus.
- **Responsive**: en mobile ocupa el ancho con márgenes; touch ≥44px en cerrar/reintentar; no tapa la acción primaria.
- **Accesibilidad**: `role="status"` (éxito/info, `aria-live="polite"`) / `role="alert"` (error, `aria-live="assertive"`). Cerrable por teclado (`Escape`), botón con `aria-label`.
- **Uso**: tras crear/editar/aprobar/avanzar estado/registrar pago/reset → toast de éxito (REQ-248). Errores controlados → toast coral + reintento. **Anti-demo en el copy** (ej. "Se notificó al paciente por WhatsApp", "Pago registrado", "Datos restablecidos") — NUNCA "simulado/de prueba" (REQ-089/272).

## Componente: `confirm-dialog` (REQ-075/114/247/265 · BVC-012 · anti-patrón #14)

Modal de confirmación **<50% de pantalla**, SOLO confirmaciones cortas, máx 3 campos.

- **Inputs / API**: `confirm({ title, message, confirmLabel, cancelLabel, variant: 'default' | 'destructive' })` → Promise<boolean>.
- **Estructura**: modal centrado, ancho **<50%** del viewport (máx ~440px desktop), card blanca radius 10–14px, `--shadow-1`, backdrop translúcido. Contenido: título (peso 500) + mensaje (guidance, advierte pérdida si es destructivo) + 2 botones: **Cancelar** (secundario) + **Confirmar** (primario; variante destructiva → acento coral/error pastel con texto oscuro del hue). SOLO confirmaciones — NUNCA formularios grandes ni contenido principal.
- **Usos**: eliminar paciente (REQ-114), cancelar turno (REQ-075), cancelar flujo multi-paso con datos (REQ-085/177/219/263), **Restablecer datos** en Configuración (REQ-265, advierte pérdida).
- **Estados**: botones con hover/focus/active; foco inicial en "Cancelar" (acción segura) en diálogos destructivos.
- **Responsive**: en mobile el modal sigue <50% en alto sensato, ancho casi-full con márgenes; botones apilados si hace falta, touch ≥44px. Sin scroll horizontal.
- **Accesibilidad**: `role="dialog"` `aria-modal="true"` con `aria-labelledby` (título) + `aria-describedby` (mensaje). **Trap de foco** mientras abierto; `Escape` = cancelar; al cerrar, foco vuelve al disparador.
- **Anti-demo**: copy de producción. La confirmación de reset dice "Se perderán los cambios y se volverá al estado inicial" — NUNCA "resetear demo" (REQ-264/265).

## Componente: `filter-panel` (REQ-063/101/193 · BVC-011 · anti-patrón #12)

Un filtro principal visible + panel desplegable con el resto. NUNCA múltiples filtros simultáneos visibles.

- **Inputs**: `primaryFilter: FilterDef` (siempre visible, ej. "por profesional"), `secondaryFilters: FilterDef[]` (estado, tipo, obra social, edad — ocultos), `activeFilters: ActiveFilter[]`.
- **Outputs**: `(filterChange)`, `(clearFilter)`.
- **Estructura**:
  - **Visible**: 1 control de filtro principal (dropdown/select, altura 40px, radius 10–14px) + botón **"Filtros"** (icon-button con ícono Phosphor `funnel` + label) que abre el panel.
  - **Panel desplegable**: panel mínimo (popover o sheet) con los filtros secundarios; NO permanentemente visible (BVC-011).
  - **Filtros activos**: chips removibles (pill con label + "×") debajo del header, para comunicar qué está aplicado.
- **Estados**: dropdown y botón con hover/focus/active; chips activos con hover (refuerzo del "×") + focus; botón "Filtros" muestra badge de conteo si hay filtros aplicados.
- **Responsive**: en mobile el panel de filtros se abre como **sheet/bottom-sheet** (no drawer de contenido — es UI de filtro, permitido); botón "Filtros" flotante o en header; touch ≥44px en cada control y chip.
- **Accesibilidad**: botón "Filtros" `aria-expanded`/`aria-controls`; panel con foco gestionado; chips removibles con `aria-label="Quitar filtro {x}"`. Filtro principal con `<label>`.
- **Disciplina**: SOLO un filtro principal visible; el resto SIEMPRE en el panel (anti-patrón #12).

---

# 6 · Formularios / Flujos

## Componente: inputs / select / textarea (REQ-128/174/249/260 · anti-patrón #7)

Controles de formulario sutiles. NO píldoras, NO bordes pronunciados.

- **Inputs comunes**: `label`, `value`, `placeholder`, `required?`, `error?`, `disabled?`, `helpText?`.
- **Estructura**: altura **40px** (textarea multi-línea), radius **10–14px**, borde tenue `--color-border` 0.5–1px, fondo blanco, texto `--color-text` cuerpo, padding `--space-12` horizontal. **Label** arriba o flotante (claro, no ambiguo), tamaño cuerpo `--color-text-muted`; indicador de requerido sutil (asterisco o "(opcional)" en los no requeridos). Select con ícono chevron Phosphor 16px. NO sombras internas ni gradientes (anti-patrón #8).
- **Estados**:
  - default: borde `--color-border`.
  - **hover**: borde levemente más visible (tinte azul) ≤250ms.
  - **focus**: focus ring visible (2px `--color-accent-deep`), borde acentuado.
  - **filled**: igual a default con valor.
  - **error**: borde coral/error pastel + mensaje de error **junto al campo** (`--color-text` sobre coral tenue o texto coral oscuro), ícono de alerta 16px. Validación **inline post-blur / en tiempo real** (no solo al enviar, REQ-249).
  - **disabled**: opacidad 40%, sin foco.
  - **loading** (si aplica, ej. select async — raro aquí): skeleton del control.
- **Validaciones específicas**: DNI formato AR (REQ-176), monto **positivo** en registrar pago (REQ-260), campos requeridos por paso (REQ-086/176/219).
- **Responsive**: campos a **1 columna en mobile** (stack); en desktop pueden ir en 2 columnas lógicas. Altura efectiva de toque ≥44px en mobile (el control de 40px + área de toque). Sin scroll horizontal.
- **Accesibilidad**: `<label for>` asociado SIEMPRE; error con `aria-describedby` + `aria-invalid="true"`; requerido con `aria-required`. Mensajes de error descriptivos (no solo "campo requerido": ej. "Ingresá un DNI válido (7–8 dígitos)", "El monto debe ser mayor a 0").

## Componente: `stepper` (REQ-087/181/219 · flujos multi-paso)

Indicador de progreso para flujos multi-paso (3 pasos turno/presupuesto, 2 pasos paciente).

- **Inputs**: `steps: { label }[]`, `currentIndex: number`.
- **Estructura**: fila horizontal de pasos numerados; paso actual destacado (círculo `--color-accent` con número, label peso 500 `--color-text`); pasos completados (check Phosphor en `--color-accent-deep`); pasos futuros (círculo `--color-border`, label `--color-text-muted`); conector entre pasos (línea `--color-border`, tramo completado en `--color-accent`). Comunica claramente "Paso N de M" (REQ-087).
- **Estados**: no interactivo (no se salta de paso libremente); refleja el estado del flujo. El número grande de paso actual usa peso 500 (no bold).
- **Responsive**: en mobile puede mostrarse compacto ("Paso 2 de 3" + barra de progreso lineal) si los labels no caben; sin scroll horizontal.
- **Accesibilidad**: `role="list"` de pasos con `aria-current="step"` en el actual; cada paso con `aria-label="Paso 2 de 3: Profesional y fecha"`. El conector es decorativo (`aria-hidden`).

## Componente: `button` (REQ-001/006 · BVC-010/015/017 · anti-patrón #8)

Botón base. Una sola acción primaria por pantalla.

- **Inputs**: `variant: 'primary' | 'secondary' | 'ghost' | 'destructive'`, `size?: 'md'(40)`, `loading?`, `disabled?`, `icon?`, `iconPosition?`.
- **Estructura**: altura **40px**, radius 10–14px, padding `--space-12`/`--space-16`, texto peso 500 cuerpo. NO sombras internas ni gradientes (anti-patrón #8).
  - **primary**: fondo `--color-accent` (`#6da8d4`) con **texto oscuro `--color-text`** (GAP-A04: blanco NO pasa AA sobre el azul medio) — o fondo `--color-accent-deep` con texto blanco si se requiere blanco. Una sola por pantalla (BVC-010).
  - **secondary**: fondo blanco/transparente + borde `--color-border` + texto `--color-text`. Máximo una visible junto a la primaria.
  - **ghost**: solo texto/ícono, sin fondo ni borde (para acciones terciarias, menús).
  - **destructive**: acento coral/error pastel + texto oscuro del hue (eliminar/cancelar dentro de confirm-dialog).
- **Estados**:
  - **hover**: oscurecimiento sutil del fondo / tinte, ≤250ms.
  - **focus**: ring visible.
  - **active/pressed**: leve `translateY(0)`/oscurecimiento.
  - **disabled**: opacidad 40%, `not-allowed` (ej. avance de turno en estado terminal, REQ-076; avanzar paso sin validar).
  - **loading**: spinner inline NO (la regla es skeletons para listas; para botones, usar **estado loading con ícono de progreso sutil + label "Guardando…"** y deshabilitar). Para acciones de confirmación (guardar paciente, confirmar turno, registrar pago) el botón pasa a loading hasta persistir.
  - **success/error** (opcional efímero): el feedback de resultado lo da el `toast`, no el botón.
- **Responsive**: touch target ≥44px en mobile (el botón de 40px + padding/área); en mobile las acciones de flujo pueden ir full-width al pie. Sin scroll horizontal.
- **Accesibilidad**: `<button>` nativo; `aria-disabled` cuando disabled lógico; `aria-busy` en loading; ícono decorativo `aria-hidden` (el label comunica). Activable con Enter/Space; focus ring visible (REQ-006). En login, el botón "Ingresar como administradora" se activa con Enter.

## Componente: `icon-button`

Botón solo-ícono (acciones en filas/cards: editar, eliminar, menú `⋯`, campana, etc.).

- **Inputs**: `icon: Phosphor`, `ariaLabel: string` (OBLIGATORIO), `variant?: 'ghost' | 'subtle'`.
- **Estructura**: ícono Phosphor 20px (o 16px inline), área de toque mínima 40px desktop / **44px mobile**, color heredado (gris por defecto en acciones de fila). Sin fondo por defecto.
- **Estados**: hover (fondo `--color-accent-soft` ~12% circular/redondeado); focus ring; active; disabled 40%.
- **Accesibilidad**: `aria-label` SIEMPRE presente (es ícono sin texto visible → label obligatorio para SR). NUNCA en navegación principal (allí siempre hay label visible — BVC-025); aquí es para micro-acciones.

---

# 7 · Tabs / Ficha del paciente (la pantalla-firma)

## Componente: `tabs` (DEMO-009/011 · REQ-116..122 · BVC-013 · anti-patrón #16)

Barra horizontal de 6 tabs de la ficha. **Contenido del tab inactivo NO renderizado en el DOM** (clave, BVC-013).

- **Inputs**: `tabs: { id, label, route }[]`, `activeTabId: string`.
- **Outputs**: `(tabChange)` (→ actualiza URL).
- **Estructura**: barra horizontal con los 6 tabs: **Información general · Odontograma · Historial clínico · Tratamientos · Documentos · Pagos**. Cada tab = label de texto (peso 500 si activo, 400 muted si inactivo), padding cómodo. **Tab activo** destacado con **fondo `--color-accent-tint`/`--color-accent-soft` tintado** + esquinas redondeadas (consistente con el patrón seleccionado) y/o indicador inferior sutil. Solo uno activo (REQ-117). El tab activo se refleja en la **URL** (`/pacientes/:id/odontograma`) → recargar/compartir mantiene el tab (REQ-119).
- **Renderizado**: el contenido se monta vía `@if`/router-outlet hijo por tab → **el tab inactivo NO está en el DOM** (REQ-118 / BVC-013), solo se carga al activarse. Sin scroll infinito en la ficha (BVC-026 / anti-patrón #20) — la profundidad se da por tabs.
- **Estados**: hover (tinte) en tabs inactivos; focus ring; active = seleccionado tintado.
- **Responsive**: en mobile la barra hace **scroll horizontal** (los 6 tabs no caben) o se adapta; cada tab con **touch target ≥44px** (REQ-122). La cabecera permanece estable al cambiar de tab (REQ-169).
- **Accesibilidad**: `role="tablist"`, cada tab `role="tab"` con `aria-selected` y `aria-controls`; panel `role="tabpanel"` con `aria-labelledby`. **Navegable por teclado** (flechas izq/der entre tabs, Enter/Space activa) con focus visible (REQ-121). Rol semántico tablist/tab obligatorio.
- **Disciplina**: tabs SOLO para dimensiones del **mismo objeto** (el paciente) — NUNCA para navegar entre objetos distintos (anti-patrón #16).

## Componente: `patient-header` (cabecera de ficha) (DEMO-009 · REQ-109..115 · BVC-020 · Patrón 11)

Cabecera de la ficha del paciente. Compatible con Profile de Task Dasher, **banner azul sobrio NO aurora**. Asimetría intencional (firma del producto).

- **Inputs**: `patient: { foto, nombre, edad, obraSocial, profesionalCabecera, alertas?: Alert[] }`.
- **Outputs**: `(agendarTurno)` (primaria), `(editar)`, `(eliminar)` (secundarias en menú).
- **Estructura**:
  - **Banner**: azul plano muy sutil — degradé `--color-accent-soft` (`#c5d8e8`) → blanco MUY tenue, o liso. **NUNCA** gradiente aurora morado-magenta-naranja (adaptación crítica del Patrón 11; rozaría anti-patrón #2).
  - **Foto grande** (`photo` xl, circular, **borde blanco** grueso, efecto recortado) a la **izquierda** en desktop (asimetría: foto + nombre pesan a la izquierda).
  - **Nombre grande** (tamaño display, peso 500 — el impacto viene del **aire y la escala**, no de adornos ni grosor) arriba + datos clave al lado: edad · obra social · profesional de cabecera (panel **liviano** a la derecha con **icon-chips azules**: teléfono, email, fecha de nacimiento, obra social — ícono Phosphor + label gris + valor).
  - **Badges de alerta** (solo si aplican): alergias / medicación / observaciones críticas, como pills pastel (warning/error según criticidad). Si NO hay alertas → no se muestra nada (REQ-111, sin badge vacío).
  - **Una acción primaria**: **"Agendar turno"** (button primary; inicia flujo de turno con paciente preseleccionado, REQ-112). Secundarias (editar/eliminar) en **menú compacto** `⋯` (REQ-113).
- **Estados**: botón primario y menú con estados estándar; eliminar → `confirm-dialog` (REQ-114).
- **Responsive**: en mobile la foto se **recentra solapando el banner** y el nombre va centrado; datos y badges se apilan en 1 columna; sin scroll horizontal (REQ-115). La cabecera NO se recarga al cambiar de tab (REQ-169).
- **Accesibilidad**: nombre como `<h1>` de la pantalla; foto con `alt`; badges de alerta con texto (no solo color) y `role="status"` si comunican criticidad; acción primaria y menú alcanzables por teclado, focus visible.
- **Firma (frontend-design)**: asimetría intencional (foto+nombre a la izquierda, panel liviano a la derecha), una sola jerarquía dominante (el nombre). El paciente es el sujeto, no una fila. Es la **pantalla-firma** — debe ser memorable por su aire y escala.

## Componente: `event-block` (bloque tipo "evento/sección" reutilizable) (REQ-141/148/189/190)

Bloque apilado tipo "Experience" de Task Dasher (ícono/logo + título + fecha a la derecha + descripción). Reutilizable en Historial, Tratamientos, eventos clínicos.

- **Inputs**: `icon?: Phosphor | logo`, `title: string`, `date: Date`, `description: string`, `meta?: { professional? }`, `clickable?: boolean`.
- **Outputs**: `(open)` (→ detalle de evento/plan, si clickable).
- **Estructura**: leading circular (ícono Phosphor temático con fondo tenue / o avatar de profesional) + título (peso 500) + **fecha a la derecha** (`relative-time` cuando aplica, ej. "Hace 2 días") + descripción corta (`--color-text-muted`, line-height 1.5–1.7) + meta opcional (profesional).
- **Estados**: si clickable → hover (tinte/elevación) + focus ring + cursor pointer; navega a detalle (ruta dedicada).
- **Variantes**: `timeline` (en Historial, conectados verticalmente con línea cronológica), `list` (en Tratamientos del paciente).
- **Responsive**: 1 columna en mobile; la fecha baja a segunda línea junto al título; legible.
- **Accesibilidad**: si clickable, `role="link"`/`<a>` con `aria-label`; fecha en `<time>`; ícono decorativo `aria-hidden`.

---

# 8 · Componente de dominio: Odontograma (sin análogo en Task Dasher)

## Componente: `odontogram` (DEMO-010 · REQ-132..140 · diferencial técnico)

Diagrama dental SVG interactivo de **32 piezas FDI**, editable, mobile-usable. Diseñado dentro del lenguaje prescriptivo (superficies blancas, líneas tenues `#e8e8ee`, estados como chips/colores pastel semánticos). Vive en `patients`, aislado con `@defer` (NFR-004: sin lag con 32 piezas).

- **Inputs**: `teeth: Tooth[]` (32, cada una `{ numeroFDI, numeroUniversal, estado, procedimientos }`), `interactive: boolean` (default true).
- **Outputs**: `(toothClick)` (→ ruta de detalle de pieza, REQ-135).
- **Estructura**:
  - **Layout**: dentición **superior** (cuadrantes 1 y 2: piezas 11–18, 21–28) y **inferior** (cuadrantes 3 y 4: 31–38, 41–48) **claramente distinguidas** (REQ-137), separadas por un eje horizontal sutil; arcada en forma de U/herradura o dos filas alineadas (lo que mejor escale en mobile). Cada pieza = forma SVG (corona simplificada) sobre superficie blanca, contorno `--color-border` tenue.
  - **Numeración**: **FDI 11–48 primaria** visible bajo/junto a cada pieza; **universal 1–32** en tooltip (GAP-T03, REQ-137).
  - **Estado por pieza** (6 estados, REQ-133, con **color/chip pastel del sistema semántico** + ícono/patrón para no depender solo del color):
    - **sana** → blanco/neutro (sin relleno), contorno tenue.
    - **caries** → warning ámbar pastel (marca/punto).
    - **obturación** → info azul pastel (relleno parcial).
    - **ausente** → gris neutro tenue + patrón (ej. contorno punteado o tachado sutil).
    - **en tratamiento** → `--color-accent` azul (relleno/anillo) — coherente con un tratamiento activo.
    - **prótesis** → neutro distinto + ícono/patrón.
  - **Leyenda/clave** (REQ-134): bloque sobrio que explica qué significa cada estado (chip de color + label). SIEMPRE visible junto al diagrama.
- **Estados por pieza** (BVC-015): cada pieza es interactiva →
  - **hover**: leve elevación/tinte + cursor pointer (≤250ms).
  - **focus**: focus ring visible (teclado).
  - **active/pressed**: feedback al tocar.
  - **selected** (opcional, si se resalta la última editada): borde acentuado.
  - Sin estado disabled (todas navegables).
- **Edición** (Épica 11, REQ-267..270): la edición del estado ocurre en la **pantalla de detalle de pieza** (ruta dedicada), no inline en el diagrama; al volver, el odontograma re-renderiza desde el store reflejando el nuevo color/leyenda (REQ-268). Coherencia: marcar "en tratamiento" no rompe consistencia con los tabs (REQ-269).
- **Responsive (CRÍTICO, REQ-139/270)**: las 32 piezas se renderizan **legibles** en mobile sin scroll horizontal que rompa el layout. Estrategia: SVG con `viewBox` responsive que escala; en mobile las dos arcadas pueden apilarse verticalmente o el diagrama hace zoom-to-fit; cada pieza mantiene **touch target adecuado** (≥44px efectivo, agrupando el hit-area aunque el dibujo sea menor). Sin lag (NFR-004).
- **Accesibilidad (REQ-138)**: cada pieza es un control alcanzable y activable por teclado (Tab entre piezas, Enter abre detalle), **focus visible**. Cada pieza expone `aria-label="Pieza 16 (universal 3), obturación"` (número + estado de forma accesible). El estado NUNCA se comunica solo por color → ícono/patrón + label accesible (REQ-256). Leyenda con texto. El SVG con `role="group"` y label "Odontograma del paciente".
- **Premium / disciplina**: dentro del lenguaje — superficies blancas, líneas tenues, colores pastel semánticos, sin saturación. Es el diferencial técnico del viewcase: editable, fluido y mobile-usable.

## Componente: `tooth-state-selector` (REQ-267/270 — control de edición en detalle de pieza)

Control para cambiar el estado de una pieza (en la pantalla de detalle de pieza). Mobile-usable (touch ≥44px).

- **Inputs**: `currentState: ToothState`, `states: ToothState[]` (los 6: sana, caries, obturación, ausente, en tratamiento, prótesis).
- **Outputs**: `(stateChange)`.
- **Estructura**: grupo de opciones seleccionables (chips/segmented control o radio-cards), cada una con el **chip de color pastel del estado** + label. La opción actual marcada (selected, fondo tintado + borde acentuado). NO un dropdown denso — opciones visibles y tocables.
- **Estados**: cada opción hover (tinte) / focus ring / selected (tintado + borde) / active. Confirmación de cambio → button primario "Guardar" → persiste + toast (REQ-268).
- **Responsive**: opciones en grid de 2–3 columnas en mobile, cada una **touch ≥44px**, legible, sin scroll horizontal (REQ-270).
- **Accesibilidad**: `role="radiogroup"` con `aria-label="Estado de la pieza"`; cada opción `role="radio"` con `aria-checked`; navegable por teclado (flechas); estado por texto + color (no solo color).

---

# 9 · Patrones de feedback visual (resumen transversal)

## Loading
- **Listas/secciones/cards**: SIEMPRE `skeleton` con la forma del contenido + **stagger** por fila/card (BVC-016). NUNCA spinners.
- **Botones de confirmación** (guardar paciente, confirmar turno, registrar pago, aprobar presupuesto): estado `loading` del button (label "Guardando…/Confirmando…" + deshabilitado), feedback de resultado vía `toast`.
- **Odontograma / charts**: diferidos (`@defer`); placeholder skeleton mientras cargan.

## Notificaciones (toasts)
- **Éxito**: verde pastel, auto-dismiss ~3s, tras cada acción exitosa (REQ-248).
- **Error**: coral pastel, persistente + "Reintentar".
- **Internas** (campana del header): lista de notificaciones — fila con leading circular (ícono temático con fondo de color para sistema / avatar para persona) + título peso 500 + subtítulo gris + `relative-time` a la derecha (en mobile baja a 2ª línea). Diferenciación leído/no-leído por **dot azul** o fondo `--color-accent-tint` tenue (GAP del Researcher). Íconos: turno→calendario, pago vencido→pagos (coral), cumpleaños→pastel/avatar, tratamiento por vencer→médico (warning). Tabs de filtro como pills (Todas/Sin leer). Contador en sidebar + header.

## Confirmaciones
- **Destructivas/irreversibles** (eliminar paciente, cancelar turno, restablecer datos): `confirm-dialog` <50% (REQ-247).
- **Reversibles/menores**: feedback inline + toast (sin modal).

## Empty states
- `empty-state` con ícono Phosphor liviano + título + **guidance** + 1 acción primaria. En TODA lista/sección que pueda quedar vacía (REQ-250). Copy persona-céntrico, anti-demo.

## Formularios
- Validación **inline** post-blur / tiempo real (no solo al enviar), error **junto al campo** con mensaje descriptivo (REQ-249/260). Estados default/hover/focus/filled/error/disabled. Submit con estado loading; resultado vía toast. Una sola acción primaria por pantalla (BVC-010).

## Transiciones
- Entrada/salida de toasts (ease-in suave), apertura de modales (fade+scale sutil), cambios de estado (≤250ms), carga de listas (stagger). Todo dentro de **150–250ms** (BVC-021).

---

# 10 · Reglas de uso de marca

- **Logo**: isotipo dental sutil + wordmark "Estudio Dental Mendieta", en paleta azul. Vive en sidebar (arriba) y login. Sobrio, dentro de la familia azul (REQ-008/056). Favicon con el isotipo. **NUNCA** placeholder ni atribución a portfolio.
- **Color de marca**: **un solo acento azul dominante** (`#6da8d4` con parsimonia: barras, item activo, una primaria; `#c5d8e8` como lavado de fondo en seleccionado/banner). Máx **4 tonos azules** (cielo, medio, deep derivado, tint casi-blanco). Neutros cálidos para todo lo demás. Semánticos SOLO pastel y SOLO para estado, nunca decoración (BVC-002).
- **Tipografía de marca**: Red Hat Display (títulos) / Red Hat Text (cuerpo), SOLO 400/500. Jerarquía por **tamaño + color + aire**, jamás por grosor. Máx 3 tamaños por pantalla (BVC-001/022). NUNCA Inter.
- **Iconografía**: un solo set Phosphor regular 1.5px (16/20/24). Consistente en toda la app. Íconos heredan color del texto; estado → semántico (BVC-014).
- **Imágenes/fotos**: fotos reales de pacientes del seed (29, circulares con fallback a iniciales). Documentos = pool de ~15 imágenes (radiografías + fotos clínicas) presentadas como documentos clínicos reales, sin etiqueta de placeholder (REQ-157). Logos de obra social = placeholders controlados en círculo. NUNCA imágenes rotas (fallback siempre).
- **Elementos visuales de identidad**: banner azul sobrio de la ficha (degradé cielo→blanco tenue), píldora azul-cielo del item activo, icon-chips azules — refuerzan la identidad "calma higiénica". Sin patterns saturados ni adornos.

---

# 11 · Checklist de cobertura (verificación antes del retorno)

| Componente / regla | Cubierto | BVC / REQ |
|---|---|---|
| sidebar (5 items + Config/Ayuda, píldora activa, drawer mobile, íconos+label) | ✅ | BVC-007/025, REQ-017..024 |
| header (logo, módulo, search contextual, notif badge, avatar AD, sin demo/carrito) | ✅ | BVC-008/027, REQ-008..016 |
| footer (discreto, sin atribución, sin reset) | ✅ | REQ-025..028 |
| status-badge (pastel, fondo+texto oscuro del hue, mapeos turno/tratamiento/pago) | ✅ | BVC-018, Patrón 6, REQ-096/104/210 |
| priority-pill (High/Mid/Low pastel) | ✅ | Patrón 7 |
| avatar + avatar-stack (circular, +N con deep, borde blanco) | ✅ | Patrón 4/5, REQ-109 |
| photo (fallback determinista a iniciales, nunca rota) | ✅ | REQ-046/159/179 |
| relative-time (español, 2ª línea en mobile) | ✅ | Patrón 8, REQ-146 |
| patient-card / treatment-card·progress-card / obra-social-card / kpi-card / treatment-type-card | ✅ | BVC-019, Patrones 3/4/10, REQ-098/150/196/227/198/232 |
| data-table (≤5 col, paginación offset, skeletons, vertical en mobile) | ✅ | BVC-009/026, Patrón 9, REQ-093/098/192/206/221 |
| empty-state (ícono + guidance + 1 acción, anti-demo) | ✅ | REQ-066/105/145/250 |
| skeleton (forma + stagger, NO spinner) | ✅ | BVC-016, REQ-067/106/251 |
| toast (éxito auto-dismiss / error persistente + retry) | ✅ | BVC-016, REQ-074/083/248 |
| confirm-dialog (<50%, solo confirmaciones, ≤3 campos) | ✅ | BVC-012, REQ-075/114/247/265 |
| filter-panel (1 filtro visible + panel desplegable, chips activos) | ✅ | BVC-011, REQ-063/101/193 |
| inputs/select/textarea (40px, radius 10–14, sutiles, validación inline) | ✅ | BVC-017, anti-patrón #7, REQ-249/260 |
| stepper (paso N de M) | ✅ | REQ-087/181/219 |
| button (primario azul + texto oscuro, 1 primaria/pantalla, estados) | ✅ | BVC-010/015/017, GAP-A04 |
| icon-button (aria-label obligatorio, 44px mobile) | ✅ | BVC-025 |
| tabs (6 tabs, inactivo NO en DOM, tablist/tab, scroll horizontal mobile) | ✅ | BVC-013, REQ-116..122 |
| patient-header (banner sobrio, foto xl, nombre grande, 1 primaria, asimetría) | ✅ | BVC-020, Patrón 11, REQ-109..115 |
| event-block (ícono + título + fecha + descripción, reutilizable) | ✅ | Patrón 11, REQ-141/148/189/190 |
| odontogram (32 piezas FDI, 6 estados pastel + leyenda, editable, mobile, a11y) | ✅ | REQ-132..140, Épica 11 |
| tooth-state-selector (6 estados, touch ≥44px, radiogroup) | ✅ | REQ-267/270 |
| Estados hover/focus/active/disabled en TODO clickeable | ✅ | BVC-015 |
| Accesibilidad (focus ring, contraste AA, ARIA, touch ≥44px) | ✅ | REQ-255/256, NFR-021..023 |
| Responsive por componente (sidebar→drawer, tabla→vertical, etc.) | ✅ | REQ-252/253/254 |
| Anti-demo en todo el copy | ✅ | BVC-027, REQ-272 |
| Sin emojis / sin pills estridentes / sin sombras pesadas / radius ≤14 / inputs sutiles | ✅ | BVC-018, anti-patrones #4/#5/#6/#7/#8 |

---

## Notas de coordinación

- **GAP-A04 (contraste azul medio)**: resuelto en `button` y `avatar-stack`/`+N` → texto oscuro `--color-text` sobre `#6da8d4`, o `--color-accent-deep` para superficies con texto blanco (badge de conteo del sidebar/header). El Visual System Designer fija el hex exacto de `--color-accent-deep` y documenta cada ratio. `#6da8d4` se reserva para barras de progreso / item activo / fondos.
- **Toggle Card/Table en lista de pacientes**: la Card View usa `patient-card`; la Table View usa `data-table` (5 col). El toggle (pills) lo define el UX Flow Designer; ambos componentes están listos.
- **Odontograma sin referencia visual**: diseñado como componente propio dentro del lenguaje; es el diferencial — cuidar editable + mobile-usable (REQ-139/270, NFR-004).
- **Tab inactivo NO en DOM (BVC-013)**: implementado vía router-outlet hijo / `@if` por tab — no con CSS `display:none`. Crítico para el QA de computed-style.
