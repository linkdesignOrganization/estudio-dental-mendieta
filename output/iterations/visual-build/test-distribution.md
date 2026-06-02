# Plan de Distribución — QA Team

> Generado por el QA Orchestrator (MODO PLAN). Lo leen los 3 sub-testers vía Auto-Dispatch.
> Fase: **Construcción Visual (FASE 4)** · Modo: **NORMAL** (no Pixel-Perfect → el Visual Checker compara contra los DC-xxx, NO usa `image_compare` contra PNGs).

## Contexto de Testing
- Iteración: **Construcción Visual (la demo)**
- Ronda: **1** (primer ciclo de QA — no existe `qa-report.md` previo)
- URL del sitio desplegado (frontend): **`https://happy-coast-044ea7e0f.7.azurestaticapps.net`**
- URL del backend (si aplica): **N/A** — frontend-only, sin backend, estado en `localStorage`
- Total criterios esta iteración: **21 DEMO-xxx** (alcance funcional) materializados en **120 DC-xxx + 29 BVC + 75 UX-xxx + NFR aplicables**
- Criterios nuevos a testear: **TODOS** (Ronda 1)
- Criterios a re-testear (fallaron en ronda anterior): **0** (no hay ronda anterior)

> **REGLA DURA — testear SIEMPRE contra el sitio desplegado, NUNCA contra localhost.** El PM ya pusheó y verificó el deploy (paso 4e: root 200, `/pacientes` SPA-fallback 200, `/seed/manifest.json` 200 con 29 pacientes, headers de seguridad presentes). Si la URL no responde, reportar al PM antes de testear.
>
> **Estado de la demo (alcance):** los 2 flujos críticos son **interactivos** end-to-end con el seed: **crear turno (DEMO-015, 3 pasos)** y **registrar pago (DEMO-016)**. El resto de flujos (reagendar, crear presupuesto, editar paciente, crear paciente, reportes detallados, configuración, sub-detalles) se entregaron como **shell navegable (DEMO-018)**: se testean SOLO como "ruta navegable con su layout y placeholders coherentes", **NO** su funcionalidad completa (esa es Fase 5). No reportar como BUG la ausencia de funcionalidad en pantallas shell — sí reportar si la ruta crashea, no carga, o rompe el layout/responsive.
>
> **CRÍTICO transversal (BVC-027 / DEMO-021):** ninguna parte de la UI puede revelar "demo/mock/simulación/prueba/ejemplo/ficticio/viewcase" ni atribución a Link Design; **cero tracking/analytics/telemetría** (verificar AUSENCIA de SDKs y de requests de analytics, no su presencia). El reset se llama **"Restablecer datos"** y vive SOLO en Configuración (no en el footer). La notificación de WhatsApp se presenta como real. Facturas/presupuestos sin ARCA/AFIP.

---

## Auto-Dispatch (resumen de asignaciones, sin solapamiento)

| Sub-tester | Carpeta de salida | Foco | # criterios asignados |
|---|---|---|---|
| **Visual Checker** | `e2e/tests/visual/` | DC-xxx (tokens, layouts, componentes, estados, responsive, feedback) + 29 BVC + NFR a11y/perf. **PRIORIDAD #1** | 120 DC + 29 BVC + 9 NFR = **158** |
| **Flow Tester** | `e2e/tests/flow/` | UX-xxx happy-path: routing/49 rutas, deep-linking, botón atrás, los 2 flujos críticos, persistencia localStorage + reset, seed, interacciones | **47** UX (happy-path) |
| **Edge Case Tester** | `e2e/tests/edge-case/` | Ramas de error/vacío/inválido/límite: inputs inválidos, estados vacíos, `/no-encontrado`, deep-link inválido, degradación sin localStorage, límites | **28** (ramas edge de UX/DC + NFR routing) |

**Regla anti-solapamiento:** el Flow Tester valida el **camino feliz** de cada flujo/ruta; el Edge Case Tester valida las **ramas de error/vacío/inválido/límite** de esos mismos flujos; el Visual Checker valida **solo la capa visual** (computed-style + aspecto), nunca la lógica funcional. Si un criterio tiene capa visual Y funcional, el Visual Checker verifica el aspecto y el Flow/Edge verifica el comportamiento.

**Todos generan `.spec.ts` Playwright** en su carpeta y **graban GIFs de los flujos principales** (obligatorio — son para la demo). Cada sub-tester escribe su resultado en `output/iterations/visual-build/{flow-tester,edge-case-tester,visual-checker}-results-ronda-1.md`.

