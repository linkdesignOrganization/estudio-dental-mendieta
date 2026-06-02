## Verificación: Post-UI-Developer (paso 4a-verify) — Cáscara Visual vs DC-xxx

**Modo**: NORMAL
**Fecha**: 2026-06-01
**Checklist**: `output/design/design-criteria.md` (120 DC + 29 BVC)
**Alcance**: solo CÁSCARA VISUAL (tokens, layouts, componentes, responsive, estados con placeholders, feedback visual, BVC negativos). NO se verifica lógica funcional/mock data/persistencia (paso 4b).
**Build**: `ng build --configuration production` → exit 0 (compila; solo warnings de deprecación Sass `@import`, no bloqueantes).

---

### Resumen ejecutivo
La cáscara visual es de **calidad excepcional** y cubre el checklist DC-xxx casi en su totalidad. Tokens, fuentes self-hosted, subset de Bootstrap (omite `root` → nunca emite `#0d6efd`), decisión GAP-A04 (botón primario = texto oscuro sobre `#6da8d4`), los 30 componentes de `shared/` y las ~40 pantallas están conformes. Los criterios negativos críticos (BVC-027 cero rastro de demo, BVC-008/024 sin búsqueda global, BVC-018 sin fuentes/azules prohibidos, cero analytics/CRM, DC-047 sin ARCA/AFIP) **PASAN**.

Se detectó **un único gap concreto bloqueante**: 2 nombres de íconos referenciados en código pero **no definidos** en el set Phosphor de `icon.component.ts`, lo que produce el render del glifo de fallback `question` ("?") en lugar del ícono intencionado.

---

### Criterios Cubiertos ✓ (muestra representativa — verificación exhaustiva)

**Tokens (DC-001..029)** — `src/styles/tokens.scss`, `theme.scss`, `fonts.scss`, `bootstrap-subset.scss`
- DC-001..005: 4 tonos azules exactos (`#c5d8e8`/`#6da8d4`/`#246991`/`#eff8ff`), sin 5º hue de acento ✓
- DC-006..014: neutros + semánticos pastel (par fondo+texto oscuro) con ratios AA documentados ✓
- DC-015/016: `Red Hat Display`/`Red Hat Text` self-hosted woff2 (4 archivos presentes en `public/fonts/`), solo pesos 400/500, `.fw-bold`→500 ✓
- DC-017/018: escala 28/20/16 + lh 1.2/1.25/1.6 ✓
- DC-019..021: spacing múltiplos de 4, card-padding 24-32, control-height 40, touch 44, disabled 0.4 ✓
- DC-022/023: sombra única `0 1px 4px rgba(42,42,53,0.04)`; `.surface-card`=sombra+border:none, `.surface-bordered`=borde+sombra:none (regla "borde O sombra") ✓
- DC-024/025: radius 10/12/14, pill/circle solo en circulares ✓
- DC-026: motion 150-250ms + easing cubic-bezier ✓
- DC-027: Phosphor inline stroke 1.5 (escalado proporcional), tamaños 16/20/24, currentColor ✓ (excepción: 2 íconos sin definir — ver gaps)
- DC-028: focus ring `0 0 0 2px #246991` global en `:focus-visible` ✓
- DC-029: overrides Bootstrap completos; `bootstrap-subset.scss` omite la capa `root` → **ningún `#0d6efd` emitido** ✓

