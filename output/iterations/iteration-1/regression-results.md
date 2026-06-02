# Regresion (single-run) - 2026-06-02T10:47:51

Exit code: 1 (0 = todos los tests pasaron)
Mode: --no-chunks (legacy single-run)
Secret state: DISABLED

## Tests fallidos

  ✘   76 [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:91:5 › UX-022: avanzar estado del turno (confirmado -> atendiendo) persiste (19.3s)
  1) [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:91:5 › UX-022: avanzar estado del turno (confirmado -> atendiendo) persiste 

## Resumen final

          |                      ^
      102 |   const url = page.url();
      103 |
      104 |   await expect(page.getByText('Confirmado')).toBeVisible();
        at /Users/roberthcastillo/Desktop/ViewCases/ClinicaDental/e2e/tests/flow/UX-020-032-critical-flows.spec.ts:101:22

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../test-results/flow-UX-020-032-critical-f-08e6f-rmado---atendiendo-persiste-desktop-chromium/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../test-results/flow-UX-020-032-critical-f-08e6f-rmado---atendiendo-persiste-desktop-chromium/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../test-results/flow-UX-020-032-critical-f-08e6f-rmado---atendiendo-persiste-desktop-chromium/error-context.md

  1 failed
    [desktop-chromium] › tests/flow/UX-020-032-critical-flows.spec.ts:91:5 › UX-022: avanzar estado del turno (confirmado -> atendiendo) persiste 
  4 skipped
  479 passed (38.9m)
