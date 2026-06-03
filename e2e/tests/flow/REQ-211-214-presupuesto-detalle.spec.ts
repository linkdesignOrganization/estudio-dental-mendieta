import { test, expect } from '@playwright/test';
import { warmSeed } from '../_helpers/seed';

/**
 * Flow Tester · Iteración 5 — Detalle de presupuesto (REQ-211 / REQ-214).
 *
 * Criterio: el detalle muestra
 *  · "Válido hasta el {vencimiento}" + sección "Condiciones" (lista de 3) — REQ-211;
 *  · el flag "Vencido — la fecha de validez ya pasó" cuando un PENDIENTE pasó su fecha;
 *  · para estados RESUELTOS (aprobado/rechazado/vencido) un MENSAJE COHERENTE por estado en
 *    lugar de la acción "Aprobar" (no se aprueba dos veces) — REQ-214;
 *  · el link al paciente (`.bdet__patient-link`) navega a su ficha — REQ-211 (paciente).
 *
 * Anclas del seed (verificadas en vivo):
 *  - pre-008 (P-00125): PENDIENTE, venc 23/06/2026 (futuro) → botones Rechazar/Aprobar, sin
 *    flag vencido. Paciente "Roberto Suárez" → /pacientes/pac-012.
 *  - pre-001 (P-00118): PENDIENTE, venc 21/05/2026 (pasado) → muestra el flag "Vencido".
 *  - pre-002 (P-00119): estado VENCIDO → mensaje resuelto "está vencido…", sin Aprobar.
 *  - pre-022 (P-00139): estado RECHAZADO → mensaje resuelto "fue rechazado…", sin Aprobar.
 *  - pre-020 (P-00137): estado APROBADO → mensaje resuelto "ya fue aprobado…", sin Aprobar.
 *
 * Hoy del viewcase = 2026-06-01. NO muta estado → warmSeed alcanza (read-only).
 * Anti-demo (REQ-272) barrido en cada detalle.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: REQ-211 — un presupuesto PENDIENTE muestra "Válido hasta el {venc}", las 3 condiciones y la
// acción primaria "Aprobar" (con "Rechazar"); sin flag de vencido si la fecha es futura.
test('REQ-211: detalle de un pendiente muestra válido-hasta, condiciones (3) y acción Aprobar', async ({ page }) => {
  await page.goto('/facturacion/presupuestos/pre-008', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Presupuesto P-00125/ })).toBeVisible();

  // "Válido hasta el {fecha formateada}".
  await expect(page.getByText('Válido hasta el 23/06/2026')).toBeVisible();

  // Sección "Condiciones" con exactamente 3 ítems.
  await expect(page.getByRole('heading', { name: 'Condiciones' })).toBeVisible();
  await expect(page.locator('.bdet__terms-list li')).toHaveCount(3);
  await expect(page.locator('.bdet__terms-list li').first()).toContainText('válido por 30 días');

  // Tratamientos incluidos + total presentes.
  await expect(page.locator('.bdet__section-title', { hasText: 'Tratamientos incluidos' })).toBeVisible();
  await expect(page.locator('.bdet__total')).toContainText('Total');

  // Pendiente con fecha futura → acción primaria Aprobar + secundaria Rechazar, sin flag vencido.
  await expect(page.getByRole('button', { name: 'Aprobar presupuesto' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rechazar' })).toBeVisible();
  await expect(page.locator('.bdet__meta-item--warn')).toHaveCount(0);
  await expect(page.locator('.bdet__resolved')).toHaveCount(0);

  expect(await page.locator('article.bdet').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// test: REQ-211 (flag vencido) — un PENDIENTE cuya fecha de validez ya pasó muestra el flag
// "Vencido — la fecha de validez ya pasó".
test('REQ-211: un pendiente con fecha de validez pasada muestra el flag "Vencido"', async ({ page }) => {
  await page.goto('/facturacion/presupuestos/pre-001', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Presupuesto P-00118/ })).toBeVisible();
  await expect(page.getByText('Válido hasta el 21/05/2026')).toBeVisible();
  const warn = page.locator('.bdet__meta-item--warn');
  await expect(warn).toBeVisible();
  await expect(warn).toContainText('Vencido — la fecha de validez ya pasó');
});

// test: REQ-214 — para cada estado RESUELTO, el detalle muestra el mensaje coherente por estado
// EN LUGAR de la acción "Aprobar" (no se aprueba dos veces).
test('REQ-214: estados resueltos muestran mensaje coherente y NO ofrecen aprobar (no 2x)', async ({ page }) => {
  const casos = [
    { id: 'pre-020', numero: 'P-00137', msg: /ya fue aprobado/i },
    { id: 'pre-022', numero: 'P-00139', msg: /fue rechazado/i },
    { id: 'pre-002', numero: 'P-00119', msg: /está vencido/i },
  ];
  for (const c of casos) {
    await page.goto(`/facturacion/presupuestos/${c.id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: new RegExp(`Presupuesto ${c.numero}`) })).toBeVisible();

    // Mensaje resuelto coherente, sin acción de aprobar/rechazar.
    const resolved = page.locator('.bdet__resolved');
    await expect(resolved).toBeVisible();
    await expect(resolved).toContainText(c.msg);
    await expect(page.getByRole('button', { name: 'Aprobar presupuesto' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Rechazar' })).toHaveCount(0);

    // Aun resuelto, sigue mostrando válido-hasta + condiciones (datos del detalle).
    await expect(page.getByText('Válido hasta el')).toBeVisible();
    await expect(page.locator('.bdet__terms-list li')).toHaveCount(3);

    expect(await page.locator('article.bdet').innerText()).not.toMatch(DEMO_FORBIDDEN);
  }
});

// test: REQ-211 (paciente) — el link al paciente del detalle navega a su ficha real.
test('REQ-211: el link al paciente del detalle navega a su ficha', async ({ page }) => {
  await page.goto('/facturacion/presupuestos/pre-008', { waitUntil: 'domcontentloaded' });
  const link = page.locator('.bdet__patient-link');
  await expect(link).toHaveText('Roberto Suárez');
  await expect(link).toHaveAttribute('href', '/pacientes/pac-012');

  await link.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-012\/informacion$/);
  // La ficha del paciente carga (su nombre como encabezado de detalle).
  await expect(page.getByRole('heading', { name: 'Roberto Suárez' })).toBeVisible();
});
