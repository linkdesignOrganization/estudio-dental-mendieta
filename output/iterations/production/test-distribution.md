# Plan de Distribución — Validación Post-Deployment (Fase 6, paso 6b-plan)

> **Modo:** PRODUCCIÓN (6b — validación real post-deployment, NO smoke testing) · **Fecha:** 2026-06-03
> **Generado por:** QA Orchestrator · **Leen este archivo:** Flow Tester y Visual Checker (Auto-Dispatch).
> **Insumo:** `output/iterations/production/deployment-impact.md` (plan-verifier, 6a-verify) — deployment de producción **finalizado**.

---

## Contexto de Testing
- **Fase / paso:** 6 — Validación Post-Deployment (6b)
- **URL de PRODUCCIÓN (única):** `https://happy-coast-044ea7e0f.7.azurestaticapps.net`
- **URL del backend:** _N/A — frontend-only, sin backend (localStorage)._
- **Cambio del deployment:** **exclusivamente la optimización de las 29 fotos de paciente** (redimensión a 600px de lado máx + recompresión JPEG q72 → **67 MB → 1.72 MB, −97%**). Paths **byte-idénticos** (mismo `manifest.json`), **0 cambios de código, config o topología**. Commit `9093e60`, run `26861211178` success.
- **Nivel de riesgo (de 6a-verify):** **BAJO**, acotado al render/performance de las fotos de paciente. Sin cambios de alto riesgo sin cobertura.
- **Áreas afectadas (de 6a-verify):** A1 lista de pacientes (avatar 32px, 29 fotos a la vez), A2 ficha del paciente (foto header 120px), A3 otros renders de foto de paciente (preview crear 88px, avatares en agenda/turnos/notificaciones), A4 carga/performance de página.

### Topología (sin cambio — 1 dominio, frontend-only)
**NO hay salto "1 dominio local → 2 dominios producción"** porque **nunca hubo backend.** Auth (mock), storage (localStorage), CSP/headers y rutas son **idénticos a Fase 5**. Por eso las verificaciones de topología de 6b se **reducen** a las que aplican a un sitio de **1 solo dominio sin backend**:

| Verificación de topología (6b estándar) | Aplica aquí | Por qué |
|---|---|---|
| 1. Acceso público sin autenticación | **SÍ** | confirmar que la SWA sirve la app sin login real desde el dominio público |
| 2. CORS frontend ↔ backend | **N/A** | no hay backend ni llamadas cross-origin (`connect-src 'self'`) |
| 3. CSP no bloquea scripts/estilos/conexiones | **SÍ** | la CSP estricta debe permitir la app propia y bloquear terceros |
| 4. URLs generadas apuntan al destino correcto | **SÍ (acotado)** | paths de fotos/manifest resuelven al mismo origen; sin URLs absolutas externas |
| 5. Assets desde cloud storage | **N/A → reemplazado** | no hay blob/CDN externo; los assets (fotos JPEG + SVG) se sirven desde la propia SWA → verificar que sirven con `content_type` correcto, no SPA-fallback enmascarado |
| Acceso a features públicas desde "ambos dominios" | **N/A** | hay un solo dominio |

---

## Tarea 1 — Regresión completa contra producción → **EJECUTA EL PM** (NO sub-testers)

> **Esta tarea NO se asigna a ningún sub-tester.** La suite automatizada completa (~770 tests, ~56 specs) **ya está escrita y ya corre contra la URL de producción** (es la misma URL contra la que corrió toda la Fase 4–5). NO hay que re-generar ni re-diseñar specs: solo **re-ejecutarla** como regresión de cierre.

