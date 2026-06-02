import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Edge — Crear turno (DEMO-015 / UX-050): campos requeridos vacíos por paso.
 * Paso 1 sin paciente => error inline "Elegí un paciente para continuar." + NO avanza.
 * Paso 2 sin profesional/fecha/hora => error inline + NO avanza.
 * El camino feliz (3 pasos completos) lo cubre el Flow Tester.
 *
 * Verificado en código (appointment-create.component.ts): `next()` setea
 * step1Touched/step2Touched ANTES del guard `return`, por lo que el error inline SÍ
 * es alcanzable (a diferencia de Registrar pago).
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-050 — Paso 1 sin paciente: "Siguiente" no avanza y muestra error inline
test('UX-050: Paso 1 sin paciente no avanza y muestra error inline', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();

  // Intentar avanzar sin elegir paciente.
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // NO avanza: sigue en el paso 1 (misma URL).
  await expect(page).toHaveURL(/\/agenda\/nuevo\/paciente$/);
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  // Error inline con el copy esperado.
  await expect(page.getByText('Elegí un paciente para continuar.')).toBeVisible();
});

// test: UX-050 — al elegir paciente, el error desaparece y sí avanza al Paso 2
test('UX-050: al elegir paciente el flujo avanza al Paso 2', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Elegí un paciente para continuar.')).toBeVisible();

  await page.getByRole('button', { name: /Agustín Benítez/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/agenda\/nuevo\/profesional$/);
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();
});

// test: UX-050 — Paso 2 sin profesional/fecha/hora no avanza y muestra error inline
test('UX-050: Paso 2 incompleto no avanza al Paso 3', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: /Mateo Gómez/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/agenda\/nuevo\/profesional$/);

  // Intentar avanzar sin completar profesional/fecha/hora.
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/agenda\/nuevo\/profesional$/);
  await expect(page.getByText('Completá profesional, fecha y horario para continuar.')).toBeVisible();
});

// test: UX-050 — Paso 1: búsqueda sin resultados muestra empty-state (rama vacía del wizard)
test('UX-050/UX-045: el buscador del Paso 1 sin match muestra empty-state', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('searchbox', { name: 'Buscar paciente' }).fill('zzzqxnomatch9999');
  await expect(page.getByRole('heading', { name: 'Sin resultados' })).toBeVisible();
  await expect(page.getByText(/No encontramos pacientes con ese criterio/)).toBeVisible();
});

// test: UX-088 — cancelar el flujo con datos cargados pide confirmación de descarte
test('UX-088: cancelar el flujo de turno con datos pide confirmación', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: /Diego Sosa/ }).first().click();

  // El botón "Agenda" (back-link) actúa como cancelar; con datos => confirma.
  await page.getByRole('button', { name: 'Agenda' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Descartar el turno')).toBeVisible();
  await expect(dialog.getByText(/Tenés datos cargados en este turno/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Sí, descartar' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Seguir editando' })).toBeVisible();

  // "Seguir editando" mantiene el flujo.
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(page).toHaveURL(/\/agenda\/nuevo\/paciente$/);
});
