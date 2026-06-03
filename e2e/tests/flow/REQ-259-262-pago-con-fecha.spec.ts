import { test, expect } from '@playwright/test';
import { resetSeed, readState, parseArs, patientRow } from '../_helpers/seed';

/**
 * Flow Tester · Iteración 5 — Pago editable con FECHA (REQ-259 / REQ-260 / REQ-261 / REQ-262).
 *
 * Criterio: registrar un pago con monto>0 + FECHA (≤ hoy) + medio + concepto:
 *  · persiste el movimiento en la cuenta corriente del paciente (REQ-259);
 *  · el movimiento lleva la FECHA elegida (no la de hoy si se cambió) — REQ-260;
 *  · recalcula el SALDO; el resumen (Cobrado/Saldo) se actualiza; el badge de estado de
 *    cuenta del paciente en la lista queda COHERENTE con el nuevo saldo (REQ-261);
 *  · toast "Pago registrado." y SOBREVIVE a un refresh real (hidrata desde localStorage) —
 *    REQ-262.
 *
 * Anclas del seed (verificadas en vivo):
 *  - pac-001 (Bautista Álvarez): saldo inicial $ 221.980 → badge "Con deuda".
 *  - El pago default fecha "2026-06-01" (hoy del viewcase), [max]=2026-06-01 (no futuro).
 *  - movementsOf ordena por fecha DESC → para afirmar persistencia se lee el ESTADO y el
 *    saldo recalculado (no la posición en la lista).
 *
 * Idempotencia OBLIGATORIA: el pago muta localStorage → resetSeed en beforeEach/afterEach.
 * Anti-demo (REQ-272) barrido en el form y en el tab de pagos.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;
const PAC = 'pac-001';

/** Saldo (cargos − pagos) del paciente, derivado del estado persistido. */
function saldoDe(state: any, pacienteId: string): number {
  return (state.movements as any[])
    .filter((m) => m.pacienteId === pacienteId)
    .reduce((s, m) => s + (m.signo === 'cargo' ? m.monto : -m.monto), 0);
}

test.beforeEach(async ({ page }) => {
  await resetSeed(page, `/pacientes/${PAC}/pagos`);
});
test.afterEach(async ({ page }) => {
  await resetSeed(page, '/agenda');
});

