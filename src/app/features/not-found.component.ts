import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../shared/components/empty-state.component';
import { IconComponent } from '../shared/components/icon.component';

/**
 * Pantalla "No encontrado" (DC-035). Dentro del shell. Empty state centrado +
 * 1 acción "Volver al inicio".
 */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent, IconComponent],
  template: `
    <app-empty-state
      icon="magnifying-glass"
      title="No encontramos esta página"
      description="La dirección a la que intentaste acceder no existe o se movió. Volvé al inicio para seguir trabajando."
      [hasAction]="true">
      <a class="btn-edm btn-edm--primary" routerLink="/reportes">
        <app-icon name="house" [size]="18" /> Volver al inicio
      </a>
    </app-empty-state>
  `,
})
export class NotFoundComponent {}
