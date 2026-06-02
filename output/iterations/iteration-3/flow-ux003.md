# Diagnóstico UX-003 — Flow Tester (Iteración 3)

**Test**: `UX-003: los items del sidebar navegan a sus rutas`
**Archivo**: `e2e/tests/flow/UX-001-018-navigation-routing.spec.ts`
**Sitio**: https://happy-coast-044ea7e0f.7.azurestaticapps.net (desplegado)
**Único fallo de la regresión de Iteración 3** (521 passed / 1 failed).

## Veredicto

**(a) Test FLAKY — comportamiento de la app CORRECTO.** UX-003 quedó **PASA estable** en ambos projects tras estabilizar SOLO el test. **NO es bug real.** No hay nada para el Developer.

La hipótesis del brief (matchMedia / `effectiveView` del nuevo Agenda confunde al test) **queda descartada**: el fallo NO ocurre en el paso de Agenda ni con ningún componente de Agenda montado.

## Qué espera el test en `/agenda`

UX-003 itera 7 items del sidebar (Agenda, Pacientes, Tratamientos, Facturación, Reportes, Configuración, Ayuda). En desktop encadena los 7 clicks en una sola sesión. Para cada item solo hace `click` + `expect(page).toHaveURL(re)`. **No verifica ningún selector del calendario** — para Agenda solo exige que la URL sea `/agenda$`. La sospecha de "un selector del calendario que cambió" no aplica a UX-003.

## Causa raíz (evidencia)

El fallo NO está en Agenda. La captura de accesibilidad del fallo (error-context) y los reruns muestran que la URL se queda clavada en **`/tratamientos`** mientras el test espera la siguiente (`/facturacion…` tras clickear "Facturación"):

```
Error: expect(page).toHaveURL(expected) failed
Expected pattern: /\/facturacion(\/presupuestos)?$/
Received string:  "https://happy-coast-044ea7e0f.7.azurestaticapps.net/tratamientos"
Timeout: 15000ms
```

En la captura del fallo la pantalla de **Tratamientos está renderizada por completo** y el sidebar muestra "Facturación" → `/url: /facturacion`. Es decir: **el click sobre "Facturación" se disparó pero no produjo navegación** ("click tragado").

Mecánica: cada ruta es **lazy + OnPush**. Cuando `toHaveURL(/tratamientos$/)` resuelve, Angular todavía está terminando el render/hidratación del chunk. El `.click()` inmediato sobre el link del sidebar (persistente, siempre "stable & visible" para Playwright, así que el auto-wait no protege) ocasionalmente cae en medio del ciclo del router/zone y el `routerLink` no dispara la navegación. La URL no cambia y el `toHaveURL` del siguiente paso expira a los 15s (de ahí los ~42s con retry en la regresión).

Es un **flake pre-existente de la navegación encadenada del sidebar** que afloró por azar en la regresión de Iteración 3; **no lo introdujo el refactor de Agenda**. El paso de Agenda (primero del loop) siempre pasó.

### Reproducción medida (test original, sin tocar)
- desktop-chromium: **falló ~1 de cada 6** corridas (RUN 5 de 5, RUN 8 de 8, RUN 6 de 10). Siempre en Tratamientos→Facturación, siempre clavado en `/tratamientos`.
- mobile-chromium: estable (cada item arranca desde `/reportes`, no encadena).

## Verificación manual en navegador real (desktop 1280×900, sitio desplegado)

Confirmado que la app se comporta bien — descarta leg (b):

1. **Sidebar → Agenda** (×3): navega a `/agenda` y renderiza la **vista MES** (grid de "Junio 2026", encabezados Lun–Dom, días 1–30 con bloques de turnos). El default desktop de `effectiveView()` = `mes` resuelve correctamente; el matchMedia NO rompe el render en desktop. Evidencia: `evidence/ux003-agenda-mes-desktop.png`.
2. **Cadena Agenda → Tratamientos → Facturación** con clicks deliberados: `/tratamientos` → `/facturacion/presupuestos` navega perfecto. La navegación Tratamientos→Facturación (el paso que flakea) funciona cuando el click aterriza. No hay cuelgue ni ruta rota.

## Fix aplicado (SOLO el test)

`navigateTo()` web-first y resiliente al "click tragado":
- **`expect.poll` que re-clickea** el link hasta que la URL cambia (timeout 15s). Un `toHaveURL` posterior solo reintenta el assert, nunca el click; el poll sí redispara el click si se tragó. Patrón idiomático para navegaciones SPA intermitentes.
- En mobile, el poll **reabre el drawer** (`openNav`) antes de reintentar (tras un click el drawer se cierra).
- Tras navegar, espera el `<h1>` del header (`bannerTitle`), que **solo cambia en `NavigationEnd`** (`header.component` `moduleTitle()`): confirma el commit del router y que el render del destino se asentó antes del siguiente item.

No se tocó código de app, ni otros tests, ni requirements/architecture/design.

## Confirmación de estabilidad (test estabilizado)

| Corrida | Project | Resultado |
|---|---|---|
| 14× individuales | desktop-chromium | **14/14 PASA** |
| 6× individuales | mobile-chromium | **6/6 PASA** |
| 3× combinadas (ambos projects) | desktop + mobile | **3/3 PASA** (2 passed c/u) |
| Archivo completo UX-001..018 (ambos projects) | desktop + mobile | **41/41 PASA** (sin romper hermanos) |

Las corridas lentas post-fix (26–32s) son justo los casos donde el click se tragó una vez y el poll lo recuperó: el retry hace su trabajo y convierte un fallo duro en verde.

## Resultados por Criterio

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| UX-003 | **PASA (estable)** | `evidence/ux003-agenda-mes-desktop.png`; 14/14 desktop + 6/6 mobile + 41/41 full-file |

## Bugs Encontrados

Ninguno. No es bug de la app. (El refactor de Agenda de Iteración 3 — week-view / agenda-list-view / matchMedia — no está implicado; desktop abre `/agenda` en vista Mes correctamente.)

## Tests Generados / Modificados

- `e2e/tests/flow/UX-001-018-navigation-routing.spec.ts` — estabilizado UX-003 (retry-click web-first + wait de `NavigationEnd` por `<h1>` del header). Cambio acotado a UX-003.
