# Requerimientos del proyecto

## Viewcase 02: Sistema integral para clínica dental

Empresa ficticia: Estudio Dental Mendieta

Documento único de especificación para el equipo de desarrollo. Versión 2\.

---

## 1\. Resumen ejecutivo

Este es el segundo de los seis viewcases nuevos del portafolio para el mercado argentino. Es un demo completamente funcional de un sistema de gestión a medida para una clínica dental boutique. El sistema es navegable, interactúa con el usuario, persiste cambios en localStorage entre sesiones y deja al lead explorar una operación clínica viva durante cinco a diez minutos.

El objetivo no es vender específicamente a odontólogos, aunque ellos son audiencia obvia. El objetivo es demostrar que somos capaces de construir un sistema persona céntrico con ficha rica de tabs, navegación clara y experiencia ordenada. El lead que llegue desde otros verticales (oftalmólogos, dermatólogos, kinesiólogos, escuelas, recursos humanos, gimnasios, veterinarias) va a ver el patrón arquitectónico y proyectar la solución para su propia operación. La odontología es el cliente del demo, la arquitectura es la propuesta de valor.

---

## 2\. Objetivo de negocio

Posicionar al estudio como capaz de construir sistemas persona céntricos sofisticados, con ficha visualmente rica y flujos navegables ordenados.

Calificar leads de múltiples verticales con un solo viewcase. Médicos, odontólogos, oftalmólogos, escuelas privadas y empresas que gestionan personas son audiencias que se identifican con la misma arquitectura.

Generar activos reutilizables para campañas de Ads en el segmento salud, educación y gestión de personal.

---

## 3\. Empresa ficticia y narrativa

### Nombre

Estudio Dental Mendieta

### Nicho

Clínica dental boutique con cinco a ocho profesionales en planta, atendiendo entre cien y trescientos pacientes activos por mes. Servicios incluyen odontología general, ortodoncia, implantes, endodoncia, estética y prevención. Trabaja con obras sociales y prepagas además de pacientes particulares.

### Tono operativo

Profesional, ordenada, pero con tono humano. No es un megaprestador, es un consultorio cuidado donde el paciente se siente atendido. Esto importa para los textos del sistema: nada de "expediente del paciente", sí "ficha del paciente". Nada de "carga de procedimiento", sí "registro de tratamiento". Lenguaje cercano dentro de lo profesional.

### Ubicación

Planta principal en barrio céntrico, accesible. No mencionar nombre de ciudad para que el viewcase trabaje en cualquier mercado.

---

## 4\. Usuario objetivo del viewcase

### Lead que aterriza en el viewcase

Profesional o dueño de clínica que gestiona personas (pacientes, alumnos, empleados, socios). Tiene entre 35 y 60 años, opera su negocio diariamente, conoce los pain points de la gestión de fichas dispersas. Está cansado de Excel, papel o sistemas viejos.

### Comportamiento esperado

El lead entra al viewcase desde el sitio principal o desde un anuncio. Primero explora el dashboard o la agenda, después navega a Pacientes porque es lo que reconoce, abre la ficha de un paciente, recorre los tabs, vuelve atrás, prueba otra ficha. Si engancha profundo, explora tratamientos y reportes. Tiempo total: cinco a diez minutos.

### Dispositivos

Setenta por ciento desktop, treinta por ciento mobile. Mobile no necesita cubrir todos los flujos, pero las pantallas de agenda y ficha de paciente sí deben ser usables en celular porque los profesionales miran agenda desde el teléfono frecuentemente.

---

## 5\. Tecnología y arquitectura

### Stack

Frontend exclusivamente. El equipo elige el framework. Sin backend. Todo el estado vive en localStorage del navegador.

### Persistencia

localStorage del navegador. Las acciones del usuario (crear paciente, agendar turno, marcar tratamiento, registrar pago) se guardan y se mantienen entre sesiones. Botón de reset disponible en la pantalla de configuración para volver al seed original.

### Deploy

Azure Static Web Apps con dominio propio. Sugerencia de naming: algo neutral que no contenga "linkdesign" ni "viewcase" en la URL pública. El equipo propone tres opciones y se valida.

### Performance

Carga inicial bajo tres segundos en cuatro G. Bundle inicial bajo quinientos KB gzipped. Lazy loading para módulos secundarios.

### Routing

Multi pantalla con rutas dedicadas. La URL siempre refleja qué está viendo el usuario. El botón atrás del navegador funciona correctamente. No SPA con todo modal o accordions ocultos.

### Navegadores soportados

Chrome, Safari, Firefox, Edge versiones actualizadas.

---

## 6\. Estructura general del viewcase

### Pantalla de entrada

Login mock muy simple. Un solo botón "Ingresar como administradora". Detrás del botón se cargan los datos seed y se navega al dashboard. Link "Saltar login" disponible.

### Header persistente

