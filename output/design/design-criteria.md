# Design Criteria — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Design Orchestrator (consolidación de los 3 sub-designers)
**Fecha**: 2026-06-01
**Versión**: 1.0
**Fuentes consolidadas**:
- `output/design/design-tokens.md` (Visual System Designer) → Tokens de Diseño (DC-001..029)
- `output/design/ux-flows.md` (UX Flow Designer) → Layouts por Pantalla (DC-030..049), Estados de UI (DC-100..119), Responsive
- `output/design/components.md` (Component Designer) → Componentes (DC-050..079), Feedback Visual (DC-120..149)
- `output/design/visual-analysis.md` (Design Researcher) → Análisis de Referencias + BVC-xxx CLIENT-SPECIFIED

> **Propósito**: este documento es el **checklist maestro de la cáscara visual**. Lo consume el **UI Developer** en Fase 4 (qué construir) y el **Visual Checker** en QA (qué verificar). Cada criterio DC-xxx es **verificable individualmente** (computed-style por `browser_evaluate`, o visual por screenshot). Los valores prescriptivos 🔒 vienen del cliente vía `visual-analysis.md` y NO se reinterpretan.
>
> **ADN visual**: superficies blancas flotando sobre canvas `#fafafa` · una sola familia de acento AZUL · Red Hat 400/500 · radius 10–14px · borde **O** sombra (nunca ambos) · semánticos siempre pastel · mucho aire · persona-céntrico · **cero rastro de demo**.
>
> **Decisión transversal vinculante — GAP-A04 (contraste azul medio)**: el azul medio `--color-accent #6da8d4` es un tono claro; **texto blanco sobre él FALLA AA (2.56:1)**. Por tanto: **texto oscuro `#2a2a35` sobre `#6da8d4` (5.54:1 ✅)** es la receta canónica de superficies azul-medio; para superficies que requieran texto blanco se usa **`--color-accent-deep #246991` (5.99:1 ✅)**. Esta decisión la coordinaron los 3 sub-designers y es vinculante en TODOS los DC-xxx que toquen el azul medio.

---

## Tokens de Diseño

> Origen: `design-tokens.md`. Todos son CSS custom properties en `:root` (`tokens.css`). Verificación: `computed-style` con `browser_evaluate`. Bootstrap 5 se importa selectivo (grid + utilidades) y se sobrescribe con esta capa (ver DC-027/028/029).

### Color — familia azul (4 tonos, 🔒 prescriptivo)

| ID | Criterio | Verificación |
|---|---|---|
| DC-001 | `--color-accent-sky: #c5d8e8` (azul cielo) definido y usado en: fondo de pills suaves, estado seleccionado tintado del sidebar, banner de ficha, track de barras de progreso | computed-style: el valor hex es exactamente `#c5d8e8` |
| DC-002 | `--color-accent: #6da8d4` (azul medio) definido; usado en relleno de barras de progreso, item activo, icon-chips, número grande de progreso. **NUNCA lleva texto blanco encima** (GAP-A04) | computed-style: hex `#6da8d4`; ningún texto blanco sobre fondo `#6da8d4` |
| DC-003 | `--color-accent-deep: #246991` (azul profundo derivado, hue ~202°) definido; único tono que pasa AA con texto blanco; usado para CTA con texto blanco, links, valores azules, círculo "+N", badge de conteo | computed-style: hex `#246991`; texto blanco sobre él ≥4.5:1 (=5.99:1) |
| DC-004 | `--color-accent-tint: #eff8ff` (azul casi-blanco) definido; usado en fondos tintados de estado seleccionado/activo (fila, tab) | computed-style: hex `#eff8ff` |
| DC-005 | La paleta de acento usa **exactamente 4 tonos azules** (sky · medio · deep · tint), todos en H≈200–208°. NINGÚN quinto hue de acento (sin azul Bootstrap `#0d6efd`, sin morado/verde/naranja de acento) | computed-style + visual (negative): solo 4 hues azules de acento |

### Color — neutros, superficie, borde (🔒 prescriptivo)

| ID | Criterio | Verificación |
|---|---|---|
| DC-006 | `--color-bg: #fafafa` (canvas de la app, NUNCA saturado) y `--color-bg-elevated: #ffffff` (cards/header/sidebar/modales/inputs) definidos | computed-style: hex exactos `#fafafa` y `#ffffff` |
| DC-007 | `--color-text: #2a2a35` (gris oscuro cálido, NUNCA negro puro) como texto principal; contraste sobre `#ffffff` = 14.18:1, sobre `#fafafa` ≈13.4:1 (AAA) | computed-style: hex `#2a2a35`; ratio ≥7:1 |
| DC-008 | `--color-text-secondary: #707080` para subtítulos/captions/labels/timestamps; sobre `#ffffff` = 4.86:1, sobre `#fafafa` = 4.66:1 (AA). No usar < 14px sobre `#fafafa` | computed-style: hex `#707080`; ratio ≥4.5:1 |
| DC-009 | `--color-border: #e8e8ee` (border-width 1px, rango 0.5–1px) para bordes de cards/inputs y dividers de lista/tabla; separador decorativo sutil | computed-style: hex `#e8e8ee`, grosor 0.5–1px |

### Color — semánticos (SIEMPRE pastel: fondo pastel + texto oscuro del mismo hue, 🔒 estrategia)

| ID | Criterio | Verificación |
|---|---|---|
| DC-010 | **Éxito**: fondo `#e3f3ea` + texto `#2d6a4f` (5.56:1 ✅ AA). Usos: Confirmado, Al día, Completado, toast de éxito. NUNCA texto blanco sobre el pastel | computed-style: par hex; ratio ≥4.5:1 |
| DC-011 | **Error**: fondo `#fce9ea` + texto `#b23a48` (5.01:1 ✅ AA). Usos: Vencido, Cancelado, toast de error, validación de campo | computed-style: par hex; ratio ≥4.5:1 |
| DC-012 | **Warning**: fondo `#fbf1da` + texto `#946200` (4.67:1 ✅ AA). Usos: Atrasado, Con deuda, por confirmar | computed-style: par hex; ratio ≥4.5:1 |
| DC-013 | **Info (azul)**: fondo `#e2eef6` + texto `#246991` (5.08:1 ✅ AA, usa el azul profundo → cohesiona con la marca). Usos: Atendiendo, En curso, informativos | computed-style: par hex; ratio ≥4.5:1 |
| DC-014 | **Neutro**: fondo `#eeeef0` + texto `#55555f` (6.36:1 ✅ AA). Usos: Terminado, En pausa, estados inactivos | computed-style: par hex; ratio ≥4.5:1 |

### Tipografía (🔒 prescriptivo — Red Hat, solo 400/500)

| ID | Criterio | Verificación |
|---|---|---|
| DC-015 | `--font-display: "Red Hat Display"` aplicada a títulos/H1/nombre de paciente; `--font-body: "Red Hat Text"` aplicada a body. **NUNCA Inter/Roboto/Arial/system** como fuente final (self-hosted woff2) | computed-style: `font-family` resuelve a Red Hat, no Inter |
| DC-016 | **Solo pesos 400 (regular) y 500 (medium)**. Nunca 700+ (bold) ni 300− (light). El número grande de progreso usa peso 500, no bold | computed-style: `font-weight` ∈ {400, 500} en todos los elementos |
| DC-017 | Escala: `--text-display` 28px/500/lh 1.2/ls -0.01em (H1, nombre de paciente, escala a 32px en ficha) · `--text-title` 20px/500/lh 1.25 · `--text-body` 16px/400/lh 1.6 | computed-style: tamaños y line-heights exactos |
| DC-018 | **Máximo 3 tamaños de texto por pantalla** (títulos + cuerpo). Captions/labels comparten el tamaño cuerpo con color secundario. Jerarquía por tamaño+color+aire, JAMÁS por grosor | visual + computed-style: ≤3 `font-size` distintos por pantalla; line-height títulos ~1.2, cuerpo 1.5–1.7 |

