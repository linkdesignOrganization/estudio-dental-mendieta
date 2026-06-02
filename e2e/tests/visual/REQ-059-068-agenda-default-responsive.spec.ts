import { test, expect, Page } from '@playwright/test';
import { gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Iteración 3 (Agenda), Ronda 1.
 *
 * Cubre el ajuste de feedback de la demo + el default preservado tras el refactor de
 * `effectiveView()` (REQ-059, REQ-068, NFR-022). NO re-verifica el token
 * `--touch-target-min: 44px` (ya cubierto por DC-001-029) — aquí lo nuevo es que ese
 * touch target se APLICA a `.agenda-row` y que el default por breakpoint es el correcto.
 *
 *  · REQ-068 (+ NFR-022) — DEFAULT MOBILE = vista DÍA/LISTA con filas ≥44px:
 *      en viewport mobile (<768px), `/agenda` sin `?vista` monta `app-agenda-list-view`
 *      con turnos como `.agenda-row` (NO chips de 22px, NO grid mensual, NO grid semanal).
 *      Cada `.agenda-row` es un `<a href="/agenda/:id">` clickeable con
 *      `min-height: var(--touch-target-min)` (44px) y boundingBox().height ≥44px real.
 *      Los toggles de vista (Mes/Semana/Día) también miden ≥44px. Sin scroll horizontal.
 *      Esto resuelve el feedback de la demo (chips de 22px → filas táctiles).
 *
 *  · REQ-059 — DEFAULT DESKTOP = MES:
 *      en viewport desktop (≥992px), `/agenda` sin `?vista` monta el grid mensual
 *      (`.cal__grid` con ~35 celdas), toggle "Mes" activo (`.view-toggle__btn.is-active`),
 *      sin columnas-semana (`.week__col` = 0) ni lista (`.agenda-row` = 0).
 *
 *  · Reactividad de `effectiveView()` (isMobile vía matchMedia('(max-width:767px)')):
 *      cambiar el viewport de desktop→mobile (y mobile→desktop) cambia el default SIN
 *      recargar la página.
 *
 * Contrato de breakpoint (verificado en vivo contra el SWA desplegado, 2026-06-02):
 *   - 1280px → matchMedia('(max-width:767px)')=false → MES (.cal__grid, 35 celdas).
 *   -  768px → matchMedia('(max-width:767px)')=false → MES (el límite de la lista es <768).
 *   -  390px → matchMedia('(max-width:767px)')=true  → LISTA (.agenda-row ×31, todas <a>,
 *              min-height 44px, alto real 76px). Sin scroll horizontal.
 *   - Toggles Mes/Semana/Día = 44px de alto en mobile.
 *   - Badges de estado pastel coherentes (DC-053): Confirmado→#e3f3ea+dot #2d6a4f,
 *     Atendiendo→#e2eef6+dot #246991.
 *
 * Estos `.spec.ts` entran en la suite de regresión de iteraciones futuras.
 */

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };
const TOUCH_MIN = 44; // var(--touch-target-min)

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

