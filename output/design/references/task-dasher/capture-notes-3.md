# Capture Notes 3 de 4 — Task Dasher

> Site Capturer 3/4. URLs capturadas: `/utilities/style-guide` (DESIGN TOKENS) y `/sign-in` (pantalla Login).
> Análisis basado en observación visual REAL de los screenshots capturados (no extracción de DOM).
> Los valores HEX son legibles directamente de los swatches de la style-guide.

---

## Task Dasher — Style Guide (DESIGN TOKENS) — https://task-dasher.webflow.io/utilities/style-guide

Esta es la fuente de design tokens más valiosa de toda la referencia. La página es una style-guide oficial de Webflow con secciones: Introduction, Colours, Typography, Logos & Assets, Buttons & Icons, Webflow Elements (forms). Sidebar de navegación fija a la izquierda (desktop) que colapsa a nav horizontal de grid 2-col arriba (mobile).

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-styleguide-full-desktop.png | Desktop 1440px | Página completa full-page (todas las secciones) |
| td-styleguide-colors-desktop.png | Desktop 1440px | Paleta: Primary + Secondary Colours con swatches y hex |
| td-styleguide-colors-neutrals-desktop.png | Desktop 1440px | Paleta: Dark Green/Red/Dark Red + Other Colours (neutros) con hex |
| td-styleguide-typography-desktop.png | Desktop 1440px | Escala tipográfica H1-H6, HTML Text Tags, Text Weights |
| td-styleguide-richtext-weights-desktop.png | Desktop 1440px | Rich Text: listas ordenada/desordenada, blockquote, inicio Logos |
| td-styleguide-buttons-desktop.png | Desktop 1440px | Buttons & Icons: ghost, filled round, small, sign-in-google |
| td-styleguide-icons-desktop.png | Desktop 1440px | Freepik Social Icons + inicio de Webflow Elements (inputs) |
| td-styleguide-forms-desktop.png | Desktop 1440px | Text inputs, Text Area, Check Box (especificaciones de campos) |
| td-styleguide-full-mobile.png | Mobile 390px | Página completa full-page en mobile (1 columna) |
| td-styleguide-colors-mobile.png | Mobile 390px | Header azul + nav grid 2-col + H1 + intro en mobile |
| td-styleguide-buttons-mobile.png | Mobile 390px | Botones apilados verticalmente (Authentication, BUTTON TEXT, TABLE VIEW) |
| td-styleguide-forms-mobile.png | Mobile 390px | Inputs apilados en 1 columna en mobile |
| td-styleguide-scroll-check.png | Desktop 1440px | (auxiliar) Circle Avatar + transición a Buttons |
| td-styleguide-buttons-mobile-2.png | Mobile 390px | (auxiliar) detalle adicional de botones mobile |

### Análisis Visual Detallado

**Paleta de Colores Observada (HEX EXACTOS leídos de los swatches):**

Primary:
- **Primary** `#2979ff` — azul vibrante saturado. Es el color de marca principal. Se usa en el header mobile (fondo full-width), botón "SIGN IN WITH GOOGLE", botón scroll-to-top, links activos (subrayado de nav), y el texto de links "Sign up".

Secondary Colours:
- **Secondary** `#669dfc` — azul claro/medio. MUY relevante: es el color real de la mayoría de botones filled "pill" (BUTTON TEXT, TABLE VIEW, SIGN IN). Más suave que el primary.
- **Yellow** `#f7be4a` — amarillo dorado/mostaza suave
- **Pink** `#f881a9` — rosa medio
- **Dark Blue** `#1b4ea3` — azul oscuro/navy
- **Green** `#19ce71` — verde esmeralda brillante (éxito)
- **Dark Green** `#00311a` — verde muy oscuro casi negro
- **Red** `#f24e1e` — rojo-naranja (error/alerta)
- **Dark Red** `#3d0606` — rojo muy oscuro casi marrón

Other Colours (neutros — críticos para UI):
- **White** `#ffffff` — blanco puro (fondo de cards)
- **White Smoke** `#f6f6f6` — gris casi blanco (fondo general de página / body background)
- **Black** `#19191d` — negro azulado (texto principal / headings)
- **Light Gray** `#f0f0f0` — gris muy claro (fondo de inputs, líneas separadoras)
- **Gray** `#9697a1` — gris medio (placeholders, texto secundario)
- **Dark Gray** `#787885` — gris oscuro (labels de formulario, texto terciario)

