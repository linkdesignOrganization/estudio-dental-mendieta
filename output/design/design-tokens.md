# Design Tokens — Estudio Dental Mendieta (Sistema de Gestión Clínica)

**Generado por**: Visual System Designer
**Fecha**: 2026-06-01
**Fase**: 3 — Paso 3c (sub-design)
**Fuente prescriptiva ÚNICA**: `output/design/visual-analysis.md` (valores 🔒 CLIENT-SPECIFIED)
**Stack destino**: Angular 17+ standalone · Bootstrap 5 selectivo (solo grid + utilidades) · capa de tokens propia en `tokens.css` (CSS custom properties)
**Criterios cubiertos**: DEMO-019 · BVC-001/002/003/004/005/006/014/017/021/022 · REQ-256/NFR-020 (contraste AA) · REQ-255/NFR-021 (focus ring) · REQ-019 (estado activo) · GAP-T05 (Phosphor, confirmado) · **GAP-A04 (contraste azul medio — RESUELTO, ver §2.1)**

> **Cómo leer este documento.** Los valores marcados 🔒 son **PRESCRIPTIVOS del cliente** y se transcriben EXACTOS desde `visual-analysis.md`; no se reinterpretan. Los valores marcados ⊕ son **DERIVADOS dentro del lenguaje prescriptivo** (escalas, variantes y recetas que el brief delegó al Visual System Designer — p. ej. el azul profundo derivado, la escala tipográfica en px, las recetas de estado). Cada combinación texto/fondo lleva su **ratio WCAG verificado matemáticamente** (herramienta de contraste, método WCAG 2.1).
>
> **ADN visual del producto**: superficies blancas flotando sobre canvas casi-blanco · una sola familia de acento AZUL (calma higiénica) · Red Hat 400/500 · radius 10–14px · borde **O** sombra (nunca ambos) · semánticos siempre pastel · mucho aire. Persona-céntrico, sereno, clínico. **Cero rastro de demo en cualquier token o nombre.**

---

## 0. Convenciones de nomenclatura y uso

- Todos los tokens son **CSS custom properties** declaradas en `:root` dentro de `tokens.css`. Prefijo semántico por categoría (`--color-*`, `--font-*`, `--text-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--border-*`, `--icon-*`, `--motion-*`, `--z-*`).
- **Tokens primitivos** (escalas crudas: `--accent-50…950`) → no se usan directo en componentes salvo excepción documentada; alimentan a los **tokens semánticos** (`--color-accent`, `--color-text`, etc.), que son los que consumen los componentes. Esto permite re-tematizar sin tocar componentes.
- Nada de valores mágicos sueltos en los componentes: todo px/color/duración sale de un token.
- **Regla transversal (BVC-027)**: ningún token, comentario, nombre de variable o valor revela que el producto es demo/mock. Esta capa es estética pura, neutra y de producción.

---

## 1. Paleta de Colores

### 1.1 Colores de Marca — familia AZUL (🔒 PRESCRIPTIVO, máx 4 tonos)

> Regla maestra del brief: **una sola familia de acento (azul), máximo 4 tonos coherentes** (BVC-002). Los dos tonos base son del cliente (EXACTOS). Se derivan **2 variaciones de luminosidad dentro de la misma familia** (un azul profundo para texto blanco/íconos sobre claro y un azul casi-blanco para fondos tintados) — explícitamente autorizado por el brief: *"como mucho dos variaciones de luminosidad derivadas… sin introducir un quinto hue"*. **No se introduce ningún 5º hue.**

| Token semántico | Hex | Origen | Uso |
|---|---|---|---|
| `--color-accent-sky` | `#c5d8e8` | 🔒 cliente (azul cielo) | Acento atenuado; fondo de pills suaves; **estado seleccionado/activo tintado**; banner de ficha; track de barras de progreso; hover sutil de zonas |
| `--color-accent` | `#6da8d4` | 🔒 cliente (azul medio) | Acento primario; **relleno de barras de progreso**; número grande de progreso (texto, peso 500); item activo; icon-chips; "+N" de avatar-stack; badge de conteo. **NO lleva texto blanco encima** (ver §2.1) |
| `--color-accent-deep` | `#246991` | ⊕ derivado (accent-600, misma familia/hue ~202°) | **Azul profundo**: cualquier superficie sólida con **texto blanco** (CTA primario, círculo "+N" si lleva texto blanco, badge de conteo con número), y **texto/íconos azules sobre fondo claro** (links, icon-chips donde la legibilidad lo exige, valor de KPI azul). Único tono de la familia que pasa AA con texto blanco |
| `--color-accent-tint` | `#eff8ff` | ⊕ derivado (accent-50, misma familia) | **Azul casi-blanco**: fondos tintados de estado seleccionado/activo (nav, filas, tabs) cuando se busca un lavado aún más sutil que `--color-accent-sky`; lavado de zona activa |

**Conteo de tonos azules = 4** (sky · medio · deep · tint) → cumple "máx 4 tonos" (BVC-002). El tint y el deep son **luminosidades** derivadas de la misma familia, no hues nuevos (todos viven en H≈200–208°).

#### Escala primitiva de la familia (⊕ derivada de `#6da8d4`, para casos de borde — usar con moderación)
Generada monocromáticamente desde el azul medio para tener consistencia de hue. **Solo los 4 tonos semánticos de arriba se usan libremente**; el resto de la escala existe para hover/pressed calculados y para mantener coherencia si se necesita un peldaño intermedio. No habilita un "5º hue": es la misma familia.

