# Verificación Post-Deployment (paso 6a-verify) — Estudio Dental Mendieta

> **Modo:** NORMAL · **Fecha:** 2026-06-03
> **Objetivo:** auditar qué cambió en el deployment de PRODUCCIÓN (Fase 6) respecto al estado de fin de Fase 5, y producir la lista de **áreas afectadas** que la validación post-deployment (paso 6b) debe re-verificar contra producción.
> **URL de producción:** `https://happy-coast-044ea7e0f.7.azurestaticapps.net`

---

## Resumen ejecutivo

El deployment de producción **NO contiene cambios de código ni de configuración**: es **exclusivamente la optimización de los 29 assets de foto de paciente** (redimensión a 600px + recompresión JPEG q72). El diff `e5558a0..HEAD` (fin de Fase 5 → producción), excluyendo `output/`, son **58 archivos, todos `.jpg`, con 0 inserciones / 0 borrados** de texto (solo contenido binario).

- **NO hay cambio de TOPOLOGÍA.** Sigue siendo 1 dominio (la SWA Standard), frontend-only, sin backend, sin auth real, sin servicios cloud adicionales. No existe el típico salto "1 dominio local → 2 dominios producción" porque **nunca hubo backend**. Auth, storage (localStorage), CSP/headers y rutas son idénticos a Fase 5.
- **NO hay lógica condicional `if (production)`** introducida. No hay rutas de ejecución nuevas no testeadas.
- **Paths y seed byte-idénticos.** Los nombres de archivo no cambiaron → `manifest.json` resuelve los mismos paths; el seed (29 pacientes, 12 H / 17 M, edades/géneros codificados en el nombre) queda igual. `manifest.json` y `scripts/generate-manifest.mjs` **no aparecen en el diff** del deployment.

**Nivel de riesgo global: BAJO** y acotado al render/performance de las fotos de paciente. No hay cambios de alto riesgo sin cobertura de tests que bloqueen.

---

## 1. Evidencia del cambio (qué tocó el deployment)

| Verificación | Resultado |
|---|---|
| Diff `e5558a0..HEAD` (excl. `output/`), agrupado por extensión | **58 archivos, 100% `.jpg`** — `0 insertions(+), 0 deletions(-)` |
| Archivos NO-imagen / NO-output en el diff (código o config) | **Ninguno** (filtro `:!*.jpg :!*.jpeg :!*.png :!*.svg` → vacío) |
| `public/seed/manifest.json` + `scripts/generate-manifest.mjs` en el diff | **No presentes** (paths y seed intactos) |
| Fotos source (`input/mockpeople/`) vs desplegadas (`public/imagenes/pacientes/`) | **Byte-idénticas** (mismo md5 en muestra de 4: `hombres/1`, `hombres/4`, `mujeres/14`, `mujeres/70`) → la copia del `prebuild` es no-op, sin re-bloat ni drift futuro |
| Dimensiones servidas (muestra `sips`) | `mujeres/14.jpg` y `hombres/4.jpg` → **600×600px** (antes hasta 4129px) |
| Commit del deployment | `9093e60` `perf: optimize patient photos for production` (run `26861211178` success) |

**Resultado de la optimización (infrastructure-setup §6.5):** payload de las 29 fotos **67 MB → 1.72 MB (−97%)**; peor caso `mujeres/14.jpg` 9.4 MB/4129px → 88 KB/600px; baseline de descarga de esa foto contra producción era **~17.2 s**. El bundle JS/CSS **no cambia** (las fotos son assets estáticos, no entran al bundle); el impacto es en el **payload de carga de página**, justo lo que mide NFR-001 (<3s en 4G).

---

## 2. Áreas de la app afectadas

La optimización cambia **solo el contenido de las imágenes** (más chicas / más comprimidas), no los paths ni el código. Las superficies donde se renderizan fotos de paciente son:

| Área | Dónde / componente | Cómo consume la foto |
|---|---|---|
| **A1 — Lista de pacientes** (avatar pequeño) | `patient-list.component.ts` → `<app-avatar [src]="p.fotoPath" size="sm">` (32px). Renderiza las **29 fotos a la vez** | foto pequeña vía `app-avatar` |
| **A2 — Ficha del paciente** (foto grande del header) | `patient-detail.component.ts` → `<app-avatar [src]="p.fotoPath" size="xl">` (120px) | foto grande de cabecera |
| **A3 — Otros renders de foto de paciente** | `patient-create.component.ts` (preview, `size="lg"` 88px) y cualquier avatar de paciente en turnos/agenda/notificaciones que use `app-avatar` con `fotoPath` | mismo componente compartido `app-avatar` |
| **A4 — Carga / performance de página** | Listado (29 fotos) + ficha (foto de cabecera) | **objetivo directo** de la optimización; impacta LCP/TTI en 4G (NFR-001) |

> **Nota de aislamiento:** los **thumbnails de documentos** (REQ-058 / tab Documentos) son **SVG autoalojados** (`public/imagenes/documentos/*.svg`) y **NO se tocaron** en este deployment → fuera de alcance. Igual el avatar del usuario logueado "AD" (REQ-010) es de iniciales, no foto.

---

## 3. Evaluación de riesgo y cobertura de tests

