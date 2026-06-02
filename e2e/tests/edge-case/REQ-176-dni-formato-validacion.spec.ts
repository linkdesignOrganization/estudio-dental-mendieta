import { test, expect, Page } from '@playwright/test';
import { gotoApp } from '../_helpers/seed';

/**
 * Iteración 4 (Pacientes escritura + Tratamientos) · Edge Case Tester · Ronda 1.
 *
 * REQ-176 — Crear paciente, Paso 1: valida inline los requeridos (nombre/apellido) y
 * el FORMATO del DNI (7-8 dígitos). "Siguiente" NO avanza a `/pacientes/nuevo/clinico`
 * con DNI inválido y muestra el error JUNTO al campo.
 *
 * Reglas verificadas contra el código de producción (patient-create.component.ts):
 *   - `dniValido` = los dígitos del valor (tras quitar no-dígitos) son ≥7 y ≤8.
 *     → "123" (3), "123456" (6) y "123456789" (9) son INVÁLIDOS; "1234567" (7) y
 *       "30123456" (8) son VÁLIDOS. Los puntos del formato AR ("30.123.456") NO cuentan.
 *   - El error es CONDICIONAL a `touched()` (solo tras intentar avanzar/guardar), por lo
 *     que un Paso 1 recién cargado NO muestra errores (control negativo).
 *   - Copy de producción inline (junto al input DNI): "Ingresá un DNI válido."
 *
 * Camino del usuario REAL: ruta dedicada `/pacientes/nuevo/datos` (la ruta `/pacientes/nuevo`
 * no existe). No muta estado persistido → no requiere resetSeed (el wizard vive en un signal
 * en memoria; cada test arranca en una página fresca).
 */

const ERR_DNI = 'Ingresá un DNI válido.';
const ERR_NOMBRE = 'Ingresá el nombre.';
const ERR_APELLIDO = 'Ingresá el apellido.';

// El copy NUNCA debe revelar lenguaje de demo/mock (REQ-272 transversal).
const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

/** Abre el Paso 1 del alta y espera el form personal listo. */
async function gotoPaso1(page: Page): Promise<void> {
  await gotoApp(page, '/pacientes/nuevo/datos');
  await expect(page.getByRole('heading', { name: 'Datos personales', level: 3 })).toBeVisible();
  await expect(page.getByText('Paso 1 de 2')).toBeVisible();
}

/** Localiza el <span class="field__error"> que sigue a un input por su placeholder de DNI. */
function dniError(page: Page) {
  return page.getByText(ERR_DNI);
}

// ───────────────────────────────────────────────────────────────────────────
// REQ-176 — DNI inválido bloquea el avance + error inline
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-176 — con nombre+apellido válidos pero DNI corto (3 dígitos), "Siguiente"
// no navega a /clinico y aparece el error inline SOLO en el campo DNI.
test('REQ-176: DNI de 3 dígitos bloquea "Siguiente" y muestra el error inline solo en DNI', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Mariano');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Quiroga');
  await page.getByRole('textbox', { name: 'DNI' }).fill('123');

  await page.getByRole('button', { name: 'Siguiente' }).click();

  // NO avanza: la URL permanece en el Paso 1.
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(page.getByRole('heading', { name: 'Datos personales', level: 3 })).toBeVisible();

  // Error inline EN DNI; nombre/apellido (válidos) NO muestran error.
  await expect(dniError(page)).toBeVisible();
  await expect(page.getByText(ERR_NOMBRE)).toHaveCount(0);
  await expect(page.getByText(ERR_APELLIDO)).toHaveCount(0);
});

// test: REQ-176 — DNI con letras (no numérico) también es inválido (los no-dígitos no
// cuentan; "abcd" → 0 dígitos). No avanza.
test('REQ-176: DNI con letras es inválido — no avanza y muestra el error', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Lucía');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Ferreyra');
  await page.getByRole('textbox', { name: 'DNI' }).fill('DNI-abcd');

  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(dniError(page)).toBeVisible();
});

