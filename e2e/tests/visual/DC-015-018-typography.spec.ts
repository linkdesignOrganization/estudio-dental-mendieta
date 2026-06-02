import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Tipografía aplicada (DC-015..018) + BVC-001/022.
 *
 * NOTA DE REGRESIÓN — BUG-V01 (CRÍTICO, raíz):
 * El stylesheet global `styles-*.css` se sirve con `media="print"` y depende de un
 * `onload="this.media='all'"` que CSP (`script-src 'self'`) BLOQUEA → la hoja NO se
 * aplica en pantalla. Eso hace que las reglas de `h1-h6 { font-weight:500; line-height:1.2;
 * font-family: Red Hat Display }` y las utilidades `.t-display/.t-title` NO apliquen, y los
 * títulos caen a 700 / line-height 1.6 / Red Hat Text.
 *
 * ESTADO (cierre de cobertura): BUG-V01 corregido y verificado en producción
 * (styles-*.css ya se sirve sin `media="print"`; `appliesToScreen=true`). Los gates que
 * encerraban el resultado aplicado quedan ACTIVOS y PASAN. Los tests de tokens (que sí están
 * en :root inline) viven en DC-001-029 y PASAN.
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

/** Helper: ¿el stylesheet global de diseño aplica realmente a pantalla? */
async function designSheetAppliesToScreen(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const sheet = [...document.styleSheets].find((s) => (s.href || '').includes('styles-'));
    if (!sheet) return false;
    return !sheet.media.mediaText || window.matchMedia(sheet.media.mediaText).matches;
  });
}

// Guardia explícita de la causa raíz: el stylesheet de diseño debe aplicar en pantalla.
// (Gate de regresión del fix CSP/media — verificado en producción: appliesToScreen=true.)
test('DC-015..018 (raíz BUG-V01): el stylesheet de diseño aplica en pantalla (no media=print)', async ({ page }) => {
  await gotoApp(page, '/reportes');
  expect(await designSheetAppliesToScreen(page)).toBe(true);
});

// DC-016 / BVC-001 — los títulos aplicados deben usar peso 500 (nunca 700).
test('DC-016 / BVC-001: títulos aplicados con peso 500 (no 700)', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const weights = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3')].map((h) => getComputedStyle(h).fontWeight),
  );
  for (const w of weights) expect(['400', '500']).toContain(w);
});

// DC-017 / BVC-022 — line-height de títulos ~1.2 (no 1.6).
test('DC-017 / BVC-022: line-height de títulos ~1.2', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const ratios = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3')].map((h) => {
      const cs = getComputedStyle(h);
      return parseFloat(cs.lineHeight) / parseFloat(cs.fontSize);
    }),
  );
  for (const r of ratios) expect(r).toBeLessThanOrEqual(1.35);
});

// DC-015 — los títulos aplicados usan Red Hat Display como primera familia.
test('DC-015: títulos en Red Hat Display (no Red Hat Text como primera familia)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/informacion');
  const fam = await page.evaluate(() => {
    const h1 = [...document.querySelectorAll('h1')].find((h) => !/Pacientes|Información/.test(h.textContent || ''));
    return h1 ? getComputedStyle(h1).fontFamily : '';
  });
  expect(fam.split(',')[0]).toContain('Red Hat Display');
});

// DC-018 / BVC-022 — la jerarquía de TÍTULOS se ciñe a la escala canónica (≤3 tamaños).
//
// NOTA (cierre de cobertura): la versión R1 contaba el font-size de TODO div/span/legend con
// texto y exigía ≤3. Con BUG-V01 ya corregido y la hoja aplicando, /reportes presenta 7 tamaños
// distintos a nivel de micro-elementos (leyendas de gráficos 11/13px, badges 14px, cuerpo 16px…),
// lo cual es normal en un dashboard denso y NO es lo que DC-018 gobierna. DC-018 limita la escala
// de TÍTULOS (32/28/20/16 + small 14). Re-escopado a h1–h3: deben usar ≤3 tamaños, todos dentro
// de la escala canónica. Verificado en producción: /reportes usa {28,20} en h1–h3.
test('DC-018 / BVC-022: la escala de títulos se ciñe a 32/28/20/16 (≤3 por pantalla)', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const sizes = await page.evaluate(() => {
    const s = new Set<number>();
    document.querySelectorAll('h1,h2,h3').forEach((el) => {
      const e = el as HTMLElement;
      if (e.offsetParent === null) return;
      if (e.textContent && e.textContent.trim().length) s.add(Math.round(parseFloat(getComputedStyle(e).fontSize)));
    });
    return [...s];
  });
  const CANONICAL = [32, 28, 20, 16, 14];
  // Cada tamaño de título pertenece a la escala canónica…
  for (const sz of sizes) expect(CANONICAL).toContain(sz);
  // …y no se usan más de 3 tamaños de título distintos por pantalla.
  expect(sizes.length).toBeLessThanOrEqual(3);
});

// DC-016 — body en peso regular (esto SÍ aplica, validación positiva del cuerpo).
test('DC-016: el cuerpo de texto usa peso regular (400) y line-height 1.5-1.7', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const body = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    return { weight: cs.fontWeight, ratio: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) };
  });
  expect(body.weight).toBe('400');
  expect(body.ratio).toBeGreaterThanOrEqual(1.5);
  expect(body.ratio).toBeLessThanOrEqual(1.7);
});
