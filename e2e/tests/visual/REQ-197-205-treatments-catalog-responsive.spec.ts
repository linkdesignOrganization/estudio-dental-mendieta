import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Visual Checker — Iteración 4 (Tratamientos: lista + catálogo + detalle de tipo), Ronda 1.
 *
 * FOCO del plan: el catálogo de tipos en CARDS AIREADAS (≥12, radius 10–14px, costo ARS),
 * la lista de tratamientos usable en mobile (tabla→mini-cards), y el detalle de tipo en
 * mobile con costo en pesos argentinos formateado.
 *
 *  · REQ-198 (DC-046/DC-062) — CATÁLOGO en cards aireadas, NO tabla densa:
 *      la sección "Catálogo de tipos" renderiza `a.ttcard` (`.surface-card.is-clickable`)
 *      en un grid `.catalog`, cada card con radius 10–14px, padding 24–32px, descripción +
 *      costo ARS + duración. Sin <table> en el catálogo.
 *      (Contrato vivo 2026-06-02: 15 cards, radius 12px, padding 24px, grid gap 20px.)
 *
 *  · REQ-201 / REQ-205 (DC-084) — CATÁLOGO y DETALLE responsive:
 *      catálogo mobile <768px = 1 columna; tablet 768–1199px = 2 columnas;
 *      desktop ≥1200px = 3 columnas. Detalle de tipo usable en mobile sin scroll-x.
 *
 *  · REQ-203 (DC-046) — COSTO en pesos argentinos formateado en el detalle de tipo:
 *      el detalle `/tratamientos/tipos/:id` muestra el costo como `$ NNN.NNN`
 *      (miles con punto, sin centavos) — formato es-AR.
 *
 *  · REQ-197 (DC-046/DC-081) — LISTA de activos usable en mobile:
 *      en `/tratamientos` viewport mobile, la `data-table` (5 columnas, ≤5 estricto)
 *      colapsa a mini-cards (`.dt__card`), tabla `display:none`. Sin scroll horizontal.
 *
 * Nota: el toggle Activos / Catálogo de tipos es una sub-navegación in-page
 * (`.section-nav__tab.is-active`), NO cambia la URL — se conmuta haciendo click.
 *
 * Contrato de breakpoint (verificado en vivo contra el SWA desplegado):
 *   - Catálogo: 393px → 1 col; 820px → 2 col; 1280px → 3 col. 15 `a.ttcard`.
 *   - Lista activos: 393px → tabla oculta, `.dt__card` ×12, sin scroll-x.
 *   - Detalle tt-04: `$ 145.000`; back-link → /tratamientos; 4 surface-cards.
 */

const MOBILE = { width: 393, height: 851 };
const TABLET = { width: 820, height: 1024 };
const DESKTOP = { width: 1280, height: 900 };

const TIPO_DETALLE = '/tratamientos/tipos/tt-04';

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

/** Conmuta a la pestaña "Catálogo de tipos" (sub-nav in-page) y espera las cards. */
async function openCatalog(page: Page): Promise<void> {
  const tab = page.getByRole('button', { name: 'Catálogo de tipos' });
  await tab.click();
  await expect(page.locator('a.ttcard').first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// REQ-198 — catálogo en cards aireadas (NO tabla densa), radius 10–14px, costo + duración.
test('REQ-198: catálogo en cards aireadas (radius 10–14px, padding 24–32px, costo, ≥12), no tabla', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/tratamientos');
  await openCatalog(page);

  const cards = page.locator('a.ttcard');
  await expect(cards).toHaveCount(15); // hay 15 tipos (tt-01..tt-15) ≥12

  // NO hay <table> en el catálogo (es grid de cards, no tabla densa).
  const tablesInCatalog = await page.locator('.catalog table').count();
  expect(tablesInCatalog).toBe(0);

  const probe = await page.evaluate(() => {
    const arsRe = /\$\s?\d{1,3}(\.\d{3})*/;
    const list = [...document.querySelectorAll('a.ttcard')];
    const radii = new Set<string>();
    const pads = new Set<string>();
    let allHaveCosto = true;
    for (const c of list) {
      const cs = getComputedStyle(c as HTMLElement);
      radii.add(cs.borderRadius);
      pads.add(cs.padding);
      if (!arsRe.test(c.textContent || '')) allHaveCosto = false;
    }
    const grid = document.querySelector('.catalog') as HTMLElement | null;
    return {
      radii: [...radii],
      pads: [...pads],
      allHaveCosto,
      gap: grid ? getComputedStyle(grid).gap : '',
      // borde O sombra, nunca ambos (DC-023): la card usa sombra y border:none
      firstShadow: list[0] ? getComputedStyle(list[0] as HTMLElement).boxShadow : '',
      firstBorderW: list[0] ? getComputedStyle(list[0] as HTMLElement).borderTopWidth : '',
    };
  });

  // Radius de cada card ∈ [10,14].
  for (const r of probe.radii) {
    const px = parseFloat(r);
    expect(px, `radius ${r} fuera de 10–14`).toBeGreaterThanOrEqual(10);
    expect(px, `radius ${r} fuera de 10–14`).toBeLessThanOrEqual(14);
  }
  // Padding de card ∈ [24,32].
  for (const p of probe.pads) {
    const px = parseFloat(p);
    expect(px, `padding ${p} fuera de 24–32`).toBeGreaterThanOrEqual(24);
    expect(px, `padding ${p} fuera de 24–32`).toBeLessThanOrEqual(32);
  }
  // Toda card tiene costo ARS.
  expect(probe.allHaveCosto).toBe(true);
  // Aire entre cards (gap ∈ [16,20]).
  const gapPx = parseFloat(probe.gap);
  expect(gapPx).toBeGreaterThanOrEqual(16);
  expect(gapPx).toBeLessThanOrEqual(20);
  // DC-023: sombra presente y borde 0 (no ambos).
  expect(probe.firstShadow).toContain('rgba(42, 42, 53, 0.04)');
  expect(parseFloat(probe.firstBorderW)).toBe(0);
});

// REQ-201 — catálogo: 1 col mobile / 2 col tablet / 3 col desktop, sin scroll horizontal.
test('REQ-201: catálogo responsive — 1 col mobile, 2 col tablet, 3 col desktop', async ({ page }) => {
  const colCount = () => page.evaluate(() => {
    const g = document.querySelector('.catalog') as HTMLElement | null;
    return g ? getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
  });

  // Mobile → 1 columna.
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/tratamientos');
  await openCatalog(page);
  expect(await colCount()).toBe(1);
  expect(await hasHorizontalScroll(page)).toBe(false);

  // Tablet → 2 columnas.
  await page.setViewportSize(TABLET);
  await gotoApp(page, '/tratamientos');
  await openCatalog(page);
  expect(await colCount()).toBe(2);
  expect(await hasHorizontalScroll(page)).toBe(false);

  // Desktop → 3 columnas.
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/tratamientos');
  await openCatalog(page);
  expect(await colCount()).toBe(3);
  expect(await hasHorizontalScroll(page)).toBe(false);
});

// REQ-203 — costo en pesos argentinos ($ NNN.NNN) en el detalle de tipo.
test('REQ-203: costo ARS formateado ($ miles con punto, sin centavos) en el detalle de tipo', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, TIPO_DETALLE);

  const ars = await page.evaluate(() => {
    const txt = document.querySelector('main')?.textContent || '';
    return txt.match(/\$\s?[\d.]+/g) || [];
  });
  expect(ars.length).toBeGreaterThanOrEqual(1);
  // Formato es-AR estricto: $ seguido de grupos de miles con punto, SIN centavos.
  for (const m of ars) {
    expect(m.trim(), `"${m}" no es formato ARS es-AR`).toMatch(/^\$\s?\d{1,3}(\.\d{3})*$/);
  }
});

