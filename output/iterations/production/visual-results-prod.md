# Resultados — Visual Checker (Validación Post-Deployment 6b)

> **Modo:** PRODUCCIÓN (Fase 6, paso 6b — validación real post-deployment) · **Fecha:** 2026-06-03
> **URL de producción (única):** `https://happy-coast-044ea7e0f.7.azurestaticapps.net`
> **Cambio del deployment:** optimización de las 29 fotos de paciente (67 MB → 1.72 MB, redimensión a 600px + recompresión JPEG q72, paths byte-idénticos, 0 cambios de código/config/topología). Commit `9093e60`.
> **Veredicto global:** **TODO PASA · 0 bugs.** Las fotos se sirven optimizadas y se ven bien en los 3 breakpoints; producción es de 1 dominio con security headers presentes, cero demo/mock y cero tracking/CRM.

---

## Resultados por Criterio

| Criterio | Estado | Breakpoint | Evidencia |
|----------|--------|------------|-----------|
| REQ-046 — foto en LISTA (avatar 32px) | **PASA** | desktop/tablet/mobile | `e2e/screenshots/prod-pacientes-{desktop-1440,tablet-820,mobile-390}.png` · runtime: naturalWidth=600, objectFit=cover, 0 rotas |
| REQ-046 — foto en FICHA (header 120px) | **PASA** | desktop/tablet/mobile | `e2e/screenshots/prod-ficha-header-{desktop-1440,tablet-820,mobile-390}.png` · naturalWidth=600, dispW=120, no rota |
| REQ-169 — cabecera no recarga al cambiar de tab | **PASA** | desktop | misma `<img>` (marker persistente) tras navegar a `/odontograma`; complete, naturalWidth=600 |
| REQ-159 / REQ-179 / DC-055/078 — nunca imagen rota | **PASA** | desktop/tablet/mobile | 0 `<img>` con `complete && naturalWidth===0` en lista, ficha, crear-paciente, tratamientos; fallback determinista a iniciales (ej. "AD") |
| A4 / NFR-001 — bytes optimizados servidos | **PASA** | n/a (red) | 29 fotos: `image/jpeg`, **600×600px**, **1.72 MB** total (min 39.8 / avg 60.6 / max 88.5 KB). Peor caso `mujeres/14.jpg` = 88.5 KB/600px (era 9.4 MB/4129px) |
| A4 / NFR-001 — carga rápida (observacional) | **PASA** | desktop | domContentLoaded 246 ms · loadEvent 247 ms · domInteractive 236 ms · payload de fotos −97% (67 MB → 1.72 MB); el peor caso histórico de ~17.2 s/foto eliminado |
| REQ-272 — cero demo/mock expuesto | **PASA** | desktop | 0 términos prohibidos (`demo/mock/simulación/viewcase/lorem ipsum`) en texto visible **y en HTML source** de `/pacientes`, `/agenda`, `/tratamientos` |
| REQ-272 — cero tracking/CRM | **PASA** | desktop | 0 hosts de terceros y 0 hits a analytics/CRM (intercept de red + Resource Timing); **bundle JS (357 KB, 19 chunks) escaneado: 0 firmas de SDK de analytics, 0 flags demo/mock, 0 URLs externas** |
| Topología — security headers presentes | **PASA** | n/a (HTTP) | CSP estricta, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (ver tabla abajo) |
| Topología — acceso público sin auth | **PASA** | desktop | deep-link directo a `/pacientes`, `/pacientes/:id/informacion`, `/reportes` renderiza sin redirección a `/login` |
| Topología — assets con content-type genuino (no fallback enmascarado) | **PASA** | n/a (HTTP) | foto real → 200 `image/jpeg`; control negativo `NOPE-99.jpg` → 200 `text/html` (SPA fallback) |
| Responsive — avatar idéntico en 3 breakpoints | **PASA** | desktop/tablet/mobile | 32px (lista) / 120px (ficha) en px fijos con `object-fit: cover`; sin overflow horizontal en ningún breakpoint |

---

## Bugs Encontrados

**Ninguno.** No se encontraron bugs visuales, de responsive, de accesibilidad, de design-criteria ni de brief-compliance en la validación post-deployment.

---

## Verificación de bytes optimizados (anti-caché de las gordas)

Las 29 fotos del manifest, descargadas contra producción (curl + Playwright `request`):

| Foto | Status | Content-Type | Ancho natural | Peso descargado | Antes (Fase 5) |
|------|--------|--------------|---------------|-----------------|----------------|
| `mujeres/14.jpg` (peor caso) | 200 | image/jpeg | 600px | **88.5 KB** | 9.4 MB / 4129px |
| `hombres/4.jpg` | 200 | image/jpeg | 600px | 53.0 KB | 6.2 MB |
| `mujeres/70.jpg` | 200 | image/jpeg | 600px | 74.4 KB | 6.4 MB |
| `mujeres/3.jpg` | 200 | image/jpeg | 600px | 58.9 KB | 6.0 MB |
| `mujeres/67.jpg` (más liviana) | 200 | image/jpeg | 600px | 39.8 KB | — |
| **TODAS las 29** | **29× 200** | **29× image/jpeg** | **29× 600px** | **1.72 MB total** | **67 MB total** |

