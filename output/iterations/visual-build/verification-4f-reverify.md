# Re-Verificación Post-QA — Construcción Visual (paso 4f-reverify) · Modo NORMAL

> Re-verificación INDEPENDIENTE de cobertura tras el cierre de brecha que el `verification-4f.md`
> dejó abierto (FALLA por ~76 criterios "PASA" en prosa sin `.spec.ts` propio).
> Criterio del PM: **aprobar si todo criterio de la demo tiene test dedicado O verificación
> visual honesta documentada con evidencia + razón técnica** (no exigir aserciones falsas).
> Fuentes de verdad: `architecture.md` (DEMO-xxx), `design-criteria.md` (DC/BVC), `ux-criteria.md` (UX).
> Catálogo de tests: **24 `.spec.ts`** (21 previos + 3 nuevos), **234 bloques `test()`** (eran 163).
> Suite completa reportada: **480 passed / 0 failed** (exit 0).

## Método
- Lectura ÍNTEGRA del código de los 3 specs nuevos (no de la prosa de los reportes) para confirmar
  que las aserciones son reales (DOM/computed-style/RGB/navegación/persistencia), NO `expect(true).toBe(true)`.
- Grep de cada ID del set ~76 (§5a/§5b/§5c/§5d del 4f) contra el árbol real de `.spec.ts`.
- Para los IDs que siguen sin `.spec.ts`: verificación de **reachability en el código FUENTE de la app**
  (¿el estado es disparable por UI o es genuinamente inalcanzable?) + contraste con la documentación
  de no-automatizables (`visual-coverage-cierre.md`, `flow-coverage-cierre.md`).
- Verificación de `test.fixme`/`.only`/`.skip` estáticos en todo el árbol.
- Scope-creep inverso: IDs referenciados en los specs nuevos que no existan en los docs de verdad.

---

## 1. Los 3 `.spec.ts` nuevos — ASERCIONES REALES Y HONESTAS ✓

Leídos íntegros. **Ninguna aserción falsa**; todas verifican comportamiento/estilo computado real.

| Archivo | Bloques `test()` | Naturaleza de las aserciones (muestra) |
|---|---|---|
| `visual/DC-100-119-ui-states.spec.ts` | 13 | empty-states reales (heading + desc + glyph exactos, copy anti-demo), paginación offset "1–12 de 29/22" sin infinite-scroll, KPIs calculados navegables, charts legibles, sin imágenes rotas |
| `visual/DC-120-143-feedback.spec.ts` | 11 | toast éxito (computed-style: fondo blanco, borde verde `rgb(45,106,79)±14`, `role=status`, auto-dismiss), panel notificaciones (invariantes: 1 dot/no-leída, contador==no-leídas, dot `#246991`, filtro), stroke Phosphor efectivo 1.5px normalizado a viewBox, una primaria/pantalla, sin drawers, padding 24-32 |
| `flow/UX-multipaso-cierre.spec.ts` | 18 | cancelar turno (persiste tras `reload()`), crear paciente/presupuesto end-to-end con `readState()` (`length==base+1`), aprobar (no 2x), eliminar (conteo decrece), no-encontrado por entidad, charts sin crash |

**Total nuevo: 42 bloques `test()`** (24 visual + 18 flow). Reutilizan `playwright.config.ts` y `_helpers/seed.ts`;
solo se tocaron archivos de test (verificado).

## 2. Cierre del set ~76 del `verification-4f.md`

### 2a. §5a — Bloque DC-100..143 (gap PRINCIPAL): de 3 → 22 con `.spec.ts` ✓
**Automatizados con aserción dedicada (19 nuevos):** DC-100, 101, 105, 106, 108, 109, 110, 111, 113,
115, 116, 117, 118, 119, 120, 130, 131(token+source), 133, 141, 142 + DC-065. (DC-104/112/126 ya
estaban.)

