import { test, expect } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Validación post-deployment (Fase 6, 6b).
 *
 * Cierra el ÚNICO gap de cobertura de 6a: el deployment de producción optimizó
 * las 29 fotos de paciente (67 MB → 1.72 MB, redimensión a 600px + recompresión
 * JPEG q72, paths byte-idénticos). No existía aserción automatizada del peso/
 * dimensiones/content-type servidos. Este spec lo asegura como regresión durable,
 * además del contrato anti-imagen-rota (REQ-046 / REQ-159/179 / DC-055/078) y la
 * topología de producción de 1 dominio (REQ-272: cero tracking/CRM, cero demo).
 *
 * Corre contra la URL de producción (baseURL de playwright.config.ts).
 */

const BASE = 'https://happy-coast-044ea7e0f.7.azurestaticapps.net';

// Paths que ANTES eran los más pesados (9.4 / 6.2 / 6.4 / 6.0 MB → ahora ~40–90 KB).
const WORST_CASE_PHOTOS = [
  '/imagenes/pacientes/mujeres/14.jpg', // peor caso histórico: 9.4 MB/4129px
  '/imagenes/pacientes/hombres/4.jpg',
  '/imagenes/pacientes/mujeres/70.jpg',
  '/imagenes/pacientes/mujeres/3.jpg',
];

// Hosts de analytics/CRM que NUNCA deben aparecer (coherente con CSP connect-src/script-src 'self').
const ANALYTICS_BLOCKLIST = [
  'google-analytics', 'googletagmanager', 'gtm', 'segment', 'hotjar', 'mixpanel',
  'doubleclick', 'facebook', 'fbcdn', 'clarity.ms', 'amplitude', 'fullstory',
  'intercom', 'yandex', 'matomo', 'plausible', 'heap.io', 'sentry', 'datadog', 'newrelic',
];