### Spacing y sizing (🔒 prescriptivo — múltiplos de 4)

| ID | Criterio | Verificación |
|---|---|---|
| DC-019 | Escala base en múltiplos de 4: `--space-1:4px` · `2:8` · `3:12` · `4:16` · `6:24` · `8:32` · `12:48` · `16:64`. Sin peldaños intermedios (no 20/28/40 como spacing; 20px permitido SOLO como gap entre cards) | computed-style: márgenes/paddings ∈ escala 4·8·12·16·24·32·48·64 |
| DC-020 | Padding interno de cards **24–32px** (`--card-padding: 24px`, hasta 32px en cards grandes); separación entre cards en listas **16–20px** (`--card-gap`); separación entre secciones 32–48px | computed-style: padding de card ∈ [24,32], gap entre cards ∈ [16,20] |
| DC-021 | Altura de inputs/selects/textarea/botones = **40px** (`--control-height`); touch target mínimo en mobile = **44px** (`--touch-target-min`); disabled = opacidad **0.4** | computed-style: height 40px; en mobile hit-area ≥44px; opacity disabled = 0.4 |

### Elevación, radius, motion (🔒 prescriptivo)

| ID | Criterio | Verificación |
|---|---|---|
| DC-022 | **Un solo nivel de sombra**: `--shadow-card: 0 1px 4px rgba(42,42,53,0.04)` (offset Y 1px, blur 4px, op 0.04, color del texto no negro). Hover: `--shadow-card-hover: 0 1px 6px rgba(42,42,53,0.06)`. NO existe escala sm/md/lg/xl | computed-style: box-shadow = 1px/4px/0.04; no hay sombras Material pesadas |
| DC-023 | **Regla "borde O sombra, nunca ambos"**: cada superficie elevada usa EXACTAMENTE una vía. Cards de contenido → sombra (`--shadow-card` + `border:none`). Inputs/filas/contenedores → borde (`--color-border` + `box-shadow:none`). Modal/dropdown/drawer → sombra | computed-style: ninguna card tiene border Y box-shadow simultáneos |
| DC-024 | Border-radius: `--radius-sm: 10px` (inputs, badges, chips, search-pill) · `--radius-md: 12px` (default: botones, cards) · `--radius-lg: 14px` (cards grandes, modales, banner). **Radius > 20px PROHIBIDO en cards/inputs** | computed-style: radius de superficies rectangulares ∈ [10,14] |
| DC-025 | `--radius-pill: 999px` / `--radius-circle: 50%` SOLO para circulares cortos: avatares, círculo "+N", badge de conteo, dot. **NUNCA en inputs ni cards** (input NO es píldora) | computed-style: ningún input/card con radius pill |
| DC-026 | Transiciones en **150–250ms** (`--motion-duration: 200ms`, fast 150ms, slow 250ms); easing `cubic-bezier(0.4,0,0.2,1)`. Toda transición/hover dentro de este rango (ni instantánea ni lenta) | computed-style: transition-duration ∈ [150,250]ms |

### Iconografía (🔒 prescriptivo — Phosphor, GAP-T05 confirmado)

| ID | Criterio | Verificación |
|---|---|---|
| DC-027 | Un solo set **Phosphor regular** (no fill), stroke **1.5px** (`--icon-stroke`), SVG inline. Tamaños fijos: **16px** inline · **20px** botones/filas · **24px** acciones primarias. Íconos heredan `currentColor`; íconos de estado toman su color semántico. Sin emojis decorativos | computed-style + visual: stroke 1.5px, tamaños ∈ {16,20,24}, ningún emoji |

### Focus ring y overrides de Bootstrap (🔒 prescriptivo)

| ID | Criterio | Verificación |
|---|---|---|
| DC-028 | **Focus ring visible** en `:focus-visible` de TODO interactivo: `box-shadow: 0 0 0 2px #246991` con offset 2px (azul profundo → 3:1 sobre fondos claros). NUNCA `outline:none` sin reemplazo. Inputs combinan ring + borde `--color-accent-deep` | computed-style: focus ring 2px `#246991` presente en interactivos |
| DC-029 | Overrides obligatorios de Bootstrap 5: `--bs-body-font-family` → Red Hat; `.fw-bold`/700 → mapear a 500; `--bs-border-radius` → 12px, prohibir `.rounded-pill` en cards; `.shadow*` → `--shadow-card`; `.btn` → 40px sin box-shadow ni gradiente; `--bs-primary`/`.btn-primary` → `--color-accent` (no `#0d6efd`); `--bs-link-color` → `#246991`; `.badge` → pastel; focus glow azul BS → `--focus-ring` | computed-style: ningún `#0d6efd`, ninguna sombra Material, body en Red Hat |

---

## Análisis de Referencias Visuales

> Resumen de `visual-analysis.md` (Design Researcher). Detalle completo y BVC-xxx en ese archivo. Referencia visual: **Task Dasher** (`task-dasher.webflow.io`, 48 screenshots + 4 capture-notes).

### Decisiones de Diseño Derivadas de las Referencias
- **Chasis heredado (BVC-029)**: canvas casi-blanco + cards blancas flotantes + sombras ultra-sutiles + mucho aire + sidebar con item activo en píldora elevada + avatares circulares/overlapping. Es la base de la compatibilidad con Task Dasher.
- **Adaptación crítica #1 — banner de ficha**: el gradiente "aurora" morado→magenta→naranja de Task Dasher (header Profile, imagen Sign In) **NO se hereda** (rozaría anti-patrón #2 y contradice "calma profesional"). Se sustituye por **banner azul sobrio** (`#c5d8e8`→blanco muy tenue o liso).
- **Adaptación crítica #2 — paleta**: el azul de Task Dasher (`#2979ff`/`#669dfc`) es más saturado → se armoniza a la familia azul suave (`#c5d8e8`/`#6da8d4`), serena y clínica.
- **Adaptación crítica #3 — radius e inputs**: Task Dasher usa radius ~16–20px en cards e inputs píldora ~24–26px → se bajan a 10–14px (cards) y a inputs sutiles 40px/radius 10–14px.
- **Adaptación crítica #4 — pesos tipográficos**: Task Dasher llega a Bold 700 y números enormes muy bold → con solo 400/500, la jerarquía es por tamaño+color+aire (% de progreso = grande en peso 500 + azul medio).
- **Adaptación crítica #5 — columnas de tabla**: Task Dasher excede 5 columnas → se recorta a ≤5 (turnos del día y facturas ≤4).
- **A INTRODUCIR (no existe en Task Dasher)**: badges de estado de turno/tratamiento/pago en versión **pastel** (derivados de sus priority-pills + status soft-badges); diferenciación leído/no-leído por item en Notificaciones; odontograma (componente propio del dominio).
- **NO aplica de Task Dasher**: carrito de e-commerce, página Pricing (solo inspiración de layout para el catálogo de tipos), gradiente aurora.
- **Firma del producto**: la **ficha del paciente** (Profile → 6 tabs) con header asimétrico (foto+nombre izq / panel de datos der) es la pantalla-firma — memorable por aire y escala del nombre.
- Capturas de referencia en `output/design/references/` (capture-notes + PNGs de Task Dasher).

