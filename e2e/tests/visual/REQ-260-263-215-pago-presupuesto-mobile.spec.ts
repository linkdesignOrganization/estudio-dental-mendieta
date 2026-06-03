import { test, expect, Page } from '@playwright/test';
import { warmSeed, gotoApp } from '../_helpers/seed';

/**
 * Visual Checker — Iteración 5 (Pago con fecha + Presupuesto detalle, mobile), Ronda 1.
 *
 * FOCO del plan (la persistencia/saldo E2E es del Flow Tester; aquí va la UI/visual):
 *  · REQ-260 (UI de la fecha) — `#pay-date` es `<input type="date">` con
 *      `label[for="pay-date"]` "Fecha" y `[max]="2026-06-01"` (no permite fechas futuras);
 *      valor inicial poblado (= hoy del viewcase).
 *  · REQ-263 (DC-087/DC-088/NFR-022) — el form de REGISTRAR PAGO en mobile (<768px):
 *      campos en 1 columna; `#pay-date`, `#pay-amount`, "Confirmar pago" y "Cancelar"
 *      con boundingBox ≥44px; botones full-width en `column-reverse` (primaria arriba);
 *      sin scroll horizontal.
 *  · REQ-215 (DC-045/DC-088) — el DETALLE DE PRESUPUESTO en mobile: 1 columna, sin scroll
 *      horizontal, acción primaria "Aprobar presupuesto" y secundaria "Rechazar" ≥44px
 *      y accesibles (`.bdet__actions` en `column-reverse`).
 *  · Anti-demo (REQ-272): copy del form de pago y del detalle de presupuesto.
 *
 * Contrato verificado EN VIVO (2026-06-03) contra el SWA desplegado:
 *   - /pacientes/pac-001/pagos/nuevo: #pay-date type=date max="2026-06-01" value="2026-06-01"
 *     label "Fecha"; #pay-amount type=number min=1. En 390px: #pay-date 294×44, #pay-amount
 *     294×44, "Confirmar pago" 294×44 (y≈675), "Cancelar" 294×44 (y≈731), column-reverse,
 *     scrollWidth==innerWidth==390.
 *   - /facturacion/presupuestos/pre-008 (P-00125, PENDIENTE): article.surface-card.is-lg.bdet
 *     radius 14px; .bdet__patient-link → /pacientes/pac-012; "Válido hasta el 23/06/2026";
 *     2 .bdet__section-title (Tratamientos incluidos / Condiciones). En 390px: "Aprobar
 *     presupuesto" 294×44, "Rechazar" 294×44, .bdet__actions column-reverse, sin scroll-x.
 */

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };
const HOY = '2026-06-01'; // hoy del viewcase

const PAGO_NUEVO = '/pacientes/pac-001/pagos/nuevo';
const PRESU_PENDIENTE = '/facturacion/presupuestos/pre-008';

const ANTI_DEMO = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ── REQ-260: el campo Fecha del pago — type=date, max=hoy, label, valor inicial ──

test('REQ-260: #pay-date es <input type="date"> con label "Fecha", max=hoy y valor inicial poblado', async ({ page }) => {
  await page.setViewportSize(DESKTOP);
  await gotoApp(page, PAGO_NUEVO);

  const date = page.locator('#pay-date');
  await expect(date).toBeVisible();

  const meta = await page.evaluate(() => {
    const el = document.querySelector('#pay-date') as HTMLInputElement | null;
    const label = document.querySelector('label[for="pay-date"]');
    return el ? {
      type: el.getAttribute('type'),
      max: el.getAttribute('max'),
      value: el.value,
      labelText: label?.textContent?.trim(),
      hasLabelFor: !!label,
    } : null;
  });

  expect(meta, '#pay-date no existe').not.toBeNull();
  expect(meta!.type, '#pay-date no es type=date').toBe('date');
  expect(meta!.hasLabelFor, 'falta label[for="pay-date"]').toBe(true);
  expect(meta!.labelText).toBe('Fecha');
  // max = hoy → no permite fechas futuras.
  expect(meta!.max, '#pay-date sin max=hoy (permitiría fechas futuras)').toBe(HOY);
  // valor inicial poblado con hoy.
  expect(meta!.value, '#pay-date sin valor inicial').toBe(HOY);
});

