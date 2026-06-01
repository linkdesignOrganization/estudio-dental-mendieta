# Capture Notes 2 — Task Dasher (Capturer 2 de 4)

> Análisis visual REAL basado en observación directa de los screenshots PNG capturados con `browser_take_screenshot` (viewport desktop 1440px y mobile 390px). Los textos literales se confirmaron con el accessibility snapshot, pero TODA descripción de color/layout/tipografía/spacing proviene de la inspección visual de las imágenes.
> URLs cubiertas por esta corrida: `/` (All Tasks / dashboard) y `/companies`.

---

## Task Dasher — Dashboard "All Tasks" — https://task-dasher.webflow.io/

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-home-fullpage-desktop.png | Desktop 1440px | Página completa: sidebar + header + 3 project cards (anillos de progreso) + lista Tasks + tabla Projects + 3 company cards (milestones) |
| td-home-header-cards-desktop.png | Desktop 1440px | Zona superior en detalle: sidebar limpio con item activo, header (search + avatares +8 + iconos), 3 cards con porcentaje grande (38/74/56) y anillo "Progress", panel derecho de task cards |
| td-home-table-desktop.png | Desktop 1440px | Tasks (barras de progreso anchas) + tabla de Projects con avatares, status badges y priority pills |
| td-home-company-cards-desktop.png | Desktop 1440px | 3 company cards (Apple/Google/Microsoft) con status+priority, "Milestones Completed: X/Y", barra de progreso, % y AVATARES OVERLAPPING del equipo |
| td-home-fullpage-mobile.png | Mobile 390px | Página completa en 1 columna: header colapsado, project cards apiladas, tasks, cards de proyecto, tabla transformada a layout vertical, company cards apiladas |
| td-home-nav-mobile.png | Mobile 390px | Drawer de navegación mobile abierto (overlay): logo + X, items con icono+label, item activo destacado, badges azules, secciones con chevron |

### Análisis Visual Detallado

**Layout general (Desktop):**
- Estructura de 2 columnas fijas: SIDEBAR estrecho a la izquierda (~230-250px) + ÁREA DE CONTENIDO a la derecha sobre fondo gris muy claro.
- El fondo global del área de contenido es un gris casi blanco (aprox. `#F4F5F7` / `#F5F6F8`), y TODAS las superficies de contenido (cards, sidebar, header search) son blancas `#FFFFFF`. Esto crea una estética "soft UI" limpia donde las cards "flotan" sobre el gris con sombras muy suaves.
- El contenido se organiza en bloques tipo dashboard: fila de 3 project cards (col izquierda 2/3) + panel de task cards (col derecha 1/3), luego Tasks (barras) + tabla Projects, y al pie 3 company cards en grilla de 3.

**Sidebar (limpio, lo que las notas piden documentar):**
- Fondo blanco, ancho fijo. Arriba: logo = icono de capas/diamante negro (`layers`) + wordmark "Task Dasher" en negro, peso bold/semibold, junto a un icono hamburguesa (`menu`).
- Items de navegación apilados verticalmente: cada uno es un icono outline gris + label en gris medio (`#6B7280` aprox). Orden: All Tasks, Timeline, Messages, Profile, Contacts, Company, Pricing, Notifications.
- ITEM ACTIVO destacado: "All Tasks" se muestra dentro de una píldora/rectángulo redondeado BLANCO con una sombra sutil que lo eleva del resto (efecto "card flotante" dentro del sidebar). El texto del item activo es más oscuro/negro que los inactivos. Radius del pill activo: generoso (~12-14px).
- Badges de conteo: Messages y Notifications llevan un badge circular AZUL (`#2D6BFF` aprox) con número blanco (3) alineado a la derecha del label.
- Separador horizontal sutil divide el bloque principal del bloque inferior (Settings, Help Center, Authentication, Admin Pages, Utility Pages). Los 3 últimos llevan chevron `>` indicando submenú.
- Al pie del sidebar (visible en desktop): mini-card de perfil con avatar circular "Jane Doe / UX/UI Designer".

