import { test, expect, Page } from '@playwright/test';
import { gotoApp, resetSeed, readState, STATE_KEY } from '../_helpers/seed';

/**
 * Iteración 4 (Pacientes escritura + Tratamientos) · Edge Case Tester · Ronda 1.
 *
 * REQ-195 — Lista de tratamientos activos: aplicar el filtro por profesional que NO arroja
 * resultados muestra un ESTADO VACÍO con guidance (no pantalla en blanco, no crash, no
 * tabla con headers y cero filas).
 *
 * El filtro de la pantalla (treatments-home.component.ts) muestra solo planes con
 * `estado !== 'completado'` y, si hay profesional seleccionado, `t.profesional === nombre`.
 * El empty-state lo provee `app-data-table` (empty-state DC-064) con copy de producción:
 *   - título:      "No hay tratamientos activos con este criterio"
 *   - descripción: "Ajustá el filtro o creá un nuevo plan desde la ficha del paciente."
 *
 * NOTA IMPORTANTE sobre el seed (verificado en vivo): los planes de tratamiento se asignan
 * al profesional de cabecera del paciente, y los 6 profesionales del seed TIENEN ≥1 plan
 * activo. Por eso el dropdown, sobre el seed virgen, NUNCA cae en el empty-state por sí
 * solo. Para ejercer la rama del estado vacío de forma DETERMINISTA, este spec:
 *   1) lee el estado real y elige un profesional con planes activos;
 *   2) marca TODOS los planes activos de ese profesional como `completado` en localStorage
 *      (mutación quirúrgica; el store re-hidrata desde localStorage en el reload —
 *      hydrate() usa el persistido si es válido, no regenera);
 *   3) recarga, filtra por ese profesional → ahora 0 activos → empty-state;
 *   4) resetSeed restaura el seed virgen (idempotencia, no contamina specs posteriores).
 *
 * También se cubre el CONTROL POSITIVO sin mutar: filtrar por un profesional CON planes
 * muestra filas (la tabla), no el empty-state — así el estado vacío es CONDICIONAL.
 */

const EMPTY_TITULO = 'No hay tratamientos activos con este criterio';
const EMPTY_DESC = 'Ajustá el filtro o creá un nuevo plan desde la ficha del paciente.';

// El copy del estado vacío NUNCA debe revelar lenguaje de demo/mock (REQ-272 transversal).
const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

const filtro = (page: Page) => page.getByLabel('Filtrar por profesional');

async function gotoActivos(page: Page): Promise<void> {
  await gotoApp(page, '/tratamientos');
  await expect(page.getByRole('heading', { name: 'Tratamientos', level: 2 })).toBeVisible();
  await expect(page.getByText(/tratamientos en curso$/)).toBeVisible();
}

/** Mapa profesionalId → nombre, desde el estado vivo. */
async function profMap(page: Page): Promise<Map<string, string>> {
  const state = await readState(page);
  const m = new Map<string, string>();
  for (const p of state.professionals) m.set(p.id, p.nombre);
  return m;
}

/** Elige un profesional (id+nombre) que tenga ≥1 plan activo en el estado vivo. */
async function profConActivos(page: Page): Promise<{ id: string; nombre: string }> {
  const state = await readState(page);
  const names = await profMap(page);
  const activo = state.treatmentPlans.find((t: { estado: string; profesionalId: string }) => t.estado !== 'completado');
  expect(activo, 'el seed debe tener al menos un plan activo').toBeTruthy();
  return { id: activo.profesionalId, nombre: names.get(activo.profesionalId)! };
}

