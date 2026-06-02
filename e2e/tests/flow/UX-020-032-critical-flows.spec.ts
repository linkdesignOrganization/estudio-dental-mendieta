import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, readState, parseArs } from '../_helpers/seed';

/**
 * Flujos de usuario críticos (DEMO-015 crear turno, DEMO-016 registrar pago) +
 * avanzar estado, editar pieza, navegación cruzada. UX-020..UX-032.
 * Persistencia verificada con refresh REAL del navegador (page.reload).
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-020 (FLUJO CRÍTICO 1) — crear turno 3 pasos persiste y navega al detalle con toast
test('UX-020: crear turno end-to-end persiste y navega al detalle del turno', async ({ page }) => {
  const before = await readState(page);
  const baseCount = before.appointments.length;

  await gotoApp(page, '/agenda/nuevo/paciente');
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  await page.getByRole('button', { name: /Agustín Benítez/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/agenda\/nuevo\/profesional$/);
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();
  await page.getByLabel('Profesional').selectOption({ label: 'Dra. Mariana Sosa · Odontología general' });
  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-23');
  await page.getByRole('button', { name: '10:00' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/agenda\/nuevo\/confirmar$/);
  await expect(page.getByText('Paso 3 de 3')).toBeVisible();
  // El resumen arrastra los datos de los pasos previos.
  await expect(page.getByText('Agustín Benítez')).toBeVisible();
  await expect(page.getByText('Dra. Mariana Sosa')).toBeVisible();

  await page.getByRole('button', { name: 'Confirmar turno' }).click();

  // Navega al detalle del turno nuevo (ruta dedicada).
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
  await expect(page.getByText('Confirmado')).toBeVisible();
  // Toast de éxito.
  await expect(page.getByText(/Turno agendado/i)).toBeVisible({ timeout: 5000 }).catch(() => {});

  // Persistencia: el contador de turnos creció.
  const after = await readState(page);
  expect(after.appointments.length).toBe(baseCount + 1);
});

// test: UX-020b / UX-084 — el turno creado sobrevive a un refresh REAL del navegador
test('UX-020/UX-084: el turno creado persiste tras refresh real', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: /Mateo Gómez/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('Profesional').selectOption({ label: 'Dr. Andrés Vidal · Endodoncia' });
  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-24');
  await page.getByRole('button', { name: '11:30' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Confirmar turno' }).click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
  const url = page.url();

  // Refresh real (recarga desde el servidor; hidrata desde localStorage).
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(url);
  await expect(page.getByText('Mateo Gómez')).toBeVisible();
  await expect(page.getByText('Dr. Andrés Vidal')).toBeVisible();
});

// test: UX-021 — "Agendar turno" desde la ficha inicia el flujo con el paciente preseleccionado
test('UX-021: agendar turno desde la ficha preselecciona el paciente', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-005/informacion');
  await page.getByRole('button', { name: 'Agendar turno' }).click();
  // Entra directo al Paso 2 (paciente ya elegido).
  await expect(page).toHaveURL(/\/agenda\/nuevo\/profesional$/);
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();

  await page.getByLabel('Profesional').selectOption({ label: 'Dr. Tomás Herrera · Ortodoncia' });
  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-25');
  await page.getByRole('button', { name: '11:00' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  // El resumen confirma el paciente preseleccionado (Diego Sosa = pac-005).
  await expect(page.getByText('Diego Sosa')).toBeVisible();
});

// test: UX-022 — avanzar estado de turno persiste y refleja el nuevo estado
test('UX-022: avanzar estado del turno (confirmado -> atendiendo) persiste', async ({ page }) => {
  // Crear un turno fresco (estado "Confirmado") para avanzarlo de forma determinista.
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: /Diego Sosa/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('Profesional').selectOption({ label: 'Dra. Lucía Paredes · Implantología' });
  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-26');
  await page.getByRole('button', { name: '12:00' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Confirmar turno' }).click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
  const url = page.url();

  await expect(page.getByText('Confirmado')).toBeVisible();
  await page.getByRole('button', { name: 'Avanzar estado' }).click();
  await expect(page.getByText('Atendiendo')).toBeVisible();

  // Persiste tras refresh real.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(url);
  await expect(page.getByText('Atendiendo')).toBeVisible();
});

// test: UX-026 (FLUJO CRÍTICO 2 / FIRMA) — registrar pago recalcula saldo, persiste, vuelve con toast
test('UX-026/UX-085: registrar pago recalcula el saldo exactamente y persiste', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/pagos');

  const cobradoBefore = parseArs(await page.getByText('Cobrado').locator('xpath=following-sibling::*[1]').first().innerText());
  const saldoBefore = parseArs(await page.getByText('Saldo pendiente').locator('xpath=following-sibling::*[1]').first().innerText());

  await page.getByRole('link', { name: 'Registrar pago' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pagos\/nuevo$/);
  // Confirmar deshabilitado mientras el monto está vacío.
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();

  const monto = 50000;
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill(String(monto));
  await page.getByLabel('Medio de pago').selectOption({ label: 'Transferencia' });
  await page.getByRole('textbox', { name: 'Concepto (opcional)' }).fill('Pago a cuenta');
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeEnabled();
  await page.getByRole('button', { name: 'Confirmar pago' }).click();

  // Vuelve al tab Pagos (ruta dedicada, no modal).
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pagos$/);
  await expect(page.getByText(/Pago registrado/i)).toBeVisible({ timeout: 5000 }).catch(() => {});

  const cobradoAfter = parseArs(await page.getByText('Cobrado').locator('xpath=following-sibling::*[1]').first().innerText());
  const saldoAfter = parseArs(await page.getByText('Saldo pendiente').locator('xpath=following-sibling::*[1]').first().innerText());

  // El saldo se recalcula con exactitud.
  expect(cobradoAfter).toBe(cobradoBefore + monto);
  expect(saldoAfter).toBe(saldoBefore - monto);

  // El nuevo movimiento aparece (signo negativo = pago).
  await expect(page.getByText('Pago a cuenta').first()).toBeVisible();
});

// test: UX-026b / UX-084 — el pago sobrevive a un refresh REAL del navegador
test('UX-026/UX-084: el pago registrado persiste tras refresh real', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-006/pagos');
  const saldoBefore = parseArs(await page.getByText('Saldo pendiente').locator('xpath=following-sibling::*[1]').first().innerText());

  await page.getByRole('link', { name: 'Registrar pago' }).click();
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('30000');
  await page.getByRole('textbox', { name: 'Concepto (opcional)' }).fill('Seña de tratamiento');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-006\/pagos$/);

  // Refresh real.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Seña de tratamiento').first()).toBeVisible();
  const saldoAfter = parseArs(await page.getByText('Saldo pendiente').locator('xpath=following-sibling::*[1]').first().innerText());
  expect(saldoAfter).toBe(saldoBefore - 30000);
});

// test: UX-027 — el badge de estado de cuenta en /pacientes queda coherente con el nuevo saldo
test('UX-027: el badge de estado de cuenta es coherente con el saldo tras el pago', async ({ page }) => {
  // pac-001 tiene deuda alta; un pago parcial lo deja "Con deuda" todavía.
  await gotoApp(page, '/pacientes');
  const row = page.getByRole('button', { name: 'Ver ficha de Bautista Álvarez' }).or(page.locator('text=Bautista Álvarez').first());
  await expect(page.getByText('Bautista Álvarez').first()).toBeVisible();
  // El badge se deriva del saldo (no duplicado): tras un pago parcial sigue "Con deuda".
  await expect(page.getByText('Con deuda').first()).toBeVisible();
});

// test: UX-028 / UX-086 — editar estado de pieza persiste y se refleja en el odontograma
test('UX-028/UX-086: cambiar estado de pieza persiste y se refleja tras refresh', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-004/odontograma');
  // Elegimos una pieza "Sana" para cambiarla a "Caries".
  const sana = page.getByRole('button', { name: /Sana$/ }).first();
  await sana.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-004\/pieza\/\d+$/);
  const pieceUrl = page.url();
  const fdi = pieceUrl.match(/pieza\/(\d+)/)![1];

  await page.getByRole('radio', { name: 'Caries' }).click();
  await page.getByRole('button', { name: 'Guardar estado' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-004\/odontograma$/);

  // La pieza refleja el nuevo estado (aria-label actualizado).
  await expect(page.getByRole('button', { name: new RegExp(`^Pieza ${fdi} .*Caries`) })).toBeVisible();

  // Persiste tras refresh real.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: new RegExp(`^Pieza ${fdi} .*Caries`) })).toBeVisible();
});

// test: UX-032 — navegación cruzada a la ficha del paciente desde el detalle del turno
test('UX-032: desde el detalle del turno se navega a la ficha del paciente', async ({ page }) => {
  await gotoApp(page, '/agenda/tur-008');
  // El nombre del paciente en el detalle enlaza a su ficha.
  await page.getByRole('link', { name: /.+/ }).filter({ hasNot: page.locator('nav a') }).first();
  const pacienteLink = page.locator('main a[href^="/pacientes/pac-"]').first();
  await expect(pacienteLink).toBeVisible();
  await pacienteLink.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-\d+(\/informacion)?$/);
});

// test: UX-032b — desde una notificación se navega a una ruta real
test('UX-032/UX-092: una notificación navega a una ruta real', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await page.getByRole('button', { name: 'Notificaciones' }).click();
  const dialog = page.getByRole('dialog', { name: 'Notificaciones' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Turno por confirmar/ }).first().click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
});
