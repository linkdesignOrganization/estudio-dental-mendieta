/**
 * Helpers de formato de fecha (es-AR) compartidos. Funciones puras, sin dependencias
 * de Angular, para evitar duplicar los arrays de días/meses y el parseo ISO en cada
 * componente de Agenda y en el store. Todas las fechas del proyecto son ISO "yyyy-mm-dd".
 */

const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGO = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Parsea una fecha ISO "yyyy-mm-dd" como fecha local (sin desfase de zona horaria). */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** ISO → "Mié 4 jun" (día corto + número + mes corto). */
export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${DIAS_CORTO[date.getDay()]} ${date.getDate()} ${MESES_CORTO[date.getMonth()]}`;
}

/** ISO → "Miércoles 4 de junio de 2026" (día largo capitalizado + mes largo + año). */
export function formatLongDate(iso: string): string {
  const date = parseIsoDate(iso);
  const dia = DIAS_LARGO[date.getDay()];
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${date.getDate()} de ${MESES_LARGO[date.getMonth()]} de ${date.getFullYear()}`;
}

/** ISO → "04/06/2026" (dd/mm/yyyy). */
export function formatDmyDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}