---

## Asignación: Visual Checker → e2e/tests/visual/

> **PRIORIDAD #1 en Fase 4.** Verificación de cumplimiento de `design-criteria.md` (modo NORMAL: contra los criterios DC-xxx, **no** contra PNGs). Método: `browser_evaluate` (`getComputedStyle`) para tokens/medidas + inspección visual para layout/estados. Cada DC-xxx y cada BVC-xxx debe tener resultado explícito.

### Criterios asignados — Tokens de diseño (computed-style)
- **DC-001..005**: paleta azul de 4 tonos (`#c5d8e8` sky · `#6da8d4` medio · `#246991` deep · `#eff8ff` tint); exactamente 4 hues azules (H≈200–208°), **sin** azul Bootstrap `#0d6efd` ni 5º hue de acento. **CRÍTICO DC-002**: ningún texto blanco sobre `#6da8d4` (GAP-A04).
- **DC-006..009**: neutros/superficie/borde (`#fafafa` canvas, `#ffffff` elevado, `#2a2a35` texto, `#707080` secundario, `#e8e8ee` borde 0.5–1px).
- **DC-010..014**: semánticos SIEMPRE pastel (par fondo+texto del mismo hue, ratio ≥4.5:1; nunca texto blanco sobre el pastel).
- **DC-015..018**: tipografía **Red Hat Display/Text**, **solo pesos 400/500** (nunca 700+, nunca Inter/Roboto/Arial/system), escala (28/20/16), **máx 3 tamaños por pantalla**, line-height títulos ~1.2 / cuerpo 1.5–1.7.
- **DC-019..021**: spacing múltiplos de 4 (4·8·12·16·24·32·48·64), padding de card 24–32px, gap entre cards 16–20px, control-height 40px, disabled opacity 0.4.
- **DC-022..026**: una sola sombra (`0 1px 4px rgba(42,42,53,0.04)`), **"borde O sombra nunca ambos"**, radius 10–14px (radius >20px PROHIBIDO en cards/inputs), pill/circle solo en circulares, transiciones 150–250ms.
- **DC-027**: iconografía **Phosphor regular**, stroke 1.5px, tamaños 16/20/24, sin emojis.
- **DC-028..029**: focus ring visible `0 0 0 2px #246991` en todo interactivo (nunca `outline:none` sin reemplazo); overrides de Bootstrap (sin `#0d6efd`, sin sombras Material, `.fw-bold`→500, body en Red Hat).

### Criterios asignados — Layouts por pantalla (visual + computed donde aplica)
- **DC-030..035**: App Shell (grid sidebar 232px + header sticky 64px + outlet + footer), Sidebar (5 items + Config/Ayuda, item activo píldora `#c5d8e8`), Header (logo + módulo + campana badge + avatar "AD", **sin** búsqueda global), Footer (1 línea sobria, **sin** "demo"/portfolio/"Resetear demo"), Login (card centrada, sin shell, **sin** aurora), No-encontrado (empty state dentro del shell).
- **DC-036..039**: Agenda (calendario card flotante, toggles mes/semana/día, bloques por estado), Detalle de turno (1 acción primaria + ⋯), Crear turno (stepper "Paso N de 3"), Reagendar/Lista del día (tabla ≤4 col).
- **DC-040..045**: Pacientes lista (tabla ≤5 col), Ficha cabecera + 6 tabs (**PANTALLA-FIRMA**: banner azul sobrio **NUNCA aurora**, asimetría foto/nombre/datos, 1 acción "Agendar turno"), tabs 1–3, Odontograma (32 piezas + leyenda), tabs 4–6, sub-pantallas.
- **DC-046..049**: Tratamientos (tabla ≤5 col + catálogo cards), Facturación (sub-nav Presupuestos/Facturas/Obras sociales, facturas ≤4 col, **sin ARCA/AFIP**), Reportes dashboard (≤6 KPI cards), Reportes detallados + Config + Ayuda (cards aireadas, **cero demo en copy**).

