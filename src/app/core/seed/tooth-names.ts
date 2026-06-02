/**
 * Nomenclatura odontológica por número FDI (REQ-186: "número Y nombre de la pieza").
 * Función pura, sin estado ni PRNG: el nombre de una pieza es FIJO (deriva sólo del
 * número FDI), no aleatorio. Sistema FDI (ISO 3950): el primer dígito es el cuadrante
 * (1 sup-der, 2 sup-izq, 3 inf-izq, 4 inf-der) y el segundo la posición 1..8 desde la
 * línea media hacia atrás (1 incisivo central … 8 tercer molar / muela del juicio).
 */

const POSICION_NOMBRE: Record<number, string> = {
  1: 'Incisivo central',
  2: 'Incisivo lateral',
  3: 'Canino',
  4: 'Primer premolar',
  5: 'Segundo premolar',
  6: 'Primer molar',
  7: 'Segundo molar',
  8: 'Tercer molar',
};

const CUADRANTE_UBICACION: Record<number, string> = {
  1: 'superior derecho',
  2: 'superior izquierdo',
  3: 'inferior izquierdo',
  4: 'inferior derecho',
};

/** FDI → "Primer molar superior derecho" (nombre clínico completo). */
export function toothName(fdi: number): string {
  const cuadrante = Math.floor(fdi / 10);
  const posicion = fdi % 10;
  const nombre = POSICION_NOMBRE[posicion];
  const ubicacion = CUADRANTE_UBICACION[cuadrante];
  if (!nombre || !ubicacion) return `Pieza ${fdi}`;
  return `${nombre} ${ubicacion}`;
}
