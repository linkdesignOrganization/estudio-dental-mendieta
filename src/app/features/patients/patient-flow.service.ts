import { Injectable, signal } from '@angular/core';
import { Genero } from '../../core/models/models';

/**
 * Estado del flujo "Crear paciente" (2 pasos en rutas dedicadas: `nuevo/datos` →
 * `nuevo/clinico`, REQ-173/REQ-029). Como cada paso es su propia ruta y el componente
 * se re-crea al navegar (incl. el botón "Atrás" del navegador), el estado del wizard NO
 * puede vivir en el componente: vive en este servicio singleton, que preserva los datos
 * ya ingresados al ir "Atrás" (REQ-177) y permite hidratar la pantalla de edición. Se
 * resetea al iniciar el flujo desde el Paso 1 y tras crear con éxito.
 *
 * Refleja el mismo patrón que AppointmentFlowService (ADR-5).
 */
@Injectable({ providedIn: 'root' })
export class PatientFlowService {
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly dni = signal('');
  readonly nacimiento = signal(''); // ISO yyyy-mm-dd (para input date)
  readonly genero = signal<Genero>('mujer');
  readonly telefono = signal('');
  readonly email = signal('');
  readonly direccion = signal('');
  readonly obraSocialId = signal('');
  readonly profesionalId = signal('prof-01');
  readonly alergias = signal('');
  readonly medicacion = signal('');
  readonly observaciones = signal('');
  /** Foto opcional: data URL, o '' → fallback a iniciales (REQ-179). */
  readonly foto = signal('');

  /** Vacía el wizard para empezar una alta nueva. `obraSocialDefault` queda preseleccionada. */
  reset(obraSocialDefault = ''): void {
    this.nombre.set('');
    this.apellido.set('');
    this.dni.set('');
    this.nacimiento.set('');
    this.genero.set('mujer');
    this.telefono.set('');
    this.email.set('');
    this.direccion.set('');
    this.obraSocialId.set(obraSocialDefault);
    this.profesionalId.set('prof-01');
    this.alergias.set('');
    this.medicacion.set('');
    this.observaciones.set('');
    this.foto.set('');
  }

  /** True si el Paso 1 tiene los requeridos mínimos (para guardar el progreso del wizard). */
  tieneDatosPaso1(): boolean {
    return this.nombre().trim().length > 0 && this.apellido().trim().length > 0;
  }
}