/** Snapshot del estado de la agenda relevante para el default por breakpoint. */
async function agendaState(page: Page) {
  return page.evaluate(() => {
    const activeToggle = document.querySelector('.view-toggle__btn.is-active');
    return {
      vw: window.innerWidth,
      matchMobile: window.matchMedia('(max-width:767px)').matches,
      hasCalGrid: !!document.querySelector('.cal__grid'),
      calCells: document.querySelectorAll('.cal__grid > *').length,
      weekCols: document.querySelectorAll('.week__col').length,
      hasWeekView: !!document.querySelector('app-week-view'),
      hasListView: !!document.querySelector('app-agenda-list-view'),
      agendaRows: document.querySelectorAll('.agenda-row').length,
      activeToggleText: activeToggle ? (activeToggle.textContent || '').trim() : null,
    };
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// REQ-068 (+ NFR-022) — DEFAULT MOBILE = lista DÍA con .agenda-row ≥44px.
// ───────────────────────────────────────────────────────────────────────────────
test('REQ-068/NFR-022: default mobile = vista DÍA/LISTA (app-agenda-list-view, sin grid ni chips)', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/agenda');
  // Esperar a que el list-view hidrate (turnos de HOY como filas).
  await page.locator('.agenda-row').first().waitFor({ state: 'visible' });

  const s = await agendaState(page);
  expect(s.matchMobile, 'matchMedia(max-width:767px) en mobile').toBe(true);
  // Es la LISTA del día, no el grid mensual ni el semanal ni chips.
  expect(s.hasListView, 'app-agenda-list-view montado en mobile').toBe(true);
  expect(s.agendaRows, 'turnos como .agenda-row').toBeGreaterThan(0);
  expect(s.hasCalGrid, 'el grid mensual NO debe montarse en mobile (era el bug de chips)').toBe(false);
  expect(s.weekCols, 'NO columnas-semana en mobile').toBe(0);
});

test('REQ-068/NFR-022: cada .agenda-row es un <a> clickeable con alto ≥44px (resuelve los chips de 22px)', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/agenda');
  const rows = page.locator('.agenda-row');
  await rows.first().waitFor({ state: 'visible' });
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  // Medir el boundingBox real de varias filas (no solo el min-height computado).
  const sample = Math.min(count, 8);
  for (let i = 0; i < sample; i++) {
    const row = rows.nth(i);
    const tag = await row.evaluate((el) => el.tagName);
    const href = await row.getAttribute('href');
    const minHeight = await row.evaluate((el) => getComputedStyle(el).minHeight);
    const box = await row.boundingBox();
    expect(tag, `fila ${i} es un <a>`).toBe('A');
    expect(href, `fila ${i} enlaza a /agenda/:id`).toMatch(/^\/agenda\/[^/]+$/);
    expect(minHeight, `fila ${i} min-height = touch target`).toBe(`${TOUCH_MIN}px`);
    expect(box, `fila ${i} tiene box`).not.toBeNull();
    expect(box!.height, `fila ${i} alto real ≥${TOUCH_MIN}px (no chip de 22px)`).toBeGreaterThanOrEqual(TOUCH_MIN);
  }
});

test('REQ-068: los toggles Mes/Semana/Día miden ≥44px en mobile y no hay scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/agenda');
  await page.locator('.agenda-row').first().waitFor({ state: 'visible' });

  const toggles = page.locator('.view-toggle__btn');
  const n = await toggles.count();
  expect(n).toBeGreaterThanOrEqual(3); // Mes · Semana · Día
  for (let i = 0; i < n; i++) {
    const box = await toggles.nth(i).boundingBox();
    expect(box, `toggle ${i} visible`).not.toBeNull();
    expect(box!.height, `toggle ${i} ≥${TOUCH_MIN}px`).toBeGreaterThanOrEqual(TOUCH_MIN);
  }
  expect(await hasHorizontalScroll(page), 'sin scroll horizontal en /agenda mobile').toBe(false);
});

// ───────────────────────────────────────────────────────────────────────────────
// REQ-059 — DEFAULT DESKTOP = MES.
// ───────────────────────────────────────────────────────────────────────────────
test('REQ-059: default desktop = MES (grid mensual ~35 celdas, toggle "Mes" activo, sin lista ni semana)', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/agenda');
  await page.locator('.cal__grid').waitFor({ state: 'visible' });

  const s = await agendaState(page);
  expect(s.matchMobile, 'matchMedia(max-width:767px) en desktop').toBe(false);
  expect(s.hasCalGrid, '.cal__grid montado en desktop').toBe(true);
  expect(s.calCells, 'grid mensual ~35 celdas (5–6 semanas × 7 días)').toBeGreaterThanOrEqual(28);
  expect(s.calCells).toBeLessThanOrEqual(42);
  expect(s.activeToggleText, 'toggle activo = "Mes"').toBe('Mes');
  expect(s.hasListView, 'NO list-view en desktop default').toBe(false);
  expect(s.agendaRows, 'NO .agenda-row en desktop default').toBe(0);
  expect(s.weekCols, 'NO columnas-semana en desktop default').toBe(0);
});

