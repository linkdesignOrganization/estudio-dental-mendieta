import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed, openNav, openPatient } from '../_helpers/seed';

/**
 * Iteración 2 (Pacientes — ficha a fondo) · Flow Tester · Ronda 1.
 *
 * Cubre los GAPS sin aserción dedicada que el Developer agregó/corrigió:
 *  - REQ-186 — Detalle de pieza dental: nombre clínico FDI de la pieza + historial
 *    REAL de procedimientos derivado del store (NO hardcodeado). El control editable
 *    de estado YA está cubierto por UX-028/UX-086 → aquí NO se duplica; se asevera el
 *    NOMBRE de la pieza y el HISTORIAL.
 *  - REQ-128 — Tab Información general (camino POBLADO): contacto de emergencia REAL
 *    (con su valor, no placeholder) + número de afiliado junto a la obra social. El
 *    camino VACÍO (placeholder "Sin contacto registrado") YA lo cubre DC-106 sobre
 *    pac-007 → aquí se cubre el camino con datos en un paciente distinto (pac-001).
 *
 * Datos del seed (deterministas, verificados en vivo contra el deploy):
 *  - pac-003 "Agustín Benítez", profesional de cabecera "Dra. Carolina Etcheverry".
 *      · pieza 18 (FDI cuad.1 pos.8 → "Tercer molar superior derecho") = OBTURACIÓN
 *        → historial = los 3 pasos clínicos de una obturación.
 *      · pieza 28 (FDI cuad.2 pos.8 → "Tercer molar superior izquierdo") = EN TRATAMIENTO
 *        → historial endodóntico DISTINTO (prueba de que es derivado del estado, no fijo).
 *  - pac-001 "Bautista Álvarez": contacto de emergencia "Soledad Álvarez (Hijo/a)" y
 *    número de afiliado real junto a obra social "OSDE".
 *
 * Camino del usuario real (no deep-link forzado salvo donde se indica regresión):
 *  listado → ficha → odontograma → pieza.
 */

const COPY_VACIO_PIEZA = 'Sin procedimientos registrados en esta pieza';

/** Localiza la card "Historial de la pieza" del detalle de pieza. */
function historialPieza(page: Page) {
  return page
    .locator('aside')
    .filter({ has: page.getByRole('heading', { name: 'Historial de la pieza' }) });
}

