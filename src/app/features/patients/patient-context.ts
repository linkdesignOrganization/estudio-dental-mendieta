import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../../core/persistence/store.service';
import { Patient } from '../../core/models/models';

/**
 * Resuelve el id de paciente desde la ruta padre (la ficha) o la propia.
 * Usado por los tab-components, que viven en el router-outlet hijo de la ficha.
 */
export function currentPatientId(): string {
  const route = inject(ActivatedRoute);
  return route.parent?.snapshot.paramMap.get('id') ?? route.snapshot.paramMap.get('id') ?? '';
}

/** Paciente actual desde el store (datos del seed + cambios persistidos). */
export function currentPatient(): Patient | undefined {
  const store = inject(StoreService);
  const id = currentPatientId();
  return store.patientById(id);
}
