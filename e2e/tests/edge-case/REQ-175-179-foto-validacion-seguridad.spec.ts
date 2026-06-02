import { test, expect, Page } from '@playwright/test';
import { gotoApp, resetSeed, readState } from '../_helpers/seed';

/**
 * Iteración 4 (Pacientes escritura + Tratamientos) · Edge Case Tester · Ronda 1.
 *
 * REQ-175 / REQ-179 (FIX DE SEGURIDAD — foto opcional del Paso 2).
 *
 * El alta de paciente permite una foto opcional que se persiste como data URL en
 * localStorage (sin backend). En It4 la carga se ENDURECIÓ por seguridad
 * (patient-create.component.ts → onPhoto):
 *   - ALLOWLIST de formatos RASTERIZADOS: image/jpeg, image/png, image/webp, image/gif.
 *     → `image/svg+xml` se RECHAZA a propósito: un SVG puede contener <script> y sería un
 *       vector XSS al renderizarse desde una data URL persistida. (Severidad ALTA.)
 *   - TOPE de tamaño: 2 MB (2 * 1024 * 1024 = 2_097_152 bytes). Un archivo mayor se
 *     RECHAZA (la data URL vive en localStorage; un archivo gigante reventaría la cuota).
 *   - La validación ocurre CLIENT-SIDE ANTES de persistir; el <input> se limpia siempre
 *     para poder reintentar el mismo archivo tras un rechazo, y `foto` solo se setea
 *     cuando el FileReader resuelve un raster válido.
 *   - Sin foto → fallback a INICIALES del paciente (REQ-179), sin imagen rota.
 *
 * Copy de producción de los toasts de error (verificado en el código):
 *   - tipo no admitido: "Formato no admitido. Subí una imagen JPG, PNG, WEBP o GIF."
 *   - excede 2 MB:      "La imagen supera los 2 MB. Probá con una más liviana."
 *
 * Fixtures EN MEMORIA (sin tocar disco) vía `setInputFiles(name, {name, mimeType, buffer})`:
 *   - SVG con <script> (mimeType image/svg+xml).
 *   - Archivo de 2.1 MB (supera el tope).
 *   - PNG raster 1x1 válido (~70 bytes) → debe ACEPTARSE y previsualizarse.
 *
 * El <input type=file id="c-foto"> está VISUALMENTE OCULTO (clip-rect) y se dispara desde
 * un <label> estilado como botón "Subir foto". `setInputFiles` opera sobre el input oculto
 * directamente (no requiere click ni que sea visible).
 *
 * Este spec MUTA localStorage (crea un paciente para verificar la NO persistencia de la
 * foto inválida) → usa resetSeed al cerrar cada caso que escribe, para idempotencia.
 */

// Fixtures en memoria ────────────────────────────────────────────────────────
/** SVG con <script> embebido — el caso de XSS que la allowlist debe rechazar. */
const SVG_XSS = {
  name: 'avatar.svg',
  mimeType: 'image/svg+xml',
  buffer: Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
      '<script>window.__xss_executed = true;</script>' +
      '<rect width="64" height="64" fill="#fff"/></svg>',
    'utf-8',
  ),
};
/** Archivo de 2.1 MB con un mimeType de imagen "válido" — debe rechazarse por TAMAÑO. */
const OVERSIZE_PNG = {
  name: 'enorme.png',
  mimeType: 'image/png',
  buffer: Buffer.alloc(Math.round(2.1 * 1024 * 1024), 0x41),
};
/** PNG raster 1x1 transparente válido (~70 bytes) — debe ACEPTARSE. */
const VALID_PNG_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const VALID_PNG = { name: 'foto.png', mimeType: 'image/png', buffer: VALID_PNG_BYTES };

const TOAST_TIPO = 'Formato no admitido. Subí una imagen JPG, PNG, WEBP o GIF.';
const TOAST_TAMANO = 'La imagen supera los 2 MB. Probá con una más liviana.';

// El copy NUNCA debe revelar lenguaje de demo/mock (REQ-272 transversal).
const DEMO_FORBIDDEN = /\b(demo|mock|simulaci\w*|simulado|de prueba|ficticio|viewcase|lorem ipsum|link design)\b/i;

const fileInput = (page: Page) => page.locator('input[type=file]#c-foto');
const errorToast = (page: Page) => page.locator('.toast[data-kind="error"]');
const avatarImg = (page: Page) => page.locator('.photo-field img');

/**
 * Lleva el wizard de alta hasta el Paso 2 (datos clínicos) con requeridos mínimos válidos.
 * Devuelve el nombre completo usado, para verificar el avatar de iniciales / la persistencia.
 */