- **Comando (PM):** `run-regression.sh` → `npx playwright test e2e/tests/` contra `https://happy-coast-044ea7e0f.7.azurestaticapps.net`.
- **Salida esperada:** los resultados van a `output/iterations/production/regression-results.md` (lo lee el QA Orchestrator en 6b-consolidate).
- **Cobertura de las áreas afectadas por la suite existente** (de 6a-verify — el contrato funcional de las fotos ya está cubierto, los specs siguen válidos porque solo cambiaron bytes, no paths):
  | Spec | Asegura | Cubre |
  |---|---|---|
  | `e2e/tests/visual/DC-050-077-components.spec.ts` (DC-055/078) | avatar/foto: imagen o iniciales, **NUNCA imagen rota** (0 `<img>` con `complete && naturalWidth===0`) | A1, A2, A3 |
  | `e2e/tests/visual/DC-100-119-ui-states.spec.ts` | mismo patrón anti-imagen-rota en estados de UI | A1, A2 |
  | `e2e/tests/edge-case/UX-041-052-estados-vacios.spec.ts` | detecta `naturalWidth===0` con src cargado (imagen rota) | A1, A2 |
  | `e2e/tests/flow/UX-multipaso-cierre.spec.ts` | recorrido transversal sin imágenes rotas | A1, A2, A3 |
  | `e2e/tests/flow/REQ-173-179-crear-paciente-genero.spec.ts` | sin imágenes rotas en el flujo de crear | A3 |
- **Veredicto de regresión esperado:** 0 fallos. Cualquier fallo se consolida en `qa-report.md` y dispara ciclo de corrección (Developer), NO se difiere.

---

## Asignación: Visual Checker → e2e/tests/visual/

> **PRIORIDAD #1 de 6b.** Es el cambio del deployment: verificar que las fotos optimizadas se ven bien, no están rotas, mejoraron el performance, y que producción sirve los **bytes optimizados** (no la versión gorda en caché). Además, sanity de topología/producción de 1 dominio.

### Criterios / áreas asignadas
- **A1 — Lista de pacientes** (`/pacientes`): las **29 fotos** cargan, **no rotas** (`naturalWidth > 0`), se ven nítidas/aceptables en el avatar pequeño (32px); el listado no presenta huecos. **REQ-046** (foto se muestra correctamente en lista y ficha). NOTA: `loading="lazy"` difiere las fotos bajo el fold → **comportamiento esperado, NO bug**; no marcar las diferiridas como rotas.
- **A2 — Ficha del paciente** (`/pacientes/:id/informacion`): la foto grande del header (120px) carga, no rota, calidad visual aceptable. **REQ-046**. Al cambiar de tab, la cabecera no recarga (REQ-169 — ya cubierto, solo no romper).
- **A3 — Otros renders de foto** (preview en crear paciente 88px + cualquier avatar de paciente con foto en agenda/turnos/notificaciones): sin imágenes rotas. **REQ-159 / REQ-179 / DC-055/078** (placeholder controlado, nunca ícono roto del navegador).
- **A4 / NFR-001 — Performance (observacional):** confirmar **mejora real** del tiempo de carga del listado (29 fotos) y de la ficha. **NFR-001: carga inicial < 3 s en 4G** (objetivo). Verificar que producción sirve los **bytes optimizados**: tamaño descargado pequeño por foto (esperado **39–91 KB**, peor caso `mujeres/14.jpg` ~88 KB) + `content_type=image/jpeg`; **`naturalWidth ≈ 600px`** en runtime (NO 4129px). Esto NO tiene aserción automatizada (único gap de cobertura de 6a) → es la verificación observacional que justifica el sub-tester.
- **Topología/producción (1 dominio):**
  - **Security headers presentes** en la respuesta de producción: `Content-Security-Policy` (estricta), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
  - **CERO demo/mock expuesto** y **CERO tracking/CRM**: el texto visible NO contiene `demo`, `mock`, `simulación`, `viewcase`, `lorem ipsum`; interceptando requests de red, **0 hits** a analytics/CRM (google-analytics, gtm, segment, hotjar, mixpanel, doubleclick, facebook, clarity, amplitude, fullstory, intercom). **REQ-272** (red de seguridad anti-"demo"). Coherente con CSP `script-src 'self'`/`connect-src 'self'`.

