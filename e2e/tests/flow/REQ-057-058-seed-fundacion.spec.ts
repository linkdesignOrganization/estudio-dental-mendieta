import { test, expect } from '@playwright/test';
import { gotoApp, warmSeed, readState } from '../_helpers/seed';

/**
 * Iteración 1 (Fundación) — gaps SIN aserción dedicada en la suite existente.
 *
 *   REQ-057  El seed incluye EXACTAMENTE 6 profesionales con
 *            nombre / especialidad / años de experiencia EXACTOS del brief.
 *            (`UX-063` solo asserta `professionals.length === 6`; aquí blindamos
 *            el contenido completo: los 6 nombres con sus acentos, especialidades
 *            y los años 12/18/8/15/7/10, que en ninguna otra spec se verifican.)
 *
 *   REQ-058  El tab Documentos de un paciente CON documentos renderiza
 *            thumbnails REALES (no rotos) del pool de imágenes.
 *            (`UX-064` solo asserta el CONTEO de documentos en localStorage; aquí
 *            blindamos que la grilla del tab Documentos pinta `<img>` con
 *            `naturalWidth > 0`. Los checks de "imagen no rota" existentes corren
 *            sobre la lista de pacientes / avatares, NO sobre el tab Documentos.)
 *
 * Se testea contra el SITIO DESPLEGADO (baseURL en playwright.config.ts), nunca
 * localhost. El estado vive en localStorage `edm:v1:state`, hidratado por el
 * SeedReadyGuard al primer load de una ruta interna. Corre estable en ambos
 * projects (desktop-chromium + mobile-chromium).
 *
 * Forma del estado verificada en vivo:
 *   professionals[]: { id, nombre, especialidad, aniosExperiencia, fotoPath }
 *   documents[]:     { id, pacienteId, nombre, tipo, thumbnailPath, fecha }
 */

// ── Set canónico esperado del brief (orden irrelevante; contenido exacto) ──────
type Prof = { nombre: string; especialidad: string; anios: number };
const EXPECTED_PROFESSIONALS: Prof[] = [
  { nombre: 'Dra. Carolina Etcheverry', especialidad: 'Ortodoncia', anios: 12 },
  { nombre: 'Dr. Martín Aguilera', especialidad: 'Endodoncia', anios: 18 },
  { nombre: 'Dra. Soledad Russo', especialidad: 'Odontología general', anios: 8 },
  { nombre: 'Dr. Juan Pablo Acuña', especialidad: 'Implantología', anios: 15 },
  { nombre: 'Dra. Laura Béccar Varela', especialidad: 'Estética dental', anios: 7 },
  { nombre: 'Dr. Federico Salinas', especialidad: 'Odontopediatría', anios: 10 },
];

/** Devuelve el primer patientId cuyo array de documentos NO esté vacío (derivado del estado). */
function firstPatientWithDocs(state: any): string {
  const counts: Record<string, number> = {};
  for (const d of state.documents ?? []) {
    const pid = d.pacienteId ?? d.patientId ?? d.patient_id;
    if (pid) counts[pid] = (counts[pid] || 0) + 1;
  }
  // Preferimos pac-002 (Mateo Gómez) si tiene documentos — referencia de infra; si no, el primero disponible.
  if (counts['pac-002']) return 'pac-002';
  const found = Object.keys(counts).find((k) => counts[k] > 0);
  if (!found) throw new Error('Ningún paciente tiene documentos en el seed — pre-condición de REQ-058 no se cumple');
  return found;
}

test.beforeEach(async ({ page }) => {
  await warmSeed(page);
});

// ── REQ-057 ───────────────────────────────────────────────────────────────────

// test: REQ-057 — los 6 profesionales tienen nombre/especialidad/años EXACTOS del brief (estado)
test('REQ-057: 6 profesionales con nombre/especialidad/años exactos del brief (estado)', async ({ page }) => {
  const s = await readState(page);
  expect(Array.isArray(s.professionals), 'professionals debe ser un array en el estado').toBeTruthy();

  // 1) Exactamente 6.
  expect(s.professionals.length, 'el seed debe tener exactamente 6 profesionales').toBe(6);

  // 2) Normalizamos el estado a tuplas (nombre, especialidad, años) para comparar como conjuntos.
  const actual: Prof[] = s.professionals.map((p: any) => ({
    nombre: p.nombre,
    especialidad: p.especialidad,
    anios: p.aniosExperiencia,
  }));

  const key = (p: Prof) => `${p.nombre}|${p.especialidad}|${p.anios}`;
  const actualSet = new Set(actual.map(key));
  const expectedSet = new Set(EXPECTED_PROFESSIONALS.map(key));

  // 3) Cada profesional esperado aparece EXACTAMENTE una vez (nombre con acentos,
  //    especialidad y años — los 3 campos deben coincidir simultáneamente).
  for (const exp of EXPECTED_PROFESSIONALS) {
    const matches = actual.filter((a) => a.nombre === exp.nombre);
    expect(matches.length, `debe existir exactamente 1 profesional llamado "${exp.nombre}"`).toBe(1);
    expect(matches[0].especialidad, `especialidad de "${exp.nombre}"`).toBe(exp.especialidad);
    expect(matches[0].anios, `años de experiencia de "${exp.nombre}"`).toBe(exp.anios);
  }

  // 4) Igualdad de conjuntos en ambos sentidos: no sobran ni faltan tuplas (sin profesionales extra/erróneos).
  expect(actualSet, 'el conjunto de profesionales del estado debe ser exactamente el del brief').toEqual(expectedSet);

  // 5) Sanidad de IDs (prof-01..prof-06, únicos).
  const ids = new Set(s.professionals.map((p: any) => p.id));
  expect(ids.size, 'los ids de profesionales deben ser únicos').toBe(6);
  for (const p of s.professionals) expect(p.id).toMatch(/^prof-\d{2}$/);
});