---

## Layouts por Pantalla

> Origen: `ux-flows.md`. ~40 pantallas / ~49 rutas. **Multi-pantalla estricto**: cada acción crear/editar/consultar = ruta dedicada; URL = fuente de verdad; botón atrás funciona; deep-link hidrata desde localStorage. Verificación: visual (layout) + computed-style donde aplica.

| ID | Pantalla | Criterio de layout | Breakpoints |
|---|---|---|---|
| DC-030 | App Shell (DEMO-001/002/003/004) | Grid 2 columnas en desktop: sidebar fijo ~232px (230–250) + área de contenido con header sticky (~64px) arriba, `<router-outlet>` en medio, footer discreto al pie. Canvas `#fafafa`, cards blancas flotantes encima. NO envuelve Login | mobile, tablet, desktop |
| DC-031 | Sidebar (DEMO-001) | Columna fija blanca/casi-canvas. Logo (isotipo+wordmark "Estudio Dental Mendieta") arriba. **Exactamente 5 items principales** (Agenda·Pacientes·Tratamientos·Facturación·Reportes) + separador 1px + Configuración·Ayuda. Cada item = ícono Phosphor 20px izq + label SIEMPRE visible. Item activo = píldora `#c5d8e8` tintada, radius 10–14px. No colapsable en desktop | mobile (drawer), tablet, desktop |
| DC-032 | Header (DEMO-002) | Izq→der: [hamburguesa mobile] · logo · nombre del módulo activo (sincronizado con ruta) · spacer · [search-pill contextual opcional, 40px/radius 10–14px] · campana con badge contador · avatar "AD". **SIN** búsqueda global / command palette / carrito / badge demo | mobile, tablet, desktop |
| DC-033 | Footer (DEMO-003) | Banda discreta al pie del contenido, una línea de texto secundario gris: "Estudio Dental Mendieta · v1.0 · 2026". **Prohibido**: atribución a portfolio, acción "Resetear demo", lenguaje de demo | mobile, tablet, desktop |
| DC-034 | Login (DEMO-005) | Card centrada sobre canvas `#fafafa` con split interno opcional (imagen sobria izq — NUNCA aurora — / formulario der). Sin sidebar ni header. Inputs sutiles decorativos 40px. Botón "Ingresar como administradora" + link "Saltar login" | mobile (card ~92%, split apilado), tablet, desktop |
| DC-035 | No encontrado (fallback) | Dentro del shell. Empty state centrado: ícono Phosphor liviano + mensaje + 1 acción "Volver al inicio". Caso paciente inexistente → mensaje específico + "Volver a la lista" | todos |
| DC-036 | Agenda — Calendario (DEMO-007) | Header de pantalla (título "Agenda" + 1 filtro por profesional + 1 acción "Nuevo turno") sobre calendario como card blanca flotante. Toggles Mes/Semana/Día (vista en query param). Turnos = bloques coloreados por estado. Mucho aire | mobile (días apilados/vista priorizada), tablet, desktop |
| DC-037 | Agenda — Detalle de turno | Card de detalle (fecha/hora/duración/estado badge + foto/link al paciente + datos). **1 acción primaria** "Avanzar estado"; secundarias (Reagendar/Cancelar) en menú "⋯" | mobile (1 col, acción full-width al pie), tablet/desktop (card centrada) |
| DC-038 | Agenda — Crear turno (3 pasos, DEMO-015) | Stepper "Paso N de 3" arriba + card del paso, columna central. Paso 1 Paciente · Paso 2 Profesional+fecha (disponibilidad real) · Paso 3 Tratamiento+confirmación. 1 acción primaria por paso (Siguiente/Confirmar) | mobile (1 col, botones al pie), tablet, desktop |
| DC-039 | Agenda — Reagendar / Lista del día | Reagendar: card de turno actual arriba + calendario/selector de slot abajo, 1 acción. Lista del día: tabla **≤4 columnas** (Paciente·Profesional·Hora·Estado) ordenada por hora, filas clickeables | mobile (slots verticales / filas→mini-cards), tablet, desktop |
| DC-040 | Pacientes — Lista (DEMO-008) | Header (título + buscador inline contextual + 1 acción "Nuevo paciente") + tabla **≤5 columnas** (Foto·Nombre·Obra social·Próximo turno·Estado de cuenta) con paginación. Toggle Card/Tabla (Tabla = vista primaria) | mobile (filas→mini-cards verticales), tablet, desktop (tabla o grid 3 col) |
| DC-041 | Pacientes — Ficha: cabecera + 6 tabs (DEMO-009, PANTALLA-FIRMA) | Banner azul sobrio (degradé `#c5d8e8`→blanco muy tenue, **NUNCA aurora**). Header con **asimetría intencional**: foto grande circular (borde blanco) + nombre grande (display, peso 500) izq; panel de datos liviano con icon-chips der. **1 acción primaria** "Agendar turno" + menú "⋯". Debajo barra horizontal de **6 tabs**. Cabecera estable al cambiar de tab | mobile (foto recentrada solapando banner, nombre centrado, datos apilados, tabs con scroll horizontal), tablet, desktop (header asimétrico) |
| DC-042 | Ficha — Tabs 1-3 (DEMO-011) | Tab 1 Información: cards aireadas (Datos personales·Contacto·Obra social·Datos clínicos), NO tablas densas, mucho aire. Tab 2 Odontograma: ver DC-043. Tab 3 Historial: timeline cronológico (más reciente primero), bloques de evento clickeables | mobile (cards/timeline 1 col), tablet (cards 2 col), desktop |
| DC-043 | Ficha — Tab 2 Odontograma (DEMO-010) | Diagrama de **32 piezas** (arcada superior cuadrantes 1-2 + inferior 3-4 claramente distinguidas, eje horizontal sutil) sobre superficies blancas con contorno `#e8e8ee` + **leyenda/clave** de 6 estados siempre visible. Cada pieza clickeable → ruta de detalle. Carga con `@defer` | mobile (arcadas apiladas, piezas legibles sin scroll horizontal), desktop (lado a lado o apiladas con aire) |
| DC-044 | Ficha — Tabs 4-6 (DEMO-011) | Tab 4 Tratamientos: grupos Activos/Completados, cada plan = progress-card con % grande (peso 500, azul medio) + barra. Tab 5 Documentos: galería en grilla, thumbnail + nombre, fallback a placeholder controlado. Tab 6 Pagos: resumen arriba (Facturado·Cobrado·Saldo) + lista de movimientos + 1 acción "Registrar pago" | mobile (1 col, grilla 1-2 col, movimientos→mini-cards), tablet, desktop |
| DC-045 | Pacientes — Sub-pantallas | Crear paciente (2 pasos, stepper) · Editar (form precargado) · Detalle de pieza (estado editable + tooth-state-selector + historial) · Detalle de evento · Detalle de plan · Registrar pago (DEMO-016: ruta dedicada NO modal, monto ARS validado positivo). Cada una = ruta dedicada, 1 acción primaria | mobile (1 col, touch ≥44px), tablet, desktop |
| DC-046 | Tratamientos (DEMO-012) | Lista de activos: tabla **≤5 columnas** (Paciente·Tratamiento·Profesional·Etapas X/Y·Próxima fecha), filtro por profesional. Catálogo de tipos: cards aireadas (≥12 tipos), NO tabla densa. Detalle de tipo: cards aireadas (Pasos·Materiales·Costo ARS·Duración·Profesionales) | mobile (filas→mini-cards / cards 1-2 col), tablet, desktop (3 col) |
| DC-047 | Facturación (DEMO-013) | Sub-navegación de sección (Presupuestos·Facturas·Obras sociales, cada una ruta real). Presupuestos: tabla 4-5 col + crear (3 pasos). Facturas: tabla **≤4 col**. Obras sociales: cards aireadas (logo-en-círculo + mini-stats pacientes/deuda + avatar-stack). **Mock interno SIN ARCA/AFIP** | mobile (filas→mini-cards, sub-nav como chips, cards 1-2 col), tablet, desktop |
| DC-048 | Reportes — Dashboard (DEMO-014, anti-clutter) | Grilla aireada de **≤6 KPI cards** clickeables (Pacientes nuevos·Turnos atendidos·Tratamientos completados·Ingresos facturados·Cobrado·Deuda). Cada KPI = número grande (peso 500, azul) + anillo/gauge opcional + label. **PROHIBIDO** amontonar tablas en el dashboard; cada card respira | mobile (1-2 col), tablet (2-3 col), desktop (3 col, 2 filas) |
| DC-049 | Reportes detallados + Config + Ayuda (DEMO-018) | Reportes (pacientes 4 gráficos / tratamientos 3 / financiero 3 / productividad 3) en cards aireadas separadas, 1 métrica por card. Configuración: cards aireadas, incl. "Restablecer datos". Ayuda: FAQ por tema en cards aireadas. Cero demo en copy | mobile (1 col, gráficos adaptados sin scroll horizontal), tablet, desktop |

