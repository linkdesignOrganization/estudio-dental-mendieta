# Gap Classification — Viewcase 02: Estudio Dental Mendieta

**Generado por**: Business Analyst
**Fecha**: 2026-06-01
**Fase**: 2 — Clasificación de gaps → **RESPONDIDA E INCORPORADA**
**Fuente**: `output/requirements/requirements.md` (ahora 272 criterios + 20 NFR, 0 gaps pendientes)

> **ESTADO (2026-06-01): TODOS LOS GAPS RESUELTOS.** El cliente respondió las 7 preguntas y las respuestas + las 10 decisiones técnicas se incorporaron a `requirements.md` (v2.0). Las respuestas se registran abajo dentro de cada pregunta. Quedan **0 gaps pendientes**.

### Respuestas del cliente (resumen)
1. **Color** → Azul cielo/medio (#c5d8e8 / #6da8d4), máx. 4 tonos.
2. **Tipografía** → Red Hat (Display + Text, pesos 400/500). NO Inter.
3. **Logo** → Isotipo + wordmark "Estudio Dental Mendieta".
4. **Badge/demo** → CAMBIO DE ALCANCE: NINGUNA referencia a demo/mock; se presenta como producto real. Reset → Configuración con nombre de producción.
5. **Dominio** → SIN dominio propio; URL default de Azure Static Web Apps.
6. **Mobile** → TODOS los flujos usables en mobile (sube alcance).
7. **Pagos/Odontograma** → AMBOS editables (sube alcance).

Este documento clasificó los 17 gaps de Fase 1 en dos secciones:
1. **PREGUNTAS PARA EL CLIENTE** — gaps de negocio (RESPONDIDAS, ver respuesta inline en cada una).
2. **DECISIONES TÉCNICAS TOMADAS** — gaps resueltos internamente (incorporados a requirements.md).

Resumen: **7 preguntas (todas respondidas)** · **10 decisiones técnicas/de proceso (incorporadas)**.

> Nota de reclasificación respecto a Fase 1: GAP-B06 (cronograma e hitos) NO es una decisión de producto que el cliente deba elegir entre opciones — es un asunto de planificación que gestiona el PM. Se mueve a la sección de decisiones (como nota de proceso), no se relaya como pregunta de negocio. Por eso quedan 7 preguntas y no 8.

---

## SECCIÓN 1 — PREGUNTAS PARA EL CLIENTE

> El PM presenta estas 7 preguntas textualmente al cliente. Cada una tiene opciones concretas y una recomendación del equipo. Si el cliente no responde alguna, se aplica la recomendación marcada (default).

### Pregunta 1 — Familia de color de acento (GAP-B01)

**Por qué importa**: define el tono emocional de todo el sistema. El brief deja abierta la elección de UNA familia de acento.

**Opciones**:
- **A) Verde menta / sage** — pastel natural, asociado a salud y calma.
- **B) Azul cielo / azul medio** — confiable, clínico, profesional.
- **C) Lavanda** — suave, distintivo, cálido.
- **D) Otra** — el cliente indica su preferencia.

**Recomendación del equipo: A (verde menta / sage)** — asociación natural con salud/odontología y se diferencia del azul B2B genérico que ya usa medio mercado.

> **RESPUESTA DEL CLIENTE: B (Azul cielo / medio).** Construir toda la paleta de acento en esta familia (#c5d8e8 suave / #6da8d4 medio), máx. 4 tonos coherentes. Neutros y semánticos pastel según el brief. → Incorporado (capa visual / design pipeline).

---

### Pregunta 2 — Tipografía (GAP-B02)

**Por qué importa**: define la jerarquía y personalidad visual. El brief pide elegir UNA (explícitamente NO Inter).

**Opciones** (todas con buen soporte de pesos y legibilidad en pantalla):
- **A) Red Hat** (Display + Text)
- **B) Geist**
- **C) DM Sans**
- **D) Plus Jakarta Sans**
- **E) Manrope**
- **F) Outfit**

**Recomendación del equipo: A (Red Hat)** — es la primera preferencia del brief y aporta personalidad geométrica moderna sin sacrificar legibilidad clínica.

> **RESPUESTA DEL CLIENTE: A (Red Hat).** Red Hat Display para títulos, Red Hat Text para cuerpo. Solo pesos 400 y 500. NO Inter. → Incorporado (capa visual / design pipeline).

---

### Pregunta 3 — Dominio público del demo (GAP-B03)

**Por qué importa**: es la URL donde vivirá el demo. Debe ser neutral, sin "linkdesign" ni "viewcase" (para que el lead lo proyecte a su propio negocio, no lo lea como portfolio).

**Opciones propuestas** (3 neutrales, a validar antes de comprar):
- **A) gestionclinica.app**
- **B) fichapaciente.app**
- **C) estudiomendieta.app**

