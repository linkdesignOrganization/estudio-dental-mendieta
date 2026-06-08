import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from './icon.component';
import { StatusBadgeComponent } from './status-badge.component';
import { AvatarStackComponent } from './avatar-stack.component';
import { TreatmentPlan } from '../../core/models/models';
import { treatmentBadge } from '../status-map';
import { ArsPipe } from '../pipes/ars.pipe';

/**
 * treatment-card / progress-card (DC-059, Patrón 3).
 * % grande tamaño display peso 500 color azul medio + label "Progreso" + barra
 * (relleno #6da8d4, track #c5d8e8) + nombre peso 500 + "X/Y etapas" + status-badge
 * + avatar-stack + menú ⋯. Barra role="progressbar" con aria.
 */
@Component({
  selector: 'app-progress-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, StatusBadgeComponent, AvatarStackComponent, ArsPipe],
  template: `
    <article class="surface-card is-clickable pcard">
      <div class="pcard__top">
        <div class="pcard__pct">
          <span class="pcard__num t-display">{{ plan().progreso }}<span class="pcard__sign">%</span></span>
          <span class="pcard__plabel t-small t-secondary">Progreso</span>
        </div>
        <button type="button" class="icon-btn" aria-label="Más acciones del tratamiento" (click)="$event.stopPropagation()">
          <app-icon name="dots-three" [size]="20" />
        </button>
      </div>

      <div class="pcard__bar" role="progressbar" [attr.aria-valuenow]="plan().progreso" aria-valuemin="0" aria-valuemax="100"
           [attr.aria-label]="'Progreso del tratamiento ' + plan().nombre">
        <span class="pcard__fill" [style.width.%]="plan().progreso"></span>
      </div>

      <a class="pcard__name t-body-medium" [routerLink]="['/tratamientos/activos', plan().id]">{{ plan().nombre }}</a>
      <p class="pcard__meta t-small t-secondary">{{ plan().profesional }} · {{ plan().etapasCompletadas }}/{{ plan().etapasTotales }} etapas</p>

      <div class="pcard__foot">
        <app-status-badge [label]="badge().label" [tone]="badge().tone" />
        <div class="pcard__foot-right">
          @if (plan().costo) { <span class="t-small t-secondary">{{ plan().costo | ars }}</span> }
          <app-avatar-stack [items]="plan().profesionalesFotos" [names]="[plan().profesional]" [max]="3" />
        </div>
      </div>
    </article>
  `,
  styles: [`
    :host { display: block; }
    .pcard { display: flex; flex-direction: column; gap: var(--space-3); }
    .pcard__top { display: flex; align-items: flex-start; justify-content: space-between; }
    .pcard__pct { display: flex; flex-direction: column; }
    .pcard__num { color: var(--color-accent); line-height: 1; }
    .pcard__sign { font-size: var(--text-title); }
    .pcard__plabel { margin-top: var(--space-1); }
    .pcard__bar { height: 8px; border-radius: var(--radius-pill); background: var(--color-accent-sky); overflow: hidden; }
    .pcard__fill { display: block; height: 100%; border-radius: var(--radius-pill); background: var(--color-accent); transition: width var(--motion-slow) var(--motion-ease); }
    .pcard__name { color: var(--color-text); }
    .pcard__name:hover { color: var(--color-accent-deep); }
    .pcard__meta { margin: 0; }
    .pcard__foot { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); margin-top: var(--space-1); }
    .pcard__foot-right { display: flex; align-items: center; gap: var(--space-3); }
  `],
})
export class ProgressCardComponent {
  readonly plan = input.required<TreatmentPlan>();
  protected readonly badge = computed(() => treatmentBadge(this.plan().estado));
}
