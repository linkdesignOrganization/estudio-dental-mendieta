# Diagnóstico — UX-003 (Flow Tester) · Iteración 5

**Test:** `UX-003: los items del sidebar navegan a sus rutas`
**Archivo:** `e2e/tests/flow/UX-001-018-navigation-routing.spec.ts:67`
**Sitio testeado:** https://happy-coast-044ea7e0f.7.azurestaticapps.net (sitio desplegado)
**Síntoma en la regresión It5:** 709 passed / 1 failed — único fallo en `desktop-chromium`.

---

## Causa: FLAKY (carrera de commit del redirect), NO título cambiado

La hipótesis (a) "It5 cambió el `<h1>` de algún módulo y el test esperaba el título viejo"
queda **REFUTADA**. Recorrí en vivo, en DESKTOP, los 7 items del sidebar y anoté el
título real del banner (`<h1>` del header):

| Item sidebar | URL aterrizaje | `<h1>` banner (real) | Esperado por el test | ¿Coincide? |
|---|---|---|---|---|
| Agenda | `/agenda` | Agenda | Agenda | Sí |
| Pacientes | `/pacientes` | Pacientes | Pacientes | Sí |
| Tratamientos | `/tratamientos` | Tratamientos | Tratamientos | Sí |
| Facturación | `/facturacion/presupuestos` | **Facturación** | Facturación | Sí |
| Reportes | `/reportes` | Reportes | Reportes | Sí |
| Configuración | `/configuracion` | Configuración | Configuración | Sí |
| Ayuda | `/ayuda` | Ayuda | Ayuda | Sí |

Todos los `<h1>` coinciden con el valor esperado. El `<h1>` lo produce
`header.component → moduleTitle()`, cuyo mapa sigue devolviendo `'/facturacion' → 'Facturación'`
y `'/reportes' → 'Reportes'` (sin cambios desde la fase visual-build; `git log` del
componente no muestra commits en It5).

### Qué SÍ cambió It5 (y por qué confundía)
1. **`title:` por ruta** (resolver de `<title>` del documento). En `/facturacion/presupuestos`
   la **pestaña** del navegador ahora dice "Presupuestos" — pero ese `title` cambia solo el
   `document.title`, **NO el `<h1>` del banner**, que sigue siendo "Facturación".
   (Ref: `src/app/features/billing/billing.routes.ts` → `title: 'Presupuestos'`, etc.)
2. **Módulo Facturación más pesado**: presupuestos + facturas + obras sociales + alta de
   presupuesto → el chunk lazy creció.

### El fallo real (evidencia en el artefacto de la regresión)
`test-results/.../error-context.md` muestra que **lo que expiró NO fue la aserción de título**
(línea 109) sino el **`expect.poll(...).toBe(true)`** (línea 106): `Timeout 15000ms exceeded
while waiting on the predicate`. En el snapshot del fallo:
- el link **"Facturación" está `[active]`** con `/url: /facturacion` (el router YA arrancó la
  navegación), pero
- el banner `<h1>` aún dice **"Tratamientos"** y `<main>` sigue mostrando la tabla de
  Tratamientos.

Es decir: el item que falla es **Facturación**, y el modo de fallo es un **stall del commit
de la navegación de dos saltos** `/facturacion` → (redirect hijo) `/facturacion/presupuestos`
bajo carga. Concuerda con flakiness (falló 1 de 709; un título mal esperado fallaría el 100%
de las veces, determinista).

### Por qué el retry-click previo no recuperaba (la regresión lo destapó)
`/facturacion` es la **única** navegación con redirect hijo (`'' → presupuestos`). Bajo carga,
su ventana de commit se ensancha y la estabilización de It3 fallaba por dos motivos:
1. **Dedupe del router**: re-clickear el *mismo* `routerLink="/facturacion"` mientras el router
   ya está navegando a ese destino es deduplicado → el retry no relanza nada y el poll gira en
   vano hasta 15 s.
2. **Éxito prematuro del poll**: el `pathname` podía leer transitoriamente `/facturacion`
   (que la regex `/\/facturacion(\/presupuestos)?$/` acepta) ANTES de terminar el redirect +
   render; el poll daba "navegó" y el `.click()` del siguiente item caía en medio del ciclo y
   se tragaba.

---

## Fix aplicado (SOLO el test — `navigateTo` helper)

Sin tocar app/rutas/títulos. Cambios en el helper de UX-003:
- **El éxito del poll exige URL final Y `<h1>` con el título esperado** (helper `committed()`).
  El `<h1>` solo cambia en `NavigationEnd`, así que esto garantiza commit + render asentados y
  elimina el éxito prematuro en la ruta con redirect.
- **Más margen por intento** para el doble salto (`waitForURL` 2s→4s; además espera al `<h1>`
  destino dentro del intento) y **presupuesto total 15s→25s** con un intervalo extra (1200ms).
- Sigue **click-driven** (sin `page.goto` que enmascararía un click tragado).

El título esperado para Facturación se mantiene en **"Facturación"** (es el valor REAL; no se
cambió porque no cambió).

## Confirmación de estabilidad (≥3 corridas verdes, ambos projects)
Contra el sitio desplegado:
- `desktop-chromium`: 4/4 (dedicado, `--repeat-each 4`) + 2/2 (corrida combinada) = **6/6**
- `mobile-chromium`: 3/3 (dedicado, `--repeat-each 3`) + 2/2 (corrida combinada) = **5/5**
- **Total UX-003: 11/11 verdes** en ambos projects.
- Archivo completo `UX-001-018-navigation-routing.spec.ts` en desktop: **20 passed, 1 skipped**
  (UX-018 es mobile-only) — sin regresiones en tests hermanos.

## Resultado
| Criterio | Estado | Evidencia |
|---|---|---|
| UX-003 | **PASA (estable)** | 11/11 corridas verdes desktop+mobile; full-file 20✓/1 skip |

**Conclusión:** causa = **flaky** (carrera del commit del redirect de `/facturacion`,
agravada por el módulo más pesado de It5), **no** título cambiado. UX-003 queda **PASA estable**.
