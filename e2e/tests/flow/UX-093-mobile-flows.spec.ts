import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Mobile — todos los flujos operables (UX-093). Los flujos interactivos
 * (crear turno, registrar pago) deben ser usables en mobile, sin scroll horizontal
 * no intencional. Estos tests corren SOLO en el proyecto mobile-chromium.
 */

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Solo en viewport mobile');
  await warmSeed(page);
});

// test: UX-093 — registrar pago operable en mobile end-to-end
test('UX-093: registrar pago es operable en mobile', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-006/pagos');
  await page.getByRole('link', { name: 'Registrar pago' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-006\/pagos\/nuevo$/);
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('15000');
  await page.getByRole('textbox', { name: 'Concepto (opcional)' }).fill('Pago mobile');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-006\/pagos$/);
  await expect(page.getByText('Pago mobile').first()).toBeVisible();
});

// test: UX-093 — crear turno operable en mobile (3 pasos)
test('UX-093: crear turno es operable en mobile', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: /Diego Sosa/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('Profesional').selectOption({ index: 1 });
  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-30');
  await page.getByRole('button', { name: '10:00' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Paso 3 de 3')).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar turno' }).click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
});

// test: UX-093 — sin scroll horizontal no intencional en pantallas clave
test('UX-093: no hay scroll horizontal en pantallas clave (mobile)', async ({ page }) => {
  for (const path of ['/pacientes', '/agenda', '/pacientes/pac-002/odontograma', '/facturacion/presupuestos']) {
    await gotoApp(page, path);
    await page.waitForTimeout(600);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      // tolerancia de 2px por redondeos del navegador
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow, `scroll horizontal en ${path}`).toBeLessThanOrEqual(2);
  }
});
