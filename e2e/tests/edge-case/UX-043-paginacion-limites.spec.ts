import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Edge — Muchos datos / límites (UX-043). Las listas largas usan paginación offset
 * (default 12) con contador "1–N de M". NUNCA infinite scroll. Verificado en la lista
 * de pacientes (29 del seed): contador correcto, navegación entre páginas, sin scroll
 * infinito (el total de filas por página está acotado, no crece al hacer scroll).
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-043 — la lista de pacientes muestra el contador "1–12 de 29" y 3 páginas
test('UX-043: lista de pacientes pagina de a 12 con contador "1–N de M"', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await expect(page.getByText('1–12 de 29')).toBeVisible();
  await expect(page.getByText('1 / 3')).toBeVisible();
  // En la página 1, "Página anterior" está deshabilitado.
  await expect(page.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
});

// El data-table renderiza filas como <tr> en desktop y mini-cards <div> en mobile
// (DC-081). Ambas estructuras coexisten en el DOM (una oculta por CSS display:none según
// breakpoint), las dos con aria-label "Ver ficha de …". Contamos solo las VISIBLES para
// que el test sea viewport-agnóstico (12 / 5 filas reales según la página).
const filasLocator = (page: import('@playwright/test').Page) =>
  page.locator('main [aria-label^="Ver ficha de"]:visible');

// test: UX-043 — la página 1 muestra exactamente 12 filas (no más, no infinite scroll)
test('UX-043: la página 1 renderiza 12 filas (tope de página, sin scroll infinito)', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await expect(page.getByText('1–12 de 29')).toBeVisible();
  const filas = filasLocator(page);
  await expect(filas).toHaveCount(12);

  // Hacer scroll al fondo NO carga más filas (no es infinite scroll).
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(500);
  await expect(filas).toHaveCount(12);
  await expect(page.getByText('1–12 de 29')).toBeVisible();
});

// test: UX-043 — navegar a la página siguiente actualiza el contador y las filas
test('UX-043: avanzar de página actualiza contador y filas, y la última pesa el resto', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.getByText('13–24 de 29')).toBeVisible();
  await expect(page.getByText('2 / 3')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Página anterior' })).toBeEnabled();

  // Página 3 (última): 29 - 24 = 5 filas, y "Página siguiente" deshabilitado.
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.getByText('25–29 de 29')).toBeVisible();
  await expect(page.getByText('3 / 3')).toBeVisible();
  await expect(filasLocator(page)).toHaveCount(5);
  await expect(page.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
});

// test: UX-043 — "Página anterior" regresa a la página previa correctamente
test('UX-043: retroceder de página restaura el contador anterior', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('button', { name: 'Página siguiente' }).click();
  await expect(page.getByText('13–24 de 29')).toBeVisible();
  await page.getByRole('button', { name: 'Página anterior' }).click();
  await expect(page.getByText('1–12 de 29')).toBeVisible();
  await expect(page.getByText('1 / 3')).toBeVisible();
});

// test: UX-043 — filtrar reduce el total del contador (M cae) sin romper la paginación
test('UX-043: al filtrar, el contador refleja el subconjunto', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('searchbox', { name: 'Buscar pacientes' }).fill('Sosa');
  // Un único resultado del seed (Diego Sosa) => "1–1 de 1".
  await expect(page.getByText('1–1 de 1')).toBeVisible();
});
