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

---

## 5. Decisión de suscripción y SKU (resuelta)

**Cómo se llegó al destino final:**
- `CEFSA-prod` tiene la cuota de SWAs **Free** llena (10/10), por lo que un SWA Free ahí no era posible.
- Se exploró `Microsoft Azure Sponsorship` (cuota Free 0/10), pero la cuenta `hola@linkdesign.cr` es invitado externo **sin rol de escritura** ahí (0 asignaciones de rol) y con un desafío de **MFA / Conditional Access** no resoluble de forma no interactiva. Mismo patrón en `FAYCA-prod`.
- **Resolución del cliente:** autorizó el costo y se provisionó en **`CEFSA-prod`** con **SKU Standard** (~$9/mes), que no tiene el límite de 10 y donde la cuenta SÍ tiene permiso de escritura. Esto evita depender de obtener un rol/MFA en otra suscripción.

**Estado del RG:** el `EstudioDentalMendieta-RG` que antes se había eliminado de CEFSA-prod fue **recreado** en `eastus2` y ahora contiene el SWA. No queda basura.

### Costo y nota de facturación
El SWA Standard genera ~**$9/mes** en `CEFSA-prod`. **Costo autorizado explícitamente por el cliente.** Si en el futuro se libera un slot Free en alguna suscripción accesible (eliminando un SWA Free obsoleto), se podría migrar a Free para eliminar el cargo — pero no es necesario para operar.
