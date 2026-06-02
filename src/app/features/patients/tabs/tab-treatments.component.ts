import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { ProgressCardComponent } from '../../../shared/components/progress-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { StoreService } from '../../../core/persistence/store.service';
import { currentPatientId } from '../patient-context';

/**
 * Ficha — Tab 4 Tratamientos (DEMO-011 / DC-044 / DC-109). Grupos Activos/Completados,
 * cada plan = progress-card con % grande (peso 500, azul) + barra. Grupo vacío se omite
 * sin romper layout. Vacío total → mensaje persona-céntrico.
 */
@Component({
  selector: 'app-tab-treatments',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressCardComponent, EmptyStateComponent],
  template: `
    @if (active().length || completed().length) {
      @if (active().length) {
        <section class="group">
          <h3 class="group__title t-title">Activos</h3>
          <div class="group__grid">
            @for (t of active(); track t.id) { <app-progress-card [plan]="t" /> }
          </div>
        </section>
      }
      @if (completed().length) {
        <section class="group">
          <h3 class="group__title t-title">Completados</h3>
          <div class="group__grid">
            @for (t of completed(); track t.id) { <app-progress-card [plan]="t" /> }
          </div>
        </section>
      }
    } @else {
      <div class="surface-card is-lg">
        <app-empty-state icon="tooth" title="Sin tratamientos todavía"
          description="Este paciente todavía no tiene tratamientos registrados." />
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .group { margin-bottom: var(--section-gap); }
    .group:last-child { margin-bottom: 0; }
    .group__title { margin-bottom: var(--space-4); }
    .group__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); }
    @media (max-width: 767px) { .group__grid { grid-template-columns: 1fr; } }
  `],
})
export class TabTreatmentsComponent {
  private readonly store = inject(StoreService);
  private readonly id = currentPatientId();
  private readonly mine = computed(() => this.store.plansOf(this.id));
  protected readonly active = computed(() => this.mine().filter((t) => t.estado !== 'completado'));
  protected readonly completed = computed(() => this.mine().filter((t) => t.estado === 'completado'));
}
