import { test, expect, Page } from '@playwright/test';
import { gotoApp } from '../_helpers/seed';

/**
 * Iteración 4 (Pacientes escritura + Tratamientos) · Edge Case Tester · Ronda 1.
 *
 * REQ-177 — Crear paciente:
 *   (a) "Cancelar" CON datos cargados pide CONFIRMACIÓN antes de descartar (no descarta
 *       en silencio). El alta usa `app-confirm-dialog`; considera datos de AMBOS pasos.
 *   (b) "Atrás" desde el Paso 2 PRESERVA los datos del Paso 1 (re-ancla la rama de
 *       cancelación que UX-024 no cubría: el wizard vive en un signal singleton que
 *       sobrevive la navegación entre las dos rutas).
 *
 * Copy de producción del diálogo de descarte (verificado en vivo contra el deploy):
 *   - título:   "Descartar el paciente"
 *   - mensaje:  "Tenés datos cargados. ¿Querés descartar y salir?"
 *   - acciones: "Seguir editando" (secundaria, foco inicial) + "Sí, descartar" (destructiva)
 *
 * Reglas del código (patient-create.component.ts):
 *   - `cancel()` muestra el diálogo SOLO si `wizardTieneDatos()` (alguno de los campos del
 *     Paso 1/2 cargado). Sin datos → sale DIRECTO a `/pacientes` sin diálogo.
 *   - "Cancelar" se dispara desde el back-link "Pacientes" (arriba a la izquierda).
 *   - "Seguir editando" cierra el diálogo y permanece en el wizard (no descarta).
 *   - "Sí, descartar" limpia el wizard y navega a `/pacientes`.
 *
 * No persiste nada en localStorage (el alta solo escribe al pulsar "Crear paciente", que
 * estos casos NO hacen) → no requiere resetSeed.
 */

const DLG_TITULO = 'Descartar el paciente';
const DLG_MENSAJE = 'Tenés datos cargados. ¿Querés descartar y salir?';

// El copy del diálogo NUNCA debe revelar lenguaje de demo/mock (REQ-272 transversal).
const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

const dialog = (page: Page) => page.getByRole('alertdialog', { name: DLG_TITULO });
const backLink = (page: Page) => page.getByRole('button', { name: 'Pacientes' });

async function gotoPaso1(page: Page): Promise<void> {
  await gotoApp(page, '/pacientes/nuevo/datos');
  await expect(page.getByRole('heading', { name: 'Datos personales', level: 3 })).toBeVisible();
}

// ───────────────────────────────────────────────────────────────────────────
// REQ-177 (a) — Cancelar CON datos pide confirmación
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-177 — con datos cargados en el Paso 1, "Cancelar" (back-link Pacientes) abre el
// diálogo de confirmación con el copy exacto; NO navega todavía.
test('REQ-177: "Cancelar" con datos cargados abre el diálogo de confirmación (no descarta directo)', async ({ page }) => {
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Esteban');

  await backLink(page).click();

  // Permanece en el wizard y aparece el diálogo con el copy de producción.
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).getByRole('heading', { name: DLG_TITULO })).toBeVisible();
  await expect(page.getByText(DLG_MENSAJE)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Seguir editando' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sí, descartar' })).toBeVisible();
});

