# Design Brief — Estudio Dental Mendieta (Sistema de Gestión Clínica)

Documento de referencia para los agentes de diseño y desarrollo. Derivado de la sección 10 (Criterios de UI) del requirements del viewcase. La fuente de verdad funcional sigue siendo `requirements.md`; este brief consolida la capa **visual y de diseño**.

---

## ANTES DE COMENZAR: INSTRUCCIÓN OBLIGATORIA

**DEBES visitar el siguiente sitio ANTES de tomar cualquier decisión de diseño.** Las descripciones aquí son una guía, pero NO reemplazan ver el sitio en vivo. El requirements es enfático: *"El equipo debe recorrer TODAS las páginas de esta referencia antes de empezar a maquetar, sin excepción"* y *"Si una pantalla diseñada por el equipo se ve significativamente distinta a Task Dasher en aire, tipografía, uso de cards o paleta, está fuera de la línea y hay que rehacerla."*

**Referencia principal de diseño (OBLIGATORIO navegar) — define el estándar premium del viewcase:**
- **https://task-dasher.webflow.io/** — Dashboard template en Webflow. Recorrer TODAS sus páginas. Observar específicamente: cómo usa cards, cómo trata los avatares (circulares, overlapping/apilados con "+N"), jerarquía tipográfica, distribución del espacio (aire), tratamiento de estados (badges de status/prioridad/progreso), sidebar limpio. Páginas clave a capturar y su mapeo a nuestro viewcase:
  - **All Tasks (home/dashboard)** → patrón de cards de proyectos con porcentaje grande + "Progress", lista de tasks con avatares. Base para nuestro dashboard y cards de tratamiento/paciente.
  - **Profile** → LA MÁS IMPORTANTE. Base visual directa de nuestra **ficha del paciente**: foto grande a la izquierda, nombre grande arriba, datos básicos al lado, badges de alertas, una acción primaria, sistema de tabs debajo.
  - **Contacts** → base visual directa de nuestra **lista de pacientes**: lista con foto, nombre, datos clave, status, acciones rápidas inline.
  - **Company** → inspira nuestra **lista de obras sociales**: cards con logo, ubicación/métricas, status, prioridad, progreso de milestones (5 de 8), avatares overlapping del equipo.
  - **Sign In (Autenticación)** → base de nuestra **pantalla de Login mock**: estética simple, formulario centrado.
  - **Notifications** → base de nuestras **notificaciones internas** (turno por confirmar, pago vencido, cumpleaños de paciente, tratamiento próximo a vencer).
  - **Style Guide / Utility** → documentar tipografía, colores y componentes (design tokens).
  - **Messages, Timeline** (complementarias) → patrones de listas, timelines, badges adicionales.

**Sitios de apoyo secundarios (mismo estándar estético híbrido, consultar si Task Dasher no cubre un caso):**
- Cal.com, Pitch, Tally.so, Framer (la app, no la landing).
- Apple Health — cards aireadas, paleta suave, gráficos simples.
- Linear — SOLO inspiración puntual de calidad tipográfica y micro-interacciones. **NO copiar su layout** (es power-user denso, no aplica).

**NO procedas con el diseño/desarrollo sin haber visitado la referencia principal.**

---

## 1. CONTEXTO DEL PROYECTO

### Quién es el cliente
Estudio Dental Mendieta — clínica dental boutique ficticia (5-8 profesionales, 100-300 pacientes activos/mes). Tono: profesional, ordenado, pero humano. Lenguaje cercano dentro de lo profesional (decir "ficha del paciente" no "expediente"; "registro de tratamiento" no "carga de procedimiento"). Español rioplatense neutro.

### Qué debe lograr este panel
Demo navegable de un sistema de gestión persona-céntrico. El lead (profesional/dueño de clínica de cualquier vertical: salud, educación, RRHH) explora 5-10 minutos y proyecta la arquitectura a su propio negocio. **La odontología es el cliente del demo; la arquitectura es la propuesta de valor.** NO es app de uso diario: es un panel diseñado para explorar.

### Por qué importa la calidad visual
El objetivo de negocio es posicionar al estudio como capaz de construir sistemas persona-céntricos sofisticados, con ficha visualmente rica y flujos navegables ordenados. La calidad visual ES el producto. El viewcase anterior aglomeró información y perdió claridad; este NO repite ese error.

---

## 2. REFERENCIA DE DISEÑO PRINCIPAL: Task Dasher

**URL:** https://task-dasher.webflow.io/