- **Resumen:** 29/29 OK · 0 status≠200 · 0 content-type≠jpeg · 0 ancho≠600px.
- **Por foto:** min **39.8 KB** / avg **60.6 KB** / max **88.5 KB** (todo dentro del rango esperado 40–90 KB).
- **Control negativo:** `/imagenes/pacientes/NOPE-99.jpg` → **200 `text/html`** (cuerpo = `<!doctype html>`), confirmando que el `image/jpeg` de las fotos reales es genuino y NO un SPA-fallback enmascarado.
- **Runtime (navegador):** `naturalWidth=600` en todas las fotos cargadas (lista y ficha) — sirve los bytes optimizados, **no** la versión gorda de 4129px en caché.

---

## Security Headers (respuesta de producción — `GET /`)

| Header | Valor servido | Estado |
|--------|---------------|--------|
| `content-security-policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; frame-src 'none'; form-action 'self'` | **Presente (estricta)** |
| `x-frame-options` | `SAMEORIGIN` | **Presente** |
| `x-content-type-options` | `nosniff` | **Presente** |
| `referrer-policy` | `strict-origin-when-cross-origin` | **Presente** |
| `permissions-policy` | `geolocation=(), microphone=(), camera=()` | **Presente** |
| `strict-transport-security` | `max-age=10886400; includeSubDomains; preload` | Presente (bonus) |
| `x-xss-protection` | `1; mode=block` | Presente (bonus) |

> La CSP no bloquea la app propia (todo carga desde el mismo origen) y bloquea terceros (`script-src 'self'`, `connect-src 'self'`). Coherente con el resultado de 0 hosts de terceros.

---

## Topología 1 dominio — Tracking/CRM y Demo/Mock (REQ-272)

- **Hosts contactados:** únicamente `happy-coast-044ea7e0f.7.azurestaticapps.net`. **0 hosts de terceros** en `/reportes` (17 recursos), `/agenda` (18), `/pacientes`, `/tratamientos`.
- **Intercept de red (blocklist):** 0 hits a `google-analytics, googletagmanager, gtm, segment, hotjar, mixpanel, doubleclick, facebook, clarity, amplitude, fullstory, intercom, yandex, matomo, plausible, sentry, datadog, newrelic`.
- **Escaneo del bundle JS** (19 chunks, **357 KB** total, descargados de producción): **0 firmas de SDK de analytics/CRM** (`gtag(`, `dataLayer`, `fbq(`, `hj(`, etc.), **0 flags demo/mock** (`isDemo`, `demoMode`, `viewcase`, `mockMode`), **0 URLs externas hardcodeadas**. → No solo no hay tracking en runtime: no hay código de tracking embebido.
- **Texto visible + HTML source:** 0 ocurrencias de `demo / mock / simulación / simulacion / viewcase / lorem ipsum` en las páginas auditadas. El contenido es clínico real ("Estudio Dental Mendieta", nombres de pacientes, obras sociales).
- **Acceso público sin auth:** deep-links a rutas internas renderizan sin redirección a login (guard `seedReadyGuard` hidrata el store, no bloquea).

---

## Tests Generados

- `e2e/tests/visual/REQ-046-272-prod-photos-topology.spec.ts` — **7 tests, 14/14 PASA** (desktop-chromium + mobile-chromium). Cubre el gap de cobertura de 6a (peso/dimensiones/content-type de fotos sin aserción previa) + anti-imagen-rota en lista/ficha + REQ-169 (cabecera no recarga) + REQ-272 (0 tracking, 0 demo) + security headers + control negativo SPA-fallback. Spec durable como regresión de futuros deployments.

---

## Comparación Visual

| Sección | Resultado vs referencia / esperado | Notas |
|---------|------------------------------------|-------|
| Lista de pacientes (avatares 32px) | Acorde — nítido, sin pixelado/artefactos a tamaño de display | 600px@q72 se ve idéntico al original en círculo de 32px |
| Ficha — foto header (120px) | Acorde — foto clara y definida, sin compresión visible | excelente en desktop/tablet/mobile |
| Calidad de las fotos optimizadas | **Aceptable/premium** a tamaño de display (32–120px) | la pérdida de nitidez de q72/600px no es perceptible a estos tamaños |

---

## Evidencia (screenshots)

- `e2e/screenshots/prod-pacientes-desktop-1440.png` — lista, 12 fotos cargadas, desktop
- `e2e/screenshots/prod-pacientes-tablet-820.png` — lista, tablet
- `e2e/screenshots/prod-pacientes-mobile-390.png` — lista, mobile (cards + avatar 32px)
- `e2e/screenshots/prod-ficha-header-desktop-1440.png` — ficha header 120px, desktop
- `e2e/screenshots/prod-ficha-header-tablet-820.png` — ficha header 120px, tablet
- `e2e/screenshots/prod-ficha-header-mobile-390.png` — ficha header 120px, mobile

---

## Notas

- `loading="lazy"` difiere las fotos bajo el fold (12 above-fold cargadas, resto diferidas) → **comportamiento esperado, NO bug** (confirmado en distribución). Ninguna diferida quedó como rota.
- La lista pagina 12 pacientes/página (1–12 de 31); las 29 fotos optimizadas se verificaron exhaustivamente a nivel de red contra el manifest (29/29). El seed tiene 31 pacientes pero solo 29 con foto (2 usan iniciales por diseño).
- 0 errores de consola del app (la única warning observada — "Deprecated API for given entry type" — proviene de la propia llamada de medición LCP del checker, no del app).
