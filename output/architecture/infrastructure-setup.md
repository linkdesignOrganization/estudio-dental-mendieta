# Infrastructure Setup — Estudio Dental Mendieta

> **Owner:** DevOps. Leído por Developer, Plan Verifier, QA Orchestrator y DevOps (modos posteriores).
> **Fase:** 3.5 — Setup de Deploy para Demo (SWA + CI/CD). **Actualizado en paso 4e (Pre-QA Deploy de la Construcción Visual): primer deploy real COMPLETADO y sitio verificado cargando.**
> **Fecha:** 2026-06-01 (setup) · 2026-06-02 (primer deploy real verificado).

---

## Estado general

| Componente | Estado |
|---|---|
| Repositorio git (local) | ✅ Inicializado en `main` |
| Repositorio GitHub (remoto) | ✅ Creado y conectado — `linkdesignOrganization/estudio-dental-mendieta` (público) |
| `.gitignore` | ✅ Creado |
| `staticwebapp.config.json` (fallback SPA + headers) | ✅ Creado |
| Workflow CI/CD (GitHub Actions → SWA) | ✅ Creado (`.github/workflows/azure-static-web-apps.yml`) |
| Resource group `EstudioDentalMendieta-RG` en `CEFSA-prod` | ✅ **Recreado** en `eastus2` |
| **Azure Static Web Apps** | ✅ **Provisionado** — `estudio-dental-mendieta`, SKU **Standard**, en `CEFSA-prod`. URL: `https://happy-coast-044ea7e0f.7.azurestaticapps.net` |
| Secret del repo `AZURE_STATIC_WEB_APPS_API_TOKEN` | ✅ **Cargado** vía `gh secret set` (2026-06-02) |
| Primer deploy real | ✅ **COMPLETADO** (2026-06-02, paso 4e Pre-QA) — run `26794016083` `success`. Sitio sirviendo la app Angular en `https://happy-coast-044ea7e0f.7.azurestaticapps.net` |

> **Resumen:** Infraestructura de deploy para la demo **completa**. El cliente autorizó el costo y se provisionó el SWA en la suscripción **`CEFSA-prod`** (donde la cuenta `hola@linkdesign.cr` SÍ tiene permiso de escritura) con **SKU Standard** (~$9/mes — evita el límite de 10 SWAs Free de CEFSA-prod, que está lleno 10/10). El deployment token ya está cargado como secret del repo, por lo que el CI/CD está completamente cableado. El primer deploy con contenido real ocurrirá en Fase 4 cuando el Developer scaffoldee la app Angular y se haga push.
>
> **Nota sobre el bloqueo previo (resuelto):** se había explorado `Microsoft Azure Sponsorship` por tener cuota Free, pero la cuenta es invitado externo sin rol de escritura ahí (y con MFA/Conditional Access no resoluble de forma no interactiva). El cliente resolvió autorizando el costo de Standard en CEFSA-prod, donde la cuenta sí puede provisionar.

---

## 1. Repositorio GitHub

- **Org / nombre:** `linkdesignOrganization/estudio-dental-mendieta`
- **Visibilidad:** Público
- **URL:** https://github.com/linkdesignOrganization/estudio-dental-mendieta
- **Rama principal:** `main`
- **Cuenta gh usada:** `roberthcstllo` (autenticada, scopes `repo`, `workflow`, `read:org`, `gist`)
- **Identidad de commits local:** `roberthcstllo <hola@linkdesign.cr>`

El proyecto era un directorio sin control de versiones; se ejecutó `git init`, se crearon los archivos de infra/config y la documentación, y se conectó al remoto.

---

## 2. Azure Static Web Apps (frontend deploy target)

> ✅ **PROVISIONADO** (2026-06-01) en `CEFSA-prod`, SKU Standard. SWA standalone (sin `--source`/`--login-with-github`): el CI/CD lo gestiona el workflow ya versionado, no la inyección automática de Azure (`repositoryUrl: null` lo confirma).

| Parámetro | Valor real |
|---|---|
| Suscripción | **`CEFSA-prod`** — `4bdfcf40-ec56-4258-92e9-6f31b977a808` (la cuenta `hola@linkdesign.cr` tiene escritura aquí) |
| Resource group | `EstudioDentalMendieta-RG` (recreado en `eastus2`) |
| Nombre del recurso SWA | `estudio-dental-mendieta` |
| Región | `East US 2` (`eastus2`) |
| SKU / Tier | **Standard** — **~$9/mes, costo autorizado por el cliente** (evita el límite de 10 SWAs Free de CEFSA-prod, que está 10/10) |
| **Hostname default (URL pública)** | **`https://happy-coast-044ea7e0f.7.azurestaticapps.net`** |
| `api_location` | _(vacío — frontend-only, sin Functions)_ |
| Deployment token | ✅ Cargado como secret del repo `AZURE_STATIC_WEB_APPS_API_TOKEN` |

**Comandos con los que se provisionó (referencia):**
```bash
az account set --subscription 4bdfcf40-ec56-4258-92e9-6f31b977a808
az group create --name "EstudioDentalMendieta-RG" --location "eastus2"
az staticwebapp create \
  --name "estudio-dental-mendieta" \
  --resource-group "EstudioDentalMendieta-RG" \
  --location "eastus2" \
  --sku "Standard"
```

**Cómo se obtuvo el token y se cargó como secret (referencia / rotación futura):**
```bash
TOKEN=$(az staticwebapp secrets list \
  --name "estudio-dental-mendieta" \
  --resource-group "EstudioDentalMendieta-RG" \
  --query "properties.apiKey" -o tsv)
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN \
  --repo linkdesignOrganization/estudio-dental-mendieta \
  --body "$TOKEN"
```

---

## 3. CI/CD — GitHub Actions → Static Web Apps

- **Workflow:** `.github/workflows/azure-static-web-apps.yml` (✅ versionado).
- **Trigger:** cada `push` a `main` dispara build + deploy. Los PR contra `main` generan un entorno de preview; al cerrar el PR, se limpia.
- **Acción:** `Azure/static-web-apps-deploy@v1` con **`app_build_command: "npm run build"`** explícito (Oryx instala deps con `npm ci` y luego corre ESE comando, en vez de su detección implícita).
- **Secret requerido:** `AZURE_STATIC_WEB_APPS_API_TOKEN` (deployment token del SWA). ✅ **Cargado** (2026-06-02). CI/CD completamente cableado y **verificado funcionando** en el primer deploy real (run `26794016083`).
- **Node:** el workflow fija Node 22 vía `NODE_VERSION: "22"` (Angular 21 requiere `^20.19 || ^22.12 || >=24`). En el run real Oryx usó `nodejs 22.22.0`.