**Header (search contextual + notificaciones + avatares):**
- Barra superior sobre el área de contenido. A la IZQUIERDA: search bar tipo PÍLDORA totalmente redondeada (radius full/pill), fondo blanco, con icono lupa gris + placeholder "Search" en gris claro. Ocupa buen ancho a la izquierda (contextual).
- A la DERECHA: cluster de AVATARES OVERLAPPING — 4 avatares circulares solapados (~28-32px, con borde blanco que los separa visualmente) seguidos de un círculo AZUL sólido con "+8" en texto blanco. Después, fila de iconos de acción: campana de notificaciones (con dot indicador), carrito (`shopping_cart` con contador "0"), engranaje settings. Iconos en gris/negro outline.

**Project Cards con anillo de progreso (la BASE del dashboard — porcentaje grande):**
- 3 cards blancas en fila, cada una con radius generoso (~16-20px) y sombra muy suave.
- Cada card contiene un ANILLO/GAUGE de progreso semicircular-a-circular (donut gauge) centrado. El anillo tiene un track gris claro de fondo y un arco de color que indica el avance.
- En el CENTRO del anillo: porcentaje GRANDE en negro bold (`38`, `74`, `56`) con el símbolo `%` en superíndice pequeño. Encima del número, label "PROGRESS" en gris pequeño en mayúsculas/tracking. A los lados del arco, marcadores "0%" (izq) y "100%" (der) en gris pequeño.
- Colores de los arcos (uno por card, paleta pastel/saturada media): card 1 = ROSA (`#F7A8C4` / `#F48FB1` aprox), card 2 = AZUL (`#2D6BFF` / `#3B82F6`), card 3 = AMARILLO-DORADO (`#F5C451` / `#F6C244`).
- Debajo del anillo: título de la card en negro semibold (UX/UI Research, Brand Identity, Logo Design). Esquina superior derecha: icono `more_horiz` (tres puntos) en gris.

**Task Cards — panel derecho (lista compacta con avatares):**
- Columna derecha del bloque superior: card blanca contenedora con varias mini-task-cards apiladas (Email Marketing, Design Review, Customer Research, UX Analysis).
- Cada mini-task: icono cuadrado redondeado de color (mail/agenda/people/grid) + título en negro + subcategoría en gris pequeño; a la derecha el % (ej 68%, 91%, 42%, 57%). Debajo: barra de progreso FINA de color + cluster de avatares overlapping (4 avatares) + badge de prioridad (pill).
- Badges de prioridad aquí: "Mid" = pill AMARILLO/ámbar, "Low" = pill VERDE, "High" = pill ROJO/naranja saturado. Texto blanco, esquinas full-redondeadas.

**Tasks — barras de progreso anchas (sección "Tasks"):**
- 3 barras horizontales gruesas (estilo "track relleno"), cada una con esquinas full-redondeadas (pill). Dentro de la barra, a la izquierda: avatar circular + título en blanco (Market Research/Advertising) sobre la porción rellena; el relleno es de color saturado y la porción no completada es el mismo color en versión muy clara/pastel.
- Colores: Market Research = AZUL (relleno azul medio + resto azul muy claro) 68%; Content Strategy = ROSA 91%; Vendor Evaluation = AMARILLO/ámbar 42%. El `%` aparece a la derecha en color a juego, peso medio.

**Tabla de Projects (lista detallada):**
- Card blanca con header "Projects" + contador "1 - 10" a la derecha.
- Fila de encabezados en gris pequeño mayúsculas: checkbox · VISUAL · DESIGNER · TASK · STATUS · PRIORITY · LAST UPDATED · (acciones).
- Filas: checkbox + avatar circular pequeño + nombre (negro semibold) + tarea (gris) + STATUS badge + PRIORITY pill + tiempo relativo + iconos edit (`create`) / delete.
- STATUS badges = estilo "soft/ghost": punto o icono circular de color + texto, fondo muy tenue. Variantes: "Completed" (verde), "On Review" (naranja/ámbar), "In Queue" (amarillo), "In Progress" (azul). Cada uno con su icono (check / ojo / repeat / rotate).
- PRIORITY pills = SÓLIDOS coloridos con texto blanco: High (rojo-naranja `#FF5A3C`/`#F4511E`), Mid (amarillo/ámbar), Low (verde). Esquinas full-redondeadas.
- Separadores horizontales muy sutiles entre filas; mucho aire vertical (filas cómodas, no apretadas).

