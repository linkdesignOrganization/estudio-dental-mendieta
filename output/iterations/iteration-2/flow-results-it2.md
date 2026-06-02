# Resultados — Flow Tester · Iteración 2 (Pacientes — ficha a fondo) · Ronda 1

> Testeado SIEMPRE contra el sitio desplegado: **https://happy-coast-044ea7e0f.7.azurestaticapps.net** (nunca localhost).
> Frontend-only · estado en `localStorage` (`edm:v1:state`) hidratado por `SeedReadyGuard` · seed determinista (PRNG).
> Criterios asignados (gaps sin aserción dedicada): **REQ-186** y **REQ-128**.

## Resultados por Criterio

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| **REQ-186** — Detalle de pieza: nombre clínico FDI + historial REAL derivado del store | **PASA** | `e2e/evidence/iteration-2/REQ-186-pieza-18-pac-003-historial-real.png` · `e2e/evidence/iteration-2/REQ-186-flujo-listado-ficha-odontograma-pieza.gif` |
| **REQ-128** — Tab Información (camino POBLADO): contacto de emergencia real + número de afiliado | **PASA** | `e2e/evidence/iteration-2/REQ-128-info-pac-001-contacto-afiliado.png` · `e2e/evidence/iteration-2/REQ-128-info-poblada-pac-001.gif` |

**Ambos criterios PASAN.** No se duplicó el control editable de estado (ya cubierto por `UX-028/UX-086`) ni el camino vacío de contacto (ya cubierto por `DC-106` sobre pac-007).

---

## Detalle de verificación (en vivo + automatizado)

### REQ-186 — nombre clínico FDI + historial real
Camino del usuario real recorrido: `listado → ficha (Agustín Benítez / pac-003) → tab Odontograma → click en Pieza 18`.

- **Nombre clínico FDI** (no solo el número): el encabezado del detalle muestra
  `Pieza 18 · Tercer molar superior derecho` (FDI cuad.1 pos.8). Acompaña `Numeración FDI · Universal 1`.
- **Historial REAL derivado del store** (no hardcodeado): la pieza 18 está en estado **Obturación** y su
  historial lista exactamente los 3 pasos clínicos coherentes con ese estado, cada uno con **fecha real**
  (dd/mm/aaaa) y el **profesional de cabecera REAL** del paciente (`Dra. Carolina Etcheverry`):
  1. `25/03/2026 · Dra. Carolina Etcheverry — Obturación con resina compuesta`
  2. `17/10/2025 · Dra. Carolina Etcheverry — Remoción de tejido cariado y aislamiento`
  3. `05/11/2024 · Dra. Carolina Etcheverry — Diagnóstico de caries en radiografía`
- **Prueba de "real, no hardcodeado"**: se contrastó con la **Pieza 28** del mismo paciente (estado
  **En tratamiento** → `Tercer molar superior izquierdo`), cuyo historial es endodóntico y **distinto**
  (`Sesión de tratamiento de conducto`, `Apertura cameral y diagnóstico endodóntico`, `Radiografía
  periapical de la pieza`). El contenido del historial **varía según el estado real de cada pieza**, lo que
  descarta un bloque fijo idéntico para todas. Coherencia confirmada también con el profesional de cabecera
  que aparece en la cabecera de la ficha.

### REQ-128 — contacto de emergencia real + número de afiliado (camino poblado)
Paciente con datos: **Bautista Álvarez (pac-001)** — distinto del caso vacío pac-007.

- **Contacto de emergencia (valor real, no placeholder)**: en la card *Contacto*, el campo
  `Contacto de emergencia` renderiza `Soledad Álvarez (Hijo/a) · +54 11 5309-1236`
  (formato: nombre + relación entre paréntesis + teléfono argentino). **No** aparece el placeholder
  `Sin contacto registrado` (camino vacío de DC-106).
- **Número de afiliado**: en la card *Obra social*, junto a `Cobertura: OSDE`, el campo
  `Número de afiliado` muestra `5653 1461 3760` (valor real, no el guion `—` del camino sin dato).
- Verificado tanto por **camino real** (listado → ficha) como por **deep-link directo** a
  `/pacientes/pac-001/informacion` (hidratación vía SeedReadyGuard) y en **ambos viewports**
  (desktop-chromium y mobile-chromium).

---

## Bugs Encontrados

**Ninguno.** Ambos criterios asignados se comportan exactamente según su criterio de aceptación en el sitio
desplegado. (El único ajuste fue interno al test: un selector `section` colisionaba con el `<section
role="tabpanel">`; se acotó a `section.info-card`. No es un bug de producto.)

---

## Tests Generados

- `e2e/tests/flow/REQ-186-128-pieza-info-real.spec.ts` — 5 tests × 2 projects = **10 casos**, todos verdes y
  **estables** (2 corridas consecutivas idénticas; seed byte-idéntico). Cubre:
  - `REQ-186`: flujo completo listado→ficha→odontograma→pieza con nombre FDI + historial real.
  - `REQ-186`: historial derivado del estado (dos piezas distintas → historiales distintos).
  - `REQ-128`: tab Información con contacto de emergencia real + afiliado (camino poblado).
  - `REQ-128`: hidratación del camino poblado en deep-link directo a `/informacion`.
  - `REQ-128`: visibilidad del dato real en ambos viewports.

### Ejecución (ambos projects: desktop-chromium + mobile-chromium)
```
npx playwright test tests/flow/REQ-186-128-pieza-info-real.spec.ts
→ 10 passed (corrida 1: 55.9s · corrida 2: 1.2m) — estable
```
Regresión cruzada con las specs de flujo que tocan las mismas áreas (mutan pac-004/pac-008, no interfieren):
```
npx playwright test UX-080-094-interactions-persistence + UX-020-032-critical-flows + REQ-186-128-...
→ 56 passed (5.7m) — sin cross-contamination
```

---

## GIFs de Flujos

- `e2e/evidence/iteration-2/REQ-186-flujo-listado-ficha-odontograma-pieza.gif` — flujo de punta a punta de
  REQ-186 (listado → ficha de Agustín Benítez → odontograma → detalle de Pieza 18 con nombre FDI + historial real).
- `e2e/evidence/iteration-2/REQ-128-info-poblada-pac-001.gif` — ficha Info poblada (pac-001): contacto de
  emergencia real + número de afiliado.

Frames fuente: `e2e/evidence/iteration-2/gif-frames/` y `e2e/evidence/iteration-2/gif-frames-info/`.
