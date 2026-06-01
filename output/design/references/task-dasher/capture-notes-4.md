# Capture Notes 4 de 4 — Task Dasher (Notifications & Messages)

> Capturer 4 de 4 (último). Foco: patrones de LISTA aplicables a notificaciones internas
> de la clínica dental (turno por confirmar, pago vencido, cumpleaños de paciente, tratamiento
> próximo a vencer) y patrones complementarios de lista de conversaciones/mensajes.
> Todo el análisis visual proviene de observación directa de screenshots PNG reales capturados
> a 1440px (desktop) y 390px (mobile), no de extracción de DOM.

---

## Notifications — https://task-dasher.webflow.io/notifications

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-notifications-fullpage-desktop.png | Desktop 1440px | Página completa: sidebar nav + header + tabs filtro (All/Inbox/Unread) + lista de notificaciones en card |
| td-notifications-list-detail-desktop.png | Desktop 1440px | Detalle ampliado de la lista: tabs filtro y los 6 items de notificación con icono/avatar, título, subtítulo y timestamp |
| td-notifications-fullpage-mobile.png | Mobile 390px | Página completa en mobile: header colapsado, tabs en scroll horizontal, lista con timestamp en segunda línea |

### Análisis Visual Detallado

**Layout general (Desktop):**
- Layout de 2 zonas: sidebar de navegación fija a la izquierda (~230px) + área de contenido principal a la derecha sobre fondo gris muy claro (#F4F5F7 aprox).
- El contenido NO usa todo el ancho: la lista de notificaciones está contenida en una card blanca centrada-derecha con esquinas muy redondeadas (~24px radius) y sombra extremadamente sutil (casi imperceptible, da sensación "flat premium").
- Generoso whitespace alrededor de la card; los tabs de filtro flotan centrados arriba de la card con su propio espacio.

**Tabs de filtro (componente clave para "agrupación por estado"):**
- 3 pills horizontales centradas: "ALL" / "INBOX" / "UNREAD".
- Pill activa (ALL): fondo azul saturado sólido (~#2C6BED / #2D6BF0), texto blanco en mayúsculas con tracking amplio, icono a la izquierda (checklist). Esquinas tipo pill (border-radius alto, casi 50%).
- Pills inactivas (INBOX, UNREAD): mismo azul pero translúcido/desaturado (~#7FA8F5, como azul al 50-60% opacidad), texto blanco. Mantienen icono (email, mark_as_unread).
- Badge de contador en UNREAD: pequeño círculo ROJO (#F5413D aprox) con número blanco "3", posicionado en la esquina superior derecha del pill (estilo notification badge). Este es el patrón directo para "N notificaciones sin leer".

**Tratamiento de items de lista (el patrón más valioso):**
- Cada item es una fila horizontal dentro de la card blanca. NO hay card por item; se separan con un divider hairline gris muy claro (#ECECEC / #EEE aprox), 1px, casi al ras del ancho de la card.
- Estructura de cada item (izq → der):
  - **Leading visual circular (~44px):** DOS variantes coexistiendo en la misma lista:
    1. Notificaciones de sistema/evento → círculo de fondo azul sólido (#2C6BED) con icono blanco Material centrado (point_of_sale para "Sales Report"/"Team Project", inventory_2 para "New Product"). → Aplicable a clínica: usar icono temático por tipo (calendar para turno, payments para pago vencido, cake para cumpleaños, medical para tratamiento).
    2. Notificaciones de persona → foto de avatar circular real (John Doe, Ray Catcher, Jessica Doe). → Aplicable a mensajes/interacciones de paciente.
  - **Bloque de texto (2 líneas):** Título en bold, color casi negro (#1A1A2E aprox), ~16px. Subtítulo/descripción debajo en gris medio (#9A9AA5 aprox), ~12-13px regular ("Document file is received", "Sent you a message", "New product is received").
  - **Timestamp relativo (trailing):** alineado a la derecha, gris medio (#8A8A95 aprox), ~13px. Formato relativo legible: "30 mins ago", "1 hr ago", "5 hrs ago", "9 hrs ago", "10 hrs ago", "13 hrs ago". → Patrón directo para nuestros timestamps relativos.
- **Estado leído/no leído:** En este template NO hay diferenciación visual marcada por item (fondo o punto) — el conteo de no-leídos se comunica a nivel agregado vía el badge rojo "3" en el tab UNREAD y vía el badge azul "3" en el ítem de navegación lateral. NOTA para nuestro diseño: si necesitamos marcar no-leído por item, deberemos añadir un indicador (dot azul leading o fondo tintado) que el template no provee — referencia útil pero incompleta en este aspecto.
- **Agrupaciones por fecha:** NO hay headers de agrupación ("Hoy"/"Ayer"); es una lista plana ordenada por recencia descendente. Las notas de nuestro proyecto piden agrupaciones si las hay → este template NO las tiene, se confirma ausencia.
- **Acciones por item:** No hay acciones visibles inline (sin botón archivar/marcar/borrar al hover en el estado capturado). Item completo parece clickable.

**Sidebar de navegación (contexto):**
- Items con icono Material a la izquierda + label. Item activo "Notifications" destacado con fondo blanco "pill" elevado (resto del sidebar es gris claro) → patrón de estado activo por elevación/contraste.
- "Messages" y "Notifications" muestran badge azul redondeado "3" a la derecha del label (contador de pendientes en la nav). → Patrón directo para badges de conteo en menú lateral.

**Header superior:**
- Searchbar pill blanca ancha a la izquierda-centro (icono lupa + placeholder "Search").
- Cluster derecho: stack de avatares solapados del equipo (4 fotos circulares + badge "+8" azul para overflow) + iconos de notificación (campana, con dot azul indicador), carrito (badge "0"), settings. La campana lleva un pequeño dot azul = indicador de hay-novedades sin número.

**Paleta de colores observada (Notifications):**
- Azul primario / acento: ~#2C6BED (pills activos, iconos de sistema, badges de nav).
- Azul secundario translúcido: ~#7FA8F5 (pills inactivos).
- Rojo de alerta/badge: ~#F5413D (contador de no-leídos en tab UNREAD).
- Fondo app: ~#F4F5F7 (gris muy claro).
- Superficie/cards: #FFFFFF.
- Texto principal: ~#1A1A2E (casi negro azulado).
- Texto secundario/timestamp: ~#8A8A95–#9A9AA5 (gris medio).
- Divider: ~#ECECEC.

**Tipografía:**
- Sans-serif geométrica/neo-grotesca (consistente con resto del template, probablemente la fuente del style guide de Task Dasher).
- Títulos de item: bold ~16px. Subtítulos: regular ~12-13px gris. Timestamps: regular ~13px gris. Labels de tabs: uppercase con letter-spacing.

### Comportamiento Responsive (Mobile 390px)
- Header colapsa: hamburger menu a la izquierda; cluster de avatares + iconos (campana con dot, carrito, settings) a la derecha. La searchbar desaparece del viewport superior.
- Tabs de filtro mantienen formato pill pero en scroll horizontal: ALL y INBOX completos, UNREAD se corta en el borde derecho (con su badge rojo asomando) → indica overflow scrollable.
- **Cambio clave en items:** el timestamp relativo YA NO está a la derecha; baja a una SEGUNDA LÍNEA debajo del bloque título+subtítulo, alineado a la izquierda. El leading circular (icono/avatar) se mantiene. → Patrón responsive importante para listas con timestamp.
- Card blanca contenedora se ensancha a casi todo el ancho con márgenes laterales pequeños; dividers entre items se mantienen.

---

## Messages — https://task-dasher.webflow.io/messages

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-messages-fullpage-desktop.png | Desktop 1440px | Página completa: layout split-view (lista de conversaciones izq + panel de chat der con burbujas) |
| td-messages-conversation-list-desktop.png | Desktop 1440px | Detalle de la lista de conversaciones: items con avatar grande, nombre, preview truncado, bullet+timestamp y badge de no-leídos |
| td-messages-fullpage-mobile.png | Mobile 390px | Página completa en mobile: split-view colapsa a stack vertical, items centrados, panel de chat vacío abajo |

### Análisis Visual Detallado

**Layout general (Desktop) — patrón LISTA + PANEL DE DETALLE:**
- Confirmado el patrón master-detail de 2 columnas DENTRO del área de contenido:
  - **Columna izquierda (~38% ancho):** lista de conversaciones.
  - **Columna derecha (~62% ancho):** panel de detalle del hilo de chat seleccionado.
- Header de sección "Messages" (heading bold) con un icono more_horiz (•••) a la derecha para opciones.
- Todo sobre el mismo fondo gris claro de la app; las columnas no tienen card-border duro, se delimitan por el fondo tintado del panel de chat.

**Lista de conversaciones (item de lista — patrón complementario clave):**
- Cada item es una fila horizontal:
  - **Avatar circular GRANDE (~56px)** a la izquierda — notablemente más grande que el leading de notifications (44px). Fotos reales de personas, con un anillo/borde claro sutil alrededor.
  - **Bloque de texto:** nombre en bold (#1A1A2E) ~16px; debajo, en una sola línea gris (~12-13px): preview del último mensaje TRUNCADO con elipsis ("Lorem ipsum dolor..") + un separador BULLET "•" + timestamp relativo ("30 mins", "1 hr", "2 hrs", "3 hrs"). → Este es exactamente el patrón "last updated relativo" que pedían las notas, en formato compacto inline.
- **Item activo/seleccionado (David Smith):** fondo azul muy claro / lavanda (#EBF0FF / #E9F0FF aprox) con esquinas redondeadas (~16px), ocupando el ancho del item. Es la única diferenciación de estado (seleccionado vs no). → Patrón directo para "conversación abierta".
- **Badge/contador de no-leídos:** burbuja AZUL (#2C6BED) con forma de bocadillo de chat (tiene una pequeña cola/pico) y número blanco "3", posicionada a la derecha del item (alineada al borde derecho de la fila de Jen Taylor). Es visualmente más "chat-like" que el badge circular de notifications. → Patrón directo para contador de mensajes no leídos por conversación.

**Panel de detalle de chat (derecha):**
- Superficie con fondo azul MUY claro/lavanda (#EBF0FF aprox), esquinas redondeadas grandes — diferenciándolo de la lista.
- Burbujas de mensaje estilo messaging clásico:
  - **Mensajes entrantes (del otro):** alineados a la IZQUIERDA, burbuja blanca con texto oscuro, avatar circular pequeño del emisor a la izquierda de la burbuja.
  - **Mensajes salientes (propios):** alineados a la DERECHA, burbuja blanca/clara con texto oscuro, avatar propio circular a la derecha. (Ambas burbujas son claras; la diferenciación es por alineación + lado del avatar, no por color fuerte.)
  - **Timestamps de mensaje:** centrados horizontalmente entre grupos, gris pequeño, formato hora absoluta ("11:15 AM", "12:31 PM", "15:48 PM", "16:09 PM") — a diferencia de la lista que usa relativo. → Distinción útil: relativo en la lista (recencia), absoluto dentro del hilo.

**Paleta de colores observada (Messages):**
- Azul primario / acento: ~#2C6BED (badge de no-leídos).
- Azul claro de superficie/seleccionado: ~#EBF0FF / #E9F0FF (item activo + fondo del panel de chat).
- Fondo app: ~#F4F5F7.
- Burbujas de mensaje: #FFFFFF.
- Texto principal: ~#1A1A2E. Texto secundario (preview, timestamp): ~#8A8A95.
- Consistente con la paleta de Notifications (mismo sistema de color, mismo azul).

**Tipografía:**
- Misma familia sans-serif del template. Nombres en bold ~16px; preview/timestamp regular ~12-13px gris; texto de burbujas ~14px.

**Spacing:**
- Items de conversación con padding vertical generoso (~16-20px) y buen aire entre avatar y texto; sensación limpia y respirada.
- Burbujas de chat con padding interno cómodo y gap vertical claro entre mensajes.

### Comportamiento Responsive (Mobile 390px)
- El split-view de 2 columnas COLAPSA a un stack vertical de una sola columna: la lista de conversaciones ocupa el ancho completo arriba; el panel de chat queda DEBAJO (en el estado capturado aparece como un área azul claro vacía — el detalle se cargaría al tocar una conversación).
- **Cambio clave en items de conversación:** pasan de layout horizontal (avatar-izq / texto-der) a layout CENTRADO VERTICAL: avatar grande arriba centrado, nombre centrado debajo, y la línea preview "•" timestamp centrada al fondo.
- Item activo (David Smith) conserva el fondo lavanda redondeado, ahora a ancho completo.
- El badge "3" de no-leídos (Jen Taylor) se reubica DEBAJO del item, centrado (ya no a la derecha) — adaptación del badge al layout centrado.

---

## Relevancia para el Proyecto (Clínica Dental)

**Lo que se busca de estas referencias (patrones de lista para notificaciones internas + mensajería):**
- **Item de notificación estándar:** leading circular (icono temático con fondo de color para eventos de sistema / avatar para personas) + título bold + subtítulo gris + timestamp relativo. Mapeo directo a nuestros 4 tipos:
  - Turno por confirmar → icono calendario (fondo azul) + "Turno por confirmar" + paciente/hora + "en 2 horas".
  - Pago vencido → icono payments, idealmente con fondo/acento ROJO (el template ya tiene el rojo #F5413D del badge para reutilizar como color de alerta) + timestamp.
  - Cumpleaños de paciente → icono cake o avatar del paciente + "hoy".
  - Tratamiento próximo a vencer → icono médico + "vence en X días".
- **Timestamps relativos:** "30 mins ago / 1 hr ago / 5 hrs ago" en notifications; "30 mins / 1 hr / 2 hrs" inline en messages. Formato legible y humano, reutilizable tal cual en español ("hace 30 min", "hace 1 h").
- **Contadores de no-leídos:** dos variantes a reutilizar — badge circular rojo para "total sin leer" en tabs/filtros, badge azul tipo bocadillo para "no-leídos por conversación".
- **Badges en navegación lateral:** contador azul junto al label del menú (Messages 3 / Notifications 3) → directo para nuestra nav.
- **Layout master-detail (Messages):** lista de conversaciones + panel de chat, con colapso responsive a stack → patrón sólido si la clínica necesita mensajería interna paciente↔staff.
- **Estado seleccionado/activo:** fondo lavanda redondeado (#EBF0FF) — limpio y reutilizable.

**Carencias / a complementar (este template NO lo cubre):**
- NO hay diferenciación visual de leído/no-leído POR ITEM en la lista de notificaciones (solo conteo agregado). Tendremos que añadir un dot/fondo tintado por item.
- NO hay agrupaciones por fecha ("Hoy" / "Ayer" / "Esta semana"). Si el cliente las requiere, hay que diseñarlas (no existen aquí).
- NO hay acciones inline por item (marcar leído, archivar, descartar). Habrá que añadirlas si se necesitan.

**Top patrones a aplicar:**
1. Fila de notificación con leading circular dual (icono-de-color para sistema / avatar para persona) + 2 líneas de texto + timestamp relativo trailing.
2. Sistema de badges de conteo: rojo agregado (alerta) + azul por-item/nav.
3. Reutilizar el rojo #F5413D existente como color de alerta para "pago vencido" / urgencias.
4. Layout master-detail con colapso responsive para mensajería interna.
5. Fondo lavanda redondeado #EBF0FF como estado seleccionado/activo, consistente en toda la app.
