# Plan de Distribución — Design Team (Estudio Dental Mendieta)

**Generado por**: Design Orchestrator
**Fecha**: 2026-06-01
**Fase**: 3 — Paso 3b-plan
**Fuente de diseño**: Design briefs del cliente (vía `output/design/visual-analysis.md`, 29 BVC + análisis Task Dasher). **Único input de diseño.**
**Sub-designers a lanzar**: los 3 (visual-system-designer, ux-flow-designer, component-designer).

> **Para los 3 sub-designers — leer ANTES de empezar:** vuestro único input de diseño es `output/design/visual-analysis.md`. Es autosuficiente (paleta, tipografía, spacing, animaciones, anti-patrones, 29 BVC, 13 patrones Task Dasher traducidos, decisiones holísticas). No re-leáis briefs ni capture-notes. Los valores marcados 🔒 PRESCRIPTIVO / CLIENT-SPECIFIED son del cliente: se **aplican EXACTOS**, no se reinterpretan ni se "mejoran". Donde el brief calló (gaps), aplicad criterio dentro del lenguaje prescriptivo.

---

## Contexto del Proyecto

- **Tipo de aplicación**: sistema de gestión clínica (CRM/ERP vertical salud) **persona-céntrico**, frontend-only. Viewcase presentado como **producto real en producción** (NUNCA demo — REQ-272/BVC-027).
- **Stack**: Angular 17+ standalone (`@if`/`@for`/`@defer`), **Bootstrap 5 selectivo** (solo grid + subset de utilidades) + **capa de design tokens propia** en `tokens.css` (CSS custom properties). Iconografía **Phosphor** (regular, stroke 1.5px) como SVG. Tipografía **Red Hat Display + Text** self-hosted (woff2 subseteado, pesos 400/500). 7 módulos lazy. ~40 pantallas. Charts solo en Reportes (lazy).
- **Naturaleza estructural (PRIORIDAD MÁXIMA)**: **multi-pantalla estricto** — cada acción crear/editar/consultar = ruta dedicada; la URL refleja la vista; el botón atrás funciona; deep-linking hidrata desde localStorage. Corrige el error del viewcase anterior (todo aglomerado en una pantalla con drawers + modales gigantes).
- **Patrones premium clave de la referencia (Task Dasher)**: chasis soft-UI (canvas casi-blanco + cards blancas flotantes + mucho aire) · sidebar con item activo en píldora elevada · cards con % grande + barra/anillo de progreso · avatares circulares y overlapping +N · status soft-badges + priority pills · "last updated" relativo · página Profile (→ ficha del paciente, la pantalla-firma) · toggle Card/Table view. **Adaptaciones deliberadas** (ver más abajo): azul suave en vez del azul saturado de Task Dasher; badges de estado pastel introducidos por nosotros; banner de ficha azul sobrio en vez del gradiente "aurora"; radius bajado a 10-14px; inputs sutiles (no píldoras); jerarquía por tamaño+color+aire (no por grosor, solo 400/500); tablas recortadas a ≤5 columnas.
- **Colores de marca (PRESCRITOS, 🔒)**: familia AZUL, máx **4 tonos**. Acento suave (cielo) `#c5d8e8` · acento saturado (medio) `#6da8d4` · fondo `#ffffff`–`#fafafa` · texto principal `~#2a2a35` (gris oscuro cálido, NUNCA negro puro) · texto secundario `~#707080` · borde/separador `#e8e8ee`. Semánticos SIEMPRE pastel (éxito verde, error coral, warning ámbar, info azul). **Un solo acento dominante + neutros para todo lo demás.**
- **Tipografía de marca (PRESCRITA, 🔒)**: **Red Hat** (Display títulos / Text cuerpo). SOLO pesos **400 y 500**. NUNCA Inter (anti-patrón #1). Máx **3 tamaños por pantalla**. Line-height cuerpo 1.5-1.7, títulos ~1.2.

## Instrucciones Prescriptivas del Brief (de visual-analysis.md)

- Los valores de **color, tipografía, spacing, radius, sombras, iconografía y animaciones** son **PRESCRIPTIVOS del cliente (🔒)** — NO modificar, NO aproximar, usar valores EXACTOS.
- **Paleta prescrita**: usar los hex EXACTOS de arriba. Máximo 4 tonos azules (cielo, medio, + como mucho un azul más profundo derivado para texto/íconos y un azul casi-blanco para fondos tintados). **Prohibido introducir un 5º hue.**
- **Tipografía prescrita**: Red Hat Display/Text, SOLO 400/500. Jerarquía por **tamaño + color + aire**, jamás por grosor (no hay bold). Máx 3 tamaños/pantalla.
- **Spacing prescrito**: escala base **4, 8, 12, 16, 24, 32, 48, 64px** (todo múltiplo de 4). Padding de card **24-32px**. Separación entre cards **16-20px**. Radius **10-14px** (>20px PROHIBIDO). Inputs/botones altura **40px**; touch target mobile **≥44px**. Disabled opacidad **40%**.
- **Sombra**: un solo nivel (offset 1px / blur 4px / op 0.04). Card vive con **borde O sombra, NUNCA ambos** (BVC-005).
- **Iconografía**: un solo set **Phosphor** regular, stroke 1.5px, tamaños **16/20/24px**. Íconos heredan color del texto contiguo (salvo íconos de estado → color semántico).
- **Animaciones**: transitions/hover **150-250ms** suave. Hover visible en TODO lo clickeable. Focus rings visibles. **Skeletons, NO spinners**. Toasts tras acción exitosa.

### Anti-patrones mandatorios (de visual-analysis.md — NO deben existir)
1. Inter como tipografía · 2. Gradientes saturados de fondo · 3. Sombras pesadas (Material elevation) · 4. Pills de colores estridentes · 5. Emojis decorativos · 6. Border radius >20px · 7. Inputs con bordes pronunciados / píldoras ultra-redondeadas · 8. Botones con sombras internas o gradientes · 9. Fondo principal saturado · 10. Power-user features (command palette, atajos globales, búsqueda global) · 11. Tablas >5 columnas · 12. Múltiples filtros visibles a la vez · 13. Drawers laterales como contenido principal · 14. Modales >50% de pantalla · 15. Pantallas que mezclan lista+detalle+formulario+panel · 16. Tabs que reemplazan navegación entre objetos · 17. Múltiples acciones primarias por pantalla · 18. Iconos sin label en navegación principal · 19. Infinite scroll en listas operativas · 20. Scroll infinito en la ficha (usar tabs) · 21. **Cualquier rótulo/elemento que revele demo/mock**.

### Reglas estructurales duras (aplican a TODAS las pantallas)
- **Una sola acción primaria por pantalla** (máx una secundaria visible) — BVC-010.
- **Tablas ≤5 columnas de contenido** — BVC-009. (Lista de turnos del día y facturas: ≤4.)
- **Un solo filtro principal visible**; el resto en panel desplegable "Filtros" — BVC-011.
- **Modales SOLO para confirmaciones cortas**, nunca >50% de pantalla, máx 3 campos — BVC-012.
- **Drawers PROHIBIDOS como contenido principal**; el drawer de **navegación mobile** SÍ se permite — BVC-023.
- **Tabs SOLO para dimensiones del mismo objeto** (los 6 tabs de la ficha = el mismo paciente). Tab inactivo **NO en DOM** — BVC-013.
- **Paginación** (offset, 10-15 filas, default 12), NUNCA infinite scroll — BVC-026 / GAP-T04.
- **CERO rastro de demo/mock** en todo el copy y la UI (header, footer, login, toasts, notificaciones, vacíos, Configuración) — BVC-027 / REQ-272. La acción de reset se llama "Restablecer datos" / "Restaurar configuración inicial", vive SOLO en Configuración.
- **Español rioplatense neutro**, profesional pero cercano ("ficha del paciente", no "expediente") — NFR-034.

### Decisiones de diseño holísticas a respetar (firma del producto)
- El **paciente como sujeto, no como fila**: la ficha es un expediente cuidado, no un CRM. Asimetría intencional en el header (foto + nombre pesando a la izquierda, panel de datos liviano a la derecha); el impacto viene del aire y la escala del nombre, no de adornos.
- **Azul como calma higiénica**: `#c5d8e8` como lavado de fondo sutil en zonas seleccionadas/activas y banner de ficha (degradé azul-cielo→blanco MUY tenue, NUNCA saturado/aurora); `#6da8d4` con parsimonia (barras, item activo, una acción primaria).
- **Motion propositiva**: un momento de carga orquestado con **stagger** por pantalla (skeletons que se revelan con delay incremental por fila + cards con fade+rise mínimo), hover sutil en todo lo clickeable, todo ≤250ms.

---

## Asignación: Visual System Designer → `output/design/design-tokens.md`

### Criterios asignados
- **DEMO-019** (Design system aplicado): tokens CSS — paleta azul 4 tonos, Red Hat 400/500, spacing múltiplos de 4, radius 10-14px, borde O sombra, Phosphor 16/20/24.
- **BVC de computed-style** (define el valor EXACTO de cada token): BVC-001 (Red Hat, pesos 400/500), BVC-002 (1 familia azul, máx 4 tonos), BVC-003 (fondo #fff–#fafafa, texto ~#2a2a35), BVC-004 (radius 10-14px), BVC-005 (borde O sombra, 1px/4px/0.04), BVC-006 (spacing 4× y padding de card), BVC-014 (Phosphor regular 1.5px, 16/20/24), BVC-017 (inputs/botones 40px, touch ≥44px), BVC-021 (transitions 150-250ms), BVC-022 (line-heights + máx 3 tamaños).
- **REQ asociados** (capa visual): REQ-256/NFR-020 (contraste WCAG AA), REQ-255/NFR-021 (focus ring), REQ-019 (estado activo/seleccionado), GAP-T05 (confirmar Phosphor — confirmado), GAP-A04 (contraste azul medio).

### Instrucciones específicas
- **Paleta (🔒, EXACTA)**: define los 4 tonos azules como tokens (`--color-accent-soft: #c5d8e8`, `--color-accent: #6da8d4`, + un **azul más profundo derivado** para texto/íconos sobre claro y para superficies con texto blanco, + un **azul casi-blanco** para fondos tintados/estado seleccionado). Fondo `#ffffff`/`#fafafa`, texto principal `~#2a2a35`, secundario `~#707080`, borde `#e8e8ee`. Semánticos pastel (éxito/error/warning/info) con su versión oscura para texto sobre el pastel. **NO introduzcas un 5º hue.**
- **GAP DE CONTRASTE CRÍTICO (GAP-A04 / nota de contraste)**: el azul medio `#6da8d4` es claro — texto blanco sobre él NO pasa AA (~2.3:1). **Decisión obligatoria**: en CTAs/pills sólidos usar **texto oscuro `~#2a2a35`** sobre el azul medio, **o** definir un token de **azul más profundo derivado** (dentro de la familia) para cualquier superficie que lleve texto blanco. Reserva `#6da8d4` preferentemente para barras de progreso / fondos / item activo. Documenta el ratio de cada combinación texto-sobre-fondo.
- **Tipografía (🔒)**: Red Hat Display (títulos) / Red Hat Text (cuerpo), self-hosted. SOLO 400/500. Define una **escala de máx 3 tamaños** coherente con "3 tamaños por pantalla": un display (H1 de pantalla / nombre de paciente), un subtítulo/sección, un cuerpo (captions y labels comparten el tamaño de cuerpo con color secundario). Letter-spacing levemente negativo en Display, line-height títulos ~1.2 / cuerpo 1.5-1.7. **El "número grande de progreso" de Task Dasher se traduce a número grande en peso 500 + azul medio** (NO bold). La jerarquía se construye con tamaño + color + aire.
- **Spacing/sizing (🔒)**: escala 4/8/12/16/24/32/48/64. Tokens de padding de card (24-32), gap entre cards (16-20), gap entre secciones (32-48), radius (10-14), altura input/botón (40), touch target (44), opacidad disabled (40%).
- **Sombra/borde (🔒)**: un token de sombra (offset 1px / blur 4px / op 0.04) y un token de borde (`#e8e8ee` 0.5-1px). Regla "borde O sombra, no ambos" documentada como convención.
- **Iconografía (🔒)**: Phosphor regular, stroke 1.5px, tamaños 16 (inline) / 20 (botones/filas) / 24 (acciones primarias). Íconos heredan color del texto; íconos de estado toman color semántico.
- **Estados visuales** (definir como tokens/recetas reutilizables): hover (tinte/elevación sutil ≤250ms), focus ring visible (token de color + grosor; NUNCA `outline:none` sin reemplazo), active/pressed, disabled (op 40%), **seleccionado/activo** (fondo azul-cielo tintado / azul casi-blanco con esquinas redondeadas — consistente en nav, filas, tabs).
- **Transiciones (🔒)**: token de duración 150-250ms + easing suave, para hover y micro-interacciones.
- **Override de Bootstrap**: documenta qué defaults de Bootstrap 5 deben sobrescribirse porque violan anti-patrones (radius >14px → #6, sombras Material → #3, tipografía por defecto → #1, inputs/botones a 40px). Bootstrap aporta solo grid + utilidades de layout; la estética la pone esta capa de tokens.
- **Anti-patrones de tu dominio a evitar explícitamente**: #1 Inter, #2 gradientes saturados, #3 sombras pesadas, #6 radius >20px, #7 inputs con borde pronunciado/píldora, #8 botones con sombra interna/gradiente, #9 fondo saturado, #5 emojis.

---

## Asignación: UX Flow Designer → `output/design/ux-flows.md`

### Criterios asignados
- **DEMO-001/002/003/004** (Shell: sidebar, header, footer, routing multi-pantalla) — layout de navegación.
- **DEMO-007** (Agenda calendario layout), **DEMO-008** (lista pacientes layout), **DEMO-009** (ficha cabecera + barra de 6 tabs — layout y deep-linking de tab), **DEMO-011** (layout de los 6 tabs), **DEMO-012/013/014** (layout de Tratamientos / Facturación / Reportes-dashboard), **DEMO-015/016** (layout de los 2 flujos multi-paso), **DEMO-017** (estados vacíos y skeletons — comportamiento por pantalla), **DEMO-018** (pantallas shell del resto), **DEMO-020** (responsive desktop/mobile + sidebar→drawer), **DEMO-021** (cero rastro de demo — content strategy).
- **BVC visuales de navegación/estructura**: BVC-007 (sidebar 5 items + Config/Ayuda), BVC-008 (header sin búsqueda global), BVC-010 (1 acción primaria/pantalla), BVC-011 (1 filtro visible), BVC-012/023 (sin drawers contenido / sin modales >50%), BVC-024 (sin power-user), BVC-025 (sin íconos sin label), BVC-026 (sin infinite scroll / sin scroll infinito en ficha), BVC-027 (cero demo), BVC-028 (aire comunica orden).
- **REQ por módulo** (layouts de pantalla + estados + responsive): Épica 1 (REQ-001..031), Agenda Épica 3 (REQ-059..097), Pacientes lista/ficha/tabs Épicas 4-5 (REQ-098..172), sub-pantallas Épica 6 (REQ-173..191), Tratamientos Épica 7 (REQ-192..205), Facturación Épica 8 (REQ-206..231, REQ-271), Reportes Épica 9 (REQ-232..246), Calidad transversal Épica 10 (REQ-247..258, REQ-272), Épica 11 (REQ-259..270, registrar pago + odontograma editable + reset). NFR-034 (idioma rioplatense neutro).

### Pantallas asignadas (CADA una con su layout + estados + responsive; ~40 rutas — multi-pantalla estricto)
**Shell / global**
- Login (botón "Ingresar como administradora" + link "Saltar login"; card centrada sobre `#fafafa`; opción split imagen sobria | form; inputs sutiles; sin aurora) — REQ-001..007.
- App shell: header persistente (logo isotipo+wordmark, nombre del módulo activo, notificaciones con badge, avatar "AD"; search **contextual** NO global; SIN carrito, SIN badge demo) + sidebar (5 items: Agenda·Pacientes·Tratamientos·Facturación·Reportes + separador + Configuración·Ayuda; item activo en píldora; badge de conteo en notificaciones) + footer discreto + `<router-outlet>` — REQ-008..028.
- Estados shell: módulo activo sincronizado con ruta; deep-link renderiza la pantalla; botón atrás funciona; ruta inexistente → "no encontrado" sin crashear — REQ-029..031, REQ-126.

**Agenda** (Épica 3)
- Calendario (vista mensual default + toggles semana/día; turnos como bloques coloreados por estado; header: título + 1 filtro por profesional + "Nuevo turno"; filtros secundarios en panel "Filtros") — estados: vacío por período, skeletons al cargar — REQ-059..069.
- Detalle de turno (datos + 1 acción primaria "avanzar estado"; secundarias reagendar/cancelar en menú compacto; estado terminal deshabilita la primaria) — REQ-070..077.
- Crear turno — **flujo 3 pasos, una ruta por paso** (Paso 1 Paciente · Paso 2 Profesional+fecha con disponibilidad real · Paso 3 Tratamiento+confirmación); stepper de progreso; Atrás preserva datos; Cancelar con confirmación; validación inline por paso — REQ-078..087.
- Reagendar turno (turno actual arriba + calendario abajo; notificación WhatsApp presentada como real) — REQ-088..091.
- Lista de turnos del día (**≤4 columnas**: paciente·profesional·hora·estado; ordenada por hora; fila clickeable; vacío con guidance) — REQ-092..097.

**Pacientes — lista y ficha (PIEZA FUERTE)** (Épicas 4-5)
- Lista de pacientes (**tabla ≤5 col**: foto·nombre·obra social·próximo turno·estado de cuenta; buscador inline contextual; paginación con total; 1 filtro visible + panel "Filtros"; opción toggle Card/Table del Patrón 12) — estados: sin resultados con guidance, skeletons de fila — REQ-098..108.
- **Cabecera de ficha** (banner azul sobrio NO aurora; foto grande izq; nombre grande arriba; datos al lado: edad·obra social·profesional; **badges de alerta** solo si aplican: alergias/medicación/observaciones críticas; **1 acción primaria "Agendar turno"**; secundarias editar/eliminar en menú compacto) — REQ-109..115.
- **Barra de 6 tabs** (Información general · Odontograma · Historial clínico · Tratamientos · Documentos · Pagos; solo uno activo; **tab inactivo NO en DOM**; tab activo reflejado en URL; sin scroll infinito) — REQ-116..127. La cabecera permanece estable al cambiar de tab.
- Layout de cada tab: Tab 1 Info (cards aireadas, placeholders para campos vacíos), Tab 2 Odontograma (diagrama 32 piezas + leyenda; clic en pieza → ruta de detalle), Tab 3 Historial (timeline cronológico; clic → detalle de evento), Tab 4 Tratamientos (activos / completados; % grande + "Progreso"; clic → detalle de plan), Tab 5 Documentos (galería en grilla; clic → vista expandida), Tab 6 Pagos (resumen arriba + lista de movimientos; acción primaria "Registrar pago") — REQ-128..168. Estados vacíos con guidance en cada tab que puede quedar vacío.

**Pacientes — sub-pantallas (rutas dedicadas)** (Épica 6 + Épica 11)
- Crear paciente — **flujo 2 pasos** (Paso 1 datos personales+contacto · Paso 2 datos clínicos+foto opcional); stepper; Atrás preserva; Cancelar con confirmación; validación inline (DNI) — REQ-173..181.
- Editar paciente (form precargado en ruta dedicada) — REQ-182..185.
- Detalle de pieza dental (número+nombre+estado+control de cambio de estado **editable**+historial de procedimientos; volver al odontograma) — REQ-186..188, REQ-267..270.
- Detalle de evento clínico (F) y detalle de plan de tratamiento (G) — REQ-189..191.
- **Registrar pago** (ruta dedicada NO modal gigante; monto ARS+fecha+concepto/medio; valida monto positivo; al confirmar actualiza saldo y badge en lista; Cancelar con confirmación) — REQ-259..263.

**Tratamientos** (Épica 7)
- Lista de activos (**tabla ≤5 col**: paciente·tratamiento·profesional·etapas X/Y·próxima fecha; 1 filtro por profesional) — REQ-192..197.
- Catálogo de tipos (cards aireadas, ≥12 tipos; clic → detalle de tipo) — REQ-198..201.
- Detalle de tipo (pasos·materiales·costo ARS·duración·profesionales habilitados; volver al catálogo) — REQ-202..205.

**Facturación** (Épica 8 — mock interno SIN ARCA/AFIP, presentado como real)
- Presupuestos: lista (tabla 4-5 col: paciente·fecha·monto·estado + badge), detalle (1 acción primaria según estado: "Aprobar" si pendiente), crear **flujo 3 pasos** (paciente·tratamientos con costo total·revisión) — REQ-206..220, REQ-271 (mobile).
- Facturas: lista (**≤4 col**: paciente·número·monto·estado), detalle (ítems+totales+estado; NUNCA menciona ARCA/AFIP) — REQ-221..226.
- Obras sociales: lista en **cards aireadas** (logo+nombre+pacientes activos+deuda), detalle (info+pacientes asociados+liquidaciones; navegar a ficha de paciente) — REQ-227..231.

**Reportes** (Épica 9)
- Dashboard (grilla aireada de **≤6 KPI cards** clickeables: pacientes nuevos·turnos atendidos·tratamientos completados·ingresos facturados·cobrado·deuda; valores calculados del estado) — REQ-232..236.
- 4 reportes (pacientes / tratamientos / financiero / productividad) con **gráficos en cards aireadas separadas**; montos ARS; skeletons al cargar; vacío con guidance por gráfico — REQ-237..246.

**Configuración** (Épica 11)
- Configuración con acción **"Restablecer datos"** (copy de producción, confirmación que advierte pérdida; **botón "Resetear demo" NO existe**, sin lenguaje de demo) — REQ-264..266.

### Instrucciones específicas
- **Navegación / user journeys**: documenta los journeys prioritarios de cada uno de los 5 módulos (ej. ver agenda → abrir turno → avanzar estado; lista pacientes → ficha → tab Pagos → registrar pago → saldo actualizado; crear turno 3 pasos end-to-end). Cada journey debe ser **multi-pantalla** con rutas reflejadas en URL y botón atrás funcional.
- **Sidebar y patrón de navegación**: replica el sidebar de Task Dasher (columna fija ~230-250px, logo arriba, item activo en píldora — adaptar radius a 10-14px y fondo a azul cielo tintado). Orden exacto: Agenda·Pacientes·Tratamientos·Facturación·Reportes, separador, Configuración·Ayuda. Badge de conteo azul en notificaciones. **NUNCA íconos sin label.** En mobile → drawer overlay por hamburguesa (permitido para nav).
- **Dashboard layout (Reportes)**: grilla aireada de KPI cards; el **anillo/gauge de progreso** de Task Dasher es ideal para los KPIs (% grande centrado + "Progreso" + marcadores 0/100). Gráficos simples en cards aireadas separadas (Apple Health-like). Máx 6 KPIs.
- **Estados de UI por pantalla** (define el comportamiento visual de cada uno): **vacío** (empty states sobrios persona-céntricos: ilustración/ícono Phosphor liviano + texto secundario + 1 acción primaria; copy con guidance, ej. "No hay turnos en este período. Creá uno con Nuevo turno"; SIN copy que delate mock), **carga** (skeletons que imitan la forma del contenido + stagger por fila; NUNCA spinners), **error** (toast coral pastel + reintento; ruta inexistente → "no encontrado"; localStorage no disponible → degrada con aviso sin crashear), **éxito** (toast tras cada acción), **muchos datos** (paginación con contador "1–N", no infinite scroll; tablas ≤5 col).
- **Responsive (transversal — TODOS los flujos usables en mobile, REQ-252)**: define los 3 breakpoints (mobile/tablet/desktop). Patrón maestro: 3 columnas (desktop) → 1 columna (mobile). El avatar de la ficha se recentra solapando el banner; la tabla se transforma a layout vertical "ficha" (label izq / valor der por fila); el sidebar → drawer overlay; la barra de 6 tabs hace scroll horizontal o se adapta; los flujos multi-paso van en una columna. Touch target ≥44px en TODO control mobile (incl. registrar pago y selector de estado de pieza). Sin scroll horizontal no intencional.
- **Content strategy (CRÍTICA — REQ-272/BVC-027 + NFR-034)**: TODO el copy en **español rioplatense neutro**, profesional pero cercano ("ficha del paciente", "turno", "obra social", "presupuesto"; NUNCA "expediente"). Barrido anti-demo de punta a punta: header, footer, login, toasts, notificaciones, empty states, tooltips, Configuración — **CERO** apariciones de demo/mock/simulación/simulado/de prueba/ejemplo/ficticio/viewcase ni atribución a Link Design. La notificación de WhatsApp al reagendar se presenta como real ("Se notificó al paciente por WhatsApp"). Reset = "Restablecer datos" solo en Configuración. Facturas/presupuestos jamás mencionan ARCA/AFIP/integración fiscal.
- **Aire con propósito (BVC-028)**: pantallas con poco contenido se ven espaciosas, no rellenadas artificialmente. El espacio comunica orden.

---

## Asignación: Component Designer → `output/design/components.md`

### Criterios asignados
- **DEMO-009/010/011** (ficha: cabecera + barra de tabs + odontograma 32 piezas + contenido de tabs — aspecto visual de cada componente).
- **DEMO-012/013** (cards de tratamiento / obra social), **DEMO-016** (formulario registrar pago), **DEMO-017** (empty-state + skeleton como componentes), **DEMO-019** (componentes que materializan el design system).
- **BVC visuales de componentes**: BVC-009 (data-table ≤5 col), BVC-013 (tabs, contenido inactivo fuera del DOM), BVC-015 (hover/focus/disabled en todo lo clickeable), BVC-016 (skeletons + toasts), BVC-018 (sin pills estridentes/emojis — badges pastel), BVC-019 (cards paciente/tratamiento/obra social replican Task Dasher: foto circular, % grande, badges suaves, avatares overlapping), BVC-020 (ficha compatible con Profile de Task Dasher).
- **REQ de componentes**: badges de estado/pago/prioridad (REQ-096/104/210), avatar/avatar-stack (REQ-109, P5), data-table (REQ-093/098/192/206/221/224 — límites de columna), stepper (REQ-087/181), progress-card (REQ-150/196), empty-state (REQ-066/105/145/250), skeleton (REQ-067/106/251), toast (REQ-074/083/248), confirm-dialog (REQ-075/114/247/265), filter-panel (REQ-063/101/193), photo con fallback a iniciales (REQ-046/179), odontograma 32 piezas (REQ-132..140), formularios multi-paso (REQ-078/173/216), tabs (REQ-116..122), accesibilidad (REQ-255/256, NFR-021..023).

### Componentes identificados (catálogo `shared/` del architecture + componentes de dominio)
**Chasis / navegación**
- `sidebar` (5 items + Config/Ayuda; item activo en píldora azul-cielo; badge de conteo; drawer en mobile; íconos Phosphor + label SIEMPRE).
- `header` (logo isotipo+wordmark; nombre de módulo; search-pill contextual radius 10-14; notificaciones con badge/dot; avatar "AD"; SIN carrito, SIN demo).
- `footer` (discreto: versión + metadatos; sin atribución, sin reset).

**Datos / estado**
- `status-badge` (pill pastel: **fondo pastel del hue + texto/ícono en versión oscura del mismo hue** — NUNCA texto blanco sobre pastel claro, NUNCA estridente). Mapeos: turno (Confirmado verde·Atendiendo azul info·Terminado gris·Cancelado coral), tratamiento (En curso azul·Atrasado warning·En pausa gris·Completado verde), pago (Al día verde·Con deuda warning·Vencido coral).
- `priority-pill` (High/Mid/Low en versión **pastel** — atenuar los pills sólidos saturados de Task Dasher). Máx un badge de estado + uno de prioridad por registro.
- `avatar` + `avatar-stack` (circular; stack overlapping ~28-32px con borde blanco 2px, solapados ~40%, círculo "+N" con texto oscuro o azul más profundo). Uso: profesionales asignados a un tratamiento, pacientes de un día en Agenda.
- `photo` (foto de paciente con **fallback determinista a iniciales** en círculo pastel; NUNCA imagen rota; placeholder controlado si un thumbnail no carga).
- `relative-time` (timestamp relativo en español: "hace 30 min", "hace 1 h", "hace 5 días"; gris secundario; alineado a la derecha en filas; baja a 2ª línea en mobile).

**Cards (replican Task Dasher — BVC-019)**
- Card de **paciente** (foto circular grande + nombre peso 500 + subtítulo edad·obra social + icon-chips azules teléfono/próxima cita + badge de estado + footer "Ver ficha" + acciones inline editar). Persona-céntrica.
- Card de **tratamiento** / `progress-card` (% grande peso 500 + azul medio + label "Progreso" + barra de progreso relleno `#6da8d4` track `#c5d8e8`/`#e8e8ee` + nombre + menú ⋯). Semánticos solo si la barra representa estado, no decoración.
- Card de **obra social** (FUSIÓN: logo-en-círculo de borde sutil + nombre + mini-stats con icon-chips azules: pacientes activos·deuda·último pago + avatares overlapping de pacientes/profesionales).
- `kpi-card` (% grande / anillo-gauge + label + "Progreso" + 0/100; clickeable; para dashboard de Reportes).

**Tablas / listas**
- `data-table` (**≤5 columnas estricto**; header gris uppercase con tracking; filas ~48px; dividers `#e8e8ee` 1px; avatar pequeño en celda visual; acciones edit/eliminar a la derecha en gris; contador de rango "1–N"; paginación offset; skeletons al cargar — NO infinite scroll). Variante de turnos del día ≤4 col.
- `empty-state` (ilustración/ícono Phosphor liviano + texto secundario con guidance + 1 acción primaria; sobrio, persona-céntrico, sin copy de demo).
- `skeleton` (imita forma del contenido: avatar circular + líneas; stagger por fila; NUNCA spinner).

**Feedback / overlays**
- `toast` (éxito tras acción; entrada animada ease-in suave; coral pastel para error + reintento).
- `confirm-dialog` (modal **<50%**, máx 3 campos; SOLO confirmaciones cortas; para eliminar/cancelar/reset).
- `filter-panel` (1 filtro principal visible + panel desplegable "Filtros" para el resto).

**Formularios / flujos**
- Inputs/selects/textarea (altura **40px**, radius 10-14, borde tenue `#e8e8ee` — NO píldoras, NO bordes pronunciados; estados hover/focus-ring/disabled; validación inline con error junto al campo).
- `stepper` (indicador de progreso para flujos multi-paso: 3 pasos turno/presupuesto, 2 pasos paciente; muestra paso actual de N).
- Botones (primario azul medio con texto oscuro o azul profundo; secundario; altura 40px; hover ≤250ms; disabled op 40%; **una sola acción primaria por pantalla**; sin sombras internas/gradientes).

**Tabs / ficha**
- `tabs` (barra horizontal de 6 tabs; tab activo destacado con fondo azul-cielo tintado; **contenido inactivo NO renderizado en el DOM**; rol semántico tablist/tab; navegable por teclado con focus visible; scroll horizontal en mobile; touch target ≥44px).
- Cabecera de ficha (banner azul sobrio + foto grande circular borde blanco + nombre grande + panel de datos con icon-chips + badges de alerta + 1 acción primaria) — **compatible con Profile de Task Dasher (BVC-020)**.
- Bloque tipo "evento/sección" reutilizable (ícono/logo + título + fecha a la derecha + descripción) para Historial / Tratamientos / eventos clínicos.

**Componente de dominio (propio — sin análogo en Task Dasher)**
- `odontogram` (32 piezas SVG interactivo; superior/inferior distinguidas; numeración **FDI 11-48** primaria + universal 1-32 en tooltip; estado por pieza con **color/chip pastel del sistema semántico**: sana·caries·obturación·ausente·en-tratamiento·prótesis + **leyenda/clave**; piezas con hover, focus visible, touch target adecuado, label/aria por pieza; clic en pieza → ruta de detalle; editable; sin lag con 32 piezas; usable en mobile sin scroll horizontal que rompa layout). Mantener dentro del lenguaje: superficies blancas, líneas tenues `#e8e8ee`, sin saturación.

### Instrucciones específicas
- **Patrones de componentes de la referencia**: aplica las traducciones de Task Dasher de los Patrones 1-13 del visual-analysis (sidebar item activo, cards de progreso con % grande, cards de persona con foto, overlapping avatars +N, status soft-badges + priority pills → badges pastel, "last updated" relativo, tabla ≤5 col estilo Task Dasher pero recortada, cards de company → obra social fusionada, header de ficha → cabecera de paciente). **Adaptaciones obligatorias**: radius a 10-14px (Task Dasher usa 16-20px), inputs sutiles 40px (NO píldoras de 24-26px), badges pastel (NO sólidos saturados), texto oscuro sobre azul medio, números de progreso en peso 500 (NO bold).
- **Estados por componente (BVC-015)**: documenta hover / focus / active / disabled para CADA componente clickeable (cards, filas, items de lista, botones, pills, icon-buttons, tabs, piezas del odontograma). Hover visible ≤250ms; focus ring visible (a11y teclado); disabled op 40%.
- **Accesibilidad (REQ-255/256, NFR-021..023)**: focus ring visible en todo interactivo; contraste WCAG AA (coordina con el Visual System Designer la decisión texto-oscuro-sobre-azul-medio); roles semánticos (tablist/tab para tabs; label/aria para piezas del odontograma e icon-buttons); touch target ≥44px en mobile; **ningún ícono sin label** en navegación.
- **Responsive por componente**: define cómo se adapta cada componente (sidebar→drawer; data-table→layout vertical ficha; cards en grid→1 columna; barra de tabs→scroll horizontal; avatar de ficha→recentrado; formularios→1 columna; odontograma→legible sin romper layout). Touch targets ≥44px.
- **Skeletons + stagger (motion holística)**: define el skeleton de cada lista/card (avatar circular + líneas) y el comportamiento de stagger (delay incremental por fila/card, fade+rise mínimo, ≤250ms).
- **Anti-patrones a evitar**: #4 pills estridentes (→ pastel), #5 emojis decorativos, #7 inputs píldora/borde pronunciado, #8 botones con sombra interna/gradiente, #11 tablas >5 col, #14 modales >50%, #18 íconos sin label.

---

## Gaps de Requirements Descubiertos

Ninguno bloqueante. Notas de coordinación (no requieren al cliente; ya resueltas en architecture/visual-analysis):

- **Discrepancia de conteo de BVC**: el prompt del PM menciona "30 BVC", pero `visual-analysis.md` (fuente real) define **29 BVC (BVC-001 a BVC-029)**. Uso 29 — la fuente de verdad es el documento. Lo señalo para que el PM lo verifique al consolidar.
- **GAP-A04 (contraste azul medio)**: trasladado al Visual System Designer como decisión obligatoria (texto oscuro sobre `#6da8d4` o azul más profundo derivado para superficies con texto blanco). Es gap de diseño, no de requirements. Afecta CTAs, pills, círculo "+N" y badges de conteo.
- **Toggle Card/Table en lista de pacientes**: el Patrón 12 de Task Dasher ofrece doble vista; los requirements (REQ-098) prescriben tabla ≤5 col. El ux-flow-designer puede proponer el toggle como mejora persona-céntrica (Card View = cards de paciente), manteniendo la Table View como vista primaria que cumple el límite de 5 columnas. No es obligatorio por requirements; queda a criterio del sub-designer dentro del lenguaje.
- **Odontograma sin referencia visual**: componente de dominio propio (sin análogo en Task Dasher). El Component Designer lo diseña dentro del lenguaje prescriptivo (superficies blancas, líneas tenues, estados como chips/colores pastel semánticos, numeración FDI). Es el diferencial técnico del viewcase; cuidar que sea editable y mobile-usable.
- **CRM tracking deliberadamente omitido** (GAP-A01): no existe DEMO de analytics/tracking. Ningún componente ni pantalla de tracking. QA verifica AUSENCIA. No genera trabajo de diseño.

---

## Resumen de Cobertura (verificación antes del retorno)

- **21 DEMO-xxx** distribuidos: shell/routing/login (ux-flow) · design system (visual-system) · ficha/cards/odontograma/componentes (component) · estados vacíos/skeletons (ux-flow comportamiento + component aspecto) · responsive (ux-flow estrategia + component por-componente) · cero-demo (ux-flow content strategy + revisado por todos).
- **29 BVC** distribuidos: computed-style → visual-system · navegación/estructura/negativos → ux-flow · componentes/cards/tabs/feedback → component. Cada BVC tiene un dueño claro.
- **~40 pantallas** asignadas al ux-flow-designer con layout + estados (vacío/carga/error/éxito/muchos datos) + responsive (mobile/tablet/desktop).
- **Componentes shared + dominio** asignados al component-designer con aspecto visual + estados + responsive + a11y.
- **Patrones premium Task Dasher** aplicados con sus adaptaciones documentadas (azul suave, badges pastel, banner sobrio, radius 10-14, inputs sutiles, jerarquía sin grosor, tablas ≤5 col).
- **Nivel PREMIUM**: persona-céntrico, aire con propósito, motion propositiva con stagger, ficha como pantalla-firma — explícitamente por encima de "template Bootstrap default".