Logo del sistema ficticio (lo crea el equipo, sobrio), nombre del módulo activo, avatar del usuario logueado (iniciales "AD"), badge discreto "Demo interactivo de \[Link Design u otra marca placeholder\]" abajo a la derecha con link al sitio principal.

Header simple y limpio. NO incluye búsqueda global, NO incluye command palette, NO incluye atajos de teclado visibles. Es un panel diseñado, no una app productiva de power user.

### Sidebar de navegación

Menú lateral con exactamente cinco secciones (no más, no menos):

1. Agenda  
2. Pacientes  
3. Tratamientos  
4. Facturación  
5. Reportes

Cada item con icono a la izquierda y label visible siempre. Item activo destacado con color de marca atenuado o background levemente distinto. No menú colapsable, queda fijo en desktop.

### Footer

Discreto. Versión, link al sitio principal, link a "Resetear demo".

---

## 7\. Módulos y funcionalidades detalladas

### IMPORTANTE: principio rector para todos los módulos

Cada acción importante vive en su propia pantalla, no en modales gigantes ni en paneles laterales que tapen contenido. Cuando el usuario hace clic en un item de lista, navega a una pantalla nueva, no se le abre un drawer al costado. Cuando el usuario crea o edita algo, navega a una pantalla nueva con su propio formulario, no aparece un modal que ocupe toda la ventana.

Los tabs SÍ son válidos dentro de una misma pantalla cuando la pantalla representa un objeto único (la ficha del paciente, por ejemplo, tiene tabs porque es la misma persona vista desde distintas dimensiones). Los tabs NO son sustitutos de navegación entre objetos.

Adicionalmente: pocas acciones por pantalla. El viewcase es un demo, no una herramienta de uso diario. Cada pantalla debe sentirse limpia, aireada, con una acción principal clara y máximo una secundaria. Si en una pantalla aparecen cinco botones, está mal diseñada para este viewcase.

Ejemplos concretos que el equipo debe evitar:

Antiejemplo uno: pantalla de Agenda donde a la izquierda está el calendario, en el centro el detalle del turno seleccionado, a la derecha el formulario de edición, abajo la lista de pacientes del día. Eso es aglomeración. Lo correcto: una pantalla con el calendario completo, hacer clic en un turno navega a una pantalla nueva con el detalle, editar abre otra pantalla.

Antiejemplo dos: ficha del paciente con todos los datos visibles a la vez (información personal, odontograma, historial, tratamientos, documentos, pagos) en una sola página enorme con scroll infinito. Eso es lo que pasó en el viewcase anterior y NO se repite. Lo correcto: la ficha es una pantalla con tabs en la parte superior, cada tab muestra solo su contenido, los demás están ocultos hasta que se cliquean.

Antiejemplo tres: crear un turno desde un modal que ocupe el setenta por ciento de la pantalla con scroll interno. Lo correcto: hacer clic en "Crear turno" navega a una pantalla dedicada con formulario claro.

Antiejemplo cuatro: tabla de pacientes con doce columnas para mostrar toda la información posible. Lo correcto: cuatro o cinco columnas con lo esencial, el resto se ve entrando al detalle.

### 7.1 Agenda

#### Pantalla A: Vista calendario

Calendario en vista mensual por default, con toggles para vista semanal y diaria. Cada turno se ve como bloque coloreado según estado (confirmado, en espera, atendiendo, terminado, cancelado).

Header de la pantalla simple: título "Agenda" más un solo filtro principal (por profesional) más botón primario "Nuevo turno". Los otros filtros (estado, tipo de tratamiento) se acceden vía un botón "Filtros" que despliega un panel mínimo, no quedan permanentemente visibles.

Click sobre un bloque de turno navega a la pantalla de detalle del turno.

#### Pantalla B: Detalle del turno

Información del turno: paciente (con foto pequeña y link a su ficha), profesional asignado, fecha y hora, duración, tratamiento previsto, estado actual, notas internas.

Una acción primaria visible (cambiar estado al siguiente paso lógico). Acciones secundarias (reagendar, cancelar) accesibles desde un menú de acciones secundarias.

#### Pantalla C: Crear turno nuevo

Flujo de tres pasos en pantallas distintas:

Paso uno, paciente: seleccionar paciente existente desde combo con búsqueda, u opción de crear paciente nuevo.

Paso dos, profesional y fecha: seleccionar profesional, ver disponibilidad real, elegir slot, definir duración estimada.

Paso tres, tratamiento y confirmación: elegir tratamiento previsto, agregar notas, revisar resumen, botón "Confirmar turno" que guarda y navega al detalle.

Botón "Atrás" en cada paso. Botón "Cancelar" con confirmación.

#### Pantalla D: Reagendar turno

Pantalla dedicada que muestra el turno actual arriba y un calendario abajo para elegir nueva fecha y hora. Confirmar genera notificación mock de WhatsApp al paciente.

