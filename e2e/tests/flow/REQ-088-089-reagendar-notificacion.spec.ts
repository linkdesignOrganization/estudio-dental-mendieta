import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp, resetSeed, bellBadgeCount } from '../_helpers/seed';

/**
 * REQ-088 / REQ-089 / REQ-091 — **Reagendar → notificación de WhatsApp REAL** (flujo estrella It3).
 *
 * Flujo E2E completo, contra el sitio desplegado:
 *   1. `/agenda/:id/reagendar` → elegir nueva fecha (`input#r-date`) + un slot libre (`.resch__slot`
 *      no `[disabled]`) → "Confirmar nuevo horario".
 *   2. (a) El badge de la campana (`.header__badge`) **incrementa en 1** (notificación NO leída).
 *      (b) El panel de notificaciones (`.np__item`) muestra un item **"Aviso de WhatsApp enviado"**
 *          con lenguaje de PRODUCCIÓN — sin "mock/simulado/de prueba" (red anti-demo REQ-272).
 *      (c) Toast de confirmación ("Turno reagendado… Se notificó al paciente por WhatsApp").
 *      (d) El detalle del turno refleja la **nueva fecha/hora**.
 *   3. Persistencia: la notificación + el badge sobreviven a un refresh (estado persistido).
 *
 * Por qué este test (gap-analysis It3): DC-133 solo prueba que una notificación DEL SEED navega;
 * la ruta `/…/reagendar` solo tenía un smoke "shell renderiza". NADIE ejecutaba reagendar →
 * genera notificación → el badge incrementa. Este spec cierra ese gap con aserciones honestas
 * (verificadas en vivo: badge 5→6, item "Aviso de WhatsApp enviado", turno pasa a Mar 9 jun 09:00).
 *
 * Idempotencia (la nota del plan): reagendar MUTA estado persistido y la notificación usa
 * `id = not-${Date.now()}` (no PRNG). Para no contaminar otros specs ni acumular badges entre
 * corridas, cada test parte de un seed FRESCO (`resetSeed`) → el badge arranca en su valor de
 * seed y el delta +1 es determinista. El badge inicial se lee dinámicamente (no se hardcodea).
 */

// Confirma una reagenda de `turnoId` al primer slot libre de la fecha por defecto.
// Devuelve { badgeAntes, fecha, hora } para que el caller aserte el delta y la nueva fecha/hora.
async function reagendar(page: Page, turnoId: string): Promise<{ badgeAntes: number; hora: string }> {
  await gotoApp(page, `/agenda/${turnoId}/reagendar`);
  // El formulario de reagendar está montado (no el empty-state de "no encontramos este turno").
  await expect(page.getByRole('heading', { name: 'Elegí un nuevo horario' })).toBeVisible();
  await expect(page.locator('input#r-date')).toBeVisible();

  // Badge antes de confirmar (notificaciones del seed). Se lee del header, fuente de verdad.
  const badgeAntes = await bellBadgeCount(page);

  // Elegir el primer slot LIBRE (no `[disabled]`): los ocupados del profesional están deshabilitados.
  const freeSlot = page.locator('.resch__slot:not([disabled])').first();
  await expect(freeSlot).toBeVisible();
  const hora = ((await freeSlot.textContent()) ?? '').trim();
  await freeSlot.click();
  await expect(freeSlot).toHaveClass(/is-selected/);

  // "Confirmar nuevo horario" se habilita al elegir slot; al confirmar navega al detalle.
  const confirmar = page.getByRole('button', { name: 'Confirmar nuevo horario' });
  await expect(confirmar).toBeEnabled();
  await confirmar.click();
  await expect(page).toHaveURL(new RegExp(`/agenda/${turnoId}$`));

  return { badgeAntes, hora };
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
  // Punto de partida limpio: el flujo muta estado persistido (badge/notificación).
  await resetSeed(page, '/agenda');
});

