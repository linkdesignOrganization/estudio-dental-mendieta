import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, resetSeed } from '../_helpers/seed';

/**
 * Iteración 4 (Pacientes — escritura) · Flow Tester · Ronda 1.
 *
 * Editar paciente — ruta dedicada /pacientes/:id/editar (form precargado) + el DIRTY-CHECK
 * (REQ-184 / F01) que UX-025 difirió EXPLÍCITAMENTE a Fase 5:
 *
 *   REQ-182  · /editar llega PRECARGADO con los datos actuales del paciente.
 *   REQ-183  · "Guardar cambios" valida + PERSISTE el dato editado, vuelve a la ficha y el
 *             cambio sobrevive a un refresh REAL del navegador.
 *   REQ-184 / F01 (DIRTY-CHECK, crítico) — TRES ramas:
 *     1. SIN cambios → "Cancelar" sale DIRECTO a la ficha, sin diálogo de confirmación.
 *     2. CON cambios reales (editar teléfono) → "Cancelar" muestra el app-confirm-dialog
 *        "Tenés datos cargados. ¿Querés descartar y salir?" (copy de producción).
 *     3. Tras "Guardar cambios" el baseline se RE-CONGELA → al cancelar (sin tocar nada
 *        después de guardar) NO aparece prompt de descarte.
 *
 * Hallazgo de implementación (verificado en vivo contra el deploy): la acción "Cancelar" del
 * editor es el BACK-LINK superior con la etiqueta "Pacientes" (button, no link) — dispara
 * cancel(). No existe un botón literal "Cancelar". El diálogo de descarte es un
 * role="alertdialog" titulado "Descartar los cambios" con los botones "Seguir editando"
 * (cancela el descarte) y "Sí, descartar" (ejecuta y vuelve a la lista de pacientes).
 *
 * Las escrituras de la rama "Guardar" mutan localStorage → resetSeed() en afterEach mantiene
 * el seed determinista (idempotencia entre specs). Reutiliza config + helpers.
 */

const DESCARTE_COPY = 'Tenés datos cargados. ¿Querés descartar y salir?';
const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

/** El botón "Cancelar" del editor = back-link "Pacientes" (dispara cancel()). */
const cancelar = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Pacientes' });

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