**RECORDATORIO:** Si no has visitado este sitio aún, hazlo AHORA.

### Filosofía de diseño general
Estética híbrida: outfit visual de apps modernas combinado con layout aireado y simple de "panel diseñado". Mucho espacio en blanco usado con propósito funcional (no decorativo). Vacío visual permitido — si una pantalla tiene poco contenido, está bien que se vea espaciosa: eso comunica orden, no carencia.

### Patrones específicos a copiar (replicar adaptándolos al contexto dental)

#### Sidebar de navegación
Logo arriba a la izquierda. Lista de items con icono + label visible SIEMPRE. Item activo destacado con fondo levemente distinto (sin bordes pronunciados). Sin búsqueda global ni command palette. **Adaptación:** exactamente 5 items principales (Agenda, Pacientes, Tratamientos, Facturación, Reportes) + footer con Configuración y Ayuda. Fijo en desktop, no colapsable.

#### Header de la app
Search bar compacto a la derecha (SOLO búsqueda dentro del contexto activo, NO global). Icono de notificaciones con badge contador. Avatar del usuario logueado (iniciales "AD"). Sin más elementos. **Adaptación:** igual, + badge discreto "Demo interactivo de [marca placeholder]" abajo a la derecha con link al sitio principal.

#### Cards con progreso
Cards de proyectos muestran porcentaje grande (38, 74, 56) + etiqueta "Progress" + barra. **Adaptación:** cards de tratamientos con % de etapas completadas grande + etiqueta "Progreso" + subtítulo con nombre del tratamiento + ícono de menú a la derecha.

#### Tarjetas de personas con foto
Card con foto circular del responsable, nombre, categoría chica, porcentaje grande. **Adaptación:** cards de pacientes con foto circular, nombre debajo, edad u obra social como subtítulo, % grande = estado de tratamiento o saldo.

#### Overlapping avatars (apilados)
Grupos de 3-4 círculos overlapping + "+8" si hay más. **Adaptación:** profesionales asignados a un tratamiento, o pacientes con turno en un día.

#### Badges de estado
Pills pequeñas, texto corto, color suave: Completed (verde), On Review (azul/naranja), In Queue (gris), In Progress (amarillo). **Adaptación:** estados de turno (Confirmado, Atendiendo, Terminado, Cancelado), de tratamiento (En curso, Atrasado, En pausa, Completado), de pago (Al día, Con deuda, Vencido).

#### Badges de prioridad
Pills con texto High/Mid/Low. **Adaptación:** urgencia del turno o nivel de atención del paciente.

#### "Last updated" relativo
Texto chico "2 hours ago", "5 days ago". **Adaptación:** "Hace 2 horas", "Hace 5 días" en turnos, tratamientos, pagos.

#### Tabla de tasks
Fila con avatar + nombre, tarea, status, priority, last updated, iconos de acción (editar/eliminar). **Adaptación:** tablas de turnos del día o pacientes con turnos próximos. **Máx 5 columnas.**

#### Cards de Company con logo
Card con logo, ubicación, status, prioridad, progreso de milestones, avatares overlapping. **Adaptación:** obras sociales — logo placeholder, nombre, pacientes activos, deuda pendiente, último pago, mini stats.

#### Página Profile (base directa de la ficha del paciente)
Foto grande a la izquierda, nombre completo grande arriba, datos básicos al lado, badges de alertas, una acción primaria visible ("Agendar turno"), sistema de tabs debajo (Información general, Odontograma, Historial, Tratamientos, Documentos, Pagos).

#### Página Contacts (base de la lista de pacientes)
Lista con foto, nombre, datos clave, status, acciones rápidas inline.

#### Página Notifications
Notificaciones internas del sistema.

#### Página Sign In
Base del Login mock: estética simple, formulario centrado.

### Adaptaciones que NO aplican
- Task Dasher tiene **cart de e-commerce** → nuestro viewcase NO lo incluye.
- Task Dasher tiene **Pricing** → NO necesitamos Pricing; el catálogo de tipos de tratamiento puede inspirarse visualmente en cómo presenta los planes, nada más.

---

## 3. PALETA DE COLORES

**Decisión pendiente (gap §15):** elegir UNA sola familia de acento. El cliente confirma en Fase 2. Máximo 4 tonos coherentes con la familia elegida. Opciones sugeridas:

| Opción de familia | Hex sugeridos (suave / saturado) |
|-------------------|----------------------------------|
| Verde menta / sage | #a8d5c4 / #5fb89d |
| Azul cielo / azul medio | #c5d8e8 / #6da8d4 |
| Lavanda | #d6cce8 / #a594d4 |