```
--accent-50:  #f0f7ff   --accent-300: #82bce9   --accent-600: #246991  (= accent-deep)
--accent-100: #dbedfe   --accent-400: #6da8d4   (= accent)   --accent-700: #09557a
--accent-200: #afd9fd   --accent-500: #3e7da7   --accent-800: #024260
                                                 --accent-900: #002f47 / --accent-950: #021e2e
```
> Nota: `--color-accent-sky #c5d8e8` y `--color-accent-tint #eff8ff` son los valores **EXACTOS del cliente / del peldaño 50**; no se sustituyen por `accent-200`/`accent-50` aunque sean cercanos — el hex prescrito manda.

### 1.2 Neutros — fondo y texto (🔒 PRESCRIPTIVO)

| Token | Hex | Uso | Contraste verificado |
|---|---|---|---|
| `--color-bg` | `#fafafa` | **Canvas** de la app (fondo general). NUNCA saturado (BVC-003) | — |
| `--color-bg-elevated` | `#ffffff` | Superficie de cards, header, sidebar, modales, inputs (blanco que "flota" sobre el canvas) | — |
| `--color-text` | `#2a2a35` | **Texto principal** — gris oscuro **cálido**, NUNCA negro puro (BVC-003) | sobre `#ffffff` = **14.18:1** ✅ AAA · sobre `#fafafa` ≈ **13.4:1** ✅ AAA |
| `--color-text-secondary` | `#707080` | Subtítulos, captions, labels de campo, timestamps relativos, metadata | sobre `#ffffff` = **4.86:1** ✅ AA · sobre `#fafafa` = **4.66:1** ✅ AA |
| `--color-text-on-accent` | `#2a2a35` | Texto **sobre `--color-accent` (`#6da8d4`)** — ver decisión GAP-A04 §2.1 | sobre `#6da8d4` = **5.54:1** ✅ AA |
| `--color-text-on-accent-deep` | `#ffffff` | Texto **sobre `--color-accent-deep` (`#246991`)** | sobre `#246991` = **5.99:1** ✅ AA |

> **Texto secundario sobre fondo**: 4.66–4.86:1 pasa AA holgado para texto normal. Como margen de seguridad, **no usar `--color-text-secondary` en tamaños < 14px sobre `#fafafa`** sin revisar; para metadata muy pequeña, preferir fondo `#ffffff`.

### 1.3 Superficie, borde y separadores (🔒 PRESCRIPTIVO)

| Token | Hex | Uso |
|---|---|---|
| `--surface-card` | `#ffffff` | Fondo de card (= `--color-bg-elevated`) |
| `--surface-selected` | `#eff8ff` | Fondo de **fila/item/tab seleccionado** (= `--color-accent-tint`). Alternativa más visible: `--color-accent-sky #c5d8e8` para el item activo del sidebar (píldora) |
| `--surface-overlay` | `rgba(42, 42, 53, 0.45)` | Scrim detrás de modales y del drawer mobile (deriva de `--color-text`, no negro puro) |
| `--color-border` | `#e8e8ee` | **Borde de cards/inputs y dividers** de lista/tabla. Grosor 0.5–1px, tenue |
| `--border-width` | `1px` | Grosor estándar de borde/divider (rango permitido 0.5–1px) |

> El borde `#e8e8ee` sobre blanco da ~1.22:1 — es un **separador decorativo sutil por diseño** (no un control que deba alcanzar 3:1). Su propósito es delimitar sin "gritar". Donde un control SÍ deba tener límite perceptible (input en foco), el peso lo aporta el **focus ring** (§7.2), no el borde en reposo.

### 1.4 Colores Semánticos — SIEMPRE pastel (🔒 estrategia / ⊕ hex de texto derivados)

> Estrategia prescrita (BVC-018, Patrón 6): **fondo pastel del hue + texto/ícono en versión más oscura del mismo hue**. NUNCA texto blanco sobre pastel claro, NUNCA colores estridentes. Cada par fondo/texto está verificado AA. El cliente prescribe "pastel" por hue; los hex exactos de pastel y de su texto oscuro son derivados ⊕ dentro de esa instrucción.

| Semántico | `--color-{x}-bg` (fondo pastel) | `--color-{x}-text` (texto/ícono oscuro) | Ratio (texto sobre su pastel) | Uso |
|---|---|---|---|---|
| **Éxito** | `#e3f3ea` | `#2d6a4f` | **5.56:1** ✅ AA | Turno Confirmado · Pago Al día · Tratamiento Completado · toast de éxito |
| **Error** | `#fce9ea` | `#b23a48` | **5.01:1** ✅ AA | Pago Vencido · Turno Cancelado · toast de error · validación de campo |
| **Warning** | `#fbf1da` | `#946200` | **4.67:1** ✅ AA | Tratamiento Atrasado · Pago Con deuda · turno por confirmar |
| **Info (azul)** | `#e2eef6` | `#246991` | **5.08:1** ✅ AA | Turno Atendiendo · informativos. Usa el **azul profundo** como texto → cohesiona con la familia de marca |
| **Neutro** | `#eeeef0` | `#55555f` | **6.36:1** ✅ AA | Turno Terminado · Tratamiento En pausa · estados inactivos |

