import { Injectable, signal, computed } from '@angular/core';

/**
 * Estado del flujo "Crear presupuesto" (3 pasos en rutas dedicadas — UX-029). Vive en un
 * servicio singleton (no en el componente) para preservar la selección al ir Atrás entre
 * pasos. Paso 1 paciente → Paso 2 tratamientos (costo total calculado) → Paso 3 revisión.
 */
@Injectable({ providedIn: 'root' })
export class BudgetFlowService {
  readonly pacienteId = signal<string>('');
  /** ids de TreatmentType seleccionados. */
  readonly tipoIds = signal<string[]>([]);

  readonly tienePaciente = computed(() => this.pacienteId().length > 0);
  readonly tieneItems = computed(() => this.tipoIds().length > 0);

  toggleTipo(id: string): void {
    this.tipoIds.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  reset(): void {
    this.pacienteId.set('');
    this.tipoIds.set([]);
  }
}
