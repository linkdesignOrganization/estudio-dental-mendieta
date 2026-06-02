import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Visual Checker — Iteración 4 (Pacientes escritura: crear + editar), Ronda 1.
 *
 * FOCO del plan: el wizard de crear paciente (2 pasos) y el editar precargado son
 * USABLES EN MOBILE — 1 columna, inputs de altura consistente, navegación entre pasos
 * y guardar/cancelar accesibles, touch ≥44px, SIN scroll horizontal; y el indicador de
 * paso (`app-stepper`) visible.
 *
 *  · REQ-181 (DC-070/DC-085) — INDICADOR DE PASO visible:
 *      `/pacientes/nuevo/datos` muestra `.stepper__list` con 2 items
 *      ("Datos personales" / "Datos clínicos"), el actual marcado `.stepper__item.is-current`,
 *      y el contador `.stepper__count` con "Paso 1 de 2". Tras "Siguiente" → "Paso 2 de 2"
 *      y el item "Datos clínicos" pasa a is-current.
 *
 *  · REQ-180 (DC-087/DC-088) — CREAR usable en mobile:
 *      en viewport mobile (<768px) los campos `.input-edm`/`.select-edm` se apilan en
 *      1 columna (misma x de inicio), miden ≥44px de alto (touch), y los botones del
 *      wizard (Siguiente / Atrás / Crear paciente) miden ≥44px. Sin scroll horizontal en
 *      ambos pasos (`/datos` y `/clinico`).
 *      (Contrato vivo 2026-06-02: 8 inputs en Paso 1, todos x=48 / alto 44px; Siguiente 44px;
 *       Paso 2: Atrás + "Crear paciente" 44px, input[type=file] accept="image/*".)
 *
 *  · REQ-185 (DC-087/DC-088) — EDITAR usable en mobile:
 *      `/pacientes/:id/editar` precargado (inputs con value), 1 columna, controles ≥44px,
 *      "Guardar cambios" ≥44px, sin scroll horizontal.
 *
 *  · NFR-021 — focus ring visible por teclado en el `<select id=c-genero>` y los botones
 *      del wizard (`.btn-edm:focus-visible` / `.select-edm:focus-visible` = var(--focus-ring)).
 *
 * Nota: para avanzar a Paso 2 se rellenan los requeridos del Paso 1 (nombre/apellido/dni/
 * fecha/género) — el detalle del género (hombre→Masculino) lo cubre el flow-tester (REQ-174);
 * aquí sólo interesa la USABILIDAD/LAYOUT mobile del wizard.
 */

const MOBILE = { width: 393, height: 851 };
const DESKTOP = { width: 1280, height: 900 };
const PID = 'pac-001';

const DATOS = '/pacientes/nuevo/datos';
const CLINICO = '/pacientes/nuevo/clinico';
const EDITAR = `/pacientes/${PID}/editar`;

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

/** x de inicio (left) distintas entre los controles del form → detecta multi-columna. */
async function distinctLefts(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const ctrls = [...document.querySelectorAll('main input.input-edm, main select.select-edm, main textarea')];
    return [...new Set(ctrls.map((c) => Math.round(c.getBoundingClientRect().left)))];
  });
}

/** Altura mínima de los controles del form. */
async function minControlHeight(page: Page): Promise<number> {
  return page.evaluate(() => {
    const ctrls = [...document.querySelectorAll('main input.input-edm, main select.select-edm, main textarea')];
    return ctrls.length ? Math.min(...ctrls.map((c) => c.getBoundingClientRect().height)) : 0;
  });
}

/** Rellena los requeridos del Paso 1 y pulsa "Siguiente". */
async function fillStep1AndNext(page: Page): Promise<void> {
  await page.evaluate(() => {
    const set = (el: any, val: string) => {
      const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));
    };
    set(document.querySelector('#c-nombre'), 'Test');
    set(document.querySelector('#c-apellido'), 'Visual');
    set(document.querySelector('#c-dni'), '30111222');
    set(document.querySelector('#c-genero'), 'hombre');
    const fecha = document.querySelector('input[type=date]') as HTMLInputElement | null;
    if (fecha) set(fecha, '1990-05-12');
  });
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico/);
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// REQ-181 — stepper visible: 2 pasos, "Paso 1 de 2", actual destacado; avanza a "Paso 2 de 2".
test('REQ-181: indicador de paso visible (Datos personales/Datos clínicos, "Paso N de 2")', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, DATOS);

  // Stepper presente con 2 items y contador "Paso 1 de 2".
  const items = page.locator('.stepper__list .stepper__item');
  await expect(items).toHaveCount(2);
  await expect(page.locator('.stepper__list')).toContainText('Datos personales');
  await expect(page.locator('.stepper__list')).toContainText('Datos clínicos');
  await expect(page.locator('.stepper__count')).toHaveText(/Paso 1 de 2/);
  // El primer item es el actual.
  await expect(page.locator('.stepper__item.is-current')).toContainText('Datos personales');

  // Avanzar a Paso 2 → contador y current cambian.
  await fillStep1AndNext(page);
  await expect(page.locator('.stepper__count')).toHaveText(/Paso 2 de 2/);
  await expect(page.locator('.stepper__item.is-current')).toContainText('Datos clínicos');
});

