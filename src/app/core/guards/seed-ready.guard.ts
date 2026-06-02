import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { StoreService } from '../persistence/store.service';

/**
 * SeedReadyGuard (architecture.md). Asegura que el store esté hidratado antes de
 * renderizar cualquier ruta interna. Cubre el deep-linking (UX-016): entrar directo a
 * `/pacientes/pac-007/pagos` hidrata primero desde localStorage (o seed) y luego renderiza.
 * El APP_INITIALIZER ya dispara la hidratación al boot; este guard es la red de seguridad
 * que espera a que termine si por algún motivo aún no lo hizo.
 */
export const seedReadyGuard: CanActivateFn = async () => {
  const store = inject(StoreService);
  if (!store.ready()) {
    await store.hydrate();
  }
  return true;
};