// test: REQ-177 — "Seguir editando" cierra el diálogo y NO descarta: el dato del Paso 1
// sigue cargado y seguimos en el wizard.
test('REQ-177: "Seguir editando" cierra el diálogo y conserva los datos (no descarta)', async ({ page }) => {
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Esteban');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Maldonado');

  await backLink(page).click();
  await expect(dialog(page)).toBeVisible();

  await page.getByRole('button', { name: 'Seguir editando' }).click();

  // Diálogo cerrado, seguimos en el Paso 1 y el dato persiste.
  await expect(dialog(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Esteban');
  await expect(page.getByRole('textbox', { name: 'Apellido' })).toHaveValue('Maldonado');
});

// test: REQ-177 — "Sí, descartar" descarta el alta y navega a /pacientes. Además, el wizard
// queda LIMPIO: un nuevo alta arranca en blanco (no arrastra los datos descartados).
test('REQ-177: "Sí, descartar" descarta y vuelve a /pacientes; el wizard queda en blanco', async ({ page }) => {
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Esteban');

  await backLink(page).click();
  await expect(dialog(page)).toBeVisible();

  await page.getByRole('button', { name: 'Sí, descartar' }).click();

  // Navega al listado.
  await expect(page).toHaveURL(/\/pacientes$/);

  // Un alta nuevo arranca en blanco (el descarte limpió el signal del wizard).
  await gotoPaso1(page);
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('');
});

// test: REQ-177 — datos cargados en el PASO 2 (no en el Paso 1) también disparan la
// confirmación: el diálogo considera ambos pasos, no solo el campo del paso visible.
test('REQ-177: datos cargados en el Paso 2 también disparan la confirmación', async ({ page }) => {
  // Llego al Paso 2 con requeridos del Paso 1 + un dato extra del Paso 2 (observaciones).
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Paula');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Cabrera');
  await page.getByRole('textbox', { name: 'DNI' }).fill('29876543');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);

  await page.getByRole('textbox', { name: 'Observaciones' }).fill('Refiere bruxismo nocturno.');
  await backLink(page).click();

  await expect(dialog(page)).toBeVisible();
  await expect(page.getByText(DLG_MENSAJE)).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-177 — Cancelar SIN datos sale directo (control negativo)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-177 (control negativo) — sin ningún dato cargado, "Cancelar" sale DIRECTO a
// /pacientes SIN diálogo (no molesta con una confirmación vacía).
test('REQ-177 (control negativo): sin datos, "Cancelar" sale directo a /pacientes sin diálogo', async ({ page }) => {
  await gotoPaso1(page);

  await backLink(page).click();

  await expect(page).toHaveURL(/\/pacientes$/);
  await expect(dialog(page)).toHaveCount(0);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-177 (b) — "Atrás" preserva los datos del Paso 1
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-177 — Paso 1 (con datos) → Siguiente → Paso 2 → "Atrás": los datos del Paso 1
// se PRESERVAN (nombre/apellido/DNI intactos). El wizard sobrevive la navegación.
test('REQ-177: "Atrás" desde el Paso 2 preserva los datos del Paso 1', async ({ page }) => {
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Gonzalo');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Vidal');
  await page.getByRole('textbox', { name: 'DNI' }).fill('27654321');
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('+54 11 4321-8765');

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);

  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);

  // Datos del Paso 1 intactos.
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Gonzalo');
  await expect(page.getByRole('textbox', { name: 'Apellido' })).toHaveValue('Vidal');
  await expect(page.getByRole('textbox', { name: 'DNI' })).toHaveValue('27654321');
  await expect(page.getByRole('textbox', { name: 'Teléfono' })).toHaveValue('+54 11 4321-8765');
});

// test: REQ-177 — ida y vuelta repetida (Paso 1 → 2 → 1 → 2): los datos persisten en cada
// tramo. Gate contra un reset accidental del wizard al re-montar el componente del paso.
test('REQ-177: ida y vuelta repetida entre pasos conserva los datos del Paso 1', async ({ page }) => {
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Daniela');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Ibáñez');
  await page.getByRole('textbox', { name: 'DNI' }).fill('31222333');

  // 1 → 2
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
  // 2 → 1
  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Daniela');
  // 1 → 2 otra vez (los requeridos siguen válidos → avanza sin recargar nada)
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
  // 2 → 1 de nuevo: persiste
  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page.getByRole('textbox', { name: 'Apellido' })).toHaveValue('Ibáñez');
  await expect(page.getByRole('textbox', { name: 'DNI' })).toHaveValue('31222333');
});

// test: REQ-177 — el diálogo de descarte no revela demo/mock (copy de producción).
test('REQ-177: el diálogo de descarte no revela demo/mock (copy de producción)', async ({ page }) => {
  await gotoPaso1(page);
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Inés');
  await backLink(page).click();
  await expect(dialog(page)).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(DEMO_FORBIDDEN);
});
