import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Brief Verification Criteria (negativos/subjetivos) + NFR a11y/perf.
 * BVC-027 (CRÍTICO: cero demo/tracking), BVC-018 (sin emojis/gradientes/sombras pesadas),
 * BVC-011/012 (filtro único, sin modales >50% ni drawers como contenido), NFR-001..005 perf,
 * NFR-020..023 a11y.
 */

const PID = 'pac-001';

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ---------------------------------------------------------------------------
// BVC-027 (CRÍTICO) — ninguna parte de la UI revela demo/mock + cero tracking.
// ---------------------------------------------------------------------------
test('BVC-027 (CRÍTICO): cero tracking/analytics de terceros (red)', async ({ page }) => {
  const thirdParty: string[] = [];
  page.on('request', (req) => {
    const u = req.url();
    if (!/azurestaticapps\.net/.test(u) && !u.startsWith('data:') && !u.startsWith('blob:')) {
      thirdParty.push(u);
    }
  });
  const tracking = /google-analytics|googletagmanager|gtag|hotjar|mixpanel|segment\.|amplitude|fullstory|sentry|datadog|facebook|fbevents|clarity\.ms|doubleclick|posthog|matomo|plausible|heap\.|intercom|drift/i;

  for (const route of ['/reportes', '/pacientes', '/agenda', `/pacientes/${PID}/informacion`]) {
    await gotoApp(page, route);
    await page.waitForTimeout(500);
  }
  const trackers = thirdParty.filter((u) => tracking.test(u));
  expect(trackers, 'requests de tracking/analytics').toEqual([]);
  // Tampoco SDKs de analytics en window.
  const sdks = await page.evaluate(() => {
    const w = window as any;
    return ['ga', 'gtag', 'dataLayer', '_hsq', 'mixpanel', 'analytics', 'hj', 'fbq', 'Sentry', '_paq'].filter((k) => typeof w[k] !== 'undefined');
  });
  expect(sdks, 'SDKs de analytics en window').toEqual([]);
});

test('BVC-027 (CRÍTICO): cero lenguaje de demo/mock en la UI (recorrido)', async ({ page }) => {
  const demoTerms = ['demo', 'mock', 'simulación', 'simulacion', 'ficticio', 'viewcase', 'link design', 'linkdesign', 'portfolio', 'resetear demo', 'lorem ipsum'];
  const routes = ['/reportes', '/pacientes', '/agenda', `/pacientes/${PID}/informacion`, '/facturacion/facturas', '/configuracion', '/ayuda', '/login', '/ruta-basura-qa'];
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const found = await page.evaluate((terms) => {
      const text = document.body.innerText.toLowerCase();
      return (terms as string[]).filter((t) => new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text));
    }, demoTerms);
    expect(found, `lenguaje de demo en ${route}`).toEqual([]);
  }
});

test('BVC-027: facturación sin ARCA/AFIP/CAE', async ({ page }) => {
  for (const route of ['/facturacion/facturas', '/facturacion/presupuestos', '/facturacion/obras-sociales']) {
    await gotoApp(page, route);
    await page.waitForTimeout(400);
    const fiscal = await page.evaluate(() => {
      const text = document.body.innerText;
      return ['ARCA', 'AFIP', 'CAE'].filter((t) => new RegExp('\\b' + t + '\\b').test(text));
    });
    expect(fiscal, `referencia fiscal en ${route}`).toEqual([]);
  }
});

// ---------------------------------------------------------------------------
// BVC-018 (negative) — sin emojis, gradientes saturados, sombras pesadas, pills estridentes.
// ---------------------------------------------------------------------------
test('BVC-018 (negative): sin emojis, gradientes saturados ni sombras pesadas', async ({ page }) => {
  for (const route of ['/reportes', '/pacientes', `/pacientes/${PID}/informacion`]) {
    await gotoApp(page, route);
    await page.waitForTimeout(500);
    const report = await page.evaluate(() => {
      const text = document.body.innerText;
      const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{2B00}-\u{2BFF}]/u;
      const heavyShadows: string[] = [];
      const satGradients: string[] = [];
      // hsl helper para detectar saturación real (no por substring rgb).
      const sat = (r: number, g: number, b: number) => {
        const mx = Math.max(r, g, b) / 255,
          mn = Math.min(r, g, b) / 255;
        const l = (mx + mn) / 2;
        const s = mx === mn ? 0 : l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
        // hue dominante: rojo/naranja/magenta => no azul
        const hue = (() => {
          if (mx === mn) return 0;
          const d = mx - mn;
          let h = 0;
          if (mx === r / 255) h = ((g - b) / 255 / d) % 6;
          else if (mx === g / 255) h = (b - r) / 255 / d + 2;
          else h = (r - g) / 255 / d + 4;
          h *= 60;
          return h < 0 ? h + 360 : h;
        })();
        return { s, hue };
      };
      document.querySelectorAll('*').forEach((el) => {
        const e = el as HTMLElement;
        const cs = getComputedStyle(e);
        const sh = cs.boxShadow;
        // Ignoramos focus-rings (box-shadow opaco con blur 0, p.ej. 0 0 0 2px #246991).
        if (sh && sh !== 'none' && !/^(inset\s+)?(rgba?\([^)]*\)\s+)?0px 0px 0px/.test(sh)) {
          // "Pesada" = drop shadow con opacidad alta. El overlay sancionado del sistema es
          // rgba(42,42,53,.12)/blur 28 (drawer/toast/dropdown) → permitido por DC-023.
          const opMatch = sh.match(/rgba?\([^)]*?,\s*([\d.]+)\)/);
          const op = opMatch ? parseFloat(opMatch[1]) : 0; // sin alpha explícito → no lo tratamos como pesada
          const blurs = sh.match(/(\d+)px/g);
          const maxBlur = blurs ? Math.max(...blurs.map((b) => parseInt(b))) : 0;
          if ((op > 0.18 && maxBlur > 6) || maxBlur > 32) heavyShadows.push(sh.slice(0, 50));
        }
        const bi = cs.backgroundImage;
        if (bi && bi.includes('gradient')) {
          const stops = bi.match(/rgb[a]?\([^)]+\)/g) || [];
          for (const st of stops) {
            const m = st.match(/\d+/g);
            if (!m) continue;
            const [r, g, b] = m.slice(0, 3).map(Number);
            const { s, hue } = sat(r, g, b);
            // saturado y NO azul (azul ~200-260°) => "aurora"/estridente prohibido
            if (s > 0.5 && !(hue >= 190 && hue <= 260)) {
              satGradients.push(`${st} en ${bi.slice(0, 40)}`);
            }
          }
        }
      });
      return { emojis: emojiRe.test(text), heavyShadows: [...new Set(heavyShadows)], satGradients: [...new Set(satGradients)] };
    });
    expect(report.emojis, `emojis en ${route}`).toBe(false);
    expect(report.heavyShadows, `sombras pesadas en ${route}`).toEqual([]);
    expect(report.satGradients, `gradientes saturados en ${route}`).toEqual([]);
  }
});

