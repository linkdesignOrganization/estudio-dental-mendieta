import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Iteración 2 (Pacientes — ficha a fondo) · Edge Case Tester · Ronda 1.
 *
 * REQ-101 — Lista de pacientes: el panel de FILTROS (obra social / profesional /
 * rango de edad) NO está permanentemente visible; se abre vía un botón "Filtros",
 * aplica el filtro y reduce el listado de forma coherente; si la combinación no
 * arroja resultados, cae en el empty-state con guidance. Edge cases cubiertos:
 *   (a) anti-patrón: los filtros NO están visibles de entrada (sólo el botón "Filtros").
 *   (b) cada dimensión filtra y reduce el listado de forma coherente (contador + filas).
 *   (c) combinación sin match → empty-state "No encontramos pacientes con ese criterio".
 *   (d) limpiar los filtros restaura el listado completo del seed.
 *   (e) mobile: el panel sigue siendo usable (touch targets ≥44px).
 *
 * Datos del seed (deterministas, verificados en vivo contra el deploy):
 *   · Total: 29 pacientes ("29 pacientes en el sistema").
 *   · Obra social "OSDE" → 4 pacientes (Bautista Álvarez, León Fernández, Sofía Bianchi,
 *     Isabella Pérez); todas las filas muestran "OSDE".
 *   · Profesional "Dra. Carolina Etcheverry" → 3 pacientes.
 *   · Combinación SIN match: obra social "Particular" + rango "Niños (0–12)" → 0 resultados
 *     → empty-state.
 *
 * Copy del empty-state verificado en vivo (mismo que la búsqueda sin match, UX-045):
 *   heading "No encontramos pacientes con ese criterio"
 *   guidance "Probá con otro nombre o ajustá los filtros para ver más resultados."
 */

const EMPTY_HEADING = 'No encontramos pacientes con ese criterio';
const EMPTY_GUIDANCE = /Probá con otro nombre o ajustá los filtros/;
const MIN_TOUCH = 44;

/** El panel de filtros (grupo) — sólo existe en el DOM cuando está abierto. */
function panelFiltros(page: Page) {
  return page.getByRole('group', { name: 'Filtros de pacientes' });
}

/** Lee el contador "N pacientes en el sistema" como número. */
async function contadorPacientes(page: Page): Promise<number> {
  const txt = await page.getByText(/\d+ pacientes en el sistema/).innerText();
  return parseInt(txt.replace(/\D/g, ''), 10);
}

/** Abre el panel de filtros (botón "Filtros", su label puede llevar el badge "Filtros N"). */
async function abrirFiltros(page: Page): Promise<void> {
  const btn = page.getByRole('button', { name: /^Filtros\b/ });
  if ((await btn.getAttribute('aria-expanded')) !== 'true') {
    await btn.click();
  }
  await expect(panelFiltros(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ───────────────────────────────────────────────────────────────────────────
// (a) Anti-patrón: el panel NO está permanentemente visible
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-101 — de entrada los filtros NO están visibles; existe un botón "Filtros"
// (aria-expanded=false). Al pulsarlo se abre el panel (aria-expanded=true) y aparecen
// las 3 dimensiones. Al volver a pulsarlo, se cierra.
test('REQ-101: el panel de filtros NO está visible por defecto; se abre/cierra con el botón "Filtros"', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await expect(page.getByText('29 pacientes en el sistema')).toBeVisible();

  // Anti-patrón REQ-101: los controles de filtro NO están en pantalla de entrada.
  const btn = page.getByRole('button', { name: /^Filtros\b/ });
  await expect(btn).toBeVisible();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(panelFiltros(page)).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Obra social' })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Profesional' })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Rango de edad' })).toHaveCount(0);

  // Abrir → aparecen las 3 dimensiones.
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(panelFiltros(page)).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Obra social' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Profesional' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Rango de edad' })).toBeVisible();

  // Cerrar → vuelve a ocultarse (el panel deja de existir en el DOM).
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(panelFiltros(page)).toHaveCount(0);
});

// ───────────────────────────────────────────────────────────────────────────
// (b) Cada dimensión reduce el listado de forma coherente
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-101 — filtro por OBRA SOCIAL: reduce el listado y todas las filas restantes
// cumplen el criterio. El botón "Filtros" expone un badge con el nº de filtros activos.
test('REQ-101: filtrar por obra social (OSDE) reduce el listado y todas las filas cumplen el criterio', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  expect(await contadorPacientes(page)).toBe(29);

  await abrirFiltros(page);
  await page.getByRole('combobox', { name: 'Obra social' }).selectOption('OSDE');

  // El contador se reduce de forma coherente (OSDE → 4 en el seed).
  await expect(page.getByText('4 pacientes en el sistema')).toBeVisible();
  expect(await contadorPacientes(page)).toBe(4);

  // El botón muestra el badge de filtros activos (1).
  await expect(page.getByRole('button', { name: /^Filtros\b/ })).toHaveAccessibleName(/Filtros\s*1/);

  // Todas las filas/cards VISIBLES corresponden a OSDE (criterio cumplido, no filas viejas).
  const filasOSDE = page.locator('[aria-label^="Ver ficha de"]').filter({ visible: true });
  await expect(filasOSDE).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(filasOSDE.nth(i)).toContainText('OSDE');
  }
  // Pacientes esperados del seed (determinista).
  await expect(page.locator('[aria-label="Ver ficha de Bautista Álvarez"]').filter({ visible: true })).toBeVisible();
  await expect(page.locator('[aria-label="Ver ficha de Isabella Pérez"]').filter({ visible: true })).toBeVisible();
});