test.beforeEach(async ({ page }) => {
  // Parte siempre del seed virgen (este spec muta el estado en un caso) → idempotencia.
  await resetSeed(page, '/tratamientos');
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-195 — empty-state determinista (mutación: completar los planes de un prof.)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-195 — tras completar todos los planes activos de un profesional, filtrar por él
// muestra el ESTADO VACÍO con título + guidance, sin tabla de datos ni crash.
test('REQ-195: el filtro sin resultados muestra el estado vacío con guidance (no pantalla en blanco)', async ({ page }) => {
  // Arranco en /tratamientos para tener acceso a localStorage del estado hidratado.
  await gotoActivos(page);
  const prof = await profConActivos(page);

  // Mutación quirúrgica: completo TODOS los planes activos de ese profesional.
  await page.evaluate(
    ({ key, profId }) => {
      const s = JSON.parse(localStorage.getItem(key)!);
      for (const t of s.treatmentPlans) {
        if (t.profesionalId === profId) t.estado = 'completado';
      }
      localStorage.setItem(key, JSON.stringify(s));
    },
    { key: STATE_KEY, profId: prof.id },
  );

  // Recargo para que el store hidrate el estado mutado (sin regenerar el seed).
  await gotoApp(page, '/tratamientos');
  await expect(page.getByRole('heading', { name: 'Tratamientos', level: 2 })).toBeVisible();

  // Filtro por ese profesional → 0 activos → empty-state.
  await filtro(page).selectOption(prof.nombre);

  await expect(page.getByRole('heading', { name: EMPTY_TITULO })).toBeVisible();
  await expect(page.getByText(EMPTY_DESC)).toBeVisible();
  // NO hay tabla de datos renderizada (el empty-state reemplaza a la tabla).
  await expect(page.locator('table.dt__table')).toHaveCount(0);
  // El subtítulo refleja 0 en curso para ese filtro.
  await expect(page.getByText('0 tratamientos en curso')).toBeVisible();

  // Restauro el seed virgen para no contaminar otros specs.
  await resetSeed(page, '/tratamientos');
});

// test: REQ-195 — el estado vacío del filtro es RECUPERABLE: volver a "Todos los
// profesionales" re-muestra la tabla con filas (el empty-state era condicional al filtro).
test('REQ-195: el estado vacío del filtro es recuperable — "Todos" vuelve a mostrar la tabla', async ({ page }) => {
  await gotoActivos(page);
  const prof = await profConActivos(page);

  await page.evaluate(
    ({ key, profId }) => {
      const s = JSON.parse(localStorage.getItem(key)!);
      for (const t of s.treatmentPlans) if (t.profesionalId === profId) t.estado = 'completado';
      localStorage.setItem(key, JSON.stringify(s));
    },
    { key: STATE_KEY, profId: prof.id },
  );
  await gotoApp(page, '/tratamientos');

  // Filtro vacío.
  await filtro(page).selectOption(prof.nombre);
  await expect(page.getByRole('heading', { name: EMPTY_TITULO })).toBeVisible();

  // Vuelvo a "Todos los profesionales" → reaparece la tabla con filas.
  await filtro(page).selectOption('');
  await expect(page.getByRole('heading', { name: EMPTY_TITULO })).toHaveCount(0);
  await expect(page.locator('table.dt__table tbody tr')).not.toHaveCount(0);

  await resetSeed(page, '/tratamientos');
});

// test: REQ-195 — el copy del estado vacío no revela demo/mock (copy de producción).
test('REQ-195: el estado vacío del filtro no revela demo/mock (copy de producción)', async ({ page }) => {
  await gotoActivos(page);
  const prof = await profConActivos(page);

  await page.evaluate(
    ({ key, profId }) => {
      const s = JSON.parse(localStorage.getItem(key)!);
      for (const t of s.treatmentPlans) if (t.profesionalId === profId) t.estado = 'completado';
      localStorage.setItem(key, JSON.stringify(s));
    },
    { key: STATE_KEY, profId: prof.id },
  );
  await gotoApp(page, '/tratamientos');
  await filtro(page).selectOption(prof.nombre);
  await expect(page.getByRole('heading', { name: EMPTY_TITULO })).toBeVisible();

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(DEMO_FORBIDDEN);

  await resetSeed(page, '/tratamientos');
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-195 — control positivo: filtrar por un prof. CON planes muestra filas
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-195 (control positivo) — sin mutar nada, filtrar por un profesional con planes
// activos muestra la TABLA con filas (no el empty-state). Demuestra que el estado vacío es
// condicional a "sin resultados", no permanente.
test('REQ-195 (control positivo): filtrar por un profesional con planes muestra filas, no el estado vacío', async ({ page }) => {
  await gotoActivos(page);
  const prof = await profConActivos(page);

  await filtro(page).selectOption(prof.nombre);

  // Hay filas en la tabla y NO aparece el empty-state.
  await expect(page.locator('table.dt__table tbody tr')).not.toHaveCount(0);
  await expect(page.getByRole('heading', { name: EMPTY_TITULO })).toHaveCount(0);
  // Todas las filas visibles son de ese profesional (coherencia del filtro).
  const profCells = page.locator('table.dt__table tbody tr td:nth-child(3)');
  const count = await profCells.count();
  for (let i = 0; i < count; i++) {
    await expect(profCells.nth(i)).toHaveText(prof.nombre);
  }
});