**Recomendación del equipo: validar disponibilidad de las 3 y elegir la que esté libre.** Si el cliente prefiere otra, que la indique y el equipo verifica disponibilidad.

> **RESPUESTA DEL CLIENTE: SIN dominio propio.** Se despliega en la URL default de Azure Static Web Apps (`*.azurestaticapps.net`). No se compra dominio. → Incorporado en NFR-012, NFR-013. Cualquier REQ/NFR que pidiera "dominio propio" ya no aplica (no existía ninguno en requirements.md; la decisión vivía aquí).

---

### Pregunta 4 — Logo y branding del sistema ficticio (GAP-B04)

**Por qué importa**: el sistema necesita una identidad propia, sobria, dentro de la paleta. El equipo lo crea, pero el cliente define el estilo.

**Opciones**:
- **A) Logotipo wordmark** — solo el nombre "Estudio Dental Mendieta" tipografiado.
- **B) Isotipo + wordmark** — símbolo dental sutil + nombre.
- **C) Monograma "EDM"** — sigla compacta como marca.

**Recomendación del equipo: B (isotipo + wordmark)** — sobrio con un símbolo discreto que da identidad sin recargar.

> **RESPUESTA DEL CLIENTE: B (isotipo + wordmark).** Símbolo dental sutil + el nombre "Estudio Dental Mendieta", sobrio, dentro de la paleta azul. Lo crea el equipo. → Incorporado en REQ-008, REQ-056.

---

### Pregunta 5 — Marca del badge "Demo interactivo de [...]" (GAP-B05)

**Por qué importa**: el header lleva un badge discreto que atribuye el demo. Hay que definir qué marca exacta se muestra y a dónde apunta el link.

**Opciones**:
- **A) "Link Design"** con link al sitio principal de Link Design.
- **B) Marca placeholder neutral** (sin revelar Link Design).
- **C) Solo "Demo interactivo"** sin nombre de marca, con link.

**Recomendación del equipo: A ("Link Design")** — si este viewcase es de portfolio propio, conviene atribuirlo y enlazar al sitio principal.

> **RESPUESTA DEL CLIENTE: NINGUNA de las opciones — CAMBIO DE ALCANCE.** El cliente NO quiere NINGUNA referencia escrita ni visual a demo/mock. Todo se presenta como sistema REAL en producción:
> - ELIMINAR el badge "Demo interactivo de [...]" del header (ya no existe). → REQ-011 reformulado a anti-patrón.
> - Reformular cualquier criterio/texto visible que exponga "demo/mock/resetear demo/notificación mock de WhatsApp". La funcionalidad subyacente puede existir (reset del seed, notificación simulada de WhatsApp) pero la UI NO usa esas palabras. → REQ-026, REQ-027, REQ-058, REQ-089, REQ-157, REQ-247 reformulados.
> - Botón de reset → queda en Configuración con nombre de producción ("Restablecer datos" / "Restaurar configuración inicial"), sin "demo", y NO en el footer. → REQ-264, REQ-265, REQ-266.
> - Red de seguridad transversal de QA → REQ-272 (ningún texto visible expone demo/mock/simulado/viewcase/atribución).
> - Nota: internamente sigue siendo un viewcase frontend-only con localStorage; es decisión de PRESENTACIÓN.

---

### Pregunta 6 — Alcance de mobile: ¿qué debe funcionar en celular? (GAP-B07)

**Por qué importa**: el brief dice "mobile no necesita cubrir todos los flujos" pero no precisa el límite. Esto define cuánto esfuerzo de adaptación responsive se invierte y qué se prueba en QA en celular.

**Opciones**:
- **A) Mobile solo para consulta** — agenda y ficha de paciente completamente usables; crear/editar se hacen desde desktop.
- **B) Mobile para consulta + crear turno** — además de consultar, se puede agendar un turno desde el celular.
- **C) Mobile cubre todos los flujos** — crear/editar paciente, turno y presupuesto también funcionan en celular.

**Recomendación del equipo: A (mobile solo consulta)** — alineado con "mobile no necesita cubrir todos los flujos"; concentra la calidad responsive donde el profesional realmente usa el teléfono (mirar agenda y ficha).

> **RESPUESTA DEL CLIENTE: C (todos los flujos) — sube alcance.** TODOS los flujos usables en mobile: crear/editar paciente, crear turno (3 pasos), reagendar, crear presupuesto (3 pasos), registrar pago, editar odontograma. Touch targets ≥44px. → Incorporado en REQ-180, REQ-185, REQ-215, REQ-252, REQ-253, REQ-254, REQ-263, REQ-270, REQ-271 y NFR-011.

---