// test: REQ-101 — filtro por PROFESIONAL: reduce el listado de forma coherente.
test('REQ-101: filtrar por profesional (Dra. Carolina Etcheverry) reduce el listado', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  expect(await contadorPacientes(page)).toBe(29);

  await abrirFiltros(page);
  await page.getByRole('combobox', { name: 'Profesional' }).selectOption('Dra. Carolina Etcheverry');

  // Determinista en el seed: 3 pacientes de cabecera de esa profesional.
  await expect(page.getByText('3 pacientes en el sistema')).toBeVisible();
  expect(await contadorPacientes(page)).toBe(3);
  await expect(page.locator('[aria-label^="Ver ficha de"]').filter({ visible: true })).toHaveCount(3);
  // El badge refleja 1 filtro activo.
  await expect(page.getByRole('button', { name: /^Filtros\b/ })).toHaveAccessibleName(/Filtros\s*1/);
});

// test: REQ-101 — filtro por RANGO DE EDAD: reduce el listado (y siempre ≤ total).
test('REQ-101: filtrar por rango de edad reduce el listado de forma coherente', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  const total = await contadorPacientes(page);
  expect(total).toBe(29);

  await abrirFiltros(page);
  await page.getByRole('combobox', { name: 'Rango de edad' }).selectOption('Niños (0–12)');

  // El subconjunto por edad es no vacío y estrictamente menor que el total (coherente).
  const filtrados = await contadorPacientes(page);
  expect(filtrados).toBeGreaterThan(0);
  expect(filtrados).toBeLessThan(total);
  // Las filas visibles coinciden con el contador (sin filas viejas a medio filtrar).
  await expect(page.locator('[aria-label^="Ver ficha de"]').filter({ visible: true })).toHaveCount(filtrados);
});

// test: REQ-101 — COMBINACIÓN de dos dimensiones acumula (badge "2") y reduce más aún.
test('REQ-101: combinar obra social + rango de edad acumula filtros (badge 2) y reduce el listado', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await abrirFiltros(page);

  await page.getByRole('combobox', { name: 'Obra social' }).selectOption('OSDE');
  await expect(page.getByText('4 pacientes en el sistema')).toBeVisible();

  await page.getByRole('combobox', { name: 'Rango de edad' }).selectOption('Niños (0–12)');
  // OSDE ∩ Niños(0–12) = 3 en el seed (subconjunto de los 4 de OSDE).
  const filtrados = await contadorPacientes(page);
  expect(filtrados).toBeGreaterThan(0);
  expect(filtrados).toBeLessThanOrEqual(4);
  // Dos filtros activos → badge "2".
  await expect(page.getByRole('button', { name: /^Filtros\b/ })).toHaveAccessibleName(/Filtros\s*2/);
  // Coherencia: las filas visibles siguen siendo todas OSDE.
  const filas = page.locator('[aria-label^="Ver ficha de"]').filter({ visible: true });
  await expect(filas).toHaveCount(filtrados);
  for (let i = 0; i < filtrados; i++) {
    await expect(filas.nth(i)).toContainText('OSDE');
  }
});

// ───────────────────────────────────────────────────────────────────────────
// (c) Combinación sin match → empty-state con guidance
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-101 — una combinación de filtros sin resultados cae en el empty-state con
// guidance (no en una tabla vacía ambigua). Combo determinista: Particular + Niños(0–12).
test('REQ-101: una combinación de filtros sin match muestra el empty-state con guidance (0 resultados)', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await abrirFiltros(page);

  await page.getByRole('combobox', { name: 'Obra social' }).selectOption('Particular');
  await page.getByRole('combobox', { name: 'Rango de edad' }).selectOption('Niños (0–12)');

  // Contador a 0 y empty-state visible con su guidance.
  await expect(page.getByText('0 pacientes en el sistema')).toBeVisible();
  await expect(page.getByRole('heading', { name: EMPTY_HEADING })).toBeVisible();
  await expect(page.getByText(EMPTY_GUIDANCE)).toBeVisible();
  // No quedan filas a medio renderizar.
  await expect(page.locator('[aria-label^="Ver ficha de"]').filter({ visible: true })).toHaveCount(0);
  // Y el badge refleja los 2 filtros aplicados.
  await expect(page.getByRole('button', { name: /^Filtros\b/ })).toHaveAccessibleName(/Filtros\s*2/);
});

