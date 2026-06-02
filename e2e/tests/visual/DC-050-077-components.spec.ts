import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Componentes (DC-050..077) + BVC trazables.
 * status-badge, data-table (≤5 col), tabs (inactivo NO en DOM), odontograma (32 piezas),
 * patient-header (banner sobrio), empty-state. Verificación: computed-style + estructura.
 */

const PID = 'pac-001';

/** Util de contraste WCAG. */
function makeRatioEvaluator() {
  return (fg: number[], bg: number[]) => {
    const lum = (c: number[]) => {
      const a = c.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };
    const L1 = lum(fg),
      L2 = lum(bg);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  };
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// DC-053 — status-badge: pastel (fondo + texto del mismo hue), radius 10-14px, contraste AA, NUNCA texto blanco.
test('DC-053 / DC-010..014: status-badges pastel con contraste AA y sin texto blanco', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('heading', { level: 1, name: 'Pacientes' }).waitFor();
  await page.waitForTimeout(400);

  const badges = await page.evaluate(() => {
    const rgb = (s: string) => {
      const m = s.match(/\d+/g);
      return m ? m.slice(0, 3).map(Number) : null;
    };
    return [...document.querySelectorAll('.badge')]
      .filter((b) => (b as HTMLElement).offsetParent !== null && (b.textContent || '').trim().length)
      .slice(0, 12)
      .map((b) => {
        const cs = getComputedStyle(b as HTMLElement);
        return {
          txt: (b.textContent || '').trim().slice(0, 20),
          bg: rgb(cs.backgroundColor),
          color: rgb(cs.color),
          radius: parseInt(cs.borderRadius, 10),
        };
      });
  });

  expect(badges.length).toBeGreaterThan(0);
  const ratio = makeRatioEvaluator();
  for (const b of badges) {
    if (!b.bg || !b.color) continue;
    // radius pastel 10-14px (o pill suave, pero nunca 0)
    expect(b.radius, `radius del badge "${b.txt}"`).toBeGreaterThanOrEqual(10);
    // contraste AA ≥ 4.5
    expect(ratio(b.color, b.bg), `contraste del badge "${b.txt}"`).toBeGreaterThanOrEqual(4.5);
    // NUNCA texto blanco sobre pastel
    const isWhite = b.color[0] > 235 && b.color[1] > 235 && b.color[2] > 235;
    expect(isWhite, `texto blanco prohibido en badge "${b.txt}"`).toBe(false);
  }
});

// DC-055/078 — avatar/foto: imagen o iniciales, NUNCA imagen rota (sin <img> con naturalWidth 0 visible).
test('DC-055/078: avatares con imagen o iniciales, nunca imagen rota', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(600);
  const broken = await page.evaluate(() => {
    return [...document.querySelectorAll('img')]
      .filter((img) => (img as HTMLImageElement).offsetParent !== null)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute('alt') || img.src.slice(-30));
  });
  expect(broken).toEqual([]);
});

// DC-056 — avatar-stack "+N" usa azul profundo #246991 (no medio) + texto blanco (AA).
// (Solo si existe un stack en la pantalla de obras sociales.)
test('DC-056: avatar-stack "+N" en azul profundo con texto blanco', async ({ page }) => {
  await gotoApp(page, '/facturacion/obras-sociales');
  await page.waitForTimeout(600);
  const plusN = await page.evaluate(() => {
    const rgb = (s: string) => {
      const m = s.match(/\d+/g);
      return m ? m.slice(0, 3).map(Number) : null;
    };
    // El chip "+N" real es el elemento HOJA con fondo (no el contenedor transparente del stack).
    const els = [...document.querySelectorAll('.stack__more, [class*="more"], [class*="__more"]')].filter(
      (e) => /^\+\d+$/.test((e.textContent || '').trim()) && (e as HTMLElement).offsetParent !== null,
    );
    return els.slice(0, 4).map((e) => {
      const cs = getComputedStyle(e as HTMLElement);
      return { bg: rgb(cs.backgroundColor), color: rgb(cs.color) };
    });
  });
  // Si hay stacks con overflow, el +N debe ser #246991 (36,105,145) con texto blanco.
  for (const p of plusN) {
    if (!p.bg) continue;
    expect(Math.abs(p.bg[0] - 36) < 12 && Math.abs(p.bg[1] - 105) < 12 && Math.abs(p.bg[2] - 145) < 12).toBe(true);
    expect(p.color && p.color[0] > 235).toBeTruthy();
  }
});