async function gotoPaso2(page: Page, nombre = 'Renata', apellido = 'Saavedra', dni = '34567890'): Promise<string> {
  await gotoApp(page, '/pacientes/nuevo/datos');
  await expect(page.getByRole('heading', { name: 'Datos personales', level: 3 })).toBeVisible();
  await page.getByRole('textbox', { name: 'Nombre' }).fill(nombre);
  await page.getByRole('textbox', { name: 'Apellido' }).fill(apellido);
  await page.getByRole('textbox', { name: 'DNI' }).fill(dni);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/nuevo\/clinico$/);
  await expect(page.getByRole('heading', { name: 'Datos clínicos y de cobertura', level: 3 })).toBeVisible();
  return `${nombre} ${apellido}`;
}

test.beforeEach(async ({ page }) => {
  // Arranca desde el seed limpio: el alta escribe en el store; evita arrastre entre casos.
  await resetSeed(page, '/pacientes');
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-175 (SEGURIDAD) — SVG rechazado (allowlist raster, anti-XSS)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-175 — subir un SVG (con <script>) muestra el toast de error de tipo y NO
// previsualiza la foto: el avatar permanece en iniciales, sin <img>. La validación es
// client-side (no hay navegación ni request). El <script> del SVG nunca se ejecuta.
test('REQ-175 (seguridad): un SVG con <script> se rechaza con toast de tipo y no previsualiza', async ({ page }) => {
  const fullName = await gotoPaso2(page);

  await fileInput(page).setInputFiles(SVG_XSS);

  // Toast de error de tipo (copy de producción) — el error es persistente.
  await expect(errorToast(page)).toBeVisible();
  await expect(page.getByText(TOAST_TIPO)).toBeVisible();

  // NO se previsualiza: el avatar sigue mostrando las INICIALES (no hay <img> de foto).
  await expect(avatarImg(page)).toHaveCount(0);
  // El botón sigue diciendo "Subir foto" (no "Cambiar foto") → no se cargó nada.
  await expect(page.getByText('Subir foto')).toBeVisible();
  await expect(page.getByText('Cambiar foto')).toHaveCount(0);

  // El <script> del SVG NO se ejecutó (no se inyectó en el documento).
  const xss = await page.evaluate(() => (window as unknown as { __xss_executed?: boolean }).__xss_executed === true);
  expect(xss).toBe(false);
  // Sanidad del avatar de iniciales: las iniciales del nombre están presentes.
  const initials = fullName.split(' ').map((w) => w[0]).join('').toUpperCase();
  await expect(page.locator('.photo-field').getByText(initials, { exact: true })).toBeVisible();
});

// test: REQ-175 (seguridad) — la foto inválida (SVG) NO se persiste: al crear el paciente
// y leer el estado, su `fotoPath` queda vacío (fallback a iniciales, REQ-179). Gate de que
// el rechazo client-side realmente impide la persistencia del vector.
test('REQ-175 (seguridad): el SVG rechazado no se persiste — el paciente creado queda sin foto', async ({ page }) => {
  const fullName = await gotoPaso2(page, 'Renata', 'Saavedra', '34567890');

  await fileInput(page).setInputFiles(SVG_XSS);
  await expect(page.getByText(TOAST_TIPO)).toBeVisible();

  // Creo el paciente igualmente (la foto era opcional y fue rechazada).
  await page.getByRole('button', { name: 'Crear paciente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-[a-z0-9]+(\/informacion)?$/);

  // El paciente recién creado existe en el estado y NO tiene fotoPath (no se guardó el SVG).
  const state = await readState(page);
  const creado = state.patients.find((p: { nombre: string; apellido: string }) => `${p.nombre} ${p.apellido}` === fullName);
  expect(creado, 'el paciente creado debe existir en el estado persistido').toBeTruthy();
  expect(creado.fotoPath ?? '').toBe('');
  // Ningún rastro de "svg" en la foto persistida.
  expect((creado.fotoPath ?? '').toLowerCase()).not.toContain('svg');

  await resetSeed(page, '/pacientes');
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-175 (SEGURIDAD) — archivo > 2 MB rechazado por tamaño
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-175 — un PNG de 2.1 MB (mimeType válido pero excede el tope) se rechaza con el
// toast de tamaño y no previsualiza. Aísla el límite de tamaño del de tipo.
test('REQ-175 (seguridad): un archivo de 2.1 MB se rechaza con toast de tamaño y no previsualiza', async ({ page }) => {
  await gotoPaso2(page);

  await fileInput(page).setInputFiles(OVERSIZE_PNG);

  await expect(errorToast(page)).toBeVisible();
  await expect(page.getByText(TOAST_TAMANO)).toBeVisible();
  // No se previsualiza.
  await expect(avatarImg(page)).toHaveCount(0);
  await expect(page.getByText('Cambiar foto')).toHaveCount(0);
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-179 — raster válido SÍ se acepta y previsualiza (control positivo)
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-179 — un PNG raster válido y pequeño se ACEPTA: se previsualiza como <img>
// (data URL), el botón pasa a "Cambiar foto" y aparece "Quitar". Prueba que la allowlist
// no bloquea los formatos legítimos.
test('REQ-179 (control positivo): un PNG raster válido se acepta y se previsualiza como data URL', async ({ page }) => {
  await gotoPaso2(page);

  await fileInput(page).setInputFiles(VALID_PNG);

  // Se previsualiza: hay un <img> con src de data URL de imagen.
  await expect(avatarImg(page)).toBeVisible();
  await expect(avatarImg(page)).toHaveAttribute('src', /^data:image\//);
  // El control cambia a "Cambiar foto" + "Quitar".
  await expect(page.getByText('Cambiar foto')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Quitar' })).toBeVisible();
  // No hay toast de error.
  await expect(errorToast(page)).toHaveCount(0);
});

// test: REQ-179 — el raster válido SÍ persiste: al crear el paciente, su `fotoPath` es una
// data URL de imagen. Contraparte de la NO persistencia del SVG.
test('REQ-179 (control positivo): el raster válido persiste como data URL en el paciente creado', async ({ page }) => {
  const fullName = await gotoPaso2(page, 'Renata', 'Saavedra', '34567890');

  await fileInput(page).setInputFiles(VALID_PNG);
  await expect(avatarImg(page)).toHaveAttribute('src', /^data:image\//);

  await page.getByRole('button', { name: 'Crear paciente' }).click();
  await expect(page).toHaveURL(/\/pacientes\/pac-[a-z0-9]+(\/informacion)?$/);

  const state = await readState(page);
  const creado = state.patients.find((p: { nombre: string; apellido: string }) => `${p.nombre} ${p.apellido}` === fullName);
  expect(creado).toBeTruthy();
  expect(creado.fotoPath).toMatch(/^data:image\//);

  await resetSeed(page, '/pacientes');
});

// test: REQ-179 — sin foto → fallback a INICIALES, sin imagen rota. El Paso 2 recién
// cargado no tiene <img> de foto y muestra las iniciales del paciente.
test('REQ-179: sin foto se usan las iniciales (sin imagen rota)', async ({ page }) => {
  const fullName = await gotoPaso2(page, 'Renata', 'Saavedra', '34567890');

  // Sin cargar nada: no hay <img>, sí las iniciales.
  await expect(avatarImg(page)).toHaveCount(0);
  const initials = fullName.split(' ').map((w) => w[0]).join('').toUpperCase();
  await expect(page.locator('.photo-field').getByText(initials, { exact: true })).toBeVisible();
  await expect(page.getByText('Si no cargás una foto, se usan las iniciales del paciente.')).toBeVisible();
});

// ───────────────────────────────────────────────────────────────────────────
// REQ-175 — el input se limpia tras un rechazo: se puede reintentar y recuperarse
// ───────────────────────────────────────────────────────────────────────────

// test: REQ-175 — tras rechazar un SVG, se puede reintentar con un raster válido en el
// MISMO campo y la carga procede (el input se limpia siempre tras `onPhoto`). Robustez de
// la recuperación: el rechazo no deja el control "trabado".
test('REQ-175: tras rechazar el SVG se puede reintentar con un raster válido (input se limpia)', async ({ page }) => {
  await gotoPaso2(page);

  // 1) Rechazo (SVG).
  await fileInput(page).setInputFiles(SVG_XSS);
  await expect(page.getByText(TOAST_TIPO)).toBeVisible();
  await expect(avatarImg(page)).toHaveCount(0);

  // 2) Reintento con un raster válido en el mismo input → ahora SÍ previsualiza.
  await fileInput(page).setInputFiles(VALID_PNG);
  await expect(avatarImg(page)).toBeVisible();
  await expect(avatarImg(page)).toHaveAttribute('src', /^data:image\//);
});

// test: REQ-175 — el toast de error de la foto usa copy de producción (no delata demo/mock).
test('REQ-175: los mensajes de rechazo de la foto no revelan demo/mock (copy de producción)', async ({ page }) => {
  await gotoPaso2(page);
  await fileInput(page).setInputFiles(SVG_XSS);
  await expect(page.getByText(TOAST_TIPO)).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(DEMO_FORBIDDEN);
});