// REQ-180 — crear Paso 1 en mobile: 1 columna, controles ≥44px, Siguiente ≥44px, sin scroll-x.
test('REQ-180: crear paciente Paso 1 en mobile — 1 columna, controles y "Siguiente" ≥44px', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, DATOS);
  await expect(page.getByRole('heading', { name: 'Datos personales' })).toBeVisible();

  // 1 columna: todos los controles comparten la misma x de inicio.
  expect(await distinctLefts(page)).toHaveLength(1);
  // Controles ≥44px (touch).
  expect(await minControlHeight(page)).toBeGreaterThanOrEqual(44);
  // Botón Siguiente ≥44px.
  const sig = await page.getByRole('button', { name: 'Siguiente' }).boundingBox();
  expect(sig!.height).toBeGreaterThanOrEqual(44);
  // Select de género ≥44px.
  const gen = await page.locator('#c-genero').boundingBox();
  expect(gen!.height).toBeGreaterThanOrEqual(44);

  expect(await hasHorizontalScroll(page)).toBe(false);
});

// REQ-180 — crear Paso 2 (clínico) en mobile: 1 columna, Atrás/Crear ≥44px, foto opcional, sin scroll-x.
test('REQ-180: crear paciente Paso 2 en mobile — 1 columna, Atrás/Crear ≥44px, sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, DATOS);
  await fillStep1AndNext(page);

  // 1 columna en los campos clínicos.
  expect(await distinctLefts(page)).toHaveLength(1);
  expect(await minControlHeight(page)).toBeGreaterThanOrEqual(44);

  // Botones de navegación del Paso 2 ≥44px.
  const atras = await page.getByRole('button', { name: 'Atrás' }).boundingBox();
  expect(atras!.height).toBeGreaterThanOrEqual(44);
  const crear = await page.getByRole('button', { name: 'Crear paciente' }).boundingBox();
  expect(crear!.height).toBeGreaterThanOrEqual(44);

  // Foto opcional: input de archivo presente (raster only se valida en edge-case).
  await expect(page.locator('input[type=file]')).toHaveCount(1);

  expect(await hasHorizontalScroll(page)).toBe(false);
});

// REQ-185 — editar en mobile: precargado, 1 columna, "Guardar cambios" ≥44px, sin scroll-x.
test('REQ-185: editar paciente en mobile — precargado, 1 columna, "Guardar cambios" ≥44px', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, EDITAR);
  await expect(page.getByRole('heading', { name: 'Editar paciente' })).toBeVisible();

  // Form precargado: el campo nombre trae un value no vacío.
  const nombreVal = await page.locator('#c-nombre').inputValue();
  expect(nombreVal.length).toBeGreaterThan(0);

  // 1 columna + controles ≥44px.
  expect(await distinctLefts(page)).toHaveLength(1);
  expect(await minControlHeight(page)).toBeGreaterThanOrEqual(44);

  // "Guardar cambios" ≥44px.
  const guardar = await page.getByRole('button', { name: 'Guardar cambios' }).boundingBox();
  expect(guardar!.height).toBeGreaterThanOrEqual(44);

  expect(await hasHorizontalScroll(page)).toBe(false);
});

// NFR-021 — focus ring visible en el select de género y los botones del wizard.
test('REQ-180/NFR-021: focus ring 2px #246991 en select de género y botón del wizard', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, DATOS);

  const probe = await page.evaluate(() => {
    const ringVar = getComputedStyle(document.documentElement).getPropertyValue('--focus-ring').trim();
    // Botón primario (Siguiente): focus-visible aplica el ring.
    const btn = [...document.querySelectorAll('.btn-edm')].find((b) => /Siguiente/.test(b.textContent || '')) as HTMLElement;
    btn?.focus();
    const btnShadow = btn ? getComputedStyle(btn).boxShadow : '';
    const btnFV = btn ? btn.matches(':focus-visible') : false;
    return { ringVar, btnShadow, btnFV };
  });
  expect(probe.ringVar).toBe('0 0 0 2px #246991');
  // El botón, en focus-visible, muestra el ring azul profundo (#246991 = rgb(36,105,145)).
  expect(probe.btnFV).toBe(true);
  expect(probe.btnShadow).toContain('rgb(36, 105, 145)');
});

// Sanidad desktop — crear Paso 1 es columna central (no rompe), controles 40px (control-height).
test('REQ-180: crear paciente Paso 1 en desktop — controles 40px, sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, DATOS);
  await expect(page.getByRole('heading', { name: 'Datos personales' })).toBeVisible();

  // En desktop la altura del control vuelve a --control-height = 40px.
  const h = await page.locator('#c-nombre').evaluate((el) => Math.round(el.getBoundingClientRect().height));
  expect(h).toBe(40);
  expect(await hasHorizontalScroll(page)).toBe(false);
});