> Nota de uso real observado: el body usa fondo gris claro (White Smoke `#f6f6f6`), las cards y formularios son blancos `#ffffff`, los inputs usan fondo Light Gray `#f0f0f0`. El texto principal es Black `#19191d`. El acento de marca es el azul, con `#2979ff` para énfasis máximo y `#669dfc` para botones de acción.

**Tipografía:**

Familia: sans-serif geométrica moderna (apariencia tipo Poppins / DM Sans — 'a' de doble piso, 'g' de un solo piso, terminaciones redondeadas, geométrica). Headings y body comparten la misma familia.

Escala observada (jerarquía clara de mayor a menor, medida proporcionalmente sobre el render a 1440px):
- **H1** "Heading H1": el más grande con diferencia, ~46-48px, peso BOLD (700). Domina visualmente.
- **H2** "Heading H2": ~28-30px, BOLD (700). Usado también en headers de sección ("Colours", "Typography", "Sign In").
- **H3** "Heading H3": ~20-22px, peso semibold/bold (600-700)
- **H4** "Heading H4": ~18px, semibold (600)
- **H5** "Heading H5": ~15-16px, semibold (600). Usado en items de nav del dashboard.
- **H6** "Heading H6": ~12-13px, semibold/bold (600-700), el más pequeño, casi label/caption.

