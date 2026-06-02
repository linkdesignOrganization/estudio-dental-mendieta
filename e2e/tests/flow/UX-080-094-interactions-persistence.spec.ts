import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, readState, patientRow } from '../_helpers/seed';

/**
 * Interacciones / Persistencia (columna vertebral) — UX-080..UX-094.
 * Búsqueda inline, filtro único, toggles, tab-inactivo-fuera-del-DOM, persistencia,
 * notificaciones, reset (copy de producción), cero rastro de demo.
 *
 * Responsive (R2): el resultado del buscador se verifica vía el contador en vivo
 * y la fila/card VISIBLE (`patientRow`) — en mobile el <span> del nombre dentro
 * de la tabla oculta (display:none) tiene caja 0 y no es "visible" para Playwright.
 */

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: UX-080 — buscador inline contextual filtra en vivo, solo en la pantalla activa
// R2: la fila resultante se verifica con patientRow (fila/card VISIBLE) — el span
// del nombre dentro de la tabla oculta en mobile tiene caja 0 (no "visible").
test('UX-080: el buscador de pacientes filtra en vivo por nombre', async ({ page }) => {
  await gotoApp(page, '/pacientes');
  await page.getByRole('searchbox', { name: 'Buscar pacientes' }).fill('Sosa');
  // Filtra en vivo: el contador refleja el único resultado y el paciente es visible.
  await expect(page.getByText('1–1 de 1')).toBeVisible();
  await expect(patientRow(page, 'Diego Sosa')).toBeVisible();
  // No hay búsqueda global ni command palette en el header (la única búsqueda vive en <main>).
  const headerSearchCount = await page.locator('header input[type="search"], header [role="searchbox"]').count();
  expect(headerSearchCount).toBe(0);
});

// test: UX-081 — filtro único visible (por profesional) actualiza la lista sin reload
test('UX-081: filtro por profesional en agenda sin recargar', async ({ page }) => {
  await gotoApp(page, '/agenda');
  const filtro = page.getByLabel('Filtrar por profesional');
  await expect(filtro).toBeVisible();
  await filtro.selectOption({ index: 1 });
  // Sigue en /agenda (sin navegar a otra pantalla).
  await expect(page).toHaveURL(/\/agenda/);
  await expect(page.getByRole('group', { name: 'Vista del calendario' })).toBeVisible();
});

// test: UX-082 — toggle Mes/Semana/Día (sin navegar) + toggle Card/Tabla en pacientes
test('UX-082: toggles de vista de agenda y de pacientes', async ({ page }) => {
  await gotoApp(page, '/agenda');
  await page.getByRole('button', { name: 'Semana' }).click();
  await expect(page).toHaveURL(/\?vista=semana/);

  await gotoApp(page, '/pacientes');
  await page.getByRole('button', { name: 'Vista de tarjetas' }).click();
  // El toggle alterna la vista sin introducir filtros/acciones extra.
  await expect(page.getByRole('group', { name: 'Cambiar vista' })).toBeVisible();
  await expect(page).toHaveURL(/\/pacientes/);
});

// test: UX-083 / BVC-013 — tab inactivo NO en el DOM
test('UX-083: el contenido del tab inactivo no está en el DOM', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-003/informacion');
  // Un solo tabpanel renderizado.
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  // El contenido del odontograma (Arcada superior) NO está presente en el tab Información.
  await expect(page.getByText('Arcada superior')).toHaveCount(0);
  // Cambiar al tab Odontograma lo trae al DOM.
  await page.getByRole('tab', { name: 'Odontograma' }).click();
  await expect(page.getByText('Arcada superior')).toBeVisible();
  // Y el contenido de Información (Datos personales) ya no está.
  await expect(page.getByRole('heading', { name: 'Datos personales' })).toHaveCount(0);
});

// test: UX-084 — persistencia entre sesiones (cubierta a fondo en flujos críticos; smoke aquí)
test('UX-084: una escritura (pago) sobrevive a refresh real', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-008/pagos');
  await page.getByRole('link', { name: 'Registrar pago' }).click();
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('12345');
  await page.getByRole('textbox', { name: 'Concepto (opcional)' }).fill('Pago verificación persistencia');
  await page.getByRole('button', { name: 'Confirmar pago' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-008\/pagos$/);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Pago verificación persistencia').first()).toBeVisible();
});

