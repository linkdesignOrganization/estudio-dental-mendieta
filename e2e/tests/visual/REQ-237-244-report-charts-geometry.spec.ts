import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Iteración 5 (Reportes: gráficos con GEOMETRÍA real), Ronda 1.
 *
 * FOCO del plan: ELEVAR la cobertura de "presencia de charts" (UX-053/DC-119, ya verde)
 * a "render con geometría REAL por tipo". Cada `app-mini-chart` (`figure.mc`) de cada uno
 * de los 4 reportes debe renderizar su geometría correcta — NO un bloque vacío/placeholder —
 * en cards aireadas SEPARADAS (radius 10–14, sombra O borde, gap). Los montos en ARS
 * compactos. Grid 2-col desktop → 1-col mobile sin scroll horizontal.
 *
 *  · REQ-237..244 (DC-049/DC-119) — GEOMETRÍA real por tipo de chart:
 *      - bar   → `.mc__bar`            con style*="height" (% > 0)
 *      - hbar  → `.mc__hfill`          con style*="width"  (% > 0)
 *      - line  → `svg polyline.mc__line-path[points]` con ≥2 puntos
 *      - donut → `svg circle.mc__donut-arc[stroke-dasharray]` + `.mc__donut-num` "%" visible
 *      Conteo por reporte (de report-detail.component.ts):
 *      pacientes 5 · tratamientos 4 · financiero 5 · productividad 3  (`main figure`).
 *
 *  · REQ-242 (DC-119) — FORMATO ARS en el reporte financiero: los charts con
 *      valueFormat='ars' muestran pesos compactos `$ 1,2 M` / `$ 320 K` / `$ 8.500`
 *      (no números crudos) en `.mc__bar-val` / `.mc__hval`.
 *
 *  · REQ-245 (DC-084/DC-049) — RESPONSIVE: `.charts` pasa de 2 col (desktop) a 1 col
 *      (<768px) sin scroll horizontal; la geometría sigue renderizando en mobile.
 *
 *  · Cards aireadas SEPARADAS (DC-020/DC-023/DC-024): cada chart-card =
 *      `article.surface-card.chart-card` con radius ∈ [10,14], sombra `--shadow-card`
 *      + border 0 (borde O sombra, nunca ambos), grid-gap ∈ [16,20].
 *
 *  · Anti-demo (REQ-272): el copy de los reportes no delata el mock.
 *
 * Contrato de geometría verificado EN VIVO (2026-06-03) contra el SWA desplegado
 * (bundle main-5NSLIGIB.js):
 *   - /reportes/pacientes      → 5 figuras: line, bar, bar, hbar, hbar
 *   - /reportes/tratamientos   → 4 figuras: bar, hbar, hbar, donut
 *   - /reportes/financiero     → 5 figuras: line, hbar, bar, bar, donut (ARS)
 *   - /reportes/productividad  → 3 figuras: hbar, bar, donut
 *   - cards: article.surface-card.chart-card, radius 12px, padding 24px,
 *            box-shadow rgba(42,42,53,0.04) 0 1px 4px, border 0; grid gap 20px.
 *   - .charts grid: "482px 482px" (2 col) @1280px → "358px" (1 col) @390px.
 *   - financiero ARS: $ 3,3 M · $ 2,2 M · $ 790 K · $ 92.000 · $ 28.000 · $ 1,4 M …
 *   - donut arc stroke-dasharray="289.02…" + .mc__donut-num "100%".
 *   - line: polyline.mc__line-path points="0.0,130.0 60.0,130.0 … 300.0,130.0" (6 pts).
 */

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

const ANTI_DEMO = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;
// ARS compacto es-AR: "$ 3,3 M" | "$ 790 K" | "$ 92.000" | "$ 8.500" (millones con coma decimal,
// miles con sufijo K, valores chicos con punto de miles, sin centavos).
const ARS_COMPACT = /^[−-]?\$\s?\d{1,3}([.,]\d{1,3})?\s?(M|K)?$|^[−-]?\$\s?\d{1,3}(\.\d{3})+$/;