**Layouts ~40 pantallas (DC-030..049)**
- DC-030..033: shell grid 232px+contenido, header sticky 64px, footer sobrio "Estudio Dental Mendieta · v1.0 · 2026", sidebar fuera de Login ✓
- DC-031/050: sidebar exactamente 5 items + separador + Config/Ayuda, ícono+label siempre visible, píldora activa `#c5d8e8`, badge `#246991`, `aria-current` ✓
- DC-034: Login card centrada, split con aside azul sobrio (NO aurora), 40px inputs, "Ingresar como administradora" + "Saltar login", sin shell ✓
- DC-035: not-found dentro del shell ✓
- DC-036/039: calendario card blanca + filtro profesional + toggles Mes/Semana/Día + bloques por estado + "+N más"→/agenda/dia; day-list tabla 4 col ✓
- DC-040: pacientes tabla 5 col + search-pill + toggle Card/Tabla ✓
- DC-041/074: **ficha-firma** — banner azul `#c5d8e8→#dcebf6→#f4fafe` (NO aurora), header asimétrico foto xl + nombre display + panel icon-chips, primaria "Agendar turno" + menú ⋯, 6 tabs ✓
- DC-042/043/044: tabs Info/Odontograma/Historial/Tratamientos/Documentos/Pagos con contenido conforme ✓
- DC-046: tratamientos tabla 5 col + catálogo cards (12 tipos, grid 3 col) ✓
- DC-047: facturación sub-nav (presupuestos/facturas/obras sociales), presupuestos 5 col, facturas 4 col, obras-sociales cards; sin ARCA/AFIP ✓
- DC-048: dashboard exactamente 6 KPI cards clickeables, sin tablas amontonadas ✓
- DC-049: reportes detallados en cards + Config "Restablecer datos" (copy producción) + Ayuda FAQ ✓

**Componentes (DC-050..079)** — los 30 en `src/app/shared/components/` + layout
- status-badge (DC-053): pill pastel fondo+texto+dot, mapeo de dominio en `status-map.ts` ✓
- avatar (DC-055): xs24/sm32/md48/lg88/xl120, fallback `(error)`→iniciales, ring blanco lg/xl ✓
- avatar-stack (DC-056): +N con `#246991` (AA), número siempre visible ✓
- patient-card / progress-card / obra-social-card / kpi-card / treatment-type-card (DC-058..062): conformes (foto 88px, % display `#6da8d4`+`role=progressbar`, logo-círculo, valor `#246991`+gauge, ícono+costo) ✓
- data-table (DC-063/081): **≤5 col estricto** (verificado: 5/5/5/4/4), header gris uppercase, paginación offset (NO infinite scroll), mobile→mini-cards ✓
- empty-state / skeleton (DC-064/065): glyph+title+guidance+acción; shimmer+stagger `index*40ms`, presets, **NUNCA spinners** ✓
- toast / confirm-dialog / filter (DC-066..068): toast blanco+borde semántico (error→alert+Reintentar+persistente); modal 440px<50%+backdrop 0.45+Escape+foco Cancelar ✓
- inputs/button/icon-button/stepper (DC-069..072): 40px, radius 10-14, primary GAP-A04 (texto oscuro), focus ring, stepper "Paso N de M" ✓
- tabs (DC-073): **6 tabs como rutas hijas (router-outlet) → contenido inactivo genuinamente NO en el DOM** (implementación más fuerte posible, BVC-013) ✓
- patient-header (DC-074): nombre `<h1>`, banner no-aurora, asimetría ✓
- odontogram (DC-076): **32 piezas FDI**, cuadrantes 1-2/3-4 con eje, 6 estados con **color + patrón/ícono** (no solo color), leyenda siempre visible, `aria-label` completo, focus teclado, `@defer (on viewport)`, mobile 8/fila ✓
- tooth-state-selector (DC-077): radio-cards `role=radiogroup`+`aria-checked`, swatches pastel, 44px ✓
- photo (DC-078): fallback determinista + placeholder controlado documentos ✓

**Responsive (DC-080..089)**
- DC-080: sidebar→drawer overlay (320px/80vw, backdrop, cierra al navegar vía router.events) ✓
- DC-081: data-table→mini-cards en <768px, sin scroll horizontal ✓
- DC-082/083: ficha foto recentrada + tabs scroll horizontal en mobile ✓
- DC-084/085: grids 3→2→1, stepper compacto barra lineal ✓
- DC-086: calendario adaptado + odontograma arcadas apiladas ✓
- DC-088/089: touch ≥44px (sidebar item min-height 44, tss 44, etc.), ningún flujo solo-desktop ✓

**Estados de UI con placeholders (DC-100..119)** y **Feedback visual (DC-120..143)**
- empty/carga/error/éxito/muchos-datos presentes por pantalla (data-table maneja carga+vacío; dashboard/list con skeletons; register-payment con validación inline) ✓
- DC-120: skeletons con stagger (NO spinners) ✓
- DC-130..133: toasts éxito/error/info con roles aria; panel notificaciones leído/no-leído por item + filtro pills + íconos temáticos ✓
- DC-140: validación inline "Ingresá un monto mayor a cero" + `aria-invalid`/`aria-describedby` ✓
- DC-142: confirm-dialog destructivo "Restablecer datos" (copy producción) ✓
- DC-143: motion 150-250ms, `prefers-reduced-motion` respetado en tokens + componentes ✓

