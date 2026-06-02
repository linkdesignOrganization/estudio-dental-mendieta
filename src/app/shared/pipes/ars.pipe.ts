import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formato de moneda ARS (pesos argentinos) — DC-061/044, REQ-162.
 * Ej. 480000 → "$ 480.000". Separador de miles con punto (locale es-AR).
 */
@Pipe({ name: 'ars' })
export class ArsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) return '—';
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return `$ ${formatted}`;
  }
}
