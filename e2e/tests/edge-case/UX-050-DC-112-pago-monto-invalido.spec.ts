import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Edge — Registrar pago con monto inválido (DEMO-016 / DC-112 / UX-050).
 * Ramas: vacío, 0, negativo, no numérico. Capa de COMPORTAMIENTO (el aspecto lo
 * cubre el Visual Checker). El camino feliz (monto válido) lo cubre el Flow Tester.
 *
 * Hallazgo verificado en vivo + en código (register-payment.component.ts):
 * `showError = touched && !isValid` y `touched` SOLO se setea en submit(), pero el
 * botón "Confirmar pago" está `[disabled]="!isValid()"`. Por eso, con un monto ≤0 el
 * botón queda deshabilitado (guard efectivo) PERO el mensaje inline
 * "Ingresá un monto mayor a cero." NUNCA llega a mostrarse vía la UI normal.
 * Estos tests fijan el comportamiento REAL observado (botón deshabilitado = guard),
 * y documentan la ausencia del mensaje inline como gap conocido (ver edge-results.md).
 */

const PAGO_NUEVO = '/pacientes/pac-001/pagos/nuevo';

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: DC-112 — monto vacío => "Confirmar pago" deshabilitado (no se puede enviar)
test('DC-112: monto vacío deja "Confirmar pago" deshabilitado', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  await expect(page.getByRole('heading', { name: 'Registrar pago' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();
});

// test: UX-050 — monto NEGATIVO => botón deshabilitado (rama ≤0). Guard efectivo.
test('UX-050: monto negativo mantiene "Confirmar pago" deshabilitado', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('-500');
  // El guard real es el botón deshabilitado: nunca se puede confirmar un monto ≤0.
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();
});

// test: UX-050 — monto CERO => botón deshabilitado (rama ≤0)
test('UX-050: monto cero mantiene "Confirmar pago" deshabilitado', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('0');
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();
});

// test: UX-050 — monto NO NUMÉRICO => el input number descarta las letras => queda
// vacío => parseFloat=NaN => botón deshabilitado. Usamos pressSequentially porque
// fill() rechaza texto no numérico en <input type=number>.
test('UX-050: tipear letras en el monto no habilita el botón (input numérico las descarta)', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  const monto = page.getByRole('spinbutton', { name: 'Monto (ARS)' });
  await monto.click();
  await monto.pressSequentially('abc'); // el control numérico ignora no-dígitos
  // El valor queda vacío y el botón sigue deshabilitado.
  await expect(monto).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();
});

// test: DC-112 — transición inválido -> válido -> inválido habilita/deshabilita el botón
test('DC-112: el botón se habilita solo con monto > 0 y se vuelve a deshabilitar al limpiarlo', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  const monto = page.getByRole('spinbutton', { name: 'Monto (ARS)' });
  const confirmar = page.getByRole('button', { name: 'Confirmar pago' });

  await expect(confirmar).toBeDisabled();
  await monto.fill('1000');
  await expect(confirmar).toBeEnabled();
  await monto.fill('0');
  await expect(confirmar).toBeDisabled();
  await monto.fill('250');
  await expect(confirmar).toBeEnabled();
  await monto.fill('');
  await expect(confirmar).toBeDisabled();
});

// test: UX-050 — el input declara aria-invalid y semántica de validación (a11y del campo)
test('UX-050: el input de monto expone aria-invalid y min=1 para validación', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  const monto = page.getByRole('spinbutton', { name: 'Monto (ARS)' });
  // El campo declara min=1 (no admite 0 ni negativos como válidos).
  await expect(monto).toHaveAttribute('min', '1');
  // aria-invalid presente como atributo de validación (false mientras no se "toca").
  await expect(monto).toHaveAttribute('aria-invalid', /true|false/);
});

// test: UX-088 — cancelar el pago con un monto cargado pide confirmación (rama destructiva)
test('UX-088: cancelar el pago con monto cargado pide confirmación de descarte', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('1500');
  await page.getByRole('button', { name: 'Cancelar' }).click();

  // Aparece el confirm-dialog de descarte con copy de producción (sin "demo").
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Descartar el pago')).toBeVisible();
  await expect(dialog.getByText(/Tenés un monto ingresado/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Seguir editando' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Sí, descartar' })).toBeVisible();

  // "Seguir editando" cierra el diálogo y mantiene el formulario (no navega).
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pagos\/nuevo$/);
  await expect(page.getByRole('spinbutton', { name: 'Monto (ARS)' })).toHaveValue('1500');
});

// test: UX-088 — cancelar SIN datos vuelve directo a Pagos (sin confirmación innecesaria)
test('UX-088: cancelar sin monto cargado vuelve a Pagos sin pedir confirmación', async ({ page }) => {
  await gotoApp(page, PAGO_NUEVO);
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pagos$/);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});
