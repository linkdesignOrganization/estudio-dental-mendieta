import { Page, expect } from '@playwright/test';

/**
 * Shared helpers for the Flow Tester suite.
 *
 * The app is frontend-only: state lives in localStorage under `edm:v1:state`,
 * hydrated by SeedReadyGuard before any internal route renders. Deep-links work
 * because Azure SWA falls back to index.html and the guard hydrates the store.
 */
export const STATE_KEY = 'edm:v1:state';

/** Navigate to an internal route and wait for the seed-backed shell to be ready. */
export async function gotoApp(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // The sidebar (navegación principal) only renders once the shell + seed are ready.
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
}

/** Warm the seed once (first internal load hydrates localStorage). */
export async function warmSeed(page: Page): Promise<void> {
  await gotoApp(page, '/reportes');
  await page.waitForFunction(() => !!localStorage.getItem('edm:v1:state'), null, { timeout: 20_000 });
}

/** Read the parsed localStorage state. */
export async function readState(page: Page): Promise<any> {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), STATE_KEY);
}

/** Parse an ARS-formatted amount like "$ 276.020" / "−$ 100.000" into a number (sign included). */
export function parseArs(text: string): number {
  const negative = /[−-]/.test(text.trim().charAt(0)) || text.trim().startsWith('−');
  const digits = text.replace(/[^\d]/g, '');
  const n = digits ? parseInt(digits, 10) : NaN;
  return negative ? -n : n;
}
