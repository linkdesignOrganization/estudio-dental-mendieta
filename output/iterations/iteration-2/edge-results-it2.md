# Resultados — Edge Case Tester · Iteración 2 (Pacientes — ficha a fondo) · Ronda 1

- Sitio testeado (desplegado, NO localhost): https://happy-coast-044ea7e0f.7.azurestaticapps.net
- Projects ejecutados: `desktop-chromium` (1280×900) + `mobile-chromium` (Pixel 5)
- Criterios asignados: **REQ-187** (pieza vacía → empty-state) y **REQ-101** (panel de Filtros de pacientes)
- Resultado de la corrida: **26 passed / 0 failed** (estable en 2 corridas consecutivas)

## Resultados por Criterio

| Criterio | Estado | Input/Condición | Evidencia |
|----------|--------|-----------------|-----------|
| REQ-187 | **PASA** | Pieza SANA (pac-029, pieza 11) → empty-state exacto "Sin procedimientos registrados en esta pieza." + nombre clínico FDI presente, sin crash | `e2e/evidence/edge-case/iteration-2/REQ-187-pieza-sana-empty.png` · `REQ-187-pieza-empty-state.gif` |
| REQ-187 | **PASA** | Pieza AUSENTE (pac-029, pieza 16) → mismo empty-state, nombre FDI "Primer molar superior derecho", sin crash | (cubierto en spec) |
| REQ-187 | **PASA** | Control positivo: pieza CON historial (pac-029, pieza 43 Obturación) → NO muestra empty-state, lista real de 3 procedimientos (Dr. Federico Salinas). Empty-state es CONDICIONAL, no permanente | `gif-frames/p01-pieza43-historial.png` |
| REQ-101 | **PASA** | Panel de Filtros NO visible por defecto (anti-patrón): sólo botón "Filtros" con `aria-expanded=false`; abre/cierra al pulsarlo | `gif-frames/f01-default.png`, `f02-panel-open.png` |
| REQ-101 | **PASA** | Filtro Obra social=OSDE → 29→4 pacientes; todas las filas cumplen OSDE; badge "Filtros 1" | `gif-frames/f03-osde-4.png` |
| REQ-101 | **PASA** | Filtro Profesional=Dra. Carolina Etcheverry → 29→3 pacientes | (cubierto en spec) |
| REQ-101 | **PASA** | Filtro Rango de edad=Niños (0–12) → subconjunto coherente (>0 y <29); filas visibles = contador | (cubierto en spec) |
| REQ-101 | **PASA** | Combinación de dimensiones acumula (badge "2") y reduce más (OSDE ∩ Niños) | (cubierto en spec) |
| REQ-101 | **PASA** | Combinación SIN match (OSDE + Adultos mayores 65+ / Particular + Niños) → empty-state "No encontramos pacientes con ese criterio" + guidance; 0 filas | `REQ-101-filtros-empty-state.png` · `gif-frames/f04-empty.png` |
| REQ-101 | **PASA** | "Limpiar filtros" deshabilitado sin filtros; restaura el listado completo (29) y resetea dimensiones; el empty-state no "pega"; badge desaparece | `gif-frames/f05-restored.png` |
| REQ-101 | **PASA** | Mobile: panel usable; botón Filtros y los 3 comboboxes con touch target ≥44px; filtro reduce igual que en desktop | (cubierto en spec, project mobile) |

## Bugs Encontrados

**Ninguno.** Ambos criterios cumplen su contrato en desktop y mobile.

### Observaciones (NO son bugs — registradas para trazabilidad)

- **OBS-1 (touch target desktop vs. mobile).** El botón "Filtros" y los comboboxes del panel
  miden **40px** de alto en desktop y **44px** en mobile. El contrato ≥44px es una exigencia
  MOBILE (cumplida); 40px en desktop es un control compacto válido (mouse, no toque). El test
  REQ-101 aplica la aserción de los 44px **sólo** al project mobile (gated por `testInfo.project.name`).
  No constituye incumplimiento de REQ-101.
- **OBS-2 (odontograma @defer — relacionado con BUG-E04 ya documentado).** El diagrama del
  odontograma es un bloque `@defer` que hidrata al entrar en viewport/idle; el click en una pieza
  vía el flujo de usuario requiere `scrollIntoViewIfNeeded` + esperar las 32 piezas. El deep-link
  directo a `/pacientes/{id}/pieza/{fdi}` SÍ hidrata el detalle en ambos viewports (no depende del
  diagrama), por lo que las aserciones del empty-state de pieza son estables en desktop y mobile.
  El flujo de usuario de REQ-187 navega vía tab Odontograma (no deep-link a `/odontograma`),
  evitando el gap mobile de BUG-E04, y pasa en ambos projects.

## Datos del seed verificados en vivo (deterministas)

- Total pacientes: **29** ("29 pacientes en el sistema", "1–12 de 29", 3 páginas).
- Obra social OSDE → 4: Bautista Álvarez (pac-001), León Fernández (pac-010), Sofía Bianchi (pac-013), Isabella Pérez (pac-025).
- Profesional Dra. Carolina Etcheverry → 3: Agustín Benítez (pac-003), Diego Sosa (pac-005), Liliana Martínez.
- Combinaciones sin match (empty-state): **OSDE + Adultos mayores (65+)** = 0 · **Particular + Niños (0–12)** = 0.
- pac-029 "Cristina Flores" (PAMI): pieza 11 = Sana, pieza 16 = Ausente, pieza 43 = Obturación (3 ítems de historial, Dr. Federico Salinas).
- Copy empty-state pieza: `Sin procedimientos registrados en esta pieza.` (dentro del `<aside>` "Historial de la pieza", sin lenguaje de demo).
- Copy empty-state lista filtrada: heading `No encontramos pacientes con ese criterio` + guidance `Probá con otro nombre o ajustá los filtros para ver más resultados.`

## Tests Generados (en la suite de regresión futura)

- `e2e/tests/edge-case/REQ-187-pieza-vacia.spec.ts` — 5 tests × 2 projects = 10 (pieza sana, pieza ausente, no-demo, control positivo con historial, empty condicional sana↔tratamiento).
- `e2e/tests/edge-case/REQ-101-filtros-pacientes.spec.ts` — 8 tests × 2 projects = 16 (panel oculto/anti-patrón, filtro por cada dimensión, combinación, empty-state sin match, limpiar restaura, mobile touch target ≥44px).

## Comando y corrida

```
cd e2e && npx playwright test tests/edge-case/REQ-187-pieza-vacia.spec.ts tests/edge-case/REQ-101-filtros-pacientes.spec.ts
→ 26 passed (≈2.3m). Re-corrida: 26 passed (≈2.4m). Estable, sin flakes.
```