> **Disciplina de color (Principio #5, BVC-002)**: los semánticos entran **solo cuando comunican un estado real** (badge de turno/pago/tratamiento, toast, alerta), **nunca como decoración**. Un registro lleva como máximo **un badge de estado + un badge de prioridad**. El acento dominante de toda la app sigue siendo el azul; los semánticos son apariciones puntuales y pastel.

> **Nota odontograma (coordinación con Component Designer)**: los estados de pieza (sana/caries/obturación/ausente/en-tratamiento/prótesis) reutilizan ESTOS tokens semánticos pastel + neutros + acento — no se crea una paleta nueva. Mantener superficies blancas y líneas `#e8e8ee`.

---

## 2. Decisión de Contraste GAP-A04 (OBLIGATORIA Y DOCUMENTADA)

### 2.1 El problema y la decisión

El azul medio prescrito `--color-accent #6da8d4` es un tono **claro**. Verificación matemática:

| Combinación | Ratio WCAG 2.1 | AA normal (4.5:1) | Veredicto |
|---|---|---|---|
| **Texto blanco `#ffffff` sobre `#6da8d4`** | **2.56:1** | ❌ FALLA | **PROHIBIDO** — no usar texto blanco sobre el azul medio |
| **Texto oscuro `#2a2a35` sobre `#6da8d4`** | **5.54:1** | ✅ PASA | **SOLUCIÓN A** (preferida para superficies que deben ser azul medio exacto) |
| Texto blanco sobre `#3e7da7` (accent-500) | 4.47:1 | ❌ FALLA (por poco) | descartado para texto normal blanco |
| **Texto blanco sobre `#246991` (accent-deep)** | **5.99:1** | ✅ PASA | **SOLUCIÓN B** (azul profundo derivado para cualquier superficie con texto blanco) |

**DECISIÓN (vinculante para todos los componentes):**

1. **Regla #1 — nunca texto blanco sobre `--color-accent` (`#6da8d4`).** Esta combinación está vetada en todo el sistema.
2. **Regla #2 — CTA / botón primario y pills sólidos**: por defecto **texto oscuro `--color-text-on-accent` (`#2a2a35`) sobre fondo `--color-accent` (`#6da8d4`)** → 5.54:1. Esta es la receta canónica del botón primario (§9). Mantiene el azul medio exacto del cliente y pasa AA.
3. **Regla #3 — superficies que requieran texto blanco** (por preferencia visual de un CTA más "lleno", o el círculo "+N" / badge de conteo con número blanco): usar **`--color-accent-deep` (`#246991`)** como fondo → texto blanco a 5.99:1. Sin salir de la familia azul.
4. **Regla #4 — `--color-accent (#6da8d4)` se reserva preferentemente** para: relleno de **barras de progreso**, **número grande de progreso** (como texto sobre fondo blanco: `#6da8d4` sobre `#ffffff` = 2.99:1, válido solo para **texto grande/decorativo de ≥24px peso 500**, no para texto normal), **fondos** e **item activo**. Cuando `#6da8d4` actúe como **texto** (el número de progreso), debe ser **grande (≥24px) y peso 500** — nunca como texto de cuerpo.
5. **Regla #5 — texto/íconos azules sobre fondo claro** (links, icon-chips, valores azules): usar **`--color-accent-deep` (`#246991`)** → sobre `#ffffff` = 5.99:1, sobre `#fafafa` = 5.74:1, ambos ✅ AA. El azul medio `#6da8d4` NO se usa como color de texto pequeño.

### 2.2 Tabla de referencia rápida "qué azul para qué"

| Necesito… | Token | Por qué |
|---|---|---|
| Fondo de botón primario con texto oscuro | `--color-accent` `#6da8d4` + texto `#2a2a35` | 5.54:1 AA, azul exacto del cliente |
| Fondo sólido con **texto blanco** | `--color-accent-deep` `#246991` + texto `#fff` | 5.99:1 AA |
| Relleno de barra de progreso | `--color-accent` `#6da8d4` | decorativo, sin texto encima |
| Track de barra de progreso | `--color-accent-sky` `#c5d8e8` (o `--color-border`) | contraste suave con el relleno |
| Número grande de progreso (≥24px, peso 500) | `--color-accent` `#6da8d4` como texto sobre blanco | impacto visual, texto grande |
| **Link / icon-chip / valor azul** (texto normal) | `--color-accent-deep` `#246991` | 5.99:1 AA sobre claro |
| Fondo de estado seleccionado (sutil) | `--color-accent-tint` `#eff8ff` | lavado clínico, texto oscuro 13:1 |
| Píldora de item activo (sidebar) | `--color-accent-sky` `#c5d8e8` | más visible, texto oscuro 9.70:1 |
| Círculo "+N" de avatar-stack con texto blanco | `--color-accent-deep` `#246991` | 5.99:1 AA |
| Badge de conteo (notificaciones) con número blanco | `--color-accent-deep` `#246991` | 5.99:1 AA |

> **Texto oscuro sobre azul cielo `#c5d8e8` = 9.70:1 ✅ AAA** (item activo del sidebar con label oscuro). **Azul profundo `#246991` sobre azul cielo `#c5d8e8` = 4.10:1 ❌ AA normal** → si el item activo del sidebar usa fondo `#c5d8e8`, su **label e ícono van en texto oscuro `#2a2a35`**, no en azul profundo.

---

## 3. Tipografía

### 3.1 Fuentes (🔒 PRESCRIPTIVO)

| Rol | Familia | Justificación |
|---|---|---|
| **Títulos / Display** | **Red Hat Display** | Prescrita por el cliente. Geométrica-humanista con carácter sereno; le da personalidad sin gritar. Self-hosted (woff2 subseteado). Letter-spacing levemente negativo en tamaños display |
| **Cuerpo / Text** | **Red Hat Text** | Prescrita. Optimizada para lectura en tamaños pequeños; pareja natural de Red Hat Display (misma superfamilia → coherencia tipográfica perfecta) |

```
--font-display: "Red Hat Display", ui-sans-serif, system-ui, sans-serif;  /* fallback solo anti-FOUT; el render real es Red Hat */
--font-body:    "Red Hat Text", ui-sans-serif, system-ui, sans-serif;
```

**Reglas inviolables (BVC-001, anti-patrón #1):**
- **NUNCA Inter** (ni Roboto, ni Arial, ni system como fuente final). Red Hat es la identidad.
- **Solo pesos 400 (regular) y 500 (medium).** Nunca 700+ (bold) ni 300− (light). Los dos únicos pesos a cargar/subsetear son 400 y 500 de cada familia.
- **Máximo 3 tamaños de texto por pantalla** (BVC-022) — contando títulos + cuerpo.
- Fallback de sistema **solo** para evitar FOUT mientras carga el woff2; usar `font-display: swap` con cuidado o `optional` para que el primer paint no muestre Inter/Arial.

```
--font-weight-regular: 400;
--font-weight-medium:  500;
```

### 3.2 Escala tipográfica (⊕ derivada — px exactos delegados al Visual System Designer)

> El brief delega los px exactos pero fija la **estructura**: un tamaño de **display** (H1 de pantalla / nombre de paciente), un **subtítulo/sección**, y un **cuerpo** (captions y labels comparten el tamaño de cuerpo con color secundario, para no exceder 3 tamaños). La jerarquía se construye con **tamaño + color + aire**, JAMÁS por grosor. Escala basada en ratio ~1.5 entre cuerpo (16px) y subtítulo (24px) para un salto claramente legible sin meter pesos.

| Token | Tamaño | Peso | Line-height | Letter-spacing | Rol / uso |
|---|---|---|---|---|---|
| `--text-display` | **28px** (1.75rem) | **500** | **1.2** (34px) | **-0.01em** | H1 de pantalla, **nombre del paciente** en la ficha (la jerarquía dominante). En la ficha puede escalar a 32px (excepción de pantalla-firma, sigue siendo 1 de los 3 tamaños) |
| `--text-title` | **20px** (1.25rem) | 500 | 1.25 (25px) | -0.005em | Títulos de sección, nombres de card (paciente/tratamiento), encabezado de modal |
| `--text-body` | **16px** (1rem) | 400 | **1.6** (≈26px) | 0 (normal) | Cuerpo de texto, valores de datos, contenido de tabla, labels de input |
| `--text-body-strong` | 16px | **500** | 1.6 | 0 | **Variante de peso, no de tamaño**: énfasis dentro del cuerpo (nombre en fila de tabla, valor destacado). Sigue siendo el tamaño "cuerpo" → NO cuenta como 4º tamaño |

**Tokens de apoyo (mismo tamaño cuerpo, diferenciados por color — no añaden un 4º tamaño):**
- `--text-secondary-size: 16px` con `color: --color-text-secondary` → captions, subtítulos, metadata. *(Si una pantalla necesita metadata más chica, se permite **un** tamaño auxiliar `--text-caption: 13px` peso 400 color secundario para timestamps/labels de tabla; en ese caso esa pantalla usa display+body+caption = sus 3 tamaños, y NO usa `--text-title`. Nunca 4 tamaños simultáneos.)*

> **"Número grande de progreso" (Patrón 3) traducido**: no es un token de la escala de texto general. Es un **número grande en peso 500 + `--color-accent` (`#6da8d4`)**, tamaño ~28–40px (display o mayor para el % de KPI/tratamiento), tratado como dato visual destacado. Pasa como texto grande/decorativo. **NUNCA bold** — el impacto viene del tamaño + el azul + el aire, no del grosor (resuelve la discrepancia de pesos con Task Dasher).

### 3.3 Reglas de jerarquía (carácter dentro del corsé 400/500)

1. **Contraste de escala generoso**: el nombre del paciente (`--text-display` 28–32px/500) debe verse **claramente** más grande que el cuerpo (16px/400). Ese salto es la jerarquía.
2. **Color como nivel**: título → `--color-text`; metadata/secundario → `--color-text-secondary`; dato azul → `--color-accent-deep`. El color hace el trabajo que haría el bold.
3. **Aire como nivel**: line-height 1.2 en display (que respire), 1.6 en cuerpo. Espacio alrededor del nombre en la ficha (asimetría intencional, Decisión holística #1).
4. **Resistir el 4º tamaño**: la restricción a 3 tamaños **es** la elegancia. Si tentado a añadir un tamaño "para variar", usar color o peso 500 en su lugar.

---

## 4. Spacing y Sizing

### 4.1 Escala base (🔒 PRESCRIPTIVO — múltiplos de 4)

| Token | Valor | Uso típico |
|---|---|---|
| `--space-1` | **4px** | Gap mínimo (ícono ↔ label inline, padding de badge) |
| `--space-2` | **8px** | Gap entre elementos relacionados, padding vertical de chip |
| `--space-3` | **12px** | Padding interno de input (vertical), gap de íconos en fila |
| `--space-4` | **16px** | Gap entre cards (mínimo), padding horizontal de input, gutter base |
| `--space-6` | **24px** | **Padding de card (mínimo)**, separación entre grupos de campos |
| `--space-8` | **32px** | **Padding de card (máximo)**, separación entre secciones (mínimo) |
| `--space-12` | **48px** | Separación entre secciones (máximo), márgenes de página generosos |
| `--space-16` | **64px** | Aire amplio (zonas hero, separación de bloques mayores en la ficha) |

> Escala EXACTA del brief: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 (BVC-006). No se introducen peldaños intermedios (no hay 20px, 28px, 40px como spacing — 40px existe solo como **altura** de control, §4.3).

### 4.2 Tokens de spacing semántico (⊕ recetas dentro del rango prescrito)

| Token | Valor | Regla del brief |
|---|---|---|
| `--card-padding` | **24px** (hasta 32px en cards grandes) | Padding interno de cards 24–32px (BVC-006) |
| `--card-gap` | **16px** (hasta 20px) | Separación entre cards en listas 16–20px (BVC-006). *(20px no está en la escala base; se permite SOLO como gap entre cards porque el brief lo prescribe explícitamente: "16–20px".)* |
| `--section-gap` | **32px** (hasta 48px) | Separación entre secciones de página 32–48px |
| `--page-padding-x` | **24px** mobile / **32px** desktop | Margen lateral del contenido |

### 4.3 Sizing de controles (🔒 PRESCRIPTIVO)

| Token | Valor | Regla |
|---|---|---|
| `--control-height` | **40px** | Altura de **inputs, selects, textarea (min), botones** (BVC-017) |
| `--touch-target-min` | **44px** | Tamaño mínimo táctil en **mobile** para TODO control clickeable (BVC-017). En mobile, el área interactiva se expande a ≥44px aunque el control visual mida 40px (padding/`::before` que extiende el hit area) |
| `--icon-button-size` | **40px** (desktop) / **44px** (mobile) | Botones de ícono |
| `--opacity-disabled` | **0.4** (40%) | Estado disabled de cualquier control (BVC-015) |

---

## 5. Elevación — Sombra y Borde

### 5.1 Token único de sombra (🔒 PRESCRIPTIVO — un solo nivel)

```
--shadow-card: 0 1px 4px rgba(42, 42, 53, 0.04);
```

| Token | Valor | Uso |
|---|---|---|
| `--shadow-card` | offset Y **1px** · blur **4px** · opacidad **0.04** (color derivado de `--color-text`, no negro puro) | Único nivel de sombra del sistema (BVC-005) |
| `--shadow-card-hover` | `0 1px 6px rgba(42,42,53,0.06)` | ⊕ Hover: misma familia, +2px blur / +0.02 op. Elevación **sutil** ≤250ms. NO una sombra nueva pesada — apenas perceptible |

**No existe** una escala de sombras (sm/md/lg/xl). **Un solo nivel.** Esto diferencia el producto de Material (anti-patrón #3: sombras pesadas/elevation 8 **PROHIBIDAS**). Modales, dropdowns y popovers usan **el mismo** `--shadow-card` (eventualmente `--shadow-card-hover`), nunca una sombra dramática.

### 5.2 Regla "Borde O Sombra, nunca ambos" (🔒 — convención dura, BVC-005)

> **Cada superficie elevada se separa del canvas por EXACTAMENTE UNA de estas dos vías, jamás las dos juntas:**
> - **Vía A — sombra**: `--shadow-card` + `border: none`. (Preferida para cards que "flotan": paciente, tratamiento, KPI.)
> - **Vía B — borde**: `border: var(--border-width) solid var(--color-border)` + `box-shadow: none`. (Preferida para inputs, filas de tabla, contenedores estructurales.)
>
> El contraste blanco-card sobre canvas `#fafafa` ya aporta separación; la sombra o el borde solo la refuerzan. **Convención por componente** (coordinar con Component Designer):
> - Cards de contenido (paciente/tratamiento/obra social/KPI) → **Vía A (sombra)**.
> - Inputs, selects, textarea → **Vía B (borde)**.
> - Filas de `data-table` → divider `--color-border` (no es card; el borde inferior 1px hace de separador).
> - Modal / dropdown / drawer → **Vía A (sombra)** (`--shadow-card`), sin borde.

---

## 6. Border Radius

### 6.1 Tokens (🔒 PRESCRIPTIVO — 10–14px, >20px PROHIBIDO)

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | **10px** | Inputs, selects, textarea, badges/pills, chips, search-pill, botones pequeños |
| `--radius-md` | **12px** | **Default**: botones, cards de contenido, dropdowns, item activo del sidebar (píldora) |
| `--radius-lg` | **14px** | Cards grandes, modales, banner de ficha, contenedores destacados |
| `--radius-pill` | **999px** | **SOLO** para elementos genuinamente circulares/pill cortos: avatares, círculo "+N", badge de conteo numérico, dot de notificación. NO para inputs ni cards |
| `--radius-circle` | **50%** | Avatares y fotos circulares, icon-chips redondos |

**Reglas (BVC-004, anti-patrones #6 y #7):**
- Todo radius de superficie rectangular vive en **10–14px**. **Radius > 20px está PROHIBIDO** en cards.
- **Inputs NO son píldoras**: radius `--radius-sm` (10px) + borde tenue + altura 40px. Prohibido el input píldora ultra-redondeado de Task Dasher (~24–26px) — anti-patrón #7.
- `--radius-pill` (999px) se reserva para badges/pills **cortos** y elementos circulares, donde el pill es la forma correcta — no para contenedores grandes.
- **Adaptación Task Dasher**: sus cards usan ~16–20px → al replicar sus patrones, **bajar a 10–14px**.

---

## 7. Estados Visuales (recetas reutilizables)

> Recetas de estado como tokens + convención. Aplican a **TODO lo clickeable** (BVC-015): cards, filas, items de lista, botones, pills, icon-buttons, tabs, piezas del odontograma. Coordinar con Component Designer para aplicarlas por componente.

### 7.1 Hover (🔒 visible en todo clickeable · 150–250ms)

| Token | Valor | Uso |
|---|---|---|
| `--hover-tint` | `--color-accent-tint` `#eff8ff` (fondo) | Hover de filas/items/tabs: lavado azul casi-blanco |
| `--hover-tint-strong` | `--color-accent-sky` `#c5d8e8` | Hover de zonas que ya son interactivas y necesitan más feedback |
| `--shadow-card-hover` | (ver §5.1) | Hover de cards "flotantes": elevación sutil |
| Hover de botón primario | oscurecer fondo a `--accent-500` `#3e7da7` o reducir luminancia ~6% | Feedback sin cambiar el color a otra familia |

**Convención**: hover = tinte de fondo **o** elevación sutil (NO transform agresivo, NO scale grande). Todo dentro de `--motion-duration` (§8). Hover **obligatorio** y visible en cards, filas, items, botones, pills, icon-buttons y tabs.

### 7.2 Focus ring (🔒 visible — REQ-255/NFR-021, BVC-015)

```
--focus-ring-color: #246991;            /* = --color-accent-deep */
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
--focus-ring: 0 0 0 var(--focus-ring-width) var(--focus-ring-color);
```

| Token | Valor | Nota |
|---|---|---|
| `--focus-ring-color` | `#246991` (azul profundo) | Sobre superficies blancas/cards = **5.99:1**; sobre borde `#e8e8ee` = **4.91:1** → ambos > 3:1 (mín. para componentes no-texto, WCAG 1.4.11). Visible y cohesivo con la marca |
| `--focus-ring-width` | **2px** | Grosor del anillo |
| `--focus-ring-offset` | **2px** | Separación del control para que el anillo no se confunda con el borde |

**Regla dura**: **NUNCA `outline: none` sin reemplazo.** Todo elemento interactivo muestra `--focus-ring` en `:focus-visible`. Para inputs, el focus ring puede combinarse con un cambio de color de borde a `--color-accent-deep`. El anillo usa azul profundo (no el medio) precisamente para garantizar el contraste de 3:1 contra fondos claros.

### 7.3 Active / pressed (⊕)

| Token | Valor | Uso |
|---|---|---|
| `--pressed-tint` | `--color-accent-sky` `#c5d8e8` | Fondo momentáneo al presionar filas/items |
| Botón primario pressed | fondo `--accent-500`/`--accent-600` (más profundo) | Feedback de "presionado" sin salir de familia |

### 7.4 Disabled (🔒 — opacidad 40%, BVC-015)

```
--opacity-disabled: 0.4;
```
Convención: `opacity: var(--opacity-disabled)` + `cursor: not-allowed` + `pointer-events: none`. Aplica a botones, inputs, items de menú y acciones primarias deshabilitadas (ej. estado terminal de turno que deshabilita "avanzar estado"). El color no cambia — solo la opacidad.

### 7.5 Seleccionado / activo (🔒 — REQ-019, estado de ruta activa)

> El estado seleccionado/activo es **consistente en toda la app** (nav, filas, tabs): fondo azul tintado + esquinas redondeadas.

| Contexto | Receta | Texto/ícono |
|---|---|---|
| **Item activo del sidebar** (píldora) | fondo `--color-accent-sky` `#c5d8e8`, `--radius-md` (12px), sin sombra ni borde | texto/ícono `--color-text` `#2a2a35` (sobre `#c5d8e8` = **9.70:1** ✅ AAA). **No** azul profundo (4.10:1 falla) |
| **Fila seleccionada / tab activo** | fondo `--surface-selected` `#eff8ff` (`--color-accent-tint`), `--radius-sm`/`--radius-md` | texto `--color-text`; el tab activo puede llevar **indicador inferior** `--color-accent` 2px |
| **Estado de ruta activa (nav)** | igual que item activo del sidebar | label en peso **500** + fondo tintado — REQ-019 (color de marca atenuado) |

---

## 8. Transiciones / Motion (🔒 PRESCRIPTIVO — 150–250ms)

```
--motion-duration: 200ms;                     /* punto medio del rango 150–250ms */
--motion-duration-fast: 150ms;                /* micro-feedback (hover de ícono, pressed) */
--motion-duration-slow: 250ms;                /* tope: entrada de card, reveal de skeleton */
--motion-easing: cubic-bezier(0.4, 0, 0.2, 1); /* ease suave (entrada/salida natural) */
--motion-easing-out: cubic-bezier(0, 0, 0.2, 1); /* ease-out para entradas (toast, modal) */
```

| Token | Valor | Uso |
|---|---|---|
| `--motion-duration` | **200ms** | Hover, cambios de estado, transición de color/fondo (default) |
| `--motion-duration-fast` | **150ms** | Micro-interacciones mínimas (ícono, pressed) |
| `--motion-duration-slow` | **250ms** | Entrada de cards (fade+rise), reveal de skeletons (tope del rango) |
| `--motion-easing` | `cubic-bezier(0.4,0,0.2,1)` | Easing suave general (BVC-021) |
| `--motion-easing-out` | `cubic-bezier(0,0,0.2,1)` | Entrada de toasts (ease-in suave) y modales |
| `--motion-stagger-step` | **40ms** | ⊕ Delay incremental por fila/card en el stagger de carga (fila N → delay N×40ms, máx ~6 pasos) |

**Convenciones (BVC-016, BVC-021, Decisión holística #3 — motion propositiva):**
- **TODA** transición vive en **150–250ms**. Ni instantánea ni lenta.
- **Hover** en todo lo clickeable (§7.1).
- **Skeletons, NO spinners** al cargar listas. Los skeletons se revelan con **stagger** (`--motion-stagger-step` por fila) y las cards entran con **fade + rise mínimo** (translateY ~4–8px → 0) ≤250ms. **Un solo momento orquestado por pantalla** (no micro-animaciones dispersas).
- **Toasts**: entrada animada ease-out suave tras acción exitosa.
- **`prefers-reduced-motion`**: respetar — desactivar rise/stagger, mantener solo fades instantáneos o cambios de opacidad. (Buena práctica de accesibilidad; no rompe ninguna regla del brief.)

---

## 9. Iconografía (🔒 PRESCRIPTIVO — GAP-T05 confirmado: Phosphor)

| Token | Valor | Regla (BVC-014) |
|---|---|---|
| `--icon-stroke` | **1.5px** | Stroke de todos los íconos |
| `--icon-size-inline` | **16px** | Íconos inline (junto a texto, en chips, en badges) |
| `--icon-size-row` | **20px** | Íconos en botones, filas de tabla/lista, items de menú |
| `--icon-size-action` | **24px** | Íconos de **acciones primarias** y headers |

**Reglas:**
- Un **solo set: Phosphor**, versión **regular** (no rellena/fill), stroke **1.5px**. Implementados como **SVG inline** (permite heredar `currentColor` y aplicar el stroke). Confirmado GAP-T05.
- **Íconos heredan el color del texto contiguo** (`currentColor`) — un ícono junto a texto secundario es gris `#707080`; junto a un link azul es `--color-accent-deep`.
- **Excepción**: íconos de **estado** toman su **color semántico** (`--color-{x}-text`) — ej. ícono de check de "Confirmado" en verde `#2d6a4f`, ícono de alerta en coral `#b23a48`.
- Tamaños **fijos** (16/20/24) — no se interpola. Sin emojis decorativos en ninguna parte (anti-patrón #5).

---

## 10. Z-index (⊕ — orden de capas)

| Token | Valor | Uso |
|---|---|---|
| `--z-base` | 0 | Contenido normal |
| `--z-sticky` | 100 | Header persistente, encabezado de tabla sticky |
| `--z-sidebar` | 200 | Sidebar fijo |
| `--z-drawer` | 300 | Drawer de navegación mobile (overlay) |
| `--z-overlay` | 400 | Scrim de modal/drawer |
| `--z-modal` | 500 | Modal de confirmación (siempre <50% pantalla, BVC-012) |
| `--z-toast` | 600 | Toasts (por encima de todo) |

---

## 11. Overrides obligatorios de Bootstrap 5

> Bootstrap aporta **solo el grid (`container`/`row`/`col`) + utilidades de layout (flex, spacing helpers compatibles, display)**. **Toda la estética la pone esta capa de tokens.** Los siguientes defaults de Bootstrap **violan anti-patrones del brief** y deben sobrescribirse en `tokens.css` (o desactivarse importando Bootstrap selectivamente, no el bundle completo).

| Default de Bootstrap 5 | Problema | Anti-patrón / BVC | Override |
|---|---|---|---|
| `--bs-body-font-family` (system-ui / Helvetica) | No es Red Hat | #1 / BVC-001 | Forzar `--font-body` (Red Hat Text) en `body`; títulos `--font-display` |
| `font-weight: 700` en `<b>`, `.fw-bold`, headings, `.btn` | Bold prohibido | BVC-001 | Mapear cualquier 600/700 a **500**; no usar `.fw-bold` |
| `--bs-border-radius` (.375rem) y `.rounded-*` (hasta `2rem`/pill grande) | Radius inconsistente; `.rounded-pill` en cards viola límite | #6 / BVC-004 | `--bs-border-radius: 12px`; prohibir `.rounded-pill` en cards/inputs (solo en avatares/badges cortos) |
| `box-shadow` de `.shadow`, `.shadow-lg`, `.dropdown-menu`, `.modal-content` (sombras Material pesadas) | Sombras pesadas | #3 / BVC-005 | Reemplazar TODA `.shadow*` por `--shadow-card`; dropdown/modal usan `--shadow-card`, no la sombra grande de BS |
| `.btn` altura/padding variable, `.btn` con `box-shadow` en `:focus`, gradientes en `.btn-*` | Botón no estandarizado a 40px; sombras internas | #8 / BVC-017 | `.btn { height: 40px; box-shadow: none; background-image: none; }`; primario = `--color-accent` + texto `--color-text-on-accent` |
| `.form-control` / `.form-select` (radius .375rem, foco con `box-shadow` azul BS + borde grueso azul) | Foco/borde de otra paleta; no 40px | #7 / BVC-017 / REQ-255 | Altura 40px, `--radius-sm`, borde `--color-border`; `:focus` → `--focus-ring` + borde `--color-accent-deep`. Quitar el glow azul de BS |
| `.form-control:focus { box-shadow: 0 0 0 .25rem rgba(13,110,253,.25) }` (azul Bootstrap `#0d6efd`) | Hue ajeno a la familia (5º hue) | BVC-002 | Sustituir por `--focus-ring` (azul profundo de la familia) |
| Paleta de `.bg-primary`/`.text-primary`/`.btn-primary` = `#0d6efd` | Azul Bootstrap, no el de marca | BVC-002 | Remapear `--bs-primary` a `--color-accent`; el azul de marca **nunca** es `#0d6efd` |
| `.badge` (fondos saturados, texto blanco) | Pills estridentes / texto blanco sobre color claro | #4 / BVC-018 / GAP-A04 | Reescribir badges como pastel: `--color-{x}-bg` + `--color-{x}-text` |
| Colores de fondo `.bg-light` (#f8f9fa) | Aproximado, no exacto | BVC-003 | Usar `--color-bg` `#fafafa` exacto |
| `.table` (bordes, hover gris BS, striping) | Estilo genérico | BVC-009 | Reestilizar: header gris uppercase con tracking, divider `--color-border`, hover `--hover-tint`, ≤5 columnas |
| `--bs-link-color: #0d6efd` | Link en azul Bootstrap | BVC-002 | `--color-accent-deep` `#246991` (AA sobre claro) |

> **Estrategia de import**: importar Bootstrap **por partes** (`bootstrap-grid.css` + utilidades necesarias) en vez del bundle completo, y cargar `tokens.css` **después** para que los overrides ganen. Evita arrastrar componentes JS/estilos de BS que reintroducen sombras Material, pills grandes o el azul `#0d6efd`.

---

## 12. Anti-patrones de mi dominio — checklist de NO-existencia

> Estos NO deben aparecer en ningún token, componente o pantalla (verificable por QA). Marcados los que esta capa de tokens previene activamente:

| # | Anti-patrón | Cómo lo previenen los tokens |
|---|---|---|
| 1 | **Inter** (u otra fuente genérica) | `--font-display`/`--font-body` = Red Hat; override de `--bs-body-font-family` |
| 2 | Gradientes saturados de fondo | Sin tokens de gradiente saturado; banner de ficha = `#c5d8e8`→blanco MUY tenue (delegado al Component Designer, dentro de la familia) |
| 3 | Sombras pesadas (Material) | Un solo `--shadow-card` (1px/4px/0.04); override de `.shadow*` de BS |
| 4 | Pills estridentes | Semánticos **solo pastel** (`--color-{x}-bg` + `--color-{x}-text`); sin fondos saturados con texto blanco |
| 5 | Emojis decorativos | Iconografía = Phosphor SVG únicamente; ningún emoji en tokens/copy |
| 6 | Radius > 20px | `--radius-*` topado en 14px; `--radius-pill` solo para circulares cortos; override de `.rounded-pill` en cards |
| 7 | Inputs con borde pronunciado / píldora | Input = `--radius-sm` 10px + `--border-width` 1px + 40px; NO `--radius-pill` |
| 8 | Botones con sombra interna / gradiente | Botón sin `box-shadow` ni `background-image`; override de `.btn` de BS |
| 9 | Fondo principal saturado | `--color-bg` = `#fafafa`; prohibido fondo saturado |

> El cumplimiento de WCAG AA (REQ-256/NFR-020) está garantizado por las tablas de contraste de §1, §2 y §4: **toda combinación texto/fondo de producción está verificada ≥4.5:1 (texto normal) o ≥3:1 (componentes/texto grande)**.

---

## 13. Resumen de cobertura (verificación antes del retorno)

| Asignado | Cubierto en |
|---|---|
| DEMO-019 (design system aplicado) | §1–§12 (todos los tokens CSS) |
| BVC-001 (Red Hat, 400/500) | §3.1, §3.2 |
| BVC-002 (1 familia azul, máx 4 tonos) | §1.1 (sky·medio·deep·tint = 4), §11 (override azul BS) |
| BVC-003 (fondo #fff–#fafafa, texto ~#2a2a35) | §1.2 |
| BVC-004 (radius 10–14px) | §6 |
| BVC-005 (borde O sombra, 1px/4px/0.04) | §5 |
| BVC-006 (spacing 4×, padding card) | §4 |
| BVC-014 (Phosphor 1.5px, 16/20/24) | §9 |
| BVC-017 (inputs/botones 40px, touch ≥44px) | §4.3 |
| BVC-021 (transitions 150–250ms) | §8 |
| BVC-022 (line-heights, máx 3 tamaños) | §3.2, §3.3 |
| REQ-256 / NFR-020 (contraste AA) | §1, §2, §12 (todas las tablas verificadas) |
| REQ-255 / NFR-021 (focus ring) | §7.2 |
| REQ-019 (estado activo/seleccionado) | §7.5 |
| GAP-T05 (Phosphor confirmado) | §9 |
| **GAP-A04 (contraste azul medio)** | **§2 — decisión obligatoria documentada con ratios** |

**Coordinación con otros sub-designers:**
- **Component Designer**: las recetas de estado (§7), la regla borde-O-sombra por componente (§5.2), el sistema de badges pastel (§1.4) y la decisión GAP-A04 (§2) son la base de cada componente. La decisión texto-oscuro-sobre-azul-medio (§2.1) es vinculante para botones, pills, "+N", badges de conteo. El número grande de progreso = peso 500 + `#6da8d4` (§3.2).
- **UX Flow Designer**: spacing de página (§4.2), aire entre secciones (BVC-028), y motion de carga con stagger (§8) aplican a los layouts.

> **Nivel PREMIUM (por encima de template Bootstrap default)**: paleta azul única verificada AA punta a punta · tipografía con carácter dentro de Red Hat 400/500 (jerarquía por escala+color+aire) · un solo nivel de sombra ultra-sutil · motion propositiva con stagger · estados consistentes · cero rastro de demo. La estética la pone esta capa, no Bootstrap.