#### Pantalla E: Lista de turnos del día

Vista alternativa lista con los turnos del día ordenados por hora. Cada fila muestra paciente, profesional, hora, estado. Solo cuatro columnas, no más.

### 7.2 Pacientes

Centro del sistema y pieza más fuerte del viewcase.

#### Pantalla A: Lista de pacientes

Tabla simple con cinco columnas máximo: foto pequeña, nombre completo, obra social, próximo turno, estado de cuenta.

Header simple: título "Pacientes" más buscador inline más botón primario "Nuevo paciente". Sin filtros adicionales visibles permanentemente. Si se necesitan filtros (obra social, edad, profesional), botón "Filtros" abre un panel mínimo.

Cada fila clickeable navega a la ficha del paciente.

Paginación clara con cantidad total visible. No infinite scroll.

#### Pantalla B: Ficha del paciente (la pieza fuerte)

Header de la ficha con foto grande del paciente a la izquierda, nombre completo en grande, datos básicos al lado (edad, obra social, profesional de cabecera), badges de alertas si las hay (alergias, medicación, observaciones críticas).

Una acción primaria en el header: "Agendar turno". Acciones secundarias en menú compacto: editar ficha, eliminar.

Debajo del header, tabs claramente visibles en una barra horizontal. Solo un tab activo por vez. El contenido de los tabs no activos NO se renderiza, solo se carga cuando se cliquea el tab.

Tabs requeridos:

Tab uno, Información general: datos personales, contacto, obra social y número de afiliado, contacto de emergencia, alergias, medicación habitual, observaciones generales. Información mostrada en cards aireadas, no en tablas densas.

Tab dos, Odontograma: diagrama dental interactivo con las treinta y dos piezas representadas. Cada pieza con estado visual (sana, caries, obturación, ausente, en tratamiento, prótesis). Click en una pieza navega a su pantalla de detalle.

Tab tres, Historial clínico: timeline cronológico con eventos clínicos. Cada entrada muestra fecha, tipo, profesional, descripción corta. Click navega al detalle.

Tab cuatro, Tratamientos: lista de planes de tratamiento, separados en activos y completados. Cada plan muestra nombre, etapas totales, etapas completadas, costo. Click navega al detalle del plan.

Tab cinco, Documentos: galería de archivos en cuadrícula con thumbnail y nombre. Click navega a la vista expandida.

Tab seis, Pagos: estado de cuenta corriente con lista de movimientos y resumen arriba.

#### Pantalla C: Crear paciente nuevo

Flujo de dos pasos en pantallas distintas:

Paso uno, datos personales y contacto.

Paso dos, datos clínicos iniciales (alergias, medicación, observaciones, profesional de cabecera, foto opcional).

#### Pantalla D: Editar información del paciente

Pantalla dedicada con formulario editable.

#### Pantalla E: Detalle de pieza dental específica

Cuando se hace clic en una pieza del odontograma. Muestra número y nombre de la pieza, estado actual, historial de procedimientos sobre esa pieza.

#### Pantalla F: Detalle de evento clínico

Cuando se hace clic en una entrada del historial.

#### Pantalla G: Detalle de plan de tratamiento

Cuando se hace clic en un plan del tab tratamientos.

### 7.3 Tratamientos

#### Pantalla A: Lista de tratamientos activos

Tabla con cinco columnas máximo: paciente (con foto pequeña), tratamiento, profesional, etapas completadas sobre totales, próxima fecha prevista.

Filtro principal único: por profesional. Otros filtros vía botón "Filtros".

Cada fila clickeable navega al detalle.

#### Pantalla B: Tipos de tratamiento

Catálogo en cards con descripción corta, costo de referencia, duración estimada. Cards aireadas, no listadas en tabla densa.

#### Pantalla C: Detalle de tipo de tratamiento

Información completa: pasos típicos, materiales, costo, duración, profesionales habilitados.

### 7.4 Facturación

Nota importante: sin integración ARCA ni AFIP. Las facturas son módulo interno mock.

#### Pantalla A: Lista de presupuestos

Tabla con cuatro o cinco columnas: paciente, fecha de emisión, monto, estado.

Botón "Nuevo presupuesto" arriba.

#### Pantalla B: Detalle del presupuesto

Información completa: paciente, tratamientos incluidos, costo desglosado, condiciones, vencimiento.

Una acción primaria según estado (aprobar si está pendiente). Acciones secundarias en menú compacto.

#### Pantalla C: Crear nuevo presupuesto

Flujo de tres pasos: paciente, tratamientos, revisión.

#### Pantalla D: Lista de facturas

Cuatro columnas: paciente, número de factura, monto, estado.

#### Pantalla E: Detalle de factura

Información completa, ítems facturados, totales, estado.

#### Pantalla F: Lista de obras sociales

