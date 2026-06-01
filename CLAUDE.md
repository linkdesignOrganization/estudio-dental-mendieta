# CLAUDE.md — Estudio Dental Mendieta (Viewcase Clínica Dental)

> Contexto acumulado del proyecto. Dueño exclusivo: PM. Se actualiza post-Fase 1, post-Fase 3, post-Fase 6.

## Qué es este proyecto
Viewcase de demostración de **Link Design**: un sistema de gestión integral para una clínica dental boutique ficticia, **Estudio Dental Mendieta**. NO es un producto para un cliente real — es un activo comercial para **calificar leads de múltiples verticales** (salud, educación, RRHH, gimnasios, veterinarias, escuelas). La odontología es solo el "cliente del demo"; la **arquitectura persona-céntrica es la propuesta de valor**. El lead explora 5-10 minutos y proyecta la solución a su propio negocio.

## Naturaleza del producto
- **Frontend-only**, sin backend. Todo el estado vive en **localStorage** y persiste entre sesiones.
- Demo navegable e interactivo: crear paciente, agendar turno, marcar tratamiento, registrar pago → se guardan. Botón de reset al seed original.
- NO es app de uso diario: es un **panel diseñado** para explorar. Simplicidad sobre densidad.

## Los 5 módulos
1. **Agenda** — calendario (mensual/semanal/diario), detalle/crear/reagendar turno, lista del día.
2. **Pacientes** (pieza central) — lista + ficha con **6 tabs** (Info general, Odontograma de 32 piezas interactivo, Historial clínico, Tratamientos, Documentos, Pagos).
3. **Tratamientos** — lista activos, catálogo de tipos, detalle.
4. **Facturación** — presupuestos, facturas, obras sociales (mock interno, **sin ARCA/AFIP**).
5. **Reportes** — dashboard de KPIs + reportes con gráficos.

## Restricciones duras (de negocio/UX)
- **Multi-pantalla estricto**: cada acción crea/edita/consulta en su propia ruta. URL refleja el estado. Botón atrás funciona.
- **Prohibido**: drawers laterales como contenido principal, modales >50%, tablas >5 columnas, tabs como navegación entre objetos, power-user features (command palette, búsqueda global, atajos), tipografía Inter, infinite scroll en listas.
- Sin login real, sin roles/permisos (solo vista master "administradora"), sin APIs externas, sin analytics.

## Identidad visual
Referencia OBLIGATORIA: **Task Dasher** (https://task-dasher.webflow.io/). Estética híbrida app moderna + panel aireado. Una sola familia de color (máx 4 tonos), neutros cálidos, semánticos pastel. Cliente decidió **capturar la referencia visualmente** (FASE 3.0 activa). Brief visual en `input/design-briefs/clinica-dental-design-brief.md`.

## Seed dinámico (clave)
El seed de pacientes se genera leyendo dinámicamente `input/mockpeople/{hombres,mujeres}/`. **Nombre de archivo = edad**, carpeta = género. Hay **29 fotos** (12 hombres + 17 mujeres) → **29 pacientes** (resuelve la contradicción del §12 que decía "30"). Mínimos seed: ≥50 turnos, ≥40 tratamientos, ≥20 presupuestos, ≥25 facturas, ≥12 tipos de tratamiento, 6 profesionales, 6 obras sociales, 40-60 documentos. Datos argentinos plausibles, montos en pesos, histórico ≥60 días.

## Decisiones técnicas confirmadas (Fase 3)
**Stack** (ADR-1..8 en architecture.md): Angular 21 standalone (última estable, 21.2.x), Bootstrap 5 selectivo + tokens propios, estado con signals + repositorio localStorage (sin NgRx), Phosphor icons, Red Hat self-hosted. Deploy Azure Static Web Apps (URL default, **sin dominio propio**). Sin backend, sin DB, sin auth provider, **sin analytics/CRM tracking** (prohibición del cliente).
**Persistencia**: namespace versionado `edm:v1:state`, 14 entidades, hidratación al boot, escrituras debounced, reset al seed en Configuración (texto "Restablecer datos", sin lenguaje de demo).
**Seed dinámico**: `manifest.json` generado en build-time (resuelve el no-FS en static hosting) + generadores deterministas con PRNG de semilla fija (fidelidad de reset). 29 pacientes desde `input/mockpeople/`.
**Diseño**: paleta 4 azules (sky #c5d8e8 · medio #6da8d4 · deep #246991 · tint #eff8ff), Red Hat 400/500, spacing múltiplos de 4, radius 10-14px. **GAP-A04 (contraste)**: texto oscuro #2a2a35 sobre azul medio = 5.54:1 AA; azul profundo #246991 para superficies con texto blanco = 5.99:1 AA. Override de Bootstrap para no introducir un 5º hue.
**Plan**: 21 DEMO-xxx (Construcción Visual) + 5 iteraciones cubriendo los 272 REQ.

## Decisiones pendientes del cliente (Fase 2)
Familia de color · tipografía (no Inter) · dominio (3 opciones neutrales) · logo/branding · cronograma · marca placeholder del badge "Demo interactivo de [...]" · alcance mobile · límite lectura/escritura del demo (GAP-B08).

## Métricas Fase 1
258 criterios REQ-XXX + 18 NFR · 17 gaps (8 negocio, 9 técnicos) · 10 epics, 47 features.
