import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Iteración 5 (Reportes: KPI dashboard responsive/a11y + skeletons), Ronda 1.
 *
 * FOCO del plan:
 *  · REQ-235 (DC-048/DC-084) — el grid de ≤6 KPI cards se apila a 1–2 columnas en mobile
 *      (multi-col en desktop) sin scroll horizontal; cada card respira.
 *  · REQ-236 (DC-028/NFR-021) — cada KPI es alcanzable y activable por TECLADO: las cards
 *      son `<a href="/reportes/...">` (focusables, Enter navega) con focus ring visible
 *      `0 0 0 2px #246991` en `:focus-visible`.
 *  · REQ-246 (DC-065/DC-118/DC-119/BVC-016) — al ENTRAR a un reporte aparecen SKELETONS
 *      (`app-skeleton`, wrapper `[aria-busy="true"]`, ~450ms) antes de los charts — NO
 *      spinner. El dashboard usa `aria-label="Cargando indicadores"`; el reporte detallado
 *      `aria-label="Cargando reporte"`. NUNCA debe existir un elemento `.spinner`.
 *      El estado "Sin datos suficientes para este gráfico" es source-only (con el seed todos
 *      los charts tienen datos) → se documenta; aquí se asevera que NO crashea y NO hay
 *      chart-empty visible.
 *
 * Contrato verificado EN VIVO (2026-06-03) contra el SWA desplegado:
 *   - /reportes: 6 KPI `<a href=/reportes/...>` (pacientes·productividad·tratamientos·
 *     financiero·financiero·financiero). Grid 3 col @1280px (314px×3) → 1 col @390px.
 *     Focus ring KPI = "rgb(36, 105, 145) 0px 0px 0px 2px".
 *   - Al hacer click en una card del dashboard hacia un reporte (navegación SPA), aparece
 *     `app-skeleton` + `[aria-busy="true"][aria-label="Cargando reporte"]`, sin `.spinner`.
 *   - El botón "Actualizar" del dashboard re-dispara `[aria-busy="true"]
 *     [aria-label="Cargando indicadores"]` con `app-skeleton`, sin `.spinner`.
 */

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

/** Locator de las KPI cards del dashboard (los <a> que envuelven un <article>). */
function kpiCards(page: Page) {
  return page.locator('main a[href^="/reportes/"]').filter({ has: page.locator('article') });
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ── REQ-235: grid de KPIs responsive (multi-col desktop → 1–2 col mobile, sin scroll-x) ──

test('REQ-235: dashboard KPI — grid multi-columna en desktop, 1–2 columnas en mobile, sin scroll horizontal', async ({ page }) => {
  const gridColCount = () => page.evaluate(() => {
    const card = document.querySelector('main a[href^="/reportes/"]');
    const grid = card?.parentElement as HTMLElement | null;
    return grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
  });

  // Desktop: ≤6 cards en grid de varias columnas (3 según el contrato vivo).
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/reportes');
  await expect(kpiCards(page).first()).toBeVisible();
  const cardCount = await kpiCards(page).count();
  expect(cardCount).toBeGreaterThan(0);
  expect(cardCount, 'más de 6 KPI cards (DC-048 ≤6)').toBeLessThanOrEqual(6);
  const desktopCols = await gridColCount();
  expect(desktopCols, 'el grid de KPIs no es multi-columna en desktop').toBeGreaterThanOrEqual(2);
  expect(await hasHorizontalScroll(page)).toBe(false);

  // Mobile: se apila a 1–2 columnas, sin scroll horizontal.
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/reportes');
  await expect(kpiCards(page).first()).toBeVisible();
  const mobileCols = await gridColCount();
  expect(mobileCols, 'mobile debe tener 1–2 columnas').toBeGreaterThanOrEqual(1);
  expect(mobileCols).toBeLessThanOrEqual(2);
  expect(mobileCols, 'mobile no debe tener más columnas que desktop').toBeLessThanOrEqual(desktopCols);
  expect(await hasHorizontalScroll(page)).toBe(false);
});

// ── REQ-236: KPI alcanzable y activable por teclado, focus ring visible ──────────

test('REQ-236: KPI cards son links alcanzables por teclado con focus ring 2px #246991', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/reportes');
  const cards = kpiCards(page);
  await expect(cards.first()).toBeVisible();

  // Cada KPI es un <a href="/reportes/..."> real (navegación por teclado nativa).
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const href = await cards.nth(i).getAttribute('href');
    expect(href, `KPI ${i} sin href de reporte`).toMatch(/^\/reportes\/(pacientes|tratamientos|financiero|productividad)$/);
  }

  // Focus ring visible en :focus-visible de la primera KPI.
  const ring = await page.evaluate(() => {
    const a = document.querySelector('main a[href^="/reportes/"]') as HTMLElement | null;
    if (!a) return { ok: false } as any;
    a.focus();
    return {
      matchesFV: a.matches(':focus-visible'),
      boxShadow: getComputedStyle(a).boxShadow,
      isFocused: document.activeElement === a,
    };
  });
  expect(ring.isFocused).toBe(true);
  expect(ring.matchesFV).toBe(true);
  // El ring resuelto = rgb(36,105,145) 0 0 0 2px == #246991 2px (DC-028).
  expect(ring.boxShadow).toContain('rgb(36, 105, 145)');
  expect(ring.boxShadow).toContain('2px');

  // Activación por teclado: enfocar por Tab hasta la primera KPI y Enter navega a su reporte.
  const firstHref = await cards.first().getAttribute('href');
  await cards.first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`${firstHref!.replace('/', '\\/')}$`));
});

