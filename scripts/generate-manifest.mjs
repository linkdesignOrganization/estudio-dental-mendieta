/**
 * generate-manifest.mjs — Genera el seed manifest en BUILD-TIME (GAP-A02 / NFR-033).
 *
 * En hosting estático (Azure SWA) no hay backend ni lectura de FS en runtime. Este script
 * recorre input/mockpeople/{hombres,mujeres}/, deriva por cada foto su {género (carpeta),
 * edad (nombre de archivo)}, copia las fotos a public/imagenes/pacientes/... (idempotente)
 * y materializa public/seed/manifest.json. El runtime hace fetch('seed/manifest.json').
 *
 * Soporta sufijos de desambiguación: `23-1.jpg` / `23-2.jpg` → dos pacientes de 23 años
 * (REQ-047). Ignora `.DS_Store` y cualquier no-imagen. Si se agregan/quitan fotos, basta
 * re-correr este script — la cantidad de pacientes se ajusta sola.
 *
 * Lo ejecuta npm como hook `prebuild` (definido en package.json), por lo que Oryx en el
 * pipeline de SWA lo corre automáticamente antes de `ng build`. No requiere paso de CI extra.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'input', 'mockpeople');
const PUB_PHOTOS = path.join(ROOT, 'public', 'imagenes', 'pacientes');
const PUB_DOCS = path.join(ROOT, 'public', 'imagenes', 'documentos');
const SEED_DIR = path.join(ROOT, 'public', 'seed');

const IMG_RE = /\.(jpe?g|png|webp|avif|svg)$/i;
const AGE_RE = /^(\d{1,3})(?:-\d+)?$/; // "32" o "23-1" → edad 32 / 23

/** carpeta → género del modelo */
const GENERO = { hombres: 'hombre', mujeres: 'mujer' };

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listImages(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && IMG_RE.test(e.name) && e.name !== '.DS_Store')
      .map((e) => e.name);
  } catch {
    return [];
  }
}

async function copyIfNeeded(from, to) {
  await ensureDir(path.dirname(to));
  try {
    await fs.copyFile(from, to);
  } catch (err) {
    console.warn(`[manifest] no se pudo copiar ${from}: ${err.message}`);
  }
}

async function main() {
  const pacientes = [];

  for (const carpeta of ['hombres', 'mujeres']) {
    const genero = GENERO[carpeta];
    const dir = path.join(SRC, carpeta);
    const files = await listImages(dir);
    for (const file of files) {
      const stem = file.replace(IMG_RE, '');
      const m = stem.match(AGE_RE);
      if (!m) {
        console.warn(`[manifest] ignorado (nombre no es edad): ${carpeta}/${file}`);
        continue;
      }
      const edad = parseInt(m[1], 10);
      // copia a public para que el runtime la sirva
      await copyIfNeeded(path.join(dir, file), path.join(PUB_PHOTOS, carpeta, file));
      pacientes.push({ path: `/imagenes/pacientes/${carpeta}/${file}`, genero, edad });
    }
  }

  // pool de documentos: cualquier imagen ya presente en public/imagenes/documentos
  const docFiles = await listImages(PUB_DOCS);
  const documentos = docFiles.map((f) => `/imagenes/documentos/${f}`);

  const manifest = {
    pacientes,
    documentos,
    generadoEn: new Date().toISOString(),
  };

  await ensureDir(SEED_DIR);
  await fs.writeFile(path.join(SEED_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`[manifest] ${pacientes.length} pacientes (${pacientes.filter((p) => p.genero === 'hombre').length} H / ${pacientes.filter((p) => p.genero === 'mujer').length} M), ${documentos.length} documentos → public/seed/manifest.json`);
}

main().catch((err) => {
  console.error('[manifest] error:', err);
  process.exit(1);
});
