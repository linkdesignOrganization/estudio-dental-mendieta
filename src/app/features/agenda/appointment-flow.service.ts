import { Injectable, signal, computed } from '@angular/core';

/**
 * Estado del flujo "Crear turno" (3 pasos en rutas dedicadas — ADR-5/UX-020). Como cada
 * paso es una ruta propia y el componente se re-crea al navegar, el estado del wizard NO
 * puede vivir en el componente: vive en este servicio singleton, que preserva la selección
 * al ir "Atrás" (UX-015) y permite el pre-relleno desde la ficha (UX-021). Se resetea al
 * iniciar el flujo y tras confirmar.
 */
@Injectable({ providedIn: 'root' })
export class AppointmentFlowService {
  readonly pacienteId = signal<string>('');
  readonly profesionalId = signal<string>('');
  readonly fecha = signal<string>(''); // ISO yyyy-mm-dd
  readonly hora = signal<string>('');
  readonly duracionMin = signal<number>(30);
  readonly tipoTratamientoId = signal<string>('');
  readonly notas = signal<string>('');

  readonly tienePaciente = computed(() => this.pacienteId().length > 0);
  readonly tieneSlot = computed(() => this.fecha().length > 0 && this.hora().length > 0);

  reset(): void {
    this.pacienteId.set('');
    this.profesionalId.set('');
    this.fecha.set('');
    this.hora.set('');
    this.duracionMin.set(30);
    this.tipoTratamientoId.set('');
    this.notas.set('');
  }

  setPaciente(id: string): void {
    this.pacienteId.set(id);
  }
}
