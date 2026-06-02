import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Tokens de diseño (DC-001..DC-029) + BVC trazables.
 * Modo NORMAL: verificamos los valores prescriptivos 🔒 de design-criteria.md
 * vía getComputedStyle contra el sitio DESPLEGADO.
 *
 * Los tokens viven como CSS custom properties en :root (tokens.css). Esta suite
 * fija los valores exactos para que cualquier regresión de paleta/tipografía/
 * spacing/sombra/radius se detecte en la regresión automatizada.
 */

/** Lee una custom property de :root ya resuelta por el navegador. */
async function rootVar(page: Page, name: string): Promise<string> {
  return (
    await page.evaluate(
      (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
      name,
    )
  );
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// DC-001..005 — paleta azul de 4 tonos (prescriptivo 🔒). BVC-002.
test('DC-001..005 / BVC-002: paleta azul exactamente 4 tonos coherentes', async ({ page }) => {
  expect(await rootVar(page, '--color-accent-sky')).toBe('#c5d8e8'); // DC-001
  expect(await rootVar(page, '--color-accent')).toBe('#6da8d4'); // DC-002
  expect(await rootVar(page, '--color-accent-deep')).toBe('#246991'); // DC-003
  expect(await rootVar(page, '--color-accent-tint')).toBe('#eff8ff'); // DC-004
  // DC-005 — NO debe existir el azul Bootstrap #0d6efd como acento
  expect(await rootVar(page, '--bs-primary')).toBe('#6da8d4');
  expect(await rootVar(page, '--bs-primary')).not.toBe('#0d6efd');
});

// DC-006..009 — neutros / superficie / borde (prescriptivo 🔒). BVC-003.
test('DC-006..009 / BVC-003: neutros, superficie y borde', async ({ page }) => {
  expect(await rootVar(page, '--color-bg')).toBe('#fafafa'); // DC-006
  expect(await rootVar(page, '--color-bg-elevated')).toBe('#ffffff'); // DC-006
  expect(await rootVar(page, '--color-text')).toBe('#2a2a35'); // DC-007 (no negro puro)
  expect(await rootVar(page, '--color-text-secondary')).toBe('#707080'); // DC-008
  expect(await rootVar(page, '--color-border')).toBe('#e8e8ee'); // DC-009
});

// DC-010..014 — semánticos pastel (par fondo+texto, ratio AA).
test('DC-010..014: semánticos pastel con sus pares exactos', async ({ page }) => {
  expect(await rootVar(page, '--color-success-bg')).toBe('#e3f3ea');
  expect(await rootVar(page, '--color-success-text')).toBe('#2d6a4f');
  expect(await rootVar(page, '--color-error-bg')).toBe('#fce9ea');
  expect(await rootVar(page, '--color-error-text')).toBe('#b23a48');
  expect(await rootVar(page, '--color-warning-bg')).toBe('#fbf1da');
  expect(await rootVar(page, '--color-warning-text')).toBe('#946200');
  expect(await rootVar(page, '--color-info-bg')).toBe('#e2eef6');
  expect(await rootVar(page, '--color-info-text')).toBe('#246991'); // info usa el azul profundo
  expect(await rootVar(page, '--color-neutral-bg')).toBe('#eeeef0');
  expect(await rootVar(page, '--color-neutral-text')).toBe('#55555f');
});

// DC-015 — tipografía Red Hat (NUNCA Inter). BVC-001.
test('DC-015 / BVC-001: tipografía Red Hat, nunca Inter', async ({ page }) => {
  const display = await rootVar(page, '--font-display');
  const body = await rootVar(page, '--font-body');
  expect(display).toContain('Red Hat Display');
  expect(body).toContain('Red Hat Text');
  expect(display.toLowerCase()).not.toContain('inter');
  expect(body.toLowerCase()).not.toContain('inter');
  // body resuelto en el documento
  const bodyFont = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(bodyFont.toLowerCase()).toContain('red hat');
  expect(bodyFont.toLowerCase()).not.toContain('inter');

  // las fuentes deben estar realmente cargadas (no solo declaradas) y NO debe existir Inter
  const fonts = await page.evaluate(() => {
    const fams = [...new Set([...document.fonts].map((f) => f.family))];
    return { fams, hasInter: fams.some((f) => /inter/i.test(f)), hasRedHat: fams.some((f) => /red hat/i.test(f)) };
  });
  expect(fonts.hasInter).toBe(false);
  expect(fonts.hasRedHat).toBe(true);
});

// DC-016 / BVC-001 — solo pesos 400/500 cargados (nunca un woff2 de 700+).
test('DC-016 / BVC-001: solo se cargan pesos 400 y 500 de Red Hat', async ({ page }) => {
  const weights = await page.evaluate(() =>
    [...document.fonts].filter((f) => /red hat/i.test(f.family)).map((f) => String(f.weight)),
  );
  expect(weights.length).toBeGreaterThan(0);
  for (const w of weights) {
    expect(['400', '500', 'normal']).toContain(w);
  }
});

// DC-017 — escala tipográfica (28/20/16) y line-heights definidos.
test('DC-017: escala tipográfica y line-heights prescriptivos', async ({ page }) => {
  expect(await rootVar(page, '--text-display')).toBe('28px');
  expect(await rootVar(page, '--text-title')).toBe('20px');
  expect(await rootVar(page, '--text-body')).toBe('16px');
  expect(await rootVar(page, '--lh-display')).toBe('1.2'); // títulos ~1.2
  expect(await rootVar(page, '--lh-body')).toBe('1.6'); // cuerpo 1.5-1.7
});

// DC-019..021 — spacing múltiplos de 4, padding card, control-height, disabled. BVC-006/017.
test('DC-019..021 / BVC-006 / BVC-017: spacing, padding card, control-height, disabled', async ({ page }) => {
  expect(await rootVar(page, '--space-1')).toBe('4px');
  expect(await rootVar(page, '--space-2')).toBe('8px');
  expect(await rootVar(page, '--space-3')).toBe('12px');
  expect(await rootVar(page, '--space-4')).toBe('16px');
  expect(await rootVar(page, '--space-6')).toBe('24px');
  expect(await rootVar(page, '--space-8')).toBe('32px');
  expect(await rootVar(page, '--space-12')).toBe('48px');
  expect(await rootVar(page, '--space-16')).toBe('64px');
  // padding de card 24-32px
  const cardPad = parseInt(await rootVar(page, '--card-padding'), 10);
  expect(cardPad).toBeGreaterThanOrEqual(24);
  expect(cardPad).toBeLessThanOrEqual(32);
  // gap entre cards 16-20px
  const cardGap = parseInt(await rootVar(page, '--card-gap'), 10);
  expect(cardGap).toBeGreaterThanOrEqual(16);
  expect(cardGap).toBeLessThanOrEqual(20);
  // control-height 40px, touch 44px, disabled 0.4
  expect(await rootVar(page, '--control-height')).toBe('40px');
  expect(await rootVar(page, '--touch-target-min')).toBe('44px');
  expect(await rootVar(page, '--disabled-opacity')).toBe('.4');
});

// DC-022..023 — una sola sombra suave; regla borde O sombra. BVC-005.
test('DC-022..023 / BVC-005: sombra única (1px/4px/0.04), sin escala Material', async ({ page }) => {
  const shadow = await rootVar(page, '--shadow-card');
  expect(shadow).toContain('0 1px 4px');
  expect(shadow).toContain('rgba(42, 42, 53, .04)');
  const hover = await rootVar(page, '--shadow-card-hover');
  expect(hover).toContain('0 1px 6px');
});

// DC-024..025 — radius 10-14px; pill/circle solo en circulares. BVC-004.
test('DC-024..025 / BVC-004: radius 10/12/14, pill/circle separados', async ({ page }) => {
  expect(await rootVar(page, '--radius-sm')).toBe('10px');
  expect(await rootVar(page, '--radius-md')).toBe('12px');
  expect(await rootVar(page, '--radius-lg')).toBe('14px');
  expect(await rootVar(page, '--radius-pill')).toBe('999px');
  expect(await rootVar(page, '--radius-circle')).toBe('50%');
  // ningún radius rectangular >20px
  for (const r of ['--radius-sm', '--radius-md', '--radius-lg']) {
    expect(parseInt(await rootVar(page, r), 10)).toBeLessThanOrEqual(14);
  }
});

// DC-026 / BVC-021 — motion 150-250ms.
test('DC-026 / BVC-021: motion 150-250ms', async ({ page }) => {
  // tokens en segundos (.15s / .2s / .25s)
  expect(await rootVar(page, '--motion-duration')).toBe('.2s');
  expect(await rootVar(page, '--motion-fast')).toBe('.15s');
  expect(await rootVar(page, '--motion-slow')).toBe('.25s');
});

// DC-028 — focus ring 0 0 0 2px #246991 disponible como token.
test('DC-028: focus ring token = 2px azul profundo', async ({ page }) => {
  const ring = await rootVar(page, '--focus-ring');
  // --focus-ring: 0 0 0 2px var(--color-accent-deep)
  expect(ring).toContain('0 0 0 2px');
  // resuelto a color
  const resolved = await page.evaluate(() => {
    const el = document.createElement('span');
    el.style.boxShadow = getComputedStyle(document.documentElement).getPropertyValue('--focus-ring');
    document.body.appendChild(el);
    const v = getComputedStyle(el).boxShadow;
    el.remove();
    return v;
  });
  expect(resolved).toContain('36, 105, 145'); // #246991
});

// DC-029 — overrides de Bootstrap: body Red Hat, link azul profundo, sin #0d6efd.
test('DC-029: overrides de Bootstrap aplicados (sin #0d6efd, body Red Hat)', async ({ page }) => {
  expect(await rootVar(page, '--bs-body-font-family')).toContain('Red Hat');
  expect(await rootVar(page, '--bs-link-color')).toBe('#246991');
  expect(await rootVar(page, '--bs-border-radius')).toBe('12px');
  expect(await rootVar(page, '--bs-body-color')).toBe('#2a2a35');
  expect(await rootVar(page, '--bs-body-bg')).toBe('#fafafa');
});

// DC-002 / GAP-A04 (CRÍTICO) — ningún texto blanco sobre el azul medio #6da8d4.
test('DC-002 / GAP-A04: ningún texto blanco sobre #6da8d4 (recorrido multi-pantalla)', async ({ page }) => {
  const routes = ['/reportes', '/pacientes', '/agenda', '/pacientes/pac-001/informacion'];
  for (const route of routes) {
    await gotoApp(page, route);
    await page.waitForTimeout(400);
    const offenders = await page.evaluate(() => {
      const rgb = (s: string) => {
        const m = s.match(/\d+/g);
        return m ? m.slice(0, 3).map(Number) : null;
      };
      const bad: string[] = [];
      document.querySelectorAll('*').forEach((el) => {
        const e = el as HTMLElement;
        if (e.offsetParent === null) return;
        const cs = getComputedStyle(e);
        const bg = rgb(cs.backgroundColor);
        const col = rgb(cs.color);
        if (!bg || !col) return;
        const isAccent = Math.abs(bg[0] - 109) < 8 && Math.abs(bg[1] - 168) < 8 && Math.abs(bg[2] - 212) < 8;
        const isWhite = col[0] > 235 && col[1] > 235 && col[2] > 235;
        if (isAccent && isWhite && (e.textContent || '').trim().length) {
          bad.push((e.className || e.tagName) + ' :: ' + (e.textContent || '').trim().slice(0, 30));
        }
      });
      return bad;
    });
    expect(offenders, `texto blanco sobre #6da8d4 en ${route}`).toEqual([]);
  }
});
