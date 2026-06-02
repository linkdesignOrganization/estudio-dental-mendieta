import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed, resetSeed } from '../_helpers/seed';

/**
 * Iteración 3 (Agenda) · Edge Case Tester · Ronda 1.
 *
 * REQ-063 — Panel de "Filtros" SECUNDARIO de la Agenda (anti-patrón de UI).
 *   Los filtros de **estado** y **tipo de tratamiento** NO están permanentemente
 *   visibles: de entrada sólo se ve el botón "Filtros" (el panel `.filters__panel`
 *   NO existe en el DOM). Al pulsarlo se abre el panel; aplicar un filtro reduce el
 *   calendario de forma coherente; una combinación sin match cae en el empty-state
 *   con guidance; "Limpiar filtros" restaura el calendario completo.
 *
 *   OJO — es la AGENDA (`calendar.component.ts`, `group "Filtros de la agenda"`),
 *   NO la lista de Pacientes (esa la cubre `REQ-101-filtros-pacientes.spec.ts`).
 *
 * Edge cases cubiertos:
 *   (a) anti-patrón: el panel NO está visible de entrada; sólo el botón "Filtros"
 *       (aria-expanded=false; los selects `#f-estado`/`#f-tipo` no existen en el DOM).
 *   (b) abrir/cerrar el panel con el botón (toggle).
 *   (c) filtrar por ESTADO reduce el nº de turnos del calendario de forma coherente.
 *   (d) combinar ESTADO + TIPO acumula el badge ("2") y reduce más aún.
 *   (e) combinación SIN match → empty-state "No hay turnos en este período" con guidance.
 *   (f) "Limpiar filtros" (deshabilitado sin filtros) restaura el calendario completo.
 *   (g) mobile: el panel sigue siendo usable y los controles touch ≥44px.
 *
 * Datos del seed (deterministas, verificados en vivo contra el deploy, vista MES = Junio 2026):
 *   · Junio tiene turnos en varios estados (confirmado/atendiendo/en-espera/cancelado).
 *   · Combinación SIN match en Junio: Estado "Atendiendo" + Tipo "Extracción simple" → 0 turnos
 *     (los "atendiendo" del seed son sólo tt-07/tt-14/tt-02/tt-11, nunca tt-05) → empty-state.
 *   · Se parte de un seed FRESCO (resetSeed) para que los conteos sean deterministas aunque
 *     otros specs (reagendar) hayan mutado el estado persistido.
 *
 * Copy del empty-state verificado en vivo (vista MES, `app-empty-state`):
 *   heading "No hay turnos en este período"
 *   guidance "Creá uno con Nuevo turno para empezar a llenar la agenda."
 */

const EMPTY_HEADING = 'No hay turnos en este período';
const EMPTY_GUIDANCE = /Creá uno con Nuevo turno/;
const MIN_TOUCH = 44;

/** El panel de filtros de la AGENDA (grupo) — sólo existe en el DOM cuando está abierto. */
function panelFiltros(page: Page) {
  return page.getByRole('group', { name: 'Filtros de la agenda' });
}

/** El botón "Filtros" (su label lleva el badge "Filtros N" cuando hay filtros activos). */
function btnFiltros(page: Page) {
  return page.getByRole('button', { name: /^Filtros\b/ });
}

/** Nº de bloques de turno renderizados en la grilla mensual (`a.capt`, excluye "+N más"). */
function turnoBlocks(page: Page) {
  return page.locator('.cal__grid a.capt');
}

