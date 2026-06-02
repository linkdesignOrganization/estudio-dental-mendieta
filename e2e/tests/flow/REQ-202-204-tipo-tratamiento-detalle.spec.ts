import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Iteración 4 (Tratamientos — detalle de tipo) · Flow Tester · Ronda 1.
 *
 *   REQ-202  · El detalle de un tipo (/tratamientos/tipos/:id) muestra pasos típicos,
 *             materiales, costo (ARS), duración estimada y "PROFESIONALES HABILITADOS" REALES
 *             por especialidad: el generalista (Odontología general) SIEMPRE + el/los
 *             especialista(s) cuya especialidad mapea al tipo. NO el slice(0,4) genérico previo.
 *             Garantía: ≥1 profesional. Prueba CLAVE de "derivado por especialidad": dos tipos
 *             distintos → conjuntos de profesionales DISTINTOS.
 *   REQ-204  · El back-link "Tratamientos" vuelve al catálogo/listado (/tratamientos).
 *
 * Datos del seed (verificados en vivo contra el deploy):
 *   · tt-15 "Odontopediatría" (especialidad mapeada: Odontopediatría)
 *       → "Dra. Soledad Russo · Odontología general" + "Dr. Federico Salinas · Odontopediatría".
 *   · tt-04 "Tratamiento de conducto" (especialidad mapeada: Endodoncia)
 *       → "Dra. Soledad Russo · Odontología general" + "Dr. Martín Aguilera · Endodoncia".
 *   · tt-01 "Consulta y diagnóstico" (sin especialidad mapeada) → solo el generalista (≥1).
 *
 * Solo lee estado (no muta) → no requiere resetSeed. Reutiliza config + helpers.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

/**
 * El bloque "Profesionales habilitados" del detalle de tipo. La lista de nombres vive en
 * `ul.ttd__profs-names` dentro de la card meta; acotamos al contenedor `.ttd__profs` para que
 * `li` cuente SOLO profesionales (la card meta también tiene chips de costo/duración).
 */
const profsSection = (page: import('@playwright/test').Page) => page.locator('.ttd__profs');

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-202 — detalle completo + profesionales habilitados (tt-15 Odontopediatría)
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-202 — el detalle de tt-15 (Odontopediatría) muestra pasos, materiales, costo ARS,
// duración y los profesionales habilitados REALES: el generalista + el odontopediatra.
test('REQ-202: el detalle de tipo (Odontopediatría) muestra pasos/materiales/costo/duración + profesionales reales', async ({ page }) => {
  await gotoApp(page, '/tratamientos/tipos/tt-15');
  await expect(page.getByRole('heading', { level: 2, name: 'Odontopediatría' })).toBeVisible();

  // Pasos típicos del procedimiento (lista no vacía).
  await expect(page.getByRole('heading', { name: 'Pasos del procedimiento' })).toBeVisible();
  await expect(page.getByText('Adaptación del niño')).toBeVisible();
  // Materiales.
  await expect(page.getByRole('heading', { name: 'Materiales' })).toBeVisible();
  await expect(page.getByText('Sellantes de fosas y fisuras')).toBeVisible();
  // Costo de referencia en ARS + duración estimada.
  await expect(page.getByText('Costo de referencia')).toBeVisible();
  await expect(page.getByText('$ 32.000')).toBeVisible();
  await expect(page.getByText('Duración estimada')).toBeVisible();
  await expect(page.getByText('40 min')).toBeVisible();

  // Profesionales habilitados REALES por especialidad: generalista + odontopediatra.
  const profs = profsSection(page);
  await expect(profs.getByText('Dra. Soledad Russo · Odontología general')).toBeVisible();
  await expect(profs.getByText('Dr. Federico Salinas · Odontopediatría')).toBeVisible();
  // Y NO aparece un especialista de otra rama (p. ej. Endodoncia) que no aplica a este tipo.
  await expect(profs.getByText('· Endodoncia')).toHaveCount(0);

  expect(await page.locator('main').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// test: REQ-202 (PRUEBA CLAVE — derivado por especialidad) — dos tipos DISTINTOS exponen
// conjuntos de profesionales DISTINTOS (tt-15 odontopediatra vs tt-04 endodoncista), lo que
// demuestra que es derivado del mapeo de especialidad y no un slice fijo idéntico para todos.
test('REQ-202: los profesionales habilitados varían por tipo (prueba de derivación por especialidad)', async ({ page }) => {
  // tt-15 → odontopediatra.
  await gotoApp(page, '/tratamientos/tipos/tt-15');
  await expect(page.getByRole('heading', { level: 2, name: 'Odontopediatría' })).toBeVisible();
  await expect(profsSection(page).getByText('Dr. Federico Salinas · Odontopediatría')).toBeVisible();
  await expect(profsSection(page).getByText('Dr. Martín Aguilera · Endodoncia')).toHaveCount(0);

  // tt-04 → endodoncista (conjunto DISTINTO; el generalista se mantiene, el especialista cambia).
  await gotoApp(page, '/tratamientos/tipos/tt-04');
  await expect(page.getByRole('heading', { level: 2, name: 'Tratamiento de conducto' })).toBeVisible();
  await expect(profsSection(page).getByText('Dra. Soledad Russo · Odontología general')).toBeVisible();
  await expect(profsSection(page).getByText('Dr. Martín Aguilera · Endodoncia')).toBeVisible();
  // El odontopediatra de tt-15 NO aplica a un tratamiento de conducto.
  await expect(profsSection(page).getByText('Dr. Federico Salinas · Odontopediatría')).toHaveCount(0);
});

// test: REQ-202 (garantía ≥1) — un tipo SIN especialidad mapeada (tt-01 Consulta) muestra al
// menos al generalista (nunca queda sin profesionales).
test('REQ-202: un tipo sin especialidad mapeada muestra al menos el generalista (≥1 profesional)', async ({ page }) => {
  await gotoApp(page, '/tratamientos/tipos/tt-01');
  await expect(page.getByRole('heading', { level: 2, name: 'Consulta y diagnóstico' })).toBeVisible();
  const profs = profsSection(page);
  await expect(profs.getByText('Dra. Soledad Russo · Odontología general')).toBeVisible();
  // Hay al menos un profesional listado (garantía del modelo).
  expect(await profs.locator('li').count()).toBeGreaterThanOrEqual(1);
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-204 — back-link al catálogo
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-204 — el back-link "Tratamientos" del detalle de tipo vuelve al listado/catálogo.
test('REQ-204: el back-link del detalle de tipo vuelve a Tratamientos', async ({ page }) => {
  await gotoApp(page, '/tratamientos/tipos/tt-15');
  await expect(page.getByRole('heading', { level: 2, name: 'Odontopediatría' })).toBeVisible();

  // El back-link vive dentro del contenido principal (no la navegación del sidebar).
  await page.locator('main').getByRole('link', { name: 'Tratamientos' }).click();
  await expect(page).toHaveURL(/\/tratamientos$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Tratamientos' })).toBeVisible();
});
