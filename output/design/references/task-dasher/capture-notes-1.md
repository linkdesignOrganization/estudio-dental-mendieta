# Capture Notes 1 — Task Dasher (referencia visual: ficha de paciente + lista de pacientes)

Referencia capturada como base directa para dos pantallas del proyecto de Clínica Dental:
- **Profile** → base de la **ficha individual del paciente**.
- **Contacts** → base de la **lista/directorio de pacientes**.

Análisis basado en observación visual de los screenshots renderizados (no en extracción de DOM). Las capturas listadas existen como PNG reales en este mismo directorio.

---

## Profile — https://task-dasher.webflow.io/profile

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-profile-fullpage-desktop.png | Desktop 1400px | Página completa: sidebar izq + header con banner gradiente + columna central (About / Experience / Post Activity) + panel derecho (Profile Details / People Also Viewed) |
| td-profile-header-desktop.png | Desktop 1400px | Zona superior: header card con avatar y nombre, inicio del panel derecho |
| td-profile-headercard-detail-desktop.png | Desktop 1400px (detalle) | Acercamiento del header card: avatar circular sobre banner gradiente, nombre, rol, About, chip "Top Skills" |
| td-profile-details-panel-desktop.png | Desktop 1400px (detalle) | Panel derecho "Profile Details": botón Edit Profile + lista de datos (Email/Phone/Website/Location/Language) con icon chips azules |
| td-profile-fullpage-mobile.png | Mobile 375px | Página completa en una sola columna: header centrado, About, Experience, Profile Details, People Also Viewed, Post Activity |
| td-profile-header-mobile.png | Mobile 375px | Header en mobile: avatar centrado solapando el banner, nombre y rol centrados, inicio de About |

