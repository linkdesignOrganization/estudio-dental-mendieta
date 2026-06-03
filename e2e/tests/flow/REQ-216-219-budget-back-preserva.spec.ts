import { test, expect } from '@playwright/test';
import { warmSeed } from '../_helpers/seed';

/**
 * Flow Tester · Iteración 5 — F02 + BUG-F01 CORREGIDOS (REQ-216 / REQ-219).
 *
 * Criterio: al crear un presupuesto, ir "Atrás" del Paso 2 → Paso 1 debe PRESERVAR la
 * selección del paciente del Paso 1 (estado en `BudgetFlowService`, no en el componente),
 * de modo que se pueda volver a avanzar SIN re-seleccionar, y la selección de tratamientos
 * del Paso 2 también se conserva. El comportamiento corregido lo respalda el servicio
 * singleton (pacienteId/tipoIds son signals compartidas entre los pasos).
 *
 * ESTADO ACTUAL (verificado en vivo contra el deploy, ronda iteración 5, ambos projects):
 *  - La PRESERVACIÓN DE ESTADO funciona: tras "Atrás", `next()` pasa el guard
 *    `tienePaciente()` y avanza al Paso 2 sin error de validación; los tratamientos siguen
 *    marcados (total intacto) y el Paso 3 arrastra "Para: Diego Sosa". → REQ-219 PASA.
 *  - BUG-F01 CORREGIDO (Developer: viewChild + afterNextRender en budget-create.component.ts):
 *    el control nativo `<select id="b-pac">` AHORA SÍ re-muestra el paciente preservado tras
 *    "Atrás" — su `.value` vuelve a ser "pac-005" y la opción visible es "Diego Sosa" (ya NO
 *    el placeholder "Elegí un paciente"). REQ-216 ("el select conserva el paciente") PASA.
 *    Como el re-sync ocurre en `afterNextRender`, se verifica con espera web-first / poll del
 *    value (no lectura síncrona): el binding se aplica un microtick después del re-render.
 *
 * Anti-demo (REQ-272) barrido en cada pantalla.
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;
const TOTAL_DOS_TRATAMIENTOS = '$ 163.000'; // Consulta y diagnóstico (18.000) + Tratamiento de conducto (145.000)

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// test: REQ-219 — "Atrás" preserva el ESTADO del flujo: se avanza de nuevo SIN re-seleccionar el
// paciente (sin error de validación) y los tratamientos del Paso 2 quedan marcados (total intacto).
// El resumen del Paso 3 arrastra el paciente preservado.
test('REQ-219: "Atrás" preserva el flujo — avanza sin re-seleccionar y conserva los tratamientos', async ({ page }) => {
  await page.goto('/facturacion/presupuestos/nuevo/paciente', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();

  // Paso 1: elegir paciente.
  await page.locator('#b-pac').selectOption('Diego Sosa');
  await expect(page.locator('#b-pac')).toHaveValue('pac-005');
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Paso 2: marcar dos tratamientos → total calculado.
  await expect(page).toHaveURL(/\/nuevo\/items$/);
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Consulta y diagnóstico' }).check();
  await page.getByRole('checkbox', { name: 'Tratamiento de conducto' }).check();
  await expect(page.locator('.wiz__running-total')).toHaveText(TOTAL_DOS_TRATAMIENTOS);

  // "Atrás" → Paso 1 (gate de navegación: esperar el control del Paso 1).
  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page).toHaveURL(/\/nuevo\/paciente$/);
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  await expect(page.locator('#b-pac')).toBeVisible();
  // Con BUG-F01 corregido, el select además RE-MUESTRA el paciente (value=pac-005) — web-first,
  // porque el re-sync ocurre en afterNextRender tras el re-render del Paso 1.
  await expect(page.locator('#b-pac')).toHaveValue('pac-005');

  // CLAVE de la preservación (REQ-219): avanzar de nuevo SIN volver a tocar el select.
  // Como el servicio conserva pacienteId, `next()` no muestra el error y navega al Paso 2.
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/nuevo\/items$/);
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();
  await expect(page.getByText('Elegí un paciente para continuar.')).toHaveCount(0);

  // Los tratamientos del Paso 2 se preservaron (sin volver a marcarlos): total y checks intactos.
  await expect(page.getByRole('checkbox', { name: 'Consulta y diagnóstico' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Tratamiento de conducto' })).toBeChecked();
  await expect(page.locator('.wiz__running-total')).toHaveText(TOTAL_DOS_TRATAMIENTOS);

  // Paso 3: el paciente preservado se arrastra al resumen (confirma que el id NO se perdió).
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/nuevo\/confirmar$/);
  await expect(page.getByText('Para: Diego Sosa')).toBeVisible();
  await expect(page.getByText('Total', { exact: true }).locator('xpath=following-sibling::*[1]').first()).toHaveText(TOTAL_DOS_TRATAMIENTOS);

  // Anti-demo en el wizard.
  expect(await page.locator('main').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// test: REQ-216 (BUG-F01 CORREGIDO) — el control nativo `<select id="b-pac">` RE-MUESTRA el paciente
// preservado tras "Atrás": su value vuelve a ser "pac-005" y la opción visible es "Diego Sosa" (NO
// el placeholder "Elegí un paciente"). El fix (viewChild + afterNextRender) re-sincroniza la opción
// mostrada al re-renderizar el Paso 1, así que el value se asserta con espera web-first / poll (el
// re-sync ocurre un microtick DESPUÉS del re-render — no leer síncronamente).
test('REQ-216: el <select> re-muestra el paciente preservado tras "Atrás" (BUG-F01 corregido)', async ({ page }) => {
  await page.goto('/facturacion/presupuestos/nuevo/paciente', { waitUntil: 'domcontentloaded' });
  await page.locator('#b-pac').selectOption('Diego Sosa');
  await expect(page.locator('#b-pac')).toHaveValue('pac-005');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();

  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  await expect(page.locator('#b-pac')).toBeVisible();

  // Comportamiento CORREGIDO: el select recupera el paciente (value=pac-005), NO vuelve al
  // placeholder. `toHaveValue` reintenta (web-first) hasta que afterNextRender re-sincroniza la
  // opción mostrada, por eso no se hace una lectura síncrona del value.
  await expect(page.locator('#b-pac')).toHaveValue('pac-005');
  await expect(page.locator('#b-pac option:checked')).toHaveText('Diego Sosa');

  // Y la opción placeholder ya NO es la seleccionada (candado contra una regresión al estado previo).
  await expect(page.locator('#b-pac option:checked')).not.toHaveText('Elegí un paciente');
});
