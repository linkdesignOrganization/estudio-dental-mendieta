# Visual Analysis — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Design Researcher
**Fecha**: 2026-06-01
**Fuente de diseño**: Design briefs del cliente (vía `brief-criteria.md`, 29 BVC) + análisis visual de Task Dasher (4 capture-notes, 48 screenshots PNG)
**Versión**: 1.0

> **ESTE DOCUMENTO ES EL ÚNICO INPUT DEL EQUIPO DE DISEÑO** (Design Orchestrator + 3 sub-designers). Es autosuficiente: contiene todos los valores prescriptivos, los BVC, los anti-patrones, y la traducción de los patrones de la referencia a nuestras pantallas. No es necesario re-leer briefs ni capture-notes.
>
> **Cómo leer este documento — dos niveles de autoridad:**
> - **PRESCRIPTIVO (CLIENT-SPECIFIED)** — secciones de Paleta, Tipografía, Spacing, Animaciones, Anti-patrones, BVC, y los valores marcados con 🔒. **Transcritos EXACTOS del brief. NO se reinterpretan, NO se "mejoran".** Donde el cliente prescribió, manda el cliente.
> - **DERIVADO / HOLÍSTICO** — la traducción de patrones Task Dasher → nuestras pantallas y la sección "Decisiones de Diseño Holísticas". Aquí el Design Researcher aporta criterio creativo para los gaps que el brief no cubre, siempre **dentro** del lenguaje prescriptivo.

---

## Resumen Ejecutivo

Sistema de gestión para una clínica dental (**"Estudio Dental Mendieta"**), presentado como **producto real en producción** — nunca como demo. La dirección es **calma profesional, persona-céntrica**: mucho aire, superficies blancas flotando sobre un canvas casi-blanco, una **única familia de acento azul** (cielo `#c5d8e8` + medio `#6da8d4`), tipografía **Red Hat** (Display/Text, solo pesos 400 y 500), cards de radius suave (10–14px), y semánticos siempre pastel. La estética de referencia es **Task Dasher** (`task-dasher.webflow.io`): su "soft-UI" limpio, sus cards con porcentaje grande + barra de progreso, sus avatares circulares y overlapping, su sidebar con item activo en píldora elevada, y su sistema de status-badges/priority-pills. **Adaptamos** Task Dasher en dos ejes deliberados: (1) su azul de marca es más saturado (`#2979ff`/`#669dfc`) → armonizamos a nuestra familia azul más **suave y serena**, apropiada a un contexto clínico; (2) Task Dasher resuelve "estado" como texto de tiempo relativo (no usa badges cromáticos de estado) → **nosotros SÍ introducimos** badges suaves de turno/tratamiento/pago, derivados de sus priority-pills y status soft-badges. La pieza más fuerte es la **ficha del paciente** (Profile → 6 tabs). El producto es **multi-pantalla estricto**: cada acción tiene su ruta; nada de drawers como contenido principal ni modales gigantes.

