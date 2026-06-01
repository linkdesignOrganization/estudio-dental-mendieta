# Brief Criteria — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Brief Analyst
**Fecha**: 2026-06-01
**Briefs procesados**: 1 (`clinica-dental-design-brief.md`)

> **Decisiones confirmadas (Fase 2 del cliente)** — el brief dejaba 2 gaps abiertos; el cliente ya eligió:
> - **Familia de color: AZUL cielo / azul medio** (las otras opciones quedan descartadas).
> - **Tipografía: Red Hat** (Display para títulos, Text para cuerpo).
> - **Logo: isotipo + wordmark.**
> - **NINGUNA parte de la UI debe revelar que es demo/mock** — todo se presenta como producción real. Esto ANULA el badge "Demo interactivo" del brief (§Header) y obliga a omitir cualquier rótulo "demo", botón "Resetear demo" visible, o lenguaje que delate el mock.

---

## URLs de Referencia Obligatorias

| # | URL | Propósito | Qué observar |
|---|-----|-----------|--------------|
| 1 | https://task-dasher.webflow.io/ | Referencia PRINCIPAL — estándar premium del viewcase. Recorrer TODAS las páginas. | Cards, avatares circulares/overlapping "+N", jerarquía tipográfica, aire, badges de status/prioridad/progreso, sidebar limpio |
| 1a | task-dasher → All Tasks (home) | Base de dashboard + cards tratamiento/paciente | % grande + "Progress" + barra, lista de tasks con avatares |
| 1b | task-dasher → Profile (LA MÁS IMPORTANTE) | Base directa de ficha del paciente | Foto grande izq, nombre grande arriba, datos al lado, badges alerta, 1 acción primaria, tabs debajo |
| 1c | task-dasher → Contacts | Base de lista de pacientes | Lista con foto, nombre, datos clave, status, acciones inline |
| 1d | task-dasher → Company | Base de obras sociales | Cards con logo, ubicación/métricas, status, prioridad, milestones (5 de 8), avatares overlapping |
| 1e | task-dasher → Sign In | Base de Login | Estética simple, formulario centrado |
| 1f | task-dasher → Notifications | Base de notificaciones internas | Turno por confirmar, pago vencido, cumpleaños, tratamiento por vencer |
| 1g | task-dasher → Style Guide / Utility | Documentar design tokens | Tipografía, colores, componentes |
| 1h | task-dasher → Messages, Timeline | Complementarias | Patrones de listas, timelines, badges adicionales |

**Apoyo secundario (consultar solo si Task Dasher no cubre un caso):** Cal.com, Pitch, Tally.so, Framer (app), Apple Health (cards aireadas, paleta suave, gráficos simples). **Linear: SOLO calidad tipográfica/micro-interacciones — NO copiar su layout denso.**

---

## Paleta de Colores Prescrita

| Token/Nombre | Hex | Uso/Contexto | Brief |
|--------------|-----|--------------|-------|
| Acento suave (azul cielo) | #c5d8e8 | Acento atenuado, fondos de pill suaves, hover sutil | clinica-dental |
| Acento saturado (azul medio) | #6da8d4 | Acento primario, barras de progreso, item activo | clinica-dental |
| Fondo principal | #ffffff – #fafafa | Fondo de la app (NUNCA saturado) | clinica-dental |
| Texto principal | ~#2a2a35 | Texto general (gris oscuro cálido, NUNCA negro puro) | clinica-dental |
| Texto secundario | ~#707080 | Subtítulos, captions | clinica-dental |
| Borde / Separador | #e8e8ee | Bordes de cards (0.5-1px, tenue) | clinica-dental |
| Éxito | verde pastel suave | Toasts/estados de éxito | clinica-dental |
| Error | coral pastel suave | Errores | clinica-dental |
| Warning | amarillo pastel suave | Advertencias | clinica-dental |
| Info | azul pastel suave | Informativos | clinica-dental |

**Regla:** máximo 4 tonos coherentes dentro de la familia azul. Semánticos siempre pastel.

---

## Tipografía Prescrita

| Nivel | Tamaño | Peso | Uso | Brief |
|-------|--------|------|-----|-------|
| Títulos/Display | (máx 3 tamaños/pantalla) | 400 / 500 | Red Hat Display; letter-spacing levemente negativo; line-height 1.2 | clinica-dental |
| Cuerpo/Text | (máx 3 tamaños/pantalla) | 400 / 500 | Red Hat Text; line-height 1.5–1.7 | clinica-dental |

