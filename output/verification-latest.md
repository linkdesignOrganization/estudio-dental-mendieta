# Verificación: Post-Planificación (Fase 3 — paso 3d)

**Verificado por**: Plan Verifier
**Fecha**: 2026-06-01
**Modo**: NORMAL (no Pixel-Perfect — existe `design-criteria.md`)
**Proyecto**: Viewcase 02 — Estudio Dental Mendieta

## Artefactos verificados
- `output/requirements/requirements.md` — 272 REQ-XXX (REQ-001..272) + 20 NFR (NFR-001..013, 020..023, 030..034)
- `output/architecture/architecture.md` — módulos, modelo de datos (14 entidades), 8 ADRs, plan de 5 iteraciones + Fase de Construcción Visual con 21 DEMO-xxx
- `output/design/design-criteria.md` — 120 DC-xxx + 29 BVC-xxx
- `output/design/ux-criteria.md` — 71 UX-xxx (UX-001..094 con huecos intencionales por sección, incl. UX-023b)
- Pipeline de diseño: `briefs/clinica-dental-design-brief.md`, `brief-criteria.md`, `visual-analysis.md`, `references/task-dasher/` (49 PNGs)

---

## 1. Cobertura funcional de los 272 REQ (verificación programática)

Se mapeó cada REQ-ID contra la iteración a la que el `architecture.md` lo asigna (las tablas de las 5 iteraciones citan rangos explícitos REQ-XXX). Resultado de la comprobación automatizada:

- **Total esperado**: 272 (REQ-001..272)
- **Total cubierto por iteraciones**: 272
- **REQ huérfanos (sin iteración)**: **0**
- **REQ duplicados (en >1 iteración)**: **0**
- **IDs fuera de rango**: 0

Reparto: It.1 = REQ-001..058 + 247/248/250/251/257/258/264/265/266/272 · It.2 = REQ-098..172 + 186..191 · It.3 = REQ-059..097 · It.4 = REQ-173..185 + 192..205 + 267..270 · It.5 = REQ-206..246 + 249/252..256 + 259..263 + 271.

Cobertura cruzada en los 3 artefactos para los REQ con dimensión visual/UX: cada REQ funcional tiene además respaldo en al menos un DC-xxx (capa visual) y/o un UX-xxx (capa funcional) vía la cadena DEMO-xxx (ver punto 6). No se detectó ningún REQ funcional sin artefacto de soporte.

## 2. Los 5 módulos y sus pantallas — CUBIERTOS

| Módulo | Arquitectura (feature lazy + iteración) | Diseño (DC) | UX |
|---|---|---|---|
| Agenda (calendario, detalle, crear 3 pasos, reagendar, lista día) | `agenda/` It.3 | DC-036..039 | UX-005..007, 020..023b, 044, 049 |
| Pacientes (lista, ficha 6 tabs, crear/editar, sub-detalles) | `patients/` It.2+It.4 | DC-040..045, 058 | UX-008..010, 024..028, 045..048, 054 |
| Tratamientos (lista, catálogo, detalle tipo) | `treatments/` It.4 | DC-046, 062 | UX-011, 052, 063 |
| Facturación (presupuestos, facturas, obras sociales) | `billing/` It.5 | DC-047, 060 | UX-012, 013, 029, 030, 051, 065 |
| Reportes (dashboard KPI + 4 reportes) | `reports/` It.5 | DC-048, 049, 061 | UX-014, 053, 066 |
| (Login, Configuración, Ayuda, fallback) | `auth/`, `settings/` It.1 | DC-034, 035, 049 | UX-001, 004, 031, 017 |

Las ~40 pantallas / ~49 rutas del mapa de navegación (ux-criteria §Mapa de Navegación) tienen cada una ≥1 UX-xxx, y los layouts correspondientes en DC-030..049.

## 3. Ficha de 6 tabs + odontograma 32 piezas editable + pagos editable — CUBIERTOS

