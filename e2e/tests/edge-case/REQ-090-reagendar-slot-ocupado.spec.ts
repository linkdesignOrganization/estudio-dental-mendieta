import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed, resetSeed } from '../_helpers/seed';

/**
 * Iteración 3 (Agenda) · Edge Case Tester · Ronda 1.
 *
 * REQ-090 — Reagendar NO permite elegir un slot ocupado del MISMO profesional.
 *   En `/agenda/:id/reagendar`, los horarios ya ocupados por ese profesional en la
 *   FECHA elegida aparecen `[disabled]` (`.resch__slot[disabled]`, tachados, con
 *   title="Horario ocupado") y NO son seleccionables. El horario PROPIO del turno
 *   actual se excluye correctamente (no es un choque) cuando la fecha coincide.
 *
 * Edge cases cubiertos:
 *   (a) al elegir una fecha donde el profesional tiene slots ocupados, esos slots quedan
 *       deshabilitados; los libres siguen seleccionables.
 *   (b) un slot ocupado NO se puede seleccionar (force-click no lo marca ni habilita
 *       "Confirmar nuevo horario").
 *   (c) caso-límite: si la fecha elegida == fecha del turno, el horario PROPIO del turno
 *       se EXCLUYE de los ocupados (queda seleccionable), pero los OTROS ocupados del
 *       profesional ese día siguen deshabilitados.
 *   (d) el hint de disponibilidad está presente ("Los horarios ocupados de este profesional
 *       no están disponibles.").
 *
 * Fixture determinista (verificado en vivo contra el seed PRISTINO — resetSeed):
 *   · prof-03 (Dr. Federico Salinas):
 *       - 2026-06-19 → ocupa 10:00 (confirmado) y 15:30 (en-espera).
 *       - 2026-06-01 → ocupa 10:00, 11:30, 16:30 (entre otros).
 *   · tur-011 → turno CONFIRMADO de prof-03, fecha propia 2026-06-21 (≠ 06-19) →
 *       caso (a)/(b): al elegir 2026-06-19, 10:00 y 15:30 deben estar deshabilitados.
 *   · tur-008 → turno CONFIRMADO de prof-03, fecha propia 2026-06-01, hora propia 10:00 →
 *       caso (c): al elegir 2026-06-01, 10:00 (propio) queda SELECCIONABLE, pero 11:30 y
 *       16:30 (ocupados por otros turnos del mismo prof) están deshabilitados.
 *
 * IMPORTANTE (anti-flake): se parte SIEMPRE de un seed FRESCO (resetSeed). Sin esto, un
 * reagendar previo de otro spec deja un turno extra que ensucia la disponibilidad del
 * profesional (verificado: con estado mutado aparecía un 09:00 deshabilitado fantasma en
 * 2026-06-09). El reset garantiza el fixture exacto de arriba.
 */

const HINT = 'Los horarios ocupados de este profesional no están disponibles.';

/** Localiza un slot del reagendar por su etiqueta de hora (ej. "10:00"). */
function slot(page: Page, hora: string) {
  return page.locator('.resch__slot', { hasText: new RegExp(`^${hora}$`) });
}

/** Abre el reagendar de `turnoId` y espera el form montado. */
async function abrirReagendar(page: Page, turnoId: string): Promise<void> {
  await gotoApp(page, `/agenda/${turnoId}/reagendar`);
  await expect(page.getByRole('heading', { name: 'Elegí un nuevo horario' })).toBeVisible();
  await expect(page.locator('input#r-date')).toBeVisible();
}

/**
 * Cambia la fecha del reagendar y espera a que la grilla de slots se recompute.
 * `<input type=date>.fill` dispara input+change → el componente recalcula `isOccupied`.
 * Esperamos a que al menos un slot esperado quede deshabilitado para evitar carreras.
 */
async function elegirFecha(page: Page, iso: string, esperaDeshabilitado: string): Promise<void> {
  const date = page.locator('input#r-date');
  await date.fill(iso);
  await expect(date).toHaveValue(iso);
  await expect.poll(async () => slot(page, esperaDeshabilitado).first().isDisabled(), { timeout: 10_000 }).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
  // Seed PRISTINO: la disponibilidad de slots depende del estado persistido, que otros
  // specs (reagendar) mutan. Reset garantiza el fixture determinista de prof-03.
  await resetSeed(page, '/agenda');
});

