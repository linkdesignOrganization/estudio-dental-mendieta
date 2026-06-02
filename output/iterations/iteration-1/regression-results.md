# Regresion (single-run) - 2026-06-02T09:54:46

Exit code: 1 (0 = todos los tests pasaron)
Mode: --no-chunks (legacy single-run)
Secret state: DISABLED

## Tests fallidos

  ✘   77 [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:115:5 › UX-026/UX-085: registrar pago recalcula el saldo exactamente y persiste (5.2s)
  ✘   79 [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:170:5 › UX-027: el badge de estado de cuenta es coherente con el saldo tras el pago (19.0s)
  ✘   90 [desktop-chromium] › tests/flow/UX-060-067-seed.spec.ts:104:5 › UX-067: edge cases representados en el seed (19.1s)
  ✘   96 [desktop-chromium] › tests/flow/UX-080-094-interactions-persistence.spec.ts:83:5 › UX-085: cargos y pagos se distinguen por signo en los movimientos (19.2s)
  ✘  116 [desktop-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:307:5 › UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo (19.3s)
  ✘  117 [desktop-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:327:5 › UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar (19.4s)
  ✘  319 [mobile-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:115:5 › UX-026/UX-085: registrar pago recalcula el saldo exactamente y persiste (5.0s)
  ✘  321 [mobile-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:170:5 › UX-027: el badge de estado de cuenta es coherente con el saldo tras el pago (19.0s)
  ✘  332 [mobile-chromium] › tests/flow/UX-060-067-seed.spec.ts:104:5 › UX-067: edge cases representados en el seed (19.1s)
  ✘  338 [mobile-chromium] › tests/flow/UX-080-094-interactions-persistence.spec.ts:83:5 › UX-085: cargos y pagos se distinguen por signo en los movimientos (19.2s)
  ✘  358 [mobile-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:307:5 › UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo (19.2s)
  ✘  359 [mobile-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:327:5 › UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar (19.3s)
  1) [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:115:5 › UX-026/UX-085: registrar pago recalcula el saldo exactamente y persiste 
  2) [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:170:5 › UX-027: el badge de estado de cuenta es coherente con el saldo tras el pago 
  3) [desktop-chromium] › tests/flow/UX-060-067-seed.spec.ts:104:5 › UX-067: edge cases representados en el seed 
  4) [desktop-chromium] › tests/flow/UX-080-094-interactions-persistence.spec.ts:83:5 › UX-085: cargos y pagos se distinguen por signo en los movimientos 
  5) [desktop-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:307:5 › UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo 
  6) [desktop-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:327:5 › UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar 
  7) [mobile-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:115:5 › UX-026/UX-085: registrar pago recalcula el saldo exactamente y persiste 
  8) [mobile-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:170:5 › UX-027: el badge de estado de cuenta es coherente con el saldo tras el pago 
  9) [mobile-chromium] › tests/flow/UX-060-067-seed.spec.ts:104:5 › UX-067: edge cases representados en el seed 
  10) [mobile-chromium] › tests/flow/UX-080-094-interactions-persistence.spec.ts:83:5 › UX-085: cargos y pagos se distinguen por signo en los movimientos 
  11) [mobile-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:307:5 › UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo 
  12) [mobile-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:327:5 › UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar 

## Resumen final

    ../test-results/flow-UX-multipaso-cierre-U-806ae-ofrece-la-acción-de-aprobar-mobile-chromium/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../test-results/flow-UX-multipaso-cierre-U-806ae-ofrece-la-acción-de-aprobar-mobile-chromium/error-context.md

  12 failed
    [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:115:5 › UX-026/UX-085: registrar pago recalcula el saldo exactamente y persiste 
    [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:170:5 › UX-027: el badge de estado de cuenta es coherente con el saldo tras el pago 
    [desktop-chromium] › tests/flow/UX-060-067-seed.spec.ts:104:5 › UX-067: edge cases representados en el seed 
    [desktop-chromium] › tests/flow/UX-080-094-interactions-persistence.spec.ts:83:5 › UX-085: cargos y pagos se distinguen por signo en los movimientos 
    [desktop-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:307:5 › UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo 
    [desktop-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:327:5 › UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar 
    [mobile-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:115:5 › UX-026/UX-085: registrar pago recalcula el saldo exactamente y persiste 
    [mobile-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:170:5 › UX-027: el badge de estado de cuenta es coherente con el saldo tras el pago 
    [mobile-chromium] › tests/flow/UX-060-067-seed.spec.ts:104:5 › UX-067: edge cases representados en el seed 
    [mobile-chromium] › tests/flow/UX-080-094-interactions-persistence.spec.ts:83:5 › UX-085: cargos y pagos se distinguen por signo en los movimientos 
    [mobile-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:307:5 › UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo 
    [mobile-chromium] › tests/flow/UX-multipaso-cierre.spec.ts:327:5 › UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar 
  4 skipped
  468 passed (40.4m)