**Compatibilidad Task Dasher (Principio #1, BVC-029):** heredamos el chasis (sidebar limpio + header + cards flotantes + aire), pero rehacemos cualquier pantalla que se sienta distinta en aire/tipografía/cards/paleta. El gradiente "aurora" del header de Profile de Task Dasher (morado→magenta→naranja) es su elemento más expresivo y **NO encaja** en un contexto clínico sobrio: se **atenúa o sustituye** por un banner azul plano muy sutil de nuestra familia (ver Patrón 11).

---

## Filosofía y Principios de Diseño

> 🔒 PRESCRIPTIVO — transcritos de `brief-criteria.md`. Estos principios guían TODAS las decisiones.

| # | Principio | Contexto / cómo aplicar |
|---|-----------|-------------------------|
| 1 | **Compatibilidad con Task Dasher** | Pantalla muy distinta en aire/tipografía/cards/paleta se rehace. Heredar el chasis soft-UI; medir cada pantalla contra el "look" de Task Dasher (BVC-029). |
| 2 | **Cada acción, su pantalla** | Navegación entre objetos, nunca drawers ni modales gigantes. Cada crear/editar/consultar = ruta dedicada; la URL refleja la vista; el botón atrás funciona. |
| 3 | **Aire con propósito** | El espacio comunica orden, no se llenan pantallas artificialmente. Pantallas con poco contenido se ven espaciosas, no rellenadas (BVC-028). |
| 4 | **Persona-céntrico** | Las fotos de pacientes humanizan. Avatares circulares en listas; foto grande en la ficha. El paciente es el sujeto, no una fila de datos. |
| 5 | **Calma profesional** | Una sola familia de color (azul), máx 4 tonos, neutros cálidos, semánticos pastel. Sensación serena, higiénica, confiable. |

---

## Paleta de Colores Prescrita

> 🔒 PRESCRIPTIVO — valores EXACTOS del brief. El Visual System Designer los usa tal cual. **Decisión confirmada del cliente (Fase 2): familia AZUL cielo/medio.** Las otras familias quedan descartadas.
>
> **Regla maestra:** máximo **4 tonos coherentes** dentro de la familia azul. Semánticos **siempre pastel**. Fondo principal **NUNCA saturado**. Texto principal **NUNCA negro puro**.

| Token / Nombre | Hex | Uso / Contexto |
|----------------|-----|----------------|
| Acento suave (azul cielo) | `#c5d8e8` | Acento atenuado, fondos de pill suaves, hover sutil, estado seleccionado tintado |
| Acento saturado (azul medio) | `#6da8d4` | Acento primario, barras de progreso, item activo, CTA, icon-chips |
| Fondo principal | `#ffffff` – `#fafafa` | Fondo de la app (canvas). NUNCA saturado |
| Texto principal | `~#2a2a35` | Texto general — gris oscuro **cálido**, NUNCA negro puro |
| Texto secundario | `~#707080` | Subtítulos, captions, labels de campo |
| Borde / Separador | `#e8e8ee` | Bordes de cards e inputs (0.5–1px, tenue), dividers de lista/tabla |
| Éxito | verde pastel suave | Toasts/estados de éxito (cita confirmada, pago al día) |
| Error | coral pastel suave | Errores, alertas (pago vencido) |
| Warning | amarillo pastel suave | Advertencias (tratamiento por vencer, turno por confirmar) |
| Info | azul pastel suave | Informativos |

**Notas de contraste WCAG (recomendación del Researcher — verificar en implementación):**
- Texto principal `~#2a2a35` sobre fondo `#ffffff`/`#fafafa` → contraste muy alto (~13:1). **PASA AA y AAA.**
- Texto secundario `~#707080` sobre blanco → ~4.9:1. **PASA AA** para texto normal; OK para captions.
- **PRECAUCIÓN:** el azul medio `#6da8d4` es un tono **claro**. Texto blanco sobre `#6da8d4` ronda ~2.3:1 → **NO PASA AA** para texto. Implicación de implementación: en CTAs/pills sólidos con texto encima, usar **texto oscuro** (`~#2a2a35`) sobre el azul medio, o reservar `#6da8d4` para superficies de fondo/barras (no como fondo de texto blanco). Los **icon-chips azules** llevan glifo: preferir glifo de buen contraste o un azul ligeramente más profundo solo para el chip si la legibilidad lo exige (sin salir de la familia). Esto **contrasta con Task Dasher**, cuyo azul más saturado sí soporta texto blanco; al suavizar la familia, trasladamos el peso del texto al neutro oscuro.
- Semánticos pastel: usar el color pastel como **fondo del badge** con **texto/ícono en una versión más oscura del mismo hue** para garantizar legibilidad (ver "Sistema de badges").

**Diferencia clave vs Task Dasher (observada en screenshots):** Task Dasher usa `#2979ff`/`#669dfc` (azul vibrante) como **único acento fuerte** y reserva rosa/ámbar/verde solo para progreso y estados. Nuestra familia es **más suave y serena**. Mantener la disciplina de Task Dasher (**un solo acento dominante**, neutros para todo lo demás), pero con nuestro azul atenuado. Máx 4 tonos azules: cielo `#c5d8e8`, medio `#6da8d4`, y como mucho dos variaciones de luminosidad derivadas (un azul más profundo para texto/íconos sobre claro, y un azul casi-blanco para fondos tintados) — **sin** introducir un quinto hue.

---

## Tipografía Prescrita

> 🔒 PRESCRIPTIVO — valores EXACTOS del brief. **Decisión confirmada del cliente (Fase 2): Red Hat.** NO Inter (es anti-patrón #1).

| Nivel | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| Títulos / Display | máx **3 tamaños** por pantalla | **400 / 500** | **Red Hat Display**; letter-spacing levemente negativo; line-height **1.2** |
| Cuerpo / Text | máx **3 tamaños** por pantalla | **400 / 500** | **Red Hat Text**; line-height **1.5–1.7** |

**Reglas inviolables:**
- Font family = **Red Hat** (Display para títulos, Text para cuerpo). **NUNCA Inter.**
- Solo pesos **400 (regular) y 500 (medium)**. **Nunca** bold extremo (700+) ni light (300−). (BVC-001)
- Máximo **3 tamaños de texto por pantalla** (cuenta el total entre títulos y cuerpo). (BVC-022)
- Line-height: cuerpo **1.5–1.7**, títulos **~1.2**. (BVC-022)

**Nota de implementación — adaptación de jerarquía vs Task Dasher:** Task Dasher usa una sans geométrica con pesos hasta **Bold (700)** y números de progreso muy bold (~40–48px). **NO replicar esos pesos.** Con solo 400/500 disponibles, la jerarquía se construye con **tamaño + color + espacio**, no con grosor: el nombre del paciente puede ir grande en peso 500; los números grandes de progreso (% de tratamiento, KPIs) van en tamaño grande peso **500** (no bold), apoyados por el color de acento y por aire. El "número de progreso enorme y muy bold" de Task Dasher se traduce a **número grande en 500 + azul medio**, manteniendo el impacto sin violar la regla de pesos. Escala sugerida coherente con "máx 3 tamaños por pantalla" (el equipo afina los px exactos, son responsabilidad del Visual System Designer): un tamaño de display para el H1 de pantalla/nombre de paciente, un tamaño de subtítulo/sección, y un tamaño de cuerpo — captions y labels comparten el tamaño de cuerpo con color secundario, para no exceder 3 tamaños.

---

## Spacing Prescrito

> 🔒 PRESCRIPTIVO — valores EXACTOS del brief.

| Contexto | Valor | Notas |
|----------|-------|-------|
| Escala base | **4, 8, 12, 16, 24, 32, 48, 64 px** | Todo en **múltiplos de 4** (BVC-006) |
| Padding interno de cards | **24–32px** | (BVC-006) |
| Separación entre cards (listas) | **16–20px** | (BVC-006) |
| Separación entre secciones | **32–48px** | — |
| **Radius de cards** | **10–14px** | **>20px PROHIBIDO** (BVC-004). Anti-patrón #6 |
| Borde de cards/inputs | **0.5–1px, `#e8e8ee`** | Sutil |
| Sombra (opcional) | offset **1px**, blur **4px**, opacidad **0.04** | **Un solo nivel.** Card vive con borde **O** sombra, **no ambos** (BVC-005) |
| Altura inputs y botones | **40px** | Consistente (BVC-017) |
| Touch target (mobile) | **≥44px** | (BVC-017) |
| Disabled | opacidad **40%** | (BVC-015) |

**Iconografía (🔒 PRESCRIPTIVO):** un solo set — **Phosphor** o **Tabler** —, versión **regular** (no rellena), stroke **1.5px**. Tamaños fijos: **16px** inline, **20px** botones/filas, **24px** acciones primarias. Los íconos **heredan el color del texto contiguo** (excepto íconos de estado, que toman su color semántico). (BVC-014)

**Nota de consistencia cross-page:** el mismo radius (10–14px), el mismo padding de card (24–32px), la misma altura de input/botón (40px) y el mismo divider (`#e8e8ee` 1px) se aplican **idénticos en todas las pantallas**. La regla "**borde O sombra, no ambos**" es crítica y diferencia nuestra estética de Material (anti-patrón #3): la card se separa del canvas por el contraste blanco-sobre-`#fafafa` + **una** sombra ultra-sutil **o** un borde tenue. **Importante — adaptación vs Task Dasher:** Task Dasher usa radius generoso de **~16–20px** en sus cards (observado en screenshots). Nuestro tope es **14px** → al replicar sus patrones, **bajar el radius** a 10–14px. Sus inputs son píldoras casi totalmente redondeadas (~24–26px radius): eso **VIOLA** nuestro límite y el anti-patrón #7 — nuestros inputs son sutiles (radius dentro de 10–14px, borde tenue, altura 40px), no píldoras.

---

## Animaciones / Transiciones Prescritas

> 🔒 PRESCRIPTIVO — valores EXACTOS del brief.

| Elemento | Duración | Easing | Descripción |
|----------|----------|--------|-------------|
| Transitions generales | **150–250ms** | suave | Micro-interacciones (BVC-021) |
| Hover | **150–250ms** | suave | **Visible en TODO lo clickeable** (BVC-015) |
| Focus rings | — | — | **Visibles** para navegación con teclado (BVC-015) |
| Toasts | suave | ease-in | Animación de entrada tras acción exitosa (BVC-016) |
| Carga de listas | — | — | **Skeletons, NO spinners** (BVC-016) |

**Notas de implementación:** hover obligatorio en cards, filas de tabla, items de lista, botones, pills, icon-buttons y tabs. Focus ring visible (no `outline:none` sin reemplazo) por accesibilidad de teclado. Disabled siempre a opacidad 40%. Las listas (pacientes, turnos, tratamientos, notificaciones) cargan con **skeletons** que imitan la forma del contenido (avatar circular + líneas), **nunca** spinners. Toda transición dentro de 150–250ms — ni instantánea ni lenta.

---

## Patrones de Referencia — Validación contra Screenshots

> Para cada patrón del brief: descripción (brief) + validación visual contra los screenshots de Task Dasher + recomendación de implementación traducida a nuestras pantallas. **Validación basada en observación directa de los PNGs** (`td-profile-fullpage-desktop`, `td-home-fullpage-desktop`, `td-contacts-cardview-fullpage-desktop`, `td-companies-fullpage-desktop`) + las 4 capture-notes que destilan los 48 screenshots.

### Patrón 1 — Sidebar de navegación
- **URL fuente:** task-dasher (todas las páginas).
- **Brief / adaptación:** **5 items** (Agenda, Pacientes, Tratamientos, Facturación, Reportes) + footer (Configuración, Ayuda). Icono+label **SIEMPRE visible**. Item activo con fondo sutil. **Fijo, no colapsable.**
- **Validación screenshot:** ✅ **MATCHEA.** En todos los PNGs el sidebar es una columna fija (~230–250px), fondo blanco/casi-canvas, logo arriba, items = ícono lineal + label, e item activo destacado por una **píldora blanca elevada** (efecto card flotante dentro del sidebar, radius ~12–14px). Algunos items llevan badge numérico circular azul a la derecha (contador de notificaciones).
- **Recomendación de implementación:** replicar la píldora de item activo (adaptar radius a 10–14px, fondo con nuestro azul cielo `#c5d8e8` tintado **o** blanco elevado según la card sobre la que vive). Logo = isotipo + wordmark **"Estudio Dental Mendieta"** arriba. Orden: Agenda · Pacientes · Tratamientos · Facturación · Reportes, separador, Configuración · Ayuda. Badge de conteo azul (medio `#6da8d4`) en items con pendientes (ej. notificaciones). **NUNCA** íconos sin label (anti-patrón #18, BVC-025). En mobile, Task Dasher colapsa el sidebar a un **drawer overlay** por hamburguesa (`td-home-nav-mobile`) — patrón válido para nuestra nav mobile (el drawer de **navegación** está permitido; lo prohibido es el drawer como **contenido principal**, BVC-023).

### Patrón 2 — Header de la app
- **URL fuente:** task-dasher (todas).
- **Brief / adaptación:** Search **contextual** (NO global) a la derecha + notificaciones c/badge + avatar **"AD"**. **SIN badge "demo"** (decisión cliente).
- **Validación screenshot:** ✅ **MATCHEA** (con omisión). En los PNGs el header tiene search-pill a la izquierda/centro, cluster de **avatares overlapping +N** y fila de íconos (campana con dot, carrito, settings). El **carrito es de e-commerce y NO aplica** (omitir). El search es contextual a la página.
- **Recomendación de implementación:** search **contextual** (filtra la lista de la pantalla actual; NO búsqueda global ni command palette — anti-patrón #10, BVC-008/BVC-024). Campana de notificaciones con badge/dot. Avatar del usuario logueado **"AD"** (iniciales). **Omitir** carrito. **CRÍTICO (BVC-027):** ningún rótulo "demo", ningún "Resetear demo", nada que delate el mock. Search-pill: adaptar radius a 10–14px (no la píldora total de Task Dasher).

### Patrón 3 — Cards con progreso (anillo / barra + % grande)
- **URL fuente:** task-dasher All Tasks (dashboard).
- **Brief / adaptación:** Cards de **tratamientos**: **% grande** + "Progreso" + barra + subtítulo + menú.
- **Validación screenshot:** ✅ **MATCHEA fuerte.** En `td-home-fullpage-desktop` se ven 3 cards con **anillo/gauge de progreso** (números 38/74/56 grandes y centrados, label "PROGRESS", marcadores 0%/100%) y también **barras de progreso** anchas tipo píldora en la sección Tasks (relleno saturado + resto pastel del mismo hue, % a la derecha). Menú `⋯` en esquina sup. der.
- **Recomendación de implementación:** card de tratamiento con **% grande** (en peso **500**, no bold; color azul medio `#6da8d4`) + label "Progreso" + barra de progreso (relleno `#6da8d4`, track `#c5d8e8` o `#e8e8ee`) + nombre del tratamiento + menú `⋯`. El anillo/gauge sirve para **KPIs de Reportes**; la barra para tratamientos en lista. **Adaptar:** los arcos/barras de Task Dasher usan rosa/ámbar/verde decorativos por card → nosotros usamos **azul** (familia única); los colores semánticos solo entran si la barra representa un **estado** (ej. tratamiento "Atrasado" → tono warning pastel), no decoración.

### Patrón 4 — Tarjetas de personas con foto
- **URL fuente:** task-dasher (Contacts).
- **Brief / adaptación:** Cards de **pacientes**: foto circular, nombre, edad/obra social como subtítulo, **% grande** = estado/saldo.
- **Validación screenshot:** ✅ **MATCHEA.** `td-contacts-cardview-fullpage-desktop` muestra grid de 3 columnas de cards blancas: **avatar circular grande centrado** (~88–96px), nombre bold centrado, rol gris, empresa, divider, y 4 filas de datos con **icon-chips azules** + label gris + valor. Footer "View Details" + lápiz/papelera.
- **Recomendación de implementación:** card de paciente = **foto circular grande** + **nombre** (peso 500) + subtítulo (edad · obra social) + datos clave con icon-chips (teléfono, próxima cita) + **badge de estado del paciente** (Activo/En tratamiento — **a introducir**, ver Patrón 6) + footer "Ver ficha" + acciones inline (editar). El "% grande = saldo/estado" del brief: si se usa, va en peso 500 + color (azul para neutro, semántico pastel si es deuda). **Persona-céntrico (Principio #4):** la foto es protagonista.

### Patrón 5 — Overlapping avatars (+N)
- **URL fuente:** task-dasher.
- **Brief / adaptación:** Profesionales asignados a un tratamiento, o pacientes con turno en un día. **"+N"** si hay más.
- **Validación screenshot:** ✅ **MATCHEA.** Visible en el header (cluster de 4 avatares + círculo azul "+8") y en las company cards del dashboard (`td-home-company-cards-desktop`: 4 avatares solapados del equipo, con **borde blanco** que los separa).
- **Recomendación de implementación:** stack de avatares circulares (~28–32px) con **borde blanco** (~2px) para separación, solapados ~40%, y un círculo azul medio `#6da8d4` con **"+N"** cuando exceden 3–4. Uso: profesionales asignados a un tratamiento; pacientes de un día en Agenda. **Adaptar:** el círculo "+N" de Task Dasher es azul saturado con texto blanco — con nuestro azul medio más claro, usar **texto oscuro** sobre el "+N" o un azul ligeramente más profundo solo para ese círculo (ver nota de contraste).

### Patrón 6 — Badges de estado (A INTRODUCIR — no existe en Task Dasher)
- **URL fuente:** task-dasher (derivado de priority-pills + status soft-badges).
- **Brief / adaptación:** Pills **suaves**: turno (Confirmado/Atendiendo/Terminado/Cancelado), tratamiento (En curso/Atrasado/En pausa/Completado), pago (Al día/Con deuda/Vencido).
- **Validación screenshot:** ⚠️ **DISCREPANCIA DOCUMENTADA — Task Dasher NO usa badges de estado de "actividad" con colores suaves para personas.** En Contacts resuelve el estado como **texto de tiempo relativo** ("Last Online: 2 days ago"). SÍ tiene, en el dashboard (`td-home-table-desktop`), dos sistemas reutilizables: **STATUS soft-badges** (punto/ícono de color + texto, fondo muy tenue: Completed verde / On Review naranja / In Queue amarillo / In Progress azul) y **PRIORITY pills** (sólidos: High rojo / Mid ámbar / Low verde). **Nuestros badges de estado SE INTRODUCEN** combinando ambos lenguajes, pero **en versión pastel** (anti-patrón #4: nada de pills estridentes).
- **Recomendación de implementación:** badge = pill redondeado (radius dentro de 10–14px o pill suave), **fondo pastel del hue semántico + texto/ícono en versión más oscura del mismo hue** (legibilidad, no texto blanco sobre pastel claro). Mapeo:
  - **Turno:** Confirmado (verde pastel) · Atendiendo (azul info pastel) · Terminado (gris neutro) · Cancelado (coral pastel).
  - **Tratamiento:** En curso (azul) · Atrasado (warning ámbar pastel) · En pausa (gris) · Completado (verde pastel).
  - **Pago:** Al día (verde pastel) · Con deuda (warning) · Vencido (coral/error pastel).
  - Acompañar el badge con **timestamp relativo** ("Hace 2 horas") como complemento, no sustituto (Patrón 8). El badge usa el **mismo lenguaje cromático** del sistema; nunca colores saturados.

### Patrón 7 — Badges de prioridad
- **URL fuente:** task-dasher.
- **Brief / adaptación:** Pills **High/Mid/Low** → urgencia del turno o nivel de atención.
- **Validación screenshot:** ✅ **MATCHEA** (atenuar). `td-home-table-desktop` muestra priority-pills **sólidos saturados** (High rojo-naranja, Mid ámbar, Low verde, texto blanco).
- **Recomendación de implementación:** mantener la **distinción** High/Mid/Low pero en **versión pastel** coherente con nuestro sistema (no sólidos saturados — anti-patrón #4). Aplicar a urgencia de turno (ej. turno de hoy sin confirmar = High) o nivel de atención. Convivir con el badge de estado sin saturar la fila (máx un badge de estado + uno de prioridad por registro, alineado con "una sola acción primaria"/disciplina visual).

### Patrón 8 — "Last updated" relativo
- **URL fuente:** task-dasher.
- **Brief / adaptación:** "Hace 2 horas", "Hace 5 días" en turnos/tratamientos/pagos.
- **Validación screenshot:** ✅ **MATCHEA.** Task Dasher lo usa en todas partes ("2 days ago", "Last Online", columna LAST UPDATED en la tabla de Projects, timestamps en Notifications/Messages).
- **Recomendación de implementación:** timestamp relativo legible en **español** ("hace 30 min", "hace 1 h", "hace 5 días"), gris secundario `~#707080`, alineado a la derecha en filas/tablas. En la ficha del paciente y listas operativas (turnos, tratamientos, pagos, notificaciones). En mobile, baja a una segunda línea (ver Notificaciones).

### Patrón 9 — Tabla de tasks (máx 5 columnas)
- **URL fuente:** task-dasher.
- **Brief / adaptación:** Tablas de turnos del día / pacientes próximos. **Máx 5 columnas** (BVC-009, anti-patrón #11).
- **Validación screenshot:** ⚠️ **Task Dasher EXCEDE 5 columnas** (su tabla Projects tiene checkbox·visual·designer·task·status·priority·last-updated·acciones ≈ 6 de contenido + acciones). **NO replicar el número de columnas.**
- **Recomendación de implementación:** tabla con **máximo 5 columnas de contenido**. Heredar de Task Dasher el **estilo** (header gris uppercase con tracking, filas de alto cómodo ~48px, dividers `#e8e8ee` 1px muy tenues, avatar circular pequeño en la celda visual, acciones edit/eliminar a la derecha, contador de rango "1–100" en esquina sup. der.), pero **recortar columnas**. Ej. tabla de turnos del día: Visual(avatar) · Paciente · Hora · Estado · Acciones. **Adaptación de datos:** donde Task Dasher pone "Company" → poner **Tratamiento/Profesional asignado**; donde pone "Last Online" → **Última visita** relativa.

### Patrón 10 — Cards de Company con logo
- **URL fuente:** task-dasher Company.
- **Brief / adaptación:** **Obras sociales**: logo placeholder, nombre, pacientes activos, deuda, último pago, mini-stats.
- **Validación screenshot:** ✅ **MATCHEA** (con matiz de fusión). `td-companies-fullpage-desktop` muestra cards con **logo dentro de un círculo de borde sutil** + nombre bold + divider + mini-stats con **icon-chips azules** (Website/Phone/Email/Location) + footer "View Website". **Matiz:** las cards con **milestones (5/8) + barra de progreso + avatares overlapping** del equipo NO están en `/companies` sino en las **company cards del DASHBOARD** (`td-home-company-cards-desktop`).
- **Recomendación de implementación:** **FUSIONAR ambos patrones** para la card de obra social: logo-en-círculo (de `/companies`) + nombre + mini-stats con icon-chips azules (**pacientes activos, deuda, último pago** — reemplazando website/phone/email) + opcionalmente bloque de progreso/cobertura + avatares overlapping de pacientes/profesionales asociados (del dashboard). **Mock interno SIN ARCA/AFIP** (no integrar facturación externa real; la facturación es simulada pero presentada como real — BVC-027).

### Patrón 11 — Página Profile → Ficha del paciente (PIEZA MÁS FUERTE)
- **URL fuente:** task-dasher Profile.
- **Brief / adaptación:** Foto grande izq, nombre grande arriba, datos al lado, badges de alerta, **1 acción primaria** ("Agendar turno"), **6 tabs**: Info general · Odontograma (32 piezas) · Historial · Tratamientos · Documentos · Pagos. Tab inactivo **NO en DOM** (BVC-013).
- **Validación screenshot:** ✅ **MATCHEA estructura, con UNA adaptación crítica.** `td-profile-fullpage-desktop` muestra: layout de **3 columnas**, **header card con avatar circular grande** (borde blanco grueso, efecto recortado) sobre un **banner gradiente "aurora" morado→magenta→naranja**, nombre + rol al lado, secciones About/Experience/Post Activity en el centro, y **panel derecho "Profile Details"** con botón Edit + datos en **icon-chips azules**. En mobile (`td-profile-fullpage-mobile`) el avatar se **recentra** solapando el banner y el nombre va centrado.
- **Recomendación de implementación:**
  - ⚠️ **ADAPTACIÓN CRÍTICA — el banner gradiente "aurora" NO encaja en contexto clínico.** Sustituir por un **banner azul plano muy sutil** de nuestra familia (`#c5d8e8` o un degradé azul cielo→blanco muy tenue), o un banner liso. **NUNCA** el gradiente morado-magenta-naranja saturado (violaría el espíritu de "calma profesional" y roza el anti-patrón #2 de gradientes saturados).
  - Header de ficha: **foto grande** del paciente (circular, borde blanco) a la **izquierda** en desktop (centrada en mobile, solapando el banner) + **nombre grande** (peso 500) arriba + datos clave al lado (edad, expediente, obra social) + **badges de alerta** (alergia, pago vencido, etc., como pills pastel) + **UNA acción primaria** "Agendar turno" (BVC-010: una sola primaria; máx una secundaria).
  - **Panel de datos** con icon-chips (de "Profile Details"): teléfono, email, dirección, obra social, fecha de nacimiento → patrón **icon-chip + label gris + valor**. **Adaptar** el icon-chip al azul de la familia.
  - **6 tabs** = dimensiones del **mismo objeto** (el paciente) → uso correcto de tabs (anti-patrón #16/BVC: tabs NO para navegar entre objetos). **Contenido del tab inactivo NO renderizado en el DOM** (BVC-013). **Sin scroll infinito** en la ficha (anti-patrón #20/BVC-026) — la profundidad se da por tabs, no por scroll sin fin.
  - Las secciones apiladas tipo "Experience" (ícono/logo + título + fecha a la derecha + descripción) → patrón reutilizable para **Historial / Tratamientos / eventos clínicos** dentro de los tabs.
  - **Compatibilidad (BVC-020):** la ficha debe verse **compatible con la página Profile de Task Dasher** (aire, header card con avatar, panel de datos), salvando el banner.

### Patrón 12 — Página Contacts → Lista de pacientes
- **URL fuente:** task-dasher Contacts.
- **Brief / adaptación:** Lista con foto, nombre, datos clave, status, acciones inline.
- **Validación screenshot:** ✅ **MATCHEA.** `td-contacts-cardview-fullpage-desktop` confirma el **toggle Card View / Table View** (pills) + grid de cards con avatar grande. Table View tiene avatar pequeño en celda Visual, nombre, datos, "Last Online" relativo, acciones.
- **Recomendación de implementación:** **doble vista Card/Table con toggle de pills** (visual vs densa) — ideal para el directorio de pacientes. **Card View:** cards de paciente (ver Patrón 4). **Table View:** Visual(avatar) · Nombre · Tratamiento/Profesional · Estado · Última visita (relativa) — **máx 5 columnas** (recortar respecto a Task Dasher) + acciones inline (editar) discretas en gris. Un **solo filtro principal visible**; el resto en panel desplegable (BVC-011, anti-patrón #12). **Sin infinite scroll** (anti-patrón #19/BVC-026) — paginación con contador "1–100".

### Patrón 13 — Página Sign In → Login
- **URL fuente:** task-dasher Sign In.
- **Brief / adaptación:** Login: estética simple, formulario centrado.
- **Validación screenshot:** ✅ **MATCHEA** (con adaptaciones). Las capture-notes detallan: **card centrada con split interno imagen | formulario** (la imagen es un gradiente "aurora"); form = Email + Password + Remember me + Forgot Password + CTA pill + link a registro. **NO es split de pantalla completa**, es una card embebida.
- **Recomendación de implementación:** **card centrada** sobre canvas `#fafafa`; opción split imagen|form donde la **imagen sea una foto de la clínica/equipo o ilustración sobria** (NO el gradiente aurora). Formulario minimalista: Email + Password + "Recordarme" + "¿Olvidaste tu contraseña?" + CTA + (si aplica) registro. **Adaptar inputs:** NO la píldora ultra-redondeada de Task Dasher → inputs sutiles altura 40px, radius 10–14px, borde tenue (anti-patrón #7). **Recomendación de accesibilidad:** el "Forgot Password" en Task Dasher está en gris de bajo contraste → para pacientes, destacarlo en **azul** o asegurar contraste AA. CTA: usar texto oscuro sobre azul medio o azul más profundo (ver nota de contraste). Logo "Estudio Dental Mendieta".

> **NO aplica de Task Dasher:** cart de e-commerce, Pricing (el catálogo de **tipos de tratamiento** puede inspirarse visualmente en el layout de planes/cards, nada más). El **gradiente aurora** de Task Dasher (header de Profile, imagen de Sign In) NO se hereda — se atenúa/sustituye por azul sobrio en todos los casos.

---

## Especificaciones por Página

> Specs del brief por módulo, enriquecidas con observaciones de las capturas. **Estructurales (prioridad máxima, aplican a TODAS):** multi-pantalla estricto (cada acción crea/modifica/consulta = ruta dedicada; la URL refleja la vista; el botón atrás funciona). Modales **SOLO** para confirmaciones cortas, **nunca >50%** de pantalla, **máx 3 campos** (BVC-012, anti-patrón #14). **Drawers laterales PROHIBIDOS** como contenido principal (BVC-023, anti-patrón #13). Tabs **SOLO** para dimensiones del mismo objeto (anti-patrón #16). **Una sola acción primaria por pantalla** (BVC-010, anti-patrón #17).

| Página / Módulo | Layout / Componentes clave | Patrón ref | Notas de captura |
|-----------------|----------------------------|------------|------------------|
| **Agenda** | Calendario (mensual/semanal/diario), detalle de turno, crear turno (**3 pasos**), reagendar, lista del día | Cards + tabla turnos (P9) | Tabla del día ≤5 col; avatares overlapping para pacientes del día; badges de estado de turno (P6); timestamps relativos |
| **Pacientes — lista** | Lista con foto, nombre, datos clave, status, acciones inline. Toggle Card/Table | Contacts (P12) | Card grande centrada vs tabla densa ≤5 col; un solo filtro visible |
| **Pacientes — ficha (PIEZA FUERTE)** | Foto grande izq, nombre grande arriba, datos al lado, badges alerta, **1 acción primaria** ("Agendar turno"), **6 tabs**: Info general · Odontograma (32 piezas) · Historial · Tratamientos · Documentos · Pagos. Tab inactivo NO en DOM | Profile (P11) | **Banner azul sobrio, NO gradiente aurora.** Header con avatar circular grande + panel de datos con icon-chips. Sin scroll infinito (usa tabs) |
| **Pacientes — sub** | Crear (**2 pasos**), editar, detalle de pieza dental, detalle de evento clínico, detalle de plan | — | Cada uno = ruta dedicada (multi-pantalla) |
| **Tratamientos** | Lista de activos, tipos (catálogo en cards), detalle de tipo. Cards con **% grande** | Cards progreso (P3) | Barra de progreso azul + % en peso 500; menú ⋯; el catálogo puede inspirarse en cards de "planes" |
| **Facturación** | Presupuestos (lista/detalle/crear **3 pasos**), facturas (lista/detalle), obras sociales (cards/detalle). **Mock interno SIN ARCA/AFIP** | Company (P10) | Cards de obra social = logo-en-círculo + mini-stats (pacientes/deuda/último pago) + avatares; presentado como real (BVC-027) |
| **Reportes** | Dashboard de **KPI cards (máx 6)** + reportes (pacientes/tratamientos/financiero/productividad) con gráficos en **cards aireadas** | Cards progreso / Apple Health | Anillo/gauge de progreso de Task Dasher ideal para KPIs (% grande centrado + "Progreso" + 0/100); gráficos simples en cards aireadas |
| **Login** | Formulario centrado, estética simple | Sign In (P13) | Card centrada; imagen sobria (no aurora); inputs sutiles 40px |
| **Configuración** | Ajustes (botón **"Resetear demo" NO visible** — decisión cliente, no revelar mock) | — | BVC-027: nada que delate el mock |

**Notas de observación cross-capture aplicables a varias páginas:**
- **Notificaciones internas** (turno por confirmar, pago vencido, cumpleaños, tratamiento por vencer): patrón de lista de Task Dasher Notifications → fila con **leading circular** (ícono temático con fondo de color para sistema / avatar para persona) + título (peso 500) + subtítulo gris + **timestamp relativo** a la derecha (en mobile baja a segunda línea). Tabs de filtro como pills (Todas/Sin leer). Contador de no-leídos: badge en la nav lateral + en el tab. **A complementar (Task Dasher NO lo tiene):** diferenciación leído/no-leído **por item** (añadir dot o fondo tintado) y agrupaciones por fecha si se requieren. Mapeo de íconos: turno→calendario, pago vencido→pagos (acento coral/error), cumpleaños→pastel/torta o avatar, tratamiento por vencer→médico (warning).
- **Estado seleccionado/activo** (item de nav, fila, conversación): fondo **azul cielo tintado** (`#c5d8e8` o un azul muy claro tipo el lavanda `#EBF0FF` que Task Dasher usa, **adaptado a nuestra familia**) con esquinas redondeadas — consistente en toda la app.
- **Responsive:** 3 columnas (desktop) → 1 columna (mobile) limpio; el avatar de la ficha se recentra; la tabla se transforma a layout vertical "ficha" (label izq / valor der por fila); el sidebar → drawer overlay por hamburguesa.

---

## Anti-patrones Mandatorios

> 🔒 PRESCRIPTIVO — del brief. Estos elementos **NO deben existir** en el proyecto. Varios son verificados como BVC negativos.

| # | Anti-patrón | Contexto |
|---|-------------|----------|
| 1 | **Inter** como tipografía | Usar Red Hat (BVC-001) |
| 2 | Gradientes **saturados** de fondo | Color (afecta banner de ficha y Login) |
| 3 | Sombras pesadas (Material elevation 8) | Sombras (BVC-005) |
| 4 | Pills de colores **estridentes** | Badges → usar pastel (BVC-018) |
| 5 | **Emojis** decorativos en la interfaz | UI (BVC-018) |
| 6 | Border radius **>20px** | Cards (BVC-004) |
| 7 | Inputs con bordes **pronunciados** | Inputs |
| 8 | Botones con sombras internas o gradientes | Botones |
| 9 | Color de fondo principal **saturado** | Fondo (BVC-003) |
| 10 | **Power-user features** (command palette, atajos globales, búsqueda global compleja) | Navegación (BVC-024) |
| 11 | Tablas con **más de 5 columnas** | Tablas (BVC-009) |
| 12 | **Múltiples filtros** visibles simultáneamente | Listas (BVC-011) |
| 13 | **Drawers laterales** como contenido principal | Layout (BVC-023) |
| 14 | Modales mayores al **50%** de pantalla | Modales (BVC-012) |
| 15 | Pantallas que **mezclan lista + detalle + formulario + panel** | Layout (BVC-015 estructural) |
| 16 | **Tabs que reemplazan navegación** entre objetos | Tabs |
| 17 | **Múltiples acciones primarias** por pantalla | Acciones (BVC-010) |
| 18 | **Iconos sin label** en navegación principal | Sidebar (BVC-025) |
| 19 | **Infinite scroll** en listas operativas | Listas (BVC-026) |
| 20 | **Scroll infinito en la ficha** del paciente (debe usar tabs) | Ficha (BVC-026) |
| 21 | Cualquier rótulo/elemento que **revele que es demo/mock** | UI global — decisión cliente Fase 2 (BVC-027) |

---

## Brief Verification Criteria (BVC-xxx)

> 🔒 PRESCRIPTIVO — transcritos de `brief-criteria.md`. Criterios de calidad **definidos por el cliente**. Se incorporan a `design-criteria.md` como **QA gates obligatorios**. **29 criterios.**

| ID | Criterio del Cliente | Tipo de Verificación |
|----|---------------------|---------------------|
| BVC-001 | Tipografía NO es Inter y usa solo pesos 400 y 500 (Red Hat) | computed-style |
| BVC-002 | Paleta usa UNA sola familia de acento (azul) con máximo 4 tonos coherentes | computed-style |
| BVC-003 | Fondo principal entre `#ffffff` y `#fafafa`; texto principal gris oscuro cálido (~`#2a2a35`, no negro puro) | computed-style |
| BVC-004 | Cards con radius entre 10 y 14px; ninguna card con radius >20px | computed-style |
| BVC-005 | Cards usan borde sutil O sombra sutil, nunca ambos; sombras de un solo nivel suave (offset 1px / blur 4px / op 0.04) | computed-style |
| BVC-006 | Spacing en múltiplos de 4; padding de cards 24-32px; separación entre cards 16-20px | computed-style |
| BVC-007 | Sidebar con exactamente 5 items + Configuración/Ayuda, icono+label siempre visible, item activo destacado | visual |
| BVC-008 | Header sin búsqueda global ni command palette; solo búsqueda contextual + notificaciones + avatar | visual |
| BVC-009 | Ninguna tabla supera 5 columnas | visual |
| BVC-010 | Una sola acción primaria por pantalla; máximo una secundaria visible | visual |
| BVC-011 | Un solo filtro principal visible en listas; el resto en panel desplegable | visual |
| BVC-012 | Ningún drawer lateral como contenido principal; ningún modal >50% de pantalla | visual |
| BVC-013 | Ficha del paciente usa tabs; contenido del tab inactivo NO está en el DOM | computed-style |
| BVC-014 | Iconografía de un solo set (Phosphor o Tabler), regular, stroke 1.5px, tamaños 16/20/24 | computed-style |
| BVC-015 | Hover visible en todo lo clickeable; focus rings visibles; disabled con opacidad 40% | visual |
| BVC-016 | Skeletons (no spinners) al cargar listas; toasts tras acciones exitosas | visual |
| BVC-017 | Inputs y botones con altura 40px; touch targets ≥44px en mobile | computed-style |
| BVC-018 | Sin emojis decorativos, sin gradientes saturados, sin sombras pesadas, sin pills estridentes | visual (negative) |
| BVC-019 | Cards de paciente/tratamiento/obra social replican patrones Task Dasher (foto circular, % grande, badges suaves, avatares overlapping) | visual |
| BVC-020 | Ficha del paciente se ve compatible con la página Profile de Task Dasher | visual |
| BVC-021 | Transitions/micro-interacciones entre 150-250ms | computed-style |
| BVC-022 | Line-height de cuerpo 1.5-1.7 y de títulos ~1.2; máx 3 tamaños de texto por pantalla | computed-style |
| BVC-023 | NO hay drawers laterales para contenido principal | visual (negative) |
| BVC-024 | NO hay power-user features visibles (command palette, atajos globales, búsqueda global) | visual (negative) |
| BVC-025 | NO hay iconos sin label en navegación principal | visual (negative) |
| BVC-026 | NO hay infinite scroll en listas operativas ni scroll infinito en la ficha del paciente | visual (negative) |
| BVC-027 | NINGUNA parte de la UI revela que es demo/mock (sin badge "demo", sin "Resetear demo" visible, sin lenguaje que delate el mock) | visual (negative) |
| BVC-028 | El aire/espacio comunica orden — pantallas con poco contenido se ven espaciosas, no rellenadas artificialmente | subjective |
| BVC-029 | Sensación general "calma profesional" coherente con Task Dasher (aire, tipografía, cards, paleta azul) | subjective |

---

## Decisiones de Diseño Holísticas

> Gaps del brief + recomendaciones del Design Researcher basadas en las capturas. **Aquí aplico criterio creativo (filosofía frontend-design) para el espacio NO prescrito**, empujando hacia una dirección distintiva y anti-genérica — **sin** tocar ningún valor prescriptivo (paleta, fuentes, spacing, BVC). Donde el cliente prescribió, manda el cliente; donde calló, propongo carácter.

### Dirección estética holística (lo que hace esta clínica memorable, no una plantilla)

El brief y Task Dasher dan un sistema **sereno pero genérico**. El riesgo es "otro dashboard SaaS azul más". La oportunidad — **dentro de los tokens prescritos** — es darle a Estudio Dental Mendieta una **firma de producto clínico cálido y humano**, no corporativo-frío:

1. **El paciente como sujeto, no como fila (lleva el Principio #4 al extremo).** La ficha del paciente debe sentirse como un **expediente cuidado**, no como un CRM. Foto grande, generoso aire alrededor del nombre, datos respirados. Es la pantalla-firma: que alguien la recuerde. **frontend-design aplicado:** componer el header de ficha con **asimetría intencional** (foto + nombre pesando a la izquierda, panel de datos liviano a la derecha) y **una sola jerarquía dominante** (el nombre), en vez de una grilla simétrica plana. El impacto viene del **aire y la escala del nombre**, no de adornos.

2. **Azul como calma, no como corporativo.** Nuestro azul es más suave que el de Task Dasher: aprovecharlo para una sensación **higiénica y tranquila** (apropiada a "no me da miedo el dentista"). Usar `#c5d8e8` como **lavado de fondo sutil** en zonas seleccionadas/activas y en el banner de la ficha (un degradé azul-cielo→blanco **muy** tenue, dentro de lo permitido — NO saturado, NO aurora). El acento `#6da8d4` aparece con **parsimonia**: barras de progreso, item activo, una acción primaria por pantalla. La disciplina "un solo acento dominante + neutros" (que Task Dasher ejecuta muy bien) es lo que separa esto de "AI slop" de gradientes morados.

3. **Motion propositiva, no decorativa (frontend-design, dentro de 150–250ms).** Un único momento orquestado de **carga con stagger** por pantalla genera más deleite que micro-animaciones dispersas: al entrar a una lista, los **skeletons** (obligatorios, BVC-016) se revelan con un stagger sutil (delay incremental por fila), y las cards entran con un fade+rise mínimo. Hover en cards/filas: elevación sutil o tinte de fondo (no transform agresivo). Todo ≤250ms. Esto es "propositivo": comunica que el sistema responde, sin ruido.

4. **Tipografía con carácter dentro del corsé Red Hat 400/500.** Sin bold ni light, el carácter se logra con **contraste de escala generoso** (nombre de paciente claramente grande vs cuerpo) + **letter-spacing levemente negativo en Display** (ya prescrito) + uso disciplinado de color (título en texto principal, metadata en secundario). Red Hat Display tiene personalidad geométrica-humanista; dejarla **respirar** (line-height 1.2 en títulos, espacio alrededor) en vez de apretarla. Evitar la tentación de meter un tercer tamaño "para variar" — la restricción a 3 tamaños **es** la elegancia.

### Gaps identificados en los briefs (no cubiertos — recomendación del Researcher)

- **GAP — Badges de estado no existen en la referencia.** Resuelto en Patrón 6 (a introducir, en versión pastel derivada de priority-pills + status soft-badges). Decisión: **fondo pastel del hue + texto/ícono en versión oscura del mismo hue** para legibilidad, nunca texto blanco sobre pastel claro.
- **GAP — Contraste del azul medio para texto blanco.** El `#6da8d4` es claro y NO soporta texto blanco a nivel AA. Decisión: en CTAs/pills sólidos, usar **texto oscuro** (`~#2a2a35`) sobre el azul medio, o derivar un azul más profundo **dentro de la familia** solo para superficies con texto blanco. (Detallado en nota de contraste.)
- **GAP — Estado leído/no-leído por item en Notificaciones.** Task Dasher solo da conteo agregado. Decisión: añadir **indicador por item** (dot azul leading o fondo azul-cielo muy tenue) que la referencia no provee.
- **GAP — Agrupaciones por fecha en listas/notificaciones.** Task Dasher usa lista plana por recencia. Decisión: si el cliente las requiere, diseñar headers de agrupación ("Hoy"/"Esta semana") sobrios (label secundario, sin card); si no, lista plana ordenada por recencia con timestamp relativo.
- **GAP — Odontograma (32 piezas).** No tiene análogo en Task Dasher. Decisión: es un componente **propio** del dominio; mantenerlo dentro del lenguaje (superficies blancas, líneas tenues `#e8e8ee`, estados de pieza como **chips/colores pastel** del sistema semántico — sano/tratado/a-tratar/ausente). Sin saturación. El detalle de una pieza = ruta dedicada (multi-pantalla).
- **GAP — Estados vacíos (empty states).** No especificados. Decisión: empty states sobrios y **persona-céntricos** (ilustración o ícono Phosphor/Tabler liviano + texto secundario + una acción primaria). Nada de copy que delate el mock (BVC-027).
- **GAP — Estados de error/carga.** Skeletons (BVC-016) para carga; errores con toast coral pastel + reintento. Sin spinners.

### Observaciones de las capturas (complementan/discrepan del brief)

- **DISCREPANCIA — gradiente aurora.** Task Dasher usa un gradiente morado-magenta-naranja muy saturado en el header de Profile y en la imagen de Sign In. **NO se hereda** (rozaría el anti-patrón #2 y contradiría "calma profesional"). Se sustituye por azul sobrio.
- **DISCREPANCIA — radius e inputs.** Task Dasher usa radius ~16–20px en cards e inputs tipo píldora ~24–26px. **Excede** nuestros límites → bajar cards a 10–14px e inputs a sutiles 40px/radius 10–14px (anti-patrón #7).
- **DISCREPANCIA — pesos tipográficos.** Task Dasher llega a Bold 700 y números enormes muy bold. **Solo tenemos 400/500** → jerarquía por tamaño+color+aire, no por grosor.
- **DISCREPANCIA — columnas de tabla.** Task Dasher excede 5 columnas. **Recortar a ≤5** (BVC-009).
- **CONFIRMACIÓN — el chasis soft-UI es nuestro modelo.** Canvas casi-blanco + cards blancas flotantes + sombras ultra-sutiles + mucho aire + sidebar con item activo en píldora elevada + avatares circulares/overlapping: todo esto **sí** se hereda y es la base de la compatibilidad (BVC-029).
- **NOTA — el carrito de e-commerce del header** y la página Pricing son de e-commerce: omitir (Pricing solo como inspiración de layout para el catálogo de tipos de tratamiento).

### Decisiones para el equipo de diseño (resumen accionable)

1. **Banner de la ficha = azul sobrio** (degradé `#c5d8e8`→blanco muy tenue o liso). **NUNCA** gradiente aurora. (Patrón 11)
2. **Un solo acento azul dominante** (`#6da8d4`), neutros para todo lo demás; máx 4 tonos azules. Semánticos solo pastel y solo para estado, nunca decoración. (BVC-002, Principio #5)
3. **Texto oscuro sobre azul medio** en CTAs/pills, o azul más profundo derivado para texto blanco. Verificar AA. (nota de contraste)
4. **Jerarquía por tamaño + color + aire** (Red Hat 400/500), no por grosor. Máx 3 tamaños por pantalla. (BVC-001, BVC-022)
5. **Radius 10–14px** en todo; inputs sutiles 40px (no píldoras). Card vive con **borde O sombra**, no ambos. (BVC-004, BVC-005)
6. **Badges de estado pastel** (turno/tratamiento/pago) + **prioridad pastel** + **timestamp relativo** como complemento. (Patrones 6–8)
7. **Tablas ≤5 columnas**; **un filtro visible**; **paginación** (no infinite scroll); **skeletons** al cargar. (BVC-009/011/016/026)
8. **6 tabs en la ficha**, tab inactivo fuera del DOM, sin scroll infinito. (BVC-013, BVC-026)
9. **Multi-pantalla estricto**: cada acción su ruta; modales solo confirmaciones <50% y ≤3 campos; **cero drawers** como contenido principal. (BVC-012/023)
10. **CERO rastro de demo/mock** en toda la UI — presentar como producción real. (BVC-027) **Verificar de punta a punta** (header, footer, Configuración, toasts, notificaciones, copy).
11. **Motion**: un momento de carga orquestado con stagger por pantalla + hover sutil en todo lo clickeable, ≤250ms. (BVC-015, BVC-021)
12. **Persona-céntrico**: foto grande en ficha, avatares circulares en listas, empty states humanos. La ficha del paciente es la pantalla-firma. (Principio #4)