### Criterios asignados — Componentes (visual + computed-style)
- **DC-050..057**: sidebar, header, footer, status-badge (mapeo de estados pastel), priority-pill, avatar (fallback a iniciales, **nunca imagen rota**), avatar-stack (+N en `#246991`), relative-time (español rioplatense).
- **DC-058..062**: patient-card, treatment-card/progress-card (% grande peso 500), obra-social-card (**sin ARCA/AFIP**), kpi-card (valor calculado, nunca hardcodeado), treatment-type-card.
- **DC-063..065**: data-table (**≤5 col estricto**, paginación offset default 12, **nunca infinite scroll**), empty-state (ícono + guidance + 1 acción), skeleton (**nunca spinners**, stagger ~40ms, `aria-busy`).
- **DC-066..068**: toast (éxito verde auto-dismiss ~3s / error coral persistente), confirm-dialog (**<50% viewport**, trap de foco), filter-panel (**1 filtro visible** + panel).
- **DC-069..072**: inputs/select/textarea (40px, radius 10–14px, **no píldoras**, validación inline), stepper, button (primary `#6da8d4` + **texto oscuro** GAP-A04, **1 sola primaria por pantalla**), icon-button (44px mobile, `aria-label` obligatorio).
- **DC-073..078**: tabs (6 tabs, **tab inactivo NO en el DOM**, `role=tablist/tab/tabpanel`), patient-header (banner sutil **nunca aurora**, nombre `<h1>`), event-block (timeline), odontogram (32 piezas FDI, 6 estados color+ícono, leyenda visible, `aria-label` por pieza), tooth-state-selector (`role=radiogroup`), photo (fallback a iniciales).

### Criterios asignados — Responsive (visual en 3 breakpoints)
- **DC-080..089**: sidebar→drawer (<768px), tabla→mini-cards verticales (**sin scroll horizontal**), cabecera de ficha recentrada, barra de 6 tabs scroll horizontal, cards en grid (3→2→1-2), flujos multi-paso 1 columna, calendario + odontograma adaptados, formularios 1 columna, **touch target ≥44px** en TODO control mobile, ningún flujo "solo desktop".

### Criterios asignados — Estados de UI (visual por pantalla/estado)
- **DC-100..119**: los 5 estados (vacío/carga/error/éxito/muchos datos) por pantalla — verificar aspecto del empty-state, skeleton (no spinner), toast, y comportamiento de paginación. (El **comportamiento** funcional de estos estados lo cubre Flow/Edge; aquí solo el aspecto visual.)

### Criterios asignados — Feedback visual (visual + computed duración/color)
- **DC-120..122**: loading con skeletons + stagger (nunca spinners), botones de confirmación en estado "Guardando…", odontograma/charts diferidos con skeleton.
- **DC-130..133**: toasts (éxito/error/info con sus colores y `aria-live`), notificaciones internas del header (<50%, leído/no-leído, navega a ruta real).
- **DC-140..143**: validación inline (borde coral + mensaje junto al campo + `aria-invalid`), submit (estado loading + toast), confirmaciones destructivas (confirm-dialog <50%, copy de producción **nunca "resetear demo"**), motion global 150–250ms (respeta `prefers-reduced-motion`).

### NFR asignados al Visual Checker
- **NFR de accesibilidad** (NFR-020..023): contraste WCAG AA en texto y controles, focus ring visible en todo interactivo, touch target ≥44px en mobile, ningún ícono de navegación principal sin label. **Atención GAP-A04**: el azul medio `#6da8d4` NO admite texto blanco (verificar que se usó texto oscuro `#2a2a35` o el azul profundo `#246991` para superficies con texto blanco).
- **NFR de performance** (NFR-001..005): tiempo de carga inicial <3s y bundle inicial <500KB gzipped (medir vía `browser_evaluate` con `performance.getEntriesByType('navigation')` y/o `resource` timings; verificar tamaño del initial chunk), lazy loading de módulos secundarios (los chunks de feature NO están en el bundle inicial), odontograma 32 piezas sin lag perceptible al interactuar, escrituras a localStorage no bloquean la UI.

### BVC-xxx asignados (Brief Verification Criteria — CLIENT-SPECIFIED, severidad ALTA)
> Los 29 BVC son QA gates del cliente. Cada uno debe tener resultado explícito en el reporte. Trazabilidad a DC-xxx entre paréntesis.