/** Reportes y su composición esperada de charts (orden = orden en el DOM). */
const REPORTS: Record<string, { route: string; title: RegExp; types: string[] }> = {
  pacientes: { route: '/reportes/pacientes', title: /Reporte de pacientes/i, types: ['line', 'bar', 'bar', 'hbar', 'hbar'] },
  tratamientos: { route: '/reportes/tratamientos', title: /Reporte de tratamientos/i, types: ['bar', 'hbar', 'hbar', 'donut'] },
  financiero: { route: '/reportes/financiero', title: /Reporte financiero/i, types: ['line', 'hbar', 'bar', 'bar', 'donut'] },
  productividad: { route: '/reportes/productividad', title: /Reporte de productividad/i, types: ['hbar', 'bar', 'donut'] },
};

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

/**
 * Audita la geometría real de cada `figure.mc` del reporte actual.
 * Devuelve, por figura: tipo detectado + métricas de geometría (no-vacío).
 */
async function auditCharts(page: Page) {
  return page.evaluate(() => {
    function classify(fig: Element): string {
      if (fig.querySelector('.mc__bar')) return 'bar';
      if (fig.querySelector('.mc__hfill')) return 'hbar';
      if (fig.querySelector('polyline.mc__line-path')) return 'line';
      if (fig.querySelector('circle.mc__donut-arc')) return 'donut';
      return 'unknown';
    }
    const figs = [...document.querySelectorAll('main figure.mc')];
    return figs.map((fig) => {
      const type = classify(fig);
      // bar: alturas % > 0
      const barH = [...fig.querySelectorAll<HTMLElement>('.mc__bar')]
        .map((b) => parseFloat((b.getAttribute('style') || '').match(/height:\s*([\d.]+)%/)?.[1] || '0'));
      // hbar: anchos % > 0
      const hW = [...fig.querySelectorAll<HTMLElement>('.mc__hfill')]
        .map((h) => parseFloat((h.getAttribute('style') || '').match(/width:\s*([\d.]+)%/)?.[1] || '0'));
      // line: polyline.mc__line-path con ≥2 puntos
      const line = fig.querySelector('polyline.mc__line-path');
      const linePts = line ? (line.getAttribute('points') || '').trim().split(/\s+/).filter(Boolean).length : 0;
      // donut: stroke-dasharray numérico + número % visible
      const arc = fig.querySelector('circle.mc__donut-arc');
      const dash = arc ? parseFloat(arc.getAttribute('stroke-dasharray') || '0') : 0;
      const donutNum = fig.querySelector('.mc__donut-num')?.textContent?.trim() || '';
      return {
        type,
        ariaLabel: fig.getAttribute('aria-label'),
        barCount: barH.length,
        barMax: barH.length ? Math.max(...barH) : 0,
        barAllPositive: barH.length > 0 && barH.every((v) => v > 0 ? true : v === 0) && barH.some((v) => v > 0),
        hCount: hW.length,
        hMax: hW.length ? Math.max(...hW) : 0,
        hHasPositive: hW.some((v) => v > 0),
        linePts,
        donutDash: dash,
        donutNum,
        donutNumIsPct: /%/.test(donutNum),
      };
    });
  });
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ── REQ-237..244: geometría real por reporte (4 tests, uno por reporte) ──────────

for (const [name, cfg] of Object.entries(REPORTS)) {
  test(`REQ-237..244: ${name} — ${cfg.types.length} charts con geometría REAL (${cfg.types.join('/')}), no vacíos`, async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await gotoApp(page, cfg.route);
    // Esperar a que el reporte esté hidratado (charts presentes, no skeleton).
    await expect(page.locator('main figure.mc').first()).toBeVisible();
    await expect(page.locator('main figure.mc')).toHaveCount(cfg.types.length);
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);

    const audit = await auditCharts(page);
    expect(audit.length, 'cantidad de figuras').toBe(cfg.types.length);

    audit.forEach((c, i) => {
      const expected = cfg.types[i];
      expect(c.type, `figura ${i} (${c.ariaLabel}) tipo`).toBe(expected);
      // Geometría no-vacía según el tipo:
      if (expected === 'bar') {
        expect(c.barCount, `bar ${i}: sin .mc__bar`).toBeGreaterThanOrEqual(2);
        expect(c.barMax, `bar ${i}: ninguna barra con altura > 0`).toBeGreaterThan(0);
      } else if (expected === 'hbar') {
        expect(c.hCount, `hbar ${i}: sin .mc__hfill`).toBeGreaterThanOrEqual(2);
        expect(c.hHasPositive, `hbar ${i}: ningún relleno con width > 0`).toBe(true);
        expect(c.hMax, `hbar ${i}: width máx no positivo`).toBeGreaterThan(0);
      } else if (expected === 'line') {
        expect(c.linePts, `line ${i}: polyline.mc__line-path con <2 puntos`).toBeGreaterThanOrEqual(2);
      } else if (expected === 'donut') {
        expect(c.donutDash, `donut ${i}: stroke-dasharray ausente/0`).toBeGreaterThan(0);
        expect(c.donutNumIsPct, `donut ${i}: .mc__donut-num sin "%" (${c.donutNum})`).toBe(true);
      }
    });

    // Anti-demo (REQ-272) en el copy del reporte.
    const mainTxt = (await page.locator('main').textContent()) || '';
    expect(ANTI_DEMO.test(mainTxt), `copy de ${name} delata el mock`).toBe(false);
  });
}