Cards aireadas, no tabla. Cada card con logo placeholder, nombre, pacientes activos, deuda pendiente.

#### Pantalla G: Detalle de obra social

Información, pacientes asociados, historial de liquidaciones.

### 7.5 Reportes

#### Pantalla A: Dashboard de reportes

KPI cards arriba en grilla aireada (no más de seis cards): pacientes nuevos del mes, turnos atendidos, tratamientos completados, ingresos facturados, ingresos cobrados, deuda pendiente.

Cada KPI card clickeable navega a su reporte detallado.

#### Pantalla B: Reporte de pacientes

Gráficos en cards separadas y aireadas. Pacientes nuevos en el tiempo, distribución por obra social, distribución por edad y género, ranking de profesionales.

#### Pantalla C: Reporte de tratamientos

Gráficos: tipos más realizados, tasa de finalización, duración promedio.

#### Pantalla D: Reporte financiero

Gráficos: ingresos por mes, facturación por obra social, deuda por antigüedad.

#### Pantalla E: Reporte de productividad

Gráficos: producción por profesional, turnos atendidos versus cancelados, tasa de presentación.

---

## 8\. Datos seed

### Clínica

Estudio Dental Mendieta. CUIT 30-71234567-8. Dirección genérica de zona céntrica. Logo simple a crear por el equipo.

### Profesionales

Seis profesionales con nombres argentinos plausibles y especialidades distintas:

1. Dra. Carolina Etcheverry, ortodoncia, 12 años en la profesión  
2. Dr. Martín Aguilera, endodoncia, 18 años  
3. Dra. Soledad Russo, odontología general, 8 años  
4. Dr. Juan Pablo Acuña, implantología, 15 años  
5. Dra. Laura Béccar Varela, estética dental, 7 años  
6. Dr. Federico Salinas, odontopediatría, 10 años

### Obras sociales

Seis obras sociales o prepagas con perfiles distintos:

1. OSDE (premium, pago rápido, exigente)  
2. Galeno (mediano)  
3. Swiss Medical (mediano)  
4. PAMI (gran volumen, pago lento)  
5. IOMA (provincial)  
6. Particulares (sin obra social)

### Pacientes

Cantidad variable, determinada por la cantidad de fotos que Roberth entregue en las carpetas hombres y mujeres (ver sección Imágenes y assets visuales). NO usar treinta como número fijo. El equipo lee dinámicamente las carpetas al construir el seed.

Para cada foto encontrada, el equipo genera un paciente con:

Edad: extraída del nombre del archivo de la foto. Género: extraído del nombre de la carpeta (hombres o mujeres). Foto: referenciada desde el path correspondiente. Nombre completo: argentino plausible, generado respetando la edad (apellidos coherentes con la generación) y el género. DNI: plausible con formato correcto. Obra social: asignada con distribución típica argentina (mezcla de OSDE, Galeno, Swiss Medical, PAMI, IOMA, particulares). Profesional de cabecera: asignado entre los seis profesionales del staff. Historial clínico: variable según la edad. Niños y adolescentes con menos eventos. Adultos con más. Mezcla de pacientes nuevos sin historial y pacientes antiguos con historial extenso. Odontograma: con estado real de cada pieza. Niños pueden tener piezas de leche, adultos mayores pueden tener piezas ausentes o prótesis. Mezcla de boca sana, tratamientos previos, tratamiento activo. Tratamientos: coherentes con la edad. Ortodoncia común en adolescentes, implantes y prótesis más comunes en adultos mayores, limpieza universal. Documentos: algunos pacientes con radiografías y fotos clínicas mock asociadas. Estado de cuenta corriente: mezcla de pacientes al día y con deuda.

### Turnos

Mínimo cincuenta turnos distribuidos en distintos estados.

### Tratamientos

Mínimo cuarenta tratamientos en curso o completados, variados en tipo y complejidad.

### Presupuestos

Mínimo veinte presupuestos en distintos estados.

### Facturas

Mínimo veinticinco facturas en los últimos sesenta días en distintos estados.

### Catálogo de tipos de tratamiento

Mínimo doce tipos: limpieza profesional, ortodoncia con brackets, ortodoncia invisible, implante unitario, implante múltiple, conducto, blanqueamiento, carilla estética, corona, extracción simple, extracción de molar, prótesis fija, prótesis removible.

### Documentos en fichas

Cuarenta a sesenta documentos placeholder distribuidos entre pacientes.

---

## 9\. Criterios de diseño estructural

### Estructura de flujos multi pantalla (PRIORIDAD MÁXIMA)

Esta sección es crítica. En el viewcase anterior el equipo aglomeró información en pantallas únicas y la experiencia perdió claridad. En este viewcase no se repite.

Toda acción que crea, modifica o consulta un objeto vive en su propia pantalla con ruta dedicada.