### Instrucciones específicas
- **URL base:** `https://happy-coast-044ea7e0f.7.azurestaticapps.net` (**NUNCA localhost**).
- **Breakpoints:** mobile (<768px), tablet (768–991px), desktop (≥992px) — confirmar que el avatar (px fijos, `object-fit: cover`) se ve igual a todas las resoluciones; la foto de 600px se muestra idéntica en el círculo a la de 4129px (solo cambia la nitidez, aceptable a 32–120px).
- **Verificación de bytes optimizados (anti-caché de las gordas):** medir el tamaño descargado real de varias fotos contra el SWA (`mujeres/14.jpg`, `hombres/4.jpg`, `mujeres/70.jpg`, `mujeres/3.jpg` eran las peores: 9.4/6.2/6.4/6.0 MB → ahora deben bajar a ~40–90 KB). Confirmar `content_type=image/jpeg` (NO `text/html` de SPA-fallback enmascarado — usar un path REAL del manifest).
- **Sanity de paths/seed (rápida):** `/seed/manifest.json` → 200 `application/json` con 29 pacientes y los mismos paths; una foto de path real del manifest → 200 `image/jpeg`. (Esperado idéntico a Fase 5.)
- **Control negativo obligatorio:** un path inexistente (ej. `/imagenes/pacientes/NOPE-99.jpg`) devuelve 200 `text/html` (SPA fallback) → prueba que el `image/jpeg` de las fotos reales es genuino y no fallback enmascarado. **SIEMPRE verificar `content_type`, no solo el status.**
- **Evidencia:** screenshots de la lista (29 fotos cargadas) y de la ficha (foto header), en los 3 breakpoints. Reportar tamaños descargados antes/después como tabla.

---

## Asignación: Flow Tester → e2e/tests/flow/

> **GIFs de EVIDENCIA del sistema completo en producción** — para el cierre/entrega. Es un recorrido end-to-end del sistema final corriendo en producción, no la verificación de un criterio nuevo (la funcionalidad ya está validada en Fase 5 y se re-verifica por la regresión del PM).

### Tarea asignada
- **GIF(s) de un recorrido E2E completo del sistema final en producción** que demuestre el sistema entregado funcionando:
  1. **Login** → entrada al sistema (mock, sin credenciales reales).
  2. **Dashboard** → KPIs/landing.
  3. **Paciente con foto** → lista de pacientes (`/pacientes`, fotos optimizadas visibles) → abrir una ficha (`/pacientes/:id/informacion`, foto header visible).
  4. **Odontograma** → tab odontograma del paciente (32 piezas), cambiar el estado de una pieza (persiste).
  5. **Agenda** → vista de agenda (mes/semana en desktop; día/lista en mobile).
  6. **Crear turno** → flujo de alta de turno con campos requeridos.
  7. **Registrar pago** → `/pacientes/:id/pagos/nuevo` (campo fecha), saldo se actualiza y persiste.
  8. **Reportes con gráficos** → `/reportes/{financiero|pacientes|tratamientos|productividad}` con los gráficos reales (barras/línea/donut, no placeholders).

### Instrucciones específicas
- **URL base:** `https://happy-coast-044ea7e0f.7.azurestaticapps.net` (**NUNCA localhost**).
- **Topología/acceso público (puede confirmarlo aquí o el Visual Checker):** confirmar que TODO el recorrido es accesible **sin autenticación real** desde el dominio público (el único guard del árbol es `seedReadyGuard` — hidrata el store, NO redirige a `/login`). **0 errores de consola severos** durante el recorrido.
- **GIFs OBLIGATORIOS** (regla no negociable): grabar el recorrido como GIF(s) reproducibles para el entregable. Cubrir el flujo completo en al menos un GIF desktop; un GIF mobile (~390px) del mismo recorrido es deseable como evidencia de responsive.
- **Notas para evitar falsos negativos (de infrastructure-setup §5 — críticas):**
  - **Las filas de `app-data-table` navegan por `(click)`→`router.navigate()`, NO por `<a href>`** (facturación/presupuestos/obras sociales). Hacer click en `app-data-table tbody tr`, no scrapear `a[href]`.
  - **NO usar `waitUntil:'networkidle'`** contra este SWA (cuelga por socket keep-alive). Usar `domcontentloaded` + `waitForSelector` por markup real.
  - **Crear paciente NO está en `/pacientes/nuevo`** (cae a 404). Son 2 segmentos: paso 1 `/pacientes/nuevo/datos`, paso 2 `/pacientes/nuevo/clinico`.
  - **Agenda:** la lista mobile (`.agenda-row`) vive en `/agenda` con viewport mobile; `/agenda/dia` es OTRO componente (tabla). Para un turno reagendable, usar la lista mobile de `/agenda`.
  - **Rutas clave:** odontograma `/pacientes/:id/odontograma` (pieza `/pacientes/:id/pieza/:fdi`); pago `/pacientes/:id/pagos/nuevo` (`#pay-date`); reportes `/reportes/{pacientes|tratamientos|financiero|productividad}`.

