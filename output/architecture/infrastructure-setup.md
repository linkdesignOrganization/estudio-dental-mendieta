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
| **Azure Static Web Apps** | ⛔ **BLOQUEADO — cuota Free agotada en `CEFSA-prod` (ver más abajo)** |
| Secret del repo `AZURE_STATIC_WEB_APPS_API_TOKEN` | ⛔ Pendiente (depende del SWA) |
| Primer deploy real | ⛔ Pendiente (lo dispara Fase 4 al pushear el código Angular, una vez exista el SWA) |

> **Resumen:** Todo lo controlable por DevOps está listo. El **único bloqueo** es la creación del recurso Azure Static Web Apps en la suscripción indicada por agotamiento de la cuota Free. Requiere una decisión del cliente/PM (opciones abajo). El repo y el CI/CD quedan a **un paso** de funcionar: en cuanto exista el SWA, se obtiene su deployment token, se carga como secret del repo, y el pipeline despliega.

---

## 1. Repositorio GitHub

- **Org / nombre:** `linkdesignOrganization/estudio-dental-mendieta`
- **Visibilidad:** Público
- **URL:** https://github.com/linkdesignOrganization/estudio-dental-mendieta
- **Rama principal:** `main`
- **Cuenta gh usada:** `roberthcstllo` (autenticada, scopes `repo`, `workflow`, `read:org`)
- **Identidad de commits local:** `roberthcstllo <hola@linkdesign.cr>`

El proyecto era un directorio sin control de versiones; se ejecutó `git init`, se crearon los archivos de infra/config y la documentación, y se conectó al remoto.

---

## 2. Azure Static Web Apps (frontend deploy target)

> ⛔ **NO PROVISIONADO** por bloqueo de cuota (ver sección "Bloqueo" más abajo).
> Esta sección queda como especificación lista para ejecutar en cuanto se desbloquee.

| Parámetro | Valor planificado |
|---|---|
| Suscripción | `CEFSA-prod` — `4bdfcf40-ec56-4258-92e9-6f31b977a808` |
| Resource group | `EstudioDentalMendieta-RG` (✅ **ya creado**, vacío, en `eastus2`) |
| Nombre del recurso SWA | `estudio-dental-mendieta` |
| Región | `East US 2` (`eastus2`) |
| SKU / Tier | **Free** (sin costo) |
| Hostname default | _(se asigna al crear: `https://<random>.azurestaticapps.net`)_ |
| `api_location` | _(vacío — frontend-only, sin Functions)_ |

**Comando para provisionar (una vez desbloqueado):**
```bash
az account set --subscription 4bdfcf40-ec56-4258-92e9-6f31b977a808
az staticwebapp create \
  --name "estudio-dental-mendieta" \
  --resource-group "EstudioDentalMendieta-RG" \
  --location "eastus2" \
  --sku "Free"
```
(SWA standalone, sin `--source`/`--login-with-github`: el CI/CD lo gestiona el workflow ya versionado, no la inyección automática de Azure.)

**Obtener el deployment token y cargarlo como secret del repo:**
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
- **Secret requerido:** `AZURE_STATIC_WEB_APPS_API_TOKEN` (deployment token del SWA). ⛔ Pendiente hasta crear el SWA.
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

# (Una vez exista el SWA) URL pública:
az staticwebapp show \
  --name estudio-dental-mendieta \
  --resource-group EstudioDentalMendieta-RG \
  --query "defaultHostname" -o tsv
```

**Tiempo estimado de deploy:** ~2–4 min por push (checkout + `npm ci` + `ng build` + upload). El primer build es algo más lento (sin caché de npm).

---

## 5. ⛔ Bloqueo activo — Cuota Free de Static Web Apps agotada

**Síntoma:** `az staticwebapp create ... --sku Free` falla con:
> `Sku is invalid. This subscription has too many static sites with SKU: Free.`

**Causa:** Azure limita las Static Web Apps **Free a 10 por suscripción**. La suscripción objetivo `CEFSA-prod` ya tiene **10/10** Free en uso:

| # | SWA Free existente en CEFSA-prod | Resource group |
|---|---|---|
| 1 | uga-gate-scanner | UgaFront |
| 2 | nano-frontend | NanoFront |
| 3 | vertice-frontend | VerticeFront |
| 4 | punto-cero-web | PuntoCeroFront |
| 5 | alturaraiz-swa-0218215354 | AlturaRaiz-RG |
| 6 | wedrivecr-web | WeDriveCR-Front |
| 7 | tierrafertil-frontend | WebSite |
| 8 | cajamaestra-frontend | WebSite |
| 9 | linkdesign-crm | WebSite |
| 10 | vahu-vet-demo | VahuVet-RG |

(Además existe 1 SWA Standard: `hesa-coming-soon`, que no cuenta contra la cuota Free.)

### Opciones para desbloquear (requiere decisión del cliente/PM)
1. **Liberar un slot Free en `CEFSA-prod`** — eliminar (o subir a Standard) algún SWA Free obsoleto de la lista. Tras liberar uno, el comando de la sección 2 funciona sin cambios. **Sin costo nuevo.** *(Requiere identificar cuál SWA es descartable — decisión del cliente.)*
2. **Usar otra suscripción con cuota Free disponible** (verificado, read-only):
   - `Microsoft Azure Sponsorship` → **0/10** Free en uso (capacidad total disponible).
   - `FAYCA-prod` (`58451a1e-faee-40bc-af12-fb5f0eb88fcb`) → **0/10** Free en uso.
   - El cliente había fijado `CEFSA-prod`; cambiar de suscripción requiere su confirmación. **Sin costo nuevo.**
3. **Crear el SWA en `CEFSA-prod` con SKU Standard** — sin límite de 10, pero **tiene costo mensual**. El cliente pidió Free/sin costo, así que esta opción solo si acepta el cargo.

**Recomendación de DevOps:** Opción 1 (liberar un slot Free en `CEFSA-prod`) si hay algún SWA descartable, o si no, Opción 2 con `Microsoft Azure Sponsorship`. Ambas mantienen costo cero. Se evita la Opción 3 salvo aprobación explícita del cargo.

> El resource group `EstudioDentalMendieta-RG` (eastus2) ya está creado y vacío, listo para recibir el SWA en cuanto se desbloquee con cualquiera de las opciones 1 o 3. Para la opción 2 se crearía el RG en la suscripción elegida.