// test: REQ-259/260/261/262 — happy-path con fecha: persiste el movimiento con la FECHA elegida,
// recalcula el saldo (estado + UI), muestra el toast y sobrevive a un refresh real.
test('REQ-259/260/261/262: registrar pago con fecha persiste, recalcula saldo y sobrevive al refresh', async ({ page }) => {
  // Estado de partida (saldo del paciente).
  await page.goto(`/pacientes/${PAC}/pagos`, { waitUntil: 'domcontentloaded' });
  const stBefore = await readState(page);
  const saldoBefore = saldoDe(stBefore, PAC);
  const movCountBefore = (stBefore.movements as any[]).filter((m) => m.pacienteId === PAC).length;
  expect(saldoBefore).toBeGreaterThan(0); // arranca con deuda (anclado al seed)

  // El resumen del tab muestra el saldo pendiente inicial.
  const saldoStat = page.locator('.pay__stat').filter({ hasText: 'Saldo pendiente' }).locator('.pay__stat-value');
  expect(parseArs((await saldoStat.innerText()).trim())).toBe(saldoBefore);

  // --- Formulario de pago con FECHA elegida (≤ hoy) ---
  const FECHA_ELEGIDA = '2026-05-20';
  const MONTO = 50000;
  await page.goto(`/pacientes/${PAC}/pagos/nuevo`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Registrar pago' })).toBeVisible();

  // El date picker arranca poblado en hoy y no admite futuro (tope = hoy del viewcase).
  await expect(page.locator('#pay-date')).toHaveValue('2026-06-01');
  await expect(page.locator('#pay-date')).toHaveAttribute('max', '2026-06-01');

  // Confirmar deshabilitado sin monto; se habilita con monto>0.
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();
  await page.locator('#pay-amount').fill(String(MONTO));
  await page.locator('#pay-date').fill(FECHA_ELEGIDA);
  await page.locator('#pay-method').selectOption('Transferencia');
  await page.locator('#pay-note').fill('Pago a cuenta — control mensual');
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeEnabled();

  await page.getByRole('button', { name: 'Confirmar pago' }).click();

  // Toast de confirmación + retorno a la pestaña Pagos.
  await expect(page.getByText('Pago registrado.')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/pacientes/${PAC}/pagos$`));

  // --- Persistencia en el ESTADO: el movimiento nuevo lleva la FECHA elegida (REQ-260) ---
  await expect.poll(async () => {
    const st = await readState(page);
    return (st.movements as any[]).filter((m) => m.pacienteId === PAC).length;
  }).toBe(movCountBefore + 1);

  const stAfter = await readState(page);
  const nuevo = (stAfter.movements as any[]).find(
    (m) => m.pacienteId === PAC && m.signo === 'pago' && m.monto === MONTO && m.concepto === 'Pago a cuenta — control mensual',
  );
  expect(nuevo, 'el movimiento del pago se persistió').toBeTruthy();
  expect(nuevo.fecha, 'el movimiento lleva la fecha ELEGIDA, no la de hoy').toBe(FECHA_ELEGIDA);
  expect(nuevo.medioPago).toBe('Transferencia');

  // --- Saldo recalculado: estado + resumen del tab (Cobrado/Saldo) ---
  const saldoAfter = saldoDe(stAfter, PAC);
  expect(saldoAfter).toBe(saldoBefore - MONTO);
  expect(parseArs((await saldoStat.innerText()).trim())).toBe(saldoBefore - MONTO);

  // El movimiento aparece en la lista (con su fecha formateada dd/mm/aaaa y medio).
  const movItem = page.locator('.movement').filter({ hasText: 'Pago a cuenta — control mensual' }).first();
  await expect(movItem).toBeVisible();
  await expect(movItem.locator('.movement__date')).toHaveText(/20\/05\/2026 · Transferencia/);

  // --- Sobrevive a un refresh REAL (hidrata desde localStorage) ---
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(parseArs((await saldoStat.innerText()).trim())).toBe(saldoBefore - MONTO);
  await expect(page.locator('.movement').filter({ hasText: 'Pago a cuenta — control mensual' }).first()).toBeVisible();
  const stReload = await readState(page);
  expect(saldoDe(stReload, PAC)).toBe(saldoBefore - MONTO);

  // Anti-demo en el tab de pagos.
  expect(await page.locator('main').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// test: REQ-261 — el badge de estado de cuenta del paciente en la LISTA queda coherente con el
// saldo recalculado: tras saldar el total, "Con deuda" → "Al día" (derivado del saldo, no hardcode).
test('REQ-261: el badge de estado de cuenta en la lista refleja el saldo recalculado (Con deuda → Al día)', async ({ page }) => {
  // Badge inicial del paciente con deuda. `patientRow` resuelve la fila (desktop) o card
  // (mobile) VISIBLE, según viewport → la aserción del badge es viewport-agnóstica.
  await page.goto('/pacientes', { waitUntil: 'domcontentloaded' });
  const rowBefore = patientRow(page, 'Bautista Álvarez');
  await expect(rowBefore).toBeVisible();
  await expect(rowBefore.getByText('Con deuda')).toBeVisible();

  // Saldar el total exacto.
  const st = await readState(page);
  const saldo = saldoDe(st, PAC);
  expect(saldo).toBeGreaterThan(0);

  await page.goto(`/pacientes/${PAC}/pagos/nuevo`, { waitUntil: 'domcontentloaded' });
  await page.locator('#pay-amount').fill(String(saldo));
  await page.getByRole('button', { name: 'Confirmar pago' }).click();
  await expect(page).toHaveURL(new RegExp(`/pacientes/${PAC}/pagos$`));
  // El saldo pendiente del tab queda en 0.
  const saldoStat = page.locator('.pay__stat').filter({ hasText: 'Saldo pendiente' }).locator('.pay__stat-value');
  await expect.poll(async () => parseArs((await saldoStat.innerText()).trim())).toBe(0);

  // En la lista, el badge ahora es "Al día" (coherente con saldo ≤ 0).
  await page.goto('/pacientes', { waitUntil: 'domcontentloaded' });
  const rowAfter = patientRow(page, 'Bautista Álvarez');
  await expect(rowAfter).toBeVisible();
  await expect(rowAfter.getByText('Al día')).toBeVisible();
  await expect(rowAfter.getByText('Con deuda')).toHaveCount(0);
});
