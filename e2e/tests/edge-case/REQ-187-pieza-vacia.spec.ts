import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed, openPatient } from '../_helpers/seed';

/**
 * Iteración 2 (Pacientes — ficha a fondo) · Edge Case Tester · Ronda 1.
 *
 * REQ-187 — Detalle de pieza dental: una pieza SANA o AUSENTE (sin procedimientos)
 * muestra el estado vacío explícito, con copy de producción, sin sección en blanco
 * ambigua ni crash. El empty-state es CONDICIONAL: una pieza con historial NO lo
 * muestra (control positivo).
 *
 * Copy de producción verificado en vivo contra el deploy (NO lenguaje de demo):
 *   "Sin procedimientos registrados en esta pieza."
 *
 * Datos del seed (deterministas, verificados en vivo — pac-029 "Cristina Flores"):
 *   · Pieza 11 (FDI cuad.1 pos.1 → "Incisivo central superior derecho") = SANA   → empty-state.
 *   · Pieza 16 (FDI cuad.1 pos.6 → "Primer molar superior derecho")     = AUSENTE → empty-state.
 *   · Pieza 43 (FDI cuad.4 pos.3 → "Canino inferior derecho")           = OBTURACIÓN
 *       → control positivo: 3 ítems reales de historial (Dr. Federico Salinas), NO empty-state.
 *
 * Nota de hidratación (BUG-E04, ya documentado en UX-047): el diagrama del odontograma
 * es un bloque @defer que hidrata al entrar en viewport/idle. Por eso el flujo de usuario
 * (listado → ficha → tab Odontograma → pieza) hace scroll de la pieza a viewport y espera
 * las 32 piezas antes de hacer click. El deep-link directo a /pieza/{fdi} SÍ hidrata el
 * detalle en ambos viewports (no depende del diagrama), por lo que las aserciones del
 * empty-state se hacen sobre el detalle (estable en desktop y mobile).
 */

const COPY_VACIO_PIEZA = 'Sin procedimientos registrados en esta pieza';

// El empty-state NUNCA debe revelar lenguaje de demo/mock (BVC-027 transversal).
const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

/** Localiza la card "Historial de la pieza" (es un <aside>/complementary con ese heading). */
function historialPieza(page: Page) {
  return page
    .locator('aside')
    .filter({ has: page.getByRole('heading', { name: 'Historial de la pieza' }) });
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-187 — pieza SANA: empty-state explícito, sin crash (flujo de usuario real)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-187 — flujo real listado → ficha → odontograma → pieza SANA.
// La pieza sana muestra el copy exacto del estado vacío y la pantalla no crashea
// (header + nombre clínico FDI presentes).
test('REQ-187: una pieza sana muestra el estado vacío "Sin procedimientos…" (flujo de usuario, no crashea)', async ({ page }) => {
  // 1) Listado → buscar al paciente (pac-029 está en la pág. 3 del listado de 29;
  //    el buscador es el camino real del usuario para llegar a él) → 2) ficha.
  await gotoApp(page, '/pacientes');
  await page.getByRole('searchbox', { name: 'Buscar pacientes' }).fill('Cristina Flores');
  await expect(page.getByText('1 pacientes en el sistema')).toBeVisible();
  await openPatient(page, 'Cristina Flores');
  await expect(page).toHaveURL(/\/pacientes\/pac-029(\/informacion)?$/);
  await expect(page.getByRole('heading', { name: 'Cristina Flores', level: 1 })).toBeVisible();

  // 3) Tab Odontograma.
  await page.getByRole('tab', { name: 'Odontograma' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-029\/odontograma$/);
  await expect(page.getByRole('heading', { name: 'Odontograma' })).toBeVisible();

  // El diagrama es @defer: lo traemos a viewport y esperamos las 32 piezas antes del click.
  const piezaSana = page.getByRole('button', { name: 'Pieza 11 (universal 8), Sana' });
  await piezaSana.scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: /^Pieza \d+ \(universal \d+\)/ })).toHaveCount(32);
  await expect(piezaSana).toBeVisible();

  // 4) Click en la pieza SANA.
  await piezaSana.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-029\/pieza\/11$/);

  // (a) NO crashea: nombre clínico FDI en el encabezado (número + nombre real).
  await expect(
    page.getByRole('heading', { name: 'Pieza 11 · Incisivo central superior derecho', level: 2 }),
  ).toBeVisible();
  await expect(page.getByText('Estado actual')).toBeVisible();

  // (b) Estado vacío EXPLÍCITO con el copy de producción exacto, dentro de la card de Historial.
  const historial = historialPieza(page);
  await expect(historial).toBeVisible();
  await expect(historial.getByText(`${COPY_VACIO_PIEZA}.`)).toBeVisible();
  // No hay lista de procedimientos a medio renderizar (la card NO tiene <li> de historial).
  await expect(historial.locator('li')).toHaveCount(0);
});