Los modales se reservan exclusivamente para confirmaciones cortas (eliminar, cancelar, alertas) y avisos breves. Cualquier acción con más de tres campos va en pantalla propia.

Los drawers laterales están explícitamente prohibidos para contenido principal.

Cada flujo de proceso debe tener mínimo cuatro pantallas: lista, detalle, acción específica, resultado.

La navegación entre pantallas siempre permite volver atrás. Botón atrás del navegador funciona.

### Uso correcto de tabs

Los tabs son válidos solo cuando representan dimensiones distintas del mismo objeto.

Los tabs no son válidos como reemplazo de navegación entre objetos diferentes.

Cuando se usa tabs, el contenido del tab no activo no debe estar renderizado en el DOM.

### Simplicidad por sobre densidad

Este es un viewcase para que el lead explore, no una herramienta de uso diario. Por eso:

Listas con cuatro o cinco columnas visibles máximo. No tablas anchas con doce columnas.

Una acción primaria por pantalla. Máximo una secundaria visible. Las demás acciones se acceden vía menú compacto.

Filtros mínimos visibles. Un solo filtro principal en lista, el resto en panel "Filtros" que se despliega solo si se pide.

Headers de pantalla limpios: título grande, opcional acción primaria, nada más.

Vacío visual permitido. Si una pantalla tiene poco contenido, está bien que se vea espacioso. Eso comunica orden, no carencia.

### Feedback del sistema

Antes de eliminar o cancelar algo importante, confirmación explícita.

Después de cada acción exitosa, toast claro.

Validaciones inline en formularios.

Cada lista vacía tiene su estado vacío diseñado con guidance.

Loading states con skeleton.

### Calidad de datos seed

Datos realistas y diversos. Nombres argentinos plausibles, montos en pesos.

Mezcla de estados representativa.

Histórico de al menos sesenta días.

Edge cases representados.

### Responsive y accesibilidad mínima

Desktop y mobile contemplados. Pantallas principales usables en celular.

Touch en mobile mínimo cuarenta y cuatro píxeles.

Contraste suficiente.

Focus visible para teclado.

### Patrones a evitar explícitamente

Pantallas únicas que mezclan lista, detalle, formulario y panel a la vez.

Drawers laterales como contenido principal.

Modales mayores al cincuenta por ciento de la pantalla.

Tabs que reemplazan navegación entre objetos.

Tablas con muchas columnas (más de cinco).

Múltiples acciones primarias por pantalla (más de una).

Filtros simultáneos visibles permanentemente en listas.

Headers cargados con muchos elementos.

Iconos sin label en navegación principal.

Infinite scroll en listas operativas.

Power user features (command palette, atajos de teclado visibles, búsqueda global). Esto es un panel diseñado, no una app productiva.

---

## 10\. Criterios de UI

### Filosofía visual

Estética híbrida: outfit visual de apps modernas combinado con layout aireado y simple de panel diseñado.

### Referencia principal y obligatoria

