# Resultados — Flow Tester (Validación Post-Deployment 6b · EVIDENCIA DE ENTREGA)

> **Modo:** PRODUCCIÓN (Fase 6, paso 6b — evidencia de cierre/entrega) · **Fecha:** 2026-06-03
> **URL de producción (única):** `https://happy-coast-044ea7e0f.7.azurestaticapps.net`
> **Tarea:** grabar GIFs de evidencia del recorrido end-to-end del sistema FINAL en producción (5 módulos) + confirmar acceso público sin autenticación.
> **Veredicto:** **4 GIFs grabados · recorrido E2E completo · 0 errores de consola severos · acceso público sin auth CONFIRMADO.**

No es una ronda de corrección: la funcionalidad ya quedó validada en Fase 5 y se re-verifica por la regresión completa del PM (`regression-results.md`). Este reporte produce la **evidencia visual** del sistema entregado funcionando en producción.

---

## GIFs de Evidencia Generados

Guardados en `output/iterations/production/gifs/` (PNG-frames ensamblados con ffmpeg, paleta lanczos):

| # | GIF | Módulos cubiertos | Dim · frames · peso |
|---|-----|-------------------|----------------------|
| 1 | `output/iterations/production/gifs/01-desktop-login-dashboard-paciente-odontograma.gif` | **Login** ("Ingresar como administradora") → **Reportes/Dashboard** (6 KPI cards) → **Pacientes** (lista con fotos) → **Ficha** (foto grande + 6 tabs) → **Odontograma** (32 piezas) → **cambiar estado de una pieza** (Sana→Obturación, "Guardar estado", persiste y se refleja) | 1024×688 · 69f · 474 KB |
| 2 | `output/iterations/production/gifs/02-desktop-agenda-crear-turno.gif` | **Agenda** (calendario Mes/Semana) → **Crear turno** flujo 3 pasos (Paso 1 paciente → Paso 2 profesional+fecha+hora → Paso 3 confirmar) → detalle del turno **Confirmado** (toast "Turno agendado.") | 1024×688 · 53f · 349 KB |
| 3 | `output/iterations/production/gifs/03-desktop-facturacion-pago-reportes.gif` | **Facturación/Pagos** (saldo pendiente inicial) → **Registrar pago** (monto+fecha+medio+concepto, "Confirmar pago", toast "Pago registrado.", **saldo actualizado** y movimiento en lista) → **Reporte financiero** (5 gráficos) → **Reporte de pacientes** (5 gráficos: línea, barras, donut) | 1024×688 · 48f · 503 KB |
| 4 | `output/iterations/production/gifs/04-mobile-recorrido-responsive.gif` | **Responsive ~390px:** Login → Dashboard (KPIs) → Pacientes (cards + avatar 32px) → Ficha (foto header 120px + tabs) → Reporte financiero (gráficos a ancho mobile) | 480×1009 · 54f · 382 KB |

**Cobertura de los 5 módulos del entregable:**
- **Login** → GIF 1, GIF 4 (entrada mock, sin credenciales reales).
- **Pacientes** (lista con fotos → ficha foto grande + 6 tabs → odontograma 32 piezas → pieza editable) → GIF 1, GIF 4.
- **Agenda** (calendario → crear turno 3 pasos) → GIF 2.
- **Facturación** (registrar pago con saldo actualizado) → GIF 3.
- **Reportes** (dashboard KPIs + reportes detallados con gráficos reales) → GIF 1 (dashboard), GIF 3 (financiero+pacientes), GIF 4 (financiero mobile).

---

## Resultados por Beat del Recorrido (verificación en vivo durante la grabación)

| Beat del recorrido | Estado | Evidencia |
|--------------------|--------|-----------|
| Login mock — "Ingresar como administradora" → `/reportes` | **PASA** | GIF 1/4 · click en el `link` "Ingresar como administradora" navega al dashboard |
| Dashboard de Reportes — 6 KPI cards con datos calculados | **PASA** | GIF 1/4 · "Pacientes nuevos 11", "Turnos atendidos 7", "Tratamientos completados 14", "Ingresos facturados $ 4.32 M", "Cobrado $ 1.95 M", "Deuda $ 3.42 M" |
| Pacientes — lista con fotos optimizadas (no rotas) | **PASA** | GIF 1/4 · fotos above-fold `naturalWidth > 0` antes de capturar; avatar 32px |
| Ficha del paciente — foto grande (header 120px) + 6 tabs | **PASA** | GIF 1/4 · tabs: Información general · Odontograma · Historial clínico · Tratamientos · Documentos · Pagos |
| Odontograma — 32 piezas hidratadas | **PASA** | GIF 1 · `button[aria-label^="Pieza "]` × 32 (gate web-first, @defer on immediate) |
| Pieza editable — Sana→Obturación + "Guardar estado" persiste | **PASA** | GIF 1 · radiogroup "Estado de la pieza" (6 estados) → vuelve al odontograma con pieza en "Obturación" + toast "Estado de la pieza actualizado" |
| Agenda — calendario (Mes/Semana/Día) | **PASA** | GIF 2 · segmented control + grilla |
| Crear turno — flujo 3 pasos | **PASA** | GIF 2 · Paso1 paciente → Paso2 (Profesional select + Fecha + slot 10:00) → Paso3 "Confirmar turno" → detalle `tur-…` "Confirmado" + toast "Turno agendado." |
| Facturación — registrar pago con saldo actualizado | **PASA** | GIF 3 · `#pay-amount/#pay-date/#pay-method/#pay-note` → "Confirmar pago" → toast "Pago registrado." + saldo recalculado + movimiento en `.movement` |
| Reportes detallados — gráficos reales (no placeholders) | **PASA** | GIF 3/4 · `/reportes/financiero` (5 `figure`), `/reportes/pacientes` (5 `figure`): línea, barras, donut con datos |
| **Acceso público sin autenticación** (topología 1 dominio) | **PASA** | sweep de 11 deep-links → todos 200, 0 redirige a `/login` (ver abajo) |
| **0 errores de consola severos** en el recorrido | **PASA** | grabación mobile: 0 console errors · sweep de deep-links: 0 console errors |