### Pregunta 7 — Interactividad real de Pagos y Odontograma (GAP-B08)

**Por qué importa**: este es el límite lectura/escritura del demo. El brief describe los tabs como vistas, pero no aclara si el usuario puede *modificar* datos (registrar un pago, cambiar el estado de una pieza) o si todo solo refleja el seed. Afecta directamente cuánto "vive" el demo cuando el lead lo prueba 5-10 minutos.

**Opciones**:
- **A) Solo lectura** — Pagos y Odontograma muestran el seed; el usuario no modifica nada en esos tabs (el resto del sistema sí permite crear turnos, presupuestos, pacientes).
- **B) Pagos editable, Odontograma de lectura** — el usuario puede registrar un pago y ver cómo se actualiza el saldo; el odontograma se consulta pero no se edita.
- **C) Ambos editables** — el usuario también puede cambiar el estado de piezas dentales en el odontograma.

**Recomendación del equipo: B (Pagos editable, Odontograma de lectura)** — registrar un pago es una interacción demostrable de alto valor (se ve el saldo actualizarse + toast); editar piezas dentales una por una es complejo, propenso a romper coherencia con el historial, y aporta poco al objetivo del demo. El odontograma luce mejor como vista rica y consistente.

> **RESPUESTA DEL CLIENTE: C (AMBOS editables) — sube alcance.** (a) Pagos editable: registrar un pago y ver el saldo de cuenta corriente actualizarse y persistir en localStorage. (b) Odontograma editable: el usuario cambia el estado de las piezas (sana, caries, obturación, ausente, en tratamiento, prótesis) desde la pantalla de detalle de pieza, y persiste. → Incorporado en la nueva Épica 11 (REQ-259..270) + REQ-164, REQ-186.

---

## SECCIÓN 2 — DECISIONES TÉCNICAS TOMADAS (no van al cliente)

> Estos gaps los resuelvo internamente con defaults razonables. Cada uno: gap → decisión → justificación. Quedan documentados aquí y ya están reflejados (o se reflejarán) en los criterios correspondientes.

### GAP-T01 — Contradicción "30 pacientes" vs lectura dinámica
**Decisión**: lectura dinámica de las carpetas de fotos → **29 pacientes** (12 hombres + 17 mujeres) con el set actual entregado.
**Justificación**: el "treinta" de §12 es residual de la v1 del brief; §8 y §11 son explícitas y posteriores ("NO usar treinta como número fijo", "leer dinámicamente las carpetas"). Conteo verificado: 12 + 17 = 29; los `.DS_Store` y no-imágenes se ignoran. Reflejado en REQ-042, REQ-043.

### GAP-T02 — Framework frontend
**Decisión**: no lo prescribe el BA — lo elige el Architect.
**Justificación**: el brief dice "el equipo elige el framework". El requisito vinculante son los NFR: bundle <500 KB gzipped (NFR-002), lazy loading (NFR-003) y routing multi-pantalla real con deep-linking y botón atrás (NFR-006 a NFR-009). Cualquier stack que los cumpla es válido.

### GAP-T03 — Sistema de numeración dental del odontograma
**Decisión**: notación **FDI** (cuadrantes 1-4, piezas 1-8) como numeración primaria, con tooltip o referencia al número universal 1-32. Documentada en el README.
**Justificación**: FDI es el estándar internacional y el que un odontólogo real reconoce; el universal 1-32 se ofrece como apoyo para legos. Reflejado en REQ-137.

### GAP-T04 — Tamaño de página de las listas
**Decisión**: paginación **offset-based**, tamaño de página de **10-15 filas** (default 12), con total visible. Sin infinite scroll.
**Justificación**: simple y suficiente para el volumen del seed (29 pacientes, ≥50 turnos). Cumple REQ-103 (paginación clara, no infinite scroll). El número exacto lo afina diseño dentro de ese rango.

### GAP-T05 — Set de iconos
**Decisión**: **Phosphor** (estilo regular, stroke ~1.5px), a confirmar con el Design Orchestrator.
**Justificación**: el brief permite Phosphor o Tabler; Phosphor cubre bien iconografía clínica y de navegación. Es una decisión de diseño, no de negocio.

### GAP-T06 — Estados de presupuesto y factura
**Decisión**:
- **Presupuesto**: pendiente / aprobado / rechazado / vencido.
- **Factura**: emitida / pagada / vencida / anulada.
Documentados en el seed y usados consistentemente en badges y filtros.
**Justificación**: el brief normaliza estados de turno/tratamiento/pago pero deja abiertos presupuesto y factura; este set es el mínimo realista para un módulo interno mock. Reflejado en REQ-210, REQ-214, REQ-221.