/** Abre el panel de filtros si no está abierto. */
async function abrirFiltros(page: Page): Promise<void> {
  const btn = btnFiltros(page);
  if ((await btn.getAttribute('aria-expanded')) !== 'true') {
    await btn.click();
  }
  await expect(panelFiltros(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
  // Seed FRESCO: otros specs (reagendar) mutan el estado persistido; reseteamos para
  // que los conteos del calendario sean deterministas. La vista MES es el default desktop;
  // en mobile forzamos ?vista=mes para testear el calendario (la grilla con los filtros).
  await resetSeed(page, '/agenda?vista=mes');
});

// ───────────────────────────────────────────────────────────────────────────
// (a) Anti-patrón: el panel NO está permanentemente visible
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-063 — de entrada los filtros secundarios NO están en pantalla; existe el botón
// "Filtros" (aria-expanded=false). El select de PROFESIONAL del header NO es parte del panel
// secundario (ese sí es permanente, por diseño) — el anti-patrón aplica a estado/tipo.
test('REQ-063: el panel de filtros (estado/tipo) NO está visible por defecto; sólo el botón "Filtros"', async ({ page }) => {
  await gotoApp(page, '/agenda?vista=mes');
  // El calendario mensual está montado.
  await expect(page.locator('.cal__grid')).toBeVisible();

  const btn = btnFiltros(page);
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');

  // Anti-patrón REQ-063: los controles de estado/tipo NO están en el DOM de entrada.
  await expect(panelFiltros(page)).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Estado' })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Tipo de tratamiento' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Limpiar filtros' })).toHaveCount(0);

  // Sin filtros activos, el botón no muestra badge de conteo.
  await expect(btn).toHaveAccessibleName('Filtros');
});

// test: REQ-063 — el botón "Filtros" abre y cierra el panel (toggle); al abrir aparecen las
// DOS dimensiones (estado + tipo) y "Limpiar filtros"; al cerrar el panel deja de existir.
test('REQ-063: el botón "Filtros" abre/cierra el panel con estado + tipo de tratamiento', async ({ page }) => {
  await gotoApp(page, '/agenda?vista=mes');
  const btn = btnFiltros(page);

  // Abrir.
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(panelFiltros(page)).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Estado' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Tipo de tratamiento' })).toBeVisible();
  // "Limpiar filtros" existe pero está deshabilitado mientras no haya filtros activos.
  await expect(page.getByRole('button', { name: 'Limpiar filtros' })).toBeDisabled();

  // Cerrar → el panel deja de existir en el DOM (no sólo oculto).
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(panelFiltros(page)).toHaveCount(0);
});

// ───────────────────────────────────────────────────────────────────────────
// (b) Aplicar un filtro reduce el calendario de forma coherente
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-063 — filtrar por ESTADO reduce los turnos del calendario; el badge del botón
// refleja 1 filtro activo. Usamos "Cancelado" (subconjunto pequeño y estricto del total).
test('REQ-063: filtrar por estado (Cancelado) reduce el calendario y activa el badge (1)', async ({ page }) => {
  await gotoApp(page, '/agenda?vista=mes');
  await expect(turnoBlocks(page).first()).toBeVisible();
  const total = await turnoBlocks(page).count();
  expect(total).toBeGreaterThan(0);

  await abrirFiltros(page);
  await page.getByRole('combobox', { name: 'Estado' }).selectOption('Cancelado');

  // El subconjunto es no vacío y estrictamente menor que el total (coherente).
  await expect.poll(async () => turnoBlocks(page).count(), { timeout: 10_000 }).toBeLessThan(total);
  const cancelados = await turnoBlocks(page).count();
  expect(cancelados).toBeGreaterThan(0);

  // Todos los bloques restantes corresponden a turnos "Cancelado" (criterio cumplido).
  const blocks = turnoBlocks(page);
  for (let i = 0; i < cancelados; i++) {
    await expect(blocks.nth(i)).toHaveAttribute('aria-label', /Cancelado/);
  }

  // Un filtro activo → badge "1".
  await expect(btnFiltros(page)).toHaveAccessibleName(/Filtros\s*1/);
});

// test: REQ-063 — combinar ESTADO + TIPO acumula el badge ("2") y reduce más aún.
// Confirmado + Odontopediatría (tt-15) es un subconjunto estricto de "Confirmado".
test('REQ-063: combinar estado + tipo acumula el badge (2) y reduce más el calendario', async ({ page }) => {
  await gotoApp(page, '/agenda?vista=mes');
  await abrirFiltros(page);

  await page.getByRole('combobox', { name: 'Estado' }).selectOption('Confirmado');
  await expect(turnoBlocks(page).first()).toBeVisible();
  const soloEstado = await turnoBlocks(page).count();
  expect(soloEstado).toBeGreaterThan(0);
  await expect(btnFiltros(page)).toHaveAccessibleName(/Filtros\s*1/);

  await page.getByRole('combobox', { name: 'Tipo de tratamiento' }).selectOption('Odontopediatría');
  // Subconjunto: estado+tipo ≤ sólo-estado (acumulan, no se reemplazan).
  await expect.poll(async () => turnoBlocks(page).count(), { timeout: 10_000 }).toBeLessThanOrEqual(soloEstado);
  const combinado = await turnoBlocks(page).count();
  expect(combinado).toBeGreaterThan(0);

  // Dos filtros activos → badge "2".
  await expect(btnFiltros(page)).toHaveAccessibleName(/Filtros\s*2/);
});

