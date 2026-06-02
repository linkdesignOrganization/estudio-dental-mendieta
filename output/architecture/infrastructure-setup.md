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
| RG orfano `EstudioDentalMendieta-RG` en `CEFSA-prod` | ✅ **Eliminado** (estaba vacío — limpieza realizada) |
| **Azure Static Web Apps** | ⛔ **BLOQUEADO — sin permiso de escritura en la suscripción `Sponsorship` (MFA + sin rol). Ver "Bloqueo activo".** |
| Secret del repo `AZURE_STATIC_WEB_APPS_API_TOKEN` | ⛔ Pendiente (depende del SWA) |
| Primer deploy real | ⛔ Pendiente (lo dispara Fase 4 al pushear el código Angular, una vez exista el SWA) |

> **Resumen:** Todo lo controlable por DevOps con la cuenta actual está listo. El cliente decidió mover el SWA a la suscripción **`Microsoft Azure Sponsorship`** (verificada con **0/10** SWAs Free → hay cuota). Sin embargo, **la identidad disponible no puede provisionar en esa suscripción**: el intento de crear el resource group falla con `AuthorizationFailed` (la cuenta `hola@linkdesign.cr` no tiene rol Contributor/Owner ahí) y el intento de crear el recurso dispara además un desafío de **MFA / Conditional Access** (`AADSTS50076`) que exige un `az login` interactivo en el tenant de Sponsorship. Ninguno de los dos es resoluble de forma no interactiva. Requiere una credencial con acceso de escritura (y MFA satisfecha) a la suscripción Sponsorship, o una nueva decisión del cliente (ver opciones abajo).

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

> ⛔ **NO PROVISIONADO.** El destino acordado es la suscripción **`Microsoft Azure Sponsorship`**, pero la cuenta disponible no tiene permiso para crear recursos ahí (ver sección "Bloqueo activo"). Esta sección queda como especificación lista para ejecutar en cuanto se disponga de una credencial con acceso de escritura a Sponsorship.

| Parámetro | Valor planificado |
|---|---|
| Suscripción | **`Microsoft Azure Sponsorship`** — `14ace2c9-8dcc-498a-8cc3-ba92a1337967` (0/10 SWAs Free → cuota disponible) |
| Resource group | `EstudioDentalMendieta-RG` (a crear en Sponsorship — el de CEFSA-prod ya fue **eliminado**) |
| Nombre del recurso SWA | `estudio-dental-mendieta` |
| Región | `East US 2` (`eastus2`) |
| SKU / Tier | **Free** (sin costo) |
| Hostname default | _(se asigna al crear: `https://<random>.azurestaticapps.net`)_ |
| `api_location` | _(vacío — frontend-only, sin Functions)_ |

**Comandos para provisionar (con una credencial autorizada en Sponsorship):**
```bash
# Autenticación interactiva con MFA en el tenant de Sponsorship (requerido — ver bloqueo):
az login --tenant 0906487b-e3fa-493e-b62c-138417415de7

az account set --subscription 14ace2c9-8dcc-498a-8cc3-ba92a1337967
az group create --name "EstudioDentalMendieta-RG" --location "eastus2"
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
- **Secret requerido:** `AZURE_STATIC_WEB_APPS_API_TOKEN` (deployment token del SWA). ⛔ Pendiente hasta crear el SWA. Sin el secret, el step de deploy falla con `deployment_token was not provided` (esperado hasta que exista el SWA).
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
  --subscription 14ace2c9-8dcc-498a-8cc3-ba92a1337967 \
  --query "defaultHostname" -o tsv
```

**Tiempo estimado de deploy:** ~2–4 min por push (checkout + `npm ci` + `ng build` + upload). El primer build es algo más lento (sin caché de npm).

---

## 5. Limpieza realizada — RG orfano en CEFSA-prod