**Quedan como verificación visual / source-verified — LEGÍTIMOS (reachability confirmada en fuente):**
- **DC-102 / DC-103** (empty agenda·día): la agenda está **anclada a Junio 2026 poblado** y sin month-nav → el empty no es alcanzable por UI. Source-verified; el camino real (lista con turnos) lo cubre Edge `UX-044`. **Documentado** en `visual-coverage-cierre.md` §3. ✓
- **DC-107 / DC-122** (skeleton de carga / `@defer`): estado **transitorio y no-determinista** (listas hidratan SÍNCRONAS desde localStorage; `@defer (on idle)` no determinista). El contrato "no spinner" SÍ está automatizado (DC-120/065/141). **Documentado** §3. ✓
- **DC-131** (toast de ERROR persistente): app **offline-first sin backend** → ninguna ruta dispara error de runtime. Confirmado en fuente: `toast.service.ts` define `error()` pero **ningún flujo lo invoca por una falla de carga**. El componente toast se ejercita vía la variante éxito (DC-130). **Documentado** §3. ✓
- **DC-143** (hover/motion 150-250ms): tokens automatizados en `DC-001-029`; el hover percibido es juicio visual. **Documentado** §3. ✓

### 2b. §5c — UX multi-paso (9): TODOS con `.spec.ts` dedicado ✓
`UX-023, 024, 025, 029, 030, 033, 040, 042, 053` → cada uno con grep-hit en `flow/UX-multipaso-cierre.spec.ts`.
9/9 cubiertos, 0 bloqueados. Las facetas no alcanzables (UX-040 aspecto-skeleton transitorio; UX-042 toast-error
offline-first; UX-053 chart-empty no disparable con seed) están **documentadas con razón técnica** en
`flow-coverage-cierre.md` §"alcance acotado", y la **parte alcanzable y de mayor valor SÍ se asserta** (cancelación
real, persistencia con `readState()`, no-encontrado por entidad, charts con datos). ✓

### 2c. §5d — BVC (8): 5 automatizados + 3 verificación visual honesta ✓
- **Automatizados (objetivables):** BVC-010 (1 primaria/pantalla), BVC-014 (stroke efectivo 1.5px), BVC-016
  (no-spinner + toast), BVC-023 (sin drawers de contenido), BVC-028 (padding 24-32 medido).