// test: UX-085 — cargos (−) vs pagos (+) distinguidos visualmente
test('UX-085: cargos y pagos se distinguen por signo en los movimientos', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/pagos');
  // Hay al menos un cargo (+) y un pago (−) en la cuenta corriente.
  await expect(page.getByText(/\+\$\s?[\d.]+/).first()).toBeVisible();
  await expect(page.getByText(/−\$\s?[\d.]+/).first()).toBeVisible();
});

// test: UX-086 — odontograma usa numeración FDI con universal en el detalle
test('UX-086: el detalle de pieza muestra FDI + universal', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/pieza/13');
  await expect(page.getByRole('heading', { name: 'Pieza 13' })).toBeVisible();
  await expect(page.getByText(/Universal\s*6/)).toBeVisible();
});

// test: UX-087 — disponibilidad real: el Paso 2 muestra horarios y nota de ocupados
test('UX-087: el Paso 2 de turno muestra horarios disponibles y excluye ocupados', async ({ page }) => {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: /Agustín Benítez/ }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('Profesional').selectOption({ index: 1 });
  await page.getByRole('textbox', { name: 'Fecha' }).fill('2026-06-29');
  await expect(page.getByText('Horarios disponibles')).toBeVisible();
  await expect(page.getByText(/horarios ocupados de este profesional no están disponibles/i)).toBeVisible();
  await expect(page.getByRole('button', { name: '10:00' })).toBeVisible();
});

// test: UX-089 — validación inline antes de enviar (Confirmar pago deshabilitado en vacío)
test('UX-089: validación inline — Confirmar pago deshabilitado sin monto', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/pagos/nuevo');
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled();
  await page.getByRole('spinbutton', { name: 'Monto (ARS)' }).fill('1000');
  await expect(page.getByRole('button', { name: 'Confirmar pago' })).toBeEnabled();
});

// test: UX-090 / UX-094 — "Restablecer datos" solo en Configuración, copy de producción
test('UX-090/UX-094: Restablecer datos vive en Configuración con copy de producción', async ({ page }) => {
  await gotoApp(page, '/configuracion');
  await expect(page.getByRole('button', { name: 'Restablecer datos' })).toBeVisible();
  // Confirmación con copy de producción (sin "demo"/"resetear demo").
  await page.getByRole('button', { name: 'Restablecer datos' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Restablecer los datos' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Se perderán todos los cambios/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Sí, restablecer' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  // No revela lenguaje de demo en ningún lado de Configuración.
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/\b(demo|mock|simulaci|resetear demo|viewcase|link design)\b/i);
});

// test: UX-090b — el footer NO contiene el reset ni atribución
test('UX-090: el footer no tiene reset ni lenguaje de demo', async ({ page }) => {
  await gotoApp(page, '/reportes');
  const footer = page.locator('main p').last();
  const txt = await footer.innerText();
  expect(txt).not.toMatch(/restablecer|resetear|demo|link design|portfolio/i);
});

// test: UX-092 — notificaciones internas navegables (panel <50%, leído/no-leído, contador)
test('UX-092: panel de notificaciones con leído/no-leído y navegación', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await page.getByRole('button', { name: 'Notificaciones' }).click();
  const dialog = page.getByRole('dialog', { name: 'Notificaciones' });
  await expect(dialog).toBeVisible();
  // Filtros Todas / Sin leer y estados "Sin leer".
  await expect(dialog.getByRole('tab', { name: 'Todas' })).toBeVisible();
  await expect(dialog.getByRole('tab', { name: 'Sin leer' })).toBeVisible();
  await expect(dialog.getByText('Sin leer').first()).toBeVisible();
});

// test: UX-094 / BVC-027 — cero rastro de demo en el copy a lo largo de la app
test('UX-094: ninguna pantalla revela demo/mock/ARCA/AFIP', async ({ page }) => {
  const screens = [
    '/reportes', '/agenda', '/pacientes', '/pacientes/pac-001/pagos',
    '/tratamientos', '/facturacion/presupuestos', '/facturacion/facturas',
    '/facturacion/obras-sociales', '/configuracion', '/ayuda', '/no-encontrado',
  ];
  const forbidden = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design|resetear demo|arca|afip)\b/i;
  for (const sc of screens) {
    await gotoApp(page, sc).catch(async () => { await page.goto(sc, { waitUntil: 'domcontentloaded' }); });
    const body = await page.locator('body').innerText();
    expect(body, `Palabra prohibida encontrada en ${sc}`).not.toMatch(forbidden);
  }
});
