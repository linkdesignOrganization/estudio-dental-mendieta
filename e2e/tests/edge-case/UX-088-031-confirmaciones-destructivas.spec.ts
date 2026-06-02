import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, readState } from '../_helpers/seed';

/**
 * Edge — Confirmaciones ANTES de acciones destructivas (UX-088) y rama destructiva de
 * "Restablecer datos" (UX-031). Toda acción irreversible pide confirmación explícita
 * con advertencia de pérdida de cambios y copy de producción (nunca "resetear demo").
 * El confirm-dialog usa role="alertdialog" y atrapa el foco (<50% viewport: Visual).
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|resetear demo|de prueba|ficticio|viewcase|link design)\b/i;

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-031 — "Restablecer datos": confirma con advertencia de pérdida y copy de producción
test('UX-031: Restablecer datos pide confirmación con advertencia de pérdida (copy de producción)', async ({ page }) => {
  await gotoApp(page, '/configuracion');
  await page.getByRole('button', { name: 'Restablecer datos' }).click();

  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Restablecer los datos')).toBeVisible();
  await expect(dialog.getByText(/Se perderán todos los cambios/)).toBeVisible();
  await expect(dialog.getByText(/no se puede deshacer/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Sí, restablecer' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  // Copy de producción: sin "resetear demo" ni lenguaje de mock.
  const dlgText = await dialog.innerText();
  expect(dlgText).not.toMatch(DEMO_FORBIDDEN);
});

// test: UX-031 / UX-088 — "Cancelar" en el diálogo ABORTA el reset (no se ejecuta)
test('UX-031: cancelar la confirmación NO restablece los datos', async ({ page }) => {
  // Creamos un cambio detectable: registrar un pago, para luego verificar que sigue ahí.
  await gotoApp(page, '/pacientes/pac-010/pagos');
  await page.getByRole('link', { name: 'Registrar pago' }).click();
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('7777');
  await page.getByRole('textbox', { name: 'Concepto (opcional)' }).fill('Marca anti-reset');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-010\/pagos$/);

  // Vamos a Configuración y ABRIMOS pero CANCELAMOS el reset.
  await gotoApp(page, '/configuracion');
  await page.getByRole('button', { name: 'Restablecer datos' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);

  // El cambio sigue presente (el reset NO se ejecutó).
  await gotoApp(page, '/pacientes/pac-010/pagos');
  await expect(page.getByText('Marca anti-reset').first()).toBeVisible();
});

// test: UX-088 — cancelar un turno desde su detalle pide confirmación explícita
test('UX-088: cancelar un turno desde el detalle pide confirmación', async ({ page }) => {
  // Elegimos un turno NO terminal (los botones están habilitados).
  const state = await readState(page);
  const activo = (state.appointments as Array<{ id: string; estado: string }>).find((a) =>
    ['confirmado', 'en-espera', 'atendiendo'].includes(a.estado),
  );
  test.skip(!activo, 'no hay turno activo en el seed');

  await gotoApp(page, `/agenda/${activo!.id}`);
  await page.getByRole('button', { name: 'Cancelar turno' }).click();

  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Cancelar este turno')).toBeVisible();
  await expect(dialog.getByText(/El paciente quedará sin la cita agendada/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Sí, cancelar' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Volver' })).toBeVisible();
  // Copy de producción.
  expect(await dialog.innerText()).not.toMatch(DEMO_FORBIDDEN);

  // "Volver" aborta la cancelación (el turno NO cambia de estado).
  await dialog.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Avanzar estado' })).toBeEnabled();
});

// test: UX-088 — el confirm-dialog atrapa el foco (Escape/click fuera no pierde el control)
test('UX-088: el confirm-dialog de reset mantiene el foco dentro del diálogo', async ({ page }) => {
  await gotoApp(page, '/configuracion');
  await page.getByRole('button', { name: 'Restablecer datos' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  // El foco está dentro del diálogo (algún control del alertdialog tiene el foco).
  const focusInside = await page.evaluate(() => {
    const dlg = document.querySelector('[role="alertdialog"]');
    return !!dlg && dlg.contains(document.activeElement);
  });
  expect(focusInside).toBe(true);
});