**Company Cards con MILESTONES + AVATARES OVERLAPPING (base de la lista de obras sociales):**
- 3 cards blancas en grilla de 3 al pie del dashboard (Apple, Google, Microsoft). Radius generoso, sombra suave.
- Estructura interna de cada card:
  - Esquina superior derecha: icono `more_horiz`.
  - Fila superior: LOGO de la marca (Apple negro, Google multicolor, Microsoft 4 cuadros) a la izquierda + nombre en negro bold (`Apple`) + ubicación en gris pequeño debajo (`Apple Park, CA` / `Mountain View, CA` / `Redmond, WA`).
  - Fila de estado: STATUS badge soft (In Progress azul / In Queue amarillo / On Review naranja) + PRIORITY pill (Mid ámbar / Low verde / High rojo).
  - Texto "Milestones Completed: 5 / 8" (negro, los números destacan) — métrica de avance.
  - Barra de progreso FINA de color con el `%` a la derecha (57% verde, 91% rosa, 42% ámbar). El color de la barra parece mapear al estado/categoría.
  - AVATARES OVERLAPPING del equipo asignado: 4 avatares circulares solapados (con borde blanco) en la esquina inferior. En estas cards del dashboard se muestran 4 avatares apilados (sin "+N" visible aquí; el "+N" sí aparece en el header y en otros clusters).

**Paleta de colores observada (consolidada):**
- Fondo app: gris muy claro `#F4F5F7` aprox.
- Superficies (cards/sidebar/search): blanco `#FFFFFF`.
- Texto principal: casi negro `#1A1A1A` / `#111827`.
- Texto secundario/labels: gris medio `#6B7280` / `#9AA0A6`.
- Acento primario / azul de marca: `#2D6BFF` ~ `#3B82F6` (badges, +8, tab activo, status In Progress, iconos de las company-contact cards).
- Verde (Completed/Low/éxito): `#22C55E` ~ `#2FBF71`.
- Amarillo/ámbar (Mid/In Queue): `#F5C451` ~ `#F6B73C`.
- Rojo-naranja (High/urgente): `#FF5A3C` ~ `#F4511E`.
- Rosa (decorativo de progreso): `#F48FB1` ~ `#F7A8C4`.
- Nota: la paleta de estados es CONSISTENTE entre componentes (mismo verde/ámbar/rojo/azul para status y priority en cards, tabla y task-cards).

**Tipografía:**
- Sans-serif geométrica/neo-grotesque limpia (probable Inter / similar de Webflow). 
- Headings de sección ("Tasks", "Projects", "Companies"): bold, ~20-24px.
- Números de progreso grandes (38/74/56): muy bold, ~40-48px, con `%` en superíndice pequeño.
- Nombres en listas: semibold ~14-15px. Labels/categorías/tiempos: regular ~11-13px en gris.
- Labels de columna y "PROGRESS": mayúsculas con tracking, gris, ~10-11px.

**Spacing, radius y sombras:**
- Radius: cards principales ~16-20px; pills/badges full (999px); barras de progreso full; pill del item activo del sidebar ~12-14px.
- Sombras: muy suaves y difusas, baja opacidad (estética soft-UI), sin bordes duros; las cards se separan del fondo por sombra + el contraste blanco/gris.
- Spacing: generoso padding interno en cards (~20-24px) y buen gutter entre cards de la grilla (~20-24px). Filas de tabla con alto cómodo.