### Configuración de build (verificada en el deploy real)
El workflow declara:
- `app_location: "/"` → el proyecto Angular vive en la **raíz** del repo.
- `api_location: ""` → sin backend.
- `output_location: "dist/estudio-dental-mendieta/browser"` → salida del `@angular/build` (`application`). ✅ Confirmado: el run validó la ubicación `.../dist/estudio-dental-mendieta/browser`.
- `app_build_command: "npm run build"` → **crítico**: fuerza a Oryx a correr el script de build del proyecto (que dispara el hook `prebuild`), en lugar de su build implícito de Angular que **NO garantiza** ejecutar los hooks `pre*/post*` de npm.

### Seed dinámico (prebuild) — RESUELTO Y VERIFICADO
La arquitectura (GAP-A02) requiere generar `manifest.json` en build-time desde `input/mockpeople/`. El script `scripts/generate-manifest.mjs` está conectado como hook `"prebuild"` en `package.json`. **Por qué `app_build_command` es obligatorio aquí:** si se deja que Oryx use su detección implícita de Angular, los hooks `pre*/post*` de npm pueden NO ejecutarse → el manifest no se genera y la app carga sin pacientes. Con `app_build_command: "npm run build"`, npm corre `prebuild` → `ng build` en orden. ✅ Verificado en el log del run: `[manifest] 29 pacientes (12 H / 17 M), 0 documentos → public/seed/manifest.json`.

### `staticwebapp.config.json` — ubicación CRÍTICA (corregido en 4e)
El config de SWA (SPA fallback + security headers) **debe vivir en `public/`**, NO en la raíz del repo. Con el builder `application`, lo único que llega al `output_location` (`dist/<app>/browser`) es lo que Angular emite + los assets de `public/`. Un `staticwebapp.config.json` en la raíz del repo **NO se despliega** → ni SPA fallback ni headers se aplicarían. Se movió a `public/staticwebapp.config.json` (Angular lo copia al root del output) y se eliminó el duplicado de la raíz. ✅ Verificado: `/pacientes` hace SPA fallback (200) y los headers CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy están presentes en la respuesta.

### Budget de bundle (NFR-002, GAP-A03)
El límite <500KB gzipped del initial se configura en `angular.json` (warn 450KB / error 500KB). Como es **error** de build, un exceso hace fallar `ng build` y por lo tanto el deploy — no hace falta un paso de CI adicional.

---

## 4. Cómo verificar el estado del deploy

```bash
# Último run del pipeline:
gh run list --repo linkdesignOrganization/estudio-dental-mendieta --limit 1

# Ver detalle / logs del último run:
gh run view --repo linkdesignOrganization/estudio-dental-mendieta --log

# URL pública del SWA (ya provisionado):
az staticwebapp show \
  --name estudio-dental-mendieta \
  --resource-group EstudioDentalMendieta-RG \
  --subscription 4bdfcf40-ec56-4258-92e9-6f31b977a808 \
  --query "defaultHostname" -o tsv
# → happy-coast-044ea7e0f.7.azurestaticapps.net
```

**Tiempo estimado de deploy:** ~2–4 min por push (checkout + `npm ci` + `ng build` + upload). El primer build real tardó ~1m57s (job `Build and Deploy`).

### Verificación del deploy real (2026-06-02, paso 4e Pre-QA) — para el QA Orchestrator
El sitio `https://happy-coast-044ea7e0f.7.azurestaticapps.net` quedó **verificado cargando** con la Construcción Visual. Resultados del smoke test (todos ✅):

| Eje | Resultado |
|---|---|
| **Root `/`** | HTTP 200, sirve el shell Angular (`<app-root>`, `<base href="/">`, title "Estudio Dental Mendieta", bundles hasheados `main-*.js` / `styles-*.css`) |
| **Deep-link `/pacientes`** | HTTP 200, SPA fallback correcto (devuelve el mismo `index.html` → el router del cliente resuelve la ruta) |
| **Seed manifest `/seed/manifest.json`** | HTTP 200, `application/json`, 29 pacientes (12 H / 17 M) |
| **Fotos de paciente** | sirven en `/imagenes/pacientes/{hombres,mujeres}/N.jpg` (el `path` real está en cada entrada de `manifest.json`) → HTTP 200, `image/jpeg`. ⚠️ NO usar `/seed/fotos/...`: esa ruta no existe y por el SPA fallback devuelve `200` + `text/html` (index.html), enmascarando el 404 — verificar SIEMPRE el `content_type`, no solo el status |
| **Bundles + favicon** | `main-*.js` (`text/javascript`), `styles-*.css` (`text/css`), `favicon.ico` → HTTP 200 |
| **Security headers** | CSP, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy → todos presentes en la respuesta (config de `public/` aplicada) |

> **Nota de performance (no bloqueante):** algunas fotos source en `input/mockpeople/` están sin optimizar (ej. `hombres/28.jpg` ~2.9 MB). Cargan correctamente y no bloquean QA, pero conviene comprimirlas/redimensionarlas antes del deploy final de Fase 6 para mejorar el LCP de la ficha y el listado. Es decisión del dueño del pipeline de datos/build (fuera del alcance de config de deploy).

**Comando de verificación rápida (re-ejecutable):**
```bash
SITE="https://happy-coast-044ea7e0f.7.azurestaticapps.net"
curl -s -o /dev/null -w "root %{http_code}\n" "$SITE/"
curl -s -o /dev/null -w "/pacientes %{http_code}\n" "$SITE/pacientes"   # SPA fallback → 200
curl -s -o /dev/null -w "manifest %{http_code} %{content_type}\n" "$SITE/seed/manifest.json"
# Foto: tomar un path REAL del manifest y verificar content_type=image/jpeg (no /seed/fotos/)
P=$(curl -s "$SITE/seed/manifest.json" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).pacientes[0].path))")
curl -s -o /dev/null -w "foto $P %{http_code} %{content_type}\n" "$SITE$P"
curl -s -D - -o /dev/null "$SITE/" | grep -i content-security-policy    # headers vivos
```

### Re-deploy round 1 — fixes de QA Construcción Visual (2026-06-02) — verificado
Push de `fix: visual-build - bug fixes round 1` (commit `41a7d9b`) → run `26799504393` **success** (~1m53s). El build de CI corrió el hook `prebuild` (manifest regenerado, `generadoEn: 2026-06-02T05:02:41Z`, 29 pacientes). Verificación del fix crítico **BUG-V01** (los estilos del DS no aplicaban en pantalla):