**Neutros y semánticos (fijos, prescriptivos):**

| Color | Hex | Uso |
|-------|-----|-----|
| Fondo principal | #ffffff a #fafafa | Fondo de la app |
| Texto principal | ~#2a2a35 (gris oscuro cálido, NUNCA negro puro) | Texto general |
| Texto secundario | ~#707080 (gris medio) | Subtítulos, captions |
| Borde / Separador | #e8e8ee (tenue, 0.5-1px) | Separar cards cuando hace falta jerarquía |
| Éxito | verde pastel suave | Toasts/estados de éxito |
| Error | coral pastel suave | Errores |
| Warning | amarillo pastel suave | Advertencias |
| Info | azul pastel suave | Informativos |

---

## 4. TIPOGRAFÍA

**Restricción explícita: NO Inter** (sobreutilizada en B2B). **Decisión pendiente (gap §15):** elegir UNA. Display para títulos, Text para cuerpo. Opciones en orden de preferencia: **Red Hat Display/Text**, Geist, DM Sans, Plus Jakarta Sans, Manrope, Outfit.

**Reglas tipográficas (prescriptivas, fijas):**
- Máximo 3 tamaños de texto por pantalla.
- Solo 2 pesos: regular (400) y medio (500). Nunca bold extremo ni light.
- Line-height generoso en cuerpo (1.5–1.7). Títulos más ajustados (1.2).
- Letter-spacing levemente negativo en títulos grandes.

---

## 5. MAPA DE PÁGINAS (módulos)

1. **Agenda** — calendario (mensual/semanal/diario), detalle de turno, crear turno (3 pasos), reagendar, lista del día.
2. **Pacientes** (pieza fuerte) — lista, ficha con 6 tabs (Info general, Odontograma 32 piezas, Historial, Tratamientos, Documentos, Pagos), crear (2 pasos), editar, detalle de pieza dental, detalle de evento clínico, detalle de plan.
3. **Tratamientos** — lista activos, tipos (catálogo en cards), detalle de tipo.
4. **Facturación** — presupuestos (lista/detalle/crear 3 pasos), facturas (lista/detalle), obras sociales (cards/detalle). Mock interno, sin ARCA/AFIP.
5. **Reportes** — dashboard de KPI cards (máx 6), reportes de pacientes/tratamientos/financiero/productividad con gráficos en cards aireadas.

Más: Login mock, Configuración (con botón "Resetear demo").

---

## 6. SISTEMA DE DISEÑO (tokens prescriptivos)