### GAP-T07 — Distribución de los ≥50 turnos en estados
**Decisión**: ~30% confirmados/en espera (futuros), ~50% terminados (pasados), ~10% atendiendo/hoy, ~10% cancelados.
**Justificación**: el brief pide "distintos estados" sin proporciones; esta mezcla da sensación de operación viva con historia pasada, presente activo y futuro agendado. Soporta REQ-058 y los reportes de productividad.

### GAP-T08 — Reutilización de documentos mock entre pacientes
**Decisión**: reutilizar un pool de ~15 imágenes (10 radiografías + 5 fotos clínicas) asignándolas a distintos pacientes hasta alcanzar 40-60 referencias de documento.
**Justificación**: el brief explícitamente autoriza reutilización para llegar al volumen; evita necesitar 60 imágenes únicas. Reflejado en REQ-157, REQ-058.

### GAP-T09 — Política de inicialización del seed (primera vez vs builds posteriores)
**Decisión**: al primer arranque sin estado en localStorage, sembrar automáticamente. En arranques posteriores, respetar el estado del usuario. El botón "Resetear demo" (con confirmación) vuelve al seed original. Estado versionado por namespace + versión de schema.
**Justificación**: garantiza que el lead siempre vea datos la primera vez, pero no pierde lo que tocó al refrescar. Cubierto por REQ-041, REQ-058.

### GAP-B06 (reclasificado) — Cronograma de entrega e hitos
**Decisión**: NO es pregunta de negocio para el cliente — es planificación que gestiona el PM. El equipo propone las fases (diseño → maquetado → seed → integración → QA → deploy) con sus hitos, y el PM las acuerda con el cliente como parte de la gestión del proyecto, no como una elección de producto.
**Justificación**: el cliente no elige entre "opciones de cronograma"; el cronograma se deriva del alcance ya definido. Mantenerlo fuera de las preguntas de producto evita ruido en la conversación con el cliente.

---

## Trazabilidad gaps → criterios

| Gap | Tipo | Resolución (FINAL) | Criterios afectados | Estado |
|---|---|---|---|---|
| GAP-B01 color | Negocio → Pregunta 1 | **Azul cielo/medio** (#c5d8e8/#6da8d4), máx 4 tonos | Capa visual (design pipeline) | RESUELTO |
| GAP-B02 tipografía | Negocio → Pregunta 2 | **Red Hat** (Display+Text, 400/500), no Inter | Capa visual (design pipeline) | RESUELTO |
| GAP-B03 dominio | Negocio → Pregunta 3 | **SIN dominio propio**, URL Azure SWA | NFR-012, NFR-013 | RESUELTO |
| GAP-B04 logo | Negocio → Pregunta 4 | **Isotipo + wordmark** "Estudio Dental Mendieta" | REQ-008, REQ-056 | RESUELTO |
| GAP-B05 badge/demo | Negocio → Pregunta 5 | **CAMBIO ALCANCE: sin referencias a demo/mock; producto real** | REQ-011, 026, 027, 058, 089, 157, 247, 264-266, 272 | RESUELTO |
| GAP-B07 mobile | Negocio → Pregunta 6 | **TODOS los flujos en mobile** (sube alcance) | REQ-180, 185, 215, 252-254, 263, 270, 271; NFR-011 | RESUELTO |
| GAP-B08 lectura/escritura | Negocio → Pregunta 7 | **AMBOS editables** (sube alcance) | Épica 11 (REQ-259..270), REQ-164, REQ-186 | RESUELTO |
| GAP-T01 nº pacientes | Técnico | 29 (lectura dinámica) | REQ-042, REQ-043 | RESUELTO |
| GAP-T02 framework | Técnico | Lo elige Architect | NFR-002,003,006-009 | RESUELTO |
| GAP-T03 numeración dental | Técnico | FDI + tooltip universal | REQ-137 | RESUELTO |
| GAP-T04 paginación | Técnico | Offset, 12 filas | REQ-103 | RESUELTO |
| GAP-T05 iconos | Técnico | Phosphor | Capa visual | RESUELTO |
| GAP-T06 estados pres/fact | Técnico | Sets definidos | REQ-058, REQ-210, REQ-214, REQ-221 | RESUELTO |
| GAP-T07 distribución turnos | Técnico | 30/50/10/10 | REQ-058 | RESUELTO |
| GAP-T08 docs internos | Técnico | Pool de 15 reutilizado | REQ-157, REQ-058 | RESUELTO |
| GAP-T09 init seed | Técnico | Auto-seed 1ª vez, respeta usuario | REQ-041, REQ-058, REQ-264-265 | RESUELTO |
| GAP-B06 cronograma | Reclasificado a proceso | Lo gestiona el PM | — | RESUELTO |

**0 gaps pendientes — 17/17 resueltos.**
