import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Visual Checker — Iteración 4 (Odontograma editable), Ronda 1.
 *
 * FOCO del plan: el `app-tooth-state-selector` (`.tss` / `.tss__opt`) del detalle de
 * pieza editable — los 6 estados deben ser tocables (touch ≥44px), legibles y operables
 * SIN scroll horizontal en mobile, con focus ring por teclado.
 *
 *  · REQ-270 (+ NFR-022, DC-088) — TOUCH TARGET ≥44px en mobile:
 *      en `/pacientes/:id/pieza/:fdi`, viewport mobile (<768px), las 6 opciones
 *      `.tss__opt` (role=radio) miden boundingBox().height ≥44px reales; el botón
 *      "Guardar estado" también ≥44px. Sin scroll horizontal en la pantalla.
 *      (Contrato verificado en vivo 2026-06-02: opciones en grid 2 col de 142.5px,
 *      alto 52px–77px; "Guardar estado" 44px; documentElement.scrollWidth == innerWidth.)
 *
 *  · DC-077 — el selector es un grupo de opciones VISIBLES y tocables (radiogroup),
 *      NO un dropdown denso: role="radiogroup" con 6 role="radio"; la opción actual
 *      marcada (`.tss__opt.is-selected` + aria-checked="true").
 *
 *  · DC-076 — los 6 estados del dominio están presentes (Sana, Caries, Obturación,
 *      Ausente, En tratamiento, Prótesis), coherentes con la leyenda del odontograma.
 *
 *  · NFR-021 — focus ring visible por teclado en `.tss__opt:focus-visible`
 *      = `var(--focus-ring)` = `0 0 0 2px #246991` (DC-028).
 *
 * Contrato de breakpoint (verificado en vivo contra el SWA desplegado):
 *   - 393px (Pixel 5) → 6 `.tss__opt` ≥44px, sin scroll-x, "Guardar estado" 44px.
 *   - 1280px → opciones 52px (≥40px desktop), sin scroll-x.
 */

const PID = 'pac-001';
const FDI = '16';
const PIEZA = `/pacientes/${PID}/pieza/${FDI}`;
const MOBILE = { width: 393, height: 851 };
const DESKTOP = { width: 1280, height: 900 };

const ESTADOS = ['Sana', 'Caries', 'Obturación', 'Ausente', 'En tratamiento', 'Prótesis'];

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// REQ-270 / NFR-022 — los 6 .tss__opt ≥44px de alto real en mobile (FOCO del plan).
test('REQ-270: selector de estado de pieza — 6 opciones touch ≥44px en mobile, sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, PIEZA);

  const group = page.getByRole('radiogroup', { name: 'Estado de la pieza' });
  await expect(group).toBeVisible();

  const opts = page.locator('.tss__opt');
  await expect(opts).toHaveCount(6);

  // Cada opción mide ≥44px de alto real (touch target mobile).
  const count = await opts.count();
  for (let i = 0; i < count; i++) {
    const box = await opts.nth(i).boundingBox();
    expect(box, `opción ${i} sin boundingBox`).not.toBeNull();
    expect(box!.height, `opción ${i} (${(await opts.nth(i).textContent())?.trim()}) <44px`).toBeGreaterThanOrEqual(44);
  }

  // "Guardar estado" también ≥44px en mobile.
  const guardar = page.getByRole('button', { name: 'Guardar estado' });
  const gBox = await guardar.boundingBox();
  expect(gBox).not.toBeNull();
  expect(gBox!.height).toBeGreaterThanOrEqual(44);

  // Sin scroll horizontal en el detalle de pieza editable.
  expect(await hasHorizontalScroll(page)).toBe(false);
});

// DC-077 — radiogroup con 6 radios visibles (NO dropdown), opción actual marcada.
test('REQ-270/DC-077: tooth-state-selector es radiogroup con 6 radios visibles y opción seleccionada', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, PIEZA);

  const radios = page.getByRole('radio');
  await expect(radios).toHaveCount(6);

  // Exactamente una opción marcada (aria-checked / .is-selected).
  const selectedCount = await page.locator('.tss__opt.is-selected').count();
  expect(selectedCount).toBe(1);
  const checked = page.locator('.tss__opt[aria-checked="true"]');
  await expect(checked).toHaveCount(1);

  // NO es un dropdown denso: no hay <select> dentro del selector de estado.
  const selectsInSelector = await page.locator('.tss select').count();
  expect(selectsInSelector).toBe(0);
});

// DC-076 — los 6 estados del dominio están ofrecidos (coherencia con la leyenda).
test('REQ-270/DC-076: el selector ofrece los 6 estados del dominio', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, PIEZA);

  for (const estado of ESTADOS) {
    await expect(page.getByRole('radio', { name: estado })).toBeVisible();
  }
});

// NFR-021 — focus ring visible por teclado en las opciones del selector.
test('REQ-270/NFR-021: .tss__opt tiene focus ring 2px #246991 por teclado', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, PIEZA);

  await expect(page.locator('.tss__opt').first()).toBeVisible();

  const ring = await page.evaluate(() => {
    const opt = document.querySelector('.tss__opt') as HTMLElement | null;
    if (!opt) return { ok: false };
    opt.focus();
    return {
      matchesFV: opt.matches(':focus-visible'),
      boxShadow: getComputedStyle(opt).boxShadow,
      ringVar: getComputedStyle(document.documentElement).getPropertyValue('--focus-ring').trim(),
    };
  });
  // El ring resuelto = rgb(36,105,145) 0px 0px 0px 2px == #246991 2px.
  expect(ring.ringVar).toBe('0 0 0 2px #246991');
  expect(ring.boxShadow).toContain('rgb(36, 105, 145)');
  expect(ring.boxShadow).toContain('2px');
});

// Sanidad desktop — el selector también respeta el control-height (≥40px) y sin scroll-x.
test('REQ-270: selector usable en desktop (opciones ≥40px, sin scroll horizontal)', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, PIEZA);

  const opts = page.locator('.tss__opt');
  await expect(opts).toHaveCount(6);
  const box = await opts.first().boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(40);
  expect(await hasHorizontalScroll(page)).toBe(false);
});