| BVC-xxx | Criterio del Cliente | Tipo de verificación |
|---------|---------------------|---------------------|
| BVC-001 | Tipografía NO Inter, solo pesos 400/500 (Red Hat) | computed-style (DC-015/016) |
| BVC-002 | UNA familia de acento (azul), máx 4 tonos coherentes | computed-style (DC-001..005) |
| BVC-003 | Fondo `#ffffff`–`#fafafa`; texto gris oscuro cálido (no negro puro) | computed-style (DC-006/007) |
| BVC-004 | Cards radius 10–14px; ninguna >20px | computed-style (DC-024/025) |
| BVC-005 | Borde O sombra, nunca ambos; sombra un solo nivel (1px/4px/0.04) | computed-style (DC-022/023) |
| BVC-006 | Spacing múltiplos de 4; padding card 24–32px; gap 16–20px | computed-style (DC-019/020) |
| BVC-007 | Sidebar exactamente 5 items + Config/Ayuda, icono+label visible, activo destacado | visual (DC-031/050) |
| BVC-008 | Header sin búsqueda global ni command palette | visual (DC-032/051) |
| BVC-009 | Ninguna tabla supera 5 columnas | visual (DC-063) |
| BVC-010 | Una acción primaria por pantalla; máx una secundaria visible | visual (DC-071/037/041) |
| BVC-011 | Un solo filtro principal visible; resto en panel | visual (DC-068) |
| BVC-012 | Ningún drawer como contenido principal; ningún modal >50% | visual (DC-067) |
| BVC-013 | Ficha usa tabs; contenido del tab inactivo NO en el DOM | computed-style (DC-073) |
| BVC-014 | Iconografía un set (Phosphor/Tabler), regular, stroke 1.5px, 16/20/24 | computed-style (DC-027) |
| BVC-015 | Hover visible en clickeables; focus rings; disabled opacidad 40% | visual (DC-021/028/143) |
| BVC-016 | Skeletons (no spinners) al cargar; toasts tras acciones exitosas | visual (DC-065/120/130) |
| BVC-017 | Inputs/botones 40px; touch targets ≥44px en mobile | computed-style (DC-021/069/071) |
| BVC-018 | Sin emojis decorativos, sin gradientes saturados, sin sombras pesadas, sin pills estridentes | visual negative (DC-053/027/022) |
| BVC-019 | Cards paciente/tratamiento/obra social replican patrones Task Dasher | visual (DC-058/059/060) |
| BVC-020 | Ficha del paciente compatible con la página Profile de Task Dasher | visual (DC-074/041) |
| BVC-021 | Transitions/micro-interacciones 150–250ms | computed-style (DC-026/143) |
| BVC-022 | Line-height cuerpo 1.5–1.7, títulos ~1.2; máx 3 tamaños por pantalla | computed-style (DC-017/018) |
| BVC-023 | NO drawers laterales para contenido principal | visual negative (DC-067/080) |
| BVC-024 | NO power-user features (command palette, atajos globales, búsqueda global) | visual negative (DC-032) |
| BVC-025 | NO iconos sin label en navegación principal | visual negative (DC-031/050/072) |
| BVC-026 | NO infinite scroll en listas ni en la ficha | visual negative (DC-063/073) |
| **BVC-027** | **NINGUNA parte de la UI revela que es demo/mock (sin badge "demo", sin "Resetear demo", sin lenguaje que delate el mock)** — **CRÍTICO** | visual negative (DC-033/052/064/142) |
| BVC-028 | El aire/espacio comunica orden — pantallas con poco contenido se ven espaciosas, no rellenadas | subjective (DC-020/042/048) |
| BVC-029 | Sensación "calma profesional" coherente con Task Dasher | subjective (DC-022/024/041) |

### Instrucciones específicas — Visual Checker
- URL base: `https://happy-coast-044ea7e0f.7.azurestaticapps.net`
- Breakpoints: **mobile <768px · tablet 768–1199px · desktop ≥1200px** (3 viewports obligatorios).
- **Modo NORMAL**: comparar contra los criterios DC-xxx (valores prescriptivos 🔒), NO `image_compare` contra PNGs.
- Pantallas a recorrer (con seed cargado): `/login`, `/reportes`, `/agenda`, `/pacientes`, una ficha `/pacientes/:id/informacion` + sus 6 tabs (incl. `/odontograma`), `/tratamientos` + `/tratamientos/catalogo`, `/facturacion/presupuestos` + `/facturas` + `/obras-sociales`, `/configuracion`, `/ayuda`, `/no-encontrado`.
- **GAP-A04 (vinculante)**: el azul medio `#6da8d4` con texto blanco FALLA AA → verificar receta canónica (texto oscuro `#2a2a35` sobre `#6da8d4`, o `#246991` para superficies con texto blanco). Severidad ALTA si se viola.
- **Brief compliance (BVC) es QA gate CLIENT-SPECIFIED → severidad ALTA para cualquier fallo.** BVC-027 (cero rastro de demo) es CRÍTICO.
- Grabar GIFs: recorrido del shell + ficha del paciente (pantalla-firma) en desktop y mobile.

---

## Asignación: Flow Tester → e2e/tests/flow/