### Layout (Desktop)
Estructura de **3 columnas** sobre fondo gris muy claro (#F4F5F7 aprox.):
- **Sidebar de navegación** (izq, ~200px): fondo gris claro casi igual al canvas, logo "Task Dasher" arriba, ítems de menú con icono lineal + label (All Tasks, Timeline, Messages, Profile, Contacts, Company, Pricing, Notifications, Settings, Help Center, Authentication, Admin Pages, Utility Pages). El ítem activo se resalta con una **píldora blanca** de fondo. Algunos ítems llevan un badge numérico azul circular a la derecha (notificaciones).
- **Topbar** fina: campo de búsqueda tipo pill centrado-izquierda; a la derecha un cluster de avatares apilados (stack con solape) + "+8", e iconos de notificaciones / carrito / settings.
- **Columna central (contenido principal)**: la pieza clave es el **header card** del perfil — una tarjeta blanca con un **banner gradiente** (morado→magenta→naranja, estilo "abstract blob") ocupando la franja superior. Sobre el banner, alineado a la **izquierda**, va el **avatar circular grande** con borde/anillo blanco grueso; a su derecha el **nombre** (grande, bold, negro) y debajo el **rol/subtítulo** en gris ("Webflow Dev @ TaskDasher"). Debajo del banner, dentro de la misma card: sección **About** (párrafos de texto gris) y un chip "Top Skills" (icono en cuadro + label). Más abajo, cards independientes: **Experience** (filas con logo de empresa cuadrado, nombre de empresa bold, ubicación, rango de fechas a la derecha, párrafo descriptivo) y **Post Activity** (tarjetas de post con mini-avatar + nombre + fecha relativa + texto + imagen gradiente).
- **Panel derecho (sidebar de datos)**, dos cards apiladas:
  - **Profile Details**: título "Profile Details" + botón **Edit Profile** (outline pill, esquina sup. der.). Lista de datos, cada fila = **icon chip azul redondeado** (glifo blanco) + label pequeño en gris (Email / Phone Number / Website / Location) + valor en negro debajo. Separador fino y abajo "Language → English" con su chip.
  - **People Also Viewed**: lista de mini-perfiles (avatar pequeño circular + nombre bold + rol gris) y, más abajo, un bloque de métricas (Private, Connections 563, Followers, Post Impressions 4396, Searches 3792).

### Layout (Mobile 375px)
Colapsa a **una sola columna**. Cambio importante de composición en el header: en mobile el **avatar se centra** y **solapa el borde inferior del banner** (mitad sobre el gradiente, mitad sobre el blanco), con el **nombre y rol centrados** debajo (no alineados a la izquierda como en desktop). El resto de secciones (About, Experience, Profile Details, People Also Viewed, Post Activity) se apilan verticalmente a ancho completo de la card, manteniendo el mismo tratamiento de icon chips y tipografía. La topbar mobile muestra hamburguesa + cluster de avatares + iconos.

### Avatar / Foto
- **Forma**: círculo perfecto.
- **Tamaño desktop**: grande en el header (~88–96px de diámetro); pequeños (~28–32px) en People Also Viewed y Post Activity.
- **Anillo/borde**: el avatar principal lleva un **borde blanco grueso** (~4px) que lo separa del banner gradiente, dándole efecto "recortado/elevado".
- **Mobile**: mismo círculo con borde blanco, centrado y solapando el banner.

### Paleta de colores observada (hex aproximados)
- Fondo del canvas / app: **#F4F5F7** (gris muy claro, casi blanco).
- Superficies / cards: **#FFFFFF**.
- Texto principal (nombres, valores, headings): **#0E1116 / #1A1A1A** (casi negro).
- Texto secundario (roles, body, labels): **#6B7280 / #8A909A** (gris medio).
- Labels minúsculos (Email/Phone…): gris medio, tamaño ~12px, a veces en mayúsculas suaves.
- **Azul de acento / acción**: **#2D6BFF** aprox. (botones de filtro, icon chips, badges numéricos, ítem activo). Es el color de marca dominante.
- Banner gradiente del header: diagonal **morado profundo #3A1C71 → magenta/violeta #8E2DE2 → coral/naranja #FF6A3D** (degradado "aurora/blob", muy saturado, contrasta con el resto sobrio).
- Bordes/separadores: gris muy tenue **#ECEDEF / #E6E8EB**, líneas de 1px.

### Jerarquía tipográfica
Sans-serif geométrica/neutra (estilo Inter/Helvetica). Escala observada:
- **Nombre (H1 del perfil)**: ~22–24px, bold (700), negro.
- **Rol/subtítulo bajo el nombre**: ~14px, regular, gris.
- **Títulos de sección** (About, Experience, Profile Details): ~16–18px, semibold (600), negro.
- **Valores de datos** (email, teléfono): ~15–16px, medium, negro.
- **Labels de campo** (Email, Phone Number, Website…): ~11–12px, gris, tracking ligeramente abierto.
- **Body / párrafos**: ~14px, regular, gris, interlineado holgado (~1.6).

### Escala de spacing
- Espaciado generoso y aireado. Padding interno de cards ~24–28px.
- Separación entre cards apiladas ~20–24px.
- Gap entre filas de datos en el panel ~16–20px.
- Banner del header card ocupa una franja de ~120–140px de alto en desktop.

### Radius, bordes y sombras
- **Card radius**: ~14–16px (esquinas claramente redondeadas, suaves).
- **Icon chips**: cuadrado redondeado (~10–12px radius), tamaño ~36px, fondo azul sólido, glifo blanco centrado.
- **Botones pill** (Edit Profile, filtros): radius alto / fully-rounded.
- **Sombras**: muy sutiles, difusas y de baja opacidad (sombra ambiental tipo `0 4px 16px rgba(0,0,0,0.04)`). El look se apoya más en el contraste superficie-blanca / canvas-gris que en sombras marcadas. Los bordes son casi inexistentes salvo separadores internos finos.

### Acción primaria
- En Profile la acción primaria visible es **"Edit Profile"** → botón **outline pill** (borde gris, texto negro, fondo blanco) en la esquina sup. der. del panel "Profile Details". No es un botón sólido azul; el azul sólido se reserva para acciones de navegación/filtro.

### Textos extraídos (Profile)
- Nombre: "Michelle Davis" — Rol: "Webflow Dev @ TaskDasher".
- Secciones: About, Experience (Google / Apple / Microsoft con fechas), Top Skills ("Webflow"), Post Activity.
- Panel: "Profile Details", "Edit Profile", campos Email / Phone Number / Website / Location / Language (English).
- "People Also Viewed" + métricas (Connections 563, Post Impressions 4396, Searches 3792).

---

## Contacts — https://task-dasher.webflow.io/contacts

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-contacts-cardview-fullpage-desktop.png | Desktop 1400px | Vista Card View completa: grid de 3 columnas de tarjetas de contacto sobre sidebar |
| td-contacts-cardview-top-desktop.png | Desktop 1400px | Zona superior de Card View: header "Contacts", toggle Card/Table, primera fila de cards |
| td-contacts-card-detail-desktop.png | Desktop 1400px (detalle) | Acercamiento de UNA tarjeta de contacto: avatar grande, nombre/rol/empresa, datos con icon chips, footer "View Details" + editar/eliminar |
| td-contacts-tableview-fullpage-desktop.png | Desktop 1400px | Vista Table View completa: tabla "All Contacts" con columnas Visual/Name/Company/Phone/Email/Last Online + acciones |
| td-contacts-tableview-top-desktop.png | Desktop 1400px | Zona superior de Table View: header de tabla y primeras filas |
| td-contacts-fullpage-mobile.png | Mobile 390px | Vista Card View en mobile (vista principal por defecto): tarjetas apiladas en una columna |

### Vistas disponibles
La página ofrece un **toggle de dos vistas** mediante dos botones pill centrados bajo el título: **"Card View"** (icono `camera_front`) y **"Table View"** (icono `table_rows`). Por defecto está activa **Card View** (botón en azul sólido; el inactivo en azul más claro/translúcido). Ambas vistas son directamente relevantes para la lista de pacientes.

### Card View (Desktop)
- **Grid de 3 columnas** de tarjetas blancas, gap uniforme (~24px), sobre el canvas gris.
- Cada **tarjeta de contacto** contiene, de arriba a abajo:
  1. **Avatar circular grande** (~88–96px), centrado, foto a sangre dentro del círculo.
  2. **Nombre** centrado, bold, negro (~18px) — ej. "John Doe".
  3. **Rol** centrado, pequeño, gris (~12px) — ej. "Sales Manager".
  4. **Empresa** centrada, medium, negro (~14px) — ej. "Apple".
  5. **Separador fino**.
  6. **Lista de datos** (4 filas), cada una = **icon chip azul redondeado** (glifo blanco: globo/teléfono/sobre/pin) + label gris pequeño (Website / Phone Number / Email / Location) + valor negro debajo.
  7. **Separador fino** y **footer**: a la izquierda link **"View Details"** (negro) con una **mini-caja gris con flecha →** (botón cuadrado redondeado gris claro); a la derecha **iconos de acción inline editar (lápiz) y eliminar (papelera)** en gris.

### Table View (Desktop) — estructura más cercana a "lista de pacientes"
Card blanca "All Contacts" con indicador de rango **"1 - 100"** en la esquina sup. der. Tabla con cabecera de columnas en gris pequeño (uppercase) y filas separadas por líneas finas. **6 columnas de contenido + 1 de acciones**:
1. **Checkbox** de selección (incluye uno en la cabecera para seleccionar todo).
2. **VISUAL** → **avatar circular pequeño** (~28–32px). (Detalle de render: detrás de algunos avatares se ve un placeholder de texto "Loremip" del template, pero el patrón es avatar-en-celda.)
3. **NAME** → nombre en negro, medium (ej. "John Doe", "Sarah Johnson").
4. **COMPANY** → texto gris/negro (Apple, Hp, Google, Microsoft, Facebook, Twitter, Amazon, Netflix, Samsung, Intel).
5. **PHONE NUMBER** → número (ej. "+055-987-6543").
6. **EMAIL ADDRESS** → email en gris/azulado, ligado.
7. **LAST ONLINE** → **tiempo relativo** en texto ("2 days ago", "5 days ago", "9 days ago", "3 days ago"…). Este es el equivalente al "last updated / última actualización" relativo solicitado.
8. **Acciones** (col. final) → **editar (lápiz)** y **eliminar (papelera)** en gris, alineadas a la derecha.
Las filas tienen **alto cómodo** (~48px), zebra implícito muy sutil (todo blanco con separadores tenues), y buen aire horizontal entre columnas.

### Card View (Mobile 390px)
Las tarjetas se apilan en **una sola columna** a ancho completo. Cada card mantiene exactamente el patrón de desktop: **avatar circular grande centrado**, nombre bold / rol gris / empresa, las 4 filas de datos con icon chips azules, y el footer "View Details" + lápiz/papelera. Arriba del listado se mantienen el título "Contacts", el subtítulo lorem y los dos botones de toggle (Card / Table) apilados/centrados. Topbar mobile con cluster de avatares "+8" e iconos.

### Avatares y badges (resumen para la lista de pacientes)
- **Avatares**: siempre **circulares**. Grandes (~90px) y centrados en Card View; pequeños (~30px) en la columna Visual de Table View. Foto a sangre, sin borde notable en las versiones pequeñas; en Card View el círculo va limpio sobre blanco.
- **Badges de estado**: este template **NO usa píldoras de estado con colores suaves** (tipo "Activo/Pendiente" en verde/ámbar). El indicador de estado/actividad se resuelve como **texto de tiempo relativo** ("Last Online: 2 days ago"). → Para el proyecto de la clínica, si se requieren badges de estado de paciente (Activo / En tratamiento / Inactivo), habría que **introducirlos** siguiendo el lenguaje cromático del sistema (chips redondeados suaves), tomando de aquí el patrón de "última actualización relativa" como complemento, no como sustituto.

### Paleta de colores observada (Contacts)
Idéntica al sistema de Profile: canvas **#F4F5F7**, cards **#FFFFFF**, texto **#1A1A1A** / secundario **#6B7280**, **acento azul #2D6BFF** (botones de toggle, icon chips, checkboxes activos). Sin gradientes en Contacts (el gradiente queda reservado al header del Profile). Conjunto muy sobrio y limpio, alto contraste blanco-sobre-gris.

### Jerarquía tipográfica (Contacts)
- Título de página "Contacts": ~24px bold negro; subtítulo lorem ~14px gris.
- Nombre en card: ~18px bold; rol ~12px gris; empresa ~14px medium.
- Cabeceras de tabla: ~11px uppercase gris, tracking abierto.
- Celdas de tabla: ~14px, nombre en negro, resto en gris/negro.

### Spacing, radius, sombras (Contacts)
- Card radius ~14–16px; icon chips ~10–12px radius (azul sólido, glifo blanco).
- Botones de toggle: pill totalmente redondeado, con icono + label, azul sólido (activo) / azul translúcido (inactivo).
- Sombras sutiles y difusas igual que en Profile; separadores de tabla en gris 1px muy tenue.
- Padding interno de card ~24px; gap del grid ~24px.

### Acciones inline
- En **card**: "View Details" (con caja-flecha gris) + lápiz (editar) + papelera (eliminar).
- En **tabla**: lápiz + papelera por fila; checkbox de selección por fila y en cabecera (selección masiva).

### Textos extraídos (Contacts)
- Título: "Contacts" + subtítulo lorem ipsum.
- Toggle: "Card View" / "Table View".
- Card header de tabla: "All Contacts" + rango "1 - 100".
- Columnas: VISUAL · NAME · COMPANY · PHONE NUMBER · EMAIL ADDRESS · LAST ONLINE.
- Contactos ejemplo: John Doe (Sales Manager, Apple, San Diego), Mike Bay (Data Scientist, Microsoft, Denver), David Smith (Analytics Manager, Samsung), Jessica Doe (Research Analyst, Google), Sarah Johnson (Analytics Consultant, Hp), Michelle Davis (Marketing Manager, Intel).
- "Last Online": "2 days ago", "5 days ago", "9 days ago", "3 days ago", "8 days ago", "4 days ago".

---

## Relevancia para el Proyecto (Clínica Dental)

**Profile → Ficha del paciente.** Patrones más valiosos a aplicar:
1. **Header card con avatar circular grande + nombre bold a un lado y datos clave** — traducir a foto del paciente + nombre + (edad/expediente/estado) al costado. (Considerar si el banner gradiente encaja con un tono clínico más sobrio; puede sustituirse por un banner de color de marca plano o muy sutil.)
2. **Panel lateral de datos con icon chips** (Email/Phone/Website/Location) → panel de datos del paciente (teléfono, email, dirección, seguro/aseguradora, fecha de nacimiento) con el mismo patrón chip-azul + label gris + valor negro.
3. **Layout de 3 columnas en desktop que colapsa limpio a 1 columna en mobile** con el avatar recentrado — excelente base responsive.
4. **Secciones apiladas tipo "Experience"** → reutilizables como **historial clínico / tratamientos / citas** (fila con icono/logo + título + fecha a la derecha + descripción).
5. **Acción primaria como pill** ("Edit Profile") → "Editar paciente" / "Nueva cita".

**Contacts → Lista/directorio de pacientes.** Patrones más valiosos:
1. **Doble vista Card / Table con toggle pill** — ideal para alternar entre vista visual (tarjetas con foto) y vista densa (tabla) del directorio de pacientes.
2. **Table View como base de la tabla de pacientes**: columnas Visual(avatar) · Nombre · (Compañía→reemplazar por **Tratamiento/Doctor asignado**) · Teléfono · Email · **Last Online→reemplazar por "Última visita / Última actualización" relativa** · acciones (editar/eliminar), con checkbox de selección masiva y contador de rango "1-100".
3. **Avatares circulares pequeños en la celda Visual** y grandes/centrados en las cards.
4. **Acciones inline (lápiz/papelera) discretas en gris** por registro.

**A introducir (no existe en la referencia):**
- **Badges de estado con colores suaves** (Activo / En tratamiento / Pendiente / Inactivo): el template usa tiempo relativo en texto, no chips de estado. Conviene **añadir** badges redondeados de bajo contraste cromático coherentes con el azul de marca + una paleta semántica suave (verde/ámbar/gris), manteniendo el resto del lenguaje visual sobrio de Task Dasher.

**Lenguaje visual a heredar globalmente:** canvas gris muy claro + superficies blancas, **azul #2D6BFF como único acento fuerte**, tipografía sans neutra, radius 14–16px, sombras muy sutiles, icon chips azules redondeados, y mucho aire/whitespace. El gradiente aurora del header de Profile es el elemento más "expresivo" del kit y debe usarse con moderación (o atenuarse) en un contexto clínico.