**Reglas:** font family = **Red Hat** (NO Inter). Solo pesos 400 (regular) y 500 (medio) — nunca bold extremo ni light. Máx 3 tamaños de texto por pantalla.

---

## Spacing Prescrito

| Contexto | Valor | Notas | Brief |
|----------|-------|-------|-------|
| Escala base | 4, 8, 12, 16, 24, 32, 48, 64 px | Todo en múltiplos de 4 | clinica-dental |
| Padding interno de cards | 24–32px | — | clinica-dental |
| Separación entre cards (listas) | 16–20px | — | clinica-dental |
| Separación entre secciones | 32–48px | — | clinica-dental |
| Radius de cards | 10–14px | >20px PROHIBIDO | clinica-dental |
| Borde de cards/inputs | 0.5–1px, #e8e8ee | Sutil | clinica-dental |
| Sombra (opcional) | offset 1px, blur 4px, opacidad 0.04 | Un solo nivel; card vive con borde **O** sombra, no ambos | clinica-dental |
| Altura inputs y botones | 40px | Consistente | clinica-dental |
| Touch target (mobile) | ≥44px | — | clinica-dental |
| Disabled | opacidad 40% | — | clinica-dental |

**Iconografía:** un solo set (**Phosphor** o **Tabler**), versión regular (no rellena), stroke **1.5px**. Tamaños fijos: **16px** inline, **20px** botones/filas, **24px** acciones primarias. Íconos heredan color del texto contiguo (excepto íconos de estado).

---

## Animaciones/Transiciones Prescritas

| Elemento | Duración | Easing | Descripción | Brief |
|----------|----------|--------|-------------|-------|
| Transitions generales | 150–250ms | (suave) | Micro-interacciones | clinica-dental |
| Hover | 150–250ms | suave | Visible en TODO lo clickeable | clinica-dental |
| Focus rings | — | — | Visibles para navegación con teclado | clinica-dental |
| Toasts | suave | ease-in | Animación de entrada tras acción exitosa | clinica-dental |
| Carga de listas | — | — | Skeletons (NO spinners) | clinica-dental |

---

## Patrones de Referencia a Replicar

| # | Patrón | URL fuente | Adaptación | Brief |
|---|--------|-----------|------------|-------|
| 1 | Sidebar de navegación | task-dasher | 5 items (Agenda, Pacientes, Tratamientos, Facturación, Reportes) + footer (Configuración, Ayuda). Icono+label SIEMPRE visible, activo con fondo sutil. Fijo, no colapsable | clinica-dental |
| 2 | Header de la app | task-dasher | Search contextual (NO global) der. + notificaciones c/badge + avatar "AD". **SIN badge "demo"** (decisión cliente) | clinica-dental |
| 3 | Cards con progreso | task-dasher All Tasks | Cards de tratamientos: % grande + "Progreso" + barra + subtítulo + menú | clinica-dental |
| 4 | Tarjetas de personas con foto | task-dasher | Cards de pacientes: foto circular, nombre, edad/obra social subtítulo, % grande = estado/saldo | clinica-dental |
| 5 | Overlapping avatars | task-dasher | Profesionales asignados a tratamiento, o pacientes con turno en un día. "+N" si hay más | clinica-dental |
| 6 | Badges de estado | task-dasher | Pills suaves: turno (Confirmado/Atendiendo/Terminado/Cancelado), tratamiento (En curso/Atrasado/En pausa/Completado), pago (Al día/Con deuda/Vencido) | clinica-dental |
| 7 | Badges de prioridad | task-dasher | Pills High/Mid/Low → urgencia del turno o nivel de atención | clinica-dental |
| 8 | "Last updated" relativo | task-dasher | "Hace 2 horas", "Hace 5 días" en turnos/tratamientos/pagos | clinica-dental |
| 9 | Tabla de tasks | task-dasher | Tablas de turnos del día / pacientes próximos. **Máx 5 columnas** | clinica-dental |
| 10 | Cards de Company con logo | task-dasher Company | Obras sociales: logo placeholder, nombre, pacientes activos, deuda, último pago, mini stats | clinica-dental |
| 11 | Página Profile | task-dasher Profile | Ficha del paciente (ver tabla de páginas) | clinica-dental |
| 12 | Página Contacts | task-dasher Contacts | Lista de pacientes | clinica-dental |
| 13 | Página Sign In | task-dasher Sign In | Login: estética simple, formulario centrado | clinica-dental |

**NO aplica de Task Dasher:** cart de e-commerce, Pricing (el catálogo de tipos de tratamiento puede inspirarse visualmente en los planes, nada más).