> Valida el **camino feliz** de routing, los 49 rutas, deep-linking, botón atrás, los 2 flujos críticos interactivos, persistencia en localStorage + reset, seed e interacciones. Las ramas de error/vacío/inválido las cubre el Edge Case Tester.

### Criterios asignados — Navegación y Routing (happy-path)
- **UX-001**: `/login` carga fuera del shell; "Ingresar como administradora" y "Saltar login" navegan a `/reportes` cargando el seed.
- **UX-002**: el shell envuelve todas las rutas internas excepto `/login`; sidebar + header reflejan la ruta activa (un solo item destacado).
- **UX-003**: clic en cada item del sidebar navega a su ruta dedicada (`/agenda`, `/pacientes`, `/tratamientos`, `/facturacion/presupuestos`, `/reportes`, `/configuracion`, `/ayuda`).
- **UX-004**: inicio post-login = `/reportes` (dashboard de KPIs).
- **UX-005**: `/agenda` en vista mensual por default; toggle Mes/Semana/Día refleja la vista en query (`?vista=semana`/`?vista=dia`); `/agenda/dia` es ruta propia.
- **UX-006** (happy): clic en un bloque de turno navega a `/agenda/turno/:id` (ruta dedicada, NO drawer/modal). *(El caso `:id` inexistente → Edge.)*
- **UX-007**: crear turno usa 3 rutas (`/agenda/nuevo/paciente` → `/profesional` → `/confirmar`); reagendar `/agenda/turno/:id/reagendar`; lista del día `/agenda/dia`.
- **UX-008**: `/pacientes` lista; cada fila navega a `/pacientes/:id` → redirige a `/informacion`; crear paciente `/pacientes/nuevo/datos` → `/clinico`.
- **UX-009**: los 6 tabs reflejan el tab activo en la URL; recargar/compartir mantiene el tab.
- **UX-010**: sub-pantallas de la ficha con ruta dedicada (pieza `/pieza/:fdi`, evento, plan, documento, registrar pago `/pagos/nuevo`, editar).
- **UX-011**: `/tratamientos` → `/pacientes/:id/plan/:pid`; `/tratamientos/catalogo` → `/catalogo/:tid`.
- **UX-012**: `/facturacion` → `/facturacion/presupuestos`; sub-nav (Presupuestos/Facturas/Obras sociales) = 3 rutas hermanas reales.
- **UX-013**: crear presupuesto 3 rutas + detalles `/:id` (shell navegable — verificar ruta+layout, no funcionalidad).
- **UX-014**: 4 reportes detallados con ruta propia; cada KPI card navega a su reporte.
- **UX-015**: botón atrás del navegador funciona en TODOS los flujos (ficha→lista, sub-pantalla→ficha en tab de origen, paso N→N-1 con datos preservados).
- **UX-016**: deep-linking — cargar directo cualquier URL interna válida (ej. `/pacientes/:id/pagos`) renderiza correcto hidratando de localStorage (fallback `index.html`). *(URL inválida → Edge.)*
- **UX-018**: mobile — sidebar→drawer overlay invocado por hamburguesa; al elegir item navega y cierra el drawer.

### Criterios asignados — Flujos de usuario (los 2 críticos interactivos + happy-path)
- **UX-020** (FLUJO CRÍTICO 1, DEMO-015): crear turno end-to-end por 3 rutas con stepper "Paso N de 3" → "Confirmar turno" **persiste** y navega a `/agenda/turno/:idNuevo` con toast "Turno agendado."
- **UX-021**: "Agendar turno" desde la cabecera de la ficha inicia el flujo con el paciente **preseleccionado**.
- **UX-022**: avanzar estado de turno (confirmado→atendiendo→terminado) persiste + toast.
- **UX-026** (FLUJO CRÍTICO 2 / FIRMA, DEMO-016): "Registrar pago" abre `/pacientes/:id/pagos/nuevo` (ruta dedicada, NO modal); "Confirmar pago" agrega el movimiento, **recalcula el saldo y persiste**; vuelve a `/pagos` con resumen + nuevo movimiento + toast "Pago registrado."
- **UX-027**: tras el pago, el badge de estado de cuenta en `/pacientes` queda **coherente con el nuevo saldo** (derivado, no duplicado).
- **UX-028**: editar estado de pieza del odontograma — clic en pieza → `/pieza/:fdi`, "Guardar cambio" **persiste**, toast, y al volver la pieza refleja el nuevo estado. *(Nota: en la demo este flujo es interactivo si está implementado; si la pantalla es shell, verificar navegación + layout.)*
- **UX-032**: navegación cruzada a paciente (desde detalle de turno, obra social, notificaciones).