- **Barra de 6 tabs** (Info general · Odontograma · Historial · Tratamientos · Documentos · Pagos): REQ-116..122 → arquitectura It.2; **DC-073** (`tabs`, tab inactivo NO en DOM, reflejado en URL, role tablist); **UX-009/083**. Contenido de los tabs: REQ-128..168 → DC-042/043/044, UX-046/048.
- **Odontograma 32 piezas editable**: lectura REQ-132..140 (It.2) + escritura REQ-267..270 (It.4); **DC-043/076** (SVG 32 piezas FDI, 6 estados pastel + ícono, leyenda, `@defer`) y **DC-077** (`tooth-state-selector`); **UX-028/047/086** (cambio de estado persiste y se refleja). Aislado como sub-componente lazy (NFR-004).
- **Pagos editable**: REQ-161..168 (lectura It.2) + REQ-259..263 (escritura It.5, complementa REQ-164); **DC-044/045/112** (resumen + "Registrar pago" en ruta dedicada, validación monto>0); **UX-026/027/085** (saldo derivado recalculado, badge coherente, persistencia). Modelo: `estadoCuenta` derivado del saldo (no duplicado) — garantiza coherencia lista↔tab.

## 4. Seed dinámico (29 pacientes) + mínimos de datos — CUBIERTOS

- **29 pacientes dinámicos** (12 H + 17 M, edad del nombre de archivo, género de la carpeta, sufijos `23-1/23-2`, `.DS_Store` ignorado): REQ-042..055 (It.1); arquitectura "Carga del Seed Dinámico" (manifest.json en build-time + generadores con PRNG de semilla fija, ADR-8); **UX-060..062**.
- **Mínimos de volumen** (REQ-058): ≥6 obras sociales, ≥50 turnos (30/50/10/10), ≥40 tratamientos, ≥20 presupuestos, ≥25 facturas, ≥12 tipos, 40–60 documentos (pool ~15), histórico ≥60 días, 6 profesionales: cubiertos en arquitectura (generadores por entidad) y **UX-063/064/065/067**; NFR-030..033 contemplados.

## 5. Regla transversal "nada revela que es demo" (BVC-027 / REQ-272) — CUBIERTA con criterios de verificación

- **BVC-027** (CLIENT-SPECIFIED) transcrito EXACTO en `brief-criteria.md` → `visual-analysis.md` → `design-criteria.md` (con trazabilidad a DC-033/052/064/142). Es QA gate obligatorio.
- **REQ-272** (red de seguridad transversal): arquitectura It.1 (red inicial) + ADR-7; capa visual DC-021/033/052/064/142 (footer sin "Resetear demo", empty-states/toasts anti-demo, confirmaciones con copy de producción); capa funcional **UX-094** (barre toasts, confirmaciones, empty-states, notificaciones, validaciones, Configuración) + UX-031/090 (reset = "Restablecer datos", solo en Configuración).
- Reset reubicado a Configuración con nombre de producción (REQ-027/264/266) verificado en arquitectura ("Reset al seed"), DC-049/142 y UX-031/090.

## 6. Las 5 iteraciones cubren los 272 REQ + 21 DEMO-xxx cubren la Construcción Visual — CONFIRMADO

- **272 REQ sin huérfano**: confirmado programáticamente (punto 1).
- **21 DEMO-xxx con cobertura**: cada DEMO funcional tiene DC-xxx (visual) y/o UX-xxx (funcional). Verificación:
  - DEMO-001..018, 020, 021 → DC + UX (ambas capas).
  - DEMO-006 (seed dinámico, data-driven) → UX-060..067 (correcto: es funcional/datos).
  - DEMO-019 (design system) → DC-001..029 (correcto: puramente visual, sin UX-xxx).
  - **DEMO-xxx sin cobertura: NINGUNO.**
- Nota deliberada (no gap): el DEMO de CRM tracking del template estándar se **omite** intencionalmente (REQ-258/272, ADR-7, GAP-A01). QA verificará **ausencia** de SDKs de analytics, no presencia.

## 7. NFR (performance, bundle, responsive total mobile, accesibilidad) — CONTEMPLADOS

