import { test, expect } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Gates de regresión para los bugs detectados en Ronda 1.
 * Encierran el comportamiento CORRECTO esperado; quedan `fixme` hasta que el UI Developer
 * corrija. Al pasar tras el fix, entran en la regresión automatizada.
 *
 * BUG-V01 (CRÍTICO, raíz): el stylesheet global de diseño se sirve con media="print" y su
 *   `onload="this.media='all'"` es bloqueado por CSP → la hoja NO aplica en pantalla. Esto
 *   rompe el estilado de `.btn-edm` (DC-071: relleno #6da8d4, alto 40px, radius), el estado
 *   disabled (DC-021/BUG-E02), y los tamaños de touch de icon-buttons (DC-072/088).
 * BUG-V04 (a11y): los tabs de la ficha no exponen aria-selected (DC-073).
 */

const PID = 'pac-001';

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// DC-071 / GAP-A04 — botón primario con relleno azul medio #6da8d4 + texto oscuro, alto 40px, radius 10-14.
// FALLA hoy: el botón cae a estilo nativo (#efefef / negro / radius 0 / 27px) por BUG-V01.
test.fixme('DC-071 (BUG-V01): botón primario con relleno #6da8d4 + texto oscuro, alto 40px, radius 10-14', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.getByRole('button', { name: 'Agendar turno' }).waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  const btn = await page.evaluate(() => {
    const b = document.querySelector('button.btn-edm--primary') as HTMLElement;
    const cs = getComputedStyle(b);
    const rgb = (s: string) => (s.match(/\d+/g) || []).slice(0, 3).map(Number);
    return { bg: rgb(cs.backgroundColor), color: rgb(cs.color), radius: parseInt(cs.borderRadius, 10), height: parseInt(cs.height, 10) };
  });
  // relleno azul medio #6da8d4 = rgb(109,168,212)
  expect(Math.abs(btn.bg[0] - 109) < 10 && Math.abs(btn.bg[1] - 168) < 10 && Math.abs(btn.bg[2] - 212) < 10).toBe(true);
  // texto oscuro #2a2a35 (NO blanco — GAP-A04)
  expect(btn.color[0] < 80 && btn.color[1] < 80 && btn.color[2] < 80).toBe(true);
  expect(btn.radius).toBeGreaterThanOrEqual(10);
  expect(btn.radius).toBeLessThanOrEqual(14);
  expect(btn.height).toBe(40);
});

// DC-021 / BUG-E02 — botón disabled con opacidad 0.4 y cursor not-allowed.
// FALLA hoy: cae a opacity:1 / cursor:default por BUG-V01 (la regla .btn-edm:disabled no aplica).
test.fixme('DC-021 (BUG-E02/BUG-V01): botón disabled con opacity 0.4 y cursor not-allowed', async ({ page }) => {
  // El detalle de turno en estado terminal tiene la acción primaria deshabilitada.
  await gotoApp(page, '/agenda');
  await page.waitForTimeout(600);
  // Inyectamos un probe deshabilitado dentro del scope no es fiable; verificamos un botón disabled real si existe.
  const disabled = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button.btn-edm[disabled], button.btn-edm[aria-disabled="true"]')][0] as HTMLElement | undefined;
    if (!b) return null;
    const cs = getComputedStyle(b);
    return { opacity: cs.opacity, cursor: cs.cursor };
  });
  test.skip(disabled === null, 'No hay botón .btn-edm disabled visible en esta vista');
  expect(parseFloat(disabled!.opacity)).toBeCloseTo(0.4, 1);
  expect(disabled!.cursor).toBe('not-allowed');
});

// DC-072 / DC-088 / BVC-017 — touch targets ≥44px en mobile (hamburguesa, campana, icon-buttons).
// FALLA hoy: hamburguesa 28px, campana 29px, "Editar paciente" 21px por BUG-V01 (sizing de icon-btn no aplica).
test.fixme('DC-072/088 (BUG-V01): touch targets ≥44px en mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoApp(page, '/pacientes');
  await page.getByRole('heading', { level: 1, name: 'Pacientes' }).waitFor();
  await page.waitForTimeout(500);
  const small = await page.evaluate(() => {
    const interactives = [...document.querySelectorAll('button, a[href], input')].filter((e) => (e as HTMLElement).offsetParent !== null);
    return interactives
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.height > 0 && r.width > 0 && r.height < 44;
      })
      .map((e) => ({ t: (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 24), h: Math.round(e.getBoundingClientRect().height) }));
  });
  expect(small, 'controles bajo 44px en mobile').toEqual([]);
});

// DC-073 (BUG-V04, a11y) — cada role="tab" expone aria-selected (true/false).
test.fixme('DC-073 (BUG-V04): los tabs de la ficha exponen aria-selected', async ({ page }) => {
  await gotoApp(page, `/pacientes/${PID}/informacion`);
  await page.waitForTimeout(500);
  const states = await page.evaluate(() =>
    [...document.querySelectorAll('[role="tab"]')].map((t) => t.getAttribute('aria-selected')),
  );
  // exactamente un tab seleccionado, y ninguno con aria-selected nulo
  expect(states.every((s) => s === 'true' || s === 'false')).toBe(true);
  expect(states.filter((s) => s === 'true').length).toBe(1);
});