### Criterios asignados — Seed (datos cargados correctamente)
- **UX-060**: 29 pacientes derivados de las fotos (12 H + 17 M); foto visible en lista y ficha; `.DS_Store` ignorado.
- **UX-061**: datos del paciente plausibles (nombre AR coherente con edad/género, DNI AR, obra social, profesional de cabecera, contactos).
- **UX-062**: odontograma e historial coherentes con la edad.
- **UX-063**: datos fijos — clínica, 6 profesionales, 6 obras sociales, ≥12 tipos de tratamiento.
- **UX-064**: volúmenes — ≥50 turnos, ≥40 tratamientos, 40–60 documentos, histórico ≥60 días.
- **UX-065**: ≥20 presupuestos, ≥25 facturas, AccountMovements; badge de estado de cuenta coherente lista↔tab Pagos.
- **UX-066**: KPIs y reportes calculados del estado (nunca hardcodeados); montos ARS formateados.
- **UX-067**: edge cases representados en el seed (nuevos sin historial, con deuda/al día, boca sana vs con tratamientos, turnos en 5 estados).

### Criterios asignados — Interacciones / Persistencia (columna vertebral)
- **UX-080**: buscador inline contextual filtra por nombre/DNI en vivo, solo en la pantalla activa (nunca global).
- **UX-081**: filtro único visible + panel desplegable; aplicar el filtro actualiza la lista/calendario sin reload.
- **UX-082**: toggle Mes/Semana/Día (sin navegar) + toggle Card/Tabla en lista de pacientes.
- **UX-083**: tab inactivo NO en el DOM; la ficha nunca usa scroll infinito con todos los datos.
- **UX-084** (CRÍTICO persistencia): crear paciente, agendar turno, avanzar estado, reagendar, registrar pago, editar ficha, aprobar presupuesto, cambiar estado de pieza **persisten en localStorage y sobreviven a refresh y cierre/reapertura**. *(Verificar al menos los 2 flujos interactivos con refresh real del navegador.)*
- **UX-085**: saldo derivado y coherente tras pago; cargos (−) vs pagos (+) distinguidos visualmente.
- **UX-086**: odontograma se refleja tras editar; numeración FDI 11–48 + universal 1–32 en tooltip.
- **UX-087**: disponibilidad real en turnos (slot ocupado del profesional NO seleccionable); costo de presupuesto calculado automáticamente.
- **UX-089**: toast tras cada acción exitosa; validación de formularios inline.
- **UX-090**: "Restablecer datos" (solo en Configuración) regenera el seed determinista y rehidrata el store; **única vía de reset** (no en el footer). *(En la demo, si Configuración es shell, verificar que el control existe con copy de producción y/o ejecuta el reset si está implementado; reportar si revela "demo".)*
- **UX-092**: notificaciones internas navegables (panel <50%, leído/no-leído, contador en header, navega a ruta real).
- **UX-093**: mobile — los flujos interactivos (crear turno, registrar pago) operables en mobile; touch ≥44px; sin scroll horizontal no intencional.

### Instrucciones específicas — Flow Tester
- URL base: `https://happy-coast-044ea7e0f.7.azurestaticapps.net`
- Flujos E2E prioritarios (GIF obligatorio): **crear turno (3 pasos, DEMO-015)** y **registrar pago (DEMO-016)** end-to-end, ambos con verificación de **persistencia tras refresh real** del navegador.
- Deep-linking: probar al menos 3 deep-links válidos directos (ej. `/pacientes/:id/pagos`, `/agenda/turno/:id`, `/tratamientos/catalogo`) — deben renderizar sin pasar por el inicio.
- Botón atrás: verificar la cadena ficha→lista, sub-pantalla→ficha-en-tab, paso N→N-1 con datos preservados.
- **Pantallas shell (DEMO-018)**: para reagendar, crear presupuesto, crear/editar paciente, reportes detallados, configuración, sub-detalles → testear SOLO "ruta navegable + layout coherente", NO funcionalidad completa. No reportar como BUG la falta de funcionalidad; sí si crashea/no carga.
- **CERO demo en copy interactivo (UX-094 / BVC-027)**: revisar toasts, confirmaciones, empty states, notificaciones, validaciones, Configuración — ningún texto revela demo/mock; WhatsApp presentado como real; sin ARCA/AFIP.

---

## Asignación: Edge Case Tester → e2e/tests/edge-case/