// REQ-205 — detalle de tipo usable en mobile (cards aireadas, back-link, sin scroll-x).
test('REQ-205: detalle de tipo en mobile — cards aireadas, back-link al catálogo, sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, TIPO_DETALLE);

  // Cards aireadas (surface-card) con radius 10–14px.
  const cards = page.locator('main .surface-card');
  expect(await cards.count()).toBeGreaterThanOrEqual(2);
  const radius = await cards.first().evaluate((el) => getComputedStyle(el).borderRadius);
  const rpx = parseFloat(radius);
  expect(rpx).toBeGreaterThanOrEqual(10);
  expect(rpx).toBeLessThanOrEqual(14);

  // Back-link vuelve al catálogo (/tratamientos), touch ≥44px.
  const back = page.locator('main a[href="/tratamientos"]').first();
  await expect(back).toBeVisible();
  const bBox = await back.boundingBox();
  expect(bBox!.height).toBeGreaterThanOrEqual(44);

  expect(await hasHorizontalScroll(page)).toBe(false);
});

// REQ-197 — lista de activos usable en mobile: tabla→mini-cards, ≤5 col, sin scroll-x.
test('REQ-197: lista de tratamientos en mobile — tabla→mini-cards (≤5 col), sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/tratamientos');
  await expect(page.getByRole('heading', { level: 1, name: 'Tratamientos' })).toBeVisible();

  const layout = await page.evaluate(() => {
    const table = document.querySelector('main table') as HTMLElement | null;
    const cards = document.querySelector('main .dt__cards') as HTMLElement | null;
    const ths = [...document.querySelectorAll('main table thead th')];
    return {
      tableDisplay: table ? getComputedStyle(table).display : 'none',
      cardsDisplay: cards ? getComputedStyle(cards).display : 'none',
      miniCards: document.querySelectorAll('.dt__card').length,
      colCount: ths.length,
      headers: ths.map((t) => t.textContent?.trim()),
    };
  });
  // En mobile la tabla se oculta y se muestran mini-cards.
  expect(layout.tableDisplay).toBe('none');
  expect(layout.cardsDisplay).not.toBe('none');
  expect(layout.miniCards).toBeGreaterThan(0);
  // ≤5 columnas (DC-063 / BVC-009); 5ta = Próxima fecha.
  expect(layout.colCount).toBeLessThanOrEqual(5);
  expect(layout.headers).toContain('Próxima fecha');

  expect(await hasHorizontalScroll(page)).toBe(false);
});

// REQ-197 — desktop: la lista es tabla de ≤5 columnas (Próxima fecha como 5ta).
test('REQ-197: lista de tratamientos en desktop — tabla ≤5 columnas con "Próxima fecha"', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/tratamientos');
  await expect(page.getByRole('heading', { level: 1, name: 'Tratamientos' })).toBeVisible();

  const headers = await page.locator('main table thead th').allTextContents();
  expect(headers.length).toBeLessThanOrEqual(5);
  expect(headers.map((h) => h.trim())).toEqual([
    'Paciente', 'Tratamiento', 'Profesional', 'Etapas', 'Próxima fecha',
  ]);
  expect(await hasHorizontalScroll(page)).toBe(false);
});
