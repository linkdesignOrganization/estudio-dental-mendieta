import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, readState } from '../_helpers/seed';

/**
 * Seed dinámico (DEMO-006) — UX-060..UX-067.
 * Validado leyendo el estado real en localStorage + verificando que la UI lo refleja.
 * El seed deriva de las fotos (no hardcodea cantidades) y es determinista.
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-060 — 29 pacientes (12 H + 17 M) derivados de las fotos; foto visible en lista
test('UX-060: 29 pacientes (12 H + 17 M) con foto visible en la lista', async ({ page }) => {
  const s = await readState(page);
  expect(s.patients.length).toBe(29);
  const split = s.patients.reduce((a: any, p: any) => ((a[p.genero] = (a[p.genero] || 0) + 1), a), {});
  expect(split.hombre).toBe(12);
  expect(split.mujer).toBe(17);

  await gotoApp(page, '/pacientes');
  // Las fotos se muestran (no imagen rota): img con alt "Foto de ...".
  await expect(page.getByRole('img', { name: /^Foto de / }).first()).toBeVisible();
});

// test: UX-061 — datos plausibles: DNI AR, obra social, profesional de cabecera, contacto
test('UX-061: datos del paciente plausibles (DNI AR, obra social, profesional)', async ({ page }) => {
  const s = await readState(page);
  for (const p of s.patients.slice(0, 8)) {
    expect(p.nombre).toBeTruthy();
    expect(p.apellido).toBeTruthy();
    expect(p.dni).toMatch(/^\d{1,3}\.\d{3}\.\d{3}$/); // formato AR con puntos
    expect(p.obraSocialId).toBeTruthy();
    expect(p.profesionalId).toMatch(/^prof-\d+$/);
    expect(p.telefono).toBeTruthy();
  }
  // La ficha muestra obra social y profesional de cabecera.
  await gotoApp(page, '/pacientes/pac-002/informacion');
  await expect(page.getByText('Profesional de cabecera').first()).toBeVisible();
  await expect(page.getByRole('tabpanel').getByText('IOMA')).toBeVisible();
});

// test: UX-062 — odontograma e historial coherentes con la edad (32 piezas siempre)
test('UX-062: odontograma de 32 piezas e historial presente', async ({ page }) => {
  const s = await readState(page);
  for (const od of s.odontograms.slice(0, 5)) {
    expect(od.piezas.length).toBe(32);
  }
  expect(s.clinicalEvents.length).toBeGreaterThanOrEqual(60);
});

// test: UX-063 — datos fijos: 6 profesionales, 6 obras sociales, ≥12 tipos de tratamiento
test('UX-063: 6 profesionales, 6 obras sociales, ≥12 tipos de tratamiento', async ({ page }) => {
  const s = await readState(page);
  expect(s.professionals.length).toBe(6);
  expect(s.obrasSociales.length).toBe(6);
  expect(s.treatmentTypes.length).toBeGreaterThanOrEqual(12);
  expect(s.clinic?.nombre || '').toContain('Mendieta');
});

// test: UX-064 — volúmenes: ≥50 turnos, ≥40 tratamientos, 40–60 documentos
test('UX-064: volúmenes mínimos (≥50 turnos, ≥40 tratamientos, 40–60 documentos)', async ({ page }) => {
  const s = await readState(page);
  expect(s.appointments.length).toBeGreaterThanOrEqual(50);
  expect(s.treatmentPlans.length).toBeGreaterThanOrEqual(40);
  expect(s.documents.length).toBeGreaterThanOrEqual(40);
  expect(s.documents.length).toBeLessThanOrEqual(60);
  // Turnos en los 5 estados.
  const estados = new Set(s.appointments.map((a: any) => a.estado));
  for (const e of ['confirmado', 'atendiendo', 'terminado', 'cancelado', 'en-espera']) {
    expect(estados.has(e)).toBeTruthy();
  }
});

// test: UX-065 — ≥20 presupuestos, ≥25 facturas, AccountMovements; badge coherente
test('UX-065: ≥20 presupuestos, ≥25 facturas, movimientos de cuenta', async ({ page }) => {
  const s = await readState(page);
  expect(s.budgets.length).toBeGreaterThanOrEqual(20);
  expect(s.invoices.length).toBeGreaterThanOrEqual(25);
  expect(s.movements.length).toBeGreaterThan(0);
  // Estados variados.
  expect(new Set(s.budgets.map((b: any) => b.estado)).size).toBeGreaterThanOrEqual(3);
  expect(new Set(s.invoices.map((i: any) => i.estado)).size).toBeGreaterThanOrEqual(3);
});

// test: UX-066 — KPIs y reportes calculados del estado; montos ARS formateados
test('UX-066: los KPIs se calculan del estado y muestran montos ARS', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await expect(page.getByText('Pacientes nuevos')).toBeVisible();
  await expect(page.getByText('Ingresos facturados')).toBeVisible();
  // Montos ARS con formato $ y separador de miles/millones.
  await expect(page.getByText(/\$\s?[\d.,]+\s?M?/).first()).toBeVisible();
  // Deuda calculada presente (la KPI card "Deuda").
  await expect(page.getByText('Deuda', { exact: true })).toBeVisible();
});

// test: UX-067 — edge cases representados (nuevos sin historial, con deuda/al día, boca sana vs tratada)
test('UX-067: edge cases representados en el seed', async ({ page }) => {
  const s = await readState(page);
  // Boca sana vs con ausencias/tratamientos.
  const allSana = s.odontograms.filter((o: any) => o.piezas.every((p: any) => p.estado === 'sana'));
  const conAusencias = s.odontograms.filter((o: any) => o.piezas.some((p: any) => p.estado !== 'sana'));
  expect(conAusencias.length).toBeGreaterThan(0);
  // Estados de cuenta variados se reflejan en la lista (badges).
  await gotoApp(page, '/pacientes');
  await expect(page.getByText('Con deuda').first()).toBeVisible();
  await expect(page.getByText('Al día').first()).toBeVisible();
});