/** Texto de todas las descripciones del historial (la 2.ª línea de cada ítem). */
async function descripcionesHistorial(page: Page): Promise<string[]> {
  const items = historialPieza(page).locator('li');
  await expect(items.first()).toBeVisible();
  const out: string[] = [];
  for (let i = 0; i < (await items.count()); i++) {
    // cada <li> es "fecha · profesional" + "descripción" → 2 spans
    out.push((await items.nth(i).locator('span').last().innerText()).trim());
  }
  return out;
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-186 — nombre clínico FDI + historial real (camino del usuario completo)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-186 — flujo real listado → ficha → odontograma → pieza con historial.
// Asevera el NOMBRE clínico FDI y el HISTORIAL real de procedimientos (no hardcodeado).
test('REQ-186: el detalle de una pieza con tratamiento muestra su nombre clínico FDI y el historial real (flujo completo)', async ({ page }) => {
  // 1) Listado → 2) ficha del paciente (camino real, no deep-link).
  await gotoApp(page, '/pacientes');
  await openPatient(page, 'Agustín Benítez');
  await expect(page).toHaveURL(/\/pacientes\/pac-003(\/informacion)?$/);
  await expect(page.getByRole('heading', { name: 'Agustín Benítez', level: 1 })).toBeVisible();

  // 3) Tab Odontograma.
  await page.getByRole('tab', { name: 'Odontograma' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-003\/odontograma$/);
  await expect(page.getByRole('heading', { name: 'Odontograma' })).toBeVisible();

  // 4) Pieza con tratamiento previo: la 18 está marcada "Obturación" en el odontograma.
  //    (La elegimos por su aria-label de estado, no por suposición ciega.)
  const pieza18 = page.getByRole('button', { name: /^Pieza 18 .*Obturación/ });
  await expect(pieza18).toBeVisible();
  await pieza18.click();
  await expect(page).toHaveURL(/\/pacientes\/pac-003\/pieza\/18$/);

  // (a) NOMBRE CLÍNICO FDI en el encabezado: número + nombre, no solo "Pieza 18".
  await expect(
    page.getByRole('heading', { name: 'Pieza 18 · Tercer molar superior derecho' }),
  ).toBeVisible();
  // Y la línea de numeración FDI/Universal acompaña (DC-045).
  await expect(page.getByText(/Numeración FDI · Universal\s*1\b/)).toBeVisible();

  // Coherencia: el estado actual de la pieza es Obturación.
  await expect(page.getByText('Estado actual')).toBeVisible();

  // (b) HISTORIAL REAL: NO aparece el estado vacío y SÍ hay procedimientos reales.
  const historial = historialPieza(page);
  await expect(historial).toBeVisible();
  await expect(historial.getByText(COPY_VACIO_PIEZA)).toHaveCount(0);

  const descripciones = await descripcionesHistorial(page);
  // Una obturación deja huella de 3 pasos clínicos coherentes (diagnóstico → remoción → restauración).
  expect(descripciones.length).toBe(3);
  expect(descripciones).toContain('Obturación con resina compuesta');
  expect(descripciones).toContain('Remoción de tejido cariado y aislamiento');
  expect(descripciones).toContain('Diagnóstico de caries en radiografía');

  // El historial NO es un texto genérico/hardcodeado: cada entrada lleva fecha real
  // (dd/mm/aaaa) y el profesional de cabecera REAL del paciente (Dra. Carolina Etcheverry).
  const metas = historial.locator('li span').first();
  await expect(metas).toHaveText(/\d{2}\/\d{2}\/\d{4} · Dra\. Carolina Etcheverry/);
  // Al menos un ítem atribuye el procedimiento a ese profesional (atribución real).
  await expect(
    historial.getByText(/· Dra\. Carolina Etcheverry/).first(),
  ).toBeVisible();
});

// test: REQ-186 — el historial VARÍA según el estado real de la pieza (prueba de que
// es derivado del store y NO un bloque hardcodeado idéntico para todas las piezas).
test('REQ-186: el historial de la pieza es derivado del estado real (dos piezas distintas → historiales distintos)', async ({ page }) => {
  // Pieza 18 (Obturación) — control 1.
  await gotoApp(page, '/pacientes/pac-003/pieza/18');
  await expect(
    page.getByRole('heading', { name: 'Pieza 18 · Tercer molar superior derecho' }),
  ).toBeVisible();
  const histObturacion = await descripcionesHistorial(page);
  expect(histObturacion).toContain('Obturación con resina compuesta');

  // Pieza 28 (En tratamiento) — control 2: distinto nombre FDI y distinto historial.
  await gotoApp(page, '/pacientes/pac-003/pieza/28');
  await expect(
    page.getByRole('heading', { name: 'Pieza 28 · Tercer molar superior izquierdo' }),
  ).toBeVisible();
  const histTratamiento = await descripcionesHistorial(page);
  // Historial endodóntico coherente con "en tratamiento".
  expect(histTratamiento).toContain('Sesión de tratamiento de conducto');
  expect(histTratamiento).toContain('Apertura cameral y diagnóstico endodóntico');

  // PRUEBA CLAVE de "real, no hardcodeado": el contenido de ambas piezas difiere.
  expect(histTratamiento).not.toEqual(histObturacion);
  expect(histTratamiento).not.toContain('Obturación con resina compuesta');
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-128 — Tab Información: contacto de emergencia REAL + número de afiliado
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-128 — camino POBLADO. pac-001 tiene contacto de emergencia y afiliado:
// se renderizan sus VALORES reales (no el placeholder "Sin contacto registrado").
test('REQ-128: el tab Información muestra el contacto de emergencia real y el número de afiliado (camino poblado)', async ({ page }) => {
  // Camino real: listado → ficha (tab Información es el tab por defecto de la ficha).
  await gotoApp(page, '/pacientes');
  await openPatient(page, 'Bautista Álvarez');
  await expect(page).toHaveURL(/\/pacientes\/pac-001(\/informacion)?$/);
  await expect(page.getByRole('tab', { name: 'Información general', selected: true })).toBeVisible();

  // --- Card Contacto: contacto de emergencia con su VALOR real ---
  // Nota: el tabpanel también es un <section> que contiene el heading "Contacto";
  // acotamos a la card real (`section.info-card`) para evitar colisión de strict-mode.
  const contacto = page
    .locator('section.info-card')
    .filter({ has: page.getByRole('heading', { name: 'Contacto' }) });
  await expect(contacto).toBeVisible();

  // El término existe y su definición es el contacto real (nombre (relación) · teléfono),
  // NO el placeholder vacío.
  const ceTerm = contacto.getByRole('term').filter({ hasText: 'Contacto de emergencia' });
  const ceValue = ceTerm.locator('xpath=following-sibling::dd[1]');
  await expect(ceValue).toBeVisible();
  await expect(ceValue).toHaveText('Soledad Álvarez (Hijo/a) · +54 11 5309-1236');
  // Formato real: nombre + relación entre paréntesis + teléfono argentino.
  await expect(ceValue).toContainText('Soledad Álvarez');
  await expect(ceValue).toContainText(/\(Hijo\/a\)/);
  await expect(ceValue).toContainText(/\+54 11 \d{4}-\d{4}/);
  // NO es el placeholder del camino vacío (DC-106).
  await expect(contacto.getByText('Sin contacto registrado')).toHaveCount(0);

  // --- Card Obra social: número de afiliado junto a la cobertura ---
  const obraSocial = page
    .locator('section.info-card')
    .filter({ has: page.getByRole('heading', { name: 'Obra social' }) });
  await expect(obraSocial).toBeVisible();
  await expect(
    obraSocial.getByRole('term').filter({ hasText: 'Cobertura' }).locator('xpath=following-sibling::dd[1]'),
  ).toHaveText('OSDE');

  const afiliadoValue = obraSocial
    .getByRole('term')
    .filter({ hasText: 'Número de afiliado' })
    .locator('xpath=following-sibling::dd[1]');
  await expect(afiliadoValue).toBeVisible();
  // Un número de afiliado real (no vacío, no el guion "—" del camino sin dato).
  await expect(afiliadoValue).toHaveText('5653 1461 3760');
  await expect(afiliadoValue).not.toHaveText('—');
  await expect(afiliadoValue).toHaveText(/\d/);
});

// test: REQ-128 — regresión por deep-link directo a /informacion (ruta canónica).
// Confirma que el camino poblado también se hidrata en carga directa (SeedReadyGuard).
test('REQ-128: el contacto de emergencia y el afiliado se hidratan en deep-link directo a /informacion', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/informacion');
  await expect(page.getByRole('heading', { name: 'Bautista Álvarez', level: 1 })).toBeVisible();

  // Contacto poblado + afiliado presentes en carga directa (sin pasar por el listado).
  await expect(page.getByText('Soledad Álvarez (Hijo/a) · +54 11 5309-1236')).toBeVisible();
  await expect(page.getByText('5653 1461 3760')).toBeVisible();
  // Y el placeholder del camino vacío NO aparece.
  await expect(page.getByText('Sin contacto registrado')).toHaveCount(0);
});

// test: REQ-128 (mobile) — el camino poblado es legible también en viewport chico.
// (El sub-tester Visual ya cubre tokens/responsive; aquí solo se confirma que el dato
// real se renderiza en ambos projects sin colapsar la card.)
test('REQ-128: contacto de emergencia y afiliado visibles en la ficha (ambos viewports)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/informacion');
  // openNav no es necesario aquí (no navegamos por el sidebar), pero garantizamos que
  // el drawer móvil no tape el contenido si estuviese abierto por defecto.
  await openNav(page).catch(() => {});
  await expect(page.getByText('Soledad Álvarez (Hijo/a) · +54 11 5309-1236')).toBeVisible();
  await expect(page.getByText('Número de afiliado')).toBeVisible();
  await expect(page.getByText('5653 1461 3760')).toBeVisible();
});