---

## Confirmación de Acceso Público sin Autenticación

Sweep de deep-links directos contra producción (cada navegación arranca desde la URL profunda, sin auth previa). El único guard del árbol es `seedReadyGuard` — **hidrata el store, NO redirige a `/login`**:

| Ruta | Status | Landed | ¿Redirige a /login? |
|------|--------|--------|---------------------|
| `/login` | 200 | `/login` | — (es el login) |
| `/reportes` | 200 | `/reportes` | NO |
| `/pacientes` | 200 | `/pacientes` | NO |
| `/pacientes/pac-001/informacion` | 200 | `/pacientes/pac-001/informacion` | NO |
| `/pacientes/pac-001/odontograma` | 200 | `/pacientes/pac-001/odontograma` | NO |
| `/agenda` | 200 | `/agenda` | NO |
| `/agenda/nuevo/paciente` | 200 | `/agenda/nuevo/paciente` | NO |
| `/pacientes/pac-001/pagos/nuevo` | 200 | `/pacientes/pac-001/pagos/nuevo` | NO |
| `/reportes/financiero` | 200 | `/reportes/financiero` | NO |
| `/reportes/pacientes` | 200 | `/reportes/pacientes` | NO |
| `/facturacion/presupuestos` | 200 | `/facturacion/presupuestos` | NO |

- **`ALL_PUBLIC_NO_AUTH = true`** · **0 errores de consola** durante el sweep.
- La SWA sirve la app directamente desde el dominio público sin login real (deep-link funciona por el SPA-fallback de Azure + hidratación del seed en `localStorage`). Coherente con el resultado del Visual Checker (`visual-results-prod.md`).

---

## Bugs Encontrados

**Ninguno.** El recorrido end-to-end completo en producción se ejecutó sin fallos funcionales ni errores de consola. Todos los beats de los 5 módulos respondieron como en Fase 5.

---

## Notas de Honestidad / Metodología

- **Determinismo:** los módulos que MUTAN estado persistido (odontograma, crear turno, registrar pago) se grabaron sobre **seed fresco** (`resetSeed` antes) y el estado se **revirtió al terminar** (`resetSeed` final), dejando producción intacta para el siguiente visitante.
- **Anti-flaky:** selectores web-first idénticos a los `.spec.ts` ya verdes (role/label; data-tables navegadas por click de fila, no scraping de `a[href]`; `domcontentloaded` + `waitForSelector`, **nunca `networkidle`** contra esta SWA). Frames capturados con `page.screenshot()` a cadencia fija + marcas en beats clave; ensamblados con `ffmpeg` (palettegen/paletteuse). No se usó conversión video→gif (frágil).
- **No se generan `.spec.ts` nuevos:** esta ronda es evidencia de cierre, no verificación de criterios nuevos. La cobertura funcional del recorrido ya vive en specs durables (`UX-multipaso-cierre.spec.ts`, `REQ-267-269-odontograma-editable.spec.ts`, `REQ-259-262-pago-con-fecha.spec.ts`, `REQ-232-234-dashboard-kpi.spec.ts`, etc.) que el PM re-ejecuta en la regresión completa (`regression-results.md`). El distribution-plan no asigna criterios nuevos al Flow Tester en 6b.
- **Scripts de grabación** (reproducibles, dejados en repo): `e2e/_record-gifs.mjs` (GIFs 1–3 desktop), `e2e/_record-gif-mobile.mjs` (GIF 4 mobile).

---

## Condición de Salida 6b — aporte del Flow Tester

- ✅ **GIFs de evidencia** del sistema completo en producción grabados (4 GIFs, recorrido E2E de los 5 módulos para el entregable).
- ✅ **Acceso público sin auth** confirmado (11/11 deep-links 200, 0 redirige a login).
- ✅ **0 errores de consola severos** durante el recorrido.