// ── REQ-263: form de pago en mobile — 1 columna, touch ≥44px, sin scroll-x ───────

test('REQ-263: registrar pago en mobile — campos 1 col, #pay-date/montos/botones ≥44px, column-reverse, sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, PAGO_NUEVO);
  await expect(page.getByRole('heading', { level: 2, name: 'Registrar pago' })).toBeVisible();

  // Touch targets ≥44px: #pay-date, #pay-amount, "Confirmar pago", "Cancelar".
  const date = page.locator('#pay-date');
  const amount = page.locator('#pay-amount');
  const confirmar = page.getByRole('button', { name: 'Confirmar pago' });
  const cancelar = page.getByRole('button', { name: 'Cancelar' });

  for (const [name, loc] of [
    ['#pay-date', date], ['#pay-amount', amount], ['Confirmar pago', confirmar], ['Cancelar', cancelar],
  ] as const) {
    const box = await loc.boundingBox();
    expect(box, `${name} sin boundingBox`).not.toBeNull();
    expect(box!.height, `${name} alto <44px (${Math.round(box!.height)})`).toBeGreaterThanOrEqual(44);
  }

  // Layout: 1 columna (campos full-width apilados) + botones full-width en column-reverse.
  const layout = await page.evaluate(() => {
    const r = (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      return el ? el.getBoundingClientRect() : null;
    };
    const dateB = r('#pay-date');
    const amountB = r('#pay-amount');
    const confirmEl = [...document.querySelectorAll('button')].find((b) => /Confirmar pago/.test(b.textContent || ''));
    const cancelEl = [...document.querySelectorAll('button')].find((b) => /^Cancelar/.test((b.textContent || '').trim()));
    const confirmB = confirmEl?.getBoundingClientRect() || null;
    const cancelB = cancelEl?.getBoundingClientRect() || null;
    const actions = (confirmEl?.parentElement) as HTMLElement | null;
    return {
      // campos apilados verticalmente (date debajo de amount): misma x, distinta y
      fieldsStacked: dateB && amountB ? Math.abs(dateB.x - amountB.x) < 2 && dateB.y > amountB.y : false,
      flexDir: actions ? getComputedStyle(actions).flexDirection : '',
      confirmFullWidth: confirmB ? confirmB.width / window.innerWidth > 0.7 : false,
      cancelFullWidth: cancelB ? cancelB.width / window.innerWidth > 0.7 : false,
      // column-reverse → primaria (Confirmar) visualmente ARRIBA de la secundaria (Cancelar)
      confirmAboveCancel: confirmB && cancelB ? confirmB.y < cancelB.y : false,
    };
  });

  expect(layout.fieldsStacked, 'los campos no están en 1 columna apilada').toBe(true);
  expect(layout.flexDir, 'los botones no usan column-reverse en mobile').toBe('column-reverse');
  expect(layout.confirmFullWidth, '"Confirmar pago" no es full-width en mobile').toBe(true);
  expect(layout.cancelFullWidth, '"Cancelar" no es full-width en mobile').toBe(true);
  expect(layout.confirmAboveCancel, 'la acción primaria no queda arriba (column-reverse)').toBe(true);

  // Sin scroll horizontal.
  expect(await hasHorizontalScroll(page)).toBe(false);

  // Anti-demo en el copy del form.
  const mainTxt = (await page.locator('main').textContent()) || '';
  expect(ANTI_DEMO.test(mainTxt), 'el copy del form de pago delata el mock').toBe(false);
});