**Comportamiento responsive (Mobile 390px):**
- Sidebar desaparece y se convierte en DRAWER overlay accesible por hamburguesa (ver td-home-nav-mobile.png).
- Header colapsa a: hamburguesa (izq) + cluster de avatares +8 + iconos (notif/cart/settings) a la derecha. El search bar full-width desaparece del header en mobile.
- Todo el contenido pasa a 1 COLUMNA apilada: project cards (anillos) una debajo de otra a ancho completo, tasks como barras apiladas, task-cards apiladas, y la TABLA de Projects se transforma de columnas a un layout VERTICAL tipo "ficha" (label a la izquierda / valor a la derecha por fila: Visual, Designer, Task, Status, Priority, Last Updated). Company cards también apiladas a ancho completo conservando milestones + barra + avatares overlapping.

**Drawer de navegación mobile (td-home-nav-mobile.png):**
- Panel blanco que entra desde la izquierda como overlay. Arriba: logo "Task Dasher" + icono `X` para cerrar (reemplaza la hamburguesa).
- Header del drawer conserva avatares +8 + iconos.
- Items grandes táctiles: icono outline gris + label; item ACTIVO "All Tasks" en píldora blanca con sombra (mismo patrón que desktop). Badges azules en Messages (3) y Notifications (8 en esta vista). Separador + sección inferior (Settings, Help Center, Authentication >, Admin Pages >, Utility Pages >).

**Textos extraídos (literales):**
- Sidebar/nav: All Tasks · Timeline · Messages · Profile · Contacts · Company · Pricing · Notifications · Settings · Help Center · Authentication · Admin Pages · Utility Pages.
- Project cards: "PROGRESS" + "UX/UI Research", "Brand Identity", "Logo Design".
- Company cards: "Milestones Completed: 5 / 8", "Apple Park, CA", "Mountain View, CA", "Redmond, WA".
- Estados: Completed / On Review / In Queue / In Progress. Prioridades: High / Mid / Low.
- Footer: "©Task Dasher. All Rights Reserved." · "Built by Yves Adrales" · "Powered by Webflow".

### Relevancia para el Proyecto
- **Lo que el proyecto QUIERE de esta referencia:** es la BASE del dashboard y de las cards. Patrones clave a aplicar: (1) cards de proyecto con anillo de progreso + porcentaje grande + "Progress"; (2) sidebar limpio con item activo destacado por pill blanco + sombra; (3) header con search contextual a la derecha/izquierda, notificaciones con badge y avatar; (4) sistema de status badges (soft) + priority pills (sólidos) con paleta consistente verde/ámbar/rojo/azul; (5) lista de tasks con avatares.
- **Patrones más valiosos para aplicar (top 5):**
  1. Anillo/gauge de progreso con número grande centrado + "PROGRESS" + marcadores 0/100% — ideal para KPIs de tratamientos/casos.
  2. Estética soft-UI: fondo gris claro + cards blancas flotantes con sombras suaves y radius generoso.
  3. Item de navegación activo como píldora blanca elevada dentro del sidebar.
  4. Doble sistema de estado: STATUS soft-badge (con icono) para fase + PRIORITY pill sólido para urgencia.
  5. Avatares overlapping (con borde blanco + "+N" azul) para representar equipos asignados.

---

## Task Dasher — Companies — https://task-dasher.webflow.io/companies

> IMPORTANTE: La vista por defecto de `/companies` ("Card View") muestra cards de CONTACTO de empresa (logo + Website/Phone/Email/Location + botón "View Website"), NO cards con milestones/avatares overlapping. La alternativa "Table View" lista contactos (Logo/Company/Industry/Phone/Website/Date Added). Las CARDS DE COMPANY CON MILESTONES + AVATARES OVERLAPPING + progreso "5/8" que describen las notas viven en el DASHBOARD (URL 1) y están documentadas arriba en `td-home-company-cards-desktop.png`. Aquí documento ambos patrones de `/companies` por completitud y porque sirven de base para la "lista de obras sociales" (grilla de cards de entidad + vista tabla alternativa).

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-companies-fullpage-desktop.png | Desktop 1440px | Página completa "Card View": sidebar (Company activo), header, título "Companies" + tabs, grilla 3×2 de company-contact cards (Apple/Google/Meta/Microsoft/Samsung/HP) |
| td-companies-cards-detail-desktop.png | Desktop 1440px | Detalle de la primera fila de cards: logos en círculo, nombre, mini-stats con iconos azules (Website/Phone/Email/Location), tabs azules |
| td-companies-table-desktop.png | Desktop 1440px | "Table View": tabla de contactos con Logo, Company, Industry, Phone Number, Website, Date Added + checkboxes y acciones |
| td-companies-fullpage-mobile.png | Mobile 390px | "Card View" en 1 columna: tabs apilados + company-contact cards apiladas a ancho completo |

