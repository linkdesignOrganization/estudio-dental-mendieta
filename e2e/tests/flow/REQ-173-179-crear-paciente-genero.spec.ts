import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, resetSeed, readState } from '../_helpers/seed';

/**
 * Iteración 4 (Pacientes — escritura) · Flow Tester · Ronda 1.
 *
 * Crear paciente — flujo de DOS RUTAS dedicadas con SELECTOR DE GÉNERO (la novedad de It4
 * frente al shell de Fase 4, donde el género estaba hardcodeado en 'mujer'):
 *
 *   REQ-173  · El alta vive en dos rutas reales: /pacientes/nuevo/datos (Paso 1) y
 *             /pacientes/nuevo/clinico (Paso 2). "Siguiente"/"Atrás" navegan entre ellas.
 *   REQ-174  · El <select id="c-genero"> (opciones Femenino/Masculino) escribe el género
 *             REAL elegido. Crear un paciente "Masculino" y comprobar que la ficha refleja
 *             Masculino — prueba de que la escritura usa this.genero(), no el hardcode previo.
 *   REQ-178  · "Crear paciente" PERSISTE un paciente nuevo (id generado), navega a su ficha
 *             (/pacientes/{id}/informacion) y muestra el toast de éxito.
 *   REQ-179  · Sin foto → el avatar cae a INICIALES (sin imagen rota del navegador).
 *
 * Punto caliente del plan-verifier (REQ-174): el default del signal del form es 'mujer'
 * SOLO como valor inicial del select. Hay que ELEGIR "Masculino" explícitamente y verificar
 * que el paciente creado refleja Masculino (subtítulo de la ficha + card "Datos personales").
 *
 * Las escrituras MUTAN localStorage (crean un paciente nuevo). Para idempotencia entre specs
 * usamos resetSeed() en afterEach: re-hidrata el seed byte-idéntico y evita que el conteo
 * arrastrado contamine otros tests.
 *
 * Reutiliza config (playwright.config.ts) y helpers (tests/_helpers/seed.ts).
 */