// test: REQ-089 — reagendar genera el aviso de WhatsApp REAL: badge +1, item en la campana, nueva fecha
test('REQ-089: reagendar genera el aviso de WhatsApp (badge +1, item en la campana, nueva fecha)', async ({ page }) => {
  const turnoId = 'tur-008'; // turno confirmado (no terminal) → reagendar disponible

  // (c) El toast de confirmación se dispara al confirmar (success, ~3s). Lo armamos como espera
  //     y validamos su copy de producción; aparece de forma síncrona junto con la navegación.
  const { badgeAntes, hora } = await reagendar(page, turnoId);

  const toast = page.locator('.toast__msg', { hasText: /WhatsApp/i });
  await expect(toast).toBeVisible();
  await expect(toast).toHaveText(/Turno reagendado\.\s*Se notificó al paciente por WhatsApp\./);

  // (a) El badge de la campana incrementó EXACTAMENTE en 1 (la notificación nace "sin leer").
  await expect.poll(async () => bellBadgeCount(page), { timeout: 10_000 }).toBe(badgeAntes + 1);

  // (d) El detalle del turno refleja la nueva hora elegida (la fecha por defecto es 2026-06-09).
  await expect(page.getByText(new RegExp(`${hora}\\s*·`))).toBeVisible();
  await expect(page.locator('.appt__row dd').filter({ hasText: /junio de 2026/ })).toBeVisible();

  // (b) Abrir la campana → el primer item es el aviso de WhatsApp REAL.
  await page.getByRole('button', { name: 'Notificaciones' }).click();
  const panel = page.getByRole('dialog', { name: 'Notificaciones' });
  await expect(panel).toBeVisible();

  const aviso = panel.locator('.np__item').filter({ hasText: 'Aviso de WhatsApp enviado' }).first();
  await expect(aviso).toBeVisible();
  await expect(aviso.locator('.np__item-title')).toHaveText('Aviso de WhatsApp enviado');
  // El subtítulo nombra al paciente y el nuevo horario, en lenguaje de producción.
  await expect(aviso.locator('.np__item-sub')).toHaveText(/fue notificado del nuevo horario:/);
  // Está "sin leer" (por eso subió el badge).
  await expect(aviso.locator('.np__dot')).toBeVisible();

  // (b-REQ-272) Red anti-demo: NADA de lenguaje de simulación en el item nuevo.
  const avisoText = ((await aviso.textContent()) ?? '').toLowerCase();
  expect(avisoText).not.toMatch(/mock|simulad|de prueba|fake|dummy|lorem/);
});

// test: REQ-091 — la notificación + el badge PERSISTEN tras un refresh (estado persistido)
test('REQ-091: la notificación de WhatsApp y el badge sobreviven al refresh', async ({ page }) => {
  const turnoId = 'tur-009'; // otro turno confirmado

  const { badgeAntes } = await reagendar(page, turnoId);
  await expect.poll(async () => bellBadgeCount(page), { timeout: 10_000 }).toBe(badgeAntes + 1);

  // Refrescar la página: el estado se rehidrata desde localStorage (no se regenera el seed).
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();

  // El badge sigue incrementado tras el refresh (la notificación se persistió).
  await expect.poll(async () => bellBadgeCount(page), { timeout: 10_000 }).toBe(badgeAntes + 1);

  // Y el item sigue en la campana.
  await page.getByRole('button', { name: 'Notificaciones' }).click();
  const aviso = page
    .getByRole('dialog', { name: 'Notificaciones' })
    .locator('.np__item')
    .filter({ hasText: 'Aviso de WhatsApp enviado' });
  await expect(aviso.first()).toBeVisible();
});

// test: REQ-088 — abrir el aviso desde la campana navega al detalle del turno reagendado
test('REQ-088: abrir el aviso de WhatsApp desde la campana navega al turno reagendado', async ({ page }) => {
  const turnoId = 'tur-010';

  await reagendar(page, turnoId);

  // Ir a otra sección para probar la navegación desde la notificación (no estar ya en el turno).
  await gotoApp(page, '/reportes');
  await page.getByRole('button', { name: 'Notificaciones' }).click();
  const aviso = page
    .getByRole('dialog', { name: 'Notificaciones' })
    .locator('.np__item')
    .filter({ hasText: 'Aviso de WhatsApp enviado' })
    .first();
  await expect(aviso).toBeVisible();
  await aviso.click();

  // Abrir la notificación navega a la ruta del turno reagendado (REQ-088: deep-link de la notificación).
  await expect(page).toHaveURL(new RegExp(`/agenda/${turnoId}$`));
  await expect(page.getByRole('heading', { level: 1, name: 'Agenda' })).toBeVisible();
});