Body / HTML tags:
- **Paragraph (body)**: ~15-16px, peso normal (400), color gris oscuro, line-height generoso (~1.6) para buena legibilidad.
- **Links (HTML-TAG)**: color azul (#669dfc / #2979ff), mismo tamaño que body.

Text Weights disponibles (4 pesos, observados de mayor a menor grosor):
- **Bold** (700)
- **Semi Bold** (600)
- **Normal** (400)
- **Light** (300) — renderizado en gris más claro, trazo fino

Rich Text:
- Listas ordenadas (1. 2. 3.) y desordenadas (bullets) con encabezado H3.
- **Blockquote**: borde vertical azul grueso (~4px, color #2979ff/#669dfc) a la izquierda, texto en cursiva/regular con sangría, sin fondo.

**Spacing y Layout:**
- Generoso whitespace entre secciones (separación vertical amplia, ~80-100px entre bloques temáticos en desktop).
- Líneas divisorias horizontales muy sutiles (gris claro) separan subsecciones dentro de Typography.
- Layout de contenido contenido/centrado con sidebar fija (desktop). Sidebar ~300px ancho, contenido a la derecha.
- Grid de swatches de color: ~5 columnas en desktop, swatches circulares.

**Componentes Destacados:**

BOTONES (especificaciones detalladas):
1. **Ghost Button with Icon** ("All Tasks"): sin fondo, sin borde, texto Black, icono lineal a la izquierda. Para navegación/acciones secundarias.
2. **Ghost Dropdown Button with 2 Icons** ("Authentication"): sin fondo, icono "key" a la izquierda + texto + chevron ">" (arrow_forward_ios) a la derecha. Patrón de menú expandible.
3. **Filled Round Button** ("BUTTON TEXT"): forma PILL totalmente redondeada (border-radius alto, ~26px+ con altura ~44px), fondo azul claro `#669dfc`, texto BLANCO en MAYÚSCULAS con letter-spacing, tamaño compacto. Botón de acción primaria.
4. **Filled Round Button with Icon** ("TABLE VIEW"): igual al anterior + icono de tabla a la izquierda del texto.
5. **Filled Button Small** ("Edit Profile"): pequeño, fondo blanco/transparente con borde gris fino, esquinas redondeadas (pill pequeño), texto Black pequeño. Es el estilo "outline/secondary" compacto.
6. **Filled Round Button with Icon Image** ("SIGN IN WITH GOOGLE"): pill ancho, fondo azul intenso `#2979ff` (primary, más saturado que los otros pills), logo de Google a COLOR a la izquierda, texto blanco mayúsculas. Botón social/full-width.

> Patrón clave de botones: todos los botones de acción son PILLS totalmente redondeados. Dos niveles de azul: `#669dfc` (acción estándar) y `#2979ff` (énfasis máximo/social). Texto siempre en MAYÚSCULAS con letter-spacing para los filled. Outline pequeño usa borde gris sobre blanco.

INPUTS / FORMULARIOS (especificaciones detalladas):
- **Text Input**: fondo Light Gray `#f0f0f0`, border-radius MUY alto (~24-26px, casi pill dado que la altura es ~48-52px), SIN borde visible (solo el relleno gris lo delimita), padding horizontal generoso (~20px). Placeholder en Gray `#9697a1`.
- **Label**: encima del input, color Dark Gray `#787885`, tamaño ~14px, peso normal/medium, margen inferior pequeño.
- Layout de inputs: 2 columnas en desktop, 1 columna apilada en mobile.
- **Text Area** ("About me"): mismo fondo gris claro, pero border-radius MENOS pronunciado (~16px) por ser multilínea; resize handle visible en esquina inferior derecha; altura ~140px.
- **Check Box**: cuadrado pequeño (~18px) con borde gris, esquinas levemente redondeadas, label a la derecha en texto normal.
- **Submit Button**: pill azul (mismo estilo Filled Round).

BADGES:
- **Badge Card** ("Shipping"): pequeño badge tipo pill, fondo azul `#2979ff`, texto blanco pequeño. Visto en la sección Logos & Assets.

OTROS COMPONENTES:
- **Circle Avatar**: avatares circulares en 6 tamaños progresivos (de ~32px a ~120px), imagen recortada en círculo perfecto.
- **Iconografía**: set de iconos lineales (Material Symbols outlined: splitscreen, view_timeline, chat, person, etc.) + Freepik icons (lineales negros) + logos de marca a color (Google, Apple, Microsoft, Meta, Samsung, Dell, Intel, LG, HP, Lenovo).

**Elementos Premium / Micro-interacciones (observados estáticamente):**
- Botón scroll-to-top circular flotante azul `#2979ff` (esquina inferior derecha) con flecha arriba.
- Nav sidebar (desktop) e indicador de item activo: fondo gris claro + barra/subrayado azul a la izquierda.
- En mobile, el nav superior es sticky y resalta el item activo con subrayado azul.

**Textos Extraídos (literales):**
- Título página: "Webflow Style Guide"
- Secciones nav: Introduction · Colours · Typography · Logos & Assets · Buttons & Icons · Webflow Elements
- CTA / Botones: "All Tasks", "Authentication", "BUTTON TEXT", "TABLE VIEW", "Edit Profile", "SIGN IN WITH GOOGLE", "Button Text" (submit)
- "Go to Homepage" (link sidebar footer)

### Relevancia para el Proyecto (Clínica Dental)
- Lo que esta referencia APORTA: es el sistema de tokens completo y limpio. Paleta clara con azul de confianza (`#2979ff` / `#669dfc`) — encaja perfecto con la estética médica/dental (azul = confianza, higiene, profesionalismo). Verde `#19ce71` para estados de éxito (cita confirmada), Red `#f24e1e` para alertas.
- Patrones más valiosos para aplicar:
  1. **Sistema de neutros** (White Smoke fondo, White cards, Black texto, grises para jerarquía) — base sólida para una UI clínica limpia.
  2. **Botones pill azules** con dos niveles de énfasis — directamente reutilizable para CTAs ("Agendar cita", "Confirmar").
  3. **Inputs gris-claro redondeados sin borde** — estética suave y moderna, ideal para formularios de paciente/login.
  4. **Escala tipográfica sans geométrica** con 4 pesos — limpia y accesible.
  5. **Badges pill de color** para estados (tratamientos, estados de cita).

---

## Task Dasher — Sign In (Pantalla LOGIN) — https://task-dasher.webflow.io/sign-in

Base directa para nuestra pantalla de Login. NO es un split de pantalla completa: es una **CARD CENTRADA con split interno 50/50 (imagen | formulario)**, embebida dentro del layout de dashboard de la plantilla (sidebar izquierdo + topbar). Para nuestro propósito de Login, lo relevante es la CARD del formulario, que funciona de forma autónoma.

### Screenshots Capturados
| Archivo | Breakpoint | Qué muestra |
|---|---|---|
| td-signin-full-desktop.png | Desktop 1440px | Página completa: dashboard layout + card Sign In centrada |
| td-signin-card-desktop.png | Desktop 1440px | Card Sign In completa: split imagen (gradiente) + formulario |
| td-signin-form-detail-desktop.png | Desktop 1440px | Zoom al formulario: inputs, checkbox, botón, link (detalle de tokens) |
| td-signin-full-mobile.png | Mobile 390px | Página completa en mobile (split apilado vertical) |
| td-signin-top-mobile.png | Mobile 390px | Top mobile: topbar + heading "Sign In" + imagen gradiente |
| td-signin-form-mobile.png | Mobile 390px | Card del formulario en mobile (campos, botón centrado) |
| td-signin-form-mobile-check.png | Mobile 390px | (auxiliar) confirmación de render del formulario mobile |

### Análisis Visual Detallado

**Layout General:**
- Patrón: **card centrada blanca** con dos mitades 50/50.
  - Izquierda: bloque de **imagen/gradiente abstracto** (sin formulario).
  - Derecha: **formulario** sobre fondo blanco.
- Encima de la card: heading "Sign In" (H2) + párrafo descriptivo gris (lorem ipsum).
- La card tiene esquinas redondeadas (~16px) y sombra muy sutil. Fondo de página gris claro (White Smoke `#f6f6f6`).
- En desktop, todo esto vive a la derecha del sidebar de dashboard; en mobile el sidebar se oculta tras menú hamburguesa y la card pasa a ocupar el ancho.

**Mitad de Imagen (columna izquierda):**
- Gradiente abstracto fluido/líquido: base **cyan-azul brillante** (~#00bfff) → transiciona a **púrpura/violeta** (~#9b3fe0) → **magenta/rosa** suave arriba. Estilo "aurora"/wallpaper macOS.
- Logo "Task Dasher" en la esquina superior izquierda, en color oscuro/negro con icono de layers.
- Esquinas redondeadas que acompañan el radio de la card.

**Mitad de Formulario (columna derecha) — TOKENS:**
- **Campo Email address**: label "Email address" (Dark Gray `#787885`, ~14px) + input fondo Light Gray `#f0f0f0`, pill muy redondeado (~26px radius, altura ~52px), placeholder "example@email.com" en Gray `#9697a1`, sin borde visible.
- **Campo Password**: label "Password" + input idéntico, valor enmascarado con puntos/asteriscos.
- **Fila de opciones**: checkbox cuadrado "Remember me" (izquierda) + "Forgot Password" (derecha). "Forgot Password" en gris oscuro (NO azul — es texto, no destaca como link primario). Debajo de esta fila hay una **línea separadora** horizontal sutil (gris claro).
- **Botón "SIGN IN"**:
  - Desktop: pill `#669dfc` de **ANCHO COMPLETO** (full-width de la columna), texto blanco MAYÚSCULAS centrado con letter-spacing, altura ~52px.
  - Mobile: el mismo pill pero **NO full-width** — se vuelve compacto y centrado.
- **Link inferior**: "Don't have account yet? Sign up." — texto negro con "Sign up." en azul `#2979ff` (es el único link visualmente azul del form). Centrado.

**Comportamiento Responsive (desktop → mobile):**
- Desktop: split horizontal (imagen | form lado a lado dentro de la card).
- Mobile: el split se APILA verticalmente — primero la imagen del gradiente (card redondeada arriba), luego la card del formulario (blanca, abajo). Cada parte mantiene esquinas redondeadas independientes.
- Botón SIGN IN cambia de full-width (desktop) a compacto centrado (mobile).
- El checkbox "Remember me" + "Forgot Password" siguen en una fila pero más juntos/centrados en mobile.

**Tipografía del Login:**
- "Sign In": H2, Black `#19191d`, bold (~28-30px).
- Subtexto: párrafo gris, normal, ~15px.
- Labels: Dark Gray, ~14px.
- Botón: ~14px mayúsculas, semibold, blanco.

**Textos Extraídos (literales):**
- Heading: "Sign In"
- Subtexto: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."
- Labels: "Email address", "Password"
- Placeholders: "example@email.com", "********"
- Opciones: "Remember me", "Forgot Password"
- CTA: "SIGN IN"
- Footer del form: "Don't have account yet? Sign up."
- Footer de página: "©Task Dasher. All Rights Reserved." / "Built by Yves Adrales" / "Powered by Webflow"

### Relevancia para el Proyecto (Clínica Dental)
- Lo que esta referencia APORTA: un patrón de Login limpio y profesional directamente adaptable.
- Patrones más valiosos para aplicar:
  1. **Card centrada con split imagen+formulario**: la mitad de imagen es ideal para una foto de la clínica / equipo dental / ilustración, transmitiendo confianza. La mitad de form mantiene la entrada de datos simple.
  2. **Formulario minimalista**: solo Email + Password + Remember me + Forgot Password + CTA + link a registro. Sin ruido. Patrón canónico de login.
  3. **Inputs gris-claro pill sin borde** (coherentes con la style-guide): estética suave, accesible.
  4. **CTA pill azul** full-width en desktop / compacto en mobile.
  5. **Responsive apilado**: imagen arriba, form abajo en mobile — patrón seguro y conocido.
- Consideración: el "Forgot Password" en gris oscuro tiene bajo contraste como acción; para la clínica convendría destacarlo más (azul) por usabilidad/accesibilidad de pacientes.