const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// Cada test crea un paciente real → devolvemos el store al seed determinista para no
// arrastrar pacientes nuevos entre specs (idempotencia).
test.afterEach(async ({ page }) => {
  await resetSeed(page, '/pacientes');
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-173 — dos rutas dedicadas + navegación entre pasos
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-173 — el alta ocupa DOS rutas reales (/nuevo/datos ↔ /nuevo/clinico) y la
// navegación "Siguiente"/"Atrás" cambia la URL de verdad (no es un wizard de una sola ruta).
test('REQ-173: crear paciente recorre las dos rutas dedicadas (datos ↔ clinico)', async ({ page }) => {
  await gotoApp(page, '/pacientes/nuevo/datos');
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(page.getByText('Paso 1 de 2')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Datos personales' })).toBeVisible();

  // Requeridos mínimos para poder avanzar (nombre + apellido + DNI válido).
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Joaquín');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Mendizábal');
  await page.getByRole('textbox', { name: 'DNI' }).fill('38.555.777');

  await page.getByRole('button', { name: 'Siguiente' }).click();
  // Paso 2 vive en SU PROPIA ruta.
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
  await expect(page.getByText('Paso 2 de 2')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Datos clínicos y de cobertura' })).toBeVisible();

  // "Atrás" vuelve a la ruta del Paso 1 y PRESERVA lo cargado (no se pierde el formulario).
  await page.getByRole('button', { name: 'Atrás' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/datos$/);
  await expect(page.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Joaquín');
  await expect(page.getByRole('textbox', { name: 'Apellido' })).toHaveValue('Mendizábal');
  await expect(page.getByRole('textbox', { name: 'DNI' })).toHaveValue('38.555.777');
});

// ─────────────────────────────────────────────────────────────────────────────
// REQ-174 / REQ-178 / REQ-179 — género REAL + persistencia + avatar a iniciales
// ─────────────────────────────────────────────────────────────────────────────

// test: REQ-174/178/179 (FLUJO COMPLETO) — crear un paciente "Masculino" end-to-end.
// Elegimos Masculino EXPLÍCITAMENTE; al persistir, la ficha debe mostrar Masculino (NO "mujer"
// / Femenino del hardcode previo). Además: persiste (conteo +1), navega a la ficha con id
// generado, toast de éxito y avatar a iniciales (sin imagen rota, paciente sin foto).
test('REQ-174/178/179: crear paciente "Masculino" persiste, navega a la ficha (género Masculino) y usa avatar a iniciales', async ({ page }) => {
  const before = await readState(page);
  const baseCount = (before.patients as unknown[]).length;

  // --- Paso 1: datos personales (con GÉNERO Masculino elegido a propósito) ---
  await gotoApp(page, '/pacientes/nuevo/datos');
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Joaquín');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Mendizábal');
  await page.getByRole('textbox', { name: 'DNI' }).fill('38.555.777');
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('+54 11 4477-8899');
  // El default del select es Femenino → elegimos Masculino de forma explícita (REQ-174).
  await page.getByLabel('Género').selectOption('Masculino');
  // Gate: el valor quedó comprometido en el control antes de avanzar.
  await expect(page.getByLabel('Género')).toHaveValue('hombre');

  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
  await expect(page.getByText('Paso 2 de 2')).toBeVisible();

  // --- Paso 2: sin foto → al crear, el avatar usa iniciales (REQ-179) ---
  await page.getByRole('button', { name: 'Crear paciente' }).click();

  // Persiste y navega a la ficha del paciente nuevo (id generado).
  await expect(page).toHaveURL(/\/pacientes\/pac-[\w-]+\/informacion$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Joaquín Mendizábal' })).toBeVisible();

  // REQ-174 (clave): la ficha refleja Masculino, NO Femenino/"mujer".
  //   · subtítulo de la cabecera: "0 años · Masculino · OSDE"
  await expect(page.getByText(/·\s*Masculino\s*·/)).toBeVisible();
  //   · card "Datos personales" → término Género con valor Masculino.
  const datosPersonales = page
    .locator('section.info-card')
    .filter({ has: page.getByRole('heading', { name: 'Datos personales' }) });
  const generoValue = datosPersonales
    .getByRole('term')
    .filter({ hasText: 'Género' })
    .locator('xpath=following-sibling::dd[1]');
  await expect(generoValue).toHaveText('Masculino');
  // Y NUNCA el género incorrecto del hardcode previo.
  await expect(generoValue).not.toHaveText('Femenino');
  await expect(page.getByText('· Femenino ·')).toHaveCount(0);

  // REQ-179: el avatar es de INICIALES "JM" (sin foto → círculo de iniciales, no imagen rota).
  const broken = await page.locator('main img').evaluateAll((imgs) =>
    imgs.filter((i) => {
      const el = i as HTMLImageElement;
      return el.complete && el.naturalWidth === 0 && !!el.getAttribute('src');
    }).length,
  );
  expect(broken, 'sin imágenes rotas en la ficha del paciente recién creado').toBe(0);

  // REQ-178: el estado tiene un paciente más (persistencia real).
  const after = await readState(page);
  expect((after.patients as unknown[]).length).toBe(baseCount + 1);

  // Copy de producción en la ficha nueva (sin lenguaje de demo/mock).
  expect(await page.locator('main').innerText()).not.toMatch(DEMO_FORBIDDEN);
});

// test: REQ-178 — el paciente creado SOBREVIVE a un refresh REAL del navegador (hidrata
// desde localStorage), con su género Masculino intacto.
test('REQ-178: el paciente "Masculino" creado persiste tras refresh real, con su género intacto', async ({ page }) => {
  await gotoApp(page, '/pacientes/nuevo/datos');
  await page.getByRole('textbox', { name: 'Nombre' }).fill('Tobías');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Quiroga');
  await page.getByRole('textbox', { name: 'DNI' }).fill('39.111.222');
  await page.getByLabel('Género').selectOption('Masculino');
  await expect(page.getByLabel('Género')).toHaveValue('hombre');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Paso 2 de 2')).toBeVisible();
  await page.getByRole('button', { name: 'Crear paciente' }).click();

  await expect(page).toHaveURL(/\/pacientes\/pac-[\w-]+\/informacion$/);
  const url = page.url();

  // Refresh REAL (recarga desde el server; el SeedReadyGuard re-hidrata el store mutado).
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(url);
  await expect(page.getByRole('heading', { level: 1, name: 'Tobías Quiroga' })).toBeVisible();
  await expect(page.getByText(/·\s*Masculino\s*·/)).toBeVisible();
});