// test: REQ-176 — DNI de 9 dígitos (excede el máximo de 8) es inválido. No avanza.
test('REQ-176: DNI de 9 dígitos excede el máximo y bloquea el avance', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Ramiro');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Domínguez');
  await page.getByRole('textbox', { name: 'DNI' }).fill('123456789');

  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(dniError(page)).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-176 — requeridos vacíos: nombre/apellido también bloquean
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-176 — con TODOS los requeridos vacíos, "Siguiente" no avanza y muestra los
// 3 errores inline (nombre, apellido y DNI) a la vez.
test('REQ-176: requeridos vacíos bloquean el avance y muestran los 3 errores inline', async ({ page }) => {
  await gotoPaso1(page);

  // Control negativo: el Paso 1 recién cargado NO muestra errores (touched=false).
  await expect(page.getByText(ERR_NOMBRE)).toHaveCount(0);
  await expect(page.getByText(ERR_APELLIDO)).toHaveCount(0);
  await expect(dniError(page)).toHaveCount(0);

  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(page.getByText(ERR_NOMBRE)).toBeVisible();
  await expect(page.getByText(ERR_APELLIDO)).toBeVisible();
  await expect(dniError(page)).toBeVisible();
});

// test: REQ-176 — nombre presente pero apellido vacío (+ DNI válido) bloquea por el
// apellido; el error de nombre NO aparece. Aísla la validación por-campo.
test('REQ-176: apellido vacío bloquea el avance aunque nombre y DNI sean válidos', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Camila');
  await page.getByRole('textbox', { name: 'DNI' }).fill('30123456');

  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(page.getByText(ERR_APELLIDO)).toBeVisible();
  await expect(page.getByText(ERR_NOMBRE)).toHaveCount(0);
  await expect(dniError(page)).toHaveCount(0);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-176 — frontera válida: 7 y 8 dígitos SÍ avanzan (control positivo)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-176 — DNI de 8 dígitos con requeridos completos SÍ avanza a /clinico (límite
// superior válido). Prueba que la validación no es un bloqueo permanente.
test('REQ-176 (control positivo): DNI de 8 dígitos válido avanza a /nuevo/clinico', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Valentina');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Gómez');
  await page.getByRole('textbox', { name: 'DNI' }).fill('30123456');

  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
  await expect(page.getByRole('heading', { name: 'Datos clínicos y de cobertura', level: 3 })).toBeVisible();
});

// test: REQ-176 — frontera inferior: 7 dígitos también es válido y avanza.
test('REQ-176 (control positivo): DNI de 7 dígitos (límite inferior) avanza a /nuevo/clinico', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Tomás');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Ríos');
  await page.getByRole('textbox', { name: 'DNI' }).fill('1234567');

  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
});

// test: REQ-176 — el DNI formateado con puntos ("30.123.456" = 8 dígitos) es válido:
// la validación cuenta dígitos, no caracteres. Avanza.
test('REQ-176 (control positivo): DNI con puntos "30.123.456" (8 dígitos) es válido', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Florencia');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Pereyra');
  await page.getByRole('textbox', { name: 'DNI' }).fill('30.123.456');

  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-176 — corrección en vivo: tras corregir el DNI, el avance se desbloquea
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-176 — tras un intento fallido (error visible), corregir el DNI a uno válido
// permite avanzar: el error es reactivo al valor actual del campo.
test('REQ-176: corregir el DNI inválido por uno válido desbloquea el avance', async ({ page }) => {
  await gotoPaso1(page);

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Brenda');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Acosta');
  await page.getByRole('textbox', { name: 'DNI' }).fill('12');
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(dniError(page)).toBeVisible();

  // Corrijo a un DNI válido → el error desaparece y ahora avanza.
  await page.getByRole('textbox', { name: 'DNI' }).fill('28456789');
  await expect(dniError(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
});

// test: REQ-176 — el error inline del DNI usa copy de producción (no delata demo/mock).
test('REQ-176: el error de validación del DNI no revela demo/mock (copy de producción)', async ({ page }) => {
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'DNI' }).fill('1');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(dniError(page)).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(DEMO_FORBIDDEN);
});