### Análisis Visual Detallado

**Layout general (Desktop):**
- Mismo chasis que el dashboard: SIDEBAR blanco a la izquierda (ahora con "Company" como item activo, en pill blanco elevado) + área de contenido sobre fondo gris claro `#F4F5F7`.
- Header idéntico: search pill a la izquierda + avatares overlapping (+8) + iconos notif/cart/settings a la derecha.
- Encabezado de página: título "Companies" grande en negro bold (~28-32px) + subtítulo/descripción lorem ipsum en gris medio.
- Debajo, CONTROL DE TABS (toggle de vista) centrado: dos botones píldora — "CARD VIEW" (activo, AZUL sólido `#2D6BFF`, texto blanco, con icono) y "TABLE VIEW" (inactivo, azul más claro/translúcido, texto blanco). Esquinas full-redondeadas.

**Company-contact cards (grilla — base de la lista de obras sociales):**
- Grilla de 3 columnas × 2 filas (6 cards: Apple, Google, Meta, Microsoft, Samsung, HP). En mobile colapsa a 1 columna.
- Cada card: superficie blanca, radius generoso (~16-20px), sombra suave, padding amplio.
- TRATAMIENTO DEL LOGO: logo de la marca centrado en la parte superior DENTRO de un CÍRCULO con borde gris muy sutil (contenedor circular ~90-110px). Logos a color real (Apple negro, Google multicolor, Meta azul, Microsoft 4 cuadros, Samsung azul, HP azul). Debajo del logo, NOMBRE de la empresa centrado en negro bold.
- Línea divisora horizontal sutil separa el header (logo+nombre) del cuerpo.
- MINI-STATS (cuerpo): 4 filas, cada una = icono circular AZUL sólido (`#2D6BFF`) con glifo blanco (globe/phone/mail/location) + a la derecha label gris pequeño arriba ("Website"/"Phone Number"/"Email"/"Location") y el VALOR en negro debajo (apple.com / +0 (123) 456 789 / support@apple.com / New York City). Los iconos azules circulares son el acento visual dominante de la card.
- PIE de card: botón/enlace "View Website" (texto + flecha `arrow_right_alt`) a la izquierda + iconos de acción edit (`create`) / delete a la derecha. El botón "View Website" se ve como texto con CTA sutil (en mobile la flecha va en un pill gris claro).

**Table View (vista tabla alternativa):**
- Card blanca contenedora con header "All Contacts" + contador "1 - 100".
- Encabezados de columna en gris pequeño: checkbox · Logo · Company · Industry (con `unfold_more` para ordenar) · Phone Number · website · Date Added · (acciones).
- Filas: checkbox + LOGO de marca pequeño + nombre empresa (negro) + Industry (gris: Technology / Consumer Electronics / Advertising / Information Technology / Semiconductors) + teléfono + dominio web + fecha relativa ("2 days ago") + iconos edit/delete.
- Mismo lenguaje visual que la tabla de Projects del dashboard (filas cómodas, separadores sutiles, encabezados gris mayúsculas, acciones a la derecha). No hay badges de color aquí (es una tabla de datos pura).

