# Resultados — Edge Case Tester · Iteración 3 (Agenda) · Ronda 1

> Sitio testeado: **https://happy-coast-044ea7e0f.7.azurestaticapps.net** (SWA desplegado, nunca localhost).
> Criterios asignados (test-distribution.md): **REQ-063** (panel de Filtros secundario de la Agenda) y **REQ-090** (reagendar no permite slot ocupado).
> Estabilidad: 2 corridas dedicadas (19 passed / 1 skipped cada una, 0 flaky) + 1 corrida combinada con toda la suite edge-case + el flujo de reagendar del Flow Tester (**153 passed / 1 skipped, 0 flaky, 0 cross-contamination**).

## Resultados por Criterio
| Criterio | Estado | Input/Condición | Evidencia |
|----------|--------|-----------------|-----------|
| REQ-063 | **PASA** | Panel de filtros (estado/tipo) NO visible de entrada; sólo botón "Filtros" (aria-expanded=false, `#f-estado`/`#f-tipo`/"Limpiar" ausentes del DOM) | `evidence/REQ-063-filtros-panel-empty-state.png` |
| REQ-063 | **PASA** | Botón "Filtros" abre/cierra el panel (toggle); panel = Estado + Tipo de tratamiento + "Limpiar filtros" (deshabilitado sin filtros) | spec (test 2) |
| REQ-063 | **PASA** | Filtrar por Estado "Cancelado" reduce los bloques del calendario; badge "Filtros 1"; todos los bloques restantes son "Cancelado" | spec (test 3) |
| REQ-063 | **PASA** | Combinar Estado "Confirmado" + Tipo "Odontopediatría" acumula (badge "Filtros 2") y reduce más (subconjunto ≤ sólo-estado) | spec (test 4) |
| REQ-063 | **PASA** | Combinación sin match (Atendiendo + Extracción simple = 0 turnos en Junio) → empty-state "No hay turnos en este período" + guidance | `evidence/REQ-063-filtros-panel-empty-state.png` |
| REQ-063 | **PASA** | "Limpiar filtros" restaura el calendario completo, resetea el badge y vuelve a deshabilitar "Limpiar" | spec (test 6) |
| REQ-063 | **PASA** | Mobile (Pixel 5): botón "Filtros" touch ≥44px y el panel abre con ambas dimensiones | spec (test 7, mobile-only) |
| REQ-090 | **PASA** | Reagendar tur-011 (prof-03) + fecha 2026-06-19 → 10:00 y 15:30 `[disabled]` con `title="Horario ocupado"`; slot libre (09:30) habilitado | `evidence/REQ-090-slots-ocupados-deshabilitados.png` |
| REQ-090 | **PASA** | Force-click sobre slot ocupado (15:30) NO lo marca `is-selected` ni habilita "Confirmar nuevo horario"; un slot libre sí lo habilita (control positivo) | spec (test 2) |
| REQ-090 | **PASA** | Caso-límite: tur-008 (prof-03, fecha propia 2026-06-01, hora 10:00) + fecha 2026-06-01 → horario PROPIO (10:00) queda seleccionable, otros ocupados (11:30, 16:30) deshabilitados | spec (test 3) |
| REQ-090 | **PASA** | Hint de disponibilidad presente ("Los horarios ocupados de este profesional no están disponibles.") | spec (test 1) |

## Bugs Encontrados
Ninguno. Ambos criterios (REQ-063, REQ-090) se comportan según especificación contra el sitio desplegado.

> Nota de robustez (no es un bug de app, es disciplina de test): la disponibilidad de slots de reagendar y los conteos del calendario dependen del **estado persistido en localStorage**, que el flujo de reagendar (Flow Tester, REQ-088/089) **muta** (badge incrementa, se agrega una NotificationEntity y un turno reagendado). Durante la exploración, con estado mutado, el slot **09:00 del 2026-06-09** aparecía deshabilitado de forma "fantasma" para prof-03 (residuo de un reagendar previo a esa fecha/hora). Ambos specs parten SIEMPRE de un seed FRESCO (`resetSeed` en `beforeEach`, helper compartido del Flow Tester) → el fixture es determinista y no hay falsos positivos/negativos por contaminación. Verificado: corrida combinada con el flujo de reagendar = 153 passed, 0 cross-contamination.

## Fixture determinista usado (verificado en vivo contra el seed pristino)
- **prof-03 (Dr. Federico Salinas)** — ocupación real del seed:
  - `2026-06-19` → ocupa **10:00** (confirmado) y **15:30** (en-espera).
  - `2026-06-01` → ocupa **10:00, 11:30, 16:30** (entre otros).
- **tur-011** → turno CONFIRMADO de prof-03, fecha propia **2026-06-21** (≠ 06-19) → caso slots ocupados sin interferencia de la exclusión del horario propio.
- **tur-008** → turno CONFIRMADO de prof-03, fecha propia **2026-06-01**, hora propia **10:00** → caso-límite de exclusión del horario propio.
- Empty-state REQ-063: en Junio, **Atendiendo + Extracción simple = 0 turnos** (los "atendiendo" del seed son sólo tt-07/tt-14/tt-02/tt-11, nunca tt-05 = Extracción simple).

## Tests Generados
- `e2e/tests/edge-case/REQ-063-agenda-filtros-panel.spec.ts` — 7 tests (anti-patrón panel oculto, toggle abrir/cerrar, filtrar por estado reduce, combinar estado+tipo badge "2", combo sin match → empty-state, limpiar restaura, mobile touch ≥44px).
- `e2e/tests/edge-case/REQ-090-reagendar-slot-ocupado.spec.ts` — 3 tests (slots ocupados deshabilitados + title; slot ocupado no seleccionable; caso-límite exclusión del horario propio).

Ambos entran en la suite de regresión para iteraciones futuras (prefijo de criterio real REQ-063 / REQ-090; reusan `_helpers/seed.ts`: `gotoApp`/`warmSeed`/`resetSeed`).

## Cobertura de Ejecución
- Projects: `desktop-chromium` (1280×900) y `mobile-chromium` (Pixel 5) — ambos contra el SWA desplegado.
- Corrida dedicada (REQ-063 + REQ-090): **19 passed / 1 skipped** (skip = test mobile-only de REQ-063 saltado en el project desktop, por diseño). Repetida → idéntico. **0 flaky.**
- Corrida combinada (todo `e2e/tests/edge-case/` + `flow/REQ-088-089-reagendar-notificacion.spec.ts`): **153 passed / 1 skipped, 0 flaky.**
