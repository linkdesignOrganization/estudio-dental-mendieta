# Regresion (single-run) - 2026-06-02T18:15:14

Exit code: 1 (0 = todos los tests pasaron)
Mode: --no-chunks (legacy single-run)
Secret state: DISABLED

## Tests fallidos

  ✘  307 [mobile-chromium] › tests/edge-case/REQ-187-pieza-vacia.spec.ts:52:5 › REQ-187: una pieza sana muestra el estado vacío "Sin procedimientos…" (flujo de usuario, no crashea) (30.2s)
  1) [mobile-chromium] › tests/edge-case/REQ-187-pieza-vacia.spec.ts:52:5 › REQ-187: una pieza sana muestra el estado vacío "Sin procedimientos…" (flujo de usuario, no crashea) 

## Resumen final

         |                   ^
      70 |   await expect(page.getByRole('button', { name: /^Pieza \d+ \(universal \d+\)/ })).toHaveCount(32);
      71 |   await expect(piezaSana).toBeVisible();
      72 |
        at /Users/roberthcastillo/Desktop/ViewCases/ClinicaDental/e2e/tests/edge-case/REQ-187-pieza-vacia.spec.ts:69:19

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    ../test-results/edge-case-REQ-187-pieza-va-ddbab-lujo-de-usuario-no-crashea--mobile-chromium/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: video (video/webm) ──────────────────────────────────────────────────────────────
    ../test-results/edge-case-REQ-187-pieza-va-ddbab-lujo-de-usuario-no-crashea--mobile-chromium/video.webm
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: ../test-results/edge-case-REQ-187-pieza-va-ddbab-lujo-de-usuario-no-crashea--mobile-chromium/error-context.md

  1 failed
    [mobile-chromium] › tests/edge-case/REQ-187-pieza-vacia.spec.ts:52:5 › REQ-187: una pieza sana muestra el estado vacío "Sin procedimientos…" (flujo de usuario, no crashea) 
  7 skipped
  568 passed (50.6m)