**BVC negativos (críticos)**
- BVC-001/002/003: Red Hat (no Inter), 4 azules, fondo `#fafafa`+texto `#2a2a35` ✓
- BVC-008/024: header SIN búsqueda global/command palette/atajos ✓
- BVC-009: ninguna tabla >5 col (verificado en las 5 tablas + ninguna tabla manual) ✓
- BVC-012/023: ningún modal >50%, ningún drawer como contenido principal (drawer = solo nav mobile) ✓
- BVC-013: contenido de tab inactivo NO en DOM (router-outlet hijo) ✓
- BVC-018: sin emojis, sin gradientes saturados, sin sombras pesadas ✓
- BVC-026: sin infinite scroll (paginación offset) ✓
- **BVC-027: barrido completo de src/ → CERO lenguaje demo/mock visible** (footer producción, sin "Resetear demo", "@placeholder" es sintaxis `@defer`, comentarios "mock interno" describen ausencia de fiscal) ✓
- **DC-047: sin ARCA/AFIP** (solo comentarios que documentan la ausencia) ✓
- **Cero analytics/tracking/CRM** en todo src/ (hits de "tracking" = `letter-spacing` CSS) ✓
- **Ningún `#0d6efd`** emitido (solo comentarios documentando su ausencia deliberada) ✓

---

### Criterios SIN Cobertura ✗

**GAP-1 (DC-027 / BVC-014) — Íconos referenciados pero NO definidos en el set Phosphor**
`src/app/shared/components/icon.component.ts` resuelve nombres desconocidos al fallback `PHOSPHOR_PATHS['question']` (círculo con "?"). Dos nombres se usan en componentes de la cáscara pero no existen en el `RAW` del set:

1. **`currency-circle-dollar`** — usado en 3 componentes reales de la cáscara:
   - `src/app/features/patients/plan-detail.component.ts:54` (icon-chip de costo)
   - `src/app/features/treatments/treatment-type-detail.component.ts:45` (chip "Costo de referencia")
   - `src/app/features/patients/tabs/tab-payments.component.ts:45` (ícono de movimiento "pago")
   → Render visible de "?" en contextos de costo/pago. **Incumple DC-027** (set único Phosphor con glifo intencionado) y degrada DC-044/061/062.

2. **`sparkle`** — usado en `src/app/core/data/placeholder.data.ts` (tt-02 Limpieza, tt-09 Blanqueamiento, ev-003 Profilaxis), que alimenta `treatment-type-card` (DC-062) y el timeline de Historial (`event-block`, DC-075).
   → Render visible de "?" en esas cards/eventos.

**Resolución sugerida (UI Developer)**: agregar ambos glifos al set `RAW` de `icon.component.ts` con el path data oficial de Phosphor (regular), o reasignar a un glifo ya existente del set (ej. `money`/`wallet` para costo/pago; `tooth`/`first-aid-kit` para limpieza/profilaxis). No requiere cambios de arquitectura ni de otros archivos.

---

### Scope Creep (sin DC-xxx asociado)
Ninguno relevante. El set Phosphor incluye varios glifos definidos pero no usados aún (`briefcase`, `eye`, `tag`, `percent`, `chat-circle-dots`, `megaphone`, `pill`, `map-pin`, `minus`, `dots-three-vertical`, `clipboard-text`, `file-text`, `circle`) — es una librería de íconos previsora para el paso 4b, **no es scope creep bloqueante** (solo reportado).

---

### Resultado: FALLA (1 gap concreto: 2 íconos sin definir → glifo fallback "?" visible en costo/pago/limpieza)

> Nota: el gap es de **baja complejidad de corrección** (agregar 2 path-data al set o reasignar a glifos existentes) y NO afecta la arquitectura. Una vez resuelto por el UI Developer, la cáscara visual queda íntegramente conforme al checklist DC-xxx. Origen del gap: implementación del UI Developer (no hay defecto en design-criteria.md).
