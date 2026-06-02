import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Responsive (DC-080..089) en 3 breakpoints.
 * mobile <768px · tablet 768-1199px · desktop ≥1200px.
 * Sidebar→drawer, tabla→mini-cards, ficha recentrada, tabs scroll-x, sin scroll horizontal.
 */

const PID = 'pac-001';
const MOBILE = { width: 375, height: 812 };
const TABLET = { width: 900, height: 1000 };
const DESKTOP = { width: 1280, height: 900 };

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// DC-080 — mobile: sidebar oculto + hamburguesa visible; desktop: sidebar fijo.
test('DC-080: sidebar→drawer en mobile (hamburguesa), fijo en desktop', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/pacientes');
  await page.waitForTimeout(400);
  await expect(page.getByRole('button', { name: /Abrir menú de navegación|navegación/i })).toBeVisible();
  const sidebarOffscreen = await page.evaluate(() => {
    const aside = document.querySelector('.shell__sidebar, aside') as HTMLElement | null;
    if (!aside) return false;
    const t = getComputedStyle(aside).transform;
    // drawer cerrado → translateX(-100%) (matrix con tx negativo) o fuera de viewport
    return aside.getBoundingClientRect().right <= 1 || /matrix.*-/.test(t);
  });
  expect(sidebarOffscreen).toBe(true);

  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/pacientes');
  await page.waitForTimeout(300);
  const sidebarFixed = await page.evaluate(() => {
    const aside = document.querySelector('.shell__sidebar, aside') as HTMLElement | null;
    return aside ? aside.getBoundingClientRect().width : 0;
  });
  expect(sidebarFixed).toBeGreaterThanOrEqual(220);
});

// DC-081 — mobile: tabla→mini-cards verticales, sin scroll horizontal.
test('DC-081: tabla → mini-cards en mobile, sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/pacientes');
  await page.getByRole('heading', { level: 1, name: 'Pacientes' }).waitFor();
  await page.waitForTimeout(400);
  const layout = await page.evaluate(() => {
    const table = document.querySelector('.dt__table, table');
    const cards = document.querySelector('.dt__cards');
    return {
      tableDisplay: table ? getComputedStyle(table as HTMLElement).display : 'none',
      cardsDisplay: cards ? getComputedStyle(cards as HTMLElement).display : 'none',
    };
  });
  expect(layout.tableDisplay).toBe('none');
  expect(layout.cardsDisplay).not.toBe('none');
  expect(await hasHorizontalScroll(page)).toBe(false);
});

// DC-082/083 — mobile: cabecera de ficha recentrada + barra de 6 tabs con scroll horizontal.
test('DC-082/083: ficha en mobile — nombre centrado + tabs con scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const nameH1 = [...document.querySelectorAll('h1')].find((h) => !/Pacientes|Información/.test(h.textContent || ''));
    const tablist = document.querySelector('[role="tablist"]') as HTMLElement | null;
    return {
      nameAlign: nameH1 ? getComputedStyle(nameH1).textAlign : '',
      tabsScrollable: tablist ? tablist.scrollWidth > tablist.clientWidth : false,
      tabsOverflowX: tablist ? getComputedStyle(tablist).overflowX : '',
    };
  });
  expect(info.nameAlign).toBe('center');
  expect(info.tabsScrollable).toBe(true);
  expect(['auto', 'scroll']).toContain(info.tabsOverflowX);
  expect(await hasHorizontalScroll(page)).toBe(false);
});

// DC-088 — sin scroll horizontal en mobile en pantallas clave.
test('DC-088: sin scroll horizontal no intencional en mobile (recorrido)', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  const routes = ['/reportes', '/pacientes', '/agenda', `/pacientes/${PID}/informacion`, `/pacientes/${PID}/odontograma`, '/facturacion/facturas'];
  for (const route of routes) {
    await gotoApp(page, route);
    await page.waitForTimeout(500);
    expect(await hasHorizontalScroll(page), `scroll horizontal en ${route}`).toBe(false);
  }
});

// DC-084 — grids de cards adaptan columnas (KPIs): desktop multi-col, mobile 1-2 col.
test('DC-084: grid de KPI cards adapta columnas por breakpoint', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/reportes');
  await page.waitForTimeout(400);
  const desktopCols = await page.evaluate(() => {
    const grid = document.querySelector('[class*="kpi"], main [class*="cards"], main [style*="grid"]') as HTMLElement | null;
    if (!grid) return 0;
    return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  });
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/reportes');
  await page.waitForTimeout(400);
  const mobileCols = await page.evaluate(() => {
    const grid = document.querySelector('[class*="kpi"], main [class*="cards"], main [style*="grid"]') as HTMLElement | null;
    if (!grid) return 0;
    return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  });
  // mobile no debe tener más columnas que desktop
  if (desktopCols && mobileCols) expect(mobileCols).toBeLessThanOrEqual(desktopCols);
});

// DC-088 tablet — sin scroll horizontal a 900px tampoco.
test('DC-088: tablet (900px) sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(TABLET);
  for (const route of ['/pacientes', '/reportes', `/pacientes/${PID}/informacion`]) {
    await gotoApp(page, route);
    await page.waitForTimeout(400);
    expect(await hasHorizontalScroll(page), `scroll horizontal tablet en ${route}`).toBe(false);
  }
});
