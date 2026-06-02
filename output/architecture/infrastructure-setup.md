# Infrastructure Setup — Estudio Dental Mendieta

> **Owner:** DevOps. Leído por Developer, Plan Verifier, QA Orchestrator y DevOps (modos posteriores).
> **Fase:** 3.5 — Setup de Deploy para Demo (SWA + CI/CD).
> **Fecha:** 2026-06-01.

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
| Primer deploy real | ⏳ Pendiente (lo dispara Fase 4 al pushear el código Angular; ahora la app aún no existe) |

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
- **Acción:** `Azure/static-web-apps-deploy@v1` (Oryx detecta Angular y corre `npm ci && npm run build`).
- **Secret requerido:** `AZURE_STATIC_WEB_APPS_API_TOKEN` (deployment token del SWA). ✅ **Cargado** (2026-06-02). El CI/CD está completamente cableado; el deploy fallará por ahora solo porque la app Angular todavía no existe (se scaffoldea en Fase 4) — no por falta de token.
- **Node:** el workflow fija Node 22 (Angular 21 requiere `^20.19 || ^22.12 || >=24`).

### Configuración de build (alineación con Fase 4 — IMPORTANTE)
El workflow declara:
- `app_location: "/"` → el proyecto Angular vive en la **raíz** del repo.
- `api_location: ""` → sin backend.
- `output_location: "dist/estudio-dental-mendieta/browser"` → salida del `@angular/build` (`application`).

> ⚠️ **Para el Developer (Fase 4):** El `output_location` asume que el proyecto Angular se llama **`estudio-dental-mendieta`** (carpeta `dist/estudio-dental-mendieta/browser`). Al scaffoldear con `ng new`, usar ese nombre de proyecto **o** ajustar `output_location` en el workflow al nombre real (`dist/<tu-app>/browser`). Si no coinciden, el deploy subirá una carpeta vacía / fallará.

### Seed dinámico (prebuild)
La arquitectura (GAP-A02) requiere generar `manifest.json` en build-time desde `input/mockpeople/`. Oryx ejecuta `npm run build`; si `package.json` define un script `"prebuild": "node scripts/generate-manifest.mjs"`, npm lo corre automáticamente antes del build (genera `manifest.json` y copia las fotos a la carpeta de assets / `public/`). **No requiere un paso extra en el workflow.** El Developer debe crear ese script y el hook `prebuild` en Fase 4.

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

**Tiempo estimado de deploy:** ~2–4 min por push (checkout + `npm ci` + `ng build` + upload). El primer build es algo más lento (sin caché de npm).

---

## 5. Decisión de suscripción y SKU (resuelta)

**Cómo se llegó al destino final:**
- `CEFSA-prod` tiene la cuota de SWAs **Free** llena (10/10), por lo que un SWA Free ahí no era posible.
- Se exploró `Microsoft Azure Sponsorship` (cuota Free 0/10), pero la cuenta `hola@linkdesign.cr` es invitado externo **sin rol de escritura** ahí (0 asignaciones de rol) y con un desafío de **MFA / Conditional Access** no resoluble de forma no interactiva. Mismo patrón en `FAYCA-prod`.
- **Resolución del cliente:** autorizó el costo y se provisionó en **`CEFSA-prod`** con **SKU Standard** (~$9/mes), que no tiene el límite de 10 y donde la cuenta SÍ tiene permiso de escritura. Esto evita depender de obtener un rol/MFA en otra suscripción.

**Estado del RG:** el `EstudioDentalMendieta-RG` que antes se había eliminado de CEFSA-prod fue **recreado** en `eastus2` y ahora contiene el SWA. No queda basura.

### Costo y nota de facturación
El SWA Standard genera ~**$9/mes** en `CEFSA-prod`. **Costo autorizado explícitamente por el cliente.** Si en el futuro se libera un slot Free en alguna suscripción accesible (eliminando un SWA Free obsoleto), se podría migrar a Free para eliminar el cargo — pero no es necesario para operar.
