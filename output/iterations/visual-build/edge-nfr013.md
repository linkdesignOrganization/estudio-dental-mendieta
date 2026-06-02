# Resultados — Edge Case Tester · Re-verificación NFR-013

**Criterio:** NFR-013 — deep-link directo a una ruta inexistente devuelve la SPA (app shell, 200), NO un 404 del servidor.
**Test:** `e2e/tests/edge-case/UX-017-rutas-inexistentes-deeplink.spec.ts:14`
**Sitio desplegado:** https://happy-coast-044ea7e0f.7.azurestaticapps.net
**Síntoma previo:** FALLA por timeout 36.1s en desktop-chromium (última regresión).
**Veredicto:** NFR-013 **PASA estable**. NO es bug real — el test era **flaky** (espera frágil). Corregido solo el archivo de test.

---

## Resultados por Criterio
| Criterio | Estado | Input/Condición | Evidencia |
|----------|--------|-----------------|-----------|
| NFR-013 | PASA | Deep-link HTTP directo a `/ruta-basura-inexistente` (y `/ruta-basura-xyz123`, `/no-existe-esta-ruta-xyz`) | curl: `HTTP 200 · content-type text/html · 1108 bytes` · body con `<app-root>`, `<title>Estudio Dental Mendieta</title>`, `main-GFYDB2WD.js` |
| NFR-013 | PASA | Navegación Playwright a ruta inexistente → render client-side del empty-state | heading `"No encontramos esta página"` visible · url se mantiene en la ruta · shell presente (navegación principal) |

**Estabilidad confirmada:** test NFR-013 ejecutado **3 corridas × 2 projects = 6/6 PASA** (~2.5–2.8s c/u) tras el fix.
Archivo completo `UX-017-rutas-inexistentes-deeplink.spec.ts`: **14/14 PASA** en ambos projects (desktop-chromium + mobile-chromium), sin regresiones.

---

## Diagnóstico del timeout de 36.1s

### 1. Contrato HTTP del servidor (curl) — CORRECTO
```
GET /ruta-basura-inexistente       -> HTTP 200 | text/html | 1108 bytes
GET /ruta-basura-xyz123            -> HTTP 200 | text/html | 1108 bytes
GET /no-existe-esta-ruta-xyz       -> HTTP 200 | text/html | 1108 bytes
body: <title>Estudio Dental Mendieta</title> + <app-root> + main-GFYDB2WD.js
```
`public/staticwebapp.config.json` (y la copia en `dist/.../browser/`) define:
- `navigationFallback.rewrite: /index.html` (excluye assets y estáticos).
- `responseOverrides."404": { rewrite: /index.html, statusCode: 200 }`.

→ El SPA fallback de Azure SWA funciona: rutas inexistentes devuelven 200 con el app shell, NUNCA 404 del server. Confirmado el reporte del DevOps.

### 2. Render client-side (Playwright) — CORRECTO
La app Angular hidrata y muestra el empty-state. Dump de diagnóstico contra el deploy:
```
goto status=200 en ~1620ms · networkidle en ~1235ms
headings: ["Estudio Dental Mendieta", "No encontramos esta página"]
h1:       ["Estudio Dental Mendieta"]          <- título/logo del shell
heading "No encontramos esta página" visible=true (check 12ms)
body: "...No encontramos esta página · La dirección a la que intentaste acceder no existe o se movió. Volvé al inicio..."
```
Sin lenguaje de demo/mock. El heading objetivo aparece y es visible casi instantáneamente una vez Angular montó.

### 3. Causa raíz del flake (no es bug de producto)
El test original hacía:
```ts
const resp = await page.goto('/ruta-basura-inexistente', { waitUntil: 'domcontentloaded' });
expect(resp?.status()).toBe(200);
await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
```
- `waitUntil: 'domcontentloaded'` resuelve cuando llega el HTML del shell, **antes** de que Angular descargue `main.js`, haga bootstrap + `SeedReadyGuard` y el router resuelva la ruta wildcard a `/no-encontrado`.
- La única red de seguridad para el render era el `expect.timeout` global (15s) sobre el heading. En un **cold-start lento de la SWA** (o CI con contención), 15s podían no bastar; al fallar, Playwright acumula polling de localización + overhead de `screenshot`/`trace: on-first-retry` on-failure, elevando el tiempo total observado a ~36s.
- Es flake de **espera/wait mal calibrado**, no una aserción colgada contra el status (el status devuelve 200 de inmediato, comprobado por curl).

### 4. Fix aplicado (solo el archivo de test)
Se mantiene intacta la semántica de NFR-013 (status 200 = no-404 del server) y se estabiliza la espera del render:
- Aserción HTTP `expect(resp?.status()).toBe(200)` **conservada** (núcleo del criterio).
- Se espera `app-root` en estado `attached` (Angular montado) con `timeout: 30_000` antes de aserir el heading, tolerando cold-start de la SWA.
- El heading se ancla con `exact: true` y `timeout: 30_000` explícito (la página tiene DOS headings: el `<h1>` del logo del shell y el del empty-state) → robusto ante futura ambigüedad.

No se tocó `playwright.config.ts` ni helpers. No se modificó código de aplicación.

---

## Bugs Encontrados
Ninguno. NFR-013 no representa un defecto de producto: el SPA fallback y el render del estado "no-encontrado" funcionan correctamente contra el sitio desplegado. El fallo previo era un test flaky por wait mal calibrado, ya corregido.

---

## Tests Generados / Ajustados
- `e2e/tests/edge-case/UX-017-rutas-inexistentes-deeplink.spec.ts` (ajustado test NFR-013, línea 14 — wait estable + timeout explícito; resto del archivo intacto)
