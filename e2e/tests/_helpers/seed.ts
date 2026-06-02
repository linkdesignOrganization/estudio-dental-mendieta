import { Page, Locator, expect } from '@playwright/test';

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

/**
 * Reset the store back to the deterministic seed.
 *
 * Some flows MUTATE persisted state (e.g. reagendar pushes a real WhatsApp
 * NotificationEntity → the bell badge increments and survives refresh). To keep
 * such specs idempotent and avoid contaminating later specs, we clear the
 * localStorage state key and reload `path`: the SeedReadyGuard then re-hydrates
 * from scratch and `StoreService.hydrate()` regenerates the byte-identical seed.
 * After the reload we wait for the shell (seed-backed) so the page is ready to
 * drive. Returns once the seed is freshly hydrated again.
 */
export async function resetSeed(page: Page, path = '/agenda'): Promise<void> {
  // Make sure we are on the app origin so localStorage is accessible.
  if (!page.url().startsWith('http')) {
    await gotoApp(page, path);
  }
  await page.evaluate((k) => localStorage.removeItem(k), STATE_KEY);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  // Guard re-hydrates from the seed; wait until the state is back in storage.
  await page.waitForFunction((k) => !!localStorage.getItem(k), STATE_KEY, { timeout: 20_000 });
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
}

/**
 * Current unread badge count on the header bell (0 when the badge is absent).
 * The badge `.header__badge` only renders when `unreadCount() > 0`.
 */
export async function bellBadgeCount(page: Page): Promise<number> {
  const badge = page.locator('.header__badge');
  if ((await badge.count()) === 0) return 0;
  const txt = (await badge.first().textContent())?.trim() ?? '0';
  const n = parseInt(txt, 10);
  return Number.isNaN(n) ? 0 : n;
}

/** Parse an ARS-formatted amount like "$ 276.020" / "−$ 100.000" into a number (sign included). */
export function parseArs(text: string): number {
  const negative = /[−-]/.test(text.trim().charAt(0)) || text.trim().startsWith('−');
  const digits = text.replace(/[^\d]/g, '');
  const n = digits ? parseInt(digits, 10) : NaN;
  return negative ? -n : n;
}

/**
 * Open the primary navigation so its items are clickable.
 *
 * Responsive contract (verified live, R2):
 *  - Desktop (≥1200px): the sidebar is a fixed column always on screen. The
 *    hamburger ("Abrir menú de navegación") is `display:none`. → no-op.
 *  - Mobile (<1200px): the sidebar is an off-canvas DRAWER. The `<nav>` lives in
 *    the DOM but is translated `translateX(-100%)` (x≈-314 in a 393px viewport),
 *    so although Playwright reports it visible, `.click()` on its items times out
 *    (~19s) — the element is outside the viewport and not actionable. The drawer
 *    must be opened via the hamburger first; we wait for the backdrop AND for the
 *    nav to finish sliding in (x ≥ 0) so the click lands on a settled target.
 *
 * Use this before clicking any sidebar item. Works in both projects.
 */
export async function openNav(page: Page): Promise<void> {
  const burger = page.getByRole('button', { name: 'Abrir menú de navegación' });
  // Desktop: hamburger hidden → sidebar already fixed and clickable.
  if (!(await burger.isVisible())) return;
  // Mobile: open the drawer if it is not already open (backdrop only exists when open).
  const backdrop = page.locator('.shell__backdrop');
  if (!(await backdrop.isVisible().catch(() => false))) {
    await burger.click();
  }
  await backdrop.waitFor({ state: 'visible', timeout: 5_000 });
  // Wait for the slide-in transform to settle (nav fully on screen).
  await page.waitForFunction(() => {
    const n = document.querySelector('nav[aria-label="Navegación principal"]');
    return !!n && n.getBoundingClientRect().x >= 0;
  }, null, { timeout: 5_000 });
}

/**
 * The VISIBLE patient row/card for a given full name, regardless of viewport.
 *
 * The patients list renders two synchronized DOM trees that share the same
 * `aria-label="Ver ficha de <name>"`:
 *  - Desktop: a `<tr class="dt__tr">` inside a `<table class="dt__table">`.
 *  - Mobile:  a `<div class="dt__card">` (the table is `display:none`).
 * So the bare `aria-label` resolves to TWO elements (one in a hidden subtree).
 * Filtering by `{ visible: true }` keeps the one that is actually on screen.
 *
 * NOTE: the inner `.cell-person__name` <span> has a zero-size box inside the
 * hidden table (w/h=0), which is why `getByText(name)` was not actionable in
 * mobile. Inside the visible card/row the name has a real box, so we click it.
 */
export function patientRow(page: Page, name: string): Locator {
  return page.locator(`[aria-label="Ver ficha de ${name}"]`).filter({ visible: true });
}

/** Click the visible patient row/card by name (clicks the in-row name, actionable in both viewports). */
export async function openPatient(page: Page, name: string): Promise<void> {
  await patientRow(page, name).getByText(name, { exact: true }).click();
}