---

## Especificaciones por Página

| Página/Módulo | Layout / Componentes clave | Patrón ref | Brief |
|---------------|----------------------------|------------|-------|
| Agenda | Calendario (mensual/semanal/diario), detalle de turno, crear turno (3 pasos), reagendar, lista del día | Cards + tabla turnos | clinica-dental |
| Pacientes — lista | Lista con foto, nombre, datos clave, status, acciones inline | Contacts | clinica-dental |
| Pacientes — ficha (pieza fuerte) | Foto grande izq, nombre grande arriba, datos al lado, badges alerta, 1 acción primaria ("Agendar turno"), **6 tabs**: Info general, Odontograma (32 piezas), Historial, Tratamientos, Documentos, Pagos. Tab inactivo NO en DOM | Profile | clinica-dental |
| Pacientes — sub | Crear (2 pasos), editar, detalle de pieza dental, detalle de evento clínico, detalle de plan | — | clinica-dental |
| Tratamientos | Lista de activos, tipos (catálogo en cards), detalle de tipo. Cards con % grande | Cards progreso | clinica-dental |
| Facturación | Presupuestos (lista/detalle/crear 3 pasos), facturas (lista/detalle), obras sociales (cards/detalle). Mock interno SIN ARCA/AFIP | Company | clinica-dental |
| Reportes | Dashboard de KPI cards (máx 6) + reportes (pacientes/tratamientos/financiero/productividad) con gráficos en cards aireadas | Apple Health | clinica-dental |
| Login | Formulario centrado, estética simple | Sign In | clinica-dental |
| Configuración | Ajustes (botón "Resetear demo" NO visible — decisión cliente, no revelar mock) | — | clinica-dental |

**Estructurales (prioridad máxima):** multi-pantalla estricto (cada acción crea/modifica/consulta = ruta dedicada, URL refleja la vista, botón atrás funciona). Modales SOLO para confirmaciones cortas, nunca >50% pantalla, máx 3 campos. Drawers laterales PROHIBIDOS como contenido principal. Tabs SOLO para dimensiones del mismo objeto (no navegación entre objetos).

---

## Anti-patrones Mandatorios

| # | Anti-patrón | Contexto | Brief |
|---|-------------|----------|-------|
| 1 | Inter como tipografía | Tipografía (usar Red Hat) | clinica-dental |
| 2 | Gradientes saturados de fondo | Color | clinica-dental |
| 3 | Sombras pesadas (Material elevation 8) | Sombras | clinica-dental |
| 4 | Pills de colores estridentes | Badges | clinica-dental |
| 5 | Emojis decorativos en la interfaz | UI | clinica-dental |
| 6 | Border radius >20px | Cards | clinica-dental |
| 7 | Inputs con bordes pronunciados | Inputs | clinica-dental |
| 8 | Botones con sombras internas o gradientes | Botones | clinica-dental |
| 9 | Color de fondo principal saturado | Fondo | clinica-dental |
| 10 | Power-user features (command palette, atajos globales, búsqueda global compleja) | Navegación | clinica-dental |
| 11 | Tablas con más de 5 columnas | Tablas | clinica-dental |
| 12 | Múltiples filtros visibles simultáneamente | Listas | clinica-dental |
| 13 | Drawers laterales como contenido principal | Layout | clinica-dental |
| 14 | Modales mayores al 50% de pantalla | Modales | clinica-dental |
| 15 | Pantallas que mezclan lista + detalle + formulario + panel | Layout | clinica-dental |
| 16 | Tabs que reemplazan navegación entre objetos | Tabs | clinica-dental |
| 17 | Múltiples acciones primarias por pantalla | Acciones | clinica-dental |
| 18 | Iconos sin label en navegación principal | Sidebar | clinica-dental |
| 19 | Infinite scroll en listas operativas | Listas | clinica-dental |
| 20 | Scroll infinito en ficha del paciente (debe usar tabs) | Ficha | clinica-dental |
| 21 | Cualquier rótulo/elemento que revele que es demo/mock | UI global (decisión cliente Fase 2) | clinica-dental |

---

## Principios de Diseño

| # | Principio | Brief |
|---|-----------|-------|
| 1 | Compatibilidad con Task Dasher — pantalla muy distinta en aire/tipografía/cards/paleta se rehace | clinica-dental |
| 2 | Cada acción, su pantalla — navegación entre objetos, nunca drawers ni modales gigantes | clinica-dental |
| 3 | Aire con propósito — el espacio comunica orden, no llenar pantallas artificialmente | clinica-dental |
| 4 | Persona-céntrico — fotos de pacientes humanizan; avatares circulares, foto grande en ficha | clinica-dental |
| 5 | Calma profesional — una familia de color (azul), máx 4 tonos, neutros cálidos, semánticos pastel | clinica-dental |