---

## Componentes

> Origen: `components.md`. Catálogo `shared/` + dominio. Verificación: visual (aspecto, estados) + computed-style (colores/sizes). Reglas transversales de estado (BVC-015) obligatorias en CADA clickeable: hover ≤250ms · focus ring visible · active/pressed · disabled op 40% · selected tintado.

### Chasis / Navegación

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-050 | `sidebar` (DEMO-001) | Píldora de item activo: fondo `#c5d8e8` tintado, radius 10–14px, sin sombra ni borde, label+ícono en `#2a2a35` (sobre `#c5d8e8` = 9.70:1; **NO** azul profundo que falla 4.10:1). Badge de conteo circular `#246991` + texto blanco. Solo uno activo, sincronizado con URL (`aria-current="page"`) | default (texto `#707080`), hover (fondo `#c5d8e8` ~14%, texto `#2a2a35`), active/selected (píldora), focus (ring) |
| DC-051 | `header` (DEMO-002) | Solid sobre canvas, separado por `--color-border` inferior O `--shadow-card` (no ambos). Search-pill 40px/radius 10–14px (NO píldora total) con lupa Phosphor 16px. Campana = icon-button con badge `#246991` (oculto si count=0). Avatar "AD" circular | campana/avatar: hover/focus/active; badge oculto si 0 |
| DC-052 | `footer` (DEMO-003) | Una línea sobria, texto `#707080` tamaño cuerpo, separada por `--color-border` superior 1px. **NO** "v1.0 demo", NO link a portfolio, NO "Resetear demo" | estático (hover/focus si lleva link) |

### Datos / Estado

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-053 | `status-badge` (BVC-018) | Pill pastel: fondo `--color-{x}-bg` + texto/dot `--color-{x}-text` (versión oscura del hue), radius 10–14px o pill suave, padding 8px/4px, texto cuerpo peso 500. Mapeo: turno (Confirmado→éxito·En espera→warning·Atendiendo→info·Terminado→neutro·Cancelado→error), tratamiento (En curso→info·Atrasado→warning·En pausa→neutro·Completado→éxito), pago (Al día→éxito·Con deuda→warning·Vencido→error). Color NUNCA único portador (siempre texto). Máx 1 badge estado + 1 prioridad por registro | no interactivo (indicador) |
| DC-054 | `priority-pill` | Pill pastel High/Mid/Low: High→error pastel · Mid→warning pastel · Low→éxito pastel. Texto "Alta/Media/Baja" siempre presente (color-independiente), ≥4.5:1 | no interactivo |
| DC-055 | `avatar` | Círculo; imagen `object-fit:cover` o **iniciales** (1-2 letras) sobre fondo `--color-accent-tint` + texto `#246991` peso 500. **NUNCA imagen rota** (fallback `onerror`). Tamaños xs(24)·sm(32)·md(48)·lg(88)·xl(120). En ficha (lg/xl) borde blanco 2-4px (efecto recortado) | clickeable: hereda hover/focus de la fila; loading: skeleton circular |
| DC-056 | `avatar-stack` | Avatares ~28-32px con borde blanco 2px, solapados ~40%. Si excede `max` (default 4) → círculo "+N" con fondo `#246991` (deep, no medio — para AA) + texto blanco. Número siempre visible (no solo color) | clickeable: hover (separación leve) + focus ring grupo |
| DC-057 | `relative-time` | Timestamp relativo en español rioplatense ("hace 30 min", "hace 1 h", "hace 5 días", "ayer"), color `#707080`, tamaño cuerpo, alineado a la derecha en filas. `<time datetime>` + fecha absoluta en title | estático; en mobile baja a 2ª línea |

### Cards (replican Task Dasher — BVC-019)

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-058 | `patient-card` (DEMO-011, Patrón 4) | Foto circular grande centrada (~88px) + nombre peso 500 (subtítulo) + subtítulo `edad · obra social` gris + divider + 2 filas de icon-chips azules (ícono `#246991` 16px + label gris + valor) + status-badge de pago + footer "Ver ficha" (link azul) + icon-button editar. Superficie blanca, radius 10-14px, padding 24-32px, **borde O sombra** | hover (elevación), focus ring, loading skeleton |
| DC-059 | `treatment-card` / `progress-card` (DEMO-011/012, Patrón 3) | **% grande** tamaño display peso **500** color `#6da8d4` (o `#246991`) + label "Progreso" gris + barra de progreso (relleno `#6da8d4`, track `#c5d8e8` o `#e8e8ee`) + nombre peso 500 + "X/Y etapas" opcional + status-badge solo si representa estado real + avatar-stack + menú "⋯". Barra `role="progressbar"` con aria | hover (elevación), focus ring, loading skeleton |
| DC-060 | `obra-social-card` (DEMO-013, Patrón 10) | Logo-en-círculo con borde `--color-border` arriba + nombre peso 500 + divider + mini-stats con icon-chips azules (pacientes activos · deuda ARS · último pago, ícono `#246991` 16px) + avatar-stack opcional. **SIN ARCA/AFIP**, logo placeholder controlado (no rotulado como placeholder) | hover (elevación), focus ring, loading skeleton |
| DC-061 | `kpi-card` (DEMO-014, Patrón 3) | Valor/número grande tamaño display peso 500 color `#246991` + label gris + anillo/gauge opcional (% centrado + "Progreso" + marcadores 0/100) cuando es porcentual. Montos ARS formateados. Clickeable → reporte. Valor calculado del estado, NUNCA hardcodeado | hover (elevación + refuerzo del valor), focus ring, active, loading skeleton |
| DC-062 | `treatment-type-card` (DEMO-012) | Ícono Phosphor opcional + nombre peso 500 + descripción corta gris (lh 1.5-1.7) + costo ref ARS + duración estimada. Aire generoso, NO tabla densa | hover (elevación), focus ring, loading skeleton |