> Valida las **ramas de error/vacío/inválido/límite** de los mismos flujos/pantallas (sin solapar el camino feliz del Flow Tester). Inputs inválidos, estados vacíos, rutas inexistentes, deep-link inválido, degradación sin localStorage, límites.

### Criterios asignados — Inputs inválidos / validación
- **UX-050** (validación de pasos): en cada paso, la acción primaria deshabilitada hasta cumplir requeridos; error inline junto al campo afectado:
  - **Crear turno (DEMO-015)** — Paso 1 sin paciente: "Elegí un paciente para continuar." (no avanza).
  - **Registrar pago (DEMO-016)** — monto **≤0, cero, negativo o no numérico**: "Ingresá un monto mayor a cero." inline; "Confirmar pago" deshabilitado (DC-112). **Verificar montos: negativo, 0, vacío, texto no numérico.**
  - Crear paciente — DNI inválido / requeridos faltantes (campo requerido en crear turno/paciente): "Ingresá un DNI válido." (no avanza sin requeridos).
  - Crear presupuesto — sin tratamientos: "Agregá al menos un tratamiento." *(shell — verificar si aplica.)*
- **DC-112** (Registrar pago, capa de comportamiento): vacío → "Confirmar pago" deshabilitado; error monto ≤0 → mensaje inline; éxito → vuelve a Pagos con saldo+badge actualizados + toast.

### Criterios asignados — Estados vacíos (comportamiento)
- **UX-041** (transversal vacío): toda lista/sección que puede quedar vacía muestra empty state con guidance + (cuando aplica) 1 acción; nunca pantalla en blanco ambigua; copy sin revelar mock.
- **UX-044**: Agenda — período sin turnos → "No hay turnos en este período. Creá uno con Nuevo turno." + acción.
- **UX-045**: lista de pacientes — búsqueda/filtro sin resultados → "No encontramos pacientes con ese criterio. Probá con otro nombre o ajustá los filtros." (probar búsqueda que no matchea ningún paciente del seed).
- **UX-046**: ficha Tab Información — campos sin dato → placeholder claro ("Sin medicación registrada", "Sin alergias registradas"); badges de alerta solo si aplican.
- **UX-048**: ficha — Historial/Tratamientos/Documentos/Pagos vacíos → mensajes específicos con guidance; thumbnail roto → placeholder controlado (no ícono de error del navegador).
- **UX-051**: Facturación — Presupuestos/Facturas vacíos y obra social sin pacientes → mensajes específicos.
- **UX-052**: Tratamientos — lista de activos sin resultados → "No hay tratamientos activos con este criterio." (catálogo ≥12 fijos no tiene estado vacío).
- **UX-047**: odontograma — siempre 32 piezas; paciente nuevo/sin tratamientos → todas "sana" sin estados inventados.

### Criterios asignados — Rutas inexistentes / deep-link inválido / estados terminales
- **UX-006** (rama edge): `/agenda/turno/:id` con `:id` **inexistente** → "No encontramos este turno" + volver a Agenda, **sin crashear**.
- **UX-017**: cualquier ruta inexistente → `/no-encontrado` (sobria, "Volver al inicio" → `/reportes`); id de paciente inválido → "No encontramos este paciente." + "Volver a la lista de pacientes" → `/pacientes`. **Nunca crashea.** (Probar `/ruta-basura`, `/pacientes/pac-9999`, `/agenda/turno/tur-9999`.)
- **UX-049**: detalle de turno en estado terminal (terminado/cancelado) → acción primaria de avance **deshabilitada** (opacidad 40%, cursor not-allowed); turno inexistente → "No encontramos este turno".
- **UX-054**: cabecera de ficha estable al cambiar de tab; paciente inexistente → "No encontramos este paciente." + "Volver a la lista".
- **DC-104**: detalle de turno — carga (skeleton), error (turno inexistente), estado terminal (acción deshabilitada).
- **DC-126/UX-017 trazabilidad**: deep-link a ficha de paciente inexistente renderiza el estado "no encontrado", no crashea.