### Bordes y cards
- Bordes sutiles, 0.5-1px, color tenue (#e8e8ee).
- Cards con radius **10-14px** (no menos = cuadrado productivo; no más = infantil). **Radius extremos (>20px) PROHIBIDOS.**
- Sombras opcionales y sutiles: un solo nivel (offset 1px, blur 4px, opacidad 0.04). Card vive con borde sutil **O** sombra sutil, **no ambos**.

### Espacio (spacing)
- Escala basada en múltiplos de 4: **4, 8, 12, 16, 24, 32, 48, 64**.
- Padding interno de cards: **24-32px**.
- Separación entre cards en listas: **16-20px**.
- Separación entre secciones de pantalla: **32-48px**.

### Iconografía
- Un solo set: **Phosphor Icons** o **Tabler Icons**, versión regular (no rellena). Stroke 1.5px.
- 3 tamaños fijos: **16px** inline, **20px** botones/filas, **24px** acciones primarias.
- Íconos heredan color del texto contiguo, excepto íconos de estado.

### Micro-interacciones
- Transitions 150-250ms.
- Hover visible en TODO lo clickeable.
- Focus rings visibles para teclado.
- Toasts con animación suave de entrada.
- Skeletons mientras cargan listas (NO spinners).
- Estados disabled con opacidad 40%.

### Detalles de pulido
- Cursor: pointer en clickeables, text en inputs, not-allowed en disabled.
- Selección de texto con color de marca atenuado.
- Inputs y botones con altura consistente: **40px**.
- Placeholder en gris claro.

---

## 7. CRITERIOS ESTRUCTURALES (PRIORIDAD MÁXIMA)

- **Multi-pantalla estricto:** toda acción que crea/modifica/consulta un objeto vive en su propia pantalla con ruta dedicada. La URL siempre refleja qué se ve. Botón atrás del navegador funciona.
- **Modales:** SOLO para confirmaciones cortas (eliminar, cancelar, alertas). Cualquier acción con más de 3 campos va en pantalla propia. Modales nunca >50% de la pantalla.
- **Drawers laterales:** PROHIBIDOS para contenido principal.
- **Tabs:** válidos SOLO para dimensiones distintas del mismo objeto (ej: ficha del paciente). NO como reemplazo de navegación entre objetos. Contenido del tab no activo NO renderizado en el DOM.
- **Simplicidad sobre densidad:** listas con máx 4-5 columnas. Una acción primaria por pantalla, máx una secundaria visible (resto en menú compacto). Un solo filtro principal visible; el resto en panel "Filtros" desplegable. Headers limpios.

---

## LO QUE NO DEBE TENER (anti-patrones — verificables)

- **Inter como tipografía.**
- Gradientes saturados de fondo.
- Sombras pesadas tipo Material elevation 8.
- Pills de colores estridentes.
- Emojis dentro de la interfaz como decoración.
- Border radius >20px.
- Inputs con bordes pronunciados.
- Botones con sombras internas o gradientes.
- Color de fondo principal saturado.
- Power-user features (command palette, atajos globales visibles, búsqueda global compleja).
- Tablas con más de 5 columnas.
- Múltiples filtros visibles simultáneamente en listas.
- Drawers laterales como contenido principal.
- Modales mayores al 50% de la pantalla.
- Pantallas únicas que mezclan lista + detalle + formulario + panel.
- Tabs que reemplazan navegación entre objetos.
- Múltiples acciones primarias por pantalla.
- Iconos sin label en navegación principal.
- Infinite scroll en listas operativas.
- Scroll infinito en la ficha del paciente (debe usar tabs).

---

## PRINCIPIOS DE DISEÑO PARA LOS AGENTES

1. **Compatibilidad con Task Dasher** — Si una pantalla se ve significativamente distinta a Task Dasher en aire, tipografía, cards o paleta, está fuera de línea y se rehace.
2. **Cada acción, su pantalla** — Navegación entre objetos, nunca drawers ni modales gigantes.
3. **Aire con propósito** — El espacio comunica orden. No llenar pantallas artificialmente.
4. **Persona-céntrico** — Las fotos de pacientes humanizan el sistema; tratarlas con cuidado (avatares circulares, foto grande en la ficha).
5. **Calma profesional** — Una sola familia de color, máx 4 tonos, neutros cálidos, semánticos pastel.

---

## CHECKLIST DE VERIFICACIÓN (se extrae como BVC-xxx → QA gates del Visual Checker)

- [ ] La tipografía NO es Inter y usa solo pesos 400 y 500.
- [ ] La paleta usa UNA sola familia de acento con máximo 4 tonos coherentes.
- [ ] Fondo principal entre #ffffff y #fafafa; texto principal gris oscuro cálido (no negro puro).
- [ ] Cards con radius entre 10 y 14px; ninguna card con radius >20px.
- [ ] Cards usan borde sutil O sombra sutil, nunca ambos; sombras de un solo nivel suave.
- [ ] Spacing en múltiplos de 4; padding de cards 24-32px; separación entre cards 16-20px.
- [ ] Sidebar con exactamente 5 items principales + Configuración/Ayuda, icono + label siempre visible, item activo destacado.
- [ ] Header sin búsqueda global ni command palette; solo búsqueda contextual + notificaciones + avatar.
- [ ] Ninguna tabla supera 5 columnas.
- [ ] Una sola acción primaria por pantalla; máximo una secundaria visible.
- [ ] Un solo filtro principal visible en listas; el resto en panel desplegable.
- [ ] Ningún drawer lateral como contenido principal; ningún modal >50% de pantalla.
- [ ] La ficha del paciente usa tabs; el contenido del tab inactivo NO está en el DOM.
- [ ] Iconografía de un solo set (Phosphor o Tabler), regular, stroke 1.5px, tamaños 16/20/24.
- [ ] Hover visible en todo lo clickeable; focus rings visibles; disabled con opacidad 40%.
- [ ] Skeletons (no spinners) al cargar listas; toasts tras acciones exitosas.
- [ ] Inputs y botones con altura 40px; touch targets ≥44px en mobile.
- [ ] Sin emojis decorativos, sin gradientes saturados, sin sombras pesadas, sin pills estridentes.
- [ ] Las cards de paciente/tratamiento/obra social replican los patrones de Task Dasher (foto circular, % grande, badges suaves, avatares overlapping).
- [ ] La ficha del paciente se ve compatible con la página Profile de Task Dasher.