// ───────────────────────────────────────────────────────────────────────────
// (c) Combinación sin match → empty-state con guidance
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-063 — una combinación de filtros sin turnos cae en el empty-state con guidance
// (no en una grilla muda). Combo determinista en Junio: Atendiendo + Extracción simple = 0.
test('REQ-063: una combinación estado+tipo sin match muestra el empty-state con guidance (0 turnos)', async ({ page }) => {
  await gotoApp(page, '/agenda?vista=mes');
  await abrirFiltros(page);

  await page.getByRole('combobox', { name: 'Estado' }).selectOption('Atendiendo');
  await page.getByRole('combobox', { name: 'Tipo de tratamiento' }).selectOption('Extracción simple');

  // 0 bloques de turno en la grilla y empty-state con guidance visible.
  await expect.poll(async () => turnoBlocks(page).count(), { timeout: 10_000 }).toBe(0);
  await expect(page.getByRole('heading', { name: EMPTY_HEADING })).toBeVisible();
  await expect(page.getByText(EMPTY_GUIDANCE)).toBeVisible();

  // Dos filtros activos siguen reflejados en el badge.
  await expect(btnFiltros(page)).toHaveAccessibleName(/Filtros\s*2/);
});

// ───────────────────────────────────────────────────────────────────────────
// (d) Limpiar filtros restaura el calendario
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-063 — "Limpiar filtros" restaura el calendario completo y resetea el badge;
// tras limpiar, el botón "Limpiar filtros" vuelve a estar deshabilitado.
test('REQ-063: "Limpiar filtros" restaura el calendario completo y resetea el badge', async ({ page }) => {
  await gotoApp(page, '/agenda?vista=mes');
  await expect(turnoBlocks(page).first()).toBeVisible();
  const total = await turnoBlocks(page).count();

  await abrirFiltros(page);
  // Llevar a 0 con el combo sin match para tener un delta claro.
  await page.getByRole('combobox', { name: 'Estado' }).selectOption('Atendiendo');
  await page.getByRole('combobox', { name: 'Tipo de tratamiento' }).selectOption('Extracción simple');
  await expect(page.getByRole('heading', { name: EMPTY_HEADING })).toBeVisible();
  await expect(btnFiltros(page)).toHaveAccessibleName(/Filtros\s*2/);

  // Limpiar → calendario completo restaurado, sin badge, botón "Limpiar" deshabilitado.
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect.poll(async () => turnoBlocks(page).count(), { timeout: 10_000 }).toBe(total);
  await expect(page.getByRole('heading', { name: EMPTY_HEADING })).toHaveCount(0);
  await expect(btnFiltros(page)).toHaveAccessibleName('Filtros');
  await expect(page.getByRole('button', { name: 'Limpiar filtros' })).toBeDisabled();
});

// ───────────────────────────────────────────────────────────────────────────
// (e) Mobile: el panel sigue usable y los controles son touch-friendly (≥44px)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-063 — en mobile el botón "Filtros" tiene altura touch ≥44px (DC-086) y el panel
// abre con las mismas dos dimensiones. Sólo corre en el project mobile (viewport real Pixel 5).
test('REQ-063: en mobile el botón "Filtros" es touch ≥44px y el panel abre con estado + tipo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'caso específico de viewport mobile');
  await gotoApp(page, '/agenda?vista=mes');

  const btn = btnFiltros(page);
  await expect(btn).toBeVisible();
  const box = await btn.boundingBox();
  expect(box, 'el botón Filtros debe tener bounding box').not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH);

  await btn.click();
  await expect(panelFiltros(page)).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Estado' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Tipo de tratamiento' })).toBeVisible();
});