// DC-063 / BVC-009 — data-table ≤5 columnas (facturas ≤4). BVC-026 (sin infinite scroll, paginación).
test('DC-063 / BVC-009 / BVC-026: tablas ≤5 columnas con paginación offset (sin infinite scroll)', async ({ page }) => {
  // Pacientes ≤5
  await gotoApp(page, '/pacientes');
  await page.getByRole('heading', { level: 1, name: 'Pacientes' }).waitFor();
  await page.waitForTimeout(300);
  const pacCols = await page.evaluate(() => {
    const t = document.querySelector('table');
    const h = t?.querySelector('thead tr') || t?.querySelector('tr');
    return h ? h.children.length : 0;
  });
  expect(pacCols).toBeGreaterThan(0);
  expect(pacCols).toBeLessThanOrEqual(5);
  // contador de paginación "1–N de M" presente (no infinite scroll)
  await expect(page.getByText(/\d+\s*[–-]\s*\d+\s+de\s+\d+/)).toBeVisible();

  // Facturas ≤4
  await gotoApp(page, '/facturacion/facturas');
  await page.waitForTimeout(400);
  const facCols = await page.evaluate(() => {
    const t = document.querySelector('table');
    const h = t?.querySelector('thead tr') || t?.querySelector('tr');
    return h ? h.children.length : 0;
  });
  if (facCols > 0) expect(facCols).toBeLessThanOrEqual(4);
});

// DC-073 / BVC-013 / BVC-026 — ficha con 6 tabs; contenido del tab inactivo NO en el DOM.
test('DC-073 / BVC-013: ficha con 6 tabs y contenido del tab inactivo NO en el DOM', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(500);
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(6);
  // Solo un tabpanel renderizado (el activo). El resto NO está en el DOM (router-outlet hijo).
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
});

// DC-074/041 / BVC-020 — patient-header: nombre como <h1>, banner azul sobrio (NUNCA aurora), 1 acción primaria.
test('DC-074/041 / BVC-020: cabecera de ficha con nombre <h1>, banner azul sobrio, 1 acción', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(500);
  // nombre del paciente como <h1>
  const nameH1 = page.getByRole('heading', { level: 1 }).filter({ hasNotText: 'Pacientes' });
  await expect(nameH1.first()).toBeVisible();
  // 1 acción primaria "Agendar turno"
  await expect(page.getByRole('button', { name: 'Agendar turno' })).toBeVisible();

  // Banner azul sobrio (gradiente dentro de la familia azul, sin morado/magenta/naranja).
  const bannerGrad = await page.evaluate(() => {
    const b = document.querySelector('.ficha__banner, [class*="banner"]');
    return b ? getComputedStyle(b as HTMLElement).backgroundImage : '';
  });
  if (bannerGrad && bannerGrad !== 'none') {
    // sin rojos/naranjas saturados (aurora)
    expect(bannerGrad.toLowerCase()).not.toMatch(/rgb\(\s*2[0-5]\d\s*,\s*\d{1,2}\s*,\s*\d{1,2}/);
    // contiene el azul cielo #c5d8e8 = rgb(197, 216, 232) como primera parada
    expect(bannerGrad).toMatch(/197,\s*216,\s*232/);
  }
});

// DC-076 — odontograma: 32 piezas con aria-label FDI+universal+estado, leyenda de 6 estados visible.
// El bloque del odontograma carga con `@defer (on idle)` (fix de BUG-E04: hidrataba por deep-link
// directo en mobile). `on idle` hidrata en un instante NO determinista (la idle window depende de
// red/CPU), por lo que un `waitForTimeout` fijo es una carrera: si el idle dispara después del wait,
// el snapshot lee 0 piezas. Esperamos explícitamente a que el `@defer` puble las 32 piezas y la
// leyenda (auto-retry de `expect`, hasta `expect.timeout`). Patrón robusto para `on idle` y `on viewport`.
test('DC-076: odontograma con 32 piezas (aria-label FDI) y leyenda de 6 estados', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/odontograma`);

  // Esperar a que el @defer (on idle) hidrate: las 32 piezas FDI deben estar en el DOM.
  const teethLocator = page.locator('[aria-label^="Pieza"]');
  await expect(teethLocator).toHaveCount(32);

  // aria-label con formato "Pieza NN (universal N), Estado"
  const sampleLabels = await teethLocator.evaluateAll((els) =>
    els.slice(0, 3).map((e) => e.getAttribute('aria-label')),
  );
  expect(sampleLabels[0]).toMatch(/Pieza\s+\d+\s+\(universal\s+\d+\),/);

  // Leyenda con los 6 estados (esperar a que el contenedor diferido esté presente y poblado).
  const legendLocator = page.locator('.odo__legend, [class*="legend"], [class*="leyenda"]').first();
  await expect(legendLocator).toBeVisible();
  for (const s of ['Sana', 'Caries', 'Obturación', 'Ausente', 'En tratamiento', 'Prótesis']) {
    await expect(legendLocator).toContainText(s);
  }
});

// DC-064 — empty-state: no-encontrado dentro del shell con guidance + acción.
test('DC-064: empty-state con guidance + 1 acción (no-encontrado)', async ({ page }) => {
  await gotoApp(page, '/ruta-inexistente-zz');
  await expect(page.getByText(/No encontramos esta página/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Volver al inicio/i })).toBeVisible();
});