// ── REQ-237..244: cada chart vive en una card aireada SEPARADA (DC-020/023/024) ──

test('REQ-237..244: cada chart en card aireada SEPARADA (radius 10–14, sombra O borde, gap 16–20)', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/reportes/financiero'); // 5 cards = el reporte más denso
  // Esperar a que las 5 chart-cards estén montadas (montaje escalonado `edm-rise-in`).
  await expect(page.locator('main article.surface-card.chart-card')).toHaveCount(5);
  await expect(page.locator('main figure.mc')).toHaveCount(5);

  const probe = await page.evaluate(() => {
    const cards = [...document.querySelectorAll<HTMLElement>('main article.surface-card.chart-card')];
    const grid = document.querySelector('.charts') as HTMLElement | null;
    return {
      cardCount: cards.length,
      // cada card tiene EXACTAMENTE un figure.mc dentro (charts separados, no apilados)
      figuresPerCard: cards.map((c) => c.querySelectorAll('figure.mc').length),
      radii: cards.map((c) => getComputedStyle(c).borderRadius),
      shadow: cards[0] ? getComputedStyle(cards[0]).boxShadow : '',
      borderTopW: cards[0] ? getComputedStyle(cards[0]).borderTopWidth : '',
      padding: cards[0] ? getComputedStyle(cards[0]).padding : '',
      gridGap: grid ? getComputedStyle(grid).gap : '',
    };
  });

  expect(probe.cardCount).toBe(5);
  // Charts separados: 1 figura por card (no amontonados en una sola card).
  for (const n of probe.figuresPerCard) expect(n).toBe(1);
  // Radius de cada card ∈ [10,14].
  for (const r of probe.radii) {
    const px = parseFloat(r);
    expect(px, `radius ${r} fuera de 10–14`).toBeGreaterThanOrEqual(10);
    expect(px, `radius ${r} fuera de 10–14`).toBeLessThanOrEqual(14);
  }
  // DC-023: sombra suave presente + border 0 (borde O sombra, nunca ambos).
  expect(probe.shadow).toContain('rgba(42, 42, 53, 0.04)');
  expect(parseFloat(probe.borderTopW)).toBe(0);
  // Padding de card ∈ [24,32].
  const padPx = parseFloat(probe.padding);
  expect(padPx).toBeGreaterThanOrEqual(24);
  expect(padPx).toBeLessThanOrEqual(32);
  // Aire entre cards (gap ∈ [16,20]).
  const gapPx = parseFloat(probe.gridGap);
  expect(gapPx).toBeGreaterThanOrEqual(16);
  expect(gapPx).toBeLessThanOrEqual(20);
});

