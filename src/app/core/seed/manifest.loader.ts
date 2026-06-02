import { Injectable } from '@angular/core';
import { SeedManifest, ManifestEntry, Genero } from '../models/models';

/**
 * Carga el manifest del seed (UX-060 / GAP-A02). En hosting estático sin backend no
 * hay lectura de FS en runtime: el manifest se genera en BUILD-TIME
 * (scripts/generate-manifest.mjs → public/seed/manifest.json) y aquí el navegador
 * hace fetch. Si por alguna razón el fetch falla (dev sin prebuild), se reconstruye un
 * manifest de respaldo a partir del set de fotos conocido, para que la app nunca quede
 * sin pacientes.
 */
@Injectable({ providedIn: 'root' })
export class ManifestLoader {
  async load(): Promise<SeedManifest> {
    try {
      const res = await fetch('seed/manifest.json', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as SeedManifest;
        if (data?.pacientes?.length) return data;
      }
    } catch {
      /* cae al respaldo */
    }
    return FALLBACK_MANIFEST;
  }
}

/**
 * Respaldo: el set entregado (12 hombres + 17 mujeres = 29). El nombre de archivo es la
 * edad, la carpeta el género. Esto sólo se usa si el prebuild no corrió; el manifest real
 * lo genera el script. Soporta sufijos `23-1`/`23-2` en el script (acá el set no los tiene).
 */
const HOMBRES = [1, 2, 4, 5, 28, 30, 33, 35, 40, 43, 76, 80];
const MUJERES = [3, 4, 7, 14, 22, 23, 25, 32, 55, 62, 65, 67, 68, 70, 72, 80, 85];

function entry(genero: Genero, edad: number): ManifestEntry {
  const carpeta = genero === 'hombre' ? 'hombres' : 'mujeres';
  return { path: `/imagenes/pacientes/${carpeta}/${edad}.jpg`, genero, edad };
}

export const FALLBACK_MANIFEST: SeedManifest = {
  pacientes: [
    ...HOMBRES.map((e) => entry('hombre', e)),
    ...MUJERES.map((e) => entry('mujer', e)),
  ],
  documentos: [],
  generadoEn: 'fallback',
};
