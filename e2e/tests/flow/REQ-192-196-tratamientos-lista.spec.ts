import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Iteración 4 (Tratamientos — lista de activos) · Flow Tester · Ronda 1.
 *
 *   REQ-192  · La tabla de tratamientos activos tiene 5 columnas, la 5.ª = "Próxima fecha",
 *             con dato REAL por fila. (Hallazgo honesto verificado en vivo: la "Próxima fecha"
 *             se formatea en estilo corto "Jue 25 jun" — DiaCorto día mesCorto —, NO "dd/mm/aaaa"
 *             como anticipaba el plan; aseveramos el formato REAL del producto.)
 *   REQ-193  · El ÚNICO filtro de la lista es por profesional; aplicarlo reduce el listado a
 *             las filas de ese profesional (todas las visibles llevan su nombre).
 *   REQ-194  · Una fila es clickeable y abre el DETALLE del plan (vive dentro de la ficha del
 *             paciente: /pacientes/:pacienteId/plan/:planId).
 *   REQ-196  · Las etapas se muestran legibles "X/Y" (completadas/total), numéricas.
 *
 * Nota de honestidad sobre "Sin fecha prevista" (REQ-192): la vista de ACTIVOS excluye los
 * planes completados (filtro estado !== 'completado'), y en el seed SOLO los completados tienen
 * proximaFecha vacía → "Sin fecha prevista" NO es alcanzable en la lista de activos con este
 * seed. Por eso aquí aseveramos que TODA fila activa trae una fecha real con formato corto, y
 * documentamos que el caso vacío del placeholder no aplica a esta vista (es source-verified, no
 * un agujero de cobertura). El estado vacío del FILTRO sin resultados lo cubre el edge-case
 * tester (REQ-195).
 *
 * Solo lee estado (no muta) → no requiere resetSeed. Reutiliza config + helpers.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;
// Formato corto real del producto verificado en vivo: "Jue 25 jun" (DiaCorto día mesCorto).
// El texto vive en un <span> junto a un ícono → no anclamos con ^...$ (el contenedor agrega el
// glifo); basta confirmar que el patrón de fecha corta REAL aparece (no un placeholder vacío).
const FECHA_CORTA = /(Dom|Lun|Mar|Mié|Jue|Vie|Sáb)\s\d{1,2}\s(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/;

/** Filas/cards de tratamiento visibles (aria-label "Ver tratamiento <nombre>"). */
const rows = (page: Page) =>
  page.locator('[aria-label^="Ver tratamiento "]').filter({ visible: true });

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-192 / REQ-196 — columnas (Próxima fecha 5.ª) + etapas X/Y
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-192/196 — la lista de activos es una tabla con cabeceras Paciente · Tratamiento ·
// Profesional · Etapas · Próxima fecha (5 columnas, la 5.ª "Próxima fecha"); cada fila activa
// trae etapas "X/Y" legibles y una "Próxima fecha" REAL con formato corto.
test('REQ-192/196: la lista de activos muestra 5 columnas (Próxima fecha) con etapas X/Y y fecha real por fila', async ({ page }) => {
  await gotoApp(page, '/tratamientos');
  await expect(page.getByRole('heading', { level: 2, name: 'Tratamientos' })).toBeVisible();
  // Sección "Activos" por defecto + subtítulo con el conteo en curso.
  await expect(page.getByText(/\d+ tratamientos en curso/)).toBeVisible();

  // Las 5 cabeceras de columna, con la 5.ª = "Próxima fecha".
  // (En mobile <768px la tabla es display:none — se renderiza como cards y los <th> quedan en
  //  el subtree oculto. Las cabeceras se aseveran en desktop; el contenido por fila se verifica
  //  abajo en AMBOS viewports vía la fila/card visible.)
  const vw = page.viewportSize()?.width ?? 0;
  if (vw >= 768) {
    for (const col of ['Paciente', 'Tratamiento', 'Profesional', 'Etapas', 'Próxima fecha']) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }
  }

  // Hay filas activas; tomamos la primera para aseverar su contenido real.
  await expect(rows(page).first()).toBeVisible();
  const first = rows(page).first();

  // REQ-196 — etapas "X/Y" numéricas (p. ej. "2/10").
  await expect(first.getByText(/^\d+\/\d+$/).first()).toBeVisible();

  // REQ-192 — "Próxima fecha" REAL con el formato corto del producto (no un placeholder vacío).
  await expect(first.getByText(FECHA_CORTA).first()).toBeVisible();

  // Coherencia de volumen: ninguna fila activa cae en el placeholder "Sin fecha prevista"
  // (en el seed solo los completados —excluidos de esta vista— tienen fecha vacía).
  await expect(page.getByText('Sin fecha prevista')).toHaveCount(0);

  // Copy de producción (sin lenguaje de demo/mock).
  expect(await page.locator('main').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-193 — filtro por profesional
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-193 — el filtro por profesional reduce la lista a las filas de ese profesional.
// Elegimos un profesional del seed y verificamos que (a) el conteo no aumenta y (b) TODAS las
// filas visibles llevan su nombre en la columna Profesional.
test('REQ-193: el filtro por profesional acota la lista a ese profesional', async ({ page }) => {
  await gotoApp(page, '/tratamientos');
  const filtro = page.getByRole('combobox', { name: 'Filtrar por profesional' });
  await expect(filtro).toBeVisible();

  const totalSinFiltro = await rows(page).count();

  // Filtramos por una profesional con varios planes en el seed.
  const PROF = 'Dra. Carolina Etcheverry';
  await filtro.selectOption(PROF);

  // Tras filtrar, hay al menos una fila y el conteo no excede el original.
  await expect(rows(page).first()).toBeVisible();
  const totalFiltrado = await rows(page).count();
  expect(totalFiltrado).toBeGreaterThan(0);
  expect(totalFiltrado).toBeLessThanOrEqual(totalSinFiltro);

  // Todas las filas visibles corresponden a ese profesional (columna Profesional).
  const count = await rows(page).count();
  for (let i = 0; i < count; i++) {
    await expect(rows(page).nth(i)).toContainText(PROF);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-194 — fila → detalle del plan
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-194 — al hacer click en una fila se abre el DETALLE del plan, que vive dentro de la
// ficha del paciente (/pacientes/:pacienteId/plan/:planId), no una ruta huérfana.
test('REQ-194: una fila de tratamiento abre el detalle del plan en la ficha del paciente', async ({ page }) => {
  await gotoApp(page, '/tratamientos');
  await expect(rows(page).first()).toBeVisible();

  await rows(page).first().click();

  // El detalle del plan es una sub-pantalla de la ficha del paciente.
  await expect(page).toHaveURL(/\/pacientes\/pac-[\w-]+\/plan\/tra-[\w-]+$/);
  // No crashea: el shell sigue navegable y sin lenguaje de demo/mock.
  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  expect(await page.locator('main').innerText()).not.toMatch(DEMO_FORBIDDEN);
});
