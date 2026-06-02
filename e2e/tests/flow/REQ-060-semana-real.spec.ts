import { test, expect } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * REQ-060 — Vista SEMANAL **real** de la Agenda (bug corregido en It3).
 *
 * El toggle "Semana" / `?vista=semana` debe montar `app-week-view` con **7 columnas-día**
 * (`.week__col`, lunes→domingo de la semana que contiene "hoy" = 1..7 jun 2026), con un grid
 * `grid-template-columns: repeat(7, 1fr)`, y el grid MENSUAL AUSENTE (`.cal__grid` = 0).
 *
 * Por qué este test (gap-analysis It3): UX-005/UX-082 solo asertan que la URL cambia a
 * `?vista=semana` → pasarían igual con el grid mensual viejo (el bug). Aquí se aserta el
 * RENDER de las 7 columnas, que es lo único que distingue la semana real del mes.
 *
 * Solo desktop: la semana es una vista de escritorio. En mobile el default es la lista/día
 * (cubierto por REQ-068, Visual) y el `.week` colapsa a 1 columna, así que el test se salta
 * en el project mobile para no asertar el layout de escritorio fuera de su breakpoint.
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: REQ-060 — deep-link `?vista=semana` monta la semana real (7 columnas, sin grid mensual)
test('REQ-060: ?vista=semana monta app-week-view con 7 columnas-día y sin grid mensual', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'La vista semanal es de escritorio (mobile = lista/día, REQ-068)');

  await gotoApp(page, '/agenda?vista=semana');

  // El componente de semana real está montado (NO el grid mensual del bug).
  const week = page.locator('app-week-view .week');
  await expect(week).toBeVisible();

  // 7 columnas-día reales.
  const cols = page.locator('app-week-view .week__col');
  await expect(cols).toHaveCount(7);

  // El grid se compone con 7 tracks (repeat(7,1fr) → 7 anchos resueltos en getComputedStyle).
  const tracks = await week.evaluate(
    (el) => getComputedStyle(el as HTMLElement).gridTemplateColumns.split(' ').filter(Boolean).length,
  );
  expect(tracks).toBe(7);

  // Encabezados de los 7 días de la semana de hoy: Lun(1)→Dom(7) de junio 2026.
  const weekdays = page.locator('app-week-view .week__weekday');
  await expect(weekdays).toHaveText(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']);
  await expect(page.locator('app-week-view .week__daynum').first()).toHaveText('1');
  await expect(page.locator('app-week-view .week__daynum').last()).toHaveText('7');
  // El día de hoy (lunes 1) está marcado como "is-today".
  await expect(page.locator('app-week-view .week__col.is-today')).toHaveCount(1);

  // El grid MENSUAL del bug NO está presente.
  await expect(page.locator('.cal__grid')).toHaveCount(0);

  // Los turnos de la semana son bloques clickeables → detalle (no chips muertos).
  const firstAppt = page.locator('app-week-view .week__col a[href^="/agenda/tur-"]').first();
  await expect(firstAppt).toBeVisible();
});

// test: REQ-060b — el toggle "Semana" (desde Mes) cambia el render a semana real, no solo la URL
test('REQ-060: el toggle "Semana" rinde la semana real (desde la vista Mes)', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'La vista semanal es de escritorio');

  // Arranca en Mes (default desktop): el grid mensual existe.
  await gotoApp(page, '/agenda');
  await expect(page.locator('.cal__grid')).toBeVisible();
  await expect(page.locator('app-week-view')).toHaveCount(0);

  // Click en el toggle "Semana".
  await page.getByRole('group', { name: 'Vista del calendario' }).getByRole('button', { name: 'Semana' }).click();
  await expect(page).toHaveURL(/\?vista=semana/);

  // Tras el toggle, el render cambió a semana real: 7 columnas, grid mensual desaparece.
  await expect(page.locator('app-week-view .week__col')).toHaveCount(7);
  await expect(page.locator('.cal__grid')).toHaveCount(0);
  // El botón "Semana" queda marcado activo.
  await expect(
    page.getByRole('group', { name: 'Vista del calendario' }).getByRole('button', { name: 'Semana' }),
  ).toHaveClass(/is-active/);

  // Volver a "Mes" restaura el grid mensual (toggle reversible).
  await page.getByRole('group', { name: 'Vista del calendario' }).getByRole('button', { name: 'Mes' }).click();
  await expect(page).toHaveURL(/\?vista=mes/);
  await expect(page.locator('.cal__grid')).toBeVisible();
  await expect(page.locator('app-week-view')).toHaveCount(0);
});