**Paleta de colores observada:**
- Idéntica al dashboard: fondo `#F4F5F7`, superficies blancas, texto `#1A1A1A`, secundario `#6B7280`.
- Acento AZUL dominante en esta página: `#2D6BFF`/`#3B82F6` para los iconos circulares de las mini-stats, el tab activo "Card View", el círculo "+8" y el badge de nav. La página /companies es notablemente más "monocroma azul" que el dashboard (que usa más rosa/ámbar/verde en progreso).
- Tab inactivo "Table View": azul a ~50-60% de opacidad (mismo hue, más claro).

**Tipografía:**
- Consistente con el dashboard. Título "Companies" bold grande; nombres de empresa en cards bold ~18px; labels de mini-stats ~11px gris; valores ~14-15px negro. Tabla con headers gris mayúsculas y celdas regular.

**Spacing, radius y sombras:**
- Cards radius ~16-20px, sombras suaves. Tabs radius full (pill). Iconos de mini-stats en círculos sólidos ~32-36px. Gutter de grilla ~20-24px. Padding interno de card amplio (~24px). Mucho aire alrededor del bloque de tabs (centrado con margen superior notable).

**Comportamiento responsive (Mobile 390px):**
- Sidebar → drawer (mismo patrón que dashboard). Header colapsa a hamburguesa + avatares + iconos.
- Tabs "Card View" / "Table View" se mantienen como dos pills, centrados, apilados horizontalmente bajo el título.
- Grilla de cards → 1 COLUMNA: cada company-contact card a ancho completo, conservando logo en círculo centrado, nombre, divisor, mini-stats con iconos azules y pie con "View Website" + flecha (en pill gris) + acciones. El layout interno de la card no cambia, solo se hace full-width.

**Textos extraídos (literales):**
- Título: "Companies" + "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."
- Tabs: "Card View" / "Table View".
- Cards (Card View): Apple/apple.com/+0 (123) 456 789/support@apple.com/New York City · Google/google.com/Chicago · Meta/meta.com/Seattle · Microsoft/microsoft.com/Denver · Samsung/samsung.com/San Francisco · Hp/hp.com/Los Angeles. CTA: "View Website".
- Tabla (Table View): "All Contacts" · columnas Logo/Company/Industry/Phone Number/website/Date Added. Industrias: Technology, Consumer Electronics, Advertising, Information Technology, Semiconductors. Empresas extra en tabla: LG, Intel, Dell, Lenovo.

### Relevancia para el Proyecto
- **Lo que el proyecto QUIERE de esta referencia:** base de la "lista de obras sociales". Patrón clave: GRILLA DE CARDS DE ENTIDAD con logo en círculo + mini-stats con iconos circulares de color + CTA al pie, con TOGGLE de vista Card/Table. La vista tabla alternativa sirve como modo "denso" de la misma data.
- **Matiz importante:** las cards con LOGO + UBICACIÓN/MÉTRICAS + STATUS + PRIORIDAD + PROGRESO DE MILESTONES (5/8) + AVATARES OVERLAPPING que describen las notas NO están en `/companies` (que usa cards de contacto) sino en las COMPANY CARDS DEL DASHBOARD (`td-home-company-cards-desktop.png`). Para "obras sociales con milestones y equipo asignado", el patrón a replicar es el del dashboard; para "directorio de obras sociales con datos de contacto", el patrón es el de `/companies`. Conviene FUSIONAR ambos: card de entidad con logo en círculo (de /companies) + bloque de milestones/progreso + avatares overlapping (del dashboard).
- **Patrones más valiosos para aplicar (top 5):**
  1. Card de entidad con logo centrado en círculo con borde sutil + nombre bold debajo.
  2. Mini-stats con icono circular sólido de color + label gris + valor negro (legibilidad y escaneabilidad altas).
  3. Toggle de vista Card View / Table View como pills (vista visual vs. vista densa de la misma colección).
  4. Reutilización del mismo chasis (sidebar + header) entre vistas → consistencia del producto.
  5. (Fusionado con dashboard) bloque "Milestones Completed: X/Y" + barra de progreso + avatares overlapping para representar avance y equipo de cada entidad.
