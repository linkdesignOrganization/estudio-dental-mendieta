# Requirements — Viewcase 02: Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Business Analyst
**Fecha**: 2026-06-01
**Versión**: 2.0 (Fase 2 — respuestas del cliente + decisiones técnicas incorporadas; todos los gaps resueltos)
**Total criterios**: 272 (REQ-001 a REQ-272) + 20 NFR
**Fase**: 2 — Requirements consolidados (0 gaps pendientes)
**Modo**: NORMAL (no Pixel-Perfect)

> **Cambios v2.0 (incorporación de respuestas del cliente, 2026-06-01)**:
> - **CAMBIO DE ALCANCE — Presentación como producto real**: el sistema NO expone ninguna referencia escrita ni visual a que es un demo/mock/simulado. Toda la UI se presenta como un sistema en producción. La funcionalidad subyacente (reset del seed, notificación simulada de WhatsApp) se mantiene, pero el copy visible usa lenguaje de producto. Internamente sigue siendo un viewcase frontend-only con localStorage; esto es una decisión de PRESENTACIÓN de cara al lead.
> - **Mobile**: sube de alcance — TODOS los flujos (crear/editar paciente, crear turno, reagendar, crear presupuesto, registrar pago, editar odontograma) son usables y responsive en celular.
> - **Pagos y Odontograma editables**: el usuario puede registrar pagos (saldo se actualiza y persiste) y cambiar el estado de las piezas dentales (persiste). Nuevos criterios REQ-259 a REQ-270 (Épica 11). Además REQ-271 (mobile crear presupuesto) y REQ-272 (red de seguridad anti-"demo").
> - **Dominio**: SIN dominio propio — se despliega en la URL default de Azure Static Web Apps (`*.azurestaticapps.net`).
> - **Color**: familia azul cielo/medio (#c5d8e8 suave / #6da8d4 medio). **Tipografía**: Red Hat (Display títulos + Text cuerpo, pesos 400/500). **Logo**: isotipo + wordmark "Estudio Dental Mendieta". Estos viven en el design pipeline; se referencian aquí solo para trazabilidad de gaps.

---

## Resumen Ejecutivo

Estudio Dental Mendieta es el segundo de seis viewcases del portafolio de Link Design para el mercado argentino. Internamente es un viewcase **completamente funcional frontend-only** (sin backend) de un sistema de gestión a medida para una clínica dental boutique ficticia. El sistema es navegable, interactúa con el usuario, persiste cambios en `localStorage` entre sesiones y permite explorar una operación clínica viva durante 5 a 10 minutos.

> **Decisión de presentación (cliente, 2026-06-01)**: de cara al usuario/lead, el sistema se presenta como un producto REAL en producción. La UI NO contiene ninguna referencia escrita ni visual a que es un demo, mock o simulación. Toda mención interna a "viewcase/demo" en este documento es para el equipo, no para la interfaz. Los criterios que antes exponían "demo/mock/simulado/resetear demo" fueron reformulados con lenguaje de producto (ver REQ-011, REQ-027, REQ-058, REQ-089, REQ-264).

El objetivo de negocio NO es vender a odontólogos específicamente, sino **demostrar capacidad de construir sistemas persona-céntricos sofisticados** —ficha rica con tabs, navegación clara, experiencia ordenada— que un lead de cualquier vertical (salud, educación, RRHH, gimnasios, veterinarias) pueda proyectar a su propio negocio. La odontología es el cliente del demo; la arquitectura es la propuesta de valor.

El sistema se compone de **5 módulos** (Agenda, Pacientes, Tratamientos, Facturación, Reportes) más un Login mock y una pantalla de Configuración. La pieza fuerte es la **ficha del paciente de 6 tabs**, que incluye un **odontograma interactivo de 32 piezas**. La arquitectura es **estrictamente multi-pantalla**: cada acción que crea, modifica o consulta un objeto vive en su propia ruta dedicada; la URL siempre refleja qué se ve y el botón atrás del navegador funciona. El demo se construye con un **seed dinámico** generado leyendo las carpetas de fotos de pacientes (29 fotos reales: 12 hombres + 17 mujeres), donde el nombre de cada archivo codifica la edad.

> **Nota de alcance de este documento**: cubre exclusivamente requirements **funcionales, de negocio y estructurales**. Las especificaciones puramente visuales (paletas exactas, tipografía en px, spacing, tokens de diseño, replicación visual de Task Dasher) pertenecen al pipeline de diseño (Brief Analyst → Design Researcher → Design Orchestrator) y al `clinica-dental-design-brief.md`. Aquí se referencian las restricciones estructurales y los anti-patrones porque son verificables como criterios funcionales.

---

## Índice de Épicas

| # | Épica | Features | Criterios |
|---|---|---|---|
| 1 | Plataforma, Shell y Navegación | 5 | REQ-001 a REQ-031 |
| 2 | Persistencia, Seed y Reset | 3 | REQ-032 a REQ-058 |
| 3 | Módulo Agenda | 5 | REQ-059 a REQ-097 |
| 4 | Módulo Pacientes — Lista y Ficha | 4 | REQ-098 a REQ-127 |
| 5 | Módulo Pacientes — Tabs de la Ficha (6 tabs) | 7 | REQ-128 a REQ-172 |
| 6 | Módulo Pacientes — Crear / Editar / Detalles | 4 | REQ-173 a REQ-191 |
| 7 | Módulo Tratamientos | 3 | REQ-192 a REQ-205 |
| 8 | Módulo Facturación | 7 | REQ-206 a REQ-231 |
| 9 | Módulo Reportes | 5 | REQ-232 a REQ-246 |
| 10 | Calidad Transversal (responsive, a11y, feedback, anti-patrones) | 4 | REQ-247 a REQ-258 + REQ-272 |
| 11 | Edición de Pagos y Odontograma + Restablecer datos | 3 | REQ-259 a REQ-270 |

> Nota de numeración: REQ-271 (mobile crear presupuesto) vive funcionalmente en la Épica 8 (Feature 8.3) y REQ-272 (red anti-"demo") en la Épica 10 (Feature 10.4); ambos recibieron ID al final de la secuencia por incorporarse en Fase 2, sin renumerar los criterios existentes.

---

## Épica 1: Plataforma, Shell y Navegación

### Feature 1.1: Login (sin autenticación real) y entrada al sistema

**Descripción**: Pantalla de entrada simple que carga el seed y navega al dashboard sin autenticación real. Es la primera impresión del lead. (Nota interna: el login no valida credenciales; la UI se presenta como un login de producto normal, sin texto que lo identifique como demo.)

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-001 | La pantalla de login muestra un único botón primario "Ingresar como administradora" centrado, con estética simple (formulario centrado). | funcional | alta |
| REQ-002 | Al hacer clic en "Ingresar como administradora", el sistema carga los datos seed (si no existen en localStorage) y navega al dashboard de Reportes (o pantalla de inicio definida). | funcional | alta |
| REQ-003 | La pantalla de login ofrece un link "Saltar login" que navega directamente al inicio sin pasar por el botón. | funcional | media |
| REQ-004 | El login NO solicita usuario ni contraseña reales ni valida credenciales (no hay autenticación real). | funcional | alta |
| REQ-005 | El login es usable en mobile: el botón y el link respetan touch target ≥44px y el formulario se centra sin scroll horizontal. | responsive | media |
| REQ-006 | El botón de login tiene hover visible y focus ring visible para navegación por teclado; se puede activar con Enter. | accesibilidad | media |
| REQ-007 | Si el usuario ya tiene sesión/seed activo y navega a la ruta de login, el sistema permite reingresar igualmente (el login es idempotente, no bloquea). | edge-case | baja |

### Feature 1.2: Header persistente

**Descripción**: Barra superior siempre visible que orienta al usuario sobre dónde está y quién es, sin features de power-user.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-008 | El header muestra el logo del sistema en la zona del shell: isotipo (símbolo dental sutil) + wordmark "Estudio Dental Mendieta", sobrio, dentro de la paleta azul (creado por el equipo). | UI/UX | alta |
| REQ-009 | El header muestra el nombre del módulo activo, sincronizado con la ruta actual. | funcional | alta |
| REQ-010 | El header muestra el avatar del usuario logueado con iniciales "AD". | UI/UX | media |
| REQ-011 | El header NO muestra ningún badge, texto ni elemento visual que identifique al sistema como "demo", "mock", "simulación", "prueba" o "viewcase" (cambio de alcance del cliente: se presenta como producto real en producción). No existe el badge "Demo interactivo de [...]" ni link de atribución en el header. | anti-patrón | alta |
| REQ-012 | El header incluye un icono de notificaciones con badge contador (cantidad de notificaciones internas). | funcional | media |
| REQ-013 | El header NO incluye búsqueda global, NI command palette, NI atajos de teclado visibles globalmente. | anti-patrón | alta |
| REQ-014 | El search bar del header (si existe) busca SOLO dentro del contexto/módulo activo, nunca de forma global. | funcional | media |
| REQ-015 | El header permanece visible y fijo en todas las pantallas internas (no en login). | UI/UX | media |
| REQ-016 | En mobile el header se adapta sin romper layout; los elementos no esenciales pueden colapsarse pero el acceso al menú y al avatar se mantiene. | responsive | media |

### Feature 1.3: Sidebar de navegación

**Descripción**: Menú lateral con exactamente cinco secciones más footer de Configuración y Ayuda. Es el mapa mental del sistema.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-017 | El sidebar muestra exactamente cinco items principales en este orden: Agenda, Pacientes, Tratamientos, Facturación, Reportes (ni más, ni menos). | funcional | alta |
| REQ-018 | Cada item del sidebar muestra un icono a la izquierda y un label de texto SIEMPRE visible (nunca icono sin label). | accesibilidad | alta |
| REQ-019 | El item correspondiente a la ruta activa se destaca visualmente (fondo levemente distinto o color de marca atenuado). | UI/UX | alta |
| REQ-020 | El sidebar incluye en su zona inferior accesos a "Configuración" y "Ayuda" separados de los cinco módulos principales. | funcional | media |
| REQ-021 | El sidebar es fijo en desktop y NO es colapsable. | funcional | media |
| REQ-022 | Hacer clic en cualquier item del sidebar navega a la ruta dedicada de ese módulo y actualiza la URL. | funcional | alta |
| REQ-023 | En mobile el sidebar se transforma en un patrón usable (menú accesible mediante botón); los items mantienen icono + label y touch target ≥44px. | responsive | alta |
| REQ-024 | Cada item del sidebar tiene hover visible y es alcanzable y activable por teclado con focus ring visible. | accesibilidad | media |

### Feature 1.4: Footer

**Descripción**: Pie discreto con metadatos del sistema. Sin referencias a demo/mock ni atribución de portfolio (se presenta como producto real).

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-025 | El footer muestra el número de versión del sistema (ej: "v1.0"), presentado como versión de producto, sin la palabra "demo". | funcional | baja |
| REQ-026 | El footer muestra metadatos sobrios del sistema (nombre de la clínica y/o año). NO incluye link de atribución a Link Design ni a ningún sitio de portfolio, ni texto que sugiera que es un demo. | anti-patrón | baja |
| REQ-027 | El footer NO incluye ningún link ni acción "Resetear demo" ni texto similar. La acción de restablecer datos vive exclusivamente en Configuración con nombre de producción (ver REQ-264), no en el footer. | anti-patrón | media |
| REQ-028 | El footer es discreto y no compite visualmente con el contenido principal. | UI/UX | baja |

### Feature 1.5: Estructura de routing multi-pantalla (estructural — PRIORIDAD MÁXIMA)

**Descripción**: Toda navegación se basa en rutas dedicadas; la URL es la fuente de verdad de la vista. Esta es la corrección explícita al error del viewcase anterior.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-029 | Cada pantalla (lista, detalle, creación, edición, paso de un flujo) tiene una ruta/URL dedicada y única que la identifica. | funcional | alta |
| REQ-030 | El botón "atrás" del navegador funciona correctamente y devuelve a la pantalla anterior en todos los flujos. | funcional | alta |
| REQ-031 | Al cargar (deep-link) directamente cualquier URL interna válida, el sistema renderiza la pantalla correspondiente con los datos de localStorage, sin requerir navegar desde el inicio. | edge-case | alta |

---

## Épica 2: Persistencia, Seed y Reset

### Feature 2.1: Persistencia en localStorage

**Descripción**: Todas las acciones del usuario se guardan y sobreviven al refresh y al cierre de sesión del navegador.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-032 | Todo el estado de la aplicación (pacientes, turnos, tratamientos, presupuestos, facturas, documentos, configuración) persiste en localStorage del navegador. | funcional | alta |
| REQ-033 | Crear un paciente lo agrega al estado persistido y sigue presente tras refrescar la página. | funcional | alta |
| REQ-034 | Agendar un turno lo persiste y sigue visible tras refrescar y tras cerrar/reabrir el navegador. | funcional | alta |
| REQ-035 | Cambiar el estado de un turno (avanzar al siguiente paso) se persiste. | funcional | alta |
| REQ-036 | Marcar/avanzar etapas de un tratamiento se persiste. | funcional | alta |
| REQ-037 | Registrar un pago / cambiar estado de cuenta se persiste. | funcional | alta |
| REQ-038 | Aprobar un presupuesto o cambiar el estado de una factura se persiste. | funcional | alta |
| REQ-039 | Editar la ficha de un paciente persiste los cambios. | funcional | alta |
| REQ-040 | Si localStorage no está disponible (modo privado restrictivo / cuota llena), el sistema degrada con un aviso claro y permite navegar el seed en memoria sin crashear. | edge-case | media |
| REQ-041 | El estado persistido se versiona (clave/namespace + número de versión de schema) para evitar colisiones con builds futuras y permitir migración o reset limpio. | edge-case | media |

### Feature 2.2: Generación dinámica del seed desde las carpetas de fotos

**Descripción**: La base de pacientes se construye leyendo dinámicamente las carpetas de fotos; la cantidad de pacientes la determina la cantidad de fotos, NO un número fijo. **Resuelve la contradicción del documento (§12 menciona "treinta pacientes", pero §8/§11 ordenan lectura dinámica): se resuelve a favor de la lectura dinámica → 29 pacientes (12 hombres + 17 mujeres).**

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-042 | El seed de pacientes se genera leyendo las carpetas `hombres/` y `mujeres/` (vía manifest.json generado junto a las imágenes), NO con un número de pacientes hardcodeado. | funcional | alta |
| REQ-043 | La cantidad de pacientes seed es igual a la cantidad total de fotos válidas encontradas. Con el set actual entregado son 29 pacientes (12 hombres + 17 mujeres); los archivos no-imagen como `.DS_Store` se ignoran. | funcional | alta |
| REQ-044 | Para cada foto, la edad del paciente se extrae del nombre del archivo (ej: `45.jpg` → 45 años). | funcional | alta |
| REQ-045 | Para cada foto, el género del paciente se extrae del nombre de la carpeta contenedora (`hombres` o `mujeres`). | funcional | alta |
| REQ-046 | Cada paciente referencia su foto desde el path correspondiente y la foto se muestra correctamente en lista y ficha. | funcional | alta |
| REQ-047 | El convención de archivos con misma edad y sufijo (ej: `23-1.jpg`, `23-2.jpg`) se soporta: ambos generan pacientes distintos con esa misma edad. | edge-case | media |
| REQ-048 | Cada paciente recibe un nombre completo argentino plausible, coherente con la edad (apellidos acordes a la generación) y el género extraído. | funcional | alta |
| REQ-049 | Cada paciente recibe un DNI plausible con formato argentino correcto. | funcional | media |
| REQ-050 | Cada paciente recibe una obra social asignada con distribución típica argentina (mezcla de OSDE, Galeno, Swiss Medical, PAMI, IOMA y Particulares). | funcional | media |
| REQ-051 | Cada paciente recibe un profesional de cabecera asignado entre los seis del staff. | funcional | media |
| REQ-052 | El historial clínico de cada paciente es variable según la edad: niños y adolescentes con menos eventos, adultos con más; mezcla de pacientes nuevos sin historial y antiguos con historial extenso. | funcional | media |
| REQ-053 | El odontograma de cada paciente refleja un estado real por pieza coherente con la edad: niños pueden tener piezas de leche; adultos mayores pueden tener piezas ausentes o prótesis; mezcla de boca sana, tratamientos previos y tratamiento activo. | funcional | alta |
| REQ-054 | Los tratamientos asignados son coherentes con la edad: ortodoncia frecuente en adolescentes, implantes/prótesis más comunes en adultos mayores, limpieza universal. | funcional | media |
| REQ-055 | El estado de cuenta de los pacientes es una mezcla representativa de pacientes al día y con deuda. | funcional | media |

### Feature 2.3: Datos seed mínimos y reset

**Descripción**: El volumen y diversidad del seed deben dar sensación de operación viva; existe un reset al seed original.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-056 | El seed incluye los datos fijos de la clínica: "Estudio Dental Mendieta", CUIT 30-71234567-8, dirección genérica de zona céntrica, y el logo (isotipo dental + wordmark, en paleta azul, ver REQ-008). | funcional | media |
| REQ-057 | El seed incluye exactamente 6 profesionales con nombres argentinos plausibles y especialidades distintas: Dra. Carolina Etcheverry (ortodoncia, 12 años), Dr. Martín Aguilera (endodoncia, 18), Dra. Soledad Russo (odontología general, 8), Dr. Juan Pablo Acuña (implantología, 15), Dra. Laura Béccar Varela (estética dental, 7), Dr. Federico Salinas (odontopediatría, 10). | funcional | alta |
| REQ-058 | El seed cumple los volúmenes mínimos: ≥6 obras sociales (OSDE, Galeno, Swiss Medical, PAMI, IOMA, Particulares), ≥50 turnos en distintos estados (distribución ~30% confirmados/en espera futuros, ~50% terminados pasados, ~10% atendiendo/hoy, ~10% cancelados), ≥40 tratamientos (en curso/completados) variados, ≥20 presupuestos en distintos estados (pendiente/aprobado/rechazado/vencido), ≥25 facturas en los últimos 60 días en distintos estados (emitida/pagada/vencida/anulada), ≥12 tipos de tratamiento en el catálogo, 40-60 documentos placeholder (reutilizando un pool de ~15 imágenes: 10 radiografías + 5 fotos clínicas) distribuidos entre pacientes, e histórico de al menos 60 días. La acción de restablecer datos (ubicada SOLO en Configuración, con nombre de producción, ver REQ-264) restaura TODO el estado al estado inicial tras una confirmación explícita, y muestra un toast de éxito al completar. | funcional | alta |

---

## Épica 3: Módulo Agenda

> Principio rector aplicado: pocas acciones por pantalla, una acción primaria, clic en item navega a pantalla nueva (no drawer ni modal gigante). El antiejemplo uno del documento (calendario + detalle + form + lista a la vez) está explícitamente prohibido.

### Feature 3.1: Pantalla A — Vista calendario

**Descripción**: Calendario mensual por default con toggles semanal/diario; cada turno es un bloque coloreado por estado.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-059 | La Agenda muestra por default una vista mensual de calendario con ruta dedicada. | funcional | alta |
| REQ-060 | La Agenda ofrece toggles para cambiar entre vista mensual, semanal y diaria, y la vista activa se refleja en la URL/estado. | funcional | alta |
| REQ-061 | Cada turno se representa como un bloque coloreado según su estado: confirmado, en espera, atendiendo, terminado, cancelado. | funcional | alta |
| REQ-062 | El header de la Agenda contiene: título "Agenda", un único filtro principal visible (por profesional) y un botón primario "Nuevo turno". | UI/UX | alta |
| REQ-063 | Los filtros secundarios (estado, tipo de tratamiento) NO están permanentemente visibles; se acceden vía un botón "Filtros" que despliega un panel mínimo. | anti-patrón | alta |
| REQ-064 | Aplicar el filtro por profesional actualiza el calendario mostrando solo los turnos de ese profesional. | funcional | alta |
| REQ-065 | Hacer clic sobre un bloque de turno navega a la pantalla de detalle del turno (ruta dedicada), no abre un drawer ni un modal. | funcional | alta |
| REQ-066 | Si un período (mes/semana/día) no tiene turnos, se muestra un estado vacío diseñado con guidance (ej: "No hay turnos en este período. Creá uno con Nuevo turno"). | estado-vacío | media |
| REQ-067 | Mientras carga la agenda se muestran skeletons, no spinners. | estado-carga | media |
| REQ-068 | La vista de agenda (mensual/semanal/diaria) es usable en mobile: el calendario se adapta, los bloques son legibles y los toggles tienen touch target ≥44px. | responsive | alta |
| REQ-069 | El calendario es navegable por teclado (mover entre períodos, abrir un turno) con focus visible. | accesibilidad | media |

### Feature 3.2: Pantalla B — Detalle del turno

**Descripción**: Toda la información de un turno con una acción primaria de avance de estado.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-070 | El detalle del turno muestra: paciente (con foto pequeña y link a su ficha), profesional asignado, fecha y hora, duración, tratamiento previsto, estado actual y notas internas. | funcional | alta |
| REQ-071 | El detalle del turno expone una única acción primaria visible: avanzar el estado al siguiente paso lógico (ej: confirmado → atendiendo → terminado). | funcional | alta |
| REQ-072 | Las acciones secundarias (reagendar, cancelar) se acceden desde un menú de acciones secundarias compacto, no como botones primarios. | UI/UX | alta |
| REQ-073 | El link a la ficha del paciente desde el detalle del turno navega a la ficha correspondiente. | funcional | alta |
| REQ-074 | Avanzar el estado del turno persiste el cambio, refleja el nuevo estado en la pantalla y muestra un toast de éxito. | funcional | alta |
| REQ-075 | Cancelar un turno requiere confirmación explícita antes de ejecutarse. | error-handling | alta |
| REQ-076 | Si el turno ya está en estado terminal (terminado o cancelado), la acción primaria de avance se deshabilita (opacidad 40%, cursor not-allowed) o se oculta, comunicando que no hay siguiente paso. | edge-case | media |
| REQ-077 | El detalle del turno es usable en mobile (los profesionales miran agenda desde el teléfono): información legible en una columna, sin scroll horizontal. | responsive | alta |

### Feature 3.3: Pantalla C — Crear turno nuevo (flujo de 3 pasos)

**Descripción**: Flujo de creación dividido en tres pantallas distintas, cada una con ruta propia.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-078 | El flujo de crear turno consta de tres pasos, cada uno en su propia pantalla con ruta dedicada (no un modal multi-paso). | funcional | alta |
| REQ-079 | Paso 1 (Paciente): permite seleccionar un paciente existente desde un combo con búsqueda, u ofrece la opción de crear un paciente nuevo. | funcional | alta |
| REQ-080 | Paso 2 (Profesional y fecha): permite seleccionar profesional, ver su disponibilidad real, elegir un slot y definir la duración estimada. | funcional | alta |
| REQ-081 | El Paso 2 NO permite elegir un slot ya ocupado para ese profesional (la disponibilidad refleja los turnos existentes). | edge-case | alta |
| REQ-082 | Paso 3 (Tratamiento y confirmación): permite elegir el tratamiento previsto, agregar notas, revisar un resumen y confirmar con el botón "Confirmar turno". | funcional | alta |
| REQ-083 | "Confirmar turno" guarda el turno (persiste), navega al detalle del turno recién creado y muestra un toast de éxito. | funcional | alta |
| REQ-084 | Cada paso tiene un botón "Atrás" que vuelve al paso anterior preservando los datos ya ingresados. | flujo-alternativo | alta |
| REQ-085 | Existe un botón "Cancelar" que, al usarse, pide confirmación antes de descartar el turno en progreso. | error-handling | alta |
| REQ-086 | Cada paso valida sus campos requeridos inline antes de permitir avanzar (ej: no se puede avanzar del Paso 1 sin paciente seleccionado). | validación | alta |
| REQ-087 | El flujo de crear turno indica claramente en qué paso de los tres se encuentra el usuario (indicador de progreso). | UI/UX | media |

### Feature 3.4: Pantalla D — Reagendar turno

**Descripción**: Pantalla dedicada para mover un turno a nueva fecha/hora, con notificación de aviso al paciente.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-088 | La pantalla de reagendar muestra el turno actual arriba y un calendario abajo para elegir nueva fecha y hora, en ruta dedicada. | funcional | alta |
| REQ-089 | Confirmar el reagendamiento persiste la nueva fecha/hora y genera una notificación de WhatsApp de aviso al paciente. La UI la presenta como una notificación real enviada (ej: "Se notificó al paciente por WhatsApp"); NO usa las palabras "mock", "simulado" ni "de prueba" en el texto visible. Internamente no realiza envío real. | funcional | alta |
| REQ-090 | Reagendar no permite elegir un slot ya ocupado por el mismo profesional. | edge-case | media |
| REQ-091 | Tras reagendar exitosamente, el sistema muestra un toast de éxito y refleja la nueva fecha en el detalle del turno. | funcional | media |

### Feature 3.5: Pantalla E — Lista de turnos del día

**Descripción**: Vista alternativa en lista de los turnos del día, máximo cuatro columnas.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-092 | La lista de turnos del día muestra los turnos ordenados por hora. | funcional | alta |
| REQ-093 | Cada fila muestra exactamente cuatro columnas: paciente, profesional, hora y estado (no más de cuatro). | anti-patrón | alta |
| REQ-094 | Cada fila de la lista de turnos del día es clickeable y navega al detalle del turno. | funcional | alta |
| REQ-095 | Si el día seleccionado no tiene turnos, se muestra un estado vacío con guidance. | estado-vacío | media |
| REQ-096 | La lista del día muestra el estado de cada turno con badge de color suave coherente con los estados de la agenda. | UI/UX | media |
| REQ-097 | La lista de turnos del día es usable en mobile sin scroll horizontal (las 4 columnas se adaptan o reordenan verticalmente). | responsive | media |

---

## Épica 4: Módulo Pacientes — Lista y Ficha (cabecera)

> Pacientes es el centro del sistema y la pieza más fuerte del viewcase. La ficha se basa visualmente en la página Profile de Task Dasher.

### Feature 4.1: Pantalla A — Lista de pacientes

**Descripción**: Tabla de pacientes con cinco columnas máximo, buscador inline y paginación.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-098 | La lista de pacientes muestra una tabla con cinco columnas máximo: foto pequeña, nombre completo, obra social, próximo turno y estado de cuenta (no más de cinco). | anti-patrón | alta |
| REQ-099 | El header de la lista contiene: título "Pacientes", un buscador inline y un botón primario "Nuevo paciente". | UI/UX | alta |
| REQ-100 | El buscador inline filtra la lista de pacientes por nombre (y opcionalmente por documento) en tiempo real, dentro del contexto del módulo (no global). | funcional | alta |
| REQ-101 | Los filtros adicionales (obra social, edad, profesional) NO están permanentemente visibles; se acceden vía un botón "Filtros" que abre un panel mínimo. | anti-patrón | alta |
| REQ-102 | Cada fila de la lista es clickeable y navega a la ficha del paciente correspondiente (ruta dedicada). | funcional | alta |
| REQ-103 | La lista usa paginación clara con la cantidad total de pacientes visible; NO usa infinite scroll. | anti-patrón | alta |
| REQ-104 | La columna "estado de cuenta" muestra un badge de pago suave (al día, con deuda, vencido) coherente con el sistema de estados. | UI/UX | media |
| REQ-105 | Si el buscador o un filtro no arroja resultados, se muestra un estado vacío con guidance (ej: "No encontramos pacientes con ese criterio"). | estado-vacío | alta |
| REQ-106 | Mientras carga la lista se muestran skeletons de filas, no spinners. | estado-carga | media |
| REQ-107 | La lista de pacientes es usable en mobile: las columnas se adaptan o reordenan verticalmente, la foto y el nombre quedan legibles y la fila mantiene touch target ≥44px. | responsive | alta |
| REQ-108 | La lista es navegable por teclado: las filas son alcanzables, con focus visible, y se pueden abrir con Enter. | accesibilidad | media |

### Feature 4.2: Pantalla B — Cabecera de la ficha del paciente

**Descripción**: Header de la ficha con foto grande, datos básicos, badges de alerta y acciones. La estructura de tabs se detalla en la Épica 5.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-109 | La cabecera de la ficha muestra foto grande del paciente a la izquierda, nombre completo en grande, y datos básicos al lado (edad, obra social, profesional de cabecera). | UI/UX | alta |
| REQ-110 | La cabecera muestra badges de alerta cuando aplican: alergias, medicación, observaciones críticas. | funcional | alta |
| REQ-111 | Si un paciente NO tiene alertas, los badges de alerta simplemente no se muestran (no aparece un badge vacío ni "sin alergias" como badge). | edge-case | media |
| REQ-112 | La cabecera expone una única acción primaria visible: "Agendar turno", que inicia el flujo de creación de turno con el paciente preseleccionado. | funcional | alta |
| REQ-113 | Las acciones secundarias (editar ficha, eliminar) se acceden desde un menú compacto, no como botones primarios. | UI/UX | alta |
| REQ-114 | Eliminar un paciente requiere confirmación explícita antes de ejecutarse y, tras confirmar, navega a la lista de pacientes y muestra un toast. | error-handling | alta |
| REQ-115 | La cabecera de la ficha es usable en mobile: la foto y los datos se apilan verticalmente, legibles y sin scroll horizontal. | responsive | alta |

### Feature 4.3: Barra de tabs de la ficha (estructura)

**Descripción**: Barra horizontal con seis tabs; solo uno activo; el contenido inactivo no se renderiza en el DOM.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-116 | La ficha muestra, debajo de la cabecera, una barra horizontal con seis tabs claramente visibles: Información general, Odontograma, Historial clínico, Tratamientos, Documentos, Pagos. | funcional | alta |
| REQ-117 | Solo un tab está activo por vez y se destaca visualmente. | UI/UX | alta |
| REQ-118 | El contenido de los tabs NO activos NO se renderiza en el DOM; solo se carga cuando se hace clic en el tab. | funcional | alta |
| REQ-119 | El tab activo se refleja en la URL (o estado de ruta) de modo que recargar la página o compartir el link mantiene el tab seleccionado. | funcional | media |
| REQ-120 | La ficha del paciente NO usa scroll infinito con todos los datos visibles a la vez; el contenido se segmenta estrictamente por tabs (corrección explícita al antiejemplo dos del documento). | anti-patrón | alta |
| REQ-121 | Los tabs son navegables por teclado (cambiar de tab con teclado), con focus visible y rol semántico de tablist/tab. | accesibilidad | media |
| REQ-122 | En mobile la barra de tabs es usable: los tabs son alcanzables (scroll horizontal de la barra o adaptación), con touch target ≥44px. | responsive | alta |

### Feature 4.4: Navegación y deep-linking de la ficha

**Descripción**: La ficha y sus tabs respetan el modelo multi-pantalla y el botón atrás.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-123 | Cada ficha de paciente tiene una ruta dedicada que la identifica unívocamente (ej: por id de paciente). | funcional | alta |
| REQ-124 | Acceder por deep-link directo a la ruta de una ficha (con o sin tab específico) renderiza la ficha correcta desde localStorage. | edge-case | alta |
| REQ-125 | El botón atrás del navegador desde la ficha devuelve a la lista de pacientes (o a la pantalla previa real). | funcional | alta |
| REQ-126 | Si se accede a la ruta de un paciente inexistente (id inválido), se muestra un estado de "paciente no encontrado" con acción para volver a la lista, sin crashear. | error-handling | alta |
| REQ-127 | Volver atrás desde una sub-pantalla de la ficha (detalle de pieza, evento, plan) regresa a la ficha en el tab correspondiente. | flujo-alternativo | media |

---

## Épica 5: Módulo Pacientes — Tabs de la Ficha (6 tabs)

### Feature 5.1: Tab 1 — Información general

**Descripción**: Datos personales y clínicos básicos en cards aireadas (no tablas densas).

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-128 | El tab Información general muestra: datos personales, contacto, obra social y número de afiliado, contacto de emergencia, alergias, medicación habitual y observaciones generales. | funcional | alta |
| REQ-129 | La información se presenta en cards aireadas, no en tablas densas. | UI/UX | media |
| REQ-130 | Los campos sin dato (ej: paciente sin medicación) se muestran con un placeholder claro (ej: "Sin medicación registrada"), no en blanco ambiguo. | edge-case | media |
| REQ-131 | El tab Información general es usable y legible en mobile (cards apiladas en una columna). | responsive | media |

### Feature 5.2: Tab 2 — Odontograma (32 piezas, interactivo)

**Descripción**: Diagrama dental interactivo con las 32 piezas, cada una con estado visual; clic en una pieza navega a su detalle. Es uno de los diferenciales del viewcase.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-132 | El tab Odontograma muestra un diagrama dental con las 32 piezas representadas. | funcional | alta |
| REQ-133 | Cada pieza muestra su estado visual entre: sana, caries, obturación, ausente, en tratamiento, prótesis. | funcional | alta |
| REQ-134 | Cada estado de pieza se distingue claramente (color/ícono) y existe una leyenda/clave que explica qué significa cada estado. | UI/UX | alta |
| REQ-135 | Hacer clic en una pieza navega a la pantalla de detalle de esa pieza (ruta dedicada), no abre un drawer ni modal. | funcional | alta |
| REQ-136 | El odontograma refleja correctamente el estado seed de cada pieza del paciente (coherente con su edad: piezas de leche en niños, ausencias/prótesis en adultos mayores). | funcional | alta |
| REQ-137 | El odontograma distingue visualmente la dentición superior de la inferior y respeta una numeración dental consistente (ej: sistema FDI o numeración 1-32 documentada). | funcional | media |
| REQ-138 | Las piezas son alcanzables y activables por teclado, con focus visible, y cada pieza expone su número/estado de forma accesible (label o aria). | accesibilidad | media |
| REQ-139 | El odontograma es usable en mobile: las 32 piezas se renderizan legibles, las piezas mantienen touch target adecuado (o se ofrece zoom/adaptación) sin scroll horizontal que rompa el layout. | responsive | alta |
| REQ-140 | En un paciente sin ningún tratamiento previo, todas las piezas se muestran como "sana" sin estados inventados. | edge-case | media |

### Feature 5.3: Tab 3 — Historial clínico

**Descripción**: Timeline cronológico de eventos clínicos; clic en una entrada navega a su detalle.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-141 | El tab Historial clínico muestra un timeline cronológico con eventos clínicos. | funcional | alta |
| REQ-142 | Cada entrada del timeline muestra: fecha, tipo, profesional y descripción corta. | funcional | alta |
| REQ-143 | Hacer clic en una entrada navega a la pantalla de detalle del evento clínico (ruta dedicada). | funcional | alta |
| REQ-144 | Los eventos del timeline se ordenan cronológicamente (más reciente primero o más antiguo primero, de forma consistente y documentada). | funcional | media |
| REQ-145 | Si el paciente es nuevo y no tiene eventos, el tab muestra un estado vacío con guidance (ej: "Este paciente todavía no tiene eventos clínicos registrados"). | estado-vacío | alta |
| REQ-146 | Las entradas usan "last updated" relativo cuando aplica (ej: "Hace 2 días") coherente con el patrón del sistema. | UI/UX | baja |
| REQ-147 | El historial es usable en mobile (timeline en una columna, legible). | responsive | media |

### Feature 5.4: Tab 4 — Tratamientos del paciente

**Descripción**: Planes de tratamiento separados en activos y completados; clic navega al detalle del plan.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-148 | El tab Tratamientos muestra los planes de tratamiento del paciente separados en dos grupos: activos y completados. | funcional | alta |
| REQ-149 | Cada plan muestra: nombre, etapas totales, etapas completadas y costo. | funcional | alta |
| REQ-150 | El progreso del plan (etapas completadas sobre totales) se muestra visualmente (porcentaje grande + etiqueta "Progreso", patrón de cards de progreso). | UI/UX | media |
| REQ-151 | Hacer clic en un plan navega a la pantalla de detalle del plan de tratamiento (ruta dedicada). | funcional | alta |
| REQ-152 | Si el paciente no tiene tratamientos, el tab muestra un estado vacío con guidance. | estado-vacío | media |
| REQ-153 | Si el paciente tiene solo activos o solo completados, el grupo vacío se omite o muestra un mensaje breve, sin romper el layout. | edge-case | baja |
| REQ-154 | El tab Tratamientos es usable en mobile (cards de plan apiladas, legibles). | responsive | media |

### Feature 5.5: Tab 5 — Documentos

**Descripción**: Galería de archivos en cuadrícula con thumbnail y nombre; clic navega a la vista expandida.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-155 | El tab Documentos muestra una galería en cuadrícula, cada documento con thumbnail y nombre. | funcional | alta |
| REQ-156 | Hacer clic en un documento navega a una vista expandida del documento (ruta dedicada o vista de detalle, no un modal gigante que rompa el patrón). | funcional | alta |
| REQ-157 | Los documentos usan imágenes placeholder (radiografías y fotos clínicas reutilizables, pool de ~15 imágenes); se presentan en la UI como documentos clínicos reales del paciente (sin ninguna etiqueta visible de "demo/mock/ejemplo") y se muestran sin errores de carga de imagen. | funcional | media |
| REQ-158 | Si el paciente no tiene documentos, el tab muestra un estado vacío con guidance. | estado-vacío | media |
| REQ-159 | Si un thumbnail no carga, se muestra un placeholder de imagen rota controlado (no un ícono de error del navegador). | error-handling | baja |
| REQ-160 | La galería de documentos es usable en mobile (la cuadrícula se reduce a 1-2 columnas, thumbnails legibles, touch target ≥44px). | responsive | media |

### Feature 5.6: Tab 6 — Pagos / Estado de cuenta corriente

**Descripción**: Estado de cuenta con resumen arriba y lista de movimientos.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-161 | El tab Pagos muestra un resumen del estado de cuenta arriba (ej: total facturado, total cobrado, saldo/deuda) y debajo una lista de movimientos. | funcional | alta |
| REQ-162 | Cada movimiento muestra al menos: fecha, concepto, monto y signo/tipo (cargo o pago), con montos en pesos argentinos correctamente formateados. | funcional | alta |
| REQ-163 | El estado de cuenta refleja correctamente si el paciente está al día, con deuda o vencido, coherente con el badge mostrado en la lista de pacientes. | funcional | alta |
| REQ-164 | El tab Pagos expone una acción para registrar un pago (confirmada como editable, ver Épica 11): registrar un pago persiste el movimiento, actualiza el saldo y muestra un toast de éxito. | funcional | alta |
| REQ-165 | Si el paciente no tiene movimientos, el tab muestra un estado vacío con guidance (ej: "Sin movimientos en la cuenta corriente"). | estado-vacío | media |
| REQ-166 | Los montos negativos (deuda) y positivos (pagos/saldo a favor) se distinguen visualmente de forma clara. | UI/UX | media |
| REQ-167 | El tab Pagos es usable en mobile (resumen y lista en una columna, sin scroll horizontal). | responsive | media |
| REQ-168 | Mientras cargan los movimientos se muestran skeletons. | estado-carga | baja |

### Feature 5.7: Coherencia transversal de los tabs

**Descripción**: Reglas que aplican a todos los tabs de la ficha en conjunto.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-169 | Cambiar de tab no recarga la cabecera de la ficha (foto, nombre, datos básicos permanecen estables). | funcional | media |
| REQ-170 | Los datos mostrados en los tabs son coherentes entre sí (ej: un tratamiento activo en el tab Tratamientos aparece reflejado en el odontograma como pieza "en tratamiento" cuando corresponde). | funcional | media |
| REQ-171 | Ningún tab usa drawers laterales ni modales >50% como contenido principal. | anti-patrón | alta |
| REQ-172 | Cada sub-pantalla de un tab (detalle de pieza, evento o plan) ofrece una forma clara de volver al tab de origen. | flujo-alternativo | media |

---

## Épica 6: Módulo Pacientes — Crear / Editar / Detalles

### Feature 6.1: Pantalla C — Crear paciente nuevo (flujo de 2 pasos)

**Descripción**: Creación de paciente en dos pantallas distintas con rutas propias.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-173 | El flujo de crear paciente consta de dos pasos, cada uno en su propia pantalla con ruta dedicada. | funcional | alta |
| REQ-174 | Paso 1: datos personales y contacto (nombre, género, edad/fecha, DNI, contacto). | funcional | alta |
| REQ-175 | Paso 2: datos clínicos iniciales (alergias, medicación, observaciones, profesional de cabecera, foto opcional). | funcional | alta |
| REQ-176 | El Paso 1 valida inline los campos requeridos y el formato del DNI antes de permitir avanzar. | validación | alta |
| REQ-177 | Cada paso tiene botón "Atrás" que preserva los datos ya ingresados, y un "Cancelar" con confirmación. | flujo-alternativo | alta |
| REQ-178 | Al confirmar el último paso, el paciente se persiste, el sistema navega a su ficha recién creada y muestra un toast de éxito. | funcional | alta |
| REQ-179 | Si la foto es opcional y no se carga, el paciente usa un placeholder determinista (iniciales en círculo de color pastel), no una imagen rota. | edge-case | media |
| REQ-180 | El flujo de creación de paciente (2 pasos) es completamente usable en mobile (formularios en una columna, inputs con altura consistente, touch target ≥44px, navegación entre pasos sin scroll horizontal). | responsive | alta |
| REQ-181 | El flujo indica en qué paso de los dos se encuentra el usuario. | UI/UX | baja |

### Feature 6.2: Pantalla D — Editar información del paciente

**Descripción**: Pantalla dedicada con formulario editable.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-182 | Editar paciente abre una pantalla dedicada (ruta propia) con un formulario editable precargado con los datos actuales. | funcional | alta |
| REQ-183 | Guardar cambios valida inline, persiste los datos, navega de vuelta a la ficha y muestra un toast de éxito. | funcional | alta |
| REQ-184 | Cancelar la edición descarta los cambios (con confirmación si hubo modificaciones) y vuelve a la ficha sin alterar datos. | flujo-alternativo | media |
| REQ-185 | La pantalla de editar paciente es completamente usable en mobile (formulario en una columna, inputs consistentes, guardar/cancelar accesibles, touch target ≥44px). | responsive | alta |

### Feature 6.3: Pantalla E — Detalle de pieza dental específica

**Descripción**: Pantalla a la que se llega desde el odontograma.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-186 | El detalle de pieza dental muestra: número y nombre de la pieza, estado actual, un control para cambiar el estado de la pieza (editable, ver Épica 11) y el historial de procedimientos sobre esa pieza. | funcional | alta |
| REQ-187 | Si la pieza no tiene procedimientos previos, muestra un estado vacío claro (ej: "Sin procedimientos registrados en esta pieza"). | estado-vacío | media |
| REQ-188 | El detalle de pieza ofrece volver al odontograma del paciente. | flujo-alternativo | media |

### Feature 6.4: Pantallas F y G — Detalle de evento clínico y de plan de tratamiento

**Descripción**: Pantallas dedicadas a las que se llega desde los tabs Historial y Tratamientos.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-189 | El detalle de evento clínico (Pantalla F) muestra la información completa del evento (fecha, tipo, profesional, descripción ampliada) en ruta dedicada y permite volver al historial. | funcional | alta |
| REQ-190 | El detalle de plan de tratamiento (Pantalla G) muestra la información completa del plan: etapas (completadas y pendientes), costo, profesional asignado y progreso, en ruta dedicada. | funcional | alta |
| REQ-191 | El detalle del plan permite identificar qué etapas están completadas y cuáles pendientes, de forma visual y clara, y permite volver al tab Tratamientos. | funcional | media |

---

## Épica 7: Módulo Tratamientos

### Feature 7.1: Pantalla A — Lista de tratamientos activos

**Descripción**: Tabla de tratamientos activos con cinco columnas máximo y filtro principal por profesional.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-192 | La lista de tratamientos muestra una tabla con cinco columnas máximo: paciente (con foto pequeña), tratamiento, profesional, etapas completadas sobre totales y próxima fecha prevista. | anti-patrón | alta |
| REQ-193 | La lista tiene un único filtro principal visible (por profesional); los demás filtros van en un botón "Filtros" desplegable. | anti-patrón | alta |
| REQ-194 | Cada fila es clickeable y navega al detalle del plan de tratamiento. | funcional | alta |
| REQ-195 | Si no hay tratamientos activos (o el filtro no arroja resultados), se muestra un estado vacío con guidance. | estado-vacío | media |
| REQ-196 | La columna de etapas muestra el progreso de forma legible (ej: "3/5"). | UI/UX | media |
| REQ-197 | La lista es usable en mobile y muestra skeletons mientras carga. | responsive | media |

### Feature 7.2: Pantalla B — Tipos de tratamiento (catálogo)

**Descripción**: Catálogo en cards aireadas, no tabla densa.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-198 | El catálogo de tipos de tratamiento se muestra en cards aireadas (no en tabla densa), cada una con descripción corta, costo de referencia y duración estimada. | UI/UX | alta |
| REQ-199 | El catálogo incluye al menos los 12 tipos mínimos: limpieza profesional, ortodoncia con brackets, ortodoncia invisible, implante unitario, implante múltiple, conducto, blanqueamiento, carilla estética, corona, extracción simple, extracción de molar, prótesis fija, prótesis removible. | funcional | alta |
| REQ-200 | Cada card del catálogo es clickeable y navega al detalle del tipo de tratamiento. | funcional | alta |
| REQ-201 | El catálogo es usable en mobile (cards en 1-2 columnas). | responsive | media |

### Feature 7.3: Pantalla C — Detalle de tipo de tratamiento

**Descripción**: Información completa de un tipo de tratamiento.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-202 | El detalle de tipo de tratamiento muestra: pasos típicos, materiales, costo, duración y profesionales habilitados. | funcional | alta |
| REQ-203 | El costo se muestra en pesos argentinos correctamente formateado. | UI/UX | baja |
| REQ-204 | El detalle ofrece volver al catálogo de tipos. | flujo-alternativo | baja |
| REQ-205 | El detalle es usable en mobile. | responsive | baja |

---

## Épica 8: Módulo Facturación

> Nota explícita: sin integración ARCA ni AFIP. Las facturas y presupuestos son un módulo interno del sistema (no se conectan a organismos fiscales). En la UI se presentan como documentos reales del sistema; nunca se muestra al usuario que sean de prueba.

### Feature 8.1: Pantalla A — Lista de presupuestos

**Descripción**: Tabla de presupuestos con 4-5 columnas y acción para crear.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-206 | La lista de presupuestos muestra una tabla con cuatro o cinco columnas: paciente, fecha de emisión, monto y estado. | anti-patrón | alta |
| REQ-207 | La lista de presupuestos tiene un botón "Nuevo presupuesto" arriba. | funcional | alta |
| REQ-208 | Cada fila es clickeable y navega al detalle del presupuesto. | funcional | alta |
| REQ-209 | Si no hay presupuestos (o el filtro no arroja resultados), se muestra un estado vacío con guidance; mientras carga, skeletons. | estado-vacío | media |
| REQ-210 | El estado del presupuesto se muestra con badge suave (ej: pendiente, aprobado, rechazado, vencido). | UI/UX | media |

### Feature 8.2: Pantalla B — Detalle del presupuesto

**Descripción**: Información completa con acción primaria según estado.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-211 | El detalle del presupuesto muestra: paciente, tratamientos incluidos, costo desglosado, condiciones y vencimiento. | funcional | alta |
| REQ-212 | El detalle expone una única acción primaria según el estado (ej: "Aprobar" si está pendiente); las secundarias van en menú compacto. | funcional | alta |
| REQ-213 | Aprobar un presupuesto persiste el cambio de estado, muestra un toast y refleja el nuevo estado. | funcional | alta |
| REQ-214 | Si el presupuesto está vencido o ya aprobado, la acción primaria se adapta o deshabilita coherentemente (no se puede aprobar dos veces). | edge-case | media |
| REQ-215 | El detalle del presupuesto es completamente usable en mobile (información en una columna, acción primaria accesible, sin scroll horizontal). | responsive | media |

### Feature 8.3: Pantalla C — Crear nuevo presupuesto (flujo de 3 pasos)

**Descripción**: Flujo de tres pasos en pantallas distintas.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-216 | El flujo de crear presupuesto consta de tres pasos en pantallas distintas con rutas dedicadas: paciente, tratamientos, revisión. | funcional | alta |
| REQ-217 | El paso de tratamientos permite agregar uno o varios tratamientos y calcular el costo total automáticamente. | funcional | alta |
| REQ-218 | El paso de revisión muestra un resumen del presupuesto antes de confirmar. | funcional | media |
| REQ-219 | Cada paso valida inline, tiene "Atrás" que preserva datos y "Cancelar" con confirmación. | validación | alta |
| REQ-220 | Al confirmar, el presupuesto se persiste, el sistema navega a su detalle y muestra un toast de éxito. | funcional | alta |
| REQ-271 | El flujo completo de crear presupuesto (3 pasos: paciente, tratamientos, revisión) es usable en mobile: cada paso en una columna, el cálculo de costo total legible, navegación entre pasos y touch target ≥44px, sin scroll horizontal. (ID asignado al final de la secuencia por incorporarse en Fase 2; ver cambio de alcance mobile.) | responsive | alta |

### Feature 8.4: Pantallas D y E — Lista y detalle de facturas

**Descripción**: Facturas internas (sin integración fiscal) con cuatro columnas en lista y detalle completo; se presentan en la UI como facturas reales del sistema.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-221 | La lista de facturas muestra cuatro columnas: paciente, número de factura, monto y estado. | anti-patrón | alta |
| REQ-222 | Cada fila de factura es clickeable y navega al detalle de la factura. | funcional | alta |
| REQ-223 | El detalle de factura muestra la información completa, los ítems facturados, los totales y el estado. | funcional | alta |
| REQ-224 | La factura NO menciona ARCA, AFIP ni integración fiscal en ningún punto. | anti-patrón | alta |
| REQ-225 | Si no hay facturas (o el filtro no arroja resultados), se muestra un estado vacío con guidance; mientras carga, skeletons. | estado-vacío | media |
| REQ-226 | Lista y detalle de facturas son usables en mobile. | responsive | baja |

### Feature 8.5: Pantallas F y G — Obras sociales (lista y detalle)

**Descripción**: Obras sociales en cards aireadas (no tabla) con detalle.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-227 | La lista de obras sociales se muestra en cards aireadas (no en tabla), cada card con logo placeholder, nombre, cantidad de pacientes activos y deuda pendiente. | UI/UX | alta |
| REQ-228 | Cada card de obra social es clickeable y navega a su detalle. | funcional | alta |
| REQ-229 | El detalle de obra social muestra: información, pacientes asociados e historial de liquidaciones. | funcional | alta |
| REQ-230 | El detalle permite navegar desde un paciente asociado a su ficha. | funcional | media |
| REQ-231 | Lista y detalle de obras sociales son usables en mobile (cards en 1-2 columnas) y muestran estado vacío con guidance si una obra social no tiene pacientes. | responsive | media |

---

## Épica 9: Módulo Reportes

### Feature 9.1: Pantalla A — Dashboard de reportes (KPI cards)

**Descripción**: Grilla de hasta seis KPI cards clickeables que llevan a reportes detallados.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-232 | El dashboard de reportes muestra KPI cards en grilla aireada, con no más de seis cards: pacientes nuevos del mes, turnos atendidos, tratamientos completados, ingresos facturados, ingresos cobrados y deuda pendiente. | funcional | alta |
| REQ-233 | Cada KPI card es clickeable y navega a su reporte detallado correspondiente. | funcional | alta |
| REQ-234 | Los valores de las KPI cards se calculan a partir de los datos reales del estado (seed + acciones del usuario), no son números estáticos hardcodeados. | funcional | alta |
| REQ-235 | El dashboard es usable en mobile (las KPI cards se apilan en 1-2 columnas). | responsive | media |
| REQ-236 | Las KPI cards son alcanzables y activables por teclado con focus visible. | accesibilidad | baja |

### Feature 9.2: Pantalla B — Reporte de pacientes

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-237 | El reporte de pacientes muestra gráficos en cards separadas y aireadas: pacientes nuevos en el tiempo, distribución por obra social, distribución por edad y género, y ranking de profesionales. | funcional | alta |
| REQ-238 | Los gráficos reflejan los datos reales del estado y se mantienen legibles si una categoría está vacía (no crashean con datos faltantes). | edge-case | media |

### Feature 9.3: Pantalla C — Reporte de tratamientos

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-239 | El reporte de tratamientos muestra gráficos: tipos más realizados, tasa de finalización y duración promedio. | funcional | alta |
| REQ-240 | Los gráficos del reporte de tratamientos reflejan datos reales del estado. | funcional | media |

### Feature 9.4: Pantalla D — Reporte financiero

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-241 | El reporte financiero muestra gráficos: ingresos por mes, facturación por obra social y deuda por antigüedad. | funcional | alta |
| REQ-242 | Los montos del reporte financiero se muestran en pesos argentinos correctamente formateados. | UI/UX | media |

### Feature 9.5: Pantalla E — Reporte de productividad

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-243 | El reporte de productividad muestra gráficos: producción por profesional, turnos atendidos versus cancelados y tasa de presentación. | funcional | alta |
| REQ-244 | Los gráficos de productividad reflejan datos reales del estado. | funcional | media |
| REQ-245 | Todos los reportes (B-E) son usables en mobile (los gráficos se adaptan o permiten lectura sin scroll horizontal que rompa layout). | responsive | media |
| REQ-246 | Todos los reportes muestran skeletons mientras cargan y un estado vacío con guidance si no hay datos suficientes para un gráfico. | estado-vacío | media |

---

## Épica 10: Calidad Transversal (responsive, accesibilidad, feedback, anti-patrones)

### Feature 10.1: Feedback del sistema (transversal)

**Descripción**: Reglas de feedback que aplican a todo el sistema.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-247 | Antes de cualquier acción destructiva o irreversible (eliminar, cancelar turno, restablecer datos), el sistema pide confirmación explícita. | error-handling | alta |
| REQ-248 | Después de cada acción exitosa (crear, editar, aprobar, cambiar estado, registrar pago, reset), el sistema muestra un toast claro. | funcional | alta |
| REQ-249 | Los formularios validan inline (no solo al enviar) y muestran el error junto al campo afectado. | validación | alta |
| REQ-250 | Toda lista o sección que pueda quedar vacía tiene un estado vacío diseñado con guidance (no una pantalla en blanco). | estado-vacío | alta |
| REQ-251 | Las listas y secciones que cargan datos muestran skeletons, no spinners. | estado-carga | media |

### Feature 10.2: Responsive (transversal)

**Descripción**: Cobertura desktop + mobile completa. Cambio de alcance del cliente: TODOS los flujos son usables en celular (no solo consulta).

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-252 | El sistema es usable en desktop y mobile en TODOS sus flujos (cambio de alcance del cliente). Específicamente, además de consulta, son completamente usables y responsive en celular: crear/editar paciente (2 pasos), crear turno (3 pasos), reagendar turno, crear presupuesto (3 pasos), registrar pago y editar el estado de piezas en el odontograma. Ningún flujo queda relegado a "solo desktop". | responsive | alta |
| REQ-253 | Todos los elementos interactivos en mobile tienen un touch target mínimo de 44px, incluidos los controles de los formularios multi-paso, el control de registrar pago y el selector de estado de pieza dental. | responsive | alta |
| REQ-254 | Ninguna pantalla produce scroll horizontal no intencional en viewports de mobile estándar, incluyendo las pantallas de creación/edición y el odontograma editable. | responsive | media |

### Feature 10.3: Accesibilidad mínima (transversal)

**Descripción**: Contraste, foco y navegación por teclado.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-255 | Todos los elementos clickeables tienen un foco visible para navegación por teclado (focus ring). | accesibilidad | alta |
| REQ-256 | El contraste de texto y elementos respeta un nivel suficiente (objetivo WCAG AA en texto y controles). | accesibilidad | alta |

### Feature 10.4: Cumplimiento de restricciones explícitas / anti-patrones (transversal)

**Descripción**: Verificación de que el sistema NO incorpora lo prohibido. Estos criterios son la red de seguridad contra el error del viewcase anterior.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-257 | El sistema NO incluye ninguno de estos anti-patrones estructurales: drawers laterales como contenido principal, modales mayores al 50% de la pantalla, pantallas únicas que mezclan lista + detalle + formulario + panel, tabs que reemplazan navegación entre objetos distintos, tablas con más de cinco columnas, múltiples acciones primarias por pantalla, múltiples filtros simultáneos visibles en listas, iconos sin label en navegación principal, infinite scroll en listas operativas, ni power-user features (command palette, atajos globales visibles, búsqueda global). | anti-patrón | alta |
| REQ-258 | El sistema NO incluye: autenticación real, roles ni permisos (solo vista master/administradora), conexión a APIs externas, analytics ni tracking, formularios que envíen información real, ni mención de ARCA/AFIP/integración fiscal. | anti-patrón | alta |
| REQ-272 | El sistema NO expone, en NINGÚN texto ni elemento visual de la UI (header, footer, Configuración, toasts, tooltips, notificaciones, vacíos, copy de cualquier pantalla), las palabras ni la idea de "demo", "mock", "simulación", "simulado", "de prueba", "ejemplo", "ficticio", "viewcase" ni atribución a Link Design/portfolio. Todo se presenta como un sistema real en producción. (Red de seguridad de QA para el cambio de alcance del cliente; ID asignado al final de la secuencia por incorporarse en Fase 2. Ver REQ-011, REQ-026, REQ-027, REQ-089, REQ-157, REQ-264.) | anti-patrón | alta |

---

## Épica 11: Edición de Pagos y Odontograma (interactividad de escritura)

> Resuelve la Pregunta 7 (GAP-B08): el cliente eligió **AMBOS editables** (sube alcance respecto a la recomendación inicial B). Pagos y Odontograma dejan de ser solo lectura. Estas ediciones hacen que el sistema "viva" cuando el lead lo prueba: registra un pago y ve el saldo cambiar; cambia el estado de una pieza dental y lo ve reflejado. Todo persiste en localStorage. Complementa REQ-164 (Pagos) y REQ-186 (detalle de pieza).

### Feature 11.1: Registrar pago en la cuenta corriente (Pagos editable)

**Descripción**: Desde el tab Pagos de la ficha, la administradora registra un pago y ve el saldo de cuenta corriente actualizarse y persistir.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-259 | El tab Pagos expone una acción primaria "Registrar pago" que abre el formulario de registro de pago (en ruta dedicada o pantalla de detalle coherente con el modelo multi-pantalla, no un modal gigante). | funcional | alta |
| REQ-260 | El formulario de registrar pago permite ingresar al menos: monto (en pesos argentinos), fecha y concepto/medio de pago; valida inline que el monto sea un número positivo antes de permitir confirmar. | validación | alta |
| REQ-261 | Al confirmar el pago, el sistema agrega el movimiento a la cuenta corriente del paciente, recalcula el saldo (deuda/al día/saldo a favor) y lo persiste en localStorage (sobrevive al refresh y al cierre del navegador). | funcional | alta |
| REQ-262 | Tras registrar el pago, el resumen del estado de cuenta (total cobrado, saldo) se actualiza en pantalla de inmediato, el nuevo movimiento aparece en la lista, el badge de estado de cuenta del paciente (en la lista de pacientes) queda coherente con el nuevo saldo, y se muestra un toast de éxito. | funcional | alta |
| REQ-263 | El formulario de registrar pago tiene "Cancelar" (con confirmación si hay datos ingresados) que descarta sin alterar el saldo, y es completamente usable en mobile (campos en una columna, touch target ≥44px, sin scroll horizontal). | responsive | alta |

### Feature 11.2: Restablecer datos desde Configuración (nombre de producción)

**Descripción**: La acción que antes se llamaba "Resetear demo" se reubica en Configuración con nombre de producción y sin la palabra "demo", presentándose como una función normal de administración del sistema.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-264 | La pantalla de Configuración incluye una acción de restablecimiento con nombre de producción (ej: "Restablecer datos" o "Restaurar configuración inicial"), SIN la palabra "demo", "mock" ni "simulación" en ningún texto visible (label, descripción, confirmación ni toast). | anti-patrón | alta |
| REQ-265 | Al activar "Restablecer datos", el sistema pide confirmación explícita advirtiendo que se perderán los cambios y se volverá al estado inicial; solo tras confirmar restaura TODO el estado al seed original y muestra un toast de éxito con copy de producción. | error-handling | alta |
| REQ-266 | La acción de restablecer datos NO aparece en el footer ni en ningún otro lugar fuera de Configuración (ver REQ-027); es la única vía de reset y es usable en mobile. | funcional | media |

### Feature 11.3: Editar el estado de una pieza dental (Odontograma editable)

**Descripción**: Desde la pantalla de detalle de pieza dental (a la que se llega tocando una pieza del odontograma), la administradora cambia el estado de la pieza y lo ve persistir y reflejarse en el odontograma.

#### Criterios de Aceptación

| ID | Criterio | Tipo | Prioridad |
|---|---|---|---|
| REQ-267 | La pantalla de detalle de pieza dental expone un control para cambiar el estado de la pieza, eligiendo entre los seis estados válidos: sana, caries, obturación, ausente, en tratamiento, prótesis. | funcional | alta |
| REQ-268 | Al cambiar el estado de la pieza y confirmar, el sistema persiste el nuevo estado en localStorage (sobrevive al refresh), muestra un toast de éxito y, al volver al odontograma, la pieza refleja visualmente (color/ícono y leyenda) el nuevo estado. | funcional | alta |
| REQ-269 | El cambio de estado de una pieza es coherente con el resto de la ficha: si se marca una pieza como "en tratamiento", el sistema no entra en estado inconsistente con los tabs relacionados (la coherencia descrita en REQ-170 se mantiene; no se exige que el cambio genere automáticamente un evento clínico, pero el odontograma y su leyenda quedan consistentes). | edge-case | media |
| REQ-270 | El control de edición del estado de pieza es completamente usable en mobile: el selector de estado tiene touch target ≥44px, es legible y operable sin scroll horizontal, y el odontograma editable se navega cómodamente en celular. | responsive | alta |

---

## Requisitos No Funcionales

### Performance
| ID | Criterio | Target |
|---|---|---|
| NFR-001 | Tiempo de carga inicial | Bajo 3 segundos en conexión 4G |
| NFR-002 | Tamaño del bundle inicial | Bajo 500 KB gzipped |
| NFR-003 | Carga de módulos secundarios | Lazy loading (no todo en el bundle inicial) |
| NFR-004 | Rendimiento del odontograma | Renderiza las 32 piezas sin lag perceptible en interacción |
| NFR-005 | Persistencia | Las lecturas/escrituras de localStorage no bloquean la UI de forma perceptible |

### Routing / Arquitectura
| ID | Criterio | Target |
|---|---|---|
| NFR-006 | Multi-pantalla con rutas dedicadas | La URL siempre refleja qué ve el usuario |
| NFR-007 | Botón atrás del navegador | Funciona correctamente en todos los flujos |
| NFR-008 | Deep-linking | Cargar cualquier URL interna válida renderiza la pantalla correcta desde localStorage |
| NFR-009 | No-SPA-modal | Prohibido SPA con todo en modales/accordions ocultos |

### Compatibilidad
| ID | Criterio | Target |
|---|---|---|
| NFR-010 | Navegadores soportados | Chrome, Safari, Firefox, Edge (versiones actualizadas) |
| NFR-011 | Dispositivos | 70% desktop / 30% mobile; TODOS los flujos usables en mobile (consulta + crear/editar paciente, turno, reagendar, presupuesto, registrar pago y editar odontograma). Ver REQ-252. |

### Despliegue
| ID | Criterio | Target |
|---|---|---|
| NFR-012 | Hosting | Azure Static Web Apps |
| NFR-013 | URL pública | URL default de Azure Static Web Apps (`*.azurestaticapps.net`). SIN dominio propio (decisión del cliente). El routing multi-pantalla (NFR-006..009) debe funcionar correctamente bajo esa URL default, incluyendo deep-linking con fallback a index para rutas del cliente. |

### Accesibilidad
| ID | Criterio | Target |
|---|---|---|
| NFR-020 | Contraste | Objetivo WCAG AA en texto y controles |
| NFR-021 | Foco de teclado | Focus ring visible en todo elemento interactivo |
| NFR-022 | Touch targets | ≥44px en mobile |
| NFR-023 | Labels en navegación | Ningún icono de navegación principal sin label de texto |

### Datos / Seed
| ID | Criterio | Target |
|---|---|---|
| NFR-030 | Realismo del seed | Nombres argentinos plausibles, montos en pesos, mezcla de estados representativa |
| NFR-031 | Histórico | Al menos 60 días de datos históricos |
| NFR-032 | Edge cases en datos | Representados (pacientes nuevos sin historial, pacientes con deuda, boca sana vs con tratamientos, etc.) |
| NFR-033 | Manifest | Existe `manifest.json` junto a las imágenes con la estructura de pacientes y documentos |
| NFR-034 | Idioma | Todo el copy en español rioplatense neutro, tono profesional pero cercano ("ficha del paciente", no "expediente") |

---

## Gaps — TODOS RESUELTOS (Fase 2)

> **Estado: 0 gaps pendientes.** Los 17 gaps de Fase 1 quedaron resueltos en Fase 2: las **7 preguntas de negocio** fueron respondidas por el cliente (2026-06-01) y las **10 decisiones técnicas** se incorporaron. Esta tabla deja la trazabilidad de cada gap → resolución → criterios afectados. No queda ningún gap que requiera al cliente.

### Gaps de Negocio — RESUELTOS por el cliente

| # | Gap | Decisión del cliente | Criterios / artefactos afectados | Estado |
|---|---|---|---|---|
| GAP-B01 | Familia de color de acento | **Azul cielo / medio** (#c5d8e8 suave / #6da8d4 medio), máx. 4 tonos coherentes; neutros y semánticos pastel. | Capa visual (design pipeline / design-brief). Referenciado en nota v2.0. | RESUELTO |
| GAP-B02 | Tipografía | **Red Hat** — Display para títulos, Text para cuerpo, solo pesos 400 y 500. NO Inter. | Capa visual (design pipeline). Referenciado en nota v2.0. | RESUELTO |
| GAP-B03 | Dominio público | **SIN dominio propio** — URL default de Azure Static Web Apps (`*.azurestaticapps.net`). | NFR-012, NFR-013. Deploy (DevOps). | RESUELTO |
| GAP-B04 | Logo y branding | **Isotipo + wordmark** "Estudio Dental Mendieta" (símbolo dental sutil + nombre, paleta azul). Lo crea el equipo. | REQ-008, REQ-056. | RESUELTO |
| GAP-B05 | Badge "Demo interactivo de [...]" | **ELIMINADO — cambio de alcance.** Ninguna referencia escrita ni visual a demo/mock/simulado. Se presenta como producto real. Reset reubicado a Configuración con nombre de producción. | REQ-011, REQ-026, REQ-027, REQ-058, REQ-089, REQ-157, REQ-264, REQ-272. | RESUELTO |
| GAP-B06 | Cronograma de entrega e hitos | (Reclasificado a proceso) Lo gestiona el PM; no es elección de producto. | — (planificación PM) | RESUELTO |
| GAP-B07 | Alcance de mobile | **TODOS los flujos usables en mobile** (sube alcance): crear/editar paciente, crear turno, reagendar, crear presupuesto, registrar pago, editar odontograma. Touch targets ≥44px. | REQ-180, REQ-185, REQ-215, REQ-252, REQ-253, REQ-254, REQ-263, REQ-270, REQ-271; NFR-011. | RESUELTO |
| GAP-B08 | Interactividad de Pagos y Odontograma | **AMBOS editables** (sube alcance): registrar pago con saldo que se actualiza y persiste; editar el estado de piezas dentales con persistencia. | REQ-164, REQ-186, Épica 11 (REQ-259..270). | RESUELTO |

### Gaps Técnicos — RESUELTOS (decisión del BA, incorporados)

| # | Gap | Decisión incorporada | Criterios afectados | Estado |
|---|---|---|---|---|
| GAP-T01 | "30 pacientes" vs lectura dinámica | Lectura dinámica → **29 pacientes** (12 hombres + 17 mujeres); `.DS_Store` ignorados. | REQ-042, REQ-043. | RESUELTO |
| GAP-T02 | Framework frontend | No lo prescribe el BA — **lo elige el Architect**; vinculante son los NFR (bundle, lazy, routing). | NFR-002,003,006-009. | RESUELTO |
| GAP-T03 | Numeración dental | **FDI** (cuadrantes 1-4, piezas 1-8) primaria + tooltip universal 1-32; documentado en README. | REQ-137. | RESUELTO |
| GAP-T04 | Tamaño de página de listas | Paginación **offset-based, 10-15 filas (default 12)**, total visible, sin infinite scroll. | REQ-103. | RESUELTO |
| GAP-T05 | Set de iconos | **Phosphor** (regular, stroke ~1.5px), a confirmar con Design Orchestrator. | Capa visual. | RESUELTO |
| GAP-T06 | Estados de presupuesto/factura | Presupuesto: pendiente/aprobado/rechazado/vencido. Factura: emitida/pagada/vencida/anulada. | REQ-058, REQ-210, REQ-214, REQ-221. | RESUELTO |
| GAP-T07 | Distribución de los ≥50 turnos | **~30% confirmados/en espera, ~50% terminados, ~10% atendiendo/hoy, ~10% cancelados.** | REQ-058. | RESUELTO |
| GAP-T08 | Reutilización de documentos | Pool de **~15 imágenes (10 radiografías + 5 fotos)** reutilizado hasta 40-60 referencias. | REQ-058, REQ-157. | RESUELTO |
| GAP-T09 | Inicialización del seed | Auto-seed al 1er arranque sin estado; arranques posteriores respetan al usuario; reset vuelve al seed; estado versionado. | REQ-041, REQ-058, REQ-264, REQ-265. | RESUELTO |
| GAP-B06 | Cronograma (reclasificado) | Planificación del PM, no elección de producto. | — | RESUELTO |

**Verificación del gate de salida: 17/17 gaps resueltos · 0 gaps pendientes · 0 preguntas abiertas al cliente.**

---

## Matriz de Trazabilidad

| Épica | Features | Criterios | Rango |
|---|---|---|---|
| 1. Plataforma, Shell y Navegación | 5 | 31 | REQ-001 a REQ-031 |
| 2. Persistencia, Seed y Reset | 3 | 27 | REQ-032 a REQ-058 |
| 3. Módulo Agenda | 5 | 39 | REQ-059 a REQ-097 |
| 4. Pacientes — Lista y Ficha | 4 | 30 | REQ-098 a REQ-127 |
| 5. Pacientes — Tabs (6 tabs) | 7 | 45 | REQ-128 a REQ-172 |
| 6. Pacientes — Crear/Editar/Detalles | 4 | 19 | REQ-173 a REQ-191 |
| 7. Módulo Tratamientos | 3 | 14 | REQ-192 a REQ-205 |
| 8. Módulo Facturación | 7 | 26 | REQ-206 a REQ-231 |
| 9. Módulo Reportes | 5 | 15 | REQ-232 a REQ-246 |
| 10. Calidad Transversal | 4 | 13 | REQ-247 a REQ-258 + REQ-272 |
| 11. Edición Pagos/Odontograma + Restablecer datos | 3 | 12 | REQ-259 a REQ-270 |
| (Mobile crear presupuesto, en Épica 8) | — | 1 | REQ-271 |
| **Total** | **50 features** | **272 criterios + 20 NFR** | **0 gaps pendientes** (7 preguntas de negocio respondidas + 10 decisiones técnicas incorporadas) |

### Cobertura de las 7 dimensiones (verificación)

| Dimensión | Cubierta en | Notas |
|---|---|---|
| Happy path | Todas las épicas | Cada feature tiene su flujo principal funcional |
| Estados (vacío/carga/error) | REQ-066,67,95,105,106,145,152,158,165,168,187,195,209,225,231,246,250,251 | Estados vacíos con guidance + skeletons en cada lista; errores controlados |
| Responsive | REQ-005,16,23,68,77,97,107,115,122,131,139,147,154,160,167,180,197,201,205,215,226,231,235,245,252,253,254,263,270,271 | Cambio de alcance: TODOS los flujos usables en mobile (incl. crear/editar, registrar pago, editar odontograma) |
| Accesibilidad | REQ-006,18,24,108,121,138,236,255,256 + NFR-020..023 | Foco de teclado, contraste, labels, navegación |
| Validación | REQ-086,176,219,249,260 + validaciones inline en cada formulario | Condiciones PASA/FALLA por campo (incl. monto positivo al registrar pago) |
| Edge cases | REQ-007,040,041,047,076,081,090,111,124,126,130,140,153,159,179,214,238,269 | Slots ocupados, ids inválidos, datos faltantes, localStorage no disponible, coherencia odontograma editado |
| Flujos alternativos | REQ-084,085,127,172,177,184,188,204,263 | Atrás, cancelar con confirmación, volver al origen, deep-link |

**Nota sobre dimensiones que no aplican en features puntuales**: en features puramente estructurales/transversales (ej: routing REQ-029..031, anti-patrones REQ-257..258) no aplican "validación de formulario" ni "estado vacío" porque no manejan input de usuario ni listas; su naturaleza es de verificación estructural. Esto se documenta explícitamente aquí en lugar de forzar criterios artificiales.

---

## Notas para el equipo (fuera de criterios)

1. **Contradicción resuelta (crítica)**: El documento se contradice entre §12 ("treinta pacientes") y §8/§11 (lectura dinámica, "NO usar treinta como número fijo"). **Se resuelve a favor de la lectura dinámica**: 29 pacientes con el set actual de fotos. Esto está reflejado en REQ-042/043 y GAP-T01.
2. **Conteo de fotos verificado**: 12 hombres (edades en archivo: 1,2,4,5,28,30,33,35,40,43,76,80) + 17 mujeres (3,4,7,14,22,23,25,32,55,62,65,67,68,70,72,80,85) = 29. Los `.DS_Store` se ignoran.
3. **Alcance de este documento**: solo funcional/negocio/estructural. La capa visual (Task Dasher, paletas, tipografía, tokens) la procesa el pipeline de diseño desde `clinica-dental-design-brief.md`. Los anti-patrones estructurales se incluyeron como criterios porque son verificables funcionalmente y son la corrección explícita al error del viewcase anterior.
4. **Prioridad máxima del cliente**: estructura multi-pantalla y no repetir la aglomeración del viewcase anterior. Los criterios de la Épica 10 (especialmente REQ-257) son la red de seguridad de QA.
5. **Cambio de alcance v2.0 — presentación como producto real (crítico para QA)**: el cliente pidió que NINGUNA parte de la UI revele que es un demo/mock/simulado/viewcase. REQ-272 es la red de seguridad transversal: QA debe barrer todo el copy visible (header, footer, Configuración, toasts, notificaciones, vacíos) buscando estas palabras prohibidas. La funcionalidad subyacente (reset del seed, notificación simulada de WhatsApp) se mantiene; solo cambia el lenguaje visible y la ubicación (reset solo en Configuración, REQ-264). Internamente el proyecto sigue siendo frontend-only con localStorage; esto NO cambia.
6. **Cambio de alcance v2.0 — mobile total y dos tabs editables**: mobile sube de "solo consulta" a "todos los flujos" (REQ-252); Pagos y Odontograma pasan de lectura a editables (Épica 11). Esto sube el esfuerzo de QA responsive y de persistencia: probar en celular el registro de pago (saldo persiste) y el cambio de estado de pieza (persiste y se refleja en el odontograma).