### Criterios asignados — Degradación / límites
- **UX-091** (degradación sin localStorage): si `localStorage` no está disponible (modo privado restrictivo / cuota llena) → el sistema **degrada a estado en memoria con aviso claro (toast informativo, sin lenguaje de demo) y permite navegar el seed sin crashear**. (Simular localStorage bloqueado/lleno y verificar que no crashea y el aviso no revela mock.)
- **UX-043** (muchos datos / límite): listas largas usan **paginación offset (default 12) con contador "1–N de M"**, NUNCA infinite scroll. (Verificar en lista de pacientes con 29 pacientes: paginación visible, contador correcto, navegación entre páginas; confirmar que no hay infinite scroll.)
- **UX-088** (confirmaciones antes de destructivas): toda acción destructiva/irreversible pide confirmación explícita ANTES de ejecutar (eliminar paciente, cancelar turno, cancelar flujo con datos, descartar edición, descartar pago con datos, restablecer datos). Verificar que **Cancelar** en un flujo con datos pide confirmación.
- **UX-031** (Restablecer datos — rama destructiva): pide confirmación que advierte la pérdida de cambios antes de ejecutar; copy de producción. *(Si Configuración es shell, verificar el copy del control/confirmación y la ausencia de "demo".)*

### NFR asignados al Edge Case Tester (seguridad / robustez de routing)
- **NFR-006..009** (robustez multi-pantalla, capa edge): la URL siempre refleja la vista; deep-linking de URL válida renderiza desde localStorage; rutas inexistentes no crashean; **prohibido SPA con todo en modales/accordions ocultos** (verificar que el contenido no está oculto sino en rutas reales).
- **NFR-013**: el routing multi-pantalla y el deep-linking funcionan bajo la URL default de Azure SWA con fallback a `index.html` (verificar que un deep-link directo a una ruta del cliente devuelve la app, no un 404 del servidor).
- *(Nota de alcance: este proyecto es frontend-only sin auth ni inputs server-side, por lo que los NFR de seguridad clásicos —inyección SQL, auth bypass, sanitización server— **N/A**. La superficie de "seguridad" aquí es la **robustez del routing/deep-linking + degradación + ausencia de tracking**. La ausencia de tracking/analytics la verifica el Visual Checker vía BVC-027; el Edge Case Tester confirma que ninguna ruta/estado de error filtra lenguaje de mock.)*

### Instrucciones específicas — Edge Case Tester
- URL base: `https://happy-coast-044ea7e0f.7.azurestaticapps.net`
- Edge cases anticipados (GIF de los principales):
  1. **Registrar pago con monto inválido** (negativo, 0, vacío, texto) → validación inline + botón deshabilitado.
  2. **Crear turno sin paciente** (Paso 1) → no avanza + error inline.
  3. **Deep-link a ruta/id inexistente** (`/ruta-basura`, `/pacientes/pac-9999`, `/agenda/turno/tur-9999`) → "no encontrado" sin crashear.
  4. **Búsqueda de pacientes sin resultados** → empty state con guidance.
  5. **localStorage bloqueado/lleno** → degradación con aviso (sin lenguaje de demo), no crashea.
  6. **Paginación con 29 pacientes** → contador "1–N de M", sin infinite scroll.
  7. **Cancelar un flujo con datos** → pide confirmación.
- **Pantallas shell (DEMO-018)**: para ramas edge sobre pantallas no funcionales (reagendar, crear presupuesto, etc.), verificar que el shell no crashea ante navegación/deep-link y que el copy no revela mock; NO exigir validación funcional completa.
- **Cero demo en estados de error/vacío (BVC-027 trazabilidad)**: ningún empty state, mensaje de error, "no encontrado" ni aviso de degradación puede revelar demo/mock/simulación.

---

## Regresión Automatizada (lee de regression-results.md)
- Resultado de `npx playwright test e2e/tests/`: **N/A — Ronda 1.** No existe suite automatizada previa ni `regression-results.md` (este es el primer ciclo de QA; los sub-testers GENERAN la suite inicial de `.spec.ts` en esta ronda).
- Criterios verificados por automatización (PASA automatizado — NO asignar a sub-testers): **ninguno** (no hay suite previa).
- Criterios con regresión detectada: **ninguno** (no hay ronda anterior).

## Criterios Pendientes de Testing Manual
- Total criterios que requieren sub-testers esta ronda: **TODOS** (158 DC/BVC/NFR-a11y-perf al Visual Checker + 47 UX happy-path al Flow Tester + 28 ramas edge/NFR-routing al Edge Case Tester).
- Criterios FALLARON en ronda anterior (re-verificar fix): **ninguno** (Ronda 1).
- Criterios DESBLOQUEADOS (antes bloqueados por bug, ahora testeables): **ninguno** (Ronda 1).
- Criterios nuevos sin test automatizado: **todos** — los 3 sub-testers generan la suite inicial completa de `.spec.ts` en `e2e/tests/{flow,edge-case,visual}/` para que en rondas futuras entre en la regresión automatizada.
