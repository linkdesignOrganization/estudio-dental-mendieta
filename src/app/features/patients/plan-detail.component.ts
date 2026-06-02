import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ArsPipe } from '../../shared/pipes/ars.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StoreService } from '../../core/persistence/store.service';
import { treatmentBadge } from '../../shared/status-map';

/**
 * Detalle de plan de tratamiento (DC-045). Ruta dedicada. Etapas con progreso.
 */
@Component({
  selector: 'app-plan-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, StatusBadgeComponent, ArsPipe, EmptyStateComponent],
  template: `
    <a class="back-link t-small" [routerLink]="['/pacientes', id(), 'tratamientos']">
      <app-icon name="arrow-left" [size]="16" /> Volver a tratamientos
    </a>

    @if (plan(); as p) {
      <div class="plan">
        <section class="surface-card is-lg plan__main">
          <header class="plan__head">
            <div>
              <h2 class="t-display">{{ p.nombre }}</h2>
              <p class="t-body t-secondary">{{ p.profesional }}</p>
            </div>
            <app-status-badge [label]="badge().label" [tone]="badge().tone" />
          </header>

          <div class="plan__progress">
            <span class="plan__pct t-display">{{ p.progreso }}%</span>
            <div class="plan__bar" role="progressbar" [attr.aria-valuenow]="p.progreso" aria-valuemin="0" aria-valuemax="100">
              <span class="plan__fill" [style.width.%]="p.progreso"></span>
            </div>
            <span class="t-small t-secondary">{{ p.etapasCompletadas }} de {{ p.etapasTotales }} etapas completadas</span>
          </div>

          <ol class="plan__stages">
            @for (i of stages(); track i) {
              <li class="plan__stage" [class.is-done]="i < p.etapasCompletadas">
                <span class="plan__stage-bubble">
                  @if (i < p.etapasCompletadas) { <app-icon name="check" [size]="14" /> } @else { {{ i + 1 }} }
                </span>
                <span class="t-body">Etapa {{ i + 1 }}{{ i < p.etapasCompletadas ? ' — completada' : '' }}</span>
              </li>
            }
          </ol>
        </section>

        <aside class="surface-card plan__side">
          <div class="icon-chip">
            <span class="icon-chip__glyph"><app-icon name="currency-circle-dollar" [size]="16" /></span>
            <div class="icon-chip__body"><span class="icon-chip__label">Costo total</span><span class="icon-chip__value">{{ p.costo | ars }}</span></div>
          </div>
          @if (p.proximaFecha) {
            <div class="icon-chip">
              <span class="icon-chip__glyph"><app-icon name="calendar-blank" [size]="16" /></span>
              <div class="icon-chip__body"><span class="icon-chip__label">Próxima sesión</span><span class="icon-chip__value">{{ p.proximaFecha }}</span></div>
            </div>
          }
        </aside>
      </div>
    } @else {
      <app-empty-state icon="tooth" title="No encontramos este tratamiento"
        description="El plan que buscás no existe." [hasAction]="true">
        <a class="btn-edm btn-edm--primary" [routerLink]="['/pacientes', id(), 'tratamientos']">Volver a tratamientos</a>
      </app-empty-state>
    }
  `,
  styles: [`
    :host { display: block; }
    .back-link { display: inline-flex; align-items: center; gap: var(--space-1); color: var(--color-accent-deep); margin-bottom: var(--space-5); }
    .back-link:hover { text-decoration: underline; }
    .plan { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-5); align-items: start; }
    .plan__main { display: flex; flex-direction: column; gap: var(--space-6); }
    .plan__head { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); }
    .plan__head h2 { color: var(--color-text); }
    .plan__progress { display: flex; flex-direction: column; gap: var(--space-2); }
    .plan__pct { color: var(--color-accent); }
    .plan__bar { height: 8px; border-radius: var(--radius-pill); background: var(--color-accent-sky); overflow: hidden; }
    .plan__fill { display: block; height: 100%; background: var(--color-accent); border-radius: var(--radius-pill); }
    .plan__stages { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--space-3); }
    .plan__stage { display: flex; align-items: center; gap: var(--space-3); }
    .plan__stage-bubble { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; flex: 0 0 auto; border-radius: 50%; border: 1px solid var(--color-border); color: var(--color-text-secondary); font-size: var(--text-small); }
    .plan__stage.is-done .plan__stage-bubble { background: var(--color-accent-deep); border-color: var(--color-accent-deep); color: #fff; }
    .plan__side { display: flex; flex-direction: column; gap: var(--space-4); }
    @media (max-width: 991px) { .plan { grid-template-columns: 1fr; } }
  `],
})
export class PlanDetailComponent {
  readonly id = input<string>('');
  readonly planId = input<string>('');
  private readonly store = inject(StoreService);
  protected readonly plan = computed(() => this.store.planById(this.planId()));
  protected readonly badge = computed(() => {
    const p = this.plan();
    return p ? treatmentBadge(p.estado) : { label: '', tone: 'neutral' as const };
  });
  protected readonly stages = computed(() => Array.from({ length: this.plan()?.etapasTotales ?? 0 }, (_, i) => i));
}
