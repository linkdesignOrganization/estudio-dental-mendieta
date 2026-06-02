# Resultados — Flow Tester (Construcción Visual · RONDA 2 · re-test mobile)

**URL probada:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (sitio DESPLEGADO)
**Projects:** `desktop-chromium` (1280×900) + `mobile-chromium` (Pixel 5, 393px)
**Alcance:** los 6 criterios que fallaron SOLO en mobile-chromium (timeout ~19s) en la regresión de la Ronda 1.

## Veredicto general
**Los 6 son CASO (a): el flujo SÍ funciona en mobile — eran tests desalineados con el layout mobile.** Ningún bug de producto. Adapté los `.spec.ts` (y el helper compartido) para que pasen en mobile **y** sigan pasando en desktop. **0 bugs para el Developer.**

Resultado de ejecución (`npx playwright test`, ambos projects):
- **Los 6 criterios: 12/12 PASA** (6 desktop + 6 mobile). Sin timeouts.
- **No-regresión (4 archivos completos tocados, ambos projects): 103 passed · 1 skipped · 0 failed** (el skipped es UX-018, que corre solo en mobile por diseño).
- UX-003 mobile re-ejecutado ×3 (repeat-each) → 3/3, sin flakiness.

## Causa raíz (común a los 6)
En mobile el shell cambia de layout (verificado en el deploy y en el código `app-shell.component.ts` / lista de pacientes):
1. **Sidebar = drawer off-canvas.** El `<nav "Navegación principal">` permanece en el DOM pero con `transform: translateX(-100%)` → queda en `x ≈ -314` (fuera del viewport de 393px). Playwright lo reporta `isVisible()=true` (por `display`/`opacity`), pero `.click()` en sus items NO es accionable y agota el timeout (~19s). **Hay que abrir el drawer con la hamburguesa ("Abrir menú de navegación") antes de clickear.**
2. **Lista de pacientes = dos árboles DOM sincronizados** con el mismo `aria-label="Ver ficha de <nombre>"`: una `<table class="dt__table">` (desktop) que en mobile está **`display:none`**, y un `<div class="dt__card">` (mobile). El `<span class="cell-person__name">` dentro de la tabla oculta tiene **caja 0×0** → `getByText(nombre)` y `getByText(badge).first()` caían en ese subtree oculto y nunca eran "visibles"/accionables. **Hay que apuntar a la fila/card VISIBLE** (`.filter({ visible: true })`).

## Resultados por Criterio
| Criterio | Estado (desktop / mobile) | Evidencia |
|----------|---------------------------|-----------|
| UX-003 — items del sidebar navegan a sus rutas | PASA / PASA (test adaptado) | `evidence-r2/UX-003-drawer-mobile-navega.gif` |
| UX-008 — fila de paciente → ficha → `/informacion` | PASA / PASA (test adaptado) | `evidence-r2/UX-008-mobile-ficha-informacion.png` |
| UX-015 — botón atrás de ficha a lista | PASA / PASA (test adaptado) | `evidence-r2/UX-015-mobile-atras-a-lista.png` |
| UX-027 — badge de estado de cuenta coherente tras pago | PASA / PASA (test adaptado + flujo de pago real) | `evidence-r2/UX-027-mobile-badge-con-deuda.png` |
| UX-067 — edge cases representados en el seed | PASA / PASA (test adaptado) | `evidence-r2/UX-067-mobile-seed-badges-variados.png` |
| UX-080 — buscador filtra en vivo por nombre | PASA / PASA (test adaptado) | `evidence-r2/UX-080-buscador-mobile-filtra.gif` |

