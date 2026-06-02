import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { StoreService } from '../../../core/persistence/store.service';
import { currentPatientId } from '../patient-context';

/**
 * Ficha — Tab 3 Historial (DEMO-011 / DC-042 / DC-108). Timeline cronológico (más
 * reciente primero), bloques de evento clickeables (event-block variante timeline:
 * leading circular + título peso 500 + fecha a la derecha + descripción).
 */
@Component({
  selector: 'app-tab-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, EmptyStateComponent],
  template: `
    <section class="surface-card is-lg">
      <header class="hist__head"><h3 class="t-title">Historial clínico</h3></header>
      @if (events().length) {
        <ol class="timeline">
          @for (e of events(); track e.id) {
            <li class="timeline__item">
              <span class="timeline__lead"><app-icon [name]="e.icono" [size]="18" /></span>
              <a class="timeline__block" [routerLink]="['/pacientes', id, 'evento', e.id]">
                <div class="timeline__row">
                  <span class="timeline__title t-body-medium">{{ e.titulo }}</span>
                  <span class="timeline__time t-small t-secondary">{{ e.fechaRelativa }}</span>
                </div>
                <span class="timeline__meta t-small t-secondary">{{ e.tipo }} · {{ e.profesional }}</span>
                <p class="timeline__desc t-body t-secondary">{{ e.descripcion }}</p>
              </a>
            </li>
          }
        </ol>
      } @else {
        <app-empty-state icon="clock-counter-clockwise" title="Sin eventos clínicos"
          description="Este paciente todavía no tiene eventos clínicos registrados." />
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .hist__head { margin-bottom: var(--space-5); }
    .hist__head h3 { color: var(--color-text); }
    .timeline { list-style: none; margin: 0; padding: 0; position: relative; }
    .timeline::before { content: ''; position: absolute; left: 19px; top: 8px; bottom: 8px; width: 1px; background: var(--color-border); }
    .timeline__item { display: flex; gap: var(--space-4); padding-bottom: var(--space-5); position: relative; }
    .timeline__item:last-child { padding-bottom: 0; }
    .timeline__lead {
      position: relative; z-index: 1; flex: 0 0 auto;
      display: inline-flex; align-items: center; justify-content: center;
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--color-accent-tint); color: var(--color-accent-deep);
      box-shadow: 0 0 0 4px var(--color-bg-elevated);
    }
    .timeline__block {
      flex: 1; display: flex; flex-direction: column; gap: var(--space-1);
      padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); color: var(--color-text);
      transition: background-color var(--motion-fast) var(--motion-ease);
    }
    .timeline__block:hover { background: var(--color-accent-tint); }
    .timeline__block:focus-visible { box-shadow: var(--focus-ring); outline: none; }
    .timeline__row { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }
    .timeline__title { color: var(--color-text); }
    .timeline__desc { margin: var(--space-1) 0 0; line-height: var(--lh-body); }
    @media (max-width: 767px) {
      .timeline__row { flex-direction: column; gap: 2px; }
    }
  `],
})
export class TabHistoryComponent {
  private readonly store = inject(StoreService);
  protected readonly id = currentPatientId();
  protected readonly events = computed(() => this.store.eventsOf(this.id));
}