[https://task-dasher.webflow.io/](https://task-dasher.webflow.io/)

Es un dashboard template construido en Webflow que define exactamente el estándar de premium que queremos para este viewcase. El equipo debe recorrer TODAS las páginas de esta referencia antes de empezar a maquetar, sin excepción. Incluye:

Página principal (All Tasks) con cards de proyectos y lista de tasks con avatares.

Timeline.

Messages.

Profile (ficha de usuario con foto grande, datos, acciones).

Contacts (lista de personas con foto).

Company (cards de empresas con logos y métricas).

Pricing.

Notifications.

Settings.

Help Center.

Autenticación (Sign Up, Sign In, Reset Password, Email Verification).

Páginas administrativas (Privacy, Terms, 404, Search, 401).

Utility (Style Guide, Licenses, Changelog).

Recorrer todas estas páginas es lo que define la línea visual. Cualquier decisión que tome el equipo debe verse compatible con la estética de Task Dasher: cómo usa cards, cómo trata los avatares, cómo arma la jerarquía tipográfica, cómo distribuye el espacio, cómo trata los estados (badges de status, prioridad, progreso), cómo se ve un sidebar limpio. Si una pantalla diseñada por el equipo se ve significativamente distinta a Task Dasher en aire, tipografía, uso de cards o paleta, está fuera de la línea y hay que rehacerla.

Adaptaciones necesarias: Task Dasher es una herramienta de gestión de tareas. Nuestro viewcase es una clínica dental. Los conceptos visuales se trasladan así: las cards de "Proyectos" de Task Dasher equivalen a nuestras cards de paciente o tratamiento. La "Profile" de Task Dasher es la base visual para nuestra ficha del paciente. La sección "Contacts" es referencia directa para nuestra lista de pacientes. La sección "Company" puede inspirar la lista de obras sociales. La estética se conserva, el contenido cambia.

### Patrones específicos de Task Dasher a replicar

Estos son los patrones visuales y de componentes que se observan en Task Dasher y que el equipo debe replicar adaptándolos al contexto de la clínica dental.

Sidebar de navegación. Logo arriba a la izquierda. Lista de items de menú con icono más label visible siempre. Item activo destacado con fondo levemente distinto. Sin bordes pronunciados. Sin búsqueda global ni command palette. Solo cinco items principales más Settings y Help abajo. Replicar para nuestros cinco módulos (Agenda, Pacientes, Tratamientos, Facturación, Reportes) más footer con Configuración y Ayuda.

Header de la app. Search bar compacto a la derecha (solo búsqueda dentro del contexto activo, NO búsqueda global). Icono de notificaciones con badge de contador. Avatar del usuario logueado. Sin más elementos. Replicar igual.

Cards con progreso. Las cards de proyectos en Task Dasher muestran un porcentaje grande (38, 74, 56\) más una etiqueta "Progress" y el número de la barra de progreso. Replicar para nuestras cards de tratamientos: porcentaje de etapas completadas grande, etiqueta "Progreso", subtítulo con nombre del tratamiento, ícono de menú a la derecha.

Tarjetas de personas con foto. En Task Dasher cada task tiene una card con foto circular del responsable, nombre, categoría chica y un porcentaje grande. Replicar para nuestras cards de pacientes en lista o dashboard: foto circular del paciente, nombre debajo, edad u obra social como subtítulo, porcentaje grande puede ser estado de tratamiento o saldo a cobrar.

Overlapping avatars (avatares apilados). Task Dasher muestra grupos de personas asignadas a una tarea con tres o cuatro círculos overlapping y un "+8" si hay más. Replicar para mostrar profesionales asignados a un tratamiento, o pacientes con turno en un día específico.

Badges de estado. Task Dasher usa pills pequeñas con texto corto y color suave: Completed (verde), On Review (azul o naranja), In Queue (gris), In Progress (amarillo). Replicar para nuestros estados de turno (Confirmado, Atendiendo, Terminado, Cancelado), estados de tratamiento (En curso, Atrasado, En pausa, Completado), estados de pago (Al día, Con deuda, Vencido).

Badges de prioridad. Pills con texto High, Mid, Low. Replicar para urgencia del turno o nivel de atención del paciente si aplica.

Last updated relativo. Texto chico tipo "2 hours ago", "5 days ago". Replicar como "Hace 2 horas", "Hace 5 días" en los listados de turnos, tratamientos, pagos.

Tabla de tasks. En Task Dasher cada fila tiene avatar más nombre, tarea, status, priority, last updated, iconos de acción (editar y eliminar). Replicar para nuestras tablas de turnos del día o pacientes con turnos próximos.

Cards de Company con logo. Cada empresa en Task Dasher se muestra como card con logo, ubicación, status, prioridad, progreso de milestones (5 de 8, 6 de 7), avatares overlapping del equipo asignado. Replicar para nuestra sección de obras sociales: logo placeholder de la obra social, nombre, cantidad de pacientes activos, deuda pendiente, último pago recibido, mini stats.

Página Profile (la más importante para nuestra ficha del paciente). En Task Dasher la profile es la base visual directa de nuestra ficha. Replicar: foto grande del paciente a la izquierda, nombre completo en grande arriba, datos básicos al lado (edad, obra social, profesional de cabecera), badges de alertas si aplican, una acción primaria visible (en su caso "Agendar turno"), y debajo el sistema de tabs (Información general, Odontograma, Historial, Tratamientos, Documentos, Pagos).

Página Contacts. Es la base visual directa de nuestra lista de pacientes: lista con foto, nombre, datos clave, status, acciones rápidas inline.

Página Notifications. Replicar para mostrar notificaciones internas del sistema (turno por confirmar, pago vencido, paciente que cumple años, tratamiento próximo a vencer).

Páginas de Autenticación. Replicar la página Sign In como base de nuestra pantalla de Login mock. Estética simple, formulario centrado.

Style Guide. Task Dasher tiene una página de style guide con tipografía, colores, componentes. Recomendado replicar una versión interna para el equipo (no necesariamente visible al lead) que documente los design tokens del viewcase.

### Adaptaciones que NO aplican

Task Dasher tiene cart (carrito de e-commerce) por ser un template comercial. Nuestro viewcase NO incluye cart ni elementos de e-commerce.

Task Dasher tiene una sección Pricing con planes y precios. Nuestro viewcase NO necesita una sección Pricing como tal, aunque podemos tener un catálogo de tipos de tratamiento que se inspire visualmente en cómo Task Dasher presenta los planes.

### Referencias secundarias de apoyo

Cal.com, Pitch, Tally.so, Framer (la app, no la landing). Encajan en la misma estética híbrida y sirven como apoyo cuando algo de Task Dasher no cubre el caso específico.

Linear aporta inspiración estética puntual (paleta, tipografía, micro interacciones) pero NO el layout. Linear es power user denso y no aplica acá. Si el equipo se inspira en Linear, que sea la calidad de la tipografía o el cuidado de los detalles, no la densidad informativa.

Apple Health también es buena referencia visual para algunos elementos (cards aireadas, paleta suave, gráficos simples).

### Paleta

Una sola familia de color para los acentos. Sugerencias para clínica dental:

Verde menta suave o sage (\#a8d5c4 o más saturado tipo \#5fb89d).

Azul cielo suave o azul medio (\#c5d8e8 o \#6da8d4).

Lavanda suave (\#d6cce8 o \#a594d4).

El equipo elige una familia y trabaja todos los acentos dentro. Máximo cuatro tonos en toda la interfaz, todos coherentes con la familia elegida.

Fondo principal: blanco puro o casi blanco, entre \#ffffff y \#fafafa.

Texto principal: gris oscuro cálido cercano a \#2a2a35, nunca negro puro.

Texto secundario: gris medio cercano a \#707080.

Estados semánticos en versiones suaves: verde pastel para éxito, coral pastel para error, amarillo pastel para warning, azul pastel para info.

### Bordes

Permitidos pero sutiles. Bordes de medio o un píxel en color tenue tipo \#e8e8ee. Se usan para separar cards de su entorno cuando hace falta jerarquía adicional.

Cards con radius generoso entre diez y catorce píxeles. No menos (se ve cuadrado de app productiva) y no más (se ve infantil).

Sombras opcionales, sutiles. Si se usan, un solo nivel (offset 1px, blur 4px, opacidad 0.04). Cards pueden vivir solo con borde sutil o solo con sombra sutil, no ambos.

### Espacio y respiración

Sistema de spacing basado en múltiplos de cuatro: 4, 8, 12, 16, 24, 32, 48, 64\.

Padding interno de cards: veinticuatro a treinta y dos píxeles.

Separación entre cards en listas: dieciséis a veinte píxeles.

Separación entre secciones de una pantalla: treinta y dos a cuarenta y ocho píxeles.

El espacio se usa con propósito funcional, no como elemento decorativo. Si una pantalla tiene poco contenido, no la llenes artificialmente.

### Tipografía

Restricción explícita: NO Inter. Inter está sobreutilizada en productos B2B.

Tipografías sugeridas en orden de preferencia:

Red Hat Display y Red Hat Text. Geométrica, moderna, con personalidad.

Geist. De Vercel, muy moderna y limpia.

DM Sans. Similar a Inter en proporciones pero con más carácter.

Plus Jakarta Sans. Suave, moderna.

Manrope. Geométrica con calidez.

Outfit. Más experimental.

El equipo elige una. Display para títulos, Text para cuerpo.

Reglas tipográficas:

Máximo tres tamaños de texto por pantalla.

Solo dos pesos: regular (400) y medio (500). Nunca bold extremo ni light.

Line height generoso en cuerpo (1.5 a 1.7). Títulos más ajustados (1.2).

Letter spacing levemente negativo en títulos grandes.

### Iconografía

Un solo set. Sugerencia: Phosphor Icons o Tabler Icons en versión regular, no rellena. Stroke de uno coma cinco píxeles.

Tres tamaños fijos: 16 píxeles para inline, 20 píxeles para botones y filas, 24 píxeles para acciones primarias.

Íconos heredan color del texto contiguo, excepto íconos de estado.

### Micro interacciones

Transitions entre 150 y 250 milisegundos.

Hover visible en todo lo clickeable.

Focus rings visibles para teclado.

Animación suave de entrada para toasts.

Skeletons mientras cargan listas, no spinners.

Estados disabled con opacidad cuarenta por ciento.

### Detalles de pulido

Cursor pointer en clickeables, text en inputs, not-allowed en disabled.

Selección de texto con color de marca atenuado.

Inputs y botones con altura consistente (cuarenta píxeles).

Placeholder en gris claro.

### Patrones de UI explícitamente prohibidos

Inter como tipografía.

Gradientes saturados de fondo.

Sombras pesadas tipo Material elevation 8\.

Pills de colores estridentes.

Emojis dentro de la interfaz como decoración.

Border radius extremos (más de veinte píxeles).

Inputs con bordes pronunciados.

Botones con sombras adentro o gradientes.

Color de fondo principal saturado.

Power user features (command palette, atajos de teclado visibles globalmente, búsqueda global compleja).

Tablas con más de cinco columnas.

Múltiples filtros visibles simultáneamente en una lista.

---

## 11\. Imágenes y assets visuales

### Filosofía sobre imágenes

Este viewcase es mayormente texto, tablas y datos, salvo en un aspecto crítico: las fotos de los pacientes. Eso es lo que humaniza el sistema y le da personalidad.

### Fotos de pacientes (provistas por Roberth)

Roberth entrega un set variable de fotos (no necesariamente treinta, puede ser más o menos). Variedad: distintos rangos de edad, expresiones neutras o amables, encuadre headshot (cabeza y hombros), formato cuadrado, mínimo cuatrocientos píxeles de lado.

Estructura de carpetas que entrega Roberth:

public/imagenes/pacientes/

├── hombres/

│   ├── 8.jpg

│   ├── 23.jpg

│   ├── 45.jpg

│   └── ...

└── mujeres/

    ├── 6.jpg

    ├── 19.jpg

    ├── 52.jpg

    └── ...

Convención de nombres clave: el nombre del archivo es la edad de la persona retratada. Si hay más de una foto con la misma edad, se usa sufijo como 23-1.jpg, 23-2.jpg.

El equipo de desarrollo debe leer dinámicamente las carpetas hombres/ y mujeres/ para construir la base de pacientes seed. La cantidad final de pacientes seed la determina la cantidad total de fotos entregadas, NO un número fijo. No hardcodear treinta pacientes en el código, leer las carpetas.

Para cada foto encontrada, el equipo genera un paciente seed (ver detalle de campos en la sección Datos seed, subsección Pacientes).

Mientras tanto, antes de que Roberth entregue las fotos, el equipo trabaja con placeholders (silhouettes en círculo o iniciales en círculos de color pastel asignados deterministicamente). En esta etapa puede usar una cantidad razonable (por ejemplo veinte placeholders) para tener algo navegable, sabiendo que la cantidad final cambia cuando lleguen las fotos.

### Avatares de profesionales

Componente Avatar con iniciales sobre fondo de color pastel asignado por hash del nombre. Tamaños: cuarenta píxeles para inline, cincuenta y seis para cards, ochenta para detalle.

### Logo de la clínica

Lo crea el equipo. Sobrio, dentro de la paleta elegida.

### Documentos mock (radiografías, fotos clínicas)

Placeholders descargados de Wikimedia Commons o similar. Diez radiografías más cinco fotos clínicas, reutilizables entre pacientes.

### Iconos

Set elegido entre Phosphor o Tabler.

### Manifest para los agentes

Crear manifest.json junto a las imágenes con la estructura de pacientes y documentos.

---

## 12\. Restricciones explícitas

### Lo que el viewcase NO incluye

No mención de ARCA, AFIP ni integración fiscal.

No login real con autenticación.

No roles ni permisos. Solo vista master.

No conexión a APIs externas.

No analytics ni tracking.

No formularios reales que envíen información.

No drawers laterales como contenido principal.

No modales mayores al cincuenta por ciento.

No fuente Inter.

No power user features (command palette, atajos globales, búsqueda global).

No tablas con más de cinco columnas.

No múltiples filtros simultáneos en listas.

### Lo que el viewcase SÍ incluye

Persistencia en localStorage entre sesiones.

Botón de reset al seed original.

Datos ficticios pero realistas con treinta pacientes.

Ficha del paciente con seis tabs.

Multi pantalla con rutas dedicadas.

Paleta acotada en una sola familia.

Tipografía moderna no Inter.

Estética híbrida app moderna más layout de panel diseñado.

Bordes sutiles permitidos y opcionales.

Cards aireadas con radius generoso.

Cobertura de cinco a diez minutos de exploración.

---

## 13\. Entregables esperados

Sitio web desplegado en Azure Static Web App con dominio propio.

Repositorio Git con código fuente, README, instrucciones de deploy.

Datos seed cargables y reseteables.

Documentación mínima en el README:

- Stack tecnológico utilizado  
- Cómo correr localmente  
- Cómo modificar datos seed  
- Cómo deployar a Azure  
- Dónde van las imágenes y cómo se referencian desde el manifest  
- Tipografía elegida y por qué

Validación visual del cumplimiento de criterios antes de entregar. Especialmente: validar que no hay drawers laterales, que cada acción vive en su pantalla, que los tabs solo aparecen dentro de objetos únicos, que las tablas no exceden cinco columnas, que no hay power user features.

---

## 14\. Asunciones del documento

Plazo de entrega no definido. El equipo propone cronograma.

Stack tecnológico final lo decide el equipo siguiendo los criterios.

Branding del sistema ficticio (logo, paleta exacta, nombre del producto interno si tiene) lo decide el equipo siguiendo los criterios.

Decisiones de copy interno las redacta el equipo en español rioplatense neutro.

Las treinta fotos de pacientes las entrega Roberth. Mientras tanto, placeholders.

---

## 15\. Pendientes para definir antes de arrancar

Cronograma de entrega y hitos parciales.

Stack tecnológico definitivo.

Dominio definitivo del viewcase.

Familia de color elegida (verde menta, azul cielo, lavanda u otra).

Tipografía final elegida entre las sugeridas.

Logo y branding del sistema ficticio.

---

Fin del documento  
