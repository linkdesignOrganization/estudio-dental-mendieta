import { test, expect } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * REQ-070 — **Notas internas** en el detalle del turno (`/agenda/:id`).
 *
 * El detalle debe incluir SIEMPRE el bloque "Notas internas" (`.appt__notes` con su label
 * `.appt__notes-label`). Si el turno tiene `notas`, se muestran en `.appt__notes-body`; si no,
 * se muestra el placeholder CONTROLADO `.appt__notes-empty` con el texto
 * "Sin notas internas para este turno." (nunca un hueco vacío ni "undefined").
 *
 * Por qué este test (gap-analysis It3): "Notas internas"/`appt__notes` tenía 0 matches en
 * `e2e/` → ninguna cobertura previa. En el seed determinista TODOS los turnos nacen con
 * `notas: ''` (seed.generator), por lo que el comportamiento observable y verificable hoy es
 * el LABEL + el placeholder controlado — exactamente el caso vacío que la aceptación contempla.
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: REQ-070 — el detalle del turno tiene el bloque "Notas internas" con label + placeholder controlado
test('REQ-070: el detalle del turno muestra el bloque "Notas internas" (label + placeholder controlado)', async ({ page }) => {
  await gotoApp(page, '/agenda/tur-008');

  // Estamos en el detalle del turno (no en un empty-state de "no encontramos este turno").
  await expect(page.getByRole('heading', { level: 1, name: 'Agenda' })).toBeVisible();
  await expect(page.getByText('No encontramos este turno')).toHaveCount(0);

  // El bloque de notas existe y su label dice "Notas internas".
  const notes = page.locator('.appt__notes');
  await expect(notes).toBeVisible();
  const label = page.locator('.appt__notes-label');
  await expect(label).toBeVisible();
  await expect(label).toHaveText(/Notas internas/);

  // Contenido del bloque: o las notas reales (`.appt__notes-body`), o el placeholder controlado.
  const body = page.locator('.appt__notes-body');
  const empty = page.locator('.appt__notes-empty');
  const hasBody = (await body.count()) > 0;
  if (hasBody) {
    await expect(body).toBeVisible();
    await expect(body).not.toHaveText(/^\s*$/);
  } else {
    // En el seed los turnos no traen notas → placeholder controlado, nunca un hueco vacío.
    await expect(empty).toBeVisible();
    await expect(empty).toHaveText('Sin notas internas para este turno.');
  }
  // Exactamente uno de los dos estados está presente (no ambos, no ninguno).
  expect((await body.count()) + (await empty.count())).toBe(1);
});

// test: REQ-070b — el bloque "Notas internas" está presente en otro turno (no es específico de uno)
test('REQ-070: "Notas internas" está presente en cualquier turno del detalle', async ({ page }) => {
  // Llega a un turno desde el calendario para no depender de un id concreto.
  await gotoApp(page, '/agenda?vista=semana');
  const apptLink = page.locator('a[href^="/agenda/tur-"]').first();
  await expect(apptLink).toBeVisible();
  await apptLink.click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);

  // El bloque "Notas internas" aparece también acá (contrato del detalle, no de un turno puntual).
  await expect(page.locator('.appt__notes-label')).toHaveText(/Notas internas/);
  // Y tiene exactamente un estado de contenido resuelto (cuerpo o placeholder controlado).
  const resolved = (await page.locator('.appt__notes-body').count()) + (await page.locator('.appt__notes-empty').count());
  expect(resolved).toBe(1);
});

// test: REQ-070c — deep-link directo al detalle (refresh) preserva el bloque de notas
test('REQ-070: el bloque "Notas internas" sobrevive al deep-link/refresh del detalle', async ({ page }) => {
  await gotoApp(page, '/agenda/tur-009');
  await expect(page.locator('.appt__notes-label')).toHaveText(/Notas internas/);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/agenda\/tur-009$/);
  await expect(page.locator('.appt__notes-label')).toHaveText(/Notas internas/);
  await expect(page.locator('.appt__notes-body, .appt__notes-empty')).toBeVisible();
});
