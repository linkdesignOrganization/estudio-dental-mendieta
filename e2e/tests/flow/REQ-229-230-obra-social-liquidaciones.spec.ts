import { test, expect } from '@playwright/test';
import { warmSeed, parseArs } from '../_helpers/seed';

/**
 * Flow Tester · Iteración 5 — Detalle de obra social: Historial de liquidaciones (REQ-229 / REQ-230).
 *
 * Criterio: el detalle de una obra social muestra una sección "Historial de liquidaciones" con
 * ≥1 fila REAL (`.osd__settle-row`: período + estado "Liquidada"/"En proceso" + monto ARS),
 * derivada del estado (pagos de los pacientes asociados agrupados por mes), NO el empty-state —
 * REQ-229. Un paciente asociado navega a su ficha — REQ-230.
 *
 * Anclas del seed (verificadas en vivo):
 *  - os-osde (OSDE): 3 liquidaciones; la más reciente "Mayo 2026 · Liquidada · $ 176.020".
 *  - os-particular: 0 liquidaciones (Particular no liquida) → muestra el empty-state.
 *
 * NO muta estado → warmSeed alcanza. Anti-demo (REQ-272) barrido.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: REQ-229 — OSDE muestra "Historial de liquidaciones" con filas reales (período + estado +
// monto ARS), derivadas del estado (no el empty-state).
test('REQ-229: el detalle de OSDE muestra historial de liquidaciones con filas reales', async ({ page }) => {
  await page.goto('/facturacion/obras-sociales/os-osde', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'OSDE' })).toBeVisible();

  // Sección presente.
  await expect(page.getByRole('heading', { name: 'Historial de liquidaciones' })).toBeVisible();

  // ≥1 fila real (no el empty-state).
  const rows = page.locator('.osd__settle-list .osd__settle-row');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThanOrEqual(1);
  await expect(page.getByText('Sin liquidaciones registradas')).toHaveCount(0);

  // Cada fila tiene período + estado (Liquidada/En proceso) + monto ARS con formato.
  // El período y el estado viven dentro de `.osd__settle-body`; el monto en `.osd__settle-amount`
  // (que también lleva `t-body-medium`, de ahí que se apunte por su propia clase).
  const first = rows.first();
  await expect(first.locator('.osd__settle-body .t-body-medium')).toHaveText(
    /^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)\s+20\d{2}$/,
  );
  await expect(first.locator('.osd__settle-body .t-secondary')).toHaveText(/^(Liquidada|En proceso)$/);
  const amount = first.locator('.osd__settle-amount');
  await expect(amount).toContainText(/\$\s?[\d.]+/);
  expect(parseArs((await amount.innerText()).trim())).toBeGreaterThan(0);

  // El estado de cada fila es uno de los dos válidos (derivado del período vs. hoy).
  const estados = await rows.locator('.osd__settle-body .t-secondary').allInnerTexts();
  for (const e of estados) expect(['Liquidada', 'En proceso']).toContain(e.trim());

  expect(await page.locator('.osd').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// test: REQ-230 — un paciente asociado de la obra social navega a su ficha.
test('REQ-230: un paciente asociado de la obra social navega a su ficha', async ({ page }) => {
  await page.goto('/facturacion/obras-sociales/os-osde', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Pacientes asociados' })).toBeVisible();

  const firstPatient = page.locator('.osd__patient').first();
  await expect(firstPatient).toBeVisible();
  // El link apunta a /pacientes/:id.
  const href = await firstPatient.getAttribute('href');
  expect(href).toMatch(/^\/pacientes\/pac-[\w-]+$/);
  const nombre = (await firstPatient.locator('.t-body-medium').innerText()).trim();

  await firstPatient.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-[\w-]+\/informacion$/);
  // La ficha del paciente clickeado carga (su nombre como encabezado de detalle).
  await expect(page.getByRole('heading', { name: nombre })).toBeVisible();
});

// test: REQ-229 (límite honesto) — "Particular" no liquida → muestra el empty-state específico, no
// filas inventadas. Documenta que el historial se DERIVA del estado (no es hardcode global).
test('REQ-229: "Particular" no tiene liquidaciones y muestra el empty-state (derivado del estado)', async ({ page }) => {
  await page.goto('/facturacion/obras-sociales/os-particular', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Historial de liquidaciones' })).toBeVisible();
  await expect(page.locator('.osd__settle-row')).toHaveCount(0);
  await expect(page.getByText('Sin liquidaciones registradas')).toBeVisible();
});