// El límite de la lista es <768px estricto: a 768px exactos sigue siendo MES.
test('REQ-059: a 768px exactos el default es MES (el list-view es <768px estricto)', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await gotoApp(page, '/agenda');
  await page.locator('.cal__grid').waitFor({ state: 'visible' });
  const s = await agendaState(page);
  expect(s.matchMobile).toBe(false);
  expect(s.hasCalGrid).toBe(true);
  expect(s.hasListView).toBe(false);
  expect(await hasHorizontalScroll(page), 'sin scroll horizontal a 768px').toBe(false);
});

// ───────────────────────────────────────────────────────────────────────────────
// Reactividad de effectiveView() — el default cambia con el breakpoint SIN recargar.
// ───────────────────────────────────────────────────────────────────────────────
test('REQ-059/068: effectiveView() reacciona al breakpoint sin recargar (desktop↔mobile)', async ({ page }) => {
  // Arranca en desktop = MES.
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/agenda');
  await page.locator('.cal__grid').waitFor({ state: 'visible' });
  let s = await agendaState(page);
  expect(s.hasCalGrid).toBe(true);
  expect(s.hasListView).toBe(false);

  // Reducir a mobile SIN navegar → debe pasar a LISTA.
  await page.setViewportSize(MOBILE);
  await expect(page.locator('app-agenda-list-view')).toBeVisible();
  await page.locator('.agenda-row').first().waitFor({ state: 'visible' });
  s = await agendaState(page);
  expect(s.matchMobile, 'matchMedia true tras reducir a 390px').toBe(true);
  expect(s.hasListView, 'list-view tras reducir a mobile').toBe(true);
  expect(s.agendaRows).toBeGreaterThan(0);
  expect(s.hasCalGrid, 'grid mensual desmontado en mobile').toBe(false);

  // Volver a desktop SIN navegar → debe volver a MES.
  await page.setViewportSize(DESKTOP);
  await expect(page.locator('.cal__grid')).toBeVisible();
  s = await agendaState(page);
  expect(s.matchMobile, 'matchMedia false tras volver a desktop').toBe(false);
  expect(s.hasCalGrid, 'MES tras volver a desktop').toBe(true);
  expect(s.hasListView, 'list-view desmontado en desktop').toBe(false);
});

// ───────────────────────────────────────────────────────────────────────────────
// Coherencia visual de los bloques de turno (DC-053): badges de estado pastel.
// ───────────────────────────────────────────────────────────────────────────────
test('REQ-068: las filas de turno muestran badges de estado pastel coherentes (DC-053)', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/agenda');
  await page.locator('.agenda-row').first().waitFor({ state: 'visible' });

  // Mapa pastel del design system (DC-010 éxito, DC-013 info, DC-012 warning, DC-011 error, DC-014 neutro).
  const PASTELS: Record<string, string> = {
    'rgb(227, 243, 234)': 'exito',   // #e3f3ea  Confirmado/Completado
    'rgb(226, 238, 246)': 'info',    // #e2eef6  Atendiendo/En curso
    'rgb(251, 241, 218)': 'warning', // #fbf1da  En espera/por confirmar
    'rgb(252, 233, 234)': 'error',   // #fce9ea  Cancelado/Vencido
    'rgb(238, 238, 240)': 'neutro',  // #eeeef0  Terminado/En pausa
  };

  const badges = await page.evaluate(() => {
    return [...document.querySelectorAll('.agenda-row .badge')].slice(0, 12).map((b) => ({
      text: (b.textContent || '').trim(),
      bg: getComputedStyle(b).backgroundColor,
      hasDot: !!b.querySelector('.badge__dot, [class*="dot"]'),
    }));
  });

  expect(badges.length, 'hay badges de estado en las filas').toBeGreaterThan(0);
  for (const b of badges) {
    // Color NUNCA único portador (DC-053): debe haber texto del estado.
    expect(b.text.length, `badge "${b.text}" tiene label`).toBeGreaterThan(0);
    // El fondo es uno de los pasteles del sistema semántico.
    expect(Object.keys(PASTELS), `badge "${b.text}" usa fondo pastel del sistema (${b.bg})`).toContain(b.bg);
  }
});
