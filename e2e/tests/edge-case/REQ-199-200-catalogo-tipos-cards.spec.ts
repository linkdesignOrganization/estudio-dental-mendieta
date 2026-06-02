import { test, expect, Page } from '@playwright/test';
import { gotoApp, readState } from '../_helpers/seed';

/**
 * Iteración 4 (Pacientes escritura + Tratamientos) · Edge Case Tester · Ronda 1.
 *
 * REQ-199 / REQ-200 — Catálogo de tipos de tratamiento:
 *   - REQ-199: la UI renderiza ≥12 cards (el seed tiene 15 tipos: tt-01..tt-15).
 *   - REQ-200: cada card es clickeable y NAVEGA al detalle del tipo
 *     (`/tratamientos/tipos/:id`), que muestra el tipo correcto (heading con su nombre).
 *
 * El catálogo (treatments-home.component.ts, sección "catalogo") renderiza una
 * `app-treatment-type-card` por tipo; cada card es un `<a routerLink="/tratamientos/tipos/:id">`
 * con el nombre como heading (level 3). Rutas: `/tratamientos/catalogo` abre la sección
 * catálogo directamente (data.section='catalogo'); el detalle vive en
 * `/tratamientos/tipos/:id` (también alias `/tratamientos/catalogo/:id`).
 *
 * El subtítulo del catálogo refleja "{N} tipos en el catálogo".
 *
 * No muta estado persistido (solo lectura/navegación) → no requiere resetSeed.
 */

const DESKTOP_ONLY = 'desktop-chromium';

// El catálogo NUNCA debe revelar lenguaje de demo/mock (REQ-272 transversal).
const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

/** Cards del catálogo = los <a> a /tratamientos/tipos/:id (visibles en el viewport actual). */
function catalogCards(page: Page) {
  return page.locator('a[href^="/tratamientos/tipos/"]').filter({ visible: true });
}

async function gotoCatalogo(page: Page): Promise<void> {
  await gotoApp(page, '/tratamientos/catalogo');
  await expect(page.getByRole('heading', { name: 'Tratamientos', level: 2 })).toBeVisible();
  await expect(page.getByText(/tipos en el catálogo$/)).toBeVisible();
}

// ───────────────────────────────────────────────────────────────────────────
// REQ-199 — ≥12 cards renderizadas (coherente con el seed)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-199 — el catálogo renderiza ≥12 cards de tipo y el conteo coincide con el
// número de tipos del estado (sin discrepancia UI ↔ datos).
test('REQ-199: el catálogo renderiza ≥12 cards y coincide con el conteo del estado', async ({ page }) => {
  await gotoCatalogo(page);

  const state = await readState(page);
  const nTipos = state.treatmentTypes.length;
  expect(nTipos, 'el seed debe tener ≥12 tipos').toBeGreaterThanOrEqual(12);

  // El número de cards visibles == número de tipos del estado.
  await expect(catalogCards(page)).toHaveCount(nTipos);
  // El subtítulo lo declara explícitamente.
  await expect(page.getByText(`${nTipos} tipos en el catálogo`)).toBeVisible();
});

// test: REQ-199 — cada card muestra contenido útil (nombre como heading + costo ARS +
// duración), no una card vacía/rota. Spot-check sobre el primer tipo del estado.
test('REQ-199: cada card del catálogo muestra nombre, costo ARS y duración (no card vacía)', async ({ page }) => {
  await gotoCatalogo(page);

  const state = await readState(page);
  const tipo = state.treatmentTypes[0];

  const card = page.locator(`a[href="/tratamientos/tipos/${tipo.id}"]`);
  await expect(card).toBeVisible();
  await expect(card.getByRole('heading', { name: tipo.nombre, level: 3 })).toBeVisible();
  // Costo formateado en ARS ("$ 18.000") y duración presentes dentro de la card.
  await expect(card.getByText(/^\$\s?\d/)).toBeVisible();
  await expect(card.getByText(tipo.duracionEst)).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-200 — cada card navega a su detalle
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-200 — click en la primera card navega a /tratamientos/tipos/:id y el detalle
// muestra el tipo correcto (heading con el nombre). Camino del usuario real (no deep-link).
test('REQ-200: click en una card del catálogo navega al detalle del tipo correcto', async ({ page }) => {
  await gotoCatalogo(page);

  const state = await readState(page);
  const tipo = state.treatmentTypes[0];

  await page.locator(`a[href="/tratamientos/tipos/${tipo.id}"]`).click();

  await expect(page).toHaveURL(new RegExp(`/tratamientos/tipos/${tipo.id}$`));
  await expect(page.getByRole('heading', { name: tipo.nombre, level: 2 })).toBeVisible();
  // El detalle no crashea: secciones de contenido presentes.
  await expect(page.getByRole('heading', { name: 'Pasos del procedimiento' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Materiales' })).toBeVisible();
});

// test: REQ-200 — cada card apunta a un detalle DISTINTO y coherente con su id: se valida
// que los href de las cards corresponden 1:1 a los ids de los tipos del estado (sin enlaces
// rotos ni duplicados que lleven todos al mismo detalle). Solo desktop (todas las cards
// visibles sin scroll de drawer); el comportamiento del link es idéntico en mobile.
test('REQ-200: los href de las cards mapean 1:1 a los ids de los tipos (sin enlaces rotos)', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== DESKTOP_ONLY, 'Mapeo de href sobre el grid completo: se valida en desktop.');
  await gotoCatalogo(page);

  const state = await readState(page);
  const expectedIds: string[] = state.treatmentTypes.map((t: { id: string }) => t.id).sort();

  const hrefs = await catalogCards(page).evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute('href')),
  );
  const actualIds = hrefs
    .map((h) => (h ?? '').replace('/tratamientos/tipos/', ''))
    .sort();

  expect(actualIds).toEqual(expectedIds);
  // Sin duplicados (cada card lleva a un tipo único).
  expect(new Set(actualIds).size).toBe(expectedIds.length);
});

// test: REQ-200 — navegar a un segundo tipo (distinto del primero) muestra SU nombre, no
// el del primero: prueba que el detalle es paramétrico por id y no estático.
test('REQ-200: un segundo tipo abre su propio detalle (detalle paramétrico por id)', async ({ page }) => {
  await gotoCatalogo(page);

  const state = await readState(page);
  // Tomo un tipo distinto del primero (índice 1) para contrastar.
  const tipo = state.treatmentTypes[1] ?? state.treatmentTypes[0];

  await page.locator(`a[href="/tratamientos/tipos/${tipo.id}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/tratamientos/tipos/${tipo.id}$`));
  await expect(page.getByRole('heading', { name: tipo.nombre, level: 2 })).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-199/200 — sin lenguaje de demo/mock
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-199 — el catálogo no revela demo/mock (copy de producción).
test('REQ-199: el catálogo no revela demo/mock (copy de producción)', async ({ page }) => {
  await gotoCatalogo(page);
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(DEMO_FORBIDDEN);
});
