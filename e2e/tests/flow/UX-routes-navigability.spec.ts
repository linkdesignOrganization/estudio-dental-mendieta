import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed } from '../_helpers/seed';

/**
 * Navegabilidad de las 49 rutas + pantallas shell (DEMO-018).
 * Las pantallas shell (reagendar, crear presupuesto, crear/editar paciente, reportes
 * detallados, configuración, sub-detalles) se verifican SOLO como "ruta navegable +
 * layout coherente", NO funcionalidad completa (eso es Fase 5).
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

const ROUTES: Array<{ path: string; module: string; note?: string }> = [
  { path: '/reportes', module: 'Reportes' },
  { path: '/reportes/pacientes', module: 'Reportes', note: 'shell' },
  { path: '/reportes/tratamientos', module: 'Reportes', note: 'shell' },
  { path: '/reportes/financiero', module: 'Reportes', note: 'shell' },
  { path: '/reportes/productividad', module: 'Reportes', note: 'shell' },
  { path: '/agenda', module: 'Agenda' },
  { path: '/agenda/dia', module: 'Agenda' },
  { path: '/agenda/nuevo/paciente', module: 'Agenda' },
  { path: '/agenda/nuevo/profesional', module: 'Agenda' },
  { path: '/agenda/nuevo/confirmar', module: 'Agenda' },
  { path: '/agenda/tur-001', module: 'Agenda' },
  { path: '/agenda/tur-001/reagendar', module: 'Agenda', note: 'shell' },
  { path: '/pacientes', module: 'Pacientes' },
  { path: '/pacientes/nuevo/datos', module: 'Pacientes', note: 'shell' },
  { path: '/pacientes/nuevo/clinico', module: 'Pacientes', note: 'shell' },
  { path: '/pacientes/pac-003/informacion', module: 'Pacientes' },
  { path: '/pacientes/pac-003/odontograma', module: 'Pacientes' },
  { path: '/pacientes/pac-003/historial', module: 'Pacientes' },
  { path: '/pacientes/pac-003/tratamientos', module: 'Pacientes' },
  { path: '/pacientes/pac-003/documentos', module: 'Pacientes' },
  { path: '/pacientes/pac-003/pagos', module: 'Pacientes' },
  { path: '/pacientes/pac-003/editar', module: 'Pacientes', note: 'shell' },
  { path: '/pacientes/pac-003/pieza/11', module: 'Pacientes' },
  { path: '/pacientes/pac-003/pagos/nuevo', module: 'Pacientes' },
  { path: '/pacientes/pac-003/plan/tra-001', module: 'Pacientes', note: 'shell' },
  { path: '/tratamientos', module: 'Tratamientos' },
  { path: '/tratamientos/tipos/tt-01', module: 'Tratamientos' },
  { path: '/facturacion/presupuestos', module: 'Facturación' },
  { path: '/facturacion/presupuestos/nuevo/paciente', module: 'Facturación', note: 'shell' },
  { path: '/facturacion/presupuestos/nuevo/items', module: 'Facturación', note: 'shell' },
  { path: '/facturacion/presupuestos/nuevo/confirmar', module: 'Facturación', note: 'shell' },
  { path: '/facturacion/presupuestos/pre-001', module: 'Facturación', note: 'shell' },
  { path: '/facturacion/facturas', module: 'Facturación' },
  { path: '/facturacion/facturas/inv-001', module: 'Facturación', note: 'shell' },
  { path: '/facturacion/obras-sociales', module: 'Facturación' },
  { path: '/facturacion/obras-sociales/os-osde', module: 'Facturación', note: 'shell' },
  { path: '/configuracion', module: 'Configuración' },
  { path: '/ayuda', module: 'Ayuda' },
];

for (const r of ROUTES) {
  // test: ruta navegable con shell coherente (módulo en el header) y sin crash
  test(`Ruta navegable: ${r.path}${r.note ? ` (${r.note})` : ''}`, async ({ page }) => {
    await page.goto(r.path, { waitUntil: 'domcontentloaded' });
    // El shell carga (sidebar) y el header refleja el módulo.
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('heading', { level: 1, name: r.module })).toBeVisible();
    // No cayó al "no encontrado" inesperadamente.
    await expect(page.getByText('No encontramos esta página')).toHaveCount(0);
    // Footer sobrio presente.
    await expect(page.locator('main p').last()).toContainText('Estudio Dental Mendieta');
  });
}

// test: el detalle de evento con un id válido del propio paciente renderiza (no 404)
test('Sub-ruta de evento con id válido del paciente renderiza', async ({ page }) => {
  const s = await page.evaluate(() => JSON.parse(localStorage.getItem('edm:v1:state')!));
  const ev = s.clinicalEvents.find((e: any) => e.pacienteId === 'pac-003');
  test.skip(!ev, 'sin evento para pac-003');
  await page.goto(`/pacientes/pac-003/evento/${ev.id}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('No encontramos esta página')).toHaveCount(0);
  await expect(page.getByRole('banner').getByRole('heading', { level: 1, name: 'Pacientes' })).toBeVisible();
});
