import { test, expect } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — App Shell y chasis (DC-030..035) + BVC-007/008/024/027.
 * Verificación: estructura visual (sidebar/header/footer/login/no-encontrado) en desktop.
 */

test.use({ viewport: { width: 1280, height: 900 } });

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// DC-030/031 — App Shell + Sidebar: grid sidebar fijo + 5 items + Config/Ayuda. BVC-007/025.
test('DC-030/031 / BVC-007 / BVC-025: sidebar con 5 items + Config/Ayuda, ícono+label visible', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const nav = page.getByRole('navigation', { name: 'Navegación principal' });
  await expect(nav).toBeVisible();

  const mainItems = ['Agenda', 'Pacientes', 'Tratamientos', 'Facturación', 'Reportes'];
  for (const item of mainItems) {
    await expect(nav.getByRole('link', { name: item })).toBeVisible(); // label SIEMPRE visible (BVC-025)
  }
  await expect(nav.getByRole('link', { name: 'Configuración' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Ayuda' })).toBeVisible();

  // El sidebar en desktop es una columna fija (~232px).
  const width = await page.evaluate(() => {
    const aside = document.querySelector('.shell__sidebar, aside');
    return aside ? Math.round(aside.getBoundingClientRect().width) : 0;
  });
  expect(width).toBeGreaterThanOrEqual(220);
  expect(width).toBeLessThanOrEqual(250);
});

// DC-031/050 — item activo sincronizado con la URL (uno solo, píldora #c5d8e8).
test('DC-031/050: solo un item de sidebar activo, sincronizado con la ruta', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  const activeInfo = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.sidebar__item, nav a')];
    const active = items.filter((i) => i.classList.contains('is-active') || i.getAttribute('aria-current') === 'page');
    const activeEl = active[0] as HTMLElement | undefined;
    return {
      activeCount: active.length,
      activeText: activeEl ? (activeEl.textContent || '').trim() : '',
      bg: activeEl ? getComputedStyle(activeEl).backgroundColor : '',
    };
  });
  expect(activeInfo.activeCount).toBe(1);
  expect(activeInfo.activeText).toContain('Pacientes');
  // Píldora activa tintada con azul cielo #c5d8e8 = rgb(197,216,232)
  expect(activeInfo.bg).toBe('rgb(197, 216, 232)');
});

// DC-032 — Header: módulo activo + campana con badge + avatar "AD"; SIN búsqueda global. BVC-008/024.
test('DC-032 / BVC-008 / BVC-024: header sin búsqueda global / command palette', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const banner = page.getByRole('banner');
  await expect(banner.getByRole('heading', { level: 1, name: 'Reportes' })).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Notificaciones' })).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Cuenta de la administradora' })).toBeVisible();

  // No debe existir command palette / búsqueda global en el header.
  const globalSearch = await page.evaluate(() => {
    const banner = document.querySelector('header, [role="banner"]');
    if (!banner) return 0;
    return banner.querySelectorAll('input[type="search"], [role="combobox"], [placeholder*="Buscar en todo"], [aria-label*="global"]').length;
  });
  expect(globalSearch).toBe(0);
});

// DC-033/052 — Footer sobrio de 1 línea, SIN "demo"/portfolio/"Resetear demo". BVC-027.
test('DC-033/052 / BVC-027: footer sobrio, una línea, sin lenguaje de demo', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const footer = page.locator('.footer, footer, .footer__text').last();
  await expect(footer).toContainText('Estudio Dental Mendieta');
  const footerText = (await footer.textContent()) || '';
  expect(footerText.toLowerCase()).not.toContain('demo');
  expect(footerText.toLowerCase()).not.toContain('portfolio');
  expect(footerText.toLowerCase()).not.toContain('resetear');
  expect(footerText.toLowerCase()).not.toContain('link design');
});

// DC-034 — Login: card centrada sin shell, banner azul sobrio (NUNCA aurora).
test('DC-034: login sin shell, canvas #fafafa, banner azul sobrio (no aurora)', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Ingresar como administradora' })).toBeVisible();
  // sin sidebar
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toHaveCount(0);

  const visual = await page.evaluate(() => {
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const grads: string[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const bi = getComputedStyle(el as HTMLElement).backgroundImage;
      if (bi && bi.includes('gradient')) grads.push(bi);
    });
    return { bodyBg, grads };
  });
  expect(visual.bodyBg).toBe('rgb(250, 250, 250)'); // #fafafa
  // Cualquier gradiente debe ser azul sobrio (NO morado/magenta/naranja "aurora").
  for (const g of visual.grads) {
    // aurora típica incluye tonos morado/magenta/naranja → comprobamos que el gradiente
    // se mantiene en la familia azul (los canales b≥r en sus paradas claras).
    expect(g.toLowerCase()).not.toMatch(/rgb\(\s*(1[5-9]\d|2[0-5]\d)\s*,\s*\d{1,2}\s*,/); // sin rojos/naranjas saturados
  }
});

// DC-035 — No encontrado: empty state dentro del shell, "Volver al inicio".
test('DC-035: ruta inexistente → empty state dentro del shell con "Volver al inicio"', async ({ page }) => {
  await gotoApp(page, '/ruta-basura-qa');
  // shell presente (sidebar)
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await expect(page.getByText(/No encontramos esta página/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Volver al inicio/i })).toBeVisible();
});