| Verificación | Resultado |
|---|---|
| `index.html` desplegado | `<link rel="stylesheet" href="styles-FHPOFM43.css">` **normal** — sin `media="print"`, sin `onload="this.media='all'"` |
| Hoja del DS aplica en pantalla | `styles-FHPOFM43.css` 200, `media="(all)"`, **appliesToScreen=true**, 593 reglas activas (Playwright sobre `/pacientes`) |
| `.btn-edm--primary` computed | background `rgb(109,168,212)` (#6da8d4 azul), font `"Red Hat Text"`, radius `12px`, display `flex` → **estilos SÍ aplican** |
| Ruta nueva `/tratamientos/catalogo` | 200 (SPA fallback, sirve `app-root`); `catalogo/:id` también 200 — registrada en `treatments.routes.ts` |
| Manifest + fotos | manifest 200 `application/json`; fotos en `/imagenes/pacientes/...` 200 `image/jpeg` |

> **Raíz de V01 (para futuros redeploys):** el anti-patrón `media="print"`/`onload` NO está en `src/index.html` — lo inyectaba `optimization.styles.inlineCritical` (default de producción del builder `application`). El fix fue `inlineCritical: false` en `angular.json` (config `production`). Si reaparece "estilos no aplican / FOUC", revisar ahí, no el HTML fuente.

### Re-deploy round 2 — fix BUG-V05 (touch targets ≥44px mobile) (2026-06-02) — verificado
Push de `fix: visual-build - touch targets >=44px mobile (BUG-V05)` (commit `331020c`) → run `26804209775` **success** (~1m55s). El build de CI corrió el hook `prebuild` (manifest regenerado, 29 pacientes 12 H / 17 M) y `ng build` completó sin errores (budget OK). Bundles nuevos: `main-7MFTGH7B.js` / `styles-PDCEFIZS.css`. El `headSha` del run coincide con el HEAD local pusheado.

Verificación post-deploy (alcance: "el deploy es exitoso y el sitio carga" — la validación detallada de los ≥44px la hace el QA):

| Verificación | Resultado |
|---|---|
| Root `/` | HTTP 200 `text/html`, sirve el shell Angular (`<app-root>`, `<base href="/">`, title "Estudio Dental Mendieta", bundle hasheado **nuevo** `main-7MFTGH7B.js`) |
| Deep-link `/pacientes` | HTTP 200 (SPA fallback correcto) |
| Bundles + favicon | `main-7MFTGH7B.js` (`text/javascript`), `styles-PDCEFIZS.css` (`text/css`), `favicon.ico` → 200 |
| Seed manifest `/seed/manifest.json` | HTTP 200 `application/json`, 29 pacientes |
| Foto de paciente (path real del manifest) | `/imagenes/pacientes/hombres/1.jpg` → 200 `image/jpeg` (content-type verificado, no SPA-fallback enmascarado) |
| Security headers | CSP, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy → todos presentes |

> El fix de BUG-V05 vive en `src/styles/theme.scss` (media query `@media (max-width:767px)` con `--touch-target-min` = 44px sobre `.icon-btn`/`.btn-edm`/`.input-edm`/`.select-edm`/`.back-link`) más ajustes `min-height`/`min-width` por-componente en 14 componentes. Redeploy de solo código — sin cambios de infra.

### Re-deploy round 2 (cierre) — residuales BUG-V05 + adaptación de tests QA ronda 2 (2026-06-02) — verificado
Push de `fix: visual-build - touch target residuals + qa round 2 test adaptations` (commit `e092e49`) → run `26804929741` **success** (~2m23s). Cierra los **2 residuales** de touch targets que la regla global de `theme.scss` no cubría: el `search-input` del listado de pacientes (`patient-list.component.ts`, ahora `min-height: var(--touch-target-min)` directo sobre `.search-pill__input` — el input es el elemento que recibe el tap real, no solo el pill) y el `skip-link` (`app.ts`, `display:inline-flex` + `min-height` para hit-area ≥44px). Incluye también el spec adaptado por los sub-testers de la ronda 2 (`e2e/tests/visual/DC-021-071-072-073-known-bugs.spec.ts`), 2 screenshots de evidencia y reportes en `output/`. El build de CI corrió el hook `prebuild` (`[manifest] 29 pacientes (12 H / 17 M)` regenerado a `2026-06-02T07:24:32Z`) y `ng build` completó sin errores (budget OK). Bundle nuevo: `main-GFYDB2WD.js` (cambió desde `main-7MFTGH7B.js` → confirma que el código de los residuales está realmente desplegado, no caché). `headSha` del run coincide con el HEAD local.

Smoke test post-deploy (alcance: "deploy exitoso + sitio carga"; la validación de los ≥44px la hace el QA): root `/` 200 `text/html` (shell Angular, sin regresión FOUC `media="print"`), `/pacientes` 200 (SPA fallback), manifest 200 `application/json` (29 pacientes), foto `/imagenes/pacientes/hombres/1.jpg` 200 `image/jpeg` (content-type verificado), bundles+favicon 200, security headers (CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy) presentes. **Todo ✅.**

### Iteración 1 (Fundación) — Pre-QA Deploy (2026-06-02, paso 5d) — verificado
Push de `feat: iteration 1 - pre-QA deploy` (commit `f535a69`) → run `26818370793` **success** (~1m52s). `headSha` del run coincide con el HEAD local. El Developer auditó la base de la demo y cerró 2 gaps de la Fundación: (1) los **6 profesionales de cabecera** con nombres exactos del brief, y (2) **44 documentos** con thumbnails SVG autoalojados. Cambios desplegados: `src/app/core/seed/{ar-data,seed.generator}.ts`, `scripts/generate-manifest.mjs` (IMG_RE ahora acepta `svg`), **15 SVGs nuevos** en `public/imagenes/documentos/` (5 `foto-*` + 10 `radiografia-*`), specs de flow E2E con refs de profesionales actualizadas, y reportes en `output/iterations/iteration-1/`.

**Confirmación crítica del prebuild (manifest regenerado en CI):** el log del run muestra `[manifest] 29 pacientes (12 H / 17 M), 15 documentos → public/seed/manifest.json` — antes de esta iteración eran **0 documentos**. El budget de bundle pasó: `Initial total 424.67 kB / 102.37 kB gzipped` (<500KB error-budget).

> **Dónde viven los datos de Fundación (para el QA / futuros redeploys):** el `manifest.json` solo lista *assets crudos* descubiertos en build-time (`pacientes`: paths de fotos; `documentos`: los 15 paths de SVG). Los **6 profesionales** y la **asignación de documentos por paciente** se generan client-side en `seed.generator.ts` a partir de `ar-data.ts` (compilado en un lazy chunk de JS, p.ej. `chunk-F65ANOK5.js`), NO en el manifest. Por diseño (UX-048) **algunos pacientes no tienen documentos** (edge case del seed) → su tab muestra el placeholder controlado "Sin documentos"; eso NO es un bug. `pac-001` es uno de esos; `pac-002` (Mateo Gómez) SÍ tiene documento.

Verificación post-deploy (todos ✅):

| Eje | Resultado |
|---|---|
| Root `/` + `/pacientes` | 200 `text/html` (shell Angular + SPA fallback); listado renderiza "29 pacientes en el sistema" con fotos reales |
| Manifest `/seed/manifest.json` | 200 `application/json`, `generadoEn 2026-06-02T12:02:46Z` (fresco, regenerado por CI), **15 documentos** (5 fotos + 10 radiografías), 29 pacientes |
| **Thumbnails SVG sirven como imagen real** | `foto-01.svg`/`radiografia-01.svg`/`radiografia-10.svg` → 200 **`image/svg+xml`** con bytes = source; el contenido empieza por `<svg xmlns=...` (no `<!doctype html>`). Control negativo: `NOPE-99.svg` → 200 `text/html` (SPA fallback) — prueba que el content-type de los SVG reales es genuino y no fallback enmascarado |
| **6 profesionales en el bundle desplegado** | `prof-01..prof-06` presentes en `chunk-F65ANOK5.js` con los nombres exactos del brief (acentos minificados a `\x`): Dra. Soledad Russo, Dra. Carolina Etcheverry, Dr. Federico Salinas, Dr. Mart**í**n Aguilera (`\xED`), Dr. Juan Pablo Acu**ñ**a (`\xF1a`), Dra. Laura B**é**ccar Varela (`\xE9`) |
| **Runtime: profesional en la ficha** | ficha `/pacientes/pac-001/informacion` (Playwright) muestra "Profesional de cabecera: Dr. Federico Salinas" en el header |
| **Runtime: thumbnail real en tab Documentos** | tab Documentos de `pac-002` (Playwright) renderiza el `<img>` de `radiografia-06.svg` con `naturalWidth>0` (no roto) — gráfico de radiografía dental "Serie periapical". 0 errores de consola en listado y ficha |

> Redeploy de solo código + assets — sin cambios de infra. El SWA, CI/CD y secret siguen igual que en Fase 4.

### Iteración 1 (Fundación) — Re-deploy fix de regresión de seed (2026-06-02, FASE 5) — verificado
Push de `fix: iteration 1 - separate PRNG for doc thumbnails (restore seed sequence)` (commit `6fcc2df`) → run `26821585530` **success** (~1m56s). `headSha` del run coincide con el HEAD local pusheado.

**Causa raíz de la regresión (para futuros redeploys):** al pasar de **0 → 15 documentos** en el manifest (cambio de la Fundación), `buildDocuments` en `seed.generator.ts` empezó a ejecutar un `rng.pick(pool)` extra por documento para asignar el thumbnail. Ese draw adicional consumía del **PRNG global**, desplazando toda la secuencia downstream (presupuestos → facturas → movimientos → **saldos/estados** distintos a los de la demo). El fix usa un **PRNG separado** (`new Prng(SEED_ROOT ^ 0x444f_4353)`, "DOCS") solo para el thumbnail cosmético, de modo que la secuencia global queda intacta y los saldos vuelven a los valores de la demo. Cambio de **una sola línea de lógica** en `src/app/core/seed/seed.generator.ts` (+ reordenamiento de los draws globales antes de resolver el thumbnail). Redeploy de **solo código** — sin cambios de infra ni de assets (los 15 SVG y el manifest no cambian).

**Confirmación del prebuild en CI:** el log del run muestra `[manifest] 29 pacientes (12 H / 17 M), 15 documentos → public/seed/manifest.json` y `Initial total 424.70 kB / 102.44 kB gzipped` (<500KB error-budget). El bundle `main-*.js` cambió a `main-5CCD4VTD.js` (desde `main-GFYDB2WD.js`) → confirma que el código del fix está realmente desplegado, no caché.

Smoke test post-deploy (alcance: "deploy exitoso + sitio carga"; la validación funcional de saldos/secuencia la hace la re-regresión + QA), todos ✅:

| Eje | Resultado |
|---|---|
| Root `/` | 200 `text/html`, shell Angular (`<app-root>`, `<base href="/">`, title "Estudio Dental Mendieta", bundle hasheado **nuevo** `main-5CCD4VTD.js` / `styles-PDCEFIZS.css`) |
| Deep-link `/pacientes` | 200 (SPA fallback correcto) |
| Manifest `/seed/manifest.json` | 200 `application/json`, `generadoEn 2026-06-02T13:05:30Z` (fresco, regenerado por CI), **29 pacientes + 15 documentos** |
| Foto de paciente (path real del manifest) | `/imagenes/pacientes/hombres/1.jpg` → 200 `image/jpeg` (content-type verificado, no SPA-fallback enmascarado) |
| Thumbnail SVG (path real del manifest) | `/imagenes/documentos/foto-01.svg` → 200 `image/svg+xml`, bytes `<svg xmlns=...`. Control negativo `NOPE-99.svg` → 200 `text/html` (fallback) → prueba que el type del SVG real es genuino |
| Security headers | CSP, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy → todos presentes |

### Iteración 3 (Agenda) — Pre-QA Deploy (2026-06-02, paso 5d) — verificado
Push de `feat: iteration 3 - pre-QA deploy` (commit `8d5fd31`) → run `26834655604` **success** (~2m1s). `headSha` del run coincide con el HEAD local pusheado. Redeploy de **solo código** — sin cambios de infra (SWA, CI/CD y secret siguen igual que en Fase 4). El Developer completó la Agenda a producción sobre la base de la demo: **vista semanal real** (nuevo `week-view.component.ts`), **default mobile en vista día/lista** (`agenda-list-view.component.ts`, filas touch ≥44px), **bloque de turno compartido** (`cal-appt-block.component.ts`, dedup mes/semana), **notas internas** en el detalle, y **reagendar persiste una notificación de WhatsApp real** que aparece en la campana. Cambios: 3 componentes nuevos + 4 modificados (`models.ts`, `store.service.ts`, `appointment-detail.component.ts`, `calendar.component.ts`).

**Seed byte-idéntico (sin drift):** el Developer agregó los campos nuevos al *shape de presentación* (`Appointment`), no a `AppointmentEntity`, y la notificación de reagenda usa id por `Date.now()` (no PRNG). Build local verificado antes del push: `[manifest] 29 pacientes (12 H / 17 M), 15 documentos` y `Initial total 428.70 kB / 103.59 kB gzipped` (<500KB error-budget; +4KB vs It1 por los componentes nuevos, dentro de presupuesto). El bundle servido `main-VR4MDJED.js` == el `dist/.../main-VR4MDJED.js` local → confirma código realmente desplegado, no caché.

**Verificación funcional post-deploy (Playwright contra el SWA, 7/7 PASS)** — alcance "deploy exitoso + sitio carga + cambios de It3 reflejados"; la validación QA detallada la hace el QA Orchestrator:

| Eje | Resultado |
|---|---|
| Root `/`, `/agenda`, `/pacientes` | 200 `text/html` (shell Angular + SPA fallback); manifest fresco `generadoEn 2026-06-02T16:51:23Z` (29 pacientes / 15 docs) |
| **DESKTOP abre en MES** | `.cal__grid` presente (35 celdas), toggle "Mes" activo, sin columnas-semana |
| **DESKTOP toggle "Semana" = SEMANA REAL** | `app-week-view .week` con `grid-template-columns: repeat(7,1fr)` → **7 `.week__col`** (Lun→Dom), **grid mensual ausente** (`.cal__grid=0`). NO es el grid del mes |
| **MOBILE (~390px) arranca en DÍA/LISTA** | `app-agenda-list-view .agenda-list` con **31 `.agenda-row`** (filas), sin grid mensual ni columnas-semana; altura de fila real **76px** (≥44px touch) |
| **DETALLE de turno muestra "Notas internas"** | `.appt__notes-label` con texto "Notas internas" en `/agenda/tur-008` |
| **REAGENDAR → notificación en la campana** | slot `09:00` confirmado en `/agenda/tur-008/reagendar` → badge `.header__badge` **5→6** y el panel `.np__item` muestra **"Aviso de WhatsApp enviado"** (notificación real, sin lenguaje de simulación) |
| Errores de consola | 0 en agenda (mes/semana) y en detalle/reagenda |
| Security headers | CSP, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy → presentes |

> **Nota para el QA Orchestrator (rutas de la agenda — evitar falso negativo):** la clase `.agenda-row` (vista lista) vive en `agenda-list-view.component.ts` y se renderiza en `/agenda` con **viewport mobile** (`agenda` es el default mobile). La ruta `/agenda/dia` carga un componente DISTINTO (`DayListComponent`, una **tabla** `app-data-table` con `<td class="cell">` que lista solo los turnos de HOY) y NO usa `.agenda-row`. Para navegar a un turno reagendable desde un probe, usar la lista mobile de `/agenda` (cada fila enlaza a `/agenda/:id`), no `/agenda/dia`. El form de reagendar usa `input#r-date` + botones `.resch__slot` (ocupados `[disabled]`) + primary "Confirmar nuevo horario" (deshabilitado hasta elegir slot).

### Iteración 4 (Pacientes escritura + Tratamientos) — Pre-QA Deploy (2026-06-02, paso 5d) — verificado
Push de `feat: iteration 4 - pre-QA deploy` (commit `8bfc152`) → run `26845395311` **success** (~1m). `headSha` del run coincide con el HEAD local pusheado. Redeploy de **solo código** — sin cambios de infra (SWA, CI/CD y secret siguen igual que en Fase 4). 10 archivos en el commit: 6 componentes de It4 modificados (`store.service.ts`, `patient-create.component.ts`, `patient-list.component.ts`, `tabs/tab-odontogram.component.ts`, `treatment-type-detail.component.ts`, `treatments-home.component.ts`) + 1 servicio nuevo (`patient-flow.service.ts`, estado compartido del flujo de creación entre los 2 segmentos de ruta) + reporte `output/iterations/iteration-4/verification-5a.md` + 2 trackers.

**Seed byte-idéntico (sin drift) — manejo del manifest:** el `public/seed/manifest.json` está trackeado, pero el hook `prebuild` lo reescribe en cada build local solo para refrescar el campo cosmético `generadoEn` (timestamp). Los datos (29 pacientes 12 H / 17 M, 15 documentos) son idénticos. Ese churn de timestamp se **descartó** con `git checkout -- public/seed/manifest.json` antes del `git add -A`, de modo que el manifest NO entró al commit. En CI el `prebuild` lo regenera igual (`[manifest] 29 pacientes (12 H / 17 M), 15 documentos`), así el sitio sirve el seed correcto sin ensuciar el historial. Budget OK: `Initial total 427.99 kB / 103.48 kB gzipped` (<500KB error-budget). El bundle servido `main-YIQ6IJV4.js` == el del build local de It4 → confirma código realmente desplegado, no caché.

> **Nota (paso post-job benigno):** el log del run muestra `error: could not lock config file .git/config: Permission denied` en el step "Post Checkout". Es el cleanup del runner que corre la acción `Azure/static-web-apps-deploy`, NO el build/deploy. El run concluyó `success` y el deploy se aplicó. Patrón conocido, no bloqueante.

**Verificación funcional post-deploy (Playwright contra el SWA, 9/9 PASS)** — alcance "deploy exitoso + sitio carga + cambios de It4 reflejados"; la validación QA detallada la hace el QA Orchestrator:

| Eje | Resultado |
|---|---|
| Root `/`, `/pacientes`, `/tratamientos`, `/pacientes/nuevo/datos` | 200 `text/html` (shell Angular + SPA fallback); manifest 200 `application/json`; foto `/imagenes/pacientes/hombres/1.jpg` 200 `image/jpeg` (content-type verificado, no fallback enmascarado) |
| **CREAR paciente = 2 pasos + género** | stepper `app-stepper` "Datos personales / Datos clínicos" (Paso 1 de 2); `<select id="c-genero">` con opciones **Femenino / Masculino** en paso 1; "Siguiente" navega a paso 2 ("Datos clínicos y de cobertura"); 0 errores de consola |
| **EDITAR — dirty-check (F01)** | SIN cambios → "Cancelar" sale directo a `/pacientes/pac-001/informacion` (sin diálogo); CON cambios (editar teléfono) → muestra `app-confirm-dialog` "Tenés datos cargados. ¿Querés descartar y salir?" |
| **ODONTOGRAMA — pieza editable + persiste** | pieza 18 cambiada `ausente → sana` vía `app-tooth-state-selector` + "Guardar estado"; tras **recarga dura** de `/pacientes/pac-001/pieza/18`, el chip `.td-main__chip[data-state]` sigue en `"sana"` → persiste (localStorage) |
| **TRATAMIENTOS — columna "Próxima fecha"** | tabla de Activos con headers `PACIENTE \| TRATAMIENTO \| PROFESIONAL \| ETAPAS \| PRÓXIMA FECHA` (columna `{ key: 'proxima', label: 'Próxima fecha' }`) |
| Security headers | CSP, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy → presentes |

> **Nota para el QA Orchestrator (ruta de CREAR paciente — evitar falso negativo):** el flujo de crear NO está en `/pacientes/nuevo` (esa ruta no existe → cae al 404 `not-found`). Son **2 segmentos de ruta** (multipaso por URL, no por estado interno): paso 1 = `/pacientes/nuevo/datos` (form con `#c-nombre`, `#c-genero`, etc.), paso 2 = `/pacientes/nuevo/clinico`. El botón "Siguiente" (`.btn-edm--primary`) navega entre ellos; el estado se comparte vía `PatientFlowService`. Editar = `/pacientes/:id/editar`; detalle de pieza = `/pacientes/:id/pieza/:fdi`. El único guard del árbol es `seedReadyGuard` (hidrata el store, NO es auth/login → no redirige a `/login`).

### Iteración 5 (Facturación + Pagos + Reportes — última iteración) — Pre-QA Deploy (2026-06-02, paso 5d) — verificado
Push de `feat: iteration 5 - pre-QA deploy` (commit `7f92216`) → run `26853562866` **success** (~1m50s). `headSha` del run coincide con el HEAD local pusheado. Redeploy de **solo código** — sin cambios de infra (SWA, CI/CD y secret siguen igual que en Fase 4). 10 archivos en el commit: 5 componentes/servicios de It5 (`core/persistence/store.service.ts`, `billing/budget-detail.component.ts`, `billing/obra-social-detail.component.ts`, `patients/register-payment.component.ts`, `reports/report-detail.component.ts`) + 1 compartido nuevo/modificado (`shared/components/mini-chart.component.ts`, gráficos SVG/CSS sin deps) + 2 specs E2E (`flow/UX-multipaso-cierre.spec.ts`, `visual/DC-100-119-ui-states.spec.ts`) + 2 trackers (`project-tracker.md`, `pending-feedback.md`). Cierra los **272 REQ** del proyecto.

**Seed byte-idéntico (sin drift) — manejo del manifest:** el `prebuild` local reescribió `generadoEn` (timestamp cosmético) al validar el bundle; ese churn se **descartó** con `git checkout -- public/seed/manifest.json` tras confirmar por `git diff` que era el ÚNICO cambio (datos idénticos: 29 pacientes 12 H / 17 M, 15 documentos). El manifest NO entró al commit; CI lo regeneró igual (`[manifest] 29 pacientes (12 H / 17 M), 15 documentos`). Budget OK: `Initial total 428.85 kB / 103.70 kB gzipped` (<500KB error-budget; coincide con los 103.70 KB reportados por el Developer). El bundle servido `main-5NSLIGIB.js` == el del build local de It5 (antes era `main-YIQ6IJV4.js` de It4) → confirma código realmente desplegado, no caché.

**Verificación funcional post-deploy (Playwright contra el SWA, 15/15 PASS)** — alcance "deploy exitoso + sitio carga + cambios de It5 reflejados"; la validación QA detallada la hace el QA Orchestrator. Smoke curl previo: root `/`, `/reportes`, `/pacientes`, `/facturacion` → 200; manifest 200 `application/json`; foto `/imagenes/pacientes/hombres/1.jpg` 200 `image/jpeg`; security headers (CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy) presentes.

| Eje (los 4 entregables de It5) | Resultado |
|---|---|
| **4 reportes con GRÁFICOS reales (no placeholders)** | `/reportes/{pacientes,tratamientos,financiero,productividad}` → cada `app-mini-chart` con geometría real según tipo: barras V (`.mc__bar`), barras H (`.mc__hfill`), línea (`polyline.mc__line-path[points]`) o donut (`circle.mc__donut-arc`). Conteo `real===total`: **pacientes 5/5, tratamientos 4/4, financiero 5/5, productividad 3/3**. Body sin lenguaje placeholder ("próximamente"/"en construcción"/"gráfico de ejemplo") |
| **Registrar pago con campo fecha** | `/pacientes/pac-001/pagos/nuevo` → `<input id="pay-date" type="date">` con `<label for="pay-date">Fecha</label>` y valor poblado (`2026-06-01`, ancla del seed; tope `[max]=hoy`) |
| **Detalle de presupuesto: condiciones / válido-hasta** | navegando por click desde la tabla (`/facturacion/presupuestos` → 12 filas → `pre-008`): muestra "Válido hasta el {fecha}" + sección "Condiciones" (presupuesto válido 30 días, ajuste por condiciones clínicas) |
| **Detalle de obra social: historial de liquidaciones** | navegando a `/facturacion/obras-sociales/os-osde`: título "Historial de liquidaciones" con **3 filas reales** (`.osd__settle-row`, período + estado liquidada/en proceso + monto ARS), no el empty-state |
| Errores de consola | 0 en todo el recorrido (4 reportes + pago + presupuesto + obra social) |

> **Notas para el QA Orchestrator (evitar falsos negativos en facturación):**
> - **Las filas de `app-data-table` navegan por `(click)`→`router.navigate()`, NO por `<a href>`.** `data-table.component.ts` renderiza `<tr class="dt__tr" (click)="rowClick.emit(row)">` (desktop) / `.dt__card` (mobile); la lista hace `router.navigate(['/facturacion/presupuestos', b.id])` en `open(b)`. Para abrir un detalle, hacer **click en `app-data-table tbody tr`** y esperar `.bdet__section-title` (presupuesto) o `.osd__patients-title` (obra social) — scrapear `a[href]` da 0 filas → falso FAIL.
> - **No usar `waitUntil:'networkidle'`** contra este SWA: cuelga (socket keep-alive). Usar `domcontentloaded` + `waitForSelector` por markup real.
> - **El deep-link directo a un detalle puede renderizar antes de que hidrate el store** (`seedReadyGuard`) → estado de carga/empty en vez del contenido. Navegar desde la lista por click llega hidratado; si se deep-linkea, esperar el selector del contenido final, no leer el DOM a los ~700ms.
> - Rutas It5: pago = `/pacientes/:id/pagos/nuevo` (`#pay-date`); presupuesto detalle = `/facturacion/presupuestos/:id`; obra social detalle = `/facturacion/obras-sociales/:id`; reportes = `/reportes/{pacientes|tratamientos|financiero|productividad}` (cada uno = `ReportDetailComponent` con `data.tema`).

### Iteración 5 — Re-deploy fix BUG-F01 (ciclo anti-deferral, 2026-06-02, FASE 5) — verificado
Push de `fix: iteration 5 - budget wizard back preserves patient (BUG-F01)` (commit `0c0f5f4`) → run `26858342784` **success** (~1m40s). `headSha` del run == HEAD local pusheado (`0c0f5f4`). Redeploy de **solo código** — sin cambios de infra (SWA, CI/CD y secret siguen igual que en Fase 4). El commit incluye el fix (`src/app/features/billing/budget-create.component.ts`) + los specs/evidencia de la ronda de QA (8 PNG, 11 specs E2E) + reportes en `output/iterations/iteration-5/`. Cambio funcional de **1 archivo**.

**El fix (BUG-F01 / REQ-216):** en el wizard de crear presupuesto (route-per-step), el `<select id="b-pac">` con opciones dinámicas (`@for`) no re-pintaba el paciente preservado al volver "Atrás" — el `[value]` se aplica antes de que existan las `<option>` y el navegador lo descarta, cayendo a "Elegí un paciente". El estado SÍ estaba preservado en `BudgetFlowService`; era un defecto de **view-sync**. Fix: `viewChild('pacSelect')` + `afterNextRender(() => { if (el.value !== id) el.value = id; })` que re-aplica el id preservado una vez materializadas las opciones. No tocó `[value]`/`(change)` ni introdujo `ngModel`.

**Seed byte-idéntico (sin drift):** el churn de `generadoEn` en `public/seed/manifest.json` (timestamp cosmético del `prebuild`) se **descartó** con `git checkout -- public/seed/manifest.json` tras confirmar por `git diff` que era la ÚNICA línea cambiada (datos idénticos: 29 pacientes 12 H / 17 M, 15 docs). CI lo regeneró igual: el log del run muestra `[manifest] 29 pacientes (12 H / 17 M), 15 documentos → public/seed/manifest.json`. Budget OK: `Initial total 431.18 kB / 104.33 kB gzipped` (<500KB error-budget). El bundle servido cambió a `main-UYRA3GV4.js` (desde `main-5NSLIGIB.js` del pre-QA de It5) y el `index.html` desplegado lo referencia → **confirma código realmente desplegado, no caché**.

**Verificación funcional post-deploy (Playwright contra el SWA, 10/10 PASS)** — alcance "deploy exitoso + fix de BUG-F01 reflejado"; la re-verificación QA la hace el QA Orchestrator. Smoke curl previo: root `/`, `/facturacion/presupuestos/nuevo/paciente`, `/facturacion/presupuestos` → 200 `text/html`; `index.html` referencia `main-UYRA3GV4.js`; security headers (CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy) presentes.

| Eje (reproducción exacta de BUG-F01) | Resultado |
|---|---|
| Paso 1 renderiza | título "Seleccioná el paciente"; `<select #b-pac>` arranca vacío (`value===""` = "Elegí un paciente"); **29 opciones** de paciente |
| Selección de paciente (vía `(change)` real) | `selectOption('#b-pac', 'pac-001')` → `value==="pac-001"` ("Bautista Álvarez") |
| "Siguiente" (`.btn-edm--primary`) → Paso 2 | título "Tratamientos a presupuestar"; URL = `.../nuevo/items` |
| "Atrás" (`.btn-edm--secondary`) → Paso 1 | URL de vuelta = `.../nuevo/paciente` |
| **FIX BUG-F01: `<select>` re-muestra el paciente preservado** | tras "Atrás", `value==="pac-001"` mostrando label **"Bautista Álvarez"** — **NO** el placeholder vacío "Elegí un paciente" ✅ |
| Errores de consola | **0** en todo el recorrido |

> **Notas para el QA (re-verificación de BUG-F01 — evitar falso negativo):**
> - El wizard es **route-per-step** (`STEP_ROUTES`): paso 1 = `/facturacion/presupuestos/nuevo/paciente`, paso 2 = `.../items`, paso 3 = `.../confirmar`. El constructor RESETEA el flow si se aterriza en paso 1 sin paciente → para reproducir el bug hay que poblar el estado **como un usuario** (`selectOption` + click "Siguiente"/"Atrás"), no deep-linkear `/items` (dejaría el flow vacío y "Atrás" mostraría vacío legítimamente — falso FAIL).
> - El fix repinta el `<select>` en **`afterNextRender`** (un tick post-render). Leer `#b-pac.value` síncronamente tras "Atrás" puede dar `""` antes del repaint → **sondear** el value (poll corto) o usar `toHaveValue('pac-001')` web-first, no `inputValue()` inmediato.
> - El nota benigna del runner persiste: `error: could not lock config file .git/config: Permission denied` en el step "Post Checkout" es cleanup de la acción `Azure/static-web-apps-deploy`, NO el build/deploy. El run concluyó `success`.

---

## 6. FASE 6 — Deployment de PRODUCCIÓN (2026-06-03, paso 6a) — COMPLETADO Y VERIFICADO

> **Estado: PRODUCCIÓN LIVE y final.** El sitio estuvo desplegándose vía CI/CD durante toda la Fase 4–5; este paso **finaliza** el deployment de producción: valida que el build es óptimo, que las 5 iteraciones completas están en producción, que la config de producción (security headers + SPA fallback + assets) es correcta, que NO hay rastro de demo/mock ni tracking, y **aplica la optimización de fotos** pendiente desde 4e.

**URL de producción:** `https://happy-coast-044ea7e0f.7.azurestaticapps.net`
**Último deploy (perf de fotos):** commit `9093e60` → run `26861211178` **success** (~2m). `headSha` == HEAD local. CI corrió el `prebuild` (`[manifest] 29 pacientes (12 H / 17 M), 15 documentos`).

### 6.1 Build de producción — óptimo ✅
Verificado con `npm run build` local (config `production` por default en `angular.json`):
- **Initial total: `431.18 kB raw / 104.33 kB transfer (gzip)`** → muy por debajo del **<500KB gzip de NFR-002**. El budget en `angular.json` es `initial` warn 500kB / error 1MB (raw); el gzip real (104KB) es ~5× margen.
- **Lazy loading confirmado (ADR-6):** 50+ lazy chunks. Cada feature carga bajo demanda — `calendar-component`, `patient-list/detail/create`, `report-detail` (con charts), `tooth-detail` (odontograma `@defer`), `budget-create/detail`, `obra-social-detail`, `dashboard`, etc. El initial es solo shell + router + persistencia + estilos.
- **Optimización de producción activa:** `optimization.scripts:true`, `fonts:true`, `styles.minify:true`, `inlineCritical:false` (fix histórico de BUG-V01 / FOUC), `outputHashing:all`. **Source maps solo en config `development`** (producción NO los emite).

### 6.2 Las 5 iteraciones completas en producción ✅
Smoke de las 13 rutas clave (todas HTTP 200 `text/html`, SPA fallback OK): `/`, `/agenda`, `/pacientes`, `/pacientes/:id/informacion`, `/pacientes/:id/odontograma`, `/tratamientos`, `/tratamientos/catalogo`, `/facturacion`, `/facturacion/presupuestos`, `/facturacion/obras-sociales`, `/reportes`, `/reportes/financiero`, `/configuracion`. Verificación en navegador real (Playwright, `scripts/prod-verify.mjs`) confirmó **contenido real** (no shell vacío) en Agenda, Tratamientos, Facturación/Presupuestos y Reportes/Financiero (los reportes con gráficos de It5). Los 272 REQ del commit `e5558a0` están servidos.

### 6.3 Config de producción ✅
- **Security headers** (live en la respuesta): `Content-Security-Policy` (estricta: `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`, `connect-src 'self'`, `frame-src 'none'` → **imposible cargar analytics/CRM de terceros**), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), microphone=(), camera=()`. Definidos en `public/staticwebapp.config.json` (ubicación crítica: debe vivir en `public/`, ver §3).
- **SPA fallback** (`navigationFallback` + `responseOverrides.404 → /index.html`): deep-links como `/pacientes/pac-001/odontograma` → 200. Assets excluidos del fallback por extensión (no enmascaran 404 de assets reales).
- **Manifest + assets:** `/seed/manifest.json` 200 `application/json` (29 pacientes / 15 documentos); thumbnails de documentos `foto-*.svg` / `radiografia-*.svg` 200 `image/svg+xml`; fotos de paciente 200 `image/jpeg`.

### 6.4 Cero demo/mock, cero tracking ✅
- `scripts/prod-verify.mjs` escaneó el texto de la home y NO encontró ninguna de: `demo interactivo`, `mock`, `simulaci*`, `viewcase`, `lorem ipsum`, etc. → **limpio**.
- Interceptando TODOS los requests de red del navegador: **0 hits** a hosts de analytics/tracking (google-analytics, gtm, segment, hotjar, mixpanel, doubleclick, facebook, clarity, amplitude, fullstory, intercom). Coherente con ADR-7 y reforzado por la CSP. **0 errores de consola severos.**

### 6.5 Optimización de fotos de pacientes — APLICADA ✅ (perf)
**Problema (detectado en 4e):** las 29 fotos source de pacientes estaban **sin optimizar** — total **67 MB**, con casos extremos como `mujeres/14.jpg` 9.4 MB / 4129×4129px, `hombres/4.jpg` 6.2 MB, `mujeres/70.jpg` 6.4 MB, `mujeres/3.jpg` 6.0 MB. El listado de pacientes renderiza las 29 a la vez y la ficha usa la foto en la cabecera → impacto directo en NFR de performance (<3s en 4G). Medición baseline contra producción: `mujeres/14.jpg` tardaba **~17.2 s** en descargar.

**Acción (low-risk, herramienta nativa de macOS `sips`):** redimensión a **600px de lado máximo** (`-Z 600`, nunca hace upscaling) + recompresión JPEG **calidad 72**. Se optimizaron **AMBOS árboles en lock-step**: el source `input/mockpeople/` (origen de verdad — el `prebuild` copia DESDE aquí) y el desplegado `public/imagenes/pacientes/`, de modo que quedan **byte-idénticos** (mismo md5) y la copia del `prebuild` es un **no-op** → **no hay re-bloat ni drift en futuros builds de CI**. **Nombres de archivo sin cambios** → los paths del `manifest.json` resuelven idénticos; el seed (29 pacientes, edades/géneros) es byte-idéntico.

**Resultado (verificado contra producción tras el deploy):**
| Métrica | Antes | Después |
|---|---|---|
| Payload total de las 29 fotos | **67 MB** | **1.72 MB** (−97%) |
| Peor foto `mujeres/14.jpg` | 9.4 MB / 4129px | **88 KB / 600px** |
| Rango por foto | 67 KB – 9.4 MB | **39–91 KB** |
| Dimensión servida (browser, `naturalWidth`) | hasta 4129px | **600px** (verificado en runtime) |

Las fotos sirven `image/jpeg` 200 con los bytes optimizados (no caché de las gordas) — verificado por tamaño descargado real desde el SWA. El listado usa `loading="lazy"` en los `<img>` (las fotos bajo el fold se difieren correctamente — comportamiento esperado, no un bug). Bundle inalterado (las fotos son assets estáticos, no entran al bundle); el impacto es en el **payload de carga de página**, que es justo lo que mide NFR-002/<3s.

**Commit separado:** `9093e60` `perf: optimize patient photos for production` (58 archivos: 29 source + 29 public, 0 cambios de bundle/código). El manifest NO entró al commit (su churn de `generadoEn` se descartó con `git checkout`; CI lo regenera).

### 6.6 Cómo re-aplicar la optimización (si se agregan fotos nuevas)
Si en el futuro se agregan fotos a `input/mockpeople/`, optimizarlas antes de commitear (mismo criterio):
```bash
# desde la raíz del repo — optimiza source + public en lock-step
for base in input/mockpeople public/imagenes/pacientes; do
  for g in hombres mujeres; do
    for f in "$base/$g"/*.jpg; do
      sips -Z 600 -s format jpeg -s formatOptions 72 "$f" --out "$f"
    done
  done
done
node scripts/generate-manifest.mjs   # regenera manifest (CI lo hace igual)
```
> El budget de bundle (NFR-002) lo sigue protegiendo `ng build` (error a 1MB raw / el gzip real es ~104KB). Las fotos NO afectan el bundle, pero SÍ el tiempo de carga — mantenerlas ≤600px / ~quality 72.

---

## 5. Decisión de suscripción y SKU (resuelta)

**Cómo se llegó al destino final:**
- `CEFSA-prod` tiene la cuota de SWAs **Free** llena (10/10), por lo que un SWA Free ahí no era posible.
- Se exploró `Microsoft Azure Sponsorship` (cuota Free 0/10), pero la cuenta `hola@linkdesign.cr` es invitado externo **sin rol de escritura** ahí (0 asignaciones de rol) y con un desafío de **MFA / Conditional Access** no resoluble de forma no interactiva. Mismo patrón en `FAYCA-prod`.
- **Resolución del cliente:** autorizó el costo y se provisionó en **`CEFSA-prod`** con **SKU Standard** (~$9/mes), que no tiene el límite de 10 y donde la cuenta SÍ tiene permiso de escritura. Esto evita depender de obtener un rol/MFA en otra suscripción.

**Estado del RG:** el `EstudioDentalMendieta-RG` que antes se había eliminado de CEFSA-prod fue **recreado** en `eastus2` y ahora contiene el SWA. No queda basura.

### Costo y nota de facturación
El SWA Standard genera ~**$9/mes** en `CEFSA-prod`. **Costo autorizado explícitamente por el cliente.** Si en el futuro se libera un slot Free en alguna suscripción accesible (eliminando un SWA Free obsoleto), se podría migrar a Free para eliminar el cargo — pero no es necesario para operar.
