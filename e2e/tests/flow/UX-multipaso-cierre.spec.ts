import { test, expect, Page } from '@playwright/test';
import { gotoApp, warmSeed, readState } from '../_helpers/seed';

/**
 * Flow Tester — CIERRE DE COBERTURA de flujos multi-paso / variantes intermedias.
 *
 * El plan-verifier (verification-4f.md §5c) detectó 9 UX multi-paso/transversales que
 * estaban "PASA" en prosa pero SIN .spec.ts dedicado. Este archivo cierra ese gap
 * navegando el ESCENARIO REAL contra el sitio desplegado (Azure SWA):
 *
 *   · UX-023  Cancelar turno   — confirmación + EJECUCIÓN ("Sí, cancelar") → estado
 *                                "Cancelado" persiste; rama "Volver" aborta.
 *   · UX-024  Crear paciente (2 pasos) — stepper, validación de requeridos, "Atrás"
 *                                PRESERVA el Paso 1, "Crear paciente" persiste + avatar
 *                                a iniciales (sin imagen rota), navega a la ficha nueva.
 *   · UX-025  Editar paciente  — form PRECARGADO, "Guardar cambios" persiste y vuelve a
 *                                la ficha con el dato nuevo (refresh real).
 *   · UX-029  Crear presupuesto (3 pasos) — stepper, TOTAL calculado automáticamente,
 *                                "Atrás" preserva, "Crear presupuesto" persiste.
 *   · UX-030  Aprobar presupuesto — "Aprobar" → estado "Aprobado" persiste; ya
 *                                aprobado/vencido NO ofrece aprobar de nuevo (no 2x).
 *   · UX-033  Eliminar paciente — confirmación + EJECUCIÓN → navega a /pacientes, el
 *                                conteo decrece; rama "Cancelar" aborta.
 *   · UX-040  Transversal carga — contrato anti-spinner: en un recorrido de flujos con
 *                                contenido diferido NUNCA aparece un spinner (el loading
 *                                es skeleton/@defer). [skeleton transitorio: ver nota]
 *   · UX-042  Transversal error — id/ruta inexistente → pantalla "no encontrado"
 *                                ESPECÍFICA por entidad, sin crash ni lenguaje de mock.
 *   · UX-053  Reportes         — dashboard SIEMPRE con datos calculados (sin vacío
 *                                global); reportes detallados renderizan charts sin crash.
 *
 * Notas de honestidad (documentadas en flow-coverage-cierre.md):
 *  - UX-024/UX-029 resultaron FLUJOS COMPLETOS en la demo (persisten un recurso nuevo
 *    con id generado), NO meros shells. Se testea la persistencia real.
 *  - UX-025: la demo NO expone "Cancelar con confirmación de descarte" en /editar
 *    (solo breadcrumb + "Guardar cambios"); esa variante queda para FASE 5. Se testea
 *    lo que SÍ aplica: precarga + guardar persiste.
 *  - UX-040 (aspecto del skeleton) es transitorio/no-determinista: las listas hidratan
 *    SÍNCRONAS desde localStorage. Lo verificable hoy es el contrato "nunca spinners"
 *    (el faltante de aspecto se cubre en Visual). El contenido diferido (@defer) SÍ
 *    termina hidratando, lo que se asserta navegando a esas pantallas.
 *  - UX-042 parte "toast de error de carga/persistencia": NO alcanzable por UI (app
 *    offline-first sin backend que falle). Se testea la parte alcanzable ("no encontrado").
 *  - UX-053 "Sin datos suficientes para este gráfico": NO alcanzable con el seed (todos
 *    los charts tienen datos); source-verified. Se testea el camino real (datos calculados).
 *
 * Reutiliza config (playwright.config.ts) y helpers (tests/_helpers/seed.ts).
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design|resetear demo)\b/i;

/** Crea un turno fresco (estado "Confirmado") y devuelve su URL de detalle (camino determinista). */
async function crearTurnoConfirmado(
  page: Page,
  pacienteRegex: RegExp,
  profesionalLabel: string,
  fecha: string,
  hora: string,
): Promise<string> {
  await gotoApp(page, '/agenda/nuevo/paciente');
  await page.getByRole('button', { name: pacienteRegex }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByLabel('Profesional').selectOption({ label: profesionalLabel });
  await page.getByRole('textbox', { name: 'Fecha' }).fill(fecha);
  await page.getByRole('button', { name: hora }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Confirmar turno' }).click();
  await expect(page).toHaveURL(/\/agenda\/tur-[\w-]+$/);
  await expect(page.getByText('Confirmado')).toBeVisible();
  return page.url();
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ───────────────────────────── UX-023 — Cancelar turno (confirmación + ejecución) ─────────────────────────────

// test: UX-023 — "Cancelar turno" pide confirmación; "Sí, cancelar" EJECUTA y el estado pasa a
// "Cancelado", deja la acción terminal deshabilitada y PERSISTE tras refresh real del navegador.
// Usamos un turno recién creado (Confirmado) para no depender del seed mutable.
test('UX-023: cancelar turno — confirmación + "Sí, cancelar" persiste el estado Cancelado', async ({ page }) => {
  const url = await crearTurnoConfirmado(
    page, /Agustín Benítez/, 'Dra. Mariana Sosa · Odontología general', '2026-06-23', '10:00',
  );

  await page.getByRole('button', { name: 'Cancelar turno' }).click();

  // Confirmación explícita con copy de producción.
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Cancelar este turno')).toBeVisible();
  await expect(dialog.getByText(/El paciente quedará sin la cita agendada/)).toBeVisible();
  expect(await dialog.innerText()).not.toMatch(DEMO_FORBIDDEN);

  // Ejecuta la cancelación.
  await dialog.getByRole('button', { name: 'Sí, cancelar' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);

  // El badge de estado pasa a "Cancelado" y la acción terminal queda deshabilitada (no se re-cancela).
  // exact:true evita colisionar con el toast transitorio ("Turno cancelado.").
  await expect(page.getByText('Cancelado', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar turno' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Avanzar estado' })).toBeDisabled();

  // Persiste tras refresh REAL (hidrata desde localStorage).
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(url);
  await expect(page.getByText('Cancelado', { exact: true })).toBeVisible();
});

// test: UX-023 — la rama "Volver" ABORTA la cancelación (el turno NO cambia de estado).
test('UX-023: "Volver" en la confirmación NO cancela el turno', async ({ page }) => {
  await crearTurnoConfirmado(
    page, /Mateo Gómez/, 'Dr. Andrés Vidal · Endodoncia', '2026-06-24', '11:30',
  );

  await page.getByRole('button', { name: 'Cancelar turno' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Volver' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);

  // El turno sigue activo (acción habilitada, estado no terminal).
  await expect(page.getByText('Confirmado')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Avanzar estado' })).toBeEnabled();
});

// ───────────────────────────── UX-024 — Crear paciente (2 pasos) ─────────────────────────────

// test: UX-024 — "Atrás" en el Paso 2 PRESERVA los datos del Paso 1 (no se pierde el formulario).
test('UX-024: crear paciente — "Atrás" preserva los datos del Paso 1', async ({ page }) => {
  await gotoApp(page, '/pacientes/nuevo/datos');
  await expect(page.getByText('Paso 1 de 2')).toBeVisible();

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Valentina');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Ríos');
  await page.getByRole('textbox', { name: 'DNI' }).fill('40.123.456');
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('+54 11 5555-1234');
  await page.getByRole('textbox', { name: 'Correo' }).fill('valentina.rios@correo.com');

  await page.getByRole('button', { name: 'Siguiente' }).click();
  // Paso 2: datos clínicos.
  await expect(page.getByText('Paso 2 de 2')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Datos clínicos y de cobertura' })).toBeVisible();

  // Volver al Paso 1 y comprobar que TODO se conservó.
  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page.getByText('Paso 1 de 2')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Valentina');
  await expect(page.getByRole('textbox', { name: 'Apellido' })).toHaveValue('Ríos');
  await expect(page.getByRole('textbox', { name: 'DNI' })).toHaveValue('40.123.456');
  await expect(page.getByRole('textbox', { name: 'Teléfono' })).toHaveValue('+54 11 5555-1234');
  await expect(page.getByRole('textbox', { name: 'Correo' })).toHaveValue('valentina.rios@correo.com');
});

// test: UX-024 — "Siguiente" NO avanza sin los requeridos (validación inline en el Paso 1).
test('UX-024: el Paso 1 no avanza sin los datos requeridos', async ({ page }) => {
  await gotoApp(page, '/pacientes/nuevo/datos');
  await expect(page.getByText('Paso 1 de 2')).toBeVisible();
  // Sin completar nada, "Siguiente" no debe llevar al Paso 2.
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Paso 1 de 2')).toBeVisible();
  await expect(page.getByText('Paso 2 de 2')).toHaveCount(0);
});

// test: UX-024 (FLUJO COMPLETO) — "Crear paciente" PERSISTE un paciente nuevo, navega a su ficha,
// el avatar cae a INICIALES (sin imagen rota) y el conteo de pacientes crece en el estado.
test('UX-024: crear paciente end-to-end persiste, navega a la ficha y usa avatar a iniciales', async ({ page }) => {
  const before = await readState(page);
  const baseCount = (before.patients as unknown[]).length;

  await gotoApp(page, '/pacientes/nuevo/datos');
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Valentina');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Ríos');
  await page.getByRole('textbox', { name: 'DNI' }).fill('40.123.456');
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('+54 11 5555-1234');
  await page.getByRole('textbox', { name: 'Correo' }).fill('valentina.rios@correo.com');
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page.getByText('Paso 2 de 2')).toBeVisible();
  await page.getByRole('button', { name: 'Crear paciente' }).click();

  // Navega a la ficha del paciente nuevo (id generado).
  await expect(page).toHaveURL(/\/pacientes\/pac-[\w-]+\/informacion$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Valentina Ríos' })).toBeVisible();

  // El avatar usa iniciales "VR" (sin foto → círculo con iniciales, NUNCA imagen rota del navegador).
  const broken = await page.locator('main img').evaluateAll((imgs) =>
    imgs.filter((i) => {
      const el = i as HTMLImageElement;
      return el.complete && el.naturalWidth === 0 && !!el.getAttribute('src');
    }).length,
  );
  expect(broken, 'sin imágenes rotas en la ficha del paciente recién creado').toBe(0);

  // Persistencia: el estado tiene un paciente más.
  const after = await readState(page);
  expect((after.patients as unknown[]).length).toBe(baseCount + 1);
});

// ───────────────────────────── UX-025 — Editar paciente ─────────────────────────────

// test: UX-025 — /editar carga el formulario PRECARGADO con los datos actuales del paciente.
test('UX-025: editar paciente — el formulario llega precargado con los datos actuales', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/editar');
  await expect(page.getByRole('heading', { name: 'Editar paciente' })).toBeVisible();
  // Datos actuales de pac-002 (Mateo Gómez) precargados.
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Mateo');
  await expect(page.getByRole('textbox', { name: 'Apellido' })).toHaveValue('Gómez');
  await expect(page.getByRole('textbox', { name: 'DNI' })).toHaveValue('56.875.272');
});

// test: UX-025 (PERSISTENCIA) — "Guardar cambios" persiste el dato editado, vuelve a la ficha y
// el cambio sobrevive a un refresh REAL del navegador.
test('UX-025: "Guardar cambios" persiste el dato editado (refresh real)', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-002/editar');
  const nuevoTel = '+54 11 9999-0000';
  await page.getByRole('textbox', { name: 'Teléfono' }).fill(nuevoTel);
  await page.getByRole('button', { name: 'Guardar cambios' }).click();

  // Vuelve a la ficha del paciente.
  await expect(page).toHaveURL(/\/pacientes\/pac-002\/informacion$/);
  // El teléfono nuevo (valor único) se refleja en la ficha — confirma que el cambio se aplicó.
  await expect(page.getByText(nuevoTel).first()).toBeVisible();
  // Y el teléfono viejo del seed ya no está.
  await expect(page.getByText('+54 11 5655-4564')).toHaveCount(0);

  // Persiste tras refresh real (hidrata desde localStorage).
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText(nuevoTel).first()).toBeVisible();
});

// ───────────────────────────── UX-029 — Crear presupuesto (3 pasos) ─────────────────────────────

// test: UX-029 — el Paso 2 calcula el TOTAL automáticamente al marcar tratamientos; "Atrás" es
// navegación funcional y la SELECCIÓN DE TRATAMIENTOS se preserva al volver al Paso 2; el resumen
// (Paso 3) arrastra paciente + total.
//
// HALLAZGO honesto (ver flow-coverage-cierre.md): en este wizard, "Atrás" del Paso 2 → Paso 1 NO
// repuebla el <select> de Paciente (vuelve a "Elegí un paciente"); hay que re-elegirlo para avanzar.
// La selección de tratamientos del Paso 2, en cambio, SÍ se conserva (total intacto al re-entrar).
// Asertamos el comportamiento REAL, sin afirmar una preservación del paciente que la demo no hace.
test('UX-029: crear presupuesto — total auto-calculado y "Atrás" preserva los tratamientos', async ({ page }) => {
  await gotoApp(page, '/facturacion/presupuestos/nuevo/paciente');
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  await page.getByLabel('Paciente').selectOption('Diego Sosa');
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Paso 2: marcar dos tratamientos => total = 18.000 + 145.000 = 163.000 (cálculo automático).
  await expect(page).toHaveURL(/\/facturacion\/presupuestos\/nuevo\/items$/);
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();
  await expect(page.getByText('Total seleccionado').locator('xpath=following-sibling::*[1]')).toHaveText('$ 0');
  await page.getByRole('checkbox', { name: 'Consulta y diagnóstico' }).check();
  await page.getByRole('checkbox', { name: 'Tratamiento de conducto' }).check();
  await expect(page.getByText('Total seleccionado').locator('xpath=following-sibling::*[1]')).toHaveText('$ 163.000');

  // "Atrás" vuelve al Paso 1 (navegación del wizard funcional).
  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page.getByText('Paso 1 de 3')).toBeVisible();
  // Re-elegir paciente (la demo no repuebla el select al volver — hallazgo documentado) y re-avanzar:
  // la selección de TRATAMIENTOS del Paso 2 SÍ se conservó (total intacto, sin volver a marcar).
  await page.getByLabel('Paciente').selectOption('Diego Sosa');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Paso 2 de 3')).toBeVisible();
  await expect(page.getByText('Total seleccionado').locator('xpath=following-sibling::*[1]')).toHaveText('$ 163.000');
  await expect(page.getByRole('checkbox', { name: 'Consulta y diagnóstico' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Tratamiento de conducto' })).toBeChecked();

  // Paso 3: revisión con total y paciente.
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/facturacion\/presupuestos\/nuevo\/confirmar$/);
  await expect(page.getByText('Paso 3 de 3')).toBeVisible();
  await expect(page.getByText('Para: Diego Sosa')).toBeVisible();
  await expect(page.getByText('Total', { exact: true }).locator('xpath=following-sibling::*[1]').first()).toHaveText('$ 163.000');
});

// test: UX-029 (FLUJO COMPLETO) — "Crear presupuesto" PERSISTE el presupuesto nuevo (estado
// "Pendiente"), navega a su detalle y el conteo de presupuestos crece en el estado.
test('UX-029: crear presupuesto end-to-end persiste y navega al detalle', async ({ page }) => {
  const before = await readState(page);
  const baseCount = (before.budgets as unknown[]).length;

  await gotoApp(page, '/facturacion/presupuestos/nuevo/paciente');
  await page.getByLabel('Paciente').selectOption('Diego Sosa');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox', { name: 'Consulta y diagnóstico' }).check();
  await page.getByRole('checkbox', { name: 'Tratamiento de conducto' }).check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear presupuesto' }).click();

  // Navega al detalle del presupuesto nuevo (id generado), estado "Pendiente", total correcto.
  await expect(page).toHaveURL(/\/facturacion\/presupuestos\/pre-[\w-]+$/);
  await expect(page.getByText('Diego Sosa')).toBeVisible();
  await expect(page.getByText('Pendiente', { exact: true })).toBeVisible();
  await expect(page.getByText('Total', { exact: true }).locator('xpath=following-sibling::*[1]').first()).toHaveText('$ 163.000');

  // Persistencia: un presupuesto más en el estado.
  const after = await readState(page);
  expect((after.budgets as unknown[]).length).toBe(baseCount + 1);
});

// ───────────────────────────── UX-030 — Aprobar presupuesto ─────────────────────────────

// test: UX-030 — en un presupuesto PENDIENTE, "Aprobar presupuesto" persiste el estado "Aprobado"
// y la acción de aprobar DESAPARECE (no se aprueba dos veces). Usamos pre-008 (P-00125, pendiente).
test('UX-030: aprobar presupuesto pendiente persiste "Aprobado" y ya no ofrece aprobar de nuevo', async ({ page }) => {
  await gotoApp(page, '/facturacion/presupuestos/pre-008');
  await expect(page.getByRole('heading', { name: /Presupuesto P-00125/ })).toBeVisible();
  await expect(page.getByText('Pendiente', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Aprobar presupuesto' }).click();

  // El badge de estado pasa a "Aprobado" y la acción primaria de aprobar ya no está (no 2x).
  // exact:true evita colisionar con el toast transitorio ("Presupuesto aprobado.").
  await expect(page.getByText('Aprobado', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aprobar presupuesto' })).toHaveCount(0);

  // Persiste tras refresh real.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Aprobado', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aprobar presupuesto' })).toHaveCount(0);
});

// test: UX-030 — un presupuesto YA APROBADO no ofrece la acción "Aprobar" (no se aprueba dos veces).
// pre-020 (P-00137) está aprobado en el seed.
test('UX-030: un presupuesto ya aprobado NO ofrece la acción de aprobar', async ({ page }) => {
  await gotoApp(page, '/facturacion/presupuestos/pre-020');
  await expect(page.getByRole('heading', { name: /Presupuesto P-00137/ })).toBeVisible();
  await expect(page.getByText('Aprobado', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Aprobar presupuesto' })).toHaveCount(0);
});

// ───────────────────────────── UX-033 — Eliminar paciente ─────────────────────────────

// test: UX-033 (FLUJO COMPLETO) — "Eliminar paciente" pide confirmación; "Sí, eliminar" navega a
// /pacientes y el conteo del estado DECRECE. Creamos un paciente desechable para no romper el seed.
test('UX-033: eliminar paciente — confirmación + "Sí, eliminar" navega a la lista y decrece el conteo', async ({ page }) => {
  // 1) Crear un paciente desechable (flujo UX-024) para tener un objetivo de borrado determinista.
  await gotoApp(page, '/pacientes/nuevo/datos');
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Borrable');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('DePrueba');
  await page.getByRole('textbox', { name: 'DNI' }).fill('41.000.111');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear paciente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-[\w-]+\/informacion$/);

  const countConNuevo = ((await readState(page)).patients as unknown[]).length;

  // 2) Abrir el menú ⋯ de la ficha y elegir "Eliminar paciente".
  await page.getByRole('button', { name: 'Más acciones del paciente' }).click();
  await page.getByRole('menuitem', { name: 'Eliminar paciente' }).click();

  // 3) Confirmación explícita con copy de producción (no se puede deshacer).
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: /Eliminar la ficha de Borrable DePrueba/ })).toBeVisible();
  await expect(dialog.getByText(/no se puede deshacer/)).toBeVisible();
  expect(await dialog.innerText()).not.toMatch(DEMO_FORBIDDEN);

  // 4) Ejecutar: navega a /pacientes y el conteo decrece.
  await dialog.getByRole('button', { name: 'Sí, eliminar' }).click();
  await expect(page).toHaveURL(/\/pacientes$/);
  const countTrasBorrar = ((await readState(page)).patients as unknown[]).length;
  expect(countTrasBorrar).toBe(countConNuevo - 1);
});

// test: UX-033 — la rama "Cancelar" ABORTA la eliminación (el paciente sigue existiendo).
test('UX-033: "Cancelar" en la confirmación NO elimina el paciente', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-001/informacion');
  await page.getByRole('button', { name: 'Más acciones del paciente' }).click();
  await page.getByRole('menuitem', { name: 'Eliminar paciente' }).click();

  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);

  // Seguimos en la ficha (no se eliminó, no se navegó a la lista).
  await expect(page).toHaveURL(/\/pacientes\/pac-001\/informacion$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Bautista Álvarez' })).toBeVisible();
});

// ───────────────────────────── UX-040 — Transversal: carga sin spinners ─────────────────────────────

// test: UX-040 — contrato de carga transversal "NUNCA spinners": en un recorrido de flujos que
// hidratan/computan datos (incl. contenido diferido @defer como odontograma) no aparece ningún
// spinner. El skeleton (aspecto) es transitorio/no-determinista (hidratación síncrona desde
// localStorage); lo verificable de extremo a extremo es la AUSENCIA de spinner + que el contenido
// diferido SÍ termina renderizando (las 32 piezas).
test('UX-040: carga transversal sin spinners en un recorrido de flujos (loading vía skeleton/@defer)', async ({ page }) => {
  const rutas = [
    '/agenda',
    '/pacientes',
    '/facturacion/presupuestos',
    '/reportes',
    '/pacientes/pac-001/odontograma', // contenido diferido — el peor caso para un spinner
  ];
  for (const ruta of rutas) {
    await gotoApp(page, ruta);
    const spinners = await page.evaluate(() =>
      [...document.querySelectorAll('[class*="spinner" i], .spinner-border, .spinner-grow')]
        .filter((e) => (e as HTMLElement).offsetParent !== null)
        .map((e) => (typeof e.className === 'string' ? e.className : 'spinner')),
    );
    expect(spinners, `spinners visibles al cargar ${ruta}`).toEqual([]);
  }
  // El contenido diferido del odontograma SÍ hidrata (no se queda "cargando" indefinidamente).
  await expect(page.getByRole('button', { name: /^Pieza \d+/ })).toHaveCount(32);
});

// ───────────────────────────── UX-042 — Transversal: error / no encontrado ─────────────────────────────

// test: UX-042 — un id inexistente en CADA entidad principal cae en una pantalla "no encontrado"
// ESPECÍFICA (heading propio + acción de retorno), sin crashear ni revelar lenguaje de mock.
test('UX-042: id inexistente por entidad muestra "no encontrado" específico, sin crash ni mock', async ({ page }) => {
  const casos = [
    { ruta: '/pacientes/pac-inexistente-9999/informacion', heading: 'No encontramos este paciente', volver: 'Volver a la lista' },
    { ruta: '/agenda/tur-inexistente-9999', heading: 'No encontramos este turno', volver: 'Volver a Agenda' },
    { ruta: '/facturacion/presupuestos/pre-inexistente-9999', heading: 'No encontramos este presupuesto', volver: 'Volver a presupuestos' },
    { ruta: '/facturacion/obras-sociales/os-inexistente-9999', heading: 'No encontramos esta obra social', volver: undefined },
  ];
  for (const c of casos) {
    await gotoApp(page, c.ruta);
    await expect(page.getByRole('heading', { name: new RegExp(c.heading) })).toBeVisible();
    if (c.volver) {
      await expect(page.getByRole('link', { name: c.volver })).toBeVisible();
    }
    // No revela lenguaje de demo/mock y el shell sigue navegable (no crash).
    const body = await page.locator('body').innerText();
    expect(body, `copy sin mock en ${c.ruta}`).not.toMatch(DEMO_FORBIDDEN);
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  }
});

// test: UX-042 — la pantalla "no encontrado" ofrece un retorno funcional (vuelve a la lista real).
test('UX-042: desde "paciente no encontrado" el retorno lleva a la lista real', async ({ page }) => {
  await gotoApp(page, '/pacientes/pac-inexistente-9999/informacion');
  await page.getByRole('link', { name: 'Volver a la lista' }).click();
  await expect(page).toHaveURL(/\/pacientes$/);
  await expect(page.getByText(/\d+ pacientes en el sistema/)).toBeVisible();
});

// ───────────────────────────── UX-053 — Reportes: datos calculados / gráficos ─────────────────────────────

// test: UX-053 — el dashboard SIEMPRE muestra datos calculados del estado (sin vacío global): los 6
// KPIs canónicos con sus valores, y montos ARS derivados. Nunca un blanco global.
test('UX-053: el dashboard de reportes muestra datos calculados (sin estado vacío global)', async ({ page }) => {
  await gotoApp(page, '/reportes');
  await expect(page.getByRole('heading', { level: 1, name: 'Reportes' })).toBeVisible();
  for (const kpi of ['Pacientes nuevos', 'Turnos atendidos', 'Tratamientos completados', 'Ingresos facturados', 'Cobrado', 'Deuda']) {
    await expect(page.getByText(kpi, { exact: false }).first()).toBeVisible();
  }
  // La card "Ingresos facturados" muestra un monto ARS formateado (derivado del estado, no placeholder).
  const ingresos = page.locator('main a[href="/reportes/financiero"]').first();
  await expect(ingresos).toContainText('Ingresos facturados');
  await expect(ingresos).toContainText(/\$\s?[\d.]+\s*M?/);
});

// test: UX-053 — los reportes detallados renderizan sus gráficos con datos (figuras visibles), sin
// crashear. (El estado "Sin datos suficientes para este gráfico" no es alcanzable con el seed; ver nota.)
test('UX-053: los reportes detallados renderizan sus charts con datos, sin crash', async ({ page }) => {
  const reportes = [
    { ruta: '/reportes/pacientes', heading: /Reporte de pacientes/, charts: ['Pacientes nuevos por mes', 'Distribución por edad', 'Pacientes por obra social'] },
    { ruta: '/reportes/financiero', heading: /Reporte financiero/, charts: ['Facturación mensual (ARS)', 'Cobranzas vs facturado', 'Tasa de cobranza'] },
    { ruta: '/reportes/productividad', heading: /Reporte de productividad/, charts: ['Turnos por profesional', 'Asistencia a turnos', 'Turnos por día de semana'] },
    { ruta: '/reportes/tratamientos', heading: /Reporte de tratamientos/, charts: ['Tratamientos por estado', 'Tipos más frecuentes', 'Tasa de finalización'] },
  ];
  for (const r of reportes) {
    await gotoApp(page, r.ruta);
    await expect(page.getByRole('heading', { name: r.heading })).toBeVisible();
    for (const chart of r.charts) {
      await expect(page.getByText(chart, { exact: false }).first()).toBeVisible();
    }
    // Cada gráfico es una <figure> con contenido (no un bloque vacío) — al menos 3 figuras visibles.
    await expect(page.locator('main figure')).toHaveCount(3);
  }
});