// ── REQ-246: skeletons (no spinner) al entrar a un reporte detallado ─────────────

/**
 * Captura determinista de un skeleton transitorio (~450ms).
 *
 * Instala un MutationObserver Y dispara la acción (click) DENTRO del mismo
 * `page.evaluate`, de forma atómica: así el observer está garantizado activo antes
 * de que la mutación ocurra (sin la latencia del round-trip install→click que perdía
 * la ventana en headless). Luego `waitForFunction` espera a que el skeleton haya sido
 * visto O a que el contenido final haya vuelto, y se lee el flag. Devuelve lo observado.
 *
 * @param trigger CSS/text matcher del elemento a clickear ('actualizar' = botón;
 *                'report:Financiero' = card de reporte detallado por su texto).
 */
async function observeSkeletonOnAction(page: Page, kind: 'actualizar' | 'report') {
  await page.evaluate((k) => {
    const w = window as any;
    w.__skel = { sawSkeleton: false, sawBusy: false, sawSpinner: false, busyLabels: [] as string[], done: false };
    const check = () => {
      if (document.querySelector('app-skeleton')) w.__skel.sawSkeleton = true;
      document.querySelectorAll('[aria-busy="true"]').forEach((b) => {
        w.__skel.sawBusy = true;
        const l = b.getAttribute('aria-label');
        if (l && !w.__skel.busyLabels.includes(l)) w.__skel.busyLabels.push(l);
      });
      if (document.querySelector('.spinner, [class*="spinner"]')) w.__skel.sawSpinner = true;
    };
    w.__skelObs = new MutationObserver(check);
    w.__skelObs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-busy', 'class'] });
    check();
    // Disparar la acción de forma atómica con el observer ya activo.
    let el: HTMLElement | null = null;
    if (k === 'actualizar') {
      el = [...document.querySelectorAll('button')].find((b) => /Actualizar/.test(b.textContent || '')) || null;
    } else {
      // card de reporte detallado "Financiero …" (anchor con routerLink → SPA nav)
      el = [...document.querySelectorAll('main a[href^="/reportes/"]')]
        .find((a) => /^Financiero/.test((a.textContent || '').trim())) as HTMLElement | null;
    }
    el?.click();
    // Marcar como resuelto SOLO cuando vuelve el contenido final esperado para esta acción:
    //  - report     → el reporte detallado montó sus charts (`main figure.mc`).
    //  - actualizar  → no cambia de pantalla; el "done" lo gobierna haber visto el skeleton
    //    (o un timeout de respaldo) para no resolver antes de tiempo en el dashboard.
    const startedAt = Date.now();
    const settled = () => {
      check();
      if (k === 'report') {
        if (document.querySelector('main figure.mc')) w.__skel.done = true;
      } else {
        // dashboard: resolver una vez visto el skeleton, o tras una ventana de respaldo.
        if (w.__skel.sawSkeleton || Date.now() - startedAt > 1200) w.__skel.done = true;
      }
    };
    w.__settleObs = new MutationObserver(settled);
    w.__settleObs.observe(document.body, { childList: true, subtree: true });
    // Respaldo temporal para el caso 'actualizar' (por si no hubo mutaciones tras el skeleton).
    w.__settleTimer = setInterval(settled, 100);
  }, kind);

  // Esperar de forma determinista a que el skeleton haya sido visto o el contenido haya vuelto.
  await page.waitForFunction(() => {
    const w = window as any;
    return w.__skel && (w.__skel.sawSkeleton || w.__skel.done);
  }, null, { timeout: 15_000 });

  return page.evaluate(() => {
    const w = window as any;
    if (w.__skelObs) w.__skelObs.disconnect();
    if (w.__settleObs) w.__settleObs.disconnect();
    if (w.__settleTimer) clearInterval(w.__settleTimer);
    return w.__skel;
  });
}