// ── REQ-242: formato ARS compacto en el reporte financiero ───────────────────────

test('REQ-242: reporte financiero — valores de charts en ARS compacto ($ N,N M / $ NNN K / $ NN.NNN)', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/reportes/financiero');
  await expect(page.locator('main figure.mc').first()).toBeVisible();

  // Recolectar TODOS los value-labels de los charts ARS (hbar + bar).
  const vals = await page.evaluate(() =>
    [...document.querySelectorAll('.mc__hval, .mc__bar-val')]
      .map((e) => e.textContent?.trim() || '')
      .filter(Boolean),
  );

  // Hay varios valores monetarios (facturación por OS, deuda por antigüedad, cobranzas).
  expect(vals.length).toBeGreaterThanOrEqual(6);

  // Cada uno es ARS compacto es-AR (NO número crudo tipo "3300000").
  for (const v of vals) {
    expect(v, `"${v}" no es ARS compacto`).toMatch(ARS_COMPACT);
    // Negativo de "número crudo sin $": ningún label es solo dígitos.
    expect(/^\d+$/.test(v), `"${v}" es número crudo sin formato ARS`).toBe(false);
  }
  // Al menos un valor usa el sufijo de millones (M) — confirma el formato compacto real.
  expect(vals.some((v) => /M$/.test(v)), 'ningún valor en millones compactos ($ N,N M)').toBe(true);
});

// ── REQ-245: grid de charts responsive (2 col desktop → 1 col mobile, sin scroll-x) ──

test('REQ-245: .charts pasa de 2 columnas (desktop) a 1 columna (mobile) sin scroll horizontal', async ({ page }) => {
  const cols = () => page.evaluate(() => {
    const g = document.querySelector('.charts') as HTMLElement | null;
    return g ? getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length : 0;
  });

  // Desktop → 2 columnas.
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, '/reportes/financiero');
  await expect(page.locator('main figure.mc').first()).toBeVisible();
  expect(await cols()).toBe(2);
  expect(await hasHorizontalScroll(page)).toBe(false);

  // Mobile → 1 columna, sin scroll horizontal, y la geometría SIGUE renderizando.
  await page.setViewportSize(MOBILE);
  await gotoApp(page, '/reportes/financiero');
  await expect(page.locator('main figure.mc').first()).toBeVisible();
  expect(await cols()).toBe(1);
  expect(await hasHorizontalScroll(page)).toBe(false);

  const audit = await auditCharts(page);
  expect(audit.length).toBe(5);
  // En mobile no se rompe: el line conserva ≥2 puntos, hbar conserva rellenos > 0, donut su arco.
  expect(audit.find((c) => c.type === 'line')!.linePts).toBeGreaterThanOrEqual(2);
  expect(audit.filter((c) => c.type === 'hbar').every((c) => c.hHasPositive)).toBe(true);
  expect(audit.find((c) => c.type === 'donut')!.donutDash).toBeGreaterThan(0);
});

// ── Mobile de reportes detallados: sin scroll horizontal en TODOS los reportes ───────

test('REQ-245: reportes detallados a 390px — sin scroll horizontal en los 4', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  for (const cfg of Object.values(REPORTS)) {
    await gotoApp(page, cfg.route);
    await expect(page.locator('main figure.mc').first()).toBeVisible();
    expect(await hasHorizontalScroll(page), `scroll horizontal en ${cfg.route}`).toBe(false);
  }
});
