import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';
import { ArsPipe } from '../pipes/ars.pipe';
import { TreatmentType } from '../../core/models/models';

/**
 * treatment-type-card (DC-062). Ícono Phosphor + nombre peso 500 + descripción corta
 * gris (lh 1.5-1.7) + costo ref ARS + duración estimada. Aire generoso, NO tabla densa.
 */
@Component({
  selector: 'app-treatment-type-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ArsPipe],
  template: `
    <a class="surface-card is-clickable ttcard" [routerLink]="['/tratamientos/tipos', type().id]">
      <span class="ttcard__glyph"><app-icon [name]="type().icono" [size]="24" /></span>
      <h3 class="ttcard__name t-body-medium">{{ type().nombre }}</h3>
      <p class="ttcard__desc t-body t-secondary">{{ type().descripcion }}</p>
      <div class="ttcard__foot">
        <span class="ttcard__cost t-body-medium">{{ type().costoRef | ars }}</span>
        <span class="ttcard__dur t-small t-secondary"><app-icon name="clock" [size]="16" /> {{ type().duracionEst }}</span>
      </div>
    </a>
  `,
  styles: [`
    :host { display: block; }
    .ttcard { display: flex; flex-direction: column; gap: var(--space-3); color: var(--color-text); height: 100%; }
    .ttcard__glyph { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: var(--radius-md); background: var(--color-accent-tint); color: var(--color-accent-deep); }
    .ttcard__name { margin: 0; }
    .ttcard__desc { margin: 0; line-height: var(--lh-body); flex: 1; }
    .ttcard__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); padding-top: var(--space-2); border-top: 1px solid var(--color-border); }
    .ttcard__cost { color: var(--color-accent-deep); }
    .ttcard__dur { display: inline-flex; align-items: center; gap: var(--space-1); }
  `],
})
export class TreatmentTypeCardComponent {
  readonly type = input.required<TreatmentType>();
}