---

## Asignación: Edge Case Tester → e2e/tests/edge-case/

> **SIN TAREAS en 6b.** El deployment cambió **solo bytes de assets** (fotos), sin paths, código, validaciones, rutas ni topología → **no introduce edge cases nuevos**. Toda la suite de edge-case existente (límites de input, estados vacíos, rutas inexistentes, degradación sin localStorage, confirmaciones destructivas, etc.) **se re-ejecuta en la regresión completa de la Tarea 1 (PM)**, lo que cubre la no-regresión de los edge cases ya validados en Fase 4–5. **No se lanza el Edge Case Tester en esta ronda.**

---

## Regresión Automatizada (lee de regression-results.md)
- **Ejecutor:** PM (`run-regression.sh` → `npx playwright test e2e/tests/`) contra la URL de producción. Ver Tarea 1.
- **Suite:** ~56 specs / ~770 tests **ya escritos**, mismos contra los que corrió Fase 4–5 (misma URL). NO re-generar.
- **Resultado esperado:** `output/iterations/production/regression-results.md` con `[N passed, N failed]`. Criterios verificados por la suite → **PASA (automatizado)** en el qa-report; NO se asignan a sub-testers.
- **Regresiones esperadas por el cambio de fotos:** **ninguna** (solo bytes, paths intactos; los specs anti-imagen-rota siguen válidos y deberían pasar igual). Cualquier `failed` se consolida como BUG y dispara corrección (Developer), sin diferir.

---

## Criterios Pendientes de Testing Manual (sub-testers esta ronda)
- **Total sub-testers con tarea esta ronda:** **2** (Visual Checker + Flow Tester). Edge Case Tester: sin tarea.
- **Visual Checker:** REQ-046 (foto en lista+ficha), REQ-159/179 + DC-055/078 (nunca imagen rota), **NFR-001** (carga <3s, observacional — único gap sin aserción automatizada), REQ-272 (cero demo/mock/tracking) + security headers (topología 1 dominio).
- **Flow Tester:** GIFs de evidencia del recorrido E2E completo en producción (login → dashboard → paciente con foto → odontograma → agenda → crear turno → registrar pago → reportes con gráficos) + confirmación de acceso público sin auth.
- **Criterios FALLARON en ronda anterior (re-verificar fix):** ninguno (no es una ronda de corrección; es validación de cierre post-deploy).
- **Criterios DESBLOQUEADOS:** ninguno.
- **Criterios nuevos sin test automatizado:** NFR-001 timing/calidad visual de fotos (bajo riesgo; verificación observacional, no se genera spec de timing — los specs anti-imagen-rota ya existen y corren en la regresión).

---

## Condición de Salida de 6b (gate de cierre/entrega)
La validación post-deployment está **COMPLETA** cuando, contra `https://happy-coast-044ea7e0f.7.azurestaticapps.net`:

1. **0 fallos en la regresión completa** (~770 tests, ejecutada por el PM).
2. **Topología verificada** (1 dominio, sin backend): acceso público sin auth ✅ · CSP/security headers presentes y no bloquean la app propia ✅ · cero demo/mock expuesto + cero tracking/CRM (REQ-272) ✅ · assets (fotos JPEG + manifest) sirven con `content_type` correcto, no fallback enmascarado ✅. (CORS y cloud storage externo: **N/A** — no aplican a 1 dominio frontend-only.)
3. **Fotos OK:** 29 fotos cargan en la lista (avatar 32px) y en la ficha (header 120px), **no rotas**, calidad visual aceptable, producción sirve los **bytes optimizados** (`~40–90 KB`/foto, `naturalWidth ≈ 600px`, `image/jpeg`), performance mejorado (NFR-001, observacional).
4. **GIFs de evidencia** del sistema completo en producción grabados (recorrido E2E para el entregable).