### Detalle de la adaptación por criterio
- **UX-003**: abrir el drawer con `openNav()` antes de clickear cada item. En mobile se navega **cada item desde un estado limpio** (abrir drawer → elegir destino → el drawer se cierra por `NavigationEnd`) porque encadenar 7 navegaciones en una sola sesión es flaky por la animación de cierre/apertura del drawer (no por un fallo del flujo). En desktop `openNav()` es no-op y se encadena. Verificado: los 7 items navegan a `/agenda`, `/pacientes`, `/tratamientos`, `/facturacion/presupuestos`, `/reportes`, `/configuracion`, `/ayuda`.
- **UX-008 / UX-015**: se clickea la fila/card **visible** vía `openPatient()` (clic sobre el nombre dentro del contenedor visible; el nombre tiene caja real en la card mobile, no así en la tabla oculta).
- **UX-027**: además de adaptar el selector del badge a la **fila visible**, **enriquecí el test para ejercer el flujo real**: registra un pago PARCIAL de $10.000 sobre `pac-001` (Bautista Álvarez), verifica que el saldo baja exactamente y sigue > 0, y que el badge derivado se mantiene "Con deuda" en la lista. Ahora el test es fiel al criterio ("coherente con el saldo TRAS el pago").
- **UX-067**: los badges variados del seed (Con deuda / Al día / Vencido) se verifican con `.filter({ visible: true })`. La parte de `localStorage` (boca sana vs con tratamientos: 1 vs 28 de 29) ya era viewport-independiente.
- **UX-080**: el filtrado en vivo se verifica con el contador `1–1 de 1` (ya funcionaba en mobile) + la fila/card visible (`patientRow`) en vez del `<span>` de la tabla oculta. Se mantiene la verificación de que NO hay búsqueda global en el header.

## Bugs Encontrados
**Ninguno bloqueante. 0 bugs que requieran al Developer.** Los 6 criterios eran tests desalineados, no fallos de producto.

### Observaciones de calidad (NO bloqueantes — para consideración del Developer/Diseño, no afectan el veredicto PASA)
- **OBS-1 (a11y/robustez de la card de paciente en mobil):** la card mobile es un `<div class="dt__card" tabindex="0">` **sin `role`** y la navegación se dispara por keydown(Enter)/clic sobre el contenido; un `.click()` de mouse sobre el **padding** central de la card no navega (sí navega el `.tap()` táctil y el clic sobre la foto/nombre). El usuario táctil real navega sin problema (tap sobre la card funciona), por eso el criterio PASA. Mejora sugerida: dar `role="button"` (o envolver en `<a>`) a la card para que toda su superficie sea accionable y consistente con teclado/lector de pantalla.
- **OBS-2 (HTML inválido):** dentro de `.dt__card` (un `<div>`) hay un `<td class="cell cell--visual">` — celdas de tabla fuera de `<table>`. Render OK visualmente, pero es markup inválido; conviene usar elementos no-tabla para la variante card.
- **OBS-3 (cosmético):** en la ficha del paciente en mobile (`/pacientes/:id/informacion`) el avatar grande aparece recortado (solo se ve la parte superior). No afecta ningún flujo. Captura: `evidence-r2/UX-008-mobile-ficha-informacion.png`.

> Estas observaciones se appendaron también a `output/pending-feedback.md` para el Feedback Curator. No reabren ningún bug ni bloquean el gate de la Ronda 2.

## Tests Generados / Adaptados
Se adaptaron los `.spec.ts` existentes (regla de rol: NO se crean specs nuevos en re-QA; se actualizan los desalineados) + el helper compartido:
- `e2e/tests/_helpers/seed.ts` — **nuevos helpers** `openNav(page)` (abre el drawer en mobile, no-op en desktop), `patientRow(page, name)` (fila/card VISIBLE cross-viewport) y `openPatient(page, name)`.
- `e2e/tests/flow/UX-001-018-navigation-routing.spec.ts` — UX-003 (drawer + navegación por item), UX-008 y UX-015 (`openPatient`).
- `e2e/tests/flow/UX-020-032-critical-flows.spec.ts` — UX-027 (fila visible + flujo de pago real).
- `e2e/tests/flow/UX-060-067-seed.spec.ts` — UX-067 (badges `.filter({ visible: true })`).
- `e2e/tests/flow/UX-080-094-interactions-persistence.spec.ts` — UX-080 (`patientRow` + contador).

Los 6 quedan como gate de regresión en AMBOS projects para rondas futuras.

## GIFs de Flujos (obligatorios)
- `output/iterations/visual-build/evidence-r2/UX-003-drawer-mobile-navega.gif` — el drawer mobile abriéndose y navegando (Pacientes, Agenda).
- `output/iterations/visual-build/evidence-r2/UX-080-buscador-mobile-filtra.gif` — el buscador filtrando en vivo en mobile (muestra `1–1 de 1` con "Sosa").

## Screenshots de evidencia
- `evidence-r2/UX-008-mobile-ficha-informacion.png` · `evidence-r2/UX-015-mobile-atras-a-lista.png` · `evidence-r2/UX-027-mobile-badge-con-deuda.png` · `evidence-r2/UX-067-mobile-seed-badges-variados.png`