- **BVC-015** → cubierto por DC-021 (disabled), correcto.
- **BVC-019 / BVC-029 (+ faceta subjetiva de BVC-028)** → percepción global pura ("parecido de familia Task
  Dasher", "calma profesional"). **Verificación visual documentada con SCREENSHOT y veredicto razonado** en
  `visual-coverage-cierre.md` §4b (`BVC-019-029-ficha-firma-desktop.png`, `BVC-028-029-reportes-aire-desktop.png`).
  Sus componentes medibles (sombra/radius/paleta/tipografía/padding/badges) YA están bajo aserción en DC-001-029 y
  DC-050-077. **Aceptado** — un `expect` que "verifique" calma sería deshonesto. ✓

### 2d. §5b — DC intermedios "en rango": NO eran el gap principal
El propio `verification-4f.md` §4 ya los reconoció como **cubiertos por título de rango** (DC-030..049 /
050..077 / 080..089) con `expect` de muestra, y varios con screenshot en `visual-results.md`. El 4f NUNCA
los marcó como FALLA individual. No requieren cierre adicional. (Sin cambio de veredicto.)

## 3. Reachability de los 4 DC sin `.spec.ts` NO listados explícitamente en el cierre

Detecté 4 IDs del bloque que el cierre no nombró en su tabla de no-automatizables. **Verifiqué su
reachability en el código FUENTE** — los 4 son genuinamente no-testeables-con-aserción-honesta o están
cubiertos transitivamente; NINGUNO es un criterio testeable saltado:

| ID | Criterio | Hallazgo en fuente | Veredicto |
|---|---|---|---|
| **DC-114** | Catálogo de tipos · grid (N/A vacío, ≥12 fijos) | Ruta `/tratamientos/tipos` navegada y aserrada en `UX-011` ("Catálogo de tipos" → `/tratamientos/tipos/tt-NN`). Estado éxito ejercitado transitivamente. | Cubierto (transitivo) ✓ |
| **DC-121** | Botón submit en `loading` con label "Guardando…/Confirmando…" | Label es **estático** en fuente (`{{ isEdit() ? 'Guardar cambios' : 'Crear paciente' }}`); el submit es **síncrono** (sin estado loading observable). El "no spinner pesado" SÍ se asserta (DC-141). | No alcanzable; cubierto por DC-141 ✓ |
| **DC-132** | Toast INFO azul (`#e2eef6`) | `toast.service.ts` define `info()` pero **ningún flujo lo invoca**; solo `success()`/`error()` se disparan. Token `--color-info-bg #e2eef6` aserrado en DC-001-029. Mismo caso que DC-131. | No alcanzable; token aserrado ✓ |
| **DC-140** | Validación inline post-blur (mensaje junto al campo, `aria-invalid`) | `DC-112` spec **documenta** que el mensaje inline "NUNCA llega a mostrarse" porque el guard deshabilita el botón (`[disabled]="!isValid()"`). Infra `aria-invalid` presente en los 4 forms. | No alcanzable (guard); documentado en DC-112 ✓ |

> **OBSERVACIÓN (defecto de documentación, NO bloqueante):** DC-121 y DC-132 (y, menor, DC-114) deberían
> haber aparecido en la tabla de no-automatizables de `visual-coverage-cierre.md` con su razón técnica
> ("label de submit estático/síncrono" y "toast.info() definido pero no disparado offline-first"). Su
> ausencia es una **omisión de documentación, no de cobertura**: el código fuente confirma que NO son
> alcanzables por UI. Recomendación: añadirlos a §3 del cierre. Apéndase a `pending-feedback.md` para el
> Visual Checker. **No cambia el veredicto** — ningún criterio testeable quedó sin test.

## 4. fixme / only / skip — sin gates de bug pendientes ✓
- `test.fixme`: **0** · `test.only`: **0** en todo el árbol.
- Los 6 `test.skip` son **runtime-condicionales** (guards de seed/viewport dentro del cuerpo del test:
  `skip(!terminal)`, `skip(!activo)`, `skip(!ev)`, `skip(project!=='mobile-chromium')`), NO gates de bug
  estáticos. Los 3 specs nuevos tienen **0** `.only`/`.fixme`/`.skip`. ✓

## 5. Scope Creep
- **Cero.** Todos los IDs (DC/UX/BVC) referenciados en los 3 specs nuevos existen en `design-criteria.md`/
  `ux-criteria.md` (comparación inversa spec→catálogo dio 0 huérfanos).

## 6. Nota sobre F01 / F02 (severidad baja — fuera de alcance de la demo)
- **F01 (UX-025, "Cancelar + descarte" en /editar)** y **F02 (UX-029, "Atrás" no repuebla el `<select>`
  de paciente)** son detalles de flujos que se **completan en FASE 5** (editar paciente = iteración 4;
  presupuestos = iteración 5). **NO son criterios de la demo visual.** Los tests asertan el comportamiento
  **REAL actual** (precarga + guardar persiste; tratamientos preservados) y **pasan**, sin afirmar una
  preservación que la demo no hace (honestidad correcta). No bloquean. ✓

---

## Síntesis

| Verificación pedida por el PM | Resultado |
|---|---|
| 1. Criterios automatizables ahora con `.spec.ts` dedicado | **CUMPLIDO** ✓ — 22 DC/BVC (Visual) + 9 UX (Flow), aserciones reales |
| 2. No-automatizables = verificación visual honesta (evidencia + razón técnica), no excusa | **CUMPLIDO** ✓ — ~11 criterios (skeleton transitorio, empties anclados al seed, error/info-toast offline-first, hover/motion, BVC subjetivos) con screenshot + reachability confirmada en fuente |
| 3. NINGÚN criterio de demo sin forma de verificación (ni test ni visual documentada) | **CUMPLIDO** ✓ — set ~76 cerrado; los 4 no-listados (DC-114/121/132/140) verificados en fuente como inalcanzables/transitivos |
| fixme/only/skip de bug | 0 ✓ · skips son seed/viewport-condicionales |
| Scope creep | 0 ✓ |
| Defecto de documentación (DC-121/132 ausentes del cierre) | Observación NO bloqueante → feedback al Visual Checker |

### Resultado: PASA

Todo criterio de la demo tiene **test automatizado dedicado** O **verificación visual honesta documentada
con evidencia y razón técnica confirmada en el código fuente**. El gap de la regla #1 que dejó FALLA el
`verification-4f.md` quedó cerrado sin introducir ninguna aserción falsa. La única salvedad es una omisión
de documentación menor (DC-121/132 no listados en la tabla de no-automatizables del cierre), no bloqueante,
canalizada como feedback al Visual Checker.