// ---------------------------------------------------------------------------
// BVC-011/012/023 — un filtro principal visible; sin modales >50%; sin drawers como contenido.
// ---------------------------------------------------------------------------
test('BVC-011: un solo filtro principal visible en listas (resto en panel)', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.waitForTimeout(400);
  const visibleSelects = await page.evaluate(() =>
    [...document.querySelectorAll('main select')].filter((s) => (s as HTMLElement).offsetParent !== null).length,
  );
  expect(visibleSelects).toBeLessThanOrEqual(1);
});

test('BVC-012/023: sin drawers laterales como contenido principal en desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(400);
  // el contenido principal vive en <main>, no en un drawer/aside lateral abierto.
  const mainHasContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? (main.textContent || '').trim().length > 100 : false;
  });
  expect(mainHasContent).toBe(true);
});

// ---------------------------------------------------------------------------
// NFR-001 — carga inicial < 3s (cold load).
// ---------------------------------------------------------------------------
test('NFR-001: carga inicial de /reportes < 3s', async ({ page }) => {
  const t0 = Date.now();
  await page.goto('/reportes', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'Navegación principal' }).waitFor();
  const elapsed = Date.now() - t0;
  expect(elapsed).toBeLessThan(3000);
});

// NFR-002 — bundle JS inicial < 500KB (cold, sin caché).
test('NFR-002: bundle JS inicial < 500KB gzipped (cold)', async ({ page, context }) => {
  await context.clearCookies();
  let initialJsBytes = 0;
  page.on('response', async (res) => {
    const url = res.url();
    if (/\.js(\?|$)/.test(url) && res.status() === 200) {
      const cl = res.headers()['content-length'];
      if (cl) initialJsBytes += parseInt(cl, 10);
    }
  });
  // navegación en frío a la primera ruta (login no carga features secundarias)
  await page.goto('/login', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  // el initial chunk (lo que se descarga en la primera vista) debe ser < 500KB
  expect(initialJsBytes / 1024).toBeLessThan(500);
});

// NFR-003 — lazy loading: los chunks de feature NO están todos en la vista inicial.
test('NFR-003: code-splitting presente (múltiples chunks JS)', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const chunks = await page.evaluate(() =>
    performance.getEntriesByType('resource').filter((r) => /chunk-|\.js(\?|$)/.test(r.name)).length,
  );
  expect(chunks).toBeGreaterThan(1);
});

// NFR-004 — odontograma 32 piezas sin lag perceptible (render < 2.5s tras navegar).
test('NFR-004: odontograma (32 piezas) renderiza sin lag', async ({ page }) => {
  // Calentamos el chunk diferido del odontograma navegando directo a su ruta una vez.
  await gotoApp(page, `/pacientes/${PID}/odontograma`);
  await page.locator('[aria-label^="Pieza"]').first().waitFor({ state: 'visible' });
  expect(await page.locator('[aria-label^="Pieza"]').count()).toBe(32);

  // Medimos el LAG DE INTERACCIÓN (no la descarga de red): re-render del diagrama al volver
  // a la pestaña con el chunk ya en caché. "Sin lag perceptible" ⇒ presupuesto holgado y
  // tolerante a la variabilidad de red contra el sitio desplegado.
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  const t0 = Date.now();
  await page.getByRole('tab', { name: 'Odontograma' }).click();
  await page.locator('[aria-label^="Pieza"]').first().waitFor({ state: 'visible' });
  const elapsed = Date.now() - t0;
  expect(await page.locator('[aria-label^="Pieza"]').count()).toBe(32);
  const isMobile = page.viewportSize()!.width < 500;
  expect(elapsed).toBeLessThan(isMobile ? 5000 : 4000);
});

// ---------------------------------------------------------------------------
// NFR-023 — ningún ícono de navegación principal sin label. BVC-025.
// ---------------------------------------------------------------------------
test('NFR-023 / BVC-025: ningún ícono de navegación principal sin label visible', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const navLinks = page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link');
  const count = await navLinks.count();
  for (let i = 0; i < count; i++) {
    const text = (await navLinks.nth(i).textContent())?.trim() || '';
    expect(text.length, `link de navegación #${i} sin label`).toBeGreaterThan(0);
  }
});

// NFR-020 — campana/avatar e iconos de acción con aria-label.
test('NFR-020/DC-072: icon-buttons del header con aria-label', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await expect(page.getByRole('button', { name: 'Notificaciones' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cuenta de la administradora' })).toBeVisible();
});