test('REQ-246: al entrar a un reporte detallado aparece skeleton (aria-busy "Cargando reporte"), NO spinner', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  // Estar en el dashboard primero (KPIs ya cargados); el skeleton aparece al navegar al reporte.
  await gotoApp(page, '/reportes');
  await expect(kpiCards(page).first()).toBeVisible();

  const skel = await observeSkeletonOnAction(page, 'report');
  // Confirmar que terminó en el reporte (charts visibles).
  await expect(page.locator('main figure.mc').first()).toBeVisible();

  expect(skel.sawSkeleton, 'no apareció ningún app-skeleton al entrar al reporte').toBe(true);
  expect(skel.sawBusy, 'no apareció ningún [aria-busy="true"]').toBe(true);
  expect(skel.busyLabels, 'el wrapper de carga del reporte no usa "Cargando reporte"').toContain('Cargando reporte');
  // NUNCA un spinner (DC-065/DC-120/BVC-016).
  expect(skel.sawSpinner, 'apareció un spinner (prohibido — debe ser skeleton)').toBe(false);
});

// ── REQ-246: skeleton del dashboard al refrescar (no spinner) ────────────────────

test('REQ-246: el dashboard usa skeleton "Cargando indicadores" al actualizar, NO spinner', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/reportes');
  await expect(kpiCards(page).first()).toBeVisible();

  // "Actualizar" re-dispara el effect de carga del dashboard (skeleton "Cargando indicadores").
  const skel = await observeSkeletonOnAction(page, 'actualizar');
  await expect(kpiCards(page).first()).toBeVisible();

  expect(skel.sawSkeleton, 'no apareció app-skeleton al actualizar el dashboard').toBe(true);
  expect(skel.sawBusy).toBe(true);
  expect(skel.busyLabels, 'el dashboard no usa "Cargando indicadores"').toContain('Cargando indicadores');
  expect(skel.sawSpinner, 'apareció un spinner en el dashboard (prohibido)').toBe(false);
});

// ── REQ-246: ningún spinner NUNCA + ningún chart-empty con datos del seed ────────

test('REQ-246: ningún `.spinner` en dashboard ni reportes; sin "chart-empty" con el seed', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  const routes = ['/reportes', '/reportes/pacientes', '/reportes/tratamientos', '/reportes/financiero', '/reportes/productividad'];
  for (const route of routes) {
    await gotoApp(page, route);
    // Esperar contenido final (KPIs o charts) según la ruta.
    if (route === '/reportes') {
      await expect(kpiCards(page).first()).toBeVisible();
    } else {
      await expect(page.locator('main figure.mc').first()).toBeVisible();
    }
    const state = await page.evaluate(() => ({
      spinner: document.querySelectorAll('.spinner, [class*="spinner"]').length,
      chartEmpty: document.querySelectorAll('.chart-empty, [class*="chart-empty"]').length,
      sinDatos: /Sin datos suficientes para este gráfico/i.test(document.querySelector('main')?.textContent || ''),
    }));
    expect(state.spinner, `spinner presente en ${route}`).toBe(0);
    // Con el seed completo todos los charts tienen datos → no debe haber empty visible.
    expect(state.chartEmpty, `chart-empty visible en ${route} (el seed tiene datos)`).toBe(0);
    expect(state.sinDatos, `"Sin datos suficientes" visible en ${route} (el seed tiene datos)`).toBe(false);
  }
});