---

## Brief Verification Criteria (BVC-xxx)

| ID | Criterio del Cliente | Tipo de Verificación | Brief de origen |
|----|---------------------|---------------------|-----------------|
| BVC-001 | Tipografía NO es Inter y usa solo pesos 400 y 500 (Red Hat) | computed-style | clinica-dental |
| BVC-002 | Paleta usa UNA sola familia de acento (azul) con máximo 4 tonos coherentes | computed-style | clinica-dental |
| BVC-003 | Fondo principal entre #ffffff y #fafafa; texto principal gris oscuro cálido (~#2a2a35, no negro puro) | computed-style | clinica-dental |
| BVC-004 | Cards con radius entre 10 y 14px; ninguna card con radius >20px | computed-style | clinica-dental |
| BVC-005 | Cards usan borde sutil O sombra sutil, nunca ambos; sombras de un solo nivel suave (offset 1px / blur 4px / op 0.04) | computed-style | clinica-dental |
| BVC-006 | Spacing en múltiplos de 4; padding de cards 24-32px; separación entre cards 16-20px | computed-style | clinica-dental |
| BVC-007 | Sidebar con exactamente 5 items + Configuración/Ayuda, icono+label siempre visible, item activo destacado | visual | clinica-dental |
| BVC-008 | Header sin búsqueda global ni command palette; solo búsqueda contextual + notificaciones + avatar | visual | clinica-dental |
| BVC-009 | Ninguna tabla supera 5 columnas | visual | clinica-dental |
| BVC-010 | Una sola acción primaria por pantalla; máximo una secundaria visible | visual | clinica-dental |
| BVC-011 | Un solo filtro principal visible en listas; el resto en panel desplegable | visual | clinica-dental |
| BVC-012 | Ningún drawer lateral como contenido principal; ningún modal >50% de pantalla | visual | clinica-dental |
| BVC-013 | Ficha del paciente usa tabs; contenido del tab inactivo NO está en el DOM | computed-style | clinica-dental |
| BVC-014 | Iconografía de un solo set (Phosphor o Tabler), regular, stroke 1.5px, tamaños 16/20/24 | computed-style | clinica-dental |
| BVC-015 | Hover visible en todo lo clickeable; focus rings visibles; disabled con opacidad 40% | visual | clinica-dental |
| BVC-016 | Skeletons (no spinners) al cargar listas; toasts tras acciones exitosas | visual | clinica-dental |
| BVC-017 | Inputs y botones con altura 40px; touch targets ≥44px en mobile | computed-style | clinica-dental |
| BVC-018 | Sin emojis decorativos, sin gradientes saturados, sin sombras pesadas, sin pills estridentes | visual (negative) | clinica-dental |
| BVC-019 | Cards de paciente/tratamiento/obra social replican patrones Task Dasher (foto circular, % grande, badges suaves, avatares overlapping) | visual | clinica-dental |
| BVC-020 | Ficha del paciente se ve compatible con la página Profile de Task Dasher | visual | clinica-dental |
| BVC-021 | Transitions/micro-interacciones entre 150-250ms | computed-style | clinica-dental |
| BVC-022 | Line-height de cuerpo 1.5-1.7 y de títulos ~1.2; máx 3 tamaños de texto por pantalla | computed-style | clinica-dental |
| BVC-023 | NO hay drawers laterales para contenido principal | visual (negative) | clinica-dental |
| BVC-024 | NO hay power-user features visibles (command palette, atajos globales, búsqueda global) | visual (negative) | clinica-dental |
| BVC-025 | NO hay iconos sin label en navegación principal | visual (negative) | clinica-dental |
| BVC-026 | NO hay infinite scroll en listas operativas ni scroll infinito en la ficha del paciente | visual (negative) | clinica-dental |
| BVC-027 | NINGUNA parte de la UI revela que es demo/mock (sin badge "demo", sin "Resetear demo" visible, sin lenguaje que delate el mock) | visual (negative) | clinica-dental |
| BVC-028 | El aire/espacio comunica orden — pantallas con poco contenido se ven espaciosas, no rellenadas artificialmente | subjective | clinica-dental |
| BVC-029 | Sensación general "calma profesional" coherente con Task Dasher (aire, tipografía, cards, paleta azul) | subjective | clinica-dental |