// test: REQ-057 — runtime: la ficha muestra "Profesional de cabecera: {uno de los 6}"
test('REQ-057: la ficha del paciente muestra un profesional de cabecera del set de 6 (runtime)', async ({ page }) => {
  const s = await readState(page);
  const validNames = new Set<string>(s.professionals.map((p: any) => p.nombre));
  // Nombre que el estado asigna a pac-001 (no se hardcodea a ciegas).
  const pac001 = s.patients.find((p: any) => p.id === 'pac-001');
  const expectedName = s.professionals.find((p: any) => p.id === pac001.profesionalId)?.nombre as string;
  expect(validNames.has(expectedName), 'el profesional de pac-001 debe pertenecer al set de 6').toBeTruthy();

  await gotoApp(page, '/pacientes/pac-001/informacion');

  // El chip "Profesional de cabecera" muestra el label y, como valor, el nombre del profesional asignado.
  const chip = page.locator('.icon-chip', { hasText: 'Profesional de cabecera' });
  await expect(chip).toBeVisible();
  await expect(chip.locator('.icon-chip__label')).toHaveText('Profesional de cabecera');
  await expect(chip.locator('.icon-chip__value')).toHaveText(expectedName);

  // Defensa extra: el valor renderizado es uno de los 6 nombres exactos (acentos incluidos).
  const renderedValue = (await chip.locator('.icon-chip__value').innerText()).trim();
  expect(validNames.has(renderedValue), `"${renderedValue}" debe ser uno de los 6 profesionales del brief`).toBeTruthy();
});

// ── REQ-058 (thumbnails) ────────────────────────────────────────────────────────

// test: REQ-058 — el tab Documentos de un paciente con documentos renderiza thumbnails REALES (no rotos)
test('REQ-058: el tab Documentos renderiza thumbnails reales (naturalWidth>0, no rotos)', async ({ page }) => {
  const s = await readState(page);
  const patientId = firstPatientWithDocs(s);
  const expectedCount = (s.documents as any[]).filter(
    (d) => (d.pacienteId ?? d.patientId) === patientId
  ).length;
  expect(expectedCount, `el paciente elegido (${patientId}) debe tener ≥1 documento`).toBeGreaterThan(0);

  await gotoApp(page, `/pacientes/${patientId}/documentos`);

  // La grilla del tab Documentos está montada (componente app-tab-documents).
  const grid = page.locator('app-tab-documents .docs__grid');
  await expect(grid).toBeVisible();

  // Hay al menos un thumbnail y la cantidad coincide con el estado.
  const thumbs = grid.locator('img.doc__img');
  await expect(thumbs.first()).toBeVisible();
  await expect(thumbs).toHaveCount(expectedCount);

  // Esperamos a que TODAS las imágenes terminen de decodificar (complete).
  await expect
    .poll(
      async () =>
        thumbs.evaluateAll((els) => els.length > 0 && els.every((e: any) => e.complete)),
      { message: 'todos los thumbnails del tab Documentos deben terminar de cargar' }
    )
    .toBe(true);

  // Cada thumbnail es una imagen REAL: naturalWidth>0 (un SVG roto/404 daría naturalWidth=0).
  const dims = await thumbs.evaluateAll((els) =>
    els.map((e: any) => ({
      src: e.getAttribute('src'),
      complete: e.complete,
      naturalWidth: e.naturalWidth,
      naturalHeight: e.naturalHeight,
    }))
  );
  expect(dims.length).toBe(expectedCount);
  for (const d of dims) {
    expect(d.complete, `thumbnail ${d.src} debe estar 'complete'`).toBe(true);
    expect(d.naturalWidth, `thumbnail ${d.src} debe tener naturalWidth>0 (imagen real, no rota)`).toBeGreaterThan(0);
    expect(d.naturalHeight, `thumbnail ${d.src} debe tener naturalHeight>0`).toBeGreaterThan(0);
    // Los thumbnails provienen del pool de SVG autoalojados.
    expect(d.src, `thumbnail ${d.src} debe apuntar al pool /imagenes/documentos/*.svg`).toMatch(
      /\/imagenes\/documentos\/(foto|radiografia)-\d+\.svg$/
    );
  }

  // Patrón anti-imagen-rota: ninguna <img> con src declarado pero naturalWidth===0.
  const brokenCount = await thumbs.evaluateAll(
    (els) => els.filter((e: any) => e.complete && e.naturalWidth === 0 && !!e.getAttribute('src')).length
  );
  expect(brokenCount, 'no debe haber thumbnails rotos (complete && naturalWidth===0 && src)').toBe(0);
});