// ───────────────────────────────────────────────────────────────────────────
// (a) Los slots ocupados del profesional quedan deshabilitados en la fecha elegida
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-090 — al elegir 2026-06-19 para un turno de prof-03, los slots 10:00 y 15:30
// (ocupados por ese profesional ese día) aparecen [disabled] con title="Horario ocupado",
// mientras que un slot libre (09:30) sigue habilitado y seleccionable.
test('REQ-090: los horarios ocupados del profesional aparecen deshabilitados en la fecha elegida', async ({ page }) => {
  await abrirReagendar(page, 'tur-011'); // confirmado, prof-03, fecha propia 2026-06-21

  // El hint de disponibilidad está presente.
  await expect(page.getByText(HINT)).toBeVisible();

  // Elegir una fecha donde el profesional tiene slots ocupados.
  await elegirFecha(page, '2026-06-19', '10:00');

  // 10:00 y 15:30 están ocupados por prof-03 ese día → deshabilitados, con el title correcto.
  await expect(slot(page, '10:00')).toBeDisabled();
  await expect(slot(page, '10:00')).toHaveAttribute('title', 'Horario ocupado');
  await expect(slot(page, '15:30')).toBeDisabled();
  await expect(slot(page, '15:30')).toHaveAttribute('title', 'Horario ocupado');

  // Un slot LIBRE de ese día sigue habilitado (09:30 no está ocupado por prof-03 el 06-19).
  await expect(slot(page, '09:30')).toBeEnabled();
  // El botón de confirmar arranca deshabilitado (aún no se eligió slot).
  await expect(page.getByRole('button', { name: 'Confirmar nuevo horario' })).toBeDisabled();
});

// ───────────────────────────────────────────────────────────────────────────
// (b) Un slot ocupado NO es seleccionable (no marca ni habilita "Confirmar")
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-090 — un slot ocupado no se puede seleccionar: un force-click NO lo marca como
// seleccionado ni habilita "Confirmar nuevo horario". En cambio, un slot libre sí lo habilita.
test('REQ-090: un slot ocupado no es seleccionable (force-click no marca ni habilita confirmar)', async ({ page }) => {
  await abrirReagendar(page, 'tur-011');
  await elegirFecha(page, '2026-06-19', '15:30');

  const ocupado = slot(page, '15:30');
  await expect(ocupado).toBeDisabled();

  // Intentar clickear el slot ocupado (force, porque está deshabilitado) no debe seleccionarlo.
  await ocupado.click({ force: true }).catch(() => { /* deshabilitado: el click es no-op */ });
  await expect(ocupado).not.toHaveClass(/is-selected/);
  await expect(page.getByRole('button', { name: 'Confirmar nuevo horario' })).toBeDisabled();

  // Un slot LIBRE sí se selecciona y habilita "Confirmar" (control positivo).
  const libre = slot(page, '09:30');
  await libre.click();
  await expect(libre).toHaveClass(/is-selected/);
  await expect(page.getByRole('button', { name: 'Confirmar nuevo horario' })).toBeEnabled();
});

// ───────────────────────────────────────────────────────────────────────────
// (c) Caso-límite: el horario PROPIO del turno se excluye si la fecha coincide
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-090 — si la fecha elegida es la MISMA del turno, su horario propio NO cuenta como
// choque (queda seleccionable), pero los OTROS slots ocupados del profesional ese día siguen
// deshabilitados. tur-008: prof-03, fecha propia 2026-06-01, hora propia 10:00.
test('REQ-090: el horario propio del turno se excluye de los ocupados si la fecha coincide', async ({ page }) => {
  await abrirReagendar(page, 'tur-008'); // confirmado, prof-03, fecha propia 2026-06-01, hora 10:00

  // Elegir la MISMA fecha del turno actual (2026-06-01): otros ocupados → 11:30 deshabilitado.
  await elegirFecha(page, '2026-06-01', '11:30');

  // El horario PROPIO (10:00) queda SELECCIONABLE pese a "existir" un turno a esa hora (es el propio).
  await expect(slot(page, '10:00')).toBeEnabled();
  // Los OTROS ocupados del mismo profesional ese día siguen deshabilitados.
  await expect(slot(page, '11:30')).toBeDisabled();
  await expect(slot(page, '16:30')).toBeDisabled();

  // Seleccionar el horario propio es válido (control positivo del caso-límite).
  await slot(page, '10:00').click();
  await expect(slot(page, '10:00')).toHaveClass(/is-selected/);
  await expect(page.getByRole('button', { name: 'Confirmar nuevo horario' })).toBeEnabled();
});