// test: REQ-187 — el empty-state de la pieza sana NO revela lenguaje de demo/mock.
test('REQ-187: el estado vacío de la pieza sana no revela demo/mock (copy de producción)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-029/pieza/11');
  await expect(
    page.getByRole('heading', { name: 'Pieza 11 · Incisivo central superior derecho', level: 2 }),
  ).toBeVisible();
  await expect(historialPieza(page).getByText(`${COPY_VACIO_PIEZA}.`)).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(DEMO_FORBIDDEN);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-187 — pieza AUSENTE: mismo empty-state, sin crash
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-187 — una pieza AUSENTE (sin procedimientos) cae también en el empty-state,
// con su nombre clínico FDI y sin pantalla en blanco ambigua. Deep-link directo (hidrata
// el detalle en ambos viewports, independiente del diagrama @defer).
test('REQ-187: una pieza ausente muestra el mismo estado vacío "Sin procedimientos…" (no crashea)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-029/pieza/16');

  // Nombre clínico FDI presente → no crashea.
  await expect(
    page.getByRole('heading', { name: 'Pieza 16 · Primer molar superior derecho', level: 2 }),
  ).toBeVisible();
  await expect(page.getByText('Estado actual')).toBeVisible();

  // Empty-state explícito y sin <li> de historial.
  const historial = historialPieza(page);
  await expect(historial.getByText(`${COPY_VACIO_PIEZA}.`)).toBeVisible();
  await expect(historial.locator('li')).toHaveCount(0);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-187 — CONTROL POSITIVO: el empty-state es CONDICIONAL, no permanente
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-187 — una pieza CON historial (Obturación) NO muestra el empty-state, sino
// la lista real de procedimientos. Prueba que el estado vacío es condicional al estado
// de la pieza (no un bloque siempre visible).
test('REQ-187 (control positivo): una pieza con historial NO muestra el estado vacío, muestra la lista real', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-029/pieza/43');

  await expect(
    page.getByRole('heading', { name: 'Pieza 43 · Canino inferior derecho', level: 2 }),
  ).toBeVisible();

  const historial = historialPieza(page);
  await expect(historial).toBeVisible();
  // El copy del estado vacío NO aparece para una pieza con procedimientos.
  await expect(historial.getByText(COPY_VACIO_PIEZA)).toHaveCount(0);

  // Hay una lista REAL de procedimientos (≥1 ítem) con fecha + profesional real.
  const items = historial.locator('li');
  await expect(items.first()).toBeVisible();
  expect(await items.count()).toBeGreaterThan(0);
  // Coherencia con el seed: cada ítem lleva fecha (dd/mm/aaaa) y profesional de cabecera real.
  await expect(items.first().locator('span').first()).toHaveText(/\d{2}\/\d{2}\/\d{4} · Dr\. Federico Salinas/);
});

// test: REQ-187 — contraste DIRECTO empty vs. poblado en una sola corrida: la MISMA
// pantalla, según la pieza, alterna entre el estado vacío y la lista real. Gate de
// regresión de que el empty-state no "pega" entre piezas.
test('REQ-187: el estado vacío es condicional — pieza sana (vacío) vs. pieza con tratamiento (lista) en la misma sesión', async ({ page }) => {
  // Pieza con tratamiento → lista, sin empty-state.
  await gotoApp(page, '/pacientes/pac-029/pieza/43');
  await expect(page.getByRole('heading', { name: 'Pieza 43 · Canino inferior derecho', level: 2 })).toBeVisible();
  await expect(historialPieza(page).getByText(COPY_VACIO_PIEZA)).toHaveCount(0);
  await expect(historialPieza(page).locator('li').first()).toBeVisible();

  // Navego a una pieza sana → ahora SÍ aparece el empty-state y desaparece la lista.
  await gotoApp(page, '/pacientes/pac-029/pieza/11');
  await expect(page.getByRole('heading', { name: 'Pieza 11 · Incisivo central superior derecho', level: 2 })).toBeVisible();
  await expect(historialPieza(page).getByText(`${COPY_VACIO_PIEZA}.`)).toBeVisible();
  await expect(historialPieza(page).locator('li')).toHaveCount(0);
});