### Tablas / Listas

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-063 | `data-table` (DEMO-008/012/013, BVC-009) | **≤5 columnas estricto** (turnos del día y facturas ≤4). Header: labels `#707080` uppercase con tracking, sin fondo pesado. Filas ~48px, divider `#e8e8ee` 1px, celda visual con avatar pequeño, última col = acciones (icon-buttons gris). Footer: contador "1–12 de N" + paginación offset (default 12). **NUNCA infinite scroll** | fila: hover (fondo `--color-accent-tint` ~12%), focus ring, active; carga: skeleton con stagger; vacío: empty-state |
| DC-064 | `empty-state` (DEMO-017) | Ícono Phosphor liviano (24px+, color gris o azul tenue) + título peso 500 (subtítulo) + descripción con **guidance** gris + **1 acción primaria** opcional. Mucho aire, centrado. Copy persona-céntrico anti-demo (nunca delata mock) | acción primaria = button con estados; estado en sí estático |
| DC-065 | `skeleton` (DEMO-017, BVC-016) | Bloques fondo `--color-border`/gris tenue + shimmer sutil. Presets: `card-row` (círculo + 2-3 líneas), `card` (forma de la card). **Stagger** ~40ms incremental por fila/card. Contenedor `aria-busy="true"`. **NUNCA spinners** | reveal con stagger; al hidratar `aria-busy="false"` |

### Feedback / Overlays

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-066 | `toast` (BVC-016) | Pieza compacta esquina, fondo blanco con borde semántico O fondo pastel tenue, ícono Phosphor de estado en color semántico + mensaje cuerpo. **Éxito** → verde pastel, auto-dismiss ~3s. **Error** → coral pastel, persistente + "Reintentar". Entrada ease-in suave ≤250ms. Copy anti-demo | hover pausa auto-dismiss; reintentar/cerrar con hover/focus |
| DC-067 | `confirm-dialog` (BVC-012) | Modal centrado **<50% viewport** (máx ~440px desktop), card blanca radius 10-14px, `--shadow-card`, backdrop translúcido `rgba(42,42,53,0.45)`. Título peso 500 + mensaje guidance + 2 botones (Cancelar secundario + Confirmar primario; destructivo → coral pastel + texto oscuro). SOLO confirmaciones cortas, máx 3 campos. Trap de foco, Escape=cancelar | botones hover/focus/active; foco inicial en Cancelar si destructivo |
| DC-068 | `filter-panel` (BVC-011) | **1 filtro principal visible** (dropdown 40px/radius 10-14px) + botón "Filtros" (icon-button `funnel` + label) que abre panel desplegable con secundarios. Chips removibles (pill + "×") para filtros activos. NUNCA múltiples filtros visibles simultáneos | dropdown/botón hover/focus/active; chips hover (refuerzo ×) + focus; botón muestra badge si hay filtros |

