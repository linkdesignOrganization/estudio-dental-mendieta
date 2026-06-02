import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, resetSeed } from '../_helpers/seed';

/**
 * Iteración 4 (Odontograma EDITABLE persistente) · Flow Tester · Ronda 1.
 *
 * Lo NUEVO de It4 respecto de UX-028/UX-086 (que ya cubren la transición básica sana→caries
 * con reload domcontentloaded → PASA automatizado):
 *
 *   REQ-267  · El app-tooth-state-selector ofrece LOS 6 ESTADOS (radiogroup): Sana, Caries,
 *             Obturación, Ausente, En tratamiento, Prótesis. No un dropdown denso ni un
 *             subconjunto: las 6 opciones están presentes y son seleccionables.
 *   REQ-268  · Cambiar el estado + "Guardar estado" PERSISTE tras un HARD reload del navegador
 *             y se REFLEJA en el odontograma (aria-label de la pieza actualizado). Endurecido
 *             por el @defer (on immediate): las 32 piezas hidratan de forma determinista en
 *             deep-link/refresh (regresión BUG-E04) — se espera web-first toHaveCount(32)
 *             ANTES de tocar una pieza, sin scrollIntoView imperativo que compita con el defer.
 *   REQ-269  · El nuevo estado es COHERENTE con la ficha: el "Estado actual" del detalle de la
 *             pieza y la leyenda/diagrama del odontograma quedan alineados.
 *
 * Estado y FDI deterministas: arrancamos siempre desde el seed fresco (resetSeed). pac-001
 * (Bautista Álvarez) y un estado de destino "Obturación" para NO solaparse con UX-028
 * (pac-004 → Caries). La pieza objetivo se elige por su aria-label "Sana" real (no a ciegas).
 *
 * Las mutaciones del odontograma se revierten en afterEach (resetSeed) para idempotencia.
 * Reutiliza config (playwright.config.ts) y helpers (tests/_helpers/seed.ts).
 */

const LABELS_6 = ['Sana', 'Caries', 'Obturación', 'Ausente', 'En tratamiento', 'Prótesis'];

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// El cambio de estado MUTA el odontograma persistido → volvemos al seed determinista.
test.afterEach(async ({ page }) => {
  await resetSeed(page, '/agenda');
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-267 — el selector ofrece LOS 6 estados
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-267 — el app-tooth-state-selector de una pieza ofrece EXACTAMENTE los 6 estados
// como radios seleccionables (radiogroup "Estado de la pieza"), con el actual marcado.
test('REQ-267: el selector de estado de pieza ofrece los 6 estados (radiogroup)', async ({ page }) => {
  // Camino real: odontograma → pieza. Esperamos las 32 piezas (@defer on immediate) antes de tocar.
  await gotoApp(page, '/pacientes/pac-001/odontograma');
  await expect(page.getByRole('button', { name: /^Pieza \d+/ })).toHaveCount(32);

  // Abrimos una pieza Sana real (elegida por su aria-label, no a ciegas).
  const sana = page.getByRole('button', { name: /,\s*Sana$/ }).first();
  await sana.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pieza\/\d+$/);

  // El radiogroup ofrece las 6 opciones, cada una seleccionable.
  const group = page.getByRole('radiogroup', { name: 'Estado de la pieza' });
  await expect(group).toBeVisible();
  await expect(group.getByRole('radio')).toHaveCount(6);
  for (const label of LABELS_6) {
    await expect(group.getByRole('radio', { name: label })).toBeVisible();
  }
  // El estado actual (Sana) viene marcado.
  await expect(group.getByRole('radio', { name: 'Sana' })).toHaveAttribute('aria-checked', 'true');
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-268 / REQ-269 — cambiar estado, persistir tras HARD reload, reflejar + coherencia
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-268/269 (FLUJO COMPLETO) — cambiar una pieza Sana → "Obturación", "Guardar estado":
//  · vuelve al odontograma y la pieza refleja el nuevo estado (aria-label actualizado),
//  · PERSISTE tras un HARD reload (page.reload waitUntil domcontentloaded) — esperando las 32
//    piezas web-first antes de aseverar (regresión @defer on immediate / BUG-E04),
//  · es COHERENTE con la ficha: el deep-link a /pieza/:fdi muestra "Estado actual: Obturación".
test('REQ-268/269: cambiar estado de pieza persiste tras HARD reload y se refleja en el odontograma', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/odontograma');
  // Gate web-first: las 32 piezas hidratan (NO un scrollIntoView imperativo que compita con @defer).
  await expect(page.getByRole('button', { name: /^Pieza \d+/ })).toHaveCount(32);

  // Elegimos una pieza Sana y guardamos su FDI para verificar la persistencia por número.
  const sana = page.getByRole('button', { name: /,\s*Sana$/ }).first();
  await sana.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/pieza\/\d+$/);
  const fdi = page.url().match(/pieza\/(\d+)/)![1];

  // Cambiamos a "Obturación" (distinto de UX-028 que usa Caries) y guardamos.
  await page.getByRole('radio', { name: 'Obturación' }).click();
  await expect(page.getByRole('radio', { name: 'Obturación' })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Guardar estado' }).click();

  // Vuelve al odontograma y la pieza refleja el nuevo estado (aria-label).
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/odontograma$/);
  await expect(page.getByRole('button', { name: /^Pieza \d+/ })).toHaveCount(32);
  await expect(
    page.getByRole('button', { name: new RegExp(`^Pieza ${fdi} .*Obturación`) }),
  ).toBeVisible();

  // PERSISTE tras un HARD reload del navegador (hidrata desde localStorage; @defer on immediate).
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /^Pieza \d+/ })).toHaveCount(32);
  await expect(
    page.getByRole('button', { name: new RegExp(`^Pieza ${fdi} .*Obturación`) }),
  ).toBeVisible();

  // REQ-269 — coherencia con la ficha: el detalle de la pieza (deep-link) confirma el estado.
  await gotoApp(page, `/pacientes/pac-001/pieza/${fdi}`);
  await expect(page.getByText('Estado actual')).toBeVisible();
  // El "Estado actual" del detalle es Obturación y el radio Obturación queda marcado.
  await expect(
    page.getByText('Estado actual').locator('xpath=following-sibling::*[1]'),
  ).toHaveText('Obturación');
  await expect(page.getByRole('radio', { name: 'Obturación' })).toHaveAttribute('aria-checked', 'true');
});

// test: REQ-268 (regresión BUG-E04, mobile) — en DEEP-LINK DIRECTO al odontograma en viewport
// chico, las 32 piezas hidratan de forma determinista (@defer on immediate), sin quedar
// "cargando". Es el peor caso del defer (carga directa + lazy chunk en móvil).
test('REQ-268: deep-link directo al odontograma hidrata las 32 piezas (regresión @defer on immediate)', async ({ page }) => {
  // Deep-link directo (sin pasar por la ficha) — el caso que el endurecimiento on-immediate cubre.
  await gotoApp(page, '/pacientes/pac-006/odontograma');
  await expect(page.getByRole('button', { name: /^Pieza \d+/ })).toHaveCount(32);
  // La leyenda de los 6 estados también está presente (diagrama plenamente renderizado).
  const leyenda = page.getByRole('list', { name: 'Referencia de estados' });
  await expect(leyenda).toBeVisible();
  for (const label of LABELS_6) {
    await expect(leyenda.getByText(label, { exact: true })).toBeVisible();
  }
});