test.afterEach(async ({ page }) => {
  await resetSeed(page, '/pacientes');
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-182 — form precargado
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-182 — /editar carga el formulario PRECARGADO con los datos actuales del paciente
// (pac-002, Mateo Gómez): nombre, apellido, DNI, teléfono y género reales del store.
test('REQ-182: editar paciente — el formulario llega precargado con los datos actuales', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/editar');
  await expect(page.getByRole('heading', { name: 'Editar paciente' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Mateo');
  await expect(page.getByRole('textbox', { name: 'Apellido' })).toHaveValue('Gómez');
  await expect(page.getByRole('textbox', { name: 'DNI' })).toHaveValue('56.875.272');
  await expect(page.getByRole('textbox', { name: 'Teléfono' })).toHaveValue('+54 11 5655-4564');
  // El género precargado (Mateo es Masculino en el seed) ya viene seleccionado.
  await expect(page.getByLabel('Género')).toHaveValue('hombre');
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-183 — guardar persiste (refresh real)
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-183 (PERSISTENCIA) — "Guardar cambios" persiste el teléfono editado, vuelve a la
// ficha del paciente y el cambio sobrevive a un refresh REAL del navegador.
test('REQ-183: "Guardar cambios" persiste el dato editado y vuelve a la ficha (refresh real)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/editar');
  const nuevoTel = '+54 11 9090-3030';
  await page.getByRole('textbox', { name: 'Teléfono' }).fill(nuevoTel);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  // Vuelve a la ficha del paciente con el dato nuevo reflejado.
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/informacion$/);
  await expect(page.getByText(nuevoTel).first()).toBeVisible();
  // El teléfono viejo del seed ya no está.
  await expect(page.getByText('+54 11 5655-4564')).toHaveCount(0);

  // Persiste tras refresh REAL (hidrata desde localStorage).
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText(nuevoTel).first()).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-184 / F01 — DIRTY-CHECK (3 ramas)
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-184 / F01 — RAMA 1: SIN cambios, "Cancelar" sale DIRECTO a la ficha del paciente,
// sin mostrar el diálogo de confirmación de descarte (no molesta cuando no hay nada que perder).
test('REQ-184/F01: cancelar SIN cambios sale directo a la ficha, sin diálogo de descarte', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/editar');
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Mateo');

  // Sin tocar nada → "Cancelar" navega sin preguntar.
  await cancelar(page).click();

  await expect(page).toHaveURL(/\/pacientes\/pac-002\/informacion$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Mateo Gómez' })).toBeVisible();
  // No hubo (ni quedó) ningún diálogo de descarte.
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});

// test: REQ-184 / F01 — RAMA 2: CON cambios reales (teléfono editado), "Cancelar" muestra el
// app-confirm-dialog con el copy EXACTO de producción. "Seguir editando" aborta el descarte
// (permanece en el editor con el cambio); "Sí, descartar" ejecuta y vuelve a la lista, SIN
// persistir el cambio (el teléfono original sigue intacto en la ficha).
test('REQ-184/F01: cancelar CON cambios pide confirmación de descarte (copy exacto) y respeta ambas ramas', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/editar');

  // Cambio REAL respecto del baseline precargado.
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('+54 11 7070-1212');

  // "Cancelar" → aparece el diálogo de descarte.
  await cancelar(page).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Descartar los cambios' })).toBeVisible();
  await expect(dialog.getByText(DESCARTE_COPY)).toBeVisible();
  // Copy de producción: nada de lenguaje de demo/mock.
  expect(await dialog.innerText()).not.toMatch(DEMO_FORBIDDEN);

  // RAMA 2a — "Seguir editando" aborta el descarte: seguimos en el editor con el cambio puesto.
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/editar$/);
  await expect(page.getByRole('textbox', { name: 'Teléfono' })).toHaveValue('+54 11 7070-1212');

  // RAMA 2b — re-abrir y "Sí, descartar" ejecuta. Hallazgo honesto (verificado contra el deploy):
  // al DESCARTAR una EDICIÓN, doCancel() vuelve a la FICHA del paciente (/pacientes/:id/informacion),
  // no a la lista — coherente: descartás los cambios y seguís viendo a ese paciente. (El descarte
  // del ALTA sí vuelve a /pacientes, pero ese es otro flujo.)
  await cancelar(page).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Sí, descartar' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/informacion$/);

  // El descarte NO persistió: la ficha conserva el teléfono ORIGINAL del seed (no el editado).
  await expect(page.getByText('+54 11 5655-4564').first()).toBeVisible();
  await expect(page.getByText('+54 11 7070-1212')).toHaveCount(0);
});

// test: REQ-184 / F01 — RAMA 3: tras "Guardar cambios" el baseline se RE-CONGELA. Si después
// de guardar volvemos a /editar y cancelamos sin tocar nada, NO aparece el prompt de descarte
// (el guardado dejó el formulario "limpio" respecto del nuevo baseline persistido).
test('REQ-184/F01: tras guardar, el baseline se re-congela → cancelar luego no pide descartar', async ({ page }) => {
  // 1) Guardar un cambio (queda persistido y el baseline interno se re-congela).
  await gotoApp(page, '/pacientes/pac-002/editar');
  const tel = '+54 11 6464-7878';
  await page.getByRole('textbox', { name: 'Teléfono' }).fill(tel);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/informacion$/);
  await expect(page.getByText(tel).first()).toBeVisible();

  // 2) Re-entrar al editor: ahora el form precargado YA ES el dato guardado (baseline nuevo).
  await gotoApp(page, '/pacientes/pac-002/editar');
  await expect(page.getByRole('textbox', { name: 'Teléfono' })).toHaveValue(tel);

  // 3) Cancelar SIN tocar nada → sale directo, sin prompt (no hay divergencia con el baseline).
  await cancelar(page).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/informacion$/);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
});