### Formularios / Flujos

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-069 | inputs / select / textarea (anti-patrón #7) | Altura **40px**, radius **10-14px**, borde tenue `#e8e8ee` 0.5-1px, fondo blanco, texto cuerpo, padding 12px. Label arriba/flotante gris. Select con chevron Phosphor 16px. **NO** sombras internas ni gradientes, **NO** píldoras. Validación inline post-blur/tiempo real | default (borde `#e8e8ee`), hover (borde tinte azul), focus (ring 2px `#246991` + borde acentuado), filled, error (borde coral + mensaje junto al campo + ícono alerta), disabled (op 40%) |
| DC-070 | `stepper` | Fila horizontal de pasos numerados: actual destacado (círculo `#6da8d4` + número, label peso 500), completados (check `#246991`), futuros (círculo `#e8e8ee`, label gris), conector `#e8e8ee` con tramo completado `#6da8d4`. "Paso N de M" claro. Número grande peso 500 (no bold) | no interactivo (refleja estado del flujo) |
| DC-071 | `button` (BVC-010/017, GAP-A04) | Altura **40px**, radius 10-14px, padding 12/16px, texto peso 500 cuerpo. **NO** sombras internas ni gradientes. **primary**: fondo `#6da8d4` + **texto oscuro `#2a2a35`** (GAP-A04: blanco NO pasa AA), o fondo `#246991` + texto blanco si se requiere blanco. **secondary**: blanco/transparente + borde `#e8e8ee` + texto oscuro. **ghost**: solo texto/ícono. **destructive**: coral pastel + texto oscuro. **1 sola primaria por pantalla** | hover (oscurecimiento sutil/tinte), focus (ring), active (translateY 0/oscurecer), disabled (op 40%, not-allowed), loading (label "Guardando…" + deshabilitado, sin spinner) |
| DC-072 | `icon-button` | Ícono Phosphor 20px (o 16px inline), área toque mín 40px desktop / **44px mobile**, color heredado (gris en acciones de fila), sin fondo por defecto. `aria-label` OBLIGATORIO. NUNCA en navegación principal (allí hay label visible) | hover (fondo `--color-accent-tint` ~12% circular), focus ring, active, disabled 40% |

### Tabs / Ficha (pantalla-firma)

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-073 | `tabs` (DEMO-009/011, BVC-013) | Barra horizontal de **6 tabs** (Información general·Odontograma·Historial clínico·Tratamientos·Documentos·Pagos). Tab activo: label peso 500 + fondo `--color-accent-tint`/`#c5d8e8` tintado + esquinas redondeadas (y/o indicador inferior sutil). Inactivo: label peso 400 gris. **Contenido del tab inactivo NO renderizado en el DOM** (vía router-outlet hijo/`@if`, no CSS display:none). Tab activo reflejado en URL. `role="tablist"`/`tab`/`tabpanel` | hover (tinte) en inactivos, focus ring, active=seleccionado tintado |
| DC-074 | `patient-header` (DEMO-009, Patrón 11) | Banner azul plano muy sutil (degradé `#c5d8e8`→blanco MUY tenue o liso). **NUNCA aurora morado-magenta-naranja**. Foto xl circular borde blanco grueso (efecto recortado) izq + nombre grande (display peso 500) arriba + datos clave con icon-chips azules der (asimetría intencional). Badges de alerta pastel solo si aplican (sin badge vacío). **1 acción primaria** "Agendar turno" + menú "⋯". Nombre como `<h1>` | botón primario + menú con estados; eliminar → confirm-dialog |
| DC-075 | `event-block` | Leading circular (ícono Phosphor temático con fondo tenue / avatar) + título peso 500 + **fecha a la derecha** (relative-time) + descripción corta gris (lh 1.5-1.7) + meta opcional. Variantes: `timeline` (Historial, línea cronológica vertical), `list` (Tratamientos) | clickable: hover (tinte/elevación) + focus ring + cursor pointer |

### Componente de dominio: Odontograma

| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-076 | `odontogram` (DEMO-010) | SVG de **32 piezas FDI** (superior cuadrantes 1-2 / inferior 3-4 distinguidas por eje sutil). Cada pieza = forma SVG sobre superficie blanca, contorno `#e8e8ee`. Numeración FDI 11-48 visible + universal 1-32 en tooltip. 6 estados con **color/chip pastel del sistema semántico + ícono/patrón** (no solo color): sana→blanco/neutro · caries→warning ámbar · obturación→info azul · ausente→gris + patrón punteado/tachado · en tratamiento→`#6da8d4` · prótesis→neutro distinto + ícono. **Leyenda siempre visible**. `viewBox` responsive, sin lag. Cada pieza `aria-label="Pieza 16 (universal 3), obturación"` | pieza: hover (elevación/tinte + pointer), focus ring (teclado), active, selected opcional (borde acentuado). Sin disabled |
| DC-077 | `tooth-state-selector` | Grupo de opciones seleccionables (chips/segmented/radio-cards), cada una con chip de color pastel del estado + label. Opción actual marcada (fondo tintado + borde acentuado). NO dropdown denso — opciones visibles y tocables. `role="radiogroup"`, cada opción `role="radio"` + `aria-checked` | cada opción: hover (tinte), focus ring, selected (tintado + borde), active |

### Reservados para componentes adicionales
| ID | Componente | Criterio visual | Estados |
|---|---|---|---|
| DC-078 | `photo` (alias de avatar lg/xl) | Foto protagonista del paciente: lista (sm) y ficha (xl). Fallback determinista a iniciales en círculo pastel `--color-accent-tint` + texto `#246991`. Thumbnails de Documentos que fallan → placeholder sobrio (ícono Phosphor `image` + fondo neutro), NO ícono de error del navegador | imagen / fallback iniciales / placeholder controlado |
| DC-079 | (reservado para futuros componentes de dominio) | — | — |

---

## Responsive

> Origen: `ux-flows.md` §5 + `components.md`. **3 breakpoints**; TODOS los flujos usables en mobile (no solo consulta). Verificación: visual en cada viewport. Breakpoints: mobile <768px · tablet 768-1199px · desktop ≥1200px.

| ID | Criterio | Breakpoints |
|---|---|---|
| DC-080 | **Sidebar → drawer overlay** en mobile (invocado por hamburguesa del header, ancho ~80vw máx 320px, cierra al navegar/tocar backdrop). Items mantienen ícono+label y touch ≥44px. En desktop fijo 232px | <768px (drawer) / ≥1200px (fijo) |
| DC-081 | **Tabla (data-table) → layout vertical "ficha"** en mobile: cada fila se convierte en mini-card vertical con celda visual (avatar+nombre) arriba como título + resto como pares label(izq)/valor(der) apilados; fila completa clickeable (touch ≥44px). Paginación se mantiene. **Sin scroll horizontal** | <768px |
| DC-082 | **Cabecera de ficha**: desktop foto grande izq + nombre arriba + panel datos der (asimetría) → mobile foto **recentrada solapando el banner** + nombre centrado + datos apilados en 1 columna | <768px |
| DC-083 | **Barra de 6 tabs**: desktop barra horizontal completa → mobile scroll horizontal (o chips deslizables), tab activo siempre a la vista, touch ≥44px | <768px |
| DC-084 | **Cards en grid** (catálogo, obras sociales, KPIs): desktop 3 columnas → tablet 2-3 → mobile 1-2 columnas. Valor grande mantiene escala | <768px (1-2) / 768-1199px (2-3) / ≥1200px (3) |
| DC-085 | **Flujos multi-paso**: desktop columna central + stepper arriba → mobile 1 columna, stepper compacto ("Paso 2 de 3" + barra lineal), botones Atrás/Siguiente al pie con ancho cómodo | <768px |
| DC-086 | **Calendario**: desktop grilla mensual completa → mobile mes adaptado (días apilados o vista semana/día priorizada), toggles touch ≥44px. **Odontograma**: arcadas apiladas verticalmente en mobile, piezas legibles sin scroll horizontal que rompa layout | <768px |
| DC-087 | **Formularios**: desktop 1-2 columnas → mobile 1 columna, inputs 40px (touch ≥44px), labels arriba | <768px |
| DC-088 | **Touch target ≥44px** en TODO control mobile (controles de flujos, "Registrar pago", form de pago, selector de estado de pieza, toggles del calendario, filas clickeables). **Sin scroll horizontal no intencional** en ningún viewport mobile estándar | <768px |
| DC-089 | **Ningún flujo "solo desktop"**: crear/editar paciente, crear turno, reagendar, crear presupuesto, registrar pago y editar odontograma completamente operables en celular | <768px |

---

## Estados de UI

> Origen: `ux-flows.md` §4. Los **5 estados** por pantalla. Verificación: visual por pantalla/estado. Comportamiento: empty (ícono+guidance+1 acción), carga (skeletons+stagger, NO spinners), error (toast coral+reintento), éxito (contenido/toast tras acción), muchos datos (paginación offset, NO infinite scroll).

| ID | Pantalla | Estado | Criterio visual |
|---|---|---|---|
| DC-100 | Agenda — Calendario | Vacío | Empty state: "No hay turnos en este período. Creá uno con **Nuevo turno**." + acción primaria |
| DC-101 | Agenda — Calendario | Carga | Skeletons (celdas/bloques fantasma con stagger), NO spinners |
| DC-102 | Agenda — Calendario | Error / Éxito / Muchos datos | Error: toast coral + reintento. Éxito: bloques coloreados por estado navegables. Muchos datos: bloques se compactan / "+N más" → `/agenda/dia` |
| DC-103 | Lista de turnos del día | 5 estados | Vacío: "No hay turnos para este día. Agendá uno con **Nuevo turno**." · Carga: skeletons de fila (stagger) · Error: toast+reintento · Éxito: filas con badge · Muchos datos: paginación "1–12 de N" |
| DC-104 | Detalle de turno | Carga / Error / Estado terminal | Carga: skeleton del detalle. Error (turno inexistente): "No encontramos este turno" + volver. Estado terminal (terminado/cancelado): acción primaria **deshabilitada** (op 40%, cursor not-allowed) |
| DC-105 | Lista de pacientes | 5 estados | Vacío (sin resultados): "No encontramos pacientes con ese criterio. Probá con otro nombre o ajustá los filtros." · Carga: skeletons (avatar circular + líneas, stagger) · Error: toast+reintento · Éxito: tabla/cards navegables · Muchos datos: paginación "1–12 de 29" |
| DC-106 | Ficha — Tab Información | Vacío por campo / Carga / Error | Campo sin dato: placeholder claro ("Sin medicación registrada", "Sin alergias registradas"), nunca en blanco ambiguo. Carga: skeletons de card. Error (paciente inexistente): "No encontramos este paciente." + "Volver a la lista" |
| DC-107 | Ficha — Odontograma | Carga / Éxito | N/A vacío (siempre 32 piezas; paciente nuevo → todas "sana"). Carga (`@defer`): skeleton del diagrama (arcadas fantasma). Éxito: piezas coloreadas según estado seed |
| DC-108 | Ficha — Historial | 5 estados | Vacío: "Este paciente todavía no tiene eventos clínicos registrados." · Carga: skeletons de bloque (stagger) · Error: toast+reintento · Éxito: timeline navegable · Muchos datos: paginación o "Ver más" sin infinite scroll |
| DC-109 | Ficha — Tratamientos | Vacío / Grupo vacío / Carga / Éxito | Vacío: "Este paciente todavía no tiene tratamientos." Grupo vacío (solo activos o completados): el grupo se omite o muestra mensaje breve sin romper layout. Carga: skeletons de card. Éxito: cards con progreso |
| DC-110 | Ficha — Documentos | 5 estados | Vacío: "Este paciente todavía no tiene documentos cargados." · Carga: skeletons de thumbnail · Error (thumbnail no carga): placeholder controlado (no ícono de error del navegador) · Éxito: grilla navegable · Muchos datos: paginación |
| DC-111 | Ficha — Pagos | 5 estados | Vacío: "Sin movimientos en la cuenta corriente." · Carga: skeletons · Error: toast+reintento · Éxito: resumen + lista, estado coherente con badge en lista de pacientes · Muchos datos: paginación |
| DC-112 | Registrar pago | Vacío / Error / Carga / Éxito | Vacío: "Confirmar pago" deshabilitado. Error (monto ≤0 o no numérico): "Ingresá un monto mayor a cero." inline. Carga: botón en carga sutil. Éxito: vuelve a Pagos, saldo+badge actualizados, toast "Pago registrado." |
| DC-113 | Lista de tratamientos | 5 estados | Vacío: "No hay tratamientos activos con este criterio." · Carga: skeletons de fila · Error: toast+reintento · Éxito: tabla navegable · Muchos datos: paginación con contador |
| DC-114 | Catálogo de tipos | Carga / Éxito | N/A vacío (≥12 fijos, 12-15 cards). Carga: skeletons de card. Éxito: grid navegable |
| DC-115 | Lista de presupuestos | 5 estados | Vacío: "No hay presupuestos con este criterio. Creá uno con **Nuevo presupuesto**." · Carga: skeletons de fila · Error: toast+reintento · Éxito: tabla con badges · Muchos datos: paginación |
| DC-116 | Lista de facturas | 5 estados | Vacío: "No hay facturas con este criterio." · Carga: skeletons de fila · Error: toast+reintento · Éxito: tabla con badges (sin mención fiscal) · Muchos datos: paginación |
| DC-117 | Obras sociales | Vacío (en detalle) / Carga / Éxito | Lista: N/A vacío (6 fijas). Detalle sin pacientes: "Esta obra social no tiene pacientes asociados." Carga: skeletons de card. Éxito: grid navegable |
| DC-118 | Reportes dashboard | Carga / Éxito | N/A vacío (siempre hay datos calculados, ≤6 KPIs). Carga: skeletons de card (anillos fantasma, stagger). Éxito: grid de cards clickeables |
| DC-119 | Reportes detallados | Vacío por gráfico / Carga / Éxito | Gráfico sin datos: "Sin datos suficientes para este gráfico." (no crashea). Carga: skeletons por card. Éxito: cards con visualizaciones legibles (montos ARS formateados en financiero) |

---

## Patrones de Feedback Visual

> Origen: `components.md` §9. Verificación: visual (aspecto del feedback) + computed-style (duración/color).

### Loading

| ID | Contexto | Criterio |
|---|---|---|
| DC-120 | Listas / secciones / cards | SIEMPRE `skeleton` con la forma del contenido (avatar circular + líneas para filas; cards fantasma para grillas) + **stagger** ~40ms por fila/card. Cards entran con fade + rise mínimo (translateY 8px→0) ≤250ms. **NUNCA spinners** |
| DC-121 | Botones de confirmación (guardar paciente, confirmar turno, registrar pago, aprobar presupuesto) | Estado `loading` del button: label "Guardando…/Confirmando…" + deshabilitado. Sin spinner pesado. El resultado lo da el toast |
| DC-122 | Odontograma / charts | Diferidos (`@defer`); placeholder skeleton mientras cargan. Un solo momento orquestado por pantalla, no micro-animaciones dispersas |

### Notificaciones

| ID | Tipo | Criterio |
|---|---|---|
| DC-130 | Éxito | Toast verde pastel (`#e3f3ea` + `#2d6a4f`), ícono check Phosphor, **auto-dismiss ~3s**, entrada ease-in suave ≤250ms. Tras cada acción exitosa (crear/editar/aprobar/avanzar/registrar pago/reset) |
| DC-131 | Error | Toast coral pastel (`#fce9ea` + `#b23a48`), ícono x, **persistente** + acción "Reintentar". `role="alert"` aria-live assertive |
| DC-132 | Info | Toast azul info pastel (`#e2eef6` + `#246991`), ícono info. `role="status"` aria-live polite |
| DC-133 | Notificaciones internas (campana del header) | Panel contextual <50% (hoja inferior en mobile). Fila: leading circular (ícono temático con fondo de color para sistema / avatar para persona) + título peso 500 + subtítulo gris + relative-time a la derecha (en mobile 2ª línea). **Diferenciación leído/no-leído por item** (dot azul leading o fondo `--color-accent-tint` tenue). Tabs de filtro pill (Todas/Sin leer). Íconos: turno→`calendar-blank`, pago vencido→`receipt` coral, cumpleaños→`cake` pastel, tratamiento por vencer→`tooth` warning. Contador en sidebar + header. Cada notificación navega a ruta real |

### Formularios

| ID | Contexto | Criterio |
|---|---|---|
| DC-140 | Validación | Inline post-blur / tiempo real (no solo al enviar), error **junto al campo** con mensaje descriptivo (no genérico): "Ingresá un DNI válido (7-8 dígitos)", "El monto debe ser mayor a 0". Borde coral + ícono alerta 16px. `aria-describedby` + `aria-invalid` |
| DC-141 | Submit | Botón en estado loading (label "Guardando…" + deshabilitado) hasta persistir; resultado vía toast. `aria-busy` |
| DC-142 | Confirmaciones | Destructivas/irreversibles (eliminar paciente, cancelar turno, restablecer datos) → `confirm-dialog` <50%, ≤3 campos. Reversibles/menores → feedback inline + toast (sin modal). Copy de producción, NUNCA "resetear demo" |

### Transiciones

| ID | Contexto | Criterio |
|---|---|---|
| DC-143 | Motion global | Entrada/salida de toasts (ease-in suave), apertura de modales (fade+scale sutil), cambios de estado, carga de listas (stagger). Hover en TODO clickeable (cards, filas, items, botones, pills, icon-buttons, tabs, piezas del odontograma) con tinte/elevación sutil (NO transform agresivo, máx translateY -1px o scale 1.01). **Todo dentro de 150-250ms**. Respeta `prefers-reduced-motion` (desactiva rise/stagger, mantiene fades) |

---

## Brief Verification Criteria (BVC)

> 🔒 **CLIENT-SPECIFIED** — transcritos EXACTOS de `visual-analysis.md` (origen: `brief-criteria.md` del cliente). **29 criterios.** Son QA gates obligatorios definidos por el cliente; **NO son modificables** por el equipo de diseño ni se renumeran. El Visual Checker los verifica junto con los DC-xxx — cada BVC-xxx debe tener resultado explícito en `qa-report.md`. La columna "DC-xxx Relacionado" es para trazabilidad (no altera el BVC).

| ID | Criterio del Cliente | Tipo de Verificación | DC-xxx Relacionado |
|----|---------------------|---------------------|-------------------|
| BVC-001 | Tipografía NO es Inter y usa solo pesos 400 y 500 (Red Hat) | computed-style | DC-015, DC-016 |
| BVC-002 | Paleta usa UNA sola familia de acento (azul) con máximo 4 tonos coherentes | computed-style | DC-001, DC-002, DC-003, DC-004, DC-005 |
| BVC-003 | Fondo principal entre `#ffffff` y `#fafafa`; texto principal gris oscuro cálido (~`#2a2a35`, no negro puro) | computed-style | DC-006, DC-007 |
| BVC-004 | Cards con radius entre 10 y 14px; ninguna card con radius >20px | computed-style | DC-024, DC-025 |
| BVC-005 | Cards usan borde sutil O sombra sutil, nunca ambos; sombras de un solo nivel suave (offset 1px / blur 4px / op 0.04) | computed-style | DC-022, DC-023 |
| BVC-006 | Spacing en múltiplos de 4; padding de cards 24-32px; separación entre cards 16-20px | computed-style | DC-019, DC-020 |
| BVC-007 | Sidebar con exactamente 5 items + Configuración/Ayuda, icono+label siempre visible, item activo destacado | visual | DC-031, DC-050 |
| BVC-008 | Header sin búsqueda global ni command palette; solo búsqueda contextual + notificaciones + avatar | visual | DC-032, DC-051 |
| BVC-009 | Ninguna tabla supera 5 columnas | visual | DC-063 |
| BVC-010 | Una sola acción primaria por pantalla; máximo una secundaria visible | visual | DC-071, DC-037, DC-041 |
| BVC-011 | Un solo filtro principal visible en listas; el resto en panel desplegable | visual | DC-068 |
| BVC-012 | Ningún drawer lateral como contenido principal; ningún modal >50% de pantalla | visual | DC-067 |
| BVC-013 | Ficha del paciente usa tabs; contenido del tab inactivo NO está en el DOM | computed-style | DC-073 |
| BVC-014 | Iconografía de un solo set (Phosphor o Tabler), regular, stroke 1.5px, tamaños 16/20/24 | computed-style | DC-027 |
| BVC-015 | Hover visible en todo lo clickeable; focus rings visibles; disabled con opacidad 40% | visual | DC-021, DC-028, DC-143 |
| BVC-016 | Skeletons (no spinners) al cargar listas; toasts tras acciones exitosas | visual | DC-065, DC-120, DC-130 |
| BVC-017 | Inputs y botones con altura 40px; touch targets ≥44px en mobile | computed-style | DC-021, DC-069, DC-071 |
| BVC-018 | Sin emojis decorativos, sin gradientes saturados, sin sombras pesadas, sin pills estridentes | visual (negative) | DC-053, DC-027, DC-022 |
| BVC-019 | Cards de paciente/tratamiento/obra social replican patrones Task Dasher (foto circular, % grande, badges suaves, avatares overlapping) | visual | DC-058, DC-059, DC-060 |
| BVC-020 | Ficha del paciente se ve compatible con la página Profile de Task Dasher | visual | DC-074, DC-041 |
| BVC-021 | Transitions/micro-interacciones entre 150-250ms | computed-style | DC-026, DC-143 |
| BVC-022 | Line-height de cuerpo 1.5-1.7 y de títulos ~1.2; máx 3 tamaños de texto por pantalla | computed-style | DC-017, DC-018 |
| BVC-023 | NO hay drawers laterales para contenido principal | visual (negative) | DC-067, DC-080 |
| BVC-024 | NO hay power-user features visibles (command palette, atajos globales, búsqueda global) | visual (negative) | DC-032 |
| BVC-025 | NO hay iconos sin label en navegación principal | visual (negative) | DC-031, DC-050, DC-072 |
| BVC-026 | NO hay infinite scroll en listas operativas ni scroll infinito en la ficha del paciente | visual (negative) | DC-063, DC-073 |
| BVC-027 | NINGUNA parte de la UI revela que es demo/mock (sin badge "demo", sin "Resetear demo" visible, sin lenguaje que delate el mock) | visual (negative) | DC-033, DC-052, DC-064, DC-142 |
| BVC-028 | El aire/espacio comunica orden — pantallas con poco contenido se ven espaciosas, no rellenadas artificialmente | subjective | DC-020, DC-042, DC-048 |
| BVC-029 | Sensación general "calma profesional" coherente con Task Dasher (aire, tipografía, cards, paleta azul) | subjective | DC-022, DC-024, DC-041 |

---

## Gaps de Diseño Descubiertos

> Consolidados de los 3 sub-designers + visual-analysis.md. Ninguno bloqueante; varios ya resueltos dentro del lenguaje prescriptivo. Solo los que tienen impacto en requirements o son decisiones vinculantes se documentan aquí.

| # | Gap | Impacto en requirements | Recomendación / Resolución |
|---|---|---|---|
| GAP-A04 | **Contraste del azul medio `#6da8d4` para texto blanco** (RESUELTO — vinculante). Texto blanco sobre el azul medio = 2.56:1, FALLA AA | REQ-256/NFR-020 (contraste AA), todo botón/pill/avatar-stack | **Texto oscuro `#2a2a35` sobre `#6da8d4` (5.54:1 ✅)** es la receta canónica del azul medio. Superficies con texto blanco → `--color-accent-deep #246991` (5.99:1 ✅). Aplicado en DC-002/003/050/056/059/071. Coordinado por los 3 sub-designers |
| GAP-D01 | **Badges de estado no existen en Task Dasher** (RESUELTO) | REQ-096/104/210 (badges de turno/tratamiento/pago) | A introducir en versión pastel (fondo pastel del hue + texto/ícono oscuro del mismo hue), derivados de priority-pills + status soft-badges. Aplicado en DC-010..014, DC-053 |
| GAP-D02 | **Estado leído/no-leído por item en Notificaciones** (RESUELTO) | Notificaciones internas (REQ-012) | Task Dasher solo da conteo agregado → se añade indicador por item (dot azul leading o fondo `--color-accent-tint` tenue). Aplicado en DC-133 |
| GAP-D03 | **Odontograma (32 piezas) sin análogo en la referencia** (RESUELTO) | REQ-132..140, Épica 11 | Componente propio del dominio dentro del lenguaje (superficies blancas, líneas `#e8e8ee`, estados pastel + ícono/patrón). Editable + mobile-usable + a11y. Aplicado en DC-043, DC-076, DC-077 |
| GAP-D04 | **Empty states / estados de error-carga no especificados en el brief** (RESUELTO) | DEMO-017, REQ-066/105/145/250/251 | Empty states sobrios persona-céntricos (ícono Phosphor + guidance + 1 acción); carga con skeletons + stagger; errores con toast coral + reintento. Sin spinners. Aplicado en DC-064/065/120/130/131 + DC-100..119 |
| GAP-UX01 | **Vista activa del calendario (mes/semana/día) en la URL** | REQ-060 (vista reflejada en URL/estado) | Reflejar como **query param** (`/agenda?vista=semana`) en una sola pantalla; la lista del día sí tiene ruta propia (`/agenda/dia`). Documentado en mapa de navegación (ux-flows.md) |
| GAP-UX02 | **"Crear paciente nuevo" dentro del flujo de crear turno** cruza dos flujos multi-paso | REQ-079 (preservación de estado) | Abrir `/pacientes/nuevo/datos` con parámetro de retorno (`?volverA=/agenda/nuevo/profesional`); al crear, retornar al Paso 2 con paciente preseleccionado. Mantiene multi-pantalla |
| GAP-UX03 | **Sub-navegación de Facturación** (Presupuestos/Facturas/Obras sociales) podría confundirse con tabs entre objetos | Riesgo anti-patrón #16 | Tratarla como **navegación de sección** (3 listas hermanas con rutas dedicadas reales), NO como tabs del mismo objeto. Cada destino es una ruta completa, no contenido oculto en el DOM |
| GAP-UX06 | **Pantalla de inicio post-login ambigua** | REQ-002 | Decisión: inicio = **`/reportes`** (dashboard de KPIs) para dar vista de operación viva inmediata. Documentado en mapa de navegación |
