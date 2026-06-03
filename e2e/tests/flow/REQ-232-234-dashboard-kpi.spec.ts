import { test, expect } from '@playwright/test';
import { warmSeed, readState } from '../_helpers/seed';

/**
 * Flow Tester · Iteración 5 — Dashboard de reportes: KPI clickeables (REQ-232 / REQ-233 / REQ-234).
 *
 * Criterio: el dashboard muestra ≤6 KPI cards con valores CALCULADOS del estado real (no
 * hardcode) — REQ-232/233; cada KPI es clickeable y NAVEGA a su reporte detallado — REQ-234.
 * Se verifica el mapeo card→ruta de los 6 (href de cada `<a>`).
 *
 * Mapeo de código (dashboard.component.ts → reportLink):
 *   Pacientes nuevos          → /reportes/pacientes
 *   Turnos atendidos          → /reportes/productividad
 *   Tratamientos completados  → /reportes/tratamientos
 *   Ingresos facturados       → /reportes/financiero
 *   Cobrado                   → /reportes/financiero
 *   Deuda                     → /reportes/financiero
 *
 * Los valores numéricos se contrastan contra un CÁLCULO independiente desde localStorage
 * (pacientes nuevos en 30 días, tratamientos completados) para probar que NO son placeholders.
 * NO muta estado → warmSeed alcanza. Anti-demo (REQ-272) barrido.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

const KPI_ROUTE: { label: string; route: string }[] = [
  { label: 'Pacientes nuevos', route: '/reportes/pacientes' },
  { label: 'Turnos atendidos', route: '/reportes/productividad' },
  { label: 'Tratamientos completados', route: '/reportes/tratamientos' },
  { label: 'Ingresos facturados', route: '/reportes/financiero' },
  { label: 'Cobrado', route: '/reportes/financiero' },
  { label: 'Deuda', route: '/reportes/financiero' },
];

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: REQ-232/233 — el dashboard muestra ≤6 KPI cards (las 6 canónicas) con valores calculados
// del estado real (contrastados contra un cálculo independiente), NO hardcode ni vacío global.
test('REQ-232/233: el dashboard muestra ≤6 KPI con valores calculados del estado', async ({ page }) => {
  await page.goto('/reportes', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Resumen de la clínica' })).toBeVisible();

  // ≤6 cards, y son links (clickeables) — cada card = un <a class="grid__cell">.
  const cards = page.locator('.grid .grid__cell');
  await expect(cards.first()).toBeVisible();
  const n = await cards.count();
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThanOrEqual(6);

  // Las 6 labels canónicas están presentes con un valor visible.
  for (const { label } of KPI_ROUTE) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }

  // Valores CALCULADOS (no placeholders): contrastar dos KPIs contra el estado real.
  const st = await readState(page);
  const TODAY = '2026-06-01';
  const desde30 = '2026-05-02'; // hoy − 30 días (ancla del viewcase)
  const nuevosCalc = (st.patients as any[]).filter((p) => p.altaFecha >= desde30).length;
  const completadosCalc = (st.treatmentPlans as any[]).filter((t) => t.estado === 'completado').length;

  const cardNuevos = page.locator('.grid__cell', { hasText: 'Pacientes nuevos' });
  await expect(cardNuevos).toContainText(String(nuevosCalc));
  const cardCompletados = page.locator('.grid__cell', { hasText: 'Tratamientos completados' });
  await expect(cardCompletados).toContainText(String(completadosCalc));

  // Los KPIs financieros muestran un monto ARS formateado (derivado, no crudo/placeholder).
  const cardIngresos = page.locator('.grid__cell', { hasText: 'Ingresos facturados' });
  await expect(cardIngresos).toContainText(/\$\s?[\d.,]+\s*[MK]?/);
  const cardDeuda = page.locator('.grid__cell', { hasText: 'Deuda' });
  await expect(cardDeuda).toContainText(/\$\s?[\d.,]+\s*[MK]?/);

  expect(await page.locator('main').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// test: REQ-234 — el href de cada KPI card mapea a su reporte detallado correspondiente (los 6).
test('REQ-234: cada KPI card apunta (href) a su reporte detallado correcto', async ({ page }) => {
  await page.goto('/reportes', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Resumen de la clínica' })).toBeVisible();

  for (const { label, route } of KPI_ROUTE) {
    const card = page.locator('.grid__cell', { hasText: label });
    await expect(card, `card "${label}" presente`).toHaveCount(1);
    await expect(card, `card "${label}" → ${route}`).toHaveAttribute('href', route);
  }
});

// test: REQ-234 — al CLICKEAR cada KPI se NAVEGA a su reporte detallado (recorrido real, no solo
// href). Se vuelve al dashboard entre clicks; cada destino renderiza su encabezado de reporte.
test('REQ-234: clickear cada KPI navega a su reporte detallado', async ({ page }) => {
  const destinos: { label: string; route: string; heading: RegExp }[] = [
    { label: 'Pacientes nuevos', route: '/reportes/pacientes', heading: /Reporte de pacientes/ },
    { label: 'Turnos atendidos', route: '/reportes/productividad', heading: /Reporte de productividad/ },
    { label: 'Tratamientos completados', route: '/reportes/tratamientos', heading: /Reporte de tratamientos/ },
    { label: 'Ingresos facturados', route: '/reportes/financiero', heading: /Reporte financiero/ },
  ];

  for (const d of destinos) {
    await page.goto('/reportes', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Resumen de la clínica' })).toBeVisible();

    const card = page.locator('.grid__cell', { hasText: d.label });
    await expect(card).toBeVisible();
    await card.click();

    await expect(page).toHaveURL(new RegExp(d.route.replace('/', '\\/') + '$'));
    await expect(page.getByRole('heading', { name: d.heading })).toBeVisible();
    // El reporte renderiza sus gráficos (al menos una figura), no una pantalla vacía.
    await expect(page.locator('main figure').first()).toBeVisible();
  }
});
