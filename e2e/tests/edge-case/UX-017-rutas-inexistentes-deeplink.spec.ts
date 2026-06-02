import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Edge — Rutas inexistentes / deep-link inválido / estados "no encontrado"
 * (UX-006 rama edge · UX-017 · UX-054 · DC-104 · DC-126 · NFR-006..009 · NFR-013).
 * Regla dura: NUNCA crashea; siempre muestra empty-state sobrio dentro del shell;
 * el copy no revela demo/mock. Bajo Azure SWA el deep-link cae a index.html (no 404).
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design|resetear demo)\b/i;

// test: UX-017 / NFR-013 — el servidor devuelve la app (SPA fallback) para rutas del cliente
test('NFR-013: deep-link directo a ruta inexistente devuelve la SPA (no 404 del server)', async ({ page }) => {
  // Azure SWA (navigationFallback + responseOverrides.404 → 200) reescribe a index.html.
  // El contrato HTTP es la esencia de NFR-013: el server NO devuelve 404, devuelve el app shell.
  const resp = await page.goto('/ruta-basura-inexistente', { waitUntil: 'domcontentloaded' });
  expect(resp?.status()).toBe(200);

  // Render client-side: domcontentloaded resuelve con el shell ANTES de que Angular
  // descargue main.js, haga bootstrap + SeedReadyGuard y el router resuelva el wildcard.
  // Esperamos a que <app-root> hidrate antes de aserir el heading, con timeout explícito
  // y holgado para tolerar cold-start de la SWA (la causa del timeout intermitente previo).
  await page.locator('app-root').waitFor({ state: 'attached', timeout: 30_000 });
  await expect(
    page.getByRole('heading', { name: 'No encontramos esta página', exact: true }),
  ).toBeVisible({ timeout: 30_000 });
});

// test: UX-017 — ruta basura => /no-encontrado dentro del shell, "Volver al inicio" -> /reportes
test('UX-017: ruta inexistente muestra "No encontramos esta página" con vuelta al inicio', async ({ page }) => {
  await page.goto('/no-existe-esta-ruta-xyz', { waitUntil: 'domcontentloaded' });
  // Empty-state sobrio.
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
  const volver = page.getByRole('link', { name: 'Volver al inicio' });
  await expect(volver).toBeVisible();
  await expect(volver).toHaveAttribute('href', '/reportes');
  // Renderiza DENTRO del shell (navegación principal presente).
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  // Sin lenguaje de demo.
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(DEMO_FORBIDDEN);
  // Navega al inicio sin crashear.
  await volver.click();
  await expect(page).toHaveURL(/\/reportes$/);
});

// test: UX-017 / UX-054 / DC-126 — paciente inexistente => "No encontramos este paciente"
test('UX-017/DC-126: paciente inexistente muestra el estado no-encontrado, no crashea', async ({ page }) => {
  await warmSeed(page);
  await gotoApp(page, '/pacientes/pac-9999/informacion');
  await expect(page.getByRole('heading', { name: 'No encontramos este paciente' })).toBeVisible();
  await expect(page.getByText(/El paciente que buscás no existe o fue dado de baja/)).toBeVisible();
  const volver = page.getByRole('link', { name: 'Volver a la lista' });
  await expect(volver).toHaveAttribute('href', '/pacientes');
  await volver.click();
  await expect(page).toHaveURL(/\/pacientes$/);
});

// test: UX-017 — paciente inexistente por DEEP-LINK directo (sin warm-seed) no crashea
test('UX-017: deep-link directo a paciente inexistente hidrata y muestra no-encontrado', async ({ page, context }) => {
  const fresh = await context.newPage();
  const resp = await fresh.goto('/pacientes/pac-0000/informacion', { waitUntil: 'domcontentloaded' });
  expect(resp?.status()).toBe(200);
  await expect(fresh.getByRole('heading', { name: 'No encontramos este paciente' })).toBeVisible();
  await fresh.close();
});

// test: UX-006 (edge) / UX-049 / DC-104 — turno inexistente => "No encontramos este turno"
test('UX-006/DC-104: turno inexistente muestra "No encontramos este turno" con vuelta a Agenda', async ({ page }) => {
  await warmSeed(page);
  await gotoApp(page, '/agenda/tur-9999');
  await expect(page.getByRole('heading', { name: 'No encontramos este turno' })).toBeVisible();
  await expect(page.getByText(/El turno que buscás no existe o fue eliminado/)).toBeVisible();
  const volver = page.getByRole('link', { name: 'Volver a Agenda' });
  await expect(volver).toHaveAttribute('href', '/agenda');
  await volver.click();
  await expect(page).toHaveURL(/\/agenda$/);
});

// test: UX-017 — un prefijo de ruta inexistente (/agenda/turno/...) cae a /no-encontrado genérico
test('UX-017: prefijo de ruta no registrado cae al no-encontrado genérico', async ({ page }) => {
  await page.goto('/agenda/turno/tur-9999', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible();
});

// test: NFR-006..009 — barrido de rutas-basura variadas: ninguna crashea, todas muestran estado
test('NFR-006..009: varias rutas inválidas no crashean y muestran estado no-encontrado', async ({ page }) => {
  const basura = ['/foo', '/pacientes/abc', '/facturacion/zzz', '/reportes/inexistente', '/tratamientos/tipos/tt-9999'];
  for (const r of basura) {
    const resp = await page.goto(r, { waitUntil: 'domcontentloaded' });
    expect(resp?.status(), `status para ${r}`).toBe(200);
    // Hay un heading de "no encontramos..." y el shell sigue presente (no pantalla en blanco).
    const noEncontrado = page.getByRole('heading', { name: /No encontramos/ });
    await expect(noEncontrado, `estado no-encontrado en ${r}`).toBeVisible();
    const body = await page.locator('body').innerText();
    expect(body, `sin lenguaje de demo en ${r}`).not.toMatch(DEMO_FORBIDDEN);
  }
});