- **Performance/bundle**: NFR-001 (<3s 4G), NFR-002 (<500KB gzipped), NFR-003 (lazy), NFR-004 (odontograma sin lag), NFR-005 (persistencia no bloqueante) → arquitectura (Visión General, ADR-1/4/6, budget en `angular.json` warn 450/err 500, `@defer`, charts solo en Reportes, fuentes/iconos subseteados).
- **Routing**: NFR-006..009 (multi-pantalla, botón atrás, deep-linking, no-SPA-modal) → ADR-5 (citados como rango agrupado x3) + `staticwebapp.config.json` fallback; UX-015/016.
- **Despliegue/compatibilidad**: NFR-012 (Azure SWA), NFR-013 (URL default + fallback deep-link), NFR-011 (todos los flujos en mobile).
- **Responsive total mobile**: DC-080..089 (10 criterios: sidebar→drawer, tabla→ficha vertical, cabecera, tabs, grids, flujos, calendario/odontograma, formularios, touch ≥44px, ningún flujo solo-desktop) + UX-093 + REQ-252..254.
- **Accesibilidad**: NFR-020 (WCAG AA), 021 (focus ring), 022 (44px), 023 (labels en navegación) → design-criteria con 43 menciones a11y; DC-021/028/072, estrategia de contraste GAP-A04 (azul medio + texto oscuro 5.54:1; azul profundo `#246991` para texto blanco). REQ-255/256 en It.5.

---

## Consistencia del pipeline de diseño (verificación adicional NORMAL mode)

- `brief-criteria.md` existe con contenido (extracción del Brief Analyst): valores prescriptivos color/tipografía/spacing + 29 BVC. ✓
- `visual-analysis.md` existe y es sustancial (síntesis del Design Researcher): valores prescriptivos, BVC, anti-patrones, precaución de contraste GAP-A04, traducción Task Dasher. ✓
- `references/task-dasher/` contiene **49 PNGs** (+ capture-notes). ✓ (en subcarpeta `task-dasher/`, no en la raíz de `references/` — aceptable)
- **BVC incorporados en design-criteria.md** como sección "Brief Verification Criteria": 29/29 presentes y transcritos verbatim. ✓
- **Valores de color/tipografía/spacing coinciden** entre brief y design-criteria: `#c5d8e8`/`#6da8d4` (DC-001/002), Red Hat Display/Text 400/500 (DC-015/016), múltiplos de 4 (DC-019), radius 10–14px (DC-024). Sin desvíos. ✓

---

## Criterios SIN Cobertura ✗

**NINGUNO.** Los 272 REQ y los 20 NFR tienen cobertura en al menos un artefacto de planificación; los 21 DEMO-xxx tienen cobertura DC/UX según su naturaleza.

## Scope Creep (sin requirement asociado) — solo reporte, no bloquea

- **Toggle Card/Tabla** en lista de pacientes (DC-040, UX-082, GAP-UX04): NO exigido por REQ-098 (que prescribe tabla ≤5 col). Propuesto como mejora persona-céntrica; no introduce filtros ni acciones extra. **Intencional, aceptable.**
- **`/ayuda` (centro de ayuda/FAQ)** (GAP-UX05): existe solo como item del sidebar (REQ-020) sin criterios de contenido propios. Diseñado como shell navegable con FAQ de negocio. **Intencional, aceptable.**
- Ambos están documentados como decisiones de coordinación dentro del lenguaje multi-pantalla, no como features no solicitadas que inflen el alcance.

## Observaciones menores (no bloqueantes)

1. **Discrepancia de conteo en ux-criteria.md**: la línea de auto-verificación dice "75 criterios UX-xxx" pero el cuerpo contiene **71** IDs únicos (UX-001..018=18, UX-020..033 incl. 023b=15, UX-040..054=15, UX-060..067=8, UX-080..094=15 → 71). Todos los rangos enumerados están completos; es un **error de etiqueta en el resumen**, no una carencia de cobertura. Recomendación para el Architect (2da invocación): corregir "75" → "71" en la línea de cobertura. **No afecta la aprobación.**
2. **NFR-010 (navegadores Chrome/Safari/Firefox/Edge)** no se cita por ID en architecture.md; está implícito en el stack (Angular 17 + Bootstrap 5, navegadores modernos). Cobertura por contenido suficiente; mención opcional.

---

## Resultado: PASA (0 criterios sin cobertura)

Los 272 REQ-XXX se distribuyen sin huérfanos ni duplicados en las 5 iteraciones; los 20 NFR están contemplados en arquitectura y diseño; los 21 DEMO-xxx tienen cobertura DC/UX; el pipeline de diseño (briefs, visual-analysis, 49 referencias, 29 BVC) está completo y los valores prescriptivos coinciden. Los 2 puntos de scope creep son intencionales y no bloquean. Las 2 observaciones son cosméticas/documentales.
