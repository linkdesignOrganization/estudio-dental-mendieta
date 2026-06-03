# Regresion (single-run) - 2026-06-02T23:41:59

Exit code: 1 (0 = todos los tests pasaron)
Mode: --no-chunks (legacy single-run)
Secret state: DISABLED

## Tests fallidos

  ✘  147 [desktop-chromium] › tests/flow/REQ-216-219-budget-back-preserva.spec.ts:89:5 › REQ-216: [defecto conocido] el <select> no re-muestra el paciente tras "Atrás" (estado SÍ preservado) (19.4s)
  ✘  536 [mobile-chromium] › tests/flow/REQ-216-219-budget-back-preserva.spec.ts:89:5 › REQ-216: [defecto conocido] el <select> no re-muestra el paciente tras "Atrás" (estado SÍ preservado) (19.3s)
  1) [desktop-chromium] › tests/flow/REQ-216-219-budget-back-preserva.spec.ts:89:5 › REQ-216: [defecto conocido] el <select> no re-muestra el paciente tras "Atrás" (estado SÍ preservado) 
  2) [mobile-chromium] › tests/flow/REQ-216-219-budget-back-preserva.spec.ts:89:5 › REQ-216: [defecto conocido] el <select> no re-muestra el paciente tras "Atrás" (estado SÍ preservado) 

## Resumen final

      102 |   await expect(page.locator('#b-pac option:checked')).toHaveText('Elegí un paciente');
      103 | });
      104 |
        at /Users/roberthcastillo/Desktop/ViewCases/ClinicaDental/e2e/tests/flow/REQ-216-219-budget-back-preserva.spec.ts:101:40

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../test-results/flow-REQ-216-219-budget-ba-bc346-Atrás-estado-SÍ-preservado--mobile-chromium/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../test-results/flow-REQ-216-219-budget-ba-bc346-Atrás-estado-SÍ-preservado--mobile-chromium/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../test-results/flow-REQ-216-219-budget-ba-bc346-Atrás-estado-SÍ-preservado--mobile-chromium/error-context.md

  2 failed
    [desktop-chromium] › tests/flow/REQ-216-219-budget-back-preserva.spec.ts:89:5 › REQ-216: [defecto conocido] el <select> no re-muestra el paciente tras "Atrás" (estado SÍ preservado) 
    [mobile-chromium] › tests/flow/REQ-216-219-budget-back-preserva.spec.ts:89:5 › REQ-216: [defecto conocido] el <select> no re-muestra el paciente tras "Atrás" (estado SÍ preservado) 
  8 skipped
  768 passed (1.0h)