// ── REQ-215: detalle de presupuesto en mobile — 1 col, acciones ≥44px, sin scroll-x ──

test('REQ-215: detalle de presupuesto en mobile — 1 columna, acción primaria/secundaria ≥44px, sin scroll horizontal', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await gotoApp(page, PRESU_PENDIENTE);
  // Esperar el detalle hidratado (markup real, no skeleton).
  await expect(page.locator('.bdet__section-title').first()).toBeVisible();

  // Es el detalle correcto (pendiente): muestra "Válido hasta el" + secciones + acciones.
  await expect(page.getByText('Válido hasta el', { exact: false })).toBeVisible();
  await expect(page.locator('.bdet__section-title')).toHaveCount(2); // Tratamientos incluidos / Condiciones

  const aprobar = page.getByRole('button', { name: 'Aprobar presupuesto' });
  const rechazar = page.getByRole('button', { name: 'Rechazar' });
  await expect(aprobar).toBeVisible();
  await expect(rechazar).toBeVisible();

  // Touch targets ≥44px de las dos acciones.
  for (const [name, loc] of [['Aprobar presupuesto', aprobar], ['Rechazar', rechazar]] as const) {
    const box = await loc.boundingBox();
    expect(box, `${name} sin boundingBox`).not.toBeNull();
    expect(box!.height, `${name} alto <44px (${Math.round(box!.height)})`).toBeGreaterThanOrEqual(44);
  }

  // 1 columna: la card del detalle ocupa el ancho y las acciones se apilan (column-reverse,
  // primaria "Aprobar" arriba de la secundaria "Rechazar").
  const layout = await page.evaluate(() => {
    const actions = document.querySelector('.bdet__actions') as HTMLElement | null;
    const aprobarEl = [...document.querySelectorAll('button')].find((b) => /Aprobar presupuesto/.test(b.textContent || ''));
    const rechazarEl = [...document.querySelectorAll('button')].find((b) => /^Rechazar/.test((b.textContent || '').trim()));
    const aB = aprobarEl?.getBoundingClientRect() || null;
    const rB = rechazarEl?.getBoundingClientRect() || null;
    const card = document.querySelector('main article.bdet') as HTMLElement | null;
    return {
      flexDir: actions ? getComputedStyle(actions).flexDirection : '',
      aprobarFullWidth: aB ? aB.width / window.innerWidth > 0.7 : false,
      aprobarAboveRechazar: aB && rB ? aB.y < rB.y : false,
      cardRadius: card ? getComputedStyle(card).borderRadius : '',
      cardNearFullWidth: card ? card.getBoundingClientRect().width / window.innerWidth > 0.85 : false,
    };
  });

  expect(layout.flexDir, '.bdet__actions no usa column-reverse en mobile').toBe('column-reverse');
  expect(layout.aprobarFullWidth, '"Aprobar presupuesto" no es full-width en mobile').toBe(true);
  expect(layout.aprobarAboveRechazar, 'la acción primaria no queda arriba (column-reverse)').toBe(true);
  expect(layout.cardNearFullWidth, 'la card del detalle no ocupa 1 columna (ancho completo)').toBe(true);
  // Card grande: radius ∈ [10,14] (DC-024).
  const rpx = parseFloat(layout.cardRadius);
  expect(rpx).toBeGreaterThanOrEqual(10);
  expect(rpx).toBeLessThanOrEqual(14);

  // Sin scroll horizontal.
  expect(await hasHorizontalScroll(page)).toBe(false);

  // El link al paciente está presente (REQ-211 — navegación verificada por el Flow Tester).
  await expect(page.locator('.bdet__patient-link')).toBeVisible();

  // Anti-demo en el copy del detalle.
  const mainTxt = (await page.locator('main').textContent()) || '';
  expect(ANTI_DEMO.test(mainTxt), 'el copy del detalle de presupuesto delata el mock').toBe(false);
});