**Por qué el riesgo de render es BAJO (el código absorbe el cambio):**
- El componente compartido `app-avatar` usa **tamaños fijos en px** (sm=32, lg=88, xl=120) con `object-fit: cover` → la resolución de la imagen source es **irrelevante** para el layout; una foto de 600px se muestra idéntica a una de 4129px en el círculo del avatar (solo cambia la nitidez, que a q72/600px es visualmente aceptable para 32–120px).
- `app-avatar` tiene **fallback determinista anti-imagen-rota**: `(error)="failed.set(true)"` → si una foto fallara (no es el caso, los bytes están bien), muestra iniciales, **nunca** el ícono roto del navegador.
- Como **los paths no cambian**, todo el contrato de render (src, alt, lazy, fallback) es el mismo que QA ya validó en Fase 4/5.

**Tests existentes que cubren las áreas afectadas (ya en el repo, corren contra estas pantallas):**

| Spec | Qué asegura | Cubre |
|---|---|---|
| `e2e/tests/visual/DC-050-077-components.spec.ts` (DC-055/078) | "avatar/foto: imagen o iniciales, **NUNCA imagen rota**" — 0 `<img>` con `complete && naturalWidth===0` | A1, A2, A3 |
| `e2e/tests/visual/DC-100-119-ui-states.spec.ts` | mismo patrón anti-imagen-rota en estados de UI | A1, A2 |
| `e2e/tests/edge-case/UX-041-052-estados-vacios.spec.ts` | detecta `naturalWidth===0` con src cargado (imagen rota) | A1, A2 |
| `e2e/tests/flow/UX-multipaso-cierre.spec.ts` | recorrido transversal sin imágenes rotas | A1, A2, A3 |
| `e2e/tests/flow/REQ-173-179-crear-paciente-genero.spec.ts` | sin imágenes rotas en el flujo de crear | A3 |

→ El contrato funcional "la foto se muestra correctamente en lista y ficha" (**REQ-046**) y "nunca imagen rota" (**REQ-159/179 / DC-055/078**) **YA está cubierto por tests automatizados existentes** sobre las pantallas afectadas. Como solo cambiaron bytes (no paths/código), estos tests siguen siendo válidos y deberían pasar igual.

**Gap de cobertura (lo único sin test automatizado):**
- **NFR-001 — tiempo de carga inicial <3s en 4G.** No existe un test automatizado de *timing* de carga de página (el único budget automatizado es **NFR-002** bundle <500KB, que hace fallar `ng build`; pero las fotos **no afectan el bundle**, así que ese budget no mide esta mejora). La ganancia de performance (−97% de payload, el caso de ~17.2s eliminado) **no tiene aserción automatizada** → debe verificarse manualmente/observacionalmente contra producción en 6b. Riesgo de *regresión* es nulo (solo mejora), pero conviene **confirmar la mejora real** y la **calidad visual aceptable** de las fotos optimizadas, que ningún test pixel valida.

**Cambios de alto riesgo sin cobertura:** **Ninguno.** No hay cambios de topología, auth, storage, CSP/headers ni lógica condicional. El único ítem sin test automatizado (NFR-001 timing / calidad visual de las fotos) es de **bajo riesgo** y se cubre con re-verificación observacional en 6b.

---

## 4. Lista de áreas a RE-VERIFICAR en 6b (contra producción)

Recorrido acotado — todo contra `https://happy-coast-044ea7e0f.7.azurestaticapps.net`:

1. **A1 — Lista de pacientes (`/pacientes`):** las 29 fotos cargan, **no rotas** (`naturalWidth > 0`), se ven nítidas/aceptables en el avatar pequeño (32px), y el listado no presenta huecos. Verificar `loading="lazy"` no rompe la primera vista (las de abajo del fold se difieren — comportamiento esperado, no bug).
2. **A2 — Ficha del paciente (`/pacientes/:id/informacion`):** la foto grande del header (120px) carga, no rota, calidad visual aceptable; al cambiar de tab la cabecera no recarga (REQ-169).
3. **A3 — Otros renders:** preview en crear paciente y cualquier avatar de paciente con foto (agenda/turnos/notificaciones) sin imágenes rotas.
4. **A4 — Performance / carga:** confirmar **mejora real** del tiempo de carga del listado y de la ficha (payload de fotos ~1.72 MB vs 67 MB). Verificar que producción sirve los **bytes optimizados** (tamaño descargado pequeño + `image/jpeg`, **no** la versión gorda en caché ni SPA-fallback enmascarado: validar `content_type=image/jpeg`, no solo el status). Confirmar `naturalWidth ≈ 600px` en runtime (no 4129px).
5. **Sanidad de paths/seed (rápida):** `/seed/manifest.json` 200 `application/json` con 29 pacientes y los mismos paths; una foto de path real del manifest → 200 `image/jpeg`. (Esperado idéntico a Fase 5 — los paths no cambiaron.)

**Fuera de alcance de 6b (no afectado por este deployment):** thumbnails SVG de documentos, lógica de seed/saldos, rutas, security headers, auth, facturación/reportes/agenda — sin cambios desde Fase 5; la validación funcional integral ya la hizo el QA Orchestrator en Fase 5.

---

## Resultado: COMPLETADO

- **Áreas afectadas: 4** (A1 lista de pacientes, A2 ficha del paciente, A3 otros renders de foto de paciente, A4 carga/performance).
- **Alto riesgo: NO.** Cambio solo de assets (−97% payload), sin cambios de topología/código/config; contrato de render cubierto por tests existentes; único ítem sin test automatizado = NFR-001 timing/calidad visual (bajo riesgo, re-verificación observacional en 6b).