El resource group `EstudioDentalMendieta-RG` que se había creado en la suscripción `CEFSA-prod` (`4bdfcf40-ec56-4258-92e9-6f31b977a808`) quedó **vacío** tras descartar esa suscripción como destino (su cuota Free está 10/10). Se verificó que no contenía recursos y se **eliminó** (`az group delete ... --yes`; `az group exists` → `false`). No queda basura en CEFSA-prod.

---

## 6. ⛔ Bloqueo activo — Sin acceso de escritura en la suscripción Sponsorship

**Contexto:** El cliente decidió provisionar el SWA en `Microsoft Azure Sponsorship` (`14ace2c9-8dcc-498a-8cc3-ba92a1337967`) porque tiene cuota Free (0/10). La cuota **sí está disponible**; el problema es de **permisos/identidad**, no de cuota.

**Síntomas (dos barreras independientes, ambas no resolubles de forma no interactiva):**

1. **Sin rol de escritura.** `az group create` en Sponsorship falla con:
   > `(AuthorizationFailed) The client 'live.com#hola@linkdesign.cr' ... does not have authorization to perform action 'Microsoft.Resources/subscriptions/resourcegroups/write' over scope '/subscriptions/14ace2c9-.../resourcegroups/EstudioDentalMendieta-RG'`
   La cuenta es un invitado externo (`hola_linkdesign.cr#EXT#@asembiscr.onmicrosoft.com`) y `az role assignment list` muestra **0 asignaciones de rol** para ella en esa suscripción. Puede *leer* (por eso el conteo de cuota funciona) pero no *escribir*.

2. **MFA / Conditional Access.** El intento de crear el recurso dispara:
   > `AADSTS50076: ... you must use multi-factor authentication ...` (requiere `az login --tenant 0906487b-e3fa-493e-b62c-138417415de7 --claims-challenge ...` interactivo).
   El entorno de automatización no puede completar el flujo interactivo de MFA.

> Nota: la suscripción `FAYCA-prod` (`58451a1e-faee-40bc-af12-fb5f0eb88fcb`) también tiene cuota Free (0/10) pero presenta el **mismo patrón**: lectura OK, **0 asignaciones de rol** para esta cuenta → mismo bloqueo de escritura esperado.

### Qué se necesita para desbloquear (decisión/acción del cliente)
Una de estas tres, en orden de preferencia de DevOps:

1. **(Recomendado) Credencial con acceso de escritura a Sponsorship.** Que el cliente:
   - asigne el rol **Contributor** (a nivel de la suscripción Sponsorship, o al menos sobre un RG dedicado) a la cuenta `hola@linkdesign.cr`, **y** complete una vez el `az login --tenant 0906487b-e3fa-493e-b62c-138417415de7` con MFA en este equipo; **o**
   - provea otra cuenta (p. ej. del tenant `asembiscr`) que ya tenga Contributor + MFA satisfecha para ejecutar los comandos de la sección 2.

2. **Volver a `CEFSA-prod` liberando un slot Free.** `CEFSA-prod` tiene cuota 10/10; si el cliente identifica un SWA Free obsoleto que se pueda eliminar (o subir a Standard), se libera un slot y se provisiona ahí con la cuenta actual (que **sí** tiene acceso de escritura a CEFSA-prod). Sin costo nuevo. *(Requiere que el cliente diga cuál SWA es descartable — ver lista en el historial: uga-gate-scanner, nano-frontend, vertice-frontend, punto-cero-web, alturaraiz-swa, wedrivecr-web, tierrafertil-frontend, cajamaestra-frontend, linkdesign-crm, vahu-vet-demo.)*

3. **SWA Standard en `CEFSA-prod`.** Sin límite de 10, pero **con costo mensual**. Solo si el cliente acepta el cargo (pidió Free/sin costo).

**Recomendación de DevOps:** Opción 1 (otorgar Contributor + completar MFA en Sponsorship) — mantiene el destino que el cliente eligió y costo cero. Si no es viable a corto plazo, Opción 2 sobre CEFSA-prod (también costo cero, y la cuenta actual ya tiene acceso de escritura ahí).