// ───────────────────────────────────────────────────────────────────────────
// (d) Limpiar los filtros restaura el listado completo
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-101 — "Limpiar filtros" está deshabilitado sin filtros activos, se habilita
// al aplicar uno, y al pulsarlo restaura el listado completo del seed (29) reseteando las
// 3 dimensiones a "Todas/Todos". El empty-state previo NO "pega".
test('REQ-101: limpiar filtros restaura el listado completo (29) y resetea las dimensiones', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await abrirFiltros(page);

  const limpiar = page.getByRole('button', { name: 'Limpiar filtros' });
  // Sin filtros activos → deshabilitado.
  await expect(limpiar).toBeDisabled();

  // Llevamos el listado a 0 (empty-state) y luego limpiamos.
  await page.getByRole('combobox', { name: 'Obra social' }).selectOption('Particular');
  await page.getByRole('combobox', { name: 'Rango de edad' }).selectOption('Niños (0–12)');
  await expect(page.getByRole('heading', { name: EMPTY_HEADING })).toBeVisible();
  await expect(limpiar).toBeEnabled();

  await limpiar.click();

  // Listado completo restaurado, sin empty-state pegado.
  await expect(page.getByText('29 pacientes en el sistema')).toBeVisible();
  await expect(page.getByRole('heading', { name: EMPTY_HEADING })).toHaveCount(0);
  // Dimensiones reseteadas a "Todas/Todos".
  await expect(page.getByRole('combobox', { name: 'Obra social' })).toHaveValue(/Todas|^$/i);
  await expect(page.getByRole('combobox', { name: 'Rango de edad' })).toHaveValue(/Todas|^$/i);
  // Y "Limpiar filtros" vuelve a estar deshabilitado (no hay filtros activos).
  await expect(limpiar).toBeDisabled();
  // El badge de filtros activos desaparece (botón vuelve a su nombre base).
  await expect(page.getByRole('button', { name: /^Filtros\b/ })).toHaveAccessibleName(/^Filtros$/);
});

// ───────────────────────────────────────────────────────────────────────────
// (e) Mobile: el panel sigue siendo usable (touch targets ≥44px)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-101 — en MOBILE el panel de filtros se abre, sus controles tienen touch
// target ≥44px y el filtro reduce el listado igual que en desktop.
//
// HALLAZGO (no es bug): el contrato de touch target ≥44px es una exigencia MOBILE. En
// desktop los controles son más compactos (botón "Filtros" ≈40px) — patrón responsive
// correcto. Por eso la aserción de los 44px se aplica SÓLO al project mobile; en desktop
// se verifica que el panel sea usable (controles visibles + filtro funcional) sin imponer
// la regla mobile.
test('REQ-101: el panel de filtros es usable; en mobile los controles cumplen touch target ≥44px', async ({ page }, testInfo) => {
  const esMobile = testInfo.project.name === 'mobile-chromium';
  await gotoApp(page, '/pacientes');

  const btnFiltros = page.getByRole('button', { name: /^Filtros\b/ });
  await expect(btnFiltros).toBeVisible();
  if (esMobile) {
    // El propio botón "Filtros" cumple el touch target en mobile.
    const btnBox = await btnFiltros.boundingBox();
    expect(btnBox, 'el botón Filtros debe tener bounding box').not.toBeNull();
    expect(btnBox!.height, 'el botón Filtros debe ser ≥44px en mobile').toBeGreaterThanOrEqual(MIN_TOUCH);
  }

  await abrirFiltros(page);

  // Cada combobox del panel es usable; en mobile además cumple el touch target ≥44px.
  for (const name of ['Obra social', 'Profesional', 'Rango de edad']) {
    const cb = page.getByRole('combobox', { name });
    await expect(cb).toBeVisible();
    if (esMobile) {
      const box = await cb.boundingBox();
      expect(box, `el combobox "${name}" debe tener bounding box`).not.toBeNull();
      expect(box!.height, `el combobox "${name}" debe ser ≥${MIN_TOUCH}px de alto en mobile`).toBeGreaterThanOrEqual(MIN_TOUCH);
    }
  }

  // El filtro funciona igual en cualquier viewport (reduce a 4 con OSDE).
  await page.getByRole('combobox', { name: 'Obra social' }).selectOption('OSDE');
  await expect(page.getByText('4 pacientes en el sistema')).toBeVisible();
  await expect(page.locator('[aria-label^="Ver ficha de"]').filter({ visible: true })).toHaveCount(4);
});