test.describe('REQ-046 / REQ-272 — Fotos optimizadas + topología producción (6b)', () => {
  // REQ-046 / A4 / NFR-001 — el manifest y las fotos optimizadas se sirven con los bytes correctos.
  test('seed manifest sirve 29 pacientes con content-type JSON', async ({ request }) => {
    const res = await request.get(`${BASE}/seed/manifest.json`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    const json = await res.json();
    expect(Array.isArray(json.pacientes)).toBe(true);
    expect(json.pacientes.length).toBe(29);
    // todos los paths apuntan a /imagenes/pacientes/
    for (const p of json.pacientes) {
      expect(p.path).toMatch(/^\/imagenes\/pacientes\/(hombres|mujeres)\/\d+\.jpg$/);
    }
  });

  // A4 — producción sirve los BYTES OPTIMIZADOS (no la versión gorda en caché): image/jpeg, ~40–90 KB.
  test('fotos peor-caso se sirven optimizadas (image/jpeg, < 150 KB)', async ({ request }) => {
    for (const path of WORST_CASE_PHOTOS) {
      const res = await request.get(`${BASE}${path}`);
      expect(res.status(), `${path} status`).toBe(200);
      expect(res.headers()['content-type'], `${path} content-type`).toBe('image/jpeg');
      const body = await res.body();
      // Optimizadas pesan 40–90 KB; el budget de 150 KB falla si reaparece la versión gorda (MB).
      expect(body.length, `${path} bytes`).toBeLessThan(150 * 1024);
      expect(body.length, `${path} bytes`).toBeGreaterThan(10 * 1024);
    }
  });

  // Control negativo: un path inexistente cae a SPA-fallback (200 text/html) → prueba que el
  // image/jpeg de las fotos reales es genuino y no un fallback enmascarado.
  test('control negativo: path inexistente devuelve SPA-fallback text/html (no image/jpeg)', async ({ request }) => {
    const res = await request.get(`${BASE}/imagenes/pacientes/NOPE-99.jpg`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/html');
  });

  // REQ-046 / DC-055/078 — LISTA: fotos cargan, naturalWidth=600 (no 4129), 0 imágenes rotas.
  test('A1 lista de pacientes: avatares cargan a 600px natural, 0 imágenes rotas', async ({ page }) => {
    await warmSeed(page);
    await gotoApp(page, '/pacientes');
    await page.getByText('pacientes en el sistema').first().waitFor();
    await page.waitForTimeout(800);

    const r = await page.evaluate(() => {
      const photos = [...document.querySelectorAll('img')].filter((i) =>
        (i.alt || '').startsWith('Foto de'),
      );
      const loaded = photos.filter((i) => i.complete && i.naturalWidth > 0);
      const broken = photos.filter((i) => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.src));
      const natWidths = [...new Set(loaded.map((i) => i.naturalWidth))];
      const dispSizes = [
        ...new Set(loaded.map((i) => `${Math.round(i.getBoundingClientRect().width)}`)),
      ];
      return {
        photoCount: photos.length,
        loadedCount: loaded.length,
        brokenCount: broken.length,
        natWidths,
        dispSizes,
        objectFit: loaded[0] ? getComputedStyle(loaded[0]).objectFit : null,
      };
    });

    expect(r.loadedCount, 'al menos las fotos above-fold cargadas').toBeGreaterThan(0);
    expect(r.brokenCount, 'cero imágenes rotas en la lista').toBe(0);
    // Bytes optimizados a 600px (NO 4129px de la versión gorda).
    expect(r.natWidths, 'naturalWidth de las fotos = 600px (optimizadas)').toEqual([600]);
    // Avatar pequeño de tamaño fijo con cover.
    expect(r.dispSizes).toContain('32');
    expect(r.objectFit).toBe('cover');
  });

  // REQ-046 / REQ-169 — FICHA: foto header 120px carga, no rota; al cambiar de tab NO se recrea.
  test('A2 ficha: foto header 120px carga (600px natural) y persiste al cambiar de tab', async ({ page }) => {
    await warmSeed(page);
    await gotoApp(page, '/pacientes/pac-002/informacion');
    await page.waitForTimeout(800);

    const before = await page.evaluate(() => {
      const img = [...document.querySelectorAll('img')].find((i) => (i.alt || '').startsWith('Foto de'));
      if (!img) return null;
      img.dataset.qaMarker = 'header-photo';
      return {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        dispW: Math.round(img.getBoundingClientRect().width),
        broken: img.complete && img.naturalWidth === 0,
      };
    });
    expect(before, 'header photo presente').not.toBeNull();
    expect(before!.broken, 'header photo no rota').toBe(false);
    expect(before!.naturalWidth, 'header 600px natural').toBe(600);
    expect(before!.dispW, 'header mostrado a 120px').toBe(120);

    // Cambiar al tab Odontograma (REQ-169: la cabecera no debe recargarse).
    await page.getByRole('tab', { name: 'Odontograma' }).click();
    await expect(page).toHaveURL(/\/odontograma$/);

    const after = await page.evaluate(() => {
      const img = [...document.querySelectorAll('img')].find((i) => (i.alt || '').startsWith('Foto de'));
      if (!img) return null;
      return {
        sameElement: img.dataset.qaMarker === 'header-photo',
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        broken: img.complete && img.naturalWidth === 0,
      };
    });
    expect(after, 'header photo sigue presente tras cambiar tab').not.toBeNull();
    expect(after!.sameElement, 'header NO se recreó al cambiar de tab (REQ-169)').toBe(true);
    expect(after!.broken).toBe(false);
    expect(after!.naturalWidth).toBe(600);
  });

  // REQ-272 — CERO tracking/CRM y CERO demo/mock expuesto; solo el propio dominio (1 dominio).
  test('REQ-272: cero hosts de analytics/CRM y cero demo/mock en /pacientes', async ({ page }) => {
    const offending: string[] = [];
    page.on('request', (req) => {
      const host = new URL(req.url()).host.toLowerCase();
      if (ANALYTICS_BLOCKLIST.some((b) => host.includes(b))) offending.push(req.url());
    });

    await warmSeed(page);
    await gotoApp(page, '/pacientes');
    await page.getByText('pacientes en el sistema').first().waitFor();
    await page.waitForTimeout(1000);

    // 0 requests a analytics/CRM.
    expect(offending, `hits a analytics/CRM: ${offending.join(', ')}`).toHaveLength(0);

    const audit = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource').map((e) => e.name);
      const hosts = [...new Set([...entries, location.href].map((u) => new URL(u).host))];
      const thirdParty = hosts.filter(
        (h) => !h.includes('happy-coast-044ea7e0f') && !h.includes('azurestaticapps'),
      );
      const visible = (document.body.innerText || '').toLowerCase();
      const html = document.documentElement.outerHTML.toLowerCase();
      const forbidden = ['demo', 'mock', 'simulación', 'simulacion', 'viewcase', 'lorem ipsum'];
      return {
        thirdParty,
        forbiddenVisible: forbidden.filter((t) => visible.includes(t)),
        forbiddenHtml: forbidden.filter((t) => html.includes(t)),
      };
    });

    // 1 dominio: sin hosts de terceros.
    expect(audit.thirdParty, `hosts de terceros: ${audit.thirdParty.join(', ')}`).toHaveLength(0);
    // Sin demo/mock ni en texto visible ni en el HTML.
    expect(audit.forbiddenVisible).toEqual([]);
    expect(audit.forbiddenHtml).toEqual([]);
  });

  // Topología — security headers presentes en la respuesta de producción.
  test('security headers de producción presentes (CSP, X-Frame-Options, nosniff, Referrer/Permissions-Policy)', async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    const h = res.headers();
    expect(h['content-security-policy']).toContain("default-src 'self'");
    expect(h['content-security-policy']).toContain("script-src 'self'");
    expect(h['content-security-policy']).toContain("connect-src 'self'");
    expect(h['x-frame-options']).toBe('SAMEORIGIN');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBeTruthy();
    expect(h['permissions-policy']).toBeTruthy();
  });
});
